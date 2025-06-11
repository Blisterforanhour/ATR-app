import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthStore } from '../stores/authStore';

interface AuthContextProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthContextProps> = ({ children }) => {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
};