# Step 3 — Project Scaffold (From Scratch)

> This skill generates all project files directly instead of using `npx degit`.
> After completing this step you should have a buildable Next.js 14 + Supabase + Stripe skeleton.

---

## 1. Project Initialization

```bash
mkdir <project-name> && cd <project-name>
npm init -y
```

## 2. Install Dependencies

```bash
npm install next@^14.2.0 react@^18.3.0 react-dom@^18.3.0 \
  @supabase/supabase-js@^2.45.0 @supabase/ssr@^0.5.0 \
  stripe@^16.0.0 zod@^3.23.0 motion@^11.0.0 \
  lucide-react@^0.400.0 class-variance-authority@^0.7.0 \
  clsx@^2.1.0 tailwind-merge@^2.5.0 \
  recharts@^2.12.0 date-fns@^3.6.0 \
  react-markdown@^9.0.0 react-syntax-highlighter@^15.5.0

npm install -D typescript@^5.5.0 @types/react@^18.3.0 @types/node@^20.14.0 \
  tailwindcss@^3.4.0 postcss@^8.4.0 autoprefixer@^10.4.0 \
  @tailwindcss/typography@^0.5.0
```

Add scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

## 3. Configuration Files

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### next.config.js

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: "2mb" },
  },
};

module.exports = nextConfig;
```

### tailwind.config.ts

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("tailwindcss-animate")],
};

export default config;
```

### postcss.config.js

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### edgeone.json

```json
{
  "name": "<project-name>",
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "environmentVariables": {
    "NODE_ENV": "production"
  }
}
```

### .gitignore

```gitignore
# dependencies
node_modules/
.pnp
.pnp.js

# next.js
.next/
out/

# production
build/
standalone/

# env
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# edgeone
.edgeone/

# misc
.DS_Store
*.pem
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# typescript
*.tsbuildinfo
next-env.d.ts

# vercel (if any)
.vercel
```

### .env.example

```bash
# ── Supabase ──────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# ── Stripe ────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# ── App ───────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# ── AI Provider (pick one or more) ───────────────────
OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...

# ── EdgeOne (production only) ─────────────────────────
# EDGEONE_API_TOKEN=<token>
```

## 4. shadcn/ui Setup

### 4a. Initialize shadcn/ui

Create `components.json` at the project root:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### 4b. Create the utility function

Write `src/lib/utils.ts`:

```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 4c. Install key components

```bash
npx shadcn-ui@latest add button card input dialog \
  dropdown-menu tabs toast avatar badge separator \
  skeleton table chart
```

> If running non-interactively, append `--yes` to accept defaults.

### 4d. Global CSS with dark-theme defaults

Write `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 240 5.9% 10%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 240 5.9% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 240 4.9% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

## 5. Directory Creation

```bash
mkdir -p \
  src/app/\(marketing\) \
  src/app/\(auth\)/login \
  src/app/\(auth\)/signup \
  src/app/\(auth\)/callback \
  src/app/\(dashboard\)/dashboard \
  src/app/\(dashboard\)/dashboard/settings \
  src/app/\(dashboard\)/dashboard/billing \
  src/app/\(dashboard\)/dashboard/chat \
  src/app/api/stripe/webhook \
  src/app/api/ai \
  src/components/ui \
  src/components/layout \
  src/components/marketing \
  src/components/dashboard \
  src/components/chat \
  src/lib/supabase \
  src/lib/stripe \
  src/lib/ai \
  src/lib/hooks \
  src/lib/validators \
  src/types \
  supabase/migrations
```

## 6. Minimal Placeholder Files

Create `src/app/layout.tsx` so the build succeeds:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI SaaS",
  description: "Enterprise AI SaaS Starter",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

Create `src/app/page.tsx`:

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-4xl font-bold">AI SaaS</h1>
    </main>
  );
}
```

## 7. Verification

```bash
# Type-check & build — should exit 0 with only the placeholder pages
npm run build

# Quick dev smoke-test
npm run dev
# Visit http://localhost:3000 — you should see "AI SaaS" centered on a dark page.
```

If `npm run build` succeeds, the scaffold is ready for Step 4 (Supabase schema & auth).
