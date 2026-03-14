/**
 * Recovery protocol types — maps to recovery_protocols table and the
 * 100 modalities from the user's Excel files.
 */

export type ProtocolSeries =
  | 'classic'
  | 'breathwork'
  | 'passive'
  | 'foam_roll'
  | 'banded'
  | 'dynamic_mobility'
  | 'aquatic'
  | 'ais'
  | 'static_stretch'
  | 'vagus_nerve';

export type ModalityType = 'passive' | 'active';

export type PrimarySystem =
  | 'muscular'
  | 'nervous'
  | 'cardiovascular'
  | 'circulatory'
  | 'joint_mobility';

export type EvidenceLevel = 'strong' | 'moderate' | 'emerging';

export type TargetArea =
  | 'legs'
  | 'quads'
  | 'hamstrings'
  | 'hips'
  | 'glutes'
  | 'knee'
  | 'calves'
  | 'shoulders'
  | 'pecs'
  | 'cervical'
  | 'thoracic'
  | 'lumbar'
  | 'back'
  | 'ankles'
  | 'wrists'
  | 'core'
  | 'full_body';

export type Benefit =
  | 'mental_clarity'
  | 'decrease_soreness'
  | 'improve_circulation'
  | 'relax_nervous_system'
  | 'restore_mobility'
  | 'enhance_flexibility'
  | 'reduce_swelling';

export type Environment = 'home' | 'gym' | 'travel' | 'pool' | 'anywhere';

export interface RecoveryProtocol {
  id: string;
  name: string;
  slug: string;
  series: ProtocolSeries;
  modalityType: ModalityType;

  cnsLowAvoid: boolean;
  offDayOnly: boolean;

  primarySystem: PrimarySystem;
  secondarySystems: PrimarySystem[];
  iaciSubsystemsTargeted: string[];

  targetAreasPrimary: TargetArea[];
  targetAreasSecondary: TargetArea[];
  benefits: Benefit[];
  equipmentNeeded: string[];

  evidenceLevel: EvidenceLevel | null;
  doseMin: string | null;
  doseSweetSpot: string | null;
  doseUpperLimit: string | null;

  instructions: string | null;
  avoidCautions: string | null;
  idealTiming: string | null;
  evidenceNotes: string | null;
  athleteTidbit: string | null;
  athleteCaution: string | null;

  protocolClasses: string[];
  phenotypesRecommended: string[];
  phenotypesAvoid: string[];
  environment: Environment[];

  /** URL to a pre-made demonstration video (MP4). null if no video available. */
  videoUrl: string | null;
}

export interface RecoveryLog {
  id: string;
  userId: string;
  protocolId: string;
  date: string;
  durationMinutes: number;
  subjectiveEffectiveness: number; // 1-5
  nextDayIaciChange: number | null;
  nextDaySubsystemChanges: Record<string, number> | null;
  createdAt: string;
}

export interface RecoveryRecommendation {
  id: string;
  userId: string;
  date: string;
  protocolClass: string;
  phenotype: string;
  protocolsRecommended: string[];
  trainingCompatibility: Record<string, string>;
  aiExplanation: string | null;
  createdAt: string;
}
