/**
 * Client-side assistant API integration.
 * Mirrors the pattern from lib/ai/coaching.ts.
 *
 * When Supabase is not configured (offline/demo mode), falls back to
 * a local keyword-based responder using the Help Guide data.
 */

import { supabase, isSupabaseConfigured } from '../supabase';
import { AssistantContext, gatherAssistantContext } from './assistant-context';
import { ChatMessage } from '../../store/assistant-store';
import { HELP_GUIDE } from '../../data/help-guide';

/** Maximum messages to send (trimmed from the end) */
const MAX_MESSAGES = 10;

/**
 * Send a message to the assistant and get a reply.
 * Automatically gathers user context from stores.
 * Falls back to local help guide search when offline.
 */
export async function sendAssistantMessage(
  messages: ChatMessage[],
): Promise<string> {
  const context = gatherAssistantContext();

  // Offline fallback: search help guide locally
  if (!isSupabaseConfigured) {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMsg) return 'Ask me anything about the app or your recovery data!';
    return getOfflineResponse(lastUserMsg.content, context);
  }

  // Trim to last N user/assistant messages (exclude system messages like welcome)
  const apiMessages = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content }));

  try {
    const { data, error } = await supabase.functions.invoke('assistant-chat', {
      body: { messages: apiMessages, context },
    });

    if (error) throw error;
    return data?.reply ?? 'Sorry, I could not generate a response. Please try again.';
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    throw new Error(`Assistant error: ${message}`);
  }
}

// ─── Offline Fallback ──────────────────────────────────────────────────────

function getOfflineResponse(query: string, context: AssistantContext): string {
  const q = query.toLowerCase();

  // Context-based responses FIRST (when user has data, answer from their data)
  if (q.includes('score') || q.includes('iaci')) {
    if (context.iaciScore != null) {
      return `Your IACI score is ${context.iaciScore}/100 (${context.readinessTier} tier). ${
        context.phenotype ? `Your condition phenotype is "${context.phenotype}".` : ''
      } ${context.iaciScore >= 70 ? 'You\'re in good shape for training today.' : 'Consider focusing on recovery today.'}`;
    }
    return 'Complete your morning check-in to see your IACI score. Go to the Home tab and tap "Start Check-In."';
  }

  if (q.includes('hrv') || q.includes('heart rate variability')) {
    if (context.hrv != null) {
      return `Your HRV is ${Math.round(context.hrv)}ms. ${
        context.hrv > 60 ? 'This is a good reading — your autonomic system is recovering well.' :
        context.hrv > 40 ? 'This is moderate — consider lighter training today.' :
        'This is low — prioritize recovery and sleep.'
      }`;
    }
    return 'HRV data is available when your wearable device is connected and synced. Go to Settings > Connected Devices to set up your device.';
  }

  if (q.includes('recovery') || q.includes('recommend')) {
    return 'Check the Recovery tab for IACI-driven recovery protocols tailored to your current state. After logging a workout on the Effort tab, you\'ll also see post-workout recovery options filtered by your equipment and time available.';
  }

  if (q.includes('acwr') || q.includes('workload') || q.includes('training load')) {
    return 'ACWR (Acute:Chronic Workload Ratio) compares your last 7 days of training to your 28-day average. The sweet spot is 0.8-1.3 for recreational athletes or 0.8-1.5 for competitive. Check the Trends tab > Training Load chart to see your current ratio.';
  }

  if (q.includes('checkin') || q.includes('check-in') || q.includes('check in')) {
    return 'The morning check-in takes about 20 seconds with 10 inputs: Energy, Sleep Quality, Soreness, Stiffness, Heavy Legs, Cramping, Motivation, Stress, Mental Fatigue, and Hydration. Go to the Home tab and tap "Start Check-In" to begin.';
  }

  if (q.includes('train') || q.includes('effort') || q.includes('workout')) {
    return 'The Effort Guide tab shows your Training Compatibility (what\'s safe today), lets you log your workout, and then shows recovery options based on what you did. Check the Training Compatibility table first to see what zones are recommended.';
  }

  if (q.includes('trend') || q.includes('chart') || q.includes('graph')) {
    return 'The Trends tab has 3 chart views: Recovery (IACI + device scores over time), Check-In (your daily subjective data), and Training Load (strain + ACWR). Use the period selector (7d/21d/28d/90d) to zoom in or out. Tap legend items to show/hide series.';
  }

  if (q.includes('help') || q.includes('how')) {
    return 'Check the Help Guide in Settings for detailed explanations of every feature. You can filter by screen (Home, Recovery, Effort, Trends). Each entry explains what it does, why it matters, and how to use it.';
  }

  // Search help guide for matching entries (fallback)
  const matches = HELP_GUIDE.filter(entry => {
    const searchText = `${entry.title} ${entry.summary} ${entry.detail}`.toLowerCase();
    const words = q.split(/\s+/).filter(w => w.length > 2);
    return words.some(word => searchText.includes(word));
  });

  if (matches.length > 0) {
    const best = matches[0];
    return `${best.title}: ${best.summary}\n\n${best.howToUse}`;
  }

  // Default
  return `I can help with:\n• Your IACI score and what it means\n• Recovery recommendations\n• Training compatibility\n• How to use any feature\n• Understanding your trends\n\nTry asking "What's my IACI score?" or "What should I do for recovery?"`;
}
