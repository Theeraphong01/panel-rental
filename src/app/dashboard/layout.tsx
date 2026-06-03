import Sidebar from '@/components/sidebar';
import AuthProvider from '@/components/auth-provider';

const dashItems = [
  { label: 'ภาพรวม', href: '/dashboard', icon: '📊' },
  { label: 'API Keys', href: '/dashboard/api-keys', icon: '🔑' },
  { label: 'บริการ', href: '/dashboard/services', icon: '📦' },
  { label: 'หมวดหมู่', href: '/dashboard/categories', icon: '📁' },
  { label: 'ราคา', href: '/dashboard/pricing', icon: '💰' },
  { label: 'ออเดอร์', href: '/dashboard/orders', icon: '📋' },
  { label: 'สมาชิก', href: '/dashboard/end-users', icon: '👥' },
  { label: 'สลิป', href: '/dashboard/slips', icon: '🧾' },
  { label: 'เติมเงิน', href: '/dashboard/topup-config', icon: '💳' },
  { label: 'รายได้', href: '/dashboard/revenue', icon: '📈' },
  { label: 'ธีม', href: '/dashboard/theme', icon: '🎨' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Sidebar items={dashItems} brand="Dashboard" brandHref="/dashboard" />
        <main className="pl-60 pt-16 transition-all duration-300">
          <div className="max-w-7xl mx-auto p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </AuthProvider>
  );
}
