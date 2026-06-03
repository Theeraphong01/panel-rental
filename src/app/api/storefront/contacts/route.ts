// GET /api/storefront/contacts — get tenant's public contact info
export async function GET(req: Request) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return Response.json({ error: "ไม่พบร้านค้า" }, { status: 404 });

  const { prisma } = await import("@/lib/prisma");
  const contacts = await prisma.contactInfo.findMany({
    where: { tenantId, isVisible: true },
    orderBy: { sortOrder: "asc" },
  });

  return Response.json({ contacts });
}
