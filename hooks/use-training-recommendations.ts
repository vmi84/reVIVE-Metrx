/**
 * Training Recommendations Hook
 *
 * Consumes IACI result and sport profile to expose ranked
 * training-for-recovery recommendations grouped by category.
 */

import { useMemo } from 'react';
import { useDailyStore } from '../store/daily-store';
import { useAuthStore } from '../store/auth-store';
import { RankedTrainingModality, TrainingCategory } from '../lib/types/iaci';

interface TrainingRecommendations {
  /** All ranked recommendations (max 8) */
  recommendations: RankedTrainingModality[];
  /** The single best modality for the athlete right now */
  topPick: RankedTrainingModality | null;
  /** Recommendations grouped by category */
  byCategory: { category: TrainingCategory; label: string; items: RankedTrainingModality[] }[];
  /** Whether IACI data is available */
  hasData: boolean;
}

const CATEGORY_LABELS: Record<TrainingCategory, string> = {
  aerobic: 'Aerobic',
  strength: 'Strength',
  bodyweight: 'Bodyweight',
  agt: 'Anti-Glycolytic (AGT)',
  mitochondrial: 'Mitochondrial Health',
  mind_body: 'Mind & Body',
  mobility: 'Mobility',
  aquatic: 'Aquatic',
  low_impact: 'Low Impact',
  lifestyle: 'Lifestyle & Active Recovery',
  skill: 'Skill Work',
};

export function useTrainingRecommendations(): TrainingRecommendations {
  const iaci = useDailyStore((s) => s.iaci);
  const profile = useAuthStore((s) => s.profile);

  return useMemo(() => {
    if (!iaci?.protocol?.recommendedTraining) {
      return { recommendations: [], topPick: null, byCategory: [], hasData: false };
    }

    const recommendations = iaci.protocol.recommendedTraining;
    const topPick = recommendations.length > 0 ? recommendations[0] : null;

    // Group by category
    const categoryMap = new Map<TrainingCategory, RankedTrainingModality[]>();
    for (const rec of recommendations) {
      const existing = categoryMap.get(rec.category) ?? [];
      existing.push(rec);
      categoryMap.set(rec.category, existing);
    }

    const byCategory = Array.from(categoryMap.entries()).map(([category, items]) => ({
      category,
      label: CATEGORY_LABELS[category],
      items,
    }));

    return { recommendations, topPick, byCategory, hasData: true };
  }, [iaci, profile]);
}
