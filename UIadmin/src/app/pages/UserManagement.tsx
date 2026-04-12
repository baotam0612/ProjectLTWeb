import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { DataTable, Column } from '../components/DataTable';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { User } from '../data/mockData';
import { getUsers, createUser, updateUser, deleteUser } from '../api/UserAPI';
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

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Không kết nối được với API:', error);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setIsLoading(false);
    }
  };

  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'user',
    status: 'active',
    joinDate: new Date().toISOString().split('T')[0],
  });

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'user',
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData(user);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      try {
        setIsLoading(true);
        await deleteUser(userToDelete);
        setUsers(users.filter((u) => u.id !== userToDelete));
        toast.success('User deleted successfully');
        setDeleteConfirmOpen(false);
        setUserToDelete(null);
      } catch (error) {
        console.error('Failed to delete user:', error);
        toast.error('Failed to delete user');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      if (editingUser) {
        // Update existing user
        const updatedUser = await updateUser(editingUser.id, formData);
        setUsers(users.map((u) => (u.id === editingUser.id ? updatedUser : u)));
        toast.success('User updated successfully');
      } else {
        // Create new user
        const newUser = await createUser(formData);
        setUsers([...users, newUser]);
        toast.success('User added successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save user:', error);
      toast.error('Failed to save user');
    } finally {
      setIsLoading(false);
    }
  };

  const userColumns: Column<User>[] = [
    { header: 'ID', accessor: 'id' },
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    {
      header: 'Role',
      accessor: (row) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            row.role === 'admin'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {row.role.charAt(0).toUpperCase() + row.role.slice(1)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            row.status === 'active'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ),
    },
    { header: 'Join Date', accessor: 'joinDate' },
    {
      header: 'Actions',
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
            onClick={() => handleDeleteClick(row.id)}
            className="hover:bg-red-50 hover:text-red-600"
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
        </div>
        <Button onClick={handleAddUser} className="bg-[#4F46E5] hover:bg-[#4338CA]">
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Users Table */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={userColumns} data={users} emptyMessage="No users found" />
        </CardContent>
      </Card>

      {/* Add/Edit User Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter user name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: 'admin' | 'user') =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-[#4F46E5] hover:bg-[#4338CA]">
              {editingUser ? 'Update' : 'Add'} User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}