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
        <h1 className="text-2xl font-bold text-white">จัดการแพ็คเกจ</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#00F0FF] text-[#0B0F19] hover:bg-[#00F0FF]/80">+ เพิ่มแพ็คเกจ</Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1F293D] border-[#2A364F] text-white">
            <DialogHeader><DialogTitle className="text-white">เพิ่มแพ็คเกจใหม่</DialogTitle></DialogHeader>
            <form onSubmit={addPkg} className="space-y-3">
              <div><Label className="text-[#94A3B8]">ชื่อ</Label><Input name="name" required className="bg-[#0B0F19] border-[#2A364F] text-white" /></div>
              <div><Label className="text-[#94A3B8]">ราคา/เดือน (สตางค์)</Label><Input name="priceMonthly" type="number" defaultValue={49900} required className="bg-[#0B0F19] border-[#2A364F] text-white" /></div>
              <div><Label className="text-[#94A3B8]">จำนวน API Keys</Label><Input name="maxApiKeys" type="number" defaultValue={3} required className="bg-[#0B0F19] border-[#2A364F] text-white" /></div>
              <div><Label className="text-[#94A3B8]">จำนวนสมาชิกสูงสุด (เว้นว่าง = ไม่จำกัด)</Label><Input name="maxEndUsers" type="number" className="bg-[#0B0F19] border-[#2A364F] text-white" /></div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-[#94A3B8]"><input type="checkbox" name="premiumThemes" /> ธีมพรีเมียม</label>
                <label className="flex items-center gap-2 text-[#94A3B8]"><input type="checkbox" name="customDomain" /> Domain ตัวเอง</label>
              </div>
              <Button type="submit" className="w-full bg-[#00F0FF] text-[#0B0F19] hover:bg-[#00F0FF]/80">บันทึก</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-lg border border-[#2A364F] bg-[#1F293D] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-[#2A364F] hover:bg-transparent">
              <TableHead className="text-[#94A3B8]">ชื่อ</TableHead>
              <TableHead className="text-[#94A3B8]">ราคา</TableHead>
              <TableHead className="text-[#94A3B8]">API Keys</TableHead>
              <TableHead className="text-[#94A3B8]">สมาชิกสูงสุด</TableHead>
              <TableHead className="text-[#94A3B8]">พรีเมียมธีม</TableHead>
              <TableHead className="text-[#94A3B8]">Domain</TableHead>
              <TableHead className="text-[#94A3B8]">สถานะ</TableHead>
              <TableHead className="text-[#94A3B8]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.map(p => (
              <TableRow key={p.id} className="border-[#2A364F] hover:bg-[#0B0F19]/50">
                <TableCell className="font-medium text-white">{p.name}</TableCell>
                <TableCell className="text-white">฿{p.priceMonthly / 100}</TableCell>
                <TableCell className="text-white">{p.maxApiKeys}</TableCell>
                <TableCell className="text-white">{p.maxEndUsers ?? 'ไม่จำกัด'}</TableCell>
                <TableCell className="text-white">{p.premiumThemes ? '✅' : '❌'}</TableCell>
                <TableCell className="text-white">{p.customDomain ? '✅' : '❌'}</TableCell>
                <TableCell><Badge variant={p.isActive ? 'default' : 'secondary'}>{p.isActive ? 'active' : 'ปิด'}</Badge></TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" className="border-[#2A364F] text-[#94A3B8] hover:bg-[#0B0F19]/50" onClick={() => toggle(p.id, p.isActive)}>
                    {p.isActive ? 'ปิด' : 'เปิด'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
