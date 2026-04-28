"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { cn } from "@/lib/utils";
import {
  Bot,
  Shield,
  Zap,
  Users,
  BarChart3,
  Globe,
  ArrowRight,
  Sparkles,
  Play,
  MessageSquare,
  Settings,
  Rocket,
  CheckCircle2,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

function AnimatedSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.section>
  );
}

const features = [
  {
    icon: Bot,
    title: "智能 AI 对话",
    description:
      "基于 MiniMax 大模型，支持多轮上下文对话、Markdown 渲染和流式响应，为您的团队提供真正智能的对话体验。",
  },
  {
    icon: Shield,
    title: "企业级安全",
    description:
      "端到端加密传输，基于 Supabase RLS 的行级权限控制，所有操作全链路审计日志，满足最严格的合规要求。",
  },
  {
    icon: Zap,
    title: "极速部署",
    description:
      "通过 EdgeOne Pages 实现全球 CDN 边缘部署，冷启动低于 50ms，让您的应用在全球任何角落都闪电般响应。",
  },
  {
    icon: Users,
    title: "团队协作",
    description:
      "内置角色权限系统（管理员/成员/访客），团队共享对话历史和 AI 知识库，让协作更高效。",
  },
  {
    icon: BarChart3,
    title: "数据分析仪表盘",
    description:
      "实时监控 AI 使用量、用户活跃度和系统性能指标，可视化图表助您做出数据驱动的业务决策。",
  },
  {
    icon: Globe,
    title: "全球化架构",
    description:
      "支持中英双语界面，Stripe 国际化支付，EdgeOne 全球加速网络，帮助您的 AI 应用走向世界。",
  },
];

const steps = [
  {
    icon: MessageSquare,
    step: "01",
    title: "创建账户",
    description: "一键注册，30 秒内完成账户创建和团队初始化，立即获得 10 次免费 AI 对话额度。",
  },
  {
    icon: Settings,
    step: "02",
    title: "配置 AI 助手",
    description: "选择 AI 模型参数、设定系统提示词、定制对话风格，打造专属于您业务场景的 AI 助手。",
  },
  {
    icon: Rocket,
    step: "03",
    title: "规模化使用",
    description: "升级到 Pro 或 Enterprise 方案，解锁无限对话、管理仪表盘和高级 API 集成能力。",
  },
];

const stats = [
  { value: "10,000+", label: "活跃用户" },
  { value: "99.9%", label: "服务可用性" },
  { value: "5M+", label: "AI 对话消息" },
  { value: "4.9/5", label: "用户评分" },
];

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* ===== Hero ===== */}
      <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden px-4">
        {/* Animated gradient background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-accent/15 blur-[120px]" />
          <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-primary/10 blur-[100px]" />
        </div>

        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            面向企业的下一代 AI 平台
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            <span className="gradient-text">企业级 AI 助手平台</span>
            <br />
            <span className="mt-2 block text-foreground">释放团队全部潜力</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
          >
            集成 MiniMax 大模型、Stripe 订阅计费和 EdgeOne 全球加速，
            为您的团队提供安全、可靠、高性能的 AI 对话解决方案。
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/register"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
            >
              免费开始使用
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#features"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border/60 bg-background/50 px-8 text-base font-semibold text-foreground backdrop-blur-sm transition-colors hover:bg-muted"
            >
              <Play className="h-4 w-4" />
              观看演示
            </Link>
          </motion.div>

          {/* Hero floating mockup */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mx-auto mt-16 max-w-4xl"
          >
            <div className="glass-card overflow-hidden rounded-2xl p-1">
              <div className="rounded-xl bg-card/80 p-6">
                <div className="flex items-center gap-2 border-b border-border/40 pb-4">
                  <div className="h-3 w-3 rounded-full bg-destructive/60" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                  <div className="h-3 w-3 rounded-full bg-success/60" />
                  <span className="ml-3 text-sm text-muted-foreground">AiFlow 控制台</span>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm bg-muted/60 px-4 py-2.5 text-sm text-foreground">
                      帮我分析一下上季度的用户增长数据，并生成一份报告摘要。
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm bg-primary/10 px-4 py-2.5 text-sm text-foreground">
                      根据数据分析，上季度用户增长率为 23.5%，新增活跃用户 2,847 人。其中自然流量贡献了 62% 的新增用户，
                      付费转化率提升至 8.3%。建议下一步重点优化注册漏斗中的邮箱验证环节...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== Features Grid ===== */}
      <AnimatedSection
        className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8"
      >
        <motion.div variants={fadeUp} className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            核心能力
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            为企业量身打造的 AI 基础设施
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            从智能对话到数据分析，从安全合规到全球部署——一站式满足企业 AI 应用的全部需求。
          </p>
        </motion.div>

        <div id="features" className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              className="glass-card group rounded-2xl p-6 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      {/* ===== How It Works ===== */}
      <AnimatedSection className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <motion.div variants={fadeUp} className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            快速上手
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            三步开启 AI 之旅
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            从注册到上线，极简流程让您的团队在几分钟内拥有专属 AI 助手。
          </p>
        </motion.div>

        <div className="relative mt-16 grid gap-8 md:grid-cols-3">
          {/* Connecting line */}
          <div className="absolute left-0 right-0 top-16 hidden h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent md:block" />

          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              variants={fadeUp}
              className="relative flex flex-col items-center text-center"
            >
              <div className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <step.icon className="h-7 w-7 text-primary" />
                <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-lg">
                  {step.step}
                </span>
              </div>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      {/* ===== Social Proof / Stats ===== */}
      <AnimatedSection className="border-y border-border/40 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                className="flex flex-col items-center text-center"
              >
                <span className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {stat.value}
                </span>
                <span className="mt-1 text-sm text-muted-foreground">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ===== CTA Section ===== */}
      <section className="relative overflow-hidden py-24">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-primary/15 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-accent/10 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
          >
            <motion.h2
              variants={fadeUp}
              className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
            >
              准备好让 AI 为您的
              <span className="gradient-text"> 企业赋能</span> 了吗？
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
            >
              立即注册，获得 10 次免费 AI 对话额度。无需信用卡，零风险体验企业级 AI 的强大能力。
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link
                href="/register"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
              >
                免费注册
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border/60 bg-background/50 px-8 text-base font-semibold text-foreground backdrop-blur-sm transition-colors hover:bg-muted"
              >
                查看定价方案
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
