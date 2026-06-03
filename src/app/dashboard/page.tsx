'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ExternalLink, Copy } from 'lucide-react';
import { toast } from 'sonner';

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30',
    completed: 'bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    processing: 'bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/30',
    failed: 'bg-red-500/10 text-red-400 border-red-500/30',
    partial: 'bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30',
    inactive: 'bg-[#94A3B8]/20 text-[#94A3B8] border-[#94A3B8]/30',
  };
  const c = colors[status.toLowerCase()] || 'bg-[#94A3B8]/10 text-[#94A3B8] border-[#94A3B8]/30';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${c}`}>
      {status}
    </span>
  );
}

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  trend?: string;
  color?: string;
}

function StatCard({ icon, label, value, trend, color = '#00F0FF' }: StatCardProps) {
  return (
    <div className="group relative rounded-lg border border-[#2A364F] bg-[#1F293D] p-5 hover:border-[#00F0FF]/20 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {trend && (
          <span className={`text-xs font-medium ${trend.startsWith('+') ? 'text-[#00E676]' : 'text-red-400'}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-[#94A3B8]">{label}</div>
    </div>
  );
}

export default function DashboardOverview() {
  const [tenant, setTenant] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/dashboard/tenant').then((r) => r.json()).then(setTenant);
    fetch('/api/dashboard/orders?limit=5').then((r) => r.json()).then(setRecentOrders);
  }, []);

  if (!tenant) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#00F0FF]/30 border-t-[#00F0FF] rounded-full animate-spin" />
        <p className="mt-4 text-sm text-[#94A3B8]">กำลังโหลดข้อมูลร้าน...</p>
      </div>
    );
  }

  const sub = tenant.subscriptions?.[0];
  const pkg = sub?.package;
  const stats = [
    { icon: '📦', label: 'แพ็คเกจ', value: pkg?.name ?? 'ไม่มี', trend: sub?.status === 'active' ? '+Active' : undefined, color: '#00F0FF' },
    { icon: '🟢', label: 'สถานะ', value: tenant.status, color: '#00E676' },
    { icon: '🔑', label: 'API Keys', value: String(tenant._count?.apiKeys ?? 0), color: '#00F0FF' },
    { icon: '⚙️', label: 'บริการ', value: String(tenant._count?.services ?? 0), color: '#00F0FF' },
    { icon: '👥', label: 'สมาชิก', value: String(tenant._count?.endUsers ?? 0), color: '#00F0FF' },
    { icon: '📁', label: 'หมวดหมู่', value: String(tenant._count?.categories ?? 0), color: '#00F0FF' },
  ];

  const storeUrl = `https://${tenant.subdomain}.panel-rental.com`;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            ภาพรวมร้าน {tenant.name}
          </h1>
          {sub?.currentPeriodEnd && (
            <p className="mt-1 text-sm text-[#94A3B8]">
              หมดอายุ {new Date(sub.currentPeriodEnd).toLocaleDateString('th-TH')}
            </p>
          )}
        </div>
        <Link
          href={storeUrl}
          target="_blank"
          className="inline-flex items-center gap-2 rounded-lg bg-[#00F0FF] px-4 py-2 text-sm font-medium text-[#0B0F19] hover:bg-[#00F0FF]/80 transition-all"
        >
          <ExternalLink className="w-4 h-4" />
          เปิดร้านค้า
        </Link>
      </div>

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
      <div className="rounded-lg border border-[#2A364F] bg-[#1F293D] p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm text-[#94A3B8]">ลิงก์ร้านของคุณ</p>
            <code className="mt-1 inline-block rounded-lg bg-[#0B0F19]/50 px-3 py-1.5 text-sm font-mono text-[#00F0FF]">
              {storeUrl}
            </code>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(storeUrl);
              toast.success('คัดลอกลิงก์แล้ว');
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#2A364F] px-3 py-1.5 text-xs text-[#94A3B8] hover:bg-[#0B0F19]/50 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            คัดลอก
          </button>
        </div>
      </div>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <div className="rounded-lg border border-[#2A364F] bg-[#1F293D] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2A364F]">
            <h2 className="text-lg font-semibold text-white">ออเดอร์ล่าสุด</h2>
          </div>
          <div className="divide-y divide-[#2A364F]">
            {recentOrders.map((o: any) => (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between px-6 py-3 hover:bg-[#0B0F19]/30 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-xs font-mono text-[#94A3B8] w-16 truncate">{o.panelOrderId ?? '—'}</span>
                  <span className="text-sm text-[#94A3B8] truncate max-w-[180px]">
                    {o.storefrontService?.name ?? o.serviceId}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-white">฿{((o.sellPrice ?? 0) / 100).toFixed(2)}</span>
                  <StatusBadge status={o.status?.toLowerCase() || 'pending'} />
                </div>
              </motion.div>
            ))}
          </div>
          <div className="px-6 py-3 border-t border-[#2A364F]">
            <Link href="/dashboard/orders" className="text-xs text-[#00F0FF] hover:text-[#00F0FF]/80 transition-colors">
              ดูออเดอร์ทั้งหมด →
            </Link>
          </div>
        </div>
      )}
    </motion.div>
  );
}
