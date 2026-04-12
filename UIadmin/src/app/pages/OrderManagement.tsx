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

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  // Fetch orders when component mounts
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Test API connection first
      console.log('Testing API connection...');
      const connected = await testApiConnection();
      setApiConnected(connected);

      if (!connected) {
        throw new Error('Backend API is not responding. Make sure Spring Boot is running on port 8081.');
      }

      console.log('Fetching orders...');
      const data = await getOrders();
      console.log('Orders fetched successfully:', data);
      setOrders(data);

      if (data.length === 0) {
        toast.info('No orders found in database');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load orders';
      console.error('Fetch error:', error);
      setError(errorMessage);
      setOrders([]);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (filterStatus === 'all') return true;
    // Support both status formats for backwards compatibility
    return order.status === filterStatus ||
      (filterStatus === 'pending' && order.orderStatus === 'Pending') ||
      (filterStatus === 'completed' && order.orderStatus === 'Completed') ||
      (filterStatus === 'canceled' && order.orderStatus === 'Canceled');
  });

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailModalOpen(true);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedOrder) return;
    try {
      setIsUpdating(true);
      // Backend expects an OrderDTO (or Map) with orderStatus. Send only orderStatus to avoid JSON Date parsing errors.
      await updateOrder(selectedOrder.id, {
        orderStatus: newStatus,
      });
      toast.success('Đơn hàng cập nhật thành công');

      // Update local state 
      setSelectedOrder({
        ...selectedOrder,
        orderStatus: newStatus,
        status: newStatus.toLowerCase()
      });

      // Refresh the orders table behind the modal
      fetchOrders();
    } catch (error: any) {
      console.error('Update status error:', error);
      toast.error('Lỗi cập nhật đơn hàng');
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
      toast.success(`Order #${order.id} status updated`);

      // If the modal is open for this order, update local state too
      if (selectedOrder && selectedOrder.id === order.id) {
        setSelectedOrder({
          ...selectedOrder,
          orderStatus: newStatus,
          status: newStatus.toLowerCase()
        });
      }

      fetchOrders();
    } catch (error: any) {
      console.error('Update status error:', error);
      toast.error('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };


  const orderColumns: Column<Order>[] = [
    { header: 'Order ID', accessor: 'id' },
    { header: 'Customer', accessor: 'userName' },
    { header: 'Product', accessor: 'productName' },
    {
      header: 'Price',
      accessor: (row) => `$${row.price.toFixed(2)}`,
    },
    {
      header: 'Total',
      accessor: (row) => `$${row.totalAmount.toFixed(2)}`,
    },
    {
      header: 'Status',
      accessor: (row) => {
        const rawStatus = (row.orderStatus || row.status || 'Pending').toString();
        const status = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Select
              value={status === 'Completed' || status === 'Canceled' ? status : 'Pending'}
              onValueChange={(val) => handleUpdateRowStatus(row, val)}
              disabled={isUpdating}
            >
              <SelectTrigger
                className={`w-[110px] h-7 text-xs font-semibold rounded-full border-0 focus:ring-0 focus:ring-offset-0 ring-0 px-2.5 ${status === 'Completed'
                  ? 'bg-green-100 text-green-700'
                  : status === 'Pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                  }`}
              >
                <div className="flex-1 text-left">{status}</div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      },
    },
    { header: 'Date', accessor: 'orderDate' },
    { header: 'Quantity', accessor: 'items', className: 'text-center' },
    {
      header: 'Actions',
      accessor: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewDetails(row)}
          className="hover:bg-blue-50 hover:text-blue-600"
        >
          <Eye className="w-4 h-4 mr-1" />
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-slideIn">
      {isLoading && <LoadingSpinner />}

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-1">Track and manage customer orders</p>
        </div>
        <Button
          onClick={fetchOrders}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50 shadow-sm">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Failed to load orders</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              {apiConnected === false && (
                <p className="text-xs text-red-600 mt-2">
                  💡 Tip: Make sure Spring Boot is running with: <code className="bg-red-100 px-2 py-1 rounded">mvn spring-boot:run</code>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={orderColumns} data={filteredOrders} emptyMessage="No orders found" />
        </CardContent>
      </Card>

      {/* Order Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-[850px] w-[95vw] overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-medium">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Select
                    value={selectedOrder.orderStatus || selectedOrder.status === 'completed' ? 'Completed' : selectedOrder.status === 'canceled' ? 'Canceled' : 'Pending'}
                    onValueChange={handleUpdateStatus}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="w-full sm:w-[180px] h-8 text-xs">
                      <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Canceled">Canceled</SelectItem>
                    </SelectContent>
                  </Select>
                  {isUpdating && <span className="ml-2 text-xs text-blue-500 animate-pulse">Updating...</span>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-medium">{selectedOrder.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium">{selectedOrder.orderDate}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Product Name</p>
                  <p className="font-medium">{selectedOrder.productName || 'Unknown Product'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Product Price</p>
                  <p className="font-medium">${selectedOrder.price.toFixed(2)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Quantity</p>
                  <p className="font-medium">{selectedOrder.items}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-medium text-lg">${selectedOrder.totalAmount.toFixed(2)}</p>
                </div>
              </div>
              {selectedOrder.orderDetails && selectedOrder.orderDetails.length > 0 && (
                <div className="pt-4 border-t overflow-hidden">
                  <p className="text-sm text-gray-600 mb-3"></p>
                  <div className="overflow-x-auto w-full border rounded">
                    <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
                      <thead className="bg-gray-100/80 text-gray-700">
                        <tr>
                          <th className="px-3 py-2 border-b font-medium">ProductDetailID</th>
                          <th className="px-3 py-2 border-b font-medium">ProductID</th>
                          <th className="px-3 py-2 border-b font-medium">MaterialID</th>
                          <th className="px-3 py-2 border-b font-medium">referenceWeight</th>
                          <th className="px-3 py-2 border-b font-medium">composition</th>
                          <th className="px-3 py-2 border-b font-medium">detailDescription</th>
                          <th className="px-3 py-2 border-b font-medium">StockQuantity</th>
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
                            <td className="px-3 py-2 max-w-[150px] truncate" title={detail.detailDescription || ''}>{detail.detailDescription || 'NULL'}</td>
                            <td className="px-3 py-2">{detail.stockQuantity || 'NULL'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Order Timeline</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Order placed - {selectedOrder.orderDate}</span>
                  </div>
                  {(() => {
                    const status = selectedOrder.orderStatus || selectedOrder.status;
                    return (
                      <>
                        {status !== 'canceled' && status !== 'Canceled' && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm">Processing</span>
                          </div>
                        )}
                        {(status === 'completed' || status === 'Completed') && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm">Delivered</span>
                          </div>
                        )}
                        {(status === 'canceled' || status === 'Canceled') && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-sm">Order canceled</span>
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