import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation, Link } from 'wouter';
import {
  Package,
  FolderOpen,
  ShoppingCart,
  Users,
  Ban,
  Ticket,
  LogOut,
  Settings,
  BarChart2,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Gift,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { AdminCategories } from '@/components/admin/AdminCategories';
import { AdminProducts } from '@/components/admin/AdminProducts';
import { AdminOrders } from '@/components/admin/AdminOrders';
import { AdminCustomers } from '@/components/admin/AdminCustomers';
import { AdminBlacklist } from '@/components/admin/AdminBlacklist';
import { AdminPromoCodes } from '@/components/admin/AdminPromoCodes';
import { AdminVacancies } from '@/components/admin/AdminVacancies';
import { AdminLoyalty } from '@/components/admin/AdminLoyalty';
import { AdminSettings } from '@/components/admin/AdminSettings';
import type { Order, Customer, Product } from '@shared/schema';

interface AdminDashboardProps {
  onLogout: () => void;
}

type AdminTab =
  | 'overview'
  | 'categories'
  | 'products'
  | 'orders'
  | 'customers'
  | 'blacklist'
  | 'promo'
  | 'vacancies'
  | 'loyalty'
  | 'settings';

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [, navigate] = useLocation();
  const [currentTab, setCurrentTab] = useState<AdminTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/admin/logout');
    } catch (e) {}
    onLogout();
    navigate('/admin/login');
  };

  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const processingOrders = orders.filter(o => o.status === 'processing').length;
  const todayOrders = orders.filter(o => {
    const orderDate = new Date(o.createdAt!);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  });
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);

  const menuItems = [
    { id: 'overview', label: 'Обзор', icon: BarChart2 },
    { id: 'orders', label: 'Заказы', icon: ShoppingCart, badge: pendingOrders > 0 ? pendingOrders : undefined },
    { id: 'products', label: 'Товары', icon: Package },
    { id: 'categories', label: 'Категории', icon: FolderOpen },
    { id: 'customers', label: 'Клиенты', icon: Users },
    { id: 'blacklist', label: 'Черный список', icon: Ban },
    { id: 'promo', label: 'Промокоды', icon: Ticket },
    { id: 'vacancies', label: 'Вакансии', icon: Briefcase },
    { id: 'loyalty', label: 'Программа лояльности', icon: Gift },
    { id: 'settings', label: 'Настройки сайта', icon: Settings },
  ];

  const renderContent = () => {
    switch (currentTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <h2 className="text-white text-2xl" data-testid="text-admin-overview-title">Обзор</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-zinc-400">Заказов сегодня</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl text-white" data-testid="text-orders-today">{todayOrders.length}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-zinc-400">Выручка сегодня</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl text-orange-500" data-testid="text-revenue-today">{todayRevenue} ₽</div>
                </CardContent>
              </Card>
              
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-zinc-400">Ожидают подтверждения</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl text-yellow-500" data-testid="text-pending-orders">{pendingOrders}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-zinc-400">В обработке</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl text-blue-500" data-testid="text-processing-orders">{processingOrders}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Последние заказы</CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.slice(0, 5).length === 0 ? (
                    <p className="text-zinc-400">Заказов пока нет</p>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 5).map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"
                          data-testid={`card-recent-order-${order.id}`}
                        >
                          <div>
                            <span className="text-white">#{order.id}</span>
                            <span className="text-zinc-400 ml-2">{order.customerName}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-orange-500">{order.total} ₽</span>
                            <StatusBadge status={order.status!} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Статистика</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Всего товаров</span>
                      <span className="text-white" data-testid="text-total-products">{products.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Всего клиентов</span>
                      <span className="text-white" data-testid="text-total-customers">{customers.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Всего заказов</span>
                      <span className="text-white" data-testid="text-total-orders">{orders.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'categories':
        return <AdminCategories />;
      case 'products':
        return <AdminProducts />;
      case 'orders':
        return <AdminOrders />;
      case 'customers':
        return <AdminCustomers />;
      case 'blacklist':
        return <AdminBlacklist />;
      case 'promo':
        return <AdminPromoCodes />;
      case 'vacancies':
        return <AdminVacancies />;
      case 'loyalty':
        return <AdminLoyalty />;
      case 'settings':
        return <AdminSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-zinc-900 border-r border-zinc-800 transform transition-transform lg:translate-x-0 lg:static ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h1 className="text-white text-xl">Бургбери</h1>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setCurrentTab(item.id as AdminTab);
                      setMobileMenuOpen(false);
                    }}
                    data-testid={`button-admin-nav-${item.id}`}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      currentTab === item.id
                        ? 'bg-orange-600 text-white'
                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-800">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full text-zinc-400 hover:text-white hover:bg-zinc-800"
            data-testid="button-admin-logout"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Выйти
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between gap-4 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-white p-2"
            data-testid="button-admin-mobile-menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-white text-lg">Админ-панель</h1>
          <div className="w-10" />
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: 'Ожидает', className: 'bg-yellow-500/20 text-yellow-500' },
    processing: { label: 'Подтверждаем', className: 'bg-blue-500/20 text-blue-500' },
    confirmed: { label: 'Подтвержден', className: 'bg-green-500/20 text-green-500' },
    cancelled: { label: 'Отменен', className: 'bg-red-500/20 text-red-500' },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`px-2 py-1 rounded-full text-xs ${config.className}`}>
      {config.label}
    </span>
  );
}
