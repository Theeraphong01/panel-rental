'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RevenueData {
  totalUsers: number;
  activeTenants: number;
  trialTenants: number;
  activeSubs: number;
  mrr: number;
  totalRevenue: number;
  packages: { name: string; price: number; subscriptions: number }[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<RevenueData | null>(null);

  useEffect(() => {
    fetch('/api/admin/revenue').then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div className="p-8 text-[#94A3B8]">กำลังโหลด...</div>;

  const fmt = (n: number) => (n / 100).toLocaleString('th-TH', { style: 'currency', currency: 'THB' });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">ภาพรวมระบบ</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#1F293D] border-[#2A364F]">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-[#94A3B8]">ผู้ใช้ทั้งหมด</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-white">{data.totalUsers}</p></CardContent>
        </Card>
        <Card className="bg-[#1F293D] border-[#2A364F]">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-[#94A3B8]">ร้านค้า Active</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-white">{data.activeTenants}</p></CardContent>
        </Card>
        <Card className="bg-[#1F293D] border-[#2A364F]">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-[#94A3B8]">ทดลองใช้</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-white">{data.trialTenants}</p></CardContent>
        </Card>
        <Card className="bg-[#1F293D] border-[#2A364F]">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-[#94A3B8]">MRR</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-white">{fmt(data.mrr)}</p></CardContent>
        </Card>
        <Card className="bg-[#1F293D] border-[#2A364F]">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-[#94A3B8]">รายได้รวม</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-[#00E676]">{fmt(data.totalRevenue)}</p></CardContent>
        </Card>
        <Card className="bg-[#1F293D] border-[#2A364F]">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-[#94A3B8]">Active Subs</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-white">{data.activeSubs}</p></CardContent>
        </Card>
      </div>
      <Card className="bg-[#1F293D] border-[#2A364F]">
        <CardHeader><CardTitle className="text-white">Subscription แยกตามแพ็คเกจ</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.packages.map(p => (
              <div key={p.name} className="flex justify-between items-center border-b border-[#2A364F] pb-2">
                <span className="font-medium text-white">{p.name}</span>
                <span className="text-[#94A3B8]">{fmt(p.price)}/เดือน — {p.subscriptions} ราย</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
