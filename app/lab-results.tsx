import { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TextInput } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth-store';
import { Card } from '../components/ui/Card';
import { ThemedText } from '../components/ui/ThemedText';
import { Button } from '../components/ui/Button';
import { COLORS } from '../lib/utils/constants';
import { today } from '../lib/utils/date';

interface LabMarker {
  id: string;
  name: string;
  abbreviation: string;
  unit: string;
  normalLow: number | null;
  normalHigh: number | null;
}

const DEFAULT_MARKERS: LabMarker[] = [
  { id: 'hscrp', name: 'High-Sensitivity C-Reactive Protein', abbreviation: 'hs-CRP', unit: 'mg/L', normalLow: 0, normalHigh: 3.0 },
  { id: 'ferritin', name: 'Ferritin', abbreviation: 'Ferritin', unit: 'ng/mL', normalLow: 30, normalHigh: 300 },
  { id: 'vitamind', name: 'Vitamin D (25-OH)', abbreviation: 'Vit D', unit: 'ng/mL', normalLow: 30, normalHigh: 100 },
  { id: 'ck', name: 'Creatine Kinase', abbreviation: 'CK', unit: 'U/L', normalLow: 30, normalHigh: 200 },
  { id: 'cortisol', name: 'Cortisol (AM)', abbreviation: 'Cortisol', unit: 'mcg/dL', normalLow: 6, normalHigh: 23 },
  { id: 'iron', name: 'Iron', abbreviation: 'Iron', unit: 'mcg/dL', normalLow: 60, normalHigh: 170 },
  { id: 'tibc', name: 'Total Iron Binding Capacity', abbreviation: 'TIBC', unit: 'mcg/dL', normalLow: 250, normalHigh: 370 },
];

export default function LabResults() {
  const { user } = useAuthStore();
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function updateValue(markerId: string, value: string) {
    setValues(prev => ({ ...prev, [markerId]: value }));
  }

  async function handleSubmit() {
    if (!user?.id) return;
    setSubmitting(true);

    try {
      const entries = Object.entries(values)
        .filter(([, val]) => val.trim() !== '')
        .map(([markerId, val]) => ({
          user_id: user.id,
          marker_id: markerId,
          value: parseFloat(val),
          date: today(),
          source: 'manual',
        }));

      if (entries.length > 0) {
        await supabase.from('inflammation_entries').insert(entries);
      }

      setValues({});
    } catch (err) {
      console.error('Lab results submit error:', err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ThemedText variant="body" color={COLORS.textSecondary} style={styles.intro}>
        Enter your latest lab results. These values feed into the inflammation scoring system and help refine recovery recommendations.
      </ThemedText>

      {DEFAULT_MARKERS.map((marker) => (
        <Card key={marker.id} style={styles.markerCard}>
          <View style={styles.markerHeader}>
            <ThemedText variant="body" style={styles.markerName}>
              {marker.abbreviation}
            </ThemedText>
            <ThemedText variant="caption" color={COLORS.textMuted}>
              {marker.unit}
            </ThemedText>
          </View>
          <ThemedText variant="caption" color={COLORS.textSecondary} style={styles.fullName}>
            {marker.name}
          </ThemedText>
          <View style={styles.inputRow}>
            <TextInput
              placeholder="Value"
              placeholderTextColor={COLORS.textMuted}
              value={values[marker.id] ?? ''}
              onChangeText={(v) => updateValue(marker.id, v)}
              keyboardType="decimal-pad"
              style={styles.input}
            />
            {marker.normalLow != null && marker.normalHigh != null && (
              <ThemedText variant="caption" color={COLORS.textMuted}>
                Normal: {marker.normalLow}-{marker.normalHigh}
              </ThemedText>
            )}
          </View>
        </Card>
      ))}

      <Button
        title="Save Lab Results"
        onPress={handleSubmit}
        loading={submitting}
        disabled={Object.values(values).every(v => v.trim() === '')}
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
  intro: {
    marginBottom: 16,
    lineHeight: 20,
  },
  markerCard: {
    marginBottom: 10,
  },
  markerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  markerName: {
    fontWeight: '600',
  },
  fullName: {
    marginTop: 2,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    height: 42,
    paddingHorizontal: 12,
    color: COLORS.text,
    fontSize: 16,
  },
  submit: {
    marginTop: 16,
  },
});
