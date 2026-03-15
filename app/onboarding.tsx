/**
 * Onboarding: Sport Selection Screen
 *
 * Multi-select sport grid grouped by category.
 * Shows after first sign-up or accessible from Profile settings.
 * Saves selected sports to profile.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../lib/utils/constants';
import { SPORT_PROFILES, SportCategory } from '../data/sport-profiles';
import { useAuthStore } from '../store/auth-store';
import { isSupabaseConfigured } from '../lib/supabase';

const CATEGORY_LABELS: Record<SportCategory, string> = {
  endurance: 'Endurance',
  combat: 'Combat & Martial Arts',
  strength: 'Strength & Power',
  field_court: 'Field & Court',
  other: 'Other',
  wellness: 'Wellness & Longevity',
};

const CATEGORY_ORDER: SportCategory[] = [
  'wellness', 'endurance', 'strength', 'combat', 'field_court', 'other',
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useAuthStore();
  const [selected, setSelected] = useState<Set<string>>(() => {
    const existing = profile?.sport;
    if (Array.isArray(existing)) return new Set(existing);
    if (typeof existing === 'string' && existing) return new Set([existing]);
    return new Set();
  });

  const toggle = (key: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleContinue = async () => {
    const sportKeys = Array.from(selected);

    if (isSupabaseConfigured) {
      try {
        await updateProfile({ sport: sportKeys as any });
      } catch {
        // Non-blocking in demo mode
      }
    }

    // Navigate to dashboard
    router.replace('/(tabs)/dashboard');
  };

  const grouped = CATEGORY_ORDER.map(cat => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    sports: SPORT_PROFILES.filter(s => s.category === cat),
  }));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>What Do You Train?</Text>
        <Text style={styles.subtitle}>
          Select your sport(s) so we can tailor recovery recommendations to your specific needs.
          You can select multiple.
        </Text>

        {grouped.map(group => (
          <View key={group.category} style={styles.categorySection}>
            <Text style={styles.categoryLabel}>{group.label}</Text>
            <View style={styles.chipGrid}>
              {group.sports.map(sport => {
                const isSelected = selected.has(sport.key);
                return (
                  <TouchableOpacity
                    key={sport.key}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => toggle(sport.key)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.chipIcon}>{sport.icon}</Text>
                    <Text style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}>
                      {sport.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, selected.size === 0 && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={selected.size === 0}
        >
          <Text style={styles.continueText}>
            {selected.size === 0
              ? 'Select at least one'
              : `Continue with ${selected.size} sport${selected.size > 1 ? 's' : ''}`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/dashboard')}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  chipIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  chipLabel: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  chipLabelSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  continueButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});
