'use client';

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function AdminTenants() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => { fetch('/api/admin/tenants').then(r => r.json()).then(setTenants); }, []);

  async function toggleStatus(id: string, current: string) {
    const newStatus = current === 'active' ? 'suspended' : 'active';
    await fetch(`/api/admin/tenants`, { 
      method: 'PATCH', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ id, status: newStatus }) 
    });
    setTenants(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    toast.success(`เปลี่ยนสถานะเป็น ${newStatus}`);
  }

  const filtered = tenants.filter(t => t.name.includes(search) || t.subdomain.includes(search) || t.user?.email?.includes(search));

  const statusVariant = (s: string) => s === 'active' ? 'default' : s === 'trial' ? 'secondary' : 'destructive';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ร้านค้าทั้งหมด</h1>
      <Input placeholder="ค้นหา..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
      <Table>
        <TableHeader><TableRow><TableHead>Subdomain</TableHead><TableHead>ชื่อร้าน</TableHead><TableHead>เจ้าของ</TableHead><TableHead>แพ็คเกจ</TableHead><TableHead>API Keys</TableHead><TableHead>สมาชิก</TableHead><TableHead>บริการ</TableHead><TableHead>สถานะ</TableHead><TableHead></TableHead></TableRow></TableHeader>
        <TableBody>
          {filtered.map(t => (
            <TableRow key={t.id}>
              <TableCell className="font-medium">{t.subdomain}</TableCell>
              <TableCell>{t.name}</TableCell>
              <TableCell>{t.user?.email}</TableCell>
              <TableCell>{t.subscription?.[0]?.package?.name ?? '-'}</TableCell>
              <TableCell>{t._count.apiKeys}</TableCell>
              <TableCell>{t._count.endUsers}</TableCell>
              <TableCell>{t._count.services}</TableCell>
              <TableCell><Badge variant={statusVariant(t.status)}>{t.status}</Badge></TableCell>
              <TableCell>
                <Button size="sm" variant="outline" onClick={() => toggleStatus(t.id, t.status)}>
                  {t.status === 'active' ? 'ระงับ' : 'เปิด'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
