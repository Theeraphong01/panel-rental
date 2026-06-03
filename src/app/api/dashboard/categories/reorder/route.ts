import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const tenant = await prisma.tenant.findFirst({ where: { userId: session.user.id } });
  if (!tenant) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { orders } = await req.json(); // [{ id, sortOrder }]
  for (const o of orders) {
    await prisma.category.updateMany({ where: { id: o.id, tenantId: tenant.id }, data: { sortOrder: o.sortOrder } });
  }
  return NextResponse.json({ ok: true });
}
