export const dynamic = "force-dynamic";
// Dashboard — Contact Info CRUD
export async function GET(req: Request) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return Response.json({ error: "ไม่พบร้านค้า" }, { status: 404 });

  const { prisma } = await import("@/lib/prisma");
  const contacts = await prisma.contactInfo.findMany({ where: { tenantId }, orderBy: { sortOrder: "asc" } });
  return Response.json({ contacts });
}

export async function POST(req: Request) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return Response.json({ error: "ไม่พบร้านค้า" }, { status: 404 });

  const { prisma } = await import("@/lib/prisma");
  const body = await req.json();
  if (!body.type || !body.value) {
    return Response.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
  }
  const validTypes = ["line", "facebook", "email", "phone"];
  if (!validTypes.includes(body.type)) {
    return Response.json({ error: "ประเภทไม่ถูกต้อง" }, { status: 400 });
  }

  const contact = await prisma.contactInfo.create({
    data: {
      tenantId,
      type: body.type,
      value: body.value,
      label: body.label || null,
      isVisible: body.isVisible ?? true,
    },
  });
  return Response.json({ contact });
}

export async function PATCH(req: Request) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return Response.json({ error: "ไม่พบร้านค้า" }, { status: 404 });

  const { prisma } = await import("@/lib/prisma");
  const body = await req.json();
  if (!body.id) return Response.json({ error: "ต้องระบุ ID" }, { status: 400 });

  const contact = await prisma.contactInfo.update({
    where: { id: body.id, tenantId },
    data: {
      ...(body.value && { value: body.value }),
      ...(body.label !== undefined && { label: body.label }),
      ...(body.isVisible !== undefined && { isVisible: body.isVisible }),
    },
  });
  return Response.json({ contact });
}

export async function DELETE(req: Request) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return Response.json({ error: "ไม่พบร้านค้า" }, { status: 404 });

  const { prisma } = await import("@/lib/prisma");
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "ต้องระบุ ID" }, { status: 400 });

  await prisma.contactInfo.delete({ where: { id, tenantId } });
  return Response.json({ success: true });
}
