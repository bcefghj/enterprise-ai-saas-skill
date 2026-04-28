'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, User, Sparkles, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  const supabase = createClient();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      setError('密码长度至少为 6 位');
      return;
    }

    if (!agreedToTerms) {
      setError('请先同意服务条款');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-emerald-500/20 blur-[120px]" />
          <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-blue-500/20 blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-md text-center"
        >
          <div className="glass-card rounded-2xl p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10"
            >
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            </motion.div>
            <h2 className="text-xl font-bold">注册成功！</h2>
            <p className="mt-3 text-sm text-gray-400">
              我们已向 <span className="font-medium text-gray-200">{email}</span> 发送了一封确认邮件。
              <br />
              请查收邮箱并点击链接完成验证。
            </p>
            <Link href="/login">
              <Button variant="outline" className="mt-6">
                返回登录
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-purple-500/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-blue-500/20 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-400"
          >
            <Sparkles className="h-4 w-4" />
            WorkBuddy AI
          </motion.div>
          <h1 className="text-2xl font-bold tracking-tight">创建账户</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            开始您的 AI 之旅
          </p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="姓名"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="pl-10"
              />
            </div>

            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="email"
                placeholder="邮箱地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10"
              />
            </div>

            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="密码（至少 6 位）"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="确认密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className={cn(
                  'pl-10',
                  confirmPassword && password !== confirmPassword && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                )}
              />
            </div>

            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-red-400">两次输入的密码不一致</p>
            )}

            {/* Terms */}
            <label className="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors hover:bg-white/5">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-600 bg-transparent text-blue-500 focus:ring-blue-500/20"
              />
              <span className="text-sm text-gray-400">
                我已阅读并同意{' '}
                <Link href="/terms" className="text-blue-400 hover:text-blue-300">
                  服务条款
                </Link>{' '}
                和{' '}
                <Link href="/privacy" className="text-blue-400 hover:text-blue-300">
                  隐私政策
                </Link>
              </span>
            </label>

            <Button
              type="submit"
              disabled={loading || !agreedToTerms}
              className="h-11 w-full"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                />
              ) : (
                '注 册'
              )}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          已有账户？{' '}
          <Link href="/login" className="font-medium text-blue-400 transition-colors hover:text-blue-300">
            立即登录
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
