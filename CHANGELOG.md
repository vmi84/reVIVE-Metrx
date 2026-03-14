# Changelog

All notable changes to the Athlete Recovery App will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Comprehensive SME test plan (`TEST_PLAN.md`) covering 13 test categories, 200+ test cases across unit, integration, component, E2E, performance, and security testing

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
