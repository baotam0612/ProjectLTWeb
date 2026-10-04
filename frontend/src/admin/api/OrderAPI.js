import { getPage } from "./pagedApi";
import adminApiClient from "./adminApiClient";
const API_URL = "/admin/orders";
const mapApiOrderToOrder = (apiOrder, index) => {
  const orderDetails = apiOrder.orderDetails || [];
  const status = apiOrder.orderStatus || "Pending";
  const normalized = status.toLowerCase();
  const statusLower = normalized === "completed" ? "completed" : ["canceled", "cancelled"].includes(normalized) ? "canceled" : "pending";
  const date = apiOrder.orderDate ? new Date(apiOrder.orderDate).toLocaleDateString("en-US") : (/* @__PURE__ */ new Date()).toLocaleDateString("en-US");
  const totalQuantity = orderDetails.reduce((sum, detail) => sum + (detail.quantity || 0), 0);
  return {
    id: apiOrder.orderId || apiOrder.orderID || apiOrder.id || index + 1,
    userName: apiOrder.userName || apiOrder.customerName || apiOrder.fullName || apiOrder.accountName || "Kh\xE1ch h\xE0ng",
    productName: apiOrder.productName || orderDetails[0]?.productName || "S\u1EA3n ph\u1EA9m kh\xF4ng x\xE1c \u0111\u1ECBnh",
    price: parseFloat(apiOrder.price) || orderDetails[0]?.price || 0,
    totalAmount: parseFloat(apiOrder.totalAmount) || 0,
    orderStatus: status,
    orderDate: date,
    shippingAddress: apiOrder.shippingAddress,
    orderDetails,
    items: totalQuantity,
    // Total quantity from all order details
    total: parseFloat(apiOrder.totalAmount) || 0,
    // Backwards compatibility
    status: statusLower
    // Backwards compatibility
  };
};
export const testApiConnection = async () => {
  try {
    console.log("Testing API connection to:", API_URL);
    const response = await adminApiClient.get(API_URL, { timeout: 5e3 });
    console.log("API connection successful. Response:", response.data);
    return true;
  } catch (error) {
    console.error("API connection failed:", {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url
    });
    return false;
  }
};
export const getOrders = async () => {
  try {
    console.log("Fetching orders from:", API_URL);
    const response = await adminApiClient.get(API_URL, { timeout: 1e4 });
    console.log("Raw API response:", {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      dataType: typeof response.data,
      isArray: Array.isArray(response.data)
    });
    let orders = [];
    if (Array.isArray(response.data)) {
      orders = response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      orders = response.data.data;
    } else if (response.data && response.data.result && Array.isArray(response.data.result)) {
      orders = response.data.result;
    } else {
      console.warn("Unexpected response structure:", response.data);
      orders = [];
    }
    console.log("Extracted orders array:", {
      length: orders.length,
      firstOrder: orders[0]
    });
    const mappedOrders = orders.map((order, index) => {
      const mapped = mapApiOrderToOrder(order, index);
      console.log(`Mapped order ${index}:`, { original: order, mapped });
      return mapped;
    });
    console.log("Final mapped orders:", mappedOrders);
    return mappedOrders;
  } catch (error) {
    console.error("Error fetching orders:", {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      url: error.config?.url,
      timeout: error.code === "ECONNABORTED",
      networkError: error.code === "ERR_NETWORK"
    });
    throw error;
  }
};
export const createOrder = async (data) => {
  const response = await adminApiClient.post(API_URL, data);
  const orderData = response.data.data || response.data;
  return mapApiOrderToOrder(orderData, 0);
};
export const updateOrder = async (id, data) => {
  const response = await adminApiClient.put(`${API_URL}/${id}`, data);
  const orderData = response.data.data || response.data;
  return mapApiOrderToOrder(orderData, 0);
};
export const deleteOrder = async (id) => {
  const response = await adminApiClient.delete(`${API_URL}/${id}`);
  return response.data;
};

export const getOrdersPage = (params, signal) => getPage(API_URL, params, mapApiOrderToOrder, signal);
