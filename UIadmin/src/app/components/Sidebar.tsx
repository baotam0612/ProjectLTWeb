import { NavLink } from 'react-router';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Box,
  CreditCard,
  LogOut,
  X
} from 'lucide-react';
import { cn } from '../components/ui/utils';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Product Management', icon: Package, path: '/products' },
  { name: 'Category Management', icon: FolderTree, path: '/categories' },
  { name: 'Order Management', icon: ShoppingCart, path: '/orders' },
  { name: 'User Management', icon: Users, path: '/users' },
  { name: 'Material Management', icon: Box, path: '/materials' },
  { name: 'Payment Management', icon: CreditCard, path: '/payments' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-50 transition-transform duration-300",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#4F46E5] rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">AdminPanel</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                    isActive && 'bg-[#4F46E5] text-white hover:bg-[#4338CA] hover:text-white'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={cn('w-5 h-5', isActive ? 'text-white' : 'text-gray-500')} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-200">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200">
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}