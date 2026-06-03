'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { StatCard, PageHeader, GlassPanel, StatusBadge, LoadingState } from '@/components/premium';
import Link from 'next/link';

export default function DashboardOverview() {
  const [tenant, setTenant] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/dashboard/tenant').then(r => r.json()).then(setTenant);
    fetch('/api/dashboard/orders?limit=5').then(r => r.json()).then(setRecentOrders);
  }, []);

  if (!tenant) return <LoadingState text="กำลังโหลดข้อมูลร้าน..." />;

  const sub = tenant.subscription?.[0];
  const pkg = sub?.package;
  const stats = [
    { icon: '📦', label: 'แพ็คเกจ', value: pkg?.name ?? 'ไม่มี', trend: sub?.status === 'active' ? '+Active' : undefined },
    { icon: '🟢', label: 'สถานะ', value: tenant.status },
    { icon: '🔑', label: 'API Keys', value: String(tenant._count?.apiKeys ?? 0) },
    { icon: '⚙️', label: 'บริการ', value: String(tenant._count?.services ?? 0) },
    { icon: '👥', label: 'สมาชิก', value: String(tenant._count?.endUsers ?? 0) },
    { icon: '📁', label: 'หมวดหมู่', value: String(tenant._count?.categories ?? 0) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <PageHeader
        title={`ภาพรวมร้าน ${tenant.name}`}
        desc={sub?.currentPeriodEnd ? `หมดอายุ ${new Date(sub.currentPeriodEnd).toLocaleDateString('th-TH')}` : ''}
        action={
          <Link
            href={`https://${tenant.subdomain}.panel-rental.com`}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/20"
          >
            🌐 เปิดร้านค้า
          </Link>
        }
      />

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* Store Link */}
      <GlassPanel className="!p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm text-zinc-400">ลิงก์ร้านของคุณ</p>
            <code className="mt-1 inline-block rounded-lg bg-white/10 px-3 py-1.5 text-sm font-mono text-violet-300">
              https://{tenant.subdomain}.panel-rental.com
            </code>
          </div>
          <button
            onClick={() => { navigator.clipboard.writeText(`https://${tenant.subdomain}.panel-rental.com`); }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/20 transition-colors"
          >
            📋 คัดลอก
          </button>
        </div>
      </GlassPanel>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <GlassPanel className="!p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h2 className="text-lg font-semibold text-white">ออเดอร์ล่าสุด</h2>
          </div>
          <div className="divide-y divide-white/5">
            {recentOrders.map((o: any) => (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between px-6 py-3 hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-xs font-mono text-zinc-500 w-16 truncate">{o.panelOrderId ?? '—'}</span>
                  <span className="text-sm text-zinc-300 truncate max-w-[180px]">{o.storefrontService?.name ?? o.serviceId}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-white">฿{((o.sellPrice ?? 0) / 100).toFixed(2)}</span>
                  <StatusBadge status={o.status?.toLowerCase() || 'pending'} />
                </div>
              </motion.div>
            ))}
          </div>
          <div className="px-6 py-3 border-t border-white/5">
            <Link
              href="/dashboard/orders"
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              ดูออเดอร์ทั้งหมด →
            </Link>
          </div>
        </GlassPanel>
      )}
    </motion.div>
  );
}
