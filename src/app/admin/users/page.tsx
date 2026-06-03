'use client';

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => { fetch('/api/admin/users').then(r => r.json()).then(setUsers); }, []);

  const filtered = users.filter(u => u.email.includes(search) || u.name.includes(search));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ผู้ใช้ทั้งหมด</h1>
      <Input placeholder="ค้นหาด้วยอีเมลหรือชื่อ..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
      <Table>
        <TableHeader><TableRow><TableHead>อีเมล</TableHead><TableHead>ชื่อ</TableHead><TableHead>Role</TableHead><TableHead>ร้านค้า</TableHead><TableHead>สมัครเมื่อ</TableHead></TableRow></TableHeader>
        <TableBody>
          {filtered.map(u => (
            <TableRow key={u.id}>
              <TableCell className="font-medium">{u.email}</TableCell>
              <TableCell>{u.name}</TableCell>
              <TableCell><Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>{u.role}</Badge></TableCell>
              <TableCell>{u._count.tenants}</TableCell>
              <TableCell>{new Date(u.createdAt).toLocaleDateString('th-TH')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
