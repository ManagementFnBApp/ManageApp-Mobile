import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  token: string | null;
  login: (t: unknown) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: any) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restore();
  }, []);

  const restore = async () => {
    const t = await SecureStore.getItemAsync("token");
    setToken(t);
    setLoading(false);
  };

  const login = async (t: unknown) => {
    // SecureStore only accepts strings; ensure we don't pass undefined or non-string values
    let tokenStr: string;

    if (typeof t === 'string') {
      tokenStr = t;
    } else {
      console.warn("AuthProvider.login received non-string token, converting:", t);
      try {
        tokenStr = JSON.stringify(t);
      } catch (err) {
        tokenStr = String(t);
      }
    }

    await SecureStore.setItemAsync("token", tokenStr);
    setToken(tokenStr);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("token");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);