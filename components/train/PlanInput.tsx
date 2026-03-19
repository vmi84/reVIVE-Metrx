/**
 * PlanInput — Quick "What's your training today?" card.
 *
 * - Grayed out if a training plan already exists for today
 * - Multi-zone selection (e.g., Z2-Z3 run)
 * - Zones labeled: Z1-Z2 = Aerobic, Z3 = Tempo, Z4 = Threshold, Z5 = VO2max
 */

import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { ThemedText } from '../ui/ThemedText';
import { Card } from '../ui/Card';
import { COLORS } from '../../lib/utils/constants';
import { useTrainingPlanStore } from '../../store/training-plan-store';
import { today } from '../../lib/utils/date';

const WORKOUT_TYPES = [
  'Easy Run', 'Tempo Run', 'Intervals', 'Long Run',
  'Easy Swim', 'Hard Swim', 'Easy Bike', 'Hard Bike',
  'Strength', 'Yoga', 'Rest', 'Cross-Train',
];

const ZONE_OPTIONS = [
  { key: 'Z1', label: 'Z1' },
  { key: 'Z2', label: 'Z2' },
  { key: 'Z3', label: 'Z3' },
  { key: 'Z4', label: 'Z4' },
  { key: 'Z5', label: 'Z5' },
];

interface Props {
  hasPlanForToday?: boolean;
}

export function PlanInput({ hasPlanForToday = false }: Props) {
  const { upsertSession } = useTrainingPlanStore();
  const [type, setType] = useState('');
  const [slot, setSlot] = useState<'am' | 'pm'>('am');
  const [duration, setDuration] = useState('');
  const [selectedZones, setSelectedZones] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState(false);

  const toggleZone = (z: string) => {
    setSelectedZones((prev) => {
      const next = new Set(prev);
      if (next.has(z)) next.delete(z);
      else next.add(z);
      return next;
    });
  };

  const zoneString = () => {
    const sorted = Array.from(selectedZones).sort();
    if (sorted.length === 0) return undefined;
    if (sorted.length === 1) return sorted[0];
    return `${sorted[0]}-${sorted[sorted.length - 1]}`;
  };

  const handleAdd = () => {
    if (!type) return;
    upsertSession({
      date: today(),
      slot,
      type,
      durationMin: duration ? parseInt(duration, 10) : undefined,
      intensityZone: zoneString(),
      source: 'manual',
    });
    setType('');
    setDuration('');
    setSelectedZones(new Set());
    setExpanded(false);
  };

  // Grayed out if plan already exists for today
  if (!expanded) {
    const disabled = hasPlanForToday;
    return (
      <TouchableOpacity
        onPress={() => !disabled && setExpanded(true)}
        activeOpacity={disabled ? 1 : 0.7}
      >
        <Card style={[styles.collapsedCard, disabled && styles.collapsedDisabled]}>
          <ThemedText
            variant="body"
            color={disabled ? COLORS.textMuted : COLORS.primary}
            style={styles.addText}
          >
            {disabled ? 'Training plan set for today' : '+ What\'s your training today?'}
          </ThemedText>
        </Card>
      </TouchableOpacity>
    );
  }

  return (
    <Card style={styles.card}>
      <ThemedText variant="caption" style={styles.label}>WORKOUT TYPE</ThemedText>
      <View style={styles.chipRow}>
        {WORKOUT_TYPES.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.chip, type === t && styles.chipActive]}
            onPress={() => setType(t)}
          >
            <ThemedText
              variant="caption"
              style={[styles.chipText, type === t && styles.chipTextActive]}
            >
              {t}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.row}>
        <View style={styles.halfCol}>
          <ThemedText variant="caption" style={styles.label}>SESSION</ThemedText>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggle, slot === 'am' && styles.toggleActive]}
              onPress={() => setSlot('am')}
            >
              <ThemedText variant="caption" style={slot === 'am' ? styles.toggleTextActive : styles.toggleText}>
                AM
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggle, slot === 'pm' && styles.toggleActive]}
              onPress={() => setSlot('pm')}
            >
              <ThemedText variant="caption" style={slot === 'pm' ? styles.toggleTextActive : styles.toggleText}>
                PM
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.halfCol}>
          <ThemedText variant="caption" style={styles.label}>DURATION (min)</ThemedText>
          <TextInput
            style={styles.input}
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
            placeholder="60"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>
      </View>

      <ThemedText variant="caption" style={styles.label}>INTENSITY ZONE (select one or range)</ThemedText>
      <View style={styles.zoneContainer}>
        <View style={styles.zoneRow}>
          {ZONE_OPTIONS.map((z) => (
            <TouchableOpacity
              key={z.key}
              style={[styles.zoneChip, selectedZones.has(z.key) && styles.zoneChipActive]}
              onPress={() => toggleZone(z.key)}
            >
              <ThemedText
                variant="caption"
                style={[styles.zoneChipText, selectedZones.has(z.key) && styles.zoneChipTextActive]}
              >
                {z.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
        {/* Zone labels */}
        <View style={styles.zoneLabelRow}>
          <View style={styles.zoneLabelGroup}>
            <ThemedText variant="caption" color={COLORS.textMuted} style={styles.zoneLabelText}>
              Aerobic
            </ThemedText>
          </View>
          <View style={styles.zoneLabelSpacer} />
          <View style={styles.zoneLabelGroup}>
            <ThemedText variant="caption" color={COLORS.textMuted} style={styles.zoneLabelText}>
              Threshold / VO2max
            </ThemedText>
          </View>
        </View>
      </View>

      {selectedZones.size > 0 && (
        <ThemedText variant="caption" color={COLORS.primary} style={styles.zonePreview}>
          Selected: {zoneString()}
        </ThemedText>
      )}

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => setExpanded(false)} style={styles.cancelBtn}>
          <ThemedText variant="caption" color={COLORS.textSecondary}>Cancel</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleAdd}
          style={[styles.addBtn, !type && styles.addBtnDisabled]}
          disabled={!type}
        >
          <ThemedText variant="body" style={styles.addBtnText}>Add Session</ThemedText>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  collapsedCard: {
    alignItems: 'center',
    padding: 14,
    marginBottom: 12,
  },
  collapsedDisabled: {
    opacity: 0.5,
  },
  addText: {
    fontWeight: '600',
  },
  card: {
    marginBottom: 12,
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 6,
    marginTop: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  chip: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCol: {
    flex: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 6,
  },
  toggle: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  toggleTextActive: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
  },
  input: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    height: 36,
    paddingHorizontal: 12,
    color: COLORS.text,
    fontSize: 14,
  },
  zoneContainer: {
    marginBottom: 4,
  },
  zoneRow: {
    flexDirection: 'row',
    gap: 6,
  },
  zoneChip: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  zoneChipActive: {
    backgroundColor: COLORS.primary,
  },
  zoneChipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  zoneChipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  zoneLabelRow: {
    flexDirection: 'row',
    marginTop: 3,
    paddingHorizontal: 2,
  },
  zoneLabelGroup: {
    flex: 2,
    alignItems: 'center',
  },
  zoneLabelSpacer: {
    flex: 1,
  },
  zoneLabelText: {
    fontSize: 9,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  zonePreview: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  addBtnDisabled: {
    opacity: 0.4,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
