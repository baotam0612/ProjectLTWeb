import { useState, useEffect } from 'react';
import { Eye, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import { DataTable, Column } from '../components/DataTable';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Order } from '../data/mockData';
import { getOrders, testApiConnection, updateOrder } from '../api/OrderAPI';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

const getStatusLabel = (status: string) => {
  if (status === 'Completed') return 'Hoàn thành';
  if (status === 'Canceled') return 'Đã hủy';
  return 'Chờ xử lý';
};

const normalizeStatus = (status?: string) => {
  if (!status) return 'Pending';
  const s = status.toLowerCase();
  if (s === 'completed') return 'Completed';
  if (s === 'canceled' || s === 'cancelled') return 'Canceled';
  return 'Pending';
};

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const connected = await testApiConnection();
      setApiConnected(connected);

      if (!connected) {
        throw new Error('Backend API không phản hồi. Hãy kiểm tra Spring Boot đang chạy cổng 8081.');
      }

      const data = await getOrders();
      setOrders(data);

      if (data.length === 0) {
        toast.info('Không có đơn hàng trong cơ sở dữ liệu');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Không thể tải danh sách đơn hàng';
      console.error('Lỗi tải đơn hàng:', err);
      setError(errorMessage);
      setOrders([]);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filterStatus === 'all') return true;
    return (
      order.status === filterStatus ||
      (filterStatus === 'pending' && order.orderStatus === 'Pending') ||
      (filterStatus === 'completed' && order.orderStatus === 'Completed') ||
      (filterStatus === 'canceled' && order.orderStatus === 'Canceled')
    );
  });

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailModalOpen(true);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedOrder) return;
    try {
      setIsUpdating(true);
      await updateOrder(selectedOrder.id, {
        orderStatus: newStatus,
      });
      toast.success('Cập nhật đơn hàng thành công');

      setSelectedOrder({
        ...selectedOrder,
        orderStatus: newStatus as 'Pending' | 'Completed' | 'Canceled',
        status: newStatus.toLowerCase() as 'pending' | 'completed' | 'canceled',
      });

      fetchOrders();
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái đơn hàng:', err);
      toast.error('Không thể cập nhật trạng thái đơn hàng');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateRowStatus = async (order: Order, newStatus: string) => {
    try {
      setIsUpdating(true);
      await updateOrder(order.id, {
        orderStatus: newStatus,
      });
      toast.success(`Đã cập nhật trạng thái đơn #${order.id}`);

      if (selectedOrder && selectedOrder.id === order.id) {
        setSelectedOrder({
          ...selectedOrder,
          orderStatus: newStatus as 'Pending' | 'Completed' | 'Canceled',
          status: newStatus.toLowerCase() as 'pending' | 'completed' | 'canceled',
        });
      }

      fetchOrders();
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái đơn hàng:', err);
      toast.error('Không thể cập nhật trạng thái đơn hàng');
    } finally {
      setIsUpdating(false);
    }
  };

  const orderColumns: Column<Order>[] = [
    { header: 'Mã đơn', accessor: 'id' },
    { header: 'Khách hàng', accessor: 'userName' },
    { header: 'Sản phẩm', accessor: 'productName' },
    {
      header: 'Đơn giá',
      accessor: (row) => `$${row.price.toFixed(2)}`,
    },
    {
      header: 'Tổng tiền',
      accessor: (row) => `$${row.totalAmount.toFixed(2)}`,
    },
    {
      header: 'Trạng thái',
      accessor: (row) => {
        const status = normalizeStatus((row.orderStatus || row.status || 'Pending').toString());
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Select
              value={status}
              onValueChange={(val) => handleUpdateRowStatus(row, val)}
              disabled={isUpdating}
            >
              <SelectTrigger
                className={`w-[130px] h-7 text-xs font-semibold rounded-full border-0 focus:ring-0 focus:ring-offset-0 ring-0 px-2.5 ${
                  status === 'Completed'
                    ? 'bg-green-100 text-green-700'
                    : status === 'Pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                <div className="flex-1 text-left">{getStatusLabel(status)}</div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Chờ xử lý</SelectItem>
                <SelectItem value="Completed">Hoàn thành</SelectItem>
                <SelectItem value="Canceled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      },
    },
    { header: 'Ngày đặt', accessor: 'orderDate' },
    { header: 'Số lượng', accessor: 'items', className: 'text-center' },
    {
      header: 'Thao tác',
      accessor: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewDetails(row)}
          className="hover:bg-blue-50 hover:text-blue-600"
        >
          <Eye className="w-4 h-4 mr-1" />
          Xem
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-slideIn">
      {isLoading && <LoadingSpinner />}

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Quản lý đơn hàng</h1>
          <p className="text-gray-600 mt-1">Theo dõi và quản lý đơn hàng của khách</p>
        </div>
        <Button onClick={fetchOrders} disabled={isLoading} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Tải lại
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 shadow-sm">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Không thể tải đơn hàng</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              {apiConnected === false && (
                <p className="text-xs text-red-600 mt-2">
                  Gợi ý: chạy backend bằng lệnh <code className="bg-red-100 px-2 py-1 rounded">mvn spring-boot:run</code>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Lọc theo trạng thái:</span>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả đơn</SelectItem>
                <SelectItem value="pending">Chờ xử lý</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="canceled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Đơn hàng ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={orderColumns}
            data={filteredOrders}
            emptyMessage="Không tìm thấy đơn hàng"
          />
        </CardContent>
      </Card>

      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-[850px] w-[95vw] overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Mã đơn</p>
                  <p className="font-medium">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trạng thái</p>
                  <Select
                    value={normalizeStatus(selectedOrder.orderStatus || selectedOrder.status)}
                    onValueChange={handleUpdateStatus}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="w-full sm:w-[180px] h-8 text-xs">
                      <SelectValue placeholder="Cập nhật trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Chờ xử lý</SelectItem>
                      <SelectItem value="Completed">Hoàn thành</SelectItem>
                      <SelectItem value="Canceled">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                  {isUpdating && <span className="ml-2 text-xs text-blue-500 animate-pulse">Đang cập nhật...</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Khách hàng</p>
                  <p className="font-medium">{selectedOrder.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày đặt</p>
                  <p className="font-medium">{selectedOrder.orderDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tên sản phẩm</p>
                  <p className="font-medium">{selectedOrder.productName || 'Không xác định'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Đơn giá sản phẩm</p>
                  <p className="font-medium">${selectedOrder.price.toFixed(2)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tổng số lượng</p>
                  <p className="font-medium">{selectedOrder.items}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tổng thanh toán</p>
                  <p className="font-medium text-lg">${selectedOrder.totalAmount.toFixed(2)}</p>
                </div>
              </div>

              {selectedOrder.orderDetails && selectedOrder.orderDetails.length > 0 && (
                <div className="pt-4 border-t overflow-hidden">
                  <p className="text-sm text-gray-600 mb-3">Chi tiết sản phẩm trong đơn</p>
                  <div className="overflow-x-auto w-full border rounded">
                    <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
                      <thead className="bg-gray-100/80 text-gray-700">
                        <tr>
                          <th className="px-3 py-2 border-b font-medium">Mã chi tiết SP</th>
                          <th className="px-3 py-2 border-b font-medium">Mã sản phẩm</th>
                          <th className="px-3 py-2 border-b font-medium">Mã vật liệu</th>
                          <th className="px-3 py-2 border-b font-medium">Khối lượng tham chiếu</th>
                          <th className="px-3 py-2 border-b font-medium">Thành phần</th>
                          <th className="px-3 py-2 border-b font-medium">Mô tả chi tiết</th>
                          <th className="px-3 py-2 border-b font-medium">Tồn kho</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.orderDetails.map((detail: any, index: number) => (
                          <tr key={index} className="border-b last:border-0 hover:bg-gray-50/50">
                            <td className="px-3 py-2">{detail.productDetailID || 'NULL'}</td>
                            <td className="px-3 py-2">{detail.productID || 'NULL'}</td>
                            <td className="px-3 py-2">{detail.materialID || 'NULL'}</td>
                            <td className="px-3 py-2">{detail.referenceWeight?.toFixed(2) || 'NULL'}</td>
                            <td className="px-3 py-2">{detail.composition || 'NULL'}</td>
                            <td className="px-3 py-2 max-w-[150px] truncate" title={detail.detailDescription || ''}>
                              {detail.detailDescription || 'NULL'}
                            </td>
                            <td className="px-3 py-2">{detail.stockQuantity || 'NULL'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Tiến trình đơn hàng</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Đã đặt đơn - {selectedOrder.orderDate}</span>
                  </div>
                  {(() => {
                    const status = normalizeStatus(selectedOrder.orderStatus || selectedOrder.status);
                    return (
                      <>
                        {status !== 'Canceled' && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm">Đang xử lý</span>
                          </div>
                        )}
                        {status === 'Completed' && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm">Đã giao hàng</span>
                          </div>
                        )}
                        {status === 'Canceled' && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-sm">Đơn hàng đã hủy</span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
