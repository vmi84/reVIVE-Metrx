import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '../ui/ThemedText';
import { TopPickCard } from './TopPickCard';
import { ProtocolSeriesCard } from './ProtocolSeriesCard';
import { RankedProtocol } from '../../hooks/use-protocols';
import { COLORS } from '../../lib/utils/constants';

interface EvidenceSectionProps {
  level: 'strong' | 'moderate' | 'emerging';
  protocols: RankedProtocol[];
  defaultExpanded?: boolean;
}

const SECTION_CONFIG = {
  strong: {
    icon: '\u25A0', // ■
    label: 'Strong Evidence',
    color: COLORS.success,
  },
  moderate: {
    icon: '\u25B2', // ▲
    label: 'Moderate Evidence',
    color: COLORS.warning,
  },
  emerging: {
    icon: '\u25CB', // ○
    label: 'Emerging Evidence',
    color: COLORS.primary,
  },
};

export function EvidenceSection({ level, protocols, defaultExpanded = false }: EvidenceSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showMore, setShowMore] = useState(false);

  if (protocols.length === 0) return null;

  const config = SECTION_CONFIG[level];
  const topPick = protocols[0];
  const rest = protocols.slice(1);

  return (
    <View style={styles.container}>
      {/* Section header — tap to expand/collapse */}
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        style={styles.header}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <ThemedText style={[styles.icon, { color: config.color }]}>
            {config.icon}
          </ThemedText>
          <ThemedText variant="subtitle" style={styles.headerTitle}>
            {config.label}
          </ThemedText>
          <View style={[styles.countBadge, { backgroundColor: config.color + '20' }]}>
            <ThemedText variant="caption" style={[styles.countText, { color: config.color }]}>
              {protocols.length}
            </ThemedText>
          </View>
        </View>
        <ThemedText style={styles.chevron}>
          {expanded ? '\u25B2' : '\u25BC'}
        </ThemedText>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.body}>
          {/* #1 Pick hero card */}
          <TopPickCard
            protocol={topPick}
            accentColor={config.color}
            onPress={() => router.push(`/protocol/${topPick.slug}`)}
          />

          {/* Remaining protocols — collapsed behind "Show more" */}
          {rest.length > 0 && (
            <>
              {showMore ? (
                <>
                  {rest.map((p) => (
                    <ProtocolSeriesCard
                      key={p.id}
                      protocol={p}
                      relevanceScore={p.relevanceScore}
                      onPress={() => router.push(`/protocol/${p.slug}`)}
                    />
                  ))}
                  <TouchableOpacity onPress={() => setShowMore(false)} style={styles.toggleBtn}>
                    <ThemedText variant="caption" color={COLORS.primary} style={styles.toggleText}>
                      Show less
                    </ThemedText>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity onPress={() => setShowMore(true)} style={styles.toggleBtn}>
                  <ThemedText variant="caption" color={COLORS.primary} style={styles.toggleText}>
                    Show {rest.length} more {rest.length === 1 ? 'option' : 'options'}
                  </ThemedText>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 14,
  },
  headerTitle: {
    fontWeight: '600',
    fontSize: 15,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chevron: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  body: {
    marginTop: 8,
    paddingLeft: 4,
  },
  toggleBtn: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  toggleText: {
    fontWeight: '600',
    fontSize: 13,
  },
});
