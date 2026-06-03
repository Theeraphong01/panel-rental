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
    const slips = await prisma.topupSlip.findMany({
      where: { tenantId },
      include: { endUser: { select: { email: true, name: true } }, topupPackage: { select: { name: true, price: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(slips);
  } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status }: { id: string; status: 'approved' | 'rejected' } = await req.json();
    const tenantId = await getTenantId();
    const slip = await prisma.topupSlip.findFirst({ where: { id, tenantId }, include: { topupPackage: true } });
    if (!slip || slip.status !== 'pending') return NextResponse.json({ error: 'Invalid slip' }, { status: 400 });

    const session = await auth();
    await prisma.topupSlip.update({ where: { id }, data: { status, reviewedBy: session!.user!.id!, reviewedAt: new Date() } });

    if (status === 'approved') {
      const addAmount = slip.topupPackage.price + (slip.topupPackage.bonus || 0);
      await prisma.$transaction([
        prisma.endUser.update({ where: { id: slip.endUserId }, data: { balance: { increment: addAmount } } }),
        prisma.endUserTransaction.create({
          data: { endUserId: slip.endUserId, tenantId, amount: addAmount, type: 'topup', balanceAfter: (await prisma.endUser.findUnique({ where: { id: slip.endUserId } }))!.balance + addAmount, reference: `slip:${slip.id}` },
        }),
        prisma.notification.create({
          data: { recipientType: 'end_user', recipientId: slip.endUserId, type: 'slip_approved', title: 'เติมเงินสำเร็จ', message: `เติมเงิน ${addAmount / 100} บาท สำเร็จ`, link: '/topup' },
        }),
      ]);
    } else {
      await prisma.notification.create({
        data: { recipientType: 'end_user', recipientId: slip.endUserId, type: 'slip_rejected', title: 'การเติมเงินถูกปฏิเสธ', message: 'กรุณาตรวจสอบสลิปและลองใหม่', link: '/topup' },
      });
    }
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
}
