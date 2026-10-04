import { useCallback, useState } from "react";
import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { Toaster } from "./ui/sonner";
export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  return <div className="min-h-screen bg-[#F9FAFB]">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <div className="min-w-0 lg:ml-64">
        <Navbar sidebarOpen={sidebarOpen} onMenuClick={() => setSidebarOpen(true)} />
        <main className="admin-content min-w-0 pt-16">
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
      <Toaster position="top-right" />
    </div>;
}
