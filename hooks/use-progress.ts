import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth-store';
import { computeACWR, computeMonotony, detectStall } from '../lib/engine/progress-tracker';
import { ACWR, StallType } from '../lib/types/progress';
import { daysAgo } from '../lib/utils/date';

interface ProgressData {
  acwr: ACWR;
  monotony: number;
  stallType: StallType;
  alternativeApproaches: string[];
}

export function useProgress() {
  const { user } = useAuthStore();
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(false);

  const assessProgress = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      // Fetch 28 days of daily strain data
      const { data: strainData } = await supabase
        .from('daily_physiology')
        .select('date, day_strain, hrv_rmssd, iaci_score')
        .eq('user_id', user.id)
        .gte('date', daysAgo(90))
        .order('date', { ascending: true });

      const dailyLoads = (strainData ?? []).map((d: any) => d.day_strain ?? 0);
      const hrvHistory = (strainData ?? [])
        .filter((d: any) => d.hrv_rmssd != null)
        .map((d: any) => d.hrv_rmssd);

      // Fetch athlete history for VO2Max and pace trends
      const { data: historyData } = await supabase
        .from('athlete_history')
        .select('vo2max, lactate_threshold_pace, date')
        .eq('user_id', user.id)
        .order('date', { ascending: true })
        .limit(12);

      const vo2maxHistory = (historyData ?? [])
        .filter((d: any) => d.vo2max != null)
        .map((d: any) => d.vo2max);

      const acwr = computeACWR(dailyLoads);
      const monotony = computeMonotony(dailyLoads);

      const { stallType, alternativeApproaches } = detectStall({
        vo2maxHistory,
        paceHistory: [],
        hrvBaselineHistory: hrvHistory,
        acwr,
        monotony,
        daysSinceImprovement: 0, // TODO: compute from history
      });

      setProgress({ acwr, monotony, stallType, alternativeApproaches });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  return { progress, loading, assessProgress };
}
