import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { ProductManagement } from './pages/ProductManagement';
import { CategoryManagement } from './pages/CategoryManagement';
import { OrderManagement } from './pages/OrderManagement';
import { UserManagement } from './pages/UserManagement';
import { MaterialManagement } from './pages/MaterialManagement';
import { PaymentManagement } from './pages/PaymentManagement';
import { NotFound } from './pages/NotFound';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { authService } from '../services/authService';

const ProtectedLayout = () => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <Layout />;
};

const TestLayout = () => {
  // For testing - allows access without auth but shows layout
  return <Layout />;
};

export const router = createBrowserRouter([
  { path: '/login', Component: Login },
  { path: '/register', Component: Register },
  {
    path: '/',
    Component: TestLayout,
    errorElement: <NotFound />,
    children: [
      { index: true, Component: Dashboard },
      { path: 'products', Component: ProductManagement },
      { path: 'categories', Component: CategoryManagement },
      { path: 'orders', Component: OrderManagement },
      { path: 'users', Component: UserManagement },
      { path: 'materials', Component: MaterialManagement },
      { path: 'payments', Component: PaymentManagement },
      { path: '*', Component: NotFound },
    ],
  },
]);