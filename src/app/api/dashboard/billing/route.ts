export const dynamic = "force-dynamic";
// Dashboard — Billing & Slip Credits overview
export async function GET(req: Request) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return Response.json({ error: "ไม่พบร้านค้า" }, { status: 404 });

  const { prisma } = await import("@/lib/prisma");

  const [tenant, sub] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: tenantId }, select: { slipCredits: true } }),
    prisma.subscription.findFirst({
      where: { tenantId, status: "active" },
      include: { package: { select: { name: true, slipQuota: true, priceMonthly: true, packageType: true } } },
    }),
  ]);

  const verifications = await prisma.slipVerification.count({ where: { tenantId } });
  const passedVerifications = await prisma.slipVerification.count({ where: { tenantId, status: "passed" } });

  return Response.json({
    slipCredits: tenant?.slipCredits ?? 0,
    subscription: sub ? { name: sub.package.name, price: sub.package.priceMonthly, slipQuota: sub.package.slipQuota, used: sub.slipCreditsUsed } : null,
    stats: { totalVerifications: verifications, passed: passedVerifications },
  });
}
