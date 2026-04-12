import axios from 'axios';
import { Product } from '../data/mockData';

const API_URL = 'http://localhost:8081/admin/products';

// Map API response to Product interface
const mapApiProductToProduct = (apiProduct: any): Product => {
  return {
    id: apiProduct.id ? String(apiProduct.id) : `P${Math.random().toString(36).substr(2, 9)}`,
    name: apiProduct.productName || '',
    price: apiProduct.price || 0,
    category: apiProduct.categoryName || '',
    stock: apiProduct.stock || 0,
    status: apiProduct.status === 'Available' ? 'available' : 'unavailable',
    image: apiProduct.imageUrl || '',
  };
};

// Map Product interface back to API request format
const mapProductToApiRequest = (product: Partial<any>) => {
  return {
    productName: product.name || product.productName || '',
    price: product.price || 0,
    status: product.status === 'available' ? 'Available' : 'Unavailable',
    imageUrl: product.image || product.imageUrl || '',
    categoryName: product.category || product.categoryName || '',
  };
};

export const getProducts = async (): Promise<Product[]> => {
  const response = await axios.get(API_URL);
  // Response structure: { data: [...] }
  const products = Array.isArray(response.data) ? response.data : (response.data.data || []);
  return Array.isArray(products) ? products.map(mapApiProductToProduct) : [];
};

export const createProduct = async (data: any): Promise<Product> => {
  const apiData = mapProductToApiRequest(data);
  console.log('Creating product with payload:', apiData);
  try {
    const response = await axios.post(API_URL, apiData);
    console.log('Create response:', response.data);
    const productData = response.data.data || response.data;
    return mapApiProductToProduct(productData);
  } catch (error: any) {
    console.error('Create error:', error.response?.data || error.message);
    throw error;
  }
};

export const updateProduct = async (id: number | string, data: any): Promise<Product> => {
  const apiData = mapProductToApiRequest(data);
  console.log('Updating product with ID:', id);
  console.log('Request payload:', apiData);
  try {
    const response = await axios.put(`${API_URL}/${id}`, apiData);
    console.log('Update response:', response.data);
    const productData = response.data.data || response.data;
    return mapApiProductToProduct(productData);
  } catch (error: any) {
    console.error('Update error:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteProductApi = async (id: number | string) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};