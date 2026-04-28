'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  CreditCard,
  MessageSquare,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatNumber, formatCurrency } from '@/lib/utils';

const stats = [
  {
    label: '总用户数',
    value: 12847,
    change: +12.5,
    icon: Users,
    color: 'from-blue-500 to-cyan-400',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-400',
  },
  {
    label: '活跃订阅',
    value: 3462,
    change: +8.3,
    icon: CreditCard,
    color: 'from-emerald-500 to-green-400',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-400',
  },
  {
    label: '今日AI对话',
    value: 28934,
    change: +23.1,
    icon: MessageSquare,
    color: 'from-purple-500 to-pink-400',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-400',
  },
  {
    label: '月度收入',
    value: 89420,
    change: -2.4,
    icon: DollarSign,
    color: 'from-orange-500 to-amber-400',
    bgColor: 'bg-orange-500/10',
    textColor: 'text-orange-400',
    isCurrency: true,
  },
];

function generateSignupData() {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      signups: Math.floor(Math.random() * 120 + 80),
    });
  }
  return data;
}

const signupData = generateSignupData();

const subscriptionData = [
  { name: 'Free', value: 8420, color: '#6b7280' },
  { name: 'Pro', value: 3120, color: '#3b82f6' },
  { name: 'Enterprise', value: 1307, color: '#8b5cf6' },
];

const aiUsageData = [
  { day: '周一', chats: 4120, tokens: 892000 },
  { day: '周二', chats: 3890, tokens: 845000 },
  { day: '周三', chats: 5230, tokens: 1102000 },
  { day: '周四', chats: 4780, tokens: 978000 },
  { day: '周五', chats: 5640, tokens: 1245000 },
  { day: '周六', chats: 3210, tokens: 712000 },
  { day: '周日', chats: 2940, tokens: 654000 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function AdminOverviewPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold">管理概览</h2>
        <p className="mt-1 text-sm text-gray-400">实时监控平台运行状态</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            className="glass-card group relative overflow-hidden rounded-xl p-6"
          >
            <div className="absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-5"
              style={{
                backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
              }}
            />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-400">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold">
                  {stat.isCurrency ? formatCurrency(stat.value) : formatNumber(stat.value)}
                </p>
              </div>
              <div className={`rounded-lg ${stat.bgColor} p-2.5`}>
                <stat.icon className={`h-5 w-5 ${stat.textColor}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-sm">
              {stat.change >= 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400" />
              )}
              <span className={stat.change >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                {stat.change >= 0 ? '+' : ''}
                {stat.change}%
              </span>
              <span className="text-gray-500">vs 上月</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Signup Trend */}
        <motion.div
          variants={itemVariants}
          className="glass-card col-span-2 rounded-xl p-6"
        >
          <h3 className="mb-4 text-lg font-semibold">每日注册趋势（近30天）</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={signupData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} />
              <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(17,24,39,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Line
                type="monotone"
                dataKey="signups"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#3b82f6' }}
                name="注册数"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Subscription Distribution */}
        <motion.div
          variants={itemVariants}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="mb-4 text-lg font-semibold">订阅分布</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={subscriptionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
              >
                {subscriptionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(17,24,39,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                formatter={(value) => [formatNumber(Number(value ?? 0)), '用户数']}
              />
              <Legend
                formatter={(value) => (
                  <span className="text-sm text-gray-300">{String(value)}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* AI Usage Bar Chart */}
      <motion.div
        variants={itemVariants}
        className="glass-card rounded-xl p-6"
      >
        <h3 className="mb-4 text-lg font-semibold">每日 AI 使用量（近7天）</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={aiUsageData} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="day" stroke="#6b7280" fontSize={12} tickLine={false} />
            <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(17,24,39,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Legend
              formatter={(value) => (
                <span className="text-sm text-gray-300">
                  {value === 'chats' ? '对话数' : 'Token 消耗'}
                </span>
              )}
            />
            <Bar dataKey="chats" fill="#3b82f6" radius={[4, 4, 0, 0]} name="chats" />
            <Bar dataKey="tokens" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="tokens" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );
}
