'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function TopupConfigPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [bonus, setBonus] = useState('');

  const load = () => fetch('/api/dashboard/topup-packages').then(r => r.json()).then(setPackages);
  useEffect(() => { load(); }, []);

  async function addPkg() {
    if (!name || !price) return;
    await fetch('/api/dashboard/topup-packages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, price: Number(price), bonus: Number(bonus) || 0 }) });
    setName(''); setPrice(''); setBonus('');
    load(); toast.success('เพิ่มแพ็คเกจแล้ว');
  }

  async function removePkg(id: string) {
    await fetch(`/api/dashboard/topup-packages/${id}`, { method: 'DELETE' });
    load(); toast.success('ลบแล้ว');
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ตั้งค่าแพ็คเกจเติมเงิน</h1>
      <Card><CardHeader><CardTitle>เพิ่มแพ็คเกจ</CardTitle></CardHeader><CardContent className="space-y-2">
        <div className="flex gap-2 items-end">
          <div className="flex-1"><Label>ชื่อ</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="แพ็ค 100 บาท" /></div>
          <div className="w-32"><Label>ราคา (สตางค์)</Label><Input value={price} onChange={e => setPrice(e.target.value)} type="number" placeholder="10000" /></div>
          <div className="w-32"><Label>โบนัส (สตางค์)</Label><Input value={bonus} onChange={e => setBonus(e.target.value)} type="number" placeholder="0" /></div>
          <Button onClick={addPkg}>เพิ่ม</Button>
        </div>
      </CardContent></Card>
      <div className="space-y-2">
        {packages.map(p => (
          <div key={p.id} className="flex items-center justify-between border rounded-lg p-3">
            <div><span className="font-medium">{p.name}</span> <span className="text-sm text-muted-foreground">฿{p.price / 100} + โบนัส ฿{p.bonus / 100}</span></div>
            <Button size="sm" variant="destructive" onClick={() => removePkg(p.id)}>ลบ</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
