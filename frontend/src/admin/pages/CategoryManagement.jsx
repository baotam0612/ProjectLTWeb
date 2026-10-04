import { usePagedList } from "../hooks/usePagedList";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { DataTable } from "../components/DataTable";
import { LoadingSpinner } from "../components/LoadingSpinner";
import {
  getCategoriesPage,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryStatus
} from "../api/CategoryAPI";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { toast } from "sonner";
const getCategoryStatusLabel = (status) => status === "Inactive" ? "Ng\u1EEBng ho\u1EA1t \u0111\u1ED9ng" : "Ho\u1EA1t \u0111\u1ED9ng";
export function CategoryManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const pagination = usePagedList(getCategoriesPage, {  });
  const categories = pagination.items;
  const fetchCategories = pagination.reload;
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "Active"
  });
  const handleAddCategory = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      description: "",
      status: "Active"
    });
    setIsModalOpen(true);
  };
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setFormData(category);
    setIsModalOpen(true);
  };
  const handleDeleteClick = (categoryId) => {
    setCategoryToDelete(categoryId);
    setDeleteConfirmOpen(true);
  };
  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    try {
      setIsLoading(true);
      await deleteCategory(categoryToDelete);
      fetchCategories();
      toast.success("X\xF3a danh m\u1EE5c th\xE0nh c\xF4ng");
      setDeleteConfirmOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error("X\xF3a danh m\u1EE5c th\u1EA5t b\u1EA1i:", error);
      toast.error("Kh\xF4ng th\u1EC3 x\xF3a danh m\u1EE5c (danh m\u1EE5c \u0111ang \u0111\u01B0\u1EE3c s\u1EED d\u1EE5ng)");
    } finally {
      setIsLoading(false);
    }
  };
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
      fetchCategories();
        toast.success("C\u1EADp nh\u1EADt danh m\u1EE5c th\xE0nh c\xF4ng");
      } else {
        await createCategory(formData);
      fetchCategories();
        toast.success("Th\xEAm danh m\u1EE5c th\xE0nh c\xF4ng");
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Kh\xF4ng th\u1EC3 l\u01B0u danh m\u1EE5c:", error);
      toast.error("Kh\xF4ng th\u1EC3 l\u01B0u danh m\u1EE5c");
    } finally {
      setIsLoading(false);
    }
  };
  const handleUpdateRowStatus = async (category, newStatus) => {
    try {
      setIsLoading(true);
      await updateCategoryStatus(category.id, newStatus);
      toast.success(`\u0110\xE3 c\u1EADp nh\u1EADt tr\u1EA1ng th\xE1i danh m\u1EE5c th\xE0nh ${getCategoryStatusLabel(newStatus)}`);
      fetchCategories();
    } catch (error) {
      console.error("L\u1ED7i c\u1EADp nh\u1EADt tr\u1EA1ng th\xE1i danh m\u1EE5c:", error);
      toast.error("Kh\xF4ng th\u1EC3 c\u1EADp nh\u1EADt tr\u1EA1ng th\xE1i danh m\u1EE5c");
    } finally {
      setIsLoading(false);
    }
  };
  const categoryColumns = [
    { header: "ID", accessor: "id" },
    { header: "T\xEAn danh m\u1EE5c", accessor: "name" },
    { header: "M\xF4 t\u1EA3", accessor: "description" },
    {
      header: "Tr\u1EA1ng th\xE1i",
      accessor: (row) => {
        const rawStatus = row.status || "Active";
        const status = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();
        return <div onClick={(e) => e.stopPropagation()}>
            <Select
          value={status === "Inactive" ? "Inactive" : "Active"}
          onValueChange={(val) => handleUpdateRowStatus(row, val)}
          disabled={isLoading}
        >
              <SelectTrigger
          className={`w-[140px] h-7 text-xs font-semibold rounded-full border-0 focus:ring-0 focus:ring-offset-0 ring-0 px-2.5 ${status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
                <div className="flex-1 text-left">{getCategoryStatusLabel(status)}</div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Hoạt động</SelectItem>
                <SelectItem value="Inactive">Ngừng hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div>;
      }
    },
    {
      header: "Thao t\xE1c",
      accessor: (row) => <div className="flex gap-2">
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
    }
  ];
  return <div className="space-y-6 animate-slideIn">
      {(isLoading || pagination.loading) && <LoadingSpinner />}

      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Quản lý danh mục</h1>
          <p className="text-gray-600 mt-1">Sắp xếp sản phẩm theo danh mục</p>
        </div>
        <Button onClick={handleAddCategory} className="bg-[#4F46E5] hover:bg-[#4338CA]">
          <Plus className="w-4 h-4 mr-2" />
          Thêm danh mục
        </Button>
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Danh mục ({pagination.totalElements})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable pagination={pagination}
    columns={categoryColumns}
    data={categories}
    emptyMessage="Không tìm thấy danh mục"
  />
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "C\u1EADp nh\u1EADt danh m\u1EE5c" : "Th\xEAm danh m\u1EE5c m\u1EDBi"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên danh mục</Label>
              <Input
    id="name"
    value={formData.name}
    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
    placeholder="Nhập tên danh mục"
  />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
    id="description"
    value={formData.description}
    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
    placeholder="Nhập mô tả danh mục"
    rows={3}
  />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
    value={formData.status || "Active"}
    onValueChange={(val) => setFormData({ ...formData, status: val })}
  >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Hoạt động</SelectItem>
                  <SelectItem value="Inactive">Ngừng hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} className="bg-[#4F46E5] hover:bg-[#4338CA]">
              {editingCategory ? "C\u1EADp nh\u1EADt" : "Th\xEAm"} danh mục
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
    open={deleteConfirmOpen}
    onOpenChange={setDeleteConfirmOpen}
    onConfirm={handleDeleteConfirm}
    title="Xóa danh mục"
    description="Bạn có chắc muốn xóa danh mục này? Hành động này không thể hoàn tác."
    confirmText="Xóa"
  />
    </div>;
}
