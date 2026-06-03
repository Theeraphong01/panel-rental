'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function BulkPricePage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [priceType, setPriceType] = useState('percent');
  const [value, setValue] = useState('');
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => { fetch('/api/dashboard/categories').then(r => r.json()).then(setCategories); }, []);
  useEffect(() => {
    if (!selectedCat) return;
    fetch(`/api/dashboard/services?categoryId=${selectedCat}`).then(r => r.json()).then(setServices);
  }, [selectedCat]);

  async function apply() {
    if (!selectedCat || !value) return;
    const val = Number(value);
    let count = 0;
    for (const s of services) {
      const data: any = { priceType };
      if (priceType === 'manual') data.priceManual = val;
      else data.pricePercent = val;
      await fetch(`/api/dashboard/services/${s.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      count++;
    }
    toast.success(`อัพเดทราคา ${count} บริการ`);
    setValue('');
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ตั้งราคาทั้งหมวดหมู่</h1>
      <Card>
        <CardHeader><CardTitle>เลือกหมวดหมู่</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedCat} onValueChange={setSelectedCat}>
            <SelectTrigger><SelectValue placeholder="เลือกหมวดหมู่" /></SelectTrigger>
            <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
          {services.length > 0 && <p className="text-sm text-muted-foreground">{services.length} บริการในหมวดนี้</p>}
          <div className="flex gap-4 items-end">
            <div><Label>วิธีคิดราคา</Label>
              <Select value={priceType} onValueChange={setPriceType}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="percent">+%</SelectItem><SelectItem value="manual">฿ (สตางค์)</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="flex-1"><Label>{priceType === 'manual' ? 'ราคา (สตางค์)' : '% markup'}</Label><Input value={value} onChange={e => setValue(e.target.value)} type="number" /></div>
            <Button onClick={apply} disabled={!selectedCat || !value}>ปรับทั้งหมด</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
