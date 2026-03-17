import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY') ?? '';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const STATIC_SYSTEM_PROMPT = `You are the reVIVE Metrx recovery assistant. You help athletes understand their recovery data, navigate the app, and make better training decisions.

APP STRUCTURE:
- Dashboard (Home tab): Daily feed of recovery cards. Today's card at top. Each card shows IACI score, subsystem breakdown, and recommended training.
- Train tab: Training modalities compatible with current recovery state. 32 modalities across categories: Performance, Recovery Training, Mind & Body, Active Recovery. Each has a permission level based on your readiness.
- Recover tab: Recovery protocols and evening recovery logging.
- Trends tab: Historical trends for IACI scores, subsystem scores, and physiological metrics over time.
- Profile tab: Sport selection, device connections (Whoop, Garmin, Oura, etc.), data import, settings.

KEY CONCEPTS:
- IACI (Integrated Athlete Condition Index): 0-100 composite score from 6 subsystems.
- Subsystems: Autonomic (HRV, RHR), Musculoskeletal (soreness, stiffness), Cardiometabolic (cardio markers), Sleep (duration, quality, stages), Metabolic (hydration, nutrition), Psychological (stress, motivation, mental fatigue).
- Readiness Tiers: Perform (85+), Train (70-84), Maintain (55-69), Recover (35-54), Protect (<35).
- Condition Phenotypes: Fully Recovered, Locally Fatigued, Centrally Suppressed, Sleep-Driven Suppression, Accumulated Fatigue, Under-Fueled, Illness Risk.
- Protocol Classes: A through E, mapping intensity/volume recommendations.
- Morning Check-In: Daily subjective input — energy, sleep quality, soreness map, motivation, stress, hydration, etc. Found on Dashboard tab.
- Wearable Integration: Imports HRV, RHR, recovery score, sleep stages, strain from connected devices. Can sync via API or file import. Manage in Profile > Connect Device.
- Import Data: Import CSV/ZIP exports from wearables via Profile > Import Data.

RESPONSE GUIDELINES:
- Be concise (2-4 sentences typically).
- Use plain language, no medical jargon.
- When explaining scores, reference the specific subsystem that is limiting.
- When suggesting actions, reference specific app screens/tabs the user can navigate to.
- If asked about something outside the app's domain, politely redirect.
- Never fabricate data — if context shows null values, say the data is not yet available and suggest how to get it (check-in, connect device, etc.).`;

function buildSystemPrompt(context: Record<string, unknown>): string {
  if (!context || Object.keys(context).length === 0) {
    return STATIC_SYSTEM_PROMPT;
  }

  const deviceLabel = context.deviceSource
    ? String(context.deviceSource).charAt(0).toUpperCase() + String(context.deviceSource).slice(1)
    : 'None';

  const contextBlock = `

CURRENT USER STATE:
- Today's IACI Score: ${context.iaciScore ?? 'Not available'}/100${context.readinessTier ? ` (${context.readinessTier} tier)` : ''}
- Condition: ${context.phenotype ?? 'Not assessed yet'}
- Subsystem Scores: ${context.subsystems ? Object.entries(context.subsystems as Record<string, number>).map(([k, v]) => `${k}: ${v}`).join(', ') : 'Not available'}
- Penalties: ${(context.penalties as string[])?.length ? (context.penalties as string[]).join(', ') : 'None'}
- Primary Limiters: ${(context.limiters as string[])?.length ? (context.limiters as string[]).join(', ') : 'None'}
- Protocol Class: ${context.protocolClass ?? 'Not assigned'}
- Check-in completed today: ${context.checkinCompleted ? 'Yes' : 'No'}
- Wearable device connected: ${context.deviceSynced ? 'Yes' : 'No'} (Source: ${deviceLabel})
- Wearable metrics: HRV ${context.hrv ?? '—'}ms, RHR ${context.rhr ?? '—'}bpm, Recovery ${context.recoveryScore ?? '—'}%, Sleep ${context.sleepHours ?? '—'}h
- Active sports: ${(context.sportProfiles as string[])?.length ? (context.sportProfiles as string[]).join(', ') : 'Not set'}
- Recommended training: ${(context.topModalities as string[])?.length ? (context.topModalities as string[]).join(', ') : 'Complete check-in first'}
- Recent workouts logged: ${context.recentWorkoutCount ?? 0}`;

  return STATIC_SYSTEM_PROMPT + contextBlock;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const body = await req.json();
    const { messages, context } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'messages array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } },
      );
    }

    const systemPrompt = buildSystemPrompt(context ?? {});

    // Only send the last 10 messages to keep token usage reasonable
    const trimmedMessages = messages.slice(-10).map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: systemPrompt,
        messages: trimmedMessages,
      }),
    });

    const result = await response.json();
    const reply = result.content?.[0]?.text ?? 'Sorry, I could not generate a response.';

    return new Response(
      JSON.stringify({ reply }),
      { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Failed to generate response', detail: message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } },
    );
  }
});
