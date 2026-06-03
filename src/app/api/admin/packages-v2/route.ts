// Admin — Package Management (Combo + Slip Topup)
export async function GET() {
  const { prisma } = await import("@/lib/prisma");
  const packages = await prisma.package.findMany({ orderBy: { priceMonthly: "asc" } });
  return Response.json({ packages });
}

export async function POST(req: Request) {
  const { prisma } = await import("@/lib/prisma");
  const body = await req.json();
  const pkg = await prisma.package.create({
    data: {
      name: body.name,
      packageType: body.packageType || "combo",
      priceMonthly: body.priceMonthly,
      maxApiKeys: body.maxApiKeys || 0,
      maxEndUsers: body.maxEndUsers || null,
      slipQuota: body.slipQuota || 0,
      premiumThemes: body.premiumThemes ?? false,
      customDomain: body.customDomain ?? false,
      isActive: body.isActive ?? true,
    },
  });
  return Response.json({ package: pkg });
}

export async function PATCH(req: Request) {
  const { prisma } = await import("@/lib/prisma");
  const body = await req.json();
  if (!body.id) return Response.json({ error: "ต้องระบุ ID" }, { status: 400 });

  const pkg = await prisma.package.update({
    where: { id: body.id },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.priceMonthly !== undefined && { priceMonthly: body.priceMonthly }),
      ...(body.slipQuota !== undefined && { slipQuota: body.slipQuota }),
      ...(body.maxApiKeys !== undefined && { maxApiKeys: body.maxApiKeys }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
  });
  return Response.json({ package: pkg });
}
