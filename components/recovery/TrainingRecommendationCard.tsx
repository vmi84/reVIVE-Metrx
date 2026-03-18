/**
 * Training Recommendation Card
 *
 * Shows a single training-for-recovery modality recommendation
 * with its subsystem targets, recovery framing, and intensity guidance.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../lib/utils/constants';
import { RankedTrainingModality, TrainingPermission } from '../../lib/types/iaci';

interface Props {
  modality: RankedTrainingModality;
  isTopPick?: boolean;
}

const PERMISSION_CONFIG: Record<TrainingPermission, { label: string; color: string }> = {
  recommended: { label: 'Recommended', color: '#00C853' },
  allowed: { label: 'Allowed', color: '#2196F3' },
  caution: { label: 'Use Caution', color: '#FFC107' },
  avoid: { label: 'Avoid', color: '#F44336' },
};

const EVIDENCE_CONFIG: Record<string, { label: string; color: string }> = {
  strong: { label: 'Strong', color: '#00C853' },
  moderate: { label: 'Moderate', color: '#FFC107' },
  emerging: { label: 'Emerging', color: '#2196F3' },
};

export function TrainingRecommendationCard({ modality, isTopPick }: Props) {
  const [expanded, setExpanded] = useState(isTopPick ?? false);
  const permConfig = PERMISSION_CONFIG[modality.permission];
  const evidenceConfig = EVIDENCE_CONFIG[modality.evidenceLevel];

  return (
    <TouchableOpacity
      style={[styles.card, isTopPick && styles.cardTopPick]}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.7}
    >
      {isTopPick && (
        <View style={styles.topPickBadge}>
          <Text style={styles.topPickText}>#1 Pick for You</Text>
        </View>
      )}

      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{modality.label}</Text>
          <View style={[styles.permBadge, { backgroundColor: permConfig.color + '20' }]}>
            <Text style={[styles.permText, { color: permConfig.color }]}>{permConfig.label}</Text>
          </View>
        </View>
        <Text style={styles.framing} numberOfLines={expanded ? undefined : 2}>
          {modality.recoveryFraming}
        </Text>
      </View>

      {/* Subsystem pills */}
      <View style={styles.pillRow}>
        {modality.primarySubsystems.map(sys => (
          <View key={sys} style={styles.pill}>
            <Text style={styles.pillText}>{formatSubsystem(sys)}</Text>
          </View>
        ))}
        {modality.secondarySubsystems.map(sys => (
          <View key={sys} style={[styles.pill, styles.pillSecondary]}>
            <Text style={[styles.pillText, styles.pillTextSecondary]}>{formatSubsystem(sys)}</Text>
          </View>
        ))}
        <View style={[styles.pill, { backgroundColor: evidenceConfig.color + '20' }]}>
          <Text style={[styles.pillText, { color: evidenceConfig.color }]}>
            {evidenceConfig.label} Evidence
          </Text>
        </View>
      </View>

      {expanded && (
        <View style={styles.details}>
          {/* Sample Exercises — first so users see actionable info immediately */}
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>Sample Exercises</Text>
            <Text style={styles.detailValue}>{modality.examples.join(', ')}</Text>
          </View>

          {/* Intensity guidance */}
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>Recovery Zone</Text>
            <Text style={styles.detailValue}>{modality.intensityGuidance.recoveryZone}</Text>
          </View>
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>Loading Threshold</Text>
            <Text style={styles.detailValue}>{modality.intensityGuidance.loadingThreshold}</Text>
          </View>

          {/* Duration */}
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>
              {modality.durationRange.min}-{modality.durationRange.max} min
              (sweet spot: {modality.durationRange.sweet} min)
            </Text>
          </View>
        </View>
      )}

      <Text style={styles.expandHint}>{expanded ? 'Tap to collapse' : 'Tap for details'}</Text>
    </TouchableOpacity>
  );
}

function formatSubsystem(key: string): string {
  const map: Record<string, string> = {
    autonomic: 'Autonomic',
    musculoskeletal: 'Musculoskeletal',
    cardiometabolic: 'Cardiometabolic',
    sleep: 'Sleep',
    metabolic: 'Metabolic',
    psychological: 'Psychological',
  };
  return map[key] ?? key;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTopPick: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  topPickBadge: {
    backgroundColor: COLORS.primary + '20',
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  topPickText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  header: {
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  permBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 8,
  },
  permText: {
    fontSize: 11,
    fontWeight: '600',
  },
  framing: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  pill: {
    backgroundColor: COLORS.primary + '15',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '500',
  },
  pillSecondary: {
    backgroundColor: COLORS.border,
  },
  pillTextSecondary: {
    color: COLORS.textSecondary,
  },
  details: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  detailSection: {
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
  },
  expandHint: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
