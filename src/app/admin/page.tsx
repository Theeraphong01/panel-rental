'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RevenueData {
  totalUsers: number;
  activeTenants: number;
  trialTenants: number;
  activeSubs: number;
  totalRevenue: number;
  packages: { name: string; price: number; subscriptions: number }[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<RevenueData | null>(null);

  useEffect(() => {
    fetch('/api/admin/revenue').then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div className="p-8">กำลังโหลด...</div>;

  const fmt = (n: number) => (n / 100).toLocaleString('th-TH', { style: 'currency', currency: 'THB' });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ภาพรวมระบบ</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">ผู้ใช้ทั้งหมด</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{data.totalUsers}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">ร้านค้า Active</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{data.activeTenants}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">ทดลองใช้</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{data.trialTenants}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">รายได้รวม</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{fmt(data.totalRevenue)}</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Subscription แยกตามแพ็คเกจ</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.packages.map(p => (
              <div key={p.name} className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">{p.name}</span>
                <span className="text-muted-foreground">{fmt(p.price)}/เดือน — {p.subscriptions} ราย</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
