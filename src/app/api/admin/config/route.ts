export const dynamic = "force-dynamic";
// Admin — System Config (Slip2Go key, Cloudflare, Voucher)
export async function GET() {
  const { prisma } = await import("@/lib/prisma");
  const configs = await prisma.systemConfig.findMany();
  // Mask sensitive values
  const masked = configs.map(c => ({
    id: c.id,
    value: c.id.includes("secret") || c.id.includes("key") ? (c.value ? "***" : "") : c.value,
  }));
  return Response.json({ configs: masked });
}

export async function PATCH(req: Request) {
  const { prisma } = await import("@/lib/prisma");
  const { encrypt } = await import("@/lib/encryption");
  const body = await req.json();

  if (!body.id || body.value === undefined) {
    return Response.json({ error: "ต้องระบุ id และ value" }, { status: 400 });
  }

  // Encrypt sensitive fields
  let value = body.value;
  if (body.id.includes("secret") || body.id.includes("api_key")) {
    value = encrypt(body.value);
  }

  await prisma.systemConfig.upsert({
    where: { id: body.id },
    create: { id: body.id, value },
    update: { value },
  });

  return Response.json({ success: true });
}
