/**
 * DetailSection — Collapsible section with summary header.
 *
 * Collapsed: single 40px row with title + summary + chevron.
 * Expanded: reveals children with LayoutAnimation.
 */

import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, LayoutAnimation } from 'react-native';
import { ThemedText } from '../ui/ThemedText';
import { COLORS } from '../../lib/utils/constants';

interface Props {
  title: string;
  summary: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export function DetailSection({ title, summary, children, defaultExpanded = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggle} style={styles.header} activeOpacity={0.7}>
        <ThemedText variant="caption" style={styles.chevron}>
          {expanded ? '▾' : '▸'}
        </ThemedText>
        <ThemedText variant="body" style={styles.title}>{title}</ThemedText>
        {!expanded && (
          <ThemedText variant="caption" style={styles.summary} numberOfLines={1}>
            {summary}
          </ThemedText>
        )}
      </TouchableOpacity>
      {expanded && (
        <View style={styles.body}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    paddingHorizontal: 4,
  },
  chevron: {
    width: 20,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  title: {
    fontWeight: '600',
    fontSize: 14,
    marginRight: 12,
  },
  summary: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'right',
  },
  body: {
    paddingHorizontal: 4,
    paddingBottom: 12,
    gap: 8,
  },
});
