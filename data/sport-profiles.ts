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
): Record<SubsystemKey, StressLevel> {
  return { autonomic, musculoskeletal, cardiometabolic, sleep, metabolic, psychological };
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
    subsystemStress: stress('moderate', 'very_high', 'high', 'moderate', 'high', 'moderate'),
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
    subsystemStress: stress('moderate', 'high', 'very_high', 'moderate', 'high', 'low'),
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
    subsystemStress: stress('moderate', 'high', 'very_high', 'moderate', 'moderate', 'low'),
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
    subsystemStress: stress('high', 'very_high', 'very_high', 'high', 'very_high', 'high'),
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
    subsystemStress: stress('high', 'very_high', 'high', 'moderate', 'high', 'moderate'),
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
    subsystemStress: stress('high', 'high', 'very_high', 'moderate', 'high', 'moderate'),
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
    subsystemStress: stress('moderate', 'high', 'high', 'moderate', 'moderate', 'high'),
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
    subsystemStress: stress('moderate', 'very_high', 'high', 'moderate', 'high', 'moderate'),
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
    subsystemStress: stress('very_high', 'very_high', 'high', 'high', 'high', 'very_high'),
    stressMarkers: [
      { name: 'Impact Absorption', subsystem: 'musculoskeletal', description: 'Strikes, takedowns, and ground impacts received', unit: 'rating', range: [0, 10] },
      { name: 'CNS Load', subsystem: 'autonomic', description: 'Fight-or-flight activation from sparring/combat', unit: 'rating', range: [0, 10] },
      { name: 'Adrenaline/Cortisol', subsystem: 'psychological', description: 'Stress hormone load from combat intensity', unit: 'rating', range: [0, 10] },
      { name: 'Joint Stress', subsystem: 'musculoskeletal', description: 'Submissions, locks, and grappling strain', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['autonomic', 'musculoskeletal', 'psychological'],
    recommendedModalities: ['yoga', 'breathworkActive', 'coldExposure', 'massage', 'meditation', 'taiChi'],
    iaciWeightPreset: 'power',
  },
  {
    key: 'boxing',
    label: 'Boxing',
    icon: '🥊',
    category: 'combat',
    subsystemStress: stress('very_high', 'high', 'very_high', 'high', 'high', 'very_high'),
    stressMarkers: [
      { name: 'Head Impact', subsystem: 'autonomic', description: 'Cumulative head contact from sparring', unit: 'rating', range: [0, 10] },
      { name: 'Shoulder/Hand Load', subsystem: 'musculoskeletal', description: 'Repetitive punching strain', unit: 'rating', range: [0, 10] },
      { name: 'Anaerobic Demand', subsystem: 'cardiometabolic', description: 'Round-based high-intensity work', unit: 'rating', range: [0, 10] },
    ],
    primaryRecoveryNeeds: ['autonomic', 'musculoskeletal', 'psychological'],
    recommendedModalities: ['yoga', 'breathworkActive', 'walkingRecovery', 'coldExposure', 'meditation'],
    iaciWeightPreset: 'power',
  },
  {
    key: 'wrestling',
    label: 'Wrestling',
    icon: '🤼',
    category: 'combat',
    subsystemStress: stress('very_high', 'very_high', 'high', 'high', 'very_high', 'high'),
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
    subsystemStress: stress('high', 'very_high', 'high', 'moderate', 'moderate', 'high'),
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
    subsystemStress: stress('high', 'very_high', 'moderate', 'moderate', 'moderate', 'high'),
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
    subsystemStress: stress('very_high', 'very_high', 'very_high', 'high', 'high', 'very_high'),
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
    subsystemStress: stress('high', 'very_high', 'moderate', 'moderate', 'high', 'high'),
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
    subsystemStress: stress('very_high', 'very_high', 'moderate', 'moderate', 'moderate', 'high'),
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
    subsystemStress: stress('high', 'very_high', 'very_high', 'high', 'very_high', 'high'),
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
    subsystemStress: stress('high', 'very_high', 'high', 'moderate', 'very_high', 'high'),
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
    subsystemStress: stress('moderate', 'high', 'high', 'moderate', 'high', 'high'),
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
    subsystemStress: stress('moderate', 'high', 'high', 'moderate', 'moderate', 'high'),
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
    subsystemStress: stress('moderate', 'high', 'high', 'moderate', 'moderate', 'moderate'),
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
    subsystemStress: stress('moderate', 'high', 'high', 'moderate', 'moderate', 'high'),
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
    subsystemStress: stress('high', 'very_high', 'high', 'high', 'high', 'high'),
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
    subsystemStress: stress('moderate', 'high', 'high', 'moderate', 'moderate', 'moderate'),
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
    subsystemStress: stress('moderate', 'very_high', 'moderate', 'moderate', 'moderate', 'high'),
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
    subsystemStress: stress('high', 'very_high', 'moderate', 'moderate', 'moderate', 'very_high'),
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
    subsystemStress: stress('moderate', 'high', 'moderate', 'moderate', 'moderate', 'low'),
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
    subsystemStress: stress('moderate', 'moderate', 'moderate', 'low', 'low', 'low'),
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
    subsystemStress: stress('moderate', 'moderate', 'moderate', 'moderate', 'moderate', 'moderate'),
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
