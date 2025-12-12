import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Search, Loader2, Eye, ChevronDown, Clock, Check, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Order, OrderItem, OrderStatus } from '@shared/schema';

const statusConfig: Record<OrderStatus, { label: string; className: string; icon: any }> = {
  pending: { label: 'Ожидает', className: 'bg-yellow-500/20 text-yellow-500', icon: Clock },
  processing: { label: 'Подтверждаем', className: 'bg-blue-500/20 text-blue-500', icon: RefreshCw },
  confirmed: { label: 'Подтвержден', className: 'bg-green-500/20 text-green-500', icon: Check },
  cancelled: { label: 'Отменен', className: 'bg-red-500/20 text-red-500', icon: XCircle },
};

export function AdminOrders() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: OrderStatus }) => {
      const response = await apiRequest('PATCH', `/api/orders/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({ title: 'Статус заказа обновлен' });
    },
    onError: () => {
      toast({ title: 'Ошибка обновления статуса', variant: 'destructive' });
    },
  });

  const viewOrder = async (order: Order) => {
    setSelectedOrder(order);
    try {
      const response = await fetch(`/api/orders/${order.id}/items`);
      const items = await response.json();
      setOrderItems(items);
    } catch (e) {
      setOrderItems([]);
    }
    setIsDialogOpen(true);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery) ||
      order.id.toString().includes(searchQuery);
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (date: Date | string | null) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
      <h2 className="text-white text-2xl" data-testid="text-admin-orders-title">Заказы</h2>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по номеру, имени или телефону..."
            className="bg-zinc-800 border-zinc-700 text-white pl-10"
            data-testid="input-search-orders"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48 bg-zinc-800 border-zinc-700 text-white" data-testid="select-filter-status">
            <SelectValue placeholder="Все статусы" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="pending">Ожидает</SelectItem>
            <SelectItem value="processing">Подтверждаем</SelectItem>
            <SelectItem value="confirmed">Подтвержден</SelectItem>
            <SelectItem value="cancelled">Отменен</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-8 text-center">
              <p className="text-zinc-400">Заказов не найдено</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => {
            const config = statusConfig[order.status as OrderStatus] || statusConfig.pending;
            const Icon = config.icon;
            return (
              <Card key={order.id} className="bg-zinc-900 border-zinc-800" data-testid={`card-order-${order.id}`}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-white font-medium" data-testid={`text-order-id-${order.id}`}>#{order.id}</span>
                        <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${config.className}`}>
                          <Icon className="w-3 h-3" />
                          {config.label}
                        </span>
                      </div>
                      <div className="mt-2 space-y-1 text-sm">
                        <p className="text-white">{order.customerName}</p>
                        <p className="text-zinc-400">{order.customerPhone}</p>
                        <p className="text-zinc-500">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-orange-500 text-lg" data-testid={`text-order-total-${order.id}`}>{order.total} ₽</span>
                      
                      <Select
                        value={order.status!}
                        onValueChange={(status) => updateStatusMutation.mutate({ id: order.id, status: status as OrderStatus })}
                      >
                        <SelectTrigger className="w-40 bg-zinc-800 border-zinc-700 text-white" data-testid={`select-order-status-${order.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          <SelectItem value="pending">Ожидает</SelectItem>
                          <SelectItem value="processing">Подтверждаем</SelectItem>
                          <SelectItem value="confirmed">Подтвержден</SelectItem>
                          <SelectItem value="cancelled">Отменен</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => viewOrder(order)}
                        className="text-zinc-400 hover:text-white"
                        data-testid={`button-view-order-${order.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
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
              Заказ #{selectedOrder?.id}
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-zinc-400 text-sm mb-1">Клиент</h4>
                  <p className="text-white">{selectedOrder.customerName}</p>
                  <p className="text-zinc-400">{selectedOrder.customerPhone}</p>
                </div>
                <div>
                  <h4 className="text-zinc-400 text-sm mb-1">Доставка</h4>
                  <p className="text-white">
                    {selectedOrder.deliveryType === 'courier' ? 'Курьером' : 'Самовывоз'}
                  </p>
                  {selectedOrder.deliveryAddress && (
                    <p className="text-zinc-400">{selectedOrder.deliveryAddress}</p>
                  )}
                </div>
                <div>
                  <h4 className="text-zinc-400 text-sm mb-1">Оплата</h4>
                  <p className="text-white">
                    {selectedOrder.paymentMethod === 'cash' ? 'Наличными' : 'Картой'}
                  </p>
                </div>
                <div>
                  <h4 className="text-zinc-400 text-sm mb-1">Приборы</h4>
                  <p className="text-white">{selectedOrder.utensilsCount} шт.</p>
                </div>
              </div>

              <div>
                <h4 className="text-zinc-400 text-sm mb-3">Состав заказа</h4>
                <div className="space-y-2">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-zinc-800 rounded-lg">
                      <div>
                        <span className="text-white">{item.productName}</span>
                        <span className="text-zinc-400 ml-2">x{item.quantity}</span>
                      </div>
                      <span className="text-orange-500">{item.productPrice * item.quantity} ₽</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <div className="flex justify-between items-center text-lg">
                  <span className="text-zinc-400">Итого:</span>
                  <span className="text-orange-500 font-medium">{selectedOrder.total} ₽</span>
                </div>
                {selectedOrder.discount && selectedOrder.discount > 0 && (
                  <div className="flex justify-between items-center text-sm mt-1">
                    <span className="text-zinc-500">Скидка:</span>
                    <span className="text-green-500">-{selectedOrder.discount} ₽</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 border-zinc-700 text-zinc-300"
                >
                  Закрыть
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
