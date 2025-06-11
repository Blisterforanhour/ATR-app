import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { AuthService } from '../services/AuthService';
import { UserService } from '../services/UserService';
import { MatchService } from '../services/MatchService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Use the AuthService instead of making direct Supabase calls
        const currentUser = await AuthService.getCurrentUser();
        setUser(currentUser);
        
        // Update mock matches with actual user ID if user exists
        if (currentUser) {
          MatchService.updateMockMatchesWithUserId(currentUser.id);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Don't throw the error, just log it and continue with null user
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string) => {
    setIsLoading(true);
    try {
      const loginResult = await AuthService.login(email);
      setUser(loginResult.user);
      
      // Update mock matches with the new user's ID
      MatchService.updateMockMatchesWithUserId(loginResult.user.id);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      UserService.updateUser(updatedUser);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};