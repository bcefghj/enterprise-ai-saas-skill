'use client';

import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Activity, DollarSign, AlertTriangle, Crown } from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { cn, formatNumber, formatCurrency } from '@/lib/utils';

type TimeRange = '7d' | '30d' | '90d';

function generateTimeSeriesData(days: number) {
  const data = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const label = days <= 7
      ? `${date.getMonth() + 1}/${date.getDate()}`
      : days <= 30
        ? `${date.getMonth() + 1}/${date.getDate()}`
        : `${date.getMonth() + 1}/${date.getDate()}`;

    data.push({
      date: label,
      chats: Math.floor(Math.random() * 3000 + 2000),
      tokens: Math.floor(Math.random() * 800000 + 400000),
      revenue: Math.floor(Math.random() * 4000 + 2000),
      errors: Math.floor(Math.random() * 50 + 5),
    });
  }
  return data;
}

const topUsers = [
  { rank: 1, name: '张伟', email: 'zhang.wei@example.com', chats: 1842, tokens: 423000, plan: 'enterprise' as const },
  { rank: 2, name: 'Emily Chen', email: 'emily.chen@techcorp.com', chats: 1523, tokens: 356000, plan: 'pro' as const },
  { rank: 3, name: '王芳', email: 'wang.fang@corp.cn', chats: 1287, tokens: 298000, plan: 'enterprise' as const },
  { rank: 4, name: 'David Kim', email: 'david.kim@agency.com', chats: 1104, tokens: 254000, plan: 'pro' as const },
  { rank: 5, name: '孙强', email: 'sun.qiang@fintech.cn', chats: 982, tokens: 231000, plan: 'pro' as const },
];

const PLAN_COLORS = {
  free: 'text-gray-400',
  pro: 'text-blue-400',
  enterprise: 'text-purple-400',
} as const;

const tooltipStyle = {
  backgroundColor: 'rgba(17,24,39,0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: '#fff',
};

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<TimeRange>('30d');

  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const data = useMemo(() => generateTimeSeriesData(days), [days]);

  const ranges: { value: TimeRange; label: string }[] = [
    { value: '7d', label: '7 天' },
    { value: '30d', label: '30 天' },
    { value: '90d', label: '90 天' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">数据分析</h2>
          <p className="mt-1 text-sm text-gray-400">深入了解平台使用情况和收入趋势</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={cn(
                'rounded-md px-4 py-1.5 text-sm font-medium transition-all',
                range === r.value
                  ? 'bg-blue-500/20 text-blue-400 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI Usage Line Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-xl p-6"
      >
        <div className="mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold">AI 使用趋势</h3>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              interval={days <= 7 ? 0 : days <= 30 ? 4 : 14}
            />
            <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend
              formatter={(value) => (
                <span className="text-sm text-gray-300">
                  {value === 'chats' ? '对话数' : 'Token 消耗'}
                </span>
              )}
            />
            <Line
              type="monotone"
              dataKey="chats"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="chats"
            />
            <Line
              type="monotone"
              dataKey="tokens"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={false}
              name="tokens"
              yAxisId={0}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-400" />
            <h3 className="text-lg font-semibold">收入趋势</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                interval={days <= 7 ? 0 : days <= 30 ? 4 : 14}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) => [formatCurrency(Number(value ?? 0)), '收入']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Error Rate Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <h3 className="text-lg font-semibold">错误率</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                interval={days <= 7 ? 0 : days <= 30 ? 4 : 14}
              />
              <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) => [Number(value ?? 0), '错误数']}
              />
              <Bar dataKey="errors" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card overflow-hidden rounded-xl"
      >
        <div className="flex items-center gap-2 p-6 pb-4">
          <Crown className="h-5 w-5 text-amber-400" />
          <h3 className="text-lg font-semibold">使用量 Top 5 用户</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-6 py-3 font-medium text-gray-400">排名</th>
                <th className="px-6 py-3 font-medium text-gray-400">用户</th>
                <th className="px-6 py-3 font-medium text-gray-400">套餐</th>
                <th className="px-6 py-3 font-medium text-gray-400 text-right">对话数</th>
                <th className="px-6 py-3 font-medium text-gray-400 text-right">Token 消耗</th>
              </tr>
            </thead>
            <tbody>
              {topUsers.map((user) => (
                <tr
                  key={user.rank}
                  className="border-b border-white/5 transition-colors hover:bg-white/[0.03]"
                >
                  <td className="px-6 py-3">
                    <span
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                        user.rank === 1
                          ? 'bg-amber-500/20 text-amber-400'
                          : user.rank === 2
                            ? 'bg-gray-400/20 text-gray-300'
                            : user.rank === 3
                              ? 'bg-orange-500/20 text-orange-400'
                              : 'bg-white/10 text-gray-400'
                      )}
                    >
                      {user.rank}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </td>
                  <td className="px-6 py-3">
                    <span className={cn('text-xs font-semibold', PLAN_COLORS[user.plan])}>
                      {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right font-mono">
                    {formatNumber(user.chats)}
                  </td>
                  <td className="px-6 py-3 text-right font-mono">
                    {formatNumber(user.tokens)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
