"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { cn } from "@/lib/utils";
import { Check, Sparkles, ArrowRight, Minus } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  highlighted: boolean;
  badge?: string;
  features: PlanFeature[];
  cta: string;
  href: string;
}

const plans: Plan[] = [
  {
    name: "Free",
    price: "$0",
    period: "永久免费",
    description: "适合个人用户体验 AI 对话能力，零成本快速上手。",
    highlighted: false,
    features: [
      { text: "每日 10 次 AI 对话", included: true },
      { text: "基础 AI 模型（MiniMax abab6.5）", included: true },
      { text: "Markdown 渲染和代码高亮", included: true },
      { text: "对话历史保存 7 天", included: true },
      { text: "社区支持", included: true },
      { text: "优先响应队列", included: false },
      { text: "团队协作功能", included: false },
      { text: "管理员仪表盘", included: false },
      { text: "API 接入", included: false },
      { text: "审计日志 & SLA 保障", included: false },
    ],
    cta: "免费开始",
    href: "/register",
  },
  {
    name: "Pro",
    price: "$19",
    period: "/月",
    description: "为专业用户和小型团队设计，解锁全部核心功能和优先支持。",
    highlighted: true,
    badge: "最受欢迎",
    features: [
      { text: "每日 500 次 AI 对话", included: true },
      { text: "高级 AI 模型（MiniMax abab7）", included: true },
      { text: "Markdown 渲染和代码高亮", included: true },
      { text: "对话历史永久保存", included: true },
      { text: "优先响应队列", included: true },
      { text: "优先邮件支持", included: true },
      { text: "团队协作（最多 10 人）", included: true },
      { text: "基础数据分析面板", included: true },
      { text: "API 接入", included: false },
      { text: "审计日志 & SLA 保障", included: false },
    ],
    cta: "升级到 Pro",
    href: "/register?plan=pro",
  },
  {
    name: "Enterprise",
    price: "$49",
    period: "/月",
    description: "面向大型组织的完整解决方案，无限制使用 + 专属服务保障。",
    highlighted: false,
    features: [
      { text: "无限 AI 对话", included: true },
      { text: "最新 AI 模型优先体验", included: true },
      { text: "Markdown 渲染和代码高亮", included: true },
      { text: "对话历史永久保存", included: true },
      { text: "最高优先级响应队列", included: true },
      { text: "专属客户成功经理", included: true },
      { text: "无限团队成员", included: true },
      { text: "高级管理员仪表盘", included: true },
      { text: "完整 REST API 接入", included: true },
      { text: "审计日志 & 99.9% SLA 保障", included: true },
    ],
    cta: "联系销售",
    href: "/register?plan=enterprise",
  },
];

const faqs = [
  {
    q: "免费方案有什么限制？",
    a: "免费方案每天可使用 10 次 AI 对话，使用基础 AI 模型，对话历史保存 7 天。足以体验平台核心能力。",
  },
  {
    q: "可以随时升级或降级方案吗？",
    a: "当然可以。您可以随时在账户设置中切换方案。升级立即生效，降级在当前计费周期结束后生效。",
  },
  {
    q: "支持哪些支付方式？",
    a: "我们通过 Stripe 处理支付，支持所有主流信用卡（Visa, Mastercard, AmEx）以及 Apple Pay 和 Google Pay。",
  },
  {
    q: "Enterprise 方案有什么额外服务？",
    a: "Enterprise 方案包含专属客户成功经理、定制化 API 集成支持、99.9% SLA 服务保障、完整审计日志以及优先技术支持。",
  },
];

export default function PricingPage() {
  const faqRef = useRef(null);
  const faqInView = useInView(faqRef, { once: true, margin: "-80px" });

  return (
    <div className="relative overflow-hidden">
      {/* Background blurs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute -right-40 top-60 h-[400px] w-[400px] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      {/* Header */}
      <section className="mx-auto max-w-4xl px-4 pb-8 pt-24 text-center sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div
            variants={fadeUp}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            简单透明的定价
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="text-4xl font-bold tracking-tight sm:text-5xl"
          >
            选择适合您的
            <span className="gradient-text"> 最佳方案</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground"
          >
            从免费试用到企业级部署，灵活的定价满足每个阶段的需求。所有方案均支持 14 天无条件退款。
          </motion.p>
        </motion.div>
      </section>

      {/* Pricing Cards */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid gap-8 lg:grid-cols-3"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={fadeUp}
              className={cn(
                "relative flex flex-col rounded-2xl p-8",
                plan.highlighted
                  ? "gradient-border glass-card scale-[1.02] shadow-2xl shadow-primary/10"
                  : "glass-card"
              )}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/30">
                    <Sparkles className="h-3 w-3" />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <div className="mb-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature.text} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    ) : (
                      <Minus className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
                    )}
                    <span
                      className={cn(
                        "text-sm",
                        feature.included
                          ? "text-foreground"
                          : "text-muted-foreground/50"
                      )}
                    >
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                href={plan.href}
                className={cn(
                  "group inline-flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all",
                  plan.highlighted
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
                    : "border border-border/60 bg-background/50 text-foreground backdrop-blur-sm hover:bg-muted"
                )}
              >
                {plan.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* FAQ */}
      <motion.section
        ref={faqRef}
        initial="hidden"
        animate={faqInView ? "visible" : "hidden"}
        variants={staggerContainer}
        className="mx-auto max-w-3xl px-4 pb-24 sm:px-6 lg:px-8"
      >
        <motion.h2
          variants={fadeUp}
          className="text-center text-2xl font-bold tracking-tight sm:text-3xl"
        >
          常见问题
        </motion.h2>

        <div className="mt-12 space-y-6">
          {faqs.map((faq) => (
            <motion.div
              key={faq.q}
              variants={fadeUp}
              className="glass-card rounded-xl px-6 py-5"
            >
              <h3 className="font-semibold">{faq.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
