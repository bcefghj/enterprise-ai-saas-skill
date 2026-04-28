# Admin Dashboard Implementation

Enterprise AI SaaS admin dashboard on EdgeOne Pages — access control, stats overview, user management, analytics, and system settings.

## 1. Access Control

### Server-Side Middleware

Intercept all `/admin/*` requests and verify the caller holds the `admin` role.

```typescript
// functions/middleware/admin-guard.ts
import { verifySession } from "../lib/auth";

export async function onRequest(context: { request: Request; next: () => Promise<Response> }) {
  const session = await verifySession(context.request);

  if (!session || session.user.role !== "admin") {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  return context.next();
}
```

### Client-Side Route Guard

Redirect non-admin users before any admin page renders.

```tsx
// src/components/AdminGuard.tsx
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading…</div>;
  if (!user || user.role !== "admin") return <Navigate to="/" replace />;

  return <>{children}</>;
}
```

Register in the router:

```tsx
<Route element={<AdminGuard><AdminLayout /></AdminGuard>}>
  <Route path="/admin" element={<DashboardOverview />} />
  <Route path="/admin/users" element={<UserManagement />} />
  <Route path="/admin/analytics" element={<Analytics />} />
  <Route path="/admin/settings" element={<Settings />} />
</Route>
```

## 2. Admin Layout

Sidebar + top bar shell shared by every admin page.

```tsx
// src/layouts/AdminLayout.tsx
import { Outlet, NavLink } from "react-router-dom";
import { LayoutDashboard, Users, BarChart3, Settings } from "lucide-react";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Overview" },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminLayout() {
  return (
    <div className="flex h-screen">
      <aside className="w-64 border-r bg-muted/40 p-4 flex flex-col gap-1">
        <h2 className="mb-6 px-2 text-lg font-semibold">Admin</h2>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/admin"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
```

## 3. Dashboard Overview (`/admin`)

Four KPI cards plus three charts powered by Recharts.

```tsx
// src/pages/admin/DashboardOverview.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
         XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Stats {
  totalUsers: number;
  usersTrend: number;          // percentage change
  activeSubscriptions: Record<string, number>; // { free: 120, pro: 45, enterprise: 12 }
  aiChatsToday: number;
  mrr: number;                 // cents
  dailySignups: { date: string; count: number }[];
  dailyAiUsage: { date: string; count: number }[];
}

const TIER_COLORS = ["#6366f1", "#22c55e", "#f59e0b"];

export default function DashboardOverview() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats);
  }, []);

  if (!stats) return <p>Loading…</p>;

  const subEntries = Object.entries(stats.activeSubscriptions);

  return (
    <div className="space-y-8">
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Users" value={stats.totalUsers} trend={stats.usersTrend} />
        <KpiCard title="Active Subscriptions" value={subEntries.reduce((s, [, v]) => s + v, 0)} />
        <KpiCard title="AI Chats Today" value={stats.aiChatsToday} />
        <KpiCard title="MRR" value={`$${(stats.mrr / 100).toLocaleString()}`} />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard title="Daily Signups">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats.dailySignups}>
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Subscription Distribution">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={subEntries.map(([name, value]) => ({ name, value }))}
                   dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={4}>
                {subEntries.map((_, i) => (
                  <Cell key={i} fill={TIER_COLORS[i % TIER_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="AI Usage (7 days)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.dailyAiUsage}>
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function KpiCard({ title, value, trend }: { title: string; value: string | number; trend?: number }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{title}</CardTitle></CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        {trend !== undefined && (
          <p className={`text-xs ${trend >= 0 ? "text-green-600" : "text-red-600"}`}>
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% vs last period
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">{title}</CardTitle></CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
```

## 4. User Management (`/admin/users`)

Searchable, filterable data table built with shadcn/ui `Table` + TanStack Table.

```tsx
// src/pages/admin/UserManagement.tsx
import { useEffect, useMemo, useState } from "react";
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, flexRender, ColumnDef,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  plan: string;
  joinedAt: string;
  status: "active" | "suspended";
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    fetch("/api/admin/users").then((r) => r.json()).then((d) => setUsers(d.users));
  }, []);

  async function patchUser(id: string, patch: Partial<User>) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }

  const columns = useMemo<ColumnDef<User>[]>(() => [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "role", header: "Role",
      cell: ({ row }) => <Badge variant="outline">{row.original.role}</Badge> },
    { accessorKey: "plan", header: "Plan" },
    { accessorKey: "joinedAt", header: "Joined",
      cell: ({ row }) => new Date(row.original.joinedAt).toLocaleDateString() },
    { accessorKey: "status", header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "active" ? "default" : "destructive"}>
          {row.original.status}
        </Badge>
      ),
    },
    { id: "actions", header: "", cell: ({ row }) => {
        const u = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => patchUser(u.id, { role: u.role === "admin" ? "user" : "admin" })}>
                Toggle Role
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => patchUser(u.id, { status: u.status === "active" ? "suspended" : "active" })}>
                {u.status === "active" ? "Suspend" : "Activate"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], []);

  const table = useReactTable({
    data: users,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      <Input placeholder="Search users…" value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="max-w-sm" />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => <TableHead key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>)}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
      </div>
    </div>
  );
}
```

## 5. Analytics (`/admin/analytics`)

Time-range selector with four chart panels.

```tsx
// src/pages/admin/Analytics.tsx
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type Range = "7d" | "30d" | "90d";

interface AnalyticsData {
  aiUsage: { date: string; count: number }[];
  revenue: { date: string; amount: number }[];
  topUsers: { name: string; chats: number }[];
  errorRate: { date: string; rate: number }[];
}

export default function Analytics() {
  const [range, setRange] = useState<Range>("7d");
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetch(`/api/admin/analytics?range=${range}`).then((r) => r.json()).then(setData);
  }, [range]);

  if (!data) return <p>Loading…</p>;

  return (
    <div className="space-y-6">
      <Select value={range} onValueChange={(v) => setRange(v as Range)}>
        <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">Last 7 days</SelectItem>
          <SelectItem value="30d">Last 30 days</SelectItem>
          <SelectItem value="90d">Last 90 days</SelectItem>
        </SelectContent>
      </Select>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">AI Usage</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.aiUsage}>
                <XAxis dataKey="date" fontSize={12} /><YAxis fontSize={12} /><Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Revenue</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data.revenue}>
                <XAxis dataKey="date" fontSize={12} /><YAxis fontSize={12} /><Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Top Users by Usage</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.topUsers} layout="vertical">
                <XAxis type="number" fontSize={12} /><YAxis dataKey="name" type="category" fontSize={12} width={100} /><Tooltip />
                <Bar dataKey="chats" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Error Rate (%)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data.errorRate}>
                <XAxis dataKey="date" fontSize={12} /><YAxis fontSize={12} /><Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

## 6. Settings (`/admin/settings`)

Form-based settings page with save action.

```tsx
// src/pages/admin/Settings.tsx
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface SystemSettings {
  systemName: string;
  brandColor: string;
  aiModel: string;
  maxTokens: number;
  temperature: number;
  rateLimitPerMinute: number;
  maintenanceMode: boolean;
}

export default function Settings() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => r.json()).then(setSettings);
  }, []);

  async function save() {
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (res.ok) toast.success("Settings saved");
    else toast.error("Failed to save settings");
  }

  if (!settings) return <p>Loading…</p>;

  const update = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) =>
    setSettings((prev) => prev && { ...prev, [key]: value });

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader><CardTitle>Branding</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="System Name">
            <Input value={settings.systemName} onChange={(e) => update("systemName", e.target.value)} />
          </Field>
          <Field label="Brand Color">
            <Input type="color" value={settings.brandColor} onChange={(e) => update("brandColor", e.target.value)} className="h-10 w-20" />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>AI Model</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="Model Name">
            <Input value={settings.aiModel} onChange={(e) => update("aiModel", e.target.value)} />
          </Field>
          <Field label="Max Tokens">
            <Input type="number" value={settings.maxTokens} onChange={(e) => update("maxTokens", Number(e.target.value))} />
          </Field>
          <Field label="Temperature">
            <Input type="number" step={0.1} min={0} max={2} value={settings.temperature} onChange={(e) => update("temperature", Number(e.target.value))} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Rate Limiting & Maintenance</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="Requests per Minute">
            <Input type="number" value={settings.rateLimitPerMinute} onChange={(e) => update("rateLimitPerMinute", Number(e.target.value))} />
          </Field>
          <div className="flex items-center justify-between">
            <Label>Maintenance Mode</Label>
            <Switch checked={settings.maintenanceMode} onCheckedChange={(v) => update("maintenanceMode", v)} />
          </div>
        </CardContent>
      </Card>

      <Button onClick={save}>Save Settings</Button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
```

## 7. API Endpoints (Cloud Functions)

All admin endpoints share a common auth check. Below is the Cloud Functions implementation.

```typescript
// functions/api/admin/stats.ts
import { getD1 } from "../../lib/d1";
import { requireAdmin } from "../../middleware/admin-guard";

export async function onRequestGet(context: { request: Request; env: Env }) {
  const authErr = await requireAdmin(context.request);
  if (authErr) return authErr;

  const db = getD1(context.env);

  const [totalUsers, subscriptions, chatsToday, mrr, dailySignups, dailyAiUsage] = await Promise.all([
    db.prepare("SELECT COUNT(*) as c FROM users").first<{ c: number }>(),
    db.prepare("SELECT plan, COUNT(*) as c FROM subscriptions WHERE status='active' GROUP BY plan").all(),
    db.prepare("SELECT COUNT(*) as c FROM chats WHERE date(created_at)=date('now')").first<{ c: number }>(),
    db.prepare("SELECT SUM(amount) as total FROM subscriptions WHERE status='active'").first<{ total: number }>(),
    db.prepare("SELECT date(created_at) as date, COUNT(*) as count FROM users WHERE created_at > datetime('now','-30 days') GROUP BY date(created_at)").all(),
    db.prepare("SELECT date(created_at) as date, COUNT(*) as count FROM chats WHERE created_at > datetime('now','-7 days') GROUP BY date(created_at)").all(),
  ]);

  return Response.json({
    totalUsers: totalUsers?.c ?? 0,
    usersTrend: 0, // compute from historical data
    activeSubscriptions: Object.fromEntries(subscriptions.results.map((r: any) => [r.plan, r.c])),
    aiChatsToday: chatsToday?.c ?? 0,
    mrr: mrr?.total ?? 0,
    dailySignups: dailySignups.results,
    dailyAiUsage: dailyAiUsage.results,
  });
}
```

```typescript
// functions/api/admin/users.ts
import { getD1 } from "../../lib/d1";
import { requireAdmin } from "../../middleware/admin-guard";

export async function onRequestGet(context: { request: Request; env: Env }) {
  const authErr = await requireAdmin(context.request);
  if (authErr) return authErr;

  const url = new URL(context.request.url);
  const page = Number(url.searchParams.get("page") ?? 1);
  const limit = 20;
  const offset = (page - 1) * limit;

  const db = getD1(context.env);
  const users = await db.prepare("SELECT id,name,email,role,plan,created_at as joinedAt,status FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?")
    .bind(limit, offset).all();

  return Response.json({ users: users.results, page, limit });
}

// PATCH /api/admin/users/:id
export async function onRequestPatch(context: { request: Request; env: Env; params: { id: string } }) {
  const authErr = await requireAdmin(context.request);
  if (authErr) return authErr;

  const { role, status } = await context.request.json<{ role?: string; status?: string }>();
  const db = getD1(context.env);

  if (role) await db.prepare("UPDATE users SET role=? WHERE id=?").bind(role, context.params.id).run();
  if (status) await db.prepare("UPDATE users SET status=? WHERE id=?").bind(status, context.params.id).run();

  return Response.json({ ok: true });
}
```

```typescript
// functions/api/admin/settings.ts
import { getD1 } from "../../lib/d1";
import { requireAdmin } from "../../middleware/admin-guard";

export async function onRequestGet(context: { request: Request; env: Env }) {
  const authErr = await requireAdmin(context.request);
  if (authErr) return authErr;

  const db = getD1(context.env);
  const row = await db.prepare("SELECT * FROM system_settings WHERE id=1").first();
  return Response.json(row);
}

export async function onRequestPut(context: { request: Request; env: Env }) {
  const authErr = await requireAdmin(context.request);
  if (authErr) return authErr;

  const body = await context.request.json<Record<string, unknown>>();
  const db = getD1(context.env);

  await db.prepare(`
    UPDATE system_settings SET
      system_name=?, brand_color=?, ai_model=?, max_tokens=?,
      temperature=?, rate_limit_per_minute=?, maintenance_mode=?
    WHERE id=1
  `).bind(
    body.systemName, body.brandColor, body.aiModel, body.maxTokens,
    body.temperature, body.rateLimitPerMinute, body.maintenanceMode ? 1 : 0,
  ).run();

  return Response.json({ ok: true });
}
```
