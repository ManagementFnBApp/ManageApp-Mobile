import { decodeJwt, UserJwtPayload } from '@/lib/jwt';
import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  user_id: number;
  username: string;
  role: string | null;
  expiredTime: number;
}

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  login: (t: unknown) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restore();
  }, []);

  /** Decode a JWT string into an AuthUser object */
  const parseUser = (tokenStr: string): AuthUser | null => {
    try {
      const payload = decodeJwt<UserJwtPayload>(tokenStr);
      if (!payload) return null;
      return {
        user_id: payload.user_id ?? payload.sub,
        username: payload.username ?? '',
        role: payload.role ?? null,
        expiredTime: payload.exp ?? 0,
      };
    } catch {
      return null;
    }
  };

  /** Restore token from SecureStore on app launch */
  const restore = async () => {
    try {
      const stored = await SecureStore.getItemAsync('token');
      if (stored) {
        setToken(stored);
        setUser(parseUser(stored));
      }
    } catch (err) {
      console.warn('AuthProvider: failed to restore token', err);
    } finally {
      setLoading(false);
    }
  };

  /** Called after a successful login/register API response */
  const login = async (t: unknown) => {
    let tokenStr: string;

    if (typeof t === 'string') {
      tokenStr = t;
    } else {
      console.warn('AuthProvider.login received non-string token, converting:', t);
      try {
        tokenStr = JSON.stringify(t);
      } catch {
        tokenStr = String(t);
      }
    }

    await SecureStore.setItemAsync('token', tokenStr);
    setToken(tokenStr);
    setUser(parseUser(tokenStr));
  };

  /** Clear session */
  const logout = async () => {
    await SecureStore.deleteItemAsync('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAuth = () => useContext(AuthContext);