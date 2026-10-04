import { getPage } from "./pagedApi";
import adminApiClient from "./adminApiClient";
const API_URL = "/admin/products";
const mapApiProductToProduct = (apiProduct) => {
  return {
    id: apiProduct.id ? String(apiProduct.id) : `P${Math.random().toString(36).substr(2, 9)}`,
    name: apiProduct.productName || "",
    price: apiProduct.price || 0,
    category: apiProduct.categoryName || "",
    quantity: apiProduct.quantity ?? 0,
    status: apiProduct.status === "Available" ? "available" : "unavailable",
    image: apiProduct.imageUrl || ""
  };
};
const mapProductToApiRequest = (product) => {
  return {
    productName: product.name || product.productName || "",
    price: product.price || 0,
    quantity: Number(product.quantity ?? 0),
    status: product.status === "available" ? "Available" : "Unavailable",
    imageUrl: product.image || product.imageUrl || "",
    categoryName: product.category || product.categoryName || ""
  };
};
export const getProducts = async () => {
  const response = await adminApiClient.get(API_URL);
  const products = Array.isArray(response.data) ? response.data : response.data.data || [];
  return Array.isArray(products) ? products.map(mapApiProductToProduct) : [];
};
export const createProduct = async (data) => {
  const apiData = mapProductToApiRequest(data);
  console.log("Creating product with payload:", apiData);
  try {
    const response = await adminApiClient.post(API_URL, apiData);
    console.log("Create response:", response.data);
    const productData = response.data.data || response.data;
    return mapApiProductToProduct(productData);
  } catch (error) {
    console.error("Create error:", error.response?.data || error.message);
    throw error;
  }
};
export const updateProduct = async (id, data) => {
  const apiData = mapProductToApiRequest(data);
  console.log("Updating product with ID:", id);
  console.log("Request payload:", apiData);
  try {
    const response = await adminApiClient.put(`${API_URL}/${id}`, apiData);
    console.log("Update response:", response.data);
    const productData = response.data.data || response.data;
    return mapApiProductToProduct(productData);
  } catch (error) {
    console.error("Update error:", error.response?.data || error.message);
    throw error;
  }
};
export const deleteProductApi = async (id) => {
  const response = await adminApiClient.delete(`${API_URL}/${id}`);
  return response.data;
};

export const getProductsPage = (params, signal) => getPage(API_URL, params, mapApiProductToProduct, signal);
