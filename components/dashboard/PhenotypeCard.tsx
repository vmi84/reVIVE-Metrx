import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../ui/ThemedText';
import { Card } from '../ui/Card';
import { Phenotype } from '../../lib/types/iaci';
import { COLORS } from '../../lib/utils/constants';

interface PhenotypeCardProps {
  phenotype: Phenotype;
}

export function PhenotypeCard({ phenotype }: PhenotypeCardProps) {
  return (
    <Card style={styles.card}>
      <ThemedText variant="caption" style={styles.header}>
        CONDITION
      </ThemedText>
      <ThemedText variant="subtitle" style={styles.label}>
        {phenotype.label}
      </ThemedText>
      <ThemedText variant="body" style={styles.description}>
        {phenotype.description}
      </ThemedText>
      {phenotype.primaryLimiters.length > 0 && (
        <View style={styles.limiters}>
          {phenotype.primaryLimiters.map((limiter, i) => (
            <View key={i} style={styles.limiterTag}>
              <ThemedText variant="caption" style={styles.limiterText}>
                {limiter}
              </ThemedText>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
  },
  header: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  label: {
    marginBottom: 8,
  },
  description: {
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  limiters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  limiterTag: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  limiterText: {
    fontSize: 11,
    color: COLORS.warning,
  },
});
