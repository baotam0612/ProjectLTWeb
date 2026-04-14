import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { DataTable, Column } from '../components/DataTable';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Material } from '../data/mockData';
import {
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from '../api/MaterialAPI';
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
import { ConfirmDialog } from '../components/ConfirmDialog';
import { toast } from 'sonner';

export function MaterialManagement() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setIsLoading(true);
      const data = await getMaterials();
      setMaterials(data);
    } catch (error) {
      console.error('Không kết nối được với API:', error);
      toast.error('Không thể tải danh sách vật liệu');
    } finally {
      setIsLoading(false);
    }
  };

  const [formData, setFormData] = useState<Partial<Material>>({
    name: '',
    composition: '',
    weight: '',
    purity: '',
  });

  const filteredMaterials = materials.filter((material) => {
    if (!material || !material.name) return false;
    return material.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleAddMaterial = () => {
    setEditingMaterial(null);
    setFormData({
      name: '',
      composition: '',
      weight: '',
      purity: '',
    });
    setIsModalOpen(true);
  };

  const handleEditMaterial = (material: Material) => {
    setEditingMaterial(material);
    setFormData(material);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (materialId: string) => {
    setMaterialToDelete(materialId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!materialToDelete) return;

    try {
      setIsLoading(true);
      await deleteMaterial(materialToDelete);
      setMaterials(materials.filter((m) => m.id !== materialToDelete));
      toast.success('Xóa vật liệu thành công');
      setDeleteConfirmOpen(false);
      setMaterialToDelete(null);
    } catch (error) {
      console.error('Xóa vật liệu thất bại:', error);
      toast.error('Xóa vật liệu thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      if (editingMaterial) {
        const updatedMaterial = await updateMaterial(editingMaterial.id, formData);
        setMaterials(materials.map((m) => (m.id === editingMaterial.id ? updatedMaterial : m)));
        toast.success('Cập nhật vật liệu thành công');
      } else {
        const newMaterial = await createMaterial(formData);
        setMaterials([...materials, newMaterial]);
        toast.success('Thêm vật liệu thành công');
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Không thể lưu vật liệu:', error);
      toast.error('Không thể lưu vật liệu');
    } finally {
      setIsLoading(false);
    }
  };

  const materialColumns: Column<Material>[] = [
    { header: 'ID', accessor: 'id' },
    { header: 'Tên vật liệu', accessor: 'name' },
    { header: 'Thành phần', accessor: 'composition' },
    { header: 'Trọng lượng', accessor: 'weight' },
    { header: 'Độ tinh khiết', accessor: 'purity' },
    {
      header: 'Thao tác',
      accessor: (row) => (
        <div className="flex gap-2">
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
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-slideIn">
      {isLoading && <LoadingSpinner />}

      <div className="flex items-center justify-between">
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
          <CardTitle>Vật liệu ({filteredMaterials.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={materialColumns}
            data={filteredMaterials}
            emptyMessage="Không tìm thấy vật liệu"
          />
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingMaterial ? 'Cập nhật vật liệu' : 'Thêm vật liệu mới'}</DialogTitle>
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
            <div className="grid grid-cols-2 gap-4">
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
              {editingMaterial ? 'Cập nhật' : 'Thêm'} vật liệu
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
    </div>
  );
}
