'use client';

import { motion } from 'motion/react';
import {
  MessageSquare,
  Zap,
  ArrowUpRight,
  Settings,
  Crown,
  Clock,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/hooks/use-user';
import { cn } from '@/lib/utils';
import { PLAN_LIMITS } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const mockConversations = [
  { id: '1', title: '如何使用 React Server Components', updatedAt: '10 分钟前', messages: 12 },
  { id: '2', title: '帮我编写一个 REST API', updatedAt: '1 小时前', messages: 8 },
  { id: '3', title: 'Docker 部署最佳实践', updatedAt: '3 小时前', messages: 24 },
  { id: '4', title: '数据库性能优化方案', updatedAt: '昨天', messages: 16 },
];

const tierLabels: Record<string, string> = {
  free: '免费版',
  pro: '专业版',
  enterprise: '企业版',
};

export default function DashboardPage() {
  const { user } = useUser();

  const tier = user?.subscription_tier || 'free';
  const limit = PLAN_LIMITS[tier as keyof typeof PLAN_LIMITS]?.chatsPerDay ?? 10;
  const usedToday = 3;

  const stats = [
    {
      label: '今日对话',
      value: `${usedToday} / ${limit === Infinity ? '∞' : limit}`,
      icon: MessageSquare,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: '当前方案',
      value: tierLabels[tier],
      icon: Crown,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: '账户状态',
      value: user?.subscription_status === 'active' ? '正常' : '未激活',
      icon: TrendingUp,
      color: 'from-emerald-500 to-green-500',
      bgColor: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
        {/* Welcome */}
        <motion.div variants={item}>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
            欢迎回来，{user?.full_name || '用户'} 👋
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            以下是您账户的概览信息
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                      <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-xl',
                        stat.bgColor
                      )}
                    >
                      <Icon className={cn('h-6 w-6 bg-gradient-to-br bg-clip-text', stat.color)} style={{ color: undefined }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        {/* Quick actions */}
        <motion.div variants={item}>
          <h2 className="mb-4 text-lg font-semibold">快捷操作</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link href="/dashboard/chat">
              <div className="group glass-card flex items-center gap-3 rounded-xl p-4 transition-all duration-200 hover:bg-white/[0.06]">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">开始新对话</p>
                  <p className="text-xs text-gray-500">与 AI 助手交流</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-600 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gray-400" />
              </div>
            </Link>

            <Link href="/pricing">
              <div className="group glass-card flex items-center gap-3 rounded-xl p-4 transition-all duration-200 hover:bg-white/[0.06]">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                  <Zap className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">升级方案</p>
                  <p className="text-xs text-gray-500">解锁更多功能</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-600 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gray-400" />
              </div>
            </Link>

            <Link href="/dashboard/settings">
              <div className="group glass-card flex items-center gap-3 rounded-xl p-4 transition-all duration-200 hover:bg-white/[0.06]">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-500/10 text-gray-400">
                  <Settings className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">账户设置</p>
                  <p className="text-xs text-gray-500">管理个人信息</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-600 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gray-400" />
              </div>
            </Link>
          </div>
        </motion.div>

        {/* Recent conversations */}
        <motion.div variants={item}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">最近对话</h2>
            <Link href="/dashboard/chat">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                查看全部 <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            {mockConversations.map((conv) => (
              <Link key={conv.id} href="/dashboard/chat">
                <div className="glass-card group flex items-center gap-4 rounded-xl p-4 transition-all duration-200 hover:bg-white/[0.06]">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{conv.title}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {conv.updatedAt}
                      </span>
                      <span>{conv.messages} 条消息</span>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-gray-600 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
