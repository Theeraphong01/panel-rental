'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function AdminPackages() {
  const [packages, setPackages] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const load = () => fetch('/api/admin/packages').then(r => r.json()).then(setPackages);
  useEffect(() => { load(); }, []);

  async function addPkg(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const res = await fetch('/api/admin/packages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: f.get('name'), priceMonthly: Number(f.get('priceMonthly')),
        maxApiKeys: Number(f.get('maxApiKeys')), maxEndUsers: f.get('maxEndUsers') ? Number(f.get('maxEndUsers')) : null,
        premiumThemes: f.get('premiumThemes') === 'on', customDomain: f.get('customDomain') === 'on',
      }),
    });
    if (res.ok) { toast.success('เพิ่มแพ็คเกจแล้ว'); setOpen(false); load(); }
    else toast.error('เพิ่มไม่สำเร็จ');
  }

  async function toggle(id: string, active: boolean) {
    await fetch(`/api/admin/packages/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !active }) });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">จัดการแพ็คเกจ</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button>+ เพิ่มแพ็คเกจ</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>เพิ่มแพ็คเกจใหม่</DialogTitle></DialogHeader>
            <form onSubmit={addPkg} className="space-y-3">
              <div><Label>ชื่อ</Label><Input name="name" required /></div>
              <div><Label>ราคา/เดือน (สตางค์)</Label><Input name="priceMonthly" type="number" defaultValue={49900} required /></div>
              <div><Label>จำนวน API Keys</Label><Input name="maxApiKeys" type="number" defaultValue={3} required /></div>
              <div><Label>จำนวนสมาชิกสูงสุด (เว้นว่าง = ไม่จำกัด)</Label><Input name="maxEndUsers" type="number" /></div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2"><input type="checkbox" name="premiumThemes" /> ธีมพรีเมียม</label>
                <label className="flex items-center gap-2"><input type="checkbox" name="customDomain" /> Domain ตัวเอง</label>
              </div>
              <Button type="submit" className="w-full">บันทึก</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>ชื่อ</TableHead><TableHead>ราคา</TableHead><TableHead>API Keys</TableHead><TableHead>สมาชิกสูงสุด</TableHead><TableHead>พรีเมียมธีม</TableHead><TableHead>Domain</TableHead><TableHead>สถานะ</TableHead><TableHead></TableHead></TableRow></TableHeader>
        <TableBody>
          {packages.map(p => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.name}</TableCell>
              <TableCell>฿{p.priceMonthly / 100}</TableCell>
              <TableCell>{p.maxApiKeys}</TableCell>
              <TableCell>{p.maxEndUsers ?? 'ไม่จำกัด'}</TableCell>
              <TableCell>{p.premiumThemes ? '✅' : '❌'}</TableCell>
              <TableCell>{p.customDomain ? '✅' : '❌'}</TableCell>
              <TableCell><Badge variant={p.isActive ? 'default' : 'secondary'}>{p.isActive ? 'active' : 'ปิด'}</Badge></TableCell>
              <TableCell><Button size="sm" variant="outline" onClick={() => toggle(p.id, p.isActive)}>{p.isActive ? 'ปิด' : 'เปิด'}</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
