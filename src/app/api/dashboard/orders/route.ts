import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const tenant = await prisma.tenant.findFirst({ where: { userId: session.user.id } });
  if (!tenant) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orders = await prisma.endUserOrder.findMany({
    where: { tenantId: tenant.id },
    include: { endUser: { select: { email: true } }, storefrontService: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return NextResponse.json(orders);
}
