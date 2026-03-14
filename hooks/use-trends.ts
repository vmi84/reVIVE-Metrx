import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth-store';
import { analyzeTrends, TrendResult, DailyMetric } from '../lib/engine/trend-analyzer';
import { daysAgo } from '../lib/utils/date';

export function useTrends() {
  const { user } = useAuthStore();
  const [trends, setTrends] = useState<Record<string, TrendResult>>({});
  const [loading, setLoading] = useState(false);

  const fetchTrends = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const { data } = await supabase
        .from('daily_physiology')
        .select('date, iaci_score, subsystem_scores, day_strain, inflammation_score')
        .eq('user_id', user.id)
        .gte('date', daysAgo(90))
        .not('iaci_score', 'is', null)
        .order('date', { ascending: true });

      if (!data || data.length === 0) {
        setLoading(false);
        return;
      }

      const history: DailyMetric[] = data.map((d: any) => ({
        date: d.date,
        iaciScore: d.iaci_score,
        subsystemScores: d.subsystem_scores ?? {},
        strain: d.day_strain ?? 0,
        inflammationScore: d.inflammation_score,
      }));

      const result: Record<string, TrendResult> = {
        '7d': analyzeTrends(history, '7d'),
        '21d': analyzeTrends(history, '21d'),
        '28d': analyzeTrends(history, '28d'),
        '90d': analyzeTrends(history, '90d'),
      };

      setTrends(result);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  return { trends, loading, fetchTrends };
}
