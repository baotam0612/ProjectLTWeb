import { createBrowserRouter, Navigate } from "react-router";
import { authSession } from "./services/authSession";
import { Layout } from "./components/Layout";
import { NotFound } from "./pages/NotFound";

const lazyPage = (importPage, exportName = "default") => async () => {
  const module = await importPage();
  return { Component: module[exportName] ?? module.default };
};

const ProtectedLayout = () => {
  if (!authSession.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (!authSession.getUser()?.roles?.includes("ROLE_ADMIN")) {
    return <Navigate to="/login" replace state={{ message: "Administrator access is required." }} />;
  }
  return <Layout />;
};

export const router = createBrowserRouter([
  { path: "/login", lazy: lazyPage(() => import("./pages/Login.jsx"), "Login") },
  { path: "/register", lazy: lazyPage(() => import("./pages/Register.jsx"), "Register") },
  { path: "/verify-email", lazy: lazyPage(() => import("./pages/VerifyEmail.jsx"), "VerifyEmail") },
  {
    path: "/",
    Component: ProtectedLayout,
    errorElement: <NotFound />,
    children: [
      { index: true, lazy: lazyPage(() => import("./pages/Dashboard.jsx"), "Dashboard") },
      { path: "products", lazy: lazyPage(() => import("./pages/ProductManagement.jsx"), "ProductManagement") },
      { path: "categories", lazy: lazyPage(() => import("./pages/CategoryManagement.jsx"), "CategoryManagement") },
      { path: "orders", lazy: lazyPage(() => import("./pages/OrderManagement.jsx"), "OrderManagement") },
      { path: "users", lazy: lazyPage(() => import("./pages/UserManagement.jsx"), "UserManagement") },
      { path: "materials", lazy: lazyPage(() => import("./pages/MaterialManagement.jsx"), "MaterialManagement") },
      { path: "payments", lazy: lazyPage(() => import("./pages/PaymentManagement.jsx"), "PaymentManagement") },
      { path: "*", Component: NotFound },
    ],
  },
], { basename: "/admin" });
