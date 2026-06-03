// GET /api/storefront/banks — get tenant's bank accounts
export async function GET(req: Request) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return Response.json({ error: "ไม่พบร้านค้า" }, { status: 404 });

  const { prisma } = await import("@/lib/prisma");
  const banks = await prisma.bankAccount.findMany({
    where: { tenantId, isActive: true },
    select: {
      id: true,
      bankName: true,
      accountNumber: true,
      accountNameTh: true,
      accountNameEn: true,
    },
  });

  return Response.json({ banks });
}
