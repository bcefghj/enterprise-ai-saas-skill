'use client';

import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Shield,
  UserX,
  UserCheck,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

interface MockUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'free_user' | 'pro_user' | 'admin';
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'suspended';
  joinedAt: string;
}

const mockUsers: MockUser[] = [
  { id: '1', name: '张伟', email: 'zhang.wei@example.com', avatar: 'ZW', role: 'admin', plan: 'enterprise', status: 'active', joinedAt: '2025-03-15' },
  { id: '2', name: 'Emily Chen', email: 'emily.chen@techcorp.com', avatar: 'EC', role: 'pro_user', plan: 'pro', status: 'active', joinedAt: '2025-05-22' },
  { id: '3', name: '李明', email: 'li.ming@startup.io', avatar: 'LM', role: 'pro_user', plan: 'pro', status: 'active', joinedAt: '2025-06-10' },
  { id: '4', name: 'Sarah Johnson', email: 'sarah.j@design.co', avatar: 'SJ', role: 'free_user', plan: 'free', status: 'active', joinedAt: '2025-07-01' },
  { id: '5', name: '王芳', email: 'wang.fang@corp.cn', avatar: 'WF', role: 'pro_user', plan: 'enterprise', status: 'active', joinedAt: '2025-07-18' },
  { id: '6', name: 'Michael Brown', email: 'm.brown@gmail.com', avatar: 'MB', role: 'free_user', plan: 'free', status: 'suspended', joinedAt: '2025-08-05' },
  { id: '7', name: '赵丽', email: 'zhao.li@university.edu', avatar: 'ZL', role: 'free_user', plan: 'free', status: 'active', joinedAt: '2025-08-20' },
  { id: '8', name: 'David Kim', email: 'david.kim@agency.com', avatar: 'DK', role: 'pro_user', plan: 'pro', status: 'active', joinedAt: '2025-09-02' },
  { id: '9', name: '孙强', email: 'sun.qiang@fintech.cn', avatar: 'SQ', role: 'pro_user', plan: 'pro', status: 'active', joinedAt: '2025-09-15' },
  { id: '10', name: 'Anna Schmidt', email: 'a.schmidt@berlin.de', avatar: 'AS', role: 'free_user', plan: 'free', status: 'active', joinedAt: '2025-10-01' },
  { id: '11', name: '刘洋', email: 'liu.yang@media.cn', avatar: 'LY', role: 'free_user', plan: 'free', status: 'suspended', joinedAt: '2025-10-12' },
  { id: '12', name: 'James Wilson', email: 'james.w@dev.io', avatar: 'JW', role: 'pro_user', plan: 'pro', status: 'active', joinedAt: '2025-10-28' },
  { id: '13', name: '陈静', email: 'chen.jing@health.com', avatar: 'CJ', role: 'free_user', plan: 'free', status: 'active', joinedAt: '2025-11-05' },
  { id: '14', name: 'Alex Martinez', email: 'alex.m@creative.co', avatar: 'AM', role: 'pro_user', plan: 'enterprise', status: 'active', joinedAt: '2025-11-20' },
  { id: '15', name: '黄磊', email: 'huang.lei@ai-lab.cn', avatar: 'HL', role: 'admin', plan: 'enterprise', status: 'active', joinedAt: '2025-12-01' },
  { id: '16', name: 'Lisa Park', email: 'lisa.p@social.com', avatar: 'LP', role: 'free_user', plan: 'free', status: 'active', joinedAt: '2025-12-15' },
  { id: '17', name: '周婷', email: 'zhou.ting@retail.cn', avatar: 'ZT', role: 'pro_user', plan: 'pro', status: 'active', joinedAt: '2026-01-08' },
  { id: '18', name: 'Tom Anderson', email: 'tom.a@consulting.biz', avatar: 'TA', role: 'free_user', plan: 'free', status: 'suspended', joinedAt: '2026-01-22' },
  { id: '19', name: '吴超', email: 'wu.chao@gaming.cn', avatar: 'WC', role: 'pro_user', plan: 'pro', status: 'active', joinedAt: '2026-02-10' },
  { id: '20', name: 'Maria Garcia', email: 'maria.g@travel.es', avatar: 'MG', role: 'free_user', plan: 'free', status: 'active', joinedAt: '2026-03-01' },
];

const ROLE_CONFIG = {
  free_user: { label: 'Free', className: 'bg-gray-500/20 text-gray-300' },
  pro_user: { label: 'Pro', className: 'bg-blue-500/20 text-blue-400' },
  admin: { label: 'Admin', className: 'bg-purple-500/20 text-purple-400' },
} as const;

const PLAN_CONFIG = {
  free: { label: 'Free', className: 'bg-gray-500/20 text-gray-300' },
  pro: { label: 'Pro', className: 'bg-blue-500/20 text-blue-400' },
  enterprise: { label: 'Enterprise', className: 'bg-purple-500/20 text-purple-400' },
} as const;

const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<MockUser[]>(mockUsers);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [roleDropdown, setRoleDropdown] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [users, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageUsers = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleToggleStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' }
          : u
      )
    );
  };

  const handleChangeRole = (userId: string, newRole: MockUser['role']) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    setRoleDropdown(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold">用户管理</h2>
        <p className="mt-1 text-sm text-gray-400">
          共 {filtered.length} 位用户
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="搜索用户名或邮箱…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="h-10 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 text-sm placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-6 py-4 font-medium text-gray-400">用户</th>
                <th className="px-6 py-4 font-medium text-gray-400">邮箱</th>
                <th className="px-6 py-4 font-medium text-gray-400">角色</th>
                <th className="px-6 py-4 font-medium text-gray-400">套餐</th>
                <th className="px-6 py-4 font-medium text-gray-400">状态</th>
                <th className="px-6 py-4 font-medium text-gray-400">注册时间</th>
                <th className="px-6 py-4 font-medium text-gray-400">操作</th>
              </tr>
            </thead>
            <tbody>
              {pageUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-white/5 transition-colors hover:bg-white/[0.03]"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-xs font-bold text-white">
                        {user.avatar}
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{user.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
                        ROLE_CONFIG[user.role].className
                      )}
                    >
                      {ROLE_CONFIG[user.role].label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
                        PLAN_CONFIG[user.plan].className
                      )}
                    >
                      {PLAN_CONFIG[user.plan].label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                        user.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/20 text-red-400'
                      )}
                    >
                      <span
                        className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          user.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'
                        )}
                      />
                      {user.status === 'active' ? '活跃' : '已封禁'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{formatDate(user.joinedAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {/* Role Dropdown */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setRoleDropdown(roleDropdown === user.id ? null : user.id)
                          }
                          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-white/10 hover:text-gray-200"
                        >
                          <Shield className="h-3.5 w-3.5" />
                          角色
                          <ChevronDown className="h-3 w-3" />
                        </button>
                        {roleDropdown === user.id && (
                          <div className="absolute right-0 top-full z-10 mt-1 w-32 rounded-lg border border-white/10 bg-gray-900 py-1 shadow-xl">
                            {(['free_user', 'pro_user', 'admin'] as const).map((role) => (
                              <button
                                key={role}
                                onClick={() => handleChangeRole(user.id, role)}
                                className={cn(
                                  'flex w-full items-center px-3 py-1.5 text-left text-xs transition-colors hover:bg-white/10',
                                  user.role === role
                                    ? 'text-blue-400'
                                    : 'text-gray-300'
                                )}
                              >
                                {ROLE_CONFIG[role].label}
                                {user.role === role && (
                                  <span className="ml-auto text-blue-400">✓</span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Suspend / Activate */}
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className={cn(
                          'flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors',
                          user.status === 'active'
                            ? 'text-red-400 hover:bg-red-500/10'
                            : 'text-emerald-400 hover:bg-emerald-500/10'
                        )}
                      >
                        {user.status === 'active' ? (
                          <>
                            <UserX className="h-3.5 w-3.5" />
                            封禁
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-3.5 w-3.5" />
                            解封
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
          <p className="text-sm text-gray-400">
            第 {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}{' '}
            条，共 {filtered.length} 条
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-white/10 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn(
                  'h-8 w-8 rounded-md text-sm font-medium transition-colors',
                  p === page
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-gray-400 hover:bg-white/10'
                )}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-white/10 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
