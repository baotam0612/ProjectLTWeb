import { createBrowserRouter, RouterProvider } from "react-router";

const lazyPage = (importPage) => async () => {
  const module = await importPage();
  return { Component: module.default };
};

const router = createBrowserRouter([
  { path: "/", lazy: lazyPage(() => import("./pages/HomePage.jsx")) },
  { path: "/index.html", lazy: lazyPage(() => import("./pages/LoginPage.jsx")) },
  { path: "/login", lazy: lazyPage(() => import("./pages/LoginPage.jsx")) },
  { path: "/trangchu.html", lazy: lazyPage(() => import("./pages/HomePage.jsx")) },
  { path: "/sanpham.html", lazy: lazyPage(() => import("./pages/ProductsPage.jsx")) },
  { path: "/searchspbycategory.html", lazy: lazyPage(() => import("./pages/CategorySearchPage.jsx")) },
  { path: "/product-detail.html", lazy: lazyPage(() => import("./pages/ProductDetailPage.jsx")) },
  { path: "/giohang.html", lazy: lazyPage(() => import("./pages/CartPage.jsx")) },
  { path: "/register.html", lazy: lazyPage(() => import("./pages/RegisterPage.jsx")) },
  { path: "/verify.html", lazy: lazyPage(() => import("./pages/VerifyPage.jsx")) },
  { path: "/reset.html", lazy: lazyPage(() => import("./pages/ResetPage.jsx")) },
  { path: "/forgot.html", lazy: lazyPage(() => import("./pages/ForgotPage.jsx")) },
  { path: "/user.html", lazy: lazyPage(() => import("./pages/UserPage.jsx")) },
  { path: "*", lazy: lazyPage(() => import("./pages/HomePage.jsx")) },
]);

export default function HomeApp() {
  return <RouterProvider router={router} />;
}
