export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { verifyEndUserToken } from "@/lib/jwt";
import { z } from "zod";
import { decrypt } from "@/lib/encryption";
import { checkOrderLimit, checkOrderCooldown } from "@/lib/rate-limit";
import { logActivity } from "@/lib/audit";

const orderSchema = z.object({
  serviceId: z.string().min(1),
  link: z.string().url("กรุณากรอกลิงก์ให้ถูกต้อง"),
  quantity: z.number().int().min(1),
  runs: z.number().int().optional(),
  interval: z.number().int().optional(),
  comments: z.string().optional(),
});

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return Response.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  try {
    const payload = await verifyEndUserToken(authHeader.slice(7));

    // Rate limiting
    const orderLimit = checkOrderLimit(payload.id);
    if (!orderLimit.ok) {
      return Response.json(
        { error: `ส่งคำสั่งซื้อบ่อยเกินไป กรุณารอ ${orderLimit.retryAfter} วินาที` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { serviceId, link, quantity, runs, interval, comments } = parsed.data;

    // Order cooldown — prevent duplicate orders on same service
    const cooldown = checkOrderCooldown(payload.id, serviceId);
    if (!cooldown.ok) {
      return Response.json(
        { error: `เพิ่งสั่งบริการนี้ไป กรุณารอ ${cooldown.retryAfter} วินาที` },
        { status: 429 }
      );
    }

    // Find service
    const service = await prisma.storefrontService.findUnique({
      where: { id: serviceId },
      include: { apiKey: true },
    });
    if (!service || !service.isActive || service.tenantId !== payload.tenantId) {
      return Response.json({ error: "ไม่พบบริการนี้" }, { status: 404 });
    }

    // Calculate price
    const sellPrice =
      service.priceType === "manual" && service.priceManual
        ? (service.priceManual ?? 0) * quantity
        : Math.ceil((service.panelRate / 1000) * quantity * (1 + service.pricePercent / 100));

    const costPrice = Math.ceil((service.panelRate / 1000) * quantity);

    // Check balance
    const user = await prisma.endUser.findUnique({ where: { id: payload.id } });
    if (!user || user.balance < sellPrice) {
      return Response.json(
        { error: `เงินไม่พอ ต้องการ ${sellPrice} บาท มี ${user?.balance ?? 0} บาท` },
        { status: 402 }
      );
    }

    // Decrypt API key
    const apiKey = decrypt(service.apiKey.apiKeyEncrypted);

    // Place order to SMM panel
    const panelUrl = service.apiKey.panelUrl.trim().replace(/\/$/, "");
    const orderParams = new URLSearchParams({
      key: apiKey,
      action: "add",
      service: String(service.serviceId),
      link,
      quantity: String(quantity),
    });
    if (runs) orderParams.set("runs", String(runs));
    if (interval) orderParams.set("interval", String(interval));
    if (comments) orderParams.set("custom_comments", comments);

    const panelRes = await fetch(`${panelUrl}/api/v2?${orderParams.toString()}`);
    const panelData = await panelRes.json();

    if (panelData.error) {
      return Response.json({ error: panelData.error }, { status: 400 });
    }

    // Deduct balance
    await prisma.endUser.update({
      where: { id: payload.id },
      data: { balance: { decrement: sellPrice } },
    });

    // Create transaction record
    await prisma.endUserTransaction.create({
      data: {
        endUserId: payload.id,
        tenantId: payload.tenantId,
        amount: -sellPrice,
        type: "order",
        balanceAfter: user.balance - sellPrice,
        reference: String(panelData.order),
      },
    });

    // Create order record
    const order = await prisma.endUserOrder.create({
      data: {
        endUserId: payload.id,
        tenantId: payload.tenantId,
        storefrontServiceId: serviceId,
        apiKeyId: service.apiKeyId,
        serviceId: service.serviceId,
        link,
        quantity,
        runs: runs ?? null,
        interval: interval ?? null,
        comments: comments ?? null,
        costPrice,
        sellPrice,
        profit: sellPrice - costPrice,
        panelOrderId: panelData.order,
        status: "Processing",
      },
    });

    // Audit log
    await logActivity({
      tenantId: payload.tenantId,
      userId: payload.id,
      action: "order.place",
      targetType: "order",
      targetId: order.id,
      metadata: { serviceId: service.serviceId, quantity, sellPrice, panelOrderId: panelData.order },
    });

    return Response.json({
      order: { id: order.id, panelOrderId: panelData.order, status: order.status, sellPrice },
      balance: user.balance - sellPrice,
    });
  } catch (e: any) {
    console.error(e);
    return Response.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return Response.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  try {
    const payload = await verifyEndUserToken(authHeader.slice(7));

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = 20;

    const [orders, total] = await Promise.all([
      prisma.endUserOrder.findMany({
        where: { endUserId: payload.id },
        include: { storefrontService: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.endUserOrder.count({ where: { endUserId: payload.id } }),
    ]);

    return Response.json({ orders, total, page, totalPages: Math.ceil(total / limit) });
  } catch {
    return Response.json({ error: "token ไม่ถูกต้อง" }, { status: 401 });
  }
}
