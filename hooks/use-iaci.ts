import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth-store';
import { useDailyStore } from '../store/daily-store';
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
import { today, daysAgo } from '../lib/utils/date';
import { DailyPhysiologyRow, SubjectiveEntryRow } from '../lib/types/database';

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
   * Demo mode: compute IACI from actual check-in inputs through real subsystem scorers.
   * No Supabase required — uses check-in data stored in daily store.
   */
  const computeDemo = useCallback(() => {
    setLoading(true);
    setError(null);

    try {
      const dateStr = today();
      const checkinData = useDailyStore.getState().checkinData;

      // Score all 6 subsystems using real check-in data (no Whoop/baseline data in demo)
      const autonomic = scoreAutonomic(
        {
          hrvRmssd: null,
          restingHeartRate: null,
          priorDayStrain: null,
          threeDayAvgStrain: null,
          sleepDurationMs: null,
          sleepPerformancePct: null,
          sleepConsistencyPct: null,
          subjectiveStress: checkinData?.stress ?? null,
          perceivedFatigue: checkinData?.mentalFatigue ?? null,
        },
        { hrv: null, rhr: null, strain: null, sleepDuration: null },
      );

      const musculoskeletal = scoreMusculoskeletal({
        soreness: checkinData?.soreness ?? null,
        stiffness: checkinData?.stiffness ?? null,
        heavyLegs: checkinData?.heavyLegs ?? null,
        painLocations: null,
        priorWorkoutType: null,
        priorDayStrain: null,
        threeDayAvgStrain: null,
        daysFromLastStrengthSession: null,
        daysFromLastHighIntensity: null,
      });

      const cardiometabolic = scoreCardiometabolic(
        {
          respiratoryRate: null,
          recentCardioStrainTotal: null,
          timeInZone4_5_72h_ms: null,
          subjectiveBreathlessness: null,
          perceivedExertionMismatch: null,
          daysFromLastIntervalSession: null,
          daysFromLastThresholdSession: null,
          aerobicDensity72h: null,
          anaerobicDensity72h: null,
          restingHeartRate: null,
          hrvRmssd: null,
        },
        { respiratoryRate: null, rhr: null },
      );

      const sleep = scoreSleepCircadian({
        sleepDurationMs: null,
        sleepPerformancePct: null,
        sleepConsistencyPct: null,
        remSleepMs: null,
        deepSleepMs: null,
        awakenings: null,
        sleepLatencyMs: null,
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

      const result = computeIACI(dateStr, adjustedScores, weights, 0.3, sportKeys);
      setIACI(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compute demo IACI');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  return { iaci, error, computeToday, computeDemo };
}
