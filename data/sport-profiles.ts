/**
 * Sport Profiles with Subsystem Stress Maps & Sport-Specific Stress Markers
 *
 * Each sport defines:
 * - Which subsystems it stresses (fingerprint)
 * - Trackable stress markers that feed into IACI subsystem scores
 * - Primary recovery needs (which subsystems need the most recovery)
 * - Recommended recovery training modalities
 * - IACI weight preset (how to weight the composite index)
 */

import { SubsystemKey } from '../lib/types/iaci';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SportCategory =
  | 'endurance'
  | 'combat'
  | 'strength'
  | 'field_court'
  | 'other'
  | 'wellness';

export type StressLevel = 'very_high' | 'high' | 'moderate' | 'low';

export type IAWeightPreset = 'default' | 'endurance' | 'power' | 'older_athlete';

export interface SportStressMarker {
  name: string;
  subsystem: SubsystemKey;
  description: string;
  unit: string;
  range: [number, number];
}

export interface SportProfile {
  key: string;
  label: string;
  icon: string;
  category: SportCategory;
  subsystemStress: Record<SubsystemKey, StressLevel>;
  stressMarkers: SportStressMarker[];
  primaryRecoveryNeeds: SubsystemKey[];
  recommendedModalities: string[];
  iaciWeightPreset: IAWeightPreset;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stress(
  autonomic: StressLevel,
  musculoskeletal: StressLevel,
  cardiometabolic: StressLevel,
  sleep: StressLevel,
  metabolic: StressLevel,
  psychological: StressLevel,
  neurological: StressLevel = 'low',
): Record<SubsystemKey, StressLevel> {
  return { autonomic, musculoskeletal, cardiometabolic, sleep, metabolic, psychological, neurological };
}

// ---------------------------------------------------------------------------
// Sport Profiles (~30)
// ---------------------------------------------------------------------------

export const SPORT_PROFILES: SportProfile[] = [
  // ======================== ENDURANCE ========================
  {
    key: 'running',
    label: 'Running',
    icon: '🏃',
    category: 'endurance',
    subsystemStress: stress('moderate', 'very_high', 'high', 'moderate', 'high', 'moderate', 'low'),
    stressMarkers: [
      { name: 'Ground Contact Load', subsystem: 'musculoskeletal', description: 'Cumulative impact from foot strikes', unit: 'rating', range: [0, 10] },
      { name: 'Eccentric Volume', subsystem: 'musculoskeletal', description: 'Downhill or hard braking volume', unit: 'rating', range: [0, 10] },
      { name: 'Cardiovascular Density', subsystem: 'cardiometabolic', description: 'Running volume over recent days', unit: 'rating', range: [0, 10] },
      { name: 'Heat/Cold Stress', subsystem: 'metabolic', description: 'Environmental temperature stress', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['musculoskeletal', 'cardiometabolic'],
    recommendedModalities: ['easyCycling', 'swimEasy', 'eccentricRecovery', 'mobilityFlow', 'yoga'],
    iaciWeightPreset: 'endurance',
  },
  {
    key: 'cycling',
    label: 'Cycling',
    icon: '🚴',
    category: 'endurance',
    subsystemStress: stress('moderate', 'high', 'very_high', 'moderate', 'high', 'low', 'moderate'),
    stressMarkers: [
      { name: 'Saddle Time', subsystem: 'musculoskeletal', description: 'Hours in cycling position', unit: 'hours', range: [0, 8] },
      { name: 'Sustained Power Load', subsystem: 'cardiometabolic', description: 'Average intensity of recent rides', unit: 'rating', range: [0, 10] },
      { name: 'Caloric Deficit Risk', subsystem: 'metabolic', description: 'Fueling adequacy during long rides', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['cardiometabolic', 'musculoskeletal'],
    recommendedModalities: ['walkingRecovery', 'yoga', 'mobilityFlow', 'swimEasy', 'mitoZone2'],
    iaciWeightPreset: 'endurance',
  },
  {
    key: 'swimming',
    label: 'Swimming',
    icon: '🏊',
    category: 'endurance',
    subsystemStress: stress('moderate', 'high', 'very_high', 'moderate', 'moderate', 'low', 'low'),
    stressMarkers: [
      { name: 'Shoulder Volume', subsystem: 'musculoskeletal', description: 'Cumulative shoulder rotation load', unit: 'rating', range: [0, 10] },
      { name: 'Aerobic Density', subsystem: 'cardiometabolic', description: 'Pool volume over recent days', unit: 'rating', range: [0, 10] },
      { name: 'Chlorine Exposure', subsystem: 'metabolic', description: 'Chemical irritant exposure in pool', unit: 'rating', range: [0, 5] },
    ],
    primaryRecoveryNeeds: ['musculoskeletal', 'cardiometabolic'],
    recommendedModalities: ['walkingRecovery', 'yoga', 'mobilityFlow', 'eccentricRecovery', 'breathworkActive'],
    iaciWeightPreset: 'endurance',
  },
  {
    key: 'triathlon',
    label: 'Triathlon',
    icon: '🏅',
    category: 'endurance',
    subsystemStress: stress('high', 'very_high', 'very_high', 'high', 'very_high', 'high', 'low'),
    stressMarkers: [
      { name: 'Multi-Discipline Load', subsystem: 'musculoskeletal', description: 'Combined swim/bike/run stress', unit: 'rating', range: [0, 10] },
      { name: 'Training Volume', subsystem: 'cardiometabolic', description: 'Total weekly training hours', unit: 'hours', range: [0, 30] },
      { name: 'Fueling Complexity', subsystem: 'metabolic', description: 'Nutritional demands across disciplines', unit: 'rating', range: [0, 10] },
      { name: 'Schedule Stress', subsystem: 'psychological', description: 'Mental load of managing 3 sports', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['musculoskeletal', 'cardiometabolic', 'metabolic'],
    recommendedModalities: ['walkingRecovery', 'yoga', 'massage', 'mitoZone2', 'breathworkActive'],
    iaciWeightPreset: 'endurance',
  },
  {
    key: 'rowing',
    label: 'Rowing',
    icon: '🚣',
    category: 'endurance',
    subsystemStress: stress('high', 'very_high', 'high', 'moderate', 'high', 'moderate', 'low'),
    stressMarkers: [
      { name: 'Back/Hip Load', subsystem: 'musculoskeletal', description: 'Posterior chain and spinal stress', unit: 'rating', range: [0, 10] },
      { name: 'Grip Fatigue', subsystem: 'musculoskeletal', description: 'Forearm and hand fatigue from handle', unit: 'rating', range: [0, 10] },
      { name: 'Cardiovascular Demand', subsystem: 'cardiometabolic', description: 'Full-body aerobic intensity', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['musculoskeletal', 'cardiometabolic'],
    recommendedModalities: ['mobilityFlow', 'yoga', 'walkingRecovery', 'eccentricRecovery', 'swimEasy'],
    iaciWeightPreset: 'endurance',
  },
  {
    key: 'xc_skiing',
    label: 'Cross-Country Skiing',
    icon: '⛷️',
    category: 'endurance',
    subsystemStress: stress('high', 'high', 'very_high', 'moderate', 'high', 'moderate', 'moderate'),
    stressMarkers: [
      { name: 'Full-Body Load', subsystem: 'musculoskeletal', description: 'Upper and lower body combined stress', unit: 'rating', range: [0, 10] },
      { name: 'Cold Exposure', subsystem: 'metabolic', description: 'Cold environment metabolic cost', unit: 'rating', range: [0, 10] },
      { name: 'Cardiovascular Demand', subsystem: 'cardiometabolic', description: 'One of the highest VO2max sports', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['cardiometabolic', 'musculoskeletal', 'metabolic'],
    recommendedModalities: ['sauna', 'yoga', 'walkingRecovery', 'mitoZone2', 'massage'],
    iaciWeightPreset: 'endurance',
  },
  {
    key: 'orienteering',
    label: 'Orienteering',
    icon: '🧭',
    category: 'endurance',
    subsystemStress: stress('moderate', 'high', 'high', 'moderate', 'moderate', 'high', 'low'),
    stressMarkers: [
      { name: 'Terrain Impact', subsystem: 'musculoskeletal', description: 'Uneven surface and elevation stress', unit: 'rating', range: [0, 10] },
      { name: 'Cognitive Load', subsystem: 'psychological', description: 'Navigation and decision-making under fatigue', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['musculoskeletal', 'psychological'],
    recommendedModalities: ['walkingRecovery', 'yoga', 'meditation', 'mobilityFlow', 'easyCycling'],
    iaciWeightPreset: 'endurance',
  },
  {
    key: 'rucking',
    label: 'Rucking',
    icon: '🎒',
    category: 'endurance',
    subsystemStress: stress('moderate', 'very_high', 'high', 'moderate', 'high', 'moderate', 'low'),
    stressMarkers: [
      { name: 'Load Carriage', subsystem: 'musculoskeletal', description: 'Pack weight and duration', unit: 'rating', range: [0, 10] },
      { name: 'Spinal Compression', subsystem: 'musculoskeletal', description: 'Vertical loading on spine', unit: 'rating', range: [0, 10] },
      { name: 'Foot/Ankle Stress', subsystem: 'musculoskeletal', description: 'Impact with added weight', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['musculoskeletal', 'cardiometabolic'],
    recommendedModalities: ['mobilityFlow', 'swimEasy', 'yoga', 'eccentricRecovery', 'massage'],
    iaciWeightPreset: 'endurance',
  },

  // ======================== COMBAT ========================
  {
    key: 'mma',
    label: 'MMA',
    icon: '🥊',
    category: 'combat',
    subsystemStress: stress('very_high', 'very_high', 'high', 'high', 'high', 'very_high', 'very_high'),
    stressMarkers: [
      { name: 'Impact Absorption', subsystem: 'musculoskeletal', description: 'Strikes, takedowns, and ground impacts received', unit: 'rating', range: [0, 10] },
      { name: 'CNS Load', subsystem: 'autonomic', description: 'Fight-or-flight activation from sparring/combat', unit: 'rating', range: [0, 10] },
      { name: 'Adrenaline/Cortisol', subsystem: 'psychological', description: 'Stress hormone load from combat intensity', unit: 'rating', range: [0, 10] },
      { name: 'Joint Stress', subsystem: 'musculoskeletal', description: 'Submissions, locks, and grappling strain', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['autonomic', 'musculoskeletal', 'psychological', 'neurological'],
    recommendedModalities: ['yoga', 'breathworkActive', 'coldExposure', 'massage', 'meditation', 'taiChi', 'redLightTherapy'],
    iaciWeightPreset: 'power',
  },
  {
    key: 'boxing',
    label: 'Boxing',
    icon: '🥊',
    category: 'combat',
    subsystemStress: stress('very_high', 'high', 'very_high', 'high', 'high', 'very_high', 'very_high'),
    stressMarkers: [
      { name: 'Head Impact', subsystem: 'autonomic', description: 'Cumulative head contact from sparring', unit: 'rating', range: [0, 10] },
      { name: 'Shoulder/Hand Load', subsystem: 'musculoskeletal', description: 'Repetitive punching strain', unit: 'rating', range: [0, 10] },
      { name: 'Anaerobic Demand', subsystem: 'cardiometabolic', description: 'Round-based high-intensity work', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['autonomic', 'musculoskeletal', 'psychological', 'neurological'],
    recommendedModalities: ['yoga', 'breathworkActive', 'walkingRecovery', 'coldExposure', 'meditation', 'redLightTherapy'],
    iaciWeightPreset: 'power',
  },
  {
    key: 'wrestling',
    label: 'Wrestling',
    icon: '🤼',
    category: 'combat',
    subsystemStress: stress('very_high', 'very_high', 'high', 'high', 'very_high', 'high', 'very_high'),
    stressMarkers: [
      { name: 'Grappling Load', subsystem: 'musculoskeletal', description: 'Full-body isometric and dynamic strain', unit: 'rating', range: [0, 10] },
      { name: 'Weight Management', subsystem: 'metabolic', description: 'Cutting and rehydration stress', unit: 'rating', range: [0, 10] },
      { name: 'CNS Demand', subsystem: 'autonomic', description: 'Explosive movements and reactive demands', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['musculoskeletal', 'autonomic', 'metabolic'],
    recommendedModalities: ['yoga', 'walkingRecovery', 'mobilityFlow', 'breathworkActive', 'massage'],
    iaciWeightPreset: 'power',
  },
  {
    key: 'judo',
    label: 'Judo',
    icon: '🥋',
    category: 'combat',
    subsystemStress: stress('high', 'very_high', 'high', 'moderate', 'moderate', 'high', 'very_high'),
    stressMarkers: [
      { name: 'Throw Impact', subsystem: 'musculoskeletal', description: 'Landing and throwing forces', unit: 'rating', range: [0, 10] },
      { name: 'Grip Fatigue', subsystem: 'musculoskeletal', description: 'Gi-grip and kumi-kata intensity', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['musculoskeletal', 'autonomic'],
    recommendedModalities: ['yoga', 'mobilityFlow', 'massage', 'walkingRecovery', 'breathworkActive'],
    iaciWeightPreset: 'power',
  },
  {
    key: 'bjj',
    label: 'Brazilian Jiu-Jitsu',
    icon: '🥋',
    category: 'combat',
    subsystemStress: stress('high', 'very_high', 'moderate', 'moderate', 'moderate', 'high', 'very_high'),
    stressMarkers: [
      { name: 'Joint Stress', subsystem: 'musculoskeletal', description: 'Submission and guard pressure on joints', unit: 'rating', range: [0, 10] },
      { name: 'Grip/Forearm Fatigue', subsystem: 'musculoskeletal', description: 'Gi and no-gi gripping demands', unit: 'rating', range: [0, 10] },
      { name: 'Cognitive Load', subsystem: 'psychological', description: 'Problem-solving under physical stress', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['musculoskeletal', 'psychological'],
    recommendedModalities: ['mobilityFlow', 'yoga', 'massage', 'walkingRecovery', 'meditation'],
    iaciWeightPreset: 'power',
  },
  {
    key: 'muay_thai',
    label: 'Muay Thai',
    icon: '🥊',
    category: 'combat',
    subsystemStress: stress('very_high', 'very_high', 'very_high', 'high', 'high', 'very_high', 'very_high'),
    stressMarkers: [
      { name: 'Shin/Limb Conditioning', subsystem: 'musculoskeletal', description: 'Kick impact and conditioning stress', unit: 'rating', range: [0, 10] },
      { name: 'Clinch Fatigue', subsystem: 'musculoskeletal', description: 'Neck, shoulder, and core from clinch work', unit: 'rating', range: [0, 10] },
      { name: 'Combat Adrenaline', subsystem: 'autonomic', description: 'Fight-or-flight sympathetic activation', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['autonomic', 'musculoskeletal', 'psychological'],
    recommendedModalities: ['yoga', 'breathworkActive', 'coldExposure', 'massage', 'walkingRecovery', 'meditation'],
    iaciWeightPreset: 'power',
  },

  // ======================== STRENGTH ========================
  {
    key: 'powerlifting',
    label: 'Powerlifting',
    icon: '🏋️',
    category: 'strength',
    subsystemStress: stress('high', 'very_high', 'moderate', 'moderate', 'high', 'high', 'moderate'),
    stressMarkers: [
      { name: 'Spinal Compression', subsystem: 'musculoskeletal', description: 'Axial loading from squats and deadlifts', unit: 'rating', range: [0, 10] },
      { name: 'CNS Demand', subsystem: 'autonomic', description: 'Maximal-effort neural drive', unit: 'rating', range: [0, 10] },
      { name: 'Grip/Tendon Load', subsystem: 'musculoskeletal', description: 'Heavy pulling stress on tendons', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['musculoskeletal', 'autonomic'],
    recommendedModalities: ['walkingRecovery', 'mobilityFlow', 'eccentricRecovery', 'massage', 'sauna'],
    iaciWeightPreset: 'power',
  },
  {
    key: 'olympic_weightlifting',
    label: 'Olympic Weightlifting',
    icon: '🏋️',
    category: 'strength',
    subsystemStress: stress('very_high', 'very_high', 'moderate', 'moderate', 'moderate', 'high', 'moderate'),
    stressMarkers: [
      { name: 'Explosive CNS Load', subsystem: 'autonomic', description: 'Maximal-speed neural demands', unit: 'rating', range: [0, 10] },
      { name: 'Overhead Stress', subsystem: 'musculoskeletal', description: 'Shoulder and wrist from snatch/jerk', unit: 'rating', range: [0, 10] },
      { name: 'Technical Concentration', subsystem: 'psychological', description: 'Mental demands of precise technique', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['autonomic', 'musculoskeletal'],
    recommendedModalities: ['walkingRecovery', 'mobilityFlow', 'yoga', 'massage', 'breathworkActive'],
    iaciWeightPreset: 'power',
  },
  {
    key: 'crossfit',
    label: 'CrossFit',
    icon: '💪',
    category: 'strength',
    subsystemStress: stress('high', 'very_high', 'very_high', 'high', 'very_high', 'high', 'moderate'),
    stressMarkers: [
      { name: 'Mixed-Modal Volume', subsystem: 'musculoskeletal', description: 'Combined lifting and gymnastics load', unit: 'rating', range: [0, 10] },
      { name: 'Glycolytic Debt', subsystem: 'metabolic', description: 'Lactate accumulation from metcons', unit: 'rating', range: [0, 10] },
      { name: 'Competition Stress', subsystem: 'psychological', description: 'Competitive intensity and ego drive', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['musculoskeletal', 'metabolic', 'cardiometabolic'],
    recommendedModalities: ['walkingRecovery', 'yoga', 'swimEasy', 'mobilityFlow', 'agtAerobic'],
    iaciWeightPreset: 'power',
  },
  {
    key: 'strongman',
    label: 'Strongman',
    icon: '🪨',
    category: 'strength',
    subsystemStress: stress('high', 'very_high', 'high', 'moderate', 'very_high', 'high', 'moderate'),
    stressMarkers: [
      { name: 'Odd Object Load', subsystem: 'musculoskeletal', description: 'Stones, yokes, and awkward implements', unit: 'rating', range: [0, 10] },
      { name: 'Spinal/Core Demand', subsystem: 'musculoskeletal', description: 'Extreme trunk stability requirements', unit: 'rating', range: [0, 10] },
      { name: 'Caloric Demand', subsystem: 'metabolic', description: 'Massive energy expenditure per session', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['musculoskeletal', 'metabolic'],
    recommendedModalities: ['walkingRecovery', 'mobilityFlow', 'swimEasy', 'massage', 'sauna'],
    iaciWeightPreset: 'power',
  },
  {
    key: 'kettlebell_sport',
    label: 'Kettlebell Sport',
    icon: '🔔',
    category: 'strength',
    subsystemStress: stress('moderate', 'high', 'high', 'moderate', 'high', 'high', 'moderate'),
    stressMarkers: [
      { name: 'Grip Endurance', subsystem: 'musculoskeletal', description: 'Sustained grip from timed sets', unit: 'rating', range: [0, 10] },
      { name: 'Posterior Chain Load', subsystem: 'musculoskeletal', description: 'Hip hinge and swing volume', unit: 'rating', range: [0, 10] },
      { name: 'Pace Discipline', subsystem: 'psychological', description: 'Mental endurance for 10-min sets', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['musculoskeletal', 'cardiometabolic', 'metabolic'],
    recommendedModalities: ['walkingRecovery', 'mobilityFlow', 'yoga', 'agtAerobic', 'swimEasy'],
    iaciWeightPreset: 'power',
  },

  // ======================== FIELD / COURT ========================
  {
    key: 'soccer',
    label: 'Soccer',
    icon: '⚽',
    category: 'field_court',
    subsystemStress: stress('moderate', 'high', 'high', 'moderate', 'moderate', 'high', 'high'),
    stressMarkers: [
      { name: 'Sprint Volume', subsystem: 'musculoskeletal', description: 'Repeated sprint and direction change load', unit: 'rating', range: [0, 10] },
      { name: 'Contact/Tackle', subsystem: 'musculoskeletal', description: 'Physical challenges and tackles', unit: 'rating', range: [0, 10] },
      { name: 'Match Intensity', subsystem: 'cardiometabolic', description: 'Game vs practice intensity', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['musculoskeletal', 'cardiometabolic'],
    recommendedModalities: ['easyCycling', 'swimEasy', 'mobilityFlow', 'yoga', 'coldExposure'],
    iaciWeightPreset: 'default',
  },
  {
    key: 'basketball',
    label: 'Basketball',
    icon: '🏀',
    category: 'field_court',
    subsystemStress: stress('moderate', 'high', 'high', 'moderate', 'moderate', 'moderate', 'high'),
    stressMarkers: [
      { name: 'Jump/Landing Load', subsystem: 'musculoskeletal', description: 'Plyometric stress from jumping', unit: 'rating', range: [0, 10] },
      { name: 'Lateral Cutting', subsystem: 'musculoskeletal', description: 'Direction change and ankle stress', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['musculoskeletal', 'cardiometabolic'],
    recommendedModalities: ['easyCycling', 'swimEasy', 'mobilityFlow', 'eccentricRecovery', 'yoga'],
    iaciWeightPreset: 'default',
  },
  {
    key: 'tennis',
    label: 'Tennis',
    icon: '🎾',
    category: 'field_court',
    subsystemStress: stress('moderate', 'high', 'high', 'moderate', 'moderate', 'high', 'moderate'),
    stressMarkers: [
      { name: 'Shoulder/Elbow Load', subsystem: 'musculoskeletal', description: 'Serve and overhead volume', unit: 'rating', range: [0, 10] },
      { name: 'Lateral Movement', subsystem: 'musculoskeletal', description: 'Side-to-side court coverage', unit: 'rating', range: [0, 10] },
      { name: 'Match Mental Load', subsystem: 'psychological', description: 'Point-by-point tactical demands', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['musculoskeletal', 'psychological'],
    recommendedModalities: ['mobilityFlow', 'yoga', 'swimEasy', 'meditation', 'massage'],
    iaciWeightPreset: 'default',
  },
  {
    key: 'rugby',
    label: 'Rugby',
    icon: '🏉',
    category: 'field_court',
    subsystemStress: stress('high', 'very_high', 'high', 'high', 'high', 'high', 'high'),
    stressMarkers: [
      { name: 'Collision Volume', subsystem: 'musculoskeletal', description: 'Tackles, rucks, and contact events', unit: 'count', range: [0, 40] },
      { name: 'CNS Impact', subsystem: 'autonomic', description: 'Head contact and collision CNS load', unit: 'rating', range: [0, 10] },
      { name: 'Sprint/Ruck Intensity', subsystem: 'cardiometabolic', description: 'Mixed anaerobic and aerobic demands', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['musculoskeletal', 'autonomic', 'cardiometabolic'],
    recommendedModalities: ['coldExposure', 'swimEasy', 'yoga', 'massage', 'walkingRecovery'],
    iaciWeightPreset: 'power',
  },
  {
    key: 'lacrosse',
    label: 'Lacrosse',
    icon: '🥍',
    category: 'field_court',
    subsystemStress: stress('moderate', 'high', 'high', 'moderate', 'moderate', 'moderate', 'high'),
    stressMarkers: [
      { name: 'Contact/Checking', subsystem: 'musculoskeletal', description: 'Body checks and stick checks', unit: 'rating', range: [0, 10] },
      { name: 'Sprint Volume', subsystem: 'cardiometabolic', description: 'Running and transition demands', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['musculoskeletal', 'cardiometabolic'],
    recommendedModalities: ['easyCycling', 'swimEasy', 'mobilityFlow', 'yoga', 'coldExposure'],
    iaciWeightPreset: 'default',
  },

  // ======================== OTHER ========================
  {
    key: 'climbing',
    label: 'Climbing',
    icon: '🧗',
    category: 'other',
    subsystemStress: stress('moderate', 'very_high', 'moderate', 'moderate', 'moderate', 'high', 'high'),
    stressMarkers: [
      { name: 'Finger/Tendon Load', subsystem: 'musculoskeletal', description: 'Crimp and open-hand strain on fingers', unit: 'rating', range: [0, 10] },
      { name: 'Shoulder Load', subsystem: 'musculoskeletal', description: 'Overhead pulling and reaching', unit: 'rating', range: [0, 10] },
      { name: 'Fear/Exposure', subsystem: 'psychological', description: 'Psychological stress from height/risk', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['musculoskeletal', 'psychological'],
    recommendedModalities: ['walkingRecovery', 'yoga', 'mobilityFlow', 'massage', 'correctiveExercise'],
    iaciWeightPreset: 'power',
  },
  {
    key: 'gymnastics',
    label: 'Gymnastics',
    icon: '🤸',
    category: 'other',
    subsystemStress: stress('high', 'very_high', 'moderate', 'moderate', 'moderate', 'very_high', 'high'),
    stressMarkers: [
      { name: 'Impact Landing', subsystem: 'musculoskeletal', description: 'Dismount and tumbling impact forces', unit: 'rating', range: [0, 10] },
      { name: 'Joint Hyperextension', subsystem: 'musculoskeletal', description: 'Wrist, elbow, and shoulder stress', unit: 'rating', range: [0, 10] },
      { name: 'Performance Pressure', subsystem: 'psychological', description: 'Routine perfection and competition anxiety', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['musculoskeletal', 'psychological', 'autonomic'],
    recommendedModalities: ['yoga', 'mobilityFlow', 'massage', 'meditation', 'walkingRecovery'],
    iaciWeightPreset: 'power',
  },
  {
    key: 'surfing',
    label: 'Surfing',
    icon: '🏄',
    category: 'other',
    subsystemStress: stress('moderate', 'high', 'moderate', 'moderate', 'moderate', 'low', 'moderate'),
    stressMarkers: [
      { name: 'Paddle Volume', subsystem: 'musculoskeletal', description: 'Shoulder and back from paddling', unit: 'rating', range: [0, 10] },
      { name: 'Cold Water Exposure', subsystem: 'autonomic', description: 'Cold water immersion effects', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['musculoskeletal', 'autonomic'],
    recommendedModalities: ['yoga', 'mobilityFlow', 'walkingRecovery', 'massage', 'breathworkActive'],
    iaciWeightPreset: 'default',
  },

  // ======================== WELLNESS ========================
  {
    key: 'general_fitness',
    label: 'General Fitness',
    icon: '💪',
    category: 'wellness',
    subsystemStress: stress('moderate', 'moderate', 'moderate', 'low', 'low', 'low', 'low'),
    stressMarkers: [
      { name: 'Overall Training Load', subsystem: 'musculoskeletal', description: 'General exercise intensity', unit: 'rating', range: [0, 10] },
      { name: 'Recovery Quality', subsystem: 'autonomic', description: 'How well you bounce back between sessions', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['musculoskeletal', 'autonomic'],
    recommendedModalities: ['walkingRecovery', 'yoga', 'mobilityFlow', 'bodyweightRecovery', 'gardening', 'dancing'],
    iaciWeightPreset: 'default',
  },
  {
    key: 'wellness_longevity',
    label: 'Wellness & Longevity',
    icon: '🧬',
    category: 'wellness',
    subsystemStress: stress('moderate', 'moderate', 'moderate', 'moderate', 'moderate', 'moderate', 'low'),
    stressMarkers: [
      { name: 'Mitochondrial Demand', subsystem: 'metabolic', description: 'Cellular energy system health and capacity', unit: 'rating', range: [0, 10] },
      { name: 'Joint Mobility', subsystem: 'musculoskeletal', description: 'Range of motion and joint health', unit: 'rating', range: [0, 10] },
      { name: 'Stress Load', subsystem: 'psychological', description: 'Cumulative life and training stress', unit: 'rating', range: [0, 10] },
      { name: 'Sleep Quality', subsystem: 'sleep', description: 'Restorative sleep for cellular repair', unit: 'rating', range: [0, 10] },
      { name: 'Cardiovascular Reserve', subsystem: 'cardiometabolic', description: 'Heart and vascular health markers', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['metabolic', 'autonomic', 'sleep'],
    recommendedModalities: [
      'mitoZone2', 'agtAerobic', 'yoga', 'taiChi', 'walkingRecovery',
      'breathworkActive', 'meditation', 'gardening', 'hiking', 'sauna',
      'coldExposure', 'mobilityFlow', 'dancing',
    ],
    iaciWeightPreset: 'older_athlete',
  },

  // ===================== NEW v2.7.0 =====================

  {
    key: 'ultramarathon',
    label: 'Ultramarathon',
    icon: '🏔️',
    category: 'endurance',
    subsystemStress: stress('high', 'very_high', 'very_high', 'high', 'very_high', 'high', 'low'),
    stressMarkers: [
      { name: 'Eccentric Muscle Damage', subsystem: 'musculoskeletal', description: 'Extreme downhill/eccentric loading over 50-100+ miles', unit: 'rating', range: [0, 10] },
      { name: 'Glycogen Depletion', subsystem: 'metabolic', description: 'Multi-hour fueling demands and caloric deficit risk', unit: 'rating', range: [0, 10] },
      { name: 'Sleep Disruption', subsystem: 'sleep', description: 'Overnight races and multi-day recovery impact', unit: 'hours_missed', range: [0, 24] },
      { name: 'Cardiac Drift', subsystem: 'cardiometabolic', description: 'Sustained cardiac output over extended duration', unit: 'bpm', range: [0, 30] },
      { name: 'Mental Fatigue', subsystem: 'psychological', description: 'Decision-making and pain tolerance over 8-30+ hours', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['musculoskeletal', 'metabolic', 'sleep'],
    recommendedModalities: [
      'walkingRecovery', 'aquaticRecovery', 'massage', 'yoga',
      'meditation', 'breathworkActive', 'eccentricRecovery', 'mobilityFlow',
      'sauna', 'coldExposure', 'easyCycling', 'swimEasy',
    ],
    iaciWeightPreset: 'endurance',
  },

  {
    key: 'biathlon',
    label: 'Biathlon',
    icon: '🎯',
    category: 'endurance',
    subsystemStress: stress('high', 'high', 'very_high', 'moderate', 'high', 'high', 'low'),
    stressMarkers: [
      { name: 'HR Suppression for Shooting', subsystem: 'autonomic', description: 'Rapid HR recovery needed for precision shooting', unit: 'bpm_drop', range: [0, 60] },
      { name: 'Aerobic Demand', subsystem: 'cardiometabolic', description: 'XC skiing at race intensity between shooting stages', unit: 'watts', range: [0, 400] },
      { name: 'Fine Motor Control', subsystem: 'psychological', description: 'Shooting precision under extreme fatigue', unit: 'rating', range: [0, 10] },
      { name: 'Cold Exposure Stress', subsystem: 'metabolic', description: 'Thermoregulation and caloric cost in cold conditions', unit: 'celsius', range: [-30, 10] },
    ],
    primaryRecoveryNeeds: ['autonomic', 'cardiometabolic', 'psychological'],
    recommendedModalities: [
      'breathworkActive', 'meditation', 'yoga', 'walkingRecovery',
      'easyCycling', 'swimEasy', 'sauna', 'massage',
      'mobilityFlow', 'taiChi',
    ],
    iaciWeightPreset: 'endurance',
  },

  {
    key: 'track_field',
    label: 'Track & Field',
    icon: '🏃‍♂️',
    category: 'field_court',
    subsystemStress: stress('high', 'very_high', 'high', 'moderate', 'moderate', 'high', 'moderate'),
    stressMarkers: [
      { name: 'Sprint/Jump Load', subsystem: 'musculoskeletal', description: 'High-velocity ground contact forces and explosive loading', unit: 'rating', range: [0, 10] },
      { name: 'CNS Fatigue', subsystem: 'autonomic', description: 'Central nervous system demand from maximal-effort repeats', unit: 'rating', range: [0, 10] },
      { name: 'Lactate Accumulation', subsystem: 'cardiometabolic', description: 'Anaerobic energy system stress from 200m-1500m events', unit: 'mmol_L', range: [0, 25] },
      { name: 'Competition Stress', subsystem: 'psychological', description: 'Performance anxiety, focus, and race execution demands', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['musculoskeletal', 'autonomic', 'psychological'],
    recommendedModalities: [
      'eccentricRecovery', 'correctiveExercise', 'mobilityFlow', 'massage',
      'coldExposure', 'yoga', 'breathworkActive', 'meditation',
      'walkingRecovery', 'swimEasy', 'aquaticRecovery',
    ],
    iaciWeightPreset: 'power',
  },

  // ===================== NEW v6.0.0 — Expanded Court/Field =====================

  {
    key: 'volleyball',
    label: 'Volleyball',
    icon: '🏐',
    category: 'field_court',
    subsystemStress: stress('moderate', 'high', 'moderate', 'low', 'moderate', 'moderate', 'moderate'),
    stressMarkers: [
      { name: 'Jump/Landing Load', subsystem: 'musculoskeletal', description: 'Repeated vertical jumps and landings', unit: 'rating', range: [0, 10] },
      { name: 'Shoulder Volume', subsystem: 'musculoskeletal', description: 'Overhead hitting and serving stress', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['musculoskeletal', 'cardiometabolic'],
    recommendedModalities: ['easyCycling', 'mobilityFlow', 'yoga', 'eccentricRecovery', 'massage'],
    iaciWeightPreset: 'default',
  },
  {
    key: 'field_hockey',
    label: 'Field Hockey',
    icon: '🏑',
    category: 'field_court',
    subsystemStress: stress('moderate', 'high', 'high', 'moderate', 'moderate', 'moderate', 'high'),
    stressMarkers: [
      { name: 'Stick Contact', subsystem: 'musculoskeletal', description: 'Stick checks and ball impact', unit: 'rating', range: [0, 10] },
      { name: 'Bent Posture', subsystem: 'musculoskeletal', description: 'Sustained flexion from low stick position', unit: 'rating', range: [0, 10] },
      { name: 'Sprint Volume', subsystem: 'cardiometabolic', description: 'High-intensity running and transitions', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['musculoskeletal', 'cardiometabolic', 'neurological'],
    recommendedModalities: ['mobilityFlow', 'yoga', 'swimEasy', 'massage', 'walkingRecovery'],
    iaciWeightPreset: 'default',
  },
  {
    key: 'ice_hockey',
    label: 'Ice Hockey',
    icon: '🏒',
    category: 'field_court',
    subsystemStress: stress('high', 'very_high', 'high', 'moderate', 'moderate', 'high', 'very_high'),
    stressMarkers: [
      { name: 'Collision/Board Check', subsystem: 'musculoskeletal', description: 'High-speed body checks and board impacts', unit: 'rating', range: [0, 10] },
      { name: 'Head Impact Risk', subsystem: 'neurological', description: 'Concussion risk from checks and falls', unit: 'rating', range: [0, 10] },
      { name: 'Sprint/Stop Intensity', subsystem: 'cardiometabolic', description: 'Anaerobic shift demands', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['musculoskeletal', 'neurological', 'autonomic'],
    recommendedModalities: ['coldExposure', 'massage', 'yoga', 'walkingRecovery', 'breathworkActive', 'redLightTherapy'],
    iaciWeightPreset: 'power',
  },
  {
    key: 'baseball',
    label: 'Baseball / Softball',
    icon: '⚾',
    category: 'field_court',
    subsystemStress: stress('low', 'high', 'moderate', 'low', 'low', 'high', 'moderate'),
    stressMarkers: [
      { name: 'Throwing Volume', subsystem: 'musculoskeletal', description: 'Shoulder and elbow stress from throwing', unit: 'rating', range: [0, 10] },
      { name: 'Sprint/Slide', subsystem: 'musculoskeletal', description: 'Base-running sprint and slide impact', unit: 'rating', range: [0, 10] },
      { name: 'Focus/Concentration', subsystem: 'psychological', description: 'Sustained attention during long games', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['musculoskeletal', 'psychological'],
    recommendedModalities: ['mobilityFlow', 'correctiveExercise', 'yoga', 'massage', 'meditation'],
    iaciWeightPreset: 'default',
  },
  {
    key: 'football',
    label: 'American Football',
    icon: '🏈',
    category: 'field_court',
    subsystemStress: stress('very_high', 'very_high', 'high', 'moderate', 'high', 'high', 'very_high'),
    stressMarkers: [
      { name: 'Collision Volume', subsystem: 'musculoskeletal', description: 'Tackles, blocks, and full-contact repetitions', unit: 'count', range: [0, 50] },
      { name: 'Head Impact', subsystem: 'neurological', description: 'Cumulative head contact from plays', unit: 'rating', range: [0, 10] },
      { name: 'Sprint/Power', subsystem: 'cardiometabolic', description: 'Repeated explosive efforts', unit: 'rating', range: [0, 10] },
      { name: 'Adrenaline Load', subsystem: 'psychological', description: 'Competition and combat stress', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['musculoskeletal', 'neurological', 'autonomic'],
    recommendedModalities: ['coldExposure', 'massage', 'yoga', 'walkingRecovery', 'breathworkActive', 'redLightTherapy', 'cognitiveRest'],
    iaciWeightPreset: 'power',
  },
  {
    key: 'cricket',
    label: 'Cricket',
    icon: '🏏',
    category: 'field_court',
    subsystemStress: stress('low', 'high', 'moderate', 'moderate', 'moderate', 'high', 'moderate'),
    stressMarkers: [
      { name: 'Bowling Load', subsystem: 'musculoskeletal', description: 'Bowling shoulder, back, and knee stress', unit: 'rating', range: [0, 10] },
      { name: 'Match Duration', subsystem: 'sleep', description: 'Long match days disrupting rest patterns', unit: 'hours', range: [0, 10] },
      { name: 'Batting Focus', subsystem: 'psychological', description: 'Sustained concentration at the crease', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['musculoskeletal', 'psychological', 'sleep'],
    recommendedModalities: ['mobilityFlow', 'yoga', 'walkingRecovery', 'meditation', 'massage'],
    iaciWeightPreset: 'default',
  },
  {
    key: 'badminton',
    label: 'Badminton',
    icon: '🏸',
    category: 'field_court',
    subsystemStress: stress('moderate', 'high', 'high', 'low', 'moderate', 'moderate', 'low'),
    stressMarkers: [
      { name: 'Overhead Volume', subsystem: 'musculoskeletal', description: 'Shoulder and wrist from smashes', unit: 'rating', range: [0, 10] },
      { name: 'Lateral Movement', subsystem: 'musculoskeletal', description: 'Quick court coverage and lunging', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['musculoskeletal', 'cardiometabolic'],
    recommendedModalities: ['mobilityFlow', 'yoga', 'swimEasy', 'correctiveExercise', 'massage'],
    iaciWeightPreset: 'default',
  },
  {
    key: 'squash',
    label: 'Squash / Racquetball',
    icon: '🎾',
    category: 'field_court',
    subsystemStress: stress('moderate', 'high', 'very_high', 'moderate', 'moderate', 'high', 'moderate'),
    stressMarkers: [
      { name: 'Court Movement', subsystem: 'musculoskeletal', description: 'Explosive lunging in enclosed court', unit: 'rating', range: [0, 10] },
      { name: 'Ball Impact Risk', subsystem: 'neurological', description: 'Ball impact in enclosed space', unit: 'rating', range: [0, 5] },
      { name: 'Anaerobic Demand', subsystem: 'cardiometabolic', description: 'High-intensity rally patterns', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['cardiometabolic', 'musculoskeletal'],
    recommendedModalities: ['easyCycling', 'mobilityFlow', 'yoga', 'massage', 'breathworkActive'],
    iaciWeightPreset: 'default',
  },
  {
    key: 'table_tennis',
    label: 'Table Tennis',
    icon: '🏓',
    category: 'field_court',
    subsystemStress: stress('low', 'moderate', 'moderate', 'low', 'low', 'high', 'low'),
    stressMarkers: [
      { name: 'Reaction Time Demand', subsystem: 'psychological', description: 'Rapid decision-making and fine motor control', unit: 'rating', range: [0, 10] },
      { name: 'Lateral Movement', subsystem: 'musculoskeletal', description: 'Quick footwork demands', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['psychological', 'musculoskeletal'],
    recommendedModalities: ['walkingRecovery', 'yoga', 'meditation', 'mobilityFlow', 'breathworkActive'],
    iaciWeightPreset: 'default',
  },
  {
    key: 'pickleball',
    label: 'Pickleball',
    icon: '🏓',
    category: 'field_court',
    subsystemStress: stress('low', 'moderate', 'moderate', 'low', 'low', 'moderate', 'low'),
    stressMarkers: [
      { name: 'Shoulder/Elbow', subsystem: 'musculoskeletal', description: 'Paddle sport repetitive strain', unit: 'rating', range: [0, 10] },
      { name: 'Lateral Movement', subsystem: 'musculoskeletal', description: 'Court coverage and quick stops', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['musculoskeletal'],
    recommendedModalities: ['mobilityFlow', 'walkingRecovery', 'yoga', 'correctiveExercise', 'massage'],
    iaciWeightPreset: 'default',
  },
  {
    key: 'fencing',
    label: 'Fencing',
    icon: '🤺',
    category: 'combat',
    subsystemStress: stress('moderate', 'high', 'moderate', 'low', 'moderate', 'high', 'moderate'),
    stressMarkers: [
      { name: 'Lunge Load', subsystem: 'musculoskeletal', description: 'Repeated lunging and recovery steps', unit: 'rating', range: [0, 10] },
      { name: 'Reaction Demand', subsystem: 'psychological', description: 'Split-second tactical decisions', unit: 'rating', range: [0, 10] },
      { name: 'Weapon Impact', subsystem: 'neurological', description: 'Touch impacts and parry forces', unit: 'rating', range: [0, 5] },
    ],
    primaryRecoveryNeeds: ['musculoskeletal', 'psychological'],
    recommendedModalities: ['mobilityFlow', 'yoga', 'walkingRecovery', 'meditation', 'correctiveExercise'],
    iaciWeightPreset: 'default',
  },
  {
    key: 'mountain_biking',
    label: 'Mountain Biking',
    icon: '🚵',
    category: 'endurance',
    subsystemStress: stress('moderate', 'high', 'high', 'moderate', 'high', 'moderate', 'high'),
    stressMarkers: [
      { name: 'Crash/Fall Risk', subsystem: 'neurological', description: 'Technical terrain crash risk and vibration', unit: 'rating', range: [0, 10] },
      { name: 'Technical Terrain', subsystem: 'musculoskeletal', description: 'Vibration and impact from rough surfaces', unit: 'rating', range: [0, 10] },
      { name: 'Sustained Power', subsystem: 'cardiometabolic', description: 'Climbing and endurance demands', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['musculoskeletal', 'cardiometabolic', 'neurological'],
    recommendedModalities: ['walkingRecovery', 'yoga', 'mobilityFlow', 'massage', 'swimEasy', 'redLightTherapy'],
    iaciWeightPreset: 'endurance',
  },
];

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

/** Get a single sport profile by key */
export function getSportProfile(key: string): SportProfile | undefined {
  return SPORT_PROFILES.find(s => s.key === key);
}

/** Get multiple sport profiles from an array of keys (multi-sport support) */
export function getSportProfiles(sportKeys: string | string[] | null | undefined): SportProfile[] {
  if (!sportKeys) return [];
  const keys = Array.isArray(sportKeys) ? sportKeys : [sportKeys];
  return keys.map(k => getSportProfile(k)).filter((s): s is SportProfile => s != null);
}

/** Derive the best IACI weight preset for multi-sport athletes */
export function deriveWeightPreset(profiles: SportProfile[]): IAWeightPreset {
  if (profiles.length === 0) return 'default';
  if (profiles.length === 1) return profiles[0].iaciWeightPreset;

  // Count presets — most common wins, with ties going to more specific presets
  const counts: Record<IAWeightPreset, number> = { default: 0, endurance: 0, power: 0, older_athlete: 0 };
  profiles.forEach(p => counts[p.iaciWeightPreset]++);

  // Older athlete always wins if any sport uses it
  if (counts.older_athlete > 0) return 'older_athlete';

  // Otherwise most common
  const sorted = (Object.entries(counts) as [IAWeightPreset, number][])
    .sort((a, b) => b[1] - a[1]);
  return sorted[0][0];
}

/** Get union of primary recovery needs across all selected sports */
export function getUnionedRecoveryNeeds(profiles: SportProfile[]): SubsystemKey[] {
  const needs = new Set<SubsystemKey>();
  profiles.forEach(p => p.primaryRecoveryNeeds.forEach(n => needs.add(n)));
  return Array.from(needs);
}

/** Get all unique stress markers across selected sports */
export function getAllStressMarkers(profiles: SportProfile[]): SportStressMarker[] {
  const seen = new Set<string>();
  const markers: SportStressMarker[] = [];
  profiles.forEach(p => {
    p.stressMarkers.forEach(m => {
      if (!seen.has(m.name)) {
        seen.add(m.name);
        markers.push(m);
      }
    });
  });
  return markers;
}
