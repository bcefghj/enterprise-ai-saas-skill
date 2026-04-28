'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  User,
  Mail,
  Shield,
  Palette,
  Languages,
  Trash2,
  Crown,
  Camera,
  Lock,
  AlertTriangle,
  Moon,
  Sun,
  Check,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/use-user';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

const languages = [
  { code: 'zh-CN', label: '简体中文' },
  { code: 'en-US', label: 'English' },
];

const tierLabels: Record<string, string> = {
  free: '免费版',
  pro: '专业版',
  enterprise: '企业版',
};

export default function SettingsPage() {
  const { user, signOut } = useUser();
  const supabase = createClient();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [language, setLanguage] = useState('zh-CN');
  const [darkMode, setDarkMode] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);

    await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChangePassword = async () => {
    if (!user) return;
    await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/settings`,
    });
    alert('密码重置邮件已发送，请查收邮箱。');
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    await signOut();
  };

  return (
    <div className="p-6 lg:p-8">
      <motion.div variants={container} initial="hidden" animate="show" className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <motion.div variants={item}>
          <h1 className="text-2xl font-bold tracking-tight">设置</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            管理您的个人信息和偏好设置
          </p>
        </motion.div>

        {/* Profile section */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-blue-400" />
                个人信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar
                    src={user?.avatar_url}
                    fallback={user?.full_name || user?.email || ''}
                    size="lg"
                  />
                  <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[hsl(var(--background))] bg-blue-500 text-white transition-colors hover:bg-blue-600">
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div>
                  <p className="text-sm font-medium">{user?.full_name || '未设置姓名'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>

              {/* Name field */}
              <div className="space-y-2">
                <label className="text-sm font-medium">姓名</label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="输入您的姓名"
                />
              </div>

              {/* Email (readonly) */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Mail className="h-3.5 w-3.5 text-gray-400" />
                  邮箱
                </label>
                <Input
                  value={user?.email || ''}
                  disabled
                  className="opacity-60"
                />
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={saving || fullName === user?.full_name}
                className="gap-2"
              >
                {saved ? (
                  <>
                    <Check className="h-4 w-4" />
                    已保存
                  </>
                ) : saving ? (
                  '保存中...'
                ) : (
                  '保存更改'
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Subscription section */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Crown className="h-4 w-4 text-purple-400" />
                订阅方案
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      {tierLabels[user?.subscription_tier || 'free']}
                    </p>
                    <Badge
                      variant={user?.subscription_status === 'active' ? 'success' : 'secondary'}
                    >
                      {user?.subscription_status === 'active' ? '已激活' : '未激活'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {user?.subscription_tier === 'free'
                      ? '升级到专业版以获取更多对话次数和高级功能'
                      : '感谢您的订阅支持'}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  {user?.subscription_tier === 'free' ? '升级' : '管理'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security section */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4 text-emerald-400" />
                安全设置
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                    <Lock className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">修改密码</p>
                    <p className="text-xs text-gray-500">通过邮箱接收密码重置链接</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleChangePassword}>
                  修改
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Preferences section */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="h-4 w-4 text-orange-400" />
                偏好设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Theme toggle */}
              <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  {darkMode ? (
                    <Moon className="h-5 w-5 text-blue-400" />
                  ) : (
                    <Sun className="h-5 w-5 text-yellow-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium">主题</p>
                    <p className="text-xs text-gray-500">
                      {darkMode ? '深色模式' : '浅色模式'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setDarkMode(!darkMode);
                    document.documentElement.classList.toggle('dark', !darkMode);
                  }}
                  className={cn(
                    'relative h-7 w-12 rounded-full transition-colors',
                    darkMode ? 'bg-blue-500' : 'bg-gray-600'
                  )}
                >
                  <div
                    className={cn(
                      'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform',
                      darkMode ? 'translate-x-5' : 'translate-x-0.5'
                    )}
                  />
                </button>
              </div>

              {/* Language selector */}
              <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <Languages className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-sm font-medium">语言</p>
                    <p className="text-xs text-gray-500">界面显示语言</p>
                  </div>
                </div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-gray-900">
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Danger zone */}
        <motion.div variants={item}>
          <Card className="border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-red-400">
                <AlertTriangle className="h-4 w-4" />
                危险操作
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-xl bg-red-500/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                    <Trash2 className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-400">删除账户</p>
                    <p className="text-xs text-gray-500">
                      此操作不可撤销，将永久删除您的所有数据
                    </p>
                  </div>
                </div>
                {showDeleteConfirm ? (
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteAccount}
                    >
                      确认删除
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      取消
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    删除
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
