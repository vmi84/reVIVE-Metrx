/**
 * Claude API integration for natural language coaching explanations.
 * Used via Supabase Edge Function proxy (not direct from client).
 */

import { IACIResult } from '../types/iaci';
import { supabase } from '../supabase';

export async function getCoachingExplanation(iaci: IACIResult): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('coaching-explain', {
      body: {
        score: iaci.score,
        tier: iaci.readinessTier,
        subsystems: Object.fromEntries(
          Object.entries(iaci.subsystemScores).map(([k, v]) => [k, v.score]),
        ),
        phenotype: iaci.phenotype.key,
        phenotypeLabel: iaci.phenotype.label,
        limiters: iaci.phenotype.primaryLimiters,
        protocolClass: iaci.protocol.protocolClass,
        penalties: iaci.penalties.map(p => p.name),
      },
    });

    if (error) throw error;
    return data?.explanation ?? iaci.phenotype.description;
  } catch {
    // Fallback to rule-based explanation
    return iaci.phenotype.description;
  }
}
