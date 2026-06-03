"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { LoadingState } from "@/components/premium";

type Category = { id: string; name: string; slug: string };
type Service = {
  id: string;
  name: string;
  description?: string;
  pricePercent: number;
  priceManual?: number;
  priceType: string;
  panelRate: number;
  minOrder: number;
  maxOrder: number;
  dripfeed: boolean;
  isFeatured: boolean;
  category?: Category;
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: "easeOut" },
  }),
};

export default function StorePage() {
  const params = useParams<{ subdomain: string }>();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("");
  const [selected, setSelected] = useState<Service | null>(null);
  const [orderForm, setOrderForm] = useState({ link: "", quantity: 100 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem("storefront_token"));
  }, []);

  const fetchServices = (cat?: string, q?: string) => {
    setLoading(true);
    const sp = new URLSearchParams();
    if (cat) sp.set("cat", cat);
    if (q) sp.set("q", q);
    fetch(`/api/storefront/services?${sp.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setCategories(data.categories ?? []);
        setServices(data.services ?? []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchServices(activeCat, search);
  }, [activeCat]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchServices(activeCat, search);
  };

  const calcPrice = (s: Service) => {
    if (s.priceType === "manual" && s.priceManual) return s.priceManual * orderForm.quantity;
    return Math.ceil((s.panelRate / 1000) * orderForm.quantity * (1 + s.pricePercent / 100));
  };

  const placeOrder = async () => {
    if (!selected || !token) {
      router.push(`/store/${params.subdomain}/login`);
      return;
    }
    setSubmitting(true);
    setMsg("");
    try {
      const res = await fetch("/api/storefront/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId: selected.id,
          link: orderForm.link,
          quantity: orderForm.quantity,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(`✅ สั่งซื้อสำเร็จ! Order #${data.order.panelOrderId} | คงเหลือ ${data.balance} บาท`);
        setSelected(null);
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
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-violet-600/20 via-fuchsia-600/10 to-zinc-900 border border-white/5 p-8 md:p-12"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-500/10 via-transparent to-transparent" />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            ร้าน{decodeURIComponent(params.subdomain)}
          </h1>
          <p className="mt-3 text-zinc-400 text-lg max-w-xl">
            เลือกบริการที่ใช่ สั่งซื้อได้ทันที ระบบอัตโนมัติ 24 ชั่วโมง
          </p>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSearch}
        className="relative"
      >
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="ค้นหาบริการ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-24 py-3.5 bg-white/5 border border-white/5 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.07] transition-all text-sm"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 transition-all shadow-lg shadow-violet-500/25"
          >
            ค้นหา
          </button>
        </div>
      </motion.form>

      {/* Category Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-wrap gap-2"
      >
        <button
          onClick={() => setActiveCat("")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeCat === ""
              ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25"
              : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5"
          }`}
        >
          ทั้งหมด
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCat(c.slug)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeCat === c.slug
                ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25"
                : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5"
            }`}
          >
            {c.name}
          </button>
        ))}
      </motion.div>

      {/* Services Grid */}
      {loading ? (
        <LoadingState text="กำลังโหลดบริการ..." />
      ) : services.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-white">ไม่พบบริการ</h3>
          <p className="mt-2 text-sm text-zinc-400">ลองเปลี่ยนคำค้นหาหรือหมวดหมู่</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <motion.div
              key={s.id}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -2, scale: 1.01 }}
              onClick={() => {
                setSelected(s);
                setOrderForm({ link: "", quantity: s.minOrder });
              }}
              className={`group cursor-pointer rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm p-5 hover:border-violet-500/20 hover:bg-white/[0.07] transition-all duration-300 ${
                s.isFeatured ? "ring-1 ring-violet-500/30" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 bg-white/5 px-2 py-1 rounded-md">
                  {s.category?.name ?? "ทั่วไป"}
                </span>
                <div className="flex gap-1.5">
                  {s.isFeatured && (
                    <span className="text-[10px] font-bold text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">
                      แนะนำ
                    </span>
                  )}
                  {s.dripfeed && (
                    <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                      Drip-feed
                    </span>
                  )}
                </div>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">
                {s.name}
              </h3>
              {s.description && (
                <p className="mt-1.5 text-sm text-zinc-400 line-clamp-2">{s.description}</p>
              )}
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className="text-xs text-zinc-500">
                    {s.minOrder.toLocaleString()} — {s.maxOrder.toLocaleString()}
                  </div>
                  <div className="text-lg font-black text-white mt-0.5">
                    ~
                    {s.priceType === "manual" && s.priceManual
                      ? s.priceManual
                      : Math.ceil((s.panelRate / 1000) * (1 + s.pricePercent / 100))}{" "}
                    <span className="text-xs font-normal text-zinc-500">บาท</span>
                  </div>
                </div>
                <span className="px-4 py-2 text-xs font-bold text-white rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg shadow-violet-500/25">
                  สั่งซื้อ
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Order Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl border border-white/5 bg-zinc-900/95 backdrop-blur-xl p-6 shadow-2xl shadow-violet-500/10"
            >
              <h2 className="text-xl font-black text-white mb-1">{selected.name}</h2>
              {selected.description && (
                <p className="text-sm text-zinc-400 mb-4">{selected.description}</p>
              )}
              <div className="flex flex-wrap gap-3 mb-6 text-xs text-zinc-500">
                <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/5">
                  ขั้นต่ำ: {selected.minOrder}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/5">
                  สูงสุด: {selected.maxOrder}
                </span>
                {selected.dripfeed && (
                  <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                    ✅ Drip-feed
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    ลิงก์ <span className="text-violet-400">*</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={orderForm.link}
                    onChange={(e) => setOrderForm({ ...orderForm, link: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/5 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.07] transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    จำนวน
                  </label>
                  <input
                    type="number"
                    min={selected.minOrder}
                    max={selected.maxOrder}
                    value={orderForm.quantity}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, quantity: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/5 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.07] transition-all text-sm"
                  />
                </div>
              </div>

              <div className="mt-5 p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <span className="text-sm text-zinc-400">💰 ราคารวม</span>
                <strong className="text-xl font-black text-white">{calcPrice(selected).toLocaleString()} บาท</strong>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => setSelected(null)}
                  className="flex-1 px-4 py-3 text-sm font-medium text-zinc-400 hover:text-white rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  disabled={submitting || !orderForm.link}
                  onClick={placeOrder}
                  className="flex-1 px-4 py-3 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/25"
                >
                  {submitting ? "กำลังสั่ง..." : "ยืนยันคำสั่งซื้อ"}
                </button>
              </div>

              {msg && (
                <p className="mt-4 text-sm text-center text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 rounded-xl py-2">
                  {msg}
                </p>
              )}
              {!token && (
                <p className="mt-4 text-sm text-center text-amber-400 bg-amber-500/5 border border-amber-500/10 rounded-xl py-2">
                  ⚠️ กรุณา{" "}
                  <Link href={`/store/${params.subdomain}/login`} className="underline font-medium">
                    เข้าสู่ระบบ
                  </Link>{" "}
                  ก่อนสั่งซื้อ
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
