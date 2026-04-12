import axios from 'axios';
import { Order } from '../data/mockData';

const API_URL = 'http://localhost:8081/admin/orders';

// Map API response to Order interface
const mapApiOrderToOrder = (apiOrder: any, index: number): Order => {
  const orderDetails = apiOrder.orderDetails || [];
  const status = apiOrder.orderStatus || 'Pending';
  
  // Normalize status to lowercase for backwards compatibility
  const statusLower = status === 'Pending' ? 'pending' : status === 'Completed' ? 'completed' : 'canceled';
  
  // Format date
  const date = apiOrder.orderDate ? new Date(apiOrder.orderDate).toLocaleDateString('en-US') : new Date().toLocaleDateString('en-US');
  
  // Calculate total quantity from orderDetails
  const totalQuantity = orderDetails.reduce((sum: number, detail: any) => sum + (detail.quantity || 0), 0);
  
  return {
    id: apiOrder.orderId || apiOrder.orderID || apiOrder.id || (index + 1),
    userName: apiOrder.userName || 'Customer',
    productName: apiOrder.productName || (orderDetails[0]?.productName) || 'Unknown Product',
    price: parseFloat(apiOrder.price) || (orderDetails[0]?.price) || 0,
    totalAmount: parseFloat(apiOrder.totalAmount) || 0,
    orderStatus: status,
    orderDate: date,
    shippingAddress: apiOrder.shippingAddress,
    orderDetails: orderDetails,
    items: totalQuantity, // Total quantity from all order details
    total: parseFloat(apiOrder.totalAmount) || 0, // Backwards compatibility
    status: statusLower, // Backwards compatibility
  };
};

// Test API connectivity
export const testApiConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing API connection to:', API_URL);
    const response = await axios.get(API_URL, { timeout: 5000 });
    console.log('API connection successful. Response:', response.data);
    return true;
  } catch (error: any) {
    console.error('API connection failed:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
    });
    return false;
  }
};

export const getOrders = async (): Promise<Order[]> => {
  try {
    console.log('Fetching orders from:', API_URL);
    const response = await axios.get(API_URL, { timeout: 10000 });
    
    console.log('Raw API response:', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      dataType: typeof response.data,
      isArray: Array.isArray(response.data),
    });
    
    // Response structure: { data: [...], message, status } or direct array
    let orders = [];
    
    if (Array.isArray(response.data)) {
      orders = response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      orders = response.data.data;
    } else if (response.data && response.data.result && Array.isArray(response.data.result)) {
      orders = response.data.result;
    } else {
      console.warn('Unexpected response structure:', response.data);
      orders = [];
    }
    
    console.log('Extracted orders array:', {
      length: orders.length,
      firstOrder: orders[0],
    });
    
    const mappedOrders = orders.map((order: any, index: number) => {
      const mapped = mapApiOrderToOrder(order, index);
      console.log(`Mapped order ${index}:`, { original: order, mapped });
      return mapped;
    });
    
    console.log('Final mapped orders:', mappedOrders);
    return mappedOrders;
  } catch (error: any) {
    console.error('Error fetching orders:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      url: error.config?.url,
      timeout: error.code === 'ECONNABORTED',
      networkError: error.code === 'ERR_NETWORK',
    });
    throw error;
  }
};

export const createOrder = async (data: any): Promise<Order> => {
  const response = await axios.post(API_URL, data);
  const orderData = response.data.data || response.data;
  return mapApiOrderToOrder(orderData, 0);
};

export const updateOrder = async (id: number | string, data: any): Promise<Order> => {
  const response = await axios.put(`${API_URL}/${id}`, data);
  const orderData = response.data.data || response.data;
  return mapApiOrderToOrder(orderData, 0);
};

export const deleteOrder = async (id: number | string) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
