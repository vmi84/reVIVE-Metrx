/**
 * Feed Hook — paginated data fetching for the infinite-scrolling daily feed.
 *
 * Loads daily_physiology + subjective_entries + workouts, joined by date.
 * Supports carry-forward of yesterday's check-in data.
 */

import { useCallback, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuthStore } from '../store/auth-store';
import { useDailyStore } from '../store/daily-store';
import { usePhysiologyStore } from '../store/physiology-store';
import { useFeedStore } from '../store/feed-store';
import { FeedDay } from '../lib/types/feed';
import { DailyPhysiologyRow, SubjectiveEntryRow, WorkoutRow } from '../lib/types/database';
import { IACIResult } from '../lib/types/iaci';
import { today, daysAgo } from '../lib/utils/date';

const PAGE_SIZE = 14;

// ---------------------------------------------------------------------------
// Build FeedDay from DB rows
// ---------------------------------------------------------------------------

function buildFeedDay(
  date: string,
  phys: DailyPhysiologyRow | null,
  subj: SubjectiveEntryRow | null,
  workouts: WorkoutRow[],
): FeedDay {
  // Reconstruct IACI from stored columns if available
  let iaci: IACIResult | null = null;
  if (phys?.iaci_score != null && phys?.readiness_tier != null) {
    // Minimal reconstruction from stored data (enough for display)
    iaci = {
      date,
      score: phys.iaci_score,
      readinessTier: phys.readiness_tier as IACIResult['readinessTier'],
      subsystemScores: {} as IACIResult['subsystemScores'], // populated from stored JSON
      penalties: (phys.penalties_applied ?? []) as unknown as IACIResult['penalties'],
      phenotype: {
        key: (phys.phenotype ?? 'fully_recovered') as IACIResult['phenotype']['key'],
        label: phys.phenotype ?? 'Unknown',
        description: phys.phenotype_detail ?? '',
        primaryLimiters: [],
      },
      protocol: {
        protocolClass: 'C' as IACIResult['protocol']['protocolClass'],
        readinessTier: phys.readiness_tier as IACIResult['readinessTier'],
        recommendedModalities: [],
        trainingCompatibility: {} as IACIResult['protocol']['trainingCompatibility'],
        recommendedTraining: [],
        explanation: '',
      },
      baseScore: phys.iaci_score,
      dataCompleteness: phys.data_completeness ?? 0,
    };

    // Populate subsystem scores from stored JSON
    if (phys.subsystem_scores) {
      const stored = phys.subsystem_scores as Record<string, number>;
      const keys = ['autonomic', 'musculoskeletal', 'cardiometabolic', 'sleep', 'metabolic', 'psychological'] as const;
      const scores: Record<string, any> = {};
      for (const key of keys) {
        const score = stored[key] ?? 50;
        scores[key] = {
          key,
          score,
          band: score >= 85 ? 'highly_recovered' :
                score >= 70 ? 'trainable' :
                score >= 55 ? 'limited' :
                score >= 40 ? 'compromised' : 'impaired',
          inputs: {},
          limitingFactors: [],
        };
      }
      iaci.subsystemScores = scores as IACIResult['subsystemScores'];
    }
  }

  // Determine metric sources and device identity
  const sources = phys?.sources ?? [];
  // Detect which device source provided data (first non-manual source)
  const deviceSource = sources.find(s => s !== 'manual' && s !== 'inherited' && s !== 'computed')
    ?.replace(/_zip$|_csv$/, '') // normalize 'whoop_zip' → 'whoop'
    ?? null;

  const metricSources: Record<string, string> = {};
  if (phys) {
    const deviceMetrics = ['hrv_rmssd', 'resting_heart_rate', 'sleep_duration_ms',
      'sleep_performance_pct', 'recovery_score', 'respiratory_rate', 'day_strain'];
    for (const m of deviceMetrics) {
      metricSources[m] = deviceSource ?? 'manual';
    }
  }

  return {
    date,
    physiology: phys,
    subjective: subj,
    iaci,
    loadCapacity: null,
    recoveryPlan: null,
    recoveryDayPlan: null,
    deviceSynced: deviceSource != null,
    deviceSource,
    checkinCompleted: subj != null,
    workouts,
    metricSources,
    metricValidations: {},
  };
}

// ---------------------------------------------------------------------------
// Demo/Offline Mock Data
// ---------------------------------------------------------------------------

function canonicalToPhysRow(rec: import('../lib/types/canonical').CanonicalPhysiologyRecord): DailyPhysiologyRow {
  // Prefer cycle-level day strain, fall back to summing individual workout strains
  const workoutStrain = rec.workouts.reduce((s, w) => s + (w.strainScore ?? 0), 0);
  const dayStrain = rec.dayStrain ?? (workoutStrain > 0 ? workoutStrain : null);
  return {
    id: `imported-${rec.date}`,
    user_id: 'demo',
    date: rec.date,
    hrv_rmssd: rec.cardiovascular.hrvRmssd,
    resting_heart_rate: rec.cardiovascular.restingHeartRate,
    respiratory_rate: rec.cardiovascular.respiratoryRate,
    spo2_pct: rec.cardiovascular.spo2Pct,
    skin_temp_deviation: rec.cardiovascular.skinTempDeviation,
    sleep_duration_ms: rec.sleep.totalSleepMs,
    sleep_performance_pct: rec.sleep.sleepPerformancePct,
    sleep_consistency_pct: rec.sleep.sleepConsistencyPct,
    rem_sleep_ms: rec.sleep.remSleepMs,
    deep_sleep_ms: rec.sleep.deepSleepMs,
    light_sleep_ms: rec.sleep.lightSleepMs,
    awake_during_ms: rec.sleep.awakeDuringMs,
    sleep_latency_ms: rec.sleep.sleepLatencyMs,
    sleep_onset_time: rec.sleep.sleepOnsetTime,
    wake_time: rec.sleep.wakeTime,
    awakenings: rec.sleep.awakenings,
    recovery_score: rec.recovery.recoveryScore,
    day_strain: dayStrain,
    iaci_score: null,
    readiness_tier: null,
    subsystem_scores: null,
    phenotype: null,
    phenotype_detail: null,
    penalties_applied: null,
    inflammation_score: null,
    inflammation_flags: null,
    sources: [rec.source ?? 'whoop'],
    data_completeness: 0,
  } as DailyPhysiologyRow;
}

function generateMockFeed(): FeedDay[] {
  const days: FeedDay[] = [];
  const physStore = usePhysiologyStore.getState();

  // Determine how many days to show — at least PAGE_SIZE, but extend
  // to cover all imported data dates
  const importedDates = Object.keys(physStore.records).sort().reverse();
  const oldestImported = importedDates.length > 0
    ? Math.max(PAGE_SIZE, Math.ceil((Date.now() - new Date(importedDates[importedDates.length - 1]).getTime()) / 86400000) + 1)
    : PAGE_SIZE;
  const dayCount = Math.min(oldestImported, 365); // cap at 1 year

  // Debug: log what dates have records
  const allDates = Object.keys(physStore.records).sort().reverse();
  if (allDates.length > 0) {
    console.log('[Feed] Physiology store has', allDates.length, 'records.',
      'Last 7:', allDates.slice(0, 7).join(', '),
      'Today=', daysAgo(0), 'Yesterday=', daysAgo(1));
  }

  for (let i = 0; i < dayCount; i++) {
    const dateStr = daysAgo(i);

    // Use imported device data if available for this date
    const importedRec = physStore.getRecord(dateStr);
    const phys = importedRec ? canonicalToPhysRow(importedRec) : null;
    const importSource = importedRec?.source ?? null;

    // Debug first 3 days
    if (i < 3) {
      console.log(`[Feed] Day ${i} (${dateStr}): record=${!!importedRec}, phys=${!!phys}, source=${importSource}`);
    }

    // Skip days with no data beyond the first PAGE_SIZE days
    if (i >= PAGE_SIZE && !phys) continue;

    const score = Math.round(40 + Math.random() * 50);
    const tier = score >= 85 ? 'perform' :
                 score >= 70 ? 'train' :
                 score >= 55 ? 'maintain' :
                 score >= 35 ? 'recover' : 'protect';

    days.push({
      date: dateStr,
      physiology: phys,
      subjective: null,
      iaci: i === 0 ? (useDailyStore.getState().iaci ?? null) : { // Use real IACI for today
        date: dateStr,
        score,
        readinessTier: tier as IACIResult['readinessTier'],
        subsystemScores: {
          autonomic: { key: 'autonomic', score: Math.round(50 + Math.random() * 40), band: 'trainable', inputs: {}, limitingFactors: [] },
          musculoskeletal: { key: 'musculoskeletal', score: Math.round(50 + Math.random() * 40), band: 'trainable', inputs: {}, limitingFactors: [] },
          cardiometabolic: { key: 'cardiometabolic', score: Math.round(50 + Math.random() * 40), band: 'trainable', inputs: {}, limitingFactors: [] },
          sleep: { key: 'sleep', score: Math.round(50 + Math.random() * 40), band: 'trainable', inputs: {}, limitingFactors: [] },
          metabolic: { key: 'metabolic', score: Math.round(50 + Math.random() * 40), band: 'trainable', inputs: {}, limitingFactors: [] },
          psychological: { key: 'psychological', score: Math.round(50 + Math.random() * 40), band: 'trainable', inputs: {}, limitingFactors: [] },
        },
        penalties: [],
        phenotype: { key: 'fully_recovered', label: 'Fully Recovered', description: 'All systems recovered', primaryLimiters: [] },
        protocol: {
          protocolClass: 'B',
          readinessTier: tier as IACIResult['readinessTier'],
          recommendedModalities: [],
          trainingCompatibility: {} as IACIResult['protocol']['trainingCompatibility'],
          recommendedTraining: [],
          explanation: 'Demo mode',
        },
        baseScore: score,
        dataCompleteness: 0.6,
      },
      loadCapacity: null,
      recoveryPlan: null,
      recoveryDayPlan: null,
      deviceSynced: phys != null,
      deviceSource: importSource,
      checkinCompleted: i === 0 ? useDailyStore.getState().checkinCompleted : (i > 0),
      workouts: importedRec?.workouts?.map(w => ({
        id: w.workoutId,
        user_id: 'demo',
        date: dateStr,
        workout_type: w.workoutType,
        start_time: w.startTime,
        end_time: w.endTime,
        duration_ms: w.durationMs,
        avg_heart_rate: w.avgHeartRate,
        max_heart_rate: w.maxHeartRate,
        strain_score: w.strainScore,
        calories_burned: w.caloriesBurned,
      })) as any[] ?? [],
      metricSources: phys && importSource ? {
        hrv_rmssd: importSource,
        resting_heart_rate: importSource,
        sleep_duration_ms: importSource,
        day_strain: importSource,
        recovery_score: importSource,
        respiratory_rate: importSource,
      } : {},
      metricValidations: {},
    });
  }
  return days;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useFeed() {
  const { user } = useAuthStore();
  const { checkinCompleted, iaci } = useDailyStore();
  const {
    days, cursor, hasMore, loading, loadingMore,
    setDays, appendDays, setCursor, setHasMore,
    setLoading, setLoadingMore, updateDay,
  } = useFeedStore();

  const initialLoadDone = useRef(false);

  // --- Initial Load ---
  const loadInitial = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setDays(generateMockFeed());
      setHasMore(false);
      setLoading(false);
      return;
    }

    if (!user?.id) return;
    setLoading(true);

    try {
      const todayStr = today();

      // Fetch physiology, subjective, workouts in parallel
      const [physRes, subjRes, workoutRes] = await Promise.all([
        supabase
          .from('daily_physiology')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(PAGE_SIZE),
        supabase
          .from('subjective_entries')
          .select('*')
          .eq('user_id', user.id)
          .eq('entry_type', 'morning')
          .gte('date', daysAgo(PAGE_SIZE))
          .order('date', { ascending: false }),
        supabase
          .from('workouts')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', daysAgo(PAGE_SIZE))
          .order('date', { ascending: false }),
      ]);

      const physRows = (physRes.data ?? []) as DailyPhysiologyRow[];
      const subjRows = (subjRes.data ?? []) as SubjectiveEntryRow[];
      const workoutRows = (workoutRes.data ?? []) as WorkoutRow[];

      // Index by date
      const physByDate = new Map<string, DailyPhysiologyRow>();
      for (const p of physRows) physByDate.set(p.date, p);

      const subjByDate = new Map<string, SubjectiveEntryRow>();
      for (const s of subjRows) subjByDate.set(s.date, s);

      const workoutsByDate = new Map<string, WorkoutRow[]>();
      for (const w of workoutRows) {
        const existing = workoutsByDate.get(w.date) ?? [];
        existing.push(w);
        workoutsByDate.set(w.date, existing);
      }

      // Build feed days
      const feedDays: FeedDay[] = [];

      // Always include today at index 0
      if (!physByDate.has(todayStr)) {
        feedDays.push(buildFeedDay(todayStr, null, subjByDate.get(todayStr) ?? null, workoutsByDate.get(todayStr) ?? []));
      }

      for (const phys of physRows) {
        feedDays.push(buildFeedDay(
          phys.date,
          phys,
          subjByDate.get(phys.date) ?? null,
          workoutsByDate.get(phys.date) ?? [],
        ));
      }

      // Deduplicate by date (in case today was in physRows)
      const seen = new Set<string>();
      const uniqueDays = feedDays.filter(d => {
        if (seen.has(d.date)) return false;
        seen.add(d.date);
        return true;
      });

      setDays(uniqueDays);
      setHasMore(physRows.length >= PAGE_SIZE);
      if (physRows.length > 0) {
        setCursor(physRows[physRows.length - 1].date);
      }
    } catch (err) {
      console.error('Feed load error:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // --- Load More (pagination) ---
  const loadMore = useCallback(async () => {
    if (!isSupabaseConfigured || !user?.id || !hasMore || loadingMore || !cursor) return;
    setLoadingMore(true);

    try {
      const [physRes, subjRes, workoutRes] = await Promise.all([
        supabase
          .from('daily_physiology')
          .select('*')
          .eq('user_id', user.id)
          .lt('date', cursor)
          .order('date', { ascending: false })
          .limit(PAGE_SIZE),
        supabase
          .from('subjective_entries')
          .select('*')
          .eq('user_id', user.id)
          .eq('entry_type', 'morning')
          .lt('date', cursor)
          .order('date', { ascending: false })
          .limit(PAGE_SIZE),
        supabase
          .from('workouts')
          .select('*')
          .eq('user_id', user.id)
          .lt('date', cursor)
          .order('date', { ascending: false })
          .limit(PAGE_SIZE * 3), // Multiple workouts per day
      ]);

      const physRows = (physRes.data ?? []) as DailyPhysiologyRow[];
      const subjRows = (subjRes.data ?? []) as SubjectiveEntryRow[];
      const workoutRows = (workoutRes.data ?? []) as WorkoutRow[];

      const subjByDate = new Map<string, SubjectiveEntryRow>();
      for (const s of subjRows) subjByDate.set(s.date, s);

      const workoutsByDate = new Map<string, WorkoutRow[]>();
      for (const w of workoutRows) {
        const existing = workoutsByDate.get(w.date) ?? [];
        existing.push(w);
        workoutsByDate.set(w.date, existing);
      }

      const newDays = physRows.map(phys =>
        buildFeedDay(phys.date, phys, subjByDate.get(phys.date) ?? null, workoutsByDate.get(phys.date) ?? []),
      );

      appendDays(newDays);
      setHasMore(physRows.length >= PAGE_SIZE);
      if (physRows.length > 0) {
        setCursor(physRows[physRows.length - 1].date);
      }
    } catch (err) {
      console.error('Feed loadMore error:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [user?.id, cursor, hasMore, loadingMore]);

  // --- Carry Forward Yesterday's Check-In ---
  const carryForwardCheckin = useCallback(async () => {
    const todayStr = today();

    // Demo mode: use default mid-range values as "yesterday's data"
    if (!isSupabaseConfigured) {
      const store = useDailyStore.getState();
      const previousCheckin = store.checkinData;

      // Use previous check-in if available, otherwise use sensible defaults
      const defaultData = previousCheckin ?? {
        overallEnergy: 3,
        sleepQuality: 3,
        soreness: {},
        stiffness: 2,
        heavyLegs: false,
        cramping: false,
        crampingLocation: '',
        heatIllness: false,
        heatSymptoms: [],
        motivation: 3,
        stress: 2,
        mentalFatigue: 2,
        hydrationLiters: 1.0,
        electrolytes: false,
        electrolyteServings: '',
        proteinAdequate: true,
        lateCaffeine: false,
        lateAlcohol: false,
        isTraveling: false,
        giIssues: 1,
        readiness: 3,
        quickCheckInOnly: true,
        feelingIll: false,
        illnessSymptoms: [],
        illnessSeverityScore: 0,
        additionalSymptoms: '',
      };

      store.setCheckinData(defaultData);
      store.setCheckinCompleted(true);

      updateDay(todayStr, { checkinCompleted: true });
      return;
    }

    if (!user?.id) return;

    const yesterdayStr = daysAgo(1);

    // Fetch yesterday's morning subjective entry
    const { data: yesterdayEntry } = await supabase
      .from('subjective_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', yesterdayStr)
      .eq('entry_type', 'morning')
      .single();

    if (!yesterdayEntry) {
      console.warn('No yesterday entry to carry forward');
      return;
    }

    // Clone for today
    const { id: _id, created_at: _ca, updated_at: _ua, ...fields } = yesterdayEntry;
    const todayEntry = {
      ...fields,
      user_id: user.id,
      date: todayStr,
      entry_type: 'morning',
    };

    await supabase
      .from('subjective_entries')
      .upsert(todayEntry, { onConflict: 'user_id,date,entry_type' });

    // Update feed store — mark today as checkin completed with inherited sources
    const metricSources: Record<string, 'inherited'> = {};
    const inheritedFields = [
      'subjective_stress', 'perceived_fatigue', 'soreness', 'stiffness',
      'heavy_legs', 'motivation', 'mood', 'mental_fatigue',
      'hydration_glasses', 'electrolytes_taken', 'protein_adequate',
    ];
    for (const field of inheritedFields) {
      metricSources[field] = 'inherited';
    }

    updateDay(todayStr, {
      checkinCompleted: true,
      subjective: todayEntry as SubjectiveEntryRow,
      metricSources: { ...metricSources },
    });

    // Mark check-in completed in daily store
    useDailyStore.getState().setCheckinCompleted(true);
  }, [user?.id]);

  // --- Refresh (pull-to-refresh) ---
  const refresh = useCallback(async () => {
    initialLoadDone.current = false;
    await loadInitial();
  }, [loadInitial]);

  // --- Sync today's IACI into feed when it updates ---
  useEffect(() => {
    if (iaci && days.length > 0 && days[0].date === today()) {
      updateDay(today(), { iaci, checkinCompleted: true });
    }
  }, [iaci]);

  // --- Auto-load on mount ---
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      loadInitial();
    }
  }, [loadInitial]);

  return {
    days,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    refresh,
    carryForwardCheckin,
  };
}
