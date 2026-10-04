import { usePagedList } from "../hooks/usePagedList";
import { useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { DataTable } from "../components/DataTable";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { getUsersPage, createUser, updateUser, deleteUser } from "../api/UserAPI";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../components/ui/select";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { toast } from "sonner";
const getRoleLabel = (role) => role === "admin" ? "Qu\u1EA3n tr\u1ECB vi\xEAn" : "Ng\u01B0\u1EDDi d\xF9ng";
const getUserStatusLabel = (status) => status === "active" ? "Ho\u1EA1t \u0111\u1ED9ng" : "Ng\u1EEBng ho\u1EA1t \u0111\u1ED9ng";
const getErrorMessage = (error, fallback) => {
  return error?.response?.data?.message || error?.message || fallback;
};
export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    password: "",
    role: "user",
    status: "active"
  });
  const pagination = usePagedList(getUsersPage, { q: searchTerm });
  const users = pagination.items;
  const fetchUsers = pagination.reload;
  const filteredUsers = users;
  const resetForm = () => {
    setFormData({
      username: "",
      fullName: "",
      email: "",
      phoneNumber: "",
      address: "",
      password: "",
      role: "user",
      status: "active"
    });
  };
  const handleAddUser = () => {
    setEditingUser(null);
    resetForm();
    setIsModalOpen(true);
  };
  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      address: user.address,
      password: "",
      role: user.role,
      status: user.status
    });
    setIsModalOpen(true);
  };
  const handleDeleteClick = (user) => {
    if (user.status !== "inactive") {
      toast.error("Ch\u1EC9 x\xF3a \u0111\u01B0\u1EE3c ng\u01B0\u1EDDi d\xF9ng \u0111ang ng\u1EEBng ho\u1EA1t \u0111\u1ED9ng");
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
      fetchUsers();
      toast.success("X\xF3a ng\u01B0\u1EDDi d\xF9ng th\xE0nh c\xF4ng");
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("X\xF3a ng\u01B0\u1EDDi d\xF9ng th\u1EA5t b\u1EA1i:", error);
      toast.error(getErrorMessage(error, "X\xF3a ng\u01B0\u1EDDi d\xF9ng th\u1EA5t b\u1EA1i"));
    } finally {
      setIsLoading(false);
    }
  };
  const handleSubmit = async () => {
    if (!formData.username.trim()) {
      toast.error("Vui l\xF2ng nh\u1EADp t\xEAn \u0111\u0103ng nh\u1EADp");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Vui l\xF2ng nh\u1EADp email");
      return;
    }
    if (!editingUser && !formData.password.trim()) {
      toast.error("Vui l\xF2ng nh\u1EADp m\u1EADt kh\u1EA9u cho ng\u01B0\u1EDDi d\xF9ng m\u1EDBi");
      return;
    }
    try {
      setIsLoading(true);
      if (editingUser) {
        await updateUser(editingUser.id, formData);
      fetchUsers();
        toast.success("C\u1EADp nh\u1EADt ng\u01B0\u1EDDi d\xF9ng th\xE0nh c\xF4ng");
      } else {
        await createUser(formData);
      fetchUsers();
        toast.success("Th\xEAm ng\u01B0\u1EDDi d\xF9ng th\xE0nh c\xF4ng");
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Kh\xF4ng th\u1EC3 l\u01B0u ng\u01B0\u1EDDi d\xF9ng:", error);
      toast.error(getErrorMessage(error, "Kh\xF4ng th\u1EC3 l\u01B0u ng\u01B0\u1EDDi d\xF9ng"));
    } finally {
      setIsLoading(false);
    }
  };
  const userColumns = [
    { header: "ID", accessor: "id" },
    { header: "T\xEAn \u0111\u0103ng nh\u1EADp", accessor: "username" },
    { header: "H\u1ECD v\xE0 t\xEAn", accessor: "fullName" },
    { header: "Email", accessor: "email" },
    { header: "S\u1ED1 \u0111i\u1EC7n tho\u1EA1i", accessor: "phoneNumber" },
    {
      header: "Vai tr\xF2",
      accessor: (row) => <span
        className={`px-2.5 py-1 rounded-full text-xs font-medium ${row.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"}`}
      >
          {getRoleLabel(row.role)}
        </span>
    },
    {
      header: "Tr\u1EA1ng th\xE1i",
      accessor: (row) => <span
        className={`px-2.5 py-1 rounded-full text-xs font-medium ${row.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
      >
          {getUserStatusLabel(row.status)}
        </span>
    },
    {
      header: "Thao t\xE1c",
      accessor: (row) => <div className="flex gap-2">
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
        disabled={row.status !== "inactive"}
        title={row.status !== "inactive" ? "Ch\u1EC9 x\xF3a khi ng\u1EEBng ho\u1EA1t \u0111\u1ED9ng" : "X\xF3a ng\u01B0\u1EDDi d\xF9ng"}
      >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
    }
  ];
  return <div className="space-y-6 animate-slideIn">
      {(isLoading || pagination.loading) && <LoadingSpinner />}

      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Quản lý tài khoản</h1>
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
          <CardTitle>Người dùng ({pagination.totalElements})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable pagination={pagination} columns={userColumns} data={filteredUsers} emptyMessage="Không tìm thấy người dùng" />
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? "C\u1EADp nh\u1EADt ng\u01B0\u1EDDi d\xF9ng" : "Th\xEAm ng\u01B0\u1EDDi d\xF9ng m\u1EDBi"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">
                  Mật khẩu {editingUser ? "(\u0111\u1EC3 tr\u1ED1ng n\u1EBFu kh\xF4ng \u0111\u1ED5i)" : ""}
                </Label>
                <Input
    id="password"
    type="password"
    value={formData.password}
    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
    placeholder={editingUser ? "Kh\xF4ng \u0111\u1ED5i m\u1EADt kh\u1EA9u" : "Nh\u1EADp m\u1EADt kh\u1EA9u"}
  />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Vai trò</Label>
                <Select
    value={formData.role}
    onValueChange={(value) => setFormData({ ...formData, role: value })}
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
    onValueChange={(value) => setFormData({ ...formData, status: value })}
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
              {editingUser ? "C\u1EADp nh\u1EADt" : "Th\xEAm"} người dùng
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
    </div>;
}
