'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { PageHeader, GlassPanel, StatusBadge, LoadingState, EmptyState } from '@/components/premium';

interface Tenant {
  id: string;
  subdomain: string;
  name: string;
  status: string;
  user: { email: string; name: string } | null;
  subscriptions: { package: { name: string } }[];
  _count: { apiKeys: number; endUsers: number; services: number };
}

export default function AdminTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toggling, setToggling] = useState<string | null>(null);

  const load = () =>
    fetch('/api/admin/tenants')
      .then((r) => r.json())
      .then((data) => {
        setTenants(data);
        setLoading(false);
      });

  useEffect(() => {
    load();
  }, []);

  async function toggleStatus(id: string, current: string) {
    const newStatus = current === 'active' ? 'suspended' : 'active';
    setToggling(id);
    try {
      const res = await fetch('/api/admin/tenants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setTenants((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
        );
        toast.success(
          newStatus === 'active'
            ? '✅ เปิดร้านค้าเรียบร้อย'
            : '⛔ ระงับร้านค้าเรียบร้อย'
        );
      }
    } catch {
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setToggling(null);
    }
  }

  const filtered = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subdomain.toLowerCase().includes(search.toLowerCase()) ||
      t.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingState text="กำลังโหลดร้านค้า..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="🏪 ร้านค้าทั้งหมด"
        desc={`${tenants.length} ร้านค้าในระบบ • ${tenants.filter((t) => t.status === 'active').length} active`}
      />

      {/* Search */}
      <div className="relative max-w-md">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
          🔍
        </span>
        <input
          type="text"
          placeholder="ค้นหาด้วยชื่อ, subdomain หรืออีเมล..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-4 rounded-xl border border-white/5 bg-white/5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/30 focus:bg-white/[0.07] transition-all duration-200"
        />
      </div>

      {/* Table */}
      <GlassPanel padded={false}>
        {filtered.length === 0 ? (
          <EmptyState
            icon="🏪"
            title="ไม่พบร้านค้า"
            desc={
              search
                ? 'ไม่มีร้านค้าที่ตรงกับคำค้นหา'
                : 'ยังไม่มีร้านค้าในระบบ'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Subdomain
                  </th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    ชื่อร้าน
                  </th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    เจ้าของ
                  </th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    แพ็คเกจ
                  </th>
                  <th className="text-center px-4 py-3.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    API Keys
                  </th>
                  <th className="text-center px-4 py-3.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    สมาชิก
                  </th>
                  <th className="text-center px-4 py-3.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    บริการ
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
                  {filtered.map((t, i) => (
                    <motion.tr
                      key={t.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02, duration: 0.25 }}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs font-semibold text-violet-300">
                          {t.subdomain}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-white">
                        {t.name}
                      </td>
                      <td className="px-4 py-3.5 text-zinc-400 text-xs">
                        {t.user?.email ?? '-'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-zinc-300">
                          {t.subscriptions?.[0]?.package?.name ?? (
                            <span className="text-zinc-600">-</span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center justify-center min-w-[1.75rem] h-5 rounded-full bg-violet-500/10 text-violet-300 text-xs font-bold">
                          {t._count.apiKeys}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center text-zinc-300 tabular-nums">
                        {t._count.endUsers}
                      </td>
                      <td className="px-4 py-3.5 text-center text-zinc-300 tabular-nums">
                        {t._count.services}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => toggleStatus(t.id, t.status)}
                          disabled={toggling === t.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                            t.status === 'active'
                              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                              : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/20'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {toggling === t.id ? (
                            <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : t.status === 'active' ? (
                            '⛔ ระงับ'
                          ) : (
                            '✅ เปิด'
                          )}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
