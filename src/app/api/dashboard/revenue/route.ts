import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const tenant = await prisma.tenant.findFirst({ where: { userId: session.user.id } });
  if (!tenant) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [orders, totalProfit, totalRevenue, topServices] = await Promise.all([
    prisma.endUserOrder.count({ where: { tenantId: tenant.id } }),
    prisma.endUserOrder.aggregate({ where: { tenantId: tenant.id }, _sum: { profit: true } }),
    prisma.endUserOrder.aggregate({ where: { tenantId: tenant.id }, _sum: { sellPrice: true } }),
    prisma.endUserOrder.groupBy({ by: ['storefrontServiceId'], where: { tenantId: tenant.id }, _sum: { profit: true, quantity: true }, orderBy: { _sum: { profit: 'desc' } }, take: 5 }),
  ]);

  const topServiceDetails = await Promise.all(
    topServices.map(async s => {
      const svc = await prisma.storefrontService.findUnique({ where: { id: s.storefrontServiceId }, select: { name: true } });
      return { name: svc?.name, profit: s._sum.profit, quantity: s._sum.quantity };
    })
  );

  return NextResponse.json({
    totalOrders: orders,
    totalProfit: totalProfit._sum.profit ?? 0,
    totalRevenue: totalRevenue._sum.sellPrice ?? 0,
    topServices: topServiceDetails,
  });
}
