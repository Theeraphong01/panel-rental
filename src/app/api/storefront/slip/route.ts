export const dynamic = "force-dynamic";
// POST /api/storefront/slip — verify slip by image upload
export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return Response.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return Response.json({ error: "ไม่พบร้านค้า" }, { status: 404 });

  try {
    const { verifyEndUserToken } = await import("@/lib/jwt");
    const { verifySlipForTopup } = await import("@/lib/slip2go");
    const { checkAndRefillSlips } = await import("@/lib/slip-credits");

    const payload = await verifyEndUserToken(authHeader.slice(7));

    // Ensure slips are available
    await checkAndRefillSlips(tenantId);

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const expectedAmount = parseInt(formData.get("amount") as string || "0", 10);

    if (!file || !(file instanceof File)) {
      return Response.json({ error: "กรุณาแนบรูปสลิป" }, { status: 400 });
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      return Response.json({ error: "รองรับเฉพาะไฟล์ JPG หรือ PNG" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return Response.json({ error: "ไฟล์ใหญ่เกิน 5MB" }, { status: 400 });
    }

    const result = await verifySlipForTopup(tenantId, payload.id, file, expectedAmount);
    return Response.json(result);
  } catch (e: any) {
    console.error(e);
    return Response.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
