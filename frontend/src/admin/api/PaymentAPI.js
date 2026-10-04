import { getPage } from "./pagedApi";
import adminApiClient from "./adminApiClient";
const API_URL = "/admin/payments";
const mapApiPaymentToPayment = (apiPayment, index) => {
  const methodMap = {
    "Thanh to\xE1n khi nh\u1EADn h\xE0ng": "cod"
  };
  return {
    id: apiPayment.paymentID || apiPayment.id || `PAY${String(index + 1).padStart(3, "0")}`,
    orderId: apiPayment.orderID || apiPayment.orderId || `ORD${String(index + 1).padStart(5, "0")}`,
    amount: apiPayment.amount || apiPayment.totalAmount || 0,
    method: apiPayment.paymentMethod ? methodMap[apiPayment.paymentMethod] || "cod" : methodMap[apiPayment.method] || "cod",
    status: apiPayment.paymentStatus === "Success" ? "Success" : apiPayment.paymentStatus === "Failed" ? "Failed" : "Failed",
    date: apiPayment.paymentDate || apiPayment.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
  };
};
export const getPayments = async () => {
  try {
    const response = await adminApiClient.get(API_URL);
    const payments = Array.isArray(response.data) ? response.data : response.data.data || [];
    return Array.isArray(payments) ? payments.map((payment, index) => mapApiPaymentToPayment(payment, index)) : [];
  } catch (error) {
    console.error("Error fetching payments:", error);
    return [];
  }
};
export const createPayment = async (data) => {
  const response = await adminApiClient.post(API_URL, data);
  const paymentData = response.data.data || response.data;
  return mapApiPaymentToPayment(paymentData, 0);
};
export const updatePayment = async (id, data) => {
  const response = await adminApiClient.put(`${API_URL}/${id}`, data);
  const paymentData = response.data.data || response.data;
  return mapApiPaymentToPayment(paymentData, 0);
};
export const deletePayment = async (id) => {
  const response = await adminApiClient.delete(`${API_URL}/${id}`);
  return response.data;
};
export const updatePaymentStatusAPI = async (id, status) => {
  const response = await adminApiClient.put(`${API_URL}/${id}/status`, null, {
    params: { status }
  });
  const paymentData = response.data.data || response.data;
  return mapApiPaymentToPayment(paymentData, 0);
};

export const getPaymentsPage = (params, signal) => getPage(API_URL, params, mapApiPaymentToPayment, signal);
