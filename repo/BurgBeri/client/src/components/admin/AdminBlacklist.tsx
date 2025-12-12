import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Blacklist } from '@shared/schema';

export function AdminBlacklist() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [newReason, setNewReason] = useState('');

  const { data: blacklist = [], isLoading } = useQuery<Blacklist[]>({
    queryKey: ['/api/blacklist'],
  });

  const addMutation = useMutation({
    mutationFn: async (data: { phone: string; reason: string }) => {
      const response = await apiRequest('POST', '/api/blacklist', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blacklist'] });
      setIsDialogOpen(false);
      setNewPhone('');
      setNewReason('');
      toast({ title: 'Номер добавлен в черный список' });
    },
    onError: (error: any) => {
      toast({ title: error.message || 'Ошибка добавления', variant: 'destructive' });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (phone: string) => {
      await apiRequest('DELETE', `/api/blacklist/${encodeURIComponent(phone)}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blacklist'] });
      toast({ title: 'Номер удален из черного списка' });
    },
    onError: () => {
      toast({ title: 'Ошибка удаления', variant: 'destructive' });
    },
  });

  const handleAdd = () => {
    if (!newPhone.trim()) {
      toast({ title: 'Введите номер телефона', variant: 'destructive' });
      return;
    }
    addMutation.mutate({ phone: newPhone.trim(), reason: newReason.trim() });
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('ru-RU');
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
        <h2 className="text-white text-2xl" data-testid="text-admin-blacklist-title">Черный список</h2>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-red-600 hover:bg-red-700"
          data-testid="button-add-blacklist"
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить
        </Button>
      </div>

      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-red-300 text-sm">
            Клиенты из черного списка не смогут оформить заказ на сайте. 
            Их номер телефона будет заблокирован при попытке оформления.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {blacklist.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-8 text-center">
              <p className="text-zinc-400">Черный список пуст</p>
            </CardContent>
          </Card>
        ) : (
          blacklist.map((entry) => (
            <Card key={entry.id} className="bg-zinc-900 border-red-800/30" data-testid={`card-blacklist-${entry.id}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-white" data-testid={`text-blacklist-phone-${entry.id}`}>{entry.phone}</p>
                    {entry.reason && (
                      <p className="text-zinc-400 text-sm mt-1">{entry.reason}</p>
                    )}
                    <p className="text-zinc-500 text-xs mt-1">Добавлен: {formatDate(entry.createdAt)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMutation.mutate(entry.phone)}
                    disabled={removeMutation.isPending}
                    className="text-zinc-400 hover:text-white"
                    data-testid={`button-remove-blacklist-${entry.id}`}
                  >
                    {removeMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Добавить в черный список</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-zinc-300">Номер телефона *</Label>
              <Input
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+7 (___) ___-__-__"
                className="bg-zinc-800 border-zinc-700 text-white mt-1"
                data-testid="input-blacklist-phone"
              />
            </div>

            <div>
              <Label className="text-zinc-300">Причина</Label>
              <Textarea
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                placeholder="Укажите причину блокировки..."
                className="bg-zinc-800 border-zinc-700 text-white mt-1"
                rows={3}
                data-testid="input-blacklist-reason"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleAdd}
                disabled={addMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700"
                data-testid="button-confirm-blacklist"
              >
                {addMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Добавить
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
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
