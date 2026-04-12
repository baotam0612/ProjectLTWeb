import axios from 'axios';
import { Category } from '../data/mockData';

const API_URL = 'http://localhost:8081/admin/categorys';

// Map API response to Category interface
const mapApiCategoryToCategory = (apiCategory: any, index: number): Category => {
  return {
    id: apiCategory.categoryID || apiCategory.id || `C${String(index + 1).padStart(3, '0')}`,
    name: apiCategory.categoryName || '',
    description: apiCategory.description || '',
    productCount: apiCategory.productCount || 0,
    status: apiCategory.status || 'Active',
  };
};

export const getCategories = async (): Promise<Category[]> => {
  const response = await axios.get(API_URL);
  // Response structure: { data: [...], message, status }
  const categories = Array.isArray(response.data) ? response.data : (response.data.data || []);
  return Array.isArray(categories) 
    ? categories.map((cat: any, index: number) => mapApiCategoryToCategory(cat, index))
    : [];
};

export const createCategory = async (data: any): Promise<Category> => {
  const response = await axios.post(API_URL, data);
  const categoryData = response.data.data || response.data;
  return mapApiCategoryToCategory(categoryData, 0);
};

export const updateCategory = async (id: number | string, data: any): Promise<Category> => {
  const response = await axios.put(`${API_URL}/${id}`, data);
  const categoryData = response.data.data || response.data;
  return mapApiCategoryToCategory(categoryData, 0);
};

export const updateCategoryStatus = async (id: number | string, status: string): Promise<Category> => {
  const response = await axios.put(`${API_URL}/${id}/status`, { status });
  const categoryData = response.data.data || response.data;
  return mapApiCategoryToCategory(categoryData, 0);
};

export const deleteCategory = async (id: number | string) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
