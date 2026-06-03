'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/tenants').then(r => r.json()).then(setTenants);
  }, []);

  async function updateStatus(id: string, status: string) {
    await fetch('/api/admin/tenants', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    setTenants(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  }

  const filtered = tenants.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.subdomain?.toLowerCase().includes(search.toLowerCase()) ||
    t.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ร้านค้าทั้งหมด</h1>
        <Input placeholder="🔍 ค้นหา..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Subdomain</TableHead><TableHead>ชื่อร้าน</TableHead><TableHead>เจ้าของ</TableHead><TableHead>สถานะ</TableHead><TableHead>แพ็คเกจ</TableHead><TableHead>API Keys</TableHead><TableHead>จัดการ</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.subdomain}</TableCell>
                  <TableCell>{t.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{t.user?.email}</TableCell>
                  <TableCell><Badge variant={t.status === 'active' ? 'default' : 'secondary'}>{t.status}</Badge></TableCell>
                  <TableCell>{t.subscriptions?.[0]?.package?.name ?? '-'}</TableCell>
                  <TableCell>{t._count?.apiKeys ?? 0}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {t.status !== 'active' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateStatus(t.id, 'active')}>เปิดใช้งาน</Button>}
                      {t.status === 'active' && <Button size="sm" variant="outline" className="h-7 text-xs text-red-500" onClick={() => updateStatus(t.id, 'suspended')}>ระงับ</Button>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">ไม่พบร้านค้า</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
