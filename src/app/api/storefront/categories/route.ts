import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return Response.json({ error: "ไม่พบร้านค้า" }, { status: 404 });

  const categories = await prisma.category.findMany({
    where: { tenantId, isVisible: true },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { services: { where: { isActive: true } } } },
    },
  });

  return Response.json({ categories });
}
