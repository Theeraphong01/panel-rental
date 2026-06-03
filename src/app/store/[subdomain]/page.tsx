"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

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
    <div className="store-page">
      {/* Search */}
      <form onSubmit={handleSearch} className="search-bar">
        <input
          type="text"
          placeholder="ค้นหาบริการ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" style={{ background: "var(--primary)" }}>
          ค้นหา
        </button>
      </form>

      {/* Categories */}
      <div className="cat-tabs">
        <button className={activeCat === "" ? "active" : ""} onClick={() => setActiveCat("")}>
          ทั้งหมด
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={activeCat === c.slug ? "active" : ""}
            onClick={() => setActiveCat(c.slug)}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="skeleton-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
      ) : (
        <div className="services-grid">
          {services.map((s) => (
            <div
              key={s.id}
              className={`service-card ${s.isFeatured ? "featured" : ""}`}
              onClick={() => {
                setSelected(s);
                setOrderForm({ link: "", quantity: s.minOrder });
              }}
              style={{ borderTopColor: s.isFeatured ? "var(--primary)" : undefined }}
            >
              <div className="card-header">
                <span className="cat-badge">{s.category?.name ?? "ทั่วไป"}</span>
                {s.isFeatured && <span className="feat-badge">แนะนำ</span>}
              </div>
              <h3>{s.name}</h3>
              {s.description && <p className="card-desc">{s.description}</p>}
              <div className="card-meta">
                <span>
                  เริ่มต้น {s.minOrder} — {s.maxOrder}
                </span>
                <span className="price">
                  ~{s.priceType === "manual" && s.priceManual
                    ? s.priceManual
                    : Math.ceil((s.panelRate / 1000) * (1 + s.pricePercent / 100))}{" "}
                  บาท / {s.minOrder}
                </span>
              </div>
              {s.dripfeed && <span className="df-badge">Drip-feed</span>}
              <button className="btn-order" style={{ background: "var(--primary)" }}>
                สั่งซื้อ
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Order Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{selected.name}</h2>
            <p className="modal-desc">{selected.description}</p>
            <div className="modal-meta">
              <span>ขั้นต่ำ: {selected.minOrder}</span>
              <span>สูงสุด: {selected.maxOrder}</span>
              {selected.dripfeed && <span>✅ Drip-feed</span>}
            </div>

            <label>
              ลิงก์ <span className="req">*</span>
              <input
                type="url"
                placeholder="https://..."
                value={orderForm.link}
                onChange={(e) => setOrderForm({ ...orderForm, link: e.target.value })}
              />
            </label>

            <label>
              จำนวน
              <input
                type="number"
                min={selected.minOrder}
                max={selected.maxOrder}
                value={orderForm.quantity}
                onChange={(e) =>
                  setOrderForm({ ...orderForm, quantity: parseInt(e.target.value) || 0 })
                }
              />
            </label>

            <div className="order-total">
              💰 ราคารวม: <strong>{calcPrice(selected)} บาท</strong>
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setSelected(null)}>
                ยกเลิก
              </button>
              <button
                className="btn-submit"
                style={{ background: "var(--primary)" }}
                disabled={submitting || !orderForm.link}
                onClick={placeOrder}
              >
                {submitting ? "กำลังสั่ง..." : "ยืนยันคำสั่งซื้อ"}
              </button>
            </div>

            {msg && <p className="msg">{msg}</p>}
            {!token && (
              <p className="msg warn">
                ⚠️ กรุณา{" "}
                <Link href={`/store/${params.subdomain}/login`}>เข้าสู่ระบบ</Link> ก่อนสั่งซื้อ
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
