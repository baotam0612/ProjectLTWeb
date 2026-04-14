// Mock data for the admin dashboard

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  status: 'available' | 'unavailable';
  image: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  productCount?: number;
  status?: 'Active' | 'Inactive';
}

export interface OrderDetail {
  quantity: number;
  price: number;
  totalAmount: number;
  productName: string;
}

export interface Order {
  id: number;
  userName: string;
  productName: string;
  price: number;
  totalAmount: number;
  orderStatus: 'Pending' | 'Completed' | 'Canceled';
  orderDate: string;
  shippingAddress?: string;
  orderDetails?: OrderDetail[];
  items: number;
  total?: number; // Alias for totalAmount for backwards compatibility
  status?: 'pending' | 'completed' | 'canceled'; // Alias for orderStatus in lowercase
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  joinDate: string;
}

export interface Material {
  id: string;
  name: string;
  quantity: number;
  supplier: string;
  unitPrice: number;
  lastUpdated: string;
  composition?: string;
  weight?: string;
  purity?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  method: 'cod';
  status: 'Success' | 'Failed';
  amount: number;
  date: string;
}

export interface RevenuePoint {
  month: string;
  revenue: number;
}

export const revenueData: RevenuePoint[] = [
  { month: 'Jan', revenue: 12000 },
  { month: 'Feb', revenue: 15000 },
  { month: 'Mar', revenue: 13800 },
  { month: 'Apr', revenue: 17200 },
  { month: 'May', revenue: 21000 },
  { month: 'Jun', revenue: 19800 },
  { month: 'Jul', revenue: 22400 },
  { month: 'Aug', revenue: 24100 },
  { month: 'Sep', revenue: 23000 },
  { month: 'Oct', revenue: 25500 },
  { month: 'Nov', revenue: 27900 },
  { month: 'Dec', revenue: 30100 },
];
