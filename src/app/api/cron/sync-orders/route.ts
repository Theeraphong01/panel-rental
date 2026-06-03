export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { syncPendingOrders } from "@/lib/order-sync";

export async function GET(req: NextRequest) {
  if (req.headers.get("x-cron-secret") !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const start = Date.now();
    const result = await syncPendingOrders();
    return NextResponse.json({ ...result, durationMs: Date.now() - start });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
