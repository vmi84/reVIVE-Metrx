# reVIVE Metrx - Strategic Assessment & Roadmap

**Date:** March 19, 2026
**Version:** As of v4.1.1

---

## What's Working Well

**The IACI engine is the real asset.** The 6-subsystem scoring architecture with penalty logic, phenotype classification, and protocol prescription is genuinely novel. Most recovery apps are single-dimensional (Whoop = HRV, Oura = sleep). IACI's multi-system approach is defensible IP and the right foundation for everything planned.

**The data model is already extensible.** Canonical physiology records are device-agnostic by design. Adding Garmin, Apple Watch, or Polar is an adapter implementation, not an architecture change. The `InflammationMarkerRow` already exists in the schema -- the inflammation tracker isn't a rebuild, it's a reskin with new subsystem inputs.

**828 tests across 43 suites** is solid coverage for an app at this stage. The scenario-based training compatibility tests (IACI 0-99 for both modes) are the kind of validation most startups skip.

---

## Honest Concerns

### 1. Supabase is a bottleneck you haven't crossed yet

Everything is running in offline/demo mode with file-based storage. That works for development but means: no real user auth, no data persistence across device resets, no AI assistant (using fallback), no multi-device sync, no backend for Garmin webhooks. This is the single biggest blocker to going from "dev prototype" to "testable product." Prioritize this above new features.

### 2. The recommendation engine still needs real-world calibration

We've fixed the thresholds and added competitive mode, but recommendations are driven by static rules, not learned patterns. For the inflammation tracker vision especially, you'll eventually need the engine to learn from outcomes -- "did this recovery protocol actually improve tomorrow's scores?" The architecture supports this (recovery logs have `next_day_iaci_change`), but it's not wired up yet.

### 3. Backend storage architecture is a prerequisite for devices 2-5

Whoop works client-side because the user's phone calls the API directly. Garmin doesn't -- they push data to YOUR server via webhooks. Apple HealthKit reads from the phone but you'll want server backup. Before integrating the next device, you need:

- A webhook receiver (Supabase Edge Function or standalone server)
- A data lake strategy (Supabase Postgres for structured, S3/R2 for raw exports)
- Anonymization scheme (hashed user IDs, separate PII store)
- Data retention policy (especially if research data leaves the app)

This is a 1-2 week architecture decision that blocks all device integrations.

### 4. The inflammation tracker is your most compelling long-term play

The athlete recovery market is crowded (Whoop, Oura, Garmin, Supersapiens). An inflammation tracker for chronic disease management is a much less crowded space with much higher clinical value. The IACI engine's multi-system approach maps naturally to inflammatory conditions:

| IACI Subsystem | Inflammation Analog |
|---|---|
| Autonomic | Vagal tone / stress response |
| Musculoskeletal | Joint inflammation, pain levels |
| Cardiometabolic | Vascular inflammation markers (hsCRP, ESR) |
| Sleep | Sleep disruption from flares |
| Metabolic | Dietary triggers, gut inflammation |
| Psychological | Mental health impact, fatigue |

The phenotype classifier could become a **flare predictor**. The protocol engine could recommend anti-inflammatory interventions. This is where the real differentiation and potential clinical value lives.

### 5. The custom wearable sensor idea could be your moat

Consumer wearables give you limited data (HRV, HR, sleep, movement). A purpose-built sensor (continuous inflammation biomarker, sweat analysis, interstitial fluid) paired with your engine would be a defensible hardware+software platform. Look at Levels (CGM), Nix (sweat electrolytes), or Epicore Biosystems as models. This is a 12-24 month play but the app you're building now is the software platform for it.

---

## Recommended Priority Order

| Priority | Item | Why |
|---|---|---|
| 1 | Supabase deployment | Unblocks everything -- auth, persistence, AI, webhooks |
| 2 | Requirements.MD + Test Plan | Documents what exists before expanding further |
| 3 | Backend storage architecture design | Blocks all future device integrations |
| 4 | Apple Watch / HealthKit integration | Largest user base, data reads from phone (no webhook needed) |
| 5 | Exercise videos + pictures | Makes the Recovery Library actually useful |
| 6 | Garmin integration | When API access is granted + backend is ready |
| 7 | Inflammation tracker reskin planning | Start defining the subsystem mappings and biomarker inputs now, even if the app comes later |

---

## Outstanding Actions

### Infrastructure & Configuration

| # | Item | Priority | Notes |
|---|------|----------|-------|
| 1 | Supabase configuration | High | Edge functions (assistant-chat, coaching-explain) need deployment. CLAUDE_API_KEY needs to be set as Supabase secret. Currently all AI features use offline fallback. |
| 2 | Supabase database tables | High | SQL migrations exist but haven't been run. Needed for: user auth, daily physiology persistence, subjective entries, workout history, recovery logs, trend snapshots. Currently all data is local file-storage only. |
| 3 | Apple Developer account | Medium | Free account works for dev builds to your phone. Paid ($99/yr) needed for TestFlight and App Store distribution. |

### Content & Media

| # | Item | Priority | Notes |
|---|------|----------|-------|
| 4 | Recovery exercise videos | High | 56 exercises have placeholder "Demo coming soon." Need AI-generated demo clips (15-30 sec each) uploaded to CDN, then videoUrl fields populated in exercise-library.ts. |
| 5 | Recovery exercise pictures/sequences | High | Static images showing form for each exercise. Could be screenshots from videos or illustrated. |
| 6 | App Store screenshots | Medium | Needed for App Store listing. |
| 7 | Privacy policy & terms | Medium | Files exist in Privacy Policy/ folder but need to be hosted at a real URL for App Store submission. |

### Features -- Deferred

| # | Item | Priority | Notes |
|---|------|----------|-------|
| 8 | Light theme | Medium | Toggle exists in Settings, value persists, but no ThemeProvider wrapping the app. Needs a context provider that swaps COLORS globally. |
| 9 | Calendar import (.ics) | Low | Planned in v3.0.0 architecture but not built. Would let athletes import training plans from any coaching platform. |
| 10 | TrainingPeaks API sync | Low | PlannedSession type supports source: 'trainingpeaks' but no API integration. |
| 11 | Additional device integrations | High | Garmin, Oura, Apple Watch, Polar, COROS all show "Phase 2" in the app. Architecture supports them (canonical physiology records are device-agnostic). Need OAuth + API adapter for each. |
| 12 | Whoop connection resilience | Medium | Token refresh and retry logic added but Cloudflare still blocks simulator. Real device works better. Could add PKCE flow for more reliable OAuth. |
| 13 | Profile editor shows existing choices | Medium | Onboarding loads existing data but chip selections may not visually highlight. Needs verification on device. |
| 14 | Check-in data persistence across days | Medium | Today's check-in data shows on Trends chart, but past days' check-in data is lost in offline mode. Need to persist check-in history to file storage. |
| 15 | Workout logging to IACI recompute | Medium | Logging a workout on Effort tab doesn't trigger IACI recalculation. Should update subsystem scores post-workout. |

### Engine & Logic

| # | Item | Priority | Notes |
|---|------|----------|-------|
| 16 | Recovery recommendations tuning | High | Despite competitive mode fixes, recommendations may still favor passive recovery over sport-specific active recovery. Needs continued real-world testing and tuning. |
| 17 | ACWR historical chart | Low | Currently shows single current ACWR value. Could plot ACWR over time if workout history is persisted. |
| 18 | 2-a-day inter-session recovery | Low | Architecture exists (sessionSlot AM/PM) but UI flow not fully built. |
| 19 | Onboarding on first launch | Medium | Onboarding screen exists but doesn't auto-show on first launch. Need to check onboarding_completed flag and redirect. |

### Documentation

| # | Item | Priority | Notes |
|---|------|----------|-------|
| 20 | App Requirements document (Requirements.MD) | Medium | Needs to be created with all current features documented. |
| 21 | Detailed Test Plan | Medium | Description based on comprehensive testing -- document test scenarios and expected outcomes. |
| 22 | App Store description | Medium | Home screen elements saved for this purpose. |
| 23 | Help Guide completeness | Low | 17 entries covering major features. Could add entries for: Exercise Library, Workout Logging, Device Connection, Onboarding. |
| 24 | Supabase deployment steps | Medium | Outline steps/actions for deployment. |

### Bugs to Verify on Device

| # | Item | Notes |
|---|------|-------|
| 25 | Help Guide first paragraph readability | Changed to white text -- needs device verification |
| 26 | Settings cards don't collapse | Need to verify collapsible sections work |
| 27 | Profile editor doesn't show existing choices | User needs to see current data to change it |
| 28 | Whoop data missing for recent days | API date range issue -- needs verification |
| 29 | Trends check-in chart empty | Needs check-in history persistence to populate |
| 30 | Cold plunge/sauna still appearing despite no equipment | Equipment filtering needs verification |

---

## Planning Notes

### Hardware Orders
- Apple Watch ordered for Apple HealthKit integration
- Google Pixel ordered for Samsung Health kit integration

### API Access
- Applied for Garmin API access
- Applied for Polar API access

### Backend Architecture (Required for Device Integrations)
- Garmin offloads data to a backend -- need webhook receiver
- Need to develop backend storage plan for ALL devices
- Data must be anonymized but retain traceability
- Plan needed for: webhook receiver, data lake, anonymization, retention policy

### Long-Term: Reskinning Opportunities
- Identify other wellness-oriented applications for the IACI engine
- Engine is modular enough to reskin for different verticals

### Long-Term: Custom Wearable Sensor
- Find a wearable sensor that can be integrated directly into the app
- Purpose-built sensor for inflammation biomarkers would be a defensible moat

### Long-Term: Inflammation Tracker
- Reskin the app as an inflammation tracker
- Measure and track inflammation markers (hsCRP, ESR, IL-6, etc.)
- IACI score needs hooks for the markers we can track
- Data will be offboarded and queryable for research purposes

### Long-Term: Chronic Disease Support
- Use the inflammation tracker to assist with chronic inflammatory diseases:
  - Lupus
  - Gout
  - IBS
  - Crohn's Disease
  - Arthritis
  - Other chronic inflammatory conditions

---

## Strategic Note

The athlete recovery app and the inflammation tracker should share the same IACI engine package but be separate apps. Don't try to make one app serve both athletes and chronic disease patients -- the UX, language, and onboarding are completely different. Build the engine as a standalone module that both apps consume. The codebase is already close to this -- `lib/engine/` is largely decoupled from the UI. A clean extraction into a shared package when the time comes would be straightforward.
