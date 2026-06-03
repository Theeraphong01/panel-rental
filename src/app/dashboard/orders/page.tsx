'use client';

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => { fetch('/api/dashboard/orders').then(r => r.json()).then(setOrders); }, []);

  const statusColor = (s: string) => s === 'Completed' ? 'default' : s === 'Pending' ? 'secondary' : s === 'In Progress' ? 'outline' : s === 'Partial' ? 'outline' : 'destructive';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ประวัติออเดอร์</h1>
      <Table>
        <TableHeader><TableRow><TableHead>Panel ID</TableHead><TableHead>ลูกค้า</TableHead><TableHead>บริการ</TableHead><TableHead>จำนวน</TableHead><TableHead>ต้นทุน</TableHead><TableHead>ราคาขาย</TableHead><TableHead>กำไร</TableHead><TableHead>สถานะ</TableHead><TableHead>วันที่</TableHead></TableRow></TableHeader>
        <TableBody>
          {orders.map(o => (
            <TableRow key={o.id}>
              <TableCell className="font-mono text-sm">{o.panelOrderId ?? '-'}</TableCell>
              <TableCell>{o.endUser?.email}</TableCell>
              <TableCell className="max-w-xs truncate">{o.storefrontService?.name}</TableCell>
              <TableCell>{o.quantity}</TableCell>
              <TableCell>฿{(o.costPrice / 100).toFixed(2)}</TableCell>
              <TableCell>฿{(o.sellPrice / 100).toFixed(2)}</TableCell>
              <TableCell className="text-green-600">฿{(o.profit / 100).toFixed(2)}</TableCell>
              <TableCell><Badge variant={statusColor(o.status)}>{o.status}</Badge></TableCell>
              <TableCell className="text-sm">{new Date(o.createdAt).toLocaleDateString('th-TH')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
