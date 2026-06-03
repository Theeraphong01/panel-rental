"use client";

import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Store,
  ShoppingCart,
  PlusCircle,
  User,
  Bell,
  LogOut,
  Menu,
  X,
  Wallet,
  Zap,
  ChevronDown,
} from "lucide-react";

type TenantInfo = {
  name: string;
  subdomain: string;
  primaryColor: string;
  logoUrl?: string;
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ subdomain: string }>();
  const pathname = usePathname();
  const router = useRouter();

  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const fetchBalance = useCallback(() => {
    const token = localStorage.getItem("storefront_token");
    if (!token) return;
    fetch("/api/storefront/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.user?.balance !== undefined) setBalance(d.user.balance);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/storefront/tenant")
      .then((r) => r.json())
      .then((data) => setTenant({ ...data, logoUrl: data.logoUrl }))
      .catch(() => {});
    const loggedIn = !!localStorage.getItem("storefront_token");
    setIsLoggedIn(loggedIn);
    if (loggedIn) {
      fetchUnread();
      fetchBalance();
    }
  }, [fetchUnread, fetchBalance]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = setInterval(() => {
      fetchUnread();
      fetchBalance();
    }, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn, fetchUnread, fetchBalance]);

  const logout = () => {
    localStorage.removeItem("storefront_token");
    setIsLoggedIn(false);
    router.push(`/store/${params.subdomain}`);
  };

  const hideAuth =
    pathname.includes("/login") || pathname.includes("/register");

  const navLinks = [
    {
      href: `/store/${params.subdomain}`,
      label: "Services",
      icon: Store,
    },
    {
      href: `/store/${params.subdomain}/orders`,
      label: "Orders",
      icon: ShoppingCart,
      requireAuth: true,
    },
    {
      href: `/store/${params.subdomain}/topup`,
      label: "Top Up",
      icon: PlusCircle,
      requireAuth: true,
    },
    {
      href: `/store/${params.subdomain}/profile`,
      label: "Profile",
      icon: User,
      requireAuth: true,
    },
    {
      href: `/store/${params.subdomain}/notifications`,
      label: "Notifications",
      icon: Bell,
      requireAuth: true,
      badge: unreadCount,
    },
  ];

  const isActive = (href: string) => {
    if (href === `/store/${params.subdomain}`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="dark min-h-screen bg-[#0B0F19] text-white flex flex-col">
      {/* ===== STICKY HEADER ===== */}
      <header className="sticky top-0 z-50 bg-[#121824] border-b border-[#2A364F] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          {/* Logo + Store Name */}
          <div className="flex items-center gap-3">
            {tenant?.logoUrl ? (
              <img
                src={tenant.logoUrl}
                alt={tenant.name}
                className="h-8 w-8 rounded-lg object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-[#00F0FF]/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-[#00F0FF]" />
              </div>
            )}
            <Link
              href={`/store/${params.subdomain}`}
              className="text-lg font-bold text-white hover:text-[#00F0FF] transition-colors"
            >
              {tenant?.name ?? params.subdomain}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              if (link.requireAuth && !isLoggedIn) return null;
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "bg-[#00F0FF]/10 text-[#00F0FF]"
                      : "text-[#94A3B8] hover:text-white hover:bg-[#1F293D]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] flex items-center justify-center px-1">
                      {link.badge > 99 ? "99+" : link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side: Balance + Auth / Mobile menu button */}
          <div className="flex items-center gap-3">
            {isLoggedIn && (
              <div className="hidden sm:flex items-center gap-2 bg-[#1F293D] rounded-lg px-3 py-1.5">
                <Wallet className="w-4 h-4 text-[#00E676]" />
                <span className="text-sm font-semibold text-[#00E676]">
                  ${balance.toFixed(2)}
                </span>
              </div>
            )}

            {!isLoggedIn && !hideAuth && (
              <div className="hidden sm:flex items-center gap-2">
                <Link href={`/store/${params.subdomain}/login`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#2A364F] text-white hover:bg-[#1F293D]"
                  >
                    Login
                  </Button>
                </Link>
                <Link href={`/store/${params.subdomain}/register`}>
                  <Button
                    size="sm"
                    className="bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-[#0B0F19] font-semibold"
                  >
                    Register
                  </Button>
                </Link>
              </div>
            )}

            {isLoggedIn && (
              <button
                onClick={logout}
                className="hidden md:flex items-center gap-1 text-sm text-[#94A3B8] hover:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-[#94A3B8] hover:text-white p-1"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#121824] border-t border-[#2A364F] px-4 py-4 space-y-2">
            {isLoggedIn && (
              <div className="flex items-center gap-2 mb-4 px-2 py-2 bg-[#1F293D] rounded-lg">
                <Wallet className="w-5 h-5 text-[#00E676]" />
                <span className="text-lg font-bold text-[#00E676]">
                  ${balance.toFixed(2)}
                </span>
              </div>
            )}
            {navLinks.map((link) => {
              if (link.requireAuth && !isLoggedIn) return null;
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "bg-[#00F0FF]/10 text-[#00F0FF]"
                      : "text-[#94A3B8] hover:text-white hover:bg-[#1F293D]"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">
                      {link.badge > 99 ? "99+" : link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
            {!isLoggedIn && !hideAuth && (
              <div className="flex gap-2 pt-2">
                <Link
                  href={`/store/${params.subdomain}/login`}
                  className="flex-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant="outline"
                    className="w-full border-[#2A364F] text-white hover:bg-[#1F293D]"
                  >
                    Login
                  </Button>
                </Link>
                <Link
                  href={`/store/${params.subdomain}/register`}
                  className="flex-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="w-full bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-[#0B0F19] font-semibold">
                    Register
                  </Button>
                </Link>
              </div>
            )}
            {isLoggedIn && (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-3 rounded-lg text-sm text-[#94A3B8] hover:text-red-400 w-full"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {children}
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="bg-[#121824] border-t border-[#2A364F] py-8 px-4 text-center">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-4 h-4 text-[#00F0FF]" />
            <span className="text-white font-semibold">
              {tenant?.name ?? "Store"}
            </span>
          </div>
          <p className="text-[#94A3B8] text-sm">
            &copy; {new Date().getFullYear()} {tenant?.name ?? "Store"} &mdash;
            Powered by PanelRental
          </p>
        </div>
      </footer>
    </div>
  );
}
