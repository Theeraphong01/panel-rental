"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Search,
  ShoppingCart,
  X,
  AlertCircle,
  Camera,
  Music,
  Users,
  Video,
  Globe,
  Clock,
  DollarSign,
  TrendingUp,
} from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  icon?: string;
};

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

const platformIcons: Record<string, React.ComponentType<any>> = {
  instagram: Camera,
  tiktok: Music,
  facebook: Users,
  youtube: Video,
};

const platformColors: Record<string, string> = {
  instagram: "#E4405F",
  tiktok: "#00F2EA",
  facebook: "#1877F2",
  youtube: "#FF0000",
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
  const [balance, setBalance] = useState(0);
  const [ordersToday, setOrdersToday] = useState(0);

  useEffect(() => {
    setToken(localStorage.getItem("storefront_token"));
    // Fetch balance if logged in
    const t = localStorage.getItem("storefront_token");
    if (t) {
      fetch("/api/storefront/me", {
        headers: { Authorization: `Bearer ${t}` },
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.user?.balance !== undefined) setBalance(d.user.balance);
        })
        .catch(() => {});
    }
  }, []);

  const fetchServices = useCallback(
    (cat?: string, q?: string) => {
      setLoading(true);
      const sp = new URLSearchParams();
      if (cat) sp.set("cat", cat);
      if (q) sp.set("q", q);
      fetch(`/api/storefront/services?${sp.toString()}`)
        .then((r) => r.json())
        .then((data) => {
          setCategories(data.categories ?? []);
          setServices(data.services ?? []);
          // Simulate live orders processed
          setOrdersToday(
            Math.floor(Math.random() * 500) + (data.services?.length ?? 0) * 40
          );
        })
        .finally(() => setLoading(false));
    },
    []
  );

  useEffect(() => {
    fetchServices(activeCat, search);
  }, [activeCat, fetchServices]);

  // Simulate live counter
  useEffect(() => {
    const interval = setInterval(() => {
      setOrdersToday((prev) => prev + Math.floor(Math.random() * 3));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchServices(activeCat, search);
  };

  const calcPricePerK = (s: Service) => {
    if (s.priceType === "manual" && s.priceManual) return s.priceManual * 1000;
    return Math.ceil(s.panelRate * (1 + s.pricePercent / 100));
  };

  const calcPrice = (s: Service) => {
    if (s.priceType === "manual" && s.priceManual)
      return s.priceManual * orderForm.quantity;
    return Math.ceil(
      (s.panelRate / 1000) * orderForm.quantity * (1 + s.pricePercent / 100)
    );
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
        setMsg(
          `Order #${data.order.panelOrderId} placed! Balance: $${data.balance}`
        );
        setSelected(null);
        setBalance(data.balance);
      } else {
        setMsg(`${data.error}`);
      }
    } catch {
      setMsg("An error occurred");
    }
    setSubmitting(false);
  };

  const getPlatformIcon = (catSlug: string) => {
    const lower = catSlug.toLowerCase();
    for (const [key, Icon] of Object.entries(platformIcons)) {
      if (lower.includes(key)) return Icon;
    }
    return Globe;
  };

  return (
    <div className="dark space-y-8">
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#00F0FF]/10 via-transparent to-[#00E676]/10 border border-[#2A364F] p-8 md:p-12">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                Social Media Growth.{" "}
                <span className="text-[#00F0FF]">Instant Delivery.</span>
              </h1>
              <p className="text-lg text-[#94A3B8]">
                Boost your followers, likes, and engagement across all platforms
                instantly. No passwords required. 100% safe &amp; secure.
              </p>
              <div className="flex items-center gap-3 text-[#00E676]">
                <Zap className="w-5 h-5 animate-pulse" />
                <span className="text-lg font-semibold">
                  Orders Processed Today:{" "}
                  <span className="font-bold">
                    {ordersToday.toLocaleString()}
                  </span>
                </span>
              </div>
            </div>
            {/* Floating icons */}
            <div className="hidden md:flex gap-6 items-center justify-center flex-wrap">
              {Object.entries(platformIcons).map(([key, Icon]) => (
                <div
                  key={key}
                  className="flex flex-col items-center gap-1 opacity-50"
                >
                  <Icon
                    className="w-10 h-10 animate-pulse"
                    style={{ color: platformColors[key] }}
                  />
                  <span className="text-xs text-[#94A3B8] capitalize">
                    {key}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SEARCH BAR ===== */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <Input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-[#1F293D] border-[#2A364F] text-white placeholder:text-[#94A3B8] h-11"
          />
        </div>
        <Button
          type="submit"
          className="bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-[#0B0F19] font-semibold h-11 px-6"
        >
          Search
        </Button>
      </form>

      {/* ===== CATEGORY TABS ===== */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveCat("")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeCat === ""
              ? "bg-[#00F0FF] text-[#0B0F19]"
              : "bg-[#1F293D] text-[#94A3B8] hover:text-white hover:bg-[#2A364F]"
          }`}
        >
          <Globe className="w-4 h-4 inline mr-1.5" />
          All
        </button>
        {categories.map((c) => {
          const Icon = getPlatformIcon(c.slug);
          return (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.slug)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeCat === c.slug
                  ? "bg-[#00F0FF] text-[#0B0F19]"
                  : "bg-[#1F293D] text-[#94A3B8] hover:text-white hover:bg-[#2A364F]"
              }`}
            >
              <Icon className="w-4 h-4 inline mr-1.5" />
              {c.name}
            </button>
          );
        })}
      </div>

      {/* ===== SERVICES TABLE / CARDS ===== */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card
              key={i}
              className="bg-[#1F293D] border-[#2A364F] p-6 animate-pulse"
            >
              <div className="h-4 bg-[#2A364F] rounded w-3/4 mb-3" />
              <div className="h-3 bg-[#2A364F] rounded w-1/2 mb-4" />
              <div className="h-3 bg-[#2A364F] rounded w-full mb-2" />
              <div className="h-10 bg-[#2A364F] rounded w-full" />
            </Card>
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-[#94A3B8] mx-auto mb-4" />
          <p className="text-[#94A3B8] text-lg">
            No services found. Try a different search or category.
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
                    Service
                  </th>
                  <th className="text-left p-4 text-[#94A3B8] font-medium text-sm">
                    Rate/1K
                  </th>
                  <th className="text-left p-4 text-[#94A3B8] font-medium text-sm">
                    Min/Max
                  </th>
                  <th className="text-left p-4 text-[#94A3B8] font-medium text-sm">
                    Avg Time
                  </th>
                  <th className="text-right p-4 text-[#94A3B8] font-medium text-sm">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => {
                  const catKey = Object.keys(platformIcons).find((k) =>
                    s.category?.slug?.toLowerCase().includes(k)
                  );
                  const pricePerK = calcPricePerK(s);
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-[#2A364F] hover:bg-[#1F293D]/50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-start gap-3">
                          {catKey && (
                            <span
                              className="mt-0.5 flex-shrink-0"
                              style={{ color: platformColors[catKey] }}
                            >
                              {(() => {
                                const Icon = platformIcons[catKey];
                                return <Icon className="w-4 h-4" />;
                              })()}
                            </span>
                          )}
                          <div>
                            <div className="text-white font-medium text-sm">
                              {s.id}
                            </div>
                            <div className="text-[#94A3B8] text-xs mt-0.5 line-clamp-1">
                              {s.name}
                            </div>
                            {s.isFeatured && (
                              <Badge className="mt-1 bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]/30 text-[10px]">
                                Featured
                              </Badge>
                            )}
                            {s.dripfeed && (
                              <Badge className="mt-1 ml-1 bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">
                                Drip-feed
                              </Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-[#00E676] font-bold text-sm">
                        ${pricePerK.toFixed(2)}
                      </td>
                      <td className="p-4 text-[#94A3B8] text-sm">
                        {s.minOrder.toLocaleString()} /{" "}
                        {s.maxOrder.toLocaleString()}
                      </td>
                      <td className="p-4 text-[#94A3B8] text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Instant
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          size="sm"
                          className="bg-[#00E676] hover:bg-[#00E676]/90 text-white font-semibold"
                          onClick={() => {
                            setSelected(s);
                            setOrderForm({
                              link: "",
                              quantity: s.minOrder,
                            });
                          }}
                        >
                          <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                          Buy Now
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden grid grid-cols-1 gap-4">
            {services.map((s) => {
              const pricePerK = calcPricePerK(s);
              const catKey = Object.keys(platformIcons).find((k) =>
                s.category?.slug?.toLowerCase().includes(k)
              );
              return (
                <Card
                  key={s.id}
                  className="bg-[#1F293D] border-[#2A364F] p-4 hover:border-[#00F0FF]/50 transition-all cursor-pointer"
                  onClick={() => {
                    setSelected(s);
                    setOrderForm({ link: "", quantity: s.minOrder });
                  }}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <span className="text-white font-semibold text-sm">
                          {s.id}
                        </span>
                        {catKey && (
                          <span
                            className="inline-block ml-2 align-middle"
                            style={{ color: platformColors[catKey] }}
                          >
                            {(() => {
                              const Icon = platformIcons[catKey];
                              return <Icon className="w-3.5 h-3.5 inline" />;
                            })()}
                          </span>
                        )}
                        <p className="text-[#94A3B8] text-xs mt-1 line-clamp-2">
                          {s.name}
                        </p>
                      </div>
                      {s.isFeatured && (
                        <Badge className="flex-shrink-0 bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]/30 text-[10px]">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-[#94A3B8] text-xs">
                          Rate/1K:
                        </span>
                        <p className="text-[#00E676] font-bold">
                          ${pricePerK.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <span className="text-[#94A3B8] text-xs">Limits:</span>
                        <p className="text-white">
                          {s.minOrder.toLocaleString()} -{" "}
                          {s.maxOrder.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-[#00E676] hover:bg-[#00E676]/90 text-white font-semibold"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(s);
                        setOrderForm({ link: "", quantity: s.minOrder });
                      }}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Buy Now
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* ===== ORDER MODAL ===== */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-[#1F293D] border border-[#2A364F] rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {selected.name}
                </h2>
                <p className="text-sm text-[#94A3B8] mt-1">
                  {selected.description}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-[#94A3B8] hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Meta badges */}
            <div className="flex flex-wrap gap-2 mb-5">
              <Badge className="bg-[#121824] text-[#94A3B8] border-[#2A364F]">
                Min: {selected.minOrder.toLocaleString()}
              </Badge>
              <Badge className="bg-[#121824] text-[#94A3B8] border-[#2A364F]">
                Max: {selected.maxOrder.toLocaleString()}
              </Badge>
              {selected.dripfeed && (
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  Drip-feed
                </Badge>
              )}
            </div>

            {/* Target Link */}
            <label className="block mb-4">
              <span className="text-sm font-medium text-white mb-1.5 block">
                Target Link <span className="text-red-500">*</span>
              </span>
              <Input
                type="url"
                placeholder="https://..."
                value={orderForm.link}
                onChange={(e) =>
                  setOrderForm({ ...orderForm, link: e.target.value })
                }
                className="bg-[#121824] border-[#2A364F] text-white placeholder:text-[#94A3B8]"
              />
            </label>

            {/* Quantity */}
            <label className="block mb-5">
              <span className="text-sm font-medium text-white mb-1.5 block">
                Quantity
              </span>
              <Input
                type="number"
                min={selected.minOrder}
                max={selected.maxOrder}
                value={orderForm.quantity}
                onChange={(e) =>
                  setOrderForm({
                    ...orderForm,
                    quantity: parseInt(e.target.value) || selected.minOrder,
                  })
                }
                className="bg-[#121824] border-[#2A364F] text-white placeholder:text-[#94A3B8]"
              />
              <p className="text-xs text-[#94A3B8] mt-1">
                Min: {selected.minOrder.toLocaleString()} | Max:{" "}
                {selected.maxOrder.toLocaleString()}
              </p>
            </label>

            {/* Price */}
            <div className="bg-[#121824] border border-[#00F0FF]/30 rounded-xl p-4 mb-5">
              <div className="flex justify-between items-center">
                <span className="text-[#94A3B8] text-sm">Total Price:</span>
                <span className="text-2xl font-bold text-[#00E676]">
                  ${calcPrice(selected).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2 text-xs text-[#94A3B8]">
                <span>Rate: ${calcPricePerK(selected).toFixed(2)}/1K</span>
                <span>
                  Quantity: {orderForm.quantity.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-[#2A364F] text-[#94A3B8] hover:text-white hover:bg-[#2A364F]"
                onClick={() => setSelected(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[#00E676] hover:bg-[#00E676]/90 text-white font-semibold"
                disabled={submitting || !orderForm.link}
                onClick={placeOrder}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Place Order
                  </span>
                )}
              </Button>
            </div>

            {!token && (
              <p className="mt-4 text-center text-sm bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-yellow-400">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Please{" "}
                <Link
                  href={`/store/${params.subdomain}/login`}
                  className="underline font-semibold"
                >
                  login
                </Link>{" "}
                before placing an order.
              </p>
            )}

            {msg && (
              <p
                className={`mt-4 text-sm rounded-lg p-3 ${
                  msg.startsWith("Order")
                    ? "bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676]"
                    : "bg-red-500/10 border border-red-500/30 text-red-400"
                }`}
              >
                {msg}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
