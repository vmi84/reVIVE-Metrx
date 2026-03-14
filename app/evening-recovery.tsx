import { useState } from 'react';
import { View, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import { ThemedText } from '@/components/ui/ThemedText';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import { Card } from '@/components/ui/Card';
import { COLORS, BODY_REGIONS } from '@/lib/utils/constants';
import { today } from '@/lib/utils/date';

export default function EveningRecovery() {
  const { user } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);

  // Q1: How did your body feel today?
  const [bodyFeeling, setBodyFeeling] = useState(3);

  // Q2: Did you complete planned recovery?
  const [completedRecovery, setCompletedRecovery] = useState(false);

  // Q3: Evening energy level
  const [eveningEnergy, setEveningEnergy] = useState(3);

  // Q4: Any new pain or discomfort?
  const [painRegions, setPainRegions] = useState<string[]>([]);

  // Q5: Notes
  const [notes, setNotes] = useState('');

  function togglePainRegion(region: string) {
    setPainRegions((prev) =>
      prev.includes(region)
        ? prev.filter((r) => r !== region)
        : [...prev, region]
    );
  }

  async function handleSubmit() {
    if (!user?.id) return;
    setSubmitting(true);

    try {
      await supabase.from('subjective_entries').upsert({
        user_id: user.id,
        date: today(),
        entry_type: 'evening',
        overall_energy: eveningEnergy,
        body_feeling: bodyFeeling,
        completed_recovery: completedRecovery,
        pain_regions: painRegions.length > 0 ? painRegions : null,
        notes: notes || null,
        mood: bodyFeeling,
        willingness_to_train: eveningEnergy,
      });

      router.back();
    } catch (err) {
      console.error('Evening check-in error:', err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Evening Recovery',
          presentation: 'modal',
          headerBackTitle: 'Cancel',
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Q1: Body Feeling */}
        <Card style={styles.section}>
          <Slider
            label="How did your body feel today?"
            value={bodyFeeling}
            onChange={setBodyFeeling}
            labels={['Very Poor', 'Excellent']}
          />
        </Card>

        {/* Q2: Completed Recovery */}
        <Card style={styles.section}>
          <View style={styles.toggleRow}>
            <ThemedText variant="body">Did you complete planned recovery?</ThemedText>
            <Switch
              value={completedRecovery}
              onValueChange={setCompletedRecovery}
              trackColor={{ true: COLORS.primary, false: COLORS.surfaceLight }}
            />
          </View>
        </Card>

        {/* Q3: Evening Energy */}
        <Card style={styles.section}>
          <Slider
            label="Evening energy level"
            value={eveningEnergy}
            onChange={setEveningEnergy}
            labels={['Depleted', 'Energized']}
          />
        </Card>

        {/* Q4: Pain / Discomfort Region Selector */}
        <Card style={styles.section}>
          <ThemedText variant="body" style={styles.questionLabel}>
            Any new pain or discomfort?
          </ThemedText>
          <View style={styles.regionGrid}>
            {BODY_REGIONS.map((region) => {
              const selected = painRegions.includes(region);
              return (
                <TouchableOpacity
                  key={region}
                  onPress={() => togglePainRegion(region)}
                  style={[
                    styles.regionChip,
                    selected && styles.regionChipSelected,
                  ]}
                  activeOpacity={0.7}
                >
                  <ThemedText
                    variant="caption"
                    color={selected ? COLORS.text : COLORS.textSecondary}
                    style={styles.regionChipText}
                  >
                    {region.replace(/_/g, ' ')}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Q5: Notes */}
        <Card style={styles.section}>
          <ThemedText variant="body" style={styles.questionLabel}>
            Notes (optional)
          </ThemedText>
          <TextInput
            placeholder="Anything worth noting about today..."
            placeholderTextColor={COLORS.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={styles.textArea}
          />
        </Card>

        <Button
          title="Save Evening Check-In"
          onPress={handleSubmit}
          loading={submitting}
          style={styles.submitButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  questionLabel: {
    marginBottom: 12,
    fontWeight: '500',
  },
  regionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  regionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  regionChipSelected: {
    backgroundColor: COLORS.primary + '30',
    borderColor: COLORS.primary,
  },
  regionChipText: {
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  textArea: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    height: 80,
    paddingHorizontal: 16,
    paddingTop: 12,
    color: COLORS.text,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 8,
  },
});
