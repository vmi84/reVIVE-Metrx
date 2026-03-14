import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { COLORS } from '../../lib/utils/constants';

interface SliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  labels?: string[];
  onChange: (value: number) => void;
}

export function Slider({ label, value, min = 1, max = 5, labels, onChange }: SliderProps) {
  const steps = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <View style={styles.container}>
      <ThemedText variant="body" style={styles.label}>{label}</ThemedText>
      <View style={styles.track}>
        {steps.map((step) => (
          <TouchableOpacity
            key={step}
            onPress={() => onChange(step)}
            style={[
              styles.dot,
              step <= value && styles.dotActive,
            ]}
          >
            <View style={[
              styles.dotInner,
              step <= value && styles.dotInnerActive,
            ]} />
          </TouchableOpacity>
        ))}
      </View>
      {labels && (
        <View style={styles.labelRow}>
          <ThemedText variant="caption">{labels[0]}</ThemedText>
          <ThemedText variant="caption">{labels[labels.length - 1]}</ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  track: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  dot: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: {},
  dotInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  dotInnerActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
});
