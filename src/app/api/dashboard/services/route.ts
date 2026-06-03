import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

async function getTenantId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const tenant = await prisma.tenant.findFirst({ where: { userId: session.user.id } });
  if (!tenant) throw new Error('No tenant');
  return tenant.id;
}

export async function GET(req: NextRequest) {
  try {
    const tenantId = await getTenantId();
    const categoryId = req.nextUrl.searchParams.get('categoryId');
    const where: any = { tenantId };
    if (categoryId) where.categoryId = categoryId;
    const services = await prisma.storefrontService.findMany({
      where,
      include: { category: { select: { id: true, name: true } }, apiKey: { select: { id: true, label: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(services);
  } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
}
