// Dashboard — Bank Accounts CRUD
export async function GET(req: Request) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return Response.json({ error: "ไม่พบร้านค้า" }, { status: 404 });

  const { prisma } = await import("@/lib/prisma");
  const banks = await prisma.bankAccount.findMany({ where: { tenantId }, orderBy: { createdAt: "asc" } });
  return Response.json({ banks });
}

export async function POST(req: Request) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return Response.json({ error: "ไม่พบร้านค้า" }, { status: 404 });

  const { prisma } = await import("@/lib/prisma");
  const body = await req.json();

  // Validate: no spaces or dashes in account number
  const accountNumber = (body.accountNumber || "").replace(/[\s-]/g, "");
  if (!accountNumber || !/^\d+$/.test(accountNumber)) {
    return Response.json({ error: "เลขบัญชีต้องเป็นตัวเลขเท่านั้น" }, { status: 400 });
  }
  if (!body.accountNameTh || !body.accountNameEn || !body.bankName) {
    return Response.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
  }

  const bank = await prisma.bankAccount.create({
    data: {
      tenantId,
      bankName: body.bankName,
      accountNumber,
      accountNameTh: body.accountNameTh,
      accountNameEn: body.accountNameEn,
    },
  });
  return Response.json({ bank });
}

export async function PATCH(req: Request) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return Response.json({ error: "ไม่พบร้านค้า" }, { status: 404 });

  const { prisma } = await import("@/lib/prisma");
  const body = await req.json();
  if (!body.id) return Response.json({ error: "ต้องระบุ ID" }, { status: 400 });

  const accountNumber = body.accountNumber ? body.accountNumber.replace(/[\s-]/g, "") : undefined;
  const bank = await prisma.bankAccount.update({
    where: { id: body.id, tenantId },
    data: {
      ...(body.bankName && { bankName: body.bankName }),
      ...(accountNumber && { accountNumber }),
      ...(body.accountNameTh && { accountNameTh: body.accountNameTh }),
      ...(body.accountNameEn && { accountNameEn: body.accountNameEn }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
  });
  return Response.json({ bank });
}

export async function DELETE(req: Request) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return Response.json({ error: "ไม่พบร้านค้า" }, { status: 404 });

  const { prisma } = await import("@/lib/prisma");
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "ต้องระบุ ID" }, { status: 400 });

  await prisma.bankAccount.delete({ where: { id, tenantId } });
  return Response.json({ success: true });
}
