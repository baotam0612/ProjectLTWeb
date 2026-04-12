import axios from 'axios';
import { Payment } from '../data/mockData';

const API_URL = 'http://localhost:8081/admin/payments';

// Map API response to Payment interface
const mapApiPaymentToPayment = (apiPayment: any, index: number): Payment => {
  const methodMap: { [key: string]: 'credit_card' | 'paypal' | 'bank_transfer' } = {
    'CREDIT_CARD': 'credit_card',
    'PAYPAL': 'paypal',
    'BANK_TRANSFER': 'bank_transfer',
  };
  
  return {
    id: apiPayment.paymentID || apiPayment.id || `PAY${String(index + 1).padStart(3, '0')}`,
    orderId: apiPayment.orderID || apiPayment.orderId || `ORD${String(index + 1).padStart(5, '0')}`,
    amount: apiPayment.amount || apiPayment.totalAmount || 0,
    method: apiPayment.paymentMethod ? (methodMap[apiPayment.paymentMethod] || 'credit_card') : (methodMap[apiPayment.method] || 'credit_card'),
    status: apiPayment.paymentStatus === 'COMPLETED' ? 'completed' : apiPayment.paymentStatus === 'PENDING' ? 'pending' : apiPayment.status ? apiPayment.status : 'pending',
    date: apiPayment.paymentDate || apiPayment.date || new Date().toISOString().split('T')[0],
  };
};

export const getPayments = async (): Promise<Payment[]> => {
  try {
    const response = await axios.get(API_URL);
    // Response structure: { data: [...], message, status }
    const payments = Array.isArray(response.data) ? response.data : (response.data.data || []);
    return Array.isArray(payments)
      ? payments.map((payment: any, index: number) => mapApiPaymentToPayment(payment, index))
      : [];
  } catch (error) {
    console.error('Error fetching payments:', error);
    return [];
  }
};

export const createPayment = async (data: any): Promise<Payment> => {
  const response = await axios.post(API_URL, data);
  const paymentData = response.data.data || response.data;
  return mapApiPaymentToPayment(paymentData, 0);
};

export const updatePayment = async (id: number | string, data: any): Promise<Payment> => {
  const response = await axios.put(`${API_URL}/${id}`, data);
  const paymentData = response.data.data || response.data;
  return mapApiPaymentToPayment(paymentData, 0);
};

export const deletePayment = async (id: number | string) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
