'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Zap, TrendingUp, Activity, ArrowLeft, Mail, Lock, LogIn, ShieldCheck } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(e.currentTarget);
    const result = await signIn('credentials', {
      email: form.get('email') as string,
      password: form.get('password') as string,
      redirect: false,
    });
    if (result?.error) {
      setError('Invalid email or password');
    } else {
      const res = await fetch('/api/auth/session');
      const session = await res.json();
      if (session?.user?.role === 'admin') router.push('/admin');
      else router.push('/dashboard');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left — Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-chart-2/10" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[128px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-chart-2/10 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3" />

        <div className="relative flex flex-col justify-center px-16 w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/" className="inline-flex items-center gap-2 mb-16 group">
              <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center font-bold text-primary-foreground shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground">
                Panel<span className="text-primary [text-shadow:0_0_10px_rgba(0,240,255,0.6)]">Rental</span>
              </span>
            </Link>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <h2 className="text-4xl font-bold leading-tight text-foreground">
              Welcome<br />Back Again
            </h2>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-md">
              Sign in to manage your SMM Panel store. View orders, track revenue, and configure your system.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 flex gap-8"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-primary [text-shadow:0_0_15px_rgba(0,240,255,0.4)]">150+</div>
              <div className="text-sm text-muted-foreground">Stores</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary [text-shadow:0_0_15px_rgba(0,240,255,0.4)]">50K+</div>
              <div className="text-sm text-muted-foreground">Orders/Day</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-chart-2 [text-shadow:0_0_15px_rgba(0,230,118,0.4)]">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
          </motion.div>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-10 space-y-3"
          >
            {[
              { icon: Zap, text: 'Instant order processing' },
              { icon: ShieldCheck, text: 'AES-256 encrypted API keys' },
              { icon: TrendingUp, text: 'Real-time revenue tracking' },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-3 text-muted-foreground">
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm"
        >
          {/* Back link + mobile logo */}
          <div className="flex items-center justify-between mb-10">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <Link href="/" className="lg:hidden flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
                <Sparkles className="w-3 h-3" />
              </div>
              <span className="font-bold text-sm">PanelRental</span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-foreground">Sign In</h1>
          <p className="mt-2 text-sm text-muted-foreground">Enter your email and password to continue</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive"
              >
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Activity className="w-4 h-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </span>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/signup" className="font-semibold text-primary hover:text-primary/80 transition-colors">
              Create Account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
