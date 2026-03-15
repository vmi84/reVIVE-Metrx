# Changelog

All notable changes to reVIVE MetRx will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [2.2.1] - 2026-03-14

### Changed
- **App rebrand** — Renamed from "Athlete Recovery" to "reVIVE MetRx" across all surfaces: app display name, Expo config (slug, scheme, bundle IDs), sign-in screen (logo, title), OAuth redirect URIs, package.json, and documentation

## [2.2.0] - 2026-03-14

### Added

#### Sport-Aware Training-for-Recovery System
- **30 sport profiles** (`data/sport-profiles.ts`) — Endurance, strength, combat, field/court, other, and wellness/longevity categories; each profile defines subsystem stress maps, sport-specific stress markers, IACI weight presets, and recommended recovery modalities
- **32 training modalities** (`data/training-recovery-map.ts`) — Expanded from 8 performance-only to 32 modalities across 11 categories: aerobic, strength, bodyweight, AGT (anti-glycolytic), mitochondrial, mind-body, mobility, aquatic, low-impact, lifestyle, and skill work
- **Sport stress engine** (`lib/engine/sport-stress.ts`) — Weight preset derivation from sport profiles, subsystem score adjustments (high=1pt, very_high=2pt penalties), multi-sport union of recovery needs
- **Sport onboarding screen** (`app/onboarding.tsx`) — Multi-select sport chip grid grouped by category with Wellness & Longevity prominently featured; saves to profile as JSON array
- **Training recommendations hook** (`hooks/use-training-recommendations.ts`) — Consumes IACI result and sport profile to expose ranked training-for-recovery recommendations with top pick and category grouping
- **TrainingSection** (`components/recovery/TrainingSection.tsx`) — Collapsible "Training for Recovery" section on recovery screen showing top 3 recommendations with show-more toggle
- **TrainingRecommendationCard** (`components/recovery/TrainingRecommendationCard.tsx`) — Expandable card with permission badge, recovery framing, subsystem pills, evidence level, intensity guidance, duration range, and examples

#### New Training Modality Categories
- **Recovery strength** — Light eccentric work, corrective exercise, light kettlebell flow
- **Bodyweight** — Light bodyweight circuit (push-ups, air squats, planks), calisthenics flow
- **Anti-glycolytic (AGT)** — Alactic power (5-10s bursts + full rest), aerobic repeats (submaximal + generous rest)
- **Mitochondrial** — Zone 2 Mito Builder for longevity/wellness focus
- **Mind-body** — Restorative yoga, tai chi/qigong, active breathwork, guided meditation
- **Mobility** — Dynamic mobility flow
- **Aquatic & low-impact** — Easy swimming, pool recovery, recovery walking, easy cycling
- **Lifestyle** — Gardening, massage, dancing, hiking, sauna, cold exposure, play & recreation

### Changed
- **Training compatibility** — Expanded from 8-field interface to `Record<TrainingModalityKey, TrainingPermission>` with 32 modality keys across 5 IACI tiers; recovery-focused modalities remain safe at lower tiers
- **Phenotype overrides** — All 7 phenotypes now apply modality-specific overrides across the full 32-modality set
- **IACI weight selection** — Replaced hardcoded `profile?.sport === 'endurance'` check with sport profile lookup supporting 4 weight presets (default, endurance, power, older_athlete)
- **IACI composite** — Sport stress markers now feed subsystem score adjustments before penalty computation
- **Protocol engine** — Wires sport-aware `recommendedTraining` into `ProtocolPrescription`
- **Recovery screen** — Added TrainingSection above passive recovery protocols
- **Dashboard training card** — Shows curated 8 performance modalities instead of iterating all 32

## [2.1.4] - 2026-03-14

### Added
- Comprehensive IACI algorithm test suite with 80+ assertions verifying poor inputs produce poor recovery and optimal inputs produce excellent recovery across 6-tier recovery bands (Optimum ≥81 / Strong 61-80 / Moderate 41-60 / Sufficient 21-40 / Insufficient 1-20 / Poor 0)
- Whoop input integration tests covering HRV, RHR, sleep score, and respiratory rate across optimal, suboptimal, and critical states

## [2.1.3] - 2026-03-14

### Changed
- **Recovery screen** — Replaced flat protocol list and series filter tabs with evidence-grouped accordion layout (Strong / Moderate / Emerging); protocols ranked within each group by relevance to user's current subsystem deficits
- **Ranking algorithm** — New `rankByRelevance()` scores each protocol by average deficit across its targeted subsystems, with +20 bonus for phenotype-specific picks from the protocol engine

### Added
- **TopPickCard** — Hero card highlighting the #1 best-match protocol per evidence tier with accent border, targeted subsystem pills, and dose sweet spot
- **EvidenceSection** — Collapsible accordion component per evidence level with expand/collapse and "Show N more" toggle to prevent doom-scrolling
- **Relevance score** — ProtocolSeriesCard now displays a relevance percentage badge
- **Empty state** — Recovery tab shows "Start Check-In" prompt when no IACI data available
- **IACI context** — Recovery header now shows IACI score and readiness tier alongside phenotype label

## [2.1.2] - 2026-03-14

### Added
- **Protocol detail screen** — New `app/protocol/[slug].tsx` with full protocol info: header badges, instructions, dosage (min/sweet spot/upper limit), ideal timing, cautions, equipment, target areas, IACI systems targeted, evidence notes, athlete tips, and environment
- **Demo video player** — `ProtocolVideoPlayer` component with play button poster, confirmation alert, and WebView-based video playback (YouTube iframe embed + MP4 fallback); works in Expo Go without native modules
- **Protocol navigation** — Tapping a protocol card on the Recovery tab now opens the detail screen
- **Video library** — All 80 recovery protocols mapped to technique-specific YouTube demo video URLs

### Fixed
- **TypeScript** — Fixed `SubsystemKey` type error in `use-iaci.ts` demo mode score generation

## [2.1.1] - 2026-03-14

### Fixed
- **Demo mode IACI** — Check-in now triggers `computeDemo()` to generate realistic IACI scores without Supabase; previously IACI never computed because Whoop sync gate was never satisfied in offline mode
- **Recovery protocols empty** — Protocols now load from bundled `data/recovery-protocols.json` in demo mode instead of querying empty Supabase table; all 80 protocols with series filter counts now populate

### Changed
- **Dashboard** — IACI computation in demo mode bypasses Whoop sync requirement; skips Whoop auto-sync when Supabase is not configured
- **tsconfig** — Added `resolveJsonModule` and `esModuleInterop` for local JSON seed data imports

## [2.1.0] - 2026-03-14

### Changed
- **Morning Check-In** — Converted from 5-step wizard to single scrollable form; all sections (Quick State, Body, Mind & Fuel, Recovery Actions, Flags) visible and scrollable in one view with a single Submit button at the bottom
- **Morning Check-In Submit** — Fixed submit navigation: uses `router.back()` for modal dismiss with `router.replace()` fallback for safety
- **Hydration Input** — Replaced glass counter with graduated sliding scale (0–2.0L in 0.25L increments) using custom `HydrationSlider` component

### Added
- `components/ui/HydrationSlider.tsx` — Custom pan-responder slider with graduated tick marks and 0.25L snap increments

## [2.0.0] - 2026-03-14

### Added

#### Infinite Scroll Feed (Whoop Model)
- `lib/types/feed.ts` — FeedDay, MetricSource, MetricValidation types
- `store/feed-store.ts` — Zustand store for feed state (days, cursor, pagination, accordion)
- `hooks/use-feed.ts` — Paginated data fetching with carry-forward yesterday's check-in
- `components/feed/DailyCard.tsx` — Expandable card wrapper with tier-colored border
- `components/feed/DailyCardCollapsed.tsx` — Compact 90px card (56px IACI ring, date, metrics)
- `components/feed/DailyCardExpanded.tsx` — Full card with all subsystem data
- `components/feed/CheckinPromptCard.tsx` — "Start Check-In" + "Use Yesterday's Data" prompt
- `components/feed/WhoopMetricRow.tsx` — Editable metric with source badge + accept/edit buttons

#### Systemic Load Stress Capacity Engine
- `lib/types/load-capacity.ts` — LoadCapacityResult, SubsystemStressFactor, SystemStatusSummary, WorkoutImpactResult, RecoveryPlan, RecoveryDayPlan types
- `lib/engine/load-capacity.ts` — Bottom-up systemic stress algorithm: per-subsystem stress factors with Whoop/load modifiers, weighted combination with cross-system amplifiers, area capacity from DOMS, workout focus classification
- `lib/engine/workout-impact.ts` — Post-workout impact calculator (subsystem deltas, area soreness, recovery time estimates)
- `lib/engine/recovery-plan.ts` — Post-workout recovery plan generator (immediate/short-term/evening/next-day)
- `lib/engine/recovery-day-plan.ts` — Multi-systemic recovery day protocol for recovery-only days (4 time blocks, nutrition, sleep)
- `hooks/use-load-capacity.ts` — Compute load capacity after IACI, auto-generate recovery day plan when recovery-only
- `hooks/use-recovery-plan.ts` — Generate post-workout recovery plan after logging

#### Feed UI Components
- `components/feed/SystemStatusCard.tsx` — Stress level badge, headline, per-subsystem one-liners
- `components/feed/WorkoutFocusBadge.tsx` — Fitness Building / Active Recovery / Recovery Only recommendation
- `components/feed/AreaCapacityMap.tsx` — Body region capacity visualization (color-coded pills)
- `components/feed/RecoveryPlanCard.tsx` — Post-workout recovery plan display
- `components/feed/RecoveryDayPlanCard.tsx` — Full-day recovery protocol display with timeline

### Changed
- **Dashboard** — Completely rewritten from ScrollView to FlatList infinite scroll feed with accordion cards, pull-to-refresh, and infinite pagination (14 days per page)
- **Morning Check-In** — Pre-fills sliders with yesterday's values when available, shows "Pre-filled with yesterday's responses" banner
- **Post-Workout** — Generates and displays recovery plan after logging workout before dismissing

## [1.0.0] - 2026-03-13

### Added
- Comprehensive SME test plan (`TEST_PLAN.md`) covering 13 test categories, 200+ test cases across unit, integration, component, E2E, performance, and security testing

### Fixed
- **App crash on launch** — `supabaseUrl is required` error when Supabase env vars not configured; added placeholder client with `isSupabaseConfigured` guard
- **TypeScript compilation** — excluded Supabase Edge Functions (Deno runtime) from tsconfig

### Changed
- **Offline/demo mode** — app now runs without Supabase credentials using placeholder client; sign-in screen shows "Enter App" button that bypasses auth while keeping email/password hooks in place for future credential storage
- **Auth store** — added `offlineMode` state; `signIn`/`signUp`/`signOut`/`fetchProfile` gracefully no-op when Supabase is not configured
- **Auth gate** (`app/index.tsx`) — routes to sign-in when in offline mode instead of auto-redirecting to dashboard
- **Sign-in screen** — redesigned with AR logo, "Integrated Athlete Condition Index" subtitle, yellow offline mode banner, and conditional button text ("Sign In" vs "Enter App")

## [0.1.0] - 2026-03-13

### Added

#### Project Scaffolding
- Expo (React Native) project with Expo Router file-based routing
- TypeScript strict mode with `@/*` path aliases
- EAS Build configuration for iOS and Android
- Environment variable setup with `.env.example`

#### Type System (lib/types/)
- `canonical.ts` — `CanonicalPhysiologyRecord`, `SleepMetrics`, `CardiovascularMetrics`, `WorkoutMetrics`, `DataQualityTier`
- `iaci.ts` — Full IACI type hierarchy: `SubsystemKey`, `SubsystemScore`, `SubsystemWeights` (4 presets), `PhenotypeKey`, `ProtocolClass`, `ReadinessTier`, `IACIResult`
- `protocols.ts` — `RecoveryProtocol` (10 series), `RecoveryLog`, `RecoveryRecommendation`
- `exercises.ts` — `Exercise` (12 categories), `Workout`, `WorkoutSet`
- `inflammation.ts` — `InflammationMarkerDef`, `InflammationEntry`, `InflammationScore`
- `progress.ts` — `StallType`, `TrendSnapshot`, `ProgressAssessment`, `ACWR`
- `database.ts` — Supabase row types mirroring all SQL tables

#### IACI Engine (lib/engine/)
- 6 subsystem scorers: autonomic, musculoskeletal, cardiometabolic, sleep-circadian, metabolic, psycho-emotional
- Baseline tracker with 21-day rolling window (min 7 samples)
- Penalty logic with 6 mismatch-state penalties
- IACI composite calculator orchestrating weighted scores → penalties → phenotype → protocol
- Phenotype classifier (7 phenotypes, priority-ordered rules)
- Protocol engine mapping phenotypes to recommended modality slugs
- Training compatibility engine with base permissions + phenotype overrides
- Inflammation scoring from wearable proxies, self-reported, and lab markers
- Progress tracker: ACWR, training monotony, stall detection (5 types)
- Trend analyzer for 7d/21d/28d/90d periods
- Personalization stub for phase-2 athlete-type weight presets

#### Whoop Integration (lib/adapters/)
- Wearable adapter interface and plugin registry
- `WhoopApiClient` — OAuth flow, paginated API for recovery/sleep/workout/cycle endpoints
- Whoop CSV export parser using PapaParse
- Webhook handler for recovery.updated, sleep.updated, workout.updated
- Data quality scoring (high/medium/low/estimated tiers)

#### State Management (store/)
- `auth-store.ts` — Session, user, profile with Supabase Auth
- `daily-store.ts` — Today's IACI result, check-in and sync status
- `workout-store.ts` — Active and recent workouts
- `sync-store.ts` — Whoop sync status, errors, offline pending count

#### Hooks (hooks/)
- `use-auth.ts` — Auth wrapper with auto-initialization
- `use-iaci.ts` — Full IACI computation pipeline (fetch → baseline → score → composite → store)
- `use-whoop-sync.ts` — Morning sync (recovery + sleep) and post-workout sync with Whoop API field mapping
- `use-protocols.ts` — Protocol fetching, filtering by IACI/phenotype/constraints, adherence logging
- `use-workout-logger.ts` — Workout logging and recent workout retrieval
- `use-trends.ts` — 90-day trend analysis across 4 periods
- `use-progress.ts` — ACWR, monotony, and stall detection computation
- `use-offline-sync.ts` — Phase-2 stub for AppState monitoring

#### UI Components (components/)
- Base UI: `ThemedText`, `Card`, `Button`, `Slider` (discrete dot slider)
- Dashboard: `IACIRing` (SVG circular progress), `SubsystemBars`, `PhenotypeCard`, `ProtocolCard`, `TrainingCompatCard`, `MetricsRow`
- Check-in: `BodyMap` (13-region tap-to-cycle soreness)
- Recovery: `ProtocolSeriesCard` with evidence icons and CNS warnings

#### Screens (app/)
- Auth flow: sign-in, sign-up with email/password
- 5-tab layout: Dashboard, Train, Recovery, Trends, Profile
- Dashboard with pre-checkin CTA → auto-sync → IACI ring → metrics → subsystems → phenotype → protocol → training compat
- Morning check-in: 5-step modal (Quick State → Body Map → Mind & Fuel → Recovery Actions → Flags)
- Post-workout logger: 13 workout types, duration, RPE, notes
- Recovery hub: filter tabs (Recommended, All, 10 series), constraint-enforced filtering
- Training compatibility display with recent workout logging
- Trends: period selector, IACI trend, training load, ACWR zones, stall detection
- Profile: user info, connected devices, settings, lab results link, CSV import
- Progress report: ACWR display, monotony, stall detection with alternatives
- Evening recovery check-in: body feel, energy, pain, notes
- Workout detail `[id]`: HR zones, strain, metrics
- Exercise detail `[id]`: strain/recovery cost, equipment, log button
- Device setup: Whoop OAuth flow with AuthSession
- CSV import: document picker → parse → upsert
- Lab results: 7 inflammation markers with normal ranges

#### Database (supabase/)
- 15 migration files creating all tables with RLS policies and indexes
- `seed.sql` — 80 recovery protocols, 56 exercises, 16 inflammation marker definitions

#### Seed Data (data/)
- `recovery-protocols.json` — 80 modalities across 10 series extracted from Excel files
- `exercises.json` — 56 exercises across 12 categories
- `inflammation-markers.json` — 11 lab markers + 5 wearable proxies
- `phenotype-rules.json` — 7 phenotype classification rules

#### AI Integration
- `lib/ai/coaching.ts` — Claude API proxy for natural-language recovery explanations with rule-based fallback
- Supabase Edge Functions: `coaching-explain`, `whoop-webhook`, `compute-trends`

#### Infrastructure
- Supabase client with `ExpoSecureStoreAdapter` for token persistence
- Utility modules: math (rolling stats, z-scores, EMA), date helpers, constants (thresholds, colors, labels)
