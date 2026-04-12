import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { authService, AuthUser, LoginRequest, RegisterRequest } from '../services/authService';
import { useNavigate } from 'react-router';

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(() => authService.getUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authService.login(credentials);
        const authUser: AuthUser = {
          id: response.id,
          username: response.username,
          email: response.email,
          roles: response.roles,
        };
        authService.setAuth(response.token, authUser);
        setUser(authUser);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Login failed';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authService.register(data);

        // If registration grants token
        if (response.token && response.id) {
          const authUser: AuthUser = {
            id: response.id,
            username: response.username,
            email: response.email,
            roles: response.roles,
          };
          authService.setAuth(response.token, authUser);
          setUser(authUser);
        } else if (response.message) {
          setError(null); // Clear error since registration succeeded
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Registration failed';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setError(null);
    navigate('/login');
  }, [navigate]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && authService.isAuthenticated(),
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
