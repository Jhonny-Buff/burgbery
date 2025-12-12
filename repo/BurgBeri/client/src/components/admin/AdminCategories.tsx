import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Save, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Category, InsertCategory } from '@shared/schema';

export function AdminCategories() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const createMutation = useMutation({
    mutationFn: async (category: InsertCategory) => {
      const response = await apiRequest('POST', '/api/categories', category);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setIsCreating(false);
      setNewName('');
      toast({ title: 'Категория создана' });
    },
    onError: () => {
      toast({ title: 'Ошибка создания категории', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertCategory> }) => {
      const response = await apiRequest('PATCH', `/api/categories/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setEditingId(null);
      toast({ title: 'Категория обновлена' });
    },
    onError: () => {
      toast({ title: 'Ошибка обновления категории', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({ title: 'Категория удалена' });
    },
    onError: () => {
      toast({ title: 'Ошибка удаления категории', variant: 'destructive' });
    },
  });

  const handleCreate = () => {
    if (!newName.trim()) return;
    createMutation.mutate({ name: newName.trim() });
  };

  const handleUpdate = (id: number) => {
    if (!editingName.trim()) return;
    updateMutation.mutate({ id, data: { name: editingName.trim() } });
  };

  const toggleActive = (category: Category) => {
    updateMutation.mutate({ id: category.id, data: { isActive: !category.isActive } });
  };

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
        <h2 className="text-white text-2xl" data-testid="text-admin-categories-title">Категории</h2>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-orange-600 hover:bg-orange-700"
          data-testid="button-add-category"
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить
        </Button>
      </div>

      {isCreating && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Название категории"
                className="bg-zinc-800 border-zinc-700 text-white"
                data-testid="input-new-category-name"
              />
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-save-new-category"
              >
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsCreating(false);
                  setNewName('');
                }}
                className="text-zinc-400 hover:text-white"
                data-testid="button-cancel-new-category"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {categories.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-8 text-center">
              <p className="text-zinc-400">Категорий пока нет</p>
            </CardContent>
          </Card>
        ) : (
          categories.map((category) => (
            <Card key={category.id} className="bg-zinc-900 border-zinc-800" data-testid={`card-category-${category.id}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  {editingId === category.id ? (
                    <div className="flex items-center gap-3 flex-1">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white max-w-xs"
                        data-testid={`input-edit-category-${category.id}`}
                      />
                      <Button
                        onClick={() => handleUpdate(category.id)}
                        disabled={updateMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                        data-testid={`button-save-category-${category.id}`}
                      >
                        {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setEditingId(null)}
                        className="text-zinc-400 hover:text-white"
                        data-testid={`button-cancel-edit-${category.id}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-4">
                        <span className={`text-white ${!category.isActive ? 'opacity-50' : ''}`} data-testid={`text-category-name-${category.id}`}>
                          {category.name}
                        </span>
                        {!category.isActive && (
                          <span className="text-xs text-zinc-500">Скрыта</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-400 text-sm">Активна</span>
                          <Switch
                            checked={category.isActive ?? true}
                            onCheckedChange={() => toggleActive(category)}
                            data-testid={`switch-category-active-${category.id}`}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingId(category.id);
                            setEditingName(category.name);
                          }}
                          className="text-zinc-400 hover:text-white"
                          data-testid={`button-edit-category-${category.id}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(category.id)}
                          disabled={deleteMutation.isPending}
                          className="text-red-400 hover:text-red-300"
                          data-testid={`button-delete-category-${category.id}`}
                        >
                          {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
