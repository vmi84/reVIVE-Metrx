# Athlete Recovery App — SME Test Plan

## 1. Test Strategy Overview

### Testing Pyramid

```
              ┌──────────────┐
              │   E2E (10%)  │  Full user flows in Expo
              ├──────────────┤
           ┌──┤ Integration  │  Hooks + Supabase + Engine
           │  │   (25%)      │
           ├──┼──────────────┤
           │  │  Unit (65%)  │  Engine, adapters, utils, stores
           └──┴──────────────┘
```

### Risk-Based Priority

| Priority | Area | Risk | Rationale |
|----------|------|------|-----------|
| **P0** | IACI Engine (composite, penalties, phenotype) | Critical | Wrong scores → wrong recovery advice → potential injury |
| **P0** | Subsystem scorers (all 6) | Critical | Feed directly into IACI; boundary errors cascade |
| **P0** | Baseline tracker | Critical | Z-score normalization affects every subsystem |
| **P1** | Penalty logic | High | Incorrect penalties shift IACI by 5-12 points |
| **P1** | Training compatibility | High | Wrong permissions could allow unsafe training |
| **P1** | Whoop field mapping | High | Incorrect data ingestion poisons all downstream scoring |
| **P1** | Protocol filtering (constraints) | High | CNS LOW → AVOID violations could harm recovery |
| **P2** | ACWR / stall detection | Medium | Informational; doesn't gate training directly |
| **P2** | CSV parser | Medium | Fallback path; used for historical imports |
| **P2** | UI component rendering | Medium | Visual correctness; no safety impact |
| **P3** | Trend analyzer | Low | Read-only analytics |
| **P3** | Offline sync stub | Low | Phase 2 feature |

---

## 2. Unit Tests

### 2.1 Math Utilities (`lib/utils/math.ts`)

```
TEST SUITE: clamp()
├── clamps value below min → returns min
├── clamps value above max → returns max
├── returns value when within range
├── handles min === max (returns that value)
├── handles negative ranges
└── handles floating point precision

TEST SUITE: rollingMean()
├── returns mean of full window
├── handles window > array length (uses full array)
├── handles single-element array
├── handles empty array → NaN or 0
└── handles window of 1 → returns last element

TEST SUITE: rollingSd()
├── returns standard deviation of window
├── floors at 0.01 (per baseline tracker convention)
├── handles all-identical values → 0 (or floor)
├── handles single-element window
└── handles negative values

TEST SUITE: normalizeToBaseline()
├── value === mean → returns 0
├── value 1 SD above → returns 1
├── value 2 SD below → returns -2
├── SD === 0 (or very small) → doesn't divide by zero
└── handles null/undefined mean gracefully

TEST SUITE: zScoreToPercent()
├── z=0 → 50
├── z=+2 → ~97-98
├── z=-2 → ~2-3
├── clamps output to 0-100
└── handles extreme z-scores (±5)

TEST SUITE: invertedZScoreToPercent()
├── z=0 → 50
├── z=+2 → ~2-3 (inverted)
├── z=-2 → ~97-98 (inverted)
└── RHR use case: higher RHR = lower score

TEST SUITE: weightedAverage()
├── equal weights → arithmetic mean
├── single component → returns that value
├── zero weight → excluded from calculation
├── all weights zero → handle gracefully
├── negative weights → defensive behavior
└── empty arrays → handle gracefully

TEST SUITE: linearTrend()
├── ascending data → positive slope
├── descending data → negative slope
├── flat data → slope ≈ 0
├── single point → slope = 0
├── empty array → handle gracefully
└── returns { slope, intercept, r2 }

TEST SUITE: exponentialMovingAverage()
├── single value → returns that value
├── constant series → returns that constant
├── alpha=1 → returns last value only
├── alpha=0 → returns first value only
└── trending series → recent values weighted more
```

### 2.2 Date Utilities (`lib/utils/date.ts`)

```
TEST SUITE: today() / daysAgo() / daysBetween()
├── today() returns YYYY-MM-DD format
├── daysAgo(0) === today()
├── daysAgo(7) is exactly 7 days before
├── daysBetween same date → 0
├── daysBetween 7 days apart → 7
├── handles month/year boundaries
└── handles leap years (Feb 29)

TEST SUITE: msToHours() / msToMinutes()
├── 3600000ms → 1 hour
├── 0ms → 0
├── fractional hours → correct decimal
└── negative values → handle gracefully
```

### 2.3 Baseline Tracker (`lib/engine/baseline-tracker.ts`)

```
TEST SUITE: computeBaseline()
├── BOUNDARY: exactly 7 samples → computes baseline
├── BOUNDARY: 6 samples → returns null (insufficient data)
├── BOUNDARY: 21 samples → uses all 21
├── BOUNDARY: 30 samples → uses only last 21
├── returns { mean, sd } with SD floored at 0.01
├── all identical values → SD = 0.01 (floor)
├── handles null values in the array (skip them)
├── handles empty array → returns null
└── ascending trend → mean reflects recency bias correctly

TEST SUITE: computeAllBaselines()
├── computes baselines for HRV, RHR, respiratory_rate, sleep_duration, strain
├── missing fields → partial baselines (only available metrics)
├── all fields present → 5 baseline objects returned
├── fewer than 7 days of data → all null
└── mixed data completeness → some baselines null, others valid
```

### 2.4 Subsystem Scorers

#### 2.4.1 Autonomic (`lib/engine/subsystems/autonomic.ts`)

```
TEST SUITE: scoreAutonomic()
├── WEIGHTS VERIFICATION:
│   ├── HRV weight = 0.30
│   ├── RHR weight = 0.20
│   ├── strain weight = 0.15
│   ├── sleep duration weight = 0.10
│   ├── sleep performance weight = 0.08
│   ├── consistency weight = 0.05
│   ├── stress weight = 0.06
│   └── fatigue weight = 0.06
│
├── SCORING LOGIC:
│   ├── HRV z-score +2 → score ≈ 97-98
│   ├── HRV z-score -2 → score ≈ 2-3
│   ├── RHR inverted: higher RHR → lower score
│   ├── High strain (>14) → lower autonomic score
│   ├── Good sleep (8h+) → higher score component
│   └── High stress (5/5) → lower score
│
├── BOUNDARY CONDITIONS:
│   ├── All inputs null → returns 50 (neutral default)
│   ├── All inputs optimal → score 90-100
│   ├── All inputs worst-case → score 0-15
│   ├── Score clamped to [0, 100]
│   └── Single input present, rest null → uses available with adjusted weights
│
├── LIMITING FACTORS:
│   ├── HRV z < -1.5 → adds "hrv_suppressed"
│   ├── RHR z > 1.5 → adds "rhr_elevated"
│   ├── Strain > 16 → adds "high_strain"
│   └── No limiting factors when all optimal
│
└── RETURN SHAPE:
    ├── key === "autonomic"
    ├── score is integer 0-100
    ├── band matches getSubsystemBand(score)
    ├── inputs record has expected keys
    └── limitingFactors is string array
```

#### 2.4.2 Musculoskeletal (`lib/engine/subsystems/musculoskeletal.ts`)

```
TEST SUITE: scoreMusculoskeletal()
├── SORENESS MAP:
│   ├── Empty soreness map → no soreness penalty
│   ├── Single region at 4/4 → heavy penalty
│   ├── Multiple regions at 2/4 → moderate penalty
│   ├── Max soreness ≥ 3 → adds limiting factor
│   ├── Average soreness calculation correct
│   └── 13 body regions all at max → worst case
│
├── STIFFNESS (1-5 scale):
│   ├── 1 (none) → high score component
│   ├── 5 (extreme) → very low score component
│   └── null → excluded from calculation
│
├── HEAVY LEGS:
│   ├── true → penalty applied
│   ├── false → no penalty
│   └── null → excluded
│
├── PAIN LOCATIONS:
│   ├── 0 locations → no penalty
│   ├── 1 location → mild penalty
│   ├── 3+ locations → severe penalty + limiting factor
│   └── pain count stored in inputs
│
├── STRAIN CARRYOVER:
│   ├── Prior day strain 0 → no carryover
│   ├── Prior day strain 21 → maximum carryover penalty
│   ├── 3-day average strain interaction
│   └── Days since strength session modifies recovery expectation
│
└── COMPOSITE:
    ├── Weights sum to ~1.0 (35+15+10+15+10+15)
    ├── All null → returns 50
    └── Score bounded [0, 100]
```

#### 2.4.3 Sleep-Circadian (`lib/engine/subsystems/sleep-circadian.ts`)

```
TEST SUITE: scoreSleepCircadian()
├── DURATION THRESHOLDS:
│   ├── 8h → 95 points
│   ├── 7h → 80 points
│   ├── 6h → 60 points
│   ├── 5h → 40 points
│   ├── <5h → interpolated below 40
│   ├── >9h → capped near 95-100
│   └── null → excluded
│
├── SLEEP PERFORMANCE (0-100%):
│   ├── 100% → maps to 100
│   ├── 50% → maps to 50
│   └── 0% → maps to 0
│
├── DEEP/REM RATIOS:
│   ├── Deep ≥20% of total → optimal
│   ├── Deep <10% → limiting factor
│   ├── REM ≥20% → optimal
│   └── REM <15% → limiting factor
│
├── DISRUPTION PENALTIES:
│   ├── Caffeine within 8h → -5 points
│   ├── Alcohol → -8 points
│   ├── Travel → -3 base + (-2 × timezone_changes)
│   ├── Multiple disruptions stack
│   └── No disruptions → no penalty
│
├── AWAKENINGS:
│   ├── 0 → optimal
│   ├── 1-2 → mild penalty
│   ├── 5+ → significant penalty
│   └── null → excluded
│
└── LATENCY:
    ├── <15 min → optimal
    ├── 15-30 min → mild penalty
    ├── >30 min → significant penalty + limiting factor
    └── null → excluded
```

#### 2.4.4 Metabolic (`lib/engine/subsystems/metabolic.ts`)

```
TEST SUITE: scoreMetabolic()
├── HYDRATION (target: 10 glasses):
│   ├── 10 → 100
│   ├── 5 → 50
│   ├── 0 → 0
│   ├── >10 → capped at 100
│   └── null → excluded
│
├── PROTEIN ADEQUACY:
│   ├── adequate (true) → high score
│   ├── inadequate (false) → penalty
│   └── null → excluded
│
├── FASTING STATE:
│   ├── fasting + high strain → penalty
│   ├── fasting + low strain → mild impact
│   └── not fasting → no effect
│
├── GI DISRUPTION:
│   ├── true → significant penalty
│   ├── false → no penalty
│   └── null → excluded
│
└── BODY MASS CHANGE:
    ├── >2% loss → dehydration flag
    ├── <1% change → normal
    └── null → excluded
```

#### 2.4.5 Cardiometabolic (`lib/engine/subsystems/cardiometabolic.ts`)

```
TEST SUITE: scoreCardiometabolic()
├── Respiratory rate z-score normalization
├── Cardio strain density calculation
├── Zone 4-5 time accumulation
├── Breathlessness subjective input
├── Exertion mismatch (RPE vs HR)
├── All inputs null → 50
└── Extreme values → clamped [0, 100]
```

#### 2.4.6 Psycho-Emotional (`lib/engine/subsystems/psycho-emotional.ts`)

```
TEST SUITE: scorePsychoEmotional()
├── Motivation (1-5) → score mapping
├── Willingness to train (1-5) → score mapping
├── Mood, mental fatigue (inverted), concentration
├── Stress (inverted), overall energy
├── All 1s → very low score
├── All 5s → very high score
├── Mixed inputs → weighted composite
└── All null → 50
```

### 2.5 Penalty Logic (`lib/engine/penalty-logic.ts`)

```
TEST SUITE: computePenalties()
├── SYSTEMIC SUPPRESSION (-8):
│   ├── autonomic=39, musculoskeletal=76 → TRIGGERS
│   ├── autonomic=40, musculoskeletal=75 → BOUNDARY: does NOT trigger (< vs ≤)
│   ├── autonomic=41, musculoskeletal=74 → does NOT trigger
│   └── verify penalty name and value in result
│
├── TISSUE RISK (-5):
│   ├── musculoskeletal=34, autonomic=56 → TRIGGERS
│   ├── musculoskeletal=35, autonomic=55 → BOUNDARY
│   └── musculoskeletal=36, autonomic=54 → does NOT trigger
│
├── RESTORATION DEFICIT (-10):
│   ├── sleep=39 → TRIGGERS
│   ├── sleep=40 → BOUNDARY
│   └── sleep=41 → does NOT trigger
│
├── FUELING RISK (-5):
│   ├── metabolic=44, cardiometabolic=61 → TRIGGERS
│   ├── metabolic=45, cardiometabolic=60 → BOUNDARY
│   └── metabolic=46, cardiometabolic=59 → does NOT trigger
│
├── ILLNESS CAUTION (-12):
│   ├── cardiometabolic=39 → TRIGGERS
│   ├── cardiometabolic=40 → BOUNDARY
│   └── cardiometabolic=41 → does NOT trigger
│
├── MULTI-SYSTEM IMPAIRMENT (-8):
│   ├── 2 subsystems at 39 → TRIGGERS
│   ├── 1 subsystem at 39 → does NOT trigger
│   ├── 3 subsystems at 39 → still -8 (not stacked)
│   └── exactly 2 at boundary (40) → BOUNDARY
│
├── STACKING:
│   ├── all 6 penalties trigger simultaneously → total = -48
│   ├── no penalties trigger → total = 0
│   └── IACI cannot go below 0 after penalties
│
└── RETURN SHAPE:
    ├── returns PenaltyResult[] array
    ├── each has { name, value, reason }
    └── empty array when no penalties
```

### 2.6 IACI Composite (`lib/engine/iaci-composite.ts`)

```
TEST SUITE: computeIACI()
├── BASIC COMPUTATION:
│   ├── all subsystems at 80 → IACI ≈ 80 (weighted average)
│   ├── all subsystems at 50 → IACI ≈ 50
│   ├── all subsystems at 100 → IACI = 100, tier = "perform"
│   ├── all subsystems at 0 → IACI = 0, tier = "protect"
│   └── verify weight application: autonomic(0.25) + MSK(0.20) + cardio(0.15) + sleep(0.15) + metabolic(0.15) + psych(0.10) = 1.00
│
├── WEIGHT PRESETS:
│   ├── DEFAULT weights sum to 1.0
│   ├── ENDURANCE weights sum to 1.0
│   ├── POWER weights sum to 1.0
│   ├── OLDER_ATHLETE weights sum to 1.0
│   └── each preset changes relative importance correctly
│
├── PENALTY APPLICATION:
│   ├── base score 75, penalty -10 → IACI = 65
│   ├── base score 15, penalty -20 → IACI = 0 (clamped)
│   ├── penalties reduce score but don't change subsystem values
│   └── penalties listed in result.penalties array
│
├── TIER CLASSIFICATION:
│   ├── IACI 85 → "perform"
│   ├── IACI 84 → "train" (boundary)
│   ├── IACI 70 → "train"
│   ├── IACI 69 → "maintain" (boundary)
│   ├── IACI 55 → "maintain"
│   ├── IACI 54 → "recover" (boundary)
│   ├── IACI 35 → "recover"
│   ├── IACI 34 → "protect" (boundary)
│   └── IACI 0 → "protect"
│
├── PROTOCOL CLASS:
│   ├── IACI 80+ → Class A
│   ├── IACI 65-79 → Class B
│   ├── IACI 50-64 → Class C
│   ├── IACI 35-49 → Class D
│   └── IACI <35 → Class E
│
└── RETURN SHAPE:
    ├── composite: number (0-100)
    ├── subsystems: all 6 SubsystemScore objects
    ├── penalties: PenaltyResult[]
    ├── phenotype: Phenotype object
    ├── protocolClass: ProtocolClass
    ├── readinessTier: ReadinessTier
    ├── trainingCompatibility: TrainingCompatibility
    └── timestamp: ISO string
```

### 2.7 Phenotype Classifier (`lib/engine/phenotype-classifier.ts`)

```
TEST SUITE: classifyPhenotype()
├── PRIORITY ORDER (highest first):
│
├── 1. ILLNESS_RISK:
│   ├── autonomic<35 AND cardio<40 AND psych<45 → illness_risk
│   ├── autonomic=35 → BOUNDARY (does not trigger)
│   ├── autonomic=34, cardio=39, psych=44 → triggers
│   └── takes precedence over all others
│
├── 2. SLEEP_DRIVEN_SUPPRESSION:
│   ├── sleep<40 AND autonomic<60 AND MSK>50 → sleep_driven
│   ├── sleep=40 → BOUNDARY
│   └── only fires if illness_risk did NOT fire
│
├── 3. UNDER_FUELED:
│   ├── metabolic<45 AND autonomic>50 AND MSK>50 → under_fueled
│   ├── metabolic=45 → BOUNDARY
│   └── autonomic must be decent (>50) — distinguishes from central suppression
│
├── 4. CENTRALLY_SUPPRESSED:
│   ├── autonomic<50 AND MSK>65 AND sleep<55 → centrally_suppressed
│   ├── "body feels fine but CNS is down"
│   └── autonomic=50 → BOUNDARY
│
├── 5. LOCALLY_FATIGUED:
│   ├── autonomic>65 AND MSK<55 → locally_fatigued
│   ├── "CNS fine but body is sore"
│   └── verify training guidance: avoid loaded movement, allow cardio
│
├── 6. ACCUMULATED_FATIGUE:
│   ├── autonomic<60 AND MSK<60 AND cardio<65 → accumulated_fatigue
│   ├── "everything mildly suppressed"
│   └── moderate overall reduction
│
├── 7. FULLY_RECOVERED (fallback):
│   ├── all ≥ thresholds (70/70/65/60/55/55) → fully_recovered
│   ├── the ONLY positive phenotype
│   └── fires when no other condition matches
│
├── EDGE CASES:
│   ├── scores on exact boundaries of multiple phenotypes → highest priority wins
│   ├── all subsystems at 50 → should match accumulated_fatigue (not fully_recovered)
│   ├── all subsystems at 75 → fully_recovered
│   └── adversarial: tweak one score to flip phenotype
│
└── RETURN SHAPE:
    ├── key: PhenotypeKey
    ├── label: human-readable string
    ├── description: explanation
    └── limitingSubsystems: string[]
```

### 2.8 Training Compatibility (`lib/engine/training-compatibility.ts`)

```
TEST SUITE: getTrainingCompatibility()
├── BASE PERMISSIONS BY TIER:
│   ├── perform (≥85): all 8 types = "recommended"
│   ├── train (70-84): easy/tempo/strength = "recommended", intervals/plyo = "allowed"
│   ├── maintain (55-69): easy = "recommended", most = "caution"
│   ├── recover (35-54): easy = "allowed", most = "avoid"
│   └── protect (<35): all = "avoid"
│
├── PHENOTYPE OVERRIDES:
│   ├── centrally_suppressed → intervals="avoid", tempo="avoid", plyo="avoid"
│   ├── locally_fatigued → strength="caution", plyo="avoid"
│   ├── illness_risk → ALL = "avoid" except "rest"
│   ├── under_fueled → high intensity = "caution"
│   └── fully_recovered → no overrides (base permissions stand)
│
├── PERMISSION LEVELS:
│   ├── "recommended" > "allowed" > "caution" > "avoid"
│   ├── override can only REDUCE permission, never increase
│   └── "avoid" is absolute — phenotype override cannot be overridden
│
├── TRAINING TYPES COVERED:
│   ├── easy_run, tempo_run, interval_run, long_run
│   ├── strength, plyometrics, cross_train, rest
│   └── all 8 must be present in output
│
└── SAFETY CRITICAL:
    ├── illness_risk + intervals → MUST be "avoid"
    ├── centrally_suppressed + plyo → MUST be "avoid"
    ├── protect tier + any intensity → MUST be "avoid"
    └── never recommend high intensity when IACI < 55
```

### 2.9 Protocol Engine (`lib/engine/protocol-engine.ts`)

```
TEST SUITE: getRecommendedProtocols()
├── PHENOTYPE → PROTOCOL MAPPING:
│   ├── illness_risk → vagus_nerve, breathwork, sleep protocols
│   ├── centrally_suppressed → breathwork, passive modalities
│   ├── locally_fatigued → foam_roll, aquatic, ais
│   ├── sleep_driven → sleep protocols, vagus_nerve, breathwork
│   ├── under_fueled → (metabolic guidance, not modalities)
│   ├── accumulated_fatigue → mix of all modalities
│   └── fully_recovered → dynamic_mobility, classic (performance-oriented)
│
├── CONSTRAINT ENFORCEMENT:
│   ├── CNS LOW + cnsLowAvoid=true → protocol EXCLUDED
│   ├── Non-off-day + offDayOnly=true → protocol EXCLUDED
│   ├── both constraints active → both enforced
│   └── neither constraint → protocol included
│
└── PROTOCOL CLASS FILTERING:
    ├── Class A protocols only shown when IACI ≥ 80
    ├── Class E protocols shown when IACI < 35
    └── class matches readiness tier
```

### 2.10 Progress Tracker (`lib/engine/progress-tracker.ts`)

```
TEST SUITE: computeACWR()
├── 7 days acute / 28 days chronic
├── acute = chronic → ACWR = 1.0
├── acute = 0, chronic > 0 → ACWR = 0
├── chronic = 0 → handle division by zero
├── ACWR < 0.8 → "undertraining"
├── ACWR 0.8-1.3 → "sweet_spot"
├── ACWR 1.3-1.5 → "danger"
├── ACWR > 1.5 → "overreaching"
├── boundary: ACWR = 0.8 exactly
├── boundary: ACWR = 1.3 exactly
└── boundary: ACWR = 1.5 exactly

TEST SUITE: computeMonotony()
├── monotony = mean(daily_load) / SD(daily_load)
├── identical daily loads → SD ≈ 0 → very high monotony
├── varied loads → lower monotony
├── threshold: 2.0 (above = monotonous)
├── boundary: monotony = 2.0 exactly
└── empty data → handle gracefully

TEST SUITE: detectStall()
├── STALL TYPES:
│   ├── vo2max_plateau: 8+ weeks, change < 0.5
│   ├── pace_stagnation: 42+ days, no improvement
│   ├── hrv_stagnation: slope < -2 over 14 days
│   ├── training_monotony: monotony > 2.0
│   └── overreaching: ACWR > 1.5
│
├── ALTERNATIVES:
│   ├── each stall type has 13+ alternative approaches
│   ├── alternatives array is populated when stall detected
│   └── no stall → empty alternatives
│
└── EDGE CASES:
    ├── insufficient data → no stall detected
    ├── multiple simultaneous stalls → all reported
    └── stall just resolved → correctly reports no stall
```

### 2.11 Inflammation Score (`lib/engine/inflammation-score.ts`)

```
TEST SUITE: computeInflammationScore()
├── COMPOSITE WEIGHTS:
│   ├── wearable proxies: 0.35
│   ├── self-reported: 0.40
│   └── lab markers: 0.25
│
├── WEARABLE PROXIES:
│   ├── elevated RHR → higher inflammation
│   ├── suppressed HRV → higher inflammation
│   ├── elevated respiratory rate → higher inflammation
│   └── all normal → inflammation score low
│
├── LAB MARKERS:
│   ├── hs-CRP within normal → low score
│   ├── hs-CRP elevated → high score
│   ├── missing markers → excluded from average
│   └── all markers optimal → score near 0
│
└── COMPOSITE:
    ├── all sources low → composite low
    ├── all sources high → composite high
    ├── mixed (wearable high, lab low) → moderate
    └── no data → handle gracefully
```

---

## 3. Integration Tests

### 3.1 IACI Pipeline End-to-End

```
TEST SUITE: Full IACI Pipeline
├── SCENARIO: Optimal athlete day
│   ├── Input: HRV +1.5σ, RHR -0.5σ, 8.5h sleep, 95% perf, no soreness,
│   │         motivation 5/5, hydration 10/10, strain 8
│   ├── Expected: IACI 85-95, phenotype=fully_recovered, tier=perform,
│   │            class=A, all training types "recommended"
│   └── Verify: no penalties, no limiting factors
│
├── SCENARIO: Post-marathon recovery (day 1)
│   ├── Input: HRV -2σ, RHR +1.5σ, 6h sleep, strain 21, max soreness 4/4
│   │         in quads+hamstrings+calves, heavy legs=true, motivation 2/5
│   ├── Expected: IACI 15-30, phenotype=accumulated_fatigue, tier=protect,
│   │            class=E, all training "avoid"
│   └── Verify: multiple penalties (systemic, tissue, multi-system)
│
├── SCENARIO: Sleep-deprived but physically fresh
│   ├── Input: 4.5h sleep, 40% perf, but HRV normal, no soreness,
│   │         good nutrition, motivation 3/5
│   ├── Expected: phenotype=sleep_driven_suppression
│   ├── Verify: restoration deficit penalty (-10)
│   └── Verify: sleep protocols recommended, not foam rolling
│
├── SCENARIO: CNS suppressed, body fine
│   ├── Input: HRV -1.5σ, RHR +1σ, but no soreness, good sleep (7h),
│   │         high stress (5/5), low motivation (2/5)
│   ├── Expected: phenotype=centrally_suppressed
│   ├── Verify: intervals/tempo/plyo = "avoid"
│   └── Verify: breathwork and passive modalities recommended
│
├── SCENARIO: Under-fueled athlete
│   ├── Input: hydration 3/10, no protein, fasting, but decent HRV,
│   │         no soreness, good sleep
│   ├── Expected: phenotype=under_fueled
│   └── Verify: fueling risk penalty (-5) triggers
│
├── SCENARIO: Illness onset
│   ├── Input: HRV -2.5σ, RHR +2σ, respiratory rate elevated,
│   │         fatigue 5/5, motivation 1/5, psych 30
│   ├── Expected: phenotype=illness_risk, tier=protect
│   ├── Verify: illness caution penalty (-12)
│   └── SAFETY: ALL training = "avoid"
│
├── SCENARIO: Locally fatigued (leg day aftermath)
│   ├── Input: HRV normal, good sleep, but soreness 4/4 in quads/hams,
│   │         stiffness 4/5, heavy legs
│   ├── Expected: phenotype=locally_fatigued
│   ├── Verify: strength/plyo = "caution"/"avoid"
│   └── Verify: easy cardio still "allowed" or "recommended"
│
├── SCENARIO: Data-sparse day (first week, minimal wearable data)
│   ├── Input: only 3 days of baseline, subjective entries only
│   ├── Expected: IACI ≈ 50 (neutral), conservative guidance
│   └── Verify: no crash, graceful degradation
│
└── SCENARIO: Boundary walk — score on exact phenotype threshold
    ├── Craft inputs to land autonomic=35, cardio=40, psych=45
    ├── Verify: phenotype is NOT illness_risk (all at boundary)
    ├── Shift autonomic to 34 → NOW triggers illness_risk
    └── Confirm single-point change flips classification
```

### 3.2 Whoop Sync → IACI Pipeline

```
TEST SUITE: Whoop Data → IACI
├── Mock Whoop API response → verify CanonicalPhysiologyRecord mapping
├── Verify HRV conversion: hrv_rmssd_milli / 1000
├── Verify sleep stage → duration: total_in_bed - total_awake
├── Verify strain → day_strain aggregation across workouts
├── Verify kJ → kcal conversion: kJ / 4.184
├── Verify zone duration mapping to hr_zones object
├── Empty Whoop response → graceful handling (no crash, error message)
├── Partial Whoop response (sleep but no recovery) → partial sync
└── Token expired → error state, prompt re-auth
```

### 3.3 Protocol Filtering Integration

```
TEST SUITE: Protocol Recommendations
├── IACI 90, fully_recovered → Class A protocols, all series available
├── IACI 30, illness_risk → Class E only, vagus_nerve and breathwork
├── CNS LOW (autonomic < 40) + cnsLowAvoid protocols → correctly excluded
│   ├── Cold tank (cnsLowAvoid=true) → NOT shown
│   ├── Normatec (cnsLowAvoid=false) → shown
│   └── Vibration plate (cnsLowAvoid=true) → NOT shown
├── Off day + offDayOnly protocols → included
├── Training day + offDayOnly protocols → excluded
└── 80 protocols loaded → filter reduces to 5-15 recommendations
```

---

## 4. Whoop Adapter Tests

### 4.1 API Client (`lib/adapters/whoop/api-client.ts`)

```
TEST SUITE: WhoopApiClient
├── CONSTRUCTOR:
│   ├── No args → uses env vars
│   └── With options → uses provided values
│
├── OAUTH:
│   ├── getAuthUrl() → valid URL with correct params
│   ├── exchangeCode() → mock token exchange
│   └── refreshToken() → mock token refresh
│
├── DATA ENDPOINTS (mocked):
│   ├── getRecovery() → returns WhoopRecoveryRecord[]
│   ├── getSleep() → returns WhoopSleepRecord[], filters naps
│   ├── getWorkouts() → returns WhoopWorkoutRecord[]
│   ├── getCycles() → returns WhoopCycleRecord[]
│   └── pagination: handles next_token correctly
│
├── ERROR HANDLING:
│   ├── 401 → throws auth error
│   ├── 429 → rate limit handling
│   ├── 500 → throws server error
│   ├── network timeout → throws timeout error
│   └── malformed JSON → throws parse error
│
└── SPORT MAP:
    ├── sportName(0) → "Running"
    ├── sportName(1) → "Cycling"
    ├── sportName(-1) → "Activity" (fallback)
    └── sportName(999) → "Activity" (unknown)
```

### 4.2 CSV Parser (`lib/adapters/whoop/csv-parser.ts`)

```
TEST SUITE: parseWhoopCSV()
├── HAPPY PATH:
│   ├── Standard Whoop export format → correct CanonicalPhysiologyRecord[]
│   ├── All 20+ columns present → all fields mapped
│   └── Multiple rows → multiple records
│
├── HEADER VARIATIONS:
│   ├── "HRV (ms)" vs "HRV" vs "Heart Rate Variability"
│   ├── "RHR (bpm)" vs "Resting Heart Rate"
│   ├── "Sleep Duration (min)" vs "Total Sleep (min)"
│   └── case-insensitive matching
│
├── DATA HANDLING:
│   ├── Empty cells → null values
│   ├── Non-numeric values → null or skip
│   ├── Date format variations (MM/DD/YYYY, YYYY-MM-DD)
│   ├── Minutes → milliseconds conversion
│   └── Percentage strings ("85%") → numeric (85)
│
├── EDGE CASES:
│   ├── Empty CSV → empty array
│   ├── Header-only CSV → empty array
│   ├── Single row → single record
│   ├── 365 rows → 365 records (performance)
│   └── Malformed CSV → graceful error
│
└── ENCODING:
    ├── UTF-8 with BOM → handles correctly
    ├── Windows line endings (CRLF) → handles correctly
    └── Mac line endings (CR) → handles correctly
```

### 4.3 Webhook Handler

```
TEST SUITE: handleWhoopWebhook()
├── recovery.updated → processes recovery data
├── sleep.updated → processes sleep data
├── workout.updated → processes workout data
├── unknown event type → logs warning, no error
├── invalid payload → returns 400
├── missing user_id → returns 400
└── signature validation (if applicable)
```

---

## 5. Store Tests

```
TEST SUITE: authStore
├── setSession() → updates session and user
├── setProfile() → stores profile data
├── signOut() → clears all auth state
└── initial state is null/empty

TEST SUITE: dailyStore
├── setIACIResult() → stores result, marks computed
├── setCheckedIn() → updates boolean
├── setWhoopSynced() → updates boolean
├── reset() → clears daily state
└── state isolation between days

TEST SUITE: syncStore
├── setSyncInProgress() → updates sync flag
├── setLastWhoopSync() → stores timestamp
├── setSyncError() → stores error message
└── clearError() → resets error state

TEST SUITE: workoutStore
├── setActiveWorkout() → stores workout
├── addRecentWorkout() → appends to list
├── clearActiveWorkout() → removes current
└── recent workouts capped at reasonable limit
```

---

## 6. Component Tests (React Native Testing Library)

```
TEST SUITE: IACIRing
├── renders score text centered in ring
├── ring color matches tier (green/blue/yellow/orange/red)
├── score 0 → ring empty, "Protect" label
├── score 100 → ring full, "Perform" label
├── score 72 → partial fill, "Train" label
└── animates on score change (if applicable)

TEST SUITE: SubsystemBars
├── renders 6 bars with correct labels
├── bar widths proportional to scores (0-100)
├── bar colors match bands (highly_recovered=green, etc.)
├── handles all scores at 0 → all bars empty
└── handles all scores at 100 → all bars full

TEST SUITE: BodyMap
├── renders 13 body regions
├── tap cycles 0→1→2→3→4→0
├── color changes with severity level
├── onChange callback fires with region map
└── initialValues pre-fills correctly

TEST SUITE: Slider
├── renders discrete dots for range
├── tapping dot selects value
├── onChange fires with correct value
├── disabled state prevents interaction
└── labels display correctly

TEST SUITE: PhenotypeCard
├── renders phenotype label and description
├── shows limiting subsystem tags
├── different phenotypes show different colors
└── fully_recovered shows positive styling

TEST SUITE: TrainingCompatCard
├── renders 8 training types
├── "recommended" → green indicator
├── "allowed" → blue indicator
├── "caution" → yellow indicator
├── "avoid" → red indicator
└── illness_risk → all red
```

---

## 7. Screen Tests

```
TEST SUITE: Morning Check-in Flow
├── Step 1: Energy + Sleep quality sliders render
├── Step 2: Body map renders, tap registers soreness
├── Step 3: Motivation, stress, mental fatigue sliders
├── Step 4: Hydration, electrolytes, protein, caffeine, alcohol
├── Step 5: Travel, GI flags
├── "Next" advances steps correctly
├── "Back" returns to previous step
├── Submit creates subjective_entry in Supabase
├── < 90 second completion target (measure interaction count)
└── Skip optional steps → defaults applied

TEST SUITE: Dashboard
├── Pre-checkin state → shows CTA button
├── Post-checkin → shows IACI ring + all cards
├── Whoop connected → auto-syncs on load
├── Whoop not connected → shows setup prompt
├── Loading state → skeleton/spinner
└── Error state → error message + retry

TEST SUITE: Recovery Hub
├── "Recommended" tab → filtered protocols
├── "All" tab → 80 protocols
├── Series tabs → filtered by series
├── CNS warning badges visible on constrained protocols
├── Protocol card tap → detail view
└── "Log Protocol" → creates recovery_log entry
```

---

## 8. Database Tests (Supabase)

```
TEST SUITE: Migrations
├── All 15 migrations apply without errors
├── Tables created with correct columns and types
├── RLS enabled on all user-data tables
├── Indexes exist on (user_id, date) for key tables
├── UNIQUE constraints enforced (e.g., user_id + date)
└── Trigger creates profile on auth.users insert

TEST SUITE: RLS Policies
├── User A cannot read User B's daily_physiology
├── User A can read own daily_physiology
├── User A can insert own rows
├── User A can update own rows
├── Unauthenticated user cannot read any data
└── recovery_protocols table → readable by all authenticated users

TEST SUITE: Seed Data
├── seed.sql executes without errors
├── 80 recovery_protocols inserted
├── 56 exercises inserted
├── 16 inflammation_marker_defs inserted
├── All slugs are unique
├── All required fields non-null
└── Array fields are valid PostgreSQL arrays
```

---

## 9. Edge Function Tests

```
TEST SUITE: coaching-explain
├── Valid IACI result → returns Claude explanation
├── Missing API key → returns rule-based fallback
├── Rate limiting → appropriate error response
└── Malformed request → 400 error

TEST SUITE: whoop-webhook
├── Valid recovery.updated event → upserts daily_physiology
├── Valid workout.updated event → upserts workouts
├── Invalid event → 400 error
├── Missing auth → 401 error
└── Idempotent: same event twice → no duplicates

TEST SUITE: compute-trends
├── Valid user_id → returns trend data for 4 periods
├── No data → returns empty trends
├── Missing user_id → 400 error
└── Unauthorized → 401 error
```

---

## 10. Performance & Load Tests

```
TEST SUITE: Performance
├── IACI computation time < 50ms for single day
├── 90-day trend analysis < 200ms
├── Protocol filtering (80 protocols) < 10ms
├── CSV parse of 365 rows < 500ms
├── Baseline computation (21 days) < 20ms
├── Phenotype classification < 5ms
├── Penalty computation < 5ms
└── Full pipeline (sync → compute → render) < 2s

TEST SUITE: Memory
├── 90-day data load < 5MB in memory
├── Protocol list (80 items) < 500KB
├── No memory leaks on repeated IACI computations
└── Store updates don't create unbounded history
```

---

## 11. Security Tests

```
TEST SUITE: Auth & Data Isolation
├── Tokens stored in SecureStore (not AsyncStorage)
├── Whoop tokens not exposed in logs or error messages
├── RLS prevents cross-user data access
├── Edge function API keys not embedded in client bundle
├── .env not committed to git (.gitignore verified)
└── No PII in error reporting

TEST SUITE: Input Validation
├── Soreness values outside 0-4 → clamped or rejected
├── RPE values outside 1-10 → clamped or rejected
├── Negative durations → rejected
├── SQL injection via string fields → parameterized queries (Supabase handles)
└── XSS via notes fields → not applicable (native app)
```

---

## 12. Regression Test Matrix

| Change | Tests to Run |
|--------|-------------|
| Subsystem weight change | All 6 subsystem unit tests, IACI composite, all integration scenarios |
| New penalty rule | Penalty logic suite, IACI composite, phenotype boundary tests |
| New phenotype | Phenotype classifier, protocol mapping, training compat, all integration |
| New protocol added | Protocol engine, filtering, seed.sql validation |
| Whoop API field change | API client, CSV parser, sync hook, field mapping integration |
| New subsystem added | All composite tests, weight validation, phenotype thresholds |
| Tier threshold change | IACI composite, training compat, protocol class tests |
| UI component change | Component render tests, screen tests for that component |

---

## 13. Test Tooling Recommendations

| Layer | Tool | Rationale |
|-------|------|-----------|
| Unit (engine/utils) | **Jest** | Pure TypeScript functions, fast, no React dependency |
| Hooks | **@testing-library/react-hooks** | Test hooks in isolation with mock providers |
| Components | **@testing-library/react-native** | Render + interact with RN components |
| Stores | **Jest** | Zustand stores are plain functions |
| E2E | **Maestro** or **Detox** | Full device/simulator flows |
| Database | **pgTAP** or **Supabase CLI test** | Migration + RLS policy verification |
| Edge Functions | **Deno test** | Native Deno testing for edge functions |
| API Mocking | **MSW (Mock Service Worker)** | Mock Whoop API responses |
| Coverage | **Jest --coverage** | Track coverage by module |

### Coverage Targets

| Module | Target | Rationale |
|--------|--------|-----------|
| `lib/engine/` | **95%+** | Safety-critical scoring logic |
| `lib/adapters/` | **90%+** | Data integrity at ingestion boundary |
| `lib/utils/` | **95%+** | Foundation math; errors propagate everywhere |
| `hooks/` | **80%+** | Integration glue; hard to test in isolation |
| `components/` | **70%+** | Visual; snapshot + interaction tests |
| `app/` (screens) | **60%+** | Covered mostly by E2E flows |
| `store/` | **90%+** | Simple state; easy to test exhaustively |
