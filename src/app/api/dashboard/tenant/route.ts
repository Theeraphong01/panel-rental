export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const tenant = await prisma.tenant.findFirst({
    where: { userId: session.user.id },
    include: {
      subscription: { include: { package: true }, orderBy: { createdAt: 'desc' }, take: 1 },
      _count: { select: { apiKeys: true, endUsers: true, services: true, categories: true } },
    },
  });
  if (!tenant) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(tenant);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const tenant = await prisma.tenant.findFirst({ where: { userId: session.user.id } });
  if (!tenant) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await req.json();
  await prisma.tenant.update({ where: { id: tenant.id }, data });
  return NextResponse.json({ ok: true });
}
