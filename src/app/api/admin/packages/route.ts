import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const packages = await prisma.package.findMany({ orderBy: { priceMonthly: 'asc' } });
  return NextResponse.json(packages);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const data = await req.json();
  const pkg = await prisma.package.create({ data: { ...data, id: data.name?.toLowerCase() } });
  return NextResponse.json(pkg, { status: 201 });
}
