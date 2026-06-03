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
        <h1 className="text-2xl font-bold text-white">ร้านค้าทั้งหมด</h1>
        <Input
          placeholder="🔍 ค้นหา..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs bg-[#1F293D] border-[#2A364F] text-white placeholder-[#94A3B8]/50"
        />
      </div>
      <Card className="bg-[#1F293D] border-[#2A364F]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#2A364F] hover:bg-transparent">
                <TableHead className="text-[#94A3B8]">Subdomain</TableHead>
                <TableHead className="text-[#94A3B8]">ชื่อร้าน</TableHead>
                <TableHead className="text-[#94A3B8]">เจ้าของ</TableHead>
                <TableHead className="text-[#94A3B8]">สถานะ</TableHead>
                <TableHead className="text-[#94A3B8]">แพ็คเกจ</TableHead>
                <TableHead className="text-[#94A3B8]">Panels</TableHead>
                <TableHead className="text-[#94A3B8]">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(t => (
                <TableRow key={t.id} className="border-[#2A364F] hover:bg-[#0B0F19]/50">
                  <TableCell className="font-medium text-white">{t.subdomain}</TableCell>
                  <TableCell className="text-white">{t.name}</TableCell>
                  <TableCell className="text-sm text-[#94A3B8]">{t.user?.email}</TableCell>
                  <TableCell>
                    <Badge variant={t.status === 'active' ? 'default' : 'secondary'}>{t.status}</Badge>
                  </TableCell>
                  <TableCell className="text-[#94A3B8]">{t.subscriptions?.[0]?.package?.name ?? '-'}</TableCell>
                  <TableCell className="text-white">{t._count?.apiKeys ?? 0}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {t.status !== 'active' && (
                        <Button size="sm" variant="outline" className="h-7 text-xs border-[#00E676]/50 text-[#00E676] hover:bg-[#00E676]/10" onClick={() => updateStatus(t.id, 'active')}>
                          เปิดใช้งาน
                        </Button>
                      )}
                      {t.status === 'active' && (
                        <Button size="sm" variant="outline" className="h-7 text-xs border-red-500/50 text-red-400 hover:bg-red-500/10" onClick={() => updateStatus(t.id, 'suspended')}>
                          ระงับ
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow className="border-[#2A364F]">
                  <TableCell colSpan={7} className="text-center py-8 text-[#94A3B8]">ไม่พบร้านค้า</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
