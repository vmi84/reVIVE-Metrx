# Comprehensive reVIVE MetRx Reference Data

> Compiled: March 2026
> Purpose: Structured reference for building a scalable, wearable-agnostic athlete recovery application.

---

## 1. Wearable Device Ecosystem

### 1.1 WHOOP (Band 4.0 / 5.0)

**Unique Data Points:**
- Heart Rate Variability (HRV) -- measured nightly via RMSSD
- Resting Heart Rate (RHR)
- Strain score (0-21 proprietary scale based on cardiovascular load)
- Sleep performance (stages, disturbances, latency, efficiency, respiratory rate)
- Skin temperature
- SpO2 (blood oxygen saturation)
- Respiratory rate
- Recovery score (0-100, composite of HRV, RHR, respiratory rate, sleep)
- Day Strain (accumulated cardiovascular load)
- Heart rate broadcast via BLE

**Data Export / API:**
- Official REST API via developer.whoop.com (OAuth 2.0 authentication)
- Webhooks for real-time event notifications (sleep, recovery, workout completed)
- JSON response format
- Endpoints: recovery, sleep, workout, cycle, body measurements
- Limitation: continuous heart rate time-series NOT available via API (only via BLE broadcast)
- Third-party tools: MyWhoop (open-source) exports to JSON or XLSX
- No HealthKit write (read-only integration with Apple Health for workouts)

**Physiological Systems Mapped:**
- Autonomic Nervous System (HRV, RHR)
- Cardiovascular (strain, heart rate zones)
- Respiratory (respiratory rate, SpO2)
- Sleep/Neurological (sleep staging, sleep latency)
- Thermoregulatory (skin temperature)

---

### 1.2 Garmin (Forerunner, Fenix, Enduro, Venu series)

**Unique Data Points:**
- Training Status (Productive, Peaking, Recovery, Unproductive, Detraining, Overreaching, Base)
- Training Load (7-day accumulated load, aerobic/anaerobic split)
- Training Load Focus (Low Aerobic, High Aerobic, Anaerobic)
- Body Battery (0-100 energy reserve estimate)
- Stress score (all-day, 0-100, based on HRV)
- VO2 Max estimate (running and cycling separately)
- Lactate threshold estimate (heart rate and pace at threshold)
- Running dynamics (cadence, ground contact time, vertical oscillation, vertical ratio, ground contact time balance, stride length)
- Cycling dynamics (power phase, platform center offset -- with compatible pedals)
- Pulse Ox (SpO2, all-day or sleep-only)
- Respiration rate (all-day)
- HRV Status (7-day rolling average with baseline, balanced/low/unbalanced classification)
- Sleep score and sleep stages
- Intensity Minutes / Active Minutes
- Stamina (real-time endurance estimate during activity)
- Hill Score, Endurance Score
- Training Readiness score
- Acute Training Load / Chronic Training Load ratio

**Data Export / API:**
- Garmin Connect Developer Program (cloud-to-cloud REST API)
  - Health API: daily summaries (HR, sleep, stress, steps, respiration, HRV, Pulse Ox, skin temp)
  - Activity API: full activity data in FIT, GPX, TCX formats
  - Webhook (ping/pull) architecture for real-time data availability
  - JSON response format for summary data
- Garmin Health SDK: direct BLE connection from mobile app to device
- Manual export: FIT, GPX, TCX, CSV from Garmin Connect web
- HealthKit and Google Fit / Health Connect sync supported
- Unofficial Python wrapper: python-garminconnect (105+ endpoints)

**Physiological Systems Mapped:**
- Autonomic Nervous System (HRV status, stress, Body Battery)
- Cardiovascular (VO2 Max, lactate threshold, Training Load)
- Respiratory (respiration rate, Pulse Ox)
- Musculoskeletal (running dynamics, cycling dynamics)
- Neurological/Sleep (sleep stages, sleep score)
- Metabolic (calories, intensity minutes)
- Endocrine (stress tracking as proxy for cortisol load)

---

### 1.3 Apple Watch (Series 9, Ultra 2, SE)

**Unique Data Points:**
- Heart Rate Variability (HRV, SDNN-based, overnight)
- Resting Heart Rate (RHR)
- VO2 Max estimate (walking and running)
- Running Power (native, no external sensor needed -- watchOS 10+)
- Sleep stages (REM, Core, Deep)
- Blood Oxygen (SpO2)
- Wrist Temperature (nightly baseline and deviations)
- Cardio Fitness classification (above average, below average, low)
- Walking Steadiness
- Heart rate notifications (high, low, irregular rhythm)
- Respiratory rate (during sleep)
- Atrial fibrillation history
- Time in Daylight

**Data Export / API:**
- Apple HealthKit (on-device API only -- no cloud/server API)
  - Native iOS app required; users grant permission manually
  - Data stays on-device; must sync through user's phone
  - HKExportSession (iOS 19+): bulk XML/JSON export up to 10 GB zipped
- Manual export: XML from Health app (convertible to CSV/JSON)
- HealthKit supports read/write for third-party apps
- No direct backend API -- all integration must go through the user's iPhone
- CareKit and ResearchKit frameworks for clinical/research use

**Physiological Systems Mapped:**
- Autonomic Nervous System (HRV, RHR)
- Cardiovascular (VO2 Max, cardio fitness, heart rate notifications, AFib)
- Respiratory (SpO2, respiratory rate)
- Neurological/Sleep (sleep stages)
- Thermoregulatory (wrist temperature)
- Musculoskeletal (running power, walking steadiness)

---

### 1.4 Oura Ring (Gen 3, Ring 4)

**Unique Data Points:**
- Heart Rate Variability (HRV -- nightly, RMSSD-based, 5-min intervals)
- Resting Heart Rate (RHR -- nightly average and trend)
- Body Temperature (deviation from personal baseline, measured from finger)
- Sleep stages (REM, Deep, Light, Awake)
- Sleep score (composite)
- Readiness score (0-100, composite of HRV, temperature, sleep, activity balance)
- Activity score (movement, training frequency, training volume, recovery time)
- SpO2 (blood oxygen during sleep)
- Stress (Daytime Stress via electrodermal activity sensor -- Ring 4)
- Resilience metric
- Nocturnal heart rate curve shape analysis

**Data Export / API:**
- Oura Cloud API v2 (REST, OAuth 2.0)
  - Endpoints: daily_activity, daily_readiness, daily_sleep, heart_rate, sleep, session, tag, workout
  - JSON response format
  - Webhooks not officially documented (polling model)
  - IMPORTANT: Gen 3/Ring 4 users require active Oura Membership for API access
- HealthKit and Google Fit / Health Connect sync
- Manual CSV export from Oura web dashboard
- Third-party aggregators: Terra API, Thryve, Validic

**Physiological Systems Mapped:**
- Autonomic Nervous System (HRV, RHR, temperature deviation)
- Neurological/Sleep (detailed sleep staging, sleep latency, sleep timing)
- Immune (temperature deviations as early illness indicator)
- Endocrine (temperature trends for hormonal cycling)
- Cardiovascular (nocturnal HR curve)
- Stress/ANS (electrodermal activity -- Ring 4)

---

### 1.5 Polar (Vantage V3, Grit X2 Pro, Pacer Pro, H10 chest strap)

**Unique Data Points:**
- Training Load Pro (cardio load, muscle load, perceived load -- 3-dimensional)
- Nightly Recharge (ANS charge via HRV + sleep charge via sleep quality)
- Leg Recovery (muscle readiness test via orthostatic)
- Orthostatic test (supine + standing HR and HRV comparison)
- Running Index (running economy estimate from HR and pace)
- Running Power (wrist-based)
- Cycling Performance Test (FTP estimate)
- Sleep Plus Stages (detailed sleep architecture)
- FitSpark (daily training guide based on recovery)
- Training Benefit (post-workout classification)
- Cardio Load Status (strain vs. tolerance over time)
- H10 chest strap: clinical-grade ECG-quality HR and RR interval data

**Data Export / API:**
- Polar AccessLink API (REST, OAuth 2.0)
  - Exercise data includes training_load and running_index fields
  - JSON format for summaries
  - Activity files in FIT, GPX, TCX, CSV
  - 30-day rolling window for exercise data
- Polar Flow manual export: GPX, TCX, CSV, FIT
- HRV data exportable as CSV from Polar Flow web (ECG sensor sessions)
- Polar Team Pro API (team/multi-athlete monitoring)
- Polar Mobile SDK (BLE real-time data including ECG from H10)
- HealthKit and Google Fit sync
- Full data download from account.polar.com (excludes algorithm-derived metrics)

**Physiological Systems Mapped:**
- Autonomic Nervous System (Nightly Recharge ANS, orthostatic test, HRV)
- Cardiovascular (cardio load, running index, cycling FTP)
- Musculoskeletal (muscle load, leg recovery)
- Neurological/Sleep (sleep staging, Nightly Recharge sleep charge)
- Respiratory (breathing rate during sleep)

---

### 1.6 COROS (PACE 3, VERTIX 2S, APEX 2)

**Unique Data Points:**
- EvoLab metrics suite:
  - Base Fitness (long-term fitness level)
  - Training Load (7-day accumulated)
  - Load Impact (acute training effect)
  - Fatigue level
  - Recovery Timer
  - VO2 Max estimate (running)
  - Race Predictor (5K, 10K, Half Marathon, Marathon)
  - Running Efficiency
  - Training Focus (Easy, Base, Tempo, Threshold, VO2 Max, Anaerobic)
  - Threshold Pace and Heart Rate
  - Marathon Level
- HRV (nightly measurement)
- Running Power (wrist-based, no pod needed)
- Stamina (real-time endurance estimate)
- Training Status
- Cycling EvoLab (with power meter): FTP, Training Load
- Aerobic and Anaerobic Training Effect

**Data Export / API:**
- NO official public developer API
- Bulk activity export from COROS Training Hub web (FIT, GPX formats)
- Non-activity data (daily metrics, sleep, HR) requires contacting COROS support
- Unofficial reverse-engineered API (github.com/xballoy/coros-api) -- unstable
- HealthKit sync (activities)
- Strava, TrainingPeaks sync

**Physiological Systems Mapped:**
- Cardiovascular (VO2 Max, threshold, Training Load)
- Autonomic Nervous System (HRV)
- Musculoskeletal (running power, running efficiency)
- Metabolic (stamina, energy expenditure)

---

### 1.7 Supersapiens / Abbott Lingo (Continuous Glucose Monitor)

**Unique Data Points:**
- Continuous interstitial glucose readings (every 1-5 minutes, 24/7)
- Glucose variability metrics
- Time in target glucose zone
- Glucose response to meals (glycemic impact scoring)
- Pre/during/post-exercise glucose trends
- Glucose stability score
- Recovery glucose patterns (overnight glucose stability)
- Fueling effectiveness during exercise
- Each biosensor lasts up to 14 days

**Data Export / API:**
- No official public developer API documented
- Supersapiens app: TrainingPeaks integration (glucose overlay on workout data)
- Abbott Libre Sense communicates via Bluetooth to compatible apps
- Libre platform has LibreLinkUp for data sharing (limited)
- Data accessible through the Supersapiens app ecosystem
- No known HealthKit write for glucose from sport biosensor
- Research/clinical: Abbott LibreView cloud platform for clinical data access

**Physiological Systems Mapped:**
- Metabolic (glucose regulation, glycemic variability)
- Endocrine (insulin response patterns, metabolic flexibility)
- Digestive/Nutritional (meal timing, fueling strategy optimization)
- Recovery (overnight glucose stability as recovery proxy)

---

### 1.8 Moxy Monitor (Muscle Oxygen Sensor)

**Unique Data Points:**
- SmO2 (Muscle Oxygen Saturation, %)
- THb (Total Hemoglobin, arbitrary units -- proxy for blood volume in muscle)
- 2-second data update rate
- Can monitor multiple muscle sites simultaneously (up to 4 on Edge devices)
- Muscle-specific oxygen utilization and delivery balance

**Data Export / API:**
- FIT file format (primary export)
- ANT+ and BLE radio transmission protocols
- ANT+ Muscle Oxygen Profile (native) or emulated Speed/Cadence/HR profiles
- Garmin ConnectIQ data fields (stores in .FIT file under Developer fields)
- Moxy PC application for USB data download
- Moxy Portal app (iOS/Android) for real-time collection
- Portal Webtool (browser-based viewing and sharing)
- Integrations: TrainingPeaks, WKO4+, SportTracks, PerfPro Studio, Hudl SVIVO
- Developer Forum: forum.moxymonitor.com

**Physiological Systems Mapped:**
- Muscular (local muscle oxygen supply vs. demand)
- Cardiovascular (peripheral oxygen delivery)
- Respiratory (oxygen utilization efficiency)
- Metabolic (aerobic vs. anaerobic threshold at muscle level)

---

### 1.9 Dreem / Beacon Waveband (EEG Sleep Headband)

**Unique Data Points:**
- 5-channel dry EEG (O1, O2, FpZ, F7, F8) -- 7 derivations
- Brain wave frequencies: alpha, beta, delta, theta
- Automated sleep staging via deep learning (comparable to clinical PSG)
- Sleep architecture: time in each stage, transitions, sleep efficiency
- Sleep onset latency
- Wake after sleep onset (WASO)
- Micro-arousals
- 3D accelerometer (body position, movements, breathing frequency)
- Pulse oximetry (heart rate, SpO2)
- Respiratory rate
- FDA 510(k) cleared (Dreem 3S / Waveband)

**Data Export / API:**
- No official public API ("do not have a public or private API for the moment")
- Reverse-engineered API documented by Wearipedia project (clinical trial data extraction)
  - Provides raw EEG signals, hypnograms, accelerometer data
  - Requires clinical trial admin credentials
- Dreem for Research application (researcher data access via Dreem servers)
- Beacon Pal companion app (Bluetooth data collection, encrypted)
- Data format: proprietary (EEG time-series, hypnogram text files)
- Contact Beacon Biosignals for official data access partnerships

**Physiological Systems Mapped:**
- Neurological (brain wave architecture, sleep microstructure)
- Autonomic Nervous System (sleep-related ANS transitions)
- Respiratory (breathing patterns during sleep)
- Cardiovascular (pulse oximetry during sleep)
- Cognitive (sleep quality impact on next-day cognitive function)

---

### 1.10 Biostrap (Kairos, EVO)

**Unique Data Points:**
- Heart Rate Variability (HRV -- beat-to-beat via raw PPG)
  - Advanced HRV parameters: sympathetic/parasympathetic breakdown
- Resting Heart Rate (RHR)
- SpO2 (blood oxygen saturation)
- Respiratory rate
- Movement classification (sleep, activity)
- Arterial elasticity
- Peripheral elasticity
- Signal quality scoring for PPG data integrity
- Spot Check feature (on-demand biometric assessment with data quality indicator)

**Data Export / API:**
- Biostrap REST API (partner access, organization token-based)
  - Public API documentation: docs.api-beta.biostrap.com
- Bluetooth SDK for direct device integration
- Third-party aggregators: Spike API, Terra API (webhook-based, normalized data)
- Heads Up Health integration
- White-label hardware and software available for partners
- Data format: JSON via API

**Physiological Systems Mapped:**
- Autonomic Nervous System (detailed HRV with sympathetic/parasympathetic indices)
- Cardiovascular (RHR, arterial elasticity, peripheral elasticity)
- Respiratory (respiratory rate, SpO2)
- Neurological/Sleep (movement-based sleep classification)
- Vascular (arterial and peripheral elasticity)

---

### 1.11 Fitbit (Charge 6, Sense 2, Versa 4, Pixel Watch 3)

**Unique Data Points:**
- Stress Management Score (1-100, based on exertion balance, sleep, heart rate responsiveness)
- Sleep stages (REM, Light, Deep, Awake) with Sleep Score
- Active Zone Minutes (time in fat burn, cardio, peak heart rate zones)
- SpO2 (overnight blood oxygen variability)
- Breathing rate (during sleep)
- HRV (nightly, during sleep)
- Resting heart rate
- Skin temperature variation (nightly)
- Daily Readiness Score (Fitbit Premium)
- Cardio Fitness Level (VO2 Max estimate)
- EDA (electrodermal activity) scan (Sense 2) for stress response

**Data Export / API:**
- Fitbit Web API (REST, OAuth 2.0, platform-agnostic cloud API)
  - Intraday granular data: heart rate, active zone minutes, HRV, SpO2, breathing rate
  - JSON response format
  - Subscription webhooks for real-time data change notifications
  - Rate limit: 1,500 requests/hour/user
  - Temperature (core and skin) endpoints
  - Account-centric (data tied to Fitbit account, not device)
- Manual export: CSV from Fitbit web dashboard
- Google Health Connect / HealthKit sync
- Transitioning: Google Fit APIs deprecated 2026; Health Connect is the future Android path
- Third-party aggregators: Terra, Thryve, Validic

**Physiological Systems Mapped:**
- Autonomic Nervous System (HRV, stress management score, EDA)
- Cardiovascular (RHR, Active Zone Minutes, cardio fitness)
- Respiratory (breathing rate, SpO2)
- Neurological/Sleep (sleep staging, sleep score)
- Thermoregulatory (skin temperature)
- Endocrine (stress response via EDA)

---

## 2. Autonomic Nervous System (ANS) Indicators

### 2.1 Sympathetic Nervous System Indicators (Fight-or-Flight)

| Marker | Description | Measurement Method |
|--------|-------------|-------------------|
| Elevated Resting Heart Rate | RHR above personal baseline suggests sympathetic dominance | Wearable (morning or nocturnal measurement) |
| Reduced HRV | Lower RMSSD/SDNN indicates decreased parasympathetic tone | Wearable (nightly or morning 1-5 min recording) |
| Increased LF/HF Ratio | Higher ratio suggests shift toward sympathetic activation | Frequency-domain HRV analysis |
| Elevated Baevsky Stress Index | SI > 150 indicates significant sympathetic activation; normal range 80-150 | Geometric HRV analysis from RR intervals |
| Increased Skin Conductance | Galvanic skin response (GSR) rises with sympathetic arousal | EDA sensor (Oura Ring 4, Fitbit Sense 2) |
| Elevated Respiratory Rate | Faster breathing at rest correlates with sympathetic activation | Wearable (sleep or resting measurement) |
| Elevated Nocturnal HR | Heart rate that does not drop sufficiently during sleep | Wearable (overnight HR curve analysis) |
| Reduced Blood Oxygen Variability | Less variability in SpO2 may indicate ANS rigidity | Wearable (overnight SpO2 monitoring) |
| Increased Cortisol (lab) | Direct measure of HPA axis activation | Saliva, blood, or urine test (not wearable) |
| Elevated Body Temperature | Slight temperature increase above baseline | Wearable (nightly skin/wrist/finger temperature) |

### 2.2 Parasympathetic Nervous System Indicators (Rest-and-Digest)

| Marker | Description | Measurement Method |
|--------|-------------|-------------------|
| High HRV (RMSSD) | Higher beat-to-beat variability reflects strong vagal tone | Wearable (RMSSD from nightly or morning recording) |
| HF Power (0.15-0.4 Hz) | High-frequency component of HRV directly maps to vagal activity | Frequency-domain HRV analysis |
| Fast Heart Rate Recovery (HRR) | Drop of 30-50+ bpm at 1-min post-exercise; elite athletes 60+ bpm | Post-exercise HR measurement |
| Low Resting Heart Rate | RHR below personal baseline indicates parasympathetic dominance | Wearable (morning or nocturnal measurement) |
| SD1 (Poincare Plot) | Short-axis of Poincare plot represents beat-to-beat parasympathetic modulation | Nonlinear HRV analysis |
| pNN50 | Percentage of successive NN intervals differing >50ms; correlated with parasympathetic activity | Time-domain HRV (less preferred than RMSSD) |
| Slow, Deep Breathing Pattern | Low respiratory rate at rest indicates vagal tone | Wearable or manual assessment |

### 2.3 ANS Balance Metrics

| Metric | Description | Normal/Reference Values |
|--------|-------------|------------------------|
| **RMSSD** | Root Mean Square of Successive Differences; gold standard for vagal tone | Highly individual; track 7-day rolling average and coefficient of variation; context-dependent |
| **SDNN** | Standard Deviation of NN intervals; overall HRV (sympathetic + parasympathetic) | 5-min recording standard; 24-hr SDNN captures total variability |
| **LF/HF Ratio** | Low Frequency to High Frequency power ratio; reflects sympathovagal balance | Resting: ~1.5-2.0; increases significantly post-exercise (up to 32% increase after exhaustive exercise) |
| **Baevsky Stress Index (SI)** | Geometric HRV measure reflecting sympathetic/central regulatory activity | Normal: 80-150; mild stress: 1.5-2x increase; severe stress: 5-10x increase |
| **pNN50** | Percentage of successive NN intervals >50ms apart | Correlated with RMSSD; less commonly used due to arbitrary 50ms threshold |
| **SD1/SD2 (Poincare)** | SD1 = short-term parasympathetic variability; SD2 = long-term sympathetic + parasympathetic | Plotted as ellipse; SD1/SD2 ratio indicates balance |
| **HRV Coefficient of Variation** | Day-to-day HRV variability; lower CV = better ANS regulation | Lower CV in well-recovered athletes; high CV may indicate maladaptation |
| **PNS Index / SNS Index (Kubios)** | Composite indices using mean RR, RMSSD, SD1 (PNS) and mean HR, SI, SD2 (SNS) | PNS > 0 = parasympathetic dominant; SNS > 0 = sympathetic dominant |

### 2.4 Orthostatic Test Interpretation

- **Protocol:** 1-3 min supine measurement, then stand for 1-3 min; compare HR and HRV in both positions
- **Normal Response:** HR increases 10-15 bpm on standing; HRV (RMSSD) decreases moderately
- **Overreaching/Fatigue Signs:**
  - Exaggerated HR increase on standing (>20 bpm) = poor autonomic regulation
  - Blunted HR response (minimal change) = possible parasympathetic saturation or deep fatigue
  - Failure of HRV to recover to near-baseline within 2-3 min of standing
- **Polar Implementation:** Automated orthostatic test with Nightly Recharge and Leg Recovery scores derived from results
- **Best Practice:** Perform at same time daily (upon waking), before caffeine or food

### 2.5 Heart Rate Recovery (HRR) Kinetics

| Timepoint | What It Measures | Benchmarks |
|-----------|-----------------|------------|
| **HRR 1-min** | Parasympathetic reactivation (fast phase, vagal) | Good: 30-50 bpm drop; Elite: 60+ bpm drop; Concern: <20 bpm drop |
| **HRR 2-min** | Combined parasympathetic + sympathetic withdrawal | Active: 59.4 +/- 8.3 bpm; Inactive: 44.6 +/- 9.1 bpm |
| **HRR 3-min** | Full autonomic recovery trajectory | Approaching resting HR in well-recovered athletes |

- HRR is modality-dependent: endurance athletes show faster recovery than functional fitness athletes
- HRR <20 bpm at 1-min associated with 1.69x greater risk of CV events (meta-analysis)
- Best used alongside other metrics rather than as a singular fitness predictor
- Genetic factors influence HRR independently of fitness (Nederend et al.)

### 2.6 Emerging ANS Markers

**Pupillometry / Pupil Response:**
- Pupil dilation and constriction speeds reflect sympathetic and parasympathetic balance
- Pupil light reflex latency may indicate CNS fatigue
- Currently lab-based; smartphone camera-based methods emerging
- Not yet available in consumer wearables

**Galvanic Skin Response (GSR) / Electrodermal Activity (EDA):**
- Measures skin conductance changes driven by sympathetic nervous system activation of sweat glands
- Available in: Oura Ring 4 (daytime stress), Fitbit Sense 2 (EDA Scan)
- Provides real-time stress detection independent of heart rate
- Useful for tracking cumulative psychological stress load

---

## 3. Central Nervous System (CNS) / Peripheral Nervous System (PNS) Indicators

### 3.1 Reaction Time Testing

- **What It Measures:** CNS processing speed, neural transmission efficiency, cognitive alertness
- **Methods:**
  - Simple reaction time (single stimulus-response) -- baseline CNS speed
  - Choice reaction time (multiple stimuli, select correct response) -- cognitive processing
  - CNS Finger Tapping Test: 3 rounds of 10-sec max taps on smartphone; drop from personal baseline indicates CNS fatigue
  - CogState Sport: playing card-based computerized test measuring psychomotor function, visual attention, working memory
  - DC Potential Brain Monitoring (Omegawave): biopotential measurement of cortical tissue; 1-7 scale for CNS readiness
- **Fatigue Indicators:** Increased reaction time, increased variability in reaction times, decreased tapping frequency
- **Practical Use:** Pre-training daily screen; significant drop from baseline (>10-15%) may warrant reduced training volume

### 3.2 Vertical Jump / Countermovement Jump (CMJ)

- **Gold Standard** for non-invasive neuromuscular fatigue monitoring in sport
- **Key Metrics:**
  - Jump height (average more sensitive than best for detecting fatigue)
  - Peak power
  - Rate of force development (RFD)
  - Velocity at takeoff
  - Reactive Strength Index Modified (RSI-mod)
  - Braking phase duration and force (sensitive to fatigue from high training loads)
  - Propulsive phase metrics (concentric duration, relative peak force)
  - Countermovement depth
  - Flight time to contraction time ratio
- **Advantages:** Non-fatiguing, fast, highly reliable (CV <5% for jump height), repeatable with large groups
- **Testing Tools:** Force plates (VALD ForceDecks, Hawkin Dynamics), contact mats, smartphone apps (My Jump), linear position transducers
- **Practical Protocol:** Daily or weekly pre-training; compare to individual rolling baseline; >10% decrease in jump height or RSI-mod warrants recovery consideration

### 3.3 Grip Strength Dynamometry

- **What It Measures:** General neuromuscular function, PNS integrity, overall systemic fatigue
- **Method:** Handheld dynamometer, maximum isometric squeeze, best of 3 attempts
- **Fatigue Indicator:** Decreased grip strength from personal baseline (>5-10% decline)
- **Advantages:** Simple, fast, inexpensive, correlated with total body strength and general health
- **Limitations:** Less sensitive than CMJ for detecting lower-body neuromuscular fatigue; influenced by hand/forearm specific fatigue

### 3.4 Rate of Force Development (RFD)

- **What It Measures:** Speed of muscle force production; reflects neural drive, motor unit recruitment speed, and muscle-tendon stiffness
- **Methods:** Isometric mid-thigh pull, isometric squat on force plate, CMJ force-time analysis
- **Fatigue Indicator:** Decreased early-phase RFD (0-50ms, 0-100ms) may indicate impaired neural drive before peak force is affected
- **Significance:** Early RFD is more neurally mediated; late RFD is more muscle-property dependent; monitoring early RFD can detect CNS fatigue before jump height declines

### 3.5 Perceived Neural Fatigue

- **Subjective Measures:**
  - Session RPE (Rate of Perceived Exertion) -- Borg 6-20 or CR-10 scale
  - Wellness questionnaires (fatigue, sleep quality, muscle soreness, stress, mood) -- typically 1-5 Likert scales
  - REST-Q (Recovery-Stress Questionnaire for Athletes)
  - DALDA (Daily Analysis of Life Demands for Athletes)
  - Profile of Mood States (POMS)
- **Practical Value:** Subjective measures are among the most sensitive tools for detecting accumulated fatigue; often flag overreaching before objective markers decline
- **Best Practice:** Daily check-in via app; 5-7 question wellness survey; track individual trends over time

### 3.6 Sleep Quality and REM for Neural Recovery

- **REM Sleep:** Critical for memory consolidation, emotional processing, motor learning, and neural plasticity
- **Deep Sleep (N3):** Primary phase for physical recovery, growth hormone release, and glymphatic brain waste clearance
- **Key Metrics:**
  - Total sleep time
  - Sleep efficiency (time asleep / time in bed)
  - REM duration and percentage (target: 20-25% of total sleep)
  - Deep sleep duration and percentage (target: 15-20%)
  - Sleep onset latency (target: <20 min)
  - Wake after sleep onset (WASO)
  - Number of awakenings
  - Sleep regularity (consistency of sleep/wake times)
- **Wearable Measurement:** All major wearables provide sleep staging; EEG headbands (Dreem/Waveband) provide clinical-grade accuracy

### 3.7 Cognitive Performance Metrics

- **Tests:**
  - Stroop test (executive function, inhibition)
  - Trail Making Test (cognitive flexibility, processing speed)
  - N-back test (working memory)
  - Psychomotor Vigilance Task (PVT) -- sustained attention, reaction time
  - Flanker task (attention, conflict resolution)
- **Fatigue Indicators:** Increased errors, slower response times, increased variability in cognitive test performance
- **Tools:** Cambridge Cognition, ANAM (Automated Neuropsychological Assessment Metrics), smartphone-based cognitive testing apps
- **Application:** Pre-season baseline + periodic monitoring; useful for concussion protocols and overtraining detection

### 3.8 Motor Unit Recruitment Quality

- **What It Measures:** Efficiency and coordination of motor unit firing patterns
- **Methods:** Surface EMG (electromyography) during standardized contractions
- **Fatigue Indicators:** Decreased motor unit firing rate, increased synchronization (compensation), shift in frequency spectrum toward lower frequencies
- **Limitations:** Requires EMG equipment; not practical for daily monitoring; primarily research/clinical tool
- **Emerging:** Wearable EMG sensors (Athos, Myontec) provide proxy measures during training

### 3.9 Nerve Conduction Velocity (Clinical)

- **What It Measures:** Speed of electrical impulse transmission along peripheral nerves
- **Method:** Electrical stimulation of peripheral nerve with surface electrode measurement of conduction time and amplitude
- **Clinical Application:** Diagnosing peripheral nerve injuries, compression neuropathies, polyneuropathies
- **Fatigue Relevance:** Reduced NCV may indicate peripheral nerve fatigue or damage; not practical for routine athlete monitoring
- **Limitations:** Requires clinical neurophysiology equipment and trained technician; invasive; not wearable

### 3.10 Balance / Postural Sway Testing

- **What It Measures:** Integration of vestibular, visual, and proprioceptive systems; CNS processing of balance information
- **Methods:**
  - Force plate center-of-pressure analysis (gold standard)
  - Modified BESS (Balance Error Scoring System) -- eyes closed, single leg, foam surface
  - Y-Balance Test (dynamic balance)
  - Smartphone accelerometer-based balance tests
  - Wearable IMU-based postural sway analysis
- **Fatigue Indicators:** Increased sway area, sway velocity, and sway path length indicate neuromuscular or CNS fatigue
- **Application:** Concussion baseline/return-to-play; overtraining detection; ankle/knee injury risk assessment
- **Advantages:** Sensitive to vestibular and proprioceptive fatigue that other tests may miss

---

## 4. Recovery Protocols by Body System

### 4.1 Muscular System

**Tier 1 -- Foundational (strongest evidence):**
- Sleep (7-9 hours; primary window for muscle protein synthesis)
- Nutrition: adequate protein (1.6-2.2 g/kg/day), distributed across 4-5 meals, leucine-rich sources
- Post-exercise carbohydrate replenishment (glycogen resynthesis)
- Adequate hydration (replace 150% of fluid lost during exercise)
- Active recovery (light aerobic exercise, 30-50% VO2 Max, 15-30 min)

**Tier 2 -- Strong evidence modalities:**
- Cold water immersion (CWI): 10-15C water, 10-15 min immersion; reduces DOMS and perceived soreness; use selectively -- regular use post-strength training may attenuate hypertrophy adaptations; best for competition phases
- Compression garments: 15-30 mmHg graduated compression; worn during and 12-24 hrs post-exercise; reduces swelling and perceived soreness
- Pneumatic compression devices (NormaTec, RecoveryPump): intermittent sequential compression; 20-30 min sessions; enhances venous return and lymphatic flow
- Foam rolling / self-myofascial release: 60-120 sec per muscle group; reduces perceived soreness; improves short-term range of motion; does not impair performance
- Massage: 20-30 min sessions; reduces perceived soreness; psychological benefit may exceed physiological; does not significantly accelerate structural recovery per umbrella reviews
- Photobiomodulation (red light / near-infrared therapy): 630-850 nm wavelength; reduces inflammation markers; may accelerate muscle tissue repair

**Tier 3 -- Moderate / emerging evidence:**
- Contrast therapy (hot/cold alternation): 1-2 min cold / 2-3 min hot, 3-4 cycles; enhances circulation via vascular pumping
- Whole body cryotherapy (WBC): -110 to -140C, 2-3 min exposure; reduces perceived soreness; mixed evidence on objective recovery markers
- Electrical muscle stimulation (EMS/NMES): low-level stimulation to promote blood flow without mechanical fatigue
- Percussive therapy (massage guns): 2-5 min per muscle group; comparable short-term effects to manual massage for soreness reduction
- Blood flow restriction (BFR) training: enables strength maintenance at 20-30% 1RM; useful during injury rehabilitation
- Infrared sauna: 15-30 min at 50-65C; promotes circulation and tissue heating without cardiovascular strain of traditional sauna
- Topical menthol/analgesics: provide pain relief; do not accelerate structural healing
- Tart cherry juice / pomegranate juice: polyphenols reduce inflammation and oxidative stress markers; 30ml concentrate 2x daily
- Omega-3 fatty acids (2-4g EPA+DHA daily): anti-inflammatory; may reduce DOMS severity

**Tier 4 -- Low evidence / anecdotal:**
- Epsom salt baths (magnesium sulfate absorption debated)
- Cupping therapy
- Acupuncture for muscle recovery
- Hyperbaric oxygen therapy (HBOT)
- Peptide therapies (BPC-157, TB-500 -- regulatory grey area)

**Recovery Periodization Principle:** Strategic use of recovery modalities based on training phase. Minimize recovery interventions during hypertrophy/adaptation phases (allow natural inflammatory signaling). Maximize recovery interventions during competition/peaking phases.

---

### 4.2 Neurological System (CNS + PNS)

**Sleep Architecture Optimization:**
- Consistent sleep/wake schedule (circadian alignment)
- Sleep duration: 8-10 hours for athletes (more than general population)
- Pre-sleep routine: dim lights 60-90 min before bed, avoid screens or use blue-light filters
- Cool sleeping environment (18-20C / 65-68F)
- Strategic napping: 20-30 min (avoid sleep inertia) or 90 min (full sleep cycle) between 1-3pm
- Track and optimize REM and deep sleep percentages

**Cognitive Rest:**
- Reduced screen time post-competition/high-demand training
- Limit decision-making load on high-fatigue days
- Mental breaks between cognitive and physical training sessions
- Nature exposure (20+ min) for cognitive restoration

**Meditation and Mindfulness:**
- Mindfulness-Based Stress Reduction (MBSR): 8-week programs shown to reduce cortisol and improve sleep
- Yoga Nidra (Non-Sleep Deep Rest / NSDR): 10-30 min guided body scan; promotes deep parasympathetic shift
- Transcendental Meditation: 20 min 2x daily; reduces sympathetic tone
- Breath-focused meditation: enhances vagal tone and attention
- Apps: Headspace, Calm, Waking Up, Insight Timer

**Float Tanks / Sensory Deprivation:**
- Restricted Environmental Stimulation Therapy (REST)
- 60-90 min sessions in Epsom salt solution (skin temperature, zero light/sound)
- Reduces cortisol, muscle tension, blood pressure
- Enhances parasympathetic activation and psychological recovery
- May improve sleep quality and reduce perceived pain

**Neurofeedback:**
- Real-time EEG brainwave training
- Protocols: SMR (sensorimotor rhythm) training for focus, alpha/theta training for relaxation
- Targets: improved sleep onset, reduced anxiety, enhanced focus
- Tools: Muse headband, NeurOptimal, BrainMaster
- 20-40 sessions typically needed for sustained effects

**Brain Training Apps:**
- Cognitive training for processing speed, working memory, attention
- Apps: BrainHQ, Lumosity, CogniFit, NeuroNation
- May help maintain cognitive sharpness during high-fatigue periods
- Evidence for transfer to athletic performance is limited but growing

**Nootropics and Adaptogens for Neural Health:**
- Creatine monohydrate (3-5g/day): neuroprotective; supports brain energy metabolism
- Omega-3 DHA (1-2g/day): structural component of neural membranes
- Lion's Mane mushroom: promotes nerve growth factor (NGF) production
- Phosphatidylserine (100-300mg/day): supports cell membrane integrity in neurons
- Alpha-GPC (300-600mg): choline source for acetylcholine synthesis
- L-theanine (100-200mg): promotes calm alertness; pairs with caffeine
- Magnesium L-threonate: crosses blood-brain barrier; supports synaptic plasticity
- Bacopa monnieri: traditional adaptogen for memory and processing speed

**Vagal Nerve Stimulation:**
- Non-invasive transcutaneous vagal nerve stimulation (tVNS): ear-clip or neck device
- Devices: gammaCore, Xen by Neuvana
- Promotes parasympathetic activation, reduces inflammation
- Cold water face immersion (dive reflex): simple vagal activation technique
- Humming, singing, gargling: stimulate vagus nerve through laryngeal branch

---

### 4.3 Lymphatic System

**Manual Techniques:**
- Manual Lymphatic Drainage (MLD): specialized light-pressure massage following lymphatic pathways; performed by trained therapist
- Lymphatic drainage self-massage: gentle skin-stretching techniques toward lymph nodes
- Dry brushing: firm-bristle brush stroked toward heart before showering; stimulates superficial lymph flow and skin circulation

**Mechanical / Equipment-Based:**
- Pneumatic compression devices (NormaTec, RecoveryPump): sequential inflation mimics lymphatic pump action
- Compression garments: graduated compression (15-30 mmHg) supports lymph return; wear during travel and post-exercise
- Kinesio taping: applied with specific lymphatic technique to create skin lifting that promotes superficial lymph drainage
- Vibration platforms: whole-body vibration may enhance lymphatic circulation

**Movement-Based:**
- Rebounding (mini trampoline): rhythmic bouncing creates gravitational changes that promote lymph valve opening; 10-20 min sessions
- Exercise (muscle pump): skeletal muscle contraction is the primary driver of lymphatic flow; any movement helps
- Deep diaphragmatic breathing: thoracic duct is the largest lymph vessel; diaphragm movement creates pressure changes that pump lymph; 5-10 min focused breathing
- Yoga: inversions and flowing sequences facilitate lymphatic drainage from extremities

**Positional:**
- Elevation of limbs: uses gravity to assist lymph return from extremities
- Inversion therapy: inversion table or gravity boots; reverses gravitational pooling

**Thermal:**
- Contrast therapy (hot/cold alternation): vasodilation/vasoconstriction cycling creates pumping action in lymphatic vessels
- Infrared sauna: promotes sweating and circulation; indirectly supports lymphatic function

---

### 4.4 Cardiovascular System

**Active Recovery:**
- Easy aerobic exercise (Zone 1, 50-65% max HR): 20-40 min; promotes cardiac output and blood flow without sympathetic stress
- Swimming: hydrostatic pressure aids venous return; low-impact cardiovascular work

**Autonomic Regulation:**
- Breathwork for vagal tone: slow breathing (4-6 breaths/min), box breathing, 4-7-8 breathing, resonance frequency breathing (typically ~6 breaths/min)
- Stress management: chronic psychological stress elevates resting HR and blood pressure; CBT, journaling, social connection
- Heart coherence training (HeartMath): biofeedback-guided breathing for HRV optimization

**Nutrition and Supplementation:**
- Omega-3 fatty acids (EPA+DHA, 2-4g/day): reduces inflammation, improves endothelial function, lowers triglycerides
- CoQ10 (100-300mg/day): supports mitochondrial energy production in cardiac cells; antioxidant
- Nitrate supplementation (beetroot juice, ~400mg nitrate): promotes nitric oxide production, vasodilation, improved blood flow; 70ml concentrated beet juice
- Magnesium (300-400mg/day): supports heart rhythm, vascular smooth muscle relaxation
- Potassium: electrolyte balance for cardiac conduction
- Dark chocolate / flavanols: improves endothelial function

**Hydration:**
- Adequate hydration maintains blood volume and cardiac output
- Electrolyte replacement (sodium, potassium, magnesium) during and after exercise
- Monitor urine color (pale yellow target) and body weight changes

**Thermal Therapy:**
- Sauna (traditional or infrared): 15-20 min, 3-4x/week; improves endothelial function, reduces blood pressure; simulates cardiovascular exercise effect
- Post-sauna cooling: promotes cardiovascular adaptations

---

### 4.5 Immune System

**Sleep:**
- 7-9+ hours; sleep deprivation (<6 hrs) significantly impairs immune function
- Natural killer cell activity decreases by up to 70% after one night of 4-hour sleep

**Nutrition and Supplementation:**
- Zinc (15-30mg/day): critical for immune cell development and communication
- Vitamin C (200-1000mg/day): supports neutrophil function and antioxidant defense
- Vitamin D (2000-5000 IU/day, target serum 40-60 ng/mL): modulates innate and adaptive immunity; deficiency common in indoor/northern athletes
- Probiotics (multi-strain, 10-50 billion CFU): supports gut-associated lymphoid tissue (GALT); reduces upper respiratory infection incidence in athletes
- Glutamine (5-10g/day): fuel for immune cells; depleted during intense exercise
- Quercetin (500-1000mg/day): flavonoid with anti-inflammatory and antiviral properties
- Beta-glucans (250-500mg/day): from yeast or mushrooms; activates innate immune cells
- Elderberry extract: reduces duration and severity of upper respiratory symptoms
- Echinacea: may reduce cold incidence when taken at onset of symptoms
- Colostrum: contains immunoglobulins; may reduce gut permeability during exercise

**Training Management:**
- Avoid overtraining / chronic excessive volume: J-curve relationship between exercise load and infection risk
- Moderate exercise enhances immune function; excessive exercise suppresses it
- Monitor training load to stay below immunosuppression threshold
- Allow adequate recovery between high-intensity sessions (48-72 hrs)

**Stress Reduction:**
- Chronic psychological stress suppresses immune function (elevated cortisol)
- Meditation, social connection, nature exposure
- Maintain positive mood states

**Hormesis:**
- Cold exposure (cold showers, CWI): brief cold stress upregulates immune cell activity
- Heat exposure (sauna): induces heat shock proteins with immune-modulatory effects
- Both require appropriate dosing -- excessive exposure can be immunosuppressive

---

### 4.6 Endocrine System

**Sleep Optimization for Hormone Production:**
- Growth hormone (GH): 70-80% of daily GH secretion occurs during deep sleep (N3); maximize deep sleep through consistent sleep schedule, cool environment, pre-sleep protein intake
- Testosterone: peak production during sleep; levels decline 10-15% with chronic sleep restriction to 5 hours
- Cortisol: normal diurnal rhythm (high morning, low evening); disrupted by poor sleep, overtraining, chronic stress
- Melatonin: optimize by reducing evening light exposure; avoid screens 60-90 min before bed

**Cortisol Management:**
- Monitor training load to prevent chronic elevation
- Post-training cortisol reduction: carbohydrate intake, relaxation techniques
- Adaptogenic herbs: ashwagandha (300-600mg KSM-66 daily, shown to reduce cortisol by 30% in studies), rhodiola rosea (200-600mg/day, reduces fatigue perception), cordyceps (1-3g/day, supports adrenal function)
- Phosphatidylserine (400-800mg/day): shown to blunt cortisol response to exercise

**Nutritional Support:**
- Avoid chronic caloric deficit: relative energy deficiency in sport (RED-S) disrupts HPG axis, thyroid, GH, insulin
- Meal timing: pre-sleep casein protein supports overnight muscle protein synthesis and GH pulse
- Adequate dietary fat (20-35% of calories): essential for steroid hormone synthesis
- Zinc (15-30mg/day): supports testosterone production
- Vitamin D (2000-5000 IU/day): functions as a hormone; supports testosterone and immune function
- Magnesium (300-400mg/day): involved in 600+ enzymatic reactions; supports DHEA and free testosterone
- Boron (3-6mg/day): may support free testosterone levels

**Lifestyle:**
- Resistance training: primary stimulus for testosterone and GH release
- Avoid chronic overtraining: sympathetic overdrive suppresses reproductive and growth hormones
- Limit alcohol: even moderate intake disrupts testosterone, GH, and sleep architecture
- Maintain healthy body composition: excessive body fat increases aromatase (testosterone to estrogen conversion)

---

### 4.7 Fascial / Connective Tissue System

**Nutritional Support:**
- Collagen peptides (15-20g) + Vitamin C (50mg): taken 30-60 min before exercise; enhances collagen synthesis in tendons and ligaments (Shaw et al. study)
- Vitamin C (500-1000mg/day): essential cofactor for collagen cross-linking (proline hydroxylation)
- Proline and glycine: amino acid building blocks for collagen
- Bone broth: natural source of collagen, glycine, proline, glucosamine
- Adequate hydration: fascia is ~70% water; dehydration reduces fascial glide

**Movement and Manual Therapy:**
- Slow stretching / yin yoga: sustained holds of 2-5 min target fascial and connective tissue plasticity (beyond muscular stretch); best performed when muscles are cold/warm debate exists
- Fascial release techniques: using foam rollers, lacrosse balls, fascial tools (IASTM/Graston)
- Rolfing / Structural Integration: deep tissue manipulation targeting fascial layers and alignment; 10-session series
- Movement variability: varied movement patterns prevent fascial adhesions; cross-training, locomotion drills
- Dynamic stretching: pre-activity fascial preparation

**Physical Modalities:**
- Heat application: increases fascial viscoelasticity; warm-up before stretching; hot packs, warm bath
- Instrument-Assisted Soft Tissue Mobilization (IASTM): stainless steel tools applied with pressure along fascial lines
- Vibration therapy: local vibration may enhance fascial fluid flow

---

### 4.8 Respiratory System

**Breathing Exercises:**
- Diaphragmatic breathing: belly breathing pattern; foundation for all breathwork; 5-10 min daily practice
- Box breathing (4-4-4-4): inhale 4 sec, hold 4 sec, exhale 4 sec, hold 4 sec; calming and focus-enhancing
- 4-7-8 breathing: inhale 4 sec, hold 7 sec, exhale 8 sec; strong parasympathetic activation
- Resonance frequency breathing: breathing at personal resonant frequency (~5.5-6.5 breaths/min); maximizes HRV
- Wim Hof Method: cyclic hyperventilation (30 breaths) + breath hold; cold exposure integration; sympathetic activation and stress inoculation
- Buteyko breathing: CO2 tolerance training through reduced breathing volume; addresses chronic overbreathing
- Alternate nostril breathing (Nadi Shodhana): balances sympathetic/parasympathetic tone
- Tummo breathing: Tibetan heat meditation technique combining visualization with breath retention

**Nasal Breathing Training:**
- Training through nose during low-moderate intensity exercise
- Benefits: increased nitric oxide production, improved air filtration and humidification, lower ventilatory rate, improved CO2 tolerance
- Mouth taping during sleep (controversial; consult healthcare provider)
- Nasal strips/dilators for improved nasal airway patency

**Respiratory Muscle Training:**
- Inspiratory Muscle Training (IMT): POWERbreathe, Airofit, Breather devices
- Protocol: 30 breaths, 2x daily, at 50-80% maximal inspiratory pressure
- Improves inspiratory muscle strength, endurance, and reduces perceived exertion during exercise
- Expiratory Muscle Training (EMT): improves expiratory force production

**Advanced Respiratory Training:**
- CO2 tolerance training: breath hold tables; progressive apnea training; improves ventilatory efficiency and reduces air hunger
- Altitude training / simulation: hypoxic tents, altitude masks, intermittent hypoxic training (IHT); stimulates EPO production and ventilatory adaptation
- Breath hold training (apnea): static and dynamic apnea protocols; improves oxygen efficiency and CO2 tolerance
- Pranayama practices: traditional yogic breathing techniques with systematic breath control

---

### 4.9 Digestive / Gut System

**Microbiome Support:**
- Probiotics: multi-strain formulations (Lactobacillus, Bifidobacterium species); 10-50 billion CFU/day; reduce GI distress during exercise; improve immune function
- Prebiotics: dietary fiber (inulin, FOS, GOS) from vegetables, fruits, whole grains; feeds beneficial gut bacteria
- Fermented foods: yogurt, kefir, kimchi, sauerkraut, kombucha, miso; provide live cultures and postbiotics
- Postbiotics: short-chain fatty acids (butyrate) from fiber fermentation; support gut barrier integrity

**Gut Lining Repair:**
- L-glutamine (5-10g/day): primary fuel source for enterocytes (gut lining cells); supports tight junction integrity; depleted during intense exercise
- Bone broth: contains glycine, proline, glutamine; supports mucosal healing
- Zinc carnosine (75-150mg/day): supports gastric mucosal integrity
- Aloe vera gel: soothes GI inflammation
- Marshmallow root and slippery elm: mucosal demulcents

**Anti-Inflammatory Dietary Approaches:**
- Mediterranean diet pattern: high in omega-3s, polyphenols, fiber
- Elimination diets: identify personal food sensitivities (common triggers: gluten, dairy, FODMAPs, nightshades)
- Reduce processed food, refined sugar, seed oils
- Polyphenol-rich foods: berries, dark chocolate, green tea, turmeric
- Curcumin / turmeric (500-1000mg/day with piperine): anti-inflammatory; supports gut barrier function

**Exercise-Gut Considerations:**
- Food timing around exercise: avoid high-fiber, high-fat meals 2-3 hrs before training
- Post-exercise nutrition window: carbohydrate + protein within 30-60 min supports gut blood flow restoration
- Avoid NSAIDs chronically: ibuprofen and similar drugs increase gut permeability (leaky gut) and may worsen exercise-induced GI damage
- Train the gut: practice race nutrition during training to improve GI tolerance

**Gut-Brain Axis Optimization:**
- Vagal tone improvement (breathwork, meditation): vagus nerve mediates bidirectional gut-brain communication
- Stress reduction: cortisol disrupts gut motility, increases permeability, alters microbiome composition
- Adequate sleep: circadian disruption alters microbiome diversity
- Polyphenols and omega-3s: support both brain and gut health

---

### 4.10 Skeletal System

**Essential Nutrients:**
- Calcium (1000-1500mg/day from food + supplement): primary mineral for bone density; dairy, leafy greens, fortified foods
- Vitamin D (2000-5000 IU/day, target serum 40-60 ng/mL): essential for calcium absorption; many athletes deficient
- Vitamin K2 (MK-7, 100-200mcg/day): directs calcium to bones rather than soft tissue; activates osteocalcin
- Magnesium (300-400mg/day): involved in bone crystal formation; 50-60% of body magnesium stored in bones
- Collagen peptides (10-15g/day): supports organic bone matrix

**Mechanical Loading:**
- Weight-bearing exercise: running, jumping, resistance training; stimulates osteoblast activity via mechanotransduction
- Impact loading: plyometrics, jumping exercises; high-strain-rate loading is most osteogenic
- Progressive resistance training: promotes bone mineral density especially at loaded sites
- Variety of loading directions: multi-planar exercise for comprehensive bone stimulation

**Avoiding Risk Factors:**
- Relative Energy Deficiency in Sport (RED-S): chronic energy deficit leads to bone loss, stress fractures, hormonal disruption; ensure energy availability >45 kcal/kg FFM/day
- Female Athlete Triad: disordered eating + menstrual dysfunction + low bone density; requires multidisciplinary intervention
- Minimize prolonged non-weight-bearing periods (excessive cycling/swimming without complementary impact exercise)
- Limit excessive caffeine (>600mg/day may increase calcium excretion)
- Avoid chronic high-dose corticosteroid use

**Additional Support:**
- Phosphorus (balanced with calcium): supports hydroxyapatite crystal formation
- Boron (3-6mg/day): may reduce urinary calcium excretion
- Silicon: involved in collagen synthesis for bone matrix
- Adequate protein intake: supports bone matrix and muscle attachment

---

## 5. Scalable Data Architecture Patterns

### 5.1 Adapter / Plugin Pattern for Each Wearable

**Architecture:**
```
[Whoop API] --> [Whoop Adapter]    \
[Garmin API] --> [Garmin Adapter]   \
[Oura API]  --> [Oura Adapter]      --> [Canonical Data Model] --> [Recovery Engine]
[Apple HK]  --> [HealthKit Adapter] /
[Fitbit API]--> [Fitbit Adapter]   /
[Polar API] --> [Polar Adapter]   /
```

**Each Adapter Handles:**
- Authentication (OAuth 2.0 flows, API keys, HealthKit permissions)
- API-specific rate limiting and retry logic (e.g., Fitbit: 1,500 req/hr/user)
- Data fetching (REST polling, webhooks, BLE real-time)
- Raw data transformation to canonical format
- Device-specific metric extraction and normalization
- Error handling and data gap detection
- Schema version compatibility

**Plugin Registration:**
- Each adapter registers its capabilities (which canonical metrics it can provide)
- Feature flags per adapter (e.g., Garmin provides lactate threshold; WHOOP does not)
- Graceful degradation when a device lacks a data point
- Hot-pluggable: new device adapters can be added without system restart

**Third-Party Aggregator Option:**
- Terra API, Thryve, Validic: pre-built integrations to 500+ devices
- Normalized data delivered via webhooks
- Trade-off: dependency on third party vs. reduced development cost
- Useful for rapid MVP; may need custom adapters for deep metric access

---

### 5.2 Normalized Canonical Data Model

**Core Data Categories:**

```
CanonicalHealthData {
  // Identity & Time
  user_id: UUID
  timestamp: ISO 8601 (UTC)
  timezone: IANA timezone
  source_device: DeviceType
  source_raw_id: string

  // Heart & ANS
  heart_rate: {
    resting: float (bpm)
    current: float (bpm)
    max_today: float (bpm)
    zones: [zone1_min, zone2_min, ...]
  }
  hrv: {
    rmssd: float (ms)
    sdnn: float (ms)
    lf_hf_ratio: float
    measurement_context: enum (sleep, morning, post_exercise)
    measurement_duration_sec: int
  }
  recovery_score: {
    value: float (0-100, normalized)
    source_native_score: float
    source_native_scale: string
    components: map<string, float>
  }

  // Sleep
  sleep: {
    total_duration_min: int
    sleep_efficiency: float (0-1)
    rem_min: int
    deep_min: int
    light_min: int
    awake_min: int
    onset_latency_min: int
    wake_after_sleep_onset_min: int
    sleep_score: float (0-100)
    respiratory_rate: float (breaths/min)
    spo2_avg: float (%)
    temperature_deviation: float (C)
  }

  // Activity & Training
  training_load: {
    acute: float  // 7-day
    chronic: float  // 28-42 day
    ratio: float  // acute:chronic
    type_breakdown: {aerobic: float, anaerobic: float, muscle: float}
  }
  strain: {
    value: float (0-100, normalized)
    cardiovascular: float
    muscular: float
  }

  // Respiratory
  respiratory: {
    rate: float (breaths/min)
    spo2: float (%)
    spo2_variability: float
  }

  // Temperature
  temperature: {
    skin: float (C)
    deviation_from_baseline: float (C)
  }

  // Metabolic (if CGM available)
  glucose: {
    current: float (mg/dL)
    avg_24h: float
    variability: float (CV%)
    time_in_range_pct: float
  }

  // Muscle Oxygen (if Moxy/Humon available)
  muscle_oxygen: {
    smo2: float (%)
    thb: float
    muscle_site: string
  }

  // Neuromuscular (if tested)
  neuromuscular: {
    cmj_height: float (cm)
    cmj_rsi_mod: float
    cmj_peak_power: float (W)
    grip_strength: float (kg)
    reaction_time: float (ms)
  }

  // Subjective
  subjective: {
    wellness_score: float (1-10)
    fatigue: float (1-10)
    soreness: float (1-10)
    mood: float (1-10)
    sleep_quality: float (1-10)
    stress: float (1-10)
    rpe_last_session: float (1-10)
  }

  // Metadata
  data_quality: {
    confidence: float (0-1)
    source_accuracy_tier: enum (clinical, consumer_validated, consumer_estimated)
    measurement_conditions: string
    artifacts_detected: boolean
  }
}
```

**Normalization Rules:**
- All timestamps in UTC with original timezone preserved
- Heart rate in bpm (integer)
- HRV in milliseconds (RMSSD preferred, SDNN secondary)
- Temperature in Celsius with personal baseline deviation
- Scores normalized to 0-100 scale with source native values preserved
- Missing fields are null (not zero) to distinguish absence from measurement

---

### 5.3 Data Quality Scoring

**Device Accuracy Tiers:**

| Tier | Description | Devices | Confidence Weight |
|------|-------------|---------|-------------------|
| Clinical | Medical-grade accuracy, FDA cleared | Polar H10 (ECG), Dreem 3S (EEG), clinical SpO2 | 1.0 |
| Validated Consumer | Independently validated in peer-reviewed research | WHOOP (HRV), Oura (sleep, temp), Garmin (HR), Apple Watch (HR, HRV) | 0.85 |
| Consumer Estimated | Algorithm-derived estimates, not directly measured | VO2 Max estimates, Training Status, Body Battery, Readiness scores | 0.65 |
| Consumer Proxy | Indirect measurements used as proxy for physiological state | Wrist-based SpO2, wrist-based sleep staging, stress scores | 0.50 |

**Quality Scoring Factors:**
- Sensor type (ECG > PPG > accelerometer for HR)
- Measurement context (resting/sleep > active for HRV)
- Recording duration (5 min > 1 min for HRV reliability)
- Signal quality indicators (if provided by device, e.g., Biostrap signal quality)
- Consistency with recent history (outlier detection)
- Time since last sync (freshness)

---

### 5.4 Missing Data Handling

**Scenarios:**
1. **Device not worn:** Null values for all metrics; flag day as incomplete
2. **Partial data:** Some metrics available (e.g., sleep but not daytime HR); use available data with reduced confidence
3. **Device switch:** User changes from Whoop to Garmin mid-season
   - Maintain historical data from old device
   - New device baseline calibration period (7-14 days)
   - Bridge period: flag metrics as "new device, calibrating"
   - Relative trends (personal deltas) more reliable than absolute values across devices
4. **Sync delay:** Data arrives late
   - Timestamp-based insertion (not arrival-time based)
   - Retroactive recalculation of derived scores
5. **Battery/connectivity gaps:** Short gaps in continuous data
   - Linear interpolation for gaps <30 min in continuous HR
   - No interpolation for HRV, sleep stages, or SpO2 (treat as missing)

**Imputation Strategy:**
- Use individual historical averages for gap-filling non-critical display metrics
- Never impute data used for clinical or recovery algorithm decisions
- Clearly flag imputed vs. measured data in the data model
- Rolling baseline calculations should exclude missing days rather than using imputed values

---

### 5.5 Multi-Device Fusion

**When a User Wears Multiple Devices Simultaneously:**

**Fusion Strategies by Data Type:**

| Data Type | Fusion Approach | Example |
|-----------|----------------|---------|
| Heart Rate | Weighted average by sensor quality; ECG chest strap > PPG wrist | Polar H10 HR overwrites Apple Watch HR when both available |
| HRV | Use highest-quality source; do not average across devices | Prefer chest strap RMSSD over wrist-based |
| Sleep Staging | Use most accurate device; EEG > wrist accelerometer+PPG | Dreem/Waveband > Oura > Apple Watch for sleep architecture |
| SpO2 | Use device with best signal quality score; finger > wrist | Oura (finger) > Apple Watch (wrist) for overnight SpO2 |
| Temperature | Use most stable measurement; finger ring > wrist | Oura (finger) for nightly temperature trends |
| Training Load | Use device worn during training; do not combine overlapping sessions | Garmin for outdoor runs, Apple Watch for gym sessions |
| Glucose | Single source (CGM); no fusion needed | Supersapiens / Abbott Lingo |
| Muscle Oxygen | Single source per site; multiple sites possible | Moxy on quad + Moxy on calf |

**Conflict Resolution:**
- Timestamp alignment: match data streams by UTC timestamp within a tolerance window (5-10 sec)
- Source priority hierarchy: configurable per user and per metric type
- Duplicate detection: same activity recorded by two devices (e.g., run on both Garmin and Apple Watch); detect via timestamp overlap + activity type match; keep higher-quality source
- Weighted confidence: final value = weighted average based on device accuracy tier

**Fusion Architecture:**
```
Raw Data Layer (per device)
    |
    v
Adapter Layer (normalize to canonical)
    |
    v
Fusion Engine
  - Timestamp alignment
  - Conflict detection
  - Source priority resolution
  - Weighted confidence scoring
  - Duplicate activity deduplication
    |
    v
Unified Athlete Profile (single source of truth)
    |
    v
Recovery Algorithm Engine
    |
    v
Recommendation Layer
```

**Time-Series Database Recommendations:**
- TimescaleDB (PostgreSQL extension): best for structured health time-series with SQL compatibility
- InfluxDB: purpose-built time-series; good for high-frequency sensor data
- Apache Kafka + stream processing: for real-time webhook ingestion from multiple devices
- Data retention policy: raw data 2 years; aggregated daily summaries indefinitely

---

## Appendix: Cross-Reference Matrix -- Wearable Metrics to Body Systems

| Body System | Key Metrics | Best Wearable Sources |
|-------------|-------------|----------------------|
| ANS (Autonomic) | HRV (RMSSD), RHR, stress score, EDA | WHOOP, Oura, Garmin, Polar H10, Biostrap |
| Cardiovascular | VO2 Max, training load, HR zones, HRR | Garmin, Polar, COROS, Apple Watch |
| Respiratory | Respiratory rate, SpO2 | All major wearables; Oura and WHOOP for sleep-specific |
| Neurological / Sleep | Sleep stages, sleep score, EEG | Dreem/Waveband (gold), Oura (validated), all others (estimated) |
| Muscular | SmO2, training load (muscle), running power | Moxy (SmO2), Polar (muscle load), Garmin/COROS (running power) |
| Metabolic | Glucose, glycemic variability | Supersapiens / Abbott Lingo (CGM) |
| Endocrine | Temperature deviation, cortisol proxy (stress + sleep) | Oura (finger temp), Apple Watch (wrist temp), Garmin (stress) |
| Immune | Temperature deviation, sleep quality, training load ratio | Oura, Garmin, WHOOP (composite) |
| Thermoregulatory | Skin/wrist/finger temperature | Oura, Apple Watch, Garmin, WHOOP |

---

## Appendix: API Access Summary

| Device | API Type | Auth | Format | Real-Time | Webhooks | Rate Limits |
|--------|----------|------|--------|-----------|----------|-------------|
| WHOOP | REST | OAuth 2.0 | JSON | BLE HR only | Yes | Not published |
| Garmin | REST (cloud-to-cloud) | OAuth 2.0 | JSON + FIT/GPX/TCX | Via Health SDK (BLE) | Yes (ping/pull) | Per agreement |
| Apple Watch | On-device (HealthKit) | User permission | XML/JSON | Via HealthKit observers | No (local only) | N/A (on-device) |
| Oura | REST | OAuth 2.0 | JSON | No | No (polling) | Not published; requires membership |
| Polar | REST | OAuth 2.0 | JSON + FIT/GPX/TCX | Via SDK (BLE) | Yes (push) | 30-day data window |
| COROS | None (unofficial) | N/A | FIT/GPX | No | No | N/A |
| Supersapiens | None (public) | N/A | App-only | BLE | No | N/A |
| Moxy | ANT+/BLE | Direct pairing | FIT | Yes (2-sec updates) | No | N/A |
| Dreem | None (reverse-eng.) | Credentials | Proprietary | No | No | N/A |
| Biostrap | REST (partner) | Org token | JSON | Via BLE SDK | Via Terra/Spike | Per agreement |
| Fitbit | REST (cloud) | OAuth 2.0 | JSON | Via webhooks | Yes | 1,500 req/hr/user |

---

*End of reference document.*
