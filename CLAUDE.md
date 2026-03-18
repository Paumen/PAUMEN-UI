# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PAUMEN-UI is a highly constrained design system / blueprint for building web apps with LLM-assisted development. The core idea: instead of maximizing flexibility (like traditional CSS frameworks), maximize constraint so that ~124 of 134 UI properties are deterministic — leaving only ~10 actual decisions per element (where, how big, what content).

Target apps: single or few-page tools, mostly client-side. Productivity tools, dashboards, forms, games, converters.

## Current State

**Pre-spec / research phase.** Everything under `Research/` is draft material — experiments, prototypes, working notes. The goal is to arrive at the first real specification through further experimentation and iteration. There is no build system, package manager, or test suite yet.

**Priority:** Core architecture first (layout model, element set, skin system, color system). Details like signal states/hues come later.

**No tooling scaffolding yet.** Skills, hooks, linters, permissions, workflows — all far future. The blueprint itself must be strong enough to work without soft enforcement. If it needs guardrails to function, that's a design smell.

## Architecture — The Blueprint

### Hard Rules

- **Zero dependencies.** Full control over source code. Single CSS file.
- **Zero CSS classes.** All styling via element selectors, attribute selectors (`[data-skin~="emphasis"]`), and pseudo-classes.
- **21 HTML elements + article row wrapper.** Native semantic HTML only. No custom elements. No div.
- **Max DOM depth 3** (body → section → content). Depth 4 allowed for `<article>` row wrappers and HTML-mandated nesting (svg inside button, small inside p).
- **Claude never writes custom CSS.** All styling comes from the system. If something can't be built, propose a new skin — do not improvise.

### Layout Model (F4 Architecture)

Sections are always single-column grids. Every direct child occupies a full-width row. Multi-element rows use `<article data-colcount="12">` wrappers with `data-colspan="N"` on children.

```
body                              depth 1
 └ section                        depth 2  (1-col stack, display:grid)
    ├ h3                          depth 3  (direct child, full width)
    ├ article data-colcount="12"  depth 3  (row wrapper)
    │  ├ button data-colspan="6"  depth 4
    │  └ button data-colspan="6"  depth 4
    └ input                       depth 3  (direct child, full width)
```

Single elements are always direct section children — never wrapped in an article.

### 5 Aspects Per Element

1. **HTML Element** — which tag. Determines behavior + accessibility.
2. **Skin** — `data-skin="emphasis round"`. Composable visual modifications (space-separated).
3. **Placement** — direct section child (full width) or inside article row wrapper.
4. **Content** — text, icon, image. Always unique.
5. **Context** — inherited from parent. Zero decisions.

### Element Categories

| Category | Display | Elements |
|----------|---------|----------|
| Container | block/grid | section, form, details, dialog, [popover] |
| Component | inline-block | button, text inputs, textarea, select, range |
| Content | inline | h1–h4, p, small, label, a, svg, summary, checkbox, radio, date/time, output, aside |

### 9 Skins

`emphasis`, `ghost`, `transparent`, `square`, `half`, `full`, `mute`, `round`, `flat`

### Color System — 5 Inputs

`--accent-hue`, `--accent-chroma`, `--surface-hue`, `--jump`, `color-scheme: light dark`. Everything else is derived via OKLCH. Change one hue to retheme the entire app.

### CSS Architecture — 4 Layers

`@layer reset, default, skin, grid;`

### Overlay System (Layer 2)

- Tooltip: `<aside popover>`
- Toast: `<output popover>`
- Dropdown menu: `<section popover>`
- Modal: `<dialog>` (separate mechanism)

### Escape Hatch

For complex widgets (game canvases, data viz), use `data-skin="transparent"` on section + freeform CSS inside. Must fit the section stack externally. Exact scoping behavior (whether color tokens/scale variables are inherited) is TBD.

### Naming Decisions

`data-colcount` / `data-colspan` are locked for now but open for revision if real-world usage surfaces problems or trade-offs. See `Research/blueprint_expirement_5.html` for related exploration.

## Key Research Documents

- `Research/Blueprint_Draft_v0.5.md` — Full specification draft (elements, skins, color system, layout, CSS architecture)
- `Research/Research_Sessions_Summaries.md` — Session-by-session decisions and rationale
- `Research/Research_Report_Modularity_Notes.md` — Strategic notes on Section/Card framework and LLM optimization
- `Research/blueprint_experiment_*.html` / `.jsx` — Visual prototypes testing the system
