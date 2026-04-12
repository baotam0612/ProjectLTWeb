const API_BASE = 'http://localhost:8081/api/auth';

export interface AuthResponse {
  token: string;
  type?: string;
  id: number;
  username: string;
  email: string;
  roles: string[];
  message?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Login failed');
    }
    return response.json();
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Registration failed');
    }
    return response.json();
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },

  getToken: () => localStorage.getItem('auth_token'),
  
  getUser: (): AuthUser | null => {
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
  },

  setAuth: (token: string, user: AuthUser) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  },

  isAuthenticated: () => !!localStorage.getItem('auth_token'),
};
