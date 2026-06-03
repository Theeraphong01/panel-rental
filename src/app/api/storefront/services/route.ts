export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return Response.json({ error: "ไม่พบร้านค้า" }, { status: 404 });

  const url = new URL(req.url);
  const search = url.searchParams.get("q") || "";
  const category = url.searchParams.get("cat") || "";

  // Get categories (visible)
  const categories = await prisma.category.findMany({
    where: { tenantId, isVisible: true },
    orderBy: { sortOrder: "asc" },
  });

  // Get services
  const where: any = { tenantId, isActive: true };
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }
  if (category) {
    const cat = categories.find((c) => c.slug === category || c.id === category);
    if (cat) where.categoryId = cat.id;
  }

  const services = await prisma.storefrontService.findMany({
    where,
    include: { category: true },
    orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
    take: 100,
  });

  return Response.json({ categories, services, total: services.length });
}
