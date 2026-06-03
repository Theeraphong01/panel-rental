'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Plus, TestTube, Power, PowerOff, Trash2 } from 'lucide-react';

function maskKey(key: string): string {
  if (!key) return '••••';
  if (key.length <= 8) return '••••••••';
  return key.slice(0, 4) + '••••••••' + key.slice(-4);
}

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

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch('/api/dashboard/api-keys');
    const data = await res.json();
    setKeys(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  async function addKey(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const res = await fetch('/api/dashboard/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: f.get('label'), panelUrl: f.get('panelUrl'), apiKey: f.get('apiKey') }),
    });
    if (res.ok) { toast.success('เพิ่ม Panel สำเร็จ'); setOpen(false); load(); }
    else { const d = await res.json(); toast.error(d.error || 'เพิ่มไม่สำเร็จ'); }
  }

  async function testKey(id: string) {
    setTesting(id);
    const res = await fetch(`/api/dashboard/api-keys/${id}?action=test`, { method: 'POST' });
    const d = await res.json();
    if (d.ok) toast.success(`คงเหลือ: ${d.balance} ${d.currency}`);
    else toast.error(d.error || 'ทดสอบล้มเหลว');
    setTesting(null);
    load();
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/dashboard/api-keys/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    });
    load();
    toast.success(current ? 'ปิดใช้งานแล้ว' : 'เปิดใช้งานแล้ว');
  }

  async function removeKey(id: string) {
    if (!confirm('ยืนยันการลบ Panel นี้?')) return;
    await fetch(`/api/dashboard/api-keys/${id}`, { method: 'DELETE' });
    load();
    toast.success('ลบ Panel แล้ว');
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#00F0FF]/30 border-t-[#00F0FF] rounded-full animate-spin" />
        <p className="mt-4 text-sm text-[#94A3B8]">กำลังโหลด Panels...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Panels</h1>
          <p className="mt-1 text-sm text-[#94A3B8]">จัดการ Panel ต้นทางที่เชื่อมต่อ</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#00F0FF] px-5 py-2.5 text-sm font-semibold text-[#0B0F19] hover:bg-[#00F0FF]/80 transition-all"
        >
          <Plus className="w-4 h-4" />
          เพิ่ม Panel
        </button>
      </div>

      {/* Add Form Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-lg border border-[#2A364F] bg-[#1F293D] p-6 shadow-2xl"
            >
              <h2 className="text-lg font-semibold text-white mb-4">เพิ่ม Panel ใหม่</h2>
              <form onSubmit={addKey} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-1">ชื่อ (Label)</label>
                  <input
                    name="label" placeholder="เช่น PumLF" required
                    className="w-full rounded-lg border border-[#2A364F] bg-[#0B0F19] px-4 py-2.5 text-sm text-white placeholder-[#94A3B8]/50 focus:border-[#00F0FF]/50 focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-1">Panel URL</label>
                  <input
                    name="panelUrl" placeholder="pumlf.com" required
                    className="w-full rounded-lg border border-[#2A364F] bg-[#0B0F19] px-4 py-2.5 text-sm text-white placeholder-[#94A3B8]/50 focus:border-[#00F0FF]/50 focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/30 transition-all"
                  />
                  <p className="mt-1 text-xs text-[#94A3B8]/60">ใส่แค่เว็บไซต์ก็พอ เช่น pumlf.com, smmgen.com — ระบบจัดการ api/v2 ให้เอง</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-1">API Key</label>
                  <input
                    name="apiKey" type="password" placeholder="••••••••" required
                    className="w-full rounded-lg border border-[#2A364F] bg-[#0B0F19] px-4 py-2.5 text-sm text-white placeholder-[#94A3B8]/50 focus:border-[#00F0FF]/50 focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/30 transition-all"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setOpen(false)} className="flex-1 rounded-lg border border-[#2A364F] px-4 py-2.5 text-sm text-[#94A3B8] hover:bg-[#0B0F19]/50 transition-colors">
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

      {keys.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-5xl mb-4">🔑</div>
          <h3 class="text-lg font-semibold text-white">ยังไม่มี Panel</h3>
          <p class="mt-2 text-sm text-[#94A3B8] max-w-sm">เพิ่ม Panel ต้นทางเพื่อเริ่มต้นให้บริการ</p>
          <button onClick={() => setOpen(true)} class="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#00F0FF] px-4 py-2 text-sm font-semibold text-[#0B0F19]">
            <Plus class="w-4 h-4" /> เพิ่ม Panel
          </button>
        </div>
      ) : (
        <div className="rounded-lg border border-[#2A364F] bg-[#1F293D] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2A364F] text-xs text-[#94A3B8]">
                  <th className="text-left px-6 py-3 font-medium">ชื่อ / Panel URL</th>
                  <th className="text-left px-6 py-3 font-medium">API Key</th>
                  <th className="text-right px-6 py-3 font-medium">คงเหลือ</th>
                  <th className="text-center px-6 py-3 font-medium">สถานะ</th>
                  <th className="text-center px-6 py-3 font-medium">ทดสอบแล้ว</th>
                  <th className="text-right px-6 py-3 font-medium">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A364F]">
                {keys.map((k, i) => (
                  <motion.tr
                    key={k.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-[#0B0F19]/30 transition-colors"
                  >
                    <td className="px-6 py-3.5 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{k.label}</p>
                      <p className="text-xs text-[#94A3B8] truncate">{k.panelUrl}</p>
                    </td>
                    <td className="px-6 py-3.5">
                      <code className="inline-block text-xs font-mono text-[#94A3B8] bg-[#0B0F19]/50 rounded px-2 py-1 max-w-full truncate">
                        {maskKey(k.apiKeyEncrypted)}
                      </code>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <span className="text-sm font-medium text-white">
                        {k.balanceSnapshot != null ? `฿${(k.balanceSnapshot / 100).toFixed(2)}` : <span className="text-[#94A3B8]/50">—</span>}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <StatusBadge status={k.isActive ? 'active' : 'inactive'} />
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span className="text-xs text-[#94A3B8]">
                        {k.lastTestedAt ? new Date(k.lastTestedAt).toLocaleDateString('th-TH') : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => testKey(k.id)}
                          disabled={testing === k.id}
                          className="rounded-lg border border-[#2A364F] px-3 py-1.5 text-xs text-[#94A3B8] hover:bg-[#0B0F19]/50 disabled:opacity-50 transition-colors"
                          title="ทดสอบ"
                        >
                          <TestTube className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleActive(k.id, k.isActive)}
                          className="rounded-lg border border-[#2A364F] px-3 py-1.5 text-xs text-[#94A3B8] hover:bg-[#0B0F19]/50 transition-colors"
                          title={k.isActive ? 'ปิด' : 'เปิด'}
                        >
                          {k.isActive ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => removeKey(k.id)}
                          className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                          title="ลบ"
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
            {keys.length} Panels
          </div>
        </div>
      )}
    </motion.div>
  );
}
