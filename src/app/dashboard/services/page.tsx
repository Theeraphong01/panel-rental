'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader, GlassPanel, StatusBadge, LoadingState, EmptyState } from '@/components/premium';
import Link from 'next/link';
import { toast } from 'sonner';

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
      result = result.filter(s =>
        s.name?.toLowerCase().includes(q) ||
        s.serviceId?.toLowerCase().includes(q)
      );
    }
    if (categoryFilter) {
      result = result.filter(s => s.categoryId === categoryFilter);
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

  if (loading) return <LoadingState text="กำลังโหลดบริการ..." />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <PageHeader
        title="จัดการบริการ"
        desc={`${services.length} บริการ`}
        action={
          <Link
            href="/dashboard/services/import"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/20"
          >
            📥 นำเข้าบริการ
          </Link>
        }
      />

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">🔍</span>
          <input
            type="text"
            placeholder="ค้นหาชื่อ หรือ Service ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-violet-500/50 focus:outline-none transition-all appearance-none cursor-pointer"
        >
          <option value="">ทุกหมวดหมู่</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="📦"
          title={services.length === 0 ? "ยังไม่มีบริการ" : "ไม่พบบริการ"}
          desc={services.length === 0 ? "นำเข้าบริการจาก Panel ต้นทางเพื่อเริ่มต้น" : "ลองเปลี่ยนคำค้นหาหรือตัวกรอง"}
          action={
            services.length === 0 ? (
              <Link
                href="/dashboard/services/import"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white"
              >
                📥 นำเข้าบริการ
              </Link>
            ) : undefined
          }
        />
      ) : (
        <GlassPanel className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs text-zinc-500">
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
              <tbody className="divide-y divide-white/5">
                {filtered.map((s, i) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="px-6 py-3.5 font-mono text-xs text-zinc-500">{s.serviceId}</td>
                    <td className="px-6 py-3.5 font-medium text-white max-w-[200px] truncate">{s.name}</td>
                    <td className="px-6 py-3.5">
                      {s.category?.name ? (
                        <span className="text-zinc-300 text-xs">{s.category.name}</span>
                      ) : (
                        <span className="text-zinc-600 text-xs italic">uncategorized</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-right text-zinc-300 font-mono text-xs">
                      ฿{s.panelRate?.toFixed(2)}<span className="text-zinc-600">/1k</span>
                    </td>
                    <td className="px-6 py-3.5 text-right text-white font-mono text-xs">
                      {s.priceType === 'manual'
                        ? `฿${((s.priceManual ?? 0) / 100).toFixed(2)}`
                        : `+${s.pricePercent}%`
                      }
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-block rounded-md bg-white/5 px-2 py-0.5 text-xs text-zinc-400 max-w-[100px] truncate">
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
                          className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-white/10 transition-colors"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => toggleActive(s.id, s.isActive)}
                          className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-white/10 transition-colors"
                        >
                          {s.isActive ? 'ปิด' : 'เปิด'}
                        </button>
                        <button
                          onClick={() => delService(s.id)}
                          className="rounded-lg border border-red-500/20 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          ลบ
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-white/5 text-xs text-zinc-600">
            แสดง {filtered.length} จาก {services.length} บริการ
          </div>
        </GlassPanel>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editSvc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setEditSvc(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl"
            >
              <h2 className="text-lg font-semibold text-white mb-4">แก้ไขบริการ</h2>
              <form onSubmit={updateService} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">ชื่อที่แสดง</label>
                  <input
                    name="name"
                    defaultValue={editSvc.name}
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">รายละเอียด</label>
                  <input
                    name="description"
                    defaultValue={editSvc.description || ''}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">หมวดหมู่</label>
                  <select
                    name="categoryId"
                    defaultValue={editSvc.categoryId || ''}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-violet-500/50 focus:outline-none transition-all"
                  >
                    <option value="">ไม่มีหมวดหมู่</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">วิธีคิดราคา</label>
                  <select
                    name="priceType"
                    defaultValue={editSvc.priceType}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-violet-500/50 focus:outline-none transition-all"
                  >
                    <option value="percent">+% จากต้นทุน</option>
                    <option value="manual">กำหนดเอง (สตางค์)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">% Markup</label>
                  <input
                    name="pricePercent"
                    type="number"
                    defaultValue={editSvc.pricePercent}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">ราคาขาย (สตางค์)</label>
                  <input
                    name="priceManual"
                    type="number"
                    defaultValue={editSvc.priceManual || ''}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditSvc(null)}
                    className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-zinc-400 hover:bg-white/5 transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white hover:from-violet-500 hover:to-fuchsia-500 transition-all"
                  >
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
