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
  method: 'credit_card' | 'paypal' | 'bank_transfer';
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  date: string;
}

export const products: Product[] = [
  { id: 'P001', name: 'Wireless Headphones', price: 99.99, category: 'Electronics', stock: 45, status: 'active', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop' },
  { id: 'P002', name: 'Smart Watch', price: 199.99, category: 'Electronics', stock: 23, status: 'active', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop' },
  { id: 'P003', name: 'Laptop Stand', price: 49.99, category: 'Accessories', stock: 67, status: 'active', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop' },
  { id: 'P004', name: 'USB-C Hub', price: 34.99, category: 'Accessories', stock: 120, status: 'active', image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=400&fit=crop' },
  { id: 'P005', name: 'Mechanical Keyboard', price: 129.99, category: 'Electronics', stock: 8, status: 'active', image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=400&h=400&fit=crop' },
  { id: 'P006', name: 'Ergonomic Mouse', price: 39.99, category: 'Accessories', stock: 0, status: 'inactive', image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop' },
  { id: 'P007', name: 'Webcam HD', price: 79.99, category: 'Electronics', stock: 34, status: 'active', image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=400&fit=crop' },
  { id: 'P008', name: 'Phone Case', price: 14.99, category: 'Accessories', stock: 200, status: 'active', image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop' },
];

export const categories: Category[] = [
  { id: 'C001', name: 'Electronics', description: 'Electronic devices and gadgets', productCount: 45 },
  { id: 'C002', name: 'Accessories', description: 'Tech accessories and peripherals', productCount: 67 },
  { id: 'C003', name: 'Furniture', description: 'Office and home furniture', productCount: 23 },
  { id: 'C004', name: 'Clothing', description: 'Apparel and fashion items', productCount: 89 },
  { id: 'C005', name: 'Books', description: 'Books and publications', productCount: 134 },
];

export const orders: Order[] = [
  { id: 'ORD001', userId: 'U001', userName: 'John Doe', total: 299.97, status: 'completed', date: '2026-04-09', items: 3 },
  { id: 'ORD002', userId: 'U002', userName: 'Jane Smith', total: 99.99, status: 'pending', date: '2026-04-09', items: 1 },
  { id: 'ORD003', userId: 'U003', userName: 'Mike Johnson', total: 449.95, status: 'completed', date: '2026-04-08', items: 4 },
  { id: 'ORD004', userId: 'U004', userName: 'Sarah Williams', total: 129.99, status: 'canceled', date: '2026-04-08', items: 1 },
  { id: 'ORD005', userId: 'U005', userName: 'Tom Brown', total: 199.98, status: 'pending', date: '2026-04-07', items: 2 },
  { id: 'ORD006', userId: 'U001', userName: 'John Doe', total: 79.99, status: 'completed', date: '2026-04-07', items: 1 },
  { id: 'ORD007', userId: 'U006', userName: 'Lisa Davis', total: 349.96, status: 'pending', date: '2026-04-06', items: 3 },
  { id: 'ORD008', userId: 'U007', userName: 'Chris Wilson', total: 54.98, status: 'completed', date: '2026-04-06', items: 2 },
];

export const users: User[] = [
  { id: 'U001', name: 'John Doe', email: 'john.doe@example.com', role: 'admin', status: 'active', joinDate: '2025-01-15' },
  { id: 'U002', name: 'Jane Smith', email: 'jane.smith@example.com', role: 'user', status: 'active', joinDate: '2025-02-20' },
  { id: 'U003', name: 'Mike Johnson', email: 'mike.j@example.com', role: 'user', status: 'active', joinDate: '2025-03-10' },
  { id: 'U004', name: 'Sarah Williams', email: 'sarah.w@example.com', role: 'user', status: 'inactive', joinDate: '2025-04-05' },
  { id: 'U005', name: 'Tom Brown', email: 'tom.brown@example.com', role: 'user', status: 'active', joinDate: '2025-05-12' },
  { id: 'U006', name: 'Lisa Davis', email: 'lisa.d@example.com', role: 'admin', status: 'active', joinDate: '2025-06-18' },
  { id: 'U007', name: 'Chris Wilson', email: 'chris.w@example.com', role: 'user', status: 'active', joinDate: '2025-07-22' },
];

export const materials: Material[] = [
  { id: 'M001', name: 'Aluminum Sheet', quantity: 500, supplier: 'MetalCorp Inc.', unitPrice: 12.50, lastUpdated: '2026-04-05' },
  { id: 'M002', name: 'Plastic Resin', quantity: 1200, supplier: 'PolySupply Co.', unitPrice: 3.75, lastUpdated: '2026-04-06' },
  { id: 'M003', name: 'Steel Bars', quantity: 300, supplier: 'SteelWorks Ltd.', unitPrice: 25.00, lastUpdated: '2026-04-04' },
  { id: 'M004', name: 'Copper Wire', quantity: 800, supplier: 'ElectroParts', unitPrice: 8.99, lastUpdated: '2026-04-07' },
  { id: 'M005', name: 'Glass Sheets', quantity: 150, supplier: 'ClearView Glass', unitPrice: 45.00, lastUpdated: '2026-04-03' },
  { id: 'M006', name: 'Rubber Padding', quantity: 600, supplier: 'FlexMaterials', unitPrice: 6.50, lastUpdated: '2026-04-08' },
];

export const payments: Payment[] = [
  { id: 'PAY001', orderId: 'ORD001', method: 'credit_card', status: 'completed', amount: 299.97, date: '2026-04-09' },
  { id: 'PAY002', orderId: 'ORD002', method: 'paypal', status: 'pending', amount: 99.99, date: '2026-04-09' },
  { id: 'PAY003', orderId: 'ORD003', method: 'credit_card', status: 'completed', amount: 449.95, date: '2026-04-08' },
  { id: 'PAY004', orderId: 'ORD004', method: 'bank_transfer', status: 'failed', amount: 129.99, date: '2026-04-08' },
  { id: 'PAY005', orderId: 'ORD005', method: 'credit_card', status: 'pending', amount: 199.98, date: '2026-04-07' },
  { id: 'PAY006', orderId: 'ORD006', method: 'paypal', status: 'completed', amount: 79.99, date: '2026-04-07' },
  { id: 'PAY007', orderId: 'ORD007', method: 'credit_card', status: 'pending', amount: 349.96, date: '2026-04-06' },
  { id: 'PAY008', orderId: 'ORD008', method: 'credit_card', status: 'completed', amount: 54.98, date: '2026-04-06' },
];

// Revenue data for chart
export const revenueData = [
  { month: 'Jan', revenue: 4500 },
  { month: 'Feb', revenue: 5200 },
  { month: 'Mar', revenue: 4800 },
  { month: 'Apr', revenue: 6100 },
  { month: 'May', revenue: 7200 },
  { month: 'Jun', revenue: 6800 },
  { month: 'Jul', revenue: 8500 },
  { month: 'Aug', revenue: 9200 },
  { month: 'Sep', revenue: 8800 },
  { month: 'Oct', revenue: 10500 },
  { month: 'Nov', revenue: 11200 },
  { month: 'Dec', revenue: 12800 },
];
