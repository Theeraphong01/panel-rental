'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader, GlassPanel, StatusBadge, LoadingState, EmptyState } from '@/components/premium';
import { toast } from 'sonner';

function maskKey(key: string): string {
  if (!key) return '••••';
  if (key.length <= 8) return '••••••••';
  return key.slice(0, 4) + '••••••••' + key.slice(-4);
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
    if (res.ok) { toast.success('เพิ่ม API Key สำเร็จ'); setOpen(false); load(); }
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
    if (!confirm('ยืนยันการลบ API Key นี้?')) return;
    await fetch(`/api/dashboard/api-keys/${id}`, { method: 'DELETE' });
    load();
    toast.success('ลบ API Key แล้ว');
  }

  if (loading) return <LoadingState text="กำลังโหลด API Keys..." />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <PageHeader
        title="API Keys"
        desc="จัดการกุญแจเชื่อมต่อกับ Panel ต้นทาง"
        action={
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/20"
          >
            + เพิ่ม API Key
          </button>
        }
      />

      {/* Add Form Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl"
            >
              <h2 className="text-lg font-semibold text-white mb-4">เพิ่ม API Key ใหม่</h2>
              <form onSubmit={addKey} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">ชื่อ (Label)</label>
                  <input
                    name="label"
                    placeholder="เช่น PumLF"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Panel URL</label>
                  <input
                    name="panelUrl"
                    placeholder="https://pumlf.com/api/v2"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">API Key</label>
                  <input
                    name="apiKey"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
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

      {keys.length === 0 ? (
        <EmptyState
          icon="🔑"
          title="ยังไม่มี API Key"
          desc="เพิ่ม API Key จาก Panel ต้นทางเพื่อเริ่มต้นให้บริการ"
          action={
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white"
            >
              + เพิ่ม API Key
            </button>
          }
        />
      ) : (
        <GlassPanel className="!p-0 overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-[1fr_180px_180px_100px_100px_160px] gap-4 px-6 py-3 text-xs font-medium text-zinc-500 border-b border-white/5">
            <span>ชื่อ / Panel URL</span>
            <span>API Key</span>
            <span>คงเหลือ</span>
            <span>สถานะ</span>
            <span>ทดสอบแล้ว</span>
            <span>จัดการ</span>
          </div>
          <div className="divide-y divide-white/5">
            {keys.map((k, i) => (
              <motion.div
                key={k.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="grid grid-cols-1 md:grid-cols-[1fr_180px_180px_100px_100px_160px] gap-2 md:gap-4 px-6 py-4 hover:bg-white/[0.03] transition-colors items-center"
              >
                {/* Name + URL (stacked on mobile) */}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{k.label}</p>
                  <p className="text-xs text-zinc-500 truncate">{k.panelUrl}</p>
                </div>

                {/* Masked Key */}
                <div>
                  <code className="inline-block text-xs font-mono text-zinc-400 bg-white/5 rounded-lg px-2 py-1 max-w-full truncate">
                    {maskKey(k.apiKeyEncrypted)}
                  </code>
                </div>

                {/* Balance */}
                <div>
                  <span className="text-sm font-medium text-white">
                    {k.balanceSnapshot != null ? `฿${(k.balanceSnapshot / 100).toFixed(2)}` : <span className="text-zinc-600">—</span>}
                  </span>
                </div>

                {/* Status */}
                <div>
                  <StatusBadge status={k.isActive ? 'active' : 'inactive'} />
                </div>

                {/* Last tested */}
                <div>
                  <span className="text-xs text-zinc-500">
                    {k.lastTestedAt ? new Date(k.lastTestedAt).toLocaleDateString('th-TH') : '—'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => testKey(k.id)}
                    disabled={testing === k.id}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/10 disabled:opacity-50 transition-colors"
                  >
                    {testing === k.id ? '⏳' : '🔄'}
                  </button>
                  <button
                    onClick={() => toggleActive(k.id, k.isActive)}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/10 transition-colors"
                  >
                    {k.isActive ? 'ปิด' : 'เปิด'}
                  </button>
                  <button
                    onClick={() => removeKey(k.id)}
                    className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    ลบ
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassPanel>
      )}
    </motion.div>
  );
}
