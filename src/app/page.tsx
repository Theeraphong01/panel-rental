'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Zap, Clock, Shield, Camera, Music, Users, Video, Sparkles, ArrowRight, Layers, Paintbrush, Smartphone, Wallet, UserPlus, Plug, RefreshCw, TrendingUp, Star, Check } from 'lucide-react';

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
      <div className="text-4xl sm:text-5xl font-black text-primary tabular-nums [text-shadow:0_0_30px_rgba(0,240,255,0.5)]">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

// ── Live Orders Counter (animated ticker) ──
function LiveOrdersCounter() {
  const [orders, setOrders] = useState(124532);

  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="inline-flex items-center gap-3 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-sm font-medium text-primary backdrop-blur-xl"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
      </span>
      <Zap className="w-4 h-4" />
      Orders Processed Today: <span className="font-bold tabular-nums">{orders.toLocaleString()}</span>
    </motion.div>
  );
}

// ── Glow Card ──
function GlowCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`group relative rounded-3xl border border-border bg-card p-8 hover:border-primary/50 hover:shadow-[0_0_40px_-10px_rgba(0,240,255,0.3)] transition-all duration-500 ${className}`}>
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-primary/5 transition-all duration-500" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ── Animated Section ──
function AnimatedSection({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// ── Floating Orbs Background (cyan themed) ──
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/15 rounded-full blur-[128px] animate-float" />
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-chart-2/10 rounded-full blur-[100px] animate-float-delayed" />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-primary/10 rounded-full blur-[96px] animate-float-slow" />
      <div className="absolute -top-20 right-1/4 w-72 h-72 bg-chart-2/10 rounded-full blur-[112px] animate-float" />
    </div>
  );
}

// ── Service category tabs data ──
const smmServices = {
  instagram: [
    { id: 'IG001', name: 'Instagram Followers [Real | Instant | 30-Day Refill]', rate: '฿35', min: 100, max: 50000 },
    { id: 'IG002', name: 'Instagram Likes [High Quality | Fast]', rate: '฿25', min: 50, max: 25000 },
    { id: 'IG003', name: 'Instagram Views [Real Users]', rate: '฿15', min: 100, max: 100000 },
    { id: 'IG004', name: 'Instagram Comments [Custom Text]', rate: '฿80', min: 10, max: 5000 },
  ],
  tiktok: [
    { id: 'TT001', name: 'TikTok Followers [Premium | Instant]', rate: '฿45', min: 100, max: 30000 },
    { id: 'TT002', name: 'TikTok Likes [Fast & Safe]', rate: '฿28', min: 50, max: 50000 },
    { id: 'TT003', name: 'TikTok Views [Real Engagement]', rate: '฿10', min: 1000, max: 1000000 },
  ],
  facebook: [
    { id: 'FB001', name: 'Facebook Page Likes [Real Accounts]', rate: '฿60', min: 100, max: 20000 },
    { id: 'FB002', name: 'Facebook Post Likes [High Retention]', rate: '฿35', min: 50, max: 10000 },
    { id: 'FB003', name: 'Facebook Video Views', rate: '฿12', min: 1000, max: 500000 },
  ],
  youtube: [
    { id: 'YT001', name: 'YouTube Subscribers [Real & Active]', rate: '฿110', min: 100, max: 10000 },
    { id: 'YT002', name: 'YouTube Views [High Retention]', rate: '฿55', min: 1000, max: 100000 },
    { id: 'YT003', name: 'YouTube Likes [Organic Looking]', rate: '฿70', min: 50, max: 5000 },
  ],
};

const platformTabs = [
  { key: 'instagram', label: 'Instagram', icon: Camera },
  { key: 'tiktok', label: 'TikTok', icon: Music },
  { key: 'facebook', label: 'Facebook', icon: Users },
  { key: 'youtube', label: 'YouTube', icon: Video },
];

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
      <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-primary/10 to-chart-2/20 rounded-[2rem] blur-2xl" />
      <div className="relative rounded-2xl border border-border bg-card/90 backdrop-blur-xl shadow-2xl shadow-primary/5 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-chart-2/80" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-xs text-muted-foreground">📊 Dashboard — PanelRental</span>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              <div className="h-3 w-24 bg-muted/50 rounded mt-2" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-20 bg-primary/20 rounded-lg" />
              <div className="h-8 w-20 bg-muted/50 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-xl bg-muted/50 p-4 border border-border">
                <div className="h-3 w-16 bg-muted rounded" />
                <div className="h-6 w-12 bg-primary rounded mt-2" />
                <div className="h-2 w-20 bg-muted rounded mt-2" />
              </div>
            ))}
          </div>
          <div className="h-32 bg-muted/50 rounded-xl border border-border" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted/50 rounded-xl border border-border" />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── MAIN PAGE ──
export default function Home() {
  const [serviceTab, setServiceTab] = useState('instagram');

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── Navbar ── */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-2xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-lg shadow-primary/25">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              Panel<span className="text-primary [text-shadow:0_0_10px_rgba(0,240,255,0.6)]">Rental</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/signin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
            <Link href="/signup" className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground h-9 px-5 text-sm font-semibold hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/25">
              Get Started Free
            </Link>
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
            {/* Live counter badge */}
            <LiveOrdersCounter />

            <h1 className="mt-8 text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05]">
              <span className="block">Launch Your</span>
              <span className="block text-primary [text-shadow:0_0_30px_rgba(0,240,255,0.7),0_0_60px_rgba(0,240,255,0.4)] neon-text">
                SMM Panel
              </span>
              <span className="block">in 5 Minutes</span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              The #1 White-Label platform — launch your professional SMM Panel storefront.
              Manage pricing, themes, and members 100% yourself — no coding required.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-10 flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Link href="/signup" className="group relative inline-flex items-center justify-center rounded-2xl bg-primary h-12 px-8 text-base font-semibold text-primary-foreground shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 transition-all active:scale-[0.98] overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                Start Free Trial <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="#features" className="inline-flex items-center justify-center rounded-2xl border border-border bg-card backdrop-blur-xl h-12 px-8 text-base font-medium text-muted-foreground hover:bg-card/80 hover:border-primary/30 transition-all">
                View All Features
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
      <section className="border-y border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-sm font-medium text-muted-foreground mb-8 uppercase tracking-widest">Trusted by 150+ SMM Stores</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 opacity-40">
            {['PumLF', 'SMMGen', 'SMMFollows', 'JualPanel'].map(n => (
              <div key={n} className="flex items-center justify-center">
                <span className="text-2xl font-black text-muted tracking-widest">{n}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <AnimatedSection className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <Counter end={20} suffix="+" label="Supported APIs" />
            <Counter end={5000} suffix="+" label="Service Types" />
            <Counter end={150} suffix="+" label="Active Stores" />
            <Counter end={50000} suffix="+" label="Orders Daily" />
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
              className="text-sm font-semibold text-primary uppercase tracking-widest"
            >
              Features
            </motion.span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight">
              Everything <span className="text-primary [text-shadow:0_0_20px_rgba(0,240,255,0.4)]">You Need</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Complete SMM Panel management with enterprise-grade features
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <GlowCard className="lg:col-span-2">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <Plug className="w-10 h-10 text-primary" />
                <div>
                  <h3 className="text-xl font-bold">Plug In Your Own API Key</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">
                    Supports every major SMM Panel API — PumLF, SMMGen, SMMFollows and more.
                    API Keys are encrypted with AES-256-GCM via server-side proxy for maximum security.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {['PumLF', 'SMMGen', 'SMMFollows', '+ 17 More APIs'].map(t => (
                      <span key={t} className="px-3 py-1 rounded-full bg-muted border border-border text-xs text-muted-foreground">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </GlowCard>

            <GlowCard>
              <RefreshCw className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-bold">Auto Sync</h3>
              <p className="mt-2 text-sm text-muted-foreground">Order status sync every 3 minutes, service updates hourly — fully automated.</p>
            </GlowCard>

            <GlowCard>
              <Paintbrush className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-bold">20+ Premium Themes</h3>
              <p className="mt-2 text-sm text-muted-foreground">Choose ready-made themes or use Custom CSS — colors, fonts, logos, make it your brand.</p>
            </GlowCard>

            <GlowCard>
              <Shield className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-bold">8-Layer Security</h3>
              <p className="mt-2 text-sm text-muted-foreground">Rate Limiting, CSRF, AES-256, server-side proxy, full spam protection.</p>
            </GlowCard>

            <GlowCard>
              <Smartphone className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-bold">100% Responsive</h3>
              <p className="mt-2 text-sm text-muted-foreground">Beautiful on every device — mobile, tablet, desktop. Works everywhere.</p>
            </GlowCard>

            <GlowCard>
              <Wallet className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-bold">Full Payment System</h3>
              <p className="mt-2 text-sm text-muted-foreground">Auto slip verification (Slip2Go), TrueMoney Wallet, built-in top-up system.</p>
            </GlowCard>

            <GlowCard>
              <UserPlus className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-bold">Member Management</h3>
              <p className="mt-2 text-sm text-muted-foreground">Create customer accounts, top-up, track orders, view full history.</p>
            </GlowCard>
          </div>
        </div>
      </AnimatedSection>

      {/* ── Service Pricing Table with Tabs ── */}
      <AnimatedSection className="py-20 sm:py-28 bg-sidebar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-sm font-semibold text-primary uppercase tracking-widest"
            >
              Live Services
            </motion.span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight">
              Services & <span className="text-primary [text-shadow:0_0_20px_rgba(0,240,255,0.4)]">Pricing</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">Transparent pricing — what you see is what your customers pay.</p>
          </div>

          {/* Tab bar */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {platformTabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setServiceTab(key)}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  serviceTab === key
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                    : 'bg-card border border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Service table */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-border">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-4 text-muted-foreground font-medium text-sm">ID</th>
                  <th className="text-left p-4 text-muted-foreground font-medium text-sm">Service Name</th>
                  <th className="text-left p-4 text-muted-foreground font-medium text-sm">Rate / 1K</th>
                  <th className="text-left p-4 text-muted-foreground font-medium text-sm">Min</th>
                  <th className="text-left p-4 text-muted-foreground font-medium text-sm">Max</th>
                </tr>
              </thead>
              <tbody>
                {smmServices[serviceTab as keyof typeof smmServices].map((svc, i) => (
                  <tr key={svc.id + i} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-primary font-mono text-sm">{svc.id}</td>
                    <td className="p-4 text-foreground text-sm">{svc.name}</td>
                    <td className="p-4 text-chart-2 font-bold text-sm">{svc.rate}</td>
                    <td className="p-4 text-muted-foreground text-sm">{svc.min.toLocaleString()}</td>
                    <td className="p-4 text-muted-foreground text-sm">{svc.max.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {smmServices[serviceTab as keyof typeof smmServices].map((svc, i) => (
              <div key={svc.id + i} className="bg-card border border-border rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-primary font-mono text-xs font-bold">{svc.id}</span>
                  <span className="text-chart-2 font-bold text-sm">{svc.rate}</span>
                </div>
                <div className="text-foreground text-sm font-medium">{svc.name}</div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Min: {svc.min.toLocaleString()}</span>
                  <span>Max: {svc.max.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ── Trust Section (3 cards with lucide icons) ── */}
      <AnimatedSection className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-sm font-semibold text-primary uppercase tracking-widest"
            >
              Why Choose Us
            </motion.span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight">
              Built for <span className="text-primary [text-shadow:0_0_20px_rgba(0,240,255,0.4)]">Reliability</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Card 1 - Zap */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-3xl p-8 text-center hover:border-primary/50 transition-all duration-300 group"
            >
              <div className="flex justify-center mb-5">
                <div className="bg-primary/10 p-4 rounded-2xl group-hover:bg-primary/20 transition-colors">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Delivery</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Orders start processing within seconds. Our automated API hooks ensure lightning-fast fulfillment across all platforms.
              </p>
            </motion.div>

            {/* Card 2 - Clock */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-3xl p-8 text-center hover:border-chart-2/50 transition-all duration-300 group"
            >
              <div className="flex justify-center mb-5">
                <div className="bg-chart-2/10 p-4 rounded-2xl group-hover:bg-chart-2/20 transition-colors">
                  <Clock className="w-8 h-8 text-chart-2" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">Refill Guarantee</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Our intelligent system detects drops automatically and refills them for free. Your customers stay happy.
              </p>
            </motion.div>

            {/* Card 3 - Shield */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-3xl p-8 text-center hover:border-primary/50 transition-all duration-300 group"
            >
              <div className="flex justify-center mb-5">
                <div className="bg-primary/10 p-4 rounded-2xl group-hover:bg-primary/20 transition-colors">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">100% Secure</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We never ask for passwords or sensitive data. All API keys are encrypted end-to-end with AES-256-GCM.
              </p>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* ── How It Works ── */}
      <AnimatedSection className="py-20 sm:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-sm font-semibold text-primary uppercase tracking-widest"
            >
              How It Works
            </motion.span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight">Get Started in 3 Steps</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { step: '01', title: 'Sign Up + Add API Key', desc: 'Create a free account in 30 seconds. Connect your existing SMM Panel API key.' },
              { step: '02', title: 'Customize Your Store', desc: 'Pick your pricing, theme, and subdomain — make it your brand.' },
              { step: '03', title: 'Sell & Earn!', desc: 'Share your link, receive orders — everything is managed automatically.' },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center group"
              >
                <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-2xl font-black text-primary group-hover:scale-110 transition-transform duration-300 group-hover:bg-primary/20">{s.step}</div>
                {i < 2 && (
                  <div className="hidden sm:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/50 to-transparent" />
                )}
                <h3 className="mt-6 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
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
              className="text-sm font-semibold text-primary uppercase tracking-widest"
            >
              Pricing
            </motion.span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight">
              Plans That <span className="text-primary [text-shadow:0_0_20px_rgba(0,240,255,0.4)]">Scale</span> With You
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { name: 'Basic', price: '499', desc: 'Getting started', features: ['3 API Keys', '100 Members', '1 Free Theme', 'Free Subdomain'], highlight: false },
              { name: 'Pro', price: '999', desc: 'Most popular', features: ['10 API Keys', '500 Members', '3+ Premium Themes', 'Custom Domain', 'TrueMoney Wallet', 'Auto Slip Verify'], highlight: true },
              { name: 'Enterprise', price: '1,999', desc: 'For organizations', features: ['Unlimited API Keys', 'Unlimited Members', 'All Themes + Custom', 'API Access', 'Priority Support'], highlight: false },
            ].map((pkg, i) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-3xl p-8 flex flex-col backdrop-blur-xl transition-all duration-300 ${
                  pkg.highlight
                    ? 'bg-card border-2 border-primary shadow-2xl shadow-primary/10 scale-[1.02]'
                    : 'bg-card border border-border hover:border-primary/30'
                }`}
              >
                {pkg.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary text-primary-foreground px-4 py-1 text-xs font-bold shadow-lg shadow-primary/30">
                    MOST POPULAR
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">{pkg.name}</h3>
                  {pkg.highlight && <Star className="w-4 h-4 text-primary fill-primary" />}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{pkg.desc}</p>
                <div className="mt-6 mb-8">
                  <span className="text-5xl font-black">฿{pkg.price}</span>
                  <span className="text-muted-foreground text-sm">/month</span>
                </div>
                <ul className="space-y-3 flex-1">
                  {pkg.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`mt-8 inline-flex items-center justify-center rounded-2xl h-12 px-6 text-sm font-bold transition-all active:scale-95 ${
                    pkg.highlight
                      ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/25 hover:shadow-primary/40'
                      : 'bg-muted text-foreground hover:bg-muted/80 border border-border'
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
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-chart-2/10" />
        <FloatingOrbs />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="text-4xl sm:text-5xl font-black"
          >
            Ready to <span className="text-primary [text-shadow:0_0_30px_rgba(0,240,255,0.5)]">Launch</span> Today?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            Free to sign up. No hidden fees. Cancel anytime.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link href="/signup" className="group relative mt-8 inline-flex items-center justify-center rounded-2xl bg-primary h-14 px-12 text-lg font-bold text-primary-foreground shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-[0.98] overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              Start Free Now <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
          <p className="mt-4 text-xs text-muted-foreground">No credit card required • Set up in 5 minutes</p>
        </div>
      </AnimatedSection>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-12 bg-sidebar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold">PanelRental</span>
            </div>
            <p className="text-sm text-muted-foreground">White-Label SMM Panel Platform</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3 text-foreground">Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/signin" className="hover:text-primary transition-colors">Sign In</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3 text-foreground">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Line: @panelrental</li>
              <li>Email: support@1smm.cloud</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-border text-center text-xs text-muted-foreground">
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
        .neon-text { text-shadow: 0 0 30px rgba(0, 240, 255, 0.7), 0 0 60px rgba(0, 240, 255, 0.4); }
      `}</style>
    </div>
  );
}
