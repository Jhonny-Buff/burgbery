import { useState, type ChangeEvent } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Save, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Promotion {
  id: number;
  title: string;
  description: string | null;
  discountLabel: string | null;
  imageUrl: string | null;
  isActive: boolean | null;
  sortOrder: number | null;
}

export function AdminPromotions() {
  const { toast } = useToast();
  const { data: promotions = [], isLoading } = useQuery<Promotion[]>({
    queryKey: ['/api/promotions/all'],
  });

  const [editing, setEditing] = useState<Promotion | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<Partial<Promotion>>({});
  const [isUploading, setIsUploading] = useState(false);

  const createMutation = useMutation({
    mutationFn: async (payload: Partial<Promotion>) => {
      const res = await apiRequest('POST', '/api/promotions', payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/promotions/all'] });
      setIsCreating(false);
      setForm({});
      toast({ title: 'Акция создана' });
    },
    onError: () => {
      toast({ title: 'Ошибка создания акции', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { id: number; data: Partial<Promotion> }) => {
      const res = await apiRequest('PATCH', `/api/promotions/${payload.id}`, payload.data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/promotions/all'] });
      setEditing(null);
      setForm({});
      toast({ title: 'Акция обновлена' });
    },
    onError: () => {
      toast({ title: 'Ошибка обновления акции', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/promotions/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/promotions/all'] });
      toast({ title: 'Акция удалена' });
    },
    onError: () => {
      toast({ title: 'Ошибка удаления акции', variant: 'destructive' });
    },
  });

  const startCreate = () => {
    setIsCreating(true);
    setEditing(null);
    setForm({
      title: '',
      description: '',
      discountLabel: '',
      isActive: true,
      sortOrder: promotions.length + 1,
    });
  };

  const startEdit = (promo: Promotion) => {
    setEditing(promo);
    setIsCreating(false);
    setForm(promo);
  };

  const handleSave = () => {
    if (!form.title || !form.title.trim()) return;
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setIsUploading(true);
    try {
      const res = await apiRequest('POST', '/api/uploads', formData);
      const data = await res.json();
      setForm((prev) => ({ ...prev, imageUrl: data.url }));
      toast({ title: 'Изображение загружено' });
    } catch (err) {
      toast({ title: 'Не удалось загрузить изображение', variant: 'destructive' });
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
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
        <h2 className="text-white text-2xl">Акции</h2>
        <Button
          onClick={startCreate}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Новая акция
        </Button>
      </div>

      {(isCreating || editing) && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">
              {editing ? 'Редактирование акции' : 'Новая акция'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-zinc-300">Заголовок</Label>
              <Input
                value={form.title ?? ''}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-zinc-300">Описание</Label>
              <Input
                value={form.description ?? ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-zinc-300">Размер скидки / пометка</Label>
              <Input
                value={form.discountLabel ?? ''}
                onChange={(e) => setForm({ ...form, discountLabel: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white mt-1"
                placeholder="20% / 0 ₽ / 1+1 и т.п."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Изображение акции</Label>
              {form.imageUrl ? (
                <div className="flex items-center gap-3">
                  <img
                    src={form.imageUrl}
                    alt="Изображение акции"
                    className="w-20 h-20 object-cover rounded-lg border border-zinc-800"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setForm({ ...form, imageUrl: '' })}
                    className="text-zinc-200"
                  >
                    Убрать изображение
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                  {isUploading && <Loader2 className="w-5 h-5 animate-spin text-orange-500" />}
                </div>
              )}
              <p className="text-xs text-zinc-500">Загрузите баннер акции или оставьте пустым</p>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.isActive ?? true}
                onCheckedChange={(val) => setForm({ ...form, isActive: val })}
              />
              <span className="text-zinc-300 text-sm">Акция активна</span>
            </div>
            <div>
              <Label className="text-zinc-300">Сортировка</Label>
              <Input
                type="number"
                value={form.sortOrder ?? 0}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                className="bg-zinc-800 border-zinc-700 text-white mt-1 max-w-[160px]"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Сохранить
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(null);
                  setIsCreating(false);
                  setForm({});
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {promotions.map((promo) => (
          <Card key={promo.id} className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                {promo.imageUrl ? (
                  <img
                    src={promo.imageUrl}
                    alt={promo.title}
                    className="w-16 h-16 object-cover rounded-lg border border-zinc-800"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-orange-400" />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-medium">{promo.title}</h3>
                  {promo.discountLabel && (
                    <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
                      {promo.discountLabel}
                    </span>
                  )}
                </div>
                <div>
                  {promo.description && (
                    <p className="text-sm text-zinc-400 mt-1">{promo.description}</p>
                  )}
                  <p className="text-xs text-zinc-500 mt-1">
                    {promo.isActive ? 'Акция активна' : 'Неактивна'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => startEdit(promo)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => deleteMutation.mutate(promo.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
