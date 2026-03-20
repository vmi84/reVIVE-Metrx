/**
 * Exercise Library — Browsable/searchable exercise demo library.
 * Accessible as a modal from protocol detail and training recommendation cards.
 *
 * Features:
 *  - Search by name or body region
 *  - Category chip filter
 *  - 2-column compact grid
 *  - Detail view with video + form cues
 */

import { useState, useMemo, useCallback } from 'react';
import { View, FlatList, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ExerciseCard } from '../components/exercise/ExerciseCard';
import { ExerciseDetail } from '../components/exercise/ExerciseDetail';
import { ThemedText } from '../components/ui/ThemedText';
import { COLORS } from '../lib/utils/constants';
import {
  EXERCISE_LIBRARY,
  EXERCISE_CATEGORY_LABELS,
  getExercise,
  searchExercises,
  type ExerciseCategory,
  type ExerciseDemo,
} from '../data/exercise-library';

const ALL_CATEGORIES: (ExerciseCategory | 'all')[] = [
  'all', 'foam_rolling', 'mobility', 'stretching', 'breathing',
  'yoga', 'corrective_balance', 'bodyweight', 'lymphatic',
  'aquatic', 'thermal', 'walking_cycling',
];

export default function ExerciseLibraryScreen() {
  const params = useLocalSearchParams<{ id?: string; category?: string; modality?: string }>();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'all'>(
    (params.category as ExerciseCategory) ?? 'all',
  );
  const [selectedExercise, setSelectedExercise] = useState<ExerciseDemo | null>(
    params.id ? getExercise(params.id) ?? null : null,
  );

  const filtered = useMemo(() => {
    let list = search.trim()
      ? searchExercises(search)
      : EXERCISE_LIBRARY;
    // Filter by modality if coming from Effort tab recovery option
    if (params.modality) {
      const modalityFiltered = list.filter(e => e.modalityKeys.includes(params.modality!));
      if (modalityFiltered.length > 0) list = modalityFiltered;
    }
    if (selectedCategory !== 'all') {
      list = list.filter(e => e.category === selectedCategory);
    }
    return list;
  }, [search, selectedCategory, params.modality]);

  const handleSelect = useCallback((exercise: ExerciseDemo) => {
    setSelectedExercise(exercise);
  }, []);

  const handleBack = useCallback(() => {
    if (selectedExercise) {
      setSelectedExercise(null);
    } else {
      router.back();
    }
  }, [selectedExercise]);

  // Detail view
  if (selectedExercise) {
    return (
      <View style={styles.container}>
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <ThemedText variant="body" color={COLORS.primary}>Back</ThemedText>
          </TouchableOpacity>
          <ThemedText variant="body" style={styles.headerTitle}>Exercise</ThemedText>
          <View style={styles.backBtn} />
        </View>
        <ExerciseDetail exercise={selectedExercise} />
      </View>
    );
  }

  // Library grid view
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <ThemedText variant="body" color={COLORS.primary}>Back</ThemedText>
        </TouchableOpacity>
        <ThemedText variant="body" style={styles.headerTitle}>Recovery Exercise Library</ThemedText>
        <View style={styles.backBtn} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chipContent}
      >
        {ALL_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, selectedCategory === cat && styles.chipActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <ThemedText
              variant="caption"
              style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}
            >
              {cat === 'all' ? 'All' : EXERCISE_CATEGORY_LABELS[cat]}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Count */}
      <ThemedText variant="caption" color={COLORS.textMuted} style={styles.count}>
        {filtered.length} exercises
      </ThemedText>

      {/* Grid */}
      <FlatList
        data={filtered}
        renderItem={({ item }) => (
          <ExerciseCard exercise={item} onPress={() => handleSelect(item)} />
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 8,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 8,
  },
  backBtn: {
    width: 60,
  },
  headerTitle: {
    fontWeight: '700',
    fontSize: 17,
    color: COLORS.text,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    height: 38,
    paddingHorizontal: 14,
    color: COLORS.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipScroll: {
    maxHeight: 36,
    marginBottom: 4,
  },
  chipContent: {
    paddingHorizontal: 12,
    gap: 6,
  },
  chip: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    height: 30,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  count: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    fontSize: 11,
  },
  grid: {
    paddingHorizontal: 12,
    paddingBottom: 40,
  },
});
