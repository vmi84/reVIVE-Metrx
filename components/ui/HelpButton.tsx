/**
 * HelpButton — Small ? circle that links to the Help Guide filtered by screen.
 * Place in the top-right of each screen.
 */

import { TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
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
      <ThemedText style={styles.text}>?</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
