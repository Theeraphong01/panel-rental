'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  trend?: string;
}

function StatCard({ icon, label, value, trend }: StatCardProps) {
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

export default function RevenuePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/revenue')
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#00F0FF]/30 border-t-[#00F0FF] rounded-full animate-spin" />
        <p className="mt-4 text-sm text-[#94A3B8]">กำลังโหลดข้อมูลรายได้...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-5xl mb-4">📈</div>
        <h3 className="text-lg font-semibold text-white">ไม่มีข้อมูล</h3>
        <p className="mt-2 text-sm text-[#94A3B8]">ไม่สามารถโหลดข้อมูลรายได้ กรุณาลองใหม่</p>
      </div>
    );
  }

  const margin =
    data.totalRevenue > 0 ? ((data.totalProfit / data.totalRevenue) * 100).toFixed(1) : '0.0';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">รายได้</h1>
        <p className="mt-1 text-sm text-[#94A3B8]">ภาพรวมรายได้และกำไรของร้านคุณ</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0, duration: 0.4 }}
        >
          <StatCard icon="📋" label="ออเดอร์ทั้งหมด" value={String(data.totalOrders ?? 0)} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <StatCard
            icon="💰"
            label="รายได้รวม"
            value={`฿${((data.totalRevenue ?? 0) / 100).toFixed(2)}`}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
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
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <StatCard icon="🎯" label="อัตรากำไร" value={`${margin}%`} />
        </motion.div>
      </div>

      {/* Top Services Chart */}
      {data.topServices?.length > 0 ? (
        <div className="rounded-lg border border-[#2A364F] bg-[#1F293D] p-6">
          <h2 className="text-lg font-semibold text-white mb-6">บริการทำกำไรสูงสุด</h2>
          <div className="space-y-3">
            {data.topServices.map((s: any, i: number) => {
              const maxProfit = data.topServices[0]?.profit || 1;
              const barWidth = Math.max(4, (s.profit / maxProfit) * 100);
              const barColors = [
                'from-[#00F0FF] to-[#00E676]',
                'from-[#00F0FF]/80 to-[#00E676]/80',
                'from-[#00F0FF]/60 to-[#00E676]/60',
                'from-[#00F0FF]/40 to-[#00E676]/40',
                'from-[#00F0FF]/30 to-[#00E676]/30',
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
                    <span className="text-sm text-[#94A3B8] truncate max-w-[60%]">{s.name}</span>
                    <span className="text-xs text-[#94A3B8] tabular-nums">
                      {s.quantity} orders · ฿{((s.profit ?? 0) / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="relative h-2.5 rounded-full bg-[#0B0F19]/50 overflow-hidden">
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
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-5xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-white">ยังไม่มีข้อมูลบริการ</h3>
          <p className="mt-2 text-sm text-[#94A3B8]">ข้อมูลบริการทำกำไรจะแสดงที่นี่เมื่อมีออเดอร์</p>
        </div>
      )}

      {/* Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-[#2A364F] bg-[#1F293D] p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00E676]/10">
              <span className="text-lg">💵</span>
            </div>
            <div>
              <p className="text-xs text-[#94A3B8]">ต้นทุนรวม</p>
              <p className="text-lg font-bold text-white">
                ฿{((data.totalCost ?? 0) / 100).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[#2A364F] bg-[#1F293D] p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00F0FF]/10">
              <span className="text-lg">🧾</span>
            </div>
            <div>
              <p className="text-xs text-[#94A3B8]">กำไรต่อออเดอร์เฉลี่ย</p>
              <p className="text-lg font-bold text-white">
                ฿{data.totalOrders > 0 ? (((data.totalProfit ?? 0) / data.totalOrders) / 100).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
