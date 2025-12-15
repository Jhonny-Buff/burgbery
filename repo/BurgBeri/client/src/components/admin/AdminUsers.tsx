import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, Phone, User, Mail, History } from 'lucide-react';
import type { Order } from '@shared/schema';

interface RegisteredUser {
  id: number;
  nickname: string;
  phone: string;
  email?: string | null;
  createdAt?: string;
  totalOrders?: number;
  totalSpent?: number;
}

interface UserOrderWithItems {
  order: Order;
  items: Array<{ productName: string; quantity: number; productPrice: number; id: number }>;
}

export function AdminUsers() {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [passwords, setPasswords] = useState<Record<number, string>>({});
  const [contactEdits, setContactEdits] = useState<Record<number, { phone?: string; email?: string; nickname?: string }>>({});

  const { data: users = [], isLoading } = useQuery<RegisteredUser[]>({
    queryKey: ['/api/admin/users'],
  });

  const { data: orders = [], isFetching: ordersLoading } = useQuery<UserOrderWithItems[]>({
    queryKey: ['/api/admin/users', selectedUser, 'orders'],
    enabled: selectedUser !== null,
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/admin/users/${selectedUser}/orders`);
      return res.json();
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<RegisteredUser> & { password?: string } }) => {
      const res = await apiRequest('PATCH', `/api/admin/users/${id}`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      if (selectedUser !== null) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/users', selectedUser, 'orders'] });
      }
      toast({ title: 'Данные обновлены' });
    },
    onError: () => {
      toast({ title: 'Не удалось обновить пользователя', variant: 'destructive' });
    },
  });

  const handleSave = (userId: number) => {
    const payload: any = {
      ...contactEdits[userId],
      password: passwords[userId] || undefined,
    };
    if (!payload.nickname && !payload.phone && !payload.email && !payload.password) return;
    updateUserMutation.mutate({ id: userId, payload });
  };

  const formatDate = (date?: string) => (date ? new Date(date).toLocaleString('ru-RU') : '—');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-white text-2xl">Зарегистрированные пользователи</h2>
        <p className="text-sm text-zinc-400">Всего: {users.length}</p>
      </div>

      <div className="space-y-4">
        {users.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-8 text-center text-zinc-400">Пользователи не найдены</CardContent>
          </Card>
        ) : (
          users.map((user) => {
            const currentContacts = contactEdits[user.id] || {};
            return (
              <Card key={user.id} className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-4 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                        <User className="w-6 h-6 text-zinc-300" />
                      </div>
                      <div>
                        <div className="text-white text-lg">{user.nickname}</div>
                        <div className="text-zinc-400 text-sm">ID: {user.id}</div>
                        <div className="text-zinc-400 text-sm">Создан: {formatDate(user.createdAt)}</div>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm text-zinc-300">
                      <div>Заказов: {user.totalOrders ?? 0}</div>
                      <div>Потрачено: {user.totalSpent ?? 0} ₽</div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Никнейм</Label>
                      <Input
                        defaultValue={user.nickname}
                        onChange={(e) =>
                          setContactEdits((prev) => ({
                            ...prev,
                            [user.id]: { ...prev[user.id], nickname: e.target.value },
                          }))
                        }
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300 flex items-center gap-2"><Phone className="w-4 h-4" />Телефон</Label>
                      <Input
                        defaultValue={user.phone}
                        onChange={(e) =>
                          setContactEdits((prev) => ({
                            ...prev,
                            [user.id]: { ...prev[user.id], phone: e.target.value },
                          }))
                        }
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300 flex items-center gap-2"><Mail className="w-4 h-4" />Почта</Label>
                      <Input
                        defaultValue={user.email ?? ''}
                        onChange={(e) =>
                          setContactEdits((prev) => ({
                            ...prev,
                            [user.id]: { ...prev[user.id], email: e.target.value },
                          }))
                        }
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300 flex items-center gap-2"><Lock className="w-4 h-4" />Новый пароль</Label>
                      <Input
                        type="password"
                        value={passwords[user.id] || ''}
                        onChange={(e) => setPasswords((prev) => ({ ...prev, [user.id]: e.target.value }))}
                        className="bg-zinc-800 border-zinc-700 text-white"
                        placeholder="Оставьте пустым, если не менять"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 justify-between items-center">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setSelectedUser((prev) => (prev === user.id ? null : user.id));
                        }}
                        variant="outline"
                        className="border-zinc-700 text-white"
                      >
                        <History className="w-4 h-4 mr-2" /> История заказов
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSave(user.id)}
                        disabled={updateUserMutation.isPending}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        {updateUserMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Сохранить'}
                      </Button>
                    </div>
                  </div>

                  {selectedUser === user.id && (
                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 space-y-3">
                      <div className="flex items-center gap-2 text-zinc-300">
                        <History className="w-4 h-4" /> Заказы пользователя
                        {ordersLoading && <Loader2 className="w-4 h-4 animate-spin text-orange-500" />}
                      </div>
                      {orders.length === 0 ? (
                        <p className="text-sm text-zinc-400">Заказов нет</p>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-auto pr-1">
                          {orders.map(({ order, items }) => (
                            <div key={order.id} className="p-3 border border-zinc-800 rounded-lg">
                              <div className="flex justify-between text-sm text-zinc-300">
                                <span>#{order.id} • {new Date(order.createdAt || '').toLocaleString('ru-RU')}</span>
                                <span className="text-orange-400">{order.total} ₽</span>
                              </div>
                              <div className="text-xs text-zinc-400">{order.deliveryType} • {order.paymentMethod}</div>
                              <div className="text-xs text-zinc-400">{items.map((i) => `${i.productName} ×${i.quantity}`).join(', ')}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
