import axios from 'axios';

export interface AdminUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  address: string;
  phoneNumber: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  enabled: boolean;
  roles: string[];
  joinDate: string;
}

const API_URL = 'http://localhost:8081/api/admin/users';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const mapApiUserToUser = (apiUser: any, index: number): AdminUser => {
  const roles: string[] = Array.isArray(apiUser.roles) ? apiUser.roles : [];
  const isAdmin = roles.includes('ROLE_ADMIN');
  const enabled = Boolean(apiUser.enabled);

  return {
    id: String(apiUser.id ?? `U${String(index + 1).padStart(3, '0')}`),
    username: apiUser.username || '',
    fullName: apiUser.fullName || '',
    email: apiUser.email || '',
    address: apiUser.address || '',
    phoneNumber: apiUser.phoneNumber || '',
    role: isAdmin ? 'admin' : 'user',
    status: enabled ? 'active' : 'inactive',
    enabled,
    roles,
    joinDate: apiUser.createdAt ? new Date(apiUser.createdAt).toLocaleDateString('vi-VN') : '',
  };
};

const mapUserToApiPayload = (data: any) => {
  const payload: Record<string, any> = {
    username: data.username,
    fullName: data.fullName,
    email: data.email,
    address: data.address,
    phoneNumber: data.phoneNumber,
    role: data.role === 'admin' ? 'ROLE_ADMIN' : 'ROLE_USER',
    enabled: data.status ? data.status === 'active' : Boolean(data.enabled),
  };

  if (data.password && String(data.password).trim().length > 0) {
    payload.password = data.password;
  }

  return payload;
};

export const getUsers = async (): Promise<AdminUser[]> => {
  const response = await axios.get(API_URL, { headers: getAuthHeaders() });
  const users = Array.isArray(response.data) ? response.data : response.data.data || [];
  return Array.isArray(users)
    ? users.map((user: any, index: number) => mapApiUserToUser(user, index))
    : [];
};

export const createUser = async (data: any): Promise<AdminUser> => {
  const response = await axios.post(API_URL, mapUserToApiPayload(data), {
    headers: getAuthHeaders(),
  });
  const userData = response.data.user || response.data.data || response.data;
  return mapApiUserToUser(userData, 0);
};

export const updateUser = async (id: number | string, data: any): Promise<AdminUser> => {
  const response = await axios.put(`${API_URL}/${id}`, mapUserToApiPayload(data), {
    headers: getAuthHeaders(),
  });
  const userData = response.data.user || response.data.data || response.data;
  return mapApiUserToUser(userData, 0);
};

export const deleteUser = async (id: number | string) => {
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};
