import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Search, Loader2, Ban, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Customer, Blacklist } from '@shared/schema';

export function AdminCustomers() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  const { data: blacklist = [] } = useQuery<Blacklist[]>({
    queryKey: ['/api/blacklist'],
  });

  const addToBlacklistMutation = useMutation({
    mutationFn: async (phone: string) => {
      const response = await apiRequest('POST', '/api/blacklist', { phone, reason: 'Добавлен администратором' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blacklist'] });
      toast({ title: 'Добавлен в черный список' });
    },
    onError: () => {
      toast({ title: 'Ошибка добавления в черный список', variant: 'destructive' });
    },
  });

  const isBlacklisted = (phone: string) => {
    return blacklist.some((b) => b.phone === phone);
  };

  const filteredCustomers = customers.filter((customer) => {
    const query = searchQuery.toLowerCase();
    return (
      customer.name.toLowerCase().includes(query) ||
      customer.phone.includes(query)
    );
  });

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
      <h2 className="text-white text-2xl" data-testid="text-admin-customers-title">Клиенты</h2>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск по имени или телефону..."
          className="bg-zinc-800 border-zinc-700 text-white pl-10"
          data-testid="input-search-customers"
        />
      </div>

      <div className="space-y-3">
        {filteredCustomers.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-8 text-center">
              <p className="text-zinc-400">Клиентов не найдено</p>
            </CardContent>
          </Card>
        ) : (
          filteredCustomers.map((customer) => {
            const blacklisted = isBlacklisted(customer.phone);
            return (
              <Card 
                key={customer.id} 
                className={`bg-zinc-900 border-zinc-800 ${blacklisted ? 'border-red-800/50' : ''}`}
                data-testid={`card-customer-${customer.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${blacklisted ? 'bg-red-900/30' : 'bg-zinc-800'}`}>
                        <User className={`w-6 h-6 ${blacklisted ? 'text-red-400' : 'text-zinc-400'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white" data-testid={`text-customer-name-${customer.id}`}>{customer.name}</span>
                          {blacklisted && (
                            <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded">
                              В черном списке
                            </span>
                          )}
                        </div>
                        <p className="text-zinc-400 text-sm" data-testid={`text-customer-phone-${customer.id}`}>{customer.phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-white" data-testid={`text-customer-orders-${customer.id}`}>{customer.totalOrders}</div>
                        <div className="text-zinc-500 text-xs">заказов</div>
                      </div>
                      <div className="text-center">
                        <div className="text-orange-500" data-testid={`text-customer-spent-${customer.id}`}>{customer.totalSpent} ₽</div>
                        <div className="text-zinc-500 text-xs">потрачено</div>
                      </div>
                      <div className="text-center hidden sm:block">
                        <div className="text-zinc-400 text-sm">{formatDate(customer.createdAt)}</div>
                        <div className="text-zinc-500 text-xs">дата регистрации</div>
                      </div>
                      
                      {!blacklisted && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => addToBlacklistMutation.mutate(customer.phone)}
                          disabled={addToBlacklistMutation.isPending}
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                          title="Добавить в черный список"
                          data-testid={`button-blacklist-customer-${customer.id}`}
                        >
                          {addToBlacklistMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Ban className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
