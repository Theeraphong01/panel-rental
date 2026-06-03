export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { verifyEndUserToken } from "@/lib/jwt";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return Response.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  try {
    const payload = await verifyEndUserToken(authHeader.slice(7));
    const user = await prisma.endUser.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, name: true, balance: true, status: true, createdAt: true },
    });
    if (!user || user.status === "suspended") {
      return Response.json({ error: "ไม่พบบัญชี" }, { status: 404 });
    }

    return Response.json({ user });
  } catch {
    return Response.json({ error: "token ไม่ถูกต้อง" }, { status: 401 });
  }
}

export async function PATCH(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return Response.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  try {
    const payload = await verifyEndUserToken(authHeader.slice(7));
    const body = await req.json();

    // Only allow updating name and password (via old password verification)
    if (body.name) {
      const user = await prisma.endUser.update({
        where: { id: payload.id },
        data: { name: body.name },
        select: { id: true, email: true, name: true, balance: true },
      });
      return Response.json({ user });
    }

    return Response.json({ error: "ไม่พบข้อมูลที่จะอัพเดท" }, { status: 400 });
  } catch {
    return Response.json({ error: "token ไม่ถูกต้อง" }, { status: 401 });
  }
}
