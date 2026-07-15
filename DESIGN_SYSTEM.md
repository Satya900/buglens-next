# BugLens Design System

> This document defines the visual language, component patterns, and rules every AI agent or developer must follow when building or modifying the BugLens frontend (`buglens-next`). It is derived from `DESIGN-cal.md` (a Cal.com design-system analysis) at the repo root, translated into BugLens' actual tokens and class names.

---

## 1. Core Principles

- **Clean, modern SaaS, light canvas** — white/light-gray surfaces, black primary CTAs, product UI shown directly (not illustrated)
- **Monochrome action layer** — `--primary` (near-black `#111111`) is the only color on primary CTAs and headline type. Never a colored button.
- **Blue is rare** — `--brand-accent` (`#3b82f6`) appears sparely: inline links, one small highlight moment. It is not a structural or repeated color.
- **Dark surface is scarce** — `--surface-dark` (`#101010`) appears in exactly two places: the footer, and the featured pricing tier. Nowhere else.
- **Monospace for code/data** — code snippets, diffs, terminal blocks, and the `//` eyebrow flavor use `var(--mono)` (JetBrains Mono)
- **Display face for headlines, Inter for everything else** — `var(--font-display)` (Cal Sans-style substitute, currently Inter 600 with negative tracking) for h1/h2/h3; `var(--sans)` (Inter) for body, buttons, nav, captions
- **Restraint on hover** — press-state darkening on primary buttons; a subtle elevation shift at most on cards. No lift, no shadow escalation, no bounce.
- **No emoji as UI** — icons or `badge-pill` labels only. Emoji reads as off-brand for this system.
- **Earned merge** — every UI element must justify its presence. No decorative animation, no gradient noise.

---

## 2. Color Tokens

All colors come from CSS variables defined in `app/globals.css` (`:root`, lines 27-92). **Never hardcode hex values in components.**

### Brand & neutrals

| Token | Value | Usage |
|---|---|---|
| `--primary` / `--green` | `#111111` | Primary CTA background, h1/h2/h3 color. (`--green` is a legacy alias — new code should reach for `--primary`/`--ink` directly.) |
| `--primary-active` | `#242424` | Primary button press state |
| `--primary-disabled` | `#e5e7eb` | Disabled button background |
| `--ink` / `--text-active` | `#111111` | Headlines, primary text |
| `--body` / `--text` | `#374151` | Default running text |
| `--muted` / `--text-muted` | `#6b7280` | Secondary text, eyebrow labels, sub-headings |
| `--muted-soft` / `--text-dim` | `#898989` | Tertiary text — captions, fine print, timestamps |

### Surfaces

| Token | Value | Usage |
|---|---|---|
| `--canvas` / `--bg` | `#ffffff` | Page background |
| `--surface-soft` / `--surface2` | `#f8f9fa` | Nav-pill groups, soft dividers |
| `--surface-card` / `--surface` | `#f5f5f5` | Feature cards, testimonial cards, badge pills |
| `--surface-strong` | `#e5e7eb` | Alternate hairline, disabled backgrounds |
| `--surface-dark` | `#101010` | Footer, featured pricing tier. **Only these two places.** |
| `--surface-dark-elevated` | `#1a1a1a` | Nested cards inside the footer or featured pricing tier |
| `--hairline` / `--border` | `#e5e7eb` | 1px border on light surfaces (inputs, dividers, card outlines) |
| `--hairline-soft` | `#f3f4f6` | Barely-visible divider between same-canvas sections |

### Text-on-dark

| Token | Value | Usage |
|---|---|---|
| `--on-primary` / `--on-dark` | `#ffffff` | Text on primary buttons and the dark footer |
| `--on-dark-soft` | `#a1a1aa` | Footer body/link text |

### Accent & semantic

| Token | Value | Usage |
|---|---|---|
| `--brand-accent` | `#3b82f6` | Inline links, rare single highlight — never a repeated structural color, never on a primary CTA |
| `--success` | `#10b981` | Confirmation states |
| `--warning` | `#f59e0b` | Warning callouts |
| `--error` | `#ef4444` | Validation errors, critical severity |
| `--badge-orange` | `#fb923c` | Badge pastel / rating stars |
| `--badge-pink` | `#ec4899` | Badge pastel |
| `--badge-violet` | `#8b5cf6` | Badge pastel (avatar fills, category tags only — never a CTA or structural color) |
| `--badge-emerald` | `#34d399` | Badge pastel |
| `--error-soft` | `#f87171` | Soft severity tint — text/icons on the app shell's severity pills, risk scores, status dots |
| `--warning-soft` / `--warning-soft-2` | `#facc15` / `#fbbf24` | Soft severity tints — medium-severity pills and risk indicators |
| `--success-soft` | `#4ade80` | Soft severity tint — low-severity / approved states |

Severity/status colors anywhere in the app (admin, dashboard, reviews) must resolve to `--success` / `--warning` / `--error`, not one-off hex.

---

## 3. Typography

### Fonts
- **Display**: `var(--font-display)` — Cal Sans-style geometric display face. Substituted with Inter at weight 600 plus negative letter-spacing (the `--tracking-display-*` tokens) until a licensed equivalent (e.g. Manrope 700) is adopted. Used for h1/h2/h3 only — never body copy.
- **Sans**: `var(--sans)` → Inter, for body, buttons, nav, captions.
- **Mono**: `var(--mono)` → JetBrains Mono, for code, diffs, terminal chrome, and the `//` eyebrow.
- No other fonts. No Google Fonts CDN links — `next/font/google` only.

### Scale

| Role | Size | Weight | Letter-spacing | Class |
|---|---|---|---|---|
| Display XL (hero h1) | `clamp(38px, 6vw, 64px)` | 600 | `var(--tracking-display-xl)` (-2px) | `.hero-title` |
| Display LG (section h2) | `clamp(28px, 4vw, 48px)` | 600 | `var(--tracking-display-lg)` (-1.5px) | `.section-title` |
| Display MD (card/sub-section h3) | `clamp(20px, 2.5vw, 36px)` | 600 | `var(--tracking-display-md)` (-1px) | component-specific `-title` classes |
| Display SM (CTA-band heads, prices) | `28px` | 600 | `var(--tracking-display-sm)` (-0.5px) | `.closing-cta-title`, price amounts |
| Title (plan names, intro paragraphs) | `16-22px` | 600 | 0 | — |
| Body | `15-16px` | 400 | 0 | `body` default, `.section-sub` |
| Caption / eyebrow | `13px` | 500 | 0 | `.section-eyebrow` |
| Code | `14px` | 400 | 0 | `var(--mono)` |
| Button label | `14px` | 600 | 0 | `.btn-primary`/`.btn-secondary`/`.btn-ghost` |

Display weight never exceeds 600 (never 700 — Cal Sans at 700 reads as bombastic) and never drops below 600 on a true headline role.

### Eyebrow pattern
BugLens keeps its monospace `//` eyebrow as a signature detail (there's no equivalent in the source Cal.com system), but it is now a quiet caption label, not a structural accent color:
```tsx
<div className="section-eyebrow">{"// what buglens does"}</div>
```
`.section-eyebrow` is `var(--mono)`, `13px`/`500`, color `var(--muted)` — never `--brand-accent`. Every major section opens with one, including `PainSection` (previously the one section missing it).

### Emphasis
No colored italic emphasis. `em` inside headlines (`.hero-title em`, `.section-title em`, etc.) renders `font-style: normal; color: inherit` — the system is monochrome at the emphasis layer, matching Cal.com's action-layer restraint.

---

## 4. Spacing System

Base unit 4px, following `DESIGN-cal.md`'s spacing scale.

| Context | Value |
|---|---|
| Section padding (top/bottom) | `96px` (`.section`) — currently `4rem` in some places; target `6rem` (96px) |
| Section max-width | `1200px` |
| Card internal padding | `32px` (feature/pricing cards), `24px` (testimonial/product-mockup cards) |
| Gutters between cards | `24px` in 3-up grids |
| Footer padding | `64px` |

---

## 5. Component Patterns

### Section wrapper
```tsx
<section className="section">
  <div className="section-eyebrow">{"// label"}</div>
  <h2 className="section-title">Title <em>emphasis.</em></h2>
  <p className="section-sub">Supporting description.</p>
  ...
</section>
```

### Buttons

| Variant | Class | Spec |
|---|---|---|
| Primary CTA | `.btn-primary` | `background: var(--primary)`, `color: var(--on-primary)`, `border-radius: 8px`, `height: 40px`, `padding: 12px 20px`. Hover → `var(--primary-active)` only. Already correct — do not change. |
| Secondary | `.btn-secondary` | White bg, `var(--ink)` text, `1px solid var(--hairline)`, same sizing as primary. Already correct. |
| Ghost | `.btn-ghost` | Transparent, used for tertiary actions. |

Never invent a new button style, and never build a CTA from inline styles — always one of the three classes above.

### Cards
```css
background: var(--surface-card); /* or var(--canvas) with a hairline border for "product chrome" cards */
border-radius: 12px; /* hero-app-mockup-card style containers may go to 16px max */
```
**Hover restraint**: at most a shift to the documented elevation pair — `box-shadow: 0 1px 2px rgba(0,0,0,0.05)` (default) → `0 4px 12px rgba(0,0,0,0.08)` (hover/elevated). **No `transform: translateY(...)` on hover, ever** — this is an explicit Cal.com "Don't."

### Border radius scale

| Token | Value | Use |
|---|---|---|
| `xs` | 4px | Badge accents |
| `sm` | 6px | Small inline buttons, dropdown items |
| `md` | 8px | CTA buttons, text inputs, category tabs |
| `lg` | 12px | Content cards |
| `xl` | 16px | Hero app-mockup card — the largest radius anywhere |
| `pill` / `full` | 9999px | Nav-pill-group, badges, avatars, icon buttons |

**Nothing exceeds 16px.**

### Terminal / code blocks
```css
background: var(--surface-card);
border: 1px solid var(--hairline);
border-radius: 10px;
font-family: var(--mono);
```
Terminal bar: three traffic-light dots via a single shared `.traffic-dot--red/yellow/green` class (or shared token set) — do not hand-roll separate hardcoded hex per component. Every terminal chrome instance (`Terminal.tsx`, `KnowledgeBaseSection.tsx`, `for-agents/page.tsx`) uses the same values.

### Diff blocks
- Deleted lines: `background: rgba(239,68,68,0.08)` · text `var(--error)`
- Added lines: `background: rgba(16,185,129,0.08)` · text `var(--success)`
- Context lines: text `var(--muted)`

### Badges / tags (`badge-pill`)
```css
font-family: var(--sans);
font-size: 13px;
font-weight: 500;
border-radius: 9999px;
padding: 4px 12px;
background: var(--surface-card); /* or a badge pastel for category tags */
color: var(--ink);
```

### Severity badge (critical)
```css
background: rgba(239,68,68,0.1);
border: 1px solid rgba(239,68,68,0.25);
color: var(--error);
border-radius: 6px;
padding: 3px 8px;
```
No emoji glyphs inside severity badges — color + label text only.

---

## 6. Animation Rules

- **Entrance**: `opacity: 0 → 1` + `translateY(12-16px → 0)`, `.4-.7s ease`, on page load for hero elements only (see `.hero-title`'s `fadeUp` animation)
- **Progress bars**: `width: 0% → 100%` via a CSS `@keyframes animation`, never a JS `setInterval` driving inline `style.width`
- **No hover-triggered transform** — per Cal.com's explicit rule, hover only darkens (`.btn-primary:hover`) or shifts elevation (cards); nothing moves, scales, or rotates on hover except `.btn-primary:active { transform: scale(0.98) }`
- **No bounce, no spring**

---

## 7. Layout Patterns

### Hero band
7/5 split on desktop: headline + sub + CTA row on the left, a product-mockup/hero-app card on the right. Collapses to single column on mobile (content first, mockup card below).

### Feature grid (3-up)
```css
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 24px;
```
2-up tablet, 1-up mobile.

### Pricing grid
4-up desktop → 2-up tablet → 1-up mobile. The featured tier is the only card that flips to `--surface-dark`; no accent border, no badge, no scale shift — the dark surface alone signals "featured."

### Mosaic grid (shared-border cards)
```css
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 1px;
background: var(--border);
border: 1px solid var(--border);
border-radius: 12px;
overflow: hidden;
```
This is the **single** blog-card grid pattern (`.bl-grid`). It's used everywhere a blog card grid appears — home teaser, related posts, and the blog index — not a separate lighter-weight card style per page.

---

## 8. Interactive Tabs / Accordion

Pattern used in `KnowledgeBaseSection`:
- Left: stacked tab buttons with a green progress bar driven by CSS `@keyframes`, not JS state, auto-advancing every 5s
- Right: swaps a visual panel, instant replace (no slide/fade)
- Active tab: full opacity, label + description visible
- Inactive tab: `opacity: 0.45`, no description

---

## 9. What NOT to do

- ❌ No colored CTA buttons — primary is always `var(--primary)` (near-black), never `--brand-accent` or a badge pastel
- ❌ No `--brand-accent` used as a repeated structural color (eyebrows, step numbers, nav badges) — it's for rare inline moments only
- ❌ No dark surfaces outside the footer and the featured pricing tier
- ❌ No `transform: translateY(...)` on card hover — elevation shift only
- ❌ No `border-radius` above `16px` anywhere
- ❌ No hardcoded hex colors in components — use tokens, including for severity/status colors
- ❌ No Tailwind utility classes for layout/color — CSS classes in `globals.css` only
- ❌ No Google Fonts CDN `<link>` tags — `next/font/google` only
- ❌ No emoji as UI (icons, nav items, buttons, toasts) — use icons or `badge-pill` text
- ❌ No colored italic `em` inside headlines
- ❌ No `localStorage`/`sessionStorage` in components
- ❌ No one-off inline-styled page layouts (legal pages, admin) that bypass `.section`/`.btn-*`/`.card` — every page reuses the shared component vocabulary

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

*Last updated: 2026-07-15. Rewritten to document the light Cal.com-style theme (see `DESIGN-cal.md` at the repo root for the full source analysis). Update this file whenever a new pattern is introduced.*
