import { useState } from 'react';
import { View, ScrollView, StyleSheet, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useWorkoutLogger } from '../hooks/use-workout-logger';
import { useWhoopSync } from '../hooks/use-whoop-sync';
import { ThemedText } from '../components/ui/ThemedText';
import { Button } from '../components/ui/Button';
import { Slider } from '../components/ui/Slider';
import { Card } from '../components/ui/Card';
import { COLORS } from '../lib/utils/constants';

const WORKOUT_TYPES = [
  'Easy Run', 'Tempo Run', 'Interval', 'Long Run', 'Fartlek',
  'Hill Repeats', 'Recovery Run', 'Cycling', 'Swimming',
  'Rowing', 'Strength', 'Mobility', 'Cross-Train',
];

export default function PostWorkout() {
  const { logWorkout } = useWorkoutLogger();
  const { syncPostWorkout } = useWhoopSync();
  const [selectedType, setSelectedType] = useState('');
  const [durationMin, setDurationMin] = useState('');
  const [rpe, setRpe] = useState(5);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!selectedType || !durationMin) return;
    setSubmitting(true);

    try {
      await logWorkout({
        workoutType: selectedType.toLowerCase().replace(/ /g, '_'),
        durationMs: parseInt(durationMin) * 60000,
        rpe,
        notes: notes || undefined,
      });

      // Try to sync Whoop post-workout data
      await syncPostWorkout();

      router.back();
    } catch (err) {
      console.error('Post-workout error:', err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <ThemedText variant="subtitle" style={styles.title}>Workout Type</ThemedText>
        <View style={styles.types}>
          {WORKOUT_TYPES.map((type) => (
            <Button
              key={type}
              title={type}
              variant={selectedType === type ? 'primary' : 'secondary'}
              onPress={() => setSelectedType(type)}
              style={styles.typeButton}
            />
          ))}
        </View>
      </Card>

      <Card style={styles.section}>
        <ThemedText variant="subtitle" style={styles.title}>Duration</ThemedText>
        <TextInput
          placeholder="Minutes"
          placeholderTextColor={COLORS.textMuted}
          value={durationMin}
          onChangeText={setDurationMin}
          keyboardType="numeric"
          style={styles.input}
        />
      </Card>

      <Card style={styles.section}>
        <Slider
          label={`RPE (Rate of Perceived Exertion): ${rpe}/10`}
          value={rpe}
          min={1}
          max={10}
          onChange={setRpe}
          labels={['Very Easy', 'Maximal']}
        />
      </Card>

      <Card style={styles.section}>
        <ThemedText variant="subtitle" style={styles.title}>Notes (Optional)</ThemedText>
        <TextInput
          placeholder="How did it feel?"
          placeholderTextColor={COLORS.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          style={[styles.input, styles.textArea]}
        />
      </Card>

      <Button
        title="Log Workout"
        onPress={handleSubmit}
        loading={submitting}
        disabled={!selectedType || !durationMin}
        style={styles.submit}
      />
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
  title: {
    marginBottom: 12,
  },
  section: {
    marginTop: 16,
  },
  types: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 12,
    height: 38,
  },
  input: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    color: COLORS.text,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  submit: {
    marginTop: 24,
  },
});
