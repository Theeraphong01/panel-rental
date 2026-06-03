// Slip2Go Client — verify slip by image upload
// Uses admin's central API key via SystemConfig → tenants never see the key
import { prisma } from "./prisma";
import { encrypt, decrypt } from "./encryption";

// ── Helpers ──

function normalizeAccountNumber(value: string): string {
  return value.replace(/\D/g, "");
}

function normalizeThaiName(value: string): string {
  let v = value.trim();
  v = v.replace(/\s+/g, "");
  // Remove zero-width chars
  v = v.replace(/[\u200B-\u200D\uFEFF]/g, "");
  // Remove common prefixes
  const prefixes = ["นาย", "นางสาว", "น.", "นาง", "ด.ช.", "ด.ญ."];
  for (const p of prefixes) {
    if (v.startsWith(p)) { v = v.slice(p.length); break; }
  }
  return v.toLowerCase();
}

function isAccountMatched(slipAccount: string, configFullAccount: string): boolean {
  const sa = normalizeAccountNumber(slipAccount);
  const ca = normalizeAccountNumber(configFullAccount);
  if (!sa || !ca) return false;
  if (sa === ca) return true;

  const last4match = sa.slice(-4) === ca.slice(-4);
  let chunks = 0;
  for (let i = 0; i < ca.length - 2; i++) {
    if (sa.includes(ca.slice(i, i + 3))) {
      chunks++;
      if (chunks >= 2) break;
    }
  }
  return last4match || chunks >= 2;
}

function isNameMatched(slipName: string, configName: string): boolean {
  const sn = normalizeThaiName(slipName);
  const cn = normalizeThaiName(configName);
  if (!sn || !cn) return false;
  return sn === cn || sn.includes(cn) || cn.includes(sn);
}

// ── Code mapping ──

const CODE_MAP: Record<string, { en: string; th: string; level: "success" | "warning" | "danger" | "error" }> = {
  "200000": { en: "Slip Found", th: "สลิปถูกต้อง พบในระบบธนาคาร", level: "success" },
  "200001": { en: "Get Info Success", th: "ดึงข้อมูลสำเร็จ", level: "success" },
  "200200": { en: "Slip is Valid", th: "สลิปถูกต้องทุกเงื่อนไข", level: "success" },
  "200401": { en: "Recipient Not Match", th: "บัญชีผู้รับไม่ตรงเงื่อนไข", level: "warning" },
  "200402": { en: "Amount Not Match", th: "ยอดโอนไม่ตรงเงื่อนไข", level: "warning" },
  "200403": { en: "Date Not Match", th: "วันที่โอนไม่ตรงเงื่อนไข", level: "warning" },
  "200404": { en: "Slip Not Found", th: "ไม่พบสลิปในระบบธนาคาร", level: "danger" },
  "200500": { en: "Slip is Fraud", th: "สลิปปลอม / สลิปเสีย", level: "danger" },
  "200501": { en: "Slip is Duplicated", th: "สลิปซ้ำ", level: "danger" },
  "400001": { en: "QR Code Incorrect", th: "QR Code ไม่ถูกต้อง", level: "error" },
  "400002": { en: "File Incorrect", th: "ไฟล์ไม่ถูกต้อง", level: "error" },
  "400400": { en: "Request Invalid", th: "ข้อมูล Request ไม่ถูกต้อง", level: "error" },
  "401001": { en: "Token Mismatch", th: "Token ไม่ถูกต้อง", level: "error" },
  "401005": { en: "Insufficient Quota", th: "โควตาหมด", level: "error" },
  "401006": { en: "Insufficient Credit", th: "เครดิตไม่เพียงพอ", level: "error" },
  "401007": { en: "IP Not Allowed", th: "IP Address ไม่ได้รับอนุญาต", level: "error" },
  "500500": { en: "Internal Server Error", th: "ระบบมีปัญหา กรุณาลองใหม่", level: "error" },
};

function codeInfo(code: string) {
  return CODE_MAP[code] ?? { en: "Unknown", th: "ไม่ทราบสถานะ", level: "error" as const };
}

// ── Client ──

export async function getSlip2GoConfig() {
  const secret = await prisma.systemConfig.findUnique({ where: { id: "slip2go_api_secret" } });
  const baseUrl = await prisma.systemConfig.findUnique({ where: { id: "slip2go_base_url" } });
  return {
    apiSecret: decrypt(secret?.value || ""),
    baseUrl: baseUrl?.value || "https://connect.slip2go.com",
  };
}

export async function verifySlipByImage(file: File, options?: {
  checkDuplicate?: boolean;
  checkAmount?: { type: "eq" | "gte" | "lte"; amount: string };
  checkReceiver?: { accountNumber: string };
}): Promise<{ success: boolean; code: string; data?: any; error?: string; level?: string }> {
  const { apiSecret, baseUrl } = await getSlip2GoConfig();
  if (!apiSecret) return { success: false, code: "", error: "Slip2Go API key ยังไม่ได้ตั้งค่า" };

  const form = new FormData();
  form.append("file", file);

  const payload: any = {};
  if (options?.checkDuplicate) payload.checkDuplicate = true;
  if (options?.checkReceiver) payload.checkReceiver = [options.checkReceiver];
  if (options?.checkAmount) payload.checkAmount = options.checkAmount;

  if (Object.keys(payload).length > 0) {
    form.append("payload", JSON.stringify(payload));
  }

  try {
    const res = await fetch(`${baseUrl}/api/verify-slip/qr-image/info`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiSecret}` },
      body: form,
    });

    const json = await res.json();
    const code = String(json.code ?? "");
    const { level } = codeInfo(code);

    return {
      success: ["200000", "200200"].includes(code),
      code,
      data: json.data ?? json,
      level,
    };
  } catch (e: any) {
    return { success: false, code: "", error: e.message };
  }
}

// ── Full verification flow with name/account matching + credit tracking ──

export async function verifySlipForTopup(
  tenantId: string,
  endUserId: string,
  file: File,
  expectedAmount: number,
): Promise<{ success: boolean; message: string; amount?: number; transRef?: string }> {
  // 1) Check slip credits
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) return { success: false, message: "ไม่พบร้านค้า" };

  if (tenant.slipCredits <= 0) {
    // Try auto-deduct from balance
    // Find cheapest slip topup
    const slipPkg = await prisma.package.findFirst({
      where: { packageType: "slip_topup", isActive: false },
      orderBy: { priceMonthly: "asc" },
    });
    // Auto-purchase will be handled in Phase D — for now, reject
    return { success: false, message: "โควต้าตรวจสลิปหมดแล้ว กรุณาติดต่อเจ้าของร้านเพื่อเติมแพ็คเกจ" };
  }

  // 2) Get bank accounts for this tenant
  const bankAccounts = await prisma.bankAccount.findMany({
    where: { tenantId, isActive: true },
  });

  // 3) Call Slip2Go (with first bank account as receiver check)
  const checkOptions: any = { checkDuplicate: true };
  if (expectedAmount > 0) {
    checkOptions.checkAmount = { type: "eq", amount: String(expectedAmount) };
  }
  if (bankAccounts.length > 0) {
    checkOptions.checkReceiver = { accountNumber: bankAccounts[0].accountNumber };
  }

  const result = await verifySlipByImage(file, checkOptions);

  // 4) Record verification
  const log = await prisma.slipVerification.create({
    data: {
      tenantId,
      endUserId,
      code: result.code,
      status: result.success ? "passed" : result.level === "warning" ? "pending" : "rejected",
      expectedAmount,
      amount: result.data?.amount ? parseFloat(String(result.data.amount)) : null,
      referenceId: result.data?.referenceId ?? null,
      transRef: result.data?.transRef ?? null,
      receiverAccount: result.data?.receiver?.account?.bank?.account
        ?? result.data?.receiver?.account?.proxy?.account
        ?? null,
      receiverName: result.data?.receiver?.account?.name ?? null,
      senderName: result.data?.sender?.account?.name ?? null,
      rawResponse: JSON.stringify(result.data),
    },
  });

  if (!result.success) {
    const { th } = codeInfo(result.code);
    return { success: false, message: th };
  }

  // 5) Check duplicate in our DB
  if (log.transRef) {
    const dup = await prisma.slipVerification.findFirst({
      where: { transRef: log.transRef, id: { not: log.id } },
    });
    if (dup) {
      await prisma.slipVerification.update({ where: { id: log.id }, data: { status: "rejected" } });
      return { success: false, message: "สลิปนี้ถูกใช้ตรวจสอบไปแล้ว ไม่สามารถใช้ซ้ำได้" };
    }
  }

  // 6) Name + account matching against tenant bank accounts
  const slipReceiverAccount = log.receiverAccount ?? "";
  const slipReceiverName = log.receiverName ?? "";
  let matched = false;

  for (const acc of bankAccounts) {
    const nameOk = isNameMatched(slipReceiverName, acc.accountNameTh);
    const accountOk = isAccountMatched(slipReceiverAccount, acc.accountNumber);
    if (nameOk && accountOk) {
      matched = true;
      break;
    }
  }

  if (!matched) {
    await prisma.slipVerification.update({ where: { id: log.id }, data: { status: "rejected" } });
    return { success: false, message: "ชื่อผู้รับหรือเลขบัญชีไม่ตรงกับบัญชีร้านค้า" };
  }

  // 7) Deduct slip credit
  await prisma.tenant.update({
    where: { id: tenantId },
    data: { slipCredits: { decrement: 1 } },
  });

  // Update subscription usage
  await prisma.subscription.updateMany({
    where: { tenantId, status: "active" },
    data: { slipCreditsUsed: { increment: 1 } },
  });

  // 8) All good! Return success
  const amount = log.amount ?? 0;
  await prisma.slipVerification.update({ where: { id: log.id }, data: { status: "passed" } });

  return {
    success: true,
    message: `ตรวจสอบสลิปสำเร็จ ยอดโอน ${amount} บาท`,
    amount,
    transRef: log.transRef ?? undefined,
  };
}
