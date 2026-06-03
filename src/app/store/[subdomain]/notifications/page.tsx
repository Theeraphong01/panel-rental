"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import {
  Bell,
  CheckCheck,
  CheckCircle,
  XCircle,
  MessageSquare,
  Info,
  Inbox,
  ExternalLink,
} from "lucide-react";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
};

const notifIcons: Record<string, { icon: React.ComponentType<any>; color: string; bg: string }> = {
  order_complete: { icon: CheckCircle, color: "#00E676", bg: "bg-green-500/10" },
  order_canceled: { icon: XCircle, color: "#EF4444", bg: "bg-red-500/10" },
  order_failed: { icon: XCircle, color: "#EF4444", bg: "bg-red-500/10" },
  topup_approved: { icon: CheckCircle, color: "#00E676", bg: "bg-green-500/10" },
  topup_rejected: { icon: XCircle, color: "#EF4444", bg: "bg-red-500/10" },
  system: { icon: Info, color: "#00F0FF", bg: "bg-cyan-500/10" },
  message: { icon: MessageSquare, color: "#F59E0B", bg: "bg-amber-500/10" },
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

  useEffect(() => {
    fetchNotifs();
  }, [subdomain, router]);

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

  const getNotifIcon = (type: string) => {
    return notifIcons[type] || notifIcons.system;
  };

  const unreadCount = notifs.filter((n) => !n.isRead).length;

  return (
    <div className="dark space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-[#94A3B8] text-sm mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-[#1F293D] text-[#94A3B8] hover:text-white hover:bg-[#2A364F] transition-all"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Card
              key={i}
              className="bg-[#1F293D] border-[#2A364F] p-5 animate-pulse"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-[#2A364F]" />
                <div className="flex-1">
                  <div className="h-4 bg-[#2A364F] rounded w-2/3 mb-2" />
                  <div className="h-3 bg-[#2A364F] rounded w-full" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : notifs.length === 0 ? (
        <div className="text-center py-16">
          <Inbox className="w-16 h-16 text-[#94A3B8]/40 mx-auto mb-4" />
          <p className="text-[#94A3B8] text-lg font-medium">
            No notifications
          </p>
          <p className="text-[#94A3B8]/60 text-sm mt-2">
            You'll see order updates and system messages here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map((n) => {
            const { icon: Icon, color, bg } = getNotifIcon(n.type);
            return (
              <Card
                key={n.id}
                className={`p-4 cursor-pointer transition-all group ${
                  !n.isRead
                    ? "bg-[#1F293D] border-l-2 border-[#00F0FF] border-[#2A364F]"
                    : "bg-[#1F293D]/60 border-[#2A364F]"
                } hover:bg-[#1F293D]`}
                onClick={() => {
                  if (!n.isRead) markRead(n.id);
                  if (n.link) router.push(`/store/${subdomain}${n.link}`);
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${bg}`}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-white font-semibold text-sm">
                        {n.title}
                        {!n.isRead && (
                          <span className="inline-block ml-2 w-2 h-2 rounded-full bg-[#00F0FF]" />
                        )}
                      </h3>
                      {n.link && (
                        <ExternalLink className="w-3.5 h-3.5 text-[#94A3B8] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                    <p className="text-[#94A3B8] text-sm mt-1">{n.message}</p>
                    <p className="text-[#94A3B8]/50 text-xs mt-2">
                      {new Date(n.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
