"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { usePathname, useParams } from "next/navigation";
import { GlassPanel } from "@/components/premium";

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
    fetch("/api/storefront/contacts")
      .then((r) => r.json())
      .then((d) => setContacts(d.contacts ?? []))
      .catch(() => {});
    fetch("/api/storefront/banks")
      .then((r) => r.json())
      .then((d) => setBanks(d.banks ?? []))
      .catch(() => {});
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
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {tenant?.logoUrl && (
              <img src={tenant.logoUrl} alt="" className="h-8 w-8 rounded-lg object-cover" />
            )}
            <Link
              href={`/store/${params.subdomain}`}
              className="text-lg font-black text-white hover:text-violet-400 transition-colors"
            >
              {tenant?.name ?? params.subdomain}
            </Link>
          </div>
          <nav className="flex items-center gap-1">
            <Link
              href={`/store/${params.subdomain}`}
              className="px-3 py-2 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
            >
              หน้าแรก
            </Link>
            {isLoggedIn && (
              <>
                <Link
                  href={`/store/${params.subdomain}/orders`}
                  className="px-3 py-2 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                >
                  ออเดอร์
                </Link>
                <Link
                  href={`/store/${params.subdomain}/topup`}
                  className="px-3 py-2 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                >
                  เติมเงิน
                </Link>
                <Link
                  href={`/store/${params.subdomain}/notifications`}
                  className="px-3 py-2 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-all relative"
                >
                  แจ้งเตือน
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  href={`/store/${params.subdomain}/profile`}
                  className="px-3 py-2 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                >
                  โปรไฟล์
                </Link>
                <button
                  onClick={logout}
                  className="px-3 py-2 text-sm text-zinc-500 hover:text-red-400 rounded-lg hover:bg-white/5 transition-all"
                >
                  ออกจากระบบ
                </button>
              </>
            )}
            {!isLoggedIn && !hideAuth && (
              <>
                <Link
                  href={`/store/${params.subdomain}/login`}
                  className="px-4 py-2 text-sm text-zinc-300 hover:text-white rounded-xl hover:bg-white/5 transition-all"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href={`/store/${params.subdomain}/register`}
                  className="ml-2 px-4 py-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 transition-all shadow-lg shadow-violet-500/25"
                >
                  สมัครสมาชิก
                </Link>
              </>
            )}
          </nav>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid gap-8 md:grid-cols-2">
            {banks.length > 0 && (
              <GlassPanel padded className="!p-5">
                <h3 className="text-sm font-bold text-white mb-3">บัญชีรับเงิน</h3>
                <div className="space-y-2">
                  {banks.map((b) => (
                    <div key={b.id} className="text-sm text-zinc-400">
                      <span className="text-zinc-300 font-medium">{b.bankName}:</span>{" "}
                      {b.accountNumber} ({b.accountNameTh})
                    </div>
                  ))}
                </div>
              </GlassPanel>
            )}
            {contacts.length > 0 && (
              <GlassPanel padded className="!p-5">
                <h3 className="text-sm font-bold text-white mb-3">ติดต่อเรา</h3>
                <div className="flex flex-wrap gap-2">
                  {contacts.map((c) => (
                    <span
                      key={c.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-white/5 border border-white/5 text-zinc-300"
                    >
                      {contactIcon(c.type)} {c.label || c.value}
                    </span>
                  ))}
                </div>
              </GlassPanel>
            )}
          </div>
          <p className="mt-6 text-center text-xs text-zinc-600">
            &copy; {tenant?.name ?? "Store"} — ขับเคลื่อนโดย PanelRental
          </p>
        </div>
      </footer>
    </div>
  );
}
