export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const [totalUsers, activeTenants, activeSubs, totalRevenue] = await Promise.all([
    prisma.user.count(),
    prisma.tenant.count({ where: { status: 'active' } }),
    prisma.subscription.count({ where: { status: 'active' } }),
    prisma.transaction.aggregate({ where: { status: 'completed' }, _sum: { amount: true } }),
  ]);

  const trialTenants = await prisma.tenant.count({ where: { status: 'trial' } });

  // MRR = sum of package prices for active subscriptions
  const activeSubscriptions = await prisma.subscription.findMany({
    where: { status: 'active' },
    include: { package: true },
  });
  const mrr = activeSubscriptions.reduce((sum, sub) => sum + sub.package.priceMonthly, 0);

  const packages = await prisma.package.findMany({
    include: { _count: { select: { subscriptions: true } } },
  });

  return NextResponse.json({
    totalUsers,
    activeTenants,
    trialTenants,
    activeSubs: activeSubs,
    mrr,
    totalRevenue: totalRevenue._sum.amount ?? 0,
    packages: packages.map(p => ({ name: p.name, price: p.priceMonthly, subscriptions: p._count.subscriptions })),
  });
}
