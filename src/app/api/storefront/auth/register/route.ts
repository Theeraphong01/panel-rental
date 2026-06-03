import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signEndUserToken } from "@/lib/jwt";

const schema = z.object({
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านอย่างน้อย 6 ตัว"),
  name: z.string().min(2, "ชื่ออย่างน้อย 2 ตัว"),
});

export async function POST(req: Request) {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return Response.json({ error: "ไม่พบร้านค้า" }, { status: 404 });

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { email, password, name } = parsed.data;

    // Check existing
    const existing = await prisma.endUser.findFirst({ where: { tenantId, email } });
    if (existing) {
      return Response.json({ error: "อีเมลนี้มีผู้ใช้แล้ว" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.endUser.create({
      data: { tenantId, email, passwordHash, name, balance: 0 },
    });

    const token = await signEndUserToken({
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
    });

    return Response.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, balance: user.balance },
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
