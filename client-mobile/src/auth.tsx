import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Linking } from 'react-native';
import type { Session, User } from '@supabase/supabase-js';
import { AUTH_CALLBACK_URL } from './config';
import { supabase } from './supabase';

interface AuthState {
  ready: boolean;
  session: Session | null;
  user: User | null;
  /** Sends a magic-link email. User taps the link to sign in. */
  sendMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

function sessionFromUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  // Supabase appends tokens in the fragment: #access_token=..&refresh_token=..
  const hash = url.split('#')[1];
  if (!hash || !url.startsWith('maabhagwati://')) return false;
  const params = new URLSearchParams(hash);
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  if (!access_token || !refresh_token) return false;
  supabase.auth.setSession({ access_token, refresh_token }).catch(() => {});
  return true;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    Linking.getInitialURL().then((u) => sessionFromUrl(u));
    const onUrl = ({ url }: { url: string }) => sessionFromUrl(url);
    const linkSub = Linking.addEventListener('url', onUrl);
    return () => {
      sub.subscription.unsubscribe();
      linkSub.remove();
    };
  }, []);

  const sendMagicLink = useCallback(async (email: string) => {
    const clean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      throw new Error('Enter a valid email address');
    }
    const { error } = await supabase.auth.signInWithOtp({
      email: clean,
      options: { emailRedirectTo: AUTH_CALLBACK_URL },
    });
    if (error) throw new Error(error.message);
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      ready,
      session,
      user: session?.user ?? null,
      sendMagicLink,
      signOut,
    }),
    [ready, session, sendMagicLink, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
