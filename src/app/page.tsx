'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// ── Animated Counter ──
function Counter({ end, suffix = '', label }: { end: number; suffix?: string; label: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent tabular-nums">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="mt-1 text-sm text-zinc-400">{label}</div>
    </div>
  );
}

// ── Glow Card ──
function GlowCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`group relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 hover:bg-white/10 transition-all duration-500 hover:border-violet-500/50 hover:shadow-[0_0_40px_-10px_rgba(139,92,246,0.3)] ${className}`}>
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500/0 to-fuchsia-500/0 group-hover:from-violet-500/5 group-hover:to-fuchsia-500/5 transition-all duration-500" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ── Section wrapper with scroll animation ──
function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// ── Floating Orbs Background ──
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-violet-500/20 rounded-full blur-[128px] animate-float" />
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-fuchsia-500/15 rounded-full blur-[100px] animate-float-delayed" />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-indigo-500/15 rounded-full blur-[96px] animate-float-slow" />
      <div className="absolute -top-20 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-[112px] animate-float" />
    </div>
  );
}

// ── Dashboard Mockup ──
function DashboardMockup() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, rotateX: 5 }}
      animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative mx-auto max-w-4xl"
    >
      {/* Glow effect behind */}
      <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-cyan-500/20 rounded-[2rem] blur-2xl" />
      {/* Dashboard frame */}
      <div className="relative rounded-2xl border border-white/20 bg-zinc-900/90 backdrop-blur-xl shadow-2xl shadow-violet-500/10 overflow-hidden">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-xs text-zinc-500">📊 Dashboard — PanelRental</span>
          </div>
        </div>
        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
              <div className="h-3 w-24 bg-white/5 rounded mt-2" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-20 bg-violet-500/20 rounded-lg" />
              <div className="h-8 w-20 bg-white/5 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-xl bg-white/5 p-4 border border-white/5">
                <div className="h-3 w-16 bg-white/10 rounded" />
                <div className="h-6 w-12 bg-gradient-to-r from-violet-400 to-fuchsia-400 rounded mt-2" />
                <div className="h-2 w-20 bg-white/5 rounded mt-2" />
              </div>
            ))}
          </div>
          <div className="h-32 bg-white/5 rounded-xl border border-white/5" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-white/5 rounded-xl border border-white/5" />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── MAIN PAGE ──
export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">
      {/* ── Navbar ── */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 w-full z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-2xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-violet-500/25">P</div>
            <span className="font-bold text-lg tracking-tight">Panel<span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Rental</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/signin" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Sign In</Link>
            <Link href="/signup" className="inline-flex items-center justify-center rounded-xl bg-white text-zinc-900 h-9 px-5 text-sm font-semibold hover:bg-zinc-200 transition-all active:scale-95">Get Started Free</Link>
          </div>
        </div>
      </motion.nav>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-16 sm:pt-44 sm:pb-24 overflow-hidden">
        <FloatingOrbs />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center"
          >
            {/* Pill badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-300 mb-8 backdrop-blur-xl"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-400" />
              </span>
              เปิดร้าน SMM Panel ได้ใน 5 นาที
            </motion.div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05]">
              <span className="block">เปิดร้าน</span>
              <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
                SMM Panel
              </span>
              <span className="block">ของคุณเอง</span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
            >
              แพลตฟอร์ม White-Label อันดับ 1 ให้คุณเปิดหน้าร้าน SMM Panel แบบมืออาชีพ
              จัดการราคา ธีม สมาชิก ได้เอง 100% — ไม่ต้องเขียนโค้ดสักบรรทัด
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-10 flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Link href="/signup" className="group relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 h-12 px-8 text-base font-semibold text-white shadow-xl shadow-violet-500/25 hover:shadow-2xl hover:shadow-violet-500/40 transition-all active:scale-[0.98] overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                เริ่มต้นใช้งานฟรี →
              </Link>
              <Link href="#features" className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl h-12 px-8 text-base font-medium text-zinc-300 hover:bg-white/10 hover:border-white/20 transition-all">
                ดูฟีเจอร์ทั้งหมด
              </Link>
            </motion.div>
          </motion.div>

          {/* Dashboard preview */}
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-20"
          >
            <DashboardMockup />
          </motion.div>
        </div>
      </section>

      {/* ── Trusted By ── */}
      <section className="border-y border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-sm font-medium text-zinc-500 mb-8">TRUSTED BY 150+ SMM STORES</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 opacity-40">
            {['PumLF', 'SMMGen', 'SMMFollows', 'JualPanel'].map(n => (
              <div key={n} className="flex items-center justify-center">
                <span className="text-2xl font-black text-zinc-600 tracking-widest">{n}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <AnimatedSection className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <Counter end={20} suffix="+" label="รองรับ API" />
            <Counter end={5000} suffix="+" label="รูปแบบบริการ" />
            <Counter end={150} suffix="+" label="ร้านค้าที่เปิดแล้ว" />
            <Counter end={50000} suffix="+" label="ออเดอร์ต่อวัน" />
          </div>
        </div>
      </AnimatedSection>

      {/* ── Features Bento Grid ── */}
      <AnimatedSection id="features" className="py-20 sm:py-28 relative">
        <FloatingOrbs />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-sm font-semibold text-violet-400 uppercase tracking-widest"
            >
              Features
            </motion.span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight">
              ทุกอย่างที่<span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent"> คุณต้องการ</span>
            </h2>
            <p className="mt-4 text-lg text-zinc-400 max-w-xl mx-auto">
              จัดการร้าน SMM Panel แบบครบวงจรด้วยฟีเจอร์ระดับองค์กร
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Large card - spans 2 cols */}
            <GlowCard className="lg:col-span-2">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="text-4xl">🔌</div>
                <div>
                  <h3 className="text-xl font-bold">ปลั๊ก API Key ของคุณเอง</h3>
                  <p className="mt-2 text-zinc-400 leading-relaxed">
                    รองรับทุก SMM Panel API — PumLF, SMMGen, SMMFollows และอีกมากมาย
                    API Key ถูกเข้ารหัส AES-256-GCM แบบ server-side proxy ปลอดภัยสูงสุด
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {['PumLF', 'SMMGen', 'SMMFollows', '+ อีก 17 APIs'].map(t => (
                      <span key={t} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-400">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </GlowCard>

            <GlowCard>
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-lg font-bold">Sync อัตโนมัติ</h3>
              <p className="mt-2 text-sm text-zinc-400">ซิงค์สถานะออเดอร์ทุก 3 นาที อัพเดตบริการทุกชั่วโมง ไม่ต้อง manual</p>
            </GlowCard>

            <GlowCard>
              <div className="text-3xl mb-4">🎨</div>
              <h3 className="text-lg font-bold">20+ ธีมพรีเมียม</h3>
              <p className="mt-2 text-sm text-zinc-400">เลือกธีมสำเร็จรูปหรือ Custom CSS ปรับสี ฟอนต์ โลโก้ เป็นแบรนด์ของคุณ</p>
            </GlowCard>

            <GlowCard>
              <div className="text-3xl mb-4">🛡️</div>
              <h3 className="text-lg font-bold">ปลอดภัย 8 ชั้น</h3>
              <p className="mt-2 text-sm text-zinc-400">Rate Limiting, CSRF, AES-256, Server-side proxy, ป้องกัน spam เต็มระบบ</p>
            </GlowCard>

            <GlowCard>
              <div className="text-3xl mb-4">📱</div>
              <h3 className="text-lg font-bold">Responsive 100%</h3>
              <p className="mt-2 text-sm text-zinc-400">สวยทุกอุปกรณ์ — มือถือ แท็บเล็ต เดสก์ท็อป ใช้งานได้ทุกที่</p>
            </GlowCard>

            <GlowCard>
              <div className="text-3xl mb-4">💳</div>
              <h3 className="text-lg font-bold">ระบบเติมเงินครบ</h3>
              <p className="mt-2 text-sm text-zinc-400">สลิปอัตโนมัติ (Slip2Go), ซองอั่งเปา TrueMoney, Wallet ในตัว</p>
            </GlowCard>

            <GlowCard>
              <div className="text-3xl mb-4">👥</div>
              <h3 className="text-lg font-bold">จัดการสมาชิก</h3>
              <p className="mt-2 text-sm text-zinc-400">สร้างบัญชีลูกค้า เติมเงิน ติดตามออเดอร์ ดูประวัติทั้งหมด</p>
            </GlowCard>
          </div>
        </div>
      </AnimatedSection>

      {/* ── How It Works ── */}
      <AnimatedSection className="py-20 sm:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-violet-950/20 to-zinc-950" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-sm font-semibold text-violet-400 uppercase tracking-widest"
            >
              How It Works
            </motion.span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight">เริ่มต้นใน 3 ขั้นตอน</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { step: '01', title: 'สมัคร + ใส่ API Key', desc: 'สร้างบัญชีฟรี 30 วิ ผูก API Key จาก SMM Panel ที่คุณมีอยู่' },
              { step: '02', title: 'ตั้งค่าร้านของคุณ', desc: 'เลือกราคา ธีม โดเมนย่อย — ปรับแต่งให้เป็นแบรนด์ของคุณ' },
              { step: '03', title: 'เปิดขาย — รับรายได้!', desc: 'ส่งลิงก์ให้ลูกค้า รับออเดอร์ ระบบจัดการทุกอย่างอัตโนมัติ' },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center group"
              >
                <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 flex items-center justify-center text-2xl font-black text-violet-400 group-hover:scale-110 transition-transform duration-300">{s.step}</div>
                {i < 2 && (
                  <div className="hidden sm:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-violet-500/50 to-transparent" />
                )}
                <h3 className="mt-6 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-zinc-400">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ── Pricing ── */}
      <AnimatedSection id="pricing" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-sm font-semibold text-violet-400 uppercase tracking-widest"
            >
              Pricing
            </motion.span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight">
              ราคาที่<span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent"> คุ้มค่า</span> ที่สุด
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { name: 'Basic', price: '499', desc: 'สำหรับมือใหม่', features: ['3 API Keys', 'สมาชิก 100 คน', '1 ธีมฟรี', 'ซับโดเมนฟรี'] },
              { name: 'Pro', price: '999', desc: 'ยอดนิยม', features: ['10 API Keys', 'สมาชิก 500 คน', '3 ธีม + พรีเมียม', 'Domain ตัวเอง', 'ซองอั่งเปา', 'ตรวจสลิปอัตโนมัติ'], popular: true },
              { name: 'Enterprise', price: '1,999', desc: 'สำหรับองค์กร', features: ['ไม่จำกัด API Keys', 'สมาชิกไม่จำกัด', 'ทุกธีม + Custom', 'API Access', 'Priority Support'] },
            ].map((pkg, i) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-3xl p-8 flex flex-col backdrop-blur-xl ${
                  pkg.popular
                    ? 'bg-gradient-to-b from-violet-500/10 to-fuchsia-500/5 border border-violet-500/30 shadow-2xl shadow-violet-500/10 scale-[1.02]'
                    : 'bg-white/5 border border-white/10 hover:border-white/20'
                } transition-all duration-300`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-4 py-1 text-xs font-bold shadow-lg shadow-violet-500/30">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-lg font-bold">{pkg.name}</h3>
                <p className="text-sm text-zinc-500 mt-1">{pkg.desc}</p>
                <div className="mt-6 mb-8">
                  <span className="text-5xl font-black">฿{pkg.price}</span>
                  <span className="text-zinc-500 text-sm">/เดือน</span>
                </div>
                <ul className="space-y-3 flex-1">
                  {pkg.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-zinc-300">
                      <span className="text-violet-400 mt-0.5">◆</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`mt-8 inline-flex items-center justify-center rounded-2xl h-12 px-6 text-sm font-bold transition-all active:scale-95 ${
                    pkg.popular
                      ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-xl shadow-violet-500/25'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  Get Started
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ── CTA ── */}
      <AnimatedSection className="py-20 sm:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-cyan-500/10" />
        <FloatingOrbs />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="text-4xl sm:text-5xl font-black"
          >
            พร้อมเปิดร้าน<span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent"> วันนี้</span>?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-zinc-400"
          >
            สมัครฟรี ไม่มีค่าใช้จ่ายแอบแฝง ยกเลิกเมื่อไหร่ก็ได้
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link href="/signup" className="group relative mt-8 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 h-14 px-12 text-lg font-bold text-white shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all active:scale-[0.98] overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              เริ่มต้นฟรีเลย →
            </Link>
          </motion.div>
          <p className="mt-4 text-xs text-zinc-600">ไม่ต้องใช้บัตรเครดิต • ตั้งค่าเสร็จใน 5 นาที</p>
        </div>
      </AnimatedSection>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-xs">P</div>
              <span className="font-bold">PanelRental</span>
            </div>
            <p className="text-sm text-zinc-500">White-Label SMM Panel Platform</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Links</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><Link href="#features" className="hover:text-violet-400 transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-violet-400 transition-colors">Pricing</Link></li>
              <li><Link href="/signin" className="hover:text-violet-400 transition-colors">Sign In</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li>Line: @panelrental</li>
              <li>Email: support@panel-rental.com</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-white/5 text-center text-xs text-zinc-600">
          © 2026 PanelRental. All rights reserved.
        </div>
      </footer>

      {/* CSS for background animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(15px) scale(0.95); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
          33% { transform: translateY(-10px) translateX(10px) scale(1.02); }
          66% { transform: translateY(10px) translateX(-5px) scale(0.98); }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
        .animate-gradient { background-size: 200% 200%; animation: gradient 4s ease infinite; }
      `}</style>
    </div>
  );
}
