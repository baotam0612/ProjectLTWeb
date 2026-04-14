import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { DataTable, Column } from '../components/DataTable';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getUsers, createUser, updateUser, deleteUser, AdminUser } from '../api/UserAPI';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { toast } from 'sonner';

interface UserFormData {
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  password: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
}

const getRoleLabel = (role: string) =>
  role === 'admin' ? 'Quản trị viên' : 'Người dùng';

const getUserStatusLabel = (status: string) =>
  status === 'active' ? 'Hoạt động' : 'Ngừng hoạt động';

const getErrorMessage = (error: any, fallback: string) => {
  return error?.response?.data?.message || error?.message || fallback;
};

export function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    password: '',
    role: 'user',
    status: 'active',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Không thể tải danh sách người dùng:', error);
      toast.error(getErrorMessage(error, 'Không thể tải danh sách người dùng'));
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return true;

    return [user.username, user.fullName, user.email, user.phoneNumber, user.address]
      .join(' ')
      .toLowerCase()
      .includes(keyword);
  });

  const resetForm = () => {
    setFormData({
      username: '',
      fullName: '',
      email: '',
      phoneNumber: '',
      address: '',
      password: '',
      role: 'user',
      status: 'active',
    });
  };

  const handleAddUser = () => {
    setEditingUser(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      address: user.address,
      password: '',
      role: user.role,
      status: user.status,
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (user: AdminUser) => {
    if (user.status !== 'inactive') {
      toast.error('Chỉ xóa được người dùng đang ngừng hoạt động');
      return;
    }
    setUserToDelete(user.id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      setIsLoading(true);
      await deleteUser(userToDelete);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete));
      toast.success('Xóa người dùng thành công');
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Xóa người dùng thất bại:', error);
      toast.error(getErrorMessage(error, 'Xóa người dùng thất bại'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.username.trim()) {
      toast.error('Vui lòng nhập tên đăng nhập');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Vui lòng nhập email');
      return;
    }
    if (!editingUser && !formData.password.trim()) {
      toast.error('Vui lòng nhập mật khẩu cho người dùng mới');
      return;
    }

    try {
      setIsLoading(true);

      if (editingUser) {
        const updatedUser = await updateUser(editingUser.id, formData);
        setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? updatedUser : u)));
        toast.success('Cập nhật người dùng thành công');
      } else {
        const newUser = await createUser(formData);
        setUsers((prev) => [newUser, ...prev]);
        toast.success('Thêm người dùng thành công');
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Không thể lưu người dùng:', error);
      toast.error(getErrorMessage(error, 'Không thể lưu người dùng'));
    } finally {
      setIsLoading(false);
    }
  };

  const userColumns: Column<AdminUser>[] = [
    { header: 'ID', accessor: 'id' },
    { header: 'Tên đăng nhập', accessor: 'username' },
    { header: 'Họ và tên', accessor: 'fullName' },
    { header: 'Email', accessor: 'email' },
    { header: 'Số điện thoại', accessor: 'phoneNumber' },
    {
      header: 'Vai trò',
      accessor: (row) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            row.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
          }`}
        >
          {getRoleLabel(row.role)}
        </span>
      ),
    },
    {
      header: 'Trạng thái',
      accessor: (row) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            row.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}
        >
          {getUserStatusLabel(row.status)}
        </span>
      ),
    },
    {
      header: 'Thao tác',
      accessor: (row) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditUser(row)}
            className="hover:bg-blue-50 hover:text-blue-600"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteClick(row)}
            className="hover:bg-red-50 hover:text-red-600"
            disabled={row.status !== 'inactive'}
            title={row.status !== 'inactive' ? 'Chỉ xóa khi ngừng hoạt động' : 'Xóa người dùng'}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-slideIn">
      {isLoading && <LoadingSpinner />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Quản lý người dùng</h1>
          <p className="text-gray-600 mt-1">Quản lý tài khoản, vai trò và trạng thái người dùng</p>
        </div>
        <Button onClick={handleAddUser} className="bg-[#4F46E5] hover:bg-[#4338CA]">
          <Plus className="w-4 h-4 mr-2" />
          Thêm người dùng
        </Button>
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên đăng nhập, họ tên, email, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Người dùng ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={userColumns} data={filteredUsers} emptyMessage="Không tìm thấy người dùng" />
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Cập nhật người dùng' : 'Thêm người dùng mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Nhập tên đăng nhập"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Nhập họ và tên"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Số điện thoại</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="0912345678"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Nhập địa chỉ"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">
                  Mật khẩu {editingUser ? '(để trống nếu không đổi)' : ''}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingUser ? 'Không đổi mật khẩu' : 'Nhập mật khẩu'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Vai trò</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: 'admin' | 'user') => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Người dùng</SelectItem>
                    <SelectItem value="admin">Quản trị viên</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'active' | 'inactive') =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} className="bg-[#4F46E5] hover:bg-[#4338CA]">
              {editingUser ? 'Cập nhật' : 'Thêm'} người dùng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        title="Xóa người dùng"
        description="Bạn có chắc muốn xóa người dùng này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
      />
    </div>
  );
}
