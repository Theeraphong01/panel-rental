// TrueMoney Gift Voucher — redeem via proxy API
// Admin API key in SystemConfig → tenants never see the endpoint
import { prisma } from "./prisma";

export async function getVoucherConfig() {
  const url = await prisma.systemConfig.findUnique({ where: { id: "voucher_api_url" } });
  const key = await prisma.systemConfig.findUnique({ where: { id: "voucher_api_key" } });
  return {
    apiUrl: url?.value || "https://pumlf.pum-shop.com/tw/tw_api.php",
    apiKey: key?.value || "admin",
  };
}

export async function redeemVoucher(
  tenantId: string,
  endUserId: string,
  refLink: string,
): Promise<{ success: boolean; message: string; amount?: number }> {
  const { apiUrl, apiKey } = await getVoucherConfig();

  // Record transaction
  const txn = await prisma.voucherTransaction.create({
    data: {
      tenantId,
      endUserId,
      refLink,
      status: "pending",
    },
  });

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ key: apiKey, phone: endUserId, hash: refLink }),
    });
    const data = await res.json();

    if (data.status === "success") {
      const amount = parseInt(String(data.amount ?? "0").replace(/,/g, "").trim(), 10) || 0;

      // Credit end user
      await prisma.endUser.update({
        where: { id: endUserId },
        data: { balance: { increment: amount } },
      });

      // Record transaction
      await prisma.endUserTransaction.create({
        data: {
          endUserId,
          tenantId,
          amount,
          type: "voucher",
          balanceAfter: 0, // will be updated below
          reference: refLink,
        },
      });

      await prisma.voucherTransaction.update({
        where: { id: txn.id },
        data: { status: "success", amount },
      });

      return { success: true, message: `เติมเงินสำเร็จ ${amount} บาท`, amount };
    }

    await prisma.voucherTransaction.update({
      where: { id: txn.id },
      data: { status: "failed", errorMsg: data.message ?? "ซองไม่ถูกต้องหรือถูกใช้แล้ว" },
    });

    return { success: false, message: data.message ?? "ซองไม่ถูกต้องหรือถูกใช้แล้ว" };
  } catch (e: any) {
    await prisma.voucherTransaction.update({
      where: { id: txn.id },
      data: { status: "error", errorMsg: e.message },
    });
    return { success: false, message: "ระบบขัดข้อง กรุณาลองใหม่" };
  }
}

export async function getVoucherHistory(endUserId: string, limit = 20) {
  return prisma.voucherTransaction.findMany({
    where: { endUserId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
