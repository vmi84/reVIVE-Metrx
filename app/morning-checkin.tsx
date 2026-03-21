/**
 * Morning Check-In — Smart 2-Tier Flow
 *
 * Tier 1: 4 quick color-coded ratings (~10 seconds)
 * Tier 2: Optional expandable detail sections for full data
 *
 * Pre-fills from yesterday. Quick-only mode infers missing detail.
 */

import { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, LayoutAnimation, TextInput } from 'react-native';
import { router } from 'expo-router';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuthStore } from '../store/auth-store';
import { useDailyStore } from '../store/daily-store';
import { SegmentedRating } from '../components/checkin/SegmentedRating';
import { DetailSection } from '../components/checkin/DetailSection';
import { BodyMap } from '../components/checkin/BodyMap';
import { YesNoButton } from '../components/checkin/YesNoButton';
import { isConcussionActive } from '../lib/engine/subsystems/neurological';
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
  const [showDetail, setShowDetail] = useState(true); // Start expanded
  const [yesterdayWasIll, setYesterdayWasIll] = useState(false);

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
  const [electrolyteServings, setElectrolyteServings] = useState('');
  const [cramping, setCramping] = useState(false);
  const [crampingLocation, setCrampingLocation] = useState('');
  const [proteinAdequate, setProteinAdequate] = useState(true);
  const [proteinGrams, setProteinGrams] = useState('');
  const [lateCaffeine, setLateCaffeine] = useState(false);
  const [lateAlcohol, setLateAlcohol] = useState(false);
  const [isTraveling, setIsTraveling] = useState(false);
  const [giIssues, setGiIssues] = useState(1);

  // Illness
  const [feelingIll, setFeelingIll] = useState(false);
  const [illnessSymptoms, setIllnessSymptoms] = useState<string[]>([]);

  // Heat-related illness
  const [heatIllness, setHeatIllness] = useState(false);
  const [heatSymptoms, setHeatSymptoms] = useState<string[]>([]);

  // ── Neurological ──
  const [cognitiveClarity, setCognitiveClarity] = useState(3);
  const [reactionTimeSharpness, setReactionTimeSharpness] = useState(3);
  const [coordinationBalance, setCoordinationBalance] = useState(3);
  const [headachePressure, setHeadachePressure] = useState(false);
  const [headacheSeverity, setHeadacheSeverity] = useState(1);
  const [dizzinessVertigo, setDizzinessVertigo] = useState(false);
  const [numbnessTingling, setNumbnessTingling] = useState(false);
  const [numbnessTinglingLocation, setNumbnessTinglingLocation] = useState('');
  const [lightNoiseSensitivity, setLightNoiseSensitivity] = useState(false);
  const [recentHeadImpact, setRecentHeadImpact] = useState(false);
  const [daysSinceHeadImpact, setDaysSinceHeadImpact] = useState(0);
  const [visualDisturbance, setVisualDisturbance] = useState(false);

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

        // If yesterday had illness, prompt "still feeling ill?"
        const yesterdayIll = data.illness_symptoms && Array.isArray(data.illness_symptoms) && data.illness_symptoms.length > 0;
        if (yesterdayIll) {
          setYesterdayWasIll(true);
          setShowDetail(true); // auto-expand detail so they see the illness section
        }

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

  // Symptoms ordered by severity — severe symptoms shown first with red styling
  const ILLNESS_OPTIONS: Array<{ label: string; severity: 'severe' | 'moderate' | 'mild' }> = [
    // Severe — should NOT train
    { label: 'Fever', severity: 'severe' },
    { label: 'Body aches', severity: 'severe' },
    { label: 'Chills', severity: 'severe' },
    { label: 'Chest tightness', severity: 'severe' },
    { label: 'Dizziness', severity: 'severe' },
    // Moderate — train with caution
    { label: 'Nausea/vomiting', severity: 'moderate' },
    { label: 'Diarrhea', severity: 'moderate' },
    { label: 'Fatigue/malaise', severity: 'moderate' },
    { label: 'Headache', severity: 'moderate' },
    { label: 'Cough', severity: 'moderate' },
    // Mild — light training OK
    { label: 'Sore throat', severity: 'mild' },
    { label: 'Congestion', severity: 'mild' },
    { label: 'Sneezing', severity: 'mild' },
    { label: 'Loss of appetite', severity: 'mild' },
  ];

  const HEAT_SYMPTOM_OPTIONS: Array<{ label: string; severity: 'emergency' | 'severe' | 'moderate' }> = [
    // Emergency — heat stroke signs, seek medical help immediately
    { label: 'Stopped sweating', severity: 'emergency' },
    { label: 'Confusion/disorientation', severity: 'emergency' },
    { label: 'Skin hot & dry', severity: 'emergency' },
    { label: 'Loss of consciousness', severity: 'emergency' },
    // Severe — heat exhaustion, stop all activity
    { label: 'Rapid pulse', severity: 'severe' },
    { label: 'Heavy sweating', severity: 'severe' },
    { label: 'Nausea', severity: 'severe' },
    { label: 'Vomiting', severity: 'severe' },
    { label: 'Muscle cramps', severity: 'severe' },
    // Moderate — early warning, reduce intensity
    { label: 'Dizziness/lightheaded', severity: 'moderate' },
    { label: 'Headache', severity: 'moderate' },
    { label: 'Fatigue/weakness', severity: 'moderate' },
    { label: 'Thirst', severity: 'moderate' },
    { label: 'Cool/clammy skin', severity: 'moderate' },
  ];

  const [additionalSymptoms, setAdditionalSymptoms] = useState('');

  function toggleSymptom(symptom: string) {
    setDetailTouched(true);
    setIllnessSymptoms(prev =>
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom],
    );
  }

  /** Compute weighted illness severity for IACI engine */
  function getIllnessSeverityScore(): number {
    const weights = { severe: 3, moderate: 2, mild: 1 };
    let score = 0;
    for (const symptom of illnessSymptoms) {
      const opt = ILLNESS_OPTIONS.find(o => o.label === symptom);
      score += opt ? weights[opt.severity] : 1; // custom symptoms = mild
    }
    if (additionalSymptoms.trim()) score += 1; // extra symptoms add mild weight
    return score;
  }

  // ── Submit ──
  async function handleSubmit() {
    setSubmitting(true);
    try {
      // All 10 core inputs are always provided directly (no proxying needed)
      const finalSoreness = Object.keys(sorenessMap).length > 0 ? sorenessMap : {};

      if (isSupabaseConfigured && user?.id) {
        await supabase.from('subjective_entries').upsert({
          user_id: user.id,
          date: today(),
          entry_type: 'morning',
          overall_energy: energy,
          subjective_sleep_quality: sleep,
          soreness: finalSoreness,
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
          illness_symptoms: feelingIll ? illnessSymptoms : [],
          willingness_to_train: motivation,
          mood: energy,
          concentration: 5 - mentalFatigue + 1,
        });
      }

      setCheckinData({
        overallEnergy: energy,
        sleepQuality: sleep,
        soreness: finalSoreness,
        stiffness,
        heavyLegs,
        cramping,
        crampingLocation,
        heatIllness,
        heatSymptoms: heatIllness ? heatSymptoms : [],
        motivation,
        stress,
        mentalFatigue: mentalFatigue,
        hydrationLiters,
        electrolytes,
        electrolyteServings,
        proteinAdequate,
        lateCaffeine,
        lateAlcohol,
        isTraveling,
        giIssues,
        readiness,
        cognitiveClarity,
        reactionTimeSharpness,
        coordinationBalance,
        headachePressure,
        headacheSeverity,
        dizzinessVertigo,
        numbnessTingling,
        numbnessTinglingLocation,
        lightNoiseSensitivity,
        recentHeadImpact,
        daysSinceHeadImpact,
        visualDisturbance,
        quickCheckInOnly: false, // All 10 inputs always provided
        feelingIll,
        illnessSymptoms: feelingIll ? illnessSymptoms : [],
        illnessSeverityScore: feelingIll ? getIllnessSeverityScore() : 0,
        additionalSymptoms: feelingIll ? additionalSymptoms : '',
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

      {/* Illness follow-up prompt */}
      {yesterdayWasIll && !feelingIll && (
        <TouchableOpacity
          onPress={() => { setFeelingIll(true); setDetailTouched(true); }}
          style={styles.illnessPrompt}
          activeOpacity={0.7}
        >
          <ThemedText variant="body" style={styles.illnessPromptText}>
            You reported illness yesterday. Still feeling ill?
          </ThemedText>
          <View style={styles.illnessPromptButtons}>
            <TouchableOpacity
              onPress={() => { setFeelingIll(true); setDetailTouched(true); }}
              style={styles.illnessYesBtn}
            >
              <ThemedText variant="caption" style={{ color: '#FF4444', fontWeight: '700' }}>
                Yes, still ill
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setYesterdayWasIll(false); }}
              style={styles.illnessNoBtn}
            >
              <ThemedText variant="caption" style={{ color: COLORS.success, fontWeight: '700' }}>
                Feeling better
              </ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      {/* ═══ Tier 1: Core Check-In (10 inputs, ~20 seconds) ═══ */}
      <Card style={styles.quickCard}>
        <ThemedText variant="subtitle" style={styles.quickTitle}>
          How are you today?
        </ThemedText>

        {/* Physical */}
        <ThemedText variant="caption" color={COLORS.textMuted} style={styles.groupLabel}>PHYSICAL</ThemedText>
        <SegmentedRating label="Energy" value={energy} onChange={setEnergy} />
        <SegmentedRating label="Sleep Quality" value={sleep} onChange={setSleep} />
        <SegmentedRating label="Soreness" value={soreness} onChange={setSorenessQuick} inverted />
        <SegmentedRating label="Stiffness" value={stiffness} onChange={(v) => { setStiffness(v); setDetailTouched(true); }} inverted />
        <YesNoButton label="Heavy Legs" value={heavyLegs} onChange={(v) => { setHeavyLegs(v); setDetailTouched(true); }} />
        <YesNoButton label="Cramping" value={cramping} onChange={(v) => { setCramping(v); if (!v) setCrampingLocation(''); setDetailTouched(true); }} />
        {cramping && (
          <TextInput
            style={styles.crampingInput}
            value={crampingLocation}
            onChangeText={(t) => { setCrampingLocation(t); setDetailTouched(true); }}
            placeholder="Where? (e.g., calves, hamstrings)"
            placeholderTextColor={COLORS.textMuted}
          />
        )}

        {/* Neurological */}
        <ThemedText variant="caption" color={COLORS.textMuted} style={[styles.groupLabel, { marginTop: 8 }]}>NEUROLOGICAL</ThemedText>
        <SegmentedRating label="Cognitive Clarity" value={cognitiveClarity} onChange={(v) => { setCognitiveClarity(v); }} />
        <SegmentedRating label="Reaction Time" value={reactionTimeSharpness} onChange={(v) => { setReactionTimeSharpness(v); }} />

        {/* Mental & Nutrition */}
        <ThemedText variant="caption" color={COLORS.textMuted} style={[styles.groupLabel, { marginTop: 8 }]}>MENTAL & NUTRITION</ThemedText>
        <SegmentedRating label="Motivation" value={motivation} onChange={(v) => { setMotivation(v); setDetailTouched(true); }} />
        <SegmentedRating label="Stress" value={stress} onChange={(v) => { setStress(v); setDetailTouched(true); }} inverted />
        <SegmentedRating label="Mental Fatigue" value={mentalFatigue} onChange={(v) => { setMentalFatigue(v); setDetailTouched(true); }} inverted />
        <View style={styles.heavyLegsRow}>
          <ThemedText variant="body" style={styles.heavyLegsLabel}>Hydration</ThemedText>
          <View style={styles.hydrationQuick}>
            {[0.5, 1.0, 1.5, 2.0, 2.5].map((val) => (
              <TouchableOpacity
                key={val}
                style={[styles.hydrationBtn, hydrationLiters === val && styles.hydrationBtnActive]}
                onPress={() => { setHydrationLiters(val); setDetailTouched(true); }}
              >
                <ThemedText variant="caption" style={hydrationLiters === val ? styles.ynTextActive : styles.ynText}>
                  {val}L
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Readiness (validation) */}
        <ThemedText variant="caption" color={COLORS.textMuted} style={[styles.groupLabel, { marginTop: 8 }]}>OVERALL</ThemedText>
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
          <DetailSection title="Body Map" summary={bodySummary()}>
            <BodyMap soreness={sorenessMap} onRegionPress={handleRegionPress} />
          </DetailSection>

          <DetailSection title="Nutrition Detail" summary={nutritionSummary()}>
            <YesNoButton label="Electrolytes" value={electrolytes} onChange={(v) => { setElectrolytes(v); if (!v) setElectrolyteServings(''); setDetailTouched(true); }} yesColor={COLORS.success} noColor={COLORS.error} />
            {electrolytes && (
              <View style={styles.gramsRow}>
                <ThemedText variant="caption" color={COLORS.textSecondary}>Servings/tablets:</ThemedText>
                <TextInput
                  style={styles.gramsInput}
                  value={electrolyteServings}
                  onChangeText={(t) => { setElectrolyteServings(t); setDetailTouched(true); }}
                  keyboardType="numeric"
                  placeholder="e.g., 2"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
            )}
            <YesNoButton label="Adequate Protein (1g/kg)" value={proteinAdequate} onChange={(v) => { setProteinAdequate(v); setDetailTouched(true); }} yesColor={COLORS.success} noColor={COLORS.error} />
            {proteinAdequate && (
              <View style={styles.gramsRow}>
                <ThemedText variant="caption" color={COLORS.textSecondary}>Grams consumed:</ThemedText>
                <TextInput
                  style={styles.gramsInput}
                  value={proteinGrams}
                  onChangeText={(t) => { setProteinGrams(t); setDetailTouched(true); }}
                  keyboardType="numeric"
                  placeholder="e.g., 120"
                  placeholderTextColor={COLORS.textMuted}
                />
                <ThemedText variant="caption" color={COLORS.textMuted}>g</ThemedText>
              </View>
            )}
            <YesNoButton label="Late Caffeine" value={lateCaffeine} onChange={(v) => { setLateCaffeine(v); setDetailTouched(true); }} />
            <YesNoButton label="Late Alcohol" value={lateAlcohol} onChange={(v) => { setLateAlcohol(v); setDetailTouched(true); }} />
          </DetailSection>

          <DetailSection title="Flags" summary={flagsSummary()}>
            <YesNoButton label="Feeling ill" value={feelingIll} onChange={(v) => { setFeelingIll(v); setDetailTouched(true); if (!v) setIllnessSymptoms([]); }} />
            {feelingIll && (
              <View style={styles.symptomGrid}>
                <ThemedText variant="caption" color={COLORS.textMuted} style={{ marginBottom: 6 }}>
                  Select symptoms:
                </ThemedText>
                <View style={styles.chipRow}>
                  {ILLNESS_OPTIONS.map((opt) => {
                    const active = illnessSymptoms.includes(opt.label);
                    const sevColor = opt.severity === 'severe' ? '#FF4444' : opt.severity === 'moderate' ? '#FFB800' : COLORS.textSecondary;
                    return (
                      <TouchableOpacity
                        key={opt.label}
                        onPress={() => toggleSymptom(opt.label)}
                        style={[
                          styles.symptomChip,
                          active && { backgroundColor: sevColor + '20', borderColor: sevColor },
                        ]}
                      >
                        <ThemedText
                          variant="caption"
                          style={[
                            styles.symptomText,
                            active && { color: sevColor, fontWeight: '600' },
                          ]}
                        >
                          {opt.label}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {/* Severe symptom warning */}
                {illnessSymptoms.some(s => ILLNESS_OPTIONS.find(o => o.label === s)?.severity === 'severe') && (
                  <View style={styles.warningBanner}>
                    <ThemedText variant="caption" style={styles.warningText}>
                      Severe symptoms detected — training is not recommended today. Focus on rest and recovery.
                    </ThemedText>
                  </View>
                )}
                {/* Additional symptoms free text */}
                <View style={{ marginTop: 8 }}>
                  <ThemedText variant="caption" color={COLORS.textMuted} style={{ marginBottom: 4 }}>
                    Additional symptoms:
                  </ThemedText>
                  <TextInput
                    style={styles.freeTextInput}
                    value={additionalSymptoms}
                    onChangeText={(t) => { setAdditionalSymptoms(t); setDetailTouched(true); }}
                    placeholder="e.g., rash, joint pain..."
                    placeholderTextColor={COLORS.textMuted}
                    multiline
                  />
                </View>
              </View>
            )}
            {/* Heat-Related Illness */}
            <YesNoButton label="Heat-related symptoms" value={heatIllness} onChange={(v) => { setHeatIllness(v); setDetailTouched(true); if (!v) setHeatSymptoms([]); }} />
            {heatIllness && (
              <View style={styles.symptomGrid}>
                <ThemedText variant="caption" color={COLORS.textMuted} style={{ marginBottom: 6 }}>
                  Select heat symptoms:
                </ThemedText>
                <View style={styles.chipRow}>
                  {HEAT_SYMPTOM_OPTIONS.map((opt) => {
                    const active = heatSymptoms.includes(opt.label);
                    const sevColor = opt.severity === 'emergency' ? '#FF0000' : opt.severity === 'severe' ? '#FF4444' : '#FFB800';
                    return (
                      <TouchableOpacity
                        key={opt.label}
                        onPress={() => {
                          setHeatSymptoms(prev => prev.includes(opt.label)
                            ? prev.filter(s => s !== opt.label)
                            : [...prev, opt.label]);
                          setDetailTouched(true);
                        }}
                        style={[
                          styles.symptomChip,
                          active && { backgroundColor: sevColor + '20', borderColor: sevColor },
                        ]}
                      >
                        <ThemedText
                          variant="caption"
                          style={[
                            styles.symptomText,
                            active && { color: sevColor, fontWeight: '600' },
                          ]}
                        >
                          {opt.label}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {/* Emergency warning for heat stroke symptoms */}
                {heatSymptoms.some(s => HEAT_SYMPTOM_OPTIONS.find(o => o.label === s)?.severity === 'emergency') && (
                  <View style={[styles.warningBanner, { borderLeftColor: '#FF0000' }]}>
                    <ThemedText variant="caption" style={[styles.warningText, { color: '#FF0000' }]}>
                      EMERGENCY: Stopped sweating, confusion, or skin hot/dry are signs of heat stroke. Seek immediate medical attention. Do NOT train.
                    </ThemedText>
                  </View>
                )}
                {heatSymptoms.length > 0 && !heatSymptoms.some(s => HEAT_SYMPTOM_OPTIONS.find(o => o.label === s)?.severity === 'emergency') && (
                  <View style={styles.warningBanner}>
                    <ThemedText variant="caption" style={styles.warningText}>
                      Heat exhaustion detected — rehydrate aggressively, cool down, and avoid training until symptoms resolve.
                    </ThemedText>
                  </View>
                )}
              </View>
            )}

            <YesNoButton label="Traveling" value={isTraveling} onChange={(v) => { setIsTraveling(v); setDetailTouched(true); }} />
            <Slider label="GI Issues" value={giIssues} onChange={(v) => { setGiIssues(v); setDetailTouched(true); }} labels={['None', 'Severe']} />
          </DetailSection>

          <DetailSection title="Neurological" summary={headachePressure || dizzinessVertigo || recentHeadImpact ? 'Symptoms present' : '—'}>
            <SegmentedRating label="Coordination/Balance" value={coordinationBalance} onChange={(v) => { setCoordinationBalance(v); setDetailTouched(true); }} />
            <YesNoButton label="Headache / Pressure" value={headachePressure} onChange={(v) => { setHeadachePressure(v); if (!v) setHeadacheSeverity(1); setDetailTouched(true); }} />
            {headachePressure && (
              <SegmentedRating label="Headache Severity" value={headacheSeverity} onChange={(v) => { setHeadacheSeverity(v); setDetailTouched(true); }} inverted />
            )}
            <YesNoButton label="Dizziness / Vertigo" value={dizzinessVertigo} onChange={(v) => { setDizzinessVertigo(v); setDetailTouched(true); }} />
            <YesNoButton label="Numbness / Tingling" value={numbnessTingling} onChange={(v) => { setNumbnessTingling(v); if (!v) setNumbnessTinglingLocation(''); setDetailTouched(true); }} />
            {numbnessTingling && (
              <TextInput
                style={styles.crampingInput}
                value={numbnessTinglingLocation}
                onChangeText={(t) => { setNumbnessTinglingLocation(t); setDetailTouched(true); }}
                placeholder="Where? (e.g., hands, feet, face)"
                placeholderTextColor={COLORS.textMuted}
              />
            )}
            <YesNoButton label="Light / Noise Sensitivity" value={lightNoiseSensitivity} onChange={(v) => { setLightNoiseSensitivity(v); setDetailTouched(true); }} />
            <YesNoButton label="Recent Head Impact" value={recentHeadImpact} onChange={(v) => { setRecentHeadImpact(v); if (!v) setDaysSinceHeadImpact(0); setDetailTouched(true); }} />
            {recentHeadImpact && (
              <View style={{ paddingLeft: 8, marginTop: 4 }}>
                <ThemedText variant="caption" color={COLORS.textMuted}>Days since impact: {daysSinceHeadImpact}</ThemedText>
                <View style={styles.daysRow}>
                  {[0, 1, 3, 7, 14, 30].map((d) => (
                    <TouchableOpacity
                      key={d}
                      style={[styles.dayBtn, daysSinceHeadImpact === d && styles.dayBtnActive]}
                      onPress={() => { setDaysSinceHeadImpact(d); setDetailTouched(true); }}
                    >
                      <ThemedText variant="caption" style={daysSinceHeadImpact === d ? styles.dayBtnTextActive : styles.dayBtnText}>{d}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            <YesNoButton label="Visual Disturbance" value={visualDisturbance} onChange={(v) => { setVisualDisturbance(v); setDetailTouched(true); }} />
          </DetailSection>

          {isConcussionActive({
            cognitiveClarity, reactionTimeSharpness, coordinationBalance,
            headachePressure, headacheSeverity: headachePressure ? headacheSeverity : null,
            dizzinessVertigo, numbnessTingling, numbnessTinglingLocation,
            lightNoiseSensitivity, recentHeadImpact, daysSinceHeadImpact: recentHeadImpact ? daysSinceHeadImpact : null,
            visualDisturbance,
          }) && (
            <View style={styles.concussionBanner}>
              <ThemedText variant="subtitle" style={styles.concussionTitle}>⚠️ CONCUSSION ALERT</ThemedText>
              <ThemedText variant="body" style={styles.concussionText}>
                Head impact with active symptoms detected. Training is restricted.
              </ThemedText>
              <ThemedText variant="caption" style={styles.concussionSectionTitle}>MUST DO (non-negotiable):</ThemedText>
              <ThemedText variant="caption" style={styles.concussionItem}>• Stop all physical activity immediately</ThemedText>
              <ThemedText variant="caption" style={styles.concussionItem}>• Consult a healthcare provider before returning to training</ThemedText>
              <ThemedText variant="caption" style={styles.concussionItem}>• Avoid screens and bright lights — cognitive rest protocol</ThemedText>
              <ThemedText variant="caption" style={styles.concussionItem}>• Do NOT take aspirin or ibuprofen (may increase bleeding risk)</ThemedText>
              <ThemedText variant="caption" style={styles.concussionItem}>• Have someone monitor you for 24 hours</ThemedText>
              <ThemedText variant="caption" style={styles.concussionItem}>• Do NOT drive</ThemedText>
              <ThemedText variant="caption" style={[styles.concussionSectionTitle, { marginTop: 8 }]}>SHOULD DO (strongly recommended):</ThemedText>
              <ThemedText variant="caption" style={styles.concussionItem}>• Rest in a quiet, dark room</ThemedText>
              <ThemedText variant="caption" style={styles.concussionItem}>• Use red light therapy on head/neck if available (10-15 min, 810nm)</ThemedText>
              <ThemedText variant="caption" style={styles.concussionItem}>• Practice gentle coherent breathing (5.5 breaths/min)</ThemedText>
              <ThemedText variant="caption" style={styles.concussionItem}>• Stay hydrated — small sips of water with electrolytes</ThemedText>
              <ThemedText variant="caption" style={styles.concussionItem}>• Sleep as much as possible — prioritize 9+ hours</ThemedText>
              <ThemedText variant="caption" style={styles.concussionItem}>• Apply cold compress to neck if headache persists</ThemedText>
              <ThemedText variant="caption" style={styles.concussionItem}>• Journal symptoms and severity (track progression)</ThemedText>
              <ThemedText variant="caption" style={styles.concussionItem}>• Follow up with sports medicine specialist within 48 hours</ThemedText>
            </View>
          )}
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
  gramsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingLeft: 8,
  },
  gramsInput: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    height: 32,
    width: 70,
    paddingHorizontal: 10,
    color: COLORS.text,
    fontSize: 14,
    textAlign: 'center',
  },
  crampingInput: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    height: 36,
    paddingHorizontal: 12,
    color: COLORS.text,
    fontSize: 13,
    marginTop: 4,
    marginBottom: 4,
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
  illnessPrompt: {
    backgroundColor: '#FFB80015',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFB800',
  },
  illnessPromptText: {
    fontWeight: '600',
    marginBottom: 10,
  },
  illnessPromptButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  illnessYesBtn: {
    flex: 1,
    backgroundColor: '#FF444420',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  illnessNoBtn: {
    flex: 1,
    backgroundColor: '#00C48C20',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00C48C',
  },
  warningBanner: {
    backgroundColor: '#FF444420',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF4444',
  },
  warningText: {
    color: '#FF4444',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  freeTextInput: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    padding: 10,
    color: COLORS.text,
    fontSize: 14,
    minHeight: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bottomSpacer: {
    height: 40,
  },
  groupLabel: {
    textTransform: 'uppercase' as const,
    letterSpacing: 1.2,
    fontSize: 10,
    fontWeight: '700' as const,
    marginBottom: 4,
    marginTop: 4,
  },
  heavyLegsRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: 6,
  },
  heavyLegsLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  heavyLegsToggle: {
    flexDirection: 'row' as const,
    gap: 6,
  },
  ynBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceLight,
  },
  ynBtnActive: {
    backgroundColor: COLORS.success + '30',
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  ynBtnActiveRed: {
    backgroundColor: COLORS.error + '30',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  ynText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '500' as const,
  },
  ynTextActive: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700' as const,
  },
  hydrationQuick: {
    flexDirection: 'row' as const,
    gap: 4,
  },
  hydrationBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceLight,
  },
  hydrationBtnActive: {
    backgroundColor: COLORS.primary + '30',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  dayBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceLight,
  },
  dayBtnActive: {
    backgroundColor: COLORS.primary + '30',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  dayBtnText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  dayBtnTextActive: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },
  concussionBanner: {
    backgroundColor: COLORS.error + '20',
    borderWidth: 2,
    borderColor: COLORS.error,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  concussionTitle: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  concussionText: {
    color: COLORS.text,
    fontSize: 13,
    marginBottom: 10,
  },
  concussionSectionTitle: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  concussionItem: {
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 18,
    paddingLeft: 4,
  },
});
