import { useState, useEffect, type ChangeEvent } from 'react';
import { Plus, Pencil, Trash2, Search, Filter, Upload } from 'lucide-react';
import { DataTable, Column } from '../components/DataTable';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Product } from '../data/mockData';
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

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProductApi,
} from '../api/ProductAPI';
import { uploadImage } from '../api/UploadAPI';

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    category: '',
    status: 'available',
    image: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Không kết nối được với API:', error);
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    if (!product || !product.name) return false;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: 0,
      category: '',
      stock: 0,
      status: 'available',
      image: '',
    });
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      setIsLoading(true);
      await deleteProductApi(productToDelete);
      setProducts(products.filter((p) => p.id !== productToDelete));
      toast.success('Xóa sản phẩm thành công');
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Xóa sản phẩm thất bại:', error);
      toast.error('Xóa sản phẩm thất bại. Kiểm tra sản phẩm còn liên kết đơn hàng không.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      if (editingProduct) {
        const updatedProduct = await updateProduct(editingProduct.id, formData);
        setProducts(products.map((p) => (p.id === editingProduct.id ? updatedProduct : p)));
        toast.success('Cập nhật sản phẩm thành công');
      } else {
        const newProduct = await createProduct(formData);
        setProducts([...products, newProduct]);
        toast.success('Thêm sản phẩm thành công');
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Không thể lưu sản phẩm:', error);
      toast.error('Không thể lưu sản phẩm');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const imageUrl = await uploadImage(file);
      setFormData({ ...formData, image: imageUrl });
      toast.success('Tải ảnh lên thành công');
    } catch (error) {
      console.error('Tải ảnh thất bại:', error);
      toast.error('Tải ảnh thất bại');
    } finally {
      setIsUploading(false);
    }
  };

  const productColumns: Column<Product>[] = [
    {
      header: 'Ảnh',
      accessor: (row) => (
        <img
          src={row.image}
          alt={row.name}
          className="w-12 h-12 object-cover rounded-lg"
        />
      ),
    },
    { header: 'Tên sản phẩm', accessor: 'name' },
    {
      header: 'Giá',
      accessor: (row) => `$${row.price.toFixed(2)}`,
    },
    { header: 'Danh mục', accessor: 'category' },
    {
      header: 'Trạng thái',
      accessor: (row) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            row.status === 'available'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {row.status === 'available' ? 'Còn hàng' : 'Hết hàng'}
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
            onClick={() => handleEditProduct(row)}
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
          <h1 className="text-3xl font-semibold text-gray-900">Quản lý sản phẩm</h1>
          <p className="text-gray-600 mt-1">Quản lý danh sách và tồn kho sản phẩm</p>
        </div>
        <Button onClick={handleAddProduct} className="bg-[#4F46E5] hover:bg-[#4338CA]">
          <Plus className="w-4 h-4 mr-2" />
          Thêm sản phẩm
        </Button>
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="Ring">Nhẫn</SelectItem>
                  <SelectItem value="Necklace">Dây chuyền</SelectItem>
                  <SelectItem value="Bracelet">Lắc tay</SelectItem>
                  <SelectItem value="Earrings">Bông tai</SelectItem>
                  <SelectItem value="Bangle">Vòng cứng</SelectItem>
                  <SelectItem value="Anklet">Lắc chân</SelectItem>
                  <SelectItem value="Pendant">Mặt dây</SelectItem>
                  <SelectItem value="Wedding Jewelry">Trang sức cưới</SelectItem>
                  <SelectItem value="Charm">Charm</SelectItem>
                  <SelectItem value="Other">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Sản phẩm ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={productColumns}
            data={filteredProducts}
            emptyMessage="Không tìm thấy sản phẩm"
          />
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Tên sản phẩm</Label>
              <Input
                id="productName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nhập tên sản phẩm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Giá</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryName">Danh mục</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ring">Nhẫn</SelectItem>
                  <SelectItem value="Necklace">Dây chuyền</SelectItem>
                  <SelectItem value="Bracelet">Lắc tay</SelectItem>
                  <SelectItem value="Earrings">Bông tai</SelectItem>
                  <SelectItem value="Bangle">Vòng cứng</SelectItem>
                  <SelectItem value="Anklet">Lắc chân</SelectItem>
                  <SelectItem value="Pendant">Mặt dây</SelectItem>
                  <SelectItem value="Wedding Jewelry">Trang sức cưới</SelectItem>
                  <SelectItem value="Charm">Charm</SelectItem>
                  <SelectItem value="Other">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'available' | 'unavailable') =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Còn hàng</SelectItem>
                  <SelectItem value="unavailable">Hết hàng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label>Ảnh sản phẩm</Label>
              <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-lg border-gray-200">
                {formData.image ? (
                  <div className="relative group">
                    <img
                      src={formData.image}
                      alt="Xem trước"
                      className="w-32 h-32 object-cover rounded-lg shadow-md"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                      <Label htmlFor="image-upload" className="cursor-pointer text-white text-xs font-medium">
                        Đổi ảnh
                      </Label>
                    </div>
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-gray-50 flex flex-col items-center justify-center rounded-lg border border-gray-100">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500">Chưa có ảnh</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    {isUploading ? 'Đang tải ảnh...' : 'Chọn ảnh từ máy tính'}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Hoặc nhập URL ảnh</Label>
                <Input
                  id="imageUrl"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/hinh-anh.jpg"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} className="bg-[#4F46E5] hover:bg-[#4338CA]">
              {editingProduct ? 'Cập nhật' : 'Thêm'} sản phẩm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        title="Xóa sản phẩm"
        description="Bạn có chắc muốn xóa sản phẩm này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
      />
    </div>
  );
}
