import { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useProtocols } from '../../hooks/use-protocols';
import { useDailyStore } from '../../store/daily-store';
import { useTrainingRecommendations } from '../../hooks/use-training-recommendations';
import { EvidenceSection } from '../../components/recovery/EvidenceSection';
import { ProtocolSeriesCard } from '../../components/recovery/ProtocolSeriesCard';
import { TrainingSection } from '../../components/recovery/TrainingSection';
import { ThemedText } from '../../components/ui/ThemedText';
import { Card } from '../../components/ui/Card';
import { COLORS } from '../../lib/utils/constants';

type SortOrder = 'asc' | 'desc';

export default function Recovery() {
  const { protocols, grouped, loading } = useProtocols();
  const { iaci } = useDailyStore();
  const trainingRecs = useTrainingRecommendations();
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const hasRecommendations =
    grouped.strong.length > 0 ||
    grouped.moderate.length > 0 ||
    grouped.emerging.length > 0;

  // Filter and sort protocols for "Browse All"
  const filteredProtocols = useMemo(() => {
    let result = [...protocols];

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.series.toLowerCase().includes(q) ||
          (p.primarySystem && p.primarySystem.toLowerCase().includes(q)),
      );
    }

    // Sort alphabetically
    result.sort((a, b) => {
      const cmp = a.name.localeCompare(b.name);
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [protocols, search, sortOrder]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header with phenotype context */}
      {iaci && (
        <Card style={styles.contextCard}>
          <ThemedText variant="caption" style={styles.contextLabel}>
            RECOMMENDED FOR
          </ThemedText>
          <ThemedText variant="body" style={styles.contextText}>
            {iaci.phenotype.label}
          </ThemedText>
          <View style={styles.scoreRow}>
            <ThemedText variant="caption" color={COLORS.textMuted}>
              IACI Score: {iaci.score}
            </ThemedText>
            <ThemedText variant="caption" color={COLORS.textMuted}>
              {iaci.readinessTier.charAt(0).toUpperCase() + iaci.readinessTier.slice(1)} Tier
            </ThemedText>
          </View>
        </Card>
      )}

      {/* No check-in state */}
      {!iaci && !loading && (
        <Card style={styles.emptyCard}>
          <ThemedText variant="body" style={styles.emptyIcon}>
            {'\u{1F9ED}'}
          </ThemedText>
          <ThemedText variant="subtitle" style={styles.emptyTitle}>
            Personalized Recovery
          </ThemedText>
          <ThemedText variant="body" color={COLORS.textSecondary} style={styles.emptyText}>
            Complete your morning check-in to get recovery protocols ranked by evidence and matched to your current state.
          </ThemedText>
          <TouchableOpacity
            onPress={() => router.push('/morning-checkin')}
            style={styles.checkinBtn}
          >
            <ThemedText variant="body" color="#fff" style={styles.checkinBtnText}>
              Start Check-In
            </ThemedText>
          </TouchableOpacity>
        </Card>
      )}

      {/* Training for Recovery */}
      {trainingRecs.hasData && trainingRecs.recommendations.length > 0 && (
        <TrainingSection
          recommendations={trainingRecs.recommendations}
          topPick={trainingRecs.topPick}
        />
      )}

      {/* Evidence-grouped passive recovery protocols */}
      {hasRecommendations && (
        <>
          <EvidenceSection
            level="strong"
            protocols={grouped.strong}
            defaultExpanded
          />
          <EvidenceSection
            level="moderate"
            protocols={grouped.moderate}
          />
          <EvidenceSection
            level="emerging"
            protocols={grouped.emerging}
          />
        </>
      )}

      {/* Browse All Protocols */}
      {protocols.length > 0 && (
        <View style={styles.browseAll}>
          <TouchableOpacity
            onPress={() => setShowAll(!showAll)}
            style={styles.browseAllBtn}
          >
            <ThemedText variant="body" color={COLORS.primary} style={styles.browseAllText}>
              {showAll ? 'Hide All Protocols' : `Browse All ${protocols.length} Protocols`}
            </ThemedText>
          </TouchableOpacity>

          {showAll && (
            <View style={styles.allList}>
              {/* Search bar */}
              <TextInput
                placeholder="Search protocols..."
                placeholderTextColor={COLORS.textMuted}
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
                autoCorrect={false}
              />

              {/* Sort toggle */}
              <View style={styles.sortRow}>
                <ThemedText variant="caption" color={COLORS.textSecondary}>
                  {filteredProtocols.length} protocols
                </ThemedText>
                <TouchableOpacity
                  onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  style={styles.sortButton}
                >
                  <ThemedText variant="caption" color={COLORS.primary} style={styles.sortText}>
                    A-Z {sortOrder === 'asc' ? '▼' : '▲'}
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {/* Filtered protocol list */}
              {filteredProtocols.map((protocol) => (
                <ProtocolSeriesCard
                  key={protocol.id}
                  protocol={protocol}
                  onPress={() => router.push(`/protocol/${protocol.slug}`)}
                />
              ))}

              {filteredProtocols.length === 0 && search.trim() && (
                <ThemedText
                  variant="body"
                  color={COLORS.textSecondary}
                  style={styles.noResults}
                >
                  No protocols match "{search}"
                </ThemedText>
              )}
            </View>
          )}
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  contextCard: {
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  contextLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  contextText: {
    fontWeight: '600',
    marginBottom: 6,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  checkinBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  checkinBtnText: {
    fontWeight: '600',
  },
  browseAll: {
    marginTop: 8,
  },
  browseAllBtn: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
    borderRadius: 10,
  },
  browseAllText: {
    fontWeight: '600',
    fontSize: 14,
  },
  allList: {
    marginTop: 16,
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 16,
    color: COLORS.text,
    fontSize: 15,
    marginBottom: 10,
  },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.primary + '15',
  },
  sortText: {
    fontWeight: '600',
    fontSize: 12,
  },
  noResults: {
    textAlign: 'center',
    paddingVertical: 20,
  },
  bottomSpacer: {
    height: 20,
  },
});
