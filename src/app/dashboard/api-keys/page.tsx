'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);

  const load = () => fetch('/api/dashboard/api-keys').then(r => r.json()).then(setKeys);
  useEffect(() => { load(); }, []);

  async function addKey(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const res = await fetch('/api/dashboard/api-keys', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: f.get('label'), panelUrl: f.get('panelUrl'), apiKey: f.get('apiKey') }),
    });
    if (res.ok) { toast.success('เพิ่ม API Key แล้ว'); setOpen(false); load(); }
    else { const d = await res.json(); toast.error(d.error || 'เพิ่มไม่สำเร็จ'); }
  }

  async function testKey(id: string) {
    setTesting(id);
    const res = await fetch(`/api/dashboard/api-keys/${id}?action=test`, { method: 'POST' });
    const d = await res.json();
    if (d.ok) toast.success(`Balance: ${d.balance} ${d.currency}`);
    else toast.error(d.error || 'Test failed');
    setTesting(null);
    load();
  }

  async function removeKey(id: string) {
    if (!confirm('ลบ API Key นี้?')) return;
    await fetch(`/api/dashboard/api-keys/${id}`, { method: 'DELETE' });
    load();
    toast.success('ลบแล้ว');
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">API Keys</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button>+ เพิ่ม API Key</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>เพิ่ม API Key ใหม่</DialogTitle></DialogHeader>
            <form onSubmit={addKey} className="space-y-3">
              <div><Label>ชื่อ (label)</Label><Input name="label" placeholder="PumLF" required /></div>
              <div><Label>Panel URL</Label><Input name="panelUrl" placeholder="https://pumlf.com/api/v2" required /></div>
              <div><Label>API Key</Label><Input name="apiKey" type="password" placeholder="..." required /></div>
              <Button type="submit" className="w-full">บันทึก</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>ชื่อ</TableHead><TableHead>Panel URL</TableHead><TableHead>API Key</TableHead><TableHead>Balance</TableHead><TableHead>สถานะ</TableHead><TableHead></TableHead></TableRow></TableHeader>
        <TableBody>
          {keys.map(k => (
            <TableRow key={k.id}>
              <TableCell className="font-medium">{k.label}</TableCell>
              <TableCell className="text-sm">{k.panelUrl}</TableCell>
              <TableCell className="text-sm font-mono">{k.apiKeyEncrypted}</TableCell>
              <TableCell>{k.balanceSnapshot != null ? `฿${(k.balanceSnapshot / 100).toFixed(2)}` : '-'}</TableCell>
              <TableCell><Badge variant={k.isActive ? 'default' : 'secondary'}>{k.isActive ? 'active' : 'inactive'}</Badge></TableCell>
              <TableCell className="space-x-2">
                <Button size="sm" variant="outline" onClick={() => testKey(k.id)} disabled={testing === k.id}>{testing === k.id ? '...' : 'ทดสอบ'}</Button>
                <Button size="sm" variant="destructive" onClick={() => removeKey(k.id)}>ลบ</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
