"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { GlassPanel, PageHeader } from "@/components/premium";

type Package = { id: string; name: string; price: number; bonus: number };
type Profile = { balance: number };

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" },
  }),
};

export default function TopupPage() {
  const { subdomain } = useParams<{ subdomain: string }>();
  const router = useRouter();
  const [tab, setTab] = useState<"voucher" | "slip">("voucher");
  const [packages, setPackages] = useState<Package[]>([]);
  const [selected, setSelected] = useState<Package | null>(null);
  const [slipUrl, setSlipUrl] = useState("");
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [balance, setBalance] = useState(0);

  // Voucher state
  const [voucherLink, setVoucherLink] = useState("");
  const [voucherMsg, setVoucherMsg] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);

  // Slip upload state
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipAmount, setSlipAmount] = useState("");
  const [slipMsg, setSlipMsg] = useState("");
  const [slipLoading, setSlipLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("storefront_token");
    if (!token) {
      router.push(`/store/${subdomain}/login`);
      return;
    }
    // Fetch balance
    fetch("/api/storefront/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setBalance(data.user.balance ?? 0);
      })
      .catch(() => {});
    // Fetch old topup packages (for backward compat)
    fetch("/api/storefront/topup")
      .then((r) => r.json())
      .then((d) => setPackages(d.packages ?? []))
      .catch(() => {});
  }, [subdomain, router]);

  // ── Voucher (ซองอั่งเปา) ──
  const redeemVoucher = async () => {
    if (!voucherLink) return;
    const token = localStorage.getItem("storefront_token");
    setVoucherLoading(true);
    setVoucherMsg("");
    try {
      const res = await fetch("/api/storefront/voucher", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ link: voucherLink }),
      });
      const data = await res.json();
      if (data.success) {
        setVoucherMsg(`✅ ${data.message}`);
        setVoucherLink("");
      } else {
        setVoucherMsg(`❌ ${data.message}`);
      }
    } catch {
      setVoucherMsg("❌ เกิดข้อผิดพลาด");
    }
    setVoucherLoading(false);
  };

  // ── Slip Upload (Slip2Go) ──
  const uploadSlip = async () => {
    if (!slipFile) return;
    const token = localStorage.getItem("storefront_token");
    setSlipLoading(true);
    setSlipMsg("");
    try {
      const form = new FormData();
      form.append("file", slipFile);
      if (slipAmount) form.append("amount", slipAmount);

      const res = await fetch("/api/storefront/slip", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (data.success) {
        setSlipMsg(`✅ ${data.message}`);
        setSlipFile(null);
        setSlipAmount("");
      } else {
        setSlipMsg(`❌ ${data.message}`);
      }
    } catch {
      setSlipMsg("❌ เกิดข้อผิดพลาด");
    }
    setSlipLoading(false);
  };

  // ── Old slip (manual URL) ──
  const submitSlip = async () => {
    if (!selected) return;
    const token = localStorage.getItem("storefront_token");
    setSubmitting(true);
    setMsg("");
    try {
      const res = await fetch("/api/storefront/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ topupPackageId: selected.id, slipImageUrl: slipUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("✅ ส่งสลิปเรียบร้อย รอตรวจสอบ ~5-30 นาที");
        setSelected(null);
        setSlipUrl("");
      } else {
        setMsg(`❌ ${data.error}`);
      }
    } catch {
      setMsg("❌ เกิดข้อผิดพลาด");
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-8">
      <PageHeader title="เติมเงิน" desc="เติมยอดคงเหลือเพื่อใช้บริการของเรา" />

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600/20 via-fuchsia-600/10 to-zinc-900 border border-white/5 p-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-violet-500/10 via-transparent to-transparent" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-400">ยอดเงินคงเหลือ</p>
            <p className="text-4xl font-black text-white mt-1">฿{balance.toLocaleString()}</p>
          </div>
          <div className="text-5xl">💰</div>
        </div>
      </motion.div>

      {/* Tab selector */}
      <div className="flex gap-2">
        {(["voucher", "slip"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
              tab === t
                ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25"
                : "bg-white/5 text-zinc-400 hover:text-white border border-white/5"
            }`}
          >
            {t === "voucher" ? "🧧 ซองอั่งเปา" : "📸 แนบสลิป"}
          </button>
        ))}
      </div>

      {/* ── Voucher Tab ── */}
      {tab === "voucher" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <GlassPanel padded className="!p-6">
            <h3 className="text-lg font-bold text-white mb-1">เติมเงินด้วยซองอั่งเปา TrueMoney</h3>
            <p className="text-sm text-zinc-500 mb-6">
              วางลิงก์ซองของขวัญ (https://gift.truemoney.com/...) ด้านล่าง
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  ลิงก์ซองอั่งเปา <span className="text-violet-400">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://gift.truemoney.com/campaign?v=..."
                  value={voucherLink}
                  onChange={(e) => setVoucherLink(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.07] transition-all text-sm"
                />
              </div>
              <button
                disabled={voucherLoading || !voucherLink}
                onClick={redeemVoucher}
                className="w-full py-3.5 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/25"
              >
                {voucherLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    กำลังตรวจสอบ...
                  </span>
                ) : (
                  "เติมเงิน"
                )}
              </button>
            </div>
            {voucherMsg && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 text-sm text-center py-2.5 rounded-xl ${
                  voucherMsg.startsWith("✅")
                    ? "text-emerald-400 bg-emerald-500/5 border border-emerald-500/10"
                    : "text-red-400 bg-red-500/5 border border-red-500/10"
                }`}
              >
                {voucherMsg}
              </motion.p>
            )}
          </GlassPanel>
        </motion.div>
      )}

      {/* ── Slip Tab ── */}
      {tab === "slip" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <GlassPanel padded className="!p-6">
            <h3 className="text-lg font-bold text-white mb-1">แนบรูปสลิปเพื่อตรวจสอบอัตโนมัติ</h3>
            <p className="text-sm text-zinc-500 mb-6">
              ระบบจะตรวจสอบสลิปผ่าน Slip2Go อัตโนมัติ — รองรับทุกธนาคาร
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  แนบรูปสลิป (JPG/PNG) <span className="text-violet-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => setSlipFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-zinc-400 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-bold file:text-white file:bg-gradient-to-r file:from-violet-500 file:to-fuchsia-500 file:cursor-pointer file:hover:from-violet-400 file:hover:to-fuchsia-400 file:transition-all file:shadow-lg file:shadow-violet-500/25 hover:file:shadow-violet-500/40"
                  />
                </div>
                {slipFile && (
                  <p className="mt-2 text-xs text-zinc-500">
                    {slipFile.name} ({(slipFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  จำนวนเงินที่โอน (ไม่จำเป็น)
                </label>
                <input
                  type="number"
                  placeholder="เช่น 500"
                  value={slipAmount}
                  onChange={(e) => setSlipAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.07] transition-all text-sm"
                />
              </div>

              <button
                disabled={slipLoading || !slipFile}
                onClick={uploadSlip}
                className="w-full py-3.5 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/25"
              >
                {slipLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    กำลังตรวจสอบ...
                  </span>
                ) : (
                  "ส่งตรวจสลิป"
                )}
              </button>
            </div>
            {slipMsg && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 text-sm text-center py-2.5 rounded-xl ${
                  slipMsg.startsWith("✅")
                    ? "text-emerald-400 bg-emerald-500/5 border border-emerald-500/10"
                    : "text-red-400 bg-red-500/5 border border-red-500/10"
                }`}
              >
                {slipMsg}
              </motion.p>
            )}
          </GlassPanel>
        </motion.div>
      )}

      {/* ── Old-style Package Selection ── */}
      {packages.length > 0 && (
        <>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs text-zinc-600 uppercase tracking-widest font-semibold">
              วิธีเดิม — เลือกแพ็คเกจ
            </span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((p, i) => (
              <motion.div
                key={p.id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -2, scale: 1.01 }}
                onClick={() => setSelected(p)}
                className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                  selected?.id === p.id
                    ? "border-violet-500/40 bg-violet-500/[0.07] ring-1 ring-violet-500/30"
                    : "border-white/5 bg-white/5 hover:border-violet-500/20 hover:bg-white/[0.07]"
                }`}
              >
                <h3 className="text-base font-bold text-white">{p.name}</h3>
                <div className="mt-2 text-2xl font-black text-white">฿{p.price.toLocaleString()}</div>
                {p.bonus > 0 && (
                  <div className="mt-1 text-sm text-emerald-400 font-medium">
                    +{p.bonus} โบนัส
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GlassPanel padded className="!p-6">
                <h3 className="text-lg font-bold text-white mb-1">
                  แจ้งเติมเงิน: {selected.name} (฿{selected.price.toLocaleString()})
                </h3>
                <p className="text-sm text-zinc-500 mb-4">
                  โอนเงินแล้วแนบ URL รูปสลิปด้านล่าง
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                      URL รูปสลิป <span className="text-violet-400">*</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://imgur.com/..."
                      value={slipUrl}
                      onChange={(e) => setSlipUrl(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.07] transition-all text-sm"
                    />
                  </div>
                  <button
                    disabled={submitting || !slipUrl}
                    onClick={submitSlip}
                    className="w-full py-3.5 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/25"
                  >
                    {submitting ? "กำลังส่ง..." : "ส่งสลิป"}
                  </button>
                </div>
                {msg && (
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 text-sm text-center py-2.5 rounded-xl ${
                      msg.startsWith("✅")
                        ? "text-emerald-400 bg-emerald-500/5 border border-emerald-500/10"
                        : "text-red-400 bg-red-500/5 border border-red-500/10"
                    }`}
                  >
                    {msg}
                  </motion.p>
                )}
              </GlassPanel>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
