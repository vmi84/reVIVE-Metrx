import { useEffect } from 'react';
import { useAuthStore } from '../store/auth-store';

export function useAuth() {
  const store = useAuthStore();

  useEffect(() => {
    if (!store.initialized) {
      store.initialize();
    }
  }, [store.initialized]);

  return {
    user: store.user,
    session: store.session,
    profile: store.profile,
    loading: store.loading,
    initialized: store.initialized,
    signIn: store.signIn,
    signUp: store.signUp,
    signOut: store.signOut,
    updateProfile: store.updateProfile,
  };
}
