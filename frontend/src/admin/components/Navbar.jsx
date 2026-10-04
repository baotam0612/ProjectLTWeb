import { Bell, User, Menu, LogOut } from "lucide-react";
import { authSession } from "../services/authSession";
import { useNavigate } from "react-router";
import { useState } from "react";
export function Navbar({ onMenuClick, sidebarOpen }) {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const user = authSession.getUser();
  const handleLogout = () => {
    authSession.logout();
    navigate("/login");
  };
  return <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white border-b border-gray-200 z-10">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
        <button
    aria-label="Mở menu quản trị"
    aria-controls="admin-navigation"
    aria-expanded={sidebarOpen}
    onClick={onMenuClick}
    className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
  >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex-1 max-w-xl" />

        <div className="flex items-center gap-2 lg:gap-4">
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <div className="relative">
            <button
    aria-label="Menu tài khoản"
    aria-expanded={showUserMenu}
    onClick={() => setShowUserMenu(!showUserMenu)}
    className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-4 border-l border-gray-200 hover:opacity-80 transition-opacity"
  >
              <div className="text-right hidden md:block max-w-48 break-words">
                <div className="text-sm font-medium text-gray-900 truncate" title={user?.fullName || user?.username}>
                  {user?.fullName || user?.username || "Ng\u01B0\u1EDDi d\xF9ng"}
                </div>
                <div className="text-xs text-gray-500 truncate" title={user?.email}>
                  {user?.email || "Ch\u01B0a c\xF3 email"}
                </div>
              </div>
              <div className="w-10 h-10 shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </button>

            {showUserMenu && <div className="absolute right-0 mt-2 w-48 max-w-[calc(100vw-2rem)] break-words bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.fullName || user?.username || "Ng\u01B0\u1EDDi d\xF9ng"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.email || "Ch\u01B0a c\xF3 email"}
                  </p>
                </div>
                <button
    onClick={handleLogout}
    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
  >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>}
          </div>
        </div>
      </div>
    </header>;
}
