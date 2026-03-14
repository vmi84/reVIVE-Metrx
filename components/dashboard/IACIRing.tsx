import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { ThemedText } from '../ui/ThemedText';
import { ReadinessTier, getTierColor, getTierLabel } from '../../lib/types/iaci';
import { COLORS } from '../../lib/utils/constants';

interface IACIRingProps {
  score: number;
  tier: ReadinessTier;
  size?: number;
}

export function IACIRing({ score, tier, size = 180 }: IACIRingProps) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const tierColor = getTierColor(tier);
  const center = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={COLORS.surfaceLight}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={tierColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${progress} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>
      <View style={styles.innerContent}>
        <ThemedText variant="score" color={tierColor}>
          {Math.round(score)}
        </ThemedText>
        <ThemedText variant="caption" style={[styles.tierLabel, { color: tierColor }]}>
          {getTierLabel(tier)}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerContent: {
    position: 'absolute',
    alignItems: 'center',
  },
  tierLabel: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: -4,
  },
});
