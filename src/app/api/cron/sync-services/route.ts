import { NextRequest, NextResponse } from "next/server";
import { syncServices } from "@/lib/service-sync";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (req.headers.get("x-cron-secret") !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const start = Date.now();
    const result = await syncServices();
    return NextResponse.json({ ...result, durationMs: Date.now() - start });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
