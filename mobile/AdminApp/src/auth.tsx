import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api, getToken, initApi, setToken } from './api';

interface AuthState {
  ready: boolean;
  authed: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  ready: false,
  authed: false,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    (async () => {
      await initApi();
      setAuthed(Boolean(getToken()));
      setReady(true);
    })();
  }, []);

  const login = useCallback(async (token: string) => {
    const t = token.trim();
    if (!t) throw new Error('Enter the admin token');
    await api.post('/api/admin/login', { token: t });
    await setToken(t);
    setAuthed(true);
  }, []);

  const logout = useCallback(async () => {
    await setToken('');
    setAuthed(false);
  }, []);

  const value = useMemo(
    () => ({ ready, authed, login, logout }),
    [ready, authed, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
