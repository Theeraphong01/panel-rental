'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [editSvc, setEditSvc] = useState<any>(null);

  const load = () => {
    fetch('/api/dashboard/services').then(r => r.json()).then(setServices);
    fetch('/api/dashboard/categories').then(r => r.json()).then(setCategories);
  };
  useEffect(() => { load(); }, []);

  async function updateService(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const data: any = { name: f.get('name'), description: f.get('description') || null, categoryId: f.get('categoryId') || null, priceType: f.get('priceType') };
    if (data.priceType === 'manual') data.priceManual = Number(f.get('priceManual'));
    else data.pricePercent = Number(f.get('pricePercent'));
    await fetch(`/api/dashboard/services/${editSvc.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    toast.success('อัพเดทแล้ว');
    setEditSvc(null);
    load();
  }

  async function toggleActive(id: string, active: boolean) {
    await fetch(`/api/dashboard/services/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !active }) });
    load();
  }

  async function delService(id: string) {
    if (!confirm('ลบบริการนี้?')) return;
    await fetch(`/api/dashboard/services/${id}`, { method: 'DELETE' });
    load(); toast.success('ลบแล้ว');
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">จัดการบริการ ({services.length})</h1>
      <Table>
        <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>ชื่อ</TableHead><TableHead>หมวดหมู่</TableHead><TableHead>ต้นทุน</TableHead><TableHead>ราคาขาย</TableHead><TableHead>API Key</TableHead><TableHead>สถานะ</TableHead><TableHead></TableHead></TableRow></TableHeader>
        <TableBody>
          {services.map(s => (
            <TableRow key={s.id}>
              <TableCell>{s.serviceId}</TableCell>
              <TableCell className="font-medium max-w-xs truncate">{s.name}</TableCell>
              <TableCell>{s.category?.name || <span className="text-muted-foreground italic">uncategorized</span>}</TableCell>
              <TableCell>฿{s.panelRate?.toFixed(2)}/1k</TableCell>
              <TableCell>{s.priceType === 'manual' ? `฿${(s.priceManual / 100).toFixed(2)}` : `+${s.pricePercent}%`}</TableCell>
              <TableCell><Badge variant="outline">{s.apiKey?.label}</Badge></TableCell>
              <TableCell><Badge variant={s.isActive ? 'default' : 'secondary'}>{s.isActive ? 'เปิด' : 'ปิด'}</Badge></TableCell>
              <TableCell className="space-x-1">
                <Button size="sm" variant="outline" onClick={() => setEditSvc(s)}>แก้ไข</Button>
                <Button size="sm" variant="outline" onClick={() => toggleActive(s.id, s.isActive)}>{s.isActive ? 'ปิด' : 'เปิด'}</Button>
                <Button size="sm" variant="destructive" onClick={() => delService(s.id)}>ลบ</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!editSvc} onOpenChange={() => setEditSvc(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>แก้ไขบริการ</DialogTitle></DialogHeader>
          {editSvc && (
            <form onSubmit={updateService} className="space-y-3">
              <div><Label>ชื่อที่แสดง</Label><Input name="name" defaultValue={editSvc.name} required /></div>
              <div><Label>รายละเอียด</Label><Input name="description" defaultValue={editSvc.description || ''} /></div>
              <div>
                <Label>หมวดหมู่</Label>
                <Select name="categoryId" defaultValue={editSvc.categoryId || ''}>
                  <SelectTrigger><SelectValue placeholder="ไม่มีหมวดหมู่" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">ไม่มีหมวดหมู่</SelectItem>
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>วิธีคิดราคา</Label>
                <Select name="priceType" defaultValue={editSvc.priceType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">+% จากต้นทุน</SelectItem>
                    <SelectItem value="manual">กำหนดเอง (บาท)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>% markup (ถ้า +%)</Label><Input name="pricePercent" type="number" defaultValue={editSvc.pricePercent} /></div>
              <div><Label>ราคาขาย (สตางค์) (ถ้ากำหนดเอง)</Label><Input name="priceManual" type="number" defaultValue={editSvc.priceManual || ''} /></div>
              <Button type="submit" className="w-full">บันทึก</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
