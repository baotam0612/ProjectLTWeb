import axios from 'axios';
import { User } from '../data/mockData';

const API_URL = 'http://localhost:8081/admin/users';

// Map API response to User interface
const mapApiUserToUser = (apiUser: any, index: number): User => {
  return {
    id: apiUser.id || `U${String(index + 1).padStart(3, '0')}`,
    name: apiUser.username || apiUser.name || '',
    email: apiUser.email || '',
    role: apiUser.role === 'admin' ? 'admin' : 'user',
    status: apiUser.status === 'ACTIVE' ? 'active' : 'inactive',
    joinDate: apiUser.createdAt || apiUser.joinDate || new Date().toISOString().split('T')[0],
  };
};

export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await axios.get(API_URL);
    // Response structure: { data: [...], message, status }
    const users = Array.isArray(response.data) ? response.data : (response.data.data || []);
    return Array.isArray(users)
      ? users.map((user: any, index: number) => mapApiUserToUser(user, index))
      : [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const createUser = async (data: any): Promise<User> => {
  const response = await axios.post(API_URL, data);
  const userData = response.data.data || response.data;
  return mapApiUserToUser(userData, 0);
};

export const updateUser = async (id: number | string, data: any): Promise<User> => {
  const response = await axios.put(`${API_URL}/${id}`, data);
  const userData = response.data.data || response.data;
  return mapApiUserToUser(userData, 0);
};

export const deleteUser = async (id: number | string) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
