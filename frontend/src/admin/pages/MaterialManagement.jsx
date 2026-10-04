import { usePagedList } from "../hooks/usePagedList";
import { useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { DataTable } from "../components/DataTable";
import { LoadingSpinner } from "../components/LoadingSpinner";
import {
  getMaterialsPage,
  createMaterial,
  updateMaterial,
  deleteMaterial
} from "../api/MaterialAPI";
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
import { ConfirmDialog } from "../components/ConfirmDialog";
import { toast } from "sonner";
export function MaterialManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const pagination = usePagedList(getMaterialsPage, { q: searchTerm });
  const materials = pagination.items;
  const fetchMaterials = pagination.reload;
  const [formData, setFormData] = useState({
    name: "",
    composition: "",
    weight: "",
    purity: ""
  });
  const filteredMaterials = materials;
  const handleAddMaterial = () => {
    setEditingMaterial(null);
    setFormData({
      name: "",
      composition: "",
      weight: "",
      purity: ""
    });
    setIsModalOpen(true);
  };
  const handleEditMaterial = (material) => {
    setEditingMaterial(material);
    setFormData(material);
    setIsModalOpen(true);
  };
  const handleDeleteClick = (materialId) => {
    setMaterialToDelete(materialId);
    setDeleteConfirmOpen(true);
  };
  const handleDeleteConfirm = async () => {
    if (!materialToDelete) return;
    try {
      setIsLoading(true);
      await deleteMaterial(materialToDelete);
      fetchMaterials();
      toast.success("X\xF3a v\u1EADt li\u1EC7u th\xE0nh c\xF4ng");
      setDeleteConfirmOpen(false);
      setMaterialToDelete(null);
    } catch (error) {
      console.error("X\xF3a v\u1EADt li\u1EC7u th\u1EA5t b\u1EA1i:", error);
      toast.error("X\xF3a v\u1EADt li\u1EC7u th\u1EA5t b\u1EA1i");
    } finally {
      setIsLoading(false);
    }
  };
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      if (editingMaterial) {
        await updateMaterial(editingMaterial.id, formData);
      fetchMaterials();
        toast.success("C\u1EADp nh\u1EADt v\u1EADt li\u1EC7u th\xE0nh c\xF4ng");
      } else {
        await createMaterial(formData);
      fetchMaterials();
        toast.success("Th\xEAm v\u1EADt li\u1EC7u th\xE0nh c\xF4ng");
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Kh\xF4ng th\u1EC3 l\u01B0u v\u1EADt li\u1EC7u:", error);
      toast.error("Kh\xF4ng th\u1EC3 l\u01B0u v\u1EADt li\u1EC7u");
    } finally {
      setIsLoading(false);
    }
  };
  const materialColumns = [
    { header: "ID", accessor: "id" },
    { header: "T\xEAn v\u1EADt li\u1EC7u", accessor: "name" },
    { header: "Th\xE0nh ph\u1EA7n", accessor: "composition" },
    { header: "Tr\u1ECDng l\u01B0\u1EE3ng", accessor: "weight" },
    { header: "\u0110\u1ED9 tinh khi\u1EBFt", accessor: "purity" },
    {
      header: "Thao t\xE1c",
      accessor: (row) => <div className="flex gap-2">
          <Button
        variant="ghost"
        size="sm"
        onClick={() => handleEditMaterial(row)}
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
          <h1 className="text-3xl font-semibold text-gray-900">Quản lý vật liệu</h1>
          <p className="text-gray-600 mt-1">Quản lý vật liệu sản xuất</p>
        </div>
        <Button onClick={handleAddMaterial} className="bg-[#4F46E5] hover:bg-[#4338CA]">
          <Plus className="w-4 h-4 mr-2" />
          Thêm vật liệu
        </Button>
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
    placeholder="Tìm kiếm vật liệu..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="pl-10"
  />
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Vật liệu ({pagination.totalElements})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable pagination={pagination}
    columns={materialColumns}
    data={filteredMaterials}
    emptyMessage="Không tìm thấy vật liệu"
  />
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingMaterial ? "C\u1EADp nh\u1EADt v\u1EADt li\u1EC7u" : "Th\xEAm v\u1EADt li\u1EC7u m\u1EDBi"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên vật liệu</Label>
              <Input
    id="name"
    value={formData.name}
    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
    placeholder="Nhập tên vật liệu"
  />
            </div>
            <div className="space-y-2">
              <Label htmlFor="composition">Thành phần</Label>
              <Input
    id="composition"
    value={formData.composition}
    onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
    placeholder="Ví dụ: Au, Ag, Pt"
  />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Trọng lượng</Label>
                <Input
    id="weight"
    value={formData.weight}
    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
    placeholder="Ví dụ: 1 chỉ, 1 oz"
  />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purity">Độ tinh khiết</Label>
                <Input
    id="purity"
    value={formData.purity}
    onChange={(e) => setFormData({ ...formData, purity: e.target.value })}
    placeholder="Ví dụ: 99.99%, 18K"
  />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} className="bg-[#4F46E5] hover:bg-[#4338CA]">
              {editingMaterial ? "C\u1EADp nh\u1EADt" : "Th\xEAm"} vật liệu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
    open={deleteConfirmOpen}
    onOpenChange={setDeleteConfirmOpen}
    onConfirm={handleDeleteConfirm}
    title="Xóa vật liệu"
    description="Bạn có chắc muốn xóa vật liệu này? Hành động này không thể hoàn tác."
    confirmText="Xóa"
  />
    </div>;
}
