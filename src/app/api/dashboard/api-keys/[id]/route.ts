export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import { SmmPanelClient } from '@/lib/smm-panel';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const tenant = await prisma.tenant.findFirst({ where: { userId: session.user.id } });
  if (!tenant) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const key = await prisma.apiKey.findFirst({ where: { id, tenantId: tenant.id } });
  if (!key) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await prisma.apiKey.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const action = new URL(req.url).searchParams.get('action');

  const tenant = await prisma.tenant.findFirst({ where: { userId: session.user.id } });
  if (!tenant) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const key = await prisma.apiKey.findFirst({ where: { id, tenantId: tenant.id } });
  if (!key) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const plainKey = decrypt(key.apiKeyEncrypted);
  const client = new SmmPanelClient(key.panelUrl, plainKey);

  try {
    if (action === 'test') {
      const balance = await client.balance();
      const bal = Math.round(parseFloat(balance.balance) * 100);
      await prisma.apiKey.update({ where: { id }, data: { balanceSnapshot: bal, lastCheckedAt: new Date() } });
      return NextResponse.json({ ok: true, balance: balance.balance, currency: balance.currency });
    }
    if (action === 'fetch-services') {
      const services = await client.services();
      return NextResponse.json(services);
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Panel API error' }, { status: 502 });
  }
}
