import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const tenant = await prisma.tenant.findFirst({ where: { userId: session.user.id } });
  if (!tenant) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const users = await prisma.endUser.findMany({
    where: { tenantId: tenant.id },
    select: { id: true, email: true, name: true, balance: true, status: true, createdAt: true, _count: { select: { orders: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(users);
}
