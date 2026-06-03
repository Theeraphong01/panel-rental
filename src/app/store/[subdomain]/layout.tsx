"use client";

import "@/styles/storefront.css";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { usePathname, useParams } from "next/navigation";

type TenantInfo = { name: string; subdomain: string; primaryColor: string; logoUrl?: string };
type Contact = { id: string; type: string; value: string; label?: string };
type Bank = { id: string; bankName: string; accountNumber: string; accountNameTh: string };

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ subdomain: string }>();
  const pathname = usePathname();
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);

  const fetchUnread = useCallback(() => {
    const token = localStorage.getItem("storefront_token");
    if (!token) return;
    fetch("/api/storefront/notifications?unread=1", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setUnreadCount(d.unreadCount ?? 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/storefront/tenant")
      .then((r) => r.json())
      .then((data) => setTenant({ ...data, logoUrl: data.logoUrl }))
      .catch(() => {});
    fetch("/api/storefront/contacts").then(r => r.json()).then(d => setContacts(d.contacts ?? [])).catch(() => {});
    fetch("/api/storefront/banks").then(r => r.json()).then(d => setBanks(d.banks ?? [])).catch(() => {});
    const loggedIn = !!localStorage.getItem("storefront_token");
    setIsLoggedIn(loggedIn);
    if (loggedIn) fetchUnread();
  }, [fetchUnread]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn, fetchUnread]);

  const logout = () => {
    localStorage.removeItem("storefront_token");
    setIsLoggedIn(false);
    window.location.href = `/store/${params.subdomain}`;
  };

  const primaryColor = tenant?.primaryColor ?? "#000";
  const hideAuth = pathname.includes("/login") || pathname.includes("/register");

  const contactIcon = (t: string) => {
    switch (t) {
      case "line": return "💚";
      case "facebook": return "📘";
      case "email": return "📧";
      case "phone": return "📞";
      default: return "🔗";
    }
  };

  return (
    <div className="store-root" style={{ "--primary": primaryColor } as React.CSSProperties}>
      <header className="store-header" style={{ borderBottomColor: primaryColor }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {tenant?.logoUrl && <img src={tenant.logoUrl} alt="" style={{ height: 32, borderRadius: 6 }} />}
          <Link href={`/store/${params.subdomain}`} className="store-logo">
            {tenant?.name ?? params.subdomain}
          </Link>
        </div>
        <nav className="store-nav">
          <Link href={`/store/${params.subdomain}`}>หน้าแรก</Link>
          {isLoggedIn && (
            <>
              <Link href={`/store/${params.subdomain}/orders`}>ออเดอร์</Link>
              <Link href={`/store/${params.subdomain}/topup`}>เติมเงิน</Link>
              <Link href={`/store/${params.subdomain}/notifications`} className="notif-link">
                แจ้งเตือน
                {unreadCount > 0 && (
                  <span className="notif-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
                )}
              </Link>
              <Link href={`/store/${params.subdomain}/profile`}>โปรไฟล์</Link>
              <button onClick={logout} className="btn-link">ออกจากระบบ</button>
            </>
          )}
          {!isLoggedIn && !hideAuth && (
            <>
              <Link href={`/store/${params.subdomain}/login`}>เข้าสู่ระบบ</Link>
              <Link href={`/store/${params.subdomain}/register`}>สมัครสมาชิก</Link>
            </>
          )}
        </nav>
      </header>
      <main className="store-main">{children}</main>
      <footer className="store-footer">
        {/* Bank Accounts */}
        {banks.length > 0 && (
          <div className="footer-section">
            <strong>บัญชีรับเงิน</strong>
            <div className="bank-list">
              {banks.map(b => (
                <div key={b.id} className="bank-item">
                  <span>{b.bankName}: {b.accountNumber} ({b.accountNameTh})</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Contacts */}
        {contacts.length > 0 && (
          <div className="footer-section">
            <strong>ติดต่อเรา</strong>
            <div className="contact-list">
              {contacts.map(c => (
                <span key={c.id} className="contact-chip">
                  {contactIcon(c.type)} {c.label || c.value}
                </span>
              ))}
            </div>
          </div>
        )}
        <p style={{ marginTop: 16 }}>&copy; {tenant?.name ?? "Store"} — ขับเคลื่อนโดย PanelRental</p>
      </footer>
    </div>
  );
}
