# BugLens Design System

> This document defines the visual language, component patterns, and rules every AI agent or developer must follow when building or modifying the BugLens frontend (`buglens-next`).

---

## 1. Core Principles

- **Dark, terminal-native** — every surface feels like a dev tool, not a SaaS dashboard
- **Green as signal** — `--green` (#22c55e) is reserved for active state, data, success, and brand emphasis only. Never decorative.
- **No purple, ever** — not in gradients, badges, highlights, or anything user-facing
- **Monospace for data** — any number, timestamp, code snippet, tag, or label uses `var(--mono)`
- **Prose in Inter** — all body copy, headings, and descriptions use `var(--sans)` (Inter)
- **Earned merge** — every UI element must justify its presence. No decorative animations, no gradient noise, no emoji in UI unless explicitly approved

---

## 2. Color Tokens

All colors must come from CSS variables defined in `app/globals.css`:

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#060a07` | Page background |
| `--surface` | `#0d1510` | Cards, panels, inputs |
| `--surface2` | `#111a13` | Elevated surfaces |
| `--green` | `#22c55e` | Brand, active, CTA, links |
| `--green-bright` | `#34d399` | Hover states on green elements |
| `--green-dim` | `#16a34a` | Subtle green borders/fills |
| `--green-muted` | `rgba(34,197,94,0.05)` | Background tint on green sections |
| `--green-glow` | `rgba(34,197,94,0.15)` | Glow effects |
| `--text` | `#e8f0e9` | Body text |
| `--text-active` | `#ffffff` | Headings, active labels |
| `--text-muted` | `#7a9980` | Secondary text, descriptions |
| `--text-dim` | `#4a6650` | Timestamps, meta, line numbers |
| `--border` | `rgba(34,197,94,0.08)` | Default borders |
| `--border-bright` | `rgba(34,197,94,0.2)` | Hover/focus borders |

**Never hardcode hex values in components.** Always use a token.

---

## 3. Typography

### Fonts
- **Sans**: `var(--sans)` → Inter (loaded via `next/font/google`, variable `--font-inter`)
- **Mono**: `var(--mono)` → JetBrains Mono (loaded via `next/font/google`, variable `--font-mono`)
- No other fonts. No Google Fonts CDN links.

### Scale

| Role | Size | Weight | Token/Class |
|---|---|---|---|
| Page title (h1) | `clamp(36px, 6vw, 72px)` | 700 | `.hero-title` |
| Section title (h2) | `clamp(28px, 4vw, 48px)` | 700 | `.section-title` |
| Sub-section title (h3) | `clamp(20px, 2.5vw, 28px)` | 600 | `.fa-feature-title` |
| Body | `15px` | 400 | `body` default |
| Small body | `13px` | 400 | `.section-sub`, `.fa-feature-desc` |
| Mono label | `11–12px` | 400–600 | `var(--mono)` |
| Eyebrow | `11px` | 600 | `.section-eyebrow` |

### Eyebrow pattern
Every major section opens with a monospace eyebrow in green:
```tsx
<div className="section-eyebrow">{"// what buglens does"}</div>
```

### Italic emphasis
Green italic is used for the **hero word** in a heading:
```tsx
<h2>Catches bugs <em>before your team does.</em></h2>
```
`em` inside section titles is green (`color: var(--green)`) and italic, weight 400.

---

## 4. Spacing System

Spacing uses CSS `rem` or `px`. No Tailwind spacing scale.

| Context | Value |
|---|---|
| Section padding (top/bottom) | `5rem` (`.section`) |
| Section max-width | `1200px` (`.section`) |
| Card padding | `1.5–2rem` |
| Gap between cards | `1–1.5rem` |
| Gap between sections | Controlled by `border-top: 1px solid var(--border)` |

---

## 5. Component Patterns

### Section wrapper
Every landing page section uses `.section`:
```tsx
<section className="section">
  <div className="section-eyebrow">{"// label"}</div>
  <h2 className="section-title">Title <em>emphasis.</em></h2>
  <p className="section-sub">Supporting description.</p>
  ...
</section>
```

### Buttons

| Variant | Class | Usage |
|---|---|---|
| Primary CTA | `.btn-primary` | Main action — green bg, black text |
| Ghost | `.btn-ghost` | Secondary action — transparent, green border |
| Secondary | `.btn-secondary` | Tertiary — subtle border, muted text |

Never invent a new button style. Use one of these three.

### Cards
```css
background: rgba(255,255,255,0.02);
border: 1px solid var(--border);
border-radius: 10–12px;
```
Hover: `border-color: var(--border-bright)` — no `transform: translateY`. No box-shadow escalation.

### Terminal / code blocks
```css
background: #020804 or #040806;
border: 1px solid rgba(34,197,94,0.12);
border-radius: 10px;
font-family: var(--mono);
```
Terminal bar: `rgba(34,197,94,0.04)` background, three colored dots (red/yellow/green).

### Diff blocks
- Deleted lines: `background: rgba(239,68,68,0.08)` · text `#f87171`
- Added lines: `background: rgba(34,197,94,0.08)` · text `var(--green)`
- Context lines: text `var(--text-muted)`

### Badges / tags
```css
font-family: var(--mono);
font-size: 10–11px;
text-transform: uppercase;
letter-spacing: 0.06–0.1em;
color: var(--green);
```

### Severity badge (critical)
```css
background: rgba(239,68,68,0.1);
border: 1px solid rgba(239,68,68,0.25);
color: #f87171;
border-radius: 6px;
padding: 3px 8px;
```

---

## 6. Animation Rules

- **Entrance**: `opacity: 0 → 1` + `translateY(12px → 0)`, duration `0.4–0.5s ease`
- **Trigger**: Use `IntersectionObserver` at `threshold: 0.2` — never animate on mount without scroll trigger
- **Progress bars**: `width: 0% → 100%` via CSS `animation`, not JS
- **Pulse dots**: `@keyframes` opacity 1 → 0.2 → 1, `1s infinite`
- **No bounce, no spring, no rotate** — transitions are linear or ease only
- **Delay between sequential items**: 800–1000ms feels natural for chat/text reveals

---

## 7. Layout Patterns

### Split (50/50)
```css
display: grid;
grid-template-columns: 1fr 1fr;
```
Used in: PainSection, KnowledgeBaseSection (problem side), for-agents problem block.

### Split (text + visual, 40/60)
```css
grid-template-columns: 380px 1fr;
```
Used in: KnowledgeBaseSection tabs.

### Three-panel
```css
grid-template-columns: 1fr 1.4fr 1fr;
```
Used in: PRDemoSection.

### Feature grid (3-col)
```css
grid-template-columns: repeat(3, 1fr);
gap: 1.5rem;
```

### Mosaic grid (shared-border cards)
```css
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 1px;
background: var(--border); /* gap becomes the border */
border: 1px solid var(--border);
border-radius: 12px;
overflow: hidden;
```
Used in: Blog post grid.

---

## 8. Interactive Tabs / Accordion

Pattern used in `KnowledgeBaseSection`:
- Left: stacked tab buttons with animated green progress bar (auto-advances, 5s each)
- Right: swaps a visual panel
- Active tab: full opacity, eyebrow label visible, description shown
- Inactive tab: `opacity: 0.45`, no description
- No slide/fade on panel swap — instant replace is fine

---

## 9. What NOT to do

- ❌ No purple (`#7c3aed`, `violet`, `purple`, or any purple-adjacent color)
- ❌ No fake stats or placeholder metrics in production
- ❌ No mention of Gemini, Google AI, or specific AI model names in user-facing copy
- ❌ No `transform: translateY(-4px)` on card hover (too much movement)
- ❌ No `box-shadow` escalation on hover (subtle border change only)
- ❌ No Google Fonts CDN `<link>` tags — use `next/font/google` only
- ❌ No hardcoded hex colors in components — use tokens
- ❌ No Tailwind utility classes for layout/color — CSS classes in `globals.css` only
- ❌ No `border-radius: 20px` — max `12px` for cards, `100px` for pill buttons only
- ❌ No emoji in UI unless the feature explicitly calls for it (e.g. severity indicators)
- ❌ No `localStorage` or `sessionStorage` in components

---

## 10. File Conventions

| Purpose | Location |
|---|---|
| Global CSS tokens + all styles | `app/globals.css` |
| Page-level layout | `app/(landing)/page.tsx` |
| Shared components | `components/` |
| Section-specific CSS | Appended to `globals.css` with a `/* == SectionName == */` header comment |
| Fonts | Declared in `app/layout.tsx` via `next/font/google` |

### CSS class naming
- Landing page sections: `section-name-element` (e.g. `.feat-grid`, `.hiw-step`)
- For-agents page: `.fa-*`
- PR demo section: `.prd-*`
- Pain section: `.pain-*`
- Knowledge base: `.kb-*`
- Blog: `.bl-*`

---

## 11. Copy Voice

- **Technical but human** — talks to developers, not executives
- **Builder-to-builder tone** — honest, direct, no marketing fluff
- **"Earned merge"** is the core idea — every PR should be reviewed before it ships
- Avoid: "powerful", "seamless", "revolutionary", "game-changing"
- Prefer: specific, concrete, what it actually does

---

*Last updated: 2026-06-29. Update this file whenever a new pattern is introduced.*
