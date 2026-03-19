/**
 * SegmentedRating — Inline label + 5 color-coded number buttons.
 *
 * Layout: Label (left) + [1] [2] [3] [4] [5] (right), single 48px row.
 * Colors: 1-2 red, 3 yellow, 4-5 green. Selected fills with color.
 */

import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '../ui/ThemedText';
import { COLORS } from '../../lib/utils/constants';

interface Props {
  label: string;
  value: number;
  onChange: (value: number) => void;
  /** Invert colors: 1=green, 5=red (use for Soreness where low=good) */
  inverted?: boolean;
}

function getColor(n: number, inverted?: boolean): string {
  if (inverted) {
    if (n <= 2) return '#00C48C';   // green — not sore
    if (n === 3) return '#FFB800';  // yellow — moderate
    return '#FF4444';               // red — very sore
  }
  if (n <= 2) return '#FF4444';   // red — bad/poor
  if (n === 3) return '#FFB800';  // yellow — okay
  return '#00C48C';               // green — good/great
}

export function SegmentedRating({ label, value, onChange, inverted }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <ThemedText variant="body" style={styles.label}>{label}</ThemedText>
        <View style={styles.buttons}>
          {[1, 2, 3, 4, 5].map((n) => {
            const selected = n === value;
            const color = getColor(n, inverted);
            return (
              <View key={n} style={styles.btnCol}>
                {n === 1 && (
                  <ThemedText variant="caption" style={styles.endLabel}>Lowest</ThemedText>
                )}
                {n === 5 && (
                  <ThemedText variant="caption" style={styles.endLabel}>Highest</ThemedText>
                )}
                {n !== 1 && n !== 5 && <View style={styles.endLabelSpacer} />}
                <TouchableOpacity
                  onPress={() => onChange(n)}
                  style={[
                    styles.btn,
                    selected && { backgroundColor: color, borderColor: color },
                  ]}
                  activeOpacity={0.7}
                >
                  <ThemedText
                    variant="body"
                    style={[
                      styles.btnText,
                      selected && styles.btnTextSelected,
                    ]}
                  >
                    {n}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    minHeight: 48,
    paddingHorizontal: 4,
  },
  label: {
    width: 100,
    fontWeight: '500',
    fontSize: 15,
  },
  buttons: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6,
  },
  btnCol: {
    alignItems: 'center',
  },
  endLabel: {
    fontSize: 8,
    color: COLORS.textMuted,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  endLabelSpacer: {
    height: 12,
  },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  btnTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
