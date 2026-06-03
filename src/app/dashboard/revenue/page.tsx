'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RevenuePage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => { fetch('/api/dashboard/revenue').then(r => r.json()).then(setData); }, []);

  if (!data) return <div className="p-8">กำลังโหลด...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">รายได้</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">ออเดอร์ทั้งหมด</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{data.totalOrders}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">รายได้รวม</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">฿{(data.totalRevenue / 100).toFixed(2)}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">กำไร</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-green-600">฿{(data.totalProfit / 100).toFixed(2)}</p></CardContent></Card>
      </div>
      {data.topServices?.length > 0 && (
        <Card><CardHeader><CardTitle>บริการทำกำไรสูงสุด</CardTitle></CardHeader><CardContent>
          <div className="space-y-2">
            {data.topServices.map((s: any, i: number) => (
              <div key={i} className="flex justify-between border-b pb-2">
                <span className="font-medium truncate">{s.name}</span>
                <span className="text-muted-foreground">{s.quantity} orders — ฿{(s.profit / 100).toFixed(2)} กำไร</span>
              </div>
            ))}
          </div>
        </CardContent></Card>
      )}
    </div>
  );
}
