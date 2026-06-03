'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function DashboardOverview() {
  const [tenant, setTenant] = useState<any>(null);

  useEffect(() => { fetch('/api/dashboard/tenant').then(r => r.json()).then(setTenant); }, []);

  if (!tenant) return <div className="p-8">กำลังโหลด...</div>;

  const sub = tenant.subscription?.[0];
  const pkg = sub?.package;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ภาพรวมร้าน {tenant.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">แพ็คเกจ</CardTitle></CardHeader><CardContent><p className="text-xl font-bold">{pkg?.name ?? '-'}</p><p className="text-xs text-muted-foreground">หมดอายุ {sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString('th-TH') : '-'}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">สถานะ</CardTitle></CardHeader><CardContent><Badge variant={tenant.status === 'active' ? 'default' : 'secondary'} className="text-lg">{tenant.status}</Badge></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">API Keys</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{tenant._count.apiKeys}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">บริการ</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{tenant._count.services}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">หมวดหมู่</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{tenant._count.categories}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">สมาชิก</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{tenant._count.endUsers}</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>ลิงก์ร้าน</CardTitle></CardHeader><CardContent><code className="text-sm bg-muted px-2 py-1 rounded">https://{tenant.subdomain}.localhost:3000</code></CardContent></Card>
    </div>
  );
}
