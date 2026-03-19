import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth-store';
import { useDailyStore } from '../store/daily-store';
import { usePhysiologyStore } from '../store/physiology-store';
import { IACIResult, SubsystemKey, SubsystemScores } from '../lib/types/iaci';
import { computeIACI } from '../lib/engine/iaci-composite';
import { computeAllBaselines } from '../lib/engine/baseline-tracker';
import { scoreAutonomic, AutonomicInputs } from '../lib/engine/subsystems/autonomic';
import { scoreMusculoskeletal, MusculoskeletalInputs } from '../lib/engine/subsystems/musculoskeletal';
import { scoreCardiometabolic, CardiometabolicInputs } from '../lib/engine/subsystems/cardiometabolic';
import { scoreSleepCircadian, SleepCircadianInputs } from '../lib/engine/subsystems/sleep-circadian';
import { scoreMetabolic, MetabolicInputs } from '../lib/engine/subsystems/metabolic';
import { scorePsychoEmotional, PsychoEmotionalInputs } from '../lib/engine/subsystems/psycho-emotional';
import { getWeightsForSportProfile, applySportAdjustments } from '../lib/engine/sport-stress';
import { getAthleteModeConfig } from '../lib/engine/athlete-mode';
import { today, daysAgo } from '../lib/utils/date';
import { DailyPhysiologyRow, SubjectiveEntryRow } from '../lib/types/database';
import { useSettingsStore } from '../store/settings-store';

export function useIACI() {
  const { user, profile } = useAuthStore();
  const { iaci, setIACI, setLoading } = useDailyStore();
  const [error, setError] = useState<string | null>(null);

  const computeToday = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);

    try {
      const dateStr = today();

      // Fetch today's physiology + 21 days of history for baselines
      const [physiologyRes, historyRes, subjectiveRes, workoutRes] = await Promise.all([
        supabase
          .from('daily_physiology')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', dateStr)
          .single(),
        supabase
          .from('daily_physiology')
          .select('date, hrv_rmssd, resting_heart_rate, respiratory_rate, sleep_duration_ms, day_strain')
          .eq('user_id', user.id)
          .gte('date', daysAgo(28))
          .order('date', { ascending: true }),
        supabase
          .from('subjective_entries')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', dateStr)
          .eq('entry_type', 'morning')
          .single(),
        supabase
          .from('workouts')
          .select('strain_score, date, workout_type, hr_zones')
          .eq('user_id', user.id)
          .gte('date', daysAgo(7))
          .order('date', { ascending: false }),
      ]);

      const phys = physiologyRes.data as DailyPhysiologyRow | null;
      const history = (historyRes.data ?? []) as any[];
      const subj = subjectiveRes.data as SubjectiveEntryRow | null;
      const recentWorkouts = (workoutRes.data ?? []) as any[];

      // Compute baselines
      const baselines = computeAllBaselines(history.map(h => ({
        date: h.date,
        hrvRmssd: h.hrv_rmssd,
        restingHeartRate: h.resting_heart_rate,
        respiratoryRate: h.respiratory_rate,
        sleepDurationMs: h.sleep_duration_ms,
        dayStrain: h.day_strain,
      })));

      // Compute 3-day avg strain
      const recentStrains = recentWorkouts
        .filter(w => w.strain_score != null)
        .slice(0, 3)
        .map(w => w.strain_score);
      const threeDayAvgStrain = recentStrains.length > 0
        ? recentStrains.reduce((a: number, b: number) => a + b, 0) / recentStrains.length
        : null;

      // Score all 6 subsystems
      const autonomic = scoreAutonomic(
        {
          hrvRmssd: phys?.hrv_rmssd ?? null,
          restingHeartRate: phys?.resting_heart_rate ?? null,
          priorDayStrain: recentWorkouts[0]?.strain_score ?? null,
          threeDayAvgStrain,
          sleepDurationMs: phys?.sleep_duration_ms ?? null,
          sleepPerformancePct: phys?.sleep_performance_pct ?? null,
          sleepConsistencyPct: phys?.sleep_consistency_pct ?? null,
          subjectiveStress: subj?.subjective_stress ?? null,
          perceivedFatigue: subj?.perceived_fatigue ?? null,
        },
        {
          hrv: baselines.hrv,
          rhr: baselines.rhr,
          strain: baselines.strain,
          sleepDuration: baselines.sleepDuration,
        },
      );

      const musculoskeletal = scoreMusculoskeletal({
        soreness: subj?.soreness ?? null,
        stiffness: subj?.stiffness ?? null,
        heavyLegs: subj?.heavy_legs ?? null,
        cramping: (subj as any)?.cramping ?? null,
        crampingLocation: (subj as any)?.cramping_location ?? null,
        painLocations: subj?.pain_locations ?? null,
        priorWorkoutType: recentWorkouts[0]?.workout_type ?? null,
        priorDayStrain: recentWorkouts[0]?.strain_score ?? null,
        threeDayAvgStrain,
        daysFromLastStrengthSession: null, // TODO: compute from workout history
        daysFromLastHighIntensity: null,
      });

      const cardiometabolic = scoreCardiometabolic(
        {
          respiratoryRate: phys?.respiratory_rate ?? null,
          recentCardioStrainTotal: null, // TODO: sum from recent cardio workouts
          timeInZone4_5_72h_ms: null,
          subjectiveBreathlessness: subj?.subjective_breathlessness ?? null,
          perceivedExertionMismatch: subj?.perceived_exertion_mismatch ?? null,
          daysFromLastIntervalSession: null,
          daysFromLastThresholdSession: null,
          aerobicDensity72h: null,
          anaerobicDensity72h: null,
          restingHeartRate: phys?.resting_heart_rate ?? null,
          hrvRmssd: phys?.hrv_rmssd ?? null,
        },
        {
          respiratoryRate: baselines.respiratoryRate,
          rhr: baselines.rhr,
        },
      );

      const sleep = scoreSleepCircadian({
        sleepDurationMs: phys?.sleep_duration_ms ?? null,
        sleepPerformancePct: phys?.sleep_performance_pct ?? null,
        sleepConsistencyPct: phys?.sleep_consistency_pct ?? null,
        remSleepMs: phys?.rem_sleep_ms ?? null,
        deepSleepMs: phys?.deep_sleep_ms ?? null,
        awakenings: phys?.awakenings ?? null,
        sleepLatencyMs: phys?.sleep_latency_ms ?? null,
        subjectiveSleepQuality: subj?.subjective_sleep_quality ?? null,
        lateCaffeine: subj?.late_caffeine ?? null,
        lateAlcohol: subj?.late_alcohol ?? null,
        lateHeavyMeal: subj?.late_heavy_meal ?? null,
        isTraveling: subj?.is_traveling ?? null,
        timezoneChange: subj?.timezone_change ?? null,
      });

      const metabolic = scoreMetabolic({
        hydrationGlasses: subj?.hydration_glasses ?? null,
        electrolytesTaken: subj?.electrolytes_taken ?? null,
        proteinAdequate: subj?.protein_adequate ?? null,
        fasting: subj?.fasting ?? null,
        giDisruption: subj?.gi_disruption ?? null,
        lateHeavyMeal: subj?.late_heavy_meal ?? null,
        bodyMassChangeKg: null,
        postWorkoutFuelingAdequate: null,
      });

      const psychological = scorePsychoEmotional({
        motivation: subj?.motivation ?? null,
        mood: subj?.mood ?? null,
        mentalFatigue: subj?.mental_fatigue ?? null,
        willingnessToTrain: subj?.willingness_to_train ?? null,
        concentration: subj?.concentration ?? null,
        subjectiveStress: subj?.subjective_stress ?? null,
        overallEnergy: subj?.overall_energy ?? null,
      });

      const subsystemScores: SubsystemScores = {
        autonomic,
        musculoskeletal,
        cardiometabolic,
        sleep,
        metabolic,
        psychological,
      };

      // Get weights from sport profile
      const sportKeys = profile?.sport;
      const weights = getWeightsForSportProfile(
        sportKeys,
        profile?.weight_preferences as any,
      );

      // Apply sport-specific subsystem adjustments
      const adjustedScores = applySportAdjustments(subsystemScores, sportKeys);

      // Compute data completeness
      const totalFields = 20;
      let presentFields = 0;
      if (phys?.hrv_rmssd) presentFields++;
      if (phys?.resting_heart_rate) presentFields++;
      if (phys?.sleep_duration_ms) presentFields++;
      if (phys?.sleep_performance_pct) presentFields++;
      if (phys?.respiratory_rate) presentFields++;
      if (subj?.subjective_stress) presentFields++;
      if (subj?.perceived_fatigue) presentFields++;
      if (subj?.soreness) presentFields++;
      if (subj?.motivation) presentFields++;
      if (subj?.hydration_glasses) presentFields++;
      const dataCompleteness = presentFields / totalFields;

      // Compute IACI with sport-adjusted scores
      const result = computeIACI(dateStr, adjustedScores, weights, dataCompleteness, sportKeys);
      setIACI(result);

      // Store result in database
      await supabase
        .from('daily_physiology')
        .update({
          iaci_score: result.score,
          readiness_tier: result.readinessTier,
          subsystem_scores: {
            autonomic: autonomic.score,
            musculoskeletal: musculoskeletal.score,
            cardiometabolic: cardiometabolic.score,
            sleep: sleep.score,
            metabolic: metabolic.score,
            psychological: psychological.score,
          },
          phenotype: result.phenotype.key,
          phenotype_detail: result.phenotype.description,
          penalties_applied: result.penalties,
          data_completeness: dataCompleteness,
        })
        .eq('user_id', user.id)
        .eq('date', dateStr);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compute IACI');
      setLoading(false);
    }
  }, [user?.id, profile]);

  /**
   * Demo mode: compute IACI from check-in inputs + imported Whoop physiology data.
   * No Supabase required — uses check-in data from daily store and imported
   * physiology records from physiology store.
   */
  const computeDemo = useCallback(() => {
    setLoading(true);
    setError(null);

    try {
      const dateStr = today();
      const checkinData = useDailyStore.getState().checkinData;

      // Pull imported Whoop data if available
      const physStore = usePhysiologyStore.getState();
      const phys = physStore.getRecord(dateStr) ?? physStore.getLatest();

      // Build baselines from imported history (last 28 days)
      let baselines = { hrv: null as any, rhr: null as any, strain: null as any, sleepDuration: null as any, respiratoryRate: null as any };
      if (physStore.hasData) {
        const allDates = Object.keys(physStore.records).sort();
        const historyRecords = allDates
          .slice(-28)
          .map((d) => physStore.records[d])
          .filter(Boolean);

        if (historyRecords.length >= 3) {
          baselines = computeAllBaselines(
            historyRecords.map((r) => ({
              date: r.date,
              hrvRmssd: r.cardiovascular.hrvRmssd,
              restingHeartRate: r.cardiovascular.restingHeartRate,
              respiratoryRate: r.cardiovascular.respiratoryRate,
              sleepDurationMs: r.sleep.totalSleepMs,
              dayStrain: r.workouts.reduce((sum, w) => sum + (w.strainScore ?? 0), 0) || null,
            })),
          );
        }
      }

      // Recent workout strain from imported data
      let priorDayStrain: number | null = null;
      let threeDayAvgStrain: number | null = null;
      if (physStore.hasData) {
        const allDates = Object.keys(physStore.records).sort().reverse();
        const recentStrains: number[] = [];
        for (const d of allDates.slice(0, 3)) {
          const rec = physStore.records[d];
          const dayStrain = rec.workouts.reduce((s, w) => s + (w.strainScore ?? 0), 0);
          if (dayStrain > 0) recentStrains.push(dayStrain);
        }
        if (recentStrains.length > 0) priorDayStrain = recentStrains[0];
        if (recentStrains.length > 0) {
          threeDayAvgStrain = recentStrains.reduce((a, b) => a + b, 0) / recentStrains.length;
        }
      }

      // Score all 6 subsystems using check-in data + imported Whoop data
      const autonomic = scoreAutonomic(
        {
          hrvRmssd: phys?.cardiovascular.hrvRmssd ?? null,
          restingHeartRate: phys?.cardiovascular.restingHeartRate ?? null,
          priorDayStrain,
          threeDayAvgStrain,
          sleepDurationMs: phys?.sleep.totalSleepMs ?? null,
          sleepPerformancePct: phys?.sleep.sleepPerformancePct ?? null,
          sleepConsistencyPct: phys?.sleep.sleepConsistencyPct ?? null,
          subjectiveStress: checkinData?.stress ?? null,
          perceivedFatigue: checkinData?.mentalFatigue ?? null,
        },
        baselines,
      );

      const musculoskeletal = scoreMusculoskeletal({
        soreness: checkinData?.soreness ?? null,
        stiffness: checkinData?.stiffness ?? null,
        heavyLegs: checkinData?.heavyLegs ?? null,
        cramping: checkinData?.cramping ?? null,
        crampingLocation: checkinData?.crampingLocation ?? null,
        painLocations: null,
        priorWorkoutType: phys?.workouts[0]?.workoutType ?? null,
        priorDayStrain,
        threeDayAvgStrain,
        daysFromLastStrengthSession: null,
        daysFromLastHighIntensity: null,
      });

      const cardiometabolic = scoreCardiometabolic(
        {
          respiratoryRate: phys?.cardiovascular.respiratoryRate ?? null,
          recentCardioStrainTotal: null,
          timeInZone4_5_72h_ms: null,
          subjectiveBreathlessness: null,
          perceivedExertionMismatch: null,
          daysFromLastIntervalSession: null,
          daysFromLastThresholdSession: null,
          aerobicDensity72h: null,
          anaerobicDensity72h: null,
          restingHeartRate: phys?.cardiovascular.restingHeartRate ?? null,
          hrvRmssd: phys?.cardiovascular.hrvRmssd ?? null,
        },
        {
          respiratoryRate: baselines.respiratoryRate,
          rhr: baselines.rhr,
        },
      );

      const sleep = scoreSleepCircadian({
        sleepDurationMs: phys?.sleep.totalSleepMs ?? null,
        sleepPerformancePct: phys?.sleep.sleepPerformancePct ?? null,
        sleepConsistencyPct: phys?.sleep.sleepConsistencyPct ?? null,
        remSleepMs: phys?.sleep.remSleepMs ?? null,
        deepSleepMs: phys?.sleep.deepSleepMs ?? null,
        awakenings: phys?.sleep.awakenings ?? null,
        sleepLatencyMs: phys?.sleep.sleepLatencyMs ?? null,
        subjectiveSleepQuality: checkinData?.sleepQuality ?? null,
        lateCaffeine: checkinData?.lateCaffeine ?? null,
        lateAlcohol: checkinData?.lateAlcohol ?? null,
        lateHeavyMeal: null,
        isTraveling: checkinData?.isTraveling ?? null,
        timezoneChange: null,
      });

      const metabolic = scoreMetabolic({
        hydrationGlasses: checkinData ? Math.round(checkinData.hydrationLiters / 0.25) : null,
        electrolytesTaken: checkinData?.electrolytes ?? null,
        proteinAdequate: checkinData?.proteinAdequate ?? null,
        fasting: null,
        giDisruption: checkinData?.giIssues ?? null,
        lateHeavyMeal: null,
        bodyMassChangeKg: null,
        postWorkoutFuelingAdequate: null,
      });

      const psychological = scorePsychoEmotional({
        motivation: checkinData?.motivation ?? null,
        mood: checkinData?.overallEnergy ?? null,
        mentalFatigue: checkinData?.mentalFatigue ?? null,
        willingnessToTrain: checkinData?.motivation ?? null,
        concentration: checkinData ? 6 - checkinData.mentalFatigue : null,
        subjectiveStress: checkinData?.stress ?? null,
        overallEnergy: checkinData?.overallEnergy ?? null,
      });

      // Illness suppresses multiple subsystems even if objective metrics look OK
      if (checkinData?.feelingIll && (checkinData?.illnessSymptoms?.length ?? 0) > 0) {
        const symptomCount = checkinData.illnessSymptoms.length;
        // Scale suppression: 1 symptom = -5pts, 4+ symptoms = -15pts per subsystem
        const suppression = Math.min(5 + symptomCount * 2.5, 20);
        autonomic.score = Math.max(autonomic.score - suppression, 10);
        cardiometabolic.score = Math.max(cardiometabolic.score - suppression, 10);
        psychological.score = Math.max(psychological.score - Math.round(suppression * 0.5), 10);
      }

      const subsystemScores: SubsystemScores = {
        autonomic,
        musculoskeletal,
        cardiometabolic,
        sleep,
        metabolic,
        psychological,
      };

      // Get sport-aware weights
      const sportKeys = profile?.sport;
      const weights = getWeightsForSportProfile(sportKeys, profile?.weight_preferences as any);
      const adjustedScores = applySportAdjustments(subsystemScores, sportKeys);

      // Data completeness reflects both check-in and Whoop data
      const totalFields = 20;
      let presentFields = 0;
      if (phys?.cardiovascular.hrvRmssd) presentFields += 2;
      if (phys?.cardiovascular.restingHeartRate) presentFields++;
      if (phys?.sleep.totalSleepMs) presentFields += 2;
      if (phys?.sleep.sleepPerformancePct) presentFields++;
      if (phys?.cardiovascular.respiratoryRate) presentFields++;
      if (checkinData?.stress) presentFields++;
      if (checkinData?.mentalFatigue) presentFields++;
      if (checkinData?.soreness) presentFields++;
      if (checkinData?.motivation) presentFields++;
      if (checkinData?.hydrationLiters != null) presentFields++;
      const dataCompleteness = Math.min(presentFields / totalFields, 1);

      // Pass illness data from check-in into penalty computation
      const illnessReported = checkinData?.feelingIll ?? false;
      const illnessSymptomCount = checkinData?.illnessSymptoms?.length ?? 0;
      const illnessSeverityScore = checkinData?.illnessSeverityScore ?? 0;

      // Get user's environment for filtering recovery recommendations
      const userEnvironment = useSettingsStore.getState().trainingEnvironment;

      // Merge preferred recovery activities + training modalities for weighting
      const settingsState = useSettingsStore.getState();
      const allPreferred = [
        ...settingsState.preferredRecoveryActivities,
        ...settingsState.preferredTrainingModalities,
      ];

      // Heat illness and cramping from check-in
      const heatIllnessReported = checkinData?.heatIllness ?? false;
      const heatSymptomCount = checkinData?.heatSymptoms?.length ?? 0;
      const HEAT_EMERGENCY_SYMPTOMS = ['Stopped sweating', 'Confusion/disorientation', 'Skin hot & dry', 'Loss of consciousness'];
      const heatHasEmergency = (checkinData?.heatSymptoms ?? []).some(s => HEAT_EMERGENCY_SYMPTOMS.includes(s));
      const crampingReported = checkinData?.cramping ?? false;

      // Get athlete mode config from daily store
      const { athleteMode: mode, trainingSchedule } = useDailyStore.getState();
      const athleteModeConfig = mode === 'competitive'
        ? getAthleteModeConfig('competitive', trainingSchedule)
        : undefined;
      console.log('[IACI] computeDemo: athleteMode=', mode, 'config=', athleteModeConfig ? 'COMPETITIVE' : 'RECREATIONAL');

      const result = computeIACI(
        dateStr, adjustedScores, weights, dataCompleteness, sportKeys,
        athleteModeConfig,
        illnessReported, illnessSymptomCount, illnessSeverityScore,
        userEnvironment.length > 0 ? userEnvironment : undefined,
        allPreferred.length > 0 ? allPreferred : undefined,
        heatIllnessReported, heatSymptomCount, heatHasEmergency,
        crampingReported,
      );
      setIACI(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compute demo IACI');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  return { iaci, error, computeToday, computeDemo };
}
