// Dashboard — Logo Upload
export async function POST(req: Request) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return Response.json({ error: "ไม่พบร้านค้า" }, { status: 404 });

  const { prisma } = await import("@/lib/prisma");

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return Response.json({ error: "กรุณาเลือกไฟล์" }, { status: 400 });

    const validTypes = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return Response.json({ error: "รองรับเฉพาะ PNG, JPG, SVG, WebP" }, { status: 400 });
    }
    if (file.size > 2 * 1024 * 1024) {
      return Response.json({ error: "ไฟล์ใหญ่เกิน 2MB" }, { status: 400 });
    }

    // Save to public/uploads/logos/
    const fs = await import("fs/promises");
    const path = await import("path");
    const ext = file.name.split(".").pop() || "png";
    const filename = `${tenantId}_${Date.now()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "logos");
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const logoUrl = `/uploads/logos/${filename}`;

    // Update tenant and themeConfig
    await prisma.tenant.update({ where: { id: tenantId }, data: { logoUrl } });
    await prisma.themeConfig.updateMany({ where: { tenantId }, data: { logoUrl } });

    return Response.json({ logoUrl });
  } catch (e: any) {
    console.error(e);
    return Response.json({ error: "อัพโหลดไม่สำเร็จ" }, { status: 500 });
  }
}
