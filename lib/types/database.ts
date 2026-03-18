/**
 * Supabase database row types — mirrors the SQL schema.
 * These are the raw row shapes from PostgreSQL.
 */

export interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  sport: string | null;
  goal: string | null;
  age: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  dietary_approach: string | null;
  connected_devices: string[];
  primary_device: string | null;
  available_equipment: string[];
  training_environment: string[];
  weight_preferences: Record<string, number> | null;
  notification_preferences: Record<string, boolean> | null;
  travel_status: boolean;
  // Athlete mode (v2.7.0)
  athlete_mode: 'recreational' | 'competitive' | null;
  training_schedule: 'single' | 'double' | null;
  training_frequency: number | null;
  training_hours_week: number | null;
  training_phase: 'base' | 'build' | 'peak' | 'taper' | 'offseason' | null;
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'elite' | null;
  primary_goal: string | null;
  recovery_priorities: string[] | null;
  upcoming_events: Array<{ date: string; type: string }> | null;
  known_conditions: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface DailyPhysiologyRow {
  id: string;
  user_id: string;
  date: string;
  // Wearable metrics
  hrv_rmssd: number | null;
  resting_heart_rate: number | null;
  respiratory_rate: number | null;
  spo2_pct: number | null;
  skin_temp_deviation: number | null;
  sleep_duration_ms: number | null;
  sleep_performance_pct: number | null;
  sleep_consistency_pct: number | null;
  rem_sleep_ms: number | null;
  deep_sleep_ms: number | null;
  light_sleep_ms: number | null;
  awake_during_ms: number | null;
  sleep_latency_ms: number | null;
  sleep_onset_time: string | null;
  wake_time: string | null;
  awakenings: number | null;
  recovery_score: number | null;
  day_strain: number | null;
  // IACI computed
  iaci_score: number | null;
  readiness_tier: string | null;
  subsystem_scores: Record<string, number> | null;
  phenotype: string | null;
  phenotype_detail: string | null;
  penalties_applied: Record<string, number>[] | null;
  inflammation_score: number | null;
  inflammation_flags: string[] | null;
  // Meta
  sources: string[];
  data_completeness: number;
  raw_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface SubjectiveEntryRow {
  id: string;
  user_id: string;
  date: string;
  entry_type: string; // 'morning' | 'post_workout' | 'evening'
  // Autonomic
  subjective_stress: number | null;
  perceived_fatigue: number | null;
  // Musculoskeletal
  soreness: Record<string, number> | null;
  stiffness: number | null;
  heavy_legs: boolean | null;
  pain_locations: string[] | null;
  // Cardiometabolic
  subjective_breathlessness: number | null;
  perceived_exertion_mismatch: boolean | null;
  // Sleep
  subjective_sleep_quality: number | null;
  late_caffeine: boolean | null;
  late_alcohol: boolean | null;
  late_heavy_meal: boolean | null;
  // Metabolic
  hydration_glasses: number | null;
  electrolytes_taken: boolean | null;
  protein_adequate: boolean | null;
  gi_disruption: number | null;
  fasting: boolean | null;
  // Psychological
  motivation: number | null;
  mood: number | null;
  mental_fatigue: number | null;
  willingness_to_train: number | null;
  concentration: number | null;
  // Flags
  is_traveling: boolean | null;
  timezone_change: number | null;
  illness_symptoms: string[] | null;
  // Overall
  overall_energy: number | null;
  created_at: string;
}

export interface WorkoutRow {
  id: string;
  user_id: string;
  date: string;
  exercise_id: string | null;
  workout_type: string;
  start_time: string;
  end_time: string | null;
  duration_ms: number | null;
  avg_heart_rate: number | null;
  max_heart_rate: number | null;
  strain_score: number | null;
  calories_burned: number | null;
  hr_zones: Record<string, number> | null;
  rpe: number | null;
  notes: string | null;
  body_systems_stressed: string[];
  pre_iaci_score: number | null;
  post_workout_subsystem_impact: Record<string, number> | null;
  source: string;
  created_at: string;
}

export interface RecoveryProtocolRow {
  id: string;
  name: string;
  slug: string;
  series: string;
  modality_type: string;
  cns_low_avoid: boolean;
  off_day_only: boolean;
  primary_system: string;
  secondary_systems: string[];
  iaci_subsystems_targeted: string[];
  target_areas_primary: string[];
  target_areas_secondary: string[];
  benefits: string[];
  equipment_needed: string[];
  evidence_level: string | null;
  dose_min: string | null;
  dose_sweet_spot: string | null;
  dose_upper_limit: string | null;
  instructions: string | null;
  avoid_cautions: string | null;
  ideal_timing: string | null;
  evidence_notes: string | null;
  athlete_tidbit: string | null;
  athlete_caution: string | null;
  protocol_classes: string[];
  phenotypes_recommended: string[];
  phenotypes_avoid: string[];
  environment: string[];
  created_at: string;
}

export interface RecoveryLogRow {
  id: string;
  user_id: string;
  protocol_id: string;
  date: string;
  duration_minutes: number;
  subjective_effectiveness: number;
  next_day_iaci_change: number | null;
  next_day_subsystem_changes: Record<string, number> | null;
  created_at: string;
}

export interface DeviceImportRow {
  id: string;
  user_id: string;
  device_type: string;
  file_name: string;
  rows_imported: number;
  rows_skipped: number;
  date_range_start: string | null;
  date_range_end: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
}

export interface InflammationMarkerRow {
  id: string;
  user_id: string;
  marker_id: string;
  value: number;
  date: string;
  source: string;
  notes: string | null;
  created_at: string;
}

export interface TrendSnapshotRow {
  id: string;
  user_id: string;
  date: string;
  period: string;
  iaci_trend: number;
  subsystem_trends: Record<string, number>;
  training_load_avg: number;
  acwr: number;
  monotony: number;
  strain_avg: number;
  inflammation_trend: number | null;
  created_at: string;
}

export interface ProgressAssessmentRow {
  id: string;
  user_id: string;
  date: string;
  vo2max_trend: number | null;
  threshold_pace_trend: number | null;
  threshold_power_trend: number | null;
  hrv_baseline_trend: number;
  acwr: number;
  stall_type: string;
  stall_duration_days: number | null;
  alternative_approaches: string[];
  notes: string | null;
  created_at: string;
}

export interface AthleteHistoryRow {
  id: string;
  user_id: string;
  date: string;
  period_type: string;
  vo2max: number | null;
  lactate_threshold_hr: number | null;
  lactate_threshold_pace: string | null;
  weight_kg: number | null;
  body_fat_pct: number | null;
  race_results: Record<string, unknown>[];
  fitness_tests: Record<string, unknown>[];
  notes: string | null;
  created_at: string;
}
