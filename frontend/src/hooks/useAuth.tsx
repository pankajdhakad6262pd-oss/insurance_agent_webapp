'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Agent } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  agent: Agent | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; mobile: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const logout = useCallback(() => {
    localStorage.removeItem('insur_auth_token');
    localStorage.removeItem('insur_agent_user');
    setToken(null);
    setAgent(null);
    router.push('/login');
  }, [router]);

  useEffect(() => {
    const storedToken = localStorage.getItem('insur_auth_token');
    const storedUser = localStorage.getItem('insur_agent_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setAgent(JSON.parse(storedUser));
        // Verify token with backend
        api.getMe()
          .then((res) => {
            if (res.data) {
              setAgent(res.data);
              localStorage.setItem('insur_agent_user', JSON.stringify(res.data));
            }
          })
          .catch(() => {
            logout();
          })
          .finally(() => {
            setIsLoading(false);
          });
      } catch {
        logout();
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [logout]);

  // Route protection
  useEffect(() => {
    if (isLoading) return;

    const isAuthRoute = pathname === '/login' || pathname === '/register';

    if (!token && !isAuthRoute && pathname !== '/') {
      router.push('/login');
    } else if (token && isAuthRoute) {
      router.push('/dashboard');
    }
  }, [token, isLoading, pathname, router]);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    if (res.success && res.data) {
      setToken(res.data.token);
      setAgent(res.data.agent);
      localStorage.setItem('insur_auth_token', res.data.token);
      localStorage.setItem('insur_agent_user', JSON.stringify(res.data.agent));
      router.push('/dashboard');
    }
  };

  const register = async (data: { name: string; email: string; mobile: string; password: string }) => {
    const res = await api.register(data);
    if (res.success && res.data) {
      setToken(res.data.token);
      setAgent(res.data.agent);
      localStorage.setItem('insur_auth_token', res.data.token);
      localStorage.setItem('insur_agent_user', JSON.stringify(res.data.agent));
      router.push('/dashboard');
    }
  };

  return (
    <AuthContext.Provider value={{ agent, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

