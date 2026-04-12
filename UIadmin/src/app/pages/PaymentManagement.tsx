import { useState, useEffect } from 'react';
import { Eye, Filter } from 'lucide-react';
import { DataTable, Column } from '../components/DataTable';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Payment } from '../data/mockData';
import { getPayments } from '../api/PaymentAPI';
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
import { CreditCard, Wallet, Building2 } from 'lucide-react';

export function PaymentManagement() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch payments when component mounts
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

  // Filter payments
  const filteredPayments = payments.filter((payment) => {
    if (filterStatus === 'all') return true;
    return payment.status === filterStatus;
  });

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setDetailModalOpen(true);
  };

  const getPaymentMethodIcon = (method: Payment['method']) => {
    switch (method) {
      case 'credit_card':
        return <CreditCard className="w-4 h-4" />;
      case 'paypal':
        return <Wallet className="w-4 h-4" />;
      case 'bank_transfer':
        return <Building2 className="w-4 h-4" />;
    }
  };

  const paymentColumns: Column<Payment>[] = [
    { header: 'PaymentID', accessor: 'id' },
    { header: 'OrderID', accessor: 'orderId' },
    {
      header: 'paymentMethod',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          {row.method ? getPaymentMethodIcon(row.method) : null}
          <span className="capitalize">{row.method ? row.method.replace('_', ' ') : 'NULL'}</span>
        </div>
      ),
    },
    {
      header: 'PaymentStatus',
      accessor: (row) => {
        if (!row.status || row.status === 'null') {
          return <span className="text-gray-400 font-mono text-xs font-semibold bg-gray-100 px-2 py-0.5 rounded">NULL</span>;
        }
        return (
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              row.status === 'completed'
                ? 'bg-green-100 text-green-700'
                : row.status === 'pending'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          </span>
        );
      },
    },
    { header: 'PaymentDate', accessor: 'date' },
    {
      header: 'amount',
      accessor: (row) => <span className="font-medium">{row.amount ? `$${row.amount.toFixed(2)}` : 'NULL'}</span>,
    },
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
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Payment Management</h1>
        <p className="text-gray-600 mt-1">Track and manage payment transactions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Payments</p>
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
                <p className="text-sm text-gray-600">Completed</p>
                <h3 className="text-2xl font-semibold text-green-600">
                  {payments.filter((p) => p.status === 'completed').length}
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
                <p className="text-sm text-gray-600">Total Revenue</p>
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
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Payments ({filteredPayments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={paymentColumns} data={filteredPayments} emptyMessage="No payments found" />
        </CardContent>
      </Card>

      {/* Payment Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Payment ID</p>
                  <p className="font-medium">{selectedPayment.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-medium">{selectedPayment.orderId}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getPaymentMethodIcon(selectedPayment.method)}
                    <span className="font-medium capitalize">
                      {selectedPayment.method.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span
                    className={`inline-block mt-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      selectedPayment.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : selectedPayment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="font-medium text-xl">${selectedPayment.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium">{selectedPayment.date}</p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Transaction Details</p>
                <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-mono">{selectedPayment.id}-TXN</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Processing Fee:</span>
                    <span>${(selectedPayment.amount * 0.03).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium pt-2 border-t">
                    <span>Net Amount:</span>
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