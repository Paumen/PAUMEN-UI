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

## 1. HTML Elements — ~25 Tags

### Container (body children, depth 2 — display: grid, gap --l, single-column stack)

- `<details>` + `<summary>` — **default containter type.** Collapsible by default via native toggle.
- `<article>` + `<header>`collapsible details/summary is preferred, strictly when there's very specific reason that requires non-collapsible container, use article + header instead.
- `<dialog>` — modal overlay card with backdrop, focus trap, Escape-to-close. Interior follows same rules as any card.

### Row  (inside containers, depth 3 — display: grid, 12-column, gap --m, no visual chrome)

- `<summary>` — details header row (inside `<details>` only). Clickable toggle target. Title row, by default same font styles as `<h3>`, only use h1-h4 for specific reason to deviate. Optional icon/action.
- `<section>` — generic multi-element row. Only used when 2+ elements share a horizontal row. Single elements are direct card children.
- `<form>` Wraps labels and inputs. Per default 12 columns and as many rows as needed. Per default labels take 3/12 columns, inputs 9/12 columns. Buttons 6 columns, unless icon buttons. Icon buttons come on same row as inputs at the end, taking away column from inputs.
- `<fieldset>` + `<legend>` for example for <input type="checkbox">` / `<input type="radio">`
- `<footer>` Footer can be used as row at the bottom of a container to for example group two buttons.
- `<ul>`/`<ol>`/`<li>` for lists.
- `<p>` paragraph text only. 

### Interactive Elements

- `<button>` — actions, toggles, triggers.
- `<input>` text cluster — text, number, search, password, email, url, tel. Same visual, different keyboards/validation.
- `<input type="range">` — slider. Native styling only.
- `<input type="date">` / `<input type="time">` — native pickers.
- `<input type="checkbox">` / `<input type="radio">` — binary/exclusive toggles.
- `<textarea>` — multi-line text. Same formatting as <input>
- `<select>` — dropdown choice.

### Content / Text
- `<h1>` through `<h4>` — Per default `<summary>` and sometimes `<header>` are first rows in containers and already apply same formatting as <h3>, only uses h1-h4 if specific reason to deviate fro. thism. heading hierarchy.
`<label>` — ties text to a control.
`<aside>` — supplementary info / tooltip host.

### Implicit Inline Formatting (allowed within text elements)

`<strong>`, `<code>`, `<s>, `<small>`, `<a>`, `<svg>`

### Popover Hosts (semantic element + popover attribute)

- Tooltip → `<aside popover>` — supplementary info
- Dropdown menu → `<nav popover>` — container with buttons/links.

### Category → Display Type

| Category    | Display       | Role                            | Elements                                                                  |
| ----------- | ------------- | ------------------------------- | ------------------------------------------------------------------------- |
| Container        | grid          | Holds and arranges children     | details, dialog                                                           |
| Rows     | grid (12-col) | Groups elements into rows       | section, summary, header, form, field set, footer, list                                                          |
| Component   | inline-block  | Self-contained interactive unit | button, text inputs, textarea, select, range, [popover]                   |

---

## 2. DOM Structure example

```
body                              depth 1  (grid, gap --l, max 800px centered)
 └ details                        depth 2  (card, 1-col stack, grid, gap --l)
    ├ summary [row wrapper]       depth 3  (12-col grid, gap --m)
    │  ├ text                     depth 4 
    │  └ svg                      depth 4  (row child, fills cell)
    ├ form                        depth 3 (12-col)
       ├ label                    depth 4  (3-col)
       ├ input                    depth 4  (9-col)
       ├ label                    depth 4  (3-col) 
       ├ input                    depth 4  (9-col)
       ├ label                    depth 4  (3-col)
       ├ textarea                 depth 4  (9-col)
       ├ button                   depth 4  (6-col)
       └ button                   depth 4  (6-col)
```

Max structural depth: 4 (html → body → details → content). Depth 5 for row children and HTML-mandated nesting (svg inside button, small inside p). 

### Rules

- Containers are body-level only. Row wrappers are card-level only.
- Single elements are direct card children.

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
    Search
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
| 50 / 50      | 6 + 6          | Button pair            |
| 25 / 75      | 3 + 9          | label + input          |
| 75 / 25      | 9 + 3          | Input + action         |
| 84 / 8 / 8   | 10 + 1 + 1     | Search bar (input + 2 icon buttons) |
| 33 / 33 / 33 | 4 + 4 + 4      | Three equal columns                 |
| Full width   | 12             | Span-full child inside a row        |

Supported colspan values: 1, 2, 3, 4, 6, 8, 9, 10, 11, 12. Values 5, 7 omitted — they don't produce clean ratios in a 12-column grid.


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
--surface-hue: 220;
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
| Container        | `--neutral-mute` | details, dialog, [popover]*     |
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

Containers (details, dialog) are always single-column grids. Every direct child occupies a full-width row. No attribute needed.

```css
details,
dialog {
  display: grid;
  gap: var(--l);
}
```

Multi-element rows are handled by row wrappers. Single elements are direct card children.

### Row Wrappers (12-Column Grid)

Row wrappers (`<section>`, `<summary>`, etc.) wrap 2+ elements that share a horizontal row. No visual chrome — transparent background, no border. 12-column grid via CSS. Children claim columns via `data-colspan="N"`.

```html
<details open>
  <summary>
    Settings
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

Signal state overrides for filled skins (`[data-skin~="filled"][data-state="..."]`) must live **in last layers**. This is necessary because `@layer skin` filled rules would otherwise override `@layer default` signal states.

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
- **Row wrappers** (`section, summary`): display grid, grid-template-columns repeat(12, 1fr), gap --s, place-items center start. Transparent — no visual styling. Summary gets `font-size: var(--l)` — card headers are visually larger, and icon buttons in summaries inherit the correct size without inline styles.
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

Selectors are global (not scoped to row wrapper children) — flat specificity. Only take effect inside a grid parent. Gap is --m (tighter than container's --l) because row children are siblings in a single line.

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

- **S1:** No nested containers. Containers are flat, body-level only.
- **S4:** dialog interior = same rules as any card. One interior pattern for all card types.
- **S18:** summary = row wrapper (12-col grid). Built-in header for details cards.
- **S19:** Escape hatch via `data-skin="freeform"` on cards.
- **S20:** Spec values reconciled with shipped CSS (spacing scale, color tokens, token-to-property mappings).

Element count: ~25 tag names. total bit higher counting input type variants and h1–h4.

---
