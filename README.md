# reVIVE Metrx

**Integrated Athlete Condition Index (IACI) — A 6-subsystem recovery intelligence platform.**

reVIVE Metrx computes a composite readiness score from wearable data, subjective check-ins, and lab results, then prescribes personalized recovery protocols and training recommendations.

## Core Concepts

### IACI Score (0-100)
A composite index derived from 6 physiological subsystems:
- **Autonomic** — HRV, resting heart rate, HRV trend
- **Musculoskeletal** — soreness mapping, stiffness, heavy legs
- **Cardiometabolic** — cardiovascular load, strain history
- **Sleep** — duration, quality, staging, consistency
- **Metabolic** — hydration, nutrition, GI status, inflammation
- **Psychological** — stress, motivation, mental fatigue

Each subsystem is scored independently, then combined with sport-specific weighting and penalty logic into a readiness tier: **Perform → Train → Maintain → Recover → Protect**.

### Data Sources (Generic Architecture)
The app uses a source-agnostic data pipeline:
- **Canonical record format** — all wearable data normalizes to `CanonicalPhysiologyRecord`
- **Adapter pattern** — each device has its own parser (e.g., `lib/adapters/whoop/`)
- **Source registry** — UI badges, colors, and labels resolve dynamically from `DEVICE_SOURCE_REGISTRY`
- Currently supports: **Whoop** (ZIP export + API sync)
- Planned: Garmin, Oura, Apple Health, Polar, COROS

### Recovery Protocols
Based on IACI phenotype classification (e.g., Sleep-Compromised, Autonomically Stressed, Fully Recovered), the engine prescribes targeted protocols with specific modalities, durations, and intensities.

### Training Compatibility
32 training modalities (8 performance + 24 recovery-focused) are ranked by sport-specific subsystem needs and current readiness level.

## Tech Stack

- **React Native** (Expo SDK 55, managed workflow)
- **Expo Router** — file-based routing
- **TypeScript** — strict throughout
- **Zustand** — state management with file-system persistence
- **Supabase** — auth, Postgres, real-time (optional; app runs fully offline in demo mode)
- **@tanstack/react-query** — server state caching
- **date-fns** — date utilities
- **JSZip** — wearable data export parsing

## Project Structure

```
app/                    # Expo Router screens
  (tabs)/               # Tab navigation (Dashboard, Recovery, Train, Trends, Profile)
  morning-checkin.tsx   # Subjective check-in flow
  post-workout.tsx      # Post-workout logging
  import-data.tsx       # Wearable data import (ZIP/CSV)
  device-setup.tsx      # OAuth device connection
  onboarding.tsx        # Sport selection
  lab-results.tsx       # Blood work entry

components/
  dashboard/            # IACIRing, SubsystemBars, PhenotypeCard, ProtocolCard
  feed/                 # DailyCard, MetricRow, CheckinPromptCard, RecoveryPlanCard
  ui/                   # ThemedText, Card, Button, SearchBar

hooks/
  use-iaci.ts           # IACI computation (online + demo mode)
  use-feed.ts           # Paginated daily feed with device data integration
  use-whoop-sync.ts     # Whoop API sync
  use-load-capacity.ts  # Load capacity computation
  use-auth.ts           # Auth wrapper

lib/
  engine/               # IACI scoring algorithm, subsystem scorers, penalties, phenotype
  adapters/             # Wearable adapters (whoop/zip-parser, whoop/csv-parser, whoop/api-client)
  types/                # TypeScript interfaces (canonical, database, feed, iaci, protocols)
  utils/                # Constants, date helpers, file-storage adapter

store/                  # Zustand stores (auth, daily, feed, physiology, sync)
data/                   # Static data (sport profiles, training modalities, protocol library)
```

## Getting Started

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start Expo dev server
npx expo start

# Run on iOS Simulator
npx expo run:ios

# Run tests
npm test
```

### Demo Mode
The app runs fully offline without Supabase. Import a Whoop ZIP export from Profile > Import Wearable Data, or complete the morning check-in to see IACI scoring in action.

### Importing Wearable Data
1. Export your data from the Whoop app (Settings > Data Export)
2. Open Profile > Import Wearable Data
3. Select the ZIP file
4. Data persists across app restarts via file-system storage

## Testing

```bash
npm test
```

**93 tests** across 3 suites:
- `lib/engine/__tests__/iaci-algorithm.test.ts` — IACI scoring math, subsystem scoring, penalties, phenotype classification, protocol assignment (82 tests)
- `lib/adapters/__tests__/whoop-zip-parser.test.ts` — ZIP parsing, CSV field mapping, workout zone conversion, edge cases (6 tests)
- `lib/types/__tests__/feed-types.test.ts` — Source registry, dynamic badge resolution, unknown source handling (5 tests)

## Architecture Decisions

### Source-Agnostic Data Pipeline
All device data flows through `CanonicalPhysiologyRecord` — a universal schema covering sleep, cardiovascular, recovery, and workout metrics. The UI never references a specific vendor; badge labels and colors are resolved at runtime from `DEVICE_SOURCE_REGISTRY`. Adding a new wearable requires only a new adapter that outputs canonical records.

### Offline-First with Optional Cloud
Zustand stores use `expo-file-system` persistence (not AsyncStorage) for reliability in React Native. The app computes IACI scores locally. Supabase is only used when configured, enabling full functionality in demo mode.

### Iterative CSV Parser
PapaParse caused stack overflow in React Native's JS engine due to recursive parsing. Replaced with a custom iterative parser (`splitCSVLine` + `parseCSV`) that handles quoted fields without recursion.

## Version History

See [CHANGELOG.md](./CHANGELOG.md) for detailed release notes.
