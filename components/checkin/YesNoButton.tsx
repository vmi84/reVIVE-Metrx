/**
 * Reusable Yes/No radio button component.
 * Replaces all Switch toggles in the morning check-in.
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '../ui/ThemedText';
import { COLORS } from '../../lib/utils/constants';

interface YesNoButtonProps {
  value: boolean;
  onChange: (val: boolean) => void;
  label?: string;
  yesLabel?: string;
  noLabel?: string;
  yesColor?: string;
  noColor?: string;
}

export function YesNoButton({
  value,
  onChange,
  label,
  yesLabel = 'Yes',
  noLabel = 'No',
  yesColor = COLORS.error,
  noColor = COLORS.success,
}: YesNoButtonProps) {
  return (
    <View style={styles.row}>
      {label && (
        <ThemedText variant="body" style={styles.label}>{label}</ThemedText>
      )}
      <View style={styles.toggle}>
        <TouchableOpacity
          style={[
            styles.btn,
            !value && { backgroundColor: noColor + '30', borderWidth: 1, borderColor: noColor },
          ]}
          onPress={() => onChange(false)}
        >
          <ThemedText
            variant="caption"
            style={!value ? styles.textActive : styles.text}
          >
            {noLabel}
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.btn,
            value && { backgroundColor: yesColor + '30', borderWidth: 1, borderColor: yesColor },
          ]}
          onPress={() => onChange(true)}
        >
          <ThemedText
            variant="caption"
            style={value ? styles.textActive : styles.text}
          >
            {yesLabel}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  label: {
    flex: 1,
    marginRight: 12,
  },
  toggle: {
    flexDirection: 'row',
    gap: 6,
  },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceLight,
  },
  text: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  textActive: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },
});
