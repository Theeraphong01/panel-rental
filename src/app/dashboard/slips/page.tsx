'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function SlipsPage() {
  const [slips, setSlips] = useState<any[]>([]);

  const load = () => fetch('/api/dashboard/slips').then(r => r.json()).then(setSlips);
  useEffect(() => { load(); }, []);

  async function review(id: string, status: 'approved' | 'rejected') {
    await fetch('/api/dashboard/slips', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    load();
    toast.success(status === 'approved' ? 'อนุมัติแล้ว' : 'ปฏิเสธแล้ว');
  }

  const statusColor = (s: string) => s === 'pending' ? 'secondary' : s === 'approved' ? 'default' : 'destructive';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ตรวจสอบสลิป</h1>
      <div className="space-y-2">
        {slips.map(s => (
          <div key={s.id} className="border rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{s.endUser?.name} ({s.endUser?.email})</p>
              <p className="text-sm text-muted-foreground">{s.topupPackage?.name} — ฿{s.amount / 100}</p>
              <p className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleDateString('th-TH')} {new Date(s.createdAt).toLocaleTimeString('th-TH')}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={statusColor(s.status)}>{s.status}</Badge>
              {s.status === 'pending' && (
                <div className="space-x-2">
                  <Button size="sm" onClick={() => review(s.id, 'approved')}>อนุมัติ</Button>
                  <Button size="sm" variant="destructive" onClick={() => review(s.id, 'rejected')}>ปฏิเสธ</Button>
                </div>
              )}
            </div>
          </div>
        ))}
        {slips.length === 0 && <p className="text-center text-muted-foreground py-8">ไม่มีสลิปรอตรวจสอบ</p>}
      </div>
    </div>
  );
}
