# LLM Web App Blueprint — System Specification

> **Role:** Canonical specification — the authoritative source of truth for what the system _is_.
> **Reading order:** Start here. See `blueprint_rationale.md` for _why_, `blueprint_lab_notebook.md` for _how we got here_, `blueprint_theoretical_research.md` for foundational theory.

## Overview

LLMs produce inconsistent UI because the decision space per element is enormous (~134 independently variable properties). This blueprint inverts the usual design system philosophy: instead of maximizing flexibility, maximize constraint. ~124 of those 134 properties become deterministic consequences of a few choices per element — which tag, which skin, where in the grid, and what content. Claude never writes custom CSS. All styling comes from the system.

### Core Principle

**Coupling reduces decisions.** If you know the element is a button with the filled skin, you already know its color, hover behavior, focus ring, padding, border radius, cursor, and disabled state. Nothing left to decide.

### The Five Aspects

1. **HTML Element** — which tag. Determines behavior and accessibility.
2. **Skin** — composable visual modification (`data-skin="filled"`). Determines appearance. Multiple skins compose via space-separation.
3. **Placement** — direct card child (full width) or inside a row wrapper (shared width). The primary free variable.
4. **Content** — text, icon, image. Irreducible — always unique.
5. **Context** — inherited from parent. Gap, alignment, tone. Zero decisions.

### Constraints

- Works across screen sizes without per-page custom styling.
- No div or span.
- Inline styles are forbidden.
- Any new css class requires explicit PO approval.

### Target Apps

Single or few-page tools, mostly client-side, possibly with a small server. Productivity tools, interactive games, dashboards, forms, converters. Mostly simple, or with 1–2 complex features surrounded by simple structure.

---

## 1. HTML Elements — ~20 Tags

### Cards (body children, depth 2 — display: grid, gap --m, single-column stack)

- `<details>` + `<summary>` — **default card type.** Collapsible by default via native toggle. Non-collapsible cards: use `<details open data-fixed>` with chevron hidden and toggle prevented via CSS + Alpine. Summary acts as built-in header row wrapper.
- `<dialog>` — modal overlay card with backdrop, focus trap, Escape-to-close. Interior follows same rules as any card.

### Transparent Wrapper (display: contents — no visual chrome, no depth)

- `<form>` — submission scope only. Wraps inputs inside any card type. Never a visual container.

### Row Wrappers (inside cards, depth 3 — display: grid, 12-column, gap --s, no visual chrome)

- `<summary>` — details header row (inside `<details>` only). Clickable toggle target. Title row (typically h1–h4 + optional icon/action).
- `<section>` — generic multi-element row. Only used when 2+ elements share a horizontal row. Single elements are direct card children.

### Interactive Elements

- `<button>` — actions, toggles, triggers.
- `<input>` text cluster — text, number, search, password, email, url, tel. Same visual, different keyboards/validation.
- `<input type="range">` — slider. Native styling only.
- `<input type="date">` / `<input type="time">` — native pickers.
- `<input type="checkbox">` / `<input type="radio">` — binary/exclusive toggles.
- `<textarea>` — multi-line text.
- `<select>` — dropdown choice.


### Content / Text
- `<h1>` through `<h4>` — heading hierarchy. h5/h6 dropped
`<p>`
— paragraph text only. NOT used for layout wrapping. Inherits body defaults (color, font-size) — no explicit styling needed.
`<label>` — ties text to a control.
`<aside>` — supplementary info / tooltip host.

### Implicit Inline Formatting (allowed within text elements)

`<strong>`, `<code>`, `<ul>`/`<ol>`/`<li>`, `<s>, `<small>`, `<a>`, `<svg>`

### Popover Hosts (semantic element + popover attribute)

- Tooltip → `<aside popover>` — supplementary info
- Dropdown menu → `<nav popover>` — container with buttons/links.

### Deferred (not in current system, or only for different use case — future candidates)

- `<header>` — potential button group at top of card.
- `<footer>` — potential button group at bottom of card.
- `<nav>` — stays for popover menus only (`<nav popover>`). Deferred as general row wrapper, maybe for button group later.

### Category → Display Type

| Category    | Display       | Role                            | Elements                                                                  |
| ----------- | ------------- | ------------------------------- | ------------------------------------------------------------------------- |
| Card        | grid          | Holds and arranges children     | details, dialog                                                           |
| Wrapper     | grid (12-col) | Groups elements into rows       | section, summary                                                          |
| Transparent | contents      | Submission scope only           | form                                                                      |
| Component   | inline-block  | Self-contained interactive unit | button, text inputs, textarea, select, range, [popover]                   |

---

## 2. DOM Structure

```
body                              depth 1  (grid, gap --l, max 800px centered)
 └ details                        depth 2  (card, 1-col stack, grid, gap --m)
    ├ summary [row wrapper]       depth 3  (12-col grid, gap --s)
    │  ├ h3                       depth 4  (row child, fills cell)
    │  └ svg                      depth 4  (row child, fills cell)
    ├ form                        ----     (display:contents, transparent)
    │  ├ input                    depth 3  (direct card child, full width)
    │  ├ section [row wrapper]    depth 3  (12-col grid, gap --s)
    │  │  ├ button                depth 4  (row child, fills cell)
    │  │  └ button                depth 4  (row child, fills cell)
    │  └ textarea                 depth 3  (direct card child, full width)
    └ section [row wrapper]       depth 3  (12-col grid, gap --s)
       ├ button                   depth 4  (row child)
       └ button                   depth 4  (row child)
```

Max structural depth: 4 (html → body → details → content). Depth 5 for row children and HTML-mandated nesting (svg inside button, small inside p). Form is `display: contents` — transparent to the depth model.

### Rules

- Cards are body-level only. Row wrappers are card-level only.
- Single elements are direct card children.
- Non-collapsible cards: `<details open data-fixed>` with chevron hidden and toggle prevented. Same DOM structure, same rules. Requires Alpine `@toggle.prevent="$el.open = true"` to prevent JS-driven toggles. CSS hides chevron and disables summary click via `pointer-events: none` (re-enabled on children).

---

## 3. Custom Attributes

### data-skin — Composable Visual Modifications

Applied to any element. Selected via `[data-skin~="value"]`.

- **default** — the unskinned appearance. Buttons render with accent border, accent text, transparent background. Not a `data-skin` value — it's what you get when no skin is applied.
- **`filled`** — accent background, light text, accent border. Hover darkens to `--accent-dn`.
- **`ghost`** — transparent background, no border. Interactive elements: hover shows `--neutral-mute` background. Non-interactive: static.
- **`mute`** — `--text-mute` color.
- **`elevated`** — `box-shadow` for visual lift. Shadow base uses `oklch(0% 0 0)` (pure black) — not a lighter value, which is invisible against dark backgrounds. Includes a subtle `0 0 0 1px` ring for edge definition in dark mode.
- **`freeform`** — escape hatch. Removes system constraints from card interior via `all: revert`. Cards only. The author takes full responsibility for interior styling.

**Skin conflict groups** (mutually exclusive): filled | ghost (pick at most one).

### data-colspan — Row Child Width

How many of the 12 columns a child occupies inside a row wrapper. Children without `data-colspan` auto-span 1 column.

```html
<details open>
  <summary>
    <h3 data-colspan="12">Search</h3>
  </summary>
  <section>
    <input type="text" placeholder="Search…" data-colspan="10" />
    <button>×</button>
    <button data-skin="filled">⌕</button>
  </section>
</details>
```

Common patterns:

| Split        | Colspan values | Use case                            |
| ------------ | -------------- | ----------------------------------- |
| 50 / 50      | 6 + 6          | Button pair, label + input          |
| 75 / 25      | 9 + 3          | Input + action                      |
| 83 / 8 / 8   | 10 + 1 + 1     | Search bar (input + 2 icon buttons) |
| 33 / 33 / 33 | 4 + 4 + 4      | Three equal columns                 |
| 67 / 33      | 8 + 4          | Content + sidebar element           |
| Full width   | 12             | Span-full child inside a row        |

Supported colspan values: 1, 2, 3, 4, 6, 8, 9, 10, 11, 12. Values 5, 7 omitted — they don't produce clean ratios in a 12-column grid.

### data-fixed — Non-Collapsible Card Lock

Applied to `<details open>` to prevent collapse. CSS hides the chevron and sets `pointer-events: none` on `<summary>` (re-enabled on children so buttons still work). Requires Alpine `@toggle.prevent="$el.open = true"` because CSS alone cannot prevent JS-driven toggles.

```html
<details open data-fixed @toggle.prevent="$el.open = true">
  <summary>
    <h3 data-colspan="12">Actions</h3>
  </summary>
  <!-- content always visible, summary not clickable as toggle -->
</details>
```

### data-state — Signal States

A single attribute with three allowed values for application-level states that CSS pseudo-classes cannot detect.

`data-state="error"` / `data-state="loading"` / `data-state="success"`

**Strictly allowed values:** `error`, `loading`, `success`. No other values permitted. `warning`, `info`, `skeleton`, `empty` are explicitly excluded.

**Selector:** `[data-state="error"]`, `[data-state="loading"]`, `[data-state="success"]`. Alpine binding: `x-bind:data-state="currentState"`.

**Mutually exclusive by design.** An element is in one signal state or none. If an async operation fails, it's `error` — not simultaneously `loading`. If a retry begins, it returns to `loading`, replacing `error`.

**Why no `data-empty`?** Native CSS pseudo-classes (`:empty`, `:placeholder-shown`, `:not(:has(> *))`, negated `:has()`) cover >95% of empty-state detection. The remaining edge case — a container with DOM children that is semantically empty — is handled by Alpine's `x-show`/`x-if`, not CSS.

See §6 for the full state reference: all pseudo-classes, recommended CSS properties, and the decision guide for choosing HTML attributes vs pseudo-classes vs data attributes.

---

## 4. Color System

### Base Inputs (5 values)

```css
--accent-hue: 200;
--accent-chroma: 0.14;
--surface-hue: 250;
--jump: 0.17;
color-scheme: light dark;
```

### Derived Palette

```css
/* Accent */
--accent: oklch(58% var(--accent-chroma) var(--accent-hue));
--accent-up: oklch(
  calc(58% + var(--jump)) var(--accent-chroma) var(--accent-hue)
);
--accent-dn: oklch(
  calc(58% - var(--jump)) var(--accent-chroma) var(--accent-hue)
);

/* Surface levels — light-dark() for automatic dark mode */
--neutral: light-dark(
  oklch(96% 0.01 var(--surface-hue)),
  oklch(16% 0.01 var(--surface-hue))
);
--neutral-mute: light-dark(
  oklch(90% 0.01 var(--surface-hue)),
  oklch(22% 0.01 var(--surface-hue))
);
--neutral-edge: light-dark(
  oklch(82% 0.02 var(--surface-hue)),
  oklch(34% 0.02 var(--surface-hue))
);

/* Text */
--text: light-dark(
  oklch(20% 0.01 var(--surface-hue)),
  oklch(92% 0.01 var(--surface-hue))
);
--text-mute: light-dark(
  oklch(40% 0.01 var(--surface-hue)),
  oklch(72% 0.01 var(--surface-hue))
);

/* Text on accent — fixed near-white */
--text-on-accent: oklch(96% 0.01 var(--accent-hue));
```

### Visual Depth Model

| Layer       | Background       | Elements                        |
| ----------- | ---------------- | ------------------------------- |
| Body        | `--neutral`      | body                            |
| Card        | `--neutral-mute` | details, dialog, [popover]*     |
| Row wrapper | transparent      | section, summary                |
| Control     | `--neutral`      | button, input, textarea, select |

\* **Popover dual nature:** Popovers are visually cards (same background, border, radius) but positionally overlays (out-of-flow). They appear in the Visual Depth Model at the Card layer for styling, and in the Layout Model (§5) at Layer 2 for positioning.

### Scale

```css
--0: 0;
--xs: clamp(0.2rem, 0.4vw, 0.4rem);
--s: clamp(0.4rem, 1vw, 0.8rem);
--m: clamp(0.8rem, 2vw, 1.6rem);
--l: clamp(1.2rem, 4vw, 2.4rem);
--xl: clamp(1.6rem, 6vw, 3.6rem);
```

Used for: spacing (gap, padding), font-size, border-radius, outline width/offset, etc.

> **TODO:** Evaluate splitting scale into separate padding/gap tokens vs. font-size tokens. Current system uses the same scale for both. May want distinct progressions for spatial vs. typographic use.

---

## 5. Layout Model

### Cards as Single-Column Stacks (F4 Architecture)

Cards (details, dialog) are always single-column grids. Every direct child occupies a full-width row. No attribute needed.

```css
details,
dialog {
  display: grid;
  gap: var(--m);
}
```

Multi-element rows are handled by row wrappers. Single elements are direct card children.

### Row Wrappers (12-Column Grid)

Row wrappers (`<section>`, `<summary>`) wrap 2+ elements that share a horizontal row. No visual chrome — transparent background, no border. 12-column grid via CSS. Children claim columns via `data-colspan="N"`.

```html
<details open>
  <summary>
    <h3 data-colspan="12">Settings</h3>
  </summary>
  <section>
    <button data-colspan="6">Cancel</button>
    <button data-colspan="6" data-skin="filled">Save</button>
  </section>
  <input type="text" placeholder="Name" />
</details>
```

### Body Grid

Body is a grid with `gap: var(--l)`, `max-inline-size: 800px`, `margin-inline: auto`. Children are cards.

### Two-Layer System

**Layer 1 — In-flow grid:** All normal page content. Cards stacked in body grid. Content stacked in card grid. Multi-element rows in row wrappers.

**Layer 2 — Out-of-flow overlays:**

- `<aside popover>` — tooltip
- `<nav popover>` — dropdown menu
- `<dialog>` — modal (backdrop + focus trap + Escape)

**Popover DOM placement rule:** `<aside popover>` and `<nav popover>` must be **body-level siblings**, not nested inside `<details>`. If placed inside a `<details>`, the popover is hidden when the card is closed — making trigger buttons on the summary non-functional. The trigger button goes inside the card's `<summary>`; the popover element goes outside, as a sibling after the `</details>`.

**Popover CSS architecture:** The `[popover]` base state must be visually empty (`background: transparent; border: none; padding: 0; opacity: 0`). All card styling (background, border, padding, shadow) applies only via `:popover-open`. This prevents a flash of unstyled content on the closing frame — when `:popover-open` drops, the element is still briefly visible before `display: none` takes effect.

### Sizing Model

All elements are content-intrinsic. Width is determined by placement (body grid → card, card grid → full width, row wrapper → colspan). Height is determined by content + padding. No element has an explicit width, height, or min-height. Cards, rows, and controls grow to fit their content. This is not a simplification — it is the sizing model.

### Escape Hatch

`data-skin="freeform"` on any card. Externally fits the body stack; internally unconstrained. For game canvases, data visualizations, complex widgets, third-party embeds.

---

## 6. State Automation

Claude never writes state styles. All states are derived from element default + skin + color system via CSS. This section is the canonical reference for every state the system handles.

### Native Interactive States (pseudo-classes — all automated)

| State | Selector | CSS properties | Applies to |
|-------|----------|---------------|------------|
| **Hover** | `:hover:not(:disabled)` | `background: var(--neutral-mute)` | button (default), button (ghost), summary (ghost) |
| | `:hover:not(:disabled)` | `background: var(--accent-dn); border-color: var(--accent-dn)` | button (filled) |
| | `:hover` | `text-decoration: underline` | `a` |
| **Active** | `:active:not(:disabled)` | `transform: scale(0.98)` | button |
| **Focus** | `:focus-visible` | `outline: var(--xs) solid var(--accent); outline-offset: var(--xs)` | button, input, textarea, select, a, summary |
| **Disabled** | `:disabled` | `opacity: 0.38; cursor: not-allowed; filter: grayscale(0.4)` | button, input, textarea, select |
| **Checked** | `:checked` | `accent-color: var(--accent)` (native rendering) | input[type="checkbox"], input[type="radio"] |

### Native Content & Validation States (pseudo-classes)

These pseudo-classes detect state natively — no JS, no data attributes. Only states relevant to PAUMEN's target apps (forms, dashboards, small tools) are listed.

| State | Selector | Recommended CSS | Why it matters |
|-------|----------|----------------|----------------|
| **Empty container** | `:empty`, `:not(:has(> li))` | `display: none` or placeholder via `::before` | Empty lists, empty card bodies. Eliminates `data-empty`. Variant `:not(:has(> *))` ignores whitespace. |
| **Unfilled input** | `:placeholder-shown` | `border-color: var(--neutral-edge)` (or muted label) | Detect inputs the user hasn't touched. Useful for floating labels or "incomplete" styling. |
| **Invalid (after interaction)** | `:user-invalid` | `border-color: var(--color-danger); outline-color: var(--color-danger)` | HTML validation failed AND user has interacted. Covers `required`, `pattern`, `type`, `min`/`max` — no JS. Prefer over `:invalid` which fires on page load before user acts. **Implemented in CSS.** |
| **Valid (after interaction)** | `:user-valid` | `border-color: var(--color-success)` | Positive confirmation after user fills a field correctly. Subtle — don't overuse. |
| **Read-only** | `:read-only` | `background: var(--neutral-edge); border-style: dashed; color: var(--text-mute); cursor: default; outline: none` | Non-editable inputs displaying computed/locked values. Must use `tabindex="-1"` in HTML to remove from tab order. Background must differ from card (`--neutral-mute`) — uses `--neutral-edge` for contrast. |
| **Indeterminate** | `:indeterminate` | `opacity: 0.6` (native rendering) | Checkbox "select all" when some items checked. Common in dashboard list patterns. |
| **Details expanded** | `[open]` | (already handled — summary arrow rotates) | `<details>` is the primary card type; open/closed is core to the layout. |
| **Popover visible** | `:popover-open` | `opacity: 1` (with transition from 0) | Tooltips (`aside[popover]`) and menus (`nav[popover]`). Enables enter/exit animations. |

**Intentionally excluded:** `:valid`/`:invalid` (fire before user interacts — bad UX; use `:user-valid`/`:user-invalid`), `:required`/`:optional` (over-engineering for small tools — context makes this obvious), `:in-range`/`:out-of-range` (subsumed by `:user-invalid`), `:target` (hash navigation irrelevant to SPA-like tools).

### Signal States (data attributes — implemented)

For application-level states that no CSS pseudo-class can detect — specifically, outcomes of async operations or server responses.

| State | Selector | CSS properties | When to use (and not) |
|-------|----------|----------------|----------------------|
| **Error** | `[data-state="error"]` | `border-color: var(--color-danger); color: var(--color-danger)` | API failure, server error, custom async validation. **Not** for HTML validation — use `required`/`pattern` + `:user-invalid` instead. |
| **Loading** | `[data-state="loading"]` | `animation: pulse 1.5s ease-in-out infinite; opacity: 0.6` | Async operation in progress (fetch, save, compute). No native pseudo-class for this. |
| **Success** | `[data-state="success"]` | `border-color: var(--color-success)` | Action confirmed (save, submit, delete). Typically shown briefly then cleared. Distinct from `:user-valid` which is per-field. |

**Filled + signal state interaction:** When `data-skin="filled"` and `data-state` are both present, the signal state replaces the entire filled appearance — background, border-color, and text all shift to the signal color. These overrides must live **outside CSS layers** (unlayered CSS) because `@layer skin` filled rules override `@layer default` signal rules regardless of specificity. See §7 CSS Architecture.

Signal hues (danger, success) are derived from accent — hue values only, saturation and lightness reuse the accent formula.

**`:user-invalid` vs `data-state="error"`:** Same visual (danger hue), different source. `:user-invalid` is free — the browser detects it from HTML attributes. `data-state="error"` requires JS. Most form validation should be HTML-native; `data-state="error"` is strictly for what the browser can't know:

- **Server-side rejection** — username already taken, payment declined, email undeliverable
- **Network failure** — fetch failed, timeout, offline
- **Cross-field validation** — end date before start date, password confirmation mismatch, total exceeds budget
- **Async verification** — address lookup invalid, API key rejected, file upload corrupted
- **Business logic** — insufficient balance, schedule conflict, rate limit exceeded

### State Decision Guide

When deciding how to express a state, follow this priority:

1. **HTML attribute first** — `required`, `disabled`, `readonly`, `open`, `min`/`max`, `pattern`, `type`. Free. The browser enforces them and CSS pseudo-classes detect them automatically.
2. **CSS pseudo-class second** — `:empty`, `:placeholder-shown`, `:user-invalid`, `:user-valid`, `:read-only`, `:indeterminate`, `:popover-open`. Zero JS needed.
3. **Data attribute last** — `data-state="error"`, `data-state="loading"`, `data-state="success"`. Only for states originating from application logic (API calls, async operations) that the browser cannot observe.

---

## 7. CSS Architecture

### Four Layers + Unlayered Overrides

```css
@layer reset, default, skin, grid;
```

Signal state overrides for filled skins (`[data-skin~="filled"][data-state="..."]`) must live **outside all layers** (unlayered CSS). Unlayered CSS always wins over all `@layer` rules regardless of specificity. This is necessary because `@layer skin` filled rules would otherwise override `@layer default` signal states.

### Reset (3 rules)

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
body,
h1,
h2,
h3,
h4,
p,
ul,
ol {
  margin: 0;
}
button,
input,
textarea,
select {
  font: inherit;
  color: inherit;
}
li {
  list-style: none;
}
```

### Default Layer

- **Body:** grid, gap --l, max-inline-size 800px, margin-inline auto, padding --m, font-family Nunito (system-ui fallback), --m base size, --text color, --neutral bg.
- **Containers** (`details, dialog`): --neutral-mute bg, border 1px solid --neutral-edge, radius --m, padding --m, display grid, gap --m, `transition: border-color 0.15s ease`. `details` also gets `overflow: hidden`.
- **Non-collapsible cards** (`details[data-fixed]`): summary gets `list-style: none; pointer-events: none`, children get `pointer-events: auto`. Chevron markers hidden.
- **Popover base** (`[popover]`): `opacity: 0; background: transparent; border: none; padding: 0`. All visual card styling is on `:popover-open` only — prevents flash of unstyled element when popover closes.
- **Popover open** (`:popover-open`): card styling (--neutral-mute bg, border, radius, padding) + `box-shadow` + `z-index: 10` for overlay depth.
- **Row wrappers** (`section, summary`): display grid, grid-template-columns repeat(12, 1fr), gap --s, place-items center start. Transparent — no visual styling.
- **Form:** display contents.
- **Dialog:** padding --l, max-inline-size min(600px, 90vw), `::backdrop` with `oklch(20% 0 0 / 0.5)`. Focus trap is browser-native via `showModal()`.
- **Headings h1–h4:** Sizes: h1/h2 --xl, h3 --l, h4 --m.
- **Shared control base** (`button, input, textarea, select`): border 1px solid --neutral-edge, radius --s, --neutral bg, --text color, padding --s, width 100%, transition.
- **Focus ring:** --xs solid --accent, --xs offset. Unified across all interactive elements.
- **User-invalid:** `:user-invalid` — border-color and outline-color set to --color-danger. Fires only after user interaction.
- **Disabled:** opacity 0.38, cursor not-allowed, filter grayscale(0.4). Unified across all controls.
- **Readonly:** background --neutral-edge (must contrast with card bg --neutral-mute), border-style dashed, color --text-mute, cursor default, outline none. HTML should include `tabindex="-1"`.
- **Button:** border 2px solid --accent, cursor pointer, transparent bg, --accent color, font-weight 700, inline-flex, place-items/content center, gap --xs. Hover fills to --neutral-mute. Active: scale 0.98.
- **Select:** custom dropdown arrow (SVG data URI), appearance:none.
- **Range:** stripped to native (transparent bg, no border/padding, accent-color).
- **Checkbox/radio:** sized to --m, accent-color, no border/padding/bg, cursor pointer.

### Skin Layer

Composable via `[data-skin~="value"]`:

- **Visual:** filled, ghost, mute.
- **Elevation:** elevated.
- **Escape:** freeform.

### Grid Layer

```css
@layer grid {
  [data-colspan="1"] {
    grid-column: span 1;
  }
  [data-colspan="2"] {
    grid-column: span 2;
  }
  [data-colspan="3"] {
    grid-column: span 3;
  }
  [data-colspan="4"] {
    grid-column: span 4;
  }
  [data-colspan="6"] {
    grid-column: span 6;
  }
  [data-colspan="8"] {
    grid-column: span 8;
  }
  [data-colspan="9"] {
    grid-column: span 9;
  }
  [data-colspan="10"] {
    grid-column: span 10;
  }
  [data-colspan="11"] {
    grid-column: span 11;
  }
  [data-colspan="12"] {
    grid-column: span 12;
  }
}
```

Selectors are global (not scoped to row wrapper children) — flat specificity. Only take effect inside a grid parent. Gap is --s (tighter than card's --m) because row children are siblings in a single line.

---

## 8. Icon System (Optional Layer)

The icon system is an optional visual enhancement layer. It uses Phosphor Icons loaded via CDN and CSS class selectors (`.ph-*`). This is the **one exception** to the "zero CSS classes" rule currently — icon classes are managed by the external library, not authored in PAUMEN CSS.

### Setup

```html
<script src="https://unpkg.com/@phosphor-icons/web@2.1.1"></script>
```

### Stroke → Fill Swap

Icons have two variants inline: a stroke (bold) version shown by default, and a fill (duotone) version shown on hover/focus. The fill variant is marked with `data-icon-fill` and hidden by default.

```html
<button>
  <i class="ph-bold ph-gear" aria-hidden="true"></i>
  <i class="ph-duotone ph-gear" aria-hidden="true" data-icon-fill></i>
  Settings
</button>
```

```css
[data-icon-fill] {
  display: none;
}

:is(a, button):hover [data-icon-fill],
:is(a, button):focus-visible [data-icon-fill] {
  display: inline-block;
}

:is(a, button):hover i:has(~ [data-icon-fill]),
:is(a, button):focus-visible i:has(~ [data-icon-fill]) {
  display: none;
}
```

### Icon Animations (scoped to specific icons, never global)

- **Gear:** continuous spin on parent hover. Settings buttons.
- **Trash:** bounce + danger color on parent hover. Destructive actions.
- **Reset arrow:** single counter-clockwise sweep on parent hover.
- All animations disabled under `prefers-reduced-motion: reduce`.

### Rules

- Icons always use `aria-hidden="true"`. Accessible label goes on the parent element.
- Icon classes (`.ph-bold`, `.ph-duotone`) are the only CSS classes in the system.
- Animations are scoped to specific icon names, never applied to icon classes globally.

---

## 9. Interactivity — Alpine.js Directives

| Directive | Role |
|-----------|------|
| `x-data` | State declaration — defines reactive state on an element |
| `x-on` | Event binding — binds DOM events to expressions. Shorthand `@click` permitted |
| `x-text` | Text output — sets `textContent` reactively |
| `x-for` | List rendering — renders arrays. Must be on a `<template>` element |
| `x-bind` | Attribute binding — dynamically sets attributes (`disabled`, `data-skin`, `data-state`, `aria-*`). Shorthand `:attr` permitted |

---

## 10. Reconciliation Log

After removing `<article>` and making `<details>` the default card, and simplifying row wrappers to `<section>` + `<summary>` only:

- **S1:** No nested cards. Cards are flat, body-level only.
- **S2:** form = always `display: contents`, never a visual container.
- **S3:** `<details>` = default card. `<details open>` with chevron hidden = non-collapsible card.
- **S4:** dialog interior = same rules as any card. One interior pattern for all card types.
- **S6:** `<article>` cut. Replaced by `<details>` as default card.
- **S7:** `<header>`, `<footer>`, `<nav>` deferred as row wrappers. Nav stays for popover menus.
- **S8:** Inline formatting (`<strong>`, `<code>`, `<s>`, `<ul>`/`<ol>`/`<li>`) implicit, not spec-listed.
- **S15:** Drop `data-colcount`. Always 12.
- **S18:** summary = row wrapper (12-col grid). Built-in header for details cards.
- **S19:** Escape hatch via `data-skin="freeform"` on cards.
- **S20:** Spec values reconciled with shipped CSS (spacing scale, color tokens, token-to-property mappings).

Element count: ~20 tag names. total bit higher counting input type variants and h1–h4.

---

## 11. Spec Criticality Tiers

### Tier 1 — Locked (structural, do not change without explicit decision)

- Card type: `<details>` default, `<dialog>` for modals.
- Row wrappers: `<summary>` + `<section>`
- Grid architecture: F4 (1-col stack + row wrappers), 12-column.
- Four CSS layers: reset → default → skin → grid. Plus unlayered signal state overrides.
- Claude never writes CSS.
- No CSS classes — element selectors + attribute selectors only (icon classes excepted).
- No div or span.
- Skins via `data-skin`, composable, 5 values: filled, ghost, mute, elevated, freeform. Default (unskinned) appearance is not a `data-skin` value.
- Color system: oklch, light-dark(), 5 base inputs.
- Max depth 4 (body → card → row wrapper → child). Depth 5 for row children only.
- Body: max-inline-size 800px, margin-inline auto.
- Popover hosts: aside (tooltip), nav (dropdown). Must be body-level siblings, never inside `<details>`.
- Non-collapsible cards: `data-fixed` attribute + Alpine `@toggle.prevent`.

### Tier 2 — Tunable (visual tokens, adjustable through testing)

- Spacing scale values (--xs, --s, --m, --l, --xl clamp ranges).
- Color values (accent-hue, jump, neutral-mute/edge lightness percentages).
- Token-to-property mappings (which token for card gap, card radius, control radius, etc.).
- Font family (currently Nunito).
- Font weight values (button: 700, output: 700).
- Heading sizes (h1/h2: --xl, h3: --l, h4: --m).
- Transition durations and easings.
- Box-shadow values for elevated skin.

### Tier 3 — Deferred (acknowledged gaps, not yet implemented)

- ~~Signal state CSS implementation (`data-state="error|loading|success"`) and signal hues (danger, success).~~ **Done.** Implemented in CSS. Signal states in default layer + unlayered overrides for filled skins.
- `<header>`, `<footer>`, `<nav>` as row wrappers (currently deferred; nav stays for popovers).
- Partial-width single elements (sizing skins vs row wrapper with empty cols).
- CLAUDE.md (<200 lines) + component catalog skill file.
- Validator script (HTML parser to flag unauthorized elements/styles/skins).
- Reference app (planned for end of stage 1).
- Split spacing scale into padding/gap tokens vs. font-size tokens.

---

## 12. UAT Findings Log

Findings from manual UAT testing of the pre-prototype Settings reference app. Each finding represents a spec gap or ambiguity that caused incorrect implementation. Codified here to prevent recurrence.

### Popover Close Flash (Critical)

**Symptom:** When `<nav popover>` dropdown closes, a white/bordered rectangle flashes for one frame before disappearing.

**Root cause:** `[popover]` base state had visible CSS (background, border, padding inherited from browser defaults). When `:popover-open` drops, the element is still rendered for one frame before `display: none` kicks in — showing the unstyled base state.

**Fix:** `[popover]` base state must be visually empty: `background: transparent; border: none; padding: 0; opacity: 0`. All visual card styling belongs exclusively on `:popover-open`.

**Spec update:** §5 Layout, §7 CSS Architecture.

### Popover Inside Details (Critical)

**Symptom:** Clicking the "?" help button on the Appearance card header does nothing when the card is collapsed — even though the button is visible on the summary.

**Root cause:** `<aside popover>` was nested inside `<details>`. When `<details>` is closed, all content except `<summary>` is hidden (`display: none`), including the popover target element. The browser can't open a popover that has `display: none`.

**Fix:** Popover elements (`<aside popover>`, `<nav popover>`) must be body-level siblings, placed after the `</details>` that contains their trigger button.

**Spec update:** §5 Layout — new DOM placement rule.

### Signal States vs CSS Layers (Critical)

**Symptom:** Save button "Saved!" state showed no green. Delete button error state showed no red. Both stayed at their normal accent color.

**Root cause:** Signal state rules (`[data-state="success"]`) were in `@layer default`. Filled skin rules (`[data-skin~="filled"]`) were in `@layer skin`. CSS layers: later layers always win regardless of specificity. The skin layer's `border-color: var(--accent)` and `background: var(--accent)` overrode the signal state's `border-color: var(--color-success)`.

**Fix:** Signal state overrides for filled skins must be **unlayered** (outside any `@layer` block). Unlayered CSS always beats all layers.

**Spec update:** §6 Signal States, §7 CSS Architecture, §11 Tier 1.

### Non-Collapsible Cards (High)

**Symptom:** Actions card could still be collapsed by clicking the heading, despite `<details open>` with chevron hidden.

**Root cause:** CSS can hide the chevron marker, but clicking any part of `<summary>` still triggers the native `<details>` toggle. `pointer-events: none` on `<summary>` was bypassed by child elements with `pointer-events: auto` — click events on children bubble up and trigger the toggle.

**Fix:** `data-fixed` attribute + Alpine `@toggle.prevent="$el.open = true"`. CSS handles visual (hide chevron, disable summary cursor). Alpine handles behavioral (intercept toggle event, force open).

**Spec update:** §1, §2, §3 (new `data-fixed` attribute), §11 Tier 1.

### Disabled State Barely Visible (Medium)

**Symptom:** "Export Data" disabled button was hard to distinguish from enabled buttons.

**Root cause:** Spec said `opacity: 0.5` which is insufficiently distinct, especially with accent-colored borders.

**Fix:** `opacity: 0.38; filter: grayscale(0.4); cursor: not-allowed`. The grayscale strips accent color, making disabled state obvious.

**Spec update:** §6 State Automation, §7 Default Layer.

### Readonly Indistinguishable from Editable (Medium)

**Symptom:** "Max Items: 10" looked identical to other input fields. Appeared as a random number rather than a locked field.

**Root cause:** Spec said `opacity: 0.7; cursor: default` — still looks like a normal input. Also used `--neutral-mute` background which matches the card background, making the field invisible.

**Fix:** `background: var(--neutral-edge); border-style: dashed; color: var(--text-mute); cursor: default; outline: none; tabindex="-1"`. Dashed border + different background clearly signals "non-editable." `tabindex="-1"` removes from tab order.

**Spec update:** §6 State Automation, §7 Default Layer.

### Elevated Skin Invisible in Dark Mode (Medium)

**Symptom:** Schedule & Tags card showed no elevation difference from other cards in dark mode.

**Root cause:** Shadow base used `oklch(20% 0 0)` — a dark gray that's invisible against dark backgrounds.

**Fix:** Use `oklch(0% 0 0)` (pure black) for shadow + add `0 0 0 1px oklch(50% 0 0 / 0.06)` ring for edge definition.

**Spec update:** §3 elevated skin description.

### :user-invalid Not Implemented (Low)

**Symptom:** Clearing a required field and tabbing away showed no validation hint in Edge.

**Root cause:** `:user-invalid` was listed in the spec as a recommended pseudo-class but had no CSS implementation. Edge doesn't show browser-native validation UI on blur — only on form submission.

**Fix:** Added `:user-invalid { border-color: var(--color-danger); outline-color: var(--color-danger) }` to CSS. Now works across all browsers after user interaction.

**Spec update:** §6 Content & Validation States table — marked as implemented.

### Open Issues (from UAT, not yet resolved)

- **Inline style on menu icon button:** `style="font-size: var(--l)"` was needed to make the hamburger icon large enough. This violates the "inline styles are forbidden" constraint. Needs a spec-compliant solution — either an icon-size skin or a CSS rule for icon buttons in summaries.
- **Nav popover close flash:** Still present despite base-state fix (1 remaining partial fail). May need `display: none` immediately on close via JS, or popover exit animation timing adjustment.
