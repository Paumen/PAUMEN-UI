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

- `<details>` + `<summary>` — **default card type.** Collapsible by default via native toggle. Non-collapsible cards: use `<details open>` with chevron hidden via CSS. Summary acts as built-in header row wrapper.
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
- Non-collapsible cards: `<details open>` with chevron hidden. Same DOM structure, same rules.

---

## 3. Custom Attributes

### data-skin — Composable Visual Modifications

Applied to any element. Selected via `[data-skin~="value"]`.

- **default** — the unskinned appearance. Buttons render with accent border, accent text, transparent background. Not a `data-skin` value — it's what you get when no skin is applied.
- **`filled`** — accent background, light text, accent border. Hover darkens to `--accent-dn`.
- **`ghost`** — transparent background, no border. Interactive elements: hover shows `--neutral-mute` background. Non-interactive: static.
- **`mute`** — `--text-mute` color.
- **`elevated`** — `box-shadow` for visual lift.
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

### data-state — Signal States (not yet implemented)

`error` / `warning` / `info` / `success` / `loading` / `skeleton` / `empty`

Signal hues (danger, warning, success, info) are derived from accent — hue values only, saturation and lightness reuse the accent formula. Visual effects per state:

- **Error:** border and text shift to danger hue
- **Warning:** border shifts to warning hue
- **Success:** border/icon shifts to success hue
- **Info:** border shifts to info hue
- **Loading:** skeleton pulse animation
- **Skeleton:** placeholder shimmer (content not yet loaded)
- **Empty:** placeholder content shown

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

### Sizing Model

All elements are content-intrinsic. Width is determined by placement (body grid → card, card grid → full width, row wrapper → colspan). Height is determined by content + padding. No element has an explicit width, height, or min-height. Cards, rows, and controls grow to fit their content. This is not a simplification — it is the sizing model.

### Escape Hatch

`data-skin="freeform"` on any card. Externally fits the body stack; internally unconstrained. For game canvases, data visualizations, complex widgets, third-party embeds.

---

## 6. State Automation

Claude never writes state styles. All states are derived from element default + skin + color system via CSS.

### Interactive States (via pseudo-classes)

- **Hover:** button (outlined default) fills to --neutral-mute. Filled skin darkens to --accent-dn. Ghost shows --neutral-mute on interactive elements only. Links (`<a>`) show text-decoration underline on hover.
- **Active:** scale 0.96.
- **Focus-visible:** --xs solid --accent ring, --xs offset. All interactive elements.
- **Disabled:** opacity 0.5, cursor not-allowed. All controls.
- **Checked/selected:** accent-color on checkbox/radio.

### Signal States

See §3 `data-state` for the canonical definition of all signal states and their visual effects.

---

## 7. CSS Architecture

### Four Layers

```css
@layer reset, default, skin, grid;
```

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
- **Containers** (`details, dialog ): --neutral-mute bg, border 1px solid --neutral-edge, radius --m, padding --m, display grid, gap --m.
- **Row wrappers** (`section, summary`): display grid, grid-template-columns repeat(12, 1fr), gap --s, place-items center start. Transparent — no visual styling.
- **Form:** display contents.
- **Dialog:** padding --l, max-inline-size min(600px, 90vw), `::backdrop` with `oklch(20% 0 0 / 0.5)`. Focus trap is browser-native via `showModal()`.
- **Headings h1–h4:** Sizes: h1/h2 --xl, h3 --l, h4 --m.
- **Shared control base** (`button, input, textarea, select`): border 1px solid --neutral-edge, radius --s, --neutral bg, --text color, padding --s, width 100%, transition.
- **Focus ring:** --xs solid --accent, --xs offset. Unified across all interactive elements.
- **Disabled:** opacity 0.5, cursor not-allowed. Unified across all controls.
- **Button:** border 2px solid --accent, cursor pointer, transparent bg, --accent color, font-weight 700, inline-flex, place-items/content center, gap --xs. Hover fills to --neutral-mute. Active: scale 0.96.
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

## 9. Reconciliation Log

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

Element count: ~19 unique tag names. ~23 total entries counting input type variants and h1–h4.

---

## 10. Spec Criticality Tiers

### Tier 1 — Locked (structural, do not change without explicit decision)

- Card type: `<details>` default, `<dialog>` for modals.
- Row wrappers: `<summary>` + `<section>`
- Grid architecture: F4 (1-col stack + row wrappers), 12-column.
- Four CSS layers: reset → default → skin → grid.
- Claude never writes CSS.
- No CSS classes — element selectors + attribute selectors only (icon classes excepted).
- No div or span.
- Skins via `data-skin`, composable, 5 values: filled, ghost, mute, elevated, freeform. Default (unskinned) appearance is not a `data-skin` value.
- Color system: oklch, light-dark(), 5 base inputs.
- Max depth 4 (body → card → row wrapper → child). Depth 5 for row children only.
- Body: max-inline-size 800px, margin-inline auto.
- Popover hosts: aside (tooltip), nav (dropdown).

### Tier 2 — Tunable (visual tokens, adjustable through testing)

- Spacing scale values (--xs, --s, --m, --l, --xl clamp ranges).
- Color values (accent-hue, jump, neutral-mute/edge lightness percentages).
- Token-to-property mappings (which token for card gap, card radius, control radius, etc.).
- Font family (currently Nunito).
- Font weight values (button: 700, output: 700).
- Heading sizes (h1/h2: --xl, h3: --l, h4: --m).
- Icon tokens (--icon-s, --icon-m).
- Transition durations and easings.
- Box-shadow values for elevated skin.

### Tier 3 — Deferred (acknowledged gaps, not yet implemented)

- Signal states (`data-state`) and signal hues (danger, warning, success, info).
- `<header>`, `<footer>`, `<nav>` as row wrappers (currently deferred; nav stays for popovers).
- Partial-width single elements (sizing skins vs row wrapper with empty cols).
- CLAUDE.md (<200 lines) + component catalog skill file.
- Validator script (HTML parser to flag unauthorized elements/styles/skins).
- Reference app (planned for end of stage 1).
- Split spacing scale into padding/gap tokens vs. font-size tokens.
