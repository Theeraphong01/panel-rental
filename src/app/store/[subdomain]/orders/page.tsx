"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { GlassPanel, EmptyState, LoadingState, StatusBadge, PageHeader } from "@/components/premium";

type Order = {
  id: string;
  serviceId: number;
  link: string;
  quantity: number;
  sellPrice: number;
  panelOrderId?: number;
  status: string;
  storefrontService?: { name: string };
  createdAt: string;
};

const rowVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.04, duration: 0.3 },
  }),
};

export default function OrdersPage() {
  const { subdomain } = useParams<{ subdomain: string }>();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("storefront_token");
    if (!token) {
      router.push(`/store/${subdomain}/login`);
      return;
    }
    fetch("/api/storefront/orders", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setOrders(data.orders ?? []))
      .finally(() => setLoading(false));
  }, [subdomain, router]);

  const statusMap: Record<string, string> = {
    Pending: "pending",
    Processing: "processing",
    "In Progress": "processing",
    Completed: "completed",
    Partial: "partial",
    Canceled: "cancelled",
    Refunded: "cancelled",
  };

  if (loading) return <LoadingState text="กำลังโหลดออเดอร์..." />;

  return (
    <div className="space-y-6">
      <PageHeader title="ประวัติออเดอร์" desc="ติดตามสถานะคำสั่งซื้อทั้งหมดของคุณ" />

      {orders.length === 0 ? (
        <EmptyState
          icon="📋"
          title="ยังไม่มีออเดอร์"
          desc="เลือกบริการที่คุณต้องการจากหน้าแรก แล้วเริ่มสั่งซื้อได้เลย"
          action={
            <button
              onClick={() => router.push(`/store/${subdomain}`)}
              className="px-6 py-3 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 transition-all shadow-lg shadow-violet-500/25"
            >
              ดูบริการทั้งหมด
            </button>
          }
        />
      ) : (
        <GlassPanel padded className="!p-0 overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-5 gap-4 px-6 py-4 border-b border-white/5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            <span>วันที่</span>
            <span>บริการ</span>
            <span>จำนวน</span>
            <span>ราคา</span>
            <span>สถานะ</span>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-white/5">
            {orders.map((o, i) => (
              <motion.div
                key={o.id}
                custom={i}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 md:grid-cols-5 gap-3 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-sm text-zinc-400">
                  {new Date(o.createdAt).toLocaleDateString("th-TH", {
                    day: "numeric",
                    month: "short",
                    year: "2-digit",
                  })}
                  <span className="hidden md:inline text-zinc-600 ml-1">
                    {new Date(o.createdAt).toLocaleTimeString("th-TH", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </span>
                <span className="text-sm text-white font-medium truncate">
                  {o.storefrontService?.name ?? `#${o.serviceId}`}
                </span>
                <span className="text-sm text-zinc-300 tabular-nums">
                  {o.quantity.toLocaleString()}
                </span>
                <span className="text-sm font-bold text-white tabular-nums">
                  ฿{o.sellPrice.toLocaleString()}
                </span>
                <span>
                  <StatusBadge status={statusMap[o.status] ?? o.status.toLowerCase()} />
                </span>
              </motion.div>
            ))}
          </div>
        </GlassPanel>
      )}
    </div>
  );
}
