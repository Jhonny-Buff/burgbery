import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Save, X, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Product, Category, InsertProduct } from '@shared/schema';

export function AdminProducts() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<Partial<InsertProduct>>({
    name: '',
    description: '',
    fullDescription: '',
    ingredients: '',
    price: 0,
    weight: '',
    image: '',
    categoryId: undefined,
    isActive: true,
    isNew: false,
  });

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const createMutation = useMutation({
    mutationFn: async (product: InsertProduct) => {
      const response = await apiRequest('POST', '/api/products', product);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      closeDialog();
      toast({ title: 'Товар создан' });
    },
    onError: () => {
      toast({ title: 'Ошибка создания товара', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertProduct> }) => {
      const response = await apiRequest('PATCH', `/api/products/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      closeDialog();
      toast({ title: 'Товар обновлен' });
    },
    onError: () => {
      toast({ title: 'Ошибка обновления товара', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ title: 'Товар удален' });
    },
    onError: () => {
      toast({ title: 'Ошибка удаления товара', variant: 'destructive' });
    },
  });

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      fullDescription: '',
      ingredients: '',
      price: 0,
      weight: '',
      image: '',
      categoryId: undefined,
      isActive: true,
      isNew: false,
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);
    setUploading(true);

    try {
      const res = await apiRequest('POST', '/api/uploads', uploadData);
      const data = await res.json();
      setFormData((prev) => ({ ...prev, image: data.url }));
      toast({ title: 'Изображение загружено' });
    } catch (err) {
      toast({ title: 'Не удалось загрузить изображение', variant: 'destructive' });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      fullDescription: product.fullDescription || '',
      ingredients: product.ingredients || '',
      price: product.price,
      weight: product.weight || '',
      image: product.image || '',
      categoryId: product.categoryId || undefined,
      isActive: product.isActive ?? true,
      isNew: product.isNew ?? false,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.price) {
      toast({ title: 'Заполните обязательные поля', variant: 'destructive' });
      return;
    }
    
    const data: InsertProduct = {
      name: formData.name!,
      description: formData.description || undefined,
      fullDescription: formData.fullDescription || undefined,
      ingredients: formData.ingredients || undefined,
      price: formData.price!,
      weight: formData.weight || undefined,
      image: formData.image || undefined,
      categoryId: formData.categoryId || undefined,
      isActive: formData.isActive,
      isNew: formData.isNew,
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.categoryId?.toString() === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-white text-2xl" data-testid="text-admin-products-title">Товары</h2>
        <Button
          onClick={() => {
            setEditingProduct(null);
            closeDialog();
            setIsDialogOpen(true);
          }}
          className="bg-orange-600 hover:bg-orange-700"
          data-testid="button-add-product"
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию..."
            className="bg-zinc-800 border-zinc-700 text-white pl-10"
            data-testid="input-search-products"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-48 bg-zinc-800 border-zinc-700 text-white" data-testid="select-filter-category">
            <SelectValue placeholder="Все категории" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            <SelectItem value="all">Все категории</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredProducts.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-8 text-center">
              <p className="text-zinc-400">Товаров не найдено</p>
            </CardContent>
          </Card>
        ) : (
          filteredProducts.map((product) => {
            const category = categories.find((c) => c.id === product.categoryId);
            return (
              <Card key={product.id} className={`bg-zinc-900 border-zinc-800 ${!product.isActive ? 'opacity-60' : ''}`} data-testid={`card-product-admin-${product.id}`}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800">
                      {product.image && (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <h3 className="text-white" data-testid={`text-product-admin-name-${product.id}`}>{product.name}</h3>
                          {category && <span className="text-zinc-500 text-sm">{category.name}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          {product.isNew && (
                            <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded">Новинка</span>
                          )}
                          {!product.isActive && (
                            <span className="bg-zinc-700 text-zinc-400 text-xs px-2 py-1 rounded">Скрыт</span>
                          )}
                        </div>
                      </div>
                      <p className="text-zinc-400 text-sm mt-1 line-clamp-1">{product.description}</p>
                      <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
                        <span className="text-orange-500 text-lg" data-testid={`text-product-admin-price-${product.id}`}>{product.price} ₽</span>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(product)}
                            className="text-zinc-400 hover:text-white"
                            data-testid={`button-edit-product-${product.id}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMutation.mutate(product.id)}
                            disabled={deleteMutation.isPending}
                            className="text-red-400 hover:text-red-300"
                            data-testid={`button-delete-product-${product.id}`}
                          >
                            {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingProduct ? 'Редактировать товар' : 'Новый товар'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-300">Название *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  data-testid="input-product-name"
                />
              </div>
              <div>
                <Label className="text-zinc-300">Цена *</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  data-testid="input-product-price"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-300">Категория</Label>
                <Select
                  value={formData.categoryId?.toString() || ''}
                  onValueChange={(val) => setFormData({ ...formData, categoryId: parseInt(val) })}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white mt-1" data-testid="select-product-category">
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-zinc-300">Вес</Label>
                <Input
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="350г"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  data-testid="input-product-weight"
                />
              </div>
            </div>

            <div>
              <Label className="text-zinc-300">URL изображения</Label>
              <Input
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
                className="bg-zinc-800 border-zinc-700 text-white mt-1"
                data-testid="input-product-image"
              />
              <div className="flex items-center gap-3 mt-2">
                <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                {uploading && <span className="text-sm text-zinc-400">Загрузка...</span>}
              </div>
            </div>

            <div>
              <Label className="text-zinc-300">Краткое описание</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white mt-1"
                rows={2}
                data-testid="input-product-description"
              />
            </div>

            <div>
              <Label className="text-zinc-300">Полное описание</Label>
              <Textarea
                value={formData.fullDescription}
                onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white mt-1"
                rows={3}
                data-testid="input-product-full-description"
              />
            </div>

            <div>
              <Label className="text-zinc-300">Состав</Label>
              <Textarea
                value={formData.ingredients}
                onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white mt-1"
                rows={2}
                data-testid="input-product-ingredients"
              />
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  data-testid="switch-product-active"
                />
                <Label className="text-zinc-300">Активен</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isNew}
                  onCheckedChange={(checked) => setFormData({ ...formData, isNew: checked })}
                  data-testid="switch-product-new"
                />
                <Label className="text-zinc-300">Новинка</Label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
                data-testid="button-save-product"
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Сохранить
              </Button>
              <Button variant="outline" onClick={closeDialog} className="border-zinc-700 text-zinc-300" data-testid="button-cancel-product">
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
