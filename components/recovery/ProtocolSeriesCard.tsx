import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '../ui/ThemedText';
import { Card } from '../ui/Card';
import { RecoveryProtocol } from '../../lib/types/protocols';
import { COLORS } from '../../lib/utils/constants';

interface ProtocolSeriesCardProps {
  protocol: RecoveryProtocol;
  onPress: () => void;
  isRecommended?: boolean;
}

const EVIDENCE_ICONS: Record<string, string> = {
  strong: '■',
  moderate: '▲',
  emerging: '○',
};

export function ProtocolSeriesCard({ protocol, onPress, isRecommended }: ProtocolSeriesCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={[styles.card, isRecommended && styles.recommended]}>
        <View style={styles.header}>
          <ThemedText variant="body" style={styles.name}>
            {protocol.name}
          </ThemedText>
          {protocol.evidenceLevel && (
            <ThemedText variant="caption" style={styles.evidence}>
              {EVIDENCE_ICONS[protocol.evidenceLevel] ?? '?'} {protocol.evidenceLevel}
            </ThemedText>
          )}
        </View>
        <View style={styles.meta}>
          <View style={styles.tag}>
            <ThemedText variant="caption" style={styles.tagText}>
              {protocol.series.replace(/_/g, ' ')}
            </ThemedText>
          </View>
          <View style={styles.tag}>
            <ThemedText variant="caption" style={styles.tagText}>
              {protocol.modalityType}
            </ThemedText>
          </View>
          {protocol.cnsLowAvoid && (
            <View style={[styles.tag, styles.warningTag]}>
              <ThemedText variant="caption" style={styles.warningText}>
                CNS LOW: AVOID
              </ThemedText>
            </View>
          )}
        </View>
        {protocol.doseSweetSpot && (
          <ThemedText variant="caption" style={styles.dose}>
            Sweet spot: {protocol.doseSweetSpot}
          </ThemedText>
        )}
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
  },
  recommended: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  name: {
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  evidence: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  tag: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  warningTag: {
    backgroundColor: '#3D1F00',
  },
  warningText: {
    fontSize: 10,
    color: COLORS.warning,
    fontWeight: '600',
  },
  dose: {
    color: COLORS.textMuted,
    marginTop: 4,
  },
});
