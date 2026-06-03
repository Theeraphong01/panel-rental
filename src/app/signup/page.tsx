'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
      body: JSON.stringify({ email: form.get('email'), password: form.get('password'), name: form.get('name') }),
    });
    if (!res.ok) { const data = await res.json(); setError(data.error || 'สมัครไม่สำเร็จ'); setLoading(false); return; }
    await signIn('credentials', { email: form.get('email'), password: form.get('password'), redirect: false });
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle>สมัครสมาชิก</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div><Label htmlFor="name">ชื่อ</Label><Input id="name" name="name" required /></div>
            <div><Label htmlFor="email">อีเมล</Label><Input id="email" name="email" type="email" required /></div>
            <div><Label htmlFor="password">รหัสผ่าน</Label><Input id="password" name="password" type="password" minLength={6} required /></div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}</Button>
          </form>
          <p className="text-sm text-center mt-4">มีบัญชีแล้ว? <a href="/signin" className="text-primary hover:underline">เข้าสู่ระบบ</a></p>
        </CardContent>
      </Card>
    </div>
  );
}
