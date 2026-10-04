import { createRoot } from "react-dom/client";

const root = createRoot(document.getElementById("root"));
const isAdminRoute = /^\/admin(?:\/|$)/i.test(window.location.pathname);

function loadStylesheet(href) {
  return new Promise((resolve) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.onload = resolve;
    link.onerror = resolve;
    document.head.appendChild(link);
  });
}

async function mountApp() {
  if (isAdminRoute) {
    document.title = "SHYNE | Quản trị";
    const [{ default: App }] = await Promise.all([
      import("./admin/App.jsx"),
      import("./admin/styles/index.css"),
    ]);
    root.render(<App />);
    return;
  }

  await Promise.all([
    loadStylesheet("https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css"),
    loadStylesheet("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css"),
    loadStylesheet("https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css"),
  ]);

  const [{ default: App }] = await Promise.all([
    import("./home/App.jsx"),
    import("./home/styles/base.css"),
    import("./home/styles/sanpham.css"),
    import("./home/styles/giohang.css"),
    import("./home/styles/product-detail.css"),
    import("./home/styles/trangchu.css"),
    import("./home/styles/style.css"),
  ]);
  await import("./home/styles/responsive.css");
  root.render(<App />);
}

mountApp();
