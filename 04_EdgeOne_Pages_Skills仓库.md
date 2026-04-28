# EdgeOne Pages Skills

**来源链接**: https://github.com/TencentEdgeOne/edgeone-pages-skills

## 仓库概览

官方Agent Skills，用于在[EdgeOne Pages](https://edgeone.ai/products/pages)上开发和部署项目。

- ⭐ 1 stars | 🍴 0 forks

## 安装

```bash
npx skills add TencentEdgeOne/edgeone-pages-skills
```

安装后，AI编程代理会自动检测何时需要开发或部署，并使用正确的skill。

## 使用方法

Skills安装后自动可用。代理会在检测到相关任务时使用它们。

### 部署示例

```
Deploy my project to EdgeOne Pages
```

```
Publish this React app to EdgeOne Pages China site
```

```
Deploy this Next.js project and give me the preview URL
```

### 开发示例

```
Create an API for user registration
```

```
Add WebSocket support to my project
```

```
Write middleware to protect my /api routes with auth
```

```
Set up Edge Functions with KV storage for a page view counter
```

```
Create a Go API with Gin framework
```

```
Build a Python backend with FastAPI
```

## Skills详情

### Skill 1: `edgeone-pages-deploy`

将前端和全栈项目部署到EdgeOne Pages。

**触发词**: "deploy my app", "publish this site", "push this live", "create a preview deployment", "deploy to EdgeOne", "ship to production", "上线", "发布", "发一版", "重新部署"

**功能**:
- 如果不存在则安装EdgeOne CLI (`edgeone`)
- 通过浏览器登录（首选）或API token（无头/CI）进行身份验证
- 支持中国和全球站点
- 自动框架检测和构建部署
- 返回实时预览URL和控制台链接

### Skill 2: `edgeone-pages-dev`

指导在EdgeOne Pages上开发全栈功能。

**触发词**: "create an API", "add a serverless function", "write middleware", "build a full-stack app", "add WebSocket support", "set up edge functions", "use KV storage", "create a Go API", "build a Python backend", "use Flask/FastAPI/Gin on EdgeOne Pages"

**功能**:
- 帮助选择正确的运行时（Edge Functions vs Cloud Functions vs Middleware）
- 提供正确的项目结构和基于文件的路由模式
- 指导Edge Functions开发（KV Storage、Web APIs）
- 指导Cloud Functions开发：
  - **Node.js** — npm, database, Express/Koa, WebSocket
  - **Go** — Gin, Echo, Chi, Fiber, standard net/http
  - **Python** — Flask, FastAPI, Django, Sanic, Handler class
- 指导Middleware开发（请求拦截、身份验证、重定向、A/B测试）
- 涵盖本地开发设置、环境变量和调试

## Skill结构

```
skills/
├── edgeone-pages-deploy/
│   ├── SKILL.md                        # 部署流程、CLI设置、登录、token管理
│   └── references/
│       └── command-reference.md        # CLI命令、环境变量、token管理
└── edgeone-pages-dev/
    ├── SKILL.md                        # 入口点 — 决策树和路由表
    └── references/
        ├── edge-functions.md           # Edge Functions (V8运行时、Web APIs)
        ├── kv-storage.md              # KV Storage设置和API参考
        ├── node-functions.md          # Cloud Functions — Node.js
        ├── go-functions.md            # Cloud Functions — Go
        ├── python-functions.md        # Cloud Functions — Python
        ├── middleware.md              # Middleware (身份验证、重定向、A/B测试)
        ├── recipes.md                 # 项目结构模板和常用配方
        └── troubleshooting.md         # 调试和故障排除指南
```

每个skill都遵循[skill-creator](https://github.com/anthropics/skills)标准：
- `SKILL.md` — YAML前置数据（名称+描述）+ 核心指令
- `references/` — 按需加载的详细参考文档，从`SKILL.md`路由

## 触发词评估

自动化测试套件，验证skill触发精度。使用Claude API作为"skill路由器"进行批量测试查询并计算精确度/召回率/F1分数。

```bash
# 运行完整评估
ANTHROPIC_API_KEY=sk-xxx node eval/run-eval.mjs

# 详细模式 — 打印模型对每个查询的推理
ANTHROPIC_API_KEY=sk-xxx node eval/run-eval.mjs --verbose

# 使用不同模型
ANTHROPIC_API_KEY=sk-xxx node eval/run-eval.mjs --model=claude-opus-4-20250514
```

通过标准：**精确度 ≥ 0.90，召回率 ≥ 0.80，F1 ≥ 0.85**。结果保存到`eval/results.json`。

## 系统要求

- **Node.js** ≥ 16
- **npm**（用于CLI安装）
- EdgeOne Pages账户

[中国站点](https://console.cloud.tencent.com/edgeone/pages) | [全球站点](https://pages.edgeone.ai)

## 许可证

MIT

---

## 相关链接

- [仓库地址](https://github.com/TencentEdgeOne/edgeone-pages-skills)
- [Issues](https://github.com/TencentEdgeOne/edgeone-pages-skills/issues)
- [Pull Requests](https://github.com/TencentEdgeOne/edgeone-pages-skills/pulls)