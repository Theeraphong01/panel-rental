export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { verifyEndUserToken } from "@/lib/jwt";
import { z } from "zod";

const slipSchema = z.object({
  topupPackageId: z.string().min(1),
  slipImageUrl: z.string().url("กรุณาอัพโหลดสลิป"),
});

export async function GET(req: Request) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return Response.json({ error: "ไม่พบร้านค้า" }, { status: 404 });

  const packages = await prisma.topupPackage.findMany({
    where: { tenantId, isActive: true },
    orderBy: { price: "asc" },
  });

  return Response.json({ packages });
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return Response.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return Response.json({ error: "ไม่พบร้านค้า" }, { status: 404 });

  try {
    const payload = await verifyEndUserToken(authHeader.slice(7));

    const body = await req.json();
    const parsed = slipSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { topupPackageId, slipImageUrl } = parsed.data;

    const pkg = await prisma.topupPackage.findUnique({
      where: { id: topupPackageId },
    });
    if (!pkg || pkg.tenantId !== tenantId || !pkg.isActive) {
      return Response.json({ error: "ไม่พบแพ็คเกจเติมเงิน" }, { status: 404 });
    }

    const slip = await prisma.topupSlip.create({
      data: {
        tenantId,
        endUserId: payload.id,
        topupPackageId,
        amount: pkg.price,
        slipImageUrl,
        status: "pending",
      },
    });

    return Response.json({ slip });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
