"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GlassPanel, PageHeader, LoadingState } from "@/components/premium";

type Profile = { id: string; email: string; name: string; balance: number; createdAt: string };

export default function ProfilePage() {
  const { subdomain } = useParams<{ subdomain: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [recentOrders, setRecentOrders] = useState(0);

  const fetchProfile = () => {
    const token = localStorage.getItem("storefront_token");
    if (!token) {
      router.push(`/store/${subdomain}/login`);
      return;
    }
    fetch("/api/storefront/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setProfile(data.user);
          setName(data.user.name);
        } else {
          localStorage.removeItem("storefront_token");
          router.push(`/store/${subdomain}/login`);
        }
      });

    // Fetch recent orders count
    fetch("/api/storefront/orders", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setRecentOrders((data.orders ?? []).length))
      .catch(() => {});
  };

  useEffect(fetchProfile, [subdomain, router]);

  const saveName = async () => {
    const token = localStorage.getItem("storefront_token");
    const res = await fetch("/api/storefront/me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (res.ok) {
      setProfile(data.user);
      setEditing(false);
      setMsg("✅ อัพเดทโปรไฟล์เรียบร้อย");
    } else {
      setMsg(`❌ ${data.error}`);
    }
  };

  const logout = () => {
    localStorage.removeItem("storefront_token");
    router.push(`/store/${subdomain}`);
  };

  if (!profile) return <LoadingState text="กำลังโหลดโปรไฟล์..." />;

  return (
    <div className="space-y-8">
      <PageHeader title="โปรไฟล์" desc="จัดการข้อมูลส่วนตัวของคุณ" />

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600/20 via-fuchsia-600/10 to-zinc-900 border border-white/5 p-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-violet-500/10 via-transparent to-transparent" />
        <div className="relative z-10">
          <p className="text-sm text-zinc-400">ยอดเงินคงเหลือ</p>
          <p className="text-4xl font-black text-white mt-1">
            ฿{profile.balance.toLocaleString()}
          </p>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <GlassPanel padded className="!p-5">
            <div className="text-3xl mb-2">📦</div>
            <div className="text-2xl font-black text-white">{recentOrders}</div>
            <div className="mt-1 text-xs text-zinc-500">ออเดอร์ทั้งหมด</div>
          </GlassPanel>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassPanel padded className="!p-5">
            <div className="text-3xl mb-2">📅</div>
            <div className="text-2xl font-black text-white">
              {new Date(profile.createdAt).toLocaleDateString("th-TH", {
                day: "numeric",
                month: "short",
                year: "2-digit",
              })}
            </div>
            <div className="mt-1 text-xs text-zinc-500">สมัครเมื่อ</div>
          </GlassPanel>
        </motion.div>
      </div>

      {/* User Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <GlassPanel padded className="!p-6">
          <h3 className="text-lg font-bold text-white mb-6">ข้อมูลส่วนตัว</h3>

          <div className="space-y-5">
            {/* Email */}
            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <span className="text-sm text-zinc-400">อีเมล</span>
              <span className="text-sm text-white font-medium">{profile.email}</span>
            </div>

            {/* Name */}
            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <span className="text-sm text-zinc-400">ชื่อ</span>
              {editing ? (
                <div className="flex items-center gap-2">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-40 px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all"
                  />
                  <button
                    onClick={saveName}
                    className="px-3 py-1.5 text-xs font-bold text-white rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 transition-all"
                  >
                    บันทึก
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                  >
                    ยกเลิก
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white font-medium">{profile.name}</span>
                  <button
                    onClick={() => setEditing(true)}
                    className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors"
                  >
                    แก้ไข
                  </button>
                </div>
              )}
            </div>

            {/* Created */}
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-zinc-400">สมัครเมื่อ</span>
              <span className="text-sm text-white font-medium">
                {new Date(profile.createdAt).toLocaleDateString("th-TH", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
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

      {/* Quick Links & Logout */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <button
          onClick={() => router.push(`/store/${subdomain}/orders`)}
          className="w-full flex items-center justify-between px-6 py-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/[0.07] hover:border-violet-500/20 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">📋</span>
            <span className="text-sm font-medium text-white">ดูประวัติออเดอร์</span>
          </div>
          <svg
            className="w-5 h-5 text-zinc-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button
          onClick={() => router.push(`/store/${subdomain}/topup`)}
          className="w-full flex items-center justify-between px-6 py-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/[0.07] hover:border-violet-500/20 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">💰</span>
            <span className="text-sm font-medium text-white">เติมเงิน</span>
          </div>
          <svg
            className="w-5 h-5 text-zinc-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-red-500/10 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
        >
          <span className="text-sm font-medium text-red-400">ออกจากระบบ</span>
        </button>
      </motion.div>
    </div>
  );
}
