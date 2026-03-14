import { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Switch } from 'react-native';
import { router } from 'expo-router';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuthStore } from '../store/auth-store';
import { useDailyStore } from '../store/daily-store';
import { ThemedText } from '../components/ui/ThemedText';
import { Button } from '../components/ui/Button';
import { Slider } from '../components/ui/Slider';
import { BodyMap } from '../components/checkin/BodyMap';
import { Card } from '../components/ui/Card';
import { COLORS } from '../lib/utils/constants';
import { today, daysAgo } from '../lib/utils/date';

type Step = 1 | 2 | 3 | 4 | 5;

export default function MorningCheckin() {
  const { user } = useAuthStore();
  const { setCheckinCompleted } = useDailyStore();
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [preFilled, setPreFilled] = useState(false);

  // Step 1: Quick State
  const [overallEnergy, setOverallEnergy] = useState(3);
  const [sleepQuality, setSleepQuality] = useState(3);

  // Step 2: Body
  const [soreness, setSoreness] = useState<Record<string, number>>({});
  const [stiffness, setStiffness] = useState(2);
  const [heavyLegs, setHeavyLegs] = useState(false);

  // Step 3: Mind & Fuel
  const [motivation, setMotivation] = useState(3);
  const [stress, setStress] = useState(2);
  const [mentalFatigue, setMentalFatigue] = useState(2);

  // Step 4: Recovery Actions
  const [hydration, setHydration] = useState(6);
  const [electrolytes, setElectrolytes] = useState(false);
  const [proteinAdequate, setProteinAdequate] = useState(true);
  const [lateCaffeine, setLateCaffeine] = useState(false);
  const [lateAlcohol, setLateAlcohol] = useState(false);

  // Step 5: Flags
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
        setHydration(data.hydration_glasses ?? 6);
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
    if (!user?.id) return;
    setSubmitting(true);

    try {
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
        hydration_glasses: hydration,
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

      setCheckinCompleted(true);
      router.back();
    } catch (err) {
      console.error('Check-in submit error:', err);
    } finally {
      setSubmitting(false);
    }
  }

  const isLastStep = step === 5;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Pre-fill banner */}
      {preFilled && (
        <View style={styles.banner}>
          <ThemedText variant="caption" color={COLORS.textSecondary} style={styles.bannerText}>
            Pre-filled with yesterday's responses. Adjust anything that changed.
          </ThemedText>
        </View>
      )}

      {/* Progress indicator */}
      <View style={styles.progress}>
        {[1, 2, 3, 4, 5].map((s) => (
          <View
            key={s}
            style={[styles.progressDot, s <= step && styles.progressDotActive]}
          />
        ))}
      </View>

      {step === 1 && (
        <Card>
          <ThemedText variant="subtitle" style={styles.stepTitle}>Quick State</ThemedText>
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
      )}

      {step === 2 && (
        <Card>
          <ThemedText variant="subtitle" style={styles.stepTitle}>Body</ThemedText>
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
      )}

      {step === 3 && (
        <Card>
          <ThemedText variant="subtitle" style={styles.stepTitle}>Mind & Fuel</ThemedText>
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
      )}

      {step === 4 && (
        <Card>
          <ThemedText variant="subtitle" style={styles.stepTitle}>Recovery Actions</ThemedText>
          <Slider
            label={`Hydration Yesterday (${hydration} glasses)`}
            value={hydration}
            min={0}
            max={12}
            onChange={setHydration}
            labels={['0', '12+']}
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
      )}

      {step === 5 && (
        <Card>
          <ThemedText variant="subtitle" style={styles.stepTitle}>Flags (Optional)</ThemedText>
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
      )}

      <View style={styles.buttons}>
        {step > 1 && (
          <Button
            title="Back"
            variant="secondary"
            onPress={() => setStep((step - 1) as Step)}
            style={styles.backButton}
          />
        )}
        <Button
          title={isLastStep ? 'Submit' : 'Next'}
          onPress={isLastStep ? handleSubmit : () => setStep((step + 1) as Step)}
          loading={submitting}
          style={styles.nextButton}
        />
      </View>
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
  progress: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  progressDot: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.surfaceLight,
  },
  progressDotActive: {
    backgroundColor: COLORS.primary,
  },
  stepTitle: {
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
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
});
