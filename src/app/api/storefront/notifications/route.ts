import { prisma } from "@/lib/prisma";
import { verifyEndUserToken } from "@/lib/jwt";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return Response.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  try {
    const payload = await verifyEndUserToken(authHeader.slice(7));

    const url = new URL(req.url);
    const unreadOnly = url.searchParams.get("unread") === "1";

    const where: any = {
      recipientType: "end_user",
      recipientId: payload.id,
    };
    if (unreadOnly) where.isRead = false;

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.notification.count({
        where: { recipientType: "end_user", recipientId: payload.id, isRead: false },
      }),
    ]);

    return Response.json({ notifications, unreadCount });
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

    if (body.markAllRead) {
      await prisma.notification.updateMany({
        where: { recipientType: "end_user", recipientId: payload.id, isRead: false },
        data: { isRead: true },
      });
      return Response.json({ success: true });
    }

    if (body.id) {
      await prisma.notification.updateMany({
        where: { id: body.id, recipientId: payload.id },
        data: { isRead: true },
      });
      return Response.json({ success: true });
    }

    return Response.json({ error: "ไม่พบข้อมูล" }, { status: 400 });
  } catch {
    return Response.json({ error: "token ไม่ถูกต้อง" }, { status: 401 });
  }
}
