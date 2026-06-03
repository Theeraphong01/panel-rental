"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { EmptyState, LoadingState, PageHeader } from "@/components/premium";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, duration: 0.3, ease: "easeOut" },
  }),
};

export default function NotificationsPage() {
  const { subdomain } = useParams<{ subdomain: string }>();
  const router = useRouter();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = () => {
    const token = localStorage.getItem("storefront_token");
    if (!token) {
      router.push(`/store/${subdomain}/login`);
      return;
    }
    fetch("/api/storefront/notifications", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setNotifs(data.notifications ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(fetchNotifs, [subdomain, router]);

  const markAllRead = async () => {
    const token = localStorage.getItem("storefront_token");
    await fetch("/api/storefront/notifications", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ markAllRead: true }),
    });
    fetchNotifs();
  };

  const markRead = async (id: string) => {
    const token = localStorage.getItem("storefront_token");
    await fetch("/api/storefront/notifications", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id }),
    });
    fetchNotifs();
  };

  const notifIcon = (type: string) => {
    switch (type) {
      case "order_complete":
        return (
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-lg">
            ✅
          </span>
        );
      case "order_canceled":
        return (
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 text-lg">
            ❌
          </span>
        );
      default:
        return (
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 text-lg">
            💬
          </span>
        );
    }
  };

  if (loading) return <LoadingState text="กำลังโหลดการแจ้งเตือน..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="การแจ้งเตือน"
        desc="ติดตามข่าวสารและอัพเดทเกี่ยวกับออเดอร์ของคุณ"
        action={
          notifs.some((n) => !n.isRead) && (
            <button
              onClick={markAllRead}
              className="px-4 py-2 text-sm font-medium text-violet-400 hover:text-violet-300 rounded-xl hover:bg-violet-500/5 border border-violet-500/10 transition-all"
            >
              อ่านทั้งหมด
            </button>
          )
        }
      />

      {notifs.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="ยังไม่มีการแจ้งเตือน"
          desc="เมื่อมีการอัพเดทเกี่ยวกับออเดอร์หรือข่าวสาร คุณจะได้รับการแจ้งเตือนที่นี่"
        />
      ) : (
        <div className="space-y-2">
          {notifs.map((n, i) => (
            <motion.div
              key={n.id}
              custom={i}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ x: 4 }}
              onClick={() => {
                if (!n.isRead) markRead(n.id);
                if (n.link) router.push(`/store/${subdomain}${n.link}`);
              }}
              className={`group cursor-pointer rounded-2xl border p-4 transition-all ${
                !n.isRead
                  ? "border-violet-500/20 bg-violet-500/[0.05] hover:bg-violet-500/[0.08] hover:border-violet-500/30"
                  : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10"
              }`}
            >
              <div className="flex gap-4">
                <div className="shrink-0">{notifIcon(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4
                      className={`text-sm font-bold truncate ${
                        !n.isRead ? "text-white" : "text-zinc-400"
                      }`}
                    >
                      {n.title}
                    </h4>
                    {!n.isRead && (
                      <span className="shrink-0 w-2 h-2 rounded-full bg-violet-400 mt-1.5 animate-pulse" />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-zinc-400 line-clamp-2">{n.message}</p>
                  <span className="mt-2 inline-block text-xs text-zinc-600">
                    {new Date(n.createdAt).toLocaleString("th-TH", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {n.link && (
                  <div className="shrink-0 flex items-center">
                    <svg
                      className="w-4 h-4 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
