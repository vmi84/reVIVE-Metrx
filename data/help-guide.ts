/**
 * Help Guide — Comprehensive explanation of every card, metric, and concept in the app.
 *
 * Used by:
 * 1. Settings > Help Guide screen
 * 2. Per-screen help buttons (? icon)
 * 3. AI Assistant training context
 */

export interface HelpEntry {
  id: string;
  screen: 'home' | 'recovery' | 'effort' | 'trends' | 'settings' | 'checkin' | 'general';
  title: string;
  summary: string;
  detail: string;
  whyItMatters: string;
  howToUse: string;
}

export const HELP_GUIDE: HelpEntry[] = [
  // ═══ HOME SCREEN ═══
  {
    id: 'iaci-score',
    screen: 'home',
    title: 'IACI Score',
    summary: 'Your Integrated Athlete Condition Index — a 0-100 composite readiness score.',
    detail: 'IACI combines data from 6 body subsystems (autonomic, musculoskeletal, cardiometabolic, sleep, metabolic, psychological) into a single number. It uses both objective data from your wearable device (HRV, RHR, sleep, strain) and subjective data from your morning check-in (energy, soreness, stress, etc.).',
    whyItMatters: 'Unlike device recovery scores that only look at HRV and sleep, IACI considers your whole body — including muscle fatigue, mental state, nutrition, and training load. This gives you a more complete picture of your readiness.',
    howToUse: 'Check your IACI score each morning after your check-in. Green (85+) means you\'re ready for high-intensity training. Blue (70-84) is good for moderate training. Yellow (55-69) suggests maintenance only. Orange (35-54) means focus on recovery. Red (<35) means protect and rest.',
  },
  {
    id: 'device-recovery',
    screen: 'home',
    title: 'Device Recovery Score',
    summary: 'Your wearable device\'s recovery percentage (e.g., Whoop Recovery).',
    detail: 'This score comes directly from your connected device. For Whoop, it\'s calculated from HRV, RHR, sleep performance, and respiratory rate. It represents your autonomic nervous system\'s readiness.',
    whyItMatters: 'The device score is objective — it\'s based on actual physiological measurements, not how you feel. Comparing it to your IACI score shows where subjective and objective assessments agree or disagree.',
    howToUse: 'When IACI and device recovery agree, you can be confident in your readiness assessment. When they disagree (e.g., device says recovered but IACI is low), look at which subsystems are dragging your IACI down — that\'s where your body needs attention.',
  },
  {
    id: 'readiness-tier',
    screen: 'home',
    title: 'Readiness Tier',
    summary: 'Your training readiness category: Perform, Train, Maintain, Recover, or Protect.',
    detail: 'Based on your IACI score: Perform (85+) — all systems go; Train (70-84) — good for most training; Maintain (55-69) — keep it moderate; Recover (35-54) — active recovery only; Protect (<35) — prioritize rest.',
    whyItMatters: 'This is the quick answer to "what should I do today?" It tells you the intensity ceiling for safe, productive training.',
    howToUse: 'Match your planned training to your tier. Competitive athletes with coach-led plans can push slightly beyond these guidelines, but should prioritize recovery modalities that target their lowest-scoring subsystems.',
  },
  {
    id: 'subsystem-scores',
    screen: 'home',
    title: 'Subsystem Scores',
    summary: 'Individual 0-100 scores for each of your 6 body systems.',
    detail: 'The 6 subsystems are: Autonomic (HRV, stress response), Musculoskeletal (soreness, stiffness, tissue readiness), Cardiometabolic (cardiovascular capacity, respiratory function), Sleep (duration, quality, circadian health), Metabolic (hydration, nutrition, fueling), and Psychological (motivation, mental fatigue, stress).',
    whyItMatters: 'Your overall score might be fine, but one subsystem could be compromised. For example, great HRV but high soreness means you could do cardio but should avoid heavy leg work. The subsystem breakdown tells you WHERE your body needs attention.',
    howToUse: 'Look for the lowest-scoring subsystem — that\'s your limiting factor today. The app will recommend recovery modalities that specifically target it.',
  },
  {
    id: 'phenotype',
    screen: 'home',
    title: 'Condition Phenotype',
    summary: 'A descriptive label for your current recovery state pattern.',
    detail: 'There are 7 phenotypes: Fully Recovered, Locally Fatigued (muscles tired but CNS fine), Centrally Suppressed (HRV low but muscles OK), Sleep-Driven Suppression, Accumulated Fatigue (multi-system strain), Under-Fueled, and Illness Risk.',
    whyItMatters: 'The phenotype tells you WHY your score is what it is, not just the number. "Locally Fatigued" after heavy squats is very different from "Centrally Suppressed" from chronic stress — they need completely different recovery strategies.',
    howToUse: 'Read the phenotype description on your daily card. It explains your limiting factors and drives the specific recovery protocols recommended on the Recovery tab.',
  },
  {
    id: 'training-compatibility',
    screen: 'home',
    title: 'Training Compatibility',
    summary: 'A table showing which training types are recommended, allowed, cautioned, or should be avoided today.',
    detail: 'Lists zones (Z1-Z5), strength types, technique drills, and plyometrics with color-coded permissions. Green = recommended, Blue = allowed, Yellow = caution (reduce intensity), Red = avoid.',
    whyItMatters: 'This prevents you from doing training your body can\'t handle today. Pushing into "avoid" zones risks injury, overtraining, or undermining recovery.',
    howToUse: 'Check this before your workout. If your planned training is in yellow/red, consider modifying intensity or swapping to a green/blue alternative. Competitive athletes: your thresholds are more permissive than recreational athletes.',
  },
  {
    id: 'whoop-data',
    screen: 'home',
    title: 'Wearable Device Data',
    summary: 'Objective biometric data synced from your connected wearable.',
    detail: 'Includes HRV (heart rate variability in ms), RHR (resting heart rate), sleep duration and performance %, day strain, SpO2, skin temperature deviation, and respiratory rate. Data syncs automatically when you open the app.',
    whyItMatters: 'These are the objective inputs that anchor your IACI score. HRV is the single most important recovery biomarker — higher HRV means better autonomic recovery. Trends in these metrics over time show whether your training and recovery strategies are working.',
    howToUse: 'Pull down on the Home screen to refresh and sync the latest data. Check the Trends tab to see how these metrics change over time.',
  },

  // ═══ RECOVERY TAB ═══
  {
    id: 'recovery-protocols',
    screen: 'recovery',
    title: 'Recovery Protocols',
    summary: 'Evidence-based recovery modalities recommended based on your IACI score and phenotype.',
    detail: 'Protocols are categorized by evidence level (Strong, Moderate, Emerging) and grouped by type (classic modalities like cold immersion, foam rolling series, mobility flows, breathwork, etc.). Each protocol has specific dosing guidance, timing recommendations, and cautions.',
    whyItMatters: 'Not all recovery is equal. The app matches protocols to YOUR specific needs based on which subsystems need the most support. A "Locally Fatigued" athlete needs foam rolling and circulation work, not meditation.',
    howToUse: 'Browse the recommended protocols and tap for details. Each includes sample exercises (linked to the Exercise Library with video demos), recovery zone guidance, duration, and loading thresholds to avoid turning recovery into training.',
  },
  {
    id: 'rpe-guidance',
    screen: 'recovery',
    title: 'RPE Guidance',
    summary: 'Recommended Rate of Perceived Exertion for each activity, on a 1-10 scale.',
    detail: 'RPE 1-2/10 = very light (walking, gentle stretching). RPE 3-5/10 = light to moderate (easy jog, yoga). RPE 6-8/10 = hard (threshold work, heavy lifting). RPE 9-10/10 = maximal. Recovery activities should typically be RPE 1-3/10.',
    whyItMatters: 'Recovery activities done too hard become training — they add stress instead of reducing it. The RPE guidance ensures you stay in the recovery zone.',
    howToUse: 'When doing any recommended recovery activity, keep your effort at or below the recommended RPE. If the activity feels harder than the guidance suggests, reduce intensity or switch to something lighter.',
  },

  // ═══ EFFORT TAB ═══
  {
    id: 'effort-flow',
    screen: 'effort',
    title: 'Effort Guide Overview',
    summary: 'Log your workout, then get personalized post-workout recovery options.',
    detail: 'The Effort tab follows a 3-step flow: (1) See what training is compatible today, (2) Log what you\'re doing or did, (3) Get recovery recommendations specific to that workout, filtered by your available time, location, and equipment.',
    whyItMatters: 'Different workouts create different recovery needs. A hard interval session needs different recovery than an easy long run. By logging your actual workout, the app tailors recovery to what you actually did.',
    howToUse: 'Enter your workout type, duration, and intensity zones. Recovery options appear automatically. Use the time filter to find options that fit your schedule. Tap any option to see details and video demos in the Exercise Library.',
  },
  {
    id: 'workout-zones',
    screen: 'effort',
    title: 'Training Zones',
    summary: 'Heart rate / intensity zones from Z1 (easy) to Z5 (maximal).',
    detail: 'Z1 (Easy/Recovery) = light effort, conversational. Z2 (Aerobic) = moderate effort, sustainable for long periods. Z3 (Tempo) = comfortably hard, race-pace effort. Z4 (Threshold) = hard, lactate threshold. Z5 (VO2max) = very hard, maximal oxygen uptake pace.',
    whyItMatters: 'The zones you train in determine the physiological stress on your body and therefore what recovery you need. Z4-Z5 creates much more systemic stress than Z1-Z2.',
    howToUse: 'When logging your workout, select the zones you trained in. The recovery recommendations will adapt — harder sessions trigger more aggressive recovery suggestions.',
  },

  // ═══ TRENDS TAB ═══
  {
    id: 'recovery-trend',
    screen: 'trends',
    title: 'Recovery Trend Chart',
    summary: 'Your IACI score and device recovery plotted over time, with additional metrics.',
    detail: 'Shows multiple data series: IACI Score (blue), Device Recovery (green), HRV normalized (orange), Sleep hours (purple), RHR inverted (red), Physical Feel (green), Mental Feel (blue). Tap any legend item to show/hide that series.',
    whyItMatters: 'Trends are more valuable than single-day numbers. A steadily declining IACI over 2 weeks means your training load is outpacing your recovery, even if today\'s score looks OK. Conversely, an upward trend means your recovery strategies are working.',
    howToUse: 'Use the period selector (7d/21d/28d/90d) to zoom in or out. Hide irrelevant series by tapping their legend. Compare IACI to device recovery — when they diverge, it highlights which aspects of recovery are lagging.',
  },
  {
    id: 'acwr',
    screen: 'trends',
    title: 'Acute:Chronic Workload Ratio (ACWR)',
    summary: 'Compares your recent training load (7 days) to your longer-term average (28 days).',
    detail: 'ACWR = acute load / chronic load. Green zone (0.8-1.3 recreational, 0.8-1.5 competitive) = sweet spot for building fitness safely. Yellow = caution, elevated injury risk. Red = danger zone, high overtraining/injury risk. Gray (<0.8) = undertraining, potential detraining.',
    whyItMatters: 'ACWR is the #1 predictor of training-related injuries. Rapid spikes in training load (ACWR > 1.5) dramatically increase injury risk. The ratio helps you manage training progression safely.',
    howToUse: 'Keep your ACWR in the green zone. If it\'s trending yellow/red, reduce training volume for a few days. If it\'s gray, you\'re not training enough to maintain fitness. Competitive athletes have a wider sweet spot (up to 1.5) because their bodies are adapted to higher loads.',
  },

  // ═══ CHECK-IN ═══
  {
    id: 'morning-checkin',
    screen: 'checkin',
    title: 'Morning Check-In',
    summary: '10 quick inputs that feed your IACI score — takes about 20 seconds.',
    detail: 'Physical inputs: Energy (1-5), Sleep Quality (1-5), Soreness (1-5, inverted), Stiffness (1-5, inverted), Heavy Legs (Y/N), Cramping (Y/N). Mental/Nutrition: Motivation (1-5), Stress (1-5, inverted), Mental Fatigue (1-5, inverted), Hydration (liters). Plus Readiness as an overall validation.',
    whyItMatters: 'These subjective inputs capture what your device can\'t measure — how your muscles feel, your mental state, your nutrition status. Combined with device data, they give the IACI engine a complete picture.',
    howToUse: 'Do this first thing each morning, before training. Be honest — the score is for YOU, not anyone else. If you feel great, say so. If you\'re wrecked, the app needs to know to give you the right recommendations.',
  },

  // ═══ SETTINGS ═══
  {
    id: 'athlete-mode',
    screen: 'settings',
    title: 'Athlete Mode',
    summary: 'Self-Directed (recreational) vs Coach-Led (competitive) — changes how the app calculates readiness and recommendations.',
    detail: 'Self-Directed: Standard thresholds (Perform at 85+, Train at 70+). The app prescribes training and recovery. Coach-Led: Relaxed thresholds (Perform at 75+, Train at 60+), reduced penalties, more permissive training compatibility. The app focuses on recovery between your coached sessions.',
    whyItMatters: 'Competitive athletes with coaches train through recovery scores that would concern recreational athletes. The app needs to know your context to give appropriate guidance — not overly conservative for competitive athletes, not too aggressive for beginners.',
    howToUse: 'Set this in Settings > Training Mode. If you follow a coach\'s plan or training program (TrainingPeaks, etc.), choose Coach-Led. If you decide your own training day-to-day, choose Self-Directed.',
  },
  {
    id: 'preferred-activities',
    screen: 'settings',
    title: 'Preferred Recovery Activities',
    summary: 'Your top 3 preferred recovery activities — these get priority in recommendations.',
    detail: 'Choose your favorite recovery modalities from the full list (e.g., Easy Running, Walking, Yoga, Foam Rolling). The app prioritizes these in your recovery recommendations, ensuring the suggestions align with what you actually enjoy and have access to.',
    whyItMatters: 'The best recovery plan is the one you actually do. If you love running and hate swimming, recommending pool recovery is counterproductive. Your preferences ensure recommendations are actionable.',
    howToUse: 'Set in Settings > Preferred Recovery Activities. Rank your top 3. These will appear first in recovery recommendations. You\'ll still see other options, but your preferences are weighted highest.',
  },
  {
    id: 'equipment-environment',
    screen: 'settings',
    title: 'Equipment & Environment',
    summary: 'Filters recovery recommendations to only what you can actually do.',
    detail: 'Equipment: foam roller, resistance bands, kettlebells, treadmill, bike, sauna, cold plunge, etc. Environment: home, gym, outdoors, pool. If you don\'t have a pool, aquatic recovery won\'t be recommended.',
    whyItMatters: 'Recommending cold plunge recovery when you don\'t have access to one is useless. This filter ensures every recommendation is actionable with your actual setup.',
    howToUse: 'Set in your Athlete Profile during onboarding, or update anytime in Settings > Edit Athlete Profile.',
  },
];

/** Get help entries for a specific screen */
export function getHelpForScreen(screen: HelpEntry['screen']): HelpEntry[] {
  return HELP_GUIDE.filter(e => e.screen === screen);
}

/** Get a specific help entry by ID */
export function getHelpEntry(id: string): HelpEntry | undefined {
  return HELP_GUIDE.find(e => e.id === id);
}

/** Get all help content as a single string for AI assistant training */
export function getHelpGuideAsContext(): string {
  return HELP_GUIDE.map(e =>
    `## ${e.title}\n${e.summary}\n\n${e.detail}\n\n**Why it matters:** ${e.whyItMatters}\n\n**How to use:** ${e.howToUse}`
  ).join('\n\n---\n\n');
}
