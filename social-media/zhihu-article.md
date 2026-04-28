# AI SaaS 平台的安全架构该怎么做？从 Claude Code 到 EdgeOne Pages 的实践

> 本文基于我在 WorkBuddy x EdgeOne AI Skills 挑战赛中构建 enterprise-ai-saas-skill 的实践经验，探讨 AI SaaS 平台的安全架构设计。

---

## 引言：AI SaaS 的安全困境

当我们谈论"用 AI 构建 SaaS"的时候，大多数讨论集中在如何接入大模型、如何实现流式输出、如何设计好看的 Chat UI。

很少有人认真讨论安全。

但现实是：**一个面向用户的 AI SaaS 平台，面临的安全威胁比传统 Web 应用更复杂。** 因为它不仅有传统的认证、授权、支付安全需求，还多了 AI 特有的攻击面——Prompt Injection、Token 盗刷、滥用 API 配额等。

我最近在做一个 AI SaaS 生成 Skill（一句话生成完整的 AI SaaS 平台），在设计安全架构时，研究了 Claude Code 泄露源码中的权限模型，并尝试将其核心理念映射到 EdgeOne Pages 的全栈架构上。

这篇文章不是教程，是一次思考记录。欢迎讨论。

---

## 一、从 Claude Code 学到了什么？

2025 年 Claude Code 源码泄露时，技术社区关注的焦点主要是 system prompt 和工具调用机制。但在安全架构层面，有一个设计尤其值得学习：

**6 阶段权限流水线（Permission Pipeline）**——每一个工具调用都要经过 声明 → 分析 → 校验 → 确认 → 审计 → 执行 6 道关卡。

这个设计有几个关键特征：

1. **每层独立判定**——不存在"前面验过了，后面就信任"的情况
2. **最小权限原则**——每层只暴露当前操作所需的最小信息
3. **审计与执行分离**——记录发生在执行之前，确保即使执行失败也有日志

这让我想到了一个经典的安全理念：**纵深防御（Defense in Depth）**。不依赖任何单一安全措施，而是通过多层独立防护确保即使某一层被突破，整体安全性依然存在。

问题是：**这个理念怎么落地到一个部署在 EdgeOne Pages 上的 AI SaaS 平台？**

---

## 二、5 层安全架构设计

我最终设计了 5 层纵深防御，每一层对应 EdgeOne Pages 的一个能力层：

```
请求 → [L1 Edge Entry] → [L2 Auth] → [L3 Input Validation] → [L4 Business Security] → [L5 Data Security] → 响应
         Edge Function      Edge Function    Cloud Function          Cloud Function         Supabase RLS
```

### Layer 1：Edge Entry Protection

**位置**：EdgeOne Edge Functions（V8 Isolate，CDN 边缘节点）

这一层的职责是：在请求到达任何业务逻辑之前，完成"粗粒度过滤"。

核心实现是**基于 EdgeOne KV 的滑动窗口速率限制器**。为什么用 KV 而不是内存？因为 Edge Function 是无状态的 V8 Isolate——实例随时会被回收和重建，内存计数器不可靠。KV 是全局复制的持久化存储，天然适合这个场景。

速率限制采用三维策略：

- **Per-IP**：匿名用户 100 req/min，认证用户 300 req/min
- **Per-Endpoint**：AI 对话 10 req/min，支付端点 5 req/min
- **Per-User**：按订阅等级动态调整

同时在这一层注入所有安全响应头（CSP、HSTS、X-Frame-Options、Permissions-Policy）。

**设计考量**：为什么把 Rate Limiting 放在最前面？因为这是成本最低的过滤操作——一次 KV 读写就能拦截恶意请求，避免其消耗后端的计算资源。DDoS 攻击打的就是"让你的后端处理大量无效请求"，在边缘拦截是最经济的做法。

### Layer 2：Authentication & Authorization

**位置**：EdgeOne Edge Functions

JWT 校验在边缘完成。这里有一个关键设计决策：**用户身份通过 `X-User-*` 请求头注入下游，Cloud Function 不再重复验证 JWT。**

```typescript
const enriched = new Request(request);
enriched.headers.set('X-User-Id', user.sub);
enriched.headers.set('X-User-Role', user.role);
enriched.headers.set('X-Subscription-Tier', user.subscription_tier ?? 'free');
```

有人可能会问：这不是把安全凭据放在了 HTTP 头里吗？客户端能伪造吗？

答案是：**不能。** 因为 Edge Function 会覆盖客户端传入的同名头。Cloud Function 收到的 `X-User-Id` 一定是 Edge Function 设置的，不可能被篡改。

这个模式的好处是：Cloud Function 可以直接信任请求头中的用户信息，不需要引入 JWT 库（Stripe SDK 已经够重了），降低了冷启动时间。

**设计考量**：为什么不在 Cloud Function 里验 JWT？两个原因——（1）Edge Function 的 V8 Isolate 冷启动比 Node.js 快一个数量级，JWT 验证在边缘完成延迟更低；（2）不合法请求在边缘就被拦截，永远不会消耗 Cloud Function 的执行配额。

### Layer 3：Input Validation

**位置**：EdgeOne Cloud Functions（Node.js）

进入业务逻辑的第一件事是 Zod schema 校验 + XSS 消毒。

```typescript
export const chatInputSchema = z.object({
  message: z
    .string()
    .min(1, 'Message is required')
    .max(4000, 'Message exceeds 4000 characters')
    .transform(sanitizeXSS),
  conversationId: z.string().uuid().optional(),
  temperature: z.number().min(0).max(2).default(0.7),
});
```

这里有一个原则：**错误响应绝不泄露内部细节。** 400 错误返回具体的字段校验失败信息（帮助前端定位问题），但 500 错误统一返回 `Internal server error`，不暴露堆栈跟踪、不暴露依赖版本、不暴露数据库结构。

**对 AI SaaS 的特殊考量**：Prompt Injection 的防御不在这一层（因为大模型的 prompt 注入本质上是语义问题，不是语法问题）。但这一层可以做的是——限制 prompt 长度、过滤 HTML 标签、拒绝异常编码。这些"硬过滤"虽然不能完全防止 prompt injection，但可以大幅缩小攻击面。

### Layer 4：Business Security

**位置**：EdgeOne Cloud Functions

这一层保护的是业务逻辑的完整性，核心是支付安全：

**Stripe Webhook 签名验证**——永远用原始请求体字符串验证签名，不要先 parse 再 stringify。这是我踩过的真实的坑。

**幂等保护**——用 EdgeOne KV 存储已处理的 `event.id`，TTL 24 小时。Stripe 明确说明 Webhook 可能重复投递，没有幂等保护就会出现重复激活订阅、重复发通知等问题。

**CSRF 防护**——对状态修改操作采用 Double-Submit Cookie 模式，token 比对用 `timingSafeEqual` 防止时序攻击（攻击者通过测量比对时间来逐字节猜测 token）。

**设计考量**：为什么把幂等 KV 的 TTL 设为 24 小时而不是更长？因为 Stripe 的重试窗口通常在几小时内。TTL 太长会浪费 KV 存储空间，太短会漏掉重试事件。24 小时是实践中的平衡点。

### Layer 5：Data Security

**位置**：Supabase（PostgreSQL RLS + 审计日志）

这是最后一道防线。它的设计假设是：**即使应用层代码存在漏洞，数据库层仍然能阻止越权访问。**

```sql
CREATE POLICY "users_own_conversations"
  ON conversations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

Supabase 的 RLS 策略在数据库引擎层面执行，不是在应用层模拟。这意味着即使 Cloud Function 的代码有 SQL 注入漏洞（虽然用了参数化查询理论上不会有），RLS 仍然确保用户 A 无法访问用户 B 的数据。

审计日志用 PostgreSQL 触发器实现——所有 INSERT/UPDATE/DELETE 操作自动记录到 `audit_log` 表。这不仅是安全需求，也是合规需求。

```sql
CREATE OR REPLACE FUNCTION log_mutation() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (table_name, record_id, action, old_data, new_data)
  VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 三、几个值得讨论的问题

### 问题 1：KV 的最终一致性会影响 Rate Limiting 的准确性吗？

**会。** EdgeOne KV 是最终一致性的，写后立即读可能拿到旧值。在高并发下，滑动窗口计数器可能允许少量超限请求。

但 Rate Limiting 本身就是"尽力而为"的防护机制——它的目标是防止大规模滥用，不是精确计量。需要精确计量的场景（如 API 使用配额），我放在了 Layer 4 用 PostgreSQL 事务保证。

**这是一个有意的 trade-off**：用"大概准确"的边缘限流换取"零额外延迟"的性能优势。

### 问题 2：Edge Function 和 Cloud Function 之间的信任边界该怎么定义？

我的模型是：

- **Edge → Cloud**：半信任关系。Edge Function 设置的 `X-User-*` 头可以被 Cloud Function 信任（因为 Edge Function 是我们控制的代码），但 Cloud Function 仍然做输入校验（Layer 3）和业务安全检查（Layer 4）
- **Cloud → Storage**：信任但验证。Cloud Function 通过 Supabase 的 authenticated client 查询，RLS 策略作为兜底

这个信任模型和 Claude Code 的 Permission Pipeline 有相似之处——每层"信任但验证"上一层的输出。

### 问题 3：这套架构对 AI 特有的安全威胁有效吗？

**部分有效。** 具体来说：

- **Token 盗刷**：Layer 1 的速率限制 + Layer 4 的配额系统可以有效防止
- **API Key 泄露**：所有密钥只在 Cloud Function 环境变量中，Edge Function 和客户端无法访问
- **Prompt Injection**：Layer 3 的输入校验可以过滤明显的注入尝试（如 HTML 标签、异常长度），但无法防御语义级别的注入。**这仍然是一个开放问题。**

我个人的观点是：Prompt Injection 的防御不应该在网络安全层解决，而应该在 AI 应用层解决（如 system prompt 设计、输出过滤、function calling 权限控制等）。网络安全层能做的是缩小攻击面。

### 问题 4：这套架构的成本如何？

**几乎为零。** 所有安全逻辑都运行在 EdgeOne Pages 已有的基础设施上：

- Edge Functions：免费额度内
- KV Storage：按使用量计费，安全相关的 key 都有 TTL，不会无限增长
- Cloud Functions：安全检查代码和业务代码运行在同一个函数中，不产生额外调用
- Supabase RLS：数据库引擎自带，零额外成本

这意味着安全不是"有钱才能做"的事。小团队和独立开发者同样可以实现企业级的安全架构，只要设计得当。

---

## 四、总结

做完这个项目，我最大的感受是：**安全不是 feature，是 architecture。**

太多项目把安全当成一个"需求"——产品经理说"加一个登录功能"，开发者就加一个登录页面。然后被攻击了，再补一个 rate limiter。再被攻击，再加 WAF。这种"打补丁"式的安全永远在追赶攻击者。

更好的做法是从系统架构的层面设计安全——就像 Claude Code 那样，把权限检查设计成一个管道，每层独立、逐层收紧。**这样即使你犯了错（每个开发者都会犯错），系统仍然是安全的。**

EdgeOne Pages 的 Edge Functions + Cloud Functions + KV 的组合，天然支持这种分层架构。Edge 做粗粒度过滤，Cloud 做细粒度校验，KV 做状态共享，Supabase 做最终兜底。每一层都有清晰的职责边界。

如果你也在做 AI SaaS，希望这篇文章能给你一些启发。

---

## 参考资料

1. Claude Code 源码中的 Permission Pipeline 设计
2. OWASP Top 10 for LLM Applications
3. EdgeOne Pages 官方文档 — Edge Functions & KV Storage
4. Stripe Webhook 安全最佳实践
5. Supabase RLS 文档

---

*项目源码：TODO（GitHub 链接）*
*在线演示：TODO（EdgeOne Pages 链接）*
*比赛信息：https://pages.edgeone.ai/workbuddy*

---

**欢迎在评论区讨论：你的 AI SaaS 项目是怎么做安全的？有没有被 Prompt Injection 攻击过？**

*标签：AI SaaS、安全架构、Claude Code、EdgeOne Pages、纵深防御、全栈开发*
