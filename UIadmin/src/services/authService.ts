const API_BASE = 'http://localhost:8081/api/auth';

export interface AuthResponse {
  token: string;
  type?: string;
  id: number;
  username: string;
  fullName?: string;
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
  fullName: string;
  address: string;
  phoneNumber: string;
}

export interface AuthUser {
  id: number;
  username: string;
  fullName?: string;
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
      throw new Error(errorData.message || 'Đăng nhập thất bại');
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
      throw new Error(errorData.message || 'Đăng ký thất bại');
    }
    return response.json();
  },

  verifyEmail: async (token: string): Promise<string> => {
    const response = await fetch(`${API_BASE}/verify?token=${token}`, {
      method: 'GET',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Xác minh thất bại');
    }
    return response.text();
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },

  getToken: () => localStorage.getItem('auth_token'),
  
  getUser: (): AuthUser | null => {
    const user = localStorage.getItem('auth_user');
    if (!user) return null;
    try {
      return JSON.parse(user);
    } catch {
      localStorage.removeItem('auth_user');
      return null;
    }
  },

  setAuth: (token: string, user: AuthUser) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  },

  isAuthenticated: () => !!localStorage.getItem('auth_token'),
};
