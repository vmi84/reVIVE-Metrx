import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../ui/ThemedText';
import { Card } from '../ui/Card';
import { ProtocolPrescription, getTierColor } from '../../lib/types/iaci';
import { COLORS } from '../../lib/utils/constants';

interface ProtocolCardProps {
  protocol: ProtocolPrescription;
}

export function ProtocolCard({ protocol }: ProtocolCardProps) {
  const tierColor = getTierColor(protocol.readinessTier);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <ThemedText variant="caption" style={styles.headerLabel}>
          PROTOCOL
        </ThemedText>
        <View style={[styles.classBadge, { backgroundColor: tierColor }]}>
          <ThemedText variant="caption" style={styles.classText}>
            Class {protocol.protocolClass}
          </ThemedText>
        </View>
      </View>
      <ThemedText variant="body" style={styles.explanation}>
        {protocol.explanation}
      </ThemedText>
      <View style={styles.modalities}>
        {protocol.recommendedModalities.slice(0, 5).map((slug, i) => (
          <View key={i} style={styles.modalityTag}>
            <ThemedText variant="caption" style={styles.modalityText}>
              {slug.replace(/-/g, ' ')}
            </ThemedText>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  classBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  classText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 11,
  },
  explanation: {
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  modalities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  modalityTag: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modalityText: {
    fontSize: 11,
    color: COLORS.primary,
    textTransform: 'capitalize',
  },
});
