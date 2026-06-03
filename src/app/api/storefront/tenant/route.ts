export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { verifyEndUserToken } from "@/lib/jwt";

export async function GET(req: Request) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return Response.json({ error: "ไม่พบร้านค้า" }, { status: 404 });

  const [tenant, themeConfig] = await Promise.all([
    prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true, subdomain: true },
    }),
    prisma.themeConfig.findUnique({
      where: { tenantId },
      include: { theme: true },
    }),
  ]);

  if (!tenant) return Response.json({ error: "ไม่พบร้านค้า" }, { status: 404 });

  return Response.json({
    name: tenant.name,
    subdomain: tenant.subdomain,
    primaryColor: themeConfig?.primaryColor ?? "#000000",
    themeName: themeConfig?.theme?.name ?? "default",
  });
}
