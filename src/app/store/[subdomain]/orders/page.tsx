"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = {
      Pending: "#f59e0b",
      Processing: "#3b82f6",
      "In Progress": "#3b82f6",
      Completed: "#22c55e",
      Partial: "#a855f7",
      Canceled: "#ef4444",
      Refunded: "#6b7280",
    };
    return (
      <span
        className="status-badge"
        style={{ background: colors[s] ?? "#6b7280" }}
      >
        {s}
      </span>
    );
  };

  return (
    <div className="orders-page">
      <h1>ประวัติออเดอร์</h1>
      {loading ? (
        <div className="skeleton-list">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton-row" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <p className="empty">ยังไม่มีออเดอร์</p>
      ) : (
        <div className="orders-table">
          <div className="ot-header">
            <span>วันที่</span>
            <span>บริการ</span>
            <span>จำนวน</span>
            <span>ราคา</span>
            <span>สถานะ</span>
          </div>
          {orders.map((o) => (
            <div key={o.id} className="ot-row">
              <span>{new Date(o.createdAt).toLocaleDateString("th")}</span>
              <span>{o.storefrontService?.name ?? `#${o.serviceId}`}</span>
              <span>{o.quantity.toLocaleString()}</span>
              <span>฿{o.sellPrice}</span>
              <span>{statusBadge(o.status)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
