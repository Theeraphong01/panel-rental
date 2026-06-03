export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const tenant = await prisma.tenant.findFirst({ where: { userId: session.user.id } });
  if (!tenant) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { serviceIds, categoryId } = await req.json();
  await prisma.storefrontService.updateMany({ where: { id: { in: serviceIds }, tenantId: tenant.id }, data: { categoryId: categoryId || null } });
  return NextResponse.json({ ok: true });
}
