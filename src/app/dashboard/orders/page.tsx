'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PageHeader, GlassPanel, StatusBadge, LoadingState, EmptyState } from '@/components/premium';

const PAGE_SIZE = 15;

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch('/api/dashboard/orders')
      .then(r => r.json())
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    let result = orders;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(o =>
        o.panelOrderId?.toLowerCase().includes(q) ||
        o.endUser?.email?.toLowerCase().includes(q) ||
        o.storefrontService?.name?.toLowerCase().includes(q)
      );
    }
    if (statusFilter) {
      result = result.filter(o => o.status?.toLowerCase() === statusFilter.toLowerCase());
    }
    return result;
  }, [orders, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const statuses = ['Completed', 'Pending', 'In Progress', 'Partial', 'Failed', 'Cancelled'];

  if (loading) return <LoadingState text="กำลังโหลดออเดอร์..." />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <PageHeader
        title="ประวัติออเดอร์"
        desc={`${orders.length} ออเดอร์ทั้งหมด`}
      />

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">🔍</span>
          <input
            type="text"
            placeholder="ค้นหา Panel ID, ลูกค้า, หรือบริการ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-violet-500/50 focus:outline-none transition-all"
        >
          <option value="">ทุกสถานะ</option>
          {statuses.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="📋"
          title={orders.length === 0 ? "ยังไม่มีออเดอร์" : "ไม่พบออเดอร์"}
          desc={orders.length === 0 ? "ออเดอร์จะปรากฏที่นี่เมื่อมีลูกค้าสั่งซื้อ" : "ลองเปลี่ยนคำค้นหาหรือตัวกรองสถานะ"}
        />
      ) : (
        <>
          <GlassPanel className="!p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-xs text-zinc-500">
                    <th className="text-left px-6 py-3 font-medium">Panel ID</th>
                    <th className="text-left px-6 py-3 font-medium">ลูกค้า</th>
                    <th className="text-left px-6 py-3 font-medium">บริการ</th>
                    <th className="text-right px-6 py-3 font-medium">จำนวน</th>
                    <th className="text-right px-6 py-3 font-medium">ต้นทุน</th>
                    <th className="text-right px-6 py-3 font-medium">ราคาขาย</th>
                    <th className="text-right px-6 py-3 font-medium">กำไร</th>
                    <th className="text-center px-6 py-3 font-medium">สถานะ</th>
                    <th className="text-right px-6 py-3 font-medium">วันที่</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paged.map((o, i) => (
                    <motion.tr
                      key={o.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-6 py-3.5 font-mono text-xs text-zinc-500">{o.panelOrderId || '—'}</td>
                      <td className="px-6 py-3.5 text-zinc-300 max-w-[150px] truncate">{o.endUser?.email || '—'}</td>
                      <td className="px-6 py-3.5 text-white max-w-[180px] truncate">{o.storefrontService?.name || '—'}</td>
                      <td className="px-6 py-3.5 text-right text-zinc-300 font-mono">{o.quantity}</td>
                      <td className="px-6 py-3.5 text-right text-zinc-400 font-mono text-xs">฿{((o.costPrice ?? 0) / 100).toFixed(2)}</td>
                      <td className="px-6 py-3.5 text-right text-white font-mono text-xs">฿{((o.sellPrice ?? 0) / 100).toFixed(2)}</td>
                      <td className="px-6 py-3.5 text-right font-mono text-xs">
                        <span className={((o.profit ?? 0) > 0) ? 'text-emerald-400' : ((o.profit ?? 0) < 0) ? 'text-red-400' : 'text-zinc-400'}>
                          ฿{((o.profit ?? 0) / 100).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <StatusBadge status={o.status?.toLowerCase() || 'pending'} />
                      </td>
                      <td className="px-6 py-3.5 text-right text-xs text-zinc-500">
                        {new Date(o.createdAt).toLocaleDateString('th-TH')}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-white/5">
              <span className="text-xs text-zinc-500">
                หน้า {page} จาก {totalPages} ({filtered.length} รายการ)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ← ก่อนหน้า
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
                      p === page
                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/20'
                        : 'border border-white/10 text-zinc-400 hover:bg-white/10'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ถัดไป →
                </button>
              </div>
            </div>
          </GlassPanel>
        </>
      )}
    </motion.div>
  );
}
