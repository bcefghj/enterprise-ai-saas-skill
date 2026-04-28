# Authentication & Authorization System

Enterprise AI SaaS 的完整认证与授权体系，基于 **Supabase Auth + JWT + RBAC**，部署于 EdgeOne Pages。

---

## 1. Architecture Overview

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Browser     │────▶│  Edge Function   │────▶│  Supabase Auth  │
│  (React App) │◀────│  (JWT Verify)    │◀────│  (User Mgmt)    │
└─────────────┘     └──────────────────┘     └─────────────────┘
       │                     │
       │  httpOnly Cookie    │  RBAC Check
       │  (refresh token)    │  (profiles table)
       ▼                     ▼
┌─────────────┐     ┌──────────────────┐
│  Auth Context│     │  PostgreSQL RLS  │
│  Provider    │     │  (Row Security)  │
└─────────────┘     └──────────────────┘
```

**核心设计原则：**

- **Supabase Auth** 统一管理用户身份，支持 email/password 和 OAuth（Google、GitHub）
- **JWT 令牌** 在 Edge Function 层验证，实现零延迟认证（无需回源）
- **RBAC 三级角色**：`free_user` / `pro_user` / `admin`
- **Refresh Token Rotation**：每次刷新后旧 token 立即失效，防止令牌窃取

---

## 2. Supabase Client Setup

### 2.1 环境变量

```typescript
// .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...    // server-only
SUPABASE_JWT_SECRET=your-jwt-secret                    // Edge verification
```

### 2.2 Server-Side Client — `src/lib/supabase/server.ts`

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createSupabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}
```

### 2.3 Client-Side Client — `src/lib/supabase/client.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### 2.4 Middleware Session Refresh — `src/middleware.ts`

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // 未登录用户访问受保护路由时重定向到登录页
  const protectedPaths = ['/dashboard', '/api/ai', '/settings'];
  const isProtected = protectedPaths.some((p) => request.nextUrl.pathname.startsWith(p));

  if (!user && isProtected) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};
```

---

## 3. Auth Pages

### 3.1 Login Page — `src/app/login/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const supabase = createSupabaseBrowser();

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push(redirect);
  }

  async function handleOAuth(provider: 'google' | 'github') {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
      },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-6 p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center">登录</h1>

        <div className="space-y-3">
          <button onClick={() => handleOAuth('google')} className="w-full btn-oauth">
            Continue with Google
          </button>
          <button onClick={() => handleOAuth('github')} className="w-full btn-oauth">
            Continue with GitHub
          </button>
        </div>

        <div className="relative"><span className="divider-text">or</span></div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)} required className="input-field" />
          <input type="password" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)} required className="input-field" />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button type="submit" disabled={loading} className="w-full btn-primary">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          <a href="/forgot-password" className="text-blue-600 hover:underline">忘记密码？</a>
          {' · '}
          <a href="/register" className="text-blue-600 hover:underline">注册账号</a>
        </p>
      </div>
    </div>
  );
}
```

### 3.2 Register Page — `src/app/register/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/client';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createSupabaseBrowser();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) { setError(error.message); return; }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">确认邮件已发送至 <strong>{email}</strong>，请查收。</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleRegister} className="w-full max-w-md space-y-4 p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center">创建账号</h1>
        <input type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required className="input-field" />
        <input type="password" placeholder="Password (min 8 chars)" value={password}
          onChange={(e) => setPassword(e.target.value)} minLength={8} required className="input-field" />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="w-full btn-primary">注册</button>
      </form>
    </div>
  );
}
```

### 3.3 Password Reset — `src/app/forgot-password/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createSupabaseBrowser();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });
    setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {sent ? (
        <p>重置链接已发送至 <strong>{email}</strong></p>
      ) : (
        <form onSubmit={handleReset} className="w-full max-w-md space-y-4 p-8 bg-white rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-center">重置密码</h1>
          <input type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)} required className="input-field" />
          <button type="submit" className="w-full btn-primary">发送重置链接</button>
        </form>
      )}
    </div>
  );
}
```

### 3.4 Auth Callback — `src/app/auth/callback/route.ts`

```typescript
import { createSupabaseServer } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const redirect = searchParams.get('redirect') || '/dashboard';
  const type = searchParams.get('type');

  if (code) {
    const supabase = await createSupabaseServer();
    await supabase.auth.exchangeCodeForSession(code);
  }

  if (type === 'recovery') {
    return NextResponse.redirect(new URL('/reset-password', request.url));
  }

  return NextResponse.redirect(new URL(redirect, request.url));
}
```

---

## 4. RBAC Implementation

### 4.1 Profiles Table (Supabase SQL)

```sql
CREATE TYPE user_role AS ENUM ('free_user', 'pro_user', 'admin');

CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  role        user_role NOT NULL DEFAULT 'free_user',
  quota_used  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 新用户注册时自动创建 profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'free_user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS: 用户只能读取自己的 profile，admin 可读全部
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins read all profiles"
  ON profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

### 4.2 `useUser` Hook — `src/hooks/useUser.ts`

```typescript
import { useEffect, useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

type UserRole = 'free_user' | 'pro_user' | 'admin';

interface UserProfile {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
}

export function useUser(): UserProfile {
  const [profile, setProfile] = useState<UserProfile>({
    user: null, role: null, loading: true,
  });

  useEffect(() => {
    const supabase = createSupabaseBrowser();

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProfile({ user: null, role: null, loading: false });
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      setProfile({ user, role: data?.role ?? 'free_user', loading: false });
    }

    load();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => subscription.unsubscribe();
  }, []);

  return profile;
}
```

### 4.3 Role-Checking Middleware (Edge Function)

```typescript
// src/lib/auth/checkRole.ts
import { createSupabaseServer } from '@/lib/supabase/server';

type UserRole = 'free_user' | 'pro_user' | 'admin';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  free_user: 0,
  pro_user: 1,
  admin: 2,
};

export async function checkRole(requiredRole: UserRole): Promise<{
  authorized: boolean;
  userId: string | null;
  role: UserRole | null;
}> {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { authorized: false, userId: null, role: null };

  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const userRole = (data?.role as UserRole) ?? 'free_user';
  const authorized = ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];

  return { authorized, userId: user.id, role: userRole };
}
```

### 4.4 Protected Route Wrapper — `src/components/ProtectedRoute.tsx`

```typescript
'use client';

import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

type UserRole = 'free_user' | 'pro_user' | 'admin';

interface Props {
  children: ReactNode;
  requiredRole?: UserRole;
}

export function ProtectedRoute({ children, requiredRole = 'free_user' }: Props) {
  const { user, role, loading } = useUser();
  const router = useRouter();

  const ROLE_HIERARCHY: Record<UserRole, number> = {
    free_user: 0, pro_user: 1, admin: 2,
  };

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/login'); return; }
    if (role && ROLE_HIERARCHY[role] < ROLE_HIERARCHY[requiredRole]) {
      router.push('/unauthorized');
    }
  }, [user, role, loading]);

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return null;

  return <>{children}</>;
}
```

---

## 5. Edge Function JWT Verification

```typescript
// middleware.ts — Edge-level auth check (EdgeOne Pages compatible)
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET!);

interface JWTPayload {
  sub: string;
  role: string;
  exp: number;
}

export async function verifyEdgeAuth(request: Request): Promise<JWTPayload | null> {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    });
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// API route 中使用
export async function handleProtectedAPI(request: Request) {
  const payload = await verifyEdgeAuth(request);
  if (!payload) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // payload.sub = user id, payload.role = user role
  return new Response(JSON.stringify({ userId: payload.sub, role: payload.role }));
}
```

---

## 6. Auth Context Provider — `src/providers/AuthProvider.tsx`

```typescript
'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

type UserRole = 'free_user' | 'pro_user' | 'admin';

interface AuthState {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null, session: null, role: null, loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createSupabaseBrowser();

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setRole(data?.role ?? 'free_user');
      }
      setLoading(false);
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const { data } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          setRole(data?.role ?? 'free_user');
        } else {
          setRole(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
  }

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

---

## 7. Session Management

Cookie 配置策略（在 Supabase SSR client 中自动处理）：

| 属性       | 值             | 说明                         |
|-----------|----------------|------------------------------|
| httpOnly  | `true`         | JS 无法读取，防 XSS          |
| secure    | `true`         | 仅 HTTPS 传输                |
| sameSite  | `lax`          | 防 CSRF，允许顶级导航携带     |
| path      | `/`            | 全站生效                     |
| maxAge    | `60 * 60 * 24 * 7` | 7 天刷新周期             |

**Refresh Token Rotation 流程：**

```
1. 用户登录 → 获得 access_token (15min) + refresh_token
2. access_token 过期 → middleware 自动用 refresh_token 换新
3. Supabase 返回新的 access_token + 新的 refresh_token
4. 旧 refresh_token 立即失效（Rotation）
5. 新 token 写入 httpOnly cookie
```

如果检测到已失效的 refresh_token 被再次使用（令牌重放攻击），Supabase 会自动撤销该用户的所有 session。
