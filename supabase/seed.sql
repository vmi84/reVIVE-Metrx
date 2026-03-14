-- Seed data for Athlete Recovery App
-- Auto-generated from data/*.json files

-- =============================================
-- Recovery Protocols (80 modalities)
-- =============================================

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Cold-Water Immersion (CWI)', 'cold-water-immersion', 'classic', 'passive',
  TRUE, FALSE,
  'muscular', '{"nervous", "circulatory"}'::TEXT[], '{"autonomic", "cardiovascular", "musculoskeletal"}'::TEXT[],
  '{"full_body"}'::TEXT[], '{}'::TEXT[], '{"decrease_soreness", "improve_circulation", "relax_nervous_system", "reduce_swelling"}'::TEXT[], '{"immersion_tub"}'::TEXT[],
  'strong', '3-5 min', '10-15 min at 10-15°C', '>15-20 min',
  'Submerge body up to chest in cold water. Practice slow nasal breathing throughout. Exit immediately if shivering becomes uncontrollable.', 'Avoid during hypertrophy training blocks. Contraindicated for Raynaud''s disease, open wounds, and uncontrolled hypertension.', 'Best used between matches, in hot environments, or when quick turnaround is needed.', NULL,
  'Also known as the Cold Tank. Widely used in elite sport for rapid post-match recovery.', NULL, '{"A", "B", "C", "D"}'::TEXT[],
  '{"high_training_load", "high_soreness"}'::TEXT[], '{"cns_depleted"}'::TEXT[], '{"gym"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Hot-Water Immersion', 'hot-water-immersion', 'classic', 'passive',
  FALSE, FALSE,
  'muscular', '{"nervous", "circulatory", "joint_mobility"}'::TEXT[], '{"autonomic", "cardiovascular", "musculoskeletal"}'::TEXT[],
  '{"full_body"}'::TEXT[], '{}'::TEXT[], '{"decrease_soreness", "improve_circulation", "relax_nervous_system", "restore_mobility"}'::TEXT[], '{"immersion_tub"}'::TEXT[],
  'moderate', '5-10 min', '10-15 min at 40-42°C', '>15-20 min',
  'Submerge in warm water at 40-42°C. Breathe slowly and relax fully. Hydrate before and after.', 'Avoid immediately before competition. Contraindicated with dehydration and cardiovascular disease.', 'Ideal for back-to-back events and cold-environment recovery.', NULL,
  'Known as the Hot Tank. Helps restore tissue pliability and promotes parasympathetic activation.', NULL, '{"A", "B", "C", "D"}'::TEXT[],
  '{"high_training_load", "high_soreness"}'::TEXT[], '{}'::TEXT[], '{"gym"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Contrast Water Therapy', 'contrast-water-therapy', 'classic', 'passive',
  TRUE, FALSE,
  'circulatory', '{"muscular"}'::TEXT[], '{"cardiovascular", "musculoskeletal"}'::TEXT[],
  '{"full_body"}'::TEXT[], '{}'::TEXT[], '{"decrease_soreness", "improve_circulation", "reduce_swelling"}'::TEXT[], '{"immersion_tub"}'::TEXT[],
  'moderate', '8-10 min', '10-15 min alternating cycles', '20 min',
  'Alternate between hot (40-42°C) and cold (10-15°C) water in 1-2 min cycles. End on cold. Maintain slow breathing throughout.', 'Same contraindications as hot and cold immersion. Avoid with Raynaud''s, open wounds, CVD, and uncontrolled hypertension.', 'Effective for DOMS reduction and rapid vascular flushing between sessions.', NULL,
  NULL, NULL, '{"A", "B", "C", "D"}'::TEXT[],
  '{"high_training_load", "high_soreness"}'::TEXT[], '{"cns_depleted"}'::TEXT[], '{"gym"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Sauna', 'sauna', 'classic', 'passive',
  FALSE, FALSE,
  'circulatory', '{"nervous", "cardiovascular"}'::TEXT[], '{"autonomic", "cardiovascular"}'::TEXT[],
  '{"full_body"}'::TEXT[], '{}'::TEXT[], '{"improve_circulation", "relax_nervous_system", "enhance_flexibility"}'::TEXT[], '{"sauna"}'::TEXT[],
  'moderate', '8-10 min', '15-20 min at 80-90°C', '>20 min',
  'Sit or lie in dry sauna at 80-90°C. Breathe steadily through the nose. Hydrate well before and after. Cool down gradually on exit.', 'Avoid before events or competition. Do not use when dehydrated or with uncontrolled hypertension.', 'Best in the evening for sleep quality enhancement, or for heat acclimation protocols.', NULL,
  NULL, NULL, '{"A", "B", "C", "D"}'::TEXT[],
  '{"high_training_load", "high_soreness"}'::TEXT[], '{}'::TEXT[], '{"gym"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Vibration Plate', 'vibration-plate', 'classic', 'passive',
  TRUE, FALSE,
  'muscular', '{"circulatory", "nervous"}'::TEXT[], '{"autonomic", "cardiovascular", "musculoskeletal"}'::TEXT[],
  '{"glutes", "back", "core", "full_body"}'::TEXT[], '{}'::TEXT[], '{"improve_circulation", "restore_mobility", "enhance_flexibility"}'::TEXT[], '{"vibration_plate"}'::TEXT[],
  'moderate', '2-3 min', '5-10 min at 30-50 Hz', '>10-12 min',
  'Stand on vibration plate with soft knees. Shift weight between feet or hold gentle stretches. Keep core engaged lightly.', 'Avoid with acute injuries or stress fractures. Not suitable for post-surgical joints.', 'Useful for DOMS management and pre-training warm-ups.', NULL,
  NULL, NULL, '{"A", "B", "C", "D"}'::TEXT[],
  '{"high_training_load", "high_soreness"}'::TEXT[], '{"cns_depleted"}'::TEXT[], '{"gym"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Compex / NMES', 'compex-nmes', 'classic', 'passive',
  TRUE, FALSE,
  'circulatory', '{"muscular"}'::TEXT[], '{"cardiovascular", "musculoskeletal"}'::TEXT[],
  '{"quads", "hamstrings", "calves", "shoulders"}'::TEXT[], '{}'::TEXT[], '{"decrease_soreness", "improve_circulation", "restore_mobility", "reduce_swelling"}'::TEXT[], '{"nmes_device", "electrode_pads"}'::TEXT[],
  'moderate', '15-20 min', '20-25 min', '30 min',
  'Place electrodes on target muscle group. Set to active recovery program. Intensity should produce visible but comfortable contraction.', 'Contraindicated with pacemakers and during pregnancy. Do not place over the heart or throat.', 'Between games and immediately post-training for accelerated recovery.', NULL,
  NULL, NULL, '{"A", "B", "C", "D"}'::TEXT[],
  '{"high_training_load", "high_soreness"}'::TEXT[], '{"cns_depleted"}'::TEXT[], '{"home", "gym", "travel"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Normatec / IPC', 'normatec', 'classic', 'passive',
  FALSE, FALSE,
  'circulatory', '{"muscular"}'::TEXT[], '{"cardiovascular", "musculoskeletal"}'::TEXT[],
  '{"quads", "hamstrings", "calves", "hips", "full_body"}'::TEXT[], '{}'::TEXT[], '{"decrease_soreness", "improve_circulation", "reduce_swelling"}'::TEXT[], '{"pneumatic_compression_boots"}'::TEXT[],
  'moderate', '15 min', '20-30 min at 80-100 mmHg', '45 min',
  'Wear pneumatic compression boots. Set to sequential pulse mode at comfortable pressure (80-100 mmHg). Elevate legs slightly if possible.', 'Contraindicated with deep vein thrombosis (DVT), peripheral artery disease (PAD), and open wounds.', 'After travel, heavy lower-body sessions, or between competition days.', NULL,
  NULL, NULL, '{"A", "B", "C", "D"}'::TEXT[],
  '{"high_training_load", "high_soreness"}'::TEXT[], '{}'::TEXT[], '{"home", "gym"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Red Light Therapy (Full Body)', 'red-light-full-body', 'classic', 'passive',
  FALSE, FALSE,
  'muscular', '{"circulatory"}'::TEXT[], '{"cardiovascular", "musculoskeletal"}'::TEXT[],
  '{"full_body"}'::TEXT[], '{}'::TEXT[], '{"decrease_soreness", "improve_circulation", "relax_nervous_system", "enhance_flexibility"}'::TEXT[], '{"full_body_red_light_panel"}'::TEXT[],
  'moderate', '5-10 min', '10-15 min at 660-850nm', '20 min',
  'Stand or sit 6-12 inches from full-body panel. Expose skin directly. Wear protective eyewear. Rotate front and back exposure.', 'Avoid direct eye exposure. Contraindicated with photosensitizing medications.', 'After training or in the evening for systemic recovery support.', NULL,
  NULL, NULL, '{"A", "B", "C", "D"}'::TEXT[],
  '{"high_training_load", "high_soreness"}'::TEXT[], '{}'::TEXT[], '{"home", "gym"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Red Light Therapy (Handheld)', 'red-light-handheld', 'classic', 'passive',
  FALSE, FALSE,
  'muscular', '{"circulatory"}'::TEXT[], '{"cardiovascular", "musculoskeletal"}'::TEXT[],
  '{"quads", "hamstrings", "shoulders", "calves"}'::TEXT[], '{}'::TEXT[], '{"decrease_soreness", "improve_circulation", "enhance_flexibility"}'::TEXT[], '{"handheld_red_light_device"}'::TEXT[],
  'moderate', '5 min', '10-15 min targeted per area', '20 min per muscle',
  'Hold device 2-4 inches from target muscle. Move slowly across the tissue. Expose skin directly for best absorption.', 'Avoid eyes, open wounds, and photosensitizing medications.', 'Post-session spot treatment for localized soreness or tightness.', NULL,
  NULL, NULL, '{"A", "B", "C", "D"}'::TEXT[],
  '{"high_training_load", "high_soreness"}'::TEXT[], '{}'::TEXT[], '{"home", "gym", "travel"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Sleep & Nap Strategy', 'sleep-nap-strategy', 'classic', 'passive',
  FALSE, FALSE,
  'nervous', '{"cardiovascular", "circulatory"}'::TEXT[], '{"autonomic", "cardiovascular", "sleep_circadian"}'::TEXT[],
  '{"full_body", "mental_clarity"}'::TEXT[], '{}'::TEXT[], '{"decrease_soreness", "relax_nervous_system", "improve_circulation"}'::TEXT[], '{}'::TEXT[],
  'strong', 'Night 7h / Nap 20 min', 'Night 8-10h / Nap 20-90 min', 'Night 11h / Nap ≤90 min',
  'Prioritize consistent sleep and wake times. Use 20-min power naps or 90-min full-cycle naps. Keep room cool, dark, and quiet.', 'Avoid unmanaged insomnia without professional support. Avoid late naps (after 3 PM) as they may disrupt nighttime sleep.', 'Critical during heavy training blocks, travel across time zones, and when HRV is low.', NULL,
  NULL, NULL, '{"A", "B", "C", "D"}'::TEXT[],
  '{"high_sympathetic", "poor_sleep", "travel_fatigued"}'::TEXT[], '{}'::TEXT[], '{"home", "travel"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Box Breathing', 'box-breathing', 'breathwork', 'passive',
  FALSE, FALSE,
  'nervous', '{"cardiovascular"}'::TEXT[], '{"autonomic", "cardiovascular", "sleep_circadian"}'::TEXT[],
  '{"mental_clarity"}'::TEXT[], '{}'::TEXT[], '{"relax_nervous_system"}'::TEXT[], '{}'::TEXT[],
  'emerging', '2-3 min', '5-10 min', '15-20 min',
  'Inhale through the nose for 4 seconds. Hold for 4 seconds. Exhale through the nose for 4 seconds. Hold for 4 seconds. Repeat.', 'Avoid if prone to hyperventilation or panic episodes. Discontinue if dizziness occurs.', 'Pre-competition focus, post-training cooldown, or before bed for nervous system regulation.', NULL,
  NULL, NULL, '{"A", "B", "C", "D", "E"}'::TEXT[],
  '{"high_sympathetic", "poor_sleep", "high_stress"}'::TEXT[], '{}'::TEXT[], '{"anywhere"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Extended Exhale Breathing (4-6 / 4-8)', 'extended-exhale-breathing', 'breathwork', 'passive',
  FALSE, FALSE,
  'nervous', '{"cardiovascular"}'::TEXT[], '{"autonomic", "cardiovascular", "sleep_circadian"}'::TEXT[],
  '{"mental_clarity"}'::TEXT[], '{}'::TEXT[], '{"relax_nervous_system"}'::TEXT[], '{}'::TEXT[],
  'emerging', '3 min', '5-10 min', '20 min',
  'Inhale through the nose for 4 seconds. Exhale slowly through the nose or mouth for 6-8 seconds. Focus on fully emptying the lungs.', 'Discontinue if lightheadedness occurs. Adjust ratio if exhale feels forced.', 'Nighttime wind-down, after games, or during travel for sleep onset support.', NULL,
  NULL, NULL, '{"A", "B", "C", "D", "E"}'::TEXT[],
  '{"high_sympathetic", "poor_sleep", "high_stress"}'::TEXT[], '{}'::TEXT[], '{"anywhere"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Physiological Sigh', 'physiological-sigh', 'breathwork', 'passive',
  FALSE, FALSE,
  'nervous', '{}'::TEXT[], '{"autonomic", "sleep_circadian"}'::TEXT[],
  '{"mental_clarity"}'::TEXT[], '{}'::TEXT[], '{"relax_nervous_system"}'::TEXT[], '{}'::TEXT[],
  'emerging', '1-2 min', '3-5 min', '10 min',
  'Take two sharp nasal inhales (first fills lungs, second tops them off), then one long slow exhale through the mouth. Repeat.', 'Avoid if hyperventilation-prone. Stop if dizziness develops.', 'Acute stress moments, immediately after competition, or during high-arousal states.', NULL,
  NULL, NULL, '{"A", "B", "C", "D", "E"}'::TEXT[],
  '{"high_sympathetic", "poor_sleep", "high_stress"}'::TEXT[], '{}'::TEXT[], '{"anywhere"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Coherent Breathing (5-5)', 'coherent-breathing', 'breathwork', 'passive',
  FALSE, FALSE,
  'nervous', '{"cardiovascular"}'::TEXT[], '{"autonomic", "cardiovascular", "sleep_circadian"}'::TEXT[],
  '{"mental_clarity"}'::TEXT[], '{}'::TEXT[], '{"relax_nervous_system"}'::TEXT[], '{}'::TEXT[],
  'emerging', '3 min', '5-10 min (~6 breaths/min)', '20 min',
  'Inhale through the nose for 5 seconds. Exhale through the nose for 5 seconds. Maintain nasal-only breathing at approximately 6 breaths per minute.', 'Adjust timing if breath pattern feels strained.', 'Before bed for HRV optimization, or during cooldown periods.', NULL,
  NULL, NULL, '{"A", "B", "C", "D", "E"}'::TEXT[],
  '{"high_sympathetic", "poor_sleep", "high_stress"}'::TEXT[], '{}'::TEXT[], '{"anywhere"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  '4-5-6 Breathing', 'four-five-six-breathing', 'breathwork', 'passive',
  FALSE, FALSE,
  'nervous', '{"cardiovascular"}'::TEXT[], '{"autonomic", "cardiovascular", "sleep_circadian"}'::TEXT[],
  '{"mental_clarity"}'::TEXT[], '{}'::TEXT[], '{"relax_nervous_system"}'::TEXT[], '{}'::TEXT[],
  'emerging', '3 min', '5-10 min', '20 min',
  'Inhale through the nose for 4 seconds. Hold the breath for 5 seconds. Exhale slowly through the nose or mouth for 6 seconds. Repeat.', 'Avoid if breath holds cause discomfort or anxiety. Adjust timing as needed.', 'Evening wind-down routines and pre-sleep protocols.', NULL,
  NULL, NULL, '{"A", "B", "C", "D", "E"}'::TEXT[],
  '{"high_sympathetic", "poor_sleep", "high_stress"}'::TEXT[], '{}'::TEXT[], '{"anywhere"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Mindful Body Scan', 'mindful-body-scan', 'breathwork', 'passive',
  FALSE, FALSE,
  'nervous', '{"cardiovascular"}'::TEXT[], '{"autonomic", "cardiovascular", "sleep_circadian"}'::TEXT[],
  '{"mental_clarity", "full_body"}'::TEXT[], '{}'::TEXT[], '{"relax_nervous_system"}'::TEXT[], '{}'::TEXT[],
  'emerging', '5 min', '10-20 min', '30 min',
  'Lie down or sit comfortably. Breathe slowly through the nose. Systematically direct attention from feet to head, noticing tension and releasing it in each region.', 'Not ideal immediately before competition as it promotes deep relaxation.', 'Evening sessions, rest days, or as part of a pre-sleep routine.', NULL,
  NULL, NULL, '{"A", "B", "C", "D", "E"}'::TEXT[],
  '{"high_sympathetic", "poor_sleep", "high_stress"}'::TEXT[], '{}'::TEXT[], '{"anywhere"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Legs on Wall', 'legs-on-wall', 'passive', 'passive',
  FALSE, FALSE,
  'nervous', '{"circulatory"}'::TEXT[], '{"autonomic", "cardiovascular", "sleep_circadian"}'::TEXT[],
  '{"quads", "hamstrings", "hips", "ankles", "mental_clarity"}'::TEXT[], '{}'::TEXT[], '{"decrease_soreness", "relax_nervous_system", "reduce_swelling"}'::TEXT[], '{}'::TEXT[],
  'strong', '~2 min', '5-15 min', '~20 min',
  'Lie on your back with legs extended up a wall. Keep hips close to the wall. Relax arms by your sides. Breathe slowly through the nose.', 'Avoid with glaucoma or uncontrolled hypertension.', 'After intense training sessions or competition for venous return and nervous system calming.', NULL,
  NULL, NULL, '{"A", "B", "C", "D", "E"}'::TEXT[],
  '{"high_sympathetic", "poor_sleep", "travel_fatigued"}'::TEXT[], '{}'::TEXT[], '{"anywhere"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Quad Foam Roll', 'quad-foam-roll', 'foam_roll', 'passive',
  FALSE, FALSE,
  'muscular', '{"nervous", "circulatory"}'::TEXT[], '{"autonomic", "cardiovascular", "musculoskeletal"}'::TEXT[],
  '{"quads"}'::TEXT[], '{}'::TEXT[], '{"decrease_soreness", "improve_circulation", "restore_mobility"}'::TEXT[], '{"foam_roller"}'::TEXT[],
  'strong', '30-60s per muscle', '1-2 min per muscle', '10-20 min total',
  'Lie face down with foam roller under the quads. Roll slowly from hip to just above the knee. Pause on tender spots for 20-30 seconds.', 'Avoid rolling directly over bony prominences or acute injuries.', 'Post-training or on recovery days to address quad tightness.', NULL,
  NULL, NULL, '{"A", "B", "C"}'::TEXT[],
  '{"high_soreness", "high_training_load", "desk_bound"}'::TEXT[], '{}'::TEXT[], '{"home", "gym"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Hamstring Foam Roll', 'hamstring-foam-roll', 'foam_roll', 'passive',
  FALSE, FALSE,
  'muscular', '{"nervous", "circulatory"}'::TEXT[], '{"autonomic", "cardiovascular", "musculoskeletal"}'::TEXT[],
  '{"hamstrings"}'::TEXT[], '{}'::TEXT[], '{"decrease_soreness", "improve_circulation", "restore_mobility"}'::TEXT[], '{"foam_roller"}'::TEXT[],
  'strong', '30-60s per muscle', '1-2 min per muscle', '10-20 min total',
  'Sit with foam roller under hamstrings. Roll from just above the knee to the glute fold. Cross one leg over the other for increased pressure.', 'Avoid rolling over the back of the knee. Skip if acute hamstring strain is present.', 'Post-training or during cooldowns to release hamstring tension.', NULL,
  NULL, NULL, '{"A", "B", "C"}'::TEXT[],
  '{"high_soreness", "high_training_load", "desk_bound"}'::TEXT[], '{}'::TEXT[], '{"home", "gym"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Calf Foam Roll', 'calf-foam-roll', 'foam_roll', 'passive',
  FALSE, FALSE,
  'muscular', '{"nervous", "circulatory"}'::TEXT[], '{"autonomic", "cardiovascular", "musculoskeletal"}'::TEXT[],
  '{"calves"}'::TEXT[], '{}'::TEXT[], '{"decrease_soreness", "improve_circulation", "restore_mobility"}'::TEXT[], '{"foam_roller"}'::TEXT[],
  'strong', '30-60s per muscle', '1-2 min per muscle', '10-20 min total',
  'Sit with foam roller under the calves. Roll from Achilles tendon area to just below the knee. Rotate foot inward and outward to target different calf fibers.', 'Avoid directly on the Achilles tendon. Skip with active calf strains.', 'Post-running or after prolonged standing to relieve calf tightness.', NULL,
  NULL, NULL, '{"A", "B", "C"}'::TEXT[],
  '{"high_soreness", "high_training_load", "desk_bound"}'::TEXT[], '{}'::TEXT[], '{"home", "gym"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Lat Foam Roll', 'lat-foam-roll', 'foam_roll', 'passive',
  FALSE, FALSE,
  'muscular', '{"nervous", "circulatory"}'::TEXT[], '{"autonomic", "cardiovascular", "musculoskeletal"}'::TEXT[],
  '{"back"}'::TEXT[], '{}'::TEXT[], '{"decrease_soreness", "improve_circulation", "restore_mobility"}'::TEXT[], '{"foam_roller"}'::TEXT[],
  'strong', '30-60s per muscle', '1-2 min per muscle', '10-20 min total',
  'Lie on your side with the foam roller under the lat. Extend the arm overhead. Roll from the armpit to the lower rib area.', 'Avoid rolling over the ribs aggressively. Skip with rib or shoulder injuries.', 'Post-upper-body training or when thoracic stiffness limits overhead mobility.', NULL,
  NULL, NULL, '{"A", "B", "C"}'::TEXT[],
  '{"high_soreness", "high_training_load", "desk_bound"}'::TEXT[], '{}'::TEXT[], '{"home", "gym"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Lower Back Foam Roll', 'lower-back-foam-roll', 'foam_roll', 'passive',
  FALSE, FALSE,
  'muscular', '{"nervous", "circulatory"}'::TEXT[], '{"autonomic", "cardiovascular", "musculoskeletal"}'::TEXT[],
  '{"lumbar"}'::TEXT[], '{}'::TEXT[], '{"decrease_soreness", "improve_circulation", "restore_mobility"}'::TEXT[], '{"foam_roller"}'::TEXT[],
  'strong', '30-60s per muscle', '1-2 min per muscle', '10-20 min total',
  'Lie with foam roller under the lower back, knees bent. Gently roll the erector muscles lateral to the spine. Avoid direct pressure on the spine itself.', 'Avoid rolling directly on the lumbar spine. Not recommended for acute disc issues.', 'Post-training or on recovery days to address lumbar tightness.', NULL,
  NULL, NULL, '{"A", "B", "C"}'::TEXT[],
  '{"high_soreness", "high_training_load", "desk_bound"}'::TEXT[], '{}'::TEXT[], '{"home", "gym"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Upper/Mid Back Foam Roll', 'upper-mid-back-foam-roll', 'foam_roll', 'passive',
  FALSE, FALSE,
  'muscular', '{"nervous", "circulatory"}'::TEXT[], '{"autonomic", "cardiovascular", "musculoskeletal"}'::TEXT[],
  '{"thoracic", "back"}'::TEXT[], '{}'::TEXT[], '{"decrease_soreness", "improve_circulation", "restore_mobility"}'::TEXT[], '{"foam_roller"}'::TEXT[],
  'strong', '30-60s per muscle', '1-2 min per muscle', '10-20 min total',
  'Lie with foam roller under the upper/mid back. Cross arms over the chest. Roll from mid-back to upper traps area, extending over the roller for thoracic extension.', 'Avoid excessive extension if hypermobile. Skip with acute thoracic injuries.', 'Post-training or during warm-ups to improve thoracic extension and posture.', NULL,
  NULL, NULL, '{"A", "B", "C"}'::TEXT[],
  '{"high_soreness", "high_training_load", "desk_bound"}'::TEXT[], '{}'::TEXT[], '{"home", "gym"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Adductor Foam Roll', 'adductor-foam-roll', 'foam_roll', 'passive',
  FALSE, FALSE,
  'muscular', '{"nervous", "circulatory"}'::TEXT[], '{"autonomic", "cardiovascular", "musculoskeletal"}'::TEXT[],
  '{"hips"}'::TEXT[], '{}'::TEXT[], '{"decrease_soreness", "improve_circulation", "restore_mobility"}'::TEXT[], '{"foam_roller"}'::TEXT[],
  'strong', '30-60s per muscle', '1-2 min per muscle', '10-20 min total',
  'Lie face down with one leg out to the side. Place the foam roller under the inner thigh. Roll from groin to just above the knee.', 'Avoid rolling directly on the pubic bone or groin crease. Skip with adductor strains.', 'Post-training after lateral movements, cutting drills, or heavy squatting.', NULL,
  NULL, NULL, '{"A", "B", "C"}'::TEXT[],
  '{"high_soreness", "high_training_load", "desk_bound"}'::TEXT[], '{}'::TEXT[], '{"home", "gym"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Hip Flexor Foam Roll', 'hip-flexor-foam-roll', 'foam_roll', 'passive',
  FALSE, FALSE,
  'muscular', '{"nervous", "circulatory"}'::TEXT[], '{"autonomic", "cardiovascular", "musculoskeletal"}'::TEXT[],
  '{"hips"}'::TEXT[], '{}'::TEXT[], '{"decrease_soreness", "improve_circulation", "restore_mobility"}'::TEXT[], '{"foam_roller"}'::TEXT[],
  'strong', '30-60s per muscle', '1-2 min per muscle', '10-20 min total',
  'Lie face down with the foam roller positioned at the front of the hip. Roll slowly from the hip crease to the upper quad. Breathe and relax into tender areas.', 'Avoid rolling on the hip bone directly. Skip with hip impingement symptoms.', 'After prolonged sitting, post-running, or when hip extension feels restricted.', NULL,
  NULL, NULL, '{"A", "B", "C"}'::TEXT[],
  '{"high_soreness", "high_training_load", "desk_bound"}'::TEXT[], '{}'::TEXT[], '{"home", "gym"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'IT Band Foam Roll', 'it-band-foam-roll', 'foam_roll', 'passive',
  FALSE, FALSE,
  'muscular', '{"nervous", "circulatory"}'::TEXT[], '{"autonomic", "cardiovascular", "musculoskeletal"}'::TEXT[],
  '{"quads", "hips", "knee"}'::TEXT[], '{}'::TEXT[], '{"decrease_soreness", "improve_circulation", "restore_mobility"}'::TEXT[], '{"foam_roller"}'::TEXT[],
  'strong', '30-60s per muscle', '1-2 min per muscle', '10-20 min total',
  'Lie on your side with the foam roller under the outer thigh. Roll from the hip to just above the knee. Use the top leg for support and pressure control.', 'Avoid rolling directly on the knee joint. Skip with acute IT band syndrome flare-ups.', 'Post-running or cycling to address lateral thigh tightness.', NULL,
  NULL, NULL, '{"A", "B", "C"}'::TEXT[],
  '{"high_soreness", "high_training_load", "desk_bound"}'::TEXT[], '{}'::TEXT[], '{"home", "gym"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'TFL Foam Roll', 'tfl-foam-roll', 'foam_roll', 'passive',
  FALSE, FALSE,
  'muscular', '{"nervous", "circulatory"}'::TEXT[], '{"autonomic", "cardiovascular", "musculoskeletal"}'::TEXT[],
  '{"hips"}'::TEXT[], '{}'::TEXT[], '{"decrease_soreness", "improve_circulation", "restore_mobility"}'::TEXT[], '{"foam_roller"}'::TEXT[],
  'strong', '30-60s per muscle', '1-2 min per muscle', '10-20 min total',
  'Lie face down with the foam roller positioned at the front-outer hip (TFL). Apply gentle pressure and roll a small range. Hold on tender spots.', 'Avoid excessive pressure on the hip bone. Skip with hip bursitis.', 'Post-training or when hip snapping or anterior hip tightness is present.', NULL,
  NULL, NULL, '{"A", "B", "C"}'::TEXT[],
  '{"high_soreness", "high_training_load", "desk_bound"}'::TEXT[], '{}'::TEXT[], '{"home", "gym"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Glute/Piriformis Foam Roll', 'glute-piriformis-foam-roll', 'foam_roll', 'passive',
  FALSE, FALSE,
  'muscular', '{"nervous", "circulatory"}'::TEXT[], '{"autonomic", "cardiovascular", "musculoskeletal"}'::TEXT[],
  '{"glutes", "hips"}'::TEXT[], '{}'::TEXT[], '{"decrease_soreness", "improve_circulation", "restore_mobility"}'::TEXT[], '{"foam_roller"}'::TEXT[],
  'strong', '30-60s per muscle', '1-2 min per muscle', '10-20 min total',
  'Sit on the foam roller with one ankle crossed over the opposite knee. Lean toward the crossed side and roll the glute and piriformis area.', 'Avoid if sciatic nerve symptoms worsen during rolling. Skip with acute piriformis syndrome.', 'Post-training or when deep glute and piriformis tightness limits hip mobility.', NULL,
  NULL, NULL, '{"A", "B", "C"}'::TEXT[],
  '{"high_soreness", "high_training_load", "desk_bound"}'::TEXT[], '{}'::TEXT[], '{"home", "gym"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Lacrosse Ball IT Band Release', 'lacrosse-it-band', 'foam_roll', 'passive',
  FALSE, FALSE,
  'muscular', '{"nervous", "circulatory"}'::TEXT[], '{"autonomic", "cardiovascular", "musculoskeletal"}'::TEXT[],
  '{"quads", "hips", "knee"}'::TEXT[], '{}'::TEXT[], '{"decrease_soreness", "improve_circulation", "restore_mobility"}'::TEXT[], '{"lacrosse_ball"}'::TEXT[],
  'strong', '30-60s per muscle', '1-2 min per muscle', '10-20 min total',
  'Lie on your side with a lacrosse ball under the outer thigh. Target specific trigger points along the IT band. Hold and breathe into tender spots for 20-30 seconds.', 'Avoid the knee joint. Skip with acute IT band inflammation.', 'Post-running or when targeted IT band release is needed beyond foam rolling.', NULL,
  NULL, NULL, '{"A", "B", "C"}'::TEXT[],
  '{"high_soreness", "high_training_load", "desk_bound"}'::TEXT[], '{}'::TEXT[], '{"home", "gym", "travel"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Lacrosse Ball Rotator Cuff Release', 'lacrosse-rotator-cuff', 'foam_roll', 'passive',
  FALSE, FALSE,
  'muscular', '{"nervous", "circulatory"}'::TEXT[], '{"autonomic", "cardiovascular", "musculoskeletal"}'::TEXT[],
  '{"shoulders"}'::TEXT[], '{}'::TEXT[], '{"decrease_soreness", "improve_circulation", "restore_mobility"}'::TEXT[], '{"lacrosse_ball"}'::TEXT[],
  'strong', '30-60s per muscle', '1-2 min per muscle', '10-20 min total',
  'Stand against a wall with a lacrosse ball between the wall and the back of the shoulder. Roll slowly across the infraspinatus and teres minor. Hold on trigger points.', 'Avoid with acute rotator cuff tears or shoulder instability. Do not roll directly on the spine.', 'Post-overhead training or throwing to address posterior shoulder tightness.', NULL,
  NULL, NULL, '{"A", "B", "C"}'::TEXT[],
  '{"high_soreness", "high_training_load", "desk_bound"}'::TEXT[], '{}'::TEXT[], '{"home", "gym", "travel"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Tennis Ball Feet Release', 'tennis-ball-feet', 'foam_roll', 'passive',
  FALSE, FALSE,
  'muscular', '{"nervous", "circulatory"}'::TEXT[], '{"autonomic", "cardiovascular", "musculoskeletal"}'::TEXT[],
  '{"ankles"}'::TEXT[], '{}'::TEXT[], '{"decrease_soreness", "improve_circulation", "restore_mobility"}'::TEXT[], '{"tennis_ball"}'::TEXT[],
  'strong', '30-60s per muscle', '1-2 min per muscle', '10-20 min total',
  'Stand or sit with a tennis ball under the foot. Roll from heel to toes, applying moderate pressure. Pause on tender spots in the arch.', 'Avoid with plantar fascia rupture or acute foot fractures.', 'Post-training, after prolonged standing, or to address plantar fascia tightness.', NULL,
  NULL, NULL, '{"A", "B", "C"}'::TEXT[],
  '{"high_soreness", "high_training_load", "desk_bound"}'::TEXT[], '{}'::TEXT[], '{"home", "gym", "travel"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Lacrosse Ball Glute/Piriformis Release', 'lacrosse-glute-piriformis', 'foam_roll', 'passive',
  FALSE, FALSE,
  'muscular', '{"nervous", "circulatory"}'::TEXT[], '{"autonomic", "cardiovascular", "musculoskeletal"}'::TEXT[],
  '{"glutes", "hips"}'::TEXT[], '{}'::TEXT[], '{"decrease_soreness", "improve_circulation", "restore_mobility"}'::TEXT[], '{"lacrosse_ball"}'::TEXT[],
  'strong', '30-60s per muscle', '1-2 min per muscle', '10-20 min total',
  'Sit on a lacrosse ball with one ankle crossed over the opposite knee. Target the piriformis and deep glute rotators. Hold on tender spots and breathe deeply.', 'Avoid if sciatic symptoms increase. Skip with acute piriformis syndrome.', 'Post-training or when deep glute trigger points need targeted release.', NULL,
  NULL, NULL, '{"A", "B", "C"}'::TEXT[],
  '{"high_soreness", "high_training_load", "desk_bound"}'::TEXT[], '{}'::TEXT[], '{"home", "gym", "travel"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Lacrosse Ball Upper Traps/Neck Release', 'lacrosse-upper-traps-neck', 'foam_roll', 'passive',
  FALSE, FALSE,
  'muscular', '{"nervous", "circulatory"}'::TEXT[], '{"autonomic", "cardiovascular", "musculoskeletal"}'::TEXT[],
  '{"cervical", "shoulders"}'::TEXT[], '{}'::TEXT[], '{"decrease_soreness", "improve_circulation", "restore_mobility"}'::TEXT[], '{"lacrosse_ball"}'::TEXT[],
  'strong', '30-60s per muscle', '1-2 min per muscle', '10-20 min total',
  'Stand against a wall with a lacrosse ball between the wall and the upper trap/neck junction. Roll slowly and hold on trigger points. Keep chin slightly tucked.', 'Avoid direct pressure on the cervical spine. Skip with cervical disc issues or acute neck injuries.', 'Post-training or after prolonged desk/screen work to relieve upper trap tension.', NULL,
  NULL, NULL, '{"A", "B", "C"}'::TEXT[],
  '{"high_soreness", "high_training_load", "desk_bound"}'::TEXT[], '{}'::TEXT[], '{"home", "gym", "travel"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Lacrosse Ball TFL/Hip Release', 'lacrosse-tfl-hip', 'foam_roll', 'passive',
  FALSE, FALSE,
  'muscular', '{"nervous", "circulatory"}'::TEXT[], '{"autonomic", "cardiovascular", "musculoskeletal"}'::TEXT[],
  '{"hips"}'::TEXT[], '{}'::TEXT[], '{"decrease_soreness", "improve_circulation", "restore_mobility"}'::TEXT[], '{"lacrosse_ball"}'::TEXT[],
  'strong', '30-60s per muscle', '1-2 min per muscle', '10-20 min total',
  'Lie face down with a lacrosse ball under the front-outer hip (TFL). Apply gentle pressure and make small movements. Hold on tender spots for 20-30 seconds.', 'Avoid direct pressure on the hip bone. Skip with hip bursitis.', 'Post-training or when targeted TFL release is needed for hip mobility.', NULL,
  NULL, NULL, '{"A", "B", "C"}'::TEXT[],
  '{"high_soreness", "high_training_load", "desk_bound"}'::TEXT[], '{}'::TEXT[], '{"home", "gym", "travel"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Chest/Pec Release', 'chest-pec-release', 'foam_roll', 'passive',
  FALSE, FALSE,
  'muscular', '{"nervous", "circulatory"}'::TEXT[], '{"autonomic", "cardiovascular", "musculoskeletal"}'::TEXT[],
  '{"pecs", "shoulders"}'::TEXT[], '{}'::TEXT[], '{"decrease_soreness", "improve_circulation", "restore_mobility"}'::TEXT[], '{"foam_roller"}'::TEXT[],
  'strong', '30-60s per muscle', '1-2 min per muscle', '10-20 min total',
  'Stand facing a wall with a lacrosse ball between the wall and the pec/chest area near the shoulder. Roll slowly and hold on trigger points. Keep breathing steady.', 'Avoid direct pressure on the sternum or clavicle. Skip with acute shoulder injuries.', 'Post-upper-body training or to address anterior shoulder tightness and rounded posture.', NULL,
  NULL, NULL, '{"A", "B", "C"}'::TEXT[],
  '{"high_soreness", "high_training_load", "desk_bound"}'::TEXT[], '{}'::TEXT[], '{"home", "gym"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Banded Hip Opener', 'banded-hip-opener', 'banded', 'active',
  FALSE, FALSE,
  'joint_mobility', '{"muscular"}'::TEXT[], '{"musculoskeletal"}'::TEXT[],
  '{"hips", "glutes"}'::TEXT[], '{}'::TEXT[], '{"restore_mobility", "enhance_flexibility"}'::TEXT[], '{"resistance_band"}'::TEXT[],
  'moderate', '30-60s per side', '1-2 min per side', '5 min total',
  'Anchor a resistance band low and loop it around the hip crease. Step away to create tension. Perform a lunge or squat pattern, letting the band distract the femur posteriorly.', 'Avoid with hip labral tears or acute hip pain. Do not force range of motion.', 'Pre-training warm-up or recovery day hip mobility work.', NULL,
  NULL, NULL, '{"B", "C", "D"}'::TEXT[],
  '{"mobility_limited", "high_training_load"}'::TEXT[], '{}'::TEXT[], '{"home", "gym"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Banded Shoulder Stretch', 'banded-shoulder-stretch', 'banded', 'active',
  FALSE, FALSE,
  'joint_mobility', '{"muscular"}'::TEXT[], '{"musculoskeletal"}'::TEXT[],
  '{"shoulders"}'::TEXT[], '{}'::TEXT[], '{"restore_mobility", "enhance_flexibility"}'::TEXT[], '{"resistance_band"}'::TEXT[],
  'moderate', '30-60s per side', '1-2 min per side', '5 min total',
  'Anchor a resistance band at shoulder height. Loop around the wrist or hand. Step away and let the band distract the shoulder joint. Move through flexion, abduction, and rotation patterns.', 'Avoid with shoulder instability or acute rotator cuff injuries. Do not force end-range.', 'Pre-training or on recovery days for shoulder mobility restoration.', NULL,
  NULL, NULL, '{"B", "C", "D"}'::TEXT[],
  '{"mobility_limited", "high_training_load"}'::TEXT[], '{}'::TEXT[], '{"home", "gym"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Banded Hamstring Floss', 'banded-hamstring-floss', 'banded', 'active',
  FALSE, FALSE,
  'joint_mobility', '{"muscular"}'::TEXT[], '{"musculoskeletal"}'::TEXT[],
  '{"hamstrings", "hips"}'::TEXT[], '{}'::TEXT[], '{"restore_mobility", "enhance_flexibility"}'::TEXT[], '{"resistance_band"}'::TEXT[],
  'moderate', '30-60s per side', '1-2 min per side', '5 min total',
  'Lie on your back with a resistance band looped around one foot. Pull the leg toward the ceiling while keeping the knee straight. Slowly flex and extend the knee to floss the sciatic nerve.', 'Avoid with acute hamstring strains or sciatic nerve irritation. Do not force the stretch.', 'Post-training or during recovery sessions for hamstring mobility.', NULL,
  NULL, NULL, '{"B", "C", "D"}'::TEXT[],
  '{"mobility_limited", "high_training_load"}'::TEXT[], '{}'::TEXT[], '{"home", "gym"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Banded Hip Traction', 'banded-hip-traction', 'banded', 'active',
  FALSE, FALSE,
  'joint_mobility', '{"muscular"}'::TEXT[], '{"musculoskeletal"}'::TEXT[],
  '{"hips"}'::TEXT[], '{}'::TEXT[], '{"restore_mobility", "enhance_flexibility"}'::TEXT[], '{"resistance_band"}'::TEXT[],
  'moderate', '30-60s per side', '1-2 min per side', '5 min total',
  'Anchor a band low and loop it high around the hip crease. Lean away to create a traction force on the hip joint. Hold the distracted position and gently rock into flexion and rotation.', 'Avoid with hip replacement, labral tears, or acute hip pathology.', 'Pre-training for athletes with hip impingement or stiffness.', NULL,
  NULL, NULL, '{"B", "C", "D"}'::TEXT[],
  '{"mobility_limited", "high_training_load"}'::TEXT[], '{}'::TEXT[], '{"home", "gym"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Banded Ankle Mobilization', 'banded-ankle-mobilization', 'banded', 'active',
  FALSE, FALSE,
  'joint_mobility', '{"muscular"}'::TEXT[], '{"musculoskeletal"}'::TEXT[],
  '{"ankles"}'::TEXT[], '{}'::TEXT[], '{"restore_mobility", "enhance_flexibility"}'::TEXT[], '{"resistance_band"}'::TEXT[],
  'moderate', '30-60s per side', '1-2 min per side', '5 min total',
  'Anchor a band low and loop it around the front of the ankle. Assume a half-kneeling position facing away from the anchor. Drive the knee forward over the toe while the band pulls the talus posteriorly.', 'Avoid with acute ankle sprains or fractures. Do not force dorsiflexion.', 'Pre-squat or pre-training when ankle dorsiflexion is limited.', NULL,
  NULL, NULL, '{"B", "C", "D"}'::TEXT[],
  '{"mobility_limited", "high_training_load"}'::TEXT[], '{}'::TEXT[], '{"home", "gym"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Banded Lat Stretch', 'banded-lat-stretch', 'banded', 'active',
  FALSE, FALSE,
  'joint_mobility', '{"muscular"}'::TEXT[], '{"musculoskeletal"}'::TEXT[],
  '{"back", "shoulders"}'::TEXT[], '{}'::TEXT[], '{"restore_mobility", "enhance_flexibility"}'::TEXT[], '{"resistance_band"}'::TEXT[],
  'moderate', '30-60s per side', '1-2 min per side', '5 min total',
  'Anchor a band overhead. Grip the band and step away, hinging at the hips. Let the band pull the arm overhead to stretch the lat. Breathe deeply and hold.', 'Avoid with acute shoulder injuries or lat strains. Do not force overhead range.', 'Pre-training or recovery day to improve overhead mobility and lat length.', NULL,
  NULL, NULL, '{"B", "C", "D"}'::TEXT[],
  '{"mobility_limited", "high_training_load"}'::TEXT[], '{}'::TEXT[], '{"home", "gym"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Banded Thoracic Rotation', 'banded-thoracic-rotation', 'banded', 'active',
  FALSE, FALSE,
  'joint_mobility', '{"muscular"}'::TEXT[], '{"musculoskeletal"}'::TEXT[],
  '{"thoracic", "back"}'::TEXT[], '{}'::TEXT[], '{"restore_mobility", "enhance_flexibility"}'::TEXT[], '{"resistance_band"}'::TEXT[],
  'moderate', '30-60s per side', '1-2 min per side', '5 min total',
  'Anchor a band at chest height. Stand perpendicular to the anchor. Hold the band with both hands and rotate the torso away, driving rotation through the thoracic spine.', 'Avoid with acute spinal injuries or disc herniations. Keep lumbar spine stable.', 'Pre-training or recovery day for thoracic rotation and anti-rotation readiness.', NULL,
  NULL, NULL, '{"B", "C", "D"}'::TEXT[],
  '{"mobility_limited", "high_training_load"}'::TEXT[], '{}'::TEXT[], '{"home", "gym"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Hip CARs (Controlled Articular Rotations)', 'hip-cars', 'dynamic_mobility', 'active',
  FALSE, TRUE,
  'joint_mobility', '{"muscular", "nervous"}'::TEXT[], '{"autonomic", "musculoskeletal"}'::TEXT[],
  '{"hips", "glutes"}'::TEXT[], '{}'::TEXT[], '{"restore_mobility", "enhance_flexibility"}'::TEXT[], '{}'::TEXT[],
  'moderate', '3-5 reps per side', '5-10 reps per side', '15 reps per side',
  'Stand on one leg, holding a wall for support. Lift the opposite knee to hip height, then rotate the hip out, extend back, and return in a full circle. Reverse direction.', 'Avoid with hip labral tears or acute hip pain. Do not rush the movement.', 'Morning routines, warm-ups, or off-day mobility sessions.', NULL,
  NULL, NULL, '{"B", "C", "D"}'::TEXT[],
  '{"mobility_limited", "morning_stiff", "desk_bound"}'::TEXT[], '{"game_day"}'::TEXT[], '{"home", "gym", "travel"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Shoulder Circles', 'shoulder-circles', 'dynamic_mobility', 'active',
  FALSE, TRUE,
  'joint_mobility', '{"muscular"}'::TEXT[], '{"musculoskeletal"}'::TEXT[],
  '{"shoulders"}'::TEXT[], '{}'::TEXT[], '{"restore_mobility", "enhance_flexibility"}'::TEXT[], '{}'::TEXT[],
  'moderate', '5-10 reps each direction', '10-15 reps each direction', '20 reps each direction',
  'Stand tall with arms relaxed. Make slow, controlled circles with the shoulders, progressively increasing range. Perform forward and backward circles.', 'Avoid with acute shoulder injuries. Reduce range if impingement symptoms occur.', 'Morning routines, warm-ups, or off-day mobility sessions.', NULL,
  NULL, NULL, '{"B", "C", "D"}'::TEXT[],
  '{"mobility_limited", "morning_stiff", "desk_bound"}'::TEXT[], '{"game_day"}'::TEXT[], '{"home", "gym", "travel"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Spine Cat-Cow', 'spine-cat-cow', 'dynamic_mobility', 'active',
  FALSE, TRUE,
  'joint_mobility', '{"muscular", "nervous"}'::TEXT[], '{"autonomic", "musculoskeletal"}'::TEXT[],
  '{"thoracic", "lumbar", "core"}'::TEXT[], '{}'::TEXT[], '{"restore_mobility", "enhance_flexibility", "relax_nervous_system"}'::TEXT[], '{}'::TEXT[],
  'strong', '5-8 reps', '10-15 reps', '20 reps',
  'Start on hands and knees. Inhale, arch the back and lift the head (cow). Exhale, round the spine and tuck the chin (cat). Move slowly with breath.', 'Avoid with acute disc herniations. Reduce range if low back pain increases.', 'Morning routines, warm-ups, or off-day spinal mobility sessions.', NULL,
  NULL, NULL, '{"B", "C", "D"}'::TEXT[],
  '{"mobility_limited", "morning_stiff", "desk_bound"}'::TEXT[], '{"game_day"}'::TEXT[], '{"home", "gym", "travel"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Wrist & Ankle Circles', 'wrist-ankle-circles', 'dynamic_mobility', 'active',
  FALSE, TRUE,
  'joint_mobility', '{"muscular"}'::TEXT[], '{"musculoskeletal"}'::TEXT[],
  '{"wrists", "ankles"}'::TEXT[], '{}'::TEXT[], '{"restore_mobility", "enhance_flexibility"}'::TEXT[], '{}'::TEXT[],
  'moderate', '5-10 reps each direction', '10-15 reps each direction', '20 reps each direction',
  'Make slow, controlled circles with the wrists and ankles. Perform clockwise and counterclockwise. Focus on full range of motion.', 'Avoid with acute wrist or ankle sprains. Reduce range if pain occurs.', 'Morning routines, warm-ups, or off-day joint mobility sessions.', NULL,
  NULL, NULL, '{"B", "C", "D"}'::TEXT[],
  '{"mobility_limited", "morning_stiff", "desk_bound"}'::TEXT[], '{"game_day"}'::TEXT[], '{"home", "gym", "travel"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Lunge with Rotation & Reach', 'lunge-rotation-reach', 'dynamic_mobility', 'active',
  FALSE, TRUE,
  'joint_mobility', '{"muscular", "nervous"}'::TEXT[], '{"autonomic", "musculoskeletal"}'::TEXT[],
  '{"hips", "thoracic", "core"}'::TEXT[], '{}'::TEXT[], '{"restore_mobility", "enhance_flexibility"}'::TEXT[], '{}'::TEXT[],
  'moderate', '3-5 reps per side', '5-8 reps per side', '12 reps per side',
  'Step into a deep lunge. Place the inside hand on the ground. Rotate the torso and reach the opposite arm to the ceiling. Hold briefly, then return and switch sides.', 'Avoid with acute knee or hip injuries. Reduce depth if balance is compromised.', 'Warm-ups or off-day mobility flows for multi-joint integration.', NULL,
  NULL, NULL, '{"B", "C", "D"}'::TEXT[],
  '{"mobility_limited", "morning_stiff", "desk_bound"}'::TEXT[], '{"game_day"}'::TEXT[], '{"home", "gym", "travel"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Inchworms', 'inchworms', 'dynamic_mobility', 'active',
  FALSE, TRUE,
  'joint_mobility', '{"muscular"}'::TEXT[], '{"musculoskeletal"}'::TEXT[],
  '{"hamstrings", "shoulders", "core"}'::TEXT[], '{}'::TEXT[], '{"restore_mobility", "enhance_flexibility"}'::TEXT[], '{}'::TEXT[],
  'moderate', '3-5 reps', '5-8 reps', '12 reps',
  'Stand tall, hinge at the hips, and walk the hands out to a plank position. Pause briefly, then walk the hands back to the feet and stand up.', 'Avoid with acute hamstring strains or wrist injuries. Modify if low back pain occurs.', 'Warm-ups or off-day mobility flows for full-body integration.', NULL,
  NULL, NULL, '{"B", "C", "D"}'::TEXT[],
  '{"mobility_limited", "morning_stiff", "desk_bound"}'::TEXT[], '{"game_day"}'::TEXT[], '{"home", "gym", "travel"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Hip Circles', 'hip-circles', 'dynamic_mobility', 'active',
  FALSE, TRUE,
  'joint_mobility', '{"muscular"}'::TEXT[], '{"musculoskeletal"}'::TEXT[],
  '{"hips", "glutes"}'::TEXT[], '{}'::TEXT[], '{"restore_mobility", "enhance_flexibility"}'::TEXT[], '{}'::TEXT[],
  'moderate', '5-10 reps each direction', '10-15 reps each direction', '20 reps each direction',
  'Stand on one leg. Make controlled circles with the free hip, moving through flexion, abduction, extension, and adduction. Reverse direction.', 'Avoid with hip labral tears or acute hip pain. Use wall support if balance is limited.', 'Morning routines, warm-ups, or off-day hip mobility sessions.', NULL,
  NULL, NULL, '{"B", "C", "D"}'::TEXT[],
  '{"mobility_limited", "morning_stiff", "desk_bound"}'::TEXT[], '{"game_day"}'::TEXT[], '{"home", "gym", "travel"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Thoracic Arm Sweeps', 'thoracic-arm-sweeps', 'dynamic_mobility', 'active',
  FALSE, TRUE,
  'joint_mobility', '{"muscular"}'::TEXT[], '{"musculoskeletal"}'::TEXT[],
  '{"thoracic", "shoulders"}'::TEXT[], '{}'::TEXT[], '{"restore_mobility", "enhance_flexibility"}'::TEXT[], '{}'::TEXT[],
  'moderate', '5-8 reps per side', '8-12 reps per side', '15 reps per side',
  'Lie on your side with knees stacked and bent. Sweep the top arm in a wide arc overhead and behind, following with your eyes. Return slowly.', 'Avoid with acute shoulder or thoracic injuries. Move within a pain-free range.', 'Morning routines, warm-ups, or off-day thoracic mobility sessions.', NULL,
  NULL, NULL, '{"B", "C", "D"}'::TEXT[],
  '{"mobility_limited", "morning_stiff", "desk_bound"}'::TEXT[], '{"game_day"}'::TEXT[], '{"home", "gym", "travel"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Leg Swings', 'leg-swings', 'dynamic_mobility', 'active',
  FALSE, TRUE,
  'joint_mobility', '{"muscular"}'::TEXT[], '{"musculoskeletal"}'::TEXT[],
  '{"hips", "hamstrings"}'::TEXT[], '{}'::TEXT[], '{"restore_mobility", "enhance_flexibility"}'::TEXT[], '{}'::TEXT[],
  'moderate', '8-10 reps per side', '12-15 reps per side', '20 reps per side',
  'Stand next to a wall for support. Swing one leg forward and backward in a controlled manner, gradually increasing range. Also perform lateral swings.', 'Avoid with acute hamstring or hip flexor strains. Do not swing beyond pain-free range.', 'Warm-ups or off-day mobility sessions for hip freedom and hamstring readiness.', NULL,
  NULL, NULL, '{"B", "C", "D"}'::TEXT[],
  '{"mobility_limited", "morning_stiff", "desk_bound"}'::TEXT[], '{"game_day"}'::TEXT[], '{"home", "gym", "travel"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Dynamic Squat to Stand', 'dynamic-squat-to-stand', 'dynamic_mobility', 'active',
  FALSE, TRUE,
  'joint_mobility', '{"muscular"}'::TEXT[], '{"musculoskeletal"}'::TEXT[],
  '{"hips", "hamstrings", "ankles", "core"}'::TEXT[], '{}'::TEXT[], '{"restore_mobility", "enhance_flexibility"}'::TEXT[], '{}'::TEXT[],
  'strong', '3-5 reps', '5-10 reps', '15 reps',
  'Stand with feet shoulder-width apart. Hinge at the hips to grab the toes. Sink the hips into a deep squat while keeping hold of the toes. Lift the chest, then straighten the legs to return to standing.', 'Avoid with acute knee or low back injuries. Reduce depth if mobility is limited.', 'Warm-ups or off-day full-body mobility flows.', NULL,
  NULL, NULL, '{"B", "C", "D"}'::TEXT[],
  '{"mobility_limited", "morning_stiff", "desk_bound"}'::TEXT[], '{"game_day"}'::TEXT[], '{"home", "gym", "travel"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Pool Walk Laps', 'pool-walk-laps', 'aquatic', 'active',
  FALSE, FALSE,
  'cardiovascular', '{"muscular", "circulatory"}'::TEXT[], '{"cardiovascular", "musculoskeletal"}'::TEXT[],
  '{"full_body", "hips", "calves"}'::TEXT[], '{}'::TEXT[], '{"improve_circulation", "decrease_soreness", "restore_mobility"}'::TEXT[], '{"pool"}'::TEXT[],
  'moderate', '5 min', '10-15 min', '20 min',
  'Walk back and forth in chest-deep water at a steady pace. Maintain upright posture and use arm swing. Vary speed and direction for variety.', 'Avoid with open wounds or active infections. Do not perform in cold water if cold sensitivity is present.', 'Recovery days or post-training active recovery sessions.', NULL,
  NULL, NULL, '{"A", "B", "C"}'::TEXT[],
  '{"high_soreness", "high_training_load", "joint_sensitive"}'::TEXT[], '{}'::TEXT[], '{"pool"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Pool High Knees', 'pool-high-knees', 'aquatic', 'active',
  FALSE, FALSE,
  'cardiovascular', '{"muscular", "circulatory"}'::TEXT[], '{"cardiovascular", "musculoskeletal"}'::TEXT[],
  '{"hips", "quads", "core"}'::TEXT[], '{}'::TEXT[], '{"improve_circulation", "decrease_soreness", "restore_mobility"}'::TEXT[], '{"pool"}'::TEXT[],
  'moderate', '3-5 min', '5-10 min', '15 min',
  'In chest-deep water, march in place bringing knees to hip height. Use arm drive. Keep the core engaged and maintain an upright torso.', 'Avoid with acute hip flexor strains. Reduce range if knee pain occurs.', 'Recovery days or low-impact cardio sessions in the pool.', NULL,
  NULL, NULL, '{"A", "B", "C"}'::TEXT[],
  '{"high_soreness", "high_training_load", "joint_sensitive"}'::TEXT[], '{}'::TEXT[], '{"pool"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Pool Flutter Kick', 'pool-flutter-kick', 'aquatic', 'active',
  FALSE, FALSE,
  'cardiovascular', '{"muscular", "circulatory"}'::TEXT[], '{"cardiovascular", "musculoskeletal"}'::TEXT[],
  '{"quads", "hamstrings", "core", "hips"}'::TEXT[], '{}'::TEXT[], '{"improve_circulation", "decrease_soreness", "restore_mobility"}'::TEXT[], '{"pool", "kickboard"}'::TEXT[],
  'moderate', '3-5 min', '5-10 min', '15 min',
  'Hold the pool edge or a kickboard. Extend the body and perform small, rapid flutter kicks. Keep legs relatively straight and kick from the hips.', 'Avoid with acute low back or hip pain. Reduce intensity if knee discomfort occurs.', 'Recovery sessions or low-impact aerobic work in the pool.', NULL,
  NULL, NULL, '{"A", "B", "C"}'::TEXT[],
  '{"high_soreness", "high_training_load", "joint_sensitive"}'::TEXT[], '{}'::TEXT[], '{"pool"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Pool Gentle Treading', 'pool-gentle-treading', 'aquatic', 'active',
  FALSE, FALSE,
  'cardiovascular', '{"muscular", "circulatory"}'::TEXT[], '{"cardiovascular", "musculoskeletal"}'::TEXT[],
  '{"full_body"}'::TEXT[], '{}'::TEXT[], '{"improve_circulation", "decrease_soreness", "relax_nervous_system"}'::TEXT[], '{"pool"}'::TEXT[],
  'moderate', '3-5 min', '5-10 min', '15 min',
  'In deep water, tread gently using a sculling motion with the hands and a light eggbeater kick. Keep effort low and breathing relaxed.', 'Avoid if not a confident swimmer. Do not use as a high-intensity drill.', 'Recovery days for gentle full-body movement in a buoyant environment.', NULL,
  NULL, NULL, '{"A", "B", "C"}'::TEXT[],
  '{"high_soreness", "high_training_load", "joint_sensitive"}'::TEXT[], '{}'::TEXT[], '{"pool"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Pool Arm Circles', 'pool-arm-circles', 'aquatic', 'active',
  FALSE, FALSE,
  'joint_mobility', '{"muscular", "circulatory"}'::TEXT[], '{"cardiovascular", "musculoskeletal"}'::TEXT[],
  '{"shoulders"}'::TEXT[], '{}'::TEXT[], '{"restore_mobility", "improve_circulation", "enhance_flexibility"}'::TEXT[], '{"pool"}'::TEXT[],
  'moderate', '3-5 min', '5-10 min', '15 min',
  'Stand in shoulder-deep water. Make slow, controlled arm circles forward and backward. The water provides gentle resistance throughout the range of motion.', 'Avoid with acute shoulder injuries or impingement. Reduce range if pain occurs.', 'Recovery sessions or warm-ups for shoulder mobility in a supportive environment.', NULL,
  NULL, NULL, '{"A", "B", "C"}'::TEXT[],
  '{"high_soreness", "high_training_load", "joint_sensitive"}'::TEXT[], '{}'::TEXT[], '{"pool"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Pool Hip Swings', 'pool-hip-swings', 'aquatic', 'active',
  FALSE, FALSE,
  'joint_mobility', '{"muscular", "circulatory"}'::TEXT[], '{"cardiovascular", "musculoskeletal"}'::TEXT[],
  '{"hips", "glutes"}'::TEXT[], '{}'::TEXT[], '{"restore_mobility", "improve_circulation", "enhance_flexibility"}'::TEXT[], '{"pool"}'::TEXT[],
  'moderate', '3-5 min', '5-10 min', '15 min',
  'Stand in waist-to-chest-deep water, holding the pool edge. Swing one leg forward and backward, then laterally. The water provides natural resistance and support.', 'Avoid with acute hip or groin strains. Reduce range if pain occurs.', 'Recovery sessions or off-day hip mobility work in the pool.', NULL,
  NULL, NULL, '{"A", "B", "C"}'::TEXT[],
  '{"high_soreness", "high_training_load", "joint_sensitive"}'::TEXT[], '{}'::TEXT[], '{"pool"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'AIS Hip Flexor Lunge', 'ais-hip-flexor-lunge', 'ais', 'active',
  FALSE, FALSE,
  'muscular', '{"joint_mobility"}'::TEXT[], '{"musculoskeletal"}'::TEXT[],
  '{"hips", "quads"}'::TEXT[], '{}'::TEXT[], '{"enhance_flexibility", "restore_mobility"}'::TEXT[], '{}'::TEXT[],
  'moderate', '5-8 reps per side', '8-12 reps, 2s hold each', '15 reps per side',
  'Assume a half-kneeling position. Contract the glute of the rear leg to actively stretch the hip flexor. Hold for 2 seconds at end range. Return and repeat.', 'Avoid with acute hip flexor strains. Do not hold the stretch longer than 2 seconds per rep.', 'Post-training, warm-ups, or recovery days for hip flexor length and mobility.', NULL,
  NULL, NULL, '{"B", "C", "D"}'::TEXT[],
  '{"mobility_limited", "high_training_load"}'::TEXT[], '{}'::TEXT[], '{"home", "gym"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'AIS Calf Dorsiflexion', 'ais-calf-dorsiflexion', 'ais', 'active',
  FALSE, FALSE,
  'muscular', '{"joint_mobility"}'::TEXT[], '{"musculoskeletal"}'::TEXT[],
  '{"calves", "ankles"}'::TEXT[], '{}'::TEXT[], '{"enhance_flexibility", "restore_mobility"}'::TEXT[], '{"stretching_strap"}'::TEXT[],
  'strong', '5-8 reps per side', '8-12 reps, 2s hold each', '15 reps per side',
  'Sit with leg extended and a strap around the ball of the foot. Actively pull the toes toward the shin using the anterior tibialis. Gently assist with the strap for 2 seconds at end range.', 'Avoid with acute Achilles tendon injuries. Do not force dorsiflexion beyond pain-free range.', 'Post-training or recovery days for calf and ankle mobility.', NULL,
  NULL, NULL, '{"B", "C", "D"}'::TEXT[],
  '{"mobility_limited", "high_training_load"}'::TEXT[], '{}'::TEXT[], '{"home", "gym"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'AIS Shoulder External Rotation', 'ais-shoulder-external-rotation', 'ais', 'active',
  FALSE, FALSE,
  'muscular', '{"joint_mobility"}'::TEXT[], '{"musculoskeletal"}'::TEXT[],
  '{"shoulders"}'::TEXT[], '{}'::TEXT[], '{"enhance_flexibility", "restore_mobility"}'::TEXT[], '{}'::TEXT[],
  'moderate', '5-8 reps per side', '8-12 reps, 2s hold each', '15 reps per side',
  'Lie on your side with the top arm at 90 degrees. Actively rotate the forearm toward the ceiling using the rotator cuff muscles. Hold for 2 seconds at end range.', 'Avoid with acute rotator cuff injuries or shoulder instability. Do not force external rotation.', 'Post-training or recovery days for shoulder external rotation restoration.', NULL,
  NULL, NULL, '{"B", "C", "D"}'::TEXT[],
  '{"mobility_limited", "high_training_load"}'::TEXT[], '{}'::TEXT[], '{"home", "gym"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'AIS Adductor/Groin Stretch', 'ais-adductor-groin', 'ais', 'active',
  FALSE, FALSE,
  'muscular', '{"joint_mobility"}'::TEXT[], '{"musculoskeletal"}'::TEXT[],
  '{"hips"}'::TEXT[], '{}'::TEXT[], '{"enhance_flexibility", "restore_mobility"}'::TEXT[], '{"stretching_strap"}'::TEXT[],
  'moderate', '5-8 reps per side', '8-12 reps, 2s hold each', '15 reps per side',
  'Lie on your back with one leg out to the side. Actively abduct the leg using the outer hip muscles. Gently assist with a strap for 2 seconds at end range. Return and repeat.', 'Avoid with acute adductor or groin strains. Do not force abduction beyond pain-free range.', 'Post-training or recovery days for adductor and groin flexibility.', NULL,
  NULL, NULL, '{"B", "C", "D"}'::TEXT[],
  '{"mobility_limited", "high_training_load"}'::TEXT[], '{}'::TEXT[], '{"home", "gym"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'AIS Spinal Rotation', 'ais-spinal-rotation', 'ais', 'active',
  FALSE, FALSE,
  'muscular', '{"joint_mobility"}'::TEXT[], '{"musculoskeletal"}'::TEXT[],
  '{"thoracic", "lumbar", "core"}'::TEXT[], '{}'::TEXT[], '{"enhance_flexibility", "restore_mobility"}'::TEXT[], '{}'::TEXT[],
  'moderate', '5-8 reps per side', '8-12 reps, 2s hold each', '15 reps per side',
  'Sit tall with legs extended. Actively rotate the torso using the obliques and spinal rotators. Gently assist the rotation with the hand for 2 seconds at end range.', 'Avoid with acute disc herniations or spinal injuries. Keep the rotation controlled and pain-free.', 'Post-training or recovery days for spinal rotation mobility.', NULL,
  NULL, NULL, '{"B", "C", "D"}'::TEXT[],
  '{"mobility_limited", "high_training_load"}'::TEXT[], '{}'::TEXT[], '{"home", "gym"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'AIS Neck Tilt', 'ais-neck-tilt', 'ais', 'active',
  FALSE, FALSE,
  'muscular', '{"joint_mobility"}'::TEXT[], '{"musculoskeletal"}'::TEXT[],
  '{"cervical"}'::TEXT[], '{}'::TEXT[], '{"enhance_flexibility", "restore_mobility"}'::TEXT[], '{}'::TEXT[],
  'moderate', '5-8 reps per side', '8-12 reps, 2s hold each', '15 reps per side',
  'Sit tall. Actively tilt the ear toward the shoulder using the lateral neck muscles. Gently assist with the hand for 2 seconds at end range. Return to neutral and repeat.', 'Avoid with acute cervical disc issues or nerve impingement. Do not force the tilt or add excessive hand pressure.', 'Post-training or recovery days for cervical mobility and upper trap relief.', NULL,
  NULL, NULL, '{"B", "C", "D"}'::TEXT[],
  '{"mobility_limited", "high_training_load"}'::TEXT[], '{}'::TEXT[], '{"home", "gym"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Sleeper Stretch', 'sleeper-stretch', 'static_stretch', 'passive',
  TRUE, TRUE,
  'muscular', '{"joint_mobility"}'::TEXT[], '{"musculoskeletal"}'::TEXT[],
  '{"shoulders"}'::TEXT[], '{}'::TEXT[], '{"enhance_flexibility", "restore_mobility"}'::TEXT[], '{}'::TEXT[],
  'moderate', '20-30s per side', '30-60s per side', '2 min per side',
  'Lie on your side with the bottom arm at 90 degrees. Use the top hand to gently push the bottom forearm toward the floor for internal rotation. Hold at a comfortable stretch.', 'Avoid with shoulder instability, labral tears, or acute rotator cuff injuries. Do not push into pain.', 'Off-days or evening stretching sessions for posterior shoulder tightness.', NULL,
  NULL, NULL, '{"C", "D", "E"}'::TEXT[],
  '{"high_soreness", "desk_bound", "evening_wind_down"}'::TEXT[], '{"cns_depleted", "pre_competition"}'::TEXT[], '{"home", "gym", "travel"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Cross-Body Shoulder Stretch', 'cross-body-shoulder', 'static_stretch', 'passive',
  TRUE, TRUE,
  'muscular', '{"joint_mobility"}'::TEXT[], '{"musculoskeletal"}'::TEXT[],
  '{"shoulders"}'::TEXT[], '{}'::TEXT[], '{"enhance_flexibility", "restore_mobility"}'::TEXT[], '{}'::TEXT[],
  'moderate', '20-30s per side', '30-60s per side', '2 min per side',
  'Bring one arm across the chest. Use the opposite hand to gently pull the arm closer to the body. Hold at a comfortable stretch in the posterior shoulder.', 'Avoid with acute shoulder injuries or labral tears. Do not compress the shoulder joint aggressively.', 'Off-days or evening stretching for posterior deltoid and rotator cuff flexibility.', NULL,
  NULL, NULL, '{"C", "D", "E"}'::TEXT[],
  '{"high_soreness", "desk_bound", "evening_wind_down"}'::TEXT[], '{"cns_depleted", "pre_competition"}'::TEXT[], '{"home", "gym", "travel"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Overhead Triceps/Lat Stretch', 'overhead-triceps-lat', 'static_stretch', 'passive',
  TRUE, TRUE,
  'muscular', '{"joint_mobility"}'::TEXT[], '{"musculoskeletal"}'::TEXT[],
  '{"shoulders", "back"}'::TEXT[], '{}'::TEXT[], '{"enhance_flexibility", "restore_mobility"}'::TEXT[], '{}'::TEXT[],
  'moderate', '20-30s per side', '30-60s per side', '2 min per side',
  'Raise one arm overhead and bend the elbow, reaching the hand down the back. Use the opposite hand to gently push the elbow. Add a side lean to incorporate the lat.', 'Avoid with acute shoulder or elbow injuries. Do not force the stretch beyond comfort.', 'Off-days or evening stretching for triceps and lat length.', NULL,
  NULL, NULL, '{"C", "D", "E"}'::TEXT[],
  '{"high_soreness", "desk_bound", "evening_wind_down"}'::TEXT[], '{"cns_depleted", "pre_competition"}'::TEXT[], '{"home", "gym", "travel"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Doorway Pec Stretch', 'doorway-pec-stretch', 'static_stretch', 'passive',
  TRUE, TRUE,
  'muscular', '{"joint_mobility"}'::TEXT[], '{"musculoskeletal"}'::TEXT[],
  '{"pecs", "shoulders"}'::TEXT[], '{}'::TEXT[], '{"enhance_flexibility", "restore_mobility"}'::TEXT[], '{"doorway"}'::TEXT[],
  'moderate', '20-30s per side', '30-60s per side', '2 min per side',
  'Stand in a doorway with the forearm placed against the frame at shoulder height. Step forward gently to open the chest. Hold the stretch in the pec and anterior shoulder.', 'Avoid with anterior shoulder instability or acute pec strains. Do not overextend the shoulder.', 'Off-days or evening stretching to counteract rounded posture and anterior tightness.', NULL,
  NULL, NULL, '{"C", "D", "E"}'::TEXT[],
  '{"high_soreness", "desk_bound", "evening_wind_down"}'::TEXT[], '{"cns_depleted", "pre_competition"}'::TEXT[], '{"home", "gym", "travel"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Seated Forward Fold', 'seated-forward-fold', 'static_stretch', 'passive',
  TRUE, TRUE,
  'muscular', '{"joint_mobility"}'::TEXT[], '{"musculoskeletal"}'::TEXT[],
  '{"hamstrings", "lumbar"}'::TEXT[], '{}'::TEXT[], '{"enhance_flexibility", "restore_mobility", "relax_nervous_system"}'::TEXT[], '{}'::TEXT[],
  'moderate', '20-30s', '30-60s', '2 min',
  'Sit with legs extended. Hinge at the hips and reach toward the toes. Keep the spine long and avoid excessive rounding. Breathe deeply and relax into the stretch.', 'Avoid with acute disc herniations or hamstring tears. Do not force the fold aggressively.', 'Off-days or evening stretching for hamstring and posterior chain flexibility.', NULL,
  NULL, NULL, '{"C", "D", "E"}'::TEXT[],
  '{"high_soreness", "desk_bound", "evening_wind_down"}'::TEXT[], '{"cns_depleted", "pre_competition"}'::TEXT[], '{"home", "gym", "travel"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Standing Quad Stretch', 'standing-quad-stretch', 'static_stretch', 'passive',
  TRUE, TRUE,
  'muscular', '{"joint_mobility"}'::TEXT[], '{"musculoskeletal"}'::TEXT[],
  '{"quads", "hips"}'::TEXT[], '{}'::TEXT[], '{"enhance_flexibility", "restore_mobility"}'::TEXT[], '{}'::TEXT[],
  'moderate', '20-30s per side', '30-60s per side', '2 min per side',
  'Stand on one leg, holding a wall for support. Grab the opposite ankle behind you and pull the heel toward the glute. Keep the knees together and hips pushed forward.', 'Avoid with acute knee injuries or quad strains. Do not hyperextend the knee.', 'Off-days or evening stretching for quad and hip flexor flexibility.', NULL,
  NULL, NULL, '{"C", "D", "E"}'::TEXT[],
  '{"high_soreness", "desk_bound", "evening_wind_down"}'::TEXT[], '{"cns_depleted", "pre_competition"}'::TEXT[], '{"home", "gym", "travel"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Seated Butterfly Stretch', 'seated-butterfly', 'static_stretch', 'passive',
  TRUE, TRUE,
  'muscular', '{"joint_mobility"}'::TEXT[], '{"musculoskeletal"}'::TEXT[],
  '{"hips", "glutes"}'::TEXT[], '{}'::TEXT[], '{"enhance_flexibility", "restore_mobility"}'::TEXT[], '{}'::TEXT[],
  'moderate', '20-30s', '30-60s', '2 min',
  'Sit with the soles of the feet together and knees dropped to the sides. Gently press the knees toward the floor with the elbows. Lean forward slightly to deepen the stretch.', 'Avoid with acute groin or adductor strains. Do not force the knees down aggressively.', 'Off-days or evening stretching for inner thigh and hip opening.', NULL,
  NULL, NULL, '{"C", "D", "E"}'::TEXT[],
  '{"high_soreness", "desk_bound", "evening_wind_down"}'::TEXT[], '{"cns_depleted", "pre_competition"}'::TEXT[], '{"home", "gym", "travel"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Child''s Pose Hold', 'childs-pose-hold', 'static_stretch', 'passive',
  TRUE, TRUE,
  'muscular', '{"nervous", "joint_mobility"}'::TEXT[], '{"autonomic", "musculoskeletal"}'::TEXT[],
  '{"back", "hips", "shoulders"}'::TEXT[], '{}'::TEXT[], '{"enhance_flexibility", "restore_mobility", "relax_nervous_system"}'::TEXT[], '{}'::TEXT[],
  'moderate', '20-30s', '30-60s', '2 min',
  'Kneel with toes together and knees apart. Sit back on the heels and extend the arms forward on the floor. Rest the forehead on the ground and breathe deeply.', 'Avoid with acute knee injuries or ankle limitations. Modify with a pillow under the hips if needed.', 'Off-days or evening wind-down for spinal decompression and nervous system calming.', NULL,
  NULL, NULL, '{"C", "D", "E"}'::TEXT[],
  '{"high_soreness", "desk_bound", "evening_wind_down"}'::TEXT[], '{"cns_depleted", "pre_competition"}'::TEXT[], '{"home", "gym", "travel"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Thread the Needle', 'thread-the-needle', 'static_stretch', 'passive',
  TRUE, TRUE,
  'muscular', '{"joint_mobility"}'::TEXT[], '{"musculoskeletal"}'::TEXT[],
  '{"thoracic", "shoulders"}'::TEXT[], '{}'::TEXT[], '{"enhance_flexibility", "restore_mobility"}'::TEXT[], '{}'::TEXT[],
  'moderate', '20-30s per side', '30-60s per side', '2 min per side',
  'Start on hands and knees. Slide one arm under the body, threading it through to the opposite side. Rest the shoulder and temple on the floor. Hold and breathe.', 'Avoid with acute shoulder or cervical spine injuries. Do not force the rotation.', 'Off-days or evening stretching for thoracic rotation and shoulder opening.', NULL,
  NULL, NULL, '{"C", "D", "E"}'::TEXT[],
  '{"high_soreness", "desk_bound", "evening_wind_down"}'::TEXT[], '{"cns_depleted", "pre_competition"}'::TEXT[], '{"home", "gym", "travel"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Supine Spinal Twist', 'supine-spinal-twist', 'static_stretch', 'passive',
  TRUE, TRUE,
  'muscular', '{"nervous", "joint_mobility"}'::TEXT[], '{"autonomic", "musculoskeletal"}'::TEXT[],
  '{"thoracic", "lumbar", "hips"}'::TEXT[], '{}'::TEXT[], '{"enhance_flexibility", "restore_mobility", "relax_nervous_system"}'::TEXT[], '{}'::TEXT[],
  'moderate', '20-30s per side', '30-60s per side', '2 min per side',
  'Lie on your back. Bring one knee across the body to the opposite side. Extend the arm on the same side and look toward it. Hold and breathe deeply into the twist.', 'Avoid with acute disc herniations or spinal injuries. Do not force the twist beyond comfort.', 'Off-days or evening stretching for spinal rotation and parasympathetic activation.', NULL,
  NULL, NULL, '{"C", "D", "E"}'::TEXT[],
  '{"high_soreness", "desk_bound", "evening_wind_down"}'::TEXT[], '{"cns_depleted", "pre_competition"}'::TEXT[], '{"home", "gym", "travel"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Starfish Lie Down', 'starfish-lie-down', 'vagus_nerve', 'passive',
  FALSE, FALSE,
  'nervous', '{"cardiovascular"}'::TEXT[], '{"autonomic", "cardiovascular", "sleep_circadian"}'::TEXT[],
  '{"full_body", "mental_clarity"}'::TEXT[], '{}'::TEXT[], '{"relax_nervous_system"}'::TEXT[], '{}'::TEXT[],
  'moderate', '2-3 min', '5-10 min', '15 min',
  'Lie flat on your back with arms and legs spread wide like a starfish. Close the eyes and breathe slowly through the nose. Allow complete muscular relaxation.', 'Avoid if lying flat causes low back discomfort. Place a pillow under the knees if needed.', 'Post-training, between sessions, or as a nervous system reset throughout the day.', NULL,
  NULL, NULL, '{"A", "B", "C", "D", "E"}'::TEXT[],
  '{"high_sympathetic", "poor_sleep", "high_stress"}'::TEXT[], '{}'::TEXT[], '{"anywhere"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Slow Eye Movement Reset', 'slow-eye-movement-reset', 'vagus_nerve', 'passive',
  FALSE, FALSE,
  'nervous', '{}'::TEXT[], '{"autonomic", "sleep_circadian"}'::TEXT[],
  '{"mental_clarity"}'::TEXT[], '{}'::TEXT[], '{"relax_nervous_system"}'::TEXT[], '{}'::TEXT[],
  'emerging', '1-2 min', '3-5 min', '10 min',
  'Lie on your back. Interlace fingers behind the head. Without moving the head, slowly look to the right and hold until a spontaneous yawn or sigh occurs. Return to center and repeat to the left.', 'Avoid if eye movements cause dizziness or nausea. Discontinue if symptoms worsen.', 'Post-competition, after high-stress events, or as a quick nervous system reset.', NULL,
  NULL, NULL, '{"A", "B", "C", "D", "E"}'::TEXT[],
  '{"high_sympathetic", "poor_sleep", "high_stress"}'::TEXT[], '{}'::TEXT[], '{"anywhere"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Cold Water Face Splash', 'cold-water-face-splash', 'vagus_nerve', 'passive',
  FALSE, FALSE,
  'nervous', '{"cardiovascular"}'::TEXT[], '{"autonomic", "cardiovascular", "sleep_circadian"}'::TEXT[],
  '{"mental_clarity"}'::TEXT[], '{}'::TEXT[], '{"relax_nervous_system"}'::TEXT[], '{}'::TEXT[],
  'strong', '15-30s', '30-60s', '2 min',
  'Splash cold water on the face, especially the forehead, eyes, and cheeks. Alternatively, submerge the face in a bowl of cold water for 15-30 seconds. Breathe through the mouth between immersions.', 'Avoid with uncontrolled cardiac arrhythmias. Use caution with Raynaud''s disease.', 'Acute stress moments, post-competition, or when rapid vagal tone activation is needed.', NULL,
  NULL, NULL, '{"A", "B", "C", "D", "E"}'::TEXT[],
  '{"high_sympathetic", "poor_sleep", "high_stress"}'::TEXT[], '{}'::TEXT[], '{"anywhere"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Gentle Neck Rotations with Breathing', 'gentle-neck-rotations-breathing', 'vagus_nerve', 'passive',
  FALSE, FALSE,
  'nervous', '{"muscular"}'::TEXT[], '{"autonomic", "musculoskeletal", "sleep_circadian"}'::TEXT[],
  '{"cervical", "mental_clarity"}'::TEXT[], '{}'::TEXT[], '{"relax_nervous_system", "restore_mobility"}'::TEXT[], '{}'::TEXT[],
  'moderate', '1-2 min', '3-5 min', '10 min',
  'Sit or stand tall. Slowly rotate the head to one side, inhaling through the nose. Hold briefly, then exhale slowly as you return to center. Repeat to the other side.', 'Avoid with acute cervical injuries or vertebral artery insufficiency. Move slowly and within pain-free range.', 'Post-training, during travel, or as a calming vagus nerve stimulation technique.', NULL,
  NULL, NULL, '{"A", "B", "C", "D", "E"}'::TEXT[],
  '{"high_sympathetic", "poor_sleep", "high_stress"}'::TEXT[], '{}'::TEXT[], '{"anywhere"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Bee Breathwork (Bhramari)', 'bee-breathwork', 'vagus_nerve', 'passive',
  FALSE, FALSE,
  'nervous', '{}'::TEXT[], '{"autonomic", "sleep_circadian"}'::TEXT[],
  '{"mental_clarity"}'::TEXT[], '{}'::TEXT[], '{"relax_nervous_system"}'::TEXT[], '{}'::TEXT[],
  'emerging', '1-2 min', '3-5 min', '10 min',
  'Sit comfortably with eyes closed. Inhale deeply through the nose. Exhale while making a low humming sound like a bee. Feel the vibration in the face and skull. Repeat.', 'Avoid if the humming causes ear discomfort or pressure. Discontinue if dizziness occurs.', 'Evening wind-down, post-competition, or as a calming vagus nerve activation technique.', NULL,
  NULL, NULL, '{"A", "B", "C", "D", "E"}'::TEXT[],
  '{"high_sympathetic", "poor_sleep", "high_stress"}'::TEXT[], '{}'::TEXT[], '{"anywhere"}'::TEXT[]
);

INSERT INTO recovery_protocols (
  name, slug, series, modality_type, cns_low_avoid, off_day_only,
  primary_system, secondary_systems, iaci_subsystems_targeted,
  target_areas_primary, target_areas_secondary, benefits, equipment_needed,
  evidence_level, dose_min, dose_sweet_spot, dose_upper_limit,
  instructions, avoid_cautions, ideal_timing, evidence_notes,
  athlete_tidbit, athlete_caution, protocol_classes,
  phenotypes_recommended, phenotypes_avoid, environment
) VALUES (
  'Percussion Therapy (Massage Gun)', 'percussion-therapy', 'classic', 'passive',
  FALSE, FALSE,
  'muscular', '{"nervous", "circulatory"}'::TEXT[], '{"autonomic", "cardiovascular", "musculoskeletal"}'::TEXT[],
  '{"quads", "hamstrings", "glutes", "calves", "back", "shoulders"}'::TEXT[], '{}'::TEXT[], '{"decrease_soreness", "improve_circulation", "restore_mobility"}'::TEXT[], '{"massage_gun"}'::TEXT[],
  'moderate', '30-60s per muscle', '1-2 min per muscle group', '10-15 min total',
  'Apply the massage gun to the target muscle at a moderate speed. Move slowly along the muscle belly. Avoid bony prominences and joints. Use lighter pressure on smaller muscle groups.', 'Avoid over bony prominences, acute injuries, bruises, or inflamed areas. Do not use on the neck or near the spine without guidance.', 'Post-training for localized muscle recovery, or pre-training as part of tissue preparation.', NULL,
  NULL, NULL, '{"A", "B", "C", "D"}'::TEXT[],
  '{"high_training_load", "high_soreness"}'::TEXT[], '{}'::TEXT[], '{"home", "gym", "travel"}'::TEXT[]
);

-- =============================================
-- Exercises
-- =============================================

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Easy Run', 'run', 'aerobic',
  '{"outdoor", "treadmill"}'::TEXT[], '{"running_shoes"}'::TEXT[],
  'Zone 1-2', 6, 2,
  TRUE, '{"cardiovascular", "musculoskeletal"}'::TEXT[],
  'Conversational pace run for aerobic base building and active recovery.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Long Run', 'run', 'aerobic',
  '{"outdoor"}'::TEXT[], '{"running_shoes"}'::TEXT[],
  'Zone 2', 14, 7,
  TRUE, '{"cardiovascular", "musculoskeletal", "metabolic"}'::TEXT[],
  'Extended duration run for endurance development. Typically 90+ minutes.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Tempo Run', 'run', 'mixed',
  '{"outdoor", "treadmill"}'::TEXT[], '{"running_shoes"}'::TEXT[],
  'Zone 3-4', 13, 6,
  TRUE, '{"cardiovascular", "musculoskeletal"}'::TEXT[],
  'Sustained effort at lactate threshold pace. Comfortably hard.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Interval Run', 'run', 'anaerobic',
  '{"outdoor", "track", "treadmill"}'::TEXT[], '{"running_shoes"}'::TEXT[],
  'Zone 4-5', 16, 8,
  TRUE, '{"cardiovascular", "musculoskeletal", "autonomic"}'::TEXT[],
  'High-intensity repeats with recovery intervals. VO2max development.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Fartlek Run', 'run', 'mixed',
  '{"outdoor"}'::TEXT[], '{"running_shoes"}'::TEXT[],
  'Zone 2-4', 11, 5,
  TRUE, '{"cardiovascular", "musculoskeletal"}'::TEXT[],
  'Unstructured speed play with varied pace surges during a run.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Hill Repeats', 'run', 'anaerobic',
  '{"outdoor"}'::TEXT[], '{"running_shoes"}'::TEXT[],
  'Zone 4-5', 15, 7,
  FALSE, '{"cardiovascular", "musculoskeletal"}'::TEXT[],
  'Repeated hard efforts uphill for strength and power development.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Recovery Run', 'run', 'recovery',
  '{"outdoor", "treadmill"}'::TEXT[], '{"running_shoes"}'::TEXT[],
  'Zone 1', 4, 1,
  TRUE, '{"cardiovascular"}'::TEXT[],
  'Very easy pace run to promote blood flow and recovery.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Progression Run', 'run', 'mixed',
  '{"outdoor", "treadmill"}'::TEXT[], '{"running_shoes"}'::TEXT[],
  'Zone 2-4', 12, 5,
  TRUE, '{"cardiovascular", "musculoskeletal"}'::TEXT[],
  'Start easy and progressively increase pace throughout the run.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Trail Run', 'run', 'mixed',
  '{"outdoor"}'::TEXT[], '{"trail_shoes"}'::TEXT[],
  'Zone 2-3', 12, 6,
  FALSE, '{"cardiovascular", "musculoskeletal"}'::TEXT[],
  'Off-road running on trails with varied terrain and elevation.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Sprint Intervals', 'run', 'anaerobic',
  '{"outdoor", "track"}'::TEXT[], '{"running_shoes"}'::TEXT[],
  'Zone 5', 18, 9,
  TRUE, '{"cardiovascular", "musculoskeletal", "autonomic"}'::TEXT[],
  'All-out short sprints (100-400m) with full recovery between reps.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Easy Ride', 'cycle', 'aerobic',
  '{"outdoor", "indoor_trainer"}'::TEXT[], '{"bicycle", "helmet"}'::TEXT[],
  'Zone 1-2', 6, 2,
  FALSE, '{"cardiovascular"}'::TEXT[],
  'Low-intensity cycling for aerobic base and active recovery.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Long Ride', 'cycle', 'aerobic',
  '{"outdoor"}'::TEXT[], '{"bicycle", "helmet"}'::TEXT[],
  'Zone 2', 14, 6,
  FALSE, '{"cardiovascular", "musculoskeletal", "metabolic"}'::TEXT[],
  'Extended distance ride for endurance. Typically 2+ hours.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Tempo Ride', 'cycle', 'mixed',
  '{"outdoor", "indoor_trainer"}'::TEXT[], '{"bicycle"}'::TEXT[],
  'Zone 3-4', 13, 6,
  FALSE, '{"cardiovascular", "musculoskeletal"}'::TEXT[],
  'Sustained effort at functional threshold power.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Interval Ride', 'cycle', 'anaerobic',
  '{"indoor_trainer", "outdoor"}'::TEXT[], '{"bicycle"}'::TEXT[],
  'Zone 4-5', 16, 8,
  FALSE, '{"cardiovascular", "musculoskeletal", "autonomic"}'::TEXT[],
  'High-intensity cycling intervals for VO2max and power development.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Hill Climb Ride', 'cycle', 'mixed',
  '{"outdoor"}'::TEXT[], '{"bicycle", "helmet"}'::TEXT[],
  'Zone 3-5', 15, 7,
  FALSE, '{"cardiovascular", "musculoskeletal"}'::TEXT[],
  'Ride focused on climbing with sustained high-power efforts.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Recovery Ride', 'cycle', 'recovery',
  '{"indoor_trainer", "outdoor"}'::TEXT[], '{"bicycle"}'::TEXT[],
  'Zone 1', 3, 1,
  FALSE, '{"cardiovascular"}'::TEXT[],
  'Very easy spin to promote blood flow without additional stress.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Easy Swim', 'swim', 'aerobic',
  '{"pool"}'::TEXT[], '{"swimsuit", "goggles"}'::TEXT[],
  'Zone 1-2', 6, 2,
  FALSE, '{"cardiovascular"}'::TEXT[],
  'Low-intensity continuous swimming for aerobic development.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Long Swim', 'swim', 'aerobic',
  '{"pool", "open_water"}'::TEXT[], '{"swimsuit", "goggles"}'::TEXT[],
  'Zone 2', 13, 6,
  FALSE, '{"cardiovascular", "musculoskeletal"}'::TEXT[],
  'Extended swim for endurance. Typically 60+ minutes or 3000+ meters.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Interval Swim', 'swim', 'anaerobic',
  '{"pool"}'::TEXT[], '{"swimsuit", "goggles"}'::TEXT[],
  'Zone 4-5', 15, 7,
  FALSE, '{"cardiovascular", "musculoskeletal", "autonomic"}'::TEXT[],
  'High-intensity swim repeats with timed rest intervals.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Open Water Swim', 'swim', 'mixed',
  '{"open_water"}'::TEXT[], '{"swimsuit", "goggles", "wetsuit"}'::TEXT[],
  'Zone 2-3', 12, 6,
  FALSE, '{"cardiovascular", "musculoskeletal"}'::TEXT[],
  'Swimming in lake, ocean, or river. Sighting and navigation practice.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Drill Swim', 'swim', 'recovery',
  '{"pool"}'::TEXT[], '{"swimsuit", "goggles", "kickboard"}'::TEXT[],
  'Zone 1-2', 5, 2,
  FALSE, '{"cardiovascular"}'::TEXT[],
  'Technique-focused swimming drills with low cardiovascular stress.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Easy Row', 'row', 'aerobic',
  '{"gym", "indoor"}'::TEXT[], '{"rowing_machine"}'::TEXT[],
  'Zone 1-2', 6, 2,
  FALSE, '{"cardiovascular", "musculoskeletal"}'::TEXT[],
  'Low-intensity rowing for aerobic base and full-body active recovery.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Rowing Intervals', 'row', 'anaerobic',
  '{"gym", "indoor"}'::TEXT[], '{"rowing_machine"}'::TEXT[],
  'Zone 4-5', 16, 8,
  FALSE, '{"cardiovascular", "musculoskeletal", "autonomic"}'::TEXT[],
  'High-intensity rowing repeats. Full-body power and cardiovascular stress.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Steady State Row', 'row', 'aerobic',
  '{"gym", "indoor"}'::TEXT[], '{"rowing_machine"}'::TEXT[],
  'Zone 2-3', 10, 4,
  FALSE, '{"cardiovascular", "musculoskeletal"}'::TEXT[],
  'Moderate-intensity sustained rowing for aerobic threshold development.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Easy Ski Erg', 'ski_erg', 'aerobic',
  '{"gym"}'::TEXT[], '{"ski_erg"}'::TEXT[],
  'Zone 1-2', 5, 2,
  FALSE, '{"cardiovascular", "musculoskeletal"}'::TEXT[],
  'Low-intensity upper-body dominant aerobic work.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Ski Erg Intervals', 'ski_erg', 'anaerobic',
  '{"gym"}'::TEXT[], '{"ski_erg"}'::TEXT[],
  'Zone 4-5', 15, 7,
  FALSE, '{"cardiovascular", "musculoskeletal", "autonomic"}'::TEXT[],
  'High-intensity ski erg repeats for upper body power.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Easy Elliptical', 'elliptical', 'aerobic',
  '{"gym"}'::TEXT[], '{"elliptical"}'::TEXT[],
  'Zone 1-2', 5, 2,
  FALSE, '{"cardiovascular"}'::TEXT[],
  'Low-impact aerobic session. Joint-friendly alternative to running.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Tempo Elliptical', 'elliptical', 'mixed',
  '{"gym"}'::TEXT[], '{"elliptical"}'::TEXT[],
  'Zone 3-4', 11, 5,
  FALSE, '{"cardiovascular", "musculoskeletal"}'::TEXT[],
  'Sustained moderate-hard effort on the elliptical.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Hike', 'hike', 'aerobic',
  '{"outdoor"}'::TEXT[], '{"hiking_shoes"}'::TEXT[],
  'Zone 1-2', 8, 3,
  TRUE, '{"cardiovascular", "musculoskeletal"}'::TEXT[],
  'Outdoor hiking on trails with moderate elevation gain.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Steep Hike', 'hike', 'mixed',
  '{"outdoor"}'::TEXT[], '{"hiking_shoes", "trekking_poles"}'::TEXT[],
  'Zone 2-4', 13, 6,
  FALSE, '{"cardiovascular", "musculoskeletal"}'::TEXT[],
  'Challenging hike with significant elevation gain and technical terrain.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Walk', 'walk', 'recovery',
  '{"outdoor", "indoor"}'::TEXT[], '{}'::TEXT[],
  'Zone 1', 2, 1,
  TRUE, '{"cardiovascular"}'::TEXT[],
  'Easy walking for active recovery and mental refresh.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Brisk Walk', 'walk', 'aerobic',
  '{"outdoor", "treadmill"}'::TEXT[], '{}'::TEXT[],
  'Zone 1-2', 4, 1,
  TRUE, '{"cardiovascular"}'::TEXT[],
  'Purposeful walking at an elevated pace.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Full Body Strength', 'strength', 'mixed',
  '{"gym"}'::TEXT[], '{"barbell", "dumbbells"}'::TEXT[],
  'Zone 2-3', 14, 7,
  FALSE, '{"musculoskeletal", "autonomic"}'::TEXT[],
  'Compound strength training targeting major muscle groups.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Upper Body Strength', 'strength', 'mixed',
  '{"gym"}'::TEXT[], '{"barbell", "dumbbells", "pull_up_bar"}'::TEXT[],
  'Zone 2-3', 11, 5,
  FALSE, '{"musculoskeletal"}'::TEXT[],
  'Strength training focused on chest, back, shoulders, and arms.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Lower Body Strength', 'strength', 'mixed',
  '{"gym"}'::TEXT[], '{"barbell", "squat_rack"}'::TEXT[],
  'Zone 2-4', 15, 8,
  FALSE, '{"musculoskeletal", "autonomic"}'::TEXT[],
  'Heavy leg training: squats, deadlifts, lunges.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Core Strength', 'strength', 'mixed',
  '{"gym", "home"}'::TEXT[], '{"mat"}'::TEXT[],
  'Zone 1-2', 6, 3,
  TRUE, '{"musculoskeletal"}'::TEXT[],
  'Targeted core and trunk stability work.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Plyometrics', 'strength', 'anaerobic',
  '{"gym", "outdoor"}'::TEXT[], '{"plyo_box"}'::TEXT[],
  'Zone 3-5', 16, 8,
  FALSE, '{"musculoskeletal", "autonomic"}'::TEXT[],
  'Explosive jump training for power development.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Bodyweight Circuit', 'strength', 'mixed',
  '{"home", "gym", "outdoor"}'::TEXT[], '{}'::TEXT[],
  'Zone 2-4', 10, 4,
  TRUE, '{"musculoskeletal", "cardiovascular"}'::TEXT[],
  'Circuit of bodyweight exercises with minimal rest.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Resistance Band Workout', 'strength', 'mixed',
  '{"home", "gym", "travel"}'::TEXT[], '{"resistance_bands"}'::TEXT[],
  'Zone 1-2', 7, 3,
  TRUE, '{"musculoskeletal"}'::TEXT[],
  'Strength work using resistance bands. Ideal for travel or rehab.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Mobility Session', 'mobility', 'recovery',
  '{"home", "gym"}'::TEXT[], '{"mat", "foam_roller"}'::TEXT[],
  NULL, 2, 1,
  TRUE, '{"musculoskeletal"}'::TEXT[],
  'Dedicated mobility and flexibility work. Dynamic and static stretching.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Yoga Flow', 'mobility', 'recovery',
  '{"home", "studio"}'::TEXT[], '{"mat"}'::TEXT[],
  'Zone 1', 4, 1,
  TRUE, '{"musculoskeletal"}'::TEXT[],
  'Vinyasa or flow-style yoga for mobility, balance, and recovery.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Foam Rolling Session', 'mobility', 'recovery',
  '{"home", "gym"}'::TEXT[], '{"foam_roller", "lacrosse_ball"}'::TEXT[],
  NULL, 2, 1,
  TRUE, '{"musculoskeletal"}'::TEXT[],
  'Dedicated self-myofascial release session using foam roller and ball.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Technique Drills', 'technique', 'recovery',
  '{"outdoor", "track"}'::TEXT[], '{"running_shoes"}'::TEXT[],
  'Zone 1-2', 5, 2,
  TRUE, '{"musculoskeletal"}'::TEXT[],
  'Running form drills: A-skips, B-skips, butt kicks, high knees, strides.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Strides', 'technique', 'mixed',
  '{"outdoor", "track"}'::TEXT[], '{"running_shoes"}'::TEXT[],
  'Zone 3-4', 5, 2,
  TRUE, '{"musculoskeletal"}'::TEXT[],
  'Short 80-100m accelerations at controlled fast pace with full recovery.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Brick Run (Bike-to-Run)', 'cross_train', 'mixed',
  '{"outdoor"}'::TEXT[], '{"bicycle", "running_shoes"}'::TEXT[],
  'Zone 2-4', 14, 7,
  FALSE, '{"cardiovascular", "musculoskeletal"}'::TEXT[],
  'Transition workout: cycling followed immediately by running.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Aqua Jogging', 'cross_train', 'aerobic',
  '{"pool"}'::TEXT[], '{"aqua_belt"}'::TEXT[],
  'Zone 1-2', 5, 1,
  FALSE, '{"cardiovascular"}'::TEXT[],
  'Deep water running with flotation belt. Zero-impact cross-training.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Cross-Country Skiing', 'cross_train', 'aerobic',
  '{"outdoor"}'::TEXT[], '{"xc_skis"}'::TEXT[],
  'Zone 2-3', 13, 6,
  FALSE, '{"cardiovascular", "musculoskeletal"}'::TEXT[],
  'Full-body aerobic workout on snow. Excellent cross-training.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Stair Climber', 'cross_train', 'aerobic',
  '{"gym"}'::TEXT[], '{"stairclimber"}'::TEXT[],
  'Zone 2-3', 10, 4,
  FALSE, '{"cardiovascular", "musculoskeletal"}'::TEXT[],
  'Stair climbing machine for lower body endurance and aerobic work.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  '5K Race', 'run', 'anaerobic',
  '{"outdoor"}'::TEXT[], '{"racing_flats"}'::TEXT[],
  'Zone 4-5', 17, 8,
  TRUE, '{"cardiovascular", "musculoskeletal", "autonomic"}'::TEXT[],
  'All-out 5K race effort.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  '10K Race', 'run', 'mixed',
  '{"outdoor"}'::TEXT[], '{"racing_flats"}'::TEXT[],
  'Zone 3-5', 18, 9,
  TRUE, '{"cardiovascular", "musculoskeletal", "autonomic"}'::TEXT[],
  'All-out 10K race effort.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Half Marathon', 'run', 'aerobic',
  '{"outdoor"}'::TEXT[], '{"racing_shoes"}'::TEXT[],
  'Zone 3-4', 19, 9,
  TRUE, '{"cardiovascular", "musculoskeletal", "metabolic", "autonomic"}'::TEXT[],
  '21.1km race. Significant recovery needed post-race.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Marathon', 'run', 'aerobic',
  '{"outdoor"}'::TEXT[], '{"racing_shoes"}'::TEXT[],
  'Zone 2-4', 21, 10,
  TRUE, '{"cardiovascular", "musculoskeletal", "metabolic", "autonomic"}'::TEXT[],
  '42.2km race. Extended recovery period required.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Sprint Triathlon', 'cross_train', 'mixed',
  '{"outdoor"}'::TEXT[], '{"bicycle", "running_shoes", "swimsuit", "wetsuit"}'::TEXT[],
  'Zone 3-5', 17, 8,
  FALSE, '{"cardiovascular", "musculoskeletal", "autonomic"}'::TEXT[],
  'Sprint distance triathlon: 750m swim, 20km bike, 5km run.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Olympic Triathlon', 'cross_train', 'mixed',
  '{"outdoor"}'::TEXT[], '{"bicycle", "running_shoes", "swimsuit", "wetsuit"}'::TEXT[],
  'Zone 3-4', 19, 9,
  FALSE, '{"cardiovascular", "musculoskeletal", "metabolic", "autonomic"}'::TEXT[],
  'Olympic distance triathlon: 1500m swim, 40km bike, 10km run.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Warm-Up Routine', 'mobility', 'recovery',
  '{"anywhere"}'::TEXT[], '{}'::TEXT[],
  'Zone 1', 2, 0,
  TRUE, '{"musculoskeletal"}'::TEXT[],
  'General warm-up with dynamic stretching, activation, and light movement.'
);

INSERT INTO exercises (
  name, category, energy_system, environment, equipment,
  hr_zone_target, strain_estimate, recovery_cost, travel_friendly,
  body_systems_stressed, description
) VALUES (
  'Cool-Down Routine', 'mobility', 'recovery',
  '{"anywhere"}'::TEXT[], '{}'::TEXT[],
  'Zone 1', 1, 0,
  TRUE, '{}'::TEXT[],
  'Post-workout cool-down with easy movement and static stretching.'
);

-- =============================================
-- Inflammation Marker Definitions
-- =============================================

INSERT INTO inflammation_marker_defs (
  name, abbreviation, category, unit,
  normal_low, normal_high, optimal_low, optimal_high, description
) VALUES (
  'High-Sensitivity C-Reactive Protein', 'hs-CRP', 'lab', 'mg/L',
  0, 3.0,
  0, 1.0,
  'Systemic inflammation marker. Elevated levels indicate acute or chronic inflammation.'
);

INSERT INTO inflammation_marker_defs (
  name, abbreviation, category, unit,
  normal_low, normal_high, optimal_low, optimal_high, description
) VALUES (
  'Ferritin', 'Ferritin', 'lab', 'ng/mL',
  30, 300,
  50, 150,
  'Iron storage protein. Low levels impair oxygen transport and endurance performance.'
);

INSERT INTO inflammation_marker_defs (
  name, abbreviation, category, unit,
  normal_low, normal_high, optimal_low, optimal_high, description
) VALUES (
  'Vitamin D (25-OH)', 'Vit D', 'lab', 'ng/mL',
  30, 100,
  40, 70,
  'Critical for immune function, bone health, and muscle recovery. Deficiency increases injury risk.'
);

INSERT INTO inflammation_marker_defs (
  name, abbreviation, category, unit,
  normal_low, normal_high, optimal_low, optimal_high, description
) VALUES (
  'Creatine Kinase', 'CK', 'lab', 'U/L',
  30, 200,
  30, 150,
  'Muscle damage marker. Elevated post-exercise is normal; persistently high suggests inadequate recovery.'
);

INSERT INTO inflammation_marker_defs (
  name, abbreviation, category, unit,
  normal_low, normal_high, optimal_low, optimal_high, description
) VALUES (
  'Cortisol (AM)', 'Cortisol', 'lab', 'mcg/dL',
  6, 23,
  10, 18,
  'Stress hormone. Chronically elevated levels indicate overtraining or high life stress.'
);

INSERT INTO inflammation_marker_defs (
  name, abbreviation, category, unit,
  normal_low, normal_high, optimal_low, optimal_high, description
) VALUES (
  'Iron', 'Iron', 'lab', 'mcg/dL',
  60, 170,
  80, 150,
  'Essential for hemoglobin synthesis and oxygen transport.'
);

INSERT INTO inflammation_marker_defs (
  name, abbreviation, category, unit,
  normal_low, normal_high, optimal_low, optimal_high, description
) VALUES (
  'Total Iron Binding Capacity', 'TIBC', 'lab', 'mcg/dL',
  250, 370,
  250, 370,
  'Measures blood''s capacity to bind iron. High TIBC suggests iron deficiency.'
);

INSERT INTO inflammation_marker_defs (
  name, abbreviation, category, unit,
  normal_low, normal_high, optimal_low, optimal_high, description
) VALUES (
  'Interleukin-6', 'IL-6', 'lab', 'pg/mL',
  0, 7,
  0, 3,
  'Pro-inflammatory cytokine. Acute elevation from exercise is normal; chronic elevation indicates systemic inflammation.'
);

INSERT INTO inflammation_marker_defs (
  name, abbreviation, category, unit,
  normal_low, normal_high, optimal_low, optimal_high, description
) VALUES (
  'Tumor Necrosis Factor Alpha', 'TNF-a', 'lab', 'pg/mL',
  0, 8.1,
  0, 4,
  'Pro-inflammatory cytokine involved in systemic inflammation.'
);

INSERT INTO inflammation_marker_defs (
  name, abbreviation, category, unit,
  normal_low, normal_high, optimal_low, optimal_high, description
) VALUES (
  'Erythrocyte Sedimentation Rate', 'ESR', 'lab', 'mm/hr',
  0, 22,
  0, 10,
  'Non-specific inflammation marker. Elevated in infection, tissue damage, or chronic inflammation.'
);

INSERT INTO inflammation_marker_defs (
  name, abbreviation, category, unit,
  normal_low, normal_high, optimal_low, optimal_high, description
) VALUES (
  'Homocysteine', 'Hcy', 'lab', 'umol/L',
  5, 15,
  5, 10,
  'Cardiovascular risk and B-vitamin status marker.'
);

INSERT INTO inflammation_marker_defs (
  name, abbreviation, category, unit,
  normal_low, normal_high, optimal_low, optimal_high, description
) VALUES (
  'HRV Depression', 'HRV De', 'wearable_proxy', 'z-score',
  NULL, NULL,
  NULL, NULL,
  'HRV significantly below personal baseline indicates autonomic stress/inflammation.'
);

INSERT INTO inflammation_marker_defs (
  name, abbreviation, category, unit,
  normal_low, normal_high, optimal_low, optimal_high, description
) VALUES (
  'RHR Elevation', 'RHR El', 'wearable_proxy', 'z-score',
  NULL, NULL,
  NULL, NULL,
  'Resting heart rate above baseline suggests systemic stress or illness.'
);

INSERT INTO inflammation_marker_defs (
  name, abbreviation, category, unit,
  normal_low, normal_high, optimal_low, optimal_high, description
) VALUES (
  'Respiratory Rate Elevation', 'Respir', 'wearable_proxy', 'z-score',
  NULL, NULL,
  NULL, NULL,
  'Elevated respiratory rate during sleep indicates respiratory or systemic stress.'
);

INSERT INTO inflammation_marker_defs (
  name, abbreviation, category, unit,
  normal_low, normal_high, optimal_low, optimal_high, description
) VALUES (
  'Skin Temperature Deviation', 'Skin T', 'wearable_proxy', 'degrees C',
  NULL, NULL,
  NULL, NULL,
  'Significant skin temperature deviation from baseline may indicate illness onset.'
);

INSERT INTO inflammation_marker_defs (
  name, abbreviation, category, unit,
  normal_low, normal_high, optimal_low, optimal_high, description
) VALUES (
  'Sleep Disruption', 'Sleep ', 'wearable_proxy', 'score',
  NULL, NULL,
  NULL, NULL,
  'Poor sleep quality and frequent awakenings impair immune function and recovery.'
);
