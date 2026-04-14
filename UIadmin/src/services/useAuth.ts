import { useNavigate } from 'react-router';
import { authService, AuthUser, LoginRequest, RegisterRequest } from '../services/authService';
import { useState, useCallback } from 'react';

export interface UseAuthReturn {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(authService.getUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authService.login(credentials);
        const authUser = {
          id: response.id,
          username: response.username,
          fullName: response.fullName || response.username,
          email: response.email,
          roles: response.roles,
        };
        authService.setAuth(response.token, authUser);
        setUser(authUser);
        navigate('/');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Login failed';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authService.register(data);
        
        // If immediate login (registration grants token)
        if (response.token && response.id) {
          const authUser = {
            id: response.id,
            username: response.username,
            fullName: response.fullName || response.username,
            email: response.email,
            roles: response.roles,
          };
          authService.setAuth(response.token, authUser);
          setUser(authUser);
          navigate('/');
        } else {
          // Email verification required
          navigate('/login', {
            state: { message: response.message || 'Please check your email to verify your account.' },
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Registration failed';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [navigate]
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

  return {
    user,
    isAuthenticated: !!user && authService.isAuthenticated(),
    loading,
    error,
    login,
    register,
    logout,
    clearError,
  };
}
