/**
 * Training for Recovery Section
 *
 * Collapsible section showing ranked training modalities
 * that help the athlete's weakest subsystems recover.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../lib/utils/constants';
import { RankedTrainingModality } from '../../lib/types/iaci';
import { TrainingRecommendationCard } from './TrainingRecommendationCard';

interface Props {
  recommendations: RankedTrainingModality[];
  topPick: RankedTrainingModality | null;
}

export function TrainingSection({ recommendations, topPick }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);

  if (recommendations.length === 0) return null;

  // Show top 3 by default, all on "show more"
  const displayItems = showAll ? recommendations : recommendations.slice(0, 3);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>💪</Text>
          <Text style={styles.headerTitle}>Training for Recovery</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{recommendations.length}</Text>
          </View>
        </View>
        <Text style={styles.chevron}>{expanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          <Text style={styles.sectionSubtitle}>
            Activities that target your weakest subsystems, ranked by relevance
          </Text>

          {displayItems.map((rec, idx) => (
            <TrainingRecommendationCard
              key={rec.key}
              modality={rec}
              isTopPick={idx === 0 && topPick?.key === rec.key}
            />
          ))}

          {recommendations.length > 3 && !showAll && (
            <TouchableOpacity
              style={styles.showMoreButton}
              onPress={() => setShowAll(true)}
            >
              <Text style={styles.showMoreText}>
                Show {recommendations.length - 3} more activities
              </Text>
            </TouchableOpacity>
          )}

          {showAll && recommendations.length > 3 && (
            <TouchableOpacity
              style={styles.showMoreButton}
              onPress={() => setShowAll(false)}
            >
              <Text style={styles.showMoreText}>Show less</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  countBadge: {
    backgroundColor: COLORS.primary + '20',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  chevron: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  content: {
    marginTop: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  showMoreButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  showMoreText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
});
