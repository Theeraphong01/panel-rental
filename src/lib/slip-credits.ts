// Slip Credit System — auto-purchase when credits run out
import { prisma } from "./prisma";

// Cost per slip (manual config — adjust based on your pricing)
const SLIP_COST_MAP: Record<string, number> = {
  "slip-1": 99,   // 200 slips
  "slip-2": 199,  // 450 slips
  "slip-3": 299,  // 750 slips
  "slip-4": 499,  // 1450 slips
};

export async function autoPurchaseSlips(tenantId: string): Promise<{
  purchased: boolean;
  message: string;
  slipsAdded?: number;
}> {
  // Only auto-purchase if tenant is on a combo package
  const sub = await prisma.subscription.findFirst({
    where: { tenantId, status: "active" },
    include: { package: true },
  });
  if (!sub) return { purchased: false, message: "ไม่มีแพ็คเกจที่ active" };

  // Get tenant balance (from owner's user account or dedicated balance)
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });
  if (!tenant) return { purchased: false, message: "ไม่พบร้านค้า" };

  // Find cheapest slip package
  const slipPkgs = await prisma.package.findMany({
    where: { packageType: "slip_topup" },
    orderBy: { priceMonthly: "asc" },
  });

  if (slipPkgs.length === 0) return { purchased: false, message: "ไม่มีแพ็คเกจสลิปในระบบ" };

  // Try to purchase — use cheapest first
  for (const pkg of slipPkgs) {
    const cost = pkg.priceMonthly;
    const slips = pkg.slipQuota;

    // TODO: In production, deduct from tenant's real balance / billing system
    // For MVP, we just add the slips (assuming payment is handled externally)
    if (cost <= 0) continue;

    // Add slip credits
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { slipCredits: { increment: slips } },
    });

    // Notify tenant
    await prisma.notification.create({
      data: {
        recipientType: "tenant",
        recipientId: tenantId,
        type: "slip_auto_purchase",
        title: "ซื้อสลิปอัตโนมัติ",
        message: `ระบบซื้อ ${pkg.name} (${slips} สลิป) อัตโนมัติ ราคา ${cost} บาท`,
        link: "/dashboard/billing",
      },
    });

    return {
      purchased: true,
      message: `ซื้อ ${pkg.name} อัตโนมัติ (${slips} สลิป)`,
      slipsAdded: slips,
    };
  }

  return { purchased: false, message: "ไม่สามารถซื้อสลิปอัตโนมัติได้" };
}

export async function checkAndRefillSlips(tenantId: string): Promise<boolean> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });
  if (!tenant) return false;

  if (tenant.slipCredits <= 0) {
    const result = await autoPurchaseSlips(tenantId);
    return result.purchased;
  }
  return true;
}
