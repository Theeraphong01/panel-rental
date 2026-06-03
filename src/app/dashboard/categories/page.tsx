'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState('');

  const load = () => fetch('/api/dashboard/categories').then(r => r.json()).then(setCategories);
  useEffect(() => { load(); }, []);

  async function addCat() {
    if (!name.trim()) return;
    await fetch('/api/dashboard/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
    setName(''); load(); toast.success('เพิ่มหมวดหมู่แล้ว');
  }

  async function toggleVisible(id: string, vis: boolean) {
    await fetch(`/api/dashboard/categories/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isVisible: !vis }) });
    load();
  }

  async function delCat(id: string) {
    if (!confirm('ลบหมวดหมู่นี้? บริการในหมวดจะถูกย้ายออก')) return;
    await fetch(`/api/dashboard/categories/${id}`, { method: 'DELETE' });
    load(); toast.success('ลบแล้ว');
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">หมวดหมู่</h1>
      <div className="flex gap-2">
        <Input placeholder="ชื่อหมวดหมู่ใหม่" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCat()} />
        <Button onClick={addCat}>เพิ่ม</Button>
      </div>
      <div className="space-y-2">
        {categories.map(c => (
          <div key={c.id} className="flex items-center justify-between border rounded-lg p-3">
            <div>
              <span className="font-medium">{c.name}</span>
              <span className="text-sm text-muted-foreground ml-2">({c.slug})</span>
            </div>
            <div className="space-x-2">
              <Button size="sm" variant="outline" onClick={() => toggleVisible(c.id, c.isVisible)}>{c.isVisible ? 'ซ่อน' : 'แสดง'}</Button>
              <Button size="sm" variant="destructive" onClick={() => delCat(c.id)}>ลบ</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
