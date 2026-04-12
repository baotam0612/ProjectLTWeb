import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, Filter } from 'lucide-react';
import { DataTable, Column } from '../components/DataTable';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { products as initialProducts, Product } from '../data/mockData';
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

import { useEffect } from 'react';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProductApi
} from '../api/ProductAPI';

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    category: '',
    status: 'available' as 'available' | 'unavailable',
    image: '',
  });

  // Fetch products when component mounts
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

  // Filter products
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
    if (productToDelete) {
      try {
        setIsLoading(true);
        await deleteProductApi(productToDelete);
        setProducts(products.filter((p) => p.id !== productToDelete));
        toast.success('Xóa sản phẩm thành công');
        setDeleteConfirmOpen(false);
        setProductToDelete(null);
      } catch (error) {
        console.error('Xóa sản phẩm thất bại:', error);
        toast.error('Xóa sản phẩm thất bại(kiểm tra xem sản phẩm còn hàng không hay đã có đơn hàng nào liên quan chưa)');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      if (editingProduct) {
        // Update existing product
        console.log('Updating product ID:', editingProduct.id, 'with data:', formData);
        const updatedProduct = await updateProduct(editingProduct.id, formData);
        setProducts(
          products.map((p) => (p.id === editingProduct.id ? updatedProduct : p))
        );
        toast.success('Product updated successfully');
      } else {
        // Create new product
        console.log('Creating product with data:', formData);
        const newProduct = await createProduct(formData);
        setProducts([...products, newProduct]);
        toast.success('Product added successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save product:', error);
      toast.error('Failed to save product');
    } finally {
      setIsLoading(false);
    }
  };

  const productColumns: Column<Product>[] = [
    {
      header: 'Image',
      accessor: (row) => (
        <img
          src={row.image}
          alt={row.name}
          className="w-12 h-12 object-cover rounded-lg"
        />
      ),
    },
    { header: 'Name', accessor: 'name' },
    {
      header: 'Price',
      accessor: (row) => `$${row.price.toFixed(2)}`,
    },
    { header: 'Category', accessor: 'category' },
    
    {
      header: 'Status',
      accessor: (row) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            row.status === 'available'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ),
    },
    {
      header: 'Actions',
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Product Management</h1>
          <p className="text-gray-600 mt-1">Manage your product inventory</p>
        </div>
        <Button onClick={handleAddProduct} className="bg-[#4F46E5] hover:bg-[#4338CA]">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ring">Ring</SelectItem>
                  <SelectItem value="Necklace">Necklace</SelectItem>
                  <SelectItem value="Bracelet">Bracelet</SelectItem>
                  <SelectItem value="Earrings">Earrings</SelectItem>
                  <SelectItem value="Bangle">Bangle</SelectItem>
                  <SelectItem value="Anklet">Anklet</SelectItem>
                  <SelectItem value="Pendant">Pendant</SelectItem>
                  <SelectItem value="Wedding Jewelry">Wedding Jewelry</SelectItem>
                  <SelectItem value="Charm">Charm</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Products ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={productColumns} data={filteredProducts} emptyMessage="No products found" />
        </CardContent>
      </Card>

      {/* Add/Edit Product Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="productName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  placeholder="0.00"
                />
              
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryName">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ring">Ring</SelectItem>
                        <SelectItem value="Necklace">Necklace</SelectItem>
                        <SelectItem value="Bracelet">Bracelet</SelectItem>
                        <SelectItem value="Earrings">Earrings</SelectItem>
                        <SelectItem value="Bangle">Bangle</SelectItem>
                        <SelectItem value="Anklet">Anklet</SelectItem>
                        <SelectItem value="Pendant">Pendant</SelectItem>
                        <SelectItem value="Wedding Jewelry">Wedding Jewelry</SelectItem>
                        <SelectItem value="Charm">Charm</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
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
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="imageUrl"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-[#4F46E5] hover:bg-[#4338CA]">
              {editingProduct ? 'Update' : 'Add'} Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}