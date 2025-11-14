import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AdminAccount } from '@/types';
import { loginRequest, LoginPayload } from '@/services/adminService';
import { DEFAULT_ADMIN_GROUP } from '@/config/api';

const STORAGE_KEY = '@cep-admin-account';

interface AuthContextValue {
  admin: AdminAccount | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdmin = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setAdmin(JSON.parse(stored));
        }
      } catch (error) {
        console.warn('Failed to restore admin session', error);
      } finally {
        setLoading(false);
      }
    };

    loadAdmin();
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const normalizedPayload = {
      ...payload,
      adminGroup: payload.adminGroup || DEFAULT_ADMIN_GROUP
    };

    const adminAccount = await loginRequest(normalizedPayload);
    setAdmin(adminAccount);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(adminAccount));
  }, []);

  const logout = useCallback(async () => {
    setAdmin(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({
      admin,
      loading,
      login,
      logout
    }),
    [admin, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


