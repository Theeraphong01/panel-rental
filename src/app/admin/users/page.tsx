'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader, GlassPanel, StatusBadge, LoadingState, EmptyState } from '@/components/premium';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  _count: { tenants: number };
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <LoadingState text="กำลังโหลดผู้ใช้..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="👥 ผู้ใช้ทั้งหมด"
        desc={`${users.length} ผู้ใช้ในระบบ`}
      />

      {/* Search */}
      <div className="relative max-w-md">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
          🔍
        </span>
        <input
          type="text"
          placeholder="ค้นหาด้วยอีเมลหรือชื่อ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-4 rounded-xl border border-white/5 bg-white/5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/30 focus:bg-white/[0.07] transition-all duration-200"
        />
      </div>

      {/* Table */}
      <GlassPanel padded={false}>
        {filtered.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="ไม่พบผู้ใช้"
            desc={
              search
                ? 'ไม่มีผู้ใช้ที่ตรงกับคำค้นหา ลองเปลี่ยนคำค้นหาใหม่'
                : 'ยังไม่มีผู้ใช้ในระบบ'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    อีเมล
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    ชื่อ
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-center px-6 py-3.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    ร้านค้า
                  </th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    สมัครเมื่อ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode="wait">
                  {filtered.map((u, i) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02, duration: 0.25 }}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-6 py-3.5 font-medium text-white">
                        {u.email}
                      </td>
                      <td className="px-6 py-3.5 text-zinc-300">
                        {u.name || '-'}
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusBadge status={u.role} />
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className="inline-flex items-center justify-center min-w-[2rem] h-6 rounded-full bg-violet-500/10 text-violet-300 text-xs font-bold">
                          {u._count.tenants}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right text-zinc-400 tabular-nums">
                        {new Date(u.createdAt).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
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
