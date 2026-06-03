"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  Gift,
  Upload,
  Image,
  Plus,
  CreditCard,
  DollarSign,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Zap,
} from "lucide-react";

type Package = {
  id: string;
  name: string;
  price: number;
  bonus: number;
};

export default function TopupPage() {
  const { subdomain } = useParams<{ subdomain: string }>();
  const router = useRouter();

  const [balance, setBalance] = useState(0);
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
  const [uploadedUrl, setUploadedUrl] = useState("");

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
      .then((d) => {
        if (d.user?.balance !== undefined) setBalance(d.user.balance);
      })
      .catch(() => {});

    // Fetch packages
    fetch("/api/storefront/topup")
      .then((r) => r.json())
      .then((d) => setPackages(d.packages ?? []))
      .catch(() => {});
  }, [subdomain, router]);

  // ── Voucher ──
  const redeemVoucher = async () => {
    if (!voucherLink) return;
    const token = localStorage.getItem("storefront_token");
    setVoucherLoading(true);
    setVoucherMsg("");
    try {
      const res = await fetch("/api/storefront/voucher", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ link: voucherLink }),
      });
      const data = await res.json();
      if (data.success) {
        setVoucherMsg(`✅ ${data.message}`);
        setVoucherLink("");
        // Refresh balance
        fetch("/api/storefront/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.user?.balance !== undefined) setBalance(d.user.balance);
          });
      } else {
        setVoucherMsg(`❌ ${data.message}`);
      }
    } catch {
      setVoucherMsg("❌ An error occurred");
    }
    setVoucherLoading(false);
  };

  // ── Slip Upload ──
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
        setUploadedUrl("");
      } else {
        setSlipMsg(`❌ ${data.message}`);
      }
    } catch {
      setSlipMsg("❌ An error occurred");
    }
    setSlipLoading(false);
  };

  // ── Old-style manual slip ──
  const submitSlip = async () => {
    if (!selected) return;
    const token = localStorage.getItem("storefront_token");
    setSubmitting(true);
    setMsg("");
    try {
      const res = await fetch("/api/storefront/topup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topupPackageId: selected.id,
          slipImageUrl: slipUrl,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("✅ Slip submitted! Awaiting verification (~5-30 minutes)");
        setSelected(null);
        setSlipUrl("");
      } else {
        setMsg(`❌ ${data.error}`);
      }
    } catch {
      setMsg("❌ An error occurred");
    }
    setSubmitting(false);
  };

  return (
    <div className="dark space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Add Funds</h1>
        <p className="text-[#94A3B8] text-sm mt-1">
          Top up your balance to place orders
        </p>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-[#1F293D] to-[#121824] border-[#00E676]/30 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[#94A3B8] text-sm flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Current Balance
            </p>
            <p className="text-3xl font-bold text-[#00E676]">
              ${balance.toFixed(2)}
            </p>
          </div>
          <div className="h-14 w-14 rounded-full bg-[#00E676]/10 flex items-center justify-center">
            <DollarSign className="w-7 h-7 text-[#00E676]" />
          </div>
        </div>
      </Card>

      {/* Tab selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("voucher")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            tab === "voucher"
              ? "bg-[#00F0FF] text-[#0B0F19]"
              : "bg-[#1F293D] text-[#94A3B8] hover:text-white hover:bg-[#2A364F]"
          }`}
        >
          <Gift className="w-4 h-4" />
          Voucher
        </button>
        <button
          onClick={() => setTab("slip")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            tab === "slip"
              ? "bg-[#00F0FF] text-[#0B0F19]"
              : "bg-[#1F293D] text-[#94A3B8] hover:text-white hover:bg-[#2A364F]"
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload Slip
        </button>
      </div>

      {/* ── VOUCHER TAB ── */}
      {tab === "voucher" && (
        <Card className="bg-[#1F293D] border-[#2A364F] p-6 max-w-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-[#00F0FF]/10 flex items-center justify-center">
              <Gift className="w-5 h-5 text-[#00F0FF]" />
            </div>
            <div>
              <h3 className="text-white font-semibold">TrueMoney Voucher</h3>
              <p className="text-[#94A3B8] text-xs">
                Redeem a TrueMoney gift voucher
              </p>
            </div>
          </div>

          <p className="text-[#94A3B8] text-sm mb-4">
            Paste your TrueMoney gift link below to instantly add funds.
          </p>

          <label className="block mb-4">
            <span className="text-sm font-medium text-white mb-1.5 block">
              Gift Link <span className="text-red-500">*</span>
            </span>
            <Input
              type="url"
              placeholder="https://gift.truemoney.com/campaign?v=..."
              value={voucherLink}
              onChange={(e) => setVoucherLink(e.target.value)}
              className="bg-[#121824] border-[#2A364F] text-white placeholder:text-[#94A3B8]"
            />
          </label>

          <Button
            className="w-full bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-[#0B0F19] font-semibold"
            disabled={voucherLoading || !voucherLink}
            onClick={redeemVoucher}
          >
            {voucherLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-[#0B0F19]/30 border-t-[#0B0F19] rounded-full animate-spin" />
                Verifying...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Redeem
              </span>
            )}
          </Button>

          {voucherMsg && (
            <p
              className={`mt-4 text-sm rounded-lg p-3 ${
                voucherMsg.startsWith("✅")
                  ? "bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676]"
                  : "bg-red-500/10 border border-red-500/30 text-red-400"
              }`}
            >
              {voucherMsg}
            </p>
          )}
        </Card>
      )}

      {/* ── SLIP UPLOAD TAB ── */}
      {tab === "slip" && (
        <Card className="bg-[#1F293D] border-[#2A364F] p-6 max-w-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-[#00E676]/10 flex items-center justify-center">
              <Upload className="w-5 h-5 text-[#00E676]" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Slip Upload</h3>
              <p className="text-[#94A3B8] text-xs">
                Auto-verified via Slip2Go
              </p>
            </div>
          </div>

          <p className="text-[#94A3B8] text-sm mb-4">
            Upload your payment slip for automatic verification. Supports all
            banks.
          </p>

          {/* File Drop Zone */}
          <label className="block mb-4">
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                slipFile
                  ? "border-[#00E676]/50 bg-[#00E676]/5"
                  : "border-[#2A364F] hover:border-[#00F0FF]/50 hover:bg-[#00F0FF]/5"
              }`}
            >
              {slipFile ? (
                <div className="space-y-2">
                  <CheckCircle className="w-8 h-8 text-[#00E676] mx-auto" />
                  <p className="text-white font-medium text-sm">
                    {slipFile.name}
                  </p>
                  <p className="text-[#94A3B8] text-xs">
                    {(slipFile.size / 1024).toFixed(1)} KB
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setSlipFile(null);
                    }}
                    className="text-xs text-red-400 hover:text-red-300 underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Image className="w-10 h-10 text-[#94A3B8] mx-auto" />
                  <div>
                    <p className="text-[#94A3B8] text-sm">
                      Drop your slip here or click to browse
                    </p>
                    <p className="text-[#94A3B8]/50 text-xs mt-1">
                      JPG or PNG (max 10MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => setSlipFile(e.target.files?.[0] || null)}
            />
          </label>

          {/* Amount */}
          <label className="block mb-4">
            <span className="text-sm font-medium text-white mb-1.5 block">
              Amount Transferred (optional)
            </span>
            <Input
              type="number"
              placeholder="e.g. 500"
              value={slipAmount}
              onChange={(e) => setSlipAmount(e.target.value)}
              className="bg-[#121824] border-[#2A364F] text-white placeholder:text-[#94A3B8]"
            />
          </label>

          <Button
            className="w-full bg-[#00E676] hover:bg-[#00E676]/90 text-white font-semibold"
            disabled={slipLoading || !slipFile}
            onClick={uploadSlip}
          >
            {slipLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Submit Slip
              </span>
            )}
          </Button>

          {slipMsg && (
            <p
              className={`mt-4 text-sm rounded-lg p-3 ${
                slipMsg.startsWith("✅")
                  ? "bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676]"
                  : "bg-red-500/10 border border-red-500/30 text-red-400"
              }`}
            >
              {slipMsg}
            </p>
          )}
        </Card>
      )}

      {/* ── PACKAGE GRID (legacy) ── */}
      {packages.length > 0 && (
        <>
          <div className="border-t border-[#2A364F] pt-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Select a Package
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {packages.map((p) => (
                <Card
                  key={p.id}
                  className={`p-4 cursor-pointer transition-all text-center ${
                    selected?.id === p.id
                      ? "bg-[#00F0FF]/10 border-[#00F0FF]"
                      : "bg-[#1F293D] border-[#2A364F] hover:border-[#00F0FF]/50"
                  }`}
                  onClick={() => setSelected(p)}
                >
                  <h3 className="text-white font-semibold text-sm mb-2">
                    {p.name}
                  </h3>
                  <p className="text-[#00E676] text-xl font-bold">
                    ${p.price}
                  </p>
                  {p.bonus > 0 && (
                    <Badge className="mt-2 bg-green-500/20 text-green-400 border-green-500/30">
                      +{p.bonus} Bonus
                    </Badge>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* Selected Package Form */}
          {selected && (
            <Card className="bg-[#1F293D] border-[#2A364F] p-6 max-w-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-[#00F0FF]/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-[#00F0FF]" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">
                    {selected.name} — ${selected.price}
                  </h3>
                  <p className="text-[#94A3B8] text-xs">
                    Transfer and paste your slip URL
                  </p>
                </div>
              </div>

              <label className="block mb-4">
                <span className="text-sm font-medium text-white mb-1.5 block">
                  Slip Image URL <span className="text-red-500">*</span>
                </span>
                <Input
                  type="url"
                  placeholder="https://imgur.com/..."
                  value={slipUrl}
                  onChange={(e) => setSlipUrl(e.target.value)}
                  className="bg-[#121824] border-[#2A364F] text-white placeholder:text-[#94A3B8]"
                />
              </label>

              <Button
                className="w-full bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-[#0B0F19] font-semibold"
                disabled={submitting || !slipUrl}
                onClick={submitSlip}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#0B0F19]/30 border-t-[#0B0F19] rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Submit
                  </span>
                )}
              </Button>

              {msg && (
                <p
                  className={`mt-4 text-sm rounded-lg p-3 ${
                    msg.startsWith("✅")
                      ? "bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676]"
                      : "bg-red-500/10 border border-red-500/30 text-red-400"
                  }`}
                >
                  {msg}
                </p>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
}
