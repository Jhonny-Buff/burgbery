import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Trash2, Loader2, Edit2, Save, X, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { PromoCode, InsertPromoCode } from '@shared/schema';

export function AdminPromoCodes() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discountPercent: 10,
    maxUsage: '',
    isActive: true,
  });

  const { data: promoCodes = [], isLoading } = useQuery<PromoCode[]>({
    queryKey: ['/api/promo-codes'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertPromoCode) => {
      const response = await apiRequest('POST', '/api/promo-codes', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/promo-codes'] });
      closeDialog();
      toast({ title: 'Промокод создан' });
    },
    onError: () => {
      toast({ title: 'Ошибка создания промокода', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertPromoCode> }) => {
      const response = await apiRequest('PATCH', `/api/promo-codes/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/promo-codes'] });
      closeDialog();
      toast({ title: 'Промокод обновлен' });
    },
    onError: () => {
      toast({ title: 'Ошибка обновления промокода', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/promo-codes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/promo-codes'] });
      toast({ title: 'Промокод удален' });
    },
    onError: () => {
      toast({ title: 'Ошибка удаления промокода', variant: 'destructive' });
    },
  });

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingPromo(null);
    setFormData({
      code: '',
      discountPercent: 10,
      maxUsage: '',
      isActive: true,
    });
  };

  const openEditDialog = (promo: PromoCode) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code,
      discountPercent: promo.discountPercent,
      maxUsage: promo.maxUsage?.toString() || '',
      isActive: promo.isActive ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.code.trim() || formData.discountPercent <= 0) {
      toast({ title: 'Заполните обязательные поля', variant: 'destructive' });
      return;
    }

    const data: InsertPromoCode = {
      code: formData.code.trim().toUpperCase(),
      discountPercent: formData.discountPercent,
      maxUsage: formData.maxUsage ? parseInt(formData.maxUsage) : undefined,
      isActive: formData.isActive,
    };

    if (editingPromo) {
      updateMutation.mutate({ id: editingPromo.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const toggleActive = (promo: PromoCode) => {
    updateMutation.mutate({ id: promo.id, data: { isActive: !promo.isActive } });
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
        <h2 className="text-white text-2xl" data-testid="text-admin-promo-title">Промокоды</h2>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-orange-600 hover:bg-orange-700"
          data-testid="button-add-promo"
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить
        </Button>
      </div>

      <div className="space-y-3">
        {promoCodes.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-8 text-center">
              <Ticket className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-400">Промокодов пока нет</p>
            </CardContent>
          </Card>
        ) : (
          promoCodes.map((promo) => (
            <Card 
              key={promo.id} 
              className={`bg-zinc-900 border-zinc-800 ${!promo.isActive ? 'opacity-60' : ''}`}
              data-testid={`card-promo-${promo.id}`}
            >
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-600/20 rounded-full flex items-center justify-center">
                      <Ticket className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-mono text-lg" data-testid={`text-promo-code-${promo.id}`}>
                          {promo.code}
                        </span>
                        {!promo.isActive && (
                          <span className="bg-zinc-700 text-zinc-400 text-xs px-2 py-0.5 rounded">
                            Неактивен
                          </span>
                        )}
                      </div>
                      <p className="text-orange-500" data-testid={`text-promo-discount-${promo.id}`}>
                        Скидка {promo.discountPercent}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-white" data-testid={`text-promo-usage-${promo.id}`}>
                        {promo.usageCount || 0}{promo.maxUsage ? `/${promo.maxUsage}` : ''}
                      </div>
                      <div className="text-zinc-500 text-xs">использований</div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={promo.isActive ?? true}
                        onCheckedChange={() => toggleActive(promo)}
                        data-testid={`switch-promo-active-${promo.id}`}
                      />
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(promo)}
                      className="text-zinc-400 hover:text-white"
                      data-testid={`button-edit-promo-${promo.id}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(promo.id)}
                      disabled={deleteMutation.isPending}
                      className="text-red-400 hover:text-red-300"
                      data-testid={`button-delete-promo-${promo.id}`}
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingPromo ? 'Редактировать промокод' : 'Новый промокод'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-zinc-300">Код *</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="DISCOUNT20"
                className="bg-zinc-800 border-zinc-700 text-white mt-1 font-mono uppercase"
                data-testid="input-promo-code"
              />
            </div>

            <div>
              <Label className="text-zinc-300">Скидка (%) *</Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={formData.discountPercent}
                onChange={(e) => setFormData({ ...formData, discountPercent: parseInt(e.target.value) || 0 })}
                className="bg-zinc-800 border-zinc-700 text-white mt-1"
                data-testid="input-promo-discount"
              />
            </div>

            <div>
              <Label className="text-zinc-300">Максимум использований (пусто = неограниченно)</Label>
              <Input
                type="number"
                min="1"
                value={formData.maxUsage}
                onChange={(e) => setFormData({ ...formData, maxUsage: e.target.value })}
                placeholder="100"
                className="bg-zinc-800 border-zinc-700 text-white mt-1"
                data-testid="input-promo-max-usage"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                data-testid="switch-promo-active-form"
              />
              <Label className="text-zinc-300">Активен</Label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
                data-testid="button-save-promo"
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Сохранить
              </Button>
              <Button
                variant="outline"
                onClick={closeDialog}
                className="border-zinc-700 text-zinc-300"
              >
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
