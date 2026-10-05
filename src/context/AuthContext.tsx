import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types/index.js';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name: string, role?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('codedna_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((userData) => {
          if (userData) {
            setUser(userData);
          } else {
            localStorage.removeItem('codedna_token');
            setToken(null);
          }
        })
        .catch(() => {
          localStorage.removeItem('codedna_token');
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, pass: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password: pass })
    });

    let data;
    try {
      data = await res.json();
    } catch (_) {
      throw new Error(`Authentication server response error (${res.status})`);
    }

    if (!res.ok) {
      throw new Error(data.error || 'Login failed. Please check credentials.');
    }

    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('codedna_token', data.token);
  };

  const signup = async (email: string, pass: string, name: string, role?: string) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password: pass, name: name.trim(), role })
    });

    let data;
    try {
      data = await res.json();
    } catch (_) {
      throw new Error(`Account creation server response error (${res.status})`);
    }

    if (!res.ok) {
      throw new Error(data.error || 'Signup failed. Email may already exist.');
    }

    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('codedna_token', data.token);
  };

  const logout = () => {
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('codedna_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
