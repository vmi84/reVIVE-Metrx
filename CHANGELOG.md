# Changelog

All notable changes to reVIVE Metrx will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

Versioning: **Major.Significant.Minor** — Major = new features/architecture, Significant = engine updates/UI redesigns, Minor = bug fixes/cosmetic.

## [Unreleased]

## [6.0.1] - 2026-03-21

### Added
- **Confidence scoring** on every IACI output — `confidence` (0-1), `confidenceLevel` ('high'|'medium'|'low'), `confidenceFactors` array. Based on data completeness, baseline availability, trend history, and objective data presence
- **Trend integration into recommendations** — `TrendContext` with direction + per-subsystem slopes feeds into training compatibility and protocol prescription. Declining trends near tier boundaries downgrade permissions; improving trends relax them
- **Primary driver identification** — `DriverAnalysis` maps lowest subsystem(s) to root cause category (sleep, stress, activity_overload, neurological, metabolic, illness, multi_system) with actionable insights
- **Recommendation permutation system** — `permutationKey` encodes band × trend × confidence × driver for analytics tracking. Same IACI score produces different recommendations based on context
- **Apple HealthKit adapter** — Local on-device health data as second data source alongside Whoop. Sleep staging, HRV, RHR, SpO2, temperature, workouts. iOS only, no network calls
- **Multi-device merge logic** — Primary/secondary device model with 'overwrite' and 'fill-nulls' merge strategies. Secondary device data never overwrites primary
- **Device setup Apple Health section** — Connection status, permission request flow, 90-day historical backfill on connect
- **HealthKit sync hook** (`hooks/use-healthkit-sync.ts`) — Morning sync, historical backfill, foreground re-sync, 15-min throttle
- **Assessment framework tests** — 49 tests validating measurement moat, recommendation moat, score bands, trend modifiers, driver-based recs, permutation matrix (135 combos), backward compatibility
- **HealthKit adapter tests** — Sleep staging, SpO2, workout HR zones, temperature deviation, null handling
- **Multi-device merge tests** — Fill-nulls strategy validation

### Changed
- `ProtocolPrescription` extended with `trendModifier`, `confidenceNote`, `driverInsight`, `permutationKey`
- `IACIResult` extended with `confidence`, `confidenceLevel`, `confidenceFactors`, `trendContext`, `driverAnalysis`
- `getTrainingCompatibility()` accepts optional `trendContext` for boundary-aware adjustments
- `prescribeProtocol()` accepts optional `trendContext`, `confidence`, `driverAnalysis` for permutation logic
- Dashboard syncs from both Whoop (API) and HealthKit (local) simultaneously
- HelpButton repositioned from right to left header
- **949 tests** across 50 suites — all passing

## [6.0.0] - 2026-03-21

### BREAKING CHANGE
- **7th Subsystem: Neurological** — `SubsystemKey` now includes `'neurological'`. All weight presets rebalanced to sum to 1.0.

### Added
- **Neurological subsystem scorer** (`lib/engine/subsystems/neurological.ts`) — 12 subjective inputs: cognitive clarity, reaction time, coordination/balance, headache/pressure + severity, dizziness/vertigo, numbness/tingling, light/noise sensitivity, recent head impact, visual disturbance
- **Concussion protocol penalty** (15 pts) — Life-threatening, NEVER scaled by competitive mode. Triggers on recent head impact with red flag symptoms (dizziness, visual disturbance, severe headache)
- **Neurological impairment penalty** (8 pts) — Triggers when neurological score < 35
- **`neurologically_compromised` phenotype** — Checked FIRST in classification priority (before illness_risk). Concussion protocol restricts to walking, breathing, and meditation only
- **7 neurological recovery modalities** — Red Light/PBM Therapy, Neurofeedback, PEMF Therapy, Vestibular Rehabilitation, Cognitive Rest Protocol, Gentle Neck Mobility, Eye Tracking Drills
- **10 neurological recovery protocols** — red-light-therapy-head, red-light-therapy-body, pemf-session, neurofeedback-session, vestibular-balance-drills, cervical-mobility-flow, eye-tracking-exercises, cognitive-rest-protocol, grounding-earthing, sensory-deprivation
- **12 neurological exercises** — red-light-head-protocol, vestibular-head-turns, gaze-stabilization, smooth-pursuit-tracking, tandem-stance-balance, single-leg-eyes-closed, cervical-chin-tucks, cervical-rotation, cognitive-rest-checklist, grounding-barefoot, and more
- **12 new sport profiles** — volleyball, field hockey, ice hockey, baseball/softball, American football, cricket, badminton, squash/racquetball, table tennis, pickleball, fencing, mountain biking (42 total)
- **Neurological stress level** added to all ~30 existing sport profiles (very_high for contact/combat, high for field sports with contact, moderate for strength/crash-risk, low for endurance/wellness)
- **YesNoButton component** (`components/checkin/YesNoButton.tsx`) — Reusable Yes/No radio button replacing all Switch toggles in morning check-in
- **Morning check-in neurological inputs** — Tier 1: Cognitive Clarity + Reaction Time ratings; Tier 2: full neurological detail section with all 12 inputs
- **Concussion warning banner** — Red alert card with MUST DO (non-negotiable) and SHOULD DO (strongly recommended) protocols when concussion detected
- **7th subsystem bar** in dashboard SubsystemBars component
- **21 new neurological scorer tests** (867 total tests, 46 suites — all passing)

### Changed
- **Weight presets rebalanced** — DEFAULT: neuro 0.08, ENDURANCE: 0.07, POWER: 0.07, OLDER_ATHLETE: 0.10. All presets sum to exactly 1.0
- **Training modalities** expanded from 32 to 39 (8 performance + 31 recovery)
- **multi_system_impairment** penalty now counts neurological score in impaired subsystem tally
- All existing test fixtures updated with neurological score/stress entries

## [5.0.3] - 2026-03-19

### Fixed
- **AI Assistant works offline** — No longer requires Supabase. Uses local help guide + user context to answer questions about scores, recovery, training, trends, and app features
- **Keyboard no longer blocks chat input** — KeyboardAvoidingView offset increased to 90 on iOS
- **Settings cards start collapsed** — All 5 sections collapsed by default for clean first view
- **? help buttons on every screen** — Each tab header now has a ? button linking to the Help Guide filtered to that screen's topics

### Added
- **HelpButton component** — Reusable ? circle button for screen headers
- **Offline AI responder** — Context-aware responses (uses IACI score, HRV, phenotype when available), falls back to help guide search, then shows menu of available topics
- **2 new assistant tests** — Offline response tests (828 total)

## [5.0.2] - 2026-03-19

### Fixed
- **Settings top-level sections now collapse/expand** — Athlete Profile, Connected Devices, Data, Training Mode, App Preferences all have chevron toggles with LayoutAnimation
- **Check-In chart reads today's data from daily store** — If IACI score exists, check-in data is available for the chart
- **Cold Exposure/Sauna properly filtered** — Require specific equipment environments (`cold_plunge`, `sauna`), not generic `home`/`gym`
- **Recovery options link to specific exercises** — Modality param filters Recovery Exercise Library to matching exercises
- **Help Guide summary text readable** — Changed from dim secondary to white text

### Changed
- Settings `sectionHeader` marginBottom reduced to 0 when toggleable (chevron takes the space)

## [5.0.1] - 2026-03-19

### Fixed
- **Help Guide text unreadable** — Summary text now uses white (`COLORS.text`) instead of dim secondary color
- **Cold Exposure showing without equipment** — Now requires `cold_plunge` environment. Sauna requires `sauna` environment. No longer shows when user only has home/gym/outdoors
- **Check-In chart empty** — Today's check-in data now sourced from daily store when feed subjective entry is null (offline/demo mode)
- **Exercise Library modality link** — Effort tab recovery options now filter the library to specific exercises for that modality (passes `?modality=` param)

### Changed
- **Exercise Library** renamed to **Recovery Exercise Library**
- **Browse All 80 Protocols** renamed to **Browse All Recovery Exercises**
- **Check-In Metrics Chart** added to Help Guide (was missing)

### Known Issues (deferred)
- Light theme toggle stored but not applied — needs ThemeProvider implementation
- Exercise pictures/sequences — needs image assets
- Device connection resilience — ongoing improvement

## [5.0.0] - 2026-03-19

### Added — Trends Visualization + Help System
- **Tabbed Trends charts** — 3 chart tabs: Recovery, Check-In, Training Load
  - Recovery: IACI Score, Device Recovery, HRV, Sleep, RHR — all toggleable via interactive legend
  - Check-In: Energy, Sleep Quality, Soreness, Motivation, Stress, Mental Fatigue, Physical/Mental composites (1-5 scale normalized to 0-100)
  - Training Load: Day Strain + ACWR with colored zone shading (green/yellow/red), zones adapt for competitive athletes
- **Interactive chart legend** — Tap any series to show/hide it on the chart
- **ACWR visualization** — Zone-shaded chart with explainer text describing injury risk zones
- **Help Guide** — 16 comprehensive entries covering every card, metric, and concept
  - Filterable by screen, collapsible entries with Summary, Detail, Why It Matters, How To Use
  - Accessible from Settings > Help Guide
- **AI assistant trained on Help Guide** — Full guide content injected into assistant context

## [4.0.0] - 2026-03-19

### Added — Effort Tab Redesign + Exercise Library
- **Exercise Video Library** — 56 exercises across 11 categories with search, category filters, video player placeholders
- **Lymphatic System integration** — New exercise category + lymphatic_drainage benefit tags on 26 protocols
- **Effort tab redesigned** — Clean 3-step flow: Training Compatibility → Log Workout → Recovery Options
  - Recovery options ONLY shown after workout is entered
  - Time filter (≤10/20/30 min), filtered by equipment and environment
  - Each option links to Exercise Library

### Removed
- Dead category browse cards from Effort tab (Performance, Recovery Training, Mind & Body, Active Recovery)

## [3.5.0] - 2026-03-19

### Added — Competitive Athlete Enhancements
- **Light/dark theme toggle** in Settings
- **Preferred training modalities** — Top 3 ranked recovery activities prioritized in recommendations
- **User-preferred recovery activities** with sport-aware labels (runners see "Easy Run" not "Walking")
- **Exhaustive training compatibility tests** — 827 tests covering IACI 0-99 for recreational + competitive
- **10-input morning check-in** — Expanded from 4 to 10 core inputs (Physical + Mental/Nutrition groups)
- **Cramping tracking** with location text entry, wired into musculoskeletal subsystem
- **Heat-related illness** added to illness symptoms with severity weighting
- **Electrolyte quantity tracking** (servings/tablets)
- **Competitive mode IACI recompute** — Toggling athlete mode immediately recalculates scores

### Fixed
- Check-in data persistence — values persist and are viewable/editable after submission
- Competitive training compatibility correctly applied through full pipeline
- Pull-to-refresh no longer wipes IACI score
- Connection resilience — aggressive token refresh, retry with backoff, health check on launch
- Soreness colors inverted correctly (1=green, 5=red)
- RecoveryBetweenSessions infinite render loop
- RPE annotations now show /10 scale (e.g., RPE 2-4/10)

## [3.4.0] - 2026-03-18

### Added
- **Weighted illness severity** — Severe symptoms (fever, body aches) = 3× weight, moderate = 2×, mild = 1×
- **Illness subsystem suppression** — Autonomic/cardiometabolic reduced 5-20pts when ill
- **"Still feeling ill?" prompt** — Follow-up from yesterday's illness data
- **Tab bar icons** — Ionicons for all tabs, Recovery promoted to position 2
- **Selection hints** on all onboarding sections

### Changed
- Settings screen shows user's login ID instead of generic "Athlete"
- Tab order: Home, Recovery, Effort, Trends, Settings

## [3.3.0] - 2026-03-18

### Added
- **Morning check-in redesign** — Smart 2-tier flow with expandable detail sections
- **Illness tracking** in check-in with symptom chips and severity weighting
- **RPE guidance** on all training recommendations
- **Equipment-filtered recovery** — No pool = no aquatic recommendations
- **Illness wired to IACI engine** — User-reported symptoms trigger penalties

### Fixed
- Sleep display: percentage over hours (not reversed)

## [3.2.0] - 2026-03-18

### Added
- **Whoop API v2 migration** — Compatible with current Whoop developer API
- **OAuth deep link fallback** — System browser fallback when in-app browser blocked
- **Connection resilience** — Auto token refresh, retry with backoff, health check

## [3.1.0] - 2026-03-18

### Added
- **Onboarding questionnaire** — 5-step athlete profile (About You, Training Context, Goals, Environment, Health)
- **Settings tab** — Profile renamed to Settings with gear icon, restructured sections
- **Persisted settings** — Athlete mode, training schedule, equipment, environment survive app restart
- **Custom onboarding items** — "Other" text input for sports, equipment, environment, diet

## [3.0.0] - 2026-03-18

### Added — Athlete Mode
- **Competitive vs Recreational athlete mode** — Threads through entire scoring pipeline
- **Relaxed thresholds for competitive athletes** — Perform at 75+ (was 85), Train at 60+ (was 70)
- **Reduced penalties** — 40% reduction for competitive athletes (coach manages risk)
- **ACWR danger zone widened** — 1.5 for competitive (was 1.3)
- **Training plan store** — Manual entry, weekly templates, template auto-expansion
- **Plan-aware recovery engine** — Aggressive/preparation/inter-session/standard strategies
- **3 new sport profiles** — Ultramarathon, Biathlon, Track & Field
- **Train tab branches** — Competitive athletes see RecoveryBetweenSessions + PlanInput

## [2.6.0] - 2026-03-17

### Added
- **AI Recovery Assistant** — Chat-based assistant with Claude integration via Supabase Edge Function
- **Whoop historical sync** — Backfills all available data on first connection
- **Dual-score daily cards** — IACI + device recovery shown side by side
- **Pull-to-refresh** — Syncs last 7 days of device data
- **Collapsible training categories** on Train screen

### Changed
- Rebranded to reVIVE Metrx

## [2.5.0] - 2026-03-17

### Added
- **Comprehensive test suite** — 502 tests across 30 suites
- Fixed papaparse double-header bug, sport profile key mismatches, inflammation score thresholds

## [2.4.0] - 2026-03-16

### Added
- **Whoop Live API integration** — OAuth2 flow, auto-sync, token refresh, historical backfill

## [2.3.0] - 2026-03-16

### Added
- **Source-agnostic data pipeline** — Canonical physiology records, device-agnostic architecture
- Persistence layer with file-system storage

## [2.2.0] - 2026-03-16

### Added
- **Sport-aware training system** — 32 modalities with IACI-gated permissions
- **Whoop ZIP import** with physiology store integration

## [2.1.0] - 2026-03-16

### Added
- Scrollable morning check-in, hydration slider
- Protocol detail screen, evidence-grouped recovery screen
- IACI algorithm test suite

## [2.0.0] - 2026-03-16

### Added
- Infinite scroll feed, systemic load engine, recovery day plans

## [1.0.0] - 2026-03-15

### Added
- Initial release — Expo project scaffold, IACI engine, Whoop adapter, UI components, offline demo mode
