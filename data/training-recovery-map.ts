/**
 * Training-for-Recovery Modality Map
 *
 * 32 training modalities (8 existing performance + 24 new recovery-focused)
 * Each maps to which subsystems it helps recover, intensity guidance,
 * evidence level, and environment requirements.
 */

import { SubsystemKey } from '../lib/types/iaci';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TrainingModalityKey =
  // Existing performance modalities (8)
  | 'zone1'
  | 'zone2'
  | 'intervals'
  | 'tempo'
  | 'strengthHeavy'
  | 'strengthLight'
  | 'techniqueDrill'
  | 'plyometrics'
  // Recovery-focused strength (3)
  | 'eccentricRecovery'
  | 'correctiveExercise'
  | 'kettlebellRecovery'
  // Bodyweight (2)
  | 'bodyweightRecovery'
  | 'calisthenicsFlow'
  // AGT (2)
  | 'agtAlactic'
  | 'agtAerobic'
  // Mitochondrial (1)
  | 'mitoZone2'
  // Mind-body (4)
  | 'yoga'
  | 'taiChi'
  | 'breathworkActive'
  | 'meditation'
  // Mobility (1)
  | 'mobilityFlow'
  // Aquatic & low-impact (4)
  | 'swimEasy'
  | 'aquaticRecovery'
  | 'walkingRecovery'
  | 'easyCycling'
  // Lifestyle & active recovery (7)
  | 'gardening'
  | 'massage'
  | 'dancing'
  | 'hiking'
  | 'sauna'
  | 'coldExposure'
  | 'playRecreation';

export type TrainingCategory =
  | 'aerobic'
  | 'strength'
  | 'bodyweight'
  | 'agt'
  | 'mitochondrial'
  | 'mind_body'
  | 'mobility'
  | 'aquatic'
  | 'low_impact'
  | 'lifestyle'
  | 'skill';

export type ModalityEnvironment = 'home' | 'gym' | 'pool' | 'outdoors' | 'anywhere' | 'studio' | 'sauna' | 'cold_plunge';

export interface TrainingRecoveryProfile {
  key: TrainingModalityKey;
  label: string;
  category: TrainingCategory;
  isPerformanceModality: boolean;
  primarySubsystems: SubsystemKey[];
  secondarySubsystems: SubsystemKey[];
  recoveryFraming: string;
  intensityGuidance: {
    recoveryZone: string;
    loadingThreshold: string;
  };
  evidenceLevel: 'strong' | 'moderate' | 'emerging';
  environment: ModalityEnvironment[];
  durationRange: { min: number; sweet: number; max: number };
  /** IACI score below which this modality should be avoided */
  iaciFloor: number;
  /** Example exercises or activities */
  examples: string[];
}

// ---------------------------------------------------------------------------
// Map
// ---------------------------------------------------------------------------

export const TRAINING_RECOVERY_MAP: Record<TrainingModalityKey, TrainingRecoveryProfile> = {
  // ===================== EXISTING PERFORMANCE (8) =====================
  zone1: {
    key: 'zone1',
    label: 'Zone 1 Easy Aerobic',
    category: 'aerobic',
    isPerformanceModality: true,
    primarySubsystems: ['cardiometabolic', 'autonomic'],
    secondarySubsystems: ['psychological'],
    recoveryFraming: 'Low-intensity movement promotes blood flow and parasympathetic activation without adding training load.',
    intensityGuidance: {
      recoveryZone: 'HR Zone 1 (50-60% max HR), conversational pace',
      loadingThreshold: 'Above Zone 2 shifts to training stimulus',
    },
    evidenceLevel: 'strong',
    environment: ['outdoors', 'gym', 'anywhere'],
    durationRange: { min: 15, sweet: 30, max: 60 },
    iaciFloor: 20,
    examples: ['Easy jog', 'Light bike', 'Walking with purpose'],
  },

  zone2: {
    key: 'zone2',
    label: 'Zone 2 Aerobic Base',
    category: 'aerobic',
    isPerformanceModality: true,
    primarySubsystems: ['cardiometabolic'],
    secondarySubsystems: ['metabolic', 'autonomic'],
    recoveryFraming: 'Moderate aerobic work enhances mitochondrial function and circulation, accelerating metabolic recovery.',
    intensityGuidance: {
      recoveryZone: 'HR Zone 2 (60-70% max HR), can speak in sentences',
      loadingThreshold: 'Above Zone 3 creates significant training load',
    },
    evidenceLevel: 'strong',
    environment: ['outdoors', 'gym'],
    durationRange: { min: 20, sweet: 45, max: 90 },
    iaciFloor: 55,
    examples: ['Steady run', 'Moderate cycling', 'Elliptical'],
  },

  intervals: {
    key: 'intervals',
    label: 'High-Intensity Intervals',
    category: 'aerobic',
    isPerformanceModality: true,
    primarySubsystems: ['cardiometabolic'],
    secondarySubsystems: ['musculoskeletal', 'metabolic'],
    recoveryFraming: 'Performance modality — only when fully recovered. Creates significant training load and glycolytic debt.',
    intensityGuidance: {
      recoveryZone: 'N/A — this is a training stimulus, not recovery',
      loadingThreshold: 'Any HIIT creates load; use only when IACI ≥70',
    },
    evidenceLevel: 'strong',
    environment: ['gym', 'outdoors'],
    durationRange: { min: 15, sweet: 25, max: 40 },
    iaciFloor: 70,
    examples: ['Track intervals', 'Spin intervals', 'Row intervals'],
  },

  tempo: {
    key: 'tempo',
    label: 'Tempo / Threshold',
    category: 'aerobic',
    isPerformanceModality: true,
    primarySubsystems: ['cardiometabolic'],
    secondarySubsystems: ['metabolic', 'musculoskeletal'],
    recoveryFraming: 'Performance modality — sustained threshold work. High glycolytic cost, not recovery-friendly.',
    intensityGuidance: {
      recoveryZone: 'N/A — this is a training stimulus, not recovery',
      loadingThreshold: 'Tempo work always creates significant load',
    },
    evidenceLevel: 'strong',
    environment: ['outdoors', 'gym'],
    durationRange: { min: 15, sweet: 30, max: 50 },
    iaciFloor: 70,
    examples: ['Tempo run', 'FTP cycling', 'Threshold rowing'],
  },

  strengthHeavy: {
    key: 'strengthHeavy',
    label: 'Heavy Resistance Training',
    category: 'strength',
    isPerformanceModality: true,
    primarySubsystems: ['musculoskeletal'],
    secondarySubsystems: ['autonomic'],
    recoveryFraming: 'Performance modality — heavy lifting creates substantial CNS and musculoskeletal load. Avoid during recovery.',
    intensityGuidance: {
      recoveryZone: 'N/A — this is a training stimulus',
      loadingThreshold: 'Above 80% 1RM always creates high load',
    },
    evidenceLevel: 'strong',
    environment: ['gym'],
    durationRange: { min: 30, sweet: 60, max: 90 },
    iaciFloor: 70,
    examples: ['Squats', 'Deadlifts', 'Bench press', 'Overhead press'],
  },

  strengthLight: {
    key: 'strengthLight',
    label: 'Light Resistance Training',
    category: 'strength',
    isPerformanceModality: true,
    primarySubsystems: ['musculoskeletal'],
    secondarySubsystems: ['cardiometabolic'],
    recoveryFraming: 'Light resistance promotes blood flow to muscles and maintains movement patterns without heavy loading.',
    intensityGuidance: {
      recoveryZone: 'RPE 3-4, 40-60% 1RM, focus on movement quality',
      loadingThreshold: 'Above 70% 1RM shifts to training stimulus',
    },
    evidenceLevel: 'strong',
    environment: ['gym', 'home'],
    durationRange: { min: 20, sweet: 35, max: 50 },
    iaciFloor: 55,
    examples: ['Light machine work', 'Band exercises', 'Cable exercises'],
  },

  techniqueDrill: {
    key: 'techniqueDrill',
    label: 'Technique / Skill Work',
    category: 'skill',
    isPerformanceModality: true,
    primarySubsystems: ['psychological'],
    secondarySubsystems: ['musculoskeletal'],
    recoveryFraming: 'Low-intensity skill work reinforces motor patterns without metabolic cost. Mentally engaging but physically easy.',
    intensityGuidance: {
      recoveryZone: 'RPE 2-3, focus on precision not effort',
      loadingThreshold: 'High rep/speed or fatigue shifts to training',
    },
    evidenceLevel: 'moderate',
    environment: ['gym', 'outdoors'],
    durationRange: { min: 15, sweet: 30, max: 45 },
    iaciFloor: 40,
    examples: ['Sport-specific drills', 'Movement skill work', 'Coordination drills'],
  },

  plyometrics: {
    key: 'plyometrics',
    label: 'Plyometrics / Explosive Work',
    category: 'strength',
    isPerformanceModality: true,
    primarySubsystems: ['musculoskeletal'],
    secondarySubsystems: ['autonomic'],
    recoveryFraming: 'Performance modality — high-impact explosive work. Significant musculoskeletal and CNS load.',
    intensityGuidance: {
      recoveryZone: 'N/A — this is a training stimulus',
      loadingThreshold: 'Any plyometric work creates substantial load',
    },
    evidenceLevel: 'strong',
    environment: ['gym', 'outdoors'],
    durationRange: { min: 10, sweet: 20, max: 30 },
    iaciFloor: 70,
    examples: ['Box jumps', 'Depth jumps', 'Bounding', 'Medicine ball throws'],
  },

  // ===================== RECOVERY-FOCUSED STRENGTH (3) =====================
  eccentricRecovery: {
    key: 'eccentricRecovery',
    label: 'Light Eccentric Work',
    category: 'strength',
    isPerformanceModality: false,
    primarySubsystems: ['musculoskeletal'],
    secondarySubsystems: ['cardiometabolic'],
    recoveryFraming: 'Slow eccentric loading at low intensity promotes muscle remodeling, tendon health, and DOMS reduction without adding training load.',
    intensityGuidance: {
      recoveryZone: 'RPE 2-3, 30-40% 1RM, 3-second negatives',
      loadingThreshold: 'Above 50% 1RM or fast tempo shifts to training',
    },
    evidenceLevel: 'strong',
    environment: ['gym', 'home'],
    durationRange: { min: 10, sweet: 20, max: 30 },
    iaciFloor: 40,
    examples: ['Slow lowering squats', 'Slow calf raises', 'Slow push-ups', 'Slow lunges'],
  },

  correctiveExercise: {
    key: 'correctiveExercise',
    label: 'Corrective & Activation',
    category: 'strength',
    isPerformanceModality: false,
    primarySubsystems: ['musculoskeletal'],
    secondarySubsystems: [],
    recoveryFraming: 'Band work, activation drills, and single-leg stability address imbalances that fatigue reveals, preventing compensation injuries.',
    intensityGuidance: {
      recoveryZone: 'RPE 2-3, light bands, focus on mind-muscle connection',
      loadingThreshold: 'Adding external load shifts to strength training',
    },
    evidenceLevel: 'moderate',
    environment: ['home', 'gym', 'anywhere'],
    durationRange: { min: 10, sweet: 15, max: 25 },
    iaciFloor: 25,
    examples: ['Glute bridges', 'Clamshells', 'Band pull-aparts', 'Single-leg balance', 'Dead bugs'],
  },

  kettlebellRecovery: {
    key: 'kettlebellRecovery',
    label: 'Light Kettlebell Flow',
    category: 'strength',
    isPerformanceModality: false,
    primarySubsystems: ['musculoskeletal', 'cardiometabolic'],
    secondarySubsystems: ['metabolic'],
    recoveryFraming: 'Light swings, TGUs, and flows at conversational intensity promote posterior chain blood flow, grip endurance, and full-body integration without isolating fatigued muscles.',
    intensityGuidance: {
      recoveryZone: 'RPE 3-4, light bell (25-50% of working weight), smooth continuous flow',
      loadingThreshold: 'Heavy bell or power output shifts to training',
    },
    evidenceLevel: 'moderate',
    environment: ['gym', 'home', 'outdoors'],
    durationRange: { min: 10, sweet: 20, max: 30 },
    iaciFloor: 40,
    examples: ['Light kettlebell swings', 'Goblet squats', 'Kettlebell deadlifts', 'Overhead press (light)', 'Farmer carries'],
  },

  // ===================== BODYWEIGHT (2) =====================
  bodyweightRecovery: {
    key: 'bodyweightRecovery',
    label: 'Light Bodyweight Circuit',
    category: 'bodyweight',
    isPerformanceModality: false,
    primarySubsystems: ['musculoskeletal', 'cardiometabolic'],
    secondarySubsystems: ['metabolic'],
    recoveryFraming: 'Push-ups, air squats, planks, and pull-ups at 50-60% effort promote blood flow and maintain movement patterns without external load. Focus on quality, not failure.',
    intensityGuidance: {
      recoveryZone: 'RPE 3-4, 50-60% effort, stop well before failure',
      loadingThreshold: 'Going to failure or adding speed shifts to training',
    },
    evidenceLevel: 'moderate',
    environment: ['home', 'gym', 'outdoors', 'anywhere'],
    durationRange: { min: 10, sweet: 20, max: 30 },
    iaciFloor: 35,
    examples: ['Push-ups', 'Air squats', 'Planks', 'Lunges', 'Pull-ups (easy)', 'High knees (gentle)'],
  },

  calisthenicsFlow: {
    key: 'calisthenicsFlow',
    label: 'Calisthenics Flow',
    category: 'bodyweight',
    isPerformanceModality: false,
    primarySubsystems: ['musculoskeletal', 'metabolic'],
    secondarySubsystems: ['cardiometabolic', 'psychological'],
    recoveryFraming: 'Flowing between bodyweight movements builds coordination, proprioception, and gentle strength endurance. The creative/playful aspect provides psychological recovery.',
    intensityGuidance: {
      recoveryZone: 'RPE 3-4, smooth transitions, focus on flow state',
      loadingThreshold: 'Max-effort holds or high reps shift to training',
    },
    evidenceLevel: 'emerging',
    environment: ['home', 'gym', 'outdoors', 'anywhere'],
    durationRange: { min: 10, sweet: 20, max: 30 },
    iaciFloor: 40,
    examples: ['Bear crawls', 'Crab walks', 'Inch worms', 'Frog jumps', 'Crawling patterns'],
  },

  // ===================== AGT (2) =====================
  agtAlactic: {
    key: 'agtAlactic',
    label: 'AGT: Alactic Power',
    category: 'agt',
    isPerformanceModality: false,
    primarySubsystems: ['metabolic', 'musculoskeletal'],
    secondarySubsystems: ['autonomic'],
    recoveryFraming: 'Short explosive efforts (5-10s) with full rest (3-5 min) train power and mitochondrial density WITHOUT glycolytic debt. The long rest allows complete phosphocreatine replenishment — zero lactate accumulation.',
    intensityGuidance: {
      recoveryZone: '5-10s max effort, 3-5 min complete rest between reps, 3-5 reps total',
      loadingThreshold: 'Shortening rest below 2 min introduces glycolytic stress',
    },
    evidenceLevel: 'moderate',
    environment: ['gym', 'outdoors'],
    durationRange: { min: 15, sweet: 25, max: 35 },
    iaciFloor: 45,
    examples: ['Short hill sprints', 'Kettlebell power swings', 'Box jumps (low volume)', 'Med ball throws'],
  },

  agtAerobic: {
    key: 'agtAerobic',
    label: 'AGT: Aerobic Repeats',
    category: 'agt',
    isPerformanceModality: false,
    primarySubsystems: ['cardiometabolic', 'metabolic'],
    secondarySubsystems: ['autonomic'],
    recoveryFraming: 'Submaximal efforts (30-60s at 70-80%) with generous rest (1:3+ work:rest) build aerobic base and mitochondrial capacity without glycolytic stress. The key: never enter the glycolytic zone.',
    intensityGuidance: {
      recoveryZone: '70-80% effort, 30-60s work, 90-180s rest, 5-8 repeats',
      loadingThreshold: 'Above 85% or rest under 1:2 ratio enters glycolytic territory',
    },
    evidenceLevel: 'moderate',
    environment: ['gym', 'outdoors'],
    durationRange: { min: 15, sweet: 25, max: 35 },
    iaciFloor: 45,
    examples: ['Bike repeats', 'Row repeats', 'Easy pace intervals', 'Swim repeats'],
  },

  // ===================== MITOCHONDRIAL (1) =====================
  mitoZone2: {
    key: 'mitoZone2',
    label: 'Zone 2 Mito Builder',
    category: 'mitochondrial',
    isPerformanceModality: false,
    primarySubsystems: ['metabolic', 'cardiometabolic'],
    secondarySubsystems: ['autonomic'],
    recoveryFraming: 'Sustained low-intensity effort at the fat-max / lactate crossover point (60-70% max HR) is the gold standard for mitochondrial biogenesis, fat oxidation, and longevity. The cellular recovery engine.',
    intensityGuidance: {
      recoveryZone: '60-70% max HR, nasal breathing, conversational, RPE 3-4',
      loadingThreshold: 'Above lactate threshold shifts to glycolytic training',
    },
    evidenceLevel: 'strong',
    environment: ['outdoors', 'gym', 'anywhere'],
    durationRange: { min: 20, sweet: 45, max: 90 },
    iaciFloor: 35,
    examples: ['Easy cycling', 'Walking briskly', 'Light jogging', 'Easy rowing', 'Elliptical'],
  },

  // ===================== MIND-BODY (4) =====================
  yoga: {
    key: 'yoga',
    label: 'Restorative Yoga',
    category: 'mind_body',
    isPerformanceModality: false,
    primarySubsystems: ['autonomic', 'sleep'],
    secondarySubsystems: ['musculoskeletal', 'psychological'],
    recoveryFraming: 'Restorative and yin yoga activate the parasympathetic nervous system, improve sleep quality, and gently restore range of motion. Deep breathing patterns enhance vagal tone.',
    intensityGuidance: {
      recoveryZone: 'Restorative/yin style, long holds, props, deep breathing',
      loadingThreshold: 'Power/vinyasa at high pace shifts to training',
    },
    evidenceLevel: 'strong',
    environment: ['home', 'studio', 'anywhere'],
    durationRange: { min: 15, sweet: 30, max: 60 },
    iaciFloor: 10,
    examples: ['Gentle stretching yoga', 'Restorative poses', 'Gentle flow', 'Guided relaxation'],
  },

  taiChi: {
    key: 'taiChi',
    label: 'Tai Chi / Qigong',
    category: 'mind_body',
    isPerformanceModality: false,
    primarySubsystems: ['autonomic', 'psychological'],
    secondarySubsystems: ['musculoskeletal', 'sleep'],
    recoveryFraming: 'Meditative movement reduces cortisol, improves balance, and activates the parasympathetic nervous system. Particularly effective for psychological recovery and stress reduction.',
    intensityGuidance: {
      recoveryZone: 'Slow, deliberate movements, focus on breath and awareness',
      loadingThreshold: 'N/A — inherently recovery-oriented',
    },
    evidenceLevel: 'moderate',
    environment: ['outdoors', 'home', 'studio', 'anywhere'],
    durationRange: { min: 10, sweet: 20, max: 40 },
    iaciFloor: 10,
    examples: ['Tai chi', 'Slow flowing movements', 'Standing meditation', 'Balance exercises'],
  },

  breathworkActive: {
    key: 'breathworkActive',
    label: 'Active Breathwork',
    category: 'mind_body',
    isPerformanceModality: false,
    primarySubsystems: ['autonomic', 'sleep'],
    secondarySubsystems: ['psychological'],
    recoveryFraming: 'Structured breathing patterns improve HRV, activate vagal tone, and shift the nervous system from sympathetic to parasympathetic dominance. Directly improves sleep onset and quality.',
    intensityGuidance: {
      recoveryZone: 'Extended exhale patterns (4-7-8, box breathing, coherent breathing)',
      loadingThreshold: 'Hyperventilation techniques (Wim Hof) create sympathetic activation',
    },
    evidenceLevel: 'strong',
    environment: ['anywhere'],
    durationRange: { min: 5, sweet: 10, max: 20 },
    iaciFloor: 5,
    examples: ['Box breathing', 'Deep belly breathing', 'Slow exhale breathing', '4-7-8 breathing'],
  },

  meditation: {
    key: 'meditation',
    label: 'Guided Meditation',
    category: 'mind_body',
    isPerformanceModality: false,
    primarySubsystems: ['psychological', 'sleep'],
    secondarySubsystems: ['autonomic'],
    recoveryFraming: 'Meditation reduces rumination, lowers cortisol, and improves sleep onset latency. Mental recovery is physical recovery — psychological stress directly impairs tissue repair.',
    intensityGuidance: {
      recoveryZone: 'Seated or lying, guided or silent, focus on awareness',
      loadingThreshold: 'N/A — inherently recovery-oriented',
    },
    evidenceLevel: 'strong',
    environment: ['anywhere'],
    durationRange: { min: 5, sweet: 15, max: 30 },
    iaciFloor: 5,
    examples: ['Body scan', 'Mindfulness meditation', 'Loving-kindness', 'Visualization'],
  },

  // ===================== MOBILITY (1) =====================
  mobilityFlow: {
    key: 'mobilityFlow',
    label: 'Dynamic Mobility',
    category: 'mobility',
    isPerformanceModality: false,
    primarySubsystems: ['musculoskeletal'],
    secondarySubsystems: ['cardiometabolic'],
    recoveryFraming: 'Moving through full range of motion without load restores joint health, reduces stiffness, and promotes synovial fluid circulation. The movement itself is medicine.',
    intensityGuidance: {
      recoveryZone: 'RPE 2-3, smooth controlled movements through full ROM',
      loadingThreshold: 'Adding load or speed shifts to training',
    },
    evidenceLevel: 'strong',
    environment: ['home', 'gym', 'anywhere'],
    durationRange: { min: 10, sweet: 15, max: 25 },
    iaciFloor: 15,
    examples: ['Hip circles', 'Shoulder circles', 'Leg swings', 'Arm crossovers', 'Trunk rotations', 'Ankle rolls'],
  },

  // ===================== AQUATIC & LOW-IMPACT (4) =====================
  swimEasy: {
    key: 'swimEasy',
    label: 'Easy Swimming',
    category: 'aquatic',
    isPerformanceModality: false,
    primarySubsystems: ['musculoskeletal', 'cardiometabolic'],
    secondarySubsystems: ['autonomic'],
    recoveryFraming: 'Water provides hydrostatic pressure that reduces swelling and supports deloaded movement. Easy laps promote circulation without impact stress.',
    intensityGuidance: {
      recoveryZone: 'Easy pace, can speak between breaths, RPE 3-4',
      loadingThreshold: 'Structured sets or threshold pace shifts to training',
    },
    evidenceLevel: 'strong',
    environment: ['pool'],
    durationRange: { min: 15, sweet: 25, max: 40 },
    iaciFloor: 30,
    examples: ['Easy freestyle', 'Backstroke', 'Mixed stroke swimming', 'Pull buoy laps'],
  },

  aquaticRecovery: {
    key: 'aquaticRecovery',
    label: 'Pool Recovery',
    category: 'aquatic',
    isPerformanceModality: false,
    primarySubsystems: ['musculoskeletal'],
    secondarySubsystems: ['autonomic', 'cardiometabolic'],
    recoveryFraming: 'Water walking, pool exercises, and contrast therapy use hydrostatic pressure and buoyancy to decompress joints and flush metabolic waste without gravitational load.',
    intensityGuidance: {
      recoveryZone: 'Water walking, gentle pool exercises, treading water',
      loadingThreshold: 'N/A — inherently recovery-oriented',
    },
    evidenceLevel: 'moderate',
    environment: ['pool'],
    durationRange: { min: 15, sweet: 20, max: 35 },
    iaciFloor: 15,
    examples: ['Water walking', 'Pool jogging', 'Underwater mobility', 'Contrast pool therapy'],
  },

  walkingRecovery: {
    key: 'walkingRecovery',
    label: 'Recovery Walking',
    category: 'low_impact',
    isPerformanceModality: false,
    primarySubsystems: ['autonomic', 'psychological'],
    secondarySubsystems: ['metabolic', 'cardiometabolic'],
    recoveryFraming: 'The universal recovery modality. Walking activates the parasympathetic nervous system, promotes gentle circulation, elevates mood, and requires zero equipment. Outdoor walking adds nature exposure benefits.',
    intensityGuidance: {
      recoveryZone: 'Conversational pace, 15-30 minutes, ideally outdoors',
      loadingThreshold: 'Power walking or uphill shifts toward Zone 1-2 training',
    },
    evidenceLevel: 'strong',
    environment: ['outdoors', 'anywhere'],
    durationRange: { min: 10, sweet: 25, max: 45 },
    iaciFloor: 5,
    examples: ['Neighborhood walk', 'Park walk', 'Post-meal walk', 'Walking meeting'],
  },

  easyCycling: {
    key: 'easyCycling',
    label: 'Easy Cycling',
    category: 'low_impact',
    isPerformanceModality: false,
    primarySubsystems: ['musculoskeletal', 'cardiometabolic'],
    secondarySubsystems: ['autonomic'],
    recoveryFraming: 'Flat, low-resistance spinning flushes the legs without impact. The concentric-only pedaling motion avoids the eccentric muscle damage that running creates.',
    intensityGuidance: {
      recoveryZone: 'RPE 2-3, light resistance, high cadence (80-100 rpm)',
      loadingThreshold: 'Resistance or effort above Zone 1 shifts to training',
    },
    evidenceLevel: 'strong',
    environment: ['outdoors', 'gym', 'home'],
    durationRange: { min: 15, sweet: 25, max: 40 },
    iaciFloor: 25,
    examples: ['Flat easy ride', 'Stationary bike spin', 'Bike commute (easy)'],
  },

  // ===================== LIFESTYLE & ACTIVE RECOVERY (7) =====================
  gardening: {
    key: 'gardening',
    label: 'Gardening & Yard Work',
    category: 'lifestyle',
    isPerformanceModality: false,
    primarySubsystems: ['psychological', 'musculoskeletal'],
    secondarySubsystems: ['metabolic', 'autonomic'],
    recoveryFraming: 'Low-intensity full-body movement combined with nature exposure, grounding, and purposeful activity. Gardening reduces cortisol, elevates mood, provides vitamin D, and involves varied movement patterns.',
    intensityGuidance: {
      recoveryZone: 'Natural pace, varied postures, take breaks as needed',
      loadingThreshold: 'Heavy landscaping or extended overhead work adds load',
    },
    evidenceLevel: 'moderate',
    environment: ['outdoors'],
    durationRange: { min: 15, sweet: 30, max: 60 },
    iaciFloor: 10,
    examples: ['Weeding', 'Planting', 'Raking', 'Lawn mowing (walk-behind)', 'Pruning', 'Watering'],
  },

  massage: {
    key: 'massage',
    label: 'Massage / Self-Massage',
    category: 'lifestyle',
    isPerformanceModality: false,
    primarySubsystems: ['musculoskeletal', 'autonomic'],
    secondarySubsystems: ['psychological', 'sleep'],
    recoveryFraming: 'Mechanical tissue work reduces muscle tension, promotes parasympathetic activation, and lowers cortisol. Both professional massage and self-massage tools (foam roller, massage gun) are effective.',
    intensityGuidance: {
      recoveryZone: 'Moderate pressure, focus on tender areas, breathe through discomfort',
      loadingThreshold: 'Aggressive deep tissue on already-damaged tissue may worsen inflammation',
    },
    evidenceLevel: 'strong',
    environment: ['home', 'studio', 'gym'],
    durationRange: { min: 10, sweet: 20, max: 60 },
    iaciFloor: 5,
    examples: ['Professional massage', 'Foam rolling', 'Massage gun', 'Tennis ball release', 'Partner massage'],
  },

  dancing: {
    key: 'dancing',
    label: 'Social / Recreational Dancing',
    category: 'lifestyle',
    isPerformanceModality: false,
    primarySubsystems: ['psychological', 'cardiometabolic'],
    secondarySubsystems: ['musculoskeletal', 'autonomic'],
    recoveryFraming: 'Joyful movement is recovery. Dancing provides light cardio, social connection, mood elevation, and creative expression without the psychological weight of structured training.',
    intensityGuidance: {
      recoveryZone: 'Social pace, for fun, not performance',
      loadingThreshold: 'Competitive or high-intensity dance becomes training',
    },
    evidenceLevel: 'emerging',
    environment: ['home', 'studio', 'anywhere'],
    durationRange: { min: 10, sweet: 30, max: 60 },
    iaciFloor: 15,
    examples: ['Social dancing', 'Kitchen dancing', 'Zumba (easy)', 'Line dancing', 'Dance class'],
  },

  hiking: {
    key: 'hiking',
    label: 'Easy Hiking / Nature Walk',
    category: 'lifestyle',
    isPerformanceModality: false,
    primarySubsystems: ['psychological', 'autonomic'],
    secondarySubsystems: ['musculoskeletal', 'cardiometabolic'],
    recoveryFraming: 'Nature exposure reduces cortisol, blood pressure, and sympathetic nervous system activation. Forest bathing research shows 2+ hours in nature creates measurable autonomic recovery.',
    intensityGuidance: {
      recoveryZone: 'Easy trails, conversational pace, enjoy the scenery',
      loadingThreshold: 'Steep terrain or heavy pack shifts toward rucking/training',
    },
    evidenceLevel: 'strong',
    environment: ['outdoors'],
    durationRange: { min: 20, sweet: 45, max: 120 },
    iaciFloor: 15,
    examples: ['Trail walk', 'Park hike', 'Forest bathing', 'Beach walk', 'Nature trail'],
  },

  sauna: {
    key: 'sauna',
    label: 'Sauna / Heat Therapy',
    category: 'lifestyle',
    isPerformanceModality: false,
    primarySubsystems: ['autonomic', 'cardiometabolic'],
    secondarySubsystems: ['musculoskeletal', 'sleep'],
    recoveryFraming: 'Heat exposure triggers heat shock proteins, promotes vasodilation and circulation, and creates a parasympathetic rebound upon cooling. Shown to improve cardiovascular health and sleep quality.',
    intensityGuidance: {
      recoveryZone: '15-20 min at 80-100°C (traditional) or 40-60 min infrared',
      loadingThreshold: 'Extended sessions (>30 min traditional) create cardiovascular stress',
    },
    evidenceLevel: 'strong',
    environment: ['sauna'],
    durationRange: { min: 10, sweet: 20, max: 30 },
    iaciFloor: 20,
    examples: ['Finnish sauna', 'Infrared sauna', 'Steam room', 'Hot tub'],
  },

  coldExposure: {
    key: 'coldExposure',
    label: 'Cold Exposure / Plunge',
    category: 'lifestyle',
    isPerformanceModality: false,
    primarySubsystems: ['autonomic', 'musculoskeletal'],
    secondarySubsystems: ['psychological', 'metabolic'],
    recoveryFraming: 'Cold water immersion activates the vagus nerve, reduces inflammation, and triggers a norepinephrine release that improves mood and alertness. Powerful autonomic reset.',
    intensityGuidance: {
      recoveryZone: '2-5 min at 10-15°C, focus on controlled breathing',
      loadingThreshold: 'Extended exposure (>10 min) or very cold (<5°C) creates excessive stress',
    },
    evidenceLevel: 'strong',
    environment: ['cold_plunge'],
    durationRange: { min: 2, sweet: 5, max: 10 },
    iaciFloor: 25,
    examples: ['Cold plunge', 'Cold shower', 'Ice bath', 'Lake/ocean swim (cold)'],
  },

  playRecreation: {
    key: 'playRecreation',
    label: 'Play & Recreation',
    category: 'lifestyle',
    isPerformanceModality: false,
    primarySubsystems: ['psychological', 'musculoskeletal'],
    secondarySubsystems: ['cardiometabolic', 'autonomic'],
    recoveryFraming: 'Unstructured play provides mental refresh, joy, and low-load varied movement. Play is the antidote to the psychological burden of structured training — it rebuilds intrinsic motivation.',
    intensityGuidance: {
      recoveryZone: 'For fun, no performance goals, stop when it stops being fun',
      loadingThreshold: 'Competitive intensity shifts to training stimulus',
    },
    evidenceLevel: 'emerging',
    environment: ['outdoors', 'home', 'anywhere'],
    durationRange: { min: 10, sweet: 30, max: 60 },
    iaciFloor: 10,
    examples: ['Frisbee', 'Catch', 'Playground', 'Pickup basketball (easy)', 'Kickball', 'Tag with kids'],
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Get all recovery-focused (non-performance) modalities */
export function getRecoveryModalities(): TrainingRecoveryProfile[] {
  return Object.values(TRAINING_RECOVERY_MAP).filter(m => !m.isPerformanceModality);
}

/** Get modalities by category */
export function getModalitiesByCategory(category: TrainingCategory): TrainingRecoveryProfile[] {
  return Object.values(TRAINING_RECOVERY_MAP).filter(m => m.category === category);
}

/** Get all modality keys */
export function getAllModalityKeys(): TrainingModalityKey[] {
  return Object.keys(TRAINING_RECOVERY_MAP) as TrainingModalityKey[];
}
