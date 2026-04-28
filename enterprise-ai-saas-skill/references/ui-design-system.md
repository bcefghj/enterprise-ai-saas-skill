# UI Design System

Enterprise AI SaaS 的完整 UI 设计系统，基于 **Next.js + Tailwind CSS + shadcn/ui + Motion (Framer Motion)**。

---

## 1. Theme System (CSS Variables)

在 `globals.css` 中定义 CSS 变量。Agent 应根据 `Spec.primaryColorHSL` 和 `Spec.accentColorHSL` 替换下方 `--primary` / `--accent` 的值。

```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222 47% 11%;
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;
    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;
    --primary: 221 83% 53%;          /* ← Spec.primaryColorHSL */
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222 47% 11%;
    --accent: 262 83% 58%;           /* ← Spec.accentColorHSL */
    --accent-foreground: 210 40% 98%;
    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 210 40% 98%;
    --border: 214 32% 91%;
    --input: 214 32% 91%;
    --ring: 221 83% 53%;
    --radius: 0.5rem;
    --chart-1: 221 83% 53%;
    --chart-2: 262 83% 58%;
    --chart-3: 142 71% 45%;
    --chart-4: 38 92% 50%;
    --chart-5: 0 84% 60%;
  }

  .dark {
    --background: 222 47% 4%;
    --foreground: 210 40% 98%;
    --card: 222 47% 7%;
    --card-foreground: 210 40% 98%;
    --popover: 222 47% 7%;
    --popover-foreground: 210 40% 98%;
    --primary: 217 91% 60%;          /* ← Spec.primaryColorHSL (dark) */
    --primary-foreground: 222 47% 6%;
    --secondary: 217 33% 17%;
    --secondary-foreground: 210 40% 98%;
    --accent: 262 83% 68%;           /* ← Spec.accentColorHSL (dark) */
    --accent-foreground: 222 47% 6%;
    --muted: 217 33% 17%;
    --muted-foreground: 215 20% 65%;
    --destructive: 0 63% 51%;
    --destructive-foreground: 210 40% 98%;
    --border: 217 33% 17%;
    --input: 217 33% 17%;
    --ring: 217 91% 60%;
    --chart-1: 217 91% 60%;
    --chart-2: 262 83% 68%;
    --chart-3: 142 71% 55%;
    --chart-4: 38 92% 60%;
    --chart-5: 0 84% 65%;
  }
}
```

在 `tailwind.config.ts` 中映射这些变量：

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
};
export default config;
```

---

## 2. Typography

**字体加载** (Next.js `layout.tsx`)：

```tsx
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
```

**字号规范表**：

| Token      | Tailwind Class | Size   | 用途                        |
|------------|----------------|--------|-----------------------------|
| xs         | `text-xs`      | 12px   | 辅助标签、时间戳            |
| sm         | `text-sm`      | 14px   | 表格内容、次级信息          |
| base       | `text-base`    | 16px   | 正文段落                    |
| lg         | `text-lg`      | 18px   | 卡片标题                    |
| xl         | `text-xl`      | 20px   | Section 标题                |
| 2xl        | `text-2xl`     | 24px   | 页面副标题                  |
| 3xl        | `text-3xl`     | 30px   | 页面主标题                  |
| 4xl        | `text-4xl`     | 36px   | Hero 标题                   |
| 5xl        | `text-5xl`     | 48px   | Landing 大标题              |

**标题样式**：

```tsx
<h1 className="text-4xl font-bold tracking-tight text-foreground">
  Dashboard
</h1>
<h2 className="text-2xl font-semibold text-foreground">Overview</h2>
<h3 className="text-lg font-medium text-foreground">Recent Activity</h3>
```

**正文 & 辅助文字**：

```tsx
<p className="text-base leading-7 text-muted-foreground">
  Your AI assistant processed 1,240 queries this month.
</p>
<span className="text-xs text-muted-foreground">Last updated 2 min ago</span>
```

**代码样式**：

```tsx
<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
  npm install @ai-sdk/openai
</code>
```

---

## 3. Glass-morphism Component Styles

在 `globals.css` 的 `@layer components` 中定义：

```css
@layer components {
  .glass-card {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(12px) saturate(120%);
    -webkit-backdrop-filter: blur(12px) saturate(120%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: var(--radius);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.06),
      0 8px 32px rgba(0, 0, 0, 0.2);
  }

  .glass-card-light {
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(12px) saturate(120%);
    -webkit-backdrop-filter: blur(12px) saturate(120%);
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: var(--radius);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.8),
      0 4px 24px rgba(0, 0, 0, 0.06);
  }

  .glass-navbar {
    background: rgba(255, 255, 255, 0.02);
    backdrop-filter: blur(16px) saturate(140%);
    -webkit-backdrop-filter: blur(16px) saturate(140%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }
}
```

React 组件中使用：

```tsx
function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("glass-card rounded-lg p-6", className)}>
      {children}
    </div>
  );
}
```

---

## 4. Animation Patterns (Motion)

所有动画使用 `motion` (Framer Motion v11+ 导出) 。

### Page Transitions

```tsx
"use client";
import { motion } from "motion/react";

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
```

### Staggered List

```tsx
const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

function StaggeredList({ items }: { items: string[] }) {
  return (
    <motion.ul variants={container} initial="hidden" animate="show">
      {items.map((text) => (
        <motion.li key={text} variants={item} className="py-2">
          {text}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

### Scroll Reveal

```tsx
"use client";
import { motion, useInView } from "motion/react";
import { useRef } from "react";

function ScrollReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
```

### Button Feedback

```tsx
<motion.button
  whileTap={{ scale: 0.95 }}
  whileHover={{ scale: 1.02 }}
  transition={{ type: "tween", duration: 0.15 }}
  className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
>
  Get Started
</motion.button>
```

### AI Typing Effect

```tsx
"use client";
import { useState, useEffect } from "react";

function TypingEffect({ text, speed = 20 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5" />
    </span>
  );
}
```

### Forbidden Animations

禁止在产品中使用以下动画模式：
- `type: "spring"` 搭配 `stiffness > 300`（弹跳感过强）
- `type: "spring", bounce: > 0.3`
- `animate={{ rotate: 360 }}` 配合 `repeat: Infinity`（无限旋转，除 loading spinner 外）
- 视差滚动（parallax）—— 增加认知负担且移动端性能差

---

## 5. Key Component Patterns

### Navbar

```tsx
"use client";
import { motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="glass-navbar fixed inset-x-0 top-0 z-50 h-16">
      <nav className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
        <a href="/" className="text-lg font-semibold text-foreground">Logo</a>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          <a href="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          <Button size="sm">Get Started</Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card mx-4 mt-2 flex flex-col gap-3 p-4 md:hidden"
        >
          <a href="/features" className="text-sm">Features</a>
          <a href="/pricing" className="text-sm">Pricing</a>
          <Button size="sm" className="w-full">Get Started</Button>
        </motion.div>
      )}
    </header>
  );
}
```

### Sidebar (Collapsible)

```tsx
"use client";
import { motion } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { LayoutDashboard, MessageSquare, Settings, ChevronsLeft } from "lucide-react";

const links = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: MessageSquare, label: "Chat", href: "/chat" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex h-screen flex-col border-r border-border bg-card"
    >
      <div className="flex h-16 items-center justify-end px-3">
        <button onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
          <ChevronsLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2">
        {links.map(({ icon: Icon, label, href }) => (
          <a
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </a>
        ))}
      </nav>
    </motion.aside>
  );
}
```

### Chat Interface (Streaming)

```tsx
function ChatBubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
        role === "user"
          ? "ml-auto bg-primary text-primary-foreground"
          : "mr-auto glass-card text-foreground"
      )}
    >
      {content}
    </motion.div>
  );
}

function StreamingIndicator() {
  return (
    <div className="mr-auto flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}
```

### Stats Card

```tsx
import { TrendingUp } from "lucide-react";

function StatsCard({ title, value, trend, sparklineData }: {
  title: string; value: string; trend: string; sparklineData: number[];
}) {
  const max = Math.max(...sparklineData);
  return (
    <div className="glass-card rounded-lg p-5">
      <p className="text-xs text-muted-foreground">{title}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-foreground">{value}</span>
        <span className="flex items-center gap-0.5 text-xs text-emerald-500">
          <TrendingUp className="h-3 w-3" /> {trend}
        </span>
      </div>
      <svg viewBox="0 0 100 24" className="mt-3 h-6 w-full text-primary">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          points={sparklineData.map((v, i) =>
            `${(i / (sparklineData.length - 1)) * 100},${24 - (v / max) * 20}`
          ).join(" ")}
        />
      </svg>
    </div>
  );
}
```

---

## 6. Responsive Strategy

| Breakpoint | Width    | Layout                                       |
|------------|----------|----------------------------------------------|
| `sm`       | ≥ 390px  | 单列布局，底部导航，卡片竖向堆叠             |
| `md`       | ≥ 768px  | 双列网格，Sidebar 折叠为图标，Tab 导航       |
| `lg`       | ≥ 1024px | 完整 Sidebar + 三列网格                      |
| `xl`       | ≥ 1440px | `max-w-[1280px] mx-auto`，内容居中           |

```tsx
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
  <StatsCard title="Queries" value="12,430" trend="+14%" sparklineData={[3,5,4,7,6,8,9]} />
  <StatsCard title="Tokens"  value="2.1M"   trend="+8%"  sparklineData={[2,3,5,4,6,5,7]} />
  <StatsCard title="Users"   value="384"     trend="+22%" sparklineData={[1,2,2,3,4,5,6]} />
</div>
```

移动端底部导航示例：

```tsx
<nav className="fixed inset-x-0 bottom-0 z-50 flex h-14 items-center justify-around border-t border-border bg-card md:hidden">
  <NavIcon icon={LayoutDashboard} label="Home" href="/" />
  <NavIcon icon={MessageSquare} label="Chat" href="/chat" />
  <NavIcon icon={Settings} label="Settings" href="/settings" />
</nav>
```

---

## 7. Accessibility

**对比度**：所有前景/背景组合满足 WCAG AA (≥ 4.5:1) 。`--muted-foreground` 在暗色主题下不低于 `hsl(215 20% 65%)` 以保证可读性。

**Focus 状态**：

```css
@layer base {
  *:focus-visible {
    outline: 2px solid hsl(var(--ring));
    outline-offset: 2px;
    border-radius: var(--radius);
  }
}
```

**Icon-only 按钮必须携带 `aria-label`**：

```tsx
<button aria-label="Close dialog" className="p-2 hover:bg-muted rounded-md">
  <X className="h-4 w-4" />
</button>
```

**键盘导航**：
- 所有交互元素可通过 `Tab` 聚焦
- 下拉菜单 / 对话框使用 `radix-ui` 原生键盘支持（shadcn/ui 内置）
- `Escape` 关闭弹窗 / 弹出层
- `Enter` / `Space` 激活按钮与链接

**屏幕阅读器**：
- 动态内容区域标记 `aria-live="polite"`
- 加载状态使用 `aria-busy="true"`
- 表单错误绑定 `aria-describedby`

---

## 8. Dark / Light Toggle

使用 `next-themes` 实现主题切换：

```bash
npm install next-themes
```

Provider 包裹（`layout.tsx`）：

```tsx
import { ThemeProvider } from "next-themes";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

Toggle 组件：

```tsx
"use client";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
```
