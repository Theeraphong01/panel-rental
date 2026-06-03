'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    if (result?.error) setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    else {
      const res = await fetch('/api/auth/session');
      const session = await res.json();
      if (session?.user?.role === 'admin') router.push('/admin');
      else router.push('/dashboard');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle>เข้าสู่ระบบ</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div><Label htmlFor="email">อีเมล</Label><Input id="email" name="email" type="email" required /></div>
            <div><Label htmlFor="password">รหัสผ่าน</Label><Input id="password" name="password" type="password" required /></div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</Button>
          </form>
          <p className="text-sm text-center mt-4">ยังไม่มีบัญชี? <a href="/signup" className="text-primary hover:underline">สมัครสมาชิก</a></p>
        </CardContent>
      </Card>
    </div>
  );
}
