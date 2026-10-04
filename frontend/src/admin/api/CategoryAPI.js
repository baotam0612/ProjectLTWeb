import { getPage } from "./pagedApi";
import adminApiClient from "./adminApiClient";
const API_URL = "/admin/categorys";
const mapApiCategoryToCategory = (apiCategory, index) => {
  return {
    id: apiCategory.categoryID || apiCategory.id || `C${String(index + 1).padStart(3, "0")}`,
    name: apiCategory.categoryName || "",
    description: apiCategory.description || "",
    productCount: apiCategory.productCount || 0,
    status: apiCategory.status || "Active"
  };
};
export const getCategories = async () => {
  const response = await adminApiClient.get(API_URL);
  const categories = Array.isArray(response.data) ? response.data : response.data.data || [];
  return Array.isArray(categories) ? categories.map((cat, index) => mapApiCategoryToCategory(cat, index)) : [];
};
export const createCategory = async (data) => {
  const response = await adminApiClient.post(API_URL, data);
  const categoryData = response.data.data || response.data;
  return mapApiCategoryToCategory(categoryData, 0);
};
export const updateCategory = async (id, data) => {
  const response = await adminApiClient.put(`${API_URL}/${id}`, data);
  const categoryData = response.data.data || response.data;
  return mapApiCategoryToCategory(categoryData, 0);
};
export const updateCategoryStatus = async (id, status) => {
  const response = await adminApiClient.put(`${API_URL}/${id}/status`, { status });
  const categoryData = response.data.data || response.data;
  return mapApiCategoryToCategory(categoryData, 0);
};
export const deleteCategory = async (id) => {
  const response = await adminApiClient.delete(`${API_URL}/${id}`);
  return response.data;
};

export const getCategoriesPage = (params, signal) => getPage(API_URL, params, mapApiCategoryToCategory, signal);
