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
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { user_id } = await req.json();
    if (!user_id) {
      return new Response(JSON.stringify({ error: 'user_id required' }), { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const today = new Date().toISOString().split('T')[0];
    const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0];

    const { data: history } = await supabase
      .from('daily_physiology')
      .select('date, iaci_score, subsystem_scores, day_strain, inflammation_score')
      .eq('user_id', user_id)
      .gte('date', ninetyDaysAgo)
      .not('iaci_score', 'is', null)
      .order('date', { ascending: true });

    if (!history || history.length < 7) {
      return new Response(JSON.stringify({ message: 'Not enough data' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Compute trends for each period
    for (const period of ['7d', '21d', '28d', '90d'] as const) {
      const days = { '7d': 7, '21d': 21, '28d': 28, '90d': 90 }[period];
      const slice = history.slice(-days);
      if (slice.length < 3) continue;

      const iaciValues = slice.map((d: any) => d.iaci_score);
      const strainValues = slice.map((d: any) => d.day_strain ?? 0);
      const iaciTrend = linearTrend(iaciValues);
      const strainAvg = mean(strainValues);

      // ACWR
      const acute = mean(strainValues.slice(-7));
      const chronic = mean(strainValues.slice(-28));
      const acwr = chronic > 0 ? acute / chronic : 1.0;

      // Monotony
      const recentStrain = strainValues.slice(-7);
      const sd = stdDev(recentStrain);
      const monotony = sd > 0 ? mean(recentStrain) / sd : 0;

      await supabase.from('trend_snapshots').upsert({
        user_id,
        date: today,
        period,
        iaci_trend: iaciTrend,
        subsystem_trends: {},
        training_load_avg: strainAvg,
        acwr,
        monotony,
        strain_avg: strainAvg,
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to compute trends' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance = values.reduce((s, v) => s + (v - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function linearTrend(values: number[]): number {
  if (values.length < 2) return 0;
  const n = values.length;
  const xMean = (n - 1) / 2;
  const yMean = mean(values);
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (values[i] - yMean);
    den += (i - xMean) ** 2;
  }
  return den === 0 ? 0 : num / den;
}
