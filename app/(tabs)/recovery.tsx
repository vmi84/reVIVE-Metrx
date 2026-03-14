import { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useProtocols } from '../../hooks/use-protocols';
import { useDailyStore } from '../../store/daily-store';
import { ProtocolSeriesCard } from '../../components/recovery/ProtocolSeriesCard';
import { ThemedText } from '../../components/ui/ThemedText';
import { Card } from '../../components/ui/Card';
import { COLORS } from '../../lib/utils/constants';
import { ProtocolSeries } from '../../lib/types/protocols';

const SERIES_ORDER: { key: ProtocolSeries; label: string }[] = [
  { key: 'classic', label: 'Classic Modalities' },
  { key: 'breathwork', label: 'Breathwork' },
  { key: 'foam_roll', label: 'Foam Roll / Myofascial' },
  { key: 'dynamic_mobility', label: 'Dynamic Mobility' },
  { key: 'static_stretch', label: 'Static Stretching' },
  { key: 'banded', label: 'Banded Mobilizations' },
  { key: 'ais', label: 'Active Isolated Stretching' },
  { key: 'aquatic', label: 'Aquatic Recovery' },
  { key: 'vagus_nerve', label: 'Vagus Nerve Calmer' },
  { key: 'passive', label: 'Passive Recovery' },
];

type FilterMode = 'recommended' | 'all' | ProtocolSeries;

export default function Recovery() {
  const { protocols, recommended, loading } = useProtocols();
  const { iaci } = useDailyStore();
  const [filter, setFilter] = useState<FilterMode>('recommended');

  const displayProtocols = filter === 'recommended'
    ? recommended
    : filter === 'all'
    ? protocols
    : protocols.filter(p => p.series === filter);

  const recommendedSlugs = new Set(
    iaci?.protocol.recommendedModalities ?? [],
  );

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
        </Card>
      )}

      {/* Filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <View style={styles.filters}>
          <FilterTab
            label="Recommended"
            active={filter === 'recommended'}
            onPress={() => setFilter('recommended')}
            count={recommended.length}
          />
          <FilterTab
            label="All"
            active={filter === 'all'}
            onPress={() => setFilter('all')}
            count={protocols.length}
          />
          {SERIES_ORDER.map(({ key, label }) => (
            <FilterTab
              key={key}
              label={label}
              active={filter === key}
              onPress={() => setFilter(key)}
              count={protocols.filter(p => p.series === key).length}
            />
          ))}
        </View>
      </ScrollView>

      {/* Protocol list */}
      {displayProtocols.map((protocol) => (
        <ProtocolSeriesCard
          key={protocol.id}
          protocol={protocol}
          isRecommended={recommendedSlugs.has(protocol.slug)}
          onPress={() => {
            // Navigate to protocol detail
          }}
        />
      ))}

      {displayProtocols.length === 0 && !loading && (
        <View style={styles.empty}>
          <ThemedText variant="body" color={COLORS.textSecondary}>
            {filter === 'recommended'
              ? 'Complete your morning check-in to get personalized recommendations.'
              : 'No protocols found.'}
          </ThemedText>
        </View>
      )}
    </ScrollView>
  );
}

function FilterTab({ label, active, onPress, count }: {
  label: string;
  active: boolean;
  onPress: () => void;
  count: number;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.filterTab, active && styles.filterTabActive]}
    >
      <ThemedText
        variant="caption"
        style={[styles.filterLabel, active && styles.filterLabelActive]}
      >
        {label} ({count})
      </ThemedText>
    </TouchableOpacity>
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
  },
  filterScroll: {
    marginBottom: 16,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  filterLabelActive: {
    color: '#fff',
    fontWeight: '600',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
});
