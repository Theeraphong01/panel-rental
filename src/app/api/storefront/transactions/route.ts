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
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = 10;

    const [txns, total] = await Promise.all([
      prisma.endUserTransaction.findMany({
        where: { endUserId: payload.id },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.endUserTransaction.count({ where: { endUserId: payload.id } }),
    ]);

    return Response.json({ transactions: txns, total, page, totalPages: Math.ceil(total / limit) });
  } catch {
    return Response.json({ error: "token ไม่ถูกต้อง" }, { status: 401 });
  }
}
