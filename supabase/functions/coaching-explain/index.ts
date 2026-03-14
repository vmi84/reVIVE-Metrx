import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY') ?? '';

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
    const body = await req.json();
    const {
      score, tier, subsystems, phenotype, phenotypeLabel,
      limiters, protocolClass, penalties,
    } = body;

    const prompt = `You are a sports science coach providing a brief, actionable recovery assessment for an endurance athlete.

Today's IACI Score: ${score}/100
Readiness Tier: ${tier}
Condition: ${phenotypeLabel}
Protocol Class: ${protocolClass}
Primary Limiters: ${(limiters ?? []).join(', ') || 'None'}
Penalties: ${(penalties ?? []).join(', ') || 'None'}

Subsystem Scores:
- Autonomic: ${subsystems.autonomic}
- Musculoskeletal: ${subsystems.musculoskeletal}
- Cardiometabolic: ${subsystems.cardiometabolic}
- Sleep/Circadian: ${subsystems.sleep}
- Metabolic/Hydration: ${subsystems.metabolic}
- Psychological: ${subsystems.psychological}

Provide a 2-3 sentence plain-English explanation of the athlete's current state and the most important recovery action for today. Be specific and actionable. Do not use medical jargon.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const result = await response.json();
    const explanation = result.content?.[0]?.text ?? 'Unable to generate explanation.';

    return new Response(JSON.stringify({ explanation }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to generate explanation' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
