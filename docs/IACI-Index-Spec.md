# IACI (Integrated Athlete Condition Index) — Technical Specification

> Version 6.0.1 | Last updated: 2026-03-21

## 1. Architecture Overview

**5-Level Hierarchy:**

```
Level 1: Raw Inputs (wearable + subjective + lab)
    ↓
Level 2: 7 Subsystem Scorers → scores 0-100 each
    ↓
Level 3: Weighted Composite → base score 0-100
    ↓
Level 3.5: Penalties → final IACI score 0-100
    ↓
Level 4: Phenotype Classification → 1 of 8 condition states
    ↓
Level 5: Protocol Prescription → tier + class + 39 modality permissions + ranked recommendations
```

**Outputs per computation:**
- `score`: 0-100 (final, after penalties)
- `readinessTier`: perform | train | maintain | recover | protect
- `protocolClass`: A | B | C | D | E
- `phenotype`: 1 of 8 condition states
- `trainingCompatibility`: 39 modalities × 4 permission levels
- `recommendedTraining`: top 8 ranked modalities with RPE, duration, examples
- `confidence`: 0-1 reliability estimate
- `driverAnalysis`: root cause identification + actionable insight
- `trendContext`: 7-day trajectory (improving/stable/declining)
- `permutationKey`: analytics fingerprint (band × trend × confidence × driver)

---

## 2. Data Sources & Sensor Inventory

### 2a. Apple HealthKit (iOS only, local on-device)

| Metric | HealthKit Type | Sampling | Apple Watch Required |
|--------|---------------|----------|---------------------|
| HRV (SDNN) | HKQuantityTypeIdentifierHeartRateVariabilitySDNN | Periodic | Yes |
| Resting Heart Rate | HKQuantityTypeIdentifierRestingHeartRate | Daily | Yes |
| Blood Oxygen (SpO2) | HKQuantityTypeIdentifierOxygenSaturation | Periodic | Yes (Series 6+) |
| Respiratory Rate | HKQuantityTypeIdentifierRespiratoryRate | Periodic | Yes |
| Heart Rate | HKQuantityTypeIdentifierHeartRate | Continuous (5s during activity) | Yes |
| Body Temperature | HKQuantityTypeIdentifierBodyTemperature | Periodic | Yes (Series 8+) |
| Sleep Analysis | HKCategoryTypeIdentifierSleepAnalysis | Per session | Yes (stages require iOS 16+) |
| Workouts | HKWorkoutType | Per activity | No (phone accelerometer) |
| Active Energy | HKQuantityTypeIdentifierActiveEnergyBurned | Continuous | No |

**iOS permissions requested (read-only):**
```
NSHealthShareUsageDescription: "reVIVE Metrx reads your health data (HRV, heart rate,
sleep, workouts, blood oxygen, respiratory rate) to calculate your recovery score and
personalized training recommendations."
```

**Sleep staging support:**
- iOS 16+: DEEP, REM, CORE (light), AWAKE — full staging
- iOS 15: ASLEEP, INBED, AWAKE — duration only, no staging

### 2b. Whoop API (iOS + Android, cloud API)

| Metric | Endpoint | Sampling | Unique to Whoop |
|--------|----------|----------|-----------------|
| Recovery Score (0-100) | /v2/recovery | Daily | Yes |
| HRV (RMSSD) | /v2/recovery | Daily | No |
| Resting Heart Rate | /v2/recovery | Daily | No |
| SpO2 | /v2/recovery | Daily (nullable) | No |
| Skin Temperature | /v2/recovery | Daily (nullable) | No |
| Sleep Stages | /v2/activity/sleep | Per session | No |
| Sleep Performance % | /v2/activity/sleep | Per session | Yes |
| Sleep Consistency % | /v2/activity/sleep | Per session | Yes |
| Sleep Efficiency % | /v2/activity/sleep | Per session | Yes |
| Day Strain (0-21) | /v2/cycle | Daily | Yes |
| Workout Strain (0-21) | /v2/activity/workout | Per workout | Yes |
| HR Zones (6 zones) | /v2/activity/workout | Per workout | No |

**OAuth scopes:** `read:recovery read:sleep read:workout read:cycles read:profile`

### 2c. Morning Check-In (Manual, both platforms)

**Tier 1 — Quick Core (~10 seconds):**
| Field | Scale | Maps to Subsystem |
|-------|-------|-------------------|
| energy | 1-5 | Psychological |
| sleep_quality | 1-5 | Sleep |
| soreness | 1-5 | Musculoskeletal |
| readiness | 1-5 | Psychological |

**Tier 2 — Detailed (optional, expands per section):**

| Section | Fields | Maps to |
|---------|--------|---------|
| Neuromuscular | soreness_map (per region), stiffness (1-5), heavy_legs (bool), motivation (1-5) | Musculoskeletal |
| Neurological | cognitive_clarity (1-5), reaction_time (1-5), coordination (1-5), headache (bool+severity), dizziness (bool), numbness (bool+location), light_noise_sensitivity (bool), recent_head_impact (bool+days), visual_disturbance (bool) | Neurological |
| Mental/Stress | stress (1-5), mental_fatigue (1-5) | Psychological, Autonomic |
| Nutritional | hydration (glasses), electrolytes (bool), protein_adequate (bool), late_caffeine (bool), late_alcohol (bool), cramping (bool+location), gi_disruption (1-5) | Metabolic |
| Illness | feeling_ill (bool), symptoms (multi-select), heat_illness (bool), heat_symptoms (multi-select) | Penalties |
| Travel | is_traveling (bool) | Sleep |

**Total subjective fields:** 40+

### 2d. Multi-Device Merge Strategy

When multiple sources provide data for the same day:
- **Primary device** (user-selected): overwrites all fields
- **Secondary device**: fill-nulls only (never overwrites existing primary data)
- Example: Whoop primary (has strain score), HealthKit secondary (fills SpO2 if Whoop null)

---

## 3. Subsystem Scorers (Level 2)

Each subsystem independently scores 0-100. Default when no data: **50** (except neurological: **65**).

### 3a. Autonomic (weight: 0.23 default)

| Component | Weight | Input | Formula |
|-----------|--------|-------|---------|
| HRV vs baseline | 0.30 | hrvRmssd + 21d baseline | zScoreToPercent(normalized) |
| RHR vs baseline | 0.20 | restingHeartRate + 21d baseline | invertedZScore (lower RHR = better) |
| 3-day strain | 0.15 | threeDayAvgStrain + baseline | invertedZScore (lower strain = better) |
| Sleep duration | 0.10 | sleepDurationMs | ratio to 8h target, clamped |
| Sleep performance | 0.08 | sleepPerformancePct | direct 0-100 |
| Sleep consistency | 0.05 | sleepConsistencyPct | direct 0-100 |
| Stress (inverted) | 0.06 | subjectiveStress (1-5) | (6 - value) × 20 |
| Fatigue (inverted) | 0.06 | perceivedFatigue (1-5) | (6 - value) × 20 |

**Limiting factors:** HRV < 50, RHR elevated, high strain, short sleep, high stress/fatigue

### 3b. Musculoskeletal (weight: 0.18 default)

| Component | Weight | Input | Formula |
|-----------|--------|-------|---------|
| Soreness composite | 0.35 | soreness map (per region) | 100 - (avgSoreness×15 + maxSoreness×10) |
| Stiffness | 0.15 | stiffness (1-5) | (6 - value) × 20 |
| Heavy legs | 0.10 | boolean | true → 30, false → 85 |
| Cramping | 0.12 | boolean | true → 20, false → 90 |
| Pain locations | 0.15 | string[] | 90 - count × 20 |
| Prior day strain | 0.10 | 0-21 | 100 - strain × 5 |
| Days since strength | 0.08 | days | 0d→40, 1d→60, 2d→80, 3+→90 |
| Days since HIIT | 0.07 | days | 0d→45, 1d→65, 2d→82, 3+→90 |

### 3c. Cardiometabolic (weight: 0.14 default)

| Component | Weight | Input | Formula |
|-----------|--------|-------|---------|
| Respiratory rate vs baseline | 0.20 | respiratoryRate + baseline | invertedZScore |
| 72h cardio strain | 0.18 | recentCardioStrainTotal | 100 - strain × 1.5 |
| Zone 4-5 time (72h) | 0.15 | timeInZone4_5_72h_ms | 100 - minutes × 1.2 |
| Breathlessness | 0.12 | 1-5 subjective | (6 - value) × 20 |
| Exertion mismatch | 0.10 | boolean | true → 35, false → 80 |
| Days since intervals | 0.10 | days | 0d→35, 1d→55, 2d→75, 3+→88 |
| Aerobic density (72h) | 0.08 | hours | 100 - hours × 8 |
| RHR vs baseline | 0.07 | resting HR + baseline | invertedZScore |

### 3d. Sleep / Circadian (weight: 0.14 default)

| Component | Weight | Input | Formula |
|-----------|--------|-------|---------|
| Duration | 0.25 | sleepDurationMs | ≥8h→95, ≥7h→80, ≥6h→60, ≥5h→40, <5h→20 |
| Performance | 0.18 | sleepPerformancePct | direct 0-100 |
| Consistency | 0.10 | sleepConsistencyPct | direct 0-100 |
| Deep sleep ratio | 0.10 | deepSleepMs / totalSleepMs | (ratio / 0.20) × 80 |
| REM sleep ratio | 0.08 | remSleepMs / totalSleepMs | (ratio / 0.25) × 80 |
| Awakenings | 0.07 | count | 100 - count × 10 |
| Sleep latency | 0.05 | sleepLatencyMs | ≤15m→90, ≤30m→70, ≤45m→50, >45m→30 |
| Subjective quality | 0.07 | 1-5 | value × 20 |

**Disruption penalties (subtracted from total):** late caffeine -5, late alcohol -8, late heavy meal -3, traveling -3 + timezone×2

### 3e. Metabolic (weight: 0.14 default)

| Component | Weight | Input | Formula |
|-----------|--------|-------|---------|
| Hydration | 0.25 | glasses (target: 10) | (glasses / 10) × 90 |
| Electrolytes | 0.15 | boolean | true → 85, false → 55 |
| Protein adequacy | 0.20 | boolean | true → 88, false → 45 |
| Fasting state | 0.10 | boolean | true → 40, false → 80 |
| GI disruption | 0.15 | 1-5 | (6 - value) × 20 |
| Post-workout fueling | 0.10 | boolean | true → 85, false → 50 |
| Body mass change | 0.05 | kg | |change|<0.5→85, drop>1kg→40 |

### 3f. Psychological (weight: 0.09 default)

| Component | Weight | Input | Formula |
|-----------|--------|-------|---------|
| Motivation | 0.20 | 1-5 | value × 20 |
| Willingness to train | 0.20 | 1-5 | value × 20 |
| Mood | 0.15 | 1-5 | value × 20 |
| Mental fatigue (inv) | 0.15 | 1-5 | (6 - value) × 20 |
| Concentration | 0.10 | 1-5 | value × 20 |
| Stress (inverted) | 0.10 | 1-5 | (6 - value) × 20 |
| Overall energy | 0.10 | 1-5 | value × 20 |

### 3g. Neurological (weight: 0.08 default)

| Component | Weight | Input | Formula |
|-----------|--------|-------|---------|
| Cognitive clarity | 0.25 | 1-5 | value × 20 |
| Reaction time | 0.20 | 1-5 | value × 20 |
| Coordination/balance | 0.15 | 1-5 | value × 20 |
| Headache/pressure | 0.15 | bool + severity 1-5 | no headache → 90; with → 85 - severity×15 |
| Dizziness/vertigo | 0.10 | boolean | true → 25, false → 90 |
| Light/noise sensitivity | 0.05 | boolean | true → 30, false → 85 |
| Numbness/tingling | 0.05 | boolean | true → 35, false → 90 |
| Visual disturbance | 0.05 | boolean | true → 15, false → 90 |

**Concussion protocol override:** If `recentHeadImpact=true` AND (days<7 OR dizziness OR visual disturbance OR severe headache) → score capped at **25**.

---

## 4. Weight Presets

All presets sum to exactly 1.0.

| Subsystem | Default | Endurance | Power | Older Athlete |
|-----------|---------|-----------|-------|---------------|
| Autonomic | 0.23 | 0.20 | 0.20 | 0.25 |
| Musculoskeletal | 0.18 | 0.14 | **0.23** | 0.15 |
| Cardiometabolic | 0.14 | **0.20** | 0.11 | 0.12 |
| Sleep | 0.14 | 0.15 | 0.14 | **0.16** |
| Metabolic | 0.14 | 0.14 | 0.15 | 0.12 |
| Psychological | 0.09 | 0.10 | 0.10 | 0.10 |
| Neurological | 0.08 | 0.07 | 0.07 | **0.10** |

---

## 5. Penalties (Level 3.5)

Applied after weighted composite. Competitive athletes get 0.6× scaling on most penalties.

| Penalty | Points | Never Scaled | Trigger |
|---------|--------|-------------|---------|
| Concussion protocol | 15 | Yes | Head impact + red flag symptoms |
| Heat injury | 15 | Yes | Heat stroke/exhaustion symptoms |
| Illness caution | 4-12 | No | Illness reported (scaled by severity) |
| Restoration deficit | 10 | No | Sleep subsystem < 40 |
| Multi-system impairment | 8 | No | ≥2 subsystems < 40 |
| Systemic suppression | 8 | No | Autonomic < 40 AND musculoskeletal > 75 |
| Neurological impairment | 8 | No | Neurological < 35 (no concussion) |
| Cramping/dehydration | 6 | No | Cramping reported |
| Fueling risk | 5 | No | Metabolic < 45 AND cardiometabolic > 60 |
| Tissue risk | 5 | No | Musculoskeletal < 35 AND autonomic > 55 |

`finalScore = clamp(baseScore - totalPenaltyPoints, 0, 100)`

---

## 6. Phenotype Classification (Level 4)

Evaluated in priority order (first match wins):

| Priority | Phenotype | Condition |
|----------|-----------|-----------|
| 1 | neurologically_compromised | neuro < 30 OR concussion OR (neuro < 45 + neuro penalty) |
| 2 | illness_risk | (auto < 35 AND cardio < 40 AND psych < 45) OR illness penalty |
| 3 | sleep_driven_suppression | sleep < 40 AND auto < 60 AND msk > 50 |
| 4 | under_fueled | metabolic < 45 AND auto > 50 AND msk > 50 |
| 5 | centrally_suppressed | auto < 50 AND msk > 65 AND sleep < 55 |
| 6 | accumulated_fatigue | auto < 60 AND msk < 60 AND cardio < 65 |
| 7 | locally_fatigued | auto > 65 AND msk < 55 |
| 8 | fully_recovered | auto ≥ 70 AND msk ≥ 70 AND cardio ≥ 65 AND sleep ≥ 60 AND met ≥ 55 AND psych ≥ 55 |

**Default (no match):** accumulated_fatigue

---

## 7. Confidence Scoring

Every IACI output includes a confidence estimate (0-1):

```
confidence = dataCompleteness           // proportion of non-null inputs
           + 0.10 (if 21-day baseline)  // personalized scoring
           + 0.05 (if 7-day trend)      // trajectory known
           - 0.15 (if >3 subsystems all-null)
           - 0.10 (if no wearable data)
           → clamped to [0, 1]
```

| Level | Range | Recommendation Effect |
|-------|-------|----------------------|
| High | ≥0.75 | Direct, assertive recommendations |
| Medium | 0.50-0.74 | "More data sources would improve precision" |
| Low | <0.50 | "Consider syncing wearable or completing full check-in" |

`confidenceFactors` array lists what's present/missing (e.g., "21-day baseline available", "Missing: wearable data").

---

## 8. Trend Integration

7-day linear slope of IACI scores, threshold ±0.5 units/day:

| Direction | Slope | Effect on Recommendations |
|-----------|-------|--------------------------|
| Improving | >+0.5/day | effectiveScore += 3 near boundary; upgrade 1 caution → allowed |
| Stable | -0.5 to +0.5 | No modification |
| Declining | <-0.5/day | effectiveScore -= 5 near boundary; downgrade 1 allowed → caution |

Per-subsystem trends computed independently (same thresholds). If a declining subsystem is in `primaryLimiters`, a targeted note is added.

---

## 9. Driver Analysis

Maps lowest subsystem(s) to root cause category:

| Subsystem | → Driver |
|-----------|----------|
| sleep | sleep |
| autonomic, psychological | stress |
| musculoskeletal, cardiometabolic | activity_overload |
| metabolic | metabolic |
| neurological | neurological |

**Special cases:**
- Illness penalty active → `illness` (overrides all)
- ≥3 subsystems below 50 → `multi_system`

**Actionable insights per driver:**
| Driver | Insight |
|--------|---------|
| sleep | "Prioritize 8+ hours tonight. Avoid screens after 9pm. Morning bright light within 60 min of waking." |
| stress | "Schedule a 10-min breathwork session. Reduce meeting density. Short walk outdoors." |
| activity_overload | "Deload day — mobility and walking only. Protein timing every 3-4 hours. Foam roll affected areas." |
| neurological | "Cognitive rest priority. Screen-free time. Gentle movement only. Red light therapy if available." |
| metabolic | "Hydration and electrolyte protocol. Timed carbs around activity. Address fueling gaps before training." |
| illness | "Full rest and symptom monitoring. Hydration focus. Sleep priority. Consider medical evaluation." |
| multi_system | "Recovery day — no training load. Sleep, nutrition, and gentle movement. Address the weakest system first." |

---

## 10. Recommendation Policy

### 10a. 39 Training Modalities

**Performance (8):** zone1, zone2, intervals, tempo, strengthHeavy, strengthLight, techniqueDrill, plyometrics
**Recovery Strength (3):** eccentricRecovery, correctiveExercise, kettlebellRecovery
**Bodyweight (2):** bodyweightRecovery, calisthenicsFlow
**AGT (2):** agtAlactic, agtAerobic
**Mitochondrial (1):** mitoZone2
**Mind-Body (4):** yoga, taiChi, breathworkActive, meditation
**Mobility (1):** mobilityFlow
**Aquatic/Low-Impact (4):** swimEasy, aquaticRecovery, walkingRecovery, easyCycling
**Lifestyle (7):** gardening, massage, dancing, hiking, sauna, coldExposure, playRecreation
**Neurological Recovery (7):** redLightTherapy, neurofeedback, pemfTherapy, vestibularRehab, cognitiveRest, gentleNeckMobility, eyeTrackingDrills

### 10b. Permission Assignment (4 levels)

| Permission | Meaning | RPE Guidance |
|------------|---------|--------------|
| Recommended | Primary choice for this tier | Per modality type |
| Allowed | Safe, not primary | Per modality type |
| Caution | Only in specific circumstances | RPE 1-2/10 |
| Avoid | Should not be performed | N/A |

### 10c. Base Permissions by Tier

| Modality | Perform (≥85) | Train (70-84) | Maintain (55-69) | Recover (35-54) | Protect (<35) |
|----------|--------------|---------------|-------------------|-----------------|---------------|
| intervals | R | A | X | X | X |
| tempo | R | A | C | X | X |
| strengthHeavy | A | C | X | X | X |
| zone2 | R | R | A | C | X |
| zone1 | R | R | R | A | C |
| yoga | R | R | R | R | R |
| walkingRecovery | R | R | R | R | R |
| meditation | R | R | R | R | R |
| coldExposure | A | A | A | C | X |

*(Abbreviated — full 39-modality matrix in `training-compatibility.ts`)*

### 10d. Phenotype Overrides

Phenotypes can restrict modalities regardless of tier:

- **neurologically_compromised + concussion (≤25):** ALL → Avoid except walking (C), meditation (A), breathwork (A), cognitiveRest (R), redLight (A), PEMF (A), gentleNeck (C)
- **illness_risk:** ALL performance → Avoid; only gentle movement + rest
- **centrally_suppressed:** intervals/tempo/plyometrics → Avoid; breathwork/yoga/walking → Recommended
- **sleep_driven_suppression:** intervals → Avoid; sleep-promoting activities → Recommended
- **under_fueled:** intervals/tempo/strengthHeavy → Avoid; low-energy movement only
- **locally_fatigued:** strengthHeavy/plyometrics → Avoid; aquatic/low-impact upgraded

### 10e. Competitive Mode

When enabled, performance modalities get +1 permission level (caution → allowed, avoid → caution). Applied AFTER phenotype overrides. Tier thresholds also shift: perform at 75 (not 85), train at 60 (not 70), etc.

### 10f. Ranking Algorithm

Top 8 recommendations selected by relevance score:

```
relevance = avgDeficit(primarySubsystems)
          + 0.3 × avgDeficit(secondarySubsystems)
          + sportBonus (if targets sport's recovery needs)
          + 5 (if recommended)
          + 15 (if active aerobic)
          + 12 (if endurance sport + aerobic)
          - 10 (if mind-body AND IACI > 30)
          + preferenceBonus (15/20/25 for user's top 3)
```

**Guarantee:** At least 1 active aerobic option in top 3.

### 10g. RPE Guidance

| IACI Tier | Performance RPE | Recovery RPE |
|-----------|----------------|--------------|
| Perform (≥85) | 7-9/10 | 3-5/10 |
| Train (70-84) | 6-8/10 | 3-5/10 |
| Maintain (55-69) | 5-7/10 | 2-4/10 |
| Recover (35-54) | 2-3/10 | 2-3/10 |
| Protect (<35) | 1-2/10 | 1-2/10 |

---

## 11. Permutation System

Every protocol output includes a `permutationKey` encoding the full context:

```
band_{protocolClass}_{trend}_{confidenceLevel}_{primaryDriver}
```

**5 bands × 3 trends × 3 confidence levels × 7 drivers = 315 theoretical permutations**

Examples:
| Score | Trend | Confidence | Driver | Key | Behavior |
|-------|-------|-----------|--------|-----|----------|
| 35 | declining | high | sleep | `band_D_declining_high_sleep` | Recover tier, strict permissions, sleep-focused insight |
| 35 | declining | low | multi_system | `band_D_declining_low_multi_system` | Same tier, but hedged recommendations + calibration warning |
| 75 | improving | high | activity_overload | `band_B_improving_high_activity_overload` | Train tier, relaxed permissions, deload insight |
| 85 | stable | high | stress | `band_A_none_high_stress` | Perform tier, full access, breathwork insight |
| 15 | declining | low | illness | `band_E_declining_low_illness` | Protect tier, extreme restrictions, medical evaluation suggested |

---

## 12. Missing Data Handling

| Scenario | Behavior |
|----------|----------|
| Subsystem has all-null inputs | Score defaults to 50 (neurological: 65) |
| Wearable not synced (subjective only) | Confidence penalized -0.10 |
| No baseline (< 21 days history) | Z-score components use population defaults; confidence loses +0.10 bonus |
| No trend data (< 7 days) | Trend = stable; confidence loses +0.05 bonus |
| >3 subsystems with all-null inputs | Confidence penalized -0.15 |
| Null individual field | Excluded from weighted average; remaining weights renormalized |

---

## 13. v6.0.0 Delta (Measurement + Scoring + Rec Generation)

### Measurement Changes
- Added 7th subsystem: **Neurological** (12 subjective inputs: cognitive clarity, reaction time, coordination, headache+severity, dizziness, numbness, light/noise sensitivity, head impact, visual disturbance)
- Added **Apple HealthKit** as second data source (HRV, RHR, SpO2, respiratory rate, sleep staging, workouts, temperature)
- Multi-device merge logic (primary overwrites, secondary fills nulls)

### Scoring Changes
- All 4 weight presets rebalanced for 7 subsystems (neurological: 0.07-0.10)
- New penalties: concussion_protocol (15 pts, never scaled), neurological_impairment (8 pts)
- Concussion cap: neurological score hard-capped at 25 when concussion protocol active
- `neurologically_compromised` phenotype added at priority 1 (checked before illness_risk)

### Recommendation Generation Changes
- 39 modalities (was 32): +7 neurological recovery modalities (red light, neurofeedback, PEMF, vestibular rehab, cognitive rest, gentle neck mobility, eye tracking drills)
- Neurological phenotype override: restricts ALL modalities except walking/breathing/cognitive rest
- **Confidence scoring** on every output (0-1 with level + factors)
- **Trend integration**: declining/improving trends shift permissions near tier boundaries
- **Driver analysis**: identifies root cause (sleep/stress/activity/neurological/metabolic/illness/multi_system) with actionable insights
- **Permutation keys**: every recommendation tagged with band×trend×confidence×driver for analytics
- 42 sport profiles (was 30): +12 sports with neurological stress levels

---

## 14. Test Coverage

**949 tests across 50 suites**, including:
- 7 subsystem scorer test suites (inputs → score ranges, band assignments, limiting factors)
- Penalty logic (trigger conditions, competitive scaling, never-scaled penalties)
- Phenotype classification (priority order, edge cases)
- Training compatibility (39 modalities × 5 tiers × 8 phenotype overrides)
- Confidence scoring (full data → high, subjective-only → low, baseline bonuses)
- Trend integration (slope thresholds, near-boundary adjustments)
- Driver analysis (7 drivers, multi_system detection, illness override)
- Assessment framework (49 tests: measurement moat, recommendation moat, 135-combination permutation matrix)
- Backward compatibility (all new params optional, existing callers unchanged)
