import { prisma } from "./prisma";
import { decrypt } from "./encryption";
import { SmmPanelClient } from "./smm-panel";

export async function syncPendingOrders() {
  const pendingOrders = await prisma.endUserOrder.findMany({
    where: {
      status: { in: ["Pending", "Processing", "In Progress", "Partial"] },
      panelOrderId: { not: null },
      createdAt: { lt: new Date(Date.now() - 60_000) }, // skip orders < 1 min old
    },
    include: { apiKey: true },
    take: 100,
  });

  if (pendingOrders.length === 0) return { synced: 0, updated: 0 };

  const byApiKey = new Map<string, typeof pendingOrders>();
  for (const o of pendingOrders) {
    const list = byApiKey.get(o.apiKeyId) || [];
    list.push(o);
    byApiKey.set(o.apiKeyId, list);
  }

  let updated = 0;

  for (const [apiKeyId, orders] of byApiKey) {
    try {
      const plainKey = decrypt(orders[0].apiKey.apiKeyEncrypted);
      const client = new SmmPanelClient(orders[0].apiKey.panelUrl, plainKey);

      const panelIds = orders.map((o) => o.panelOrderId!);
      const statuses = await client.multiStatus(panelIds);

      for (const order of orders) {
        const panelStatus = statuses[String(order.panelOrderId)];
        if (!panelStatus) continue;

        // Map panel status to our status
        const statusMap: Record<string, string> = {
          Pending: "Pending",
          Processing: "Processing",
          "In progress": "In Progress",
          Completed: "Completed",
          Partial: "Partial",
          Canceled: "Canceled",
        };
        const newStatus = statusMap[panelStatus.status] ?? order.status;

        if (newStatus !== order.status) {
          await prisma.endUserOrder.update({
            where: { id: order.id },
            data: { status: newStatus },
          });
          updated++;

          // Notify if completed
          if (newStatus === "Completed") {
            await prisma.notification.create({
              data: {
                recipientType: "end_user",
                recipientId: order.endUserId,
                type: "order_complete",
                title: "ออเดอร์เสร็จแล้ว! 🎉",
                message: `ออเดอร์ #${order.panelOrderId} (${order.quantity.toLocaleString()} ครั้ง) เสร็จเรียบร้อย`,
                link: `/orders`,
              },
            });
          }
          // Notify if canceled
          if (newStatus === "Canceled") {
            // Refund the user
            await prisma.endUser.update({
              where: { id: order.endUserId },
              data: { balance: { increment: order.sellPrice } },
            });
            await prisma.endUserTransaction.create({
              data: {
                endUserId: order.endUserId,
                tenantId: order.tenantId,
                amount: order.sellPrice,
                type: "refund",
                balanceAfter: { increment: order.sellPrice } as any,
                reference: `Refund order #${order.panelOrderId}`,
              },
            });
            await prisma.notification.create({
              data: {
                recipientType: "end_user",
                recipientId: order.endUserId,
                type: "order_canceled",
                title: "ออเดอร์ถูกยกเลิก 💸",
                message: `ออเดอร์ #${order.panelOrderId} ถูกยกเลิก ระบบคืนเงิน ${order.sellPrice} บาท`,
                link: `/orders`,
              },
            });
          }
        }
      }
    } catch (err) {
      console.error(`Order sync failed for api_key ${apiKeyId}:`, err);
    }
  }

  // Clean up cooldowns cache — no-op since we use Map-based
  return { synced: pendingOrders.length, updated };
}
