'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Settings,
  Cpu,
  ShieldCheck,
  Wrench,
  Save,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SystemConfig {
  systemName: string;
  tagline: string;
  modelName: string;
  maxTokens: number;
  temperature: number;
  rateLimitPerMinute: number;
  rateLimitPerDay: number;
  maintenanceMode: boolean;
}

const DEFAULT_CONFIG: SystemConfig = {
  systemName: 'AiFlow',
  tagline: 'Enterprise AI Assistant Platform',
  modelName: 'MiniMax-M2.7',
  maxTokens: 2048,
  temperature: 0.7,
  rateLimitPerMinute: 30,
  rateLimitPerDay: 500,
  maintenanceMode: false,
};

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="mt-0.5 rounded-lg bg-blue-500/10 p-2">
        <Icon className="h-5 w-5 text-blue-400" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof SystemConfig>(key: K, value: SystemConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl space-y-8"
    >
      <div>
        <h2 className="text-2xl font-bold">系统设置</h2>
        <p className="mt-1 text-sm text-gray-400">管理平台全局配置</p>
      </div>

      {/* General */}
      <div className="glass-card rounded-xl p-6">
        <SectionHeader
          icon={Settings}
          title="通用设置"
          description="系统名称和基本信息"
        />
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              系统名称
            </label>
            <input
              type="text"
              value={config.systemName}
              onChange={(e) => update('systemName', e.target.value)}
              className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              标语
            </label>
            <input
              type="text"
              value={config.tagline}
              onChange={(e) => update('tagline', e.target.value)}
              className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </div>

      {/* AI Configuration */}
      <div className="glass-card rounded-xl p-6">
        <SectionHeader
          icon={Cpu}
          title="AI 配置"
          description="模型参数和生成策略"
        />
        <div className="space-y-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              模型名称
            </label>
            <input
              type="text"
              value={config.modelName}
              onChange={(e) => update('modelName', e.target.value)}
              className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">最大 Token 数</label>
              <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-mono text-gray-300">
                {config.maxTokens}
              </span>
            </div>
            <input
              type="range"
              min={256}
              max={8192}
              step={256}
              value={config.maxTokens}
              onChange={(e) => update('maxTokens', Number(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>256</span>
              <span>8192</span>
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">Temperature</label>
              <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-mono text-gray-300">
                {config.temperature.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={2}
              step={0.05}
              value={config.temperature}
              onChange={(e) => update('temperature', Number(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>0 (精确)</span>
              <span>2 (创造性)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="glass-card rounded-xl p-6">
        <SectionHeader
          icon={ShieldCheck}
          title="安全设置"
          description="速率限制与访问控制"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              每分钟请求上限
            </label>
            <input
              type="number"
              value={config.rateLimitPerMinute}
              onChange={(e) => update('rateLimitPerMinute', Number(e.target.value))}
              className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              每日请求上限
            </label>
            <input
              type="number"
              value={config.rateLimitPerDay}
              onChange={(e) => update('rateLimitPerDay', Number(e.target.value))}
              className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </div>

      {/* Maintenance */}
      <div className="glass-card rounded-xl p-6">
        <SectionHeader
          icon={Wrench}
          title="维护模式"
          description="开启后将对普通用户显示维护页面"
        />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">
              维护模式{' '}
              <span
                className={cn(
                  'ml-2 rounded-full px-2 py-0.5 text-xs font-semibold',
                  config.maintenanceMode
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-emerald-500/20 text-emerald-400'
                )}
              >
                {config.maintenanceMode ? '已开启' : '已关闭'}
              </span>
            </p>
          </div>
          <button
            onClick={() => update('maintenanceMode', !config.maintenanceMode)}
            className={cn(
              'relative h-6 w-11 rounded-full transition-colors',
              config.maintenanceMode ? 'bg-amber-500' : 'bg-gray-600'
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform',
                config.maintenanceMode && 'translate-x-5'
              )}
            />
          </button>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className={cn(
            'flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-all',
            saved
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-md shadow-blue-500/25 hover:from-blue-700 hover:to-blue-600',
            saving && 'opacity-70'
          )}
        >
          {saving ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              保存中…
            </>
          ) : saved ? (
            <>
              <Check className="h-4 w-4" />
              已保存
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              保存设置
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
