import React, { createContext, useContext, useEffect } from 'react';
import type { User, AuthContextType, RegisterData } from '../types';
import { useAuthStore } from '../stores/authStore';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    user, 
    token, 
    loading, 
    login, 
    register, 
    logout, 
    checkAuth 
  } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};