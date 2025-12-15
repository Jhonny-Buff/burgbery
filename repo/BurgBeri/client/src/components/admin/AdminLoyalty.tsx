import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Save, X, Loader2, Trash2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface LoyaltyRule {
  id: number;
  ordersThreshold: number;
  discountType: 'percent' | 'amount';
  discountValue: number;
  usageLimit?: number | null;
  promoCode: string;
  isActive?: boolean | null;
}

export function AdminLoyalty() {
  const { toast } = useToast();
  const { data: rules = [], isLoading } = useQuery<LoyaltyRule[]>({
    queryKey: ['/api/loyalty-rules'],
  });

  const [editing, setEditing] = useState<LoyaltyRule | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<Partial<LoyaltyRule>>({});

  const createMutation = useMutation({
    mutationFn: async (payload: Partial<LoyaltyRule>) => {
      const res = await apiRequest('POST', '/api/loyalty-rules', payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/loyalty-rules'] });
      setIsCreating(false);
      setForm({});
      toast({ title: 'Правило создано' });
    },
    onError: () => {
      toast({ title: 'Не удалось создать правило', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { id: number; data: Partial<LoyaltyRule> }) => {
      const res = await apiRequest('PATCH', `/api/loyalty-rules/${payload.id}`, payload.data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/loyalty-rules'] });
      setEditing(null);
      setForm({});
      toast({ title: 'Правило обновлено' });
    },
    onError: () => toast({ title: 'Не удалось обновить правило', variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/loyalty-rules/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/loyalty-rules'] });
      toast({ title: 'Правило удалено' });
    },
    onError: () => toast({ title: 'Не удалось удалить правило', variant: 'destructive' }),
  });

  const startCreate = () => {
    setIsCreating(true);
    setEditing(null);
    setForm({
      ordersThreshold: 5,
      discountType: 'percent',
      discountValue: 10,
      usageLimit: null,
      promoCode: 'SALE10',
      isActive: true,
    });
  };

  const startEdit = (rule: LoyaltyRule) => {
    setEditing(rule);
    setIsCreating(false);
    setForm(rule);
  };

  const handleSave = () => {
    if (!form.ordersThreshold || !form.discountValue || !form.promoCode || !form.discountType) return;
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const formatDiscount = (rule: LoyaltyRule) =>
    rule.discountType === 'percent' ? `${rule.discountValue}%` : `${rule.discountValue} ₽`;

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
        <h2 className="text-white text-2xl">Программа лояльности</h2>
        <Button onClick={startCreate} className="bg-orange-600 hover:bg-orange-700" data-testid="button-create-loyalty">
          <Plus className="w-4 h-4 mr-2" /> Новое правило
        </Button>
      </div>

      {(isCreating || editing) && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white text-lg">
              {editing ? 'Редактировать правило' : 'Новое правило'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-zinc-300">Количество заказов</label>
                <Input
                  type="number"
                  min={1}
                  value={form.ordersThreshold ?? ''}
                  onChange={(e) => setForm({ ...form, ordersThreshold: parseInt(e.target.value) || 0 })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-zinc-300">Тип скидки</label>
                <select
                  value={form.discountType ?? 'percent'}
                  onChange={(e) => setForm({ ...form, discountType: e.target.value as LoyaltyRule['discountType'] })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="percent">Процент</option>
                  <option value="amount">Фиксированная сумма</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-zinc-300">Значение скидки</label>
                <Input
                  type="number"
                  min={1}
                  value={form.discountValue ?? ''}
                  onChange={(e) => setForm({ ...form, discountValue: parseInt(e.target.value) || 0 })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder={form.discountType === 'percent' ? '10 (процентов)' : '200 (рублей)'}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-zinc-300">Промокод</label>
                <Input
                  value={form.promoCode ?? ''}
                  onChange={(e) => setForm({ ...form, promoCode: e.target.value.toUpperCase() })}
                  className="bg-zinc-800 border-zinc-700 text-white uppercase"
                  placeholder="SALE10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-zinc-300">Количество применений (опционально)</label>
                <Input
                  type="number"
                  min={1}
                  value={form.usageLimit ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, usageLimit: e.target.value ? parseInt(e.target.value) : null })
                  }
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Например 1 для разовой акции"
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  checked={form.isActive ?? true}
                  onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                />
                <span className="text-zinc-300">Активно</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
                <Save className="w-4 h-4 mr-2" /> Сохранить
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(null);
                  setIsCreating(false);
                  setForm({});
                }}
                className="border-zinc-700 text-white"
              >
                <X className="w-4 h-4 mr-2" /> Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-lg">Список правил</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rules.length === 0 ? (
            <p className="text-zinc-400 text-sm">Правила пока не заданы.</p>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-3 rounded-lg border border-zinc-800 bg-zinc-800/60 flex flex-col md:flex-row md:items-center gap-3"
                >
                  <div className="flex-1 text-white">
                    <div className="font-semibold">
                      {rule.ordersThreshold} заказов → {formatDiscount(rule)}
                    </div>
                    <div className="text-sm text-zinc-400">Промокод: {rule.promoCode}</div>
                    {rule.usageLimit && (
                      <div className="text-xs text-zinc-500">Применений: {rule.usageLimit}</div>
                    )}
                  </div>
                  {rule.isActive !== false ? (
                    <span className="flex items-center gap-1 text-green-400 text-sm">
                      <CheckCircle2 className="w-4 h-4" /> Активно
                    </span>
                  ) : (
                    <span className="text-zinc-500 text-sm">Выключено</span>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => startEdit(rule)} className="border-zinc-700 text-white">
                      <Save className="w-4 h-4 mr-1" /> Редактировать
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-red-400 hover:text-red-300"
                      onClick={() => deleteMutation.mutate(rule.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
