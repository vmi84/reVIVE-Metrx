/**
 * Help Guide — Comprehensive guide to every feature in the app.
 *
 * Accessible from Settings > Help Guide and from ? buttons on each screen.
 * Sections can be filtered by screen via query param: /help-guide?screen=home
 */

import { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, LayoutAnimation } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedText } from '../components/ui/ThemedText';
import { Card } from '../components/ui/Card';
import { COLORS } from '../lib/utils/constants';
import { HELP_GUIDE, type HelpEntry } from '../data/help-guide';

const SCREEN_LABELS: Record<string, string> = {
  all: 'All Topics',
  home: 'Home',
  recovery: 'Recovery',
  effort: 'Effort Guide',
  trends: 'Trends',
  settings: 'Settings',
  checkin: 'Check-In',
  general: 'General',
};

const SCREEN_FILTERS = ['all', 'home', 'recovery', 'effort', 'trends', 'checkin', 'settings'];

export default function HelpGuide() {
  const { screen: initialScreen } = useLocalSearchParams<{ screen?: string }>();
  const [activeFilter, setActiveFilter] = useState(initialScreen ?? 'all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleEntry = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(prev => prev === id ? null : id);
  };

  const filteredEntries = useMemo(() => {
    if (activeFilter === 'all') return HELP_GUIDE;
    return HELP_GUIDE.filter(e => e.screen === activeFilter);
  }, [activeFilter]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ThemedText variant="title" style={styles.title}>Help Guide</ThemedText>
      <ThemedText variant="caption" color={COLORS.textSecondary} style={styles.subtitle}>
        Tap any topic to learn what it does and how to use it.
      </ThemedText>

      {/* Screen filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <View style={styles.filterRow}>
          {SCREEN_FILTERS.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.filterChip, activeFilter === s && styles.filterChipActive]}
              onPress={() => setActiveFilter(s)}
            >
              <ThemedText
                variant="caption"
                style={activeFilter === s ? styles.filterTextActive : styles.filterText}
              >
                {SCREEN_LABELS[s]}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Help entries */}
      {filteredEntries.map((entry) => {
        const isExpanded = expandedId === entry.id;
        return (
          <Card key={entry.id} style={styles.entryCard}>
            <TouchableOpacity onPress={() => toggleEntry(entry.id)} activeOpacity={0.7}>
              <View style={styles.entryHeader}>
                <View style={styles.entryLeft}>
                  <View style={[styles.screenBadge, { backgroundColor: getScreenColor(entry.screen) + '20' }]}>
                    <ThemedText variant="caption" style={[styles.screenBadgeText, { color: getScreenColor(entry.screen) }]}>
                      {SCREEN_LABELS[entry.screen]?.toUpperCase()}
                    </ThemedText>
                  </View>
                  <ThemedText variant="body" style={styles.entryTitle}>{entry.title}</ThemedText>
                </View>
                <ThemedText variant="caption" style={styles.chevron}>
                  {isExpanded ? '▼' : '▶'}
                </ThemedText>
              </View>
              <ThemedText variant="caption" color={COLORS.textSecondary} numberOfLines={isExpanded ? undefined : 2}>
                {entry.summary}
              </ThemedText>
            </TouchableOpacity>

            {isExpanded && (
              <View style={styles.entryDetail}>
                <ThemedText variant="caption" color={COLORS.text} style={styles.detailText}>
                  {entry.detail}
                </ThemedText>

                <View style={styles.detailSection}>
                  <ThemedText variant="caption" style={styles.detailLabel}>WHY IT MATTERS</ThemedText>
                  <ThemedText variant="caption" color={COLORS.textSecondary} style={styles.detailText}>
                    {entry.whyItMatters}
                  </ThemedText>
                </View>

                <View style={styles.detailSection}>
                  <ThemedText variant="caption" style={styles.detailLabel}>HOW TO USE</ThemedText>
                  <ThemedText variant="caption" color={COLORS.textSecondary} style={styles.detailText}>
                    {entry.howToUse}
                  </ThemedText>
                </View>
              </View>
            )}
          </Card>
        );
      })}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function getScreenColor(screen: string): string {
  switch (screen) {
    case 'home': return COLORS.primary;
    case 'recovery': return COLORS.success;
    case 'effort': return COLORS.warning;
    case 'trends': return '#9C27B0';
    case 'settings': return COLORS.textSecondary;
    case 'checkin': return '#FF9800';
    default: return COLORS.textMuted;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 12,
  },
  filterScroll: {
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filterChip: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
  },
  entryCard: {
    marginBottom: 8,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  entryLeft: {
    flex: 1,
    gap: 4,
  },
  screenBadge: {
    alignSelf: 'flex-start',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  screenBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  entryTitle: {
    fontWeight: '700',
    fontSize: 15,
  },
  chevron: {
    fontSize: 10,
    color: COLORS.textMuted,
    paddingLeft: 8,
    paddingTop: 4,
  },
  entryDetail: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  detailSection: {
    marginTop: 10,
  },
  detailLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  detailText: {
    lineHeight: 18,
    fontSize: 13,
  },
});
