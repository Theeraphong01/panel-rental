'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';

type NavItem = {
  label: string;
  href: string;
  icon: string;
};

export default function Sidebar({ items, brand, brandHref }: { items: NavItem[]; brand: string; brandHref: string }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`fixed top-0 left-0 h-full z-40 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col transition-all duration-300 ${collapsed ? 'w-[68px]' : 'w-60'}`}>
      {/* Brand */}
      <Link href={brandHref} className="flex items-center gap-2.5 h-16 px-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">P</div>
        {!collapsed && <span className="font-bold text-base tracking-tight truncate">{brand}</span>}
      </Link>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <span className="text-lg shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-zinc-100 dark:border-zinc-800 p-3 space-y-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center rounded-lg p-2 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
        >
          {collapsed ? '→' : '←'}
        </button>
        {!collapsed && session?.user && (
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">{session.user.name}</p>
            <p className="text-xs text-zinc-500 truncate">{session.user.email}</p>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="mt-2 text-xs text-zinc-400 hover:text-red-500 transition-colors"
            >
              ออกจากระบบ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
