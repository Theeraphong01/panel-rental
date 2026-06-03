export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const configs = await prisma.systemConfig.findMany({
    where: { id: { in: ["cloudflare_api_key", "cloudflare_zone_id"] } },
  });
  const subdomains = await prisma.tenant.findMany({
    select: { subdomain: true, name: true, status: true },
    where: { status: "active" },
  });

  const result: Record<string, string> = {};
  for (const c of configs) result[c.id] = c.value ? "***" : "";
  return Response.json({ config: result, subdomains });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { subdomain, tenantId } = body;

  if (!subdomain || !tenantId) {
    return Response.json({ error: "ต้องระบุ subdomain และ tenantId" }, { status: 400 });
  }

  // Read CF config
  const cfKey = await prisma.systemConfig.findUnique({ where: { id: "cloudflare_api_key" } });
  const zoneId = await prisma.systemConfig.findUnique({ where: { id: "cloudflare_zone_id" } });

  if (!cfKey?.value || !zoneId?.value) {
    return Response.json({ error: "ยังไม่ได้ตั้งค่า Cloudflare API" }, { status: 400 });
  }

  try {
    // Create DNS record via CF API
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId.value}/dns_records`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cfKey.value}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "CNAME",
          name: subdomain,
          content: process.env.NEXT_PUBLIC_ROOT_DOMAIN || "1smm.cloud",
          proxied: true,
        }),
      }
    );
    const data = await res.json();

    if (data.success) {
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { subdomain },
      });
      return Response.json({ success: true, message: `สร้าง subdomain ${subdomain} สำเร็จ` });
    }

    return Response.json({ error: data.errors?.[0]?.message || "Cloudflare API error" }, { status: 400 });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
