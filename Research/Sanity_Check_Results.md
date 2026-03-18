# Sanity Check Results — Post Article/Section Flip

Date: 2026-03-18

## Context

After deciding to flip article (→ card) and section (→ row wrapper) from their original roles, a systematic sanity check was conducted across all blueprint subsystems to verify consistency and flush out edge cases.

## Decisions Made

### 1. Container Roles & Nesting

| # | Decision | Rationale |
|---|----------|-----------|
| S1 | No article inside article (no nested cards) | Prevents depth 5. Cards are flat, body-level only. |
| S2 | form = always `display: contents`, never a visual container | Avoids depth conflicts. Form provides submission scope without adding to layout. |
| S3 | details = card-level container (collapsible card) | summary acts as built-in header row. |
| S4 | dialog interior = same rules as any card | LLM learns one interior pattern for all card types. |
| S5 | fieldset: **cut** from element set | Depth conflicts, cross-browser legend styling pain, marginal value. Use headings for form grouping. |

### 2. Element Taxonomy

| # | Decision | Rationale |
|---|----------|-----------|
| S6 | img, table family, ul/ol/li, hr: **cut** | img/table add complexity; lists break depth (li at depth 5); hr marginal. Use p for list-like content. |
| S7 | Inline formatting (strong, em, code): implicit, not spec-listed | Phrasing content within text elements. Too fundamental to need explicit listing. |
| S8 | Keep date/time inputs | Native behavior is worth the styling inconsistency. |

### 3. Skin System

| # | Decision | Rationale |
|---|----------|-----------|
| S9 | Cut `half` skin | Redundant with colspan grid system. |
| S10 | Merge ghost + transparent → `ghost` | Hover behavior determined by element type (interactive gets hover, non-interactive doesn't). One skin, context-dependent behavior. |
| S11 | Add `elevated` skin (box-shadow) | Common card pattern. `box-shadow: 0 var(--xs) var(--s) oklch(0% 0 0 / 0.12)`. |
| S12 | Add `freeform` skin (escape hatch) | Replaces old `transparent`-based escape hatch. Removes all PAUMEN constraints from card interior. |
| S13 | Document skin conflict groups | Visual: emphasis \| ghost (pick one). Radius: round \| flat (pick one). |

**Final skin set (9):** emphasis, ghost, square, full, mute, round, flat, elevated, freeform

### 4. Grid & Spatial Model

| # | Decision | Rationale |
|---|----------|-----------|
| S14 | Drop `data-colcount` attribute | Always 12, never varies. CSS handles implicitly: all row wrappers get `repeat(12, 1fr)`. |
| S15 | Body: `max-inline-size: 800px; margin-inline: auto` | Fixed width, centered. Fits tool UI target apps. |

### 5. Popover Assignments

| # | Decision | Rationale |
|---|----------|-----------|
| S16 | Dropdown menu: `<nav popover>` (was `<section popover>`) | Nav = navigation links; a dropdown menu IS navigation. More natural semantic fit than section. |

### 6. Meta-Level

| # | Decision | Rationale |
|---|----------|-----------|
| S17 | summary = row wrapper (12-col grid, like header) | Can hold h3 + chevron SVG. 5th row wrapper element. |
| S18 | Escape hatch via `data-skin="freeform"` | Clear intent signal on a card. Interior unconstrained. |

## Updated System Snapshot

### Container Model

| Element | Role | Display | Depth |
|---------|------|---------|-------|
| `<article>` | Card | grid | 2 (body child) |
| `<details>` | Collapsible card | grid | 2 (body child) |
| `<dialog>` | Overlay card | grid | out-of-flow |
| `<form>` | Submission scope | **contents** | transparent (no depth) |
| `<section>` | Row wrapper | grid (12-col) | 3 (inside card) |
| `<header>` | Row wrapper (title) | grid (12-col) | 3 (inside card) |
| `<footer>` | Row wrapper (actions) | grid (12-col) | 3 (inside card) |
| `<nav>` | Row wrapper (links) | grid (12-col) | 3 (inside card) |
| `<summary>` | Row wrapper (details header) | grid (12-col) | 3 (inside details) |

### Grid Hierarchy

| Level | Element | Gap | Columns |
|-------|---------|-----|---------|
| body | `<body>` | --l | 1fr, max 800px centered |
| card | article, details, dialog | --s | 1fr (stacks children) |
| row wrapper | section, header, footer, nav, summary | --xs | repeat(12, 1fr) |

### Visual Depth Model

| Layer | Background | Elements |
|-------|-----------|----------|
| Body | `--neutral` | body |
| Card | `--neutral-mute` | article, details, dialog, [popover] |
| Row wrapper | transparent (inherits) | section, header, footer, nav, summary |
| Control | `--neutral` | button, input, textarea, select |

### Popover Assignments

| Overlay | Element | Behavior |
|---------|---------|----------|
| Tooltip | `<aside popover>` | Light dismiss |
| Toast | `<output popover>` | Light dismiss, aria-live |
| Dropdown | `<nav popover>` | Light dismiss, stacked items |
| Modal | `<dialog>` | Backdrop, focus trap, Escape |

### Data Attributes

| Attribute | Applied to | Values |
|-----------|-----------|--------|
| `data-skin` | any element | emphasis, ghost, square, full, mute, round, flat, elevated, freeform |
| `data-colspan` | row wrapper children | 2, 3, 4, 6, 8, 9, 10, 12 |
| `data-state` | any element | error, warning, info, success, loading, skeleton, empty |

### Element Count

~21 unique tag names. ~25 total entries counting input type variants and h1-h4.

### Skin Conflict Groups

1. **Visual:** emphasis | ghost (pick at most one)
2. **Radius:** round | flat (pick at most one)
3. **Escape:** freeform (standalone, on cards only)
