import { useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router";
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
} from "lucide-react";
import { cn } from "../components/ui/utils";
import { authSession } from "../services/authSession";
const menuItems = [
  { name: "B\u1EA3ng \u0111i\u1EC1u khi\u1EC3n", icon: LayoutDashboard, path: "/" },
  { name: "Qu\u1EA3n l\xFD s\u1EA3n ph\u1EA9m", icon: Package, path: "/products" },
  { name: "Qu\u1EA3n l\xFD danh m\u1EE5c", icon: FolderTree, path: "/categories" },
  { name: "Qu\u1EA3n l\xFD \u0111\u01A1n h\xE0ng", icon: ShoppingCart, path: "/orders" },
  { name: "Quản lý tài khoản", icon: Users, path: "/users" },
  { name: "Qu\u1EA3n l\xFD v\u1EADt li\u1EC7u", icon: Box, path: "/materials" },
  { name: "Qu\u1EA3n l\xFD thanh to\xE1n", icon: CreditCard, path: "/payments" }
];
export function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sidebarRef.current?.querySelector('button')?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const items = [...sidebarRef.current.querySelectorAll('a, button')].filter(item => item.getClientRects().length);
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    const desktop = window.matchMedia('(min-width: 1024px)');
    const handleResize = () => { if (desktop.matches) onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    desktop.addEventListener('change', handleResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      desktop.removeEventListener('change', handleResize);
      previousFocus?.focus();
    };
  }, [isOpen, onClose]);
  const handleLogout = () => {
    authSession.logout();
    navigate("/login");
  };
  return <>
      {isOpen && <div
    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
    onClick={onClose}
  />}

      <aside
    id="admin-navigation"
    ref={sidebarRef}
    aria-label="Điều hướng quản trị"
    data-open={isOpen}
    className={cn(
      "admin-sidebar fixed left-0 top-0 h-dvh w-64 max-w-[calc(100vw-2rem)] bg-white border-r border-gray-200 flex flex-col z-50 transition-transform duration-300",
      "lg:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )}
  >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#4F46E5] rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">Quản trị</span>
          </div>
          <button onClick={onClose} aria-label="Đóng menu" className="lg:hidden p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item) => <NavLink
    key={item.path}
    to={item.path}
    onClick={onClose}
    className={({ isActive }) => cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
      "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
      isActive && "bg-[#4F46E5] text-white hover:bg-[#4338CA] hover:text-white"
    )}
  >
                {({ isActive }) => <>
                    <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-gray-500")} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </>}
              </NavLink>)}
          </div>
        </nav>

        <div className="p-3 border-t border-gray-200">
          <button
    onClick={handleLogout}
    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
  >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>;
}
