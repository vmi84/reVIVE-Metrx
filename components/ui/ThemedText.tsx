import { Text, TextProps, StyleSheet } from 'react-native';
import { COLORS } from '../../lib/utils/constants';

interface ThemedTextProps extends TextProps {
  variant?: 'title' | 'subtitle' | 'body' | 'caption' | 'score';
  color?: string;
}

export function ThemedText({ variant = 'body', color, style, ...props }: ThemedTextProps) {
  return (
    <Text
      style={[
        styles.base,
        styles[variant],
        color ? { color } : undefined,
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    color: COLORS.text,
    fontFamily: 'System',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  score: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -2,
  },
});
