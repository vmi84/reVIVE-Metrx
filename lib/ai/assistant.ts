/**
 * Client-side assistant API integration.
 * Mirrors the pattern from lib/ai/coaching.ts.
 */

import { supabase, isSupabaseConfigured } from '../supabase';
import { AssistantContext, gatherAssistantContext } from './assistant-context';
import { ChatMessage } from '../../store/assistant-store';

/** Maximum messages to send (trimmed from the end) */
const MAX_MESSAGES = 10;

/**
 * Send a message to the assistant and get a reply.
 * Automatically gathers user context from stores.
 */
export async function sendAssistantMessage(
  messages: ChatMessage[],
): Promise<string> {
  if (!isSupabaseConfigured) {
    return 'The assistant requires a network connection. Please configure Supabase credentials in your environment to enable AI features.';
  }

  const context = gatherAssistantContext();

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
