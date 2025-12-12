import { useState, useEffect, type ChangeEvent } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface SiteSettings {
  id?: number;
  heroImageUrl?: string | null;
  logoImageUrl?: string | null;
  footerLogoImageUrl?: string | null;
}

export function AdminSettings() {
  const { toast } = useToast();
  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ['/api/settings'],
  });

  const [form, setForm] = useState<SiteSettings>({});
  const [uploadingKey, setUploadingKey] = useState<keyof SiteSettings | null>(null);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const mutation = useMutation({
    mutationFn: async (payload: Partial<SiteSettings>) => {
      const res = await apiRequest('PATCH', '/api/settings', payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({ title: 'Настройки сохранены' });
    },
    onError: () => {
      toast({ title: 'Ошибка сохранения настроек', variant: 'destructive' });
    },
  });

  const handleSave = () => {
    mutation.mutate(form);
  };

  const handleUpload = async (
    event: ChangeEvent<HTMLInputElement>,
    key: keyof SiteSettings,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setUploadingKey(key);

    try {
      const res = await apiRequest('POST', '/api/uploads', formData);
      const data = await res.json();
      setForm((prev) => ({ ...prev, [key]: data.url }));
      toast({ title: 'Файл загружен' });
    } catch (error) {
      toast({ title: 'Не удалось загрузить файл', variant: 'destructive' });
    } finally {
      setUploadingKey(null);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-white text-2xl">Настройки сайта</h2>
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Баннер и логотип</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-zinc-300">URL баннера на главной</Label>
            <Input
              value={form.heroImageUrl ?? ''}
              onChange={(e) => setForm({ ...form, heroImageUrl: e.target.value })}
              placeholder="https://..."
              className="bg-zinc-800 border-zinc-700 text-white mt-1"
            />
            <div className="flex items-center gap-3 mt-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleUpload(e, 'heroImageUrl')}
                disabled={uploadingKey === 'heroImageUrl'}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              {uploadingKey === 'heroImageUrl' && (
                <span className="text-sm text-zinc-400">Загрузка...</span>
              )}
            </div>
          </div>
          <div>
            <Label className="text-zinc-300">URL логотипа (хедер)</Label>
            <Input
              value={form.logoImageUrl ?? ''}
              onChange={(e) => setForm({ ...form, logoImageUrl: e.target.value })}
              placeholder="https://..."
              className="bg-zinc-800 border-zinc-700 text-white mt-1"
            />
            <div className="flex items-center gap-3 mt-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleUpload(e, 'logoImageUrl')}
                disabled={uploadingKey === 'logoImageUrl'}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              {uploadingKey === 'logoImageUrl' && (
                <span className="text-sm text-zinc-400">Загрузка...</span>
              )}
            </div>
          </div>
          <div>
            <Label className="text-zinc-300">URL логотипа (футер)</Label>
            <Input
              value={form.footerLogoImageUrl ?? ''}
              onChange={(e) => setForm({ ...form, footerLogoImageUrl: e.target.value })}
              placeholder="https://..."
              className="bg-zinc-800 border-zinc-700 text-white mt-1"
            />
            <div className="flex items-center gap-3 mt-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleUpload(e, 'footerLogoImageUrl')}
                disabled={uploadingKey === 'footerLogoImageUrl'}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              {uploadingKey === 'footerLogoImageUrl' && (
                <span className="text-sm text-zinc-400">Загрузка...</span>
              )}
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={mutation.isPending}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Сохранить
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
