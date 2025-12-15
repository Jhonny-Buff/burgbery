import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { getQueryFn } from '@/lib/queryClient';

interface UserProfile {
  id: number;
  nickname: string;
  phone: string;
  email?: string | null;
  createdAt?: string;
}

interface LoyaltyRule {
  id: number;
  ordersThreshold: number;
  discountPercent: number;
  promoCode: string;
  isActive?: boolean | null;
}

interface UserAccountProps {
  onAuthChange?: () => void;
}

export function UserAccount({ onAuthChange }: UserAccountProps) {
  const { data: user, refetch } = useQuery<UserProfile | null>({
    queryKey: ['/api/users/me'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  const { data: rules = [] } = useQuery<LoyaltyRule[]>({
    queryKey: ['/api/loyalty-rules/active'],
  });

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    nickname: '',
    phone: '',
    email: '',
    password: '',
    consent: true,
  });

  const updateField = (key: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAuth = async (endpoint: string) => {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(
          mode === 'login'
            ? { identifier: form.phone || form.email, password: form.password }
            : {
                nickname: form.nickname,
                phone: form.phone,
                email: form.email,
                password: form.password,
              },
        ),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.message || 'Не удалось выполнить действие');
        return;
      }

      setMessage(mode === 'login' ? 'Вход выполнен' : 'Регистрация завершена');
      await refetch();
      onAuthChange?.();
    } catch (err: any) {
      setMessage(err?.message || 'Ошибка запроса');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await fetch('/api/users/logout', { method: 'POST', credentials: 'include' });
      await refetch();
      onAuthChange?.();
      setMessage('Вы вышли из аккаунта');
    } catch (err: any) {
      setMessage(err?.message || 'Не удалось выйти');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="bg-zinc-900 border-zinc-800 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-white">
            {user ? `Здравствуйте, ${user.nickname}` : 'Личный кабинет'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {user ? (
            <div className="space-y-4 text-zinc-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-zinc-400 text-sm">Никнейм</p>
                  <p className="text-white text-lg">{user.nickname}</p>
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Телефон</p>
                  <p className="text-white text-lg">{user.phone}</p>
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Почта</p>
                  <p className="text-white text-lg">{user.email || '—'}</p>
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Дата регистрации</p>
                  <p className="text-white text-lg">
                    {user.createdAt ? new Date(user.createdAt).toLocaleString('ru-RU') : '—'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  disabled={loading}
                  className="border-zinc-700 text-white"
                >
                  Выйти
                </Button>
                {message && <span className="text-zinc-400 text-sm">{message}</span>}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white text-lg">
                    {mode === 'login' ? 'Вход' : 'Регистрация'}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <span>Регистрация</span>
                    <Switch
                      checked={mode === 'register'}
                      onCheckedChange={(checked) => setMode(checked ? 'register' : 'login')}
                    />
                  </div>
                </div>

                {mode === 'register' && (
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Никнейм</Label>
                    <Input
                      placeholder="Ваш ник"
                      value={form.nickname}
                      onChange={(e) => updateField('nickname', e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-zinc-300">Телефон</Label>
                  <Input
                    placeholder="+7 (___) ___-__-__"
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-300">Почта</Label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-300">Пароль</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>

                {message && <p className="text-sm text-orange-400">{message}</p>}

                <Button
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  disabled={loading}
                  onClick={() => handleAuth(`/api/users/${mode === 'login' ? 'login' : 'register'}`)}
                >
                  {loading ? 'Отправка...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
                </Button>
              </div>

              <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 space-y-3">
                <h4 className="text-white text-lg">Преимущества аккаунта</h4>
                <ul className="text-zinc-300 space-y-2 text-sm">
                  <li>• Быстрое оформление заказа без повторного ввода данных</li>
                  <li>• Отслеживание бонусных промокодов за количество заказов</li>
                  <li>• Связь с поддержкой и напоминания о скидках</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Программа лояльности</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-zinc-200">
          {rules.length === 0 ? (
            <p className="text-zinc-400 text-sm">Активных правил пока нет.</p>
          ) : (
            rules.map((rule) => (
              <div
                key={rule.id}
                className="p-3 rounded-lg border border-zinc-800 bg-zinc-800/60"
              >
                <p className="text-white font-medium">
                  {rule.ordersThreshold} заказ{rule.ordersThreshold > 1 ? 'ов' : ''} — {rule.discountPercent}% скидка
                </p>
                <p className="text-zinc-400 text-sm">Промокод: {rule.promoCode}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
