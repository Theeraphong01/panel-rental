export const dynamic = "force-dynamic";
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

export async function GET() {
  try {
    const tenantId = await getTenantId();
    const pkgs = await prisma.topupPackage.findMany({ where: { tenantId }, orderBy: { price: 'asc' } });
    return NextResponse.json(pkgs);
  } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = await getTenantId();
    const { name, price, bonus } = await req.json();
    const pkg = await prisma.topupPackage.create({ data: { tenantId, name, price, bonus: bonus || 0 } });
    return NextResponse.json(pkg, { status: 201 });
  } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
}
