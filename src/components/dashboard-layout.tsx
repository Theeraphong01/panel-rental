'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  Key,
  Package,
  FolderTree,
  DollarSign,
  ClipboardList,
  Users,
  Receipt,
  CreditCard,
  TrendingUp,
  Palette,
  Wallet,
  Menu,
  X,
  LogOut,
} from 'lucide-react';

const navigation = [
  { name: 'ภาพรวม', href: '/dashboard', icon: LayoutDashboard },
  { name: 'API Keys', href: '/dashboard/api-keys', icon: Key },
  { name: 'บริการ', href: '/dashboard/services', icon: Package },
  { name: 'หมวดหมู่', href: '/dashboard/categories', icon: FolderTree },
  { name: 'ราคา', href: '/dashboard/pricing', icon: DollarSign },
  { name: 'ออเดอร์', href: '/dashboard/orders', icon: ClipboardList },
  { name: 'สมาชิก', href: '/dashboard/end-users', icon: Users },
  { name: 'สลิป', href: '/dashboard/slips', icon: Receipt },
  { name: 'เติมเงิน', href: '/dashboard/topup-config', icon: CreditCard },
  { name: 'รายได้', href: '/dashboard/revenue', icon: TrendingUp },
  { name: 'ธีม', href: '/dashboard/theme', icon: Palette },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/dashboard/tenant')
      .then((r) => r.json())
      .then((tenant) => {
        const bal = tenant?.creditBalanceSatang;
        if (typeof bal === 'number') setBalance(bal / 100);
        else if (tenant?.balance !== undefined) setBalance(Number(tenant.balance));
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-[#121824] border-b border-[#2A364F]">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-white p-1"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link href="/dashboard" className="text-xl font-bold text-white flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#00F0FF] to-[#00E676] rounded-lg" />
              Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-[#1F293D] px-4 py-2 rounded-lg">
              <Wallet className="w-5 h-5 text-[#00E676]" />
              <span className="text-white font-bold">
                {balance !== null ? `฿${balance.toFixed(2)}` : '...'}
              </span>
            </div>
            {session?.user && (
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-white hover:text-[#FF4D4D] p-1 transition-colors"
                title="ออกจากระบบ"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        {/* Mobile Balance */}
        <div className="md:hidden px-4 pb-3">
          <div className="flex items-center justify-between bg-[#1F293D] px-4 py-2 rounded-lg">
            <span className="text-[#94A3B8]">Balance:</span>
            <span className="text-white font-bold">
              {balance !== null ? `฿${balance.toFixed(2)}` : '...'}
            </span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-[#121824] border-r border-[#2A364F] min-h-[calc(100vh-73px)] sticky top-[73px]">
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#00F0FF] text-[#0B0F19]'
                      : 'text-[#94A3B8] hover:bg-[#1F293D] hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-[#0B0F19]/95 pt-[73px]">
            <nav className="p-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#00F0FF] text-[#0B0F19]'
                        : 'text-[#94A3B8] hover:bg-[#1F293D] hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 min-h-[calc(100vh-73px)]">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
