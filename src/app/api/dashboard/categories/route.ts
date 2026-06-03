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
    const cats = await prisma.category.findMany({ where: { tenantId }, orderBy: { sortOrder: 'asc' } });
    return NextResponse.json(cats);
  } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = await getTenantId();
    const { name } = await req.json();
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const count = await prisma.category.count({ where: { tenantId } });
    const cat = await prisma.category.create({ data: { tenantId, name, slug, sortOrder: count } });
    return NextResponse.json(cat, { status: 201 });
  } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
}
