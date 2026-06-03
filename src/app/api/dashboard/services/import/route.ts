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

export async function POST(req: NextRequest) {
  try {
    const tenantId = await getTenantId();
    const { apiKeyId, services } = await req.json(); // services: { service, name, type, rate, min, max, dripfeed, refill, cancel }[]
    if (!apiKeyId || !services?.length) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const key = await prisma.apiKey.findFirst({ where: { id: apiKeyId, tenantId } });
    if (!key) return NextResponse.json({ error: 'API key not found' }, { status: 404 });

    const imported = [];
    for (const s of services) {
      const existing = await prisma.storefrontService.findUnique({
        where: { tenantId_apiKeyId_serviceId: { tenantId, apiKeyId, serviceId: s.service } },
      });
      if (!existing) {
        const svc = await prisma.storefrontService.create({
          data: {
            tenantId, apiKeyId, serviceId: s.service, name: s.name, type: s.type || 'Default',
            panelRate: parseFloat(s.rate), minOrder: parseInt(s.min), maxOrder: parseInt(s.max),
            dripfeed: s.dripfeed || false, panelRefill: s.refill || false, panelCancel: s.cancel || false,
          },
        });
        imported.push(svc);
      }
    }
    return NextResponse.json({ imported: imported.length, skipped: services.length - imported.length }, { status: 201 });
  } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
}
