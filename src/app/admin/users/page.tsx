'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/users').then(r => r.json()).then(setUsers);
  }, []);

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">ผู้ใช้ทั้งหมด</h1>
        <Input
          placeholder="🔍 ค้นหาอีเมลหรือชื่อ..."
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
                <TableHead className="text-[#94A3B8]">อีเมล</TableHead>
                <TableHead className="text-[#94A3B8]">ชื่อ</TableHead>
                <TableHead className="text-[#94A3B8]">Role</TableHead>
                <TableHead className="text-[#94A3B8]">Tenants</TableHead>
                <TableHead className="text-[#94A3B8]">สมัครเมื่อ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u, i) => (
                <TableRow key={u.id} className="border-[#2A364F] hover:bg-[#0B0F19]/50 animate-in fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                  <TableCell className="font-medium text-white">{u.email}</TableCell>
                  <TableCell className="text-[#94A3B8]">{u.name}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>{u.role}</Badge>
                  </TableCell>
                  <TableCell className="text-white">{u._count?.tenants ?? 0}</TableCell>
                  <TableCell className="text-[#94A3B8] text-sm">{new Date(u.createdAt).toLocaleDateString('th-TH')}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow className="border-[#2A364F]">
                  <TableCell colSpan={5} className="text-center py-8 text-[#94A3B8]">ไม่พบผู้ใช้</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
