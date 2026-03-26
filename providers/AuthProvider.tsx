import { decodeJwt, UserJwtPayload } from '@/lib/jwt';
import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  user_id: number;
  shop_id:number;
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

  // ─── Auto-logout when token expires ────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const msUntilExpiry = user.expiredTime * 1000 - Date.now();

    // Already expired (e.g. set just after restore edge case)
    if (msUntilExpiry <= 0) {
      logout();
      return;
    }

    const timer = setTimeout(() => {
      Alert.alert(
        'Session Expired',
        'Your session has expired. Please log in again.',
        [{ text: 'OK', onPress: logout }]
      );
    }, msUntilExpiry);

    return () => clearTimeout(timer);
  }, [user]);

  // ─── Helpers ───────────────────────────────────────────────────────────────

  /** Returns true if the token's expiry time has passed */
  const isExpired = (u: AuthUser): boolean => u.expiredTime * 1000 < Date.now();

  /** Decode a JWT string into an AuthUser object */
  const parseUser = (tokenStr: string): AuthUser | null => {
    try {
      const payload = decodeJwt<UserJwtPayload>(tokenStr);
      if (!payload) return null;

      return {
        user_id: (payload as any).id ?? payload.id ?? Number(payload.id),
        shop_id: Number(payload.shop_id),
        username: payload.username ?? '',
        role: payload.role ?? null,
        expiredTime: payload.exp ?? 0,
      };
    } catch {
      return null;
    }
  };

  // ─── Actions ───────────────────────────────────────────────────────────────

  /** Restore token from SecureStore on app launch */
  const restore = async () => {
    try {
      const stored = await SecureStore.getItemAsync('accessToken');
      if (stored) {
        const parsed = parseUser(stored);
        if (parsed && !isExpired(parsed)) {
          setToken(stored);
          setUser(parsed);
        } else {
          // Token is expired or invalid — clean up silently
          await SecureStore.deleteItemAsync('accessToken');
          logout()
        }
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

    await SecureStore.setItemAsync('accessToken', tokenStr);
    setToken(tokenStr);
    setUser(parseUser(tokenStr));
  };

  /** Clear session */
  const logout = async () => {
    await SecureStore.deleteItemAsync('accessToken');
    setToken(null);
    setUser(null);
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};