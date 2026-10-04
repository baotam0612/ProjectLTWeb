import { useState, useEffect } from "react";
import { Users, ShoppingCart, DollarSign, Package } from "lucide-react";
import { StatsCard } from "../components/StatsCard";
import { DataTable } from "../components/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { revenueData } from "../data/mockData";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { getOrders } from "../api/OrderAPI";
import { getProducts } from "../api/ProductAPI";
import { getUsers } from "../api/UserAPI";
export function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    fetchDashboardData();
  }, []);
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [ordersData, usersData, productsData] = await Promise.all([
        getOrders(),
        getUsers(),
        getProducts()
      ]);
      setOrders(ordersData);
      setTotalUsers(usersData.length);
      setTotalProducts(productsData.length);
    } catch (error) {
      console.error("Kh\xF4ng th\u1EC3 t\u1EA3i d\u1EEF li\u1EC7u b\u1EA3ng \u0111i\u1EC1u khi\u1EC3n:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const recentOrders = orders.slice(0, 5);
  const orderColumns = [
    { header: "M\xE3 \u0111\u01A1n", accessor: "id" },
    { header: "Kh\xE1ch h\xE0ng", accessor: "userName" },
    { header: "S\u1ED1 l\u01B0\u1EE3ng", accessor: "items" },
    {
      header: "T\u1ED5ng ti\u1EC1n",
      accessor: (row) => `$${row.totalAmount.toFixed(2)}`
    },
    {
      header: "Tr\u1EA1ng th\xE1i",
      accessor: (row) => {
        const status = row.orderStatus || row.status;
        return <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${status === "Completed" || status === "completed" ? "bg-green-100 text-green-700" : status === "Pending" || status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}
        >
            {typeof status === "string" && (status.toLowerCase() === "completed" ? "Ho\xE0n th\xE0nh" : status.toLowerCase() === "pending" ? "Ch\u1EDD x\u1EED l\xFD" : "\u0110\xE3 h\u1EE7y")}
          </span>;
      }
    },
    { header: "Ng\xE0y \u0111\u1EB7t", accessor: "orderDate" }
  ];
  return <div className="space-y-6 animate-slideIn">
      {isLoading && <LoadingSpinner />}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Bảng điều khiển</h1>
        <p className="text-gray-600 mt-1">Tổng quan hoạt động hệ thống hôm nay.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatsCard
    title="Tổng người dùng"
    value={totalUsers.toString()}
    icon={Users}
    trend={{ value: 12.5, isPositive: true }}
    iconColor="text-blue-600"
    iconBgColor="bg-blue-50"
  />
        <StatsCard
    title="Tổng đơn hàng"
    value={orders.length.toString()}
    icon={ShoppingCart}
    trend={{ value: 8.3, isPositive: true }}
    iconColor="text-green-600"
    iconBgColor="bg-green-50"
  />
        <StatsCard
    title="Doanh thu"
    value={`$${orders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(0)}`}
    icon={DollarSign}
    trend={{ value: 15.7, isPositive: true }}
    iconColor="text-purple-600"
    iconBgColor="bg-purple-50"
  />
        <StatsCard
    title="Sản phẩm"
    value={totalProducts.toString()}
    icon={Package}
    trend={{ value: 3.2, isPositive: false }}
    iconColor="text-orange-600"
    iconBgColor="bg-orange-50"
  />
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Tổng quan doanh thu</CardTitle>
          <p className="text-sm text-gray-600 mt-1">Doanh thu theo tháng trong năm qua</p>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
    contentStyle={{
      backgroundColor: "white",
      border: "1px solid #E5E7EB",
      borderRadius: "8px"
    }}
  />
                <Line
    type="monotone"
    dataKey="revenue"
    stroke="#4F46E5"
    strokeWidth={2}
    dot={{ fill: "#4F46E5", r: 4 }}
    activeDot={{ r: 6 }}
  />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Đơn hàng gần đây</CardTitle>
          <p className="text-sm text-gray-600 mt-1">Những đơn hàng mới nhất trong cửa hàng</p>
        </CardHeader>
        <CardContent>
          <DataTable columns={orderColumns} data={recentOrders} />
        </CardContent>
      </Card>
    </div>;
}
