export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { encrypt, maskKey } from '@/lib/encryption';

async function getTenantId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const tenant = await prisma.tenant.findFirst({ where: { userId: session.user.id } });
  if (!tenant) throw new Error('No tenant');
  return { tenantId: tenant.id, userId: session.user.id };
}

export async function GET() {
  try {
    const { tenantId } = await getTenantId();
    const keys = await prisma.apiKey.findMany({
      where: { tenantId },
      select: { id: true, label: true, panelUrl: true, apiKeyEncrypted: true, isActive: true, lastCheckedAt: true, balanceSnapshot: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    const masked = keys.map(k => ({ ...k, apiKeyEncrypted: maskKey(k.apiKeyEncrypted.split(':').slice(2).join(':')), balanceSnapshot: k.balanceSnapshot }));
    return NextResponse.json(masked);
  } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
}

export async function POST(req: NextRequest) {
  try {
    const { tenantId } = await getTenantId();
    const { label, panelUrl, apiKey } = await req.json();
    if (!label || !panelUrl || !apiKey) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    const apiKeyEncrypted = encrypt(apiKey);
    const key = await prisma.apiKey.create({ data: { tenantId, label, panelUrl, apiKeyEncrypted } });
    return NextResponse.json({ id: key.id, label: key.label, panelUrl: key.panelUrl, maskedKey: maskKey(apiKey), isActive: true }, { status: 201 });
  } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
}
