/**
 * Onboarding: 5-Step Athlete Profile Questionnaire
 *
 * Calibrates the entire app based on the athlete's context.
 * Runs on first launch; revisitable from Settings > Edit Athlete Profile.
 *
 * Steps:
 *   1. About You (name, sport, experience)
 *   2. Training Context (mode, schedule, frequency, phase)
 *   3. Goals & Priorities
 *   4. Environment & Equipment
 *   5. Baseline Health
 */

import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../lib/utils/constants';
import { SPORT_PROFILES, SportCategory } from '../data/sport-profiles';
import { useAuthStore } from '../store/auth-store';
import { useDailyStore } from '../store/daily-store';
import { useSettingsStore } from '../store/settings-store';
import { isSupabaseConfigured } from '../lib/supabase';
import type { AthleteMode, TrainingSchedule, TrainingPhase, ExperienceLevel } from '../lib/types/athlete-mode';

const TOTAL_STEPS = 5;

const CATEGORY_LABELS: Record<SportCategory, string> = {
  endurance: 'Endurance', combat: 'Combat', strength: 'Strength',
  field_court: 'Field & Court', other: 'Other', wellness: 'Wellness',
};
const CATEGORY_ORDER: SportCategory[] = ['endurance', 'strength', 'combat', 'field_court', 'other', 'wellness'];

const EXPERIENCE_OPTIONS: { key: ExperienceLevel; label: string; desc: string }[] = [
  { key: 'beginner', label: 'Beginner', desc: '< 1 year training' },
  { key: 'intermediate', label: 'Intermediate', desc: '1-3 years consistent' },
  { key: 'advanced', label: 'Advanced', desc: '3-7 years structured' },
  { key: 'elite', label: 'Elite', desc: '7+ years / competitive' },
];

const MODE_OPTIONS: { key: AthleteMode; label: string; desc: string }[] = [
  { key: 'recreational', label: 'Self-Directed', desc: 'I plan my own training' },
  { key: 'competitive', label: 'Coach-Led', desc: 'I follow an external coaching plan' },
];

const SCHEDULE_OPTIONS: { key: TrainingSchedule; label: string }[] = [
  { key: 'single', label: 'Single session/day' },
  { key: 'double', label: 'Two-a-day' },
];

const PHASE_OPTIONS: { key: TrainingPhase; label: string }[] = [
  { key: 'base', label: 'Base' }, { key: 'build', label: 'Build' },
  { key: 'peak', label: 'Peak' }, { key: 'taper', label: 'Taper' },
  { key: 'offseason', label: 'Off-season' },
];

const GOAL_OPTIONS = [
  'Performance', 'Health & Longevity', 'Injury Prevention',
  'Return from Injury', 'General Fitness', 'Weight Management',
];

const RECOVERY_PRIORITIES = [
  'Sleep Optimization', 'Mobility & Flexibility', 'Strength Maintenance',
  'Mental Recovery', 'Nutrition & Fueling', 'Injury Prevention',
];

const EQUIPMENT_OPTIONS = [
  'Foam Roller', 'Resistance Bands', 'Kettlebells', 'Sauna',
  'Cold Plunge/Ice Bath', 'Massage Gun', 'Yoga Mat', 'Pull-up Bar',
  'Swimming Pool', 'Stationary Bike', 'Treadmill',
];

const ENVIRONMENT_OPTIONS = ['Gym', 'Home', 'Outdoors', 'Pool', 'Studio'];

const DIETARY_OPTIONS = ['Omnivore', 'Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Mediterranean', 'Other'];

export default function OnboardingScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useAuthStore();
  const { setAthleteMode, setTrainingSchedule } = useDailyStore();
  const scrollRef = useRef<ScrollView>(null);
  const [step, setStep] = useState(1);

  // Step 1: About You
  const [sports, setSports] = useState<Set<string>>(() => {
    const existing = profile?.sport;
    if (Array.isArray(existing)) return new Set(existing);
    if (typeof existing === 'string' && existing) return new Set([existing]);
    return new Set();
  });
  const [experience, setExperience] = useState<ExperienceLevel>(
    (profile as any)?.experience_level ?? 'intermediate'
  );

  // Step 2: Training Context
  const [athleteMode, setMode] = useState<AthleteMode>(
    (profile as any)?.athlete_mode ?? 'recreational'
  );
  const [schedule, setSchedule] = useState<TrainingSchedule>(
    (profile as any)?.training_schedule ?? 'single'
  );
  const [frequency, setFrequency] = useState(String((profile as any)?.training_frequency ?? '5'));
  const [hoursWeek, setHoursWeek] = useState(String((profile as any)?.training_hours_week ?? '8'));
  const [phase, setPhase] = useState<TrainingPhase>(
    (profile as any)?.training_phase ?? 'build'
  );

  // Step 3: Goals
  const [goal, setGoal] = useState<string>((profile as any)?.primary_goal ?? '');
  const [priorities, setPriorities] = useState<Set<string>>(
    new Set((profile as any)?.recovery_priorities ?? [])
  );

  // Step 4: Environment
  const [equipment, setEquipment] = useState<Set<string>>(
    new Set(profile?.available_equipment ?? [])
  );
  const [environment, setEnvironment] = useState<Set<string>>(
    new Set(profile?.training_environment ?? [])
  );
  const [diet, setDiet] = useState(profile?.dietary_approach ?? '');

  // Step 5: Health
  const [conditions, setConditions] = useState((profile as any)?.known_conditions ?? '');

  // Custom user-added items (not in preset lists)
  const [customEquipment, setCustomEquipment] = useState<string[]>([]);
  const [customEnvironment, setCustomEnvironment] = useState<string[]>([]);
  const [customGoals, setCustomGoals] = useState<string[]>([]);
  const [customPriorities, setCustomPriorities] = useState<string[]>([]);

  const toggleSet = (set: Set<string>, key: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    if (next.has(key)) next.delete(key); else next.add(key);
    setter(next);
  };

  const goNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  };
  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handleComplete = async () => {
    // Save to persisted settings store (survives restarts)
    useSettingsStore.getState().updateProfile({
      onboardingCompleted: true,
      sports: Array.from(sports),
      experienceLevel: experience,
      athleteMode,
      trainingSchedule: schedule,
      trainingFrequency: parseInt(frequency) || null,
      trainingHoursWeek: parseInt(hoursWeek) || null,
      trainingPhase: phase,
      primaryGoal: goal,
      recoveryPriorities: Array.from(priorities),
      availableEquipment: Array.from(equipment),
      trainingEnvironment: Array.from(environment),
      dietaryApproach: diet,
      knownConditions: conditions,
    });

    // Update daily store immediately (for current session)
    setAthleteMode(athleteMode);
    setTrainingSchedule(schedule);

    // Also push to Supabase if available
    if (isSupabaseConfigured) {
      try {
        await updateProfile({
          sport: Array.from(sports) as any,
          experience_level: experience,
          athlete_mode: athleteMode,
          training_schedule: schedule,
          training_frequency: parseInt(frequency) || null,
          training_hours_week: parseInt(hoursWeek) || null,
          training_phase: phase,
          primary_goal: goal || null,
          recovery_priorities: Array.from(priorities),
          available_equipment: Array.from(equipment),
          training_environment: Array.from(environment),
          dietary_approach: diet || null,
          known_conditions: conditions || null,
          onboarding_completed: true,
        } as any);
      } catch { /* non-blocking */ }
    }

    router.replace('/(tabs)/dashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <View key={i} style={[styles.progressDot, i < step && styles.progressDotActive]} />
        ))}
      </View>
      <Text style={styles.stepLabel}>Step {step} of {TOTAL_STEPS}</Text>

      <ScrollView ref={scrollRef} style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {step === 1 && (
          <>
            <Text style={styles.title}>About You</Text>
            <Text style={styles.subtitle}>Select your sport(s) and experience level.</Text>

            {CATEGORY_ORDER.map(cat => {
              const catSports = SPORT_PROFILES.filter(s => s.category === cat);
              return (
                <View key={cat} style={styles.categorySection}>
                  <Text style={styles.categoryLabel}>{CATEGORY_LABELS[cat]}</Text>
                  <View style={styles.chipGrid}>
                    {catSports.map(sp => (
                      <TouchableOpacity
                        key={sp.key}
                        style={[styles.chip, sports.has(sp.key) && styles.chipSelected]}
                        onPress={() => toggleSet(sports, sp.key, setSports)}
                      >
                        <Text style={styles.chipIcon}>{sp.icon}</Text>
                        <Text style={[styles.chipLabel, sports.has(sp.key) && styles.chipLabelSelected]}>
                          {sp.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            })}

            <Text style={styles.sectionTitle}>Experience Level</Text>
            {EXPERIENCE_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.optionRow, experience === opt.key && styles.optionRowSelected]}
                onPress={() => setExperience(opt.key)}
              >
                <View style={[styles.radio, experience === opt.key && styles.radioSelected]} />
                <View>
                  <Text style={styles.optionLabel}>{opt.label}</Text>
                  <Text style={styles.optionDesc}>{opt.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.title}>Training Context</Text>
            <Text style={styles.subtitle}>How do you train?</Text>

            <Text style={styles.sectionTitle}>Training Style</Text>
            {MODE_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.optionRow, athleteMode === opt.key && styles.optionRowSelected]}
                onPress={() => setMode(opt.key)}
              >
                <View style={[styles.radio, athleteMode === opt.key && styles.radioSelected]} />
                <View>
                  <Text style={styles.optionLabel}>{opt.label}</Text>
                  <Text style={styles.optionDesc}>{opt.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}

            <Text style={styles.sectionTitle}>Daily Schedule</Text>
            <View style={styles.toggleRow}>
              {SCHEDULE_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.toggleBtn, schedule === opt.key && styles.toggleBtnActive]}
                  onPress={() => setSchedule(opt.key)}
                >
                  <Text style={[styles.toggleText, schedule === opt.key && styles.toggleTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Days / Week</Text>
                <TextInput style={styles.input} value={frequency} onChangeText={setFrequency}
                  keyboardType="numeric" placeholder="5" placeholderTextColor={COLORS.textMuted} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Hours / Week</Text>
                <TextInput style={styles.input} value={hoursWeek} onChangeText={setHoursWeek}
                  keyboardType="numeric" placeholder="8" placeholderTextColor={COLORS.textMuted} />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Current Phase</Text>
            <View style={styles.chipGrid}>
              {PHASE_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.chip, phase === opt.key && styles.chipSelected]}
                  onPress={() => setPhase(opt.key)}
                >
                  <Text style={[styles.chipLabel, phase === opt.key && styles.chipLabelSelected]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <Text style={styles.title}>Goals & Priorities</Text>
            <Text style={styles.subtitle}>What are you optimizing for?</Text>

            <Text style={styles.sectionTitle}>Primary Goal</Text>
            <View style={styles.chipGrid}>
              {[...GOAL_OPTIONS, ...customGoals].map(g => (
                <TouchableOpacity
                  key={g}
                  style={[styles.chip, goal === g && styles.chipSelected]}
                  onPress={() => setGoal(goal === g ? '' : g)}
                >
                  <Text style={[styles.chipLabel, goal === g && styles.chipLabelSelected]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <AddCustomInput placeholder="Add other goal..." onAdd={(val) => {
              setCustomGoals(prev => [...prev, val]);
              setGoal(val);
            }} />

            <Text style={styles.sectionTitle}>Recovery Priorities (select up to 3)</Text>
            <View style={styles.chipGrid}>
              {[...RECOVERY_PRIORITIES, ...customPriorities].map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.chip, priorities.has(p) && styles.chipSelected,
                    priorities.size >= 3 && !priorities.has(p) && styles.chipDisabled]}
                  onPress={() => {
                    if (priorities.size >= 3 && !priorities.has(p)) return;
                    toggleSet(priorities, p, setPriorities);
                  }}
                >
                  <Text style={[styles.chipLabel, priorities.has(p) && styles.chipLabelSelected]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <AddCustomInput placeholder="Add other priority..." onAdd={(val) => {
              setCustomPriorities(prev => [...prev, val]);
              if (priorities.size < 3) setPriorities(prev => new Set([...prev, val]));
            }} />
          </>
        )}

        {step === 4 && (
          <>
            <Text style={styles.title}>Environment & Equipment</Text>
            <Text style={styles.subtitle}>What recovery tools and spaces do you have access to?</Text>

            <Text style={styles.sectionTitle}>Training Environment</Text>
            <View style={styles.chipGrid}>
              {[...ENVIRONMENT_OPTIONS, ...customEnvironment].map(e => (
                <TouchableOpacity
                  key={e}
                  style={[styles.chip, environment.has(e) && styles.chipSelected]}
                  onPress={() => toggleSet(environment, e, setEnvironment)}
                >
                  <Text style={[styles.chipLabel, environment.has(e) && styles.chipLabelSelected]}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <AddCustomInput placeholder="Add other environment..." onAdd={(val) => {
              setCustomEnvironment(prev => [...prev, val]);
              setEnvironment(prev => new Set([...prev, val]));
            }} />

            <Text style={styles.sectionTitle}>Available Equipment</Text>
            <View style={styles.chipGrid}>
              {[...EQUIPMENT_OPTIONS, ...customEquipment].map(e => (
                <TouchableOpacity
                  key={e}
                  style={[styles.chip, equipment.has(e) && styles.chipSelected]}
                  onPress={() => toggleSet(equipment, e, setEquipment)}
                >
                  <Text style={[styles.chipLabel, equipment.has(e) && styles.chipLabelSelected]}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <AddCustomInput placeholder="Add other equipment..." onAdd={(val) => {
              setCustomEquipment(prev => [...prev, val]);
              setEquipment(prev => new Set([...prev, val]));
            }} />

            <Text style={styles.sectionTitle}>Dietary Approach</Text>
            <View style={styles.chipGrid}>
              {DIETARY_OPTIONS.map(d => (
                <TouchableOpacity
                  key={d}
                  style={[styles.chip, diet === d && styles.chipSelected]}
                  onPress={() => setDiet(diet === d ? '' : d)}
                >
                  <Text style={[styles.chipLabel, diet === d && styles.chipLabelSelected]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {step === 5 && (
          <>
            <Text style={styles.title}>Baseline Health</Text>
            <Text style={styles.subtitle}>Help us understand your starting point.</Text>

            <Text style={styles.sectionTitle}>Known Injuries or Conditions</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={conditions}
              onChangeText={setConditions}
              placeholder="e.g., Left knee ACL repair 2024, chronic lower back tightness"
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={3}
            />

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Your Profile Summary</Text>
              <SummaryRow label="Sports" value={Array.from(sports).join(', ') || 'None selected'} />
              <SummaryRow label="Experience" value={experience} />
              <SummaryRow label="Mode" value={athleteMode === 'competitive' ? 'Coach-Led' : 'Self-Directed'} />
              <SummaryRow label="Schedule" value={schedule === 'double' ? 'Two-a-day' : 'Single session'} />
              <SummaryRow label="Frequency" value={`${frequency} days/week, ${hoursWeek} hrs/week`} />
              <SummaryRow label="Phase" value={phase} />
              <SummaryRow label="Goal" value={goal || 'Not set'} />
              <SummaryRow label="Priorities" value={Array.from(priorities).join(', ') || 'None'} />
              <SummaryRow label="Equipment" value={`${equipment.size} items`} />
              <SummaryRow label="Diet" value={diet || 'Not set'} />
            </View>
          </>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer with navigation */}
      <View style={styles.footer}>
        <View style={styles.footerRow}>
          {step > 1 ? (
            <TouchableOpacity onPress={goBack} style={styles.backBtn}>
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => router.replace('/(tabs)/dashboard')}>
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          )}
          {step < TOTAL_STEPS ? (
            <TouchableOpacity style={styles.nextBtn} onPress={goNext}>
              <Text style={styles.nextText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.nextBtn} onPress={handleComplete}>
              <Text style={styles.nextText}>Complete Setup</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

/** Inline "Add custom" input for any chip grid */
function AddCustomInput({ placeholder, onAdd }: { placeholder: string; onAdd: (val: string) => void }) {
  const [text, setText] = useState('');
  const handleAdd = () => {
    const trimmed = text.trim();
    if (trimmed) {
      onAdd(trimmed);
      setText('');
    }
  };
  return (
    <View style={customStyles.row}>
      <TextInput
        style={customStyles.input}
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        onSubmitEditing={handleAdd}
        returnKeyType="done"
      />
      <TouchableOpacity style={[customStyles.addBtn, !text.trim() && customStyles.addBtnDisabled]} onPress={handleAdd} disabled={!text.trim()}>
        <Text style={customStyles.addText}>+ Add</Text>
      </TouchableOpacity>
    </View>
  );
}

const customStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, marginTop: 8 },
  input: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 10, height: 40, paddingHorizontal: 12, color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border },
  addBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' },
  addBtnDisabled: { opacity: 0.4 },
  addText: { color: '#fff', fontWeight: '600', fontSize: 13 },
});

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  progressContainer: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingTop: 16 },
  progressDot: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border },
  progressDotActive: { backgroundColor: COLORS.primary },
  stepLabel: { textAlign: 'center', color: COLORS.textMuted, fontSize: 12, marginTop: 8, marginBottom: 4 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20 },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 1, marginTop: 20, marginBottom: 10 },
  categorySection: { marginBottom: 16 },
  categoryLabel: { fontSize: 12, fontWeight: '600', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.border },
  chipSelected: { backgroundColor: COLORS.primary + '20', borderColor: COLORS.primary },
  chipDisabled: { opacity: 0.4 },
  chipIcon: { fontSize: 18, marginRight: 6 },
  chipLabel: { fontSize: 14, color: COLORS.text, fontWeight: '500' },
  chipLabelSelected: { color: COLORS.primary, fontWeight: '600' },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 8 },
  optionRowSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.textMuted },
  radioSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  optionLabel: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  optionDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  toggleRow: { flexDirection: 'row', gap: 8 },
  toggleBtn: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 10, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  toggleBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  toggleText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  toggleTextActive: { color: '#fff', fontWeight: '700' },
  inputRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  inputGroup: { flex: 1 },
  inputLabel: { fontSize: 12, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input: { backgroundColor: COLORS.surface, borderRadius: 10, height: 44, paddingHorizontal: 14, color: COLORS.text, fontSize: 16, borderWidth: 1, borderColor: COLORS.border },
  textArea: { height: 80, paddingTop: 12, textAlignVertical: 'top' },
  summaryCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, marginTop: 20, borderWidth: 1, borderColor: COLORS.border },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  summaryLabel: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600', textTransform: 'capitalize' },
  summaryValue: { fontSize: 13, color: COLORS.text, fontWeight: '500', textAlign: 'right', flex: 1, marginLeft: 12 },
  footer: { padding: 20, paddingBottom: 30, backgroundColor: COLORS.background, borderTopWidth: 1, borderTopColor: COLORS.border },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { paddingVertical: 12, paddingHorizontal: 20 },
  backText: { color: COLORS.textSecondary, fontSize: 16, fontWeight: '500' },
  skipText: { color: COLORS.textSecondary, fontSize: 14 },
  nextBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32 },
  nextText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
