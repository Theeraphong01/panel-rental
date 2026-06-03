"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const { subdomain } = useParams<{ subdomain: string }>();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/storefront/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("storefront_token", data.token);
        router.push(`/store/${subdomain}`);
      } else {
        setMsg(`❌ ${data.error}`);
      }
    } catch {
      setMsg("❌ เกิดข้อผิดพลาด");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Store Branding */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight">
            {decodeURIComponent(subdomain)}
          </h1>
          <p className="mt-2 text-sm text-zinc-500">เข้าสู่ระบบเพื่อดำเนินการต่อ</p>
        </div>

        {/* Glass Card */}
        <div className="rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm p-8 shadow-2xl shadow-violet-500/5">
          <h2 className="text-xl font-black text-white mb-6">เข้าสู่ระบบ</h2>

          <form onSubmit={login} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                อีเมล
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.07] transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                รหัสผ่าน
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.07] transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/25"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  กำลังเข้าสู่ระบบ...
                </span>
              ) : (
                "เข้าสู่ระบบ"
              )}
            </button>
          </form>

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

          <p className="mt-6 text-center text-sm text-zinc-500">
            ยังไม่มีบัญชี?{" "}
            <Link
              href={`/store/${subdomain}/register`}
              className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
            >
              สมัครสมาชิก
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
