/**
 * DailyCard — Wrapper component that manages collapsed/expanded state.
 *
 * Tap to toggle. Tier-colored left border. LayoutAnimation for smooth transitions.
 */

import { LayoutAnimation, TouchableOpacity, StyleSheet, View } from 'react-native';
import { DailyCardCollapsed } from './DailyCardCollapsed';
import { DailyCardExpanded } from './DailyCardExpanded';
import { COLORS } from '../../lib/utils/constants';
import { FeedDay } from '../../lib/types/feed';
import { getTierColor } from '../../lib/types/iaci';

interface Props {
  day: FeedDay;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onMetricAccept?: (metric: string) => void;
  onMetricEdit?: (metric: string, value: number) => void;
}

export function DailyCard({ day, isExpanded, onToggleExpand, onMetricAccept, onMetricEdit }: Props) {
  const tier = day.iaci?.readinessTier ?? 'maintain';
  const borderColor = day.iaci ? getTierColor(tier) : COLORS.border;

  function handlePress() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggleExpand();
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      style={[styles.card, { borderLeftColor: borderColor }]}
    >
      {isExpanded ? (
        <DailyCardExpanded
          day={day}
          onMetricAccept={onMetricAccept}
          onMetricEdit={onMetricEdit}
        />
      ) : (
        <DailyCardCollapsed day={day} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
    overflow: 'hidden',
  },
});
