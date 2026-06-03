"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Package = { id: string; name: string; price: number; bonus: number };

export default function TopupPage() {
  const { subdomain } = useParams<{ subdomain: string }>();
  const router = useRouter();
  const [tab, setTab] = useState<"voucher" | "slip">("voucher");
  const [packages, setPackages] = useState<Package[]>([]);
  const [selected, setSelected] = useState<Package | null>(null);
  const [slipUrl, setSlipUrl] = useState("");
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
        setSelected(null); setSlipUrl("");
      } else {
        setMsg(`❌ ${data.error}`);
      }
    } catch { setMsg("❌ เกิดข้อผิดพลาด"); }
    setSubmitting(false);
  };

  return (
    <div className="topup-page">
      <h1>เติมเงิน</h1>

      {/* Tab selector */}
      <div className="cat-tabs" style={{ marginBottom: 24 }}>
        <button className={tab === "voucher" ? "active" : ""} onClick={() => setTab("voucher")}>
          🧧 ซองอั่งเปา
        </button>
        <button className={tab === "slip" ? "active" : ""} onClick={() => setTab("slip")}>
          📸 แนบสลิป
        </button>
      </div>

      {/* ── Voucher Tab ── */}
      {tab === "voucher" && (
        <div className="slip-form" style={{ maxWidth: 480 }}>
          <h3>เติมเงินด้วยซองอั่งเปา TrueMoney</h3>
          <p style={{ fontSize: ".85rem", color: "#64748b", marginBottom: 16 }}>
            วางลิงก์ซองของขวัญ (https://gift.truemoney.com/...) ด้านล่าง
          </p>
          <label>
            ลิงก์ซองอั่งเปา <span className="req">*</span>
            <input
              type="url"
              placeholder="https://gift.truemoney.com/campaign?v=..."
              value={voucherLink}
              onChange={(e) => setVoucherLink(e.target.value)}
            />
          </label>
          <button
            className="btn-primary"
            style={{ background: "var(--primary)", marginTop: 12 }}
            disabled={voucherLoading || !voucherLink}
            onClick={redeemVoucher}
          >
            {voucherLoading ? "กำลังตรวจสอบ..." : "เติมเงิน"}
          </button>
          {voucherMsg && <p className="msg">{voucherMsg}</p>}
        </div>
      )}

      {/* ── Slip Tab ── */}
      {tab === "slip" && (
        <div className="slip-form" style={{ maxWidth: 480 }}>
          <h3>แนบรูปสลิปเพื่อตรวจสอบอัตโนมัติ</h3>
          <p style={{ fontSize: ".85rem", color: "#64748b", marginBottom: 16 }}>
            ระบบจะตรวจสอบสลิปผ่าน Slip2Go อัตโนมัติ — รองรับทุกธนาคาร
          </p>

          <label>
            แนบรูปสลิป (JPG/PNG) <span className="req">*</span>
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={(e) => setSlipFile(e.target.files?.[0] || null)}
            />
          </label>
          {slipFile && (
            <p style={{ fontSize: ".8rem", color: "#64748b", marginTop: 4 }}>
              {slipFile.name} ({(slipFile.size / 1024).toFixed(1)} KB)
            </p>
          )}

          <label style={{ marginTop: 12 }}>
            จำนวนเงินที่โอน (ไม่จำเป็น)
            <input
              type="number"
              placeholder="เช่น 500"
              value={slipAmount}
              onChange={(e) => setSlipAmount(e.target.value)}
            />
          </label>

          <button
            className="btn-primary"
            style={{ background: "var(--primary)", marginTop: 12 }}
            disabled={slipLoading || !slipFile}
            onClick={uploadSlip}
          >
            {slipLoading ? "กำลังตรวจสอบ..." : "ส่งตรวจสลิป"}
          </button>
          {slipMsg && <p className="msg">{slipMsg}</p>}
        </div>
      )}

      {/* ── Old-style Package Selection (for manual slip) ── */}
      <hr style={{ margin: "32px 0", borderColor: "#e2e8f0" }} />
      <h2 style={{ fontSize: "1rem", color: "#64748b" }}>วิธีเดิม — เลือกแพ็คเกจแล้วส่ง URL สลิป</h2>

      <div className="pkg-grid">
        {packages.map((p) => (
          <div
            key={p.id}
            className={`pkg-card ${selected?.id === p.id ? "selected" : ""}`}
            onClick={() => setSelected(p)}
            style={{ borderColor: selected?.id === p.id ? "var(--primary)" : undefined }}
          >
            <h3>{p.name}</h3>
            <div className="pkg-price">฿{p.price}</div>
            {p.bonus > 0 && <div className="pkg-bonus">+{p.bonus} โบนัส</div>}
          </div>
        ))}
      </div>

      {selected && (
        <div className="slip-form">
          <h3>แจ้งเติมเงิน: {selected.name} (฿{selected.price})</h3>
          <p>โอนเงินแล้วแนบ URL รูปสลิปด้านล่าง</p>
          <label>
            URL รูปสลิป <span className="req">*</span>
            <input
              type="url" placeholder="https://imgur.com/..."
              value={slipUrl} onChange={(e) => setSlipUrl(e.target.value)}
            />
          </label>
          <button
            className="btn-primary"
            style={{ background: "var(--primary)", marginTop: 12 }}
            disabled={submitting || !slipUrl}
            onClick={submitSlip}
          >
            {submitting ? "กำลังส่ง..." : "ส่งสลิป"}
          </button>
          {msg && <p className="msg">{msg}</p>}
        </div>
      )}
    </div>
  );
}
