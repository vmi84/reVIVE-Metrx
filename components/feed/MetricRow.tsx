/**
 * MetricRow — Editable metric with source badge and accept/edit buttons.
 *
 * Source badge label and color are resolved dynamically from the
 * DEVICE_SOURCE_REGISTRY, so any new wearable source works automatically.
 */

import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { ThemedText } from '../ui/ThemedText';
import { COLORS } from '../../lib/utils/constants';
import { MetricSource, getSourceMeta } from '../../lib/types/feed';

interface Props {
  label: string;
  value: number | null;
  unit: string;
  source: MetricSource;
  status: 'pending' | 'accepted' | 'edited';
  editable?: boolean;
  onAccept?: () => void;
  onEdit?: (newValue: number) => void;
}

export function MetricRow({
  label, value, unit, source, status, editable = true,
  onAccept, onEdit,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value ?? ''));

  const meta = getSourceMeta(source);

  function handleSave() {
    const num = parseFloat(editValue);
    if (!isNaN(num) && onEdit) {
      onEdit(num);
    }
    setEditing(false);
  }

  return (
    <View style={styles.container}>
      {/* Label + Source Badge */}
      <View style={styles.labelRow}>
        <ThemedText variant="caption" color={COLORS.textSecondary}>{label}</ThemedText>
        <View style={[styles.sourceBadge, { backgroundColor: meta.color + '20' }]}>
          <ThemedText variant="caption" style={[styles.sourceText, { color: meta.color }]}>
            {meta.label}
          </ThemedText>
        </View>
      </View>

      {/* Value + Actions */}
      <View style={styles.valueRow}>
        {editing ? (
          <View style={styles.editRow}>
            <TextInput
              style={styles.input}
              value={editValue}
              onChangeText={setEditValue}
              keyboardType="numeric"
              autoFocus
              selectTextOnFocus
            />
            <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
              <ThemedText variant="caption" color={COLORS.success}>Save</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditing(false)} style={styles.cancelBtn}>
              <ThemedText variant="caption" color={COLORS.textMuted}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <ThemedText variant="body" style={styles.value}>
              {value != null ? (typeof value === 'number' && !Number.isInteger(value)
                ? value.toFixed(1) : String(value)) : '--'}
              <ThemedText variant="caption" color={COLORS.textMuted}> {unit}</ThemedText>
            </ThemedText>

            {editable && status === 'pending' && (
              <View style={styles.actions}>
                <TouchableOpacity onPress={onAccept} style={styles.acceptBtn}>
                  <ThemedText variant="caption" color={COLORS.success}>✓</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => { setEditValue(String(value ?? '')); setEditing(true); }}
                  style={styles.editBtn}
                >
                  <ThemedText variant="caption" color={COLORS.primary}>✎</ThemedText>
                </TouchableOpacity>
              </View>
            )}

            {status === 'accepted' && (
              <ThemedText variant="caption" color={COLORS.success} style={styles.statusLabel}>✓ Accepted</ThemedText>
            )}
            {status === 'edited' && (
              <ThemedText variant="caption" color={COLORS.warning} style={styles.statusLabel}>✎ Edited</ThemedText>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sourceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 3,
  },
  sourceText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  value: {
    fontWeight: '600',
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusLabel: {
    fontSize: 11,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  saveBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cancelBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
});
