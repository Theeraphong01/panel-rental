'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PageHeader, GlassPanel, StatCard, LoadingState, EmptyState } from '@/components/premium';

export default function RevenuePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/revenue')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="กำลังโหลดข้อมูลรายได้..." />;

  if (!data) return <EmptyState icon="📈" title="ไม่มีข้อมูล" desc="ไม่สามารถโหลดข้อมูลรายได้ กรุณาลองใหม่" />;

  const margin = data.totalRevenue > 0
    ? ((data.totalProfit / data.totalRevenue) * 100).toFixed(1)
    : '0.0';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <PageHeader
        title="รายได้"
        desc="ภาพรวมรายได้และกำไรของร้านคุณ"
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0, duration: 0.4 }}
        >
          <StatCard
            icon="📋"
            label="ออเดอร์ทั้งหมด"
            value={String(data.totalOrders ?? 0)}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <StatCard
            icon="💰"
            label="รายได้รวม"
            value={`฿${((data.totalRevenue ?? 0) / 100).toFixed(2)}`}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <StatCard
            icon="📈"
            label="กำไรสุทธิ"
            value={`฿${((data.totalProfit ?? 0) / 100).toFixed(2)}`}
            trend={Number(margin) > 0 ? `+${margin}%` : `${margin}%`}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <StatCard
            icon="🎯"
            label="อัตรากำไร"
            value={`${margin}%`}
          />
        </motion.div>
      </div>

      {/* Top Services Chart */}
      {data.topServices?.length > 0 ? (
        <GlassPanel>
          <h2 className="text-lg font-semibold text-white mb-6">บริการทำกำไรสูงสุด</h2>
          <div className="space-y-3">
            {data.topServices.map((s: any, i: number) => {
              const maxProfit = data.topServices[0]?.profit || 1;
              const barWidth = Math.max(4, (s.profit / maxProfit) * 100);
              const barColors = [
                'from-violet-500 to-fuchsia-500',
                'from-violet-500/80 to-fuchsia-500/80',
                'from-violet-500/60 to-fuchsia-500/60',
                'from-violet-500/40 to-fuchsia-500/40',
                'from-violet-500/30 to-fuchsia-500/30',
              ];
              const barColor = barColors[Math.min(i, barColors.length - 1)];

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  className="group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-zinc-300 truncate max-w-[60%]">{s.name}</span>
                    <span className="text-xs text-zinc-500 tabular-nums">
                      {s.quantity} orders · ฿{((s.profit ?? 0) / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="relative h-2.5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ delay: 0.6 + i * 0.08, duration: 0.8, ease: 'easeOut' }}
                      className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${barColor}`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </GlassPanel>
      ) : (
        <EmptyState
          icon="📊"
          title="ยังไม่มีข้อมูลบริการ"
          desc="ข้อมูลบริการทำกำไรจะแสดงที่นี่เมื่อมีออเดอร์"
        />
      )}

      {/* Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassPanel>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <span className="text-lg">💵</span>
            </div>
            <div>
              <p className="text-xs text-zinc-500">ต้นทุนรวม</p>
              <p className="text-lg font-bold text-white">
                ฿{((data.totalCost ?? 0) / 100).toFixed(2)}
              </p>
            </div>
          </div>
        </GlassPanel>
        <GlassPanel>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
              <span className="text-lg">🧾</span>
            </div>
            <div>
              <p className="text-xs text-zinc-500">กำไรต่อออเดอร์เฉลี่ย</p>
              <p className="text-lg font-bold text-white">
                ฿{data.totalOrders > 0
                  ? (((data.totalProfit ?? 0) / data.totalOrders) / 100).toFixed(2)
                  : '0.00'}
              </p>
            </div>
          </div>
        </GlassPanel>
      </div>
    </motion.div>
  );
}
