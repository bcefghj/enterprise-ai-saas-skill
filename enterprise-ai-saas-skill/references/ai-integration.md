# MiniMax M2.7 AI Integration via EdgeOne AI Gateway

Enterprise AI SaaS integration: MiniMax M2.7 through EdgeOne AI Gateway on EdgeOne Pages.

---

## 1. EdgeOne AI Gateway Overview

**Gateway URL**: `https://ai-gateway-intl.eo-edgefunctions7.com`

| Header               | Value                          |
| -------------------- | ------------------------------ |
| `OE-Key`             | EdgeOne gateway key            |
| `OE-Gateway-Name`    | Gateway instance name          |
| `OE-AI-Provider`     | `minimax`                      |
| `OE-Gateway-Version` | `2`                            |
| `Authorization`      | `Bearer <MINIMAX_API_KEY>`     |
| `Content-Type`       | `application/json`             |

**Benefits**: built-in rate limiting, response caching, request logging, model switching (change provider header to swap models with zero code changes).

---

## 2. Chat API Implementation

```typescript
// cloud-functions/api/ai/chat.ts
import { verifyJWT } from "../../lib/auth";
import { checkAndDeductQuota } from "../../lib/quota";
import { createSSEStream } from "../../lib/stream";

const GATEWAY_URL = "https://ai-gateway-intl.eo-edgefunctions7.com/v1/chat/completions";

const gatewayHeaders = () => ({
  "OE-Key": process.env.EDGEONE_AI_GATEWAY_KEY!,
  "OE-Gateway-Name": process.env.EDGEONE_GATEWAY_NAME!,
  "OE-AI-Provider": "minimax",
  "OE-Gateway-Version": "2",
  Authorization: `Bearer ${process.env.MINIMAX_API_KEY!}`,
  "Content-Type": "application/json",
});

export async function POST(req: Request) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return new Response("Unauthorized", { status: 401 });

  const user = await verifyJWT(token);
  if (!user) return new Response("Invalid token", { status: 401 });

  const hasQuota = await checkAndDeductQuota(user.id, user.plan);
  if (!hasQuota) {
    return Response.json({ error: "Daily quota exceeded" }, { status: 429 });
  }

  const { messages, conversationId } = await req.json();

  const upstreamRes = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: gatewayHeaders(),
    body: JSON.stringify({
      model: "minimax-m2.7",
      messages,
      stream: true,
      max_tokens: 2048,
      temperature: 0.7,
    }),
  });

  if (!upstreamRes.ok) {
    const s = upstreamRes.status;
    if (s === 429) return Response.json({ error: "Rate limited" }, { status: 429 });
    return Response.json({ error: "AI service unavailable" }, { status: 502 });
  }

  return new Response(createSSEStream(upstreamRes.body!, user.id, conversationId), {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
}
```

---

## 3. Streaming Implementation

### Server — SSE Stream Transform

```typescript
// cloud-functions/lib/stream.ts
import { saveMessage } from "./conversations";
import { logUsage } from "./analytics";

export function createSSEStream(
  upstream: ReadableStream<Uint8Array>,
  userId: string,
  conversationId: string,
): ReadableStream {
  let fullContent = "";
  return new ReadableStream({
    async start(controller) {
      const reader = upstream.getReader();
      const decoder = new TextDecoder();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const lines = decoder.decode(value, { stream: true }).split("\n");
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") {
              controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
              continue;
            }
            try {
              const token = JSON.parse(data).choices?.[0]?.delta?.content ?? "";
              fullContent += token;
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ token })}\n\n`));
            } catch { /* skip malformed chunks */ }
          }
        }
      } catch {
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`));
      } finally {
        await saveMessage(conversationId, "assistant", fullContent);
        await logUsage(userId, fullContent.length);
        controller.close();
      }
    },
  });
}
```

### Client — Fetch + ReadableStream Reader

```typescript
// src/lib/chat-client.ts
export async function streamChat(
  messages: ChatMessage[],
  onToken: (t: string) => void,
  onDone: () => void,
  onError: (e: Error) => void,
) {
  const ac = new AbortController();
  const timeout = setTimeout(() => ac.abort(), 60_000);
  try {
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getAccessToken()}` },
      body: JSON.stringify({ messages }),
      signal: ac.signal,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? `Request failed (${res.status})`);
    }
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const line of decoder.decode(value, { stream: true }).split("\n")) {
        if (!line.startsWith("data: ")) continue;
        const payload = line.slice(6);
        if (payload === "[DONE]") { onDone(); return; }
        const p = JSON.parse(payload);
        if (p.error) throw new Error(p.error);
        if (p.token) onToken(p.token);
      }
    }
    onDone();
  } catch (err: any) {
    onError(err.name === "AbortError" ? new Error("Request timed out") : err);
  } finally { clearTimeout(timeout); }
}
```

---

## 4. Usage Quota System

| Plan       | Daily Chats |
| ---------- | ----------- |
| Free       | 10          |
| Pro        | 500         |
| Enterprise | Unlimited   |

```sql
create table usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  date date not null default current_date,
  chat_count int not null default 0,
  unique(user_id, date)
);
```

```typescript
// cloud-functions/lib/quota.ts
import { kv } from "../kv";
import { supabase } from "../supabase";

const LIMITS: Record<string, number> = { free: 10, pro: 500, enterprise: Infinity };

export async function checkAndDeductQuota(userId: string, plan: string): Promise<boolean> {
  const limit = LIMITS[plan] ?? LIMITS.free;
  if (limit === Infinity) return true;

  const key = `quota:${userId}:${new Date().toISOString().slice(0, 10)}`;
  let used = await kv.get<number>(key);

  if (used === null) {
    const { data } = await supabase
      .from("usage").select("chat_count")
      .eq("user_id", userId).eq("date", new Date().toISOString().slice(0, 10)).single();
    used = data?.chat_count ?? 0;
  }
  if (used >= limit) return false;

  const next = used + 1;
  await kv.set(key, next, { ex: 86400 });
  await supabase.from("usage").upsert(
    { user_id: userId, date: new Date().toISOString().slice(0, 10), chat_count: next },
    { onConflict: "user_id,date" },
  );
  return true;
}
```

---

## 5. Chat UI Component

```tsx
// src/components/ChatPanel.tsx
import { useState, useRef, useEffect } from "react";
import { streamChat } from "../lib/chat-client";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface Message { role: "user" | "assistant"; content: string }

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || streaming) return;
    setError(null);
    const userMsg: Message = { role: "user", content: input.trim() };
    const updated = [...messages, userMsg];
    setMessages([...updated, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    await streamChat(
      updated,
      (token) => setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { ...copy[copy.length - 1], content: copy[copy.length - 1].content + token };
        return copy;
      }),
      () => setStreaming(false),
      (err) => { setError(err.message); setStreaming(false); },
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
              msg.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800"
            }`}>
              {msg.role === "assistant" ? <MarkdownRenderer content={msg.content} /> : <p className="whitespace-pre-wrap">{msg.content}</p>}
            </div>
          </div>
        ))}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <div ref={bottom} />
      </div>
      <div className="border-t p-4 flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Type a message..." disabled={streaming}
          className="flex-1 rounded-xl border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button onClick={send} disabled={streaming || !input.trim()}
          className="rounded-xl bg-blue-600 px-6 py-2 text-white font-medium disabled:opacity-50">
          {streaming ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
```

---

## 6. Conversation History

```sql
create table conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  title text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  created_at timestamptz default now()
);
```

```typescript
// cloud-functions/lib/conversations.ts
import { supabase } from "../supabase";

const MAX_CONTEXT = 20;

export async function getConversationContext(conversationId: string) {
  const { data } = await supabase.from("messages").select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false }).limit(MAX_CONTEXT);
  return (data ?? []).reverse();
}

export async function saveMessage(conversationId: string, role: string, content: string) {
  await supabase.from("messages").insert({ conversation_id: conversationId, role, content });
  await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);
}
```

---

## 7. Error Handling

```typescript
// cloud-functions/lib/retry.ts
export async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3, baseDelay = 1000): Promise<T> {
  let lastErr: Error | undefined;
  for (let i = 0; i < maxAttempts; i++) {
    try { return await fn(); } catch (err: any) {
      lastErr = err;
      if (err.status === 429 || err.status === 503) {
        await new Promise((r) => setTimeout(r, baseDelay * 2 ** i + Math.random() * 500));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}
```

| Scenario       | Action                                                       |
| -------------- | ------------------------------------------------------------ |
| Model timeout  | Retry up to 3× with exponential backoff (1 s → 2 s → 4 s)  |
| Rate limited   | Show "Please wait a moment" message                          |
| API error 5xx  | Generic "AI service unavailable" — never leak internals      |
| Network error  | Offline indicator + auto-retry on reconnect                  |

```typescript
// src/lib/error-messages.ts
export function friendlyError(err: Error): string {
  const m = err.message.toLowerCase();
  if (m.includes("quota"))   return "You've used all your chats today. Upgrade for more!";
  if (m.includes("rate"))    return "Too many requests — please wait a moment.";
  if (m.includes("timeout")) return "The AI is taking too long. Please try again.";
  if (m.includes("network")) return "Network error — check your connection.";
  return "Something went wrong. Please try again later.";
}
```

---

## 8. Environment Variables

```bash
MINIMAX_API_KEY=your-minimax-api-key
EDGEONE_AI_GATEWAY_KEY=your-edgeone-gateway-key
EDGEONE_GATEWAY_NAME=your-gateway-instance-name
```

```typescript
// cloud-functions/env.ts
export const env = {
  minimaxApiKey:     process.env.MINIMAX_API_KEY!,
  edgeoneGatewayKey: process.env.EDGEONE_AI_GATEWAY_KEY!,
  edgeoneGatewayName: process.env.EDGEONE_GATEWAY_NAME!,
} as const;
```

> **Security**: Never commit real keys. Store them in EdgeOne Pages environment settings (encrypted at rest).
