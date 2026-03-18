# LLM Web App Blueprint — System Specification

## Overview

LLMs produce inconsistent UI because the decision space per element is enormous (~134 independently variable properties). This blueprint inverts the usual design system philosophy: instead of maximizing flexibility, maximize constraint. ~124 of those 134 properties become deterministic consequences of a few choices per element — which tag, which skin, where in the grid, and what content. Claude never writes custom CSS. All styling comes from the system.

### Core Principle

**Coupling reduces decisions.** If you know the element is a button with the emphasis skin, you already know its color, hover behavior, focus ring, padding, border radius, cursor, and disabled state. Nothing left to decide.

### The Five Aspects

1. **HTML Element** — which tag. Determines behavior and accessibility.
2. **Skin** — composable visual modification (`data-skin="emphasis"`). Determines appearance. Multiple skins compose via space-separation.
3. **Placement** — direct card child (full width) or inside a row wrapper (shared width). The primary free variable.
4. **Content** — text, icon, image. Irreducible — always unique.
5. **Context** — inherited from parent. Gap, alignment, tone. Zero decisions.

### Hard Constraints

- Zero dependencies. Full control over source code. Single CSS file.
- Works across screen sizes without per-page custom styling.
- Zero CSS classes. All styling via element selectors, attribute selectors, and pseudo-classes.

### Target Apps

Single or few-page tools, mostly client-side, possibly with a small server. Productivity tools, interactive games, dashboards, forms, converters. Mostly simple, or with 1–2 complex features surrounded by simple structure.

---

## 1. HTML Elements — ~21 Tags

Native semantic HTML only. No custom elements. No div.

### Cards (body children, depth 2 — display: grid, gap --s, single-column stack)

- `<article>` — standard card. The primary structural unit.
- `<details>` + `<summary>` — collapsible card with native toggle. Summary acts as built-in header row wrapper.
- `<dialog>` — modal overlay card with backdrop, focus trap, Escape-to-close. Interior follows same rules as any card.

### Transparent Wrapper (display: contents — no visual chrome, no depth)

- `<form>` — submission scope only. Wraps inputs inside any card type. Never a visual container.

### Row Wrappers (inside cards, depth 3 — display: grid, 12-column, gap --xs, no visual chrome)

- `<section>` — generic multi-element row. Only used when 2+ elements share a horizontal row. Single elements are direct card children.
- `<header>` — title row (typically h1–h4 + optional icon/action).
- `<footer>` — action row (typically buttons at card bottom).
- `<nav>` — navigation row (tabs, links). Also serves as dropdown popover host.
- `<summary>` — details header row (inside `<details>` only). Clickable toggle target.

### Interactive Elements

- `<button>` — actions, toggles, triggers.
- `<input>` text cluster — text, number, search, password, email, url, tel. Same visual, different keyboards/validation.
- `<input type="range">` — slider. Native styling only.
- `<input type="date">` / `<input type="time">` — native pickers.
- `<input type="checkbox">` / `<input type="radio">` — binary/exclusive toggles.
- `<textarea>` — multi-line text.
- `<select>` — dropdown choice.

### Headings

- `<h1>` through `<h4>` — heading hierarchy. h5/h6 dropped.

### Content / Text

- `<p>` — paragraph text only. NOT used for layout wrapping.
- `<small>` — secondary/fine text.
- `<label>` — ties text to a control.
- `<a>` — link / navigation.
- `<svg>` — icon / graphic. Inherits text color via `fill: currentColor`.
- `<output>` — computed result / toast host. Has native `aria-live="polite"`.
- `<aside>` — supplementary info / tooltip host.

### Implicit Inline Formatting (allowed within text elements)

`<strong>`, `<em>`, `<code>`, etc.

### Cut Elements

`<fieldset>`, `<img>`, `<table>` family, `<ul>`/`<ol>`/`<li>`, `<hr>`.

### Popover Hosts (semantic element + popover attribute)

- Tooltip → `<aside popover>` — supplementary info
- Toast/notification → `<output popover>` — announced result (native aria-live)
- Dropdown menu → `<nav popover>` — container with buttons/links

### Category → Display Type

| Category    | Display      | Role                            | Elements                                                       |
| ----------- | ------------ | ------------------------------- | -------------------------------------------------------------- |
| Card        | grid         | Holds and arranges children     | article, details, dialog, [popover]                            |
| Wrapper     | grid (12-col)| Groups elements into rows       | section, header, footer, nav, summary                          |
| Transparent | contents     | Submission scope only           | form                                                           |
| Component   | inline-block | Self-contained interactive unit | button, text inputs, textarea, select, range                   |
| Content     | inline       | Leaf-level text/graphic         | h1–h4, p, small, label, a, svg, checkbox, radio, date/time, output, aside |

---

## 2. DOM Structure

```
body                              depth 1  (grid, gap --l, max 800px centered)
 └ article                        depth 2  (card, 1-col stack, grid, gap --s)
    ├ header [row wrapper]        depth 3  (12-col grid, gap --xs)
    │  ├ h3                       depth 4  (row child, fills cell)
    │  └ svg                      depth 4  (row child, fills cell)
    ├ form                        ----     (display:contents, transparent)
    │  ├ input                    depth 3  (direct card child, full width)
    │  ├ section [row wrapper]    depth 3  (12-col grid, gap --xs)
    │  │  ├ button                depth 4  (row child, fills cell)
    │  │  └ button                depth 4  (row child, fills cell)
    │  └ textarea                 depth 3  (direct card child, full width)
    └ footer [row wrapper]        depth 3  (12-col grid, gap --xs)
       ├ button                   depth 4  (row child)
       └ button                   depth 4  (row child)
```

Max structural depth: 3 (body → article → content). Depth 4 for row wrapper children and HTML-mandated nesting (svg inside button, small inside p). Form is `display: contents` — transparent to the depth model.

### Rules

- No article inside article (no nested cards).
- No form inside form (HTML forbids this).
- Cards are body-level only. Row wrappers are card-level only.
- Single elements are direct card children — never wrapped in a row wrapper.

---

## 3. Data Attributes

### data-skin — Composable Visual Modifications

Space-separated. Applied to any element. Selected via `[data-skin~="value"]`.

| Skin       | Effect                                                                            |
| ---------- | --------------------------------------------------------------------------------- |
| `emphasis` | Accent background, light text, accent border. Hover darkens.                      |
| `ghost`    | Transparent bg + border. Interactive elements: hover shows mute bg. Others: static. |
| `mute`     | text-mute color.                                                                  |
| `elevated` | box-shadow for visual lift.                                                       |
| `freeform` | Escape hatch. Removes system constraints from card interior. Cards only.          |

**Skin conflict groups** (mutually exclusive): emphasis | ghost (pick at most one).

### data-colspan — Row Child Width

How many of the 12 columns a child occupies inside a row wrapper. Children without `data-colspan` auto-span 1 column.

```html
<article>
  <section>
    <input type="text" placeholder="Search…" data-colspan="10" />
    <button>×</button>
    <button data-skin="emphasis">⌕</button>
  </section>
</article>
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

Supported colspan values: 2, 3, 4, 6, 8, 9, 10, 12. Values 1 (auto default), 5, 7, 11 omitted — they don't produce clean ratios in a 12-column grid.

### data-state — Signal States (not yet implemented)

`error` / `warning` / `info` / `success` / `loading` / `skeleton` / `empty`

---

## 4. Color System

### Base Inputs (5 values)

```css
--accent-hue: 250;
--accent-chroma: 0.14;
--surface-hue: 250;
--jump: 0.07;
color-scheme: light dark;
```

### Derived Palette

```css
/* Accent */
--accent: oklch(58% var(--accent-chroma) var(--accent-hue));
--accent-up: oklch(calc(58% + var(--jump)) var(--accent-chroma) var(--accent-hue));
--accent-dn: oklch(calc(58% - var(--jump)) var(--accent-chroma) var(--accent-hue));

/* Surface levels — light-dark() for automatic dark mode */
--neutral: light-dark(
  oklch(96% 0.01 var(--surface-hue)),
  oklch(16% 0.01 var(--surface-hue))
);
--neutral-mute: light-dark(
  oklch(92% 0.01 var(--surface-hue)),
  oklch(20% 0.01 var(--surface-hue))
);
--neutral-edge: light-dark(
  oklch(85% 0.02 var(--surface-hue)),
  oklch(30% 0.02 var(--surface-hue))
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
--text-on-accent: oklch(98% 0.01 var(--accent-hue));
```

### Visual Depth Model

| Layer       | Background      | Elements                                    |
| ----------- | --------------- | ------------------------------------------- |
| Body        | `--neutral`     | body                                        |
| Card        | `--neutral-mute`| article, details, dialog, [popover]         |
| Row wrapper | transparent     | section, header, footer, nav, summary       |
| Control     | `--neutral`     | button, input, textarea, select             |

### Signal Hues (not yet implemented)

Danger, warning, success, info. Hue values only — saturation and lightness derived from accent. Deferred.

### Scale

```css
--0: 0;
--xs: clamp(0.2rem, 0.4vw, 0.4rem);
--s: clamp(0.4rem, 1vw, 0.8rem);
--m: clamp(0.8rem, 2vw, 1.6rem);   /* base font-size AND spacing unit */
--l: clamp(1.2rem, 4vw, 2.4rem);
```

Used for: spacing (gap, padding), font-size (--m base), border-radius (--xs subtle, --s visible), outline width/offset (--xs), checkbox/radio sizing (--m).

---

## 5. Layout Model

### Cards as Single-Column Stacks (F4 Architecture)

Cards (article, details, dialog) are always single-column grids. Every direct child occupies a full-width row. No attribute needed.

```css
article, details, dialog {
  display: grid;
  gap: var(--s);
}
```

Multi-element rows are handled by row wrappers. Single elements are direct card children.

### Row Wrappers (12-Column Grid)

Row wrappers (`<section>`, `<header>`, `<footer>`, `<nav>`, `<summary>`) wrap 2+ elements that share a horizontal row. No visual chrome — transparent background, no border. 12-column grid via CSS. Children claim columns via `data-colspan="N"`.

```html
<article>
  <h3>Settings</h3>
  <section>
    <button data-colspan="6">Cancel</button>
    <button data-colspan="6" data-skin="emphasis">Save</button>
  </section>
  <input type="text" placeholder="Name" />
</article>
```

### Body Grid

Body is a grid with `gap: var(--l)`, `max-inline-size: 800px`, `margin-inline: auto`. Children are cards.

### Two-Layer System

**Layer 1 — In-flow grid:** All normal page content. Cards stacked in body grid. Content stacked in card grid. Multi-element rows in row wrappers.

**Layer 2 — Out-of-flow overlays:**

- `<aside popover>` — tooltip
- `<output popover>` — toast/notification
- `<nav popover>` — dropdown menu
- `<dialog>` — modal (backdrop + focus trap + Escape)

### Escape Hatch

`data-skin="freeform"` on any card. Externally fits the body stack; internally unconstrained. For game canvases, data visualizations, complex widgets, third-party embeds.

---

## 6. State Automation

Claude never writes state styles. All states are derived from element default + skin + color system via CSS.

### Interactive States (via pseudo-classes)

- **Hover:** button darkens to --neutral-edge. Emphasis skin darkens to --accent-dn. Ghost shows --neutral-mute on interactive elements only.
- **Active:** scale 0.98.
- **Focus-visible:** --xs solid --accent ring, --xs offset. All interactive elements.
- **Disabled:** opacity 0.5, cursor not-allowed. All controls.
- **Checked/selected:** accent-color on checkbox/radio.

### Signal States (not yet implemented — via data-state)

- **Error:** border and text shift to danger color
- **Warning:** border shifts to warning color
- **Success:** border/icon shifts to success color
- **Loading:** skeleton pulse animation
- **Empty:** placeholder content shown

Depends on signal hues being added to the token system.

---

## 7. CSS Architecture

### Four Layers

```css
@layer reset, default, skin, grid;
```

### Reset (3 rules)

```css
*, *::before, *::after { box-sizing: border-box; }
body, h1, h2, h3, h4, p { margin: 0; }
button, input, textarea, select { font: inherit; color: inherit; }
```

### Default Layer

- **Body:** grid, gap --l, max-inline-size 800px, margin-inline auto, system font, --m base size, --text color, --neutral bg.
- **Cards** (`article, details, dialog, [popover]`): --neutral-mute bg, border, radius --s, padding --s, display grid, gap --s.
- **Row wrappers** (`section, header, footer, nav, summary`): display grid, grid-template-columns repeat(12, 1fr), gap --xs, align-items center. Transparent — no visual styling.
- **Form:** display contents.
- **Dialog:** larger padding --m, max-inline-size, backdrop.
- **Headings h1–h4:** border-bottom, padding-bottom --xs, scale-based sizes.
- **Shared control base** (`button, input, textarea, select`): border, radius --xs, --neutral bg, --text color, padding, transition.
- **Focus ring:** unified across all interactive elements.
- **Disabled:** unified across all controls.
- **Button:** cursor pointer, font-weight 600, --neutral-mute bg, inline-flex, hover/active states.
- **Select:** custom dropdown arrow (SVG data URI), appearance:none.
- **Range:** stripped to native (transparent bg, no border/padding).
- **Checkbox/radio:** sized to --m, accent-color.

### Skin Layer

Composable via `[data-skin~="value"]`:

- **Visual:** emphasis, ghost, mute.
- **Elevation:** elevated.
- **Escape:** freeform.

### Grid Layer

```css
@layer grid {
  [data-colspan="2"]  { grid-column: span 2; }
  [data-colspan="3"]  { grid-column: span 3; }
  [data-colspan="4"]  { grid-column: span 4; }
  [data-colspan="6"]  { grid-column: span 6; }
  [data-colspan="8"]  { grid-column: span 8; }
  [data-colspan="9"]  { grid-column: span 9; }
  [data-colspan="10"] { grid-column: span 10; }
  [data-colspan="12"] { grid-column: span 12; }
}
```

Selectors are global (not scoped to row wrapper children) — flat specificity. Only take effect inside a grid parent. Gap is `--xs` (tighter than card's `--s`) because row children are siblings in a single line.

### No Redundant Native Styling

Removed: text-decoration on `<a>`, font-weight 700 on headings, cursor:pointer on `<a>`. Kept cursor:pointer on `<button>` (browsers default to cursor:default on buttons).

---

## 8. Post Article/Section Flip — Sanity Check Results

After flipping article (→ card) and section (→ row wrapper) from their original roles, a systematic sanity check was conducted across all subsystems. Key decisions incorporated into this spec:

- **S1:** No article inside article (no nested cards). Cards are flat, body-level only.
- **S2:** form = always `display: contents`, never a visual container.
- **S3:** details = card-level container (collapsible card). summary acts as built-in header row wrapper.
- **S4:** dialog interior = same rules as any card. LLM learns one interior pattern for all card types.
- **S5:** fieldset cut from element set. Depth conflicts, cross-browser legend styling pain, marginal value.
- **S6:** img, table family, ul/ol/li, hr cut. Lists break depth (li at depth 5).
- **S7:** Inline formatting (strong, em, code) implicit, not spec-listed.
- **S8:** Keep date/time inputs. Native behavior is worth the styling inconsistency.
- **S9:** Cut `half` skin. Redundant with colspan grid system.
- **S10:** Merge ghost + transparent → `ghost`. Hover behavior determined by element type.
- **S11:** Add `elevated` skin (box-shadow). Common card pattern.
- **S12:** Add `freeform` skin (escape hatch). Removes all PAUMEN constraints from card interior.
- **S13:** Document skin conflict groups (see §3).
- **S14:** Drop `data-colcount` attribute. Always 12, never varies.
- **S15:** Body: `max-inline-size: 800px; margin-inline: auto`.
- **S16:** Dropdown menu: `<nav popover>` (was `<section popover>`).
- **S17:** summary = row wrapper (12-col grid, like header). 5th row wrapper element.
- **S18:** Escape hatch via `data-skin="freeform"` on cards.

Element count: ~21 unique tag names. ~25 total entries counting input type variants and h1–h4.
