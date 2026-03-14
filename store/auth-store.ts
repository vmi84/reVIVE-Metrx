import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ProfileRow } from '../lib/types/database';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: ProfileRow | null;
  loading: boolean;
  initialized: boolean;
  /** True when Supabase env vars are not set */
  offlineMode: boolean;

  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<ProfileRow>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: false,
  initialized: false,
  offlineMode: !isSupabaseConfigured,

  initialize: async () => {
    if (!isSupabaseConfigured) {
      set({ initialized: true, offlineMode: true });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ session, user: session?.user ?? null, initialized: true });

      if (session?.user) {
        await get().fetchProfile();
      }

      supabase.auth.onAuthStateChange((_event, session) => {
        set({ session, user: session?.user ?? null });
        if (session?.user) {
          get().fetchProfile();
        } else {
          set({ profile: null });
        }
      });
    } catch {
      set({ initialized: true, offlineMode: true });
    }
  },

  signIn: async (email, password) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Add your credentials to .env to enable sign-in.');
    }
    set({ loading: true });
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email, password, fullName) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Add your credentials to .env to enable sign-up.');
    }
    set({ loading: true });
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    set({ session: null, user: null, profile: null });
  },

  fetchProfile: async () => {
    if (!isSupabaseConfigured) return;
    const userId = get().user?.id;
    if (!userId) return;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) set({ profile: data as ProfileRow });
  },

  updateProfile: async (updates) => {
    if (!isSupabaseConfigured) return;
    const userId = get().user?.id;
    if (!userId) return;

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    if (data) set({ profile: data as ProfileRow });
  },
}));
