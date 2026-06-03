'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'sonner';
import { Download, Pencil, Power, PowerOff, Trash2 } from 'lucide-react';

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30',
    completed: 'bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/30',
    failed: 'bg-red-500/10 text-red-400 border-red-500/30',
    inactive: 'bg-[#94A3B8]/20 text-[#94A3B8] border-[#94A3B8]/30',
  };
  const c = colors[status.toLowerCase()] || 'bg-[#94A3B8]/10 text-[#94A3B8] border-[#94A3B8]/30';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${c}`}>
      {status}
    </span>
  );
}

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [editSvc, setEditSvc] = useState<any>(null);

  const load = async () => {
    const [svcRes, catRes] = await Promise.all([
      fetch('/api/dashboard/services'),
      fetch('/api/dashboard/categories'),
    ]);
    setServices(await svcRes.json());
    setCategories(await catRes.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let result = services;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) => s.name?.toLowerCase().includes(q) || s.serviceId?.toLowerCase().includes(q)
      );
    }
    if (categoryFilter) {
      result = result.filter((s) => s.categoryId === categoryFilter);
    }
    return result;
  }, [services, search, categoryFilter]);

  async function updateService(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const data: any = {
      name: f.get('name'),
      description: f.get('description') || null,
      categoryId: f.get('categoryId') || null,
      priceType: f.get('priceType'),
    };
    if (data.priceType === 'manual') data.priceManual = Number(f.get('priceManual'));
    else data.pricePercent = Number(f.get('pricePercent'));
    await fetch(`/api/dashboard/services/${editSvc.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    toast.success('อัพเดทบริการแล้ว');
    setEditSvc(null);
    load();
  }

  async function toggleActive(id: string, active: boolean) {
    await fetch(`/api/dashboard/services/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !active }),
    });
    load();
    toast.success(active ? 'ปิดบริการแล้ว' : 'เปิดบริการแล้ว');
  }

  async function delService(id: string) {
    if (!confirm('ยืนยันการลบบริการนี้?')) return;
    await fetch(`/api/dashboard/services/${id}`, { method: 'DELETE' });
    load();
    toast.success('ลบบริการแล้ว');
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#00F0FF]/30 border-t-[#00F0FF] rounded-full animate-spin" />
        <p className="mt-4 text-sm text-[#94A3B8]">กำลังโหลดบริการ...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">จัดการบริการ</h1>
          <p className="mt-1 text-sm text-[#94A3B8]">{services.length} บริการ</p>
        </div>
        <Link
          href="/dashboard/services/import"
          className="inline-flex items-center gap-2 rounded-lg bg-[#00F0FF] px-5 py-2.5 text-sm font-semibold text-[#0B0F19] hover:bg-[#00F0FF]/80 transition-all"
        >
          <Download className="w-4 h-4" />
          นำเข้าบริการ
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm">🔍</span>
          <input
            type="text"
            placeholder="ค้นหาชื่อ หรือ Service ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[#2A364F] bg-[#1F293D] pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#94A3B8]/50 focus:border-[#00F0FF]/50 focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/30 transition-all"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-[#2A364F] bg-[#1F293D] px-4 py-2.5 text-sm text-white focus:border-[#00F0FF]/50 focus:outline-none transition-all appearance-none cursor-pointer"
        >
          <option value="">ทุกหมวดหมู่</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-5xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-white">
            {services.length === 0 ? 'ยังไม่มีบริการ' : 'ไม่พบบริการ'}
          </h3>
          <p className="mt-2 text-sm text-[#94A3B8] max-w-sm">
            {services.length === 0 ? 'นำเข้าบริการจาก Panel ต้นทางเพื่อเริ่มต้น' : 'ลองเปลี่ยนคำค้นหาหรือตัวกรอง'}
          </p>
          {services.length === 0 && (
            <Link
              href="/dashboard/services/import"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#00F0FF] px-4 py-2 text-sm font-semibold text-[#0B0F19]"
            >
              <Download className="w-4 h-4" /> นำเข้าบริการ
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-[#2A364F] bg-[#1F293D] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2A364F] text-xs text-[#94A3B8]">
                  <th className="text-left px-6 py-3 font-medium">ID</th>
                  <th className="text-left px-6 py-3 font-medium">ชื่อ</th>
                  <th className="text-left px-6 py-3 font-medium">หมวดหมู่</th>
                  <th className="text-right px-6 py-3 font-medium">ต้นทุน</th>
                  <th className="text-right px-6 py-3 font-medium">ราคาขาย</th>
                  <th className="text-left px-6 py-3 font-medium">API Key</th>
                  <th className="text-center px-6 py-3 font-medium">สถานะ</th>
                  <th className="text-right px-6 py-3 font-medium">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A364F]">
                {filtered.map((s, i) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-[#0B0F19]/30 transition-colors"
                  >
                    <td className="px-6 py-3.5 font-mono text-xs text-[#94A3B8]">{s.serviceId}</td>
                    <td className="px-6 py-3.5 font-medium text-white max-w-[200px] truncate">{s.name}</td>
                    <td className="px-6 py-3.5">
                      {s.category?.name ? (
                        <span className="text-[#94A3B8] text-xs">{s.category.name}</span>
                      ) : (
                        <span className="text-[#94A3B8]/50 text-xs italic">uncategorized</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-right text-[#94A3B8] font-mono text-xs">
                      ฿{s.panelRate?.toFixed(2)}<span className="text-[#94A3B8]/50">/1k</span>
                    </td>
                    <td className="px-6 py-3.5 text-right text-white font-mono text-xs">
                      {s.priceType === 'manual'
                        ? `฿${((s.priceManual ?? 0) / 100).toFixed(2)}`
                        : `+${s.pricePercent}%`}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-block rounded-md bg-[#0B0F19]/50 px-2 py-0.5 text-xs text-[#94A3B8] max-w-[100px] truncate">
                        {s.apiKey?.label || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <StatusBadge status={s.isActive ? 'active' : 'inactive'} />
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditSvc(s)}
                          className="rounded-lg border border-[#2A364F] px-2.5 py-1.5 text-xs text-[#94A3B8] hover:bg-[#0B0F19]/50 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleActive(s.id, s.isActive)}
                          className="rounded-lg border border-[#2A364F] px-2.5 py-1.5 text-xs text-[#94A3B8] hover:bg-[#0B0F19]/50 transition-colors"
                        >
                          {s.isActive ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => delService(s.id)}
                          className="rounded-lg border border-red-500/20 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-[#2A364F] text-xs text-[#94A3B8]">
            แสดง {filtered.length} จาก {services.length} บริการ
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editSvc && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setEditSvc(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-lg border border-[#2A364F] bg-[#1F293D] p-6 shadow-2xl"
            >
              <h2 className="text-lg font-semibold text-white mb-4">แก้ไขบริการ</h2>
              <form onSubmit={updateService} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-1">ชื่อที่แสดง</label>
                  <input
                    name="name" defaultValue={editSvc.name} required
                    className="w-full rounded-lg border border-[#2A364F] bg-[#0B0F19] px-4 py-2.5 text-sm text-white focus:border-[#00F0FF]/50 focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-1">รายละเอียด</label>
                  <input
                    name="description" defaultValue={editSvc.description || ''}
                    className="w-full rounded-lg border border-[#2A364F] bg-[#0B0F19] px-4 py-2.5 text-sm text-white focus:border-[#00F0FF]/50 focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-1">หมวดหมู่</label>
                  <select
                    name="categoryId" defaultValue={editSvc.categoryId || ''}
                    className="w-full rounded-lg border border-[#2A364F] bg-[#0B0F19] px-4 py-2.5 text-sm text-white focus:border-[#00F0FF]/50 focus:outline-none transition-all"
                  >
                    <option value="">ไม่มีหมวดหมู่</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-1">วิธีคิดราคา</label>
                  <select
                    name="priceType" defaultValue={editSvc.priceType}
                    className="w-full rounded-lg border border-[#2A364F] bg-[#0B0F19] px-4 py-2.5 text-sm text-white focus:border-[#00F0FF]/50 focus:outline-none transition-all"
                  >
                    <option value="percent">+% จากต้นทุน</option>
                    <option value="manual">กำหนดเอง (สตางค์)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-1">% Markup</label>
                  <input
                    name="pricePercent" type="number" defaultValue={editSvc.pricePercent}
                    className="w-full rounded-lg border border-[#2A364F] bg-[#0B0F19] px-4 py-2.5 text-sm text-white focus:border-[#00F0FF]/50 focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-1">ราคาขาย (สตางค์)</label>
                  <input
                    name="priceManual" type="number" defaultValue={editSvc.priceManual || ''}
                    className="w-full rounded-lg border border-[#2A364F] bg-[#0B0F19] px-4 py-2.5 text-sm text-white focus:border-[#00F0FF]/50 focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/30 transition-all"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setEditSvc(null)} className="flex-1 rounded-lg border border-[#2A364F] px-4 py-2.5 text-sm text-[#94A3B8] hover:bg-[#0B0F19]/50 transition-colors">
                    ยกเลิก
                  </button>
                  <button type="submit" className="flex-1 rounded-lg bg-[#00F0FF] px-4 py-2.5 text-sm font-semibold text-[#0B0F19] hover:bg-[#00F0FF]/80 transition-all">
                    บันทึก
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
