/**
 * Morning Check-In — Smart 2-Tier Flow
 *
 * Tier 1: 4 quick color-coded ratings (~10 seconds)
 * Tier 2: Optional expandable detail sections for full data
 *
 * Pre-fills from yesterday. Quick-only mode infers missing detail.
 */

import { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Switch, TouchableOpacity, LayoutAnimation } from 'react-native';
import { router } from 'expo-router';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuthStore } from '../store/auth-store';
import { useDailyStore } from '../store/daily-store';
import { SegmentedRating } from '../components/checkin/SegmentedRating';
import { DetailSection } from '../components/checkin/DetailSection';
import { BodyMap } from '../components/checkin/BodyMap';
import { Slider } from '../components/ui/Slider';
import { HydrationSlider } from '../components/ui/HydrationSlider';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ThemedText } from '../components/ui/ThemedText';
import { COLORS, SORENESS_LABELS } from '../lib/utils/constants';
import { today, daysAgo } from '../lib/utils/date';

export default function MorningCheckin() {
  const { user } = useAuthStore();
  const { setCheckinCompleted, setCheckinData } = useDailyStore();
  const [submitting, setSubmitting] = useState(false);
  const [preFilled, setPreFilled] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  // ── Tier 1: Quick Core ──
  const [energy, setEnergy] = useState(3);
  const [sleep, setSleep] = useState(3);
  const [soreness, setSorenessQuick] = useState(3); // 1=none, 5=severe (inverted for display)
  const [readiness, setReadiness] = useState(3);

  // ── Tier 2: Detail ──
  const [sorenessMap, setSorenessMap] = useState<Record<string, number>>({});
  const [stiffness, setStiffness] = useState(2);
  const [heavyLegs, setHeavyLegs] = useState(false);
  const [motivation, setMotivation] = useState(3);
  const [stress, setStress] = useState(2);
  const [mentalFatigue, setMentalFatigue] = useState(2);
  const [hydrationLiters, setHydrationLiters] = useState(1.0);
  const [electrolytes, setElectrolytes] = useState(false);
  const [proteinAdequate, setProteinAdequate] = useState(true);
  const [lateCaffeine, setLateCaffeine] = useState(false);
  const [lateAlcohol, setLateAlcohol] = useState(false);
  const [isTraveling, setIsTraveling] = useState(false);
  const [giIssues, setGiIssues] = useState(1);

  // Illness
  const [feelingIll, setFeelingIll] = useState(false);
  const [illnessSymptoms, setIllnessSymptoms] = useState<string[]>([]);

  // Track if user opened any detail section
  const [detailTouched, setDetailTouched] = useState(false);

  // ── Pre-fill from yesterday ──
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

        setEnergy(data.overall_energy ?? 3);
        setSleep(data.subjective_sleep_quality ?? 3);
        setStiffness(data.stiffness ?? 2);
        setSorenessQuick(data.stiffness ?? 2); // approximate from stiffness
        setHeavyLegs(data.heavy_legs ?? false);
        setMotivation(data.motivation ?? 3);
        setReadiness(data.motivation ?? 3); // approximate from motivation
        setStress(data.subjective_stress ?? 2);
        setMentalFatigue(data.mental_fatigue ?? 2);
        setSorenessMap((data.soreness as Record<string, number>) ?? {});
        setHydrationLiters(data.hydration_liters ?? 1.0);
        setElectrolytes(data.electrolytes_taken ?? false);
        setProteinAdequate(data.protein_adequate ?? true);
        setLateCaffeine(data.late_caffeine ?? false);
        setLateAlcohol(data.late_alcohol ?? false);
        setIsTraveling(data.is_traveling ?? false);
        setGiIssues(data.gi_disruption ?? 1);
        setPreFilled(true);
      } catch {
        // No yesterday data
      }
    }
    loadYesterday();
  }, [user?.id]);

  function handleRegionPress(region: string) {
    setDetailTouched(true);
    setSorenessMap(prev => {
      const current = prev[region] ?? 0;
      const next = current >= 4 ? 0 : current + 1;
      return { ...prev, [region]: next };
    });
  }

  // ── Summary strings for collapsed sections ──
  function bodySummary(): string {
    const regions = Object.values(sorenessMap).filter(v => v > 0);
    const soreCount = regions.length;
    const stiffLabel = stiffness <= 2 ? 'Limber' : stiffness <= 3 ? 'Stiff' : 'Very stiff';
    if (soreCount === 0) return `No soreness · ${stiffLabel}`;
    return `${soreCount} sore region${soreCount > 1 ? 's' : ''} · ${stiffLabel}`;
  }

  function mindSummary(): string {
    const motLabel = motivation >= 4 ? 'Motivated' : motivation >= 3 ? 'OK' : 'Low drive';
    const stressLabel = stress <= 2 ? 'Low stress' : stress <= 3 ? 'Moderate stress' : 'High stress';
    return `${motLabel} · ${stressLabel}`;
  }

  function nutritionSummary(): string {
    const parts = [`${hydrationLiters.toFixed(1)}L`];
    if (proteinAdequate) parts.push('Protein ✓');
    if (lateCaffeine) parts.push('Late caffeine');
    if (lateAlcohol) parts.push('Late alcohol');
    return parts.join(' · ');
  }

  function flagsSummary(): string {
    const parts: string[] = [];
    if (feelingIll) parts.push('Illness');
    if (isTraveling) parts.push('Traveling');
    if (giIssues > 1) parts.push(`GI: ${giIssues}/5`);
    return parts.length > 0 ? parts.join(' · ') : '—';
  }

  const ILLNESS_OPTIONS = ['Sore throat', 'Congestion', 'Sneezing', 'Cough', 'Fever', 'Body aches', 'Headache', 'Fatigue/malaise'];

  function toggleSymptom(symptom: string) {
    setDetailTouched(true);
    setIllnessSymptoms(prev =>
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom],
    );
  }

  // ── Submit ──
  async function handleSubmit() {
    setSubmitting(true);
    const quickOnly = !detailTouched && !showDetail;

    try {
      // Map quick inputs to full data when detail not provided
      const finalEnergy = quickOnly ? energy : energy;
      const finalMotivation = detailTouched ? motivation : energy; // energy proxies motivation
      const finalStress = detailTouched ? stress : (6 - readiness); // readiness inverse → stress
      const finalMentalFatigue = detailTouched ? mentalFatigue : (6 - readiness);
      const finalStiffness = detailTouched ? stiffness : soreness;
      const finalSoreness = detailTouched ? sorenessMap : {};

      if (isSupabaseConfigured && user?.id) {
        await supabase.from('subjective_entries').upsert({
          user_id: user.id,
          date: today(),
          entry_type: 'morning',
          overall_energy: finalEnergy,
          subjective_sleep_quality: sleep,
          soreness: finalSoreness,
          stiffness: finalStiffness,
          heavy_legs: heavyLegs,
          motivation: finalMotivation,
          subjective_stress: finalStress,
          mental_fatigue: finalMentalFatigue,
          hydration_liters: hydrationLiters,
          hydration_glasses: Math.round(hydrationLiters / 0.25),
          electrolytes_taken: electrolytes,
          protein_adequate: proteinAdequate,
          late_caffeine: lateCaffeine,
          late_alcohol: lateAlcohol,
          is_traveling: isTraveling,
          gi_disruption: giIssues,
          illness_symptoms: feelingIll ? illnessSymptoms : [],
          willingness_to_train: finalMotivation,
          mood: finalEnergy,
          concentration: 5 - finalMentalFatigue + 1,
        });
      }

      setCheckinData({
        overallEnergy: finalEnergy,
        sleepQuality: sleep,
        soreness: finalSoreness,
        stiffness: finalStiffness,
        heavyLegs,
        motivation: finalMotivation,
        stress: finalStress,
        mentalFatigue: finalMentalFatigue,
        hydrationLiters,
        electrolytes,
        proteinAdequate,
        lateCaffeine,
        lateAlcohol,
        isTraveling,
        giIssues,
        readiness,
        quickCheckInOnly: quickOnly,
        feelingIll,
        illnessSymptoms: feelingIll ? illnessSymptoms : [],
      });

      setCheckinCompleted(true);
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

  const toggleDetail = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowDetail(!showDetail);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      {/* Pre-fill banner */}
      {preFilled && (
        <View style={styles.banner}>
          <ThemedText variant="caption" color={COLORS.textSecondary}>
            Pre-filled from yesterday. Adjust what changed.
          </ThemedText>
        </View>
      )}

      {/* ═══ Tier 1: Quick Core ═══ */}
      <Card style={styles.quickCard}>
        <ThemedText variant="subtitle" style={styles.quickTitle}>
          How are you today?
        </ThemedText>

        <SegmentedRating label="Energy" value={energy} onChange={setEnergy} />
        <SegmentedRating label="Sleep" value={sleep} onChange={setSleep} />
        <SegmentedRating label="Soreness" value={soreness} onChange={setSorenessQuick} />
        <SegmentedRating label="Readiness" value={readiness} onChange={setReadiness} />

        <ThemedText variant="caption" color={COLORS.textMuted} style={styles.legend}>
          1 = Poor    3 = Average    5 = Excellent
        </ThemedText>

        <Button
          title="Done"
          onPress={handleSubmit}
          loading={submitting}
          style={styles.doneButton}
        />

        <TouchableOpacity onPress={toggleDetail} style={styles.moreLink}>
          <ThemedText variant="caption" color={COLORS.textMuted}>
            {showDetail ? 'Hide detail ▴' : 'More detail ▾'}
          </ThemedText>
        </TouchableOpacity>
      </Card>

      {/* ═══ Tier 2: Detail Sections ═══ */}
      {showDetail && (
        <Card style={styles.detailCard}>
          <DetailSection title="Body" summary={bodySummary()}>
            <BodyMap soreness={sorenessMap} onRegionPress={handleRegionPress} />
            <Slider label="Stiffness" value={stiffness} onChange={(v) => { setStiffness(v); setDetailTouched(true); }} labels={['None', 'Very Stiff']} />
            <View style={styles.toggleRow}>
              <ThemedText variant="body">Heavy Legs</ThemedText>
              <Switch value={heavyLegs} onValueChange={(v) => { setHeavyLegs(v); setDetailTouched(true); }} trackColor={{ true: COLORS.primary }} />
            </View>
          </DetailSection>

          <DetailSection title="Mind" summary={mindSummary()}>
            <Slider label="Motivation" value={motivation} onChange={(v) => { setMotivation(v); setDetailTouched(true); }} labels={['None', 'Very High']} />
            <Slider label="Life Stress" value={stress} onChange={(v) => { setStress(v); setDetailTouched(true); }} labels={['Low', 'Extreme']} />
            <Slider label="Mental Fatigue" value={mentalFatigue} onChange={(v) => { setMentalFatigue(v); setDetailTouched(true); }} labels={['Clear', 'Foggy']} />
          </DetailSection>

          <DetailSection title="Nutrition" summary={nutritionSummary()}>
            <HydrationSlider value={hydrationLiters} onChange={(v) => { setHydrationLiters(v); setDetailTouched(true); }} />
            <View style={styles.toggleRow}>
              <ThemedText variant="body">Electrolytes</ThemedText>
              <Switch value={electrolytes} onValueChange={(v) => { setElectrolytes(v); setDetailTouched(true); }} trackColor={{ true: COLORS.primary }} />
            </View>
            <View style={styles.toggleRow}>
              <ThemedText variant="body">Adequate Protein</ThemedText>
              <Switch value={proteinAdequate} onValueChange={(v) => { setProteinAdequate(v); setDetailTouched(true); }} trackColor={{ true: COLORS.primary }} />
            </View>
            <View style={styles.toggleRow}>
              <ThemedText variant="body">Late Caffeine</ThemedText>
              <Switch value={lateCaffeine} onValueChange={(v) => { setLateCaffeine(v); setDetailTouched(true); }} trackColor={{ true: COLORS.primary }} />
            </View>
            <View style={styles.toggleRow}>
              <ThemedText variant="body">Late Alcohol</ThemedText>
              <Switch value={lateAlcohol} onValueChange={(v) => { setLateAlcohol(v); setDetailTouched(true); }} trackColor={{ true: COLORS.primary }} />
            </View>
          </DetailSection>

          <DetailSection title="Flags" summary={flagsSummary()}>
            <View style={styles.toggleRow}>
              <ThemedText variant="body">Feeling ill</ThemedText>
              <Switch value={feelingIll} onValueChange={(v) => { setFeelingIll(v); setDetailTouched(true); if (!v) setIllnessSymptoms([]); }} trackColor={{ true: COLORS.error }} />
            </View>
            {feelingIll && (
              <View style={styles.symptomGrid}>
                <ThemedText variant="caption" color={COLORS.textMuted} style={{ marginBottom: 6 }}>
                  Select symptoms:
                </ThemedText>
                <View style={styles.chipRow}>
                  {ILLNESS_OPTIONS.map((s) => {
                    const active = illnessSymptoms.includes(s);
                    return (
                      <TouchableOpacity
                        key={s}
                        onPress={() => toggleSymptom(s)}
                        style={[styles.symptomChip, active && styles.symptomChipActive]}
                      >
                        <ThemedText
                          variant="caption"
                          style={[styles.symptomText, active && styles.symptomTextActive]}
                        >
                          {s}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
            <View style={styles.toggleRow}>
              <ThemedText variant="body">Traveling</ThemedText>
              <Switch value={isTraveling} onValueChange={(v) => { setIsTraveling(v); setDetailTouched(true); }} trackColor={{ true: COLORS.primary }} />
            </View>
            <Slider label="GI Issues" value={giIssues} onChange={(v) => { setGiIssues(v); setDetailTouched(true); }} labels={['None', 'Severe']} />
          </DetailSection>
        </Card>
      )}

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
    paddingBottom: 60,
  },
  banner: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  quickCard: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  quickTitle: {
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 18,
    fontWeight: '700',
  },
  legend: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  doneButton: {
    marginTop: 16,
  },
  moreLink: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailCard: {
    marginTop: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  symptomGrid: {
    paddingVertical: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  symptomChip: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  symptomChipActive: {
    backgroundColor: COLORS.error + '20',
    borderColor: COLORS.error,
  },
  symptomText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  symptomTextActive: {
    color: COLORS.error,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
});
