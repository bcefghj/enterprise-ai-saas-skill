'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { useUser } from '@/hooks/use-user';
import { cn } from '@/lib/utils';
import { Sidebar, type SidebarItem } from '@/components/layout/sidebar';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const sidebarItems: SidebarItem[] = [
  { label: '概览', href: '/dashboard', icon: LayoutDashboard },
  { label: 'AI 对话', href: '/dashboard/chat', icon: MessageSquare },
  { label: '设置', href: '/dashboard/settings', icon: Settings },
];

const tierLabels: Record<string, string> = {
  free: '免费版',
  pro: '专业版',
  enterprise: '企业版',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading, signOut } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="h-8 w-8 rounded-full border-2 border-blue-500/30 border-t-blue-500"
          />
          <span className="text-sm text-gray-400">加载中...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-[hsl(var(--background))]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/5 bg-[hsl(var(--background))] transition-transform duration-300 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between border-b border-white/5 px-5">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">WorkBuddy</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1 text-gray-400 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto py-2">
          <Sidebar items={sidebarItems} />
        </div>

        {/* Sidebar footer */}
        <div className="border-t border-white/5 p-4">
          <div className="flex items-center gap-3">
            <Avatar
              src={user.avatar_url}
              fallback={user.full_name || user.email}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {user.full_name || '用户'}
              </p>
              <p className="truncate text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/5 px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant={user.subscription_tier === 'free' ? 'secondary' : 'default'}
              className="hidden sm:inline-flex"
            >
              {tierLabels[user.subscription_tier] || '免费版'}
            </Badge>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <button
              onClick={signOut}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-red-400"
              title="退出登录"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
