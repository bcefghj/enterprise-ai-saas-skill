# Step 1 · 用户意图收集与 Spec 生成

> **阶段目标**：通过三条分支路径，将用户的模糊需求转化为一个结构化的 `Spec` 对象，供后续代码生成阶段消费。

---

## 1. 分支路由

进入 Step 1 后，向用户展示以下选择：

```text
🚀 欢迎使用 WorkBuddy AI SaaS 构建器！

请选择创建方式：
  A) 我已有产品描述 / Prompt（将自动解析为配置）
  B) 没有想法，引导我完成问卷
  C) 使用默认模板（AiFlow — 企业级 AI 助手平台）
```

| 用户选择 | 分支 | 说明 |
|---------|------|------|
| A | Prompt 解析 | 将自由文本映射到 Spec 字段 |
| B | 引导问卷 | 8 道问题，逐步填充 Spec |
| C | 默认模板 | 直接使用预置 Default Spec |

---

## 2. Spec 对象完整定义

```jsonc
{
  "productName":      "AiFlow",                          // PascalCase 产品名
  "productNameKebab": "ai-flow",                         // kebab-case，用于目录 / URL
  "tagline":          "Enterprise AI assistant platform", // 一句话 slogan
  "industry":         "ai-saas",                         // 行业标签（枚举见下方）
  "theme":            "dark",                            // dark | light
  "primaryColorHSL":  "221 83% 53%",                    // HSL 主色
  "accentColorHSL":   "217 91% 60%",                    // HSL 强调色
  "features": {
    "auth":            true,
    "payment":         true,
    "aiChat":          true,
    "adminDashboard":  true,
    "blog":            false,
    "i18n":            true
  },
  "security": {
    "level":           "enterprise",   // basic | enterprise
    "rateLimiting":    true,
    "inputValidation": true,
    "csrfProtection":  true,
    "auditLog":        true
  },
  "ai": {
    "provider":  "minimax",
    "model":     "MiniMax-M2.7",
    "streaming":  true
  },
  "locales":      ["zh-CN", "en-US"],
  "adminEmails":  ["admin@example.com"]
}
```

### 2.1 `industry` 枚举

| 值 | 适用场景 |
|----|---------|
| `ai-saas` | 通用 AI SaaS 平台 |
| `ai-writing` | AI 写作 / 文案工具 |
| `ai-image` | AI 图片生成 / 编辑 |
| `ai-video` | AI 视频生成 / 剪辑 |
| `saas-tool` | 非 AI 类 SaaS 工具 |
| `course` | 在线课程 / 知识付费 |
| `membership` | 会员订阅制产品 |
| `other` | 其他 |

### 2.2 依赖规则（Dependency Rules）

解析或填充 Spec 时 **必须** 执行以下自动修正：

```text
features.payment       = true  ⟹  features.auth = true
features.aiChat        = true  ⟹  features.auth = true
features.adminDashboard = true  ⟹  features.auth = true
security.level         = "enterprise"  ⟹  security.rateLimiting    = true
                                          security.inputValidation = true
                                          security.csrfProtection  = true
                                          security.auditLog        = true
```

在任何分支生成 Spec 后、返回给调用方之前，统一执行一次 `applyDependencyRules(spec)` 修正。

---

## 3. Branch A — Prompt 解析

### 3.1 流程

1. 提示用户输入自由文本：
   ```text
   📝 请描述你的产品（支持中英文，可包含名称、功能、风格偏好等）：
   ```
2. 将用户输入送入 LLM，使用下方 System Prompt 解析为 Spec JSON。
3. 对返回的 JSON 执行依赖规则修正。
4. 将结果展示给用户确认，允许修改后进入 Step 2。

### 3.2 解析用 System Prompt

```text
你是一个 SaaS 产品需求解析器。根据用户描述，输出一个严格符合以下 JSON Schema 的对象。

规则：
- productName 使用 PascalCase，productNameKebab 使用 kebab-case。
- 若用户未提及某字段，使用合理默认值。
- industry 只能取枚举值之一。
- theme 只能取 dark 或 light。
- primaryColorHSL / accentColorHSL 使用 HSL 格式（如 "221 83% 53%"），
  根据用户提到的颜色关键词从颜色映射表中选取。
- features 中缺省值全部为 true，blog 默认 false。
- security.level 若用户提及"企业级"或"enterprise"则为 enterprise，否则 basic。
- ai.provider 默认 minimax，ai.model 默认 MiniMax-M2.7。
- locales 默认 ["zh-CN", "en-US"]。
- 仅输出 JSON，不要附加任何解释。
```

### 3.3 示例

**用户输入**：
> 做一个叫 WriteGenie 的 AI 写作工具，绿色主题，亮色模式，需要支付和博客功能

**解析结果**：
```json
{
  "productName": "WriteGenie",
  "productNameKebab": "write-genie",
  "tagline": "AI-powered writing assistant",
  "industry": "ai-writing",
  "theme": "light",
  "primaryColorHSL": "142 71% 45%",
  "accentColorHSL": "160 84% 39%",
  "features": {
    "auth": true,
    "payment": true,
    "aiChat": true,
    "adminDashboard": true,
    "blog": true,
    "i18n": true
  },
  "security": {
    "level": "basic",
    "rateLimiting": true,
    "inputValidation": true,
    "csrfProtection": false,
    "auditLog": false
  },
  "ai": {
    "provider": "minimax",
    "model": "MiniMax-M2.7",
    "streaming": true
  },
  "locales": ["zh-CN", "en-US"],
  "adminEmails": ["admin@example.com"]
}
```

---

## 4. Branch B — 引导问卷

共 8 道问题，按顺序执行。每题收集一个或多个 Spec 字段。

### Q1 · 产品方向

```text
🎯 你的产品属于哪个方向？
  1. AI SaaS 平台
  2. AI 写作工具
  3. AI 图片生成
  4. AI 视频生成
  5. 通用 SaaS 工具
  6. 在线课程 / 知识付费
  7. 会员订阅制
  8. 其他
```

→ 映射到 `industry`

### Q2 · 产品名称与 Tagline

```text
✏️ 给你的产品起个名字（英文，PascalCase，如 AiFlow）：
   再写一句简短的 slogan：
```

→ 映射到 `productName`、`productNameKebab`（自动转换）、`tagline`

### Q3 · 配色方案

```text
🎨 选择主色调：
  1. 紫色（创意 / AI）
  2. 蓝色（专业 / 企业）
  3. 绿色（成长 / 健康）
  4. 橙色（活力 / 社交）
  5. 红色（热情 / 电商）
  6. 青色（科技 / 数据）
  7. 黑灰（极简 / 高端）

  主题模式：深色(D) / 浅色(L)？
```

→ 映射到 `primaryColorHSL`、`accentColorHSL`、`theme`（使用颜色映射表）

### Q4 · 支付功能

```text
💳 是否需要支付 / 订阅功能？(Y/N)
```

→ 映射到 `features.payment`

### Q5 · AI 能力

```text
🤖 是否需要 AI 对话功能？(Y/N)
   AI 服务商保持默认 MiniMax 还是有其他偏好？
```

→ 映射到 `features.aiChat`、`ai.provider`、`ai.model`

### Q6 · 安全等级

```text
🔒 安全等级：
  1. 基础版（速率限制 + 输入校验）
  2. 企业版（全部安全特性：速率限制、输入校验、CSRF 防护、审计日志）
```

→ 映射到 `security.level` 及其子字段

### Q7 · 管理后台

```text
📊 是否需要管理员后台？(Y/N)
   管理员邮箱（多个用逗号分隔）：
```

→ 映射到 `features.adminDashboard`、`adminEmails`

### Q8 · 国际化

```text
🌐 是否需要多语言支持？(Y/N)
   支持的语言（默认 zh-CN, en-US）：
```

→ 映射到 `features.i18n`、`locales`

### 问卷完成

所有问题回答后：

1. 未被问卷覆盖的字段使用默认值填充。
2. 执行依赖规则修正。
3. 展示完整 Spec 供用户确认。

---

## 5. Branch C — 默认 Spec

直接使用以下预置配置，无需用户输入：

```json
{
  "productName": "AiFlow",
  "productNameKebab": "ai-flow",
  "tagline": "Enterprise AI assistant platform",
  "industry": "ai-saas",
  "theme": "dark",
  "primaryColorHSL": "221 83% 53%",
  "accentColorHSL": "217 91% 60%",
  "features": {
    "auth": true,
    "payment": true,
    "aiChat": true,
    "adminDashboard": true,
    "blog": false,
    "i18n": true
  },
  "security": {
    "level": "enterprise",
    "rateLimiting": true,
    "inputValidation": true,
    "csrfProtection": true,
    "auditLog": true
  },
  "ai": {
    "provider": "minimax",
    "model": "MiniMax-M2.7",
    "streaming": true
  },
  "locales": ["zh-CN", "en-US"],
  "adminEmails": ["admin@example.com"]
}
```

---

## 6. 颜色映射表（Color Mapping）

问卷 Q3 及 Branch A 解析时参考此表：

| 名称 | 关键词 | `primaryColorHSL` | `accentColorHSL` | 适用场景 |
|------|--------|-------------------|-------------------|---------|
| 紫色 | purple, 紫, 创意 | `265 89% 58%` | `280 85% 65%` | AI / 创意 |
| 蓝色 | blue, 蓝, 企业 | `221 83% 53%` | `217 91% 60%` | 企业 / 专业 |
| 绿色 | green, 绿, 成长 | `142 71% 45%` | `160 84% 39%` | 健康 / 成长 |
| 橙色 | orange, 橙, 活力 | `25 95% 53%` | `33 100% 50%` | 社交 / 活力 |
| 红色 | red, 红, 热情 | `0 84% 60%` | `346 77% 50%` | 电商 / 热情 |
| 青色 | teal, cyan, 青 | `174 72% 40%` | `186 78% 42%` | 科技 / 数据 |
| 黑灰 | black, gray, 极简 | `0 0% 15%` | `0 0% 35%` | 极简 / 高端 |

---

## 7. 验证与确认

无论走哪个分支，最终都需要：

1. **Schema 校验** — 确保所有必填字段存在且类型正确。
2. **依赖规则修正** — 再次执行 `applyDependencyRules(spec)`。
3. **用户确认** — 以格式化 JSON 展示 Spec，询问是否修改：

```text
✅ 以下是你的项目配置：

<格式化 JSON>

确认无误请回复「确认」，需要修改请告诉我要改哪些字段。
```

4. 用户确认后，将 `Spec` 传递给 Step 2（项目脚手架生成）。

---

## 8. 错误处理

| 场景 | 处理方式 |
|------|---------|
| Branch A 解析失败（LLM 返回非法 JSON） | 最多重试 2 次；仍失败则降级到 Branch B |
| 问卷中用户输入不合法 | 提示重新输入当前问题 |
| `productName` 含非法字符 | 自动清洗为 PascalCase，`productNameKebab` 同步生成 |
| `adminEmails` 格式错误 | 提示重新输入，仅保留合法邮箱 |
| 用户中途放弃问卷 | 已回答的问题保留，其余使用默认值，执行依赖修正后确认 |
