# B 站视频脚本：一句话生成企业级 AI SaaS 平台 | WorkBuddy x EdgeOne 参赛作品

> 预计时长：6-7 分钟
> 风格：技术向 + 演示向，节奏紧凑不拖沓

---

## 0:00 - 0:30 | 开场 Hook

**画面**：Claude Code 源码泄露的新闻截图 → 快速滚动代码 → 停在 Permission Pipeline 的核心代码上

**文案**：

> 2025 年，Claude Code 50 万行源码泄露。
>
> 所有人都在讨论它的 system prompt 有多强，但我关注到了一个被忽略的东西——它的权限管道。
>
> 6 层拦截、逐层收紧、任何一层失效不会导致全面沦陷。
>
> 我把这套安全理念，做成了一个 AI Skill——一句话就能生成一个企业级 AI SaaS 平台。
>
> 今天带你看看，从触发到上线，全过程。

---

## 0:30 - 1:15 | 比赛介绍 + 我做了什么

**画面**：比赛官网页面 → 奖品展示 → Skill 赛道介绍 → 切到我的 SKILL.md 文件

**文案**：

> 这是 WorkBuddy 和腾讯 EdgeOne 联合举办的 AI Prompts + Skills 挑战赛。
>
> Skills 赛道的任务是：做一个 Skill，让 AI 能一句话生成一个带登录、支付、AI 对话的全栈网站。
>
> 冠军有 2 万 Credit 加上 4.56 万的 EdgeOne 套餐。
>
> 我做的是 enterprise-ai-saas-skill，和官方的基础版不同，我的版本加入了完整的 5 层安全防护，借鉴了 Claude Code 的权限模型。
>
> 我们直接来看演示。

---

## 1:15 - 2:30 | 触发 Skill → 生成网站

**画面**：屏幕录制 WorkBuddy 界面

1. 打开 WorkBuddy
2. 在输入框里打字：「帮我搭一个 AI SaaS 平台」
3. AI 开始响应，显示 Spec 确认界面（JSON 格式的项目配置）
4. 用户确认，AI 开始执行 Step 3 — Project Scaffold
5. 终端窗口快速滚动（安装依赖、创建目录结构）
6. AI 依次执行 Auth → Database → Payment → AI → Admin → UI polish
7. 最终 `npm run build` 成功，零错误

**文案**：

> 我在 WorkBuddy 里输入一句话：「帮我搭一个 AI SaaS 平台」
>
> Skill 会先问我要不要自定义配置——产品名称、配色、功能模块、安全等级。我选默认规格：深蓝主题、中英双语、企业级安全。
>
> 确认之后，AI 开始自动生成代码。先搭脚手架，安装 Next.js、Tailwind、shadcn/ui 这些依赖。
>
> 然后按顺序实现六大模块——认证系统、数据库、支付集成、AI 对话、管理后台、UI 设计系统。
>
> 整个过程大概几分钟。Build 通过，零错误。

---

## 2:30 - 3:30 | 网站功能展示：首页 → AI 对话

**画面**：打开本地 localhost:3000，展示生成的网站

1. Landing Page（Hero + Features + Pricing + Testimonials）
2. 点击 Pricing 页面，展示 Free / Pro / Enterprise 三档
3. 注册账号，进入 Dashboard
4. 点击 Chat，展示 AI 对话界面
5. 输入一个 prompt，展示流式输出打字机效果
6. AI 回复完成，展示对话历史

**文案**：

> 我们来看生成出来的网站。
>
> 首页是标准的 SaaS Landing Page——Hero 区、功能展示、定价方案、客户评价、CTA。深色主题加 Glass-morphism，观感还挺高级的。
>
> 定价页面直接对接 Stripe，三档订阅方案，点击就能跳转到 Stripe Checkout 真实支付页面。
>
> 注册登录走的是 Supabase Auth，支持邮箱注册和 OAuth。
>
> 进入 Dashboard 之后，重点看这个 AI 对话——用的是 MiniMax M2.7 模型，通过 EdgeOne AI Gateway 接入，支持 SSE 流式输出。你看这个打字机效果，非常流畅。

---

## 3:30 - 4:15 | 管理后台展示

**画面**：

1. 切换到 Admin 账号
2. 展示 Admin Dashboard——KPI 卡片（用户数、MRR、API 调用量）
3. 用户管理表格——可以查看角色、订阅状态、封禁用户
4. 数据分析页面——折线图、饼图
5. 系统设置页面

**文案**：

> 管理后台也是自动生成的。
>
> Admin Dashboard 有 KPI 概览——总用户数、月收入、API 调用量，都是实时数据。
>
> 用户管理可以看到每个用户的角色、订阅等级和状态，Admin 可以直接封禁用户。
>
> 注意这里的权限控制——普通用户访问 /admin 会被 403，因为 Edge Function 层就已经拦截了，请求根本到不了后端。
>
> 这就是我要说的重点——安全架构。

---

## 4:15 - 5:30 | 安全架构解析（核心卖点）

**画面**：切到架构图（提前制作好的图或动画）

1. 展示 5 层架构流程图
2. 每一层逐个高亮，配合解释
3. 展示关键代码片段（Rate Limiter、JWT Verify、Zod Validation、Stripe Webhook、RLS Policy）

**文案**：

> 这个 Skill 最核心的设计就是 5 层纵深防御，直接借鉴 Claude Code 的权限管道模型。
>
> 第一层，Edge Entry——请求到达边缘节点的第一件事就是查速率限制。用 EdgeOne KV 实现滑动窗口计数器，三维限流：按 IP、按端点、按用户。超限直接 429，请求不会到达后端。
>
> 第二层，Auth——还是在 Edge Function 里完成 JWT 校验。验证签名、检查过期、提取角色，然后通过 X-User 头传递给下游。注意：客户端传来的同名头会被覆盖，没法伪造身份。
>
> 第三层，Input Validation——进入 Cloud Function 之后，所有输入都要过 Zod schema。字符串经过 XSS 消毒，错误响应不泄露内部细节。
>
> 第四层，Business Security——Stripe Webhook 用签名验证防伪造，用 KV 幂等键防重复处理，CSRF 用 Double-Submit Cookie 加 timingSafeEqual 防时序攻击。
>
> 第五层，Data Security——Supabase 的 RLS 策略确保用户只能访问自己的数据，所有 mutation 自动记录审计日志。
>
> 这 5 层是相互独立的。**即使某一层被突破，后面的层依然能防守。** 这就是纵深防御的精髓。

---

## 5:30 - 6:15 | 部署上线

**画面**：

1. 执行部署命令
2. 展示 EdgeOne Pages 控制台的部署记录
3. 打开线上链接，验证所有功能正常
4. 手机端访问，展示响应式布局

**文案**：

> 本地验证没问题之后，一行命令部署到 EdgeOne Pages。
>
> Edge Functions 部署到 CDN 节点，Cloud Functions 部署到源站，KV 全球复制，静态资源走 CDN 缓存。
>
> 打开线上链接——首页正常、登录正常、AI 对话正常、支付跳转正常、Admin 后台需要权限才能访问。
>
> 手机端也测一下——响应式布局没问题，底部导航替代了侧边栏。
>
> 从一句话到上线，完成。

---

## 6:15 - 6:50 | 总结 + CTA

**画面**：回到 SKILL.md 的全貌 → 比赛信息 → GitHub 链接

**文案**：

> 做完这个 Skill 我最大的感受是——安全不是一个 feature，它是 architecture。它应该从第一天就设计进系统里，而不是最后加几个 if 判断。
>
> Claude Code 的源码泄露是个意外，但它给了我们一个难得的机会去学习顶级团队是怎么做安全架构的。我只是把这些理念移植到了 EdgeOne Pages 上。
>
> 这个 Skill 完全开源，安装方式：npx skills add enterprise-ai-saas-skill
>
> 链接放在评论区，感兴趣的一键三连！如果你也想参加比赛，报名链接也在评论区，5 月 15 号截止，赶紧上车。

---

## 视频封面文案建议

**主标题**：一句话生成企业级 AI SaaS！
**副标题**：从 Claude Code 源码学安全架构 | WorkBuddy x EdgeOne 参赛作品
**封面画面**：深色主题的网站截图 + 终端代码滚动 + 「一句话 → 全栈 SaaS」的箭头

---

## 评论区置顶信息

```
【源码地址】GitHub: TODO
【在线演示】TODO
【比赛报名】https://wj.qq.com/s2/26428515/1743/
【Skill 安装】npx skills add enterprise-ai-saas-skill
【比赛截止】2026年5月15日

有任何问题欢迎评论区留言，我会逐一回复！
```
