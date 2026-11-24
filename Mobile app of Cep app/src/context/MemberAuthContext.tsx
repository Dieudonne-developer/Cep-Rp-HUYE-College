import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MemberUser, memberLogin } from '@/services/userService';

const STORAGE_KEY = '@cep-member-session';

interface MemberAuthValue {
  user: MemberUser | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string, group: string) => Promise<void>;
  logout: () => Promise<void>;
}

const MemberAuthContext = createContext<MemberAuthValue | undefined>(undefined);

export const MemberAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MemberUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed.user);
          setToken(parsed.token);
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  const login = useCallback(async (username: string, password: string, group: string) => {
    const result = await memberLogin(username, password, group);
    setUser(result.user);
    setToken(result.accessToken);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(result));
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <MemberAuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </MemberAuthContext.Provider>
  );
};

export const useMemberAuth = () => {
  const ctx = useContext(MemberAuthContext);
  if (!ctx) throw new Error('useMemberAuth must be used within MemberAuthProvider');
  return ctx;
};
