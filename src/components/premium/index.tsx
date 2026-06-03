'use client';

import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useInView } from 'framer-motion';

// ── Animated Stat Card ──
export function StatCard({ icon, label, value, trend }: { icon: string; label: string; value: string; trend?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4 }}
      className="group relative rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm p-5 hover:border-violet-500/20 hover:bg-white/[0.07] transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {trend && <span className={`text-xs font-medium ${trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>{trend}</span>}
      </div>
      <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-zinc-500">{label}</div>
    </motion.div>
  );
}

// ── Page Header ──
export function PageHeader({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{title}</h1>
        {desc && <p className="mt-1 text-sm text-zinc-400">{desc}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ── Glass Panel ──
export function GlassPanel({ children, className = '', padded = true }: { children: React.ReactNode; className?: string; padded?: boolean }) {
  return (
    <div className={`rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm ${padded ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  );
}

// ── Empty State ──
export function EmptyState({ icon, title, desc, action }: { icon: string; title: string; desc: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-zinc-400 max-w-sm">{desc}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ── Badge ──
export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    processing: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/30',
    failed: 'bg-red-500/10 text-red-400 border-red-500/30',
    partial: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    trial: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    suspended: 'bg-red-500/10 text-red-400 border-red-500/30',
  };
  const c = colors[status.toLowerCase()] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${c}`}>
      {status}
    </span>
  );
}

// ── Loading Spinner ──
export function LoadingState({ text = 'กำลังโหลด...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-400 rounded-full animate-spin" />
      <p className="mt-4 text-sm text-zinc-400">{text}</p>
    </div>
  );
}
