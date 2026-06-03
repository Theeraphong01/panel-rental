import Sidebar from '@/components/sidebar';
import AuthProvider from '@/components/auth-provider';

const adminItems = [
  { label: 'ภาพรวม', href: '/admin', icon: '📊' },
  { label: 'ผู้ใช้', href: '/admin/users', icon: '👥' },
  { label: 'ร้านค้า', href: '/admin/tenants', icon: '🏪' },
  { label: 'แพ็คเกจ', href: '/admin/packages', icon: '📦' },
  { label: 'การตั้งค่า', href: '/admin/settings', icon: '⚙️' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-white">
        <Sidebar items={adminItems} brand="Admin" brandHref="/admin" />
        <main className="pl-60 pt-16 transition-all duration-300">
          <div className="max-w-7xl mx-auto p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </AuthProvider>
  );
}
