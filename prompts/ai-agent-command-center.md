Build a single-page AI Agent Command Center dashboard website in English using React + Vite + TypeScript + Tailwind CSS + shadcn/ui.

GOAL
Create a cyberpunk-inspired AI Agent orchestration dashboard for a fictional platform called NexusAI.

The site should feel like the bridge of a deep-space command ship — dark, data-rich, holographic, and quietly powerful:
- deep space black
- neon cyan and electric violet accents
- holographic glass panels
- ambient data-flow animations
- cinematic sci-fi atmosphere with operational precision

Visual DNA: the editorial motion of OrfeoAI, the clean data density of Linear, the cinematic lighting of Blade Runner 2049 control rooms, and the confident minimalism of Hermes Web UI.

This is not a generic admin template, not a SaaS pricing page with dashboards pasted in, and not a tech demo with random charts.

The website must use EdgeOne Pages Edge Functions for all dynamic data.

ASSETS
All visual elements are built with SVG, CSS, and HTML Canvas — no external images.

Particle Grid Background:
- Full-viewport canvas rendering 120–160 small circles (radius 1.5–2.5px) on a subtle grid
- Each particle drifts slowly (0.1–0.3px per frame) with sinusoidal oscillation
- Color: hsla(192, 100%, 65%, 0.15) with occasional brighter pulses to 0.5 opacity
- Connect particles within 120px distance with thin lines at hsla(192, 100%, 65%, 0.06)

Neural Network SVG (viewBox="0 0 800 500"):
- 12–16 circular nodes (24px diameter) with radial gradient fills from hsla(265, 85%, 65%, 0.8) center to transparent edge
- Connections: quadratic Bézier curves, stroke hsla(192, 100%, 65%, 0.2), strokeWidth 1.5
- Animate traveling dots along each path using SVG <animateMotion> with durations staggered 3–7s

Sparkline Charts (per agent card):
- Inline SVG (width 80, height 24), polyline from 12 data points
- Stroke 1.5px, color matches agent status (cyan/amber/red); fill area below at 0.1 opacity

Holographic Logo:
- CSS background-clip: text with gradient: linear-gradient(135deg, hsl(192 100% 65%), hsl(265 85% 65%), hsl(192 100% 65%))
- Animate background-position over 6s infinite for slow prismatic shimmer

Agent Avatars (40×40 SVG each):
- Geometric stroke-only icons (1.5px): hexagons for data agents, circles for monitor agents, diamonds for deploy agents
- Stroke color matches agent status

BRAND RULES
Brand name: NexusAI
Tagline: Orchestrate Intelligence at the Edge（边缘智能编排平台）

Color world:
- deep space black (background foundation)
- neon cyan (primary accent, active states)
- electric violet (secondary accent, highlights)
- muted slate (text, borders, inactive elements)
- signal green (success / healthy status)
- amber warning (idle / degraded status)
- crimson alert (error / critical status)

Typography voice:
- Headlines: sharp, futuristic, high-contrast, uppercase monospace
- Body: clean, legible, technical but not cold
- Data: monospaced with tabular numerals, aligned and scannable

Avoid:
- bright white backgrounds or pastel color schemes
- rounded bubbly UI elements or cartoon mascots
- generic dashboard templates with colored sidebar navigation
- Material Design elevation shadows
- any visual that feels like a corporate SaaS admin panel

TECH STACK
- React 18+
- Vite 5+
- TypeScript (strict mode)
- Tailwind CSS 3.4+
- shadcn/ui
- lucide-react
- motion / framer-motion
- tailwindcss-animate
- recharts (for the Mission Control performance chart)

FONTS
Use Google Fonts:
- JetBrains Mono (400, 500, 700) for headings, data values, and terminal text
- Inter (300, 400, 500, 600) for body text and UI labels

Tailwind font families:
- heading: ["JetBrains Mono", "monospace"]
- body: ["Inter", "sans-serif"]
- mono: ["JetBrains Mono", "monospace"]

CSS VARIABLES
Define in src/index.css:

:root {
  --background: 225 30% 5%;
  --foreground: 210 15% 88%;
  --primary: 192 100% 65%;
  --primary-foreground: 225 30% 5%;
  --secondary: 265 85% 65%;
  --secondary-foreground: 225 30% 5%;
  --muted: 220 15% 18%;
  --muted-foreground: 215 12% 55%;
  --card: 225 25% 8%;
  --card-foreground: 210 15% 88%;
  --border: 215 20% 22%;
  --accent: 192 100% 65%;
  --destructive: 0 72% 55%;
  --warning: 38 92% 55%;
  --success: 142 72% 45%;
  --radius: 0.5rem;
}

Typography tokens:
- Headings: font-heading, uppercase tracking-wider, color hsl(var(--foreground))
- Body: font-body, font-light, color hsl(var(--muted-foreground))
- Data values: font-mono, tabular-nums
- Accent text: color hsl(var(--primary))

GLASS / SPECIAL COMPONENTS
Create reusable styles in @layer components:

.holo-glass {
  background: hsla(225, 25%, 10%, 0.6);
  backdrop-filter: blur(16px) saturate(140%);
  border: 1px solid hsla(192, 100%, 65%, 0.12);
  box-shadow:
    inset 0 1px 0 hsla(192, 100%, 65%, 0.08),
    0 8px 32px hsla(225, 30%, 3%, 0.5);
  position: relative;
  overflow: hidden;
}
.holo-glass::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, hsla(192, 100%, 65%, 0.04) 0%, transparent 50%, hsla(265, 85%, 65%, 0.04) 100%);
  pointer-events: none;
}

.holo-glass-active {
  backdrop-filter: blur(20px) saturate(160%);
  border: 1px solid hsla(192, 100%, 65%, 0.25);
  box-shadow:
    inset 0 1px 0 hsla(192, 100%, 65%, 0.15),
    0 0 20px hsla(192, 100%, 65%, 0.08),
    0 12px 40px hsla(225, 30%, 3%, 0.6);
}

.neon-glow-cyan {
  box-shadow: 0 0 4px hsla(192, 100%, 65%, 0.3), 0 0 16px hsla(192, 100%, 65%, 0.15), 0 0 48px hsla(192, 100%, 65%, 0.05);
}

.neon-glow-violet {
  box-shadow: 0 0 4px hsla(265, 85%, 65%, 0.3), 0 0 16px hsla(265, 85%, 65%, 0.15), 0 0 48px hsla(265, 85%, 65%, 0.05);
}

.neon-border-pulse {
  animation: borderPulse 3s ease-in-out infinite;
}
@keyframes borderPulse {
  0%, 100% { border-color: hsla(192, 100%, 65%, 0.15); }
  50% { border-color: hsla(192, 100%, 65%, 0.4); }
}

.scan-line::after {
  content: "";
  position: absolute;
  inset-inline: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, hsla(192, 100%, 65%, 0.3), transparent);
  animation: scanLine 4s linear infinite;
}
@keyframes scanLine { 0% { top: 0; } 100% { top: 100%; } }

.grid-bg {
  background-image:
    linear-gradient(hsla(192, 100%, 65%, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, hsla(192, 100%, 65%, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}

NON-NEGOTIABLE LAYOUT RULES
The site should feel data-rich and atmospheric but layout must remain structured and production-grade.

Do not:
- use overlapping panels or floating card clusters
- use negative margins for decorative offset
- use staggered asymmetric layouts or sidebar navigation
- let content drift outside its container
- let decorative motion affect layout flow or cause reflow
- allow horizontal scroll on any viewport width

Global layout:
- Centered container, max-w-[1360px], px-5 md:px-8 lg:px-16, mx-auto
- Section spacing: py-20 md:py-28 lg:py-32
- Background canvases: absolute inset-0 z-0
- Foreground content: relative z-10

Grid rules:
- Agent cards: 1 col → 2 col (768px) → 3 col (1024px)
- Dashboard panels: stacked → grid-cols-[280px_1fr_280px] (1024px)
- Pricing cards: 1 col → 3 col (1024px)
- Pipeline: vertical → horizontal (768px)

Card rules:
- Agent cards: min-h-[220px], equal height within row
- Pricing cards: min-h-[420px], equal height within row

Priority: if visual spectacle conflicts with layout stability, choose layout stability.

SITE STRUCTURE
Build exactly 8 main sections in this order.

SECTION 1 — COMMAND CENTER HERO
Height: min-h-screen (at least 100vh)

Background:
- Full-viewport particle grid canvas (see ASSETS)
- Radial gradient overlay from center: hsla(265, 85%, 35%, 0.08)
- grid-bg pattern layer beneath
- Bottom fade gradient to var(--background)

Navbar (fixed top, full width, z-50, h-16):
- Transparent at top → hsla(225, 30%, 5%, 0.85) + backdrop-blur(12px) on scroll
- Left: NexusAI holographic wordmark (see ASSETS)
- Center: nav links in holo-glass pill — Agents · Dashboard · Network · Deploy · Pricing
- Right: "Launch Console" CTA button, neon-glow-cyan on hover
- Mobile: hamburger icon → slide-down holo-glass panel with nav links

Hero content (vertically centered, max-w-4xl, mx-auto):
- Status badge: holo-glass pill showing "● SYSTEM ONLINE — 12 Agents Active" with a pulsing green dot
- Headline: "NexusAI" rendered at text-6xl md:text-7xl lg:text-8xl with holographic gradient text treatment
- Subtitle: "AI Agent Orchestration Platform" in uppercase tracking-[0.25em] text-sm md:text-base text-muted-foreground
- Body: "Deploy, monitor, and orchestrate autonomous AI agents across edge nodes worldwide. Real-time telemetry. Instant scaling. Zero downtime." — text-lg max-w-2xl
- CTA row:
  - "Deploy Your First Agent" — primary filled hsl(var(--primary)), neon-glow-cyan hover
  - "View Live Dashboard →" — ghost border, text hsl(var(--primary)) on hover

Floating metric cards (3 cards, horizontal row below CTAs, gap-4):
- Each 160×80px holo-glass: lucide-react icon + font-mono text-2xl value + label
  - Activity icon · "2,847" · "Tasks / Hour"
  - Cpu icon · "99.97%" · "Uptime"
  - Globe icon · "14" · "Edge Regions"

Animation:
- Headline: fade-in + scale 0.95→1.0 over 800ms ease-out, delay 200ms
- Subtitle: fade-up 20px, 600ms, delay 500ms
- Body: fade-up 20px, 600ms, delay 700ms
- CTAs: fade-up 20px, 600ms, delay 900ms
- Metric cards: staggered fade-up, 100ms apart starting at 1100ms
- No bounce, no overshoot

SECTION 2 — LIVE AGENT GRID
Background: var(--background) with grid-bg pattern

Header:
- Section badge: holo-glass pill "LIVE AGENTS" + pulsing cyan dot
- Heading: "Active Agent Fleet" — text-3xl md:text-4xl font-heading uppercase
- Subtext: "Real-time status of all deployed agents. Data refreshed from edge network."

Grid: 1 col → 2 col (768px) → 3 col (1024px), gap-4 md:gap-6

6 agent cards (data from GET /api/agents), each holo-glass:
- Top row: agent avatar SVG + agent name (font-heading text-lg) + status badge pill
  - Active: bg-success/15 text-success, green pulsing dot
  - Idle: bg-warning/15 text-warning, amber static dot
  - Error: bg-destructive/15 text-destructive, red fast-pulsing dot
- Middle: 2×2 mini stats — Tasks (count), Uptime (%), Latency (ms), Memory (% + thin progress bar)
- Bottom: sparkline SVG chart showing last 12 intervals
- Border treatment: neon-border-pulse for active, static for idle, destructive border for error
- Hover: scale(1.02) over 200ms, border brightens

Agents:
1. Atlas — Data Aggregator — active
2. Cipher — Encryption Sentinel — active
3. Drift — Load Balancer — idle
4. Echo — Log Analyzer — active
5. Forge — Build Runner — error
6. Ghost — Security Scanner — active

SECTION 3 — MISSION CONTROL DASHBOARD
Background: var(--background) with scan-line effect across the section

Header:
- Badge: "MISSION CONTROL"
- Heading: "Operational Intelligence"
- Subtext: "Unified telemetry across all active agents and edge nodes."

Desktop layout: grid-cols-[280px_1fr_280px] gap-6
Tablet: left + center stacked, health below
Mobile: all panels stacked

Left — Task Queue (holo-glass):
- Header: "Task Queue" + count badge
- 6 task items: priority dot (red critical / amber high / cyan normal) + task name (font-mono text-sm) + assigned agent (text-xs) + time ago (text-xs)
- Items separated by border-b, hover highlight on each

Center — Performance Chart (holo-glass):
- Header: "Agent Performance — Last 24h" + styled tabs (1h / 6h / 24h / 7d)
- recharts AreaChart from GET /api/metrics (24 data points)
  - Area 1: "Tasks Completed" — fill hsla(192, 100%, 65%, 0.15), stroke hsl(192, 100%, 65%)
  - Area 2: "Error Rate" — fill hsla(0, 72%, 55%, 0.1), stroke hsl(0, 72%, 55%)
  - Axes: font-mono text-xs · grid: hsla(215, 20%, 22%, 0.5)
  - Tooltip: holo-glass styled with font-mono values
- Summary stats below: "Avg Response: 42ms" · "Peak Load: 847/min" · "Success Rate: 99.2%"

Right — System Health (holo-glass):
- 4 circular SVG progress meters (stroke-dasharray):
  - CPU 67% cyan · Memory 54% cyan · Network 89% amber · Storage 32% cyan
- Percentage centered in circle (font-mono text-lg) + "Normal" or "Elevated" label
- Data from GET /api/health

SECTION 4 — NEURAL NETWORK VISUALIZATION
Background: var(--background) with radial gradient hsla(265, 85%, 45%, 0.06) from center

Header:
- Badge: "NEURAL MESH"
- Heading: "Agent Communication Network"
- Subtext: "Visualizing real-time data flow between autonomous agents across the edge network."

SVG area: w-full, aspect 16:10 desktop / 4:3 mobile
- 12–16 nodes in organic force-directed layout, each with geometric avatar
- Node labels below (font-mono text-xs)
- Curved connections with traveling dots (animateMotion 3–7s)
- Node pulse: scale 1→1.08→1 over 3s, staggered

Interaction:
- Hover: node glows (neon-glow-cyan), paths brighten, holo-glass tooltip with agent name/status/task/message counts, 150ms fade-in
- Mobile (<768px): reduce to 8 nodes, straight connections, tap-to-toggle overlay

SECTION 5 — DEPLOYMENT PIPELINE
Background: var(--background) + grid-bg

Header:
- Badge: "DEPLOY PIPELINE"
- Heading: "From Code to Edge in Seconds"
- Subtext: "Automated build, test, and deployment across 14 global edge regions."

Desktop: horizontal timeline · Mobile: vertical (data from GET /api/deployments)

4 stage cards (holo-glass, 200px wide desktop):
- Stage icon (lucide): GitBranch / TestTube / Server / Rocket
- Stage name: Build / Test / Stage / Deploy
- Status badge + duration (12s / 34s / 8s / 3s) + relative timestamp

Connecting lines between stages:
- Completed: solid hsl(var(--primary))
- In-progress: animated gradient sweep 200% width over 2s, glowing dot traveling 1.5s infinite
- Pending: hsl(var(--border))

Active deployment card (holo-glass-active, below timeline):
- Commit "a3f7c2d" · branch "main" · author "deploy-bot" · "Deploying to 14 regions…" · animated progress bar

SECTION 6 — COMMAND TIERS (PRICING)
Background: var(--background) + radial gradient hsla(265, 85%, 35%, 0.06) from bottom center

Header:
- Badge: "COMMAND TIERS"
- Heading: "Scale Your Intelligence"
- Subtext: "From solo operators to enterprise fleets. All tiers include edge deployment and real-time monitoring."

3 cards (1 col mobile, 3 col desktop, equal height):

Scout — $0/month:
- holo-glass, default border · Shield icon · "FREE" pill
- Features: 3 Agents · 1,000 tasks/mo · 2 Edge Regions · Community support · Basic telemetry · 1 pipeline
- CTA ghost: "Start Free"

Commander — $29/month:
- holo-glass-active with neon-border-pulse · scale-[1.02] desktop · Swords icon · "POPULAR" cyan pill
- Features: 25 Agents · 50,000 tasks/mo · 8 Regions · Priority support · Advanced analytics · 5 pipelines · Custom configs · Team (5)
- CTA primary: "Upgrade to Commander"

Admiral — $99/month:
- holo-glass with neon-glow-violet · Crown icon · "ENTERPRISE" violet pill
- Features: Unlimited Agents · Unlimited tasks · 14 Regions · Dedicated SLA · Full telemetry · Unlimited pipelines · Custom training · Unlimited team · SOC 2 · On-premise
- CTA secondary violet: "Contact Sales"

Price: font-mono text-4xl + "/month" text-sm text-muted-foreground. Features: checkmark icon + text-sm. CTAs: full width at card bottom.

SECTION 7 — TERMINAL CONSOLE CTA
Background: var(--background) + grid-bg

Terminal window (holo-glass, max-w-3xl, centered):
- Top bar: three dots (red/amber/green, 10px each) + "nexus-terminal" font-mono text-xs text-muted-foreground
- Body: bg hsla(225, 30%, 3%, 0.8), font-mono text-sm, p-6, leading-7

Typing animation (40ms per character, loops with 3s pause between):
1. "$ nexus init my-first-agent" (typed → 500ms pause)
2. "✓ Agent scaffold created" (instant, text-success)
3. "$ nexus deploy --edge" (typed → 500ms pause)
4. "✓ Build completed in 4.2s" (instant, text-success)
5. "✓ Deployed to 14 edge regions" (instant, text-success)
6. "✓ Agent online: https://my-agent.nexus.ai" (instant, text-primary underline)
7. "$ _" with blinking cursor (blink 1s step-end infinite)

Below terminal:
- "Deploy Your First Agent in 60 Seconds" — text-2xl md:text-3xl font-heading center
- "Three commands. Fourteen edge regions. Zero configuration." — text-muted-foreground center
- "Get Started Free →" — large primary button, neon-glow-cyan hover

SECTION 8 — FOOTER
Background: hsl(225, 30%, 3%), top border 1px solid hsl(var(--border)), py-12

Top row (flex justify-between):
- Left: NexusAI wordmark (font-heading text-lg) + "Orchestrate Intelligence at the Edge" text-xs text-muted-foreground
- Right: 3 link columns
  - Platform: Agents · Dashboard · Deployments · Pricing
  - Resources: Documentation · API Reference · Status Page · Changelog
  - Company: About · Blog · Careers · Contact

Bottom row (border-t pt-6 mt-8 flex justify-between):
- Left: "© 2026 NexusAI. All systems operational." text-xs text-muted-foreground
- Right: Privacy · Terms · Security
- Mobile: stacked vertically

EDGE FUNCTIONS
Use EdgeOne Pages Edge Functions. Create these endpoints:

functions/api/agents.js
GET /api/agents — Return JSON array of 6 agents:
{
  "id": "agent-001",
  "name": "Atlas",
  "role": "Data Aggregator",
  "type": "data",
  "status": "active",
  "tasks": 1247,
  "uptime": 99.98,
  "latency": 12,
  "memory": 42,
  "sparkline": [65, 72, 68, 80, 75, 82, 90, 85, 88, 92, 87, 91],
  "currentTask": "Aggregating sensor data from Region EU-West",
  "messagesSent": 24891,
  "messagesReceived": 31205
}
Full agent roster:
1. Atlas — Data Aggregator — data — active — 1247 tasks
2. Cipher — Encryption Sentinel — monitor — active — 893 tasks
3. Drift — Load Balancer — data — idle — 0 tasks
4. Echo — Log Analyzer — monitor — active — 2104 tasks
5. Forge — Build Runner — deploy — error — 56 tasks
6. Ghost — Security Scanner — monitor — active — 1891 tasks

functions/api/metrics.js
GET /api/metrics — Return:
{
  "timeRange": "24h",
  "dataPoints": [
    { "time": "00:00", "tasksCompleted": 342, "errorRate": 0.8 },
    ...24 hourly entries (tasks 250–900, errorRate 0.5–3.0)
  ],
  "summary": { "avgResponse": 42, "peakLoad": 847, "successRate": 99.2 }
}

functions/api/deployments.js
GET /api/deployments — Return:
{
  "deploymentId": "deploy-20260429-001",
  "commit": "a3f7c2d",
  "branch": "main",
  "author": "deploy-bot",
  "stages": [
    { "name": "Build", "status": "completed", "duration": 12 },
    { "name": "Test", "status": "completed", "duration": 34 },
    { "name": "Stage", "status": "completed", "duration": 8 },
    { "name": "Deploy", "status": "in_progress", "duration": null }
  ],
  "targetRegions": 14,
  "progress": 72
}

functions/api/subscribe.js
POST /api/subscribe — Accept { email (required, must contain @), tier ("scout"/"commander"/"admiral"), name (optional) }.
Validate: return 400 with { "error": "..." } on failure.
Success: { "success": true, "subscriptionId": "SUB-...", "tier": "commander", "message": "Welcome to NexusAI. Your console access is being provisioned." }

functions/api/health.js
GET /api/health — Return:
{
  "status": "operational",
  "services": {
    "cpu": { "usage": 67, "status": "normal" },
    "memory": { "usage": 54, "status": "normal" },
    "network": { "usage": 89, "status": "elevated" },
    "storage": { "usage": 32, "status": "normal" }
  },
  "activeAgents": 4,
  "totalAgents": 6,
  "edgeRegions": 14
}

FRONTEND DATA RULE
Do not hardcode data inside React components. All dynamic content must come from Edge Functions:
- Agent list → GET /api/agents
- Chart + metrics → GET /api/metrics
- Pipeline state → GET /api/deployments
- System health → GET /api/health
- Subscriptions → POST /api/subscribe

Loading states: skeleton shimmer for cards, pulsing bars for charts, "Connecting to network…" during fetch.
Error states: holo-glass card with red border + "Signal Lost — Reconnecting…", auto-retry after 3s.

RESPONSIVE RULES
390px (Mobile): single column everywhere · hamburger nav · text-4xl hero · vertical panels · 8-node neural net with straight lines · vertical pipeline · full-width terminal
768px (Tablet): text-6xl hero · 2-col agents · 2-col dashboard · horizontal pipeline · 2-col footer
1024px (Desktop): full layouts — 3-col agents/pricing/dashboard · Commander scale effect · all hover interactions
1440px (Wide): max-width centers · generous margins · more breathing room

MOBILE-SPECIFIC DESIGN
- Persistent bottom CTA bar (fixed h-14 z-40) after scrolling past hero: "Deploy Agent →"
- Touch targets: minimum 44×44px
- Disable particle canvas on mobile → replace with static gradient background
- Neural network: tap-to-reveal instead of hover
- Agent cards: horizontal snap-scroll instead of grid

ANIMATION SPECIFICATIONS
All respect prefers-reduced-motion: reduce (disable transforms, opacity-only fades).

Entrance (IntersectionObserver):
- Badges: fade-in 300ms ease-out
- Headings: fade-up 24px, 500ms ease-out
- Subtexts: fade-up 16px, 400ms, delay 100ms
- Cards: staggered fade-up, 80ms between siblings, 400ms each
- Charts: fade-in 600ms, data draws after mount

Continuous:
- Particle grid: 60fps requestAnimationFrame
- Active status dots: pulse scale 1→1.4→1, 2s infinite
- Error dots: 1s infinite
- Neural mesh dots: 3–7s linear per path
- Scan line: 4s linear
- Pipeline progress dot: 1.5s linear
- Terminal cursor: blink 1s step-end
- Holo text shimmer: 6s linear

Hover transitions:
- Cards: scale 200ms ease-out
- Buttons: background + shadow 150ms
- Links: color 150ms
- Borders: opacity 250ms

IMPLEMENTATION NOTES
- Use EdgeOne Pages skills: https://github.com/TencentEdgeOne/edgeone-pages-skills
- Follow skill rules during setup and deployment
- Ask China site vs Global site before login
- Use npx shadcn@latest init for shadcn/ui setup; install recharts separately
- Build and verify locally before deploying

TECHNICAL REQUIREMENTS
- TypeScript strict mode in tsconfig.json
- One component per file with clean structure
- Semantic HTML: <header>, <nav>, <main>, <section>, <footer>
- Accessible: alt text, aria-labels, WCAG AA contrast
- Focus states: outline-2 outline-offset-2 outline-[hsl(var(--primary))]
- lucide-react for all icons
- framer-motion for entrance animations, CSS for continuous
- tailwindcss-animate for utility classes
- Error boundaries wrapping each section
- React.lazy + Suspense for the neural network (heaviest component)

RECOMMENDED COMPONENTS
Navbar · ParticleGrid · HeroSection · SectionBadge · StatusBadge · AgentCard · AgentGrid · MissionControlDashboard · TaskQueuePanel · PerformanceChart · HealthMetersPanel · NeuralNetworkVisualization · DeploymentPipeline · PipelineStage · PricingCard · PricingSection · TerminalConsole · FooterSection · HoloGlassCard · GlowButton · SkeletonLoader

FINAL QUALITY BAR
Must NOT look like:
- a generic admin dashboard template
- a Material / Bootstrap themed page
- a dark SaaS landing page with charts pasted in
- a hackathon prototype or tech demo
- a crypto/blockchain dashboard
- a gaming leaderboard

Must look like:
- a premium AI operations command center
- a cinematic sci-fi interface grounded in real operational data
- dark, atmospheric, holographic, and purposeful
- structurally stable and responsive across all screen sizes
- polished enough to present as a real product launch site
- a site that makes the viewer feel like they are commanding a fleet of AI agents from the bridge of a starship

Visual references: the glass-panel HUDs of Blade Runner 2049, Bloomberg Terminal redesigned for 2049, the editorial motion of OrfeoAI, the operational clarity of Linear.

DELIVERY REQUIREMENT
After building:
1. Run locally — verify all 8 sections render correctly
2. Verify layout at 390px / 768px / 1024px / 1440px breakpoints
3. Verify all 5 Edge Function APIs return correct data
4. Verify animations run smoothly and respect prefers-reduced-motion
5. Verify recharts performance chart renders with metrics API data
6. Verify terminal typing animation loops cleanly
7. Test mobile: hamburger nav, snap-scroll cards, bottom CTA bar
8. Deploy to EdgeOne Pages per implementation notes
