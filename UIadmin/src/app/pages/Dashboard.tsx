import { useState, useEffect } from 'react';
import { Users, ShoppingCart, DollarSign, Package } from 'lucide-react';
import { StatsCard } from '../components/StatsCard';
import { DataTable, Column } from '../components/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Order, revenueData } from '../data/mockData';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getOrders } from '../api/OrderAPI';
import { getProducts } from '../api/ProductAPI';
import { getUsers } from '../api/UserAPI';

export function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
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
        getProducts(),
      ]);
      setOrders(ordersData);
      setTotalUsers(usersData.length);
      setTotalProducts(productsData.length);
    } catch (error) {
      console.error('Không thể tải dữ liệu bảng điều khiển:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const recentOrders = orders.slice(0, 5);

  const orderColumns: Column<Order>[] = [
    { header: 'Mã đơn', accessor: 'id' },
    { header: 'Khách hàng', accessor: 'userName' },
    { header: 'Số lượng', accessor: 'items' },
    {
      header: 'Tổng tiền',
      accessor: (row) => `$${row.totalAmount.toFixed(2)}`,
    },
    {
      header: 'Trạng thái',
      accessor: (row) => {
        const status = row.orderStatus || row.status;
        return (
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              status === 'Completed' || status === 'completed'
                ? 'bg-green-100 text-green-700'
                : status === 'Pending' || status === 'pending'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {typeof status === 'string' &&
              (status.toLowerCase() === 'completed'
                ? 'Hoàn thành'
                : status.toLowerCase() === 'pending'
                ? 'Chờ xử lý'
                : 'Đã hủy')}
          </span>
        );
      },
    },
    { header: 'Ngày đặt', accessor: 'orderDate' },
  ];

  return (
    <div className="space-y-6 animate-slideIn">
      {isLoading && <LoadingSpinner />}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Bảng điều khiển</h1>
        <p className="text-gray-600 mt-1">Tổng quan hoạt động hệ thống hôm nay.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  dot={{ fill: '#4F46E5', r: 4 }}
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
    </div>
  );
}
