// POST /api/storefront/voucher — redeem TrueMoney gift voucher
export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return Response.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) return Response.json({ error: "ไม่พบร้านค้า" }, { status: 404 });

  try {
    const { verifyEndUserToken } = await import("@/lib/jwt");
    const { redeemVoucher } = await import("@/lib/voucher");

    const payload = await verifyEndUserToken(authHeader.slice(7));
    const body = await req.json();
    const refLink = body.link;

    if (!refLink || !refLink.startsWith("https://gift.truemoney.com/")) {
      return Response.json({ error: "ลิงก์ซองของขวัญไม่ถูกต้อง" }, { status: 400 });
    }

    const result = await redeemVoucher(tenantId, payload.id, refLink);
    return Response.json(result);
  } catch (e: any) {
    console.error(e);
    return Response.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
