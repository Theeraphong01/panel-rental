"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Inbox,
  Filter,
} from "lucide-react";

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

const statusConfig: Record<
  string,
  { color: string; bg: string; icon: React.ComponentType<any> }
> = {
  Pending: {
    color: "#F59E0B",
    bg: "bg-amber-500/10",
    icon: Clock,
  },
  Processing: {
    color: "#3B82F6",
    bg: "bg-blue-500/10",
    icon: AlertTriangle,
  },
  "In Progress": {
    color: "#3B82F6",
    bg: "bg-blue-500/10",
    icon: AlertTriangle,
  },
  Completed: {
    color: "#00E676",
    bg: "bg-green-500/10",
    icon: CheckCircle,
  },
  Partial: {
    color: "#A855F7",
    bg: "bg-purple-500/10",
    icon: AlertTriangle,
  },
  Canceled: {
    color: "#EF4444",
    bg: "bg-red-500/10",
    icon: XCircle,
  },
  Failed: {
    color: "#EF4444",
    bg: "bg-red-500/10",
    icon: XCircle,
  },
  Refunded: {
    color: "#6B7280",
    bg: "bg-gray-500/10",
    icon: XCircle,
  },
};

const filterTabs = [
  { label: "All", value: "" },
  { label: "Pending", value: "Pending" },
  { label: "Processing", value: "Processing" },
  { label: "Completed", value: "Completed" },
  { label: "Failed", value: "Failed" },
  { label: "Canceled", value: "Canceled" },
];

export default function OrdersPage() {
  const { subdomain } = useParams<{ subdomain: string }>();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("");

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

  const filteredOrders = activeFilter
    ? orders.filter((o) => o.status === activeFilter)
    : orders;

  const getStatusConfig = (status: string) => {
    // Check exact match first, then fallback
    if (statusConfig[status]) return statusConfig[status];
    if (status === "Failed" || status === "Canceled" || status === "Refunded") {
      return statusConfig["Canceled"];
    }
    return { color: "#6B7280", bg: "bg-gray-500/10", icon: Clock };
  };

  return (
    <div className="dark space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Order History</h1>
          <p className="text-[#94A3B8] text-sm mt-1">
            Track your orders and their status
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {filterTabs.map((tab) => {
          const count =
            tab.value === ""
              ? orders.length
              : orders.filter((o) => o.status === tab.value).length;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeFilter === tab.value
                  ? "bg-[#00F0FF] text-[#0B0F19]"
                  : "bg-[#1F293D] text-[#94A3B8] hover:text-white hover:bg-[#2A364F]"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              {tab.label}
              {count > 0 && (
                <span
                  className={`text-xs ml-1 px-1.5 py-0.5 rounded-full ${
                    activeFilter === tab.value
                      ? "bg-[#0B0F19]/20"
                      : "bg-[#2A364F]"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card
              key={i}
              className="bg-[#1F293D] border-[#2A364F] p-6 animate-pulse"
            >
              <div className="h-4 bg-[#2A364F] rounded w-1/4 mb-3" />
              <div className="h-3 bg-[#2A364F] rounded w-3/4" />
            </Card>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16">
          <Inbox className="w-16 h-16 text-[#94A3B8]/40 mx-auto mb-4" />
          <p className="text-[#94A3B8] text-lg font-medium">
            {activeFilter
              ? `No ${activeFilter.toLowerCase()} orders found`
              : "No orders yet"}
          </p>
          <p className="text-[#94A3B8]/60 text-sm mt-2">
            {activeFilter
              ? "Try selecting a different filter"
              : "Browse services and place your first order"}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-[#2A364F]">
            <table className="w-full">
              <thead className="bg-[#1F293D]">
                <tr>
                  <th className="text-left p-4 text-[#94A3B8] font-medium text-sm">
                    Order ID
                  </th>
                  <th className="text-left p-4 text-[#94A3B8] font-medium text-sm">
                    Service
                  </th>
                  <th className="text-left p-4 text-[#94A3B8] font-medium text-sm">
                    Quantity
                  </th>
                  <th className="text-left p-4 text-[#94A3B8] font-medium text-sm">
                    Price
                  </th>
                  <th className="text-left p-4 text-[#94A3B8] font-medium text-sm">
                    Status
                  </th>
                  <th className="text-left p-4 text-[#94A3B8] font-medium text-sm">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => {
                  const config = getStatusConfig(o.status);
                  const StatusIcon = config.icon;
                  return (
                    <tr
                      key={o.id}
                      className="border-b border-[#2A364F] hover:bg-[#1F293D]/50 transition-colors"
                    >
                      <td className="p-4">
                        <span className="text-white font-mono text-sm">
                          #{o.panelOrderId || o.id.slice(0, 8)}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-white text-sm max-w-[250px] truncate">
                          {o.storefrontService?.name ?? `#${o.serviceId}`}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className="text-[#94A3B8] text-sm">
                          {o.quantity.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-[#00E676] font-semibold text-sm">
                          ${o.sellPrice.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${config.color}20`,
                            color: config.color,
                            border: `1px solid ${config.color}40`,
                          }}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {o.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-[#94A3B8] text-sm">
                          {new Date(o.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {filteredOrders.map((o) => {
              const config = getStatusConfig(o.status);
              const StatusIcon = config.icon;
              return (
                <Card
                  key={o.id}
                  className="bg-[#1F293D] border-[#2A364F] p-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-mono text-sm font-semibold">
                        #{o.panelOrderId || o.id.slice(0, 8)}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                        style={{
                          backgroundColor: `${config.color}20`,
                          color: config.color,
                          border: `1px solid ${config.color}40`,
                        }}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {o.status}
                      </span>
                    </div>
                    <p className="text-[#94A3B8] text-sm">
                      {o.storefrontService?.name ?? `Service #${o.serviceId}`}
                    </p>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#94A3B8]">
                        Qty: {o.quantity.toLocaleString()}
                      </span>
                      <span className="text-[#00E676] font-semibold">
                        ${o.sellPrice.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-[#94A3B8]/60">
                      {new Date(o.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
