import { useState, useRef } from 'react';
import { View, StyleSheet, PanResponder, LayoutChangeEvent } from 'react-native';
import { ThemedText } from './ThemedText';
import { COLORS } from '../../lib/utils/constants';

interface HydrationSliderProps {
  value: number;
  onChange: (liters: number) => void;
  maxLiters?: number;
}

const GRADUATIONS = [0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
const MAX_DEFAULT = 2.0;

export function HydrationSlider({ value, onChange, maxLiters = MAX_DEFAULT }: HydrationSliderProps) {
  const trackWidth = useRef(0);
  const [dragging, setDragging] = useState(false);

  function clampValue(raw: number): number {
    const snapped = Math.round(raw * 4) / 4; // snap to 0.25L increments
    return Math.max(0, Math.min(maxLiters, snapped));
  }

  function xToValue(x: number): number {
    if (trackWidth.current <= 0) return value;
    const ratio = x / trackWidth.current;
    return clampValue(ratio * maxLiters);
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        setDragging(true);
        const x = evt.nativeEvent.locationX;
        onChange(xToValue(x));
      },
      onPanResponderMove: (evt) => {
        const x = evt.nativeEvent.locationX;
        onChange(xToValue(x));
      },
      onPanResponderRelease: () => {
        setDragging(false);
      },
    })
  ).current;

  const fraction = Math.max(0, Math.min(1, value / maxLiters));

  function onTrackLayout(e: LayoutChangeEvent) {
    trackWidth.current = e.nativeEvent.layout.width;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText variant="body" style={styles.label}>Hydration Yesterday</ThemedText>
        <ThemedText variant="body" style={[styles.valueText, dragging && styles.valueTextActive]}>
          {value.toFixed(2)}L
        </ThemedText>
      </View>

      <View style={styles.trackContainer} onLayout={onTrackLayout} {...panResponder.panHandlers}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${fraction * 100}%` }]} />
        </View>
        <View style={[styles.thumb, { left: `${fraction * 100}%` }]} />
      </View>

      <View style={styles.graduations}>
        {GRADUATIONS.map((g) => (
          <View key={g} style={[styles.graduation, { left: `${(g / maxLiters) * 100}%` }]}>
            <View style={[styles.tick, g % 0.5 === 0 && styles.tickMajor]} />
            {g % 0.5 === 0 && (
              <ThemedText variant="caption" style={styles.tickLabel}>
                {g.toFixed(1)}L
              </ThemedText>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontWeight: '500',
  },
  valueText: {
    fontWeight: '700',
    fontSize: 18,
    color: COLORS.primary,
  },
  valueTextActive: {
    color: COLORS.primary,
  },
  trackContainer: {
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  track: {
    height: 6,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  thumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: '#fff',
    marginLeft: -0,
    top: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  graduations: {
    height: 30,
    position: 'relative',
    marginHorizontal: 12,
  },
  graduation: {
    position: 'absolute',
    alignItems: 'center',
  },
  tick: {
    width: 1,
    height: 6,
    backgroundColor: COLORS.textMuted,
  },
  tickMajor: {
    height: 10,
    width: 1.5,
    backgroundColor: COLORS.textSecondary,
  },
  tickLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
