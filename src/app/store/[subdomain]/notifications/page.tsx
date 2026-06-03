"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
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

  return (
    <div className="notif-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1>การแจ้งเตือน</h1>
        <button className="btn-link" onClick={markAllRead}>
          อ่านทั้งหมด
        </button>
      </div>

      {loading ? (
        <div className="skeleton-list">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton-row" style={{ height: 72 }} />
          ))}
        </div>
      ) : notifs.length === 0 ? (
        <p className="empty">ยังไม่มีการแจ้งเตือน</p>
      ) : (
        <div className="notif-list">
          {notifs.map((n) => (
            <div
              key={n.id}
              className={`notif-item ${!n.isRead ? "unread" : ""}`}
              onClick={() => {
                if (!n.isRead) markRead(n.id);
                if (n.link) router.push(`/store/${subdomain}${n.link}`);
              }}
              style={{ borderLeftColor: !n.isRead ? "var(--primary)" : undefined }}
            >
              <div className="notif-icon">
                {n.type === "order_complete" ? "✅" : n.type === "order_canceled" ? "❌" : "💬"}
              </div>
              <div className="notif-body">
                <strong>{n.title}</strong>
                <p>{n.message}</p>
                <span className="notif-time">
                  {new Date(n.createdAt).toLocaleString("th")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
