import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Save, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Vacancy {
  id: number;
  title: string;
  description?: string | null;
  salary?: string | null;
  contacts?: string | null;
  isActive?: boolean | null;
  sortOrder?: number | null;
}

export function AdminVacancies() {
  const { toast } = useToast();
  const { data: vacancies = [], isLoading } = useQuery<Vacancy[]>({
    queryKey: ['/api/vacancies/all'],
  });

  const [editing, setEditing] = useState<Vacancy | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<Partial<Vacancy>>({});

  const createMutation = useMutation({
    mutationFn: async (payload: Partial<Vacancy>) => {
      const res = await apiRequest('POST', '/api/vacancies', payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vacancies/all'] });
      setIsCreating(false);
      setForm({});
      toast({ title: 'Вакансия создана' });
    },
    onError: () => {
      toast({ title: 'Ошибка создания вакансии', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { id: number; data: Partial<Vacancy> }) => {
      const res = await apiRequest('PATCH', `/api/vacancies/${payload.id}`, payload.data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vacancies/all'] });
      setEditing(null);
      setForm({});
      toast({ title: 'Вакансия обновлена' });
    },
    onError: () => {
      toast({ title: 'Ошибка обновления вакансии', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/vacancies/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vacancies/all'] });
      toast({ title: 'Вакансия удалена' });
    },
    onError: () => {
      toast({ title: 'Ошибка удаления вакансии', variant: 'destructive' });
    },
  });

  const startCreate = () => {
    setIsCreating(true);
    setEditing(null);
    setForm({
      title: '',
      description: '',
      salary: '',
      contacts: '',
      isActive: true,
      sortOrder: vacancies.length + 1,
    });
  };

  const startEdit = (vacancy: Vacancy) => {
    setEditing(vacancy);
    setIsCreating(false);
    setForm(vacancy);
  };

  const handleSave = () => {
    if (!form.title || !form.title.trim()) return;
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form });
    } else {
      createMutation.mutate(form);
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
        <h2 className="text-white text-2xl">Вакансии</h2>
        <Button
          onClick={startCreate}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Новая вакансия
        </Button>
      </div>

      {(isCreating || editing) && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">
              {editing ? 'Редактирование вакансии' : 'Новая вакансия'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-zinc-300">Название</Label>
              <Input
                value={form.title ?? ''}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-zinc-300">Описание</Label>
              <Textarea
                value={form.description ?? ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white mt-1"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-300">Зарплата</Label>
                <Input
                  value={form.salary ?? ''}
                  onChange={(e) => setForm({ ...form, salary: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  placeholder="от 35 000 ₽"
                />
              </div>
              <div>
                <Label className="text-zinc-300">Контакты</Label>
                <Input
                  value={form.contacts ?? ''}
                  onChange={(e) => setForm({ ...form, contacts: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  placeholder="Телефон / почта"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.isActive ?? false}
                  onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                  id="vacancy-active"
                />
                <Label htmlFor="vacancy-active" className="text-zinc-300">Показывать на сайте</Label>
              </div>
              <div>
                <Label className="text-zinc-300">Порядок сортировки</Label>
                <Input
                  type="number"
                  value={form.sortOrder ?? 0}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                />
              </div>
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
              <Button variant="outline" onClick={() => { setEditing(null); setIsCreating(false); }}>
                <X className="w-4 h-4 mr-2" />
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Список вакансий</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {vacancies.length === 0 ? (
            <p className="text-zinc-400">Вакансий нет</p>
          ) : (
            <div className="space-y-3">
              {vacancies.map((vacancy) => (
                <div
                  key={vacancy.id}
                  className="flex flex-col md:flex-row md:items-center gap-3 justify-between p-3 bg-zinc-800 rounded-lg border border-zinc-700"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium" data-testid={`vacancy-title-${vacancy.id}`}>{vacancy.title}</p>
                      {vacancy.isActive === false ? (
                        <span className="text-xs text-zinc-400">Скрыта</span>
                      ) : null}
                    </div>
                    {vacancy.salary ? (
                      <p className="text-zinc-400 text-sm">{vacancy.salary}</p>
                    ) : null}
                    {vacancy.description ? (
                      <p className="text-zinc-500 text-sm line-clamp-2">{vacancy.description}</p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button variant="outline" onClick={() => startEdit(vacancy)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Редактировать
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(vacancy.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Удалить
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
