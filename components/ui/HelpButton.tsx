/**
 * HelpButton — "Help" link that opens the Help Guide filtered by screen.
 * Place in the top-left of each screen header.
 */

import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
// @ts-ignore — bundled with expo, types resolved at runtime
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { COLORS } from '../../lib/utils/constants';

interface Props {
  screen: 'home' | 'recovery' | 'effort' | 'trends' | 'settings' | 'checkin';
}

export function HelpButton({ screen }: Props) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => router.push(`/help-guide?screen=${screen}`)}
      activeOpacity={0.7}
    >
      <Ionicons name="help-circle-outline" size={16} color={COLORS.primary} />
      <ThemedText style={styles.text}>Help</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
