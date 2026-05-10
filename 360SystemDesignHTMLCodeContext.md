# 360° System-Design Cheatsheet — Codebase Context

> **Purpose:** Single source of truth for the entire `system-design-cheatsheet/` codebase. Point future prompts at this file (e.g. *"per 360SystemDesignHTMLCodeContext.md, do X"*) instead of re-explaining structure, conventions, or the diagram engine.

---

## 1. Project Overview

A static, single-author, **vanilla HTML/CSS/JS** cheatsheet for Staff/Senior SWE system-design interviews. No build system, no framework, no bundler — files are opened directly in a browser.

- **Location:** `system-design-cheatsheet/`
- **Entry point:** `index.html` (hero + nav-only landing page)
- **Content pages:** 15 topic files (`01-…` through `15-…`)
- **Shared assets:**
  - `css/style.css` — global theme, layout, typography, search UI
  - `css/diagrams.css` — reusable SVG/CSS diagram primitives (rings, nodes, panels, grids)
  - `js/nav.js` — injects the topic nav menu, builds full-text search index, handles search UX, marks active module
- **Repo-root sibling docs:** `Engineering-Blogs.md`, `GoogleChecklist.md`, `KafkaInternals.md`, `Prod-Coding-Standards.md`, `README.md` (Markdown notes; not part of the cheatsheet bundle).

**Design philosophy:**
- Compact, dense reference cards — every page fits a topic's "must-know" in one scroll.
- Dark theme with accent colors per topic (cyan = networking, red = security, green = storage/scalability, etc.).
- Visual SVG diagrams paired with terse callouts (`.b bg`, `.b by`, `.b br` boxes).
- Same skeleton (`.hero`, `.ct`, `.T`, `topBtn`, `nav.js`) on every page for consistency.

---

## 2. Page Inventory

| File | Title | Sections (`#id`) | SVGs | Lines |
|---|---|---|---|---|
| `index.html` | System Design Cheatsheet — landing | nav only | 0 | 16 |
| `01-foundations.html` | 1. Foundations | sd-framework, fr-nfr, scaling-basics, stateless-stateful, serialization | 0 | 86 |
| `02-networking.html` | 2. Networking | osi, tcp-udp, http-https, dns, networking-extras | 8 | 361 |
| `03-security.html` | 3. Security | authentication, authorization, encryption | 0 | 59 |
| `04-apis.html` | 4. APIs & Communication | rest, grpc, graphql, async-apis, idempotent-apis, api-extras, realtime | 10 | 1062 |
| `05-infrastructure.html` | 5. Infrastructure | load-balancer, api-gateway, proxy, nginx, docker-k8s, service-mesh, multi-region, infra-extras | 16 | 983 |
| `06-storage.html` | 6. Storage Systems | db-choice, db-internals, db-indexing, sql, nosql, newsql, timeseries, search, blob, storage-extras | 19 | 750 |
| `07-caching.html` | 7. Caching | caching, redis, redis-fast, cdn | 10 | 417 |
| `08-messaging.html` | 8. Messaging | message-queues, kafka, pubsub, messaging-comparison, messaging-extras | 7 | 692 |
| `09-consistency.html` | 9. Consistency & Distributed Systems | cap, consistency-models, consensus, transactions, concurrency, consistency-extras | 15 | 798 |
| `10-scalability.html` | 10. Scalability Patterns | partitioning, distributed-indexing, replication, sharding, consistent-hashing, bloom-filters, rate-limiting, scalability-extras | 33 | 1976 |
| `11-data-pipelines.html` | 11. Data Pipelines | cdc, etl, stream-processing, batch-processing, data-warehouse, data-lakes, pipeline-extras | 6 | 374 |
| `12-distributed-systems.html` | 12. Distributed Systems | dist-patterns, zookeeper, gfs-hdfs, bigtable, fault-tolerance, data-redundancy, leader-election | 3 | 214 |
| `13-observability.html` | 13. Observability | logging, metrics, tracing, monitoring | 0 | 56 |
| `14-key-numbers.html` | 14. Key Numbers | latency-numbers, throughput-numbers, estimation | 0 | 60 |
| `15-decision-flowcharts.html` | 15. Decision Flowcharts | api-choice, db-choice, messaging-choice, cache-choice, realtime-choice, scaling-choice, more-decisions | 6 | 388 |

**Heaviest pages:** `10-scalability.html` (33 SVGs, ~2k lines), `04-apis.html`, `05-infrastructure.html`. **Diagram-free pages** (text/tables only): foundations, security, observability, key numbers.

---

## 3. Standard Page Skeleton

Every content page follows this exact pattern:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>N. Topic — System Design Cheatsheet</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/diagrams.css">   <!-- only if diagrams used -->
</head>
<body>
  <div class="hero" id="top">
    <h1><span>System Design Cheatsheet</span></h1>
    <p>Staff / Sr SWE — Complete Reference</p>
  </div>

  <div class="ct">
    <div class="sd sd-N"><span class="e">EMOJI</span> N · TOPIC NAME</div>

    <div class="T" id="section-id">
      <h2>Section Title</h2>
      <p class="su">One-line summary with <span class="hi">accents</span></p>
      <!-- content: tables, .b boxes, .d-grid panels, SVGs, pre/code, lists -->
    </div>

    <!-- more <div class="T">… sections -->
  </div>

  <button id="topBtn" onclick="window.scrollTo({top:0,behavior:'smooth'})" title="Back to top">↑</button>
  <script>const b=document.getElementById('topBtn');window.addEventListener('scroll',()=>{b.style.display=window.scrollY>400?'flex':'none'})</script>

  <!-- Optional: dp-engine block here (pages with SVG diagrams) -->

  <script src="js/nav.js"></script>
</body>
</html>
```

**Conventions:**
- `<title>` follows `N. Topic — System Design Cheatsheet`.
- The `.sd` banner uses `.sd-N` class where `N` is the section number (1–13 mapped to colors via CSS).
- Each topic section is `<div class="T" id="kebab-id">` — the `id` is what `nav.js` links to.
- Section title `<h2>` is required; subtitle `<p class="su">` is optional but standard.
- `topBtn` and `nav.js` are always at the bottom (`nav.js` injects the menu **after** `.hero` at runtime).

---

## 4. CSS Theme Tokens (`css/style.css`)

### Color variables (`:root`)
```css
--bg:#0f1117  --card:#1e2230  --border:#2a2f3e  --text:#e2e4e9  --muted:#8b8fa3
--a:#6c8cff   --a2:#a78bfa   /* accent blue / purple */
--g:#34d399   --y:#fbbf24    /* green / yellow */
--r:#f87171   --o:#fb923c    /* red / orange */
--c:#22d3ee   --p:#f472b6    /* cyan / pink */
--t:#2dd4bf                  /* teal */
```

### Highlight/inline classes
| Class | Color | Class | Color |
|---|---|---|---|
| `.hi` | yellow (`--y`) | `.ho` | orange |
| `.hg` | green | `.ha` | accent-blue |
| `.hr` | red | `.hv` | purple (`--a2`) |
| `.hc` | cyan | `.hp` | pink |

### Callout boxes (`.b` + variant)
| Class | Border / tint |
|---|---|
| `.bb` | accent-blue |
| `.bg` | green |
| `.by` | yellow |
| `.br` | red |
| `.bp` | purple |
| `.bo` | orange |

### Section banners (`.sd` + `.sd-N`)
- `.sd-1` cyan, `.sd-2` red, `.sd-3` green, `.sd-4` yellow, `.sd-5` orange, `.sd-6` pink, `.sd-7` purple, `.sd-8` teal, `.sd-9` blue, `.sd-10` green, `.sd-11` orange, `.sd-12` cyan, `.sd-13` yellow.

### Layout primitives
| Class | Use |
|---|---|
| `.hero` | Top gradient banner |
| `.ct`   | Page content container (max-width 1100, side padding) |
| `.T`    | Topic section card |
| `.cols` | 2-column grid (collapses to 1 on ≤700px) |
| `pre` / `code` | Cascadia/Fira Code monospace, dark blocks |
| `.tg` / `.tr` | Tiny green/red status pills (e.g. "GET" / "DELETE") |

### Search UI classes (rendered by `nav.js`)
`.search-wrap`, `.search-box`, `.search-results`, `.sr-item`, `.sr-cat`, `.sr-text`, `.sr-empty`.

### Nav menu classes
`.ng` (grid), `.nc` (card per module), `.nc h3`, `.nc .lk` (flat link group), `.nc .sg` (sub-group cluster), `.nc.active` (highlighted current page).

### Print
Print stylesheet hides `topBtn`, switches to white background. Pages are designed to print legibly.

### Responsive breakpoints
- **≤900px** — tablet adjustments (in `style.css` after the print block, not shown above).
- **≤700px** — `.cols` becomes single column.
- **≤800px / ≤500px** — `.d-grid` collapses (in `diagrams.css`).

---

## 5. Diagram Primitives (`css/diagrams.css`)

Reusable building blocks for non-SVG layouts and for wrapping SVGs.

### Rings & nodes (consistent-hashing diagrams)
- `.d-ring` (280×280 circle border), `.d-ring.lg` (320), `.d-ring.sm` (220)
- `.d-ring-label` — centered legend
- `.d-node` — child node positioned by CSS custom property `--angle` using `cos`/`sin`. Variants: `.server` (40px), `.key` (28px, 0.9 opacity).
- Node colors: `.d-green`, `.d-blue`, `.d-orange`, `.d-red`, `.d-purple`, `.d-cyan`, `.d-yellow`, `.d-pink`, `.d-teal`.

### Panels & grids
- `.d-panel` — bordered card (used by every diagram).
- `.d-panel h4` — uppercase title (0.78rem).
- `.d-grid` — 2-col; `.d-grid.tri` 3-col; `.d-grid.quad` 4-col. Auto-collapses on small screens.
- `.d-title` — section sub-heading (e.g. "▸ What is a Load Balancer?") with `.num.d-cyan/d-blue/d-green/d-yellow` numbered prefix.

### Other
- `.d-box`, `.d-box.sm` — server-name pills.
- `.d-pill` — generic chip.
- `.d-flow` — horizontal flex flow.
- `.d-arrow`, `.d-arrow-down` — arrow glyphs.
- `.d-map` — 3-col grid `key → arrow → server`.
- `.d-badge` (`.warn`, `.ok`, `.info`) — color-coded callout chips.
- `.d-bar-wrap`, `.d-bar-row`, `.d-bar-label` — simple horizontal comparison bars.

### SVG conventions inside `.d-panel`
- `<svg width="100%" viewBox="0 0 W H" style="max-width:Wpx;display:block;margin:0 auto">`.
- Always include `<defs>` with named `<marker>` for arrow heads (e.g. `id="lba"`, `id="ag1"`, `id="rt1"`).
- Strokes/fills use `var(--g)`, `var(--a)`, etc. — never hard-coded hex inside SVG content (defs/markers may use `#8b8fa3`).
- Numbered step badges drawn as `<circle r="6"/>` + `<text>1</text>` near the element they label — picked up automatically by the diagram-player engine (§9).

---

## 6. Topic Navigation & Search (`js/nav.js`)

A single self-invoking IIFE that runs on every page (loaded last in `<body>`).

**Responsibilities (in order):**

1. **Inject menu** — builds an HTML string of 15 `<div class="nc">` cards (one per topic) with grouped sub-links, then `insertAdjacentHTML('afterend', navHTML)` after `.hero`. Categories / colors / link targets are hard-coded in `nav.js`.
2. **Build search index** — three-tier `entries[]`:
   - **Type `nav`** (priority 3) — every link in the injected menu (cross-page).
   - **Type `heading`** (priority 2) — every `.T h2` on the current page.
   - **Type `content`** (priority 1) — every `.b`, `<li>`, `<p>`, `.su`, `<pre>`, and `<tr>` inside any `.T` (length-bounded to skip empty / huge blobs).
3. **Search UX** — `input` event filters `entries`, scores by priority + match position, dedupes by `href|text-prefix`, renders top 15 results with icons (📑 nav, 📌 heading, 📝 content). Snippet is shown for content matches with the match centered. Enter goes to first result; Esc closes; outside-click closes.
4. **Active module highlight** — adds `.active` to the `.nc` whose link `href` starts with the current page filename.

**Implications when editing pages:**
- Adding a new section requires **`<div class="T" id="…">` + `<h2>`** for it to appear in heading search and the active-module logic. The `id` should also be added to the matching `nav.js` `<a>` link if you want it in the sidebar.
- Search text is whatever is rendered, including SVG `<text>` content — so concise SVG labels are searchable.
- Don't put critical content inside elements that aren't `.b`, `li`, `p`, `.su`, `pre`, or `tr` — it won't be indexed (e.g. plain `<div>` blocks won't show up in full-text search).

---

## 7. Authoring Conventions

When modifying or adding content, follow these patterns to stay consistent with the rest of the codebase:

### Section header
```html
<div class="T" id="my-topic">
  <h2>Topic Name</h2>
  <p class="su">One-line takeaway with <span class="hi">key term</span></p>
  …
</div>
```

### Comparison table
```html
<table>
  <tr><th>Aspect</th><th>Option A</th><th>Option B</th></tr>
  <tr><td>Speed</td><td><span class="hg">Fast</span></td><td><span class="hr">Slow</span></td></tr>
  …
</table>
```

### Callouts
```html
<div class="b bg"><span class="hi">Guarantee:</span> …green box for guarantees / wins…</div>
<div class="b by"><span class="hi">Tradeoff:</span> …yellow box for caveats…</div>
<div class="b br"><span class="hi">Pitfall:</span> …red box for failure modes…</div>
<div class="b bb"><span class="hi">Note:</span> …blue informational…</div>
```

### Side-by-side panels
```html
<div class="d-grid">
  <div class="d-panel" style="padding:8px"><h4 style="color:var(--g)">Option A</h4>…</div>
  <div class="d-panel" style="padding:8px"><h4 style="color:var(--a)">Option B</h4>…</div>
</div>
```

### Real-world callouts
Standard pattern (see `04-apis.html`):
```html
<div class="b by" style="margin-top:4px">
  <span class="hi">Real-world:</span> <strong>Stripe</strong> — …
</div>
```

### Code block
```html
<pre><code>GET /api/v1/products/123     → Fetch (idempotent)
POST /api/v1/orders          → Create</code></pre>
```

---

## 8. Encoding & PowerShell Gotchas

The codebase uses **UTF-8 without BOM** and is full of multi-byte glyphs: `▶ ◀ ⛶ → ← — ‰ ✓ ✗ ⏱ 👤 🌐 📱 🖥️ ⚖️`.

**Never** edit these files via:
```powershell
(Get-Content file -Raw) -replace … | Set-Content -Encoding utf8 file
```
PowerShell 5.1's `Get-Content -Raw` decodes as **CP1252** by default, then `Set-Content -Encoding utf8` re-encodes the corrupted text — turning `▶` into `â–¶`, etc.

**Safe pattern:**
```powershell
$bytes=[System.IO.File]::ReadAllBytes($f)
$text=[System.Text.Encoding]::UTF8.GetString($bytes)
# … manipulate $text …
[System.IO.File]::WriteAllText($f,$text,(New-Object System.Text.UTF8Encoding $false))
```

If mojibake has already happened, reverse it with: read as UTF-8 → re-encode chars as CP1252 bytes → decode those bytes as UTF-8 → write back.

---

## 9. Diagram Player Engine (`dp-*`)

Two flavors of an interactive engine that adds **Play (▶)** and **Expand (⛶)** controls to SVG diagrams. The expand modal includes Play/Pause, ↻ Restart, and ◀ Prev / Next ▶ step navigation (← / → keys, Esc closes).

### 9a. Auto-Wrap Engine (`05-infrastructure.html`)
- Runs on `DOMContentLoaded` + `requestAnimationFrame`.
- Finds every `<svg>` inside any `.T` section and wraps it with `<div class="dp-panel dp-auto">`.
- Injects `▶` and `⛶` buttons (`.dp-ctrls`).
- **Auto-tags** each direct SVG child as `.dp-el` (skips `<defs>`, `<marker>`, gradients, etc.).
- **Auto-orders steps** via the heuristic in §9d.
- **Best for:** new pages where you don't want to touch SVG markup.

### 9b. Markup-Driven Engine (`04-apis.html`)
- Authors opt in: `<div class="d-panel dp-panel <unique-name>" data-dp-duration="6200">`.
- Hand-write `.dp-ctrls` block.
- Tag animated nodes with `class="dp-el <unique-step-class>"`.
- Per-panel scoped CSS `@keyframes` (`dpSlideUp`, `dpSlideDown`, `dpFadeIn`, `dpPop`) with explicit `animation-delay` to choreograph timeline playback.
- Step nav still works because elements have `.dp-el`.
- **Best for:** hero diagrams needing custom slide/fade timeline animations.

> Both engines share the same modal markup, CSS (`.dp-stepped`, `.dp-on`), and step-mode logic. They differ only in panel creation and Play behavior (CSS keyframes vs. interval-tick reveal).

### 9c. DOM Contract
```html
<div class="dp-panel <variant>">
  <h4>Title</h4>
  <div class="dp-ctrls">
    <button class="dp-ctrl"        onclick="dpToggle(this.closest('.dp-panel'),this)">▶</button>
    <button class="dp-ctrl dp-expand" onclick="dpExpand(this.closest('.dp-panel'))">⛶</button>
  </div>
  <svg viewBox="…">
    <defs>…</defs>                  <!-- skipped -->
    <rect class="dp-el …"/>          <!-- step element -->
    <text class="dp-el …">…</text>
    …
  </svg>
</div>
```

Important classes/attrs:
| Name | Meaning |
|---|---|
| `.dp-panel` | Marks an interactive diagram |
| `.dp-el`    | Animatable / step-revealable element |
| `.dp-playing` | Timeline playback active (CSS keyframes fire) |
| `.dp-paused`  | `animation-play-state: paused !important` |
| `.dp-stepped` | Step mode — animations off; visibility via `.dp-on` |
| `.dp-on`      | Per-step "currently visible" flag |
| `.dp-auto`    | Marker: auto-wrapped (skip re-wrap) |
| `data-dp-duration="<ms>"` | Total timeline length (markup engine, default 6200) |
| `data-dp-step="N"`        | Author override for ordering. Same N reveals together |

### 9d. Conceptual-Order Heuristic (Auto-Engine)

Four passes — **not** simple document order:

1. **Explicit override** — any element with `data-dp-step="N"` wins.
2. **Numbered-badge clustering** — find `<text>` direct children whose content is a small integer (`/^\d{1,2}$/`); each becomes a "badge". For every other element:
   - Compute annotation-zone radius `= max(12, 0.55 × min-spacing-between-any-two-badges)`.
   - Find closest badge by Euclidean distance (`getBBox()` centers).
   - If `dist ≤ zoneR` → assign that badge's number.
   - Else if center-y is below all badges (`> maxBadgeY + 0.6×zoneR`) → step `1e5` (trailing caption — last).
   - Else → step `−1` (setup / topology — first).
3. **Connector constraint** — for every `<line>`, `<polyline>`, `<path>`:
   - Get geometric endpoints (`getPointAtLength(0)` and `getPointAtLength(L)`).
   - Find nearest non-connector node to each endpoint.
   - Bump connector's step to `max(self, endpointA.step, endpointB.step)` (never lowered).
4. **Stable sort** by `(step, docIdx)`. Result cached on `panel._dpEls`.

**Net result:** topology renders first, badged steps play in numeric order, arrows reveal only after both endpoints are visible, captions/legends play last.

### 9e. Public Functions (`window.*`)
| Function | Purpose |
|---|---|
| `dpToggle(panel, btn)` | Start / pause / replay |
| `dpRestart(panel, btn)` | Reset to step 0 + start |
| `dpStepNext()` / `dpStepPrev()` | Modal step nav |
| `dpZoom(factor)` | `0` resets to 2×, else multiply (clamped 0.5–5) |
| `dpExpand(panel)` | Open modal with deep-cloned SVG |
| `dpModalPlay()` / `dpModalRestart()` / `dpModalClose()` | Modal toolbar handlers |

Per-panel state: `panel._dpEls` (sorted step list), `panel._step.i` (current index), `panel._timer` (interval ID).

### 9f. Modal Layout
```
┌────────────────────────────────────────────────────────────────┐ ✕
│ + − [Reset] [▶] [↻ Restart]  [STEPS  ◀ Prev  N/M  Next ▶]      │
├────────────────────────────────────────────────────────────────┤
│            <cloned SVG, transform: scale(2)>                   │
└────────────────────────────────────────────────────────────────┘
```
- Mounts via `inner.innerHTML = panel.outerHTML`; removes inline `.dp-ctrls` (toolbar takes over); re-runs `dpAutoTag` on the clone.
- Default zoom `2×`; `dpZoom(0)` resets.
- `←` / `→` step, `Esc` closes.

### 9g. Shared Keyframes
```css
@keyframes dpSlideUp   {from{opacity:0;transform:translateY( 8px)} to{opacity:1;transform:translateY(0)}}
@keyframes dpSlideDown {from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)}}
@keyframes dpFadeIn    {from{opacity:0} to{opacity:1}}
@keyframes dpPop       {from{opacity:0;transform:scale(.6)} to{opacity:1;transform:scale(1)}}
@keyframes dpModalIn   {from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)}}
```
Auto-engine uses `.dp-stepped .dp-el { opacity:0; transition: opacity .25s ease } .dp-on { opacity:1 }` instead of named keyframes.

### 9h. Adding the Engine to a New Page
**Quickest** — copy the auto-engine block from the bottom of `05-infrastructure.html` (between `<button id="topBtn">` and `<script src="js/nav.js">`). Every `<svg>` in any `.T` instantly gets controls.

**Custom timelines** — copy the markup-driven pattern from `04-apis.html` (the `<style>` + modal + `<script>` block inside `<div class="T" id="realtime">`), then per-diagram add `class="dp-el <step-class>"` and scoped `@keyframes`.

### 9i. Override Step Order Per-Diagram
Three options (priority order):
1. `data-dp-step="N"` on each element — most explicit.
2. Numbered badges in the SVG — auto-clustered (Pass 2).
3. Document order — fallback when no badges.

Connector constraint always applies unless connectors also have `data-dp-step`.

### 9j. Engine Quirks
- `getBBox()` / `getTotalLength()` need layout — engine waits for `requestAnimationFrame`.
- Only `<text>` direct children are scanned for badges; badges wrapped in `<g>` are missed.
- One `<svg>` per `.dp-panel` — no nested SVGs.
- Setup nodes (outside any annotation zone, not below badges) reveal **before** badge 1, by design.

---

## 10. Files Currently Using the Engine

| File | Engine | Notes |
|---|---|---|
| `04-apis.html` | Markup-driven | Real-time panels (Short/Long Polling, WebSocket, SSE, WebRTC, Webhook) + Async Request Lifecycle. Hand-tuned timelines. |
| `05-infrastructure.html` | Auto-wrap | All 16 SVGs (Load Balancer, L4/L7, algorithms, gateway flow, multi-tenant types, NGINX panels, etc.). |

**Pages that still need it** (have SVGs but no engine yet): `02-networking.html`, `06-storage.html`, `07-caching.html`, `08-messaging.html`, `09-consistency.html`, `10-scalability.html`, `11-data-pipelines.html`, `12-distributed-systems.html`, `15-decision-flowcharts.html`. Easy fix: paste the auto-engine block.

---

## 11. Quick-Reference File Map

| Need to … | Open … |
|---|---|
| Find topic content | the matching `NN-topic.html` file |
| Add a section | edit page, follow §3 skeleton + §7 conventions |
| Change colors / theme | `css/style.css` (`:root` block) |
| Change diagram styling | `css/diagrams.css` |
| Edit nav / search | `js/nav.js` (single IIFE) |
| Read auto-engine source | bottom of `05-infrastructure.html` (before `nav.js` script tag) |
| Read markup-driven engine source | inside `<div class="T" id="realtime">` of `04-apis.html` |
| Add engine to a page | copy auto-engine block from `05-infrastructure.html` |

---

## 12. Future-Improvement Ideas (Optional, Not Yet Implemented)

Captured from prior brainstorm — pick if/when revisiting:

- **Step captions / narration** — a one-line description per step revealed in the modal toolbar.
- **Side-by-side compare mode** — load 2 panels into the modal with synchronized stepping.
- **Anti-pattern callouts** under each diagram.
- **Real numbers overlay** (e.g. "polling 5s × 86400 = 17,280 wasted requests/day").
- **Failure-mode replay** — same diagram with a network drop / duplicate.
- **Progress bar / scrub points** during timeline play.
- **Step list sidebar** in modal.
- **Mini-quiz** at end of each topic.
- **Pseudocode block** alongside each pattern diagram.
- **Glossary on hover** for jargon.
- **Mnemonics** as subtitles ("Webhook = don't call us, we'll call you").
- **Color-blind safe palette** + glyph fallbacks (✓/✗).
- **Print / light-theme toggle**.
