import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import type { Customer } from '../types/account';
import { fetchSessionCustomer, loginCustomer, loginCustomerWithGoogle, logoutCustomer, registerCustomer, updateCustomer } from '../services/api';

interface RegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
}

interface AuthContextType {
  customer: Customer | null;
  customerId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  saveProfile: (payload: Partial<Customer>) => Promise<void>;
}

const STORAGE_KEY = 'gray-collection-customer-id';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customerId, setCustomerId] = useState<string | null>(() => window.localStorage.getItem(STORAGE_KEY));
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      const sessionCustomer = await fetchSessionCustomer();
      setCustomer(sessionCustomer);
      setCustomerId(sessionCustomer.id);
      window.localStorage.setItem(STORAGE_KEY, sessionCustomer.id);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      setCustomerId(null);
      setCustomer(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile().catch(() => {
      setCustomer(null);
      setIsLoading(false);
    });
  }, [customerId]);

  const login = async (email: string, password: string) => {
    const response = await loginCustomer(email, password);
    window.localStorage.setItem(STORAGE_KEY, response.id);
    setCustomerId(response.id);
    await refreshProfile();
  };

  const loginWithGoogle = async (credential: string) => {
    const response = await loginCustomerWithGoogle(credential);
    window.localStorage.setItem(STORAGE_KEY, response.id);
    setCustomerId(response.id);
    await refreshProfile();
  };

  const register = async (payload: RegisterPayload) => {
    const response = await registerCustomer(payload);
    window.localStorage.setItem(STORAGE_KEY, response.id);
    setCustomerId(response.id);
    await refreshProfile();
  };

  const logout = async () => {
    try {
      await logoutCustomer();
    } catch {
      // ignore logout server failure
    }
    window.localStorage.removeItem(STORAGE_KEY);
    setCustomerId(null);
    setCustomer(null);
  };

  const saveProfile = async (payload: Partial<Customer>) => {
    if (!customerId) {
      throw new Error('Bạn chưa đăng nhập.');
    }
    const response = await updateCustomer(customerId, payload);
    setCustomer(response.customer);
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        customerId,
        isAuthenticated: Boolean(customer),
        isLoading,
        login,
        loginWithGoogle,
        register,
        logout,
        refreshProfile,
        saveProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
