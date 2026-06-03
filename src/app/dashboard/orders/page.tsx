'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    completed: 'bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    'in progress': 'bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30',
    processing: 'bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30',
    partial: 'bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30',
    failed: 'bg-red-500/10 text-red-400 border-red-500/30',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/30',
  };
  const c = colors[status.toLowerCase()] || 'bg-[#94A3B8]/10 text-[#94A3B8] border-[#94A3B8]/30';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${c}`}>
      {status}
    </span>
  );
}

const PAGE_SIZE = 15;

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch('/api/dashboard/orders')
      .then((r) => r.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    let result = orders;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.panelOrderId?.toLowerCase().includes(q) ||
          o.endUser?.email?.toLowerCase().includes(q) ||
          o.storefrontService?.name?.toLowerCase().includes(q)
      );
    }
    if (statusFilter) {
      result = result.filter((o) => o.status?.toLowerCase() === statusFilter.toLowerCase());
    }
    return result;
  }, [orders, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const statuses = ['Completed', 'Pending', 'In Progress', 'Partial', 'Failed', 'Cancelled'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#00F0FF]/30 border-t-[#00F0FF] rounded-full animate-spin" />
        <p className="mt-4 text-sm text-[#94A3B8]">กำลังโหลดออเดอร์...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">ประวัติออเดอร์</h1>
          <p className="mt-1 text-sm text-[#94A3B8]">{orders.length} ออเดอร์ทั้งหมด</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm">🔍</span>
          <input
            type="text"
            placeholder="ค้นหา Panel ID, ลูกค้า, หรือบริการ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[#2A364F] bg-[#1F293D] pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#94A3B8]/50 focus:border-[#00F0FF]/50 focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/30 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-[#2A364F] bg-[#1F293D] px-4 py-2.5 text-sm text-white focus:border-[#00F0FF]/50 focus:outline-none transition-all"
        >
          <option value="">ทุกสถานะ</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-white">
            {orders.length === 0 ? 'ยังไม่มีออเดอร์' : 'ไม่พบออเดอร์'}
          </h3>
          <p className="mt-2 text-sm text-[#94A3B8] max-w-sm">
            {orders.length === 0 ? 'ออเดอร์จะปรากฏที่นี่เมื่อมีลูกค้าสั่งซื้อ' : 'ลองเปลี่ยนคำค้นหาหรือตัวกรองสถานะ'}
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-[#2A364F] bg-[#1F293D] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2A364F] text-xs text-[#94A3B8]">
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
                <tbody className="divide-y divide-[#2A364F]">
                  {paged.map((o, i) => (
                    <motion.tr
                      key={o.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-[#0B0F19]/30 transition-colors"
                    >
                      <td className="px-6 py-3.5 font-mono text-xs text-[#94A3B8]">{o.panelOrderId || '—'}</td>
                      <td className="px-6 py-3.5 text-[#94A3B8] max-w-[150px] truncate">{o.endUser?.email || '—'}</td>
                      <td className="px-6 py-3.5 text-white max-w-[180px] truncate">{o.storefrontService?.name || '—'}</td>
                      <td className="px-6 py-3.5 text-right text-[#94A3B8] font-mono">{o.quantity}</td>
                      <td className="px-6 py-3.5 text-right text-[#94A3B8]/70 font-mono text-xs">฿{((o.costPrice ?? 0) / 100).toFixed(2)}</td>
                      <td className="px-6 py-3.5 text-right text-white font-mono text-xs">฿{((o.sellPrice ?? 0) / 100).toFixed(2)}</td>
                      <td className="px-6 py-3.5 text-right font-mono text-xs">
                        <span
                          className={
                            (o.profit ?? 0) > 0
                              ? 'text-[#00E676]'
                              : (o.profit ?? 0) < 0
                              ? 'text-red-400'
                              : 'text-[#94A3B8]'
                          }
                        >
                          ฿{((o.profit ?? 0) / 100).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <StatusBadge status={o.status?.toLowerCase() || 'pending'} />
                      </td>
                      <td className="px-6 py-3.5 text-right text-xs text-[#94A3B8]">
                        {new Date(o.createdAt).toLocaleDateString('th-TH')}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-[#2A364F]">
              <span className="text-xs text-[#94A3B8]">
                หน้า {page} จาก {totalPages} ({filtered.length} รายการ)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-lg border border-[#2A364F] px-3 py-1.5 text-xs text-[#94A3B8] hover:bg-[#0B0F19]/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ← ก่อนหน้า
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
                      p === page
                        ? 'bg-[#00F0FF] text-[#0B0F19]'
                        : 'border border-[#2A364F] text-[#94A3B8] hover:bg-[#0B0F19]/50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-[#2A364F] px-3 py-1.5 text-xs text-[#94A3B8] hover:bg-[#0B0F19]/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ถัดไป →
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
