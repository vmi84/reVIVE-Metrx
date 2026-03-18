/**
 * PlanInput — Quick "What's your training today?" card for competitive athletes.
 *
 * Simple picker: workout type + duration + intensity zone.
 * Writes to the training plan store.
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

const ZONES = ['Z1', 'Z2', 'Z3', 'Threshold', 'VO2max'];

export function PlanInput() {
  const { upsertSession } = useTrainingPlanStore();
  const [type, setType] = useState('');
  const [slot, setSlot] = useState<'am' | 'pm'>('am');
  const [duration, setDuration] = useState('');
  const [zone, setZone] = useState('');
  const [expanded, setExpanded] = useState(false);

  const handleAdd = () => {
    if (!type) return;
    upsertSession({
      date: today(),
      slot,
      type,
      durationMin: duration ? parseInt(duration, 10) : undefined,
      intensityZone: zone || undefined,
      source: 'manual',
    });
    setType('');
    setDuration('');
    setZone('');
    setExpanded(false);
  };

  if (!expanded) {
    return (
      <TouchableOpacity onPress={() => setExpanded(true)} activeOpacity={0.7}>
        <Card style={styles.collapsedCard}>
          <ThemedText variant="body" color={COLORS.primary} style={styles.addText}>
            + What's your training today?
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

      <ThemedText variant="caption" style={styles.label}>INTENSITY ZONE</ThemedText>
      <View style={styles.chipRow}>
        {ZONES.map((z) => (
          <TouchableOpacity
            key={z}
            style={[styles.chip, zone === z && styles.chipActive]}
            onPress={() => setZone(zone === z ? '' : z)}
          >
            <ThemedText
              variant="caption"
              style={[styles.chipText, zone === z && styles.chipTextActive]}
            >
              {z}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

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
