'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  items: SidebarItem[];
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ items, collapsed = false }: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {items.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link key={item.href} href={item.href}>
            <div
              className={cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/80 to-blue-500/60 shadow-lg shadow-blue-500/20"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <Icon className="relative z-10 h-5 w-5 shrink-0" />
              {!collapsed && <span className="relative z-10">{item.label}</span>}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
