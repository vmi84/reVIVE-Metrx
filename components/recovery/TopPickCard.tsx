import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '../ui/ThemedText';
import { Card } from '../ui/Card';
import { RankedProtocol } from '../../hooks/use-protocols';
import { COLORS } from '../../lib/utils/constants';

interface TopPickCardProps {
  protocol: RankedProtocol;
  onPress: () => void;
  accentColor: string;
}

function formatLabel(value: string): string {
  return value
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function TopPickCard({ protocol, onPress, accentColor }: TopPickCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={[styles.card, { borderLeftColor: accentColor }]}>
        <View style={styles.header}>
          <View style={[styles.pickBadge, { backgroundColor: accentColor + '20' }]}>
            <ThemedText variant="caption" style={[styles.pickBadgeText, { color: accentColor }]}>
              #1 Pick
            </ThemedText>
          </View>
          <ThemedText variant="caption" style={styles.matchLabel}>
            Best match for your recovery
          </ThemedText>
        </View>

        <ThemedText variant="subtitle" style={styles.name}>
          {protocol.name}
        </ThemedText>

        {protocol.doseSweetSpot ? (
          <ThemedText variant="caption" color={COLORS.textSecondary} style={styles.dose}>
            Sweet spot: {protocol.doseSweetSpot}
          </ThemedText>
        ) : null}

        {/* Targeted subsystems */}
        {protocol.iaciSubsystemsTargeted.length > 0 && (
          <View style={styles.systems}>
            <ThemedText variant="caption" color={COLORS.textMuted} style={styles.systemsLabel}>
              Targets:
            </ThemedText>
            <View style={styles.pillRow}>
              {protocol.iaciSubsystemsTargeted.map((sys) => (
                <View key={sys} style={[styles.pill, { backgroundColor: accentColor + '15' }]}>
                  <ThemedText variant="caption" style={[styles.pillText, { color: accentColor }]}>
                    {formatLabel(sys)}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderLeftWidth: 4,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  pickBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pickBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  matchLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    flex: 1,
  },
  name: {
    fontWeight: '700',
    marginBottom: 4,
  },
  dose: {
    marginBottom: 8,
  },
  systems: {
    marginTop: 4,
  },
  systemsLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
