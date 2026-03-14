import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'content-type',
      },
    });
  }

  try {
    const body = await req.json();
    const { type, user_id, data } = body;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    switch (type) {
      case 'recovery.updated': {
        const date = data.created_at?.split('T')[0];
        if (!date || !user_id) break;

        await supabase.from('daily_physiology').upsert({
          user_id,
          date,
          hrv_rmssd: data.score?.hrv_rmssd_milli ? data.score.hrv_rmssd_milli / 1000 : null,
          resting_heart_rate: data.score?.resting_heart_rate,
          spo2_pct: data.score?.spo2_percentage,
          skin_temp_deviation: data.score?.skin_temp_celsius,
          recovery_score: data.score?.recovery_score,
          sources: ['whoop_webhook'],
        }, { onConflict: 'user_id,date' });
        break;
      }

      case 'sleep.updated': {
        const date = data.end?.split('T')[0];
        if (!date || !user_id) break;

        const sleepDuration = data.score?.stage_summary
          ? (data.score.stage_summary.total_light_sleep_time_milli ?? 0) +
            (data.score.stage_summary.total_slow_wave_sleep_time_milli ?? 0) +
            (data.score.stage_summary.total_rem_sleep_time_milli ?? 0)
          : null;

        await supabase.from('daily_physiology').upsert({
          user_id,
          date,
          sleep_duration_ms: sleepDuration,
          sleep_performance_pct: data.score?.sleep_performance_percentage,
          sleep_consistency_pct: data.score?.sleep_consistency_percentage,
          rem_sleep_ms: data.score?.stage_summary?.total_rem_sleep_time_milli,
          deep_sleep_ms: data.score?.stage_summary?.total_slow_wave_sleep_time_milli,
          light_sleep_ms: data.score?.stage_summary?.total_light_sleep_time_milli,
          awake_during_ms: data.score?.stage_summary?.total_awake_time_milli,
          respiratory_rate: data.score?.respiratory_rate,
          sources: ['whoop_webhook'],
        }, { onConflict: 'user_id,date' });
        break;
      }

      case 'workout.updated': {
        if (!user_id || !data.id) break;

        await supabase.from('workouts').upsert({
          user_id,
          date: data.start?.split('T')[0],
          workout_type: data.sport_id?.toString() ?? 'unknown',
          start_time: data.start,
          end_time: data.end,
          duration_ms: data.score?.end_time_milli
            ? data.score.end_time_milli - (data.score.start_time_milli ?? 0)
            : null,
          avg_heart_rate: data.score?.average_heart_rate,
          max_heart_rate: data.score?.max_heart_rate,
          strain_score: data.score?.strain,
          calories_burned: data.score?.kilojoule ? data.score.kilojoule / 4.184 : null,
          hr_zones: data.score?.zone_duration,
          source: 'whoop_webhook',
        });
        break;
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Webhook processing failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
