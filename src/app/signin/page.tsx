'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    } else {
      const res = await fetch('/api/auth/session');
      const session = await res.json();
      if (session?.user?.role === 'admin') router.push('/admin');
      else router.push('/dashboard');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex">
      {/* Left - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-indigo-600/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-violet-500/10 via-transparent to-transparent" />
        <div className="relative flex flex-col justify-center px-16 text-white">
          <Link href="/" className="flex items-center gap-2 mb-16">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center font-bold text-white">P</div>
            <span className="font-bold text-xl tracking-tight">Panel<span className="text-violet-400">Rental</span></span>
          </Link>
          <h2 className="text-4xl font-bold leading-tight">ยินดีต้อนรับ<br/>กลับมาอีกครั้ง</h2>
          <p className="mt-4 text-lg text-zinc-400 leading-relaxed max-w-md">
            เข้าสู่ระบบเพื่อจัดการร้าน SMM Panel ของคุณ ดูออเดอร์ รายได้ และตั้งค่าระบบ
          </p>
          <div className="mt-12 flex gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-violet-400">150+</div>
              <div className="text-sm text-zinc-500">ร้านค้า</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-violet-400">50K+</div>
              <div className="text-sm text-zinc-500">ออเดอร์/วัน</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-violet-400">99.9%</div>
              <div className="text-sm text-zinc-500">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-zinc-950">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-12 justify-center">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">P</div>
            <span className="font-bold text-lg">PanelRental</span>
          </Link>

          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">เข้าสู่ระบบ</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">กรอกอีเมลและรหัสผ่านเพื่อเข้าใช้งาน</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">อีเมล</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">รหัสผ่าน</Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" required className="h-11 rounded-xl" />
            </div>
            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>
            )}
            <Button type="submit" className="w-full h-11 rounded-xl text-base font-semibold bg-violet-600 hover:bg-violet-700" disabled={loading}>
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            ยังไม่มีบัญชี?{' '}
            <Link href="/signup" className="font-semibold text-violet-600 hover:text-violet-700">สมัครสมาชิก</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
