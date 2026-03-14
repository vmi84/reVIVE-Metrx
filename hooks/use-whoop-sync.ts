import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth-store';
import { useSyncStore } from '../store/sync-store';
import { useDailyStore } from '../store/daily-store';
import { today } from '../lib/utils/date';
import * as SecureStore from 'expo-secure-store';

const WHOOP_TOKEN_KEY = 'whoop_access_token';

export function useWhoopSync() {
  const { user } = useAuthStore();
  const { setSyncInProgress, setLastWhoopSync, setSyncError } = useSyncStore();
  const { setWhoopSynced } = useDailyStore();
  const [syncing, setSyncing] = useState(false);

  const syncMorningData = useCallback(async () => {
    if (!user?.id || syncing) return;
    setSyncing(true);
    setSyncInProgress(true);

    try {
      const token = await SecureStore.getItemAsync(WHOOP_TOKEN_KEY);
      if (!token) {
        setSyncError('Whoop not connected. Please connect in Settings.');
        return;
      }

      const dateStr = today();

      // Lazy-import to avoid bundling in non-Whoop paths
      const { WhoopApiClient, sportName } = await import('../lib/adapters/whoop/api-client');
      const client = new WhoopApiClient();

      // Fetch recovery + sleep arrays for today
      const [recoveryRecords, sleepRecords] = await Promise.all([
        client.getRecovery(token, dateStr),
        client.getSleep(token, dateStr),
      ]);

      // Take the most recent record from each
      const rec = recoveryRecords[0];
      const slp = sleepRecords.filter(s => !s.nap)[0]; // primary sleep, not naps

      if (!rec && !slp) {
        setSyncError('No Whoop data available for today yet.');
        return;
      }

      // Map Whoop API fields → daily_physiology columns
      const upsertData: Record<string, unknown> = {
        user_id: user.id,
        date: dateStr,
        sources: ['whoop'],
        raw_data: { recovery: rec, sleep: slp },
      };

      if (rec?.score) {
        upsertData.hrv_rmssd = rec.score.hrv_rmssd_milli / 1000; // milli → ms
        upsertData.resting_heart_rate = rec.score.resting_heart_rate;
        upsertData.spo2_pct = rec.score.spo2_percentage;
        upsertData.skin_temp_deviation = rec.score.skin_temp_celsius;
        upsertData.recovery_score = rec.score.recovery_score;
      }

      if (slp?.score) {
        const stage = slp.score.stage_summary;
        const totalSleep = stage.total_in_bed_time_milli - stage.total_awake_time_milli;
        upsertData.sleep_duration_ms = totalSleep;
        upsertData.sleep_performance_pct = slp.score.sleep_performance_percentage;
        upsertData.sleep_consistency_pct = slp.score.sleep_consistency_percentage;
        upsertData.rem_sleep_ms = stage.total_rem_sleep_time_milli;
        upsertData.deep_sleep_ms = stage.total_slow_wave_sleep_time_milli;
        upsertData.light_sleep_ms = stage.total_light_sleep_time_milli;
        upsertData.awake_during_ms = stage.total_awake_time_milli;
        upsertData.respiratory_rate = slp.score.respiratory_rate;
        upsertData.sleep_onset_time = slp.start;
        upsertData.wake_time = slp.end;
        upsertData.awakenings = stage.disturbance_count ?? null;
      }

      const { error } = await supabase
        .from('daily_physiology')
        .upsert(upsertData, { onConflict: 'user_id,date' });

      if (error) throw error;

      setLastWhoopSync(new Date().toISOString());
      setWhoopSynced(true);
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Whoop sync failed');
    } finally {
      setSyncing(false);
      setSyncInProgress(false);
    }
  }, [user?.id, syncing]);

  const syncPostWorkout = useCallback(async () => {
    if (!user?.id) return;

    try {
      const token = await SecureStore.getItemAsync(WHOOP_TOKEN_KEY);
      if (!token) return;

      const { WhoopApiClient, sportName } = await import('../lib/adapters/whoop/api-client');
      const client = new WhoopApiClient();

      const dateStr = today();
      const workouts = await client.getWorkouts(token, dateStr, dateStr);

      for (const w of workouts) {
        const score = w.score;
        await supabase.from('workouts').upsert({
          user_id: user.id,
          date: dateStr,
          workout_type: sportName(w.sport_id),
          start_time: w.start,
          end_time: w.end,
          duration_ms: w.start && w.end ? new Date(w.end).getTime() - new Date(w.start).getTime() : null,
          avg_heart_rate: score?.average_heart_rate ?? null,
          max_heart_rate: score?.max_heart_rate ?? null,
          strain_score: score?.strain ?? null,
          calories_burned: score ? Math.round(score.kilojoule / 4.184) : null, // kJ to kcal
          hr_zones: score?.zone_duration ? {
            zone1: score.zone_duration.zone_zero_milli + score.zone_duration.zone_one_milli,
            zone2: score.zone_duration.zone_two_milli,
            zone3: score.zone_duration.zone_three_milli,
            zone4: score.zone_duration.zone_four_milli,
            zone5: score.zone_duration.zone_five_milli,
          } : null,
          source: 'whoop',
        });
      }

      // Update day strain
      const totalStrain = workouts.reduce(
        (sum: number, w) => sum + (w.score?.strain ?? 0),
        0,
      );
      await supabase
        .from('daily_physiology')
        .update({ day_strain: totalStrain })
        .eq('user_id', user.id)
        .eq('date', dateStr);
    } catch (err) {
      console.error('Post-workout sync error:', err);
    }
  }, [user?.id]);

  return {
    syncMorningData,
    syncPostWorkout,
    syncing,
  };
}
