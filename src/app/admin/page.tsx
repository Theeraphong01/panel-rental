'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { StatCard, PageHeader, GlassPanel, LoadingState } from '@/components/premium';

interface RevenueData {
  totalUsers: number;
  activeTenants: number;
  trialTenants: number;
  activeSubs: number;
  mrr: number;
  totalRevenue: number;
  packages: { name: string; price: number; subscriptions: number }[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const fmtTHB = (n: number) =>
  (n / 100).toLocaleString('th-TH', { style: 'currency', currency: 'THB' });

const fmtShort = (n: number) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
};

export default function AdminDashboard() {
  const [data, setData] = useState<RevenueData | null>(null);

  useEffect(() => {
    fetch('/api/admin/revenue')
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) return <LoadingState text="กำลังโหลดข้อมูล..." />;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="📊 ภาพรวมระบบ"
        desc="สถิติและรายได้โดยรวมของแพลตฟอร์ม PanelRental"
      />

      {/* Stat Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={item}>
          <StatCard
            icon="👥"
            label="ผู้ใช้ทั้งหมด"
            value={String(data.totalUsers)}
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            icon="🏪"
            label="ร้านค้า Active"
            value={String(data.activeTenants)}
            trend={data.activeTenants > 0 ? '+' + data.activeTenants : undefined}
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            icon="🧪"
            label="ทดลองใช้"
            value={String(data.trialTenants)}
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            icon="💰"
            label="รายได้รวม"
            value={fmtTHB(data.totalRevenue)}
            trend={data.mrr > 0 ? '+฿' + fmtShort(data.mrr) + '/เดือน' : undefined}
          />
        </motion.div>
      </motion.div>

      {/* Subscription Breakdown */}
      <GlassPanel>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-lg font-bold text-white mb-1">
            📦 Subscription แยกตามแพ็คเกจ
          </h2>
          <p className="text-sm text-zinc-400 mb-5">
            จำนวนผู้สมัครใช้งานในแต่ละแพ็คเกจ
          </p>

          {data.packages.length === 0 ? (
            <p className="text-zinc-500 text-sm py-6 text-center">
              ยังไม่มีแพ็คเกจ
            </p>
          ) : (
            <div className="space-y-2">
              {data.packages.map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.06, duration: 0.35 }}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 hover:border-violet-500/20 hover:bg-white/[0.06] transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-white">
                      {p.name}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {fmtTHB(p.price)}/เดือน
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-violet-300 tabular-nums">
                      {p.subscriptions}
                    </span>
                    <span className="text-xs text-zinc-500">ราย</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </GlassPanel>

      {/* Quick Stats Footer */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <GlassPanel padded className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">Active Subscriptions</span>
          <span className="text-xl font-black text-white tabular-nums">
            {data.activeSubs}
          </span>
        </GlassPanel>
        <GlassPanel padded className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">MRR (รายได้ต่อเดือน)</span>
          <span className="text-xl font-black text-emerald-300 tabular-nums">
            {fmtTHB(data.mrr)}
          </span>
        </GlassPanel>
      </motion.div>
    </div>
  );
}
