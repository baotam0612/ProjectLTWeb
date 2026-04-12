import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { DataTable, Column } from '../components/DataTable';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Category } from '../data/mockData';
import { getCategories, createCategory, updateCategory, deleteCategory, updateCategoryStatus } from '../api/CategoryAPI';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
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
  DialogFooter,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { toast } from 'sonner';

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch categories when component mounts
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Không kết nối được với API:', error);
      toast.error('Không thể tải danh sách danh mục');
    } finally {
      setIsLoading(false);
    }
  };

  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    description: '',
    status: 'Active',
  });

  const handleAddCategory = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      status: 'Active',
    });
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData(category);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (categoryToDelete) {
      try {
        setIsLoading(true);
        await deleteCategory(categoryToDelete);
        setCategories(categories.filter((c) => c.id !== categoryToDelete));
        toast.success('Xóa danh mục thành công');
        setDeleteConfirmOpen(false);
        setCategoryToDelete(null);
      } catch (error) {
        console.error('Failed to delete category:', error);
        toast.error('Không thể xóa danh mục(Danh mục đang được sử dụng)');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      if (editingCategory) {
        // Update existing category
        const updatedCategory = await updateCategory(editingCategory.id, formData);
        setCategories(
          categories.map((c) => (c.id === editingCategory.id ? updatedCategory : c))
        );
        toast.success('Category updated successfully');
      } else {
        // Create new category
        const newCategory = await createCategory(formData);
        setCategories([...categories, newCategory]);
        toast.success('Category added successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save category:', error);
      toast.error('Failed to save category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRowStatus = async (category: Category, newStatus: string) => {
    try {
      setIsLoading(true);
      await updateCategoryStatus(category.id, newStatus);
      toast.success(`Category status updated to ${newStatus}`);
      fetchCategories();
    } catch (error: any) {
      console.error('Update status error:', error);
      toast.error('Failed to update category status');
    } finally {
      setIsLoading(false);
    }
  };

  const categoryColumns: Column<Category>[] = [
    { header: 'ID', accessor: 'id' },
    { header: 'Name', accessor: 'name' },
    { header: 'Description', accessor: 'description' },
    {
      header: 'Status',
      accessor: (row) => {
        const rawStatus = row.status || 'Active';
        const status = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Select
              value={status === 'Inactive' ? 'Inactive' : 'Active'}
              onValueChange={(val) => handleUpdateRowStatus(row, val)}
              disabled={isLoading}
            >
              <SelectTrigger
                className={`w-[110px] h-7 text-xs font-semibold rounded-full border-0 focus:ring-0 focus:ring-offset-0 ring-0 px-2.5 ${status === 'Active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
                  }`}
              >
                <div className="flex-1 text-left">{status}</div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      },
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditCategory(row)}
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
          <h1 className="text-3xl font-semibold text-gray-900">Category Management</h1>
          <p className="text-gray-600 mt-1">Organize your products into categories</p>
        </div>
        <Button onClick={handleAddCategory} className="bg-[#4F46E5] hover:bg-[#4338CA]">
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Categories Table */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Categories ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={categoryColumns} data={categories} emptyMessage="No categories found" />
        </CardContent>
      </Card>

      {/* Add/Edit Category Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter category name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter category description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || 'Active'}
                onValueChange={(val) => setFormData({ ...formData, status: val as 'Active' | 'Inactive' })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-[#4F46E5] hover:bg-[#4338CA]">
              {editingCategory ? 'Update' : 'Add'} Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}