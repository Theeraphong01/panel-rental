'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(e.currentTarget);
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.get('name'),
        email: form.get('email'),
        password: form.get('password'),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    } else {
      router.push('/signin?registered=true');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex">
      {/* Left - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-violet-400/20 via-transparent to-transparent" />
        <div className="relative flex flex-col justify-center px-16 text-white">
          <Link href="/" className="flex items-center gap-2 mb-16">
            <div className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-bold text-white">P</div>
            <span className="font-bold text-xl tracking-tight">Panel<span className="text-violet-200">Rental</span></span>
          </Link>
          <h2 className="text-4xl font-bold leading-tight">เริ่มต้นธุรกิจ<br/>SMM Panel ของคุณ</h2>
          <p className="mt-4 text-lg text-violet-100 leading-relaxed max-w-md">
            สมัครฟรีวันนี้ เปิดร้านใน 5 นาที ไม่ต้องติดตั้งอะไรเลย
          </p>
          <div className="mt-12 space-y-4">
            {['ผูก API Key ที่คุณมีอยู่', 'ตั้งราคาและธีมที่คุณต้องการ', 'ส่งลิงก์ให้ลูกค้า — รับรายได้ทันที'].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">{i + 1}</div>
                <span className="text-violet-100">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-zinc-950">
        <div className="w-full max-w-sm">
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-12 justify-center">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">P</div>
            <span className="font-bold text-lg">PanelRental</span>
          </Link>

          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">สมัครสมาชิก</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">สร้างบัญชีฟรี เริ่มต้นใช้งานทันที</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">ชื่อร้านค้า</Label>
              <Input id="name" name="name" type="text" placeholder="ชื่อร้าน SMM ของคุณ" required className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">อีเมล</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">รหัสผ่าน</Label>
              <Input id="password" name="password" type="password" placeholder="อย่างน้อย 6 ตัวอักษร" required className="h-11 rounded-xl" />
            </div>
            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>
            )}
            <Button type="submit" className="w-full h-11 rounded-xl text-base font-semibold bg-violet-600 hover:bg-violet-700" disabled={loading}>
              {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            มีบัญชีอยู่แล้ว?{' '}
            <Link href="/signin" className="font-semibold text-violet-600 hover:text-violet-700">เข้าสู่ระบบ</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
