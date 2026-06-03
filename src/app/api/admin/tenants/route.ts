import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const tenants = await prisma.tenant.findMany({
    include: {
      user: { select: { email: true, name: true } },
      subscription: { include: { package: true }, orderBy: { createdAt: 'desc' }, take: 1 },
      _count: { select: { apiKeys: true, endUsers: true, services: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(tenants);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id, status } = await req.json();
  await prisma.tenant.update({ where: { id }, data: { status } });
  return NextResponse.json({ ok: true });
}
