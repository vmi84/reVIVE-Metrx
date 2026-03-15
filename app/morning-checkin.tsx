import { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Switch } from 'react-native';
import { router } from 'expo-router';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuthStore } from '../store/auth-store';
import { useDailyStore } from '../store/daily-store';
import { ThemedText } from '../components/ui/ThemedText';
import { Button } from '../components/ui/Button';
import { Slider } from '../components/ui/Slider';
import { HydrationSlider } from '../components/ui/HydrationSlider';
import { BodyMap } from '../components/checkin/BodyMap';
import { Card } from '../components/ui/Card';
import { COLORS } from '../lib/utils/constants';
import { today, daysAgo } from '../lib/utils/date';

export default function MorningCheckin() {
  const { user } = useAuthStore();
  const { setCheckinCompleted, setCheckinData } = useDailyStore();
  const [submitting, setSubmitting] = useState(false);
  const [preFilled, setPreFilled] = useState(false);

  // Quick State
  const [overallEnergy, setOverallEnergy] = useState(3);
  const [sleepQuality, setSleepQuality] = useState(3);

  // Body
  const [soreness, setSoreness] = useState<Record<string, number>>({});
  const [stiffness, setStiffness] = useState(2);
  const [heavyLegs, setHeavyLegs] = useState(false);

  // Mind & Fuel
  const [motivation, setMotivation] = useState(3);
  const [stress, setStress] = useState(2);
  const [mentalFatigue, setMentalFatigue] = useState(2);

  // Recovery Actions
  const [hydrationLiters, setHydrationLiters] = useState(1.0);
  const [electrolytes, setElectrolytes] = useState(false);
  const [proteinAdequate, setProteinAdequate] = useState(true);
  const [lateCaffeine, setLateCaffeine] = useState(false);
  const [lateAlcohol, setLateAlcohol] = useState(false);

  // Flags
  const [isTraveling, setIsTraveling] = useState(false);
  const [giIssues, setGiIssues] = useState(1);

  // Pre-fill with yesterday's values
  useEffect(() => {
    async function loadYesterday() {
      if (!isSupabaseConfigured || !user?.id) return;

      try {
        const { data } = await supabase
          .from('subjective_entries')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', daysAgo(1))
          .eq('entry_type', 'morning')
          .single();

        if (!data) return;

        setOverallEnergy(data.overall_energy ?? 3);
        setSleepQuality(data.subjective_sleep_quality ?? 3);
        setSoreness((data.soreness as Record<string, number>) ?? {});
        setStiffness(data.stiffness ?? 2);
        setHeavyLegs(data.heavy_legs ?? false);
        setMotivation(data.motivation ?? 3);
        setStress(data.subjective_stress ?? 2);
        setMentalFatigue(data.mental_fatigue ?? 2);
        setHydrationLiters(data.hydration_liters ?? data.hydration_glasses ? (data.hydration_glasses ?? 6) * 0.25 : 1.0);
        setElectrolytes(data.electrolytes_taken ?? false);
        setProteinAdequate(data.protein_adequate ?? true);
        setLateCaffeine(data.late_caffeine ?? false);
        setLateAlcohol(data.late_alcohol ?? false);
        setIsTraveling(data.is_traveling ?? false);
        setGiIssues(data.gi_disruption ?? 1);
        setPreFilled(true);
      } catch {
        // No yesterday data — use defaults
      }
    }

    loadYesterday();
  }, [user?.id]);

  function handleRegionPress(region: string) {
    setSoreness(prev => {
      const current = prev[region] ?? 0;
      const next = current >= 4 ? 0 : current + 1;
      return { ...prev, [region]: next };
    });
  }

  async function handleSubmit() {
    setSubmitting(true);

    try {
      if (isSupabaseConfigured && user?.id) {
        await supabase.from('subjective_entries').upsert({
          user_id: user.id,
          date: today(),
          entry_type: 'morning',
          overall_energy: overallEnergy,
          subjective_sleep_quality: sleepQuality,
          soreness,
          stiffness,
          heavy_legs: heavyLegs,
          motivation,
          subjective_stress: stress,
          mental_fatigue: mentalFatigue,
          hydration_liters: hydrationLiters,
          hydration_glasses: Math.round(hydrationLiters / 0.25),
          electrolytes_taken: electrolytes,
          protein_adequate: proteinAdequate,
          late_caffeine: lateCaffeine,
          late_alcohol: lateAlcohol,
          is_traveling: isTraveling,
          gi_disruption: giIssues,
          willingness_to_train: motivation,
          mood: overallEnergy,
          concentration: 5 - mentalFatigue + 1,
        });
      }

      // Store check-in data for demo mode IACI computation
      setCheckinData({
        overallEnergy,
        sleepQuality,
        soreness,
        stiffness,
        heavyLegs,
        motivation,
        stress,
        mentalFatigue,
        hydrationLiters,
        electrolytes,
        proteinAdequate,
        lateCaffeine,
        lateAlcohol,
        isTraveling,
        giIssues,
      });

      setCheckinCompleted(true);
      // Use dismiss for modals, fallback to replace for safety
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/dashboard');
      }
    } catch (err) {
      console.error('Check-in submit error:', err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={true}
      bounces={true}
    >
      {/* Pre-fill banner */}
      {preFilled && (
        <View style={styles.banner}>
          <ThemedText variant="caption" color={COLORS.textSecondary} style={styles.bannerText}>
            Pre-filled with yesterday's responses. Adjust anything that changed.
          </ThemedText>
        </View>
      )}

      {/* Section 1: Quick State */}
      <Card style={styles.section}>
        <ThemedText variant="subtitle" style={styles.sectionTitle}>Quick State</ThemedText>
        <Slider
          label="Overall Energy"
          value={overallEnergy}
          onChange={setOverallEnergy}
          labels={['Very Low', 'Excellent']}
        />
        <Slider
          label="Sleep Quality"
          value={sleepQuality}
          onChange={setSleepQuality}
          labels={['Terrible', 'Great']}
        />
      </Card>

      {/* Section 2: Body */}
      <Card style={styles.section}>
        <ThemedText variant="subtitle" style={styles.sectionTitle}>Body</ThemedText>
        <BodyMap soreness={soreness} onRegionPress={handleRegionPress} />
        <Slider
          label="General Stiffness"
          value={stiffness}
          onChange={setStiffness}
          labels={['None', 'Very Stiff']}
        />
        <View style={styles.toggleRow}>
          <ThemedText variant="body">Heavy Legs</ThemedText>
          <Switch
            value={heavyLegs}
            onValueChange={setHeavyLegs}
            trackColor={{ true: COLORS.primary }}
          />
        </View>
      </Card>

      {/* Section 3: Mind & Fuel */}
      <Card style={styles.section}>
        <ThemedText variant="subtitle" style={styles.sectionTitle}>Mind & Fuel</ThemedText>
        <Slider
          label="Motivation"
          value={motivation}
          onChange={setMotivation}
          labels={['None', 'Very High']}
        />
        <Slider
          label="Life Stress"
          value={stress}
          onChange={setStress}
          labels={['Low', 'Extreme']}
        />
        <Slider
          label="Mental Fatigue"
          value={mentalFatigue}
          onChange={setMentalFatigue}
          labels={['Clear', 'Foggy']}
        />
      </Card>

      {/* Section 4: Recovery Actions */}
      <Card style={styles.section}>
        <ThemedText variant="subtitle" style={styles.sectionTitle}>Recovery Actions</ThemedText>
        <HydrationSlider
          value={hydrationLiters}
          onChange={setHydrationLiters}
        />
        <View style={styles.toggleRow}>
          <ThemedText variant="body">Electrolytes taken</ThemedText>
          <Switch value={electrolytes} onValueChange={setElectrolytes} trackColor={{ true: COLORS.primary }} />
        </View>
        <View style={styles.toggleRow}>
          <ThemedText variant="body">Adequate protein</ThemedText>
          <Switch value={proteinAdequate} onValueChange={setProteinAdequate} trackColor={{ true: COLORS.primary }} />
        </View>
        <View style={styles.toggleRow}>
          <ThemedText variant="body">Late caffeine</ThemedText>
          <Switch value={lateCaffeine} onValueChange={setLateCaffeine} trackColor={{ true: COLORS.primary }} />
        </View>
        <View style={styles.toggleRow}>
          <ThemedText variant="body">Late alcohol</ThemedText>
          <Switch value={lateAlcohol} onValueChange={setLateAlcohol} trackColor={{ true: COLORS.primary }} />
        </View>
      </Card>

      {/* Section 5: Flags */}
      <Card style={styles.section}>
        <ThemedText variant="subtitle" style={styles.sectionTitle}>Flags (Optional)</ThemedText>
        <View style={styles.toggleRow}>
          <ThemedText variant="body">Currently traveling</ThemedText>
          <Switch value={isTraveling} onValueChange={setIsTraveling} trackColor={{ true: COLORS.primary }} />
        </View>
        <Slider
          label="GI Issues"
          value={giIssues}
          onChange={setGiIssues}
          labels={['None', 'Severe']}
        />
      </Card>

      {/* Submit */}
      <Button
        title="Submit Check-In"
        onPress={handleSubmit}
        loading={submitting}
        style={styles.submitButton}
      />

      <View style={styles.bottomSpacer} />
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
    paddingBottom: 100,
  },
  banner: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  bannerText: {
    fontSize: 12,
    lineHeight: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  bottomSpacer: {
    height: 40,
  },
});
