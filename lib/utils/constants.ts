/**
 * App-wide constants.
 */

// IACI Tier thresholds
export const TIER_THRESHOLDS = {
  perform: 85,
  train: 70,
  maintain: 55,
  recover: 35,
  protect: 0,
} as const;

// Protocol class thresholds
export const PROTOCOL_THRESHOLDS = {
  A: 80,
  B: 65,
  C: 50,
  D: 35,
  E: 0,
} as const;

// Subsystem band thresholds
export const BAND_THRESHOLDS = {
  highly_recovered: 85,
  trainable: 70,
  limited: 55,
  compromised: 40,
  impaired: 0,
} as const;

// Baseline calculation
export const BASELINE_WINDOW_DAYS = 21;
export const BASELINE_MIN_SAMPLES = 7;

// ACWR zones
export const ACWR_ZONES = {
  undertraining: { min: 0, max: 0.8 },
  sweet_spot: { min: 0.8, max: 1.3 },
  danger: { min: 1.3, max: 1.5 },
  overreaching: { min: 1.5, max: Infinity },
} as const;

// Training monotony threshold (Foster)
export const MONOTONY_THRESHOLD = 2.0;

// Penalty point values
export const PENALTIES = {
  systemic_suppression: 8,
  tissue_risk: 5,
  restoration_deficit: 10,
  fueling_risk: 5,
  illness_caution: 12,
  multi_system_impairment: 8,
} as const;

// Whoop API
export const WHOOP_API_BASE = 'https://api.prod.whoop.com/developer';
export const WHOOP_AUTH_URL = 'https://api.prod.whoop.com/oauth/oauth2/auth';
export const WHOOP_TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token';

// UI Colors
export const COLORS = {
  background: '#0A1628',
  surface: '#132039',
  surfaceLight: '#1A2D4D',
  primary: '#4DA6FF',
  success: '#00C853',
  warning: '#FFC107',
  error: '#F44336',
  orange: '#FF9800',
  text: '#FFFFFF',
  textSecondary: '#8899AA',
  textMuted: '#556677',
  border: '#1E3454',
  tierPerform: '#00C853',
  tierTrain: '#2196F3',
  tierMaintain: '#FFC107',
  tierRecover: '#FF9800',
  tierProtect: '#F44336',
} as const;

// Body regions for soreness mapping
export const BODY_REGIONS = [
  'quads', 'hamstrings', 'calves', 'glutes', 'hips',
  'knees', 'ankles', 'lower_back', 'upper_back',
  'shoulders', 'chest', 'core', 'neck',
] as const;

// Soreness scale labels
export const SORENESS_LABELS = [
  'None',
  'Mild',
  'Moderate',
  'Significant',
  'Severe',
] as const;
