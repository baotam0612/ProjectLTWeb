import { useState, useEffect } from 'react';
import { Eye, Filter, CreditCard, Wallet, Building2 } from 'lucide-react';
import { DataTable, Column } from '../components/DataTable';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Payment } from '../data/mockData';
import { getPayments, updatePaymentStatusAPI } from '../api/PaymentAPI';
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

const getPaymentStatusLabel = (status: string) => {
  if (status === 'Success') return 'Success';
  if (status === 'Failed') return 'Failed';
  return status;
};

const getPaymentMethodLabel = (method: Payment['method']) => {
  return 'Thanh toán khi nhận hàng';
};

export function PaymentManagement() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const data = await getPayments();
      setPayments(data);
    } catch (error) {
      console.error('Không kết nối được với API:', error);
      toast.error('Không thể tải danh sách thanh toán');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    if (filterStatus === 'all') return true;
    return payment.status === filterStatus;
  });

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setDetailModalOpen(true);
  };

  const getPaymentMethodIcon = (method: Payment['method']) => {
    return <Wallet className="w-4 h-4" />;
  };

  const paymentColumns: Column<Payment>[] = [
    { header: 'Mã thanh toán', accessor: 'id' },
    { header: 'Mã đơn hàng', accessor: 'orderId' },
    {
      header: 'Phương thức',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          {row.method ? getPaymentMethodIcon(row.method) : null}
          <span>{row.method ? getPaymentMethodLabel(row.method) : 'NULL'}</span>
        </div>
      ),
    },
    {
      header: 'Trạng thái',
      accessor: (row) => {
        if (!row.status || row.status === 'null') {
          return (
            <span className="text-gray-400 font-mono text-xs font-semibold bg-gray-100 px-2 py-0.5 rounded">
              NULL
            </span>
          );
        }
        return (
          <Select
            defaultValue={row.status}
            onValueChange={async (newStatus) => {
              try {
                await updatePaymentStatusAPI(row.id, newStatus);
                toast.success('Cập nhật trạng thái thành công!');
                const updatedPayments = payments.map(p => p.id === row.id ? { ...p, status: newStatus as 'Success' | 'Failed' } : p);
                setPayments(updatedPayments);
              } catch (e) {
                toast.error('Cập nhật thất bại!');
              }
            }}
          >
            <SelectTrigger className={`h-8 w-[120px] rounded-full text-xs font-medium border-0 focus:ring-0 ${row.status === 'Success'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
              }`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Success">Success</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        );
      },
    },
    { header: 'Ngày thanh toán', accessor: 'date' },
    {
      header: 'Số tiền',
      accessor: (row) => (
        <span className="font-medium">{row.amount ? `$${row.amount.toFixed(2)}` : 'NULL'}</span>
      ),
    },
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

      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Quản lý thanh toán</h1>
        <p className="text-gray-600 mt-1">Theo dõi và quản lý các giao dịch thanh toán</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng giao dịch</p>
                <h3 className="text-2xl font-semibold text-gray-900">{payments.length}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Thành công</p>
                <h3 className="text-2xl font-semibold text-green-600">
                  {payments.filter((p) => p.status === 'Success').length}
                </h3>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng doanh thu</p>
                <h3 className="text-2xl font-semibold text-gray-900">
                  ${payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                </h3>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                <SelectItem value="all">Tất cả giao dịch</SelectItem>
                <SelectItem value="Success">Success</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Thanh toán ({filteredPayments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={paymentColumns}
            data={filteredPayments}
            emptyMessage="Không tìm thấy giao dịch"
          />
        </CardContent>
      </Card>

      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chi tiết thanh toán</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Mã thanh toán</p>
                  <p className="font-medium">{selectedPayment.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mã đơn hàng</p>
                  <p className="font-medium">{selectedPayment.orderId}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Phương thức thanh toán</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getPaymentMethodIcon(selectedPayment.method)}
                    <span className="font-medium">{getPaymentMethodLabel(selectedPayment.method)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trạng thái</p>
                  <span
                    className={`inline-block mt-1 px-2.5 py-1 rounded-full text-xs font-medium ${selectedPayment.status === 'Success'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                      }`}
                  >
                    {getPaymentStatusLabel(selectedPayment.status)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Số tiền</p>
                  <p className="font-medium text-xl">${selectedPayment.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày</p>
                  <p className="font-medium">{selectedPayment.date}</p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Thông tin giao dịch</p>
                <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Mã giao dịch:</span>
                    <span className="font-mono">{selectedPayment.id}-TXN</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí xử lý:</span>
                    <span>${(selectedPayment.amount * 0.03).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium pt-2 border-t">
                    <span>Số tiền thực nhận:</span>
                    <span>${(selectedPayment.amount * 0.97).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
