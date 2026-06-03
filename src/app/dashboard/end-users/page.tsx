'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function EndUsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  const load = () => fetch('/api/dashboard/end-users').then(r => r.json()).then(setUsers);
  useEffect(() => { load(); }, []);

  async function toggleStatus(id: string, current: string) {
    await fetch(`/api/dashboard/end-users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: current === 'active' ? 'suspended' : 'active' }) });
    load(); toast.success('อัพเดทแล้ว');
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">สมาชิกร้าน</h1>
      <Table>
        <TableHeader><TableRow><TableHead>อีเมล</TableHead><TableHead>ชื่อ</TableHead><TableHead>Balance</TableHead><TableHead>ออเดอร์</TableHead><TableHead>สมัครเมื่อ</TableHead><TableHead>สถานะ</TableHead><TableHead></TableHead></TableRow></TableHeader>
        <TableBody>
          {users.map(u => (
            <TableRow key={u.id}>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.name}</TableCell>
              <TableCell>฿{u.balance / 100}</TableCell>
              <TableCell>{u._count.orders}</TableCell>
              <TableCell>{new Date(u.createdAt).toLocaleDateString('th-TH')}</TableCell>
              <TableCell><Badge variant={u.status === 'active' ? 'default' : 'secondary'}>{u.status}</Badge></TableCell>
              <TableCell><Button size="sm" variant="outline" onClick={() => toggleStatus(u.id, u.status)}>{u.status === 'active' ? 'ระงับ' : 'เปิด'}</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
