'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { PageHeader, GlassPanel, StatusBadge, LoadingState, EmptyState } from '@/components/premium';

interface Package {
  id: string;
  name: string;
  priceMonthly: number;
  maxApiKeys: number;
  maxEndUsers: number | null;
  premiumThemes: boolean;
  customDomain: boolean;
  isActive: boolean;
}

const fmtTHB = (n: number) =>
  (n / 100).toLocaleString('th-TH', { style: 'currency', currency: 'THB' });

export default function AdminPackages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: '',
    priceMonthly: 49900,
    maxApiKeys: 3,
    maxEndUsers: '',
    premiumThemes: false,
    customDomain: false,
  });

  const load = () =>
    fetch('/api/admin/packages')
      .then((r) => r.json())
      .then((data) => {
        setPackages(data);
        setLoading(false);
      });

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setForm({
      name: '',
      priceMonthly: 49900,
      maxApiKeys: 3,
      maxEndUsers: '',
      premiumThemes: false,
      customDomain: false,
    });
    setEditingId(null);
  }

  function openCreate() {
    resetForm();
    setModalOpen(true);
  }

  function openEdit(pkg: Package) {
    setForm({
      name: pkg.name,
      priceMonthly: pkg.priceMonthly,
      maxApiKeys: pkg.maxApiKeys,
      maxEndUsers: pkg.maxEndUsers ? String(pkg.maxEndUsers) : '',
      premiumThemes: pkg.premiumThemes,
      customDomain: pkg.customDomain,
    });
    setEditingId(pkg.id);
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body = {
      name: form.name,
      priceMonthly: form.priceMonthly,
      maxApiKeys: form.maxApiKeys,
      maxEndUsers: form.maxEndUsers ? Number(form.maxEndUsers) : null,
      premiumThemes: form.premiumThemes,
      customDomain: form.customDomain,
      ...(editingId ? {} : { isActive: true }),
    };

    try {
      const url = editingId
        ? `/api/admin/packages/${editingId}`
        : '/api/admin/packages';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success(editingId ? 'อัปเดตแพ็คเกจแล้ว' : 'เพิ่มแพ็คเกจแล้ว');
        setModalOpen(false);
        resetForm();
        load();
      } else {
        toast.error('บันทึกไม่สำเร็จ');
      }
    } catch {
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(pkg: Package) {
    try {
      const res = await fetch(`/api/admin/packages/${pkg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !pkg.isActive }),
      });
      if (res.ok) {
        toast.success(pkg.isActive ? 'ปิดแพ็คเกจแล้ว' : 'เปิดแพ็คเกจแล้ว');
        load();
      }
    } catch {
      toast.error('เกิดข้อผิดพลาด');
    }
  }

  if (loading) return <LoadingState text="กำลังโหลดแพ็คเกจ..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="📦 จัดการแพ็คเกจ"
        desc={`${packages.length} แพ็คเกจ • ${packages.filter((p) => p.isActive).length} active`}
        action={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-semibold hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/20 transition-all duration-200 active:scale-95"
          >
            <span className="text-base">＋</span> เพิ่มแพ็คเกจ
          </button>
        }
      />

      {/* Packages List */}
      <GlassPanel padded={false}>
        {packages.length === 0 ? (
          <EmptyState
            icon="📦"
            title="ยังไม่มีแพ็คเกจ"
            desc="สร้างแพ็คเกจแรกเพื่อให้ผู้ใช้สมัครใช้งาน"
            action={
              <button
                onClick={openCreate}
                className="mt-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-semibold hover:from-violet-500 hover:to-fuchsia-500 transition-all"
              >
                ＋ เพิ่มแพ็คเกจ
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    ชื่อ
                  </th>
                  <th className="text-right px-4 py-3.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    ราคา/เดือน
                  </th>
                  <th className="text-center px-4 py-3.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    API Keys
                  </th>
                  <th className="text-center px-4 py-3.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    สมาชิกสูงสุด
                  </th>
                  <th className="text-center px-4 py-3.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    ธีมพรีเมียม
                  </th>
                  <th className="text-center px-4 py-3.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Domain
                  </th>
                  <th className="text-center px-4 py-3.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th className="text-right px-4 py-3.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode="wait">
                  {packages.map((p, i) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.25 }}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-4 py-3.5 font-semibold text-white">
                        {p.name}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-sm text-emerald-300 tabular-nums">
                        {fmtTHB(p.priceMonthly)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center justify-center min-w-[1.75rem] h-5 rounded-full bg-violet-500/10 text-violet-300 text-xs font-bold">
                          {p.maxApiKeys}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center text-zinc-300">
                        {p.maxEndUsers ?? (
                          <span className="text-zinc-600">ไม่จำกัด</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {p.premiumThemes ? (
                          <span className="text-emerald-400 text-sm">✓</span>
                        ) : (
                          <span className="text-zinc-600 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {p.customDomain ? (
                          <span className="text-emerald-400 text-sm">✓</span>
                        ) : (
                          <span className="text-zinc-600 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <StatusBadge
                          status={p.isActive ? 'active' : 'suspended'}
                        />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(p)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-white/5 hover:border-white/10 transition-all duration-200"
                          >
                            ✏️ แก้ไข
                          </button>
                          <button
                            onClick={() => toggleActive(p)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                              p.isActive
                                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                            }`}
                          >
                            {p.isActive ? '⏸ ปิด' : '▶ เปิด'}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </GlassPanel>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl shadow-violet-500/10 p-6"
            >
              <h2 className="text-lg font-bold text-white mb-1">
                {editingId ? '✏️ แก้ไขแพ็คเกจ' : '📦 เพิ่มแพ็คเกจใหม่'}
              </h2>
              <p className="text-sm text-zinc-400 mb-5">
                {editingId
                  ? 'แก้ไขรายละเอียดแพ็คเกจ'
                  : 'กำหนดรายละเอียดแพ็คเกจสำหรับผู้ใช้'}
              </p>

              <form onSubmit={handleSave} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    ชื่อแพ็คเกจ
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="เช่น Pro, Enterprise"
                    className="w-full h-10 px-3 rounded-xl border border-white/5 bg-white/5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/30 focus:bg-white/[0.07] transition-all duration-200"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    ราคา/เดือน (สตางค์)
                  </label>
                  <input
                    type="number"
                    required
                    value={form.priceMonthly}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        priceMonthly: Number(e.target.value),
                      }))
                    }
                    className="w-full h-10 px-3 rounded-xl border border-white/5 bg-white/5 text-sm text-white font-mono focus:outline-none focus:border-violet-500/30 focus:bg-white/[0.07] transition-all duration-200"
                  />
                  <p className="text-xs text-zinc-600 mt-1">
                    {fmtTHB(form.priceMonthly)}
                  </p>
                </div>

                {/* Max API Keys */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    จำนวน API Keys
                  </label>
                  <input
                    type="number"
                    required
                    value={form.maxApiKeys}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        maxApiKeys: Number(e.target.value),
                      }))
                    }
                    className="w-full h-10 px-3 rounded-xl border border-white/5 bg-white/5 text-sm text-white font-mono focus:outline-none focus:border-violet-500/30 focus:bg-white/[0.07] transition-all duration-200"
                  />
                </div>

                {/* Max End Users */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    จำนวนสมาชิกสูงสุด{' '}
                    <span className="text-zinc-600 font-normal">
                      (เว้นว่าง = ไม่จำกัด)
                    </span>
                  </label>
                  <input
                    type="number"
                    value={form.maxEndUsers}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, maxEndUsers: e.target.value }))
                    }
                    placeholder="ไม่จำกัด"
                    className="w-full h-10 px-3 rounded-xl border border-white/5 bg-white/5 text-sm text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/30 focus:bg-white/[0.07] transition-all duration-200"
                  />
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-zinc-400">
                    ฟีเจอร์
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] cursor-pointer hover:border-white/10 transition-all duration-200">
                    <input
                      type="checkbox"
                      checked={form.premiumThemes}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          premiumThemes: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 rounded border-white/20 bg-white/5 accent-violet-500"
                    />
                    <div>
                      <span className="text-sm text-white font-medium">
                        🎨 ธีมพรีเมียม
                      </span>
                      <p className="text-xs text-zinc-500">
                        ธีม Dark/Light แบบพรีเมียม
                      </p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] cursor-pointer hover:border-white/10 transition-all duration-200">
                    <input
                      type="checkbox"
                      checked={form.customDomain}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          customDomain: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 rounded border-white/20 bg-white/5 accent-violet-500"
                    />
                    <div>
                      <span className="text-sm text-white font-medium">
                        🌐 Domain ตัวเอง
                      </span>
                      <p className="text-xs text-zinc-500">
                        ใช้โดเมนของตัวเองแทน Subdomain
                      </p>
                    </div>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 h-10 rounded-xl border border-white/5 text-sm font-semibold text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-all duration-200"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-semibold hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                  >
                    {saving ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        กำลังบันทึก...
                      </span>
                    ) : editingId ? (
                      'บันทึก'
                    ) : (
                      'เพิ่มแพ็คเกจ'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
