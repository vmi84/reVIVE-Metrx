import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface AssistantState {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;

  addMessage: (role: 'user' | 'assistant', content: string) => void;
  setLoading: (val: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
}

let nextId = 1;
function generateId(): string {
  return `msg_${Date.now()}_${nextId++}`;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'msg_welcome',
  role: 'assistant',
  content:
    "Hi! I'm your recovery assistant. Ask me about your scores, training recommendations, or how to use any feature in the app.",
  timestamp: Date.now(),
};

export const useAssistantStore = create<AssistantState>((set) => ({
  messages: [WELCOME_MESSAGE],
  loading: false,
  error: null,

  addMessage: (role, content) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: generateId(),
          role,
          content,
          timestamp: Date.now(),
        },
      ],
      error: null,
    })),

  setLoading: (val) => set({ loading: val }),
  setError: (error) => set({ error }),

  clearMessages: () =>
    set({
      messages: [{ ...WELCOME_MESSAGE, timestamp: Date.now() }],
      error: null,
    }),
}));
