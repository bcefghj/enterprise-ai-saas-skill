'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  Shield,
  ChevronRight,
} from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { cn } from '@/lib/utils';

const sidebarItems = [
  { label: '概览', href: '/admin', icon: LayoutDashboard },
  { label: '用户管理', href: '/admin/users', icon: Users },
  { label: '数据分析', href: '/admin/analytics', icon: BarChart3 },
  { label: '系统设置', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace('/dashboard');
    }
  }, [loading, isAdmin, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-[hsl(var(--background))]">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-white/10 bg-white/[0.02] backdrop-blur-xl md:flex">
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20">
            <Shield className="h-4 w-4 text-red-400" />
          </div>
          <span className="text-lg font-semibold">AiFlow</span>
          <span className="rounded-md bg-red-500/20 px-2 py-0.5 text-xs font-bold text-red-400">
            Admin
          </span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {sidebarItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-red-500/10 text-red-400'
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  )}
                >
                  <item.icon className={cn('h-4 w-4', isActive && 'text-red-400')} />
                  {item.label}
                  {isActive && (
                    <ChevronRight className="ml-auto h-4 w-4 text-red-400/60" />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-xs font-bold text-white">
              {user?.full_name?.[0] ?? 'A'}
            </div>
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium">{user?.full_name ?? 'Admin'}</p>
              <p className="truncate text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-white/10 bg-white/[0.02] px-6 backdrop-blur-xl md:px-8">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">管理后台</h1>
            <span className="rounded-md bg-red-500/20 px-2 py-0.5 text-xs font-bold text-red-400">
              Admin
            </span>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-gray-400 transition-colors hover:text-gray-200"
          >
            返回仪表盘
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
