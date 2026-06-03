'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ThemePage() {
  const [config, setConfig] = useState<any>(null);
  const [themes, setThemes] = useState<any[]>([]);
  const [color, setColor] = useState('#000000');

  useEffect(() => {
    fetch('/api/dashboard/theme').then(r => r.json()).then(d => { setConfig(d); if (d) setColor(d.primaryColor || '#000000'); });
    fetch('/api/admin/themes').then(r => r.json()).then(setThemes);
  }, []);

  async function save() {
    await fetch('/api/dashboard/theme', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ themeId: config?.themeId || 'default', primaryColor: color }) });
    toast.success('บันทึกธีมแล้ว');
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ธีมร้าน</h1>
      <Card><CardHeader><CardTitle>เลือกธีม</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(themes.length ? themes : [
            { id: 'default', name: 'Default', isPremium: false },
            { id: 'minimal', name: 'Minimal', isPremium: false },
            { id: 'dark-gaming', name: 'Dark Gaming', isPremium: true, priceMonthly: 19900 },
            { id: 'neon', name: 'Neon', isPremium: true, priceMonthly: 19900 },
          ]).map(t => (
            <div key={t.id} className={`border rounded-lg p-4 text-center cursor-pointer hover:border-primary ${config?.themeId === t.id ? 'border-primary bg-primary/5' : ''}`} onClick={() => setConfig({ ...config, themeId: t.id })}>
              <p className="font-medium">{t.name}</p>
              {t.isPremium && <p className="text-xs text-muted-foreground">฿{(t.priceMonthly || 19900) / 100}/เดือน</p>}
              {!t.isPremium && <p className="text-xs text-green-600">ฟรี</p>}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4"><Label>สีหลัก</Label><input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-10 rounded border" /></div>
        <Button onClick={save}>บันทึก</Button>
      </CardContent></Card>
    </div>
  );
}
