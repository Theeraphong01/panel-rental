export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

function randomSubdomain(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9ก-๙]/g, '').slice(0, 20) || 'store';
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}${suffix}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name } = signupSchema.parse(body);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: 'อีเมลนี้มีผู้ใช้แล้ว' }, { status: 409 });
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user + auto-create tenant
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        tenants: {
          create: {
            subdomain: randomSubdomain(name),
            name,
            status: 'trial',
            trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        },
      },
      include: { tenants: true },
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      tenant: { id: user.tenants[0].id, subdomain: user.tenants[0].subdomain },
    }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 });
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
