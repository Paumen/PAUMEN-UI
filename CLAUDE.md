# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PAUMEN-UI is a highly constrained design system / CSS blueprint optimized for LLM-assisted web app development. The core idea: instead of maximizing flexibility (like typical CSS frameworks), maximize constraint so that ~124 of 134 UI properties are deterministic — leaving only placement, size, and content as free variables per element.

**Target apps:** Single/few-page tools, mostly client-side — productivity tools, dashboards, games, forms, converters.

## Current State

This project is in the research/design phase. The `Research/` directory contains:
- `Blueprint_Draft_v0.5.md` — the main design specification (element catalog, color system, layout model, skin definitions)
- `Research_Report_Modularity.md` — cross-domain modularity research informing architectural decisions
- `Research_Sessions_Summaries.md` — session-by-session decision log
- `blueprint_experiment_*.html/.jsx` — visual prototypes testing grid approaches

There is no build system, package.json, or test suite yet. No dependencies.

## Architecture Decisions (Locked)

### DOM Structure — Max Depth 3 (4 for row wrappers)
```
body (1) → section (2) → content element (3)
body (1) → section (2) → article row wrapper (3) → content element (4)
```

### 21 HTML Elements + Article Row Wrapper
No custom elements. No divs. No CSS classes. All styling via element selectors and `data-*` attribute selectors.

**Containers:** `section`, `form`, `details`+`summary`, `dialog`
**Row wrapper:** `article` (groups 2+ elements horizontally within a section)
**Components:** `button`, text `input`s, `textarea`, `select`, `range`
**Content:** `h1`–`h4`, `p`, `small`, `label`, `a`, `svg`, `checkbox`, `radio`, `date/time`, `output`, `aside`

### Layout Model (F4 Architecture)
- Sections are always **single-column grids** (`display: grid`)
- Direct section children occupy full width — no attributes needed
- Multi-element rows use `<article data-colcount="12">` wrappers
- Children inside articles claim columns via `data-colspan="N"`
- Single elements are **never** wrapped in an article

### Skin System — 9 Composable Skins via `data-skin`
Space-separated, composable: `emphasis`, `ghost`, `transparent`, `square`, `half`, `full`, `mute`, `round`, `flat`

Example: `data-skin="emphasis round"` = accent pill button

### Color System — 5 Inputs Derive Everything
```css
--accent-hue, --accent-chroma, --surface-hue, --jump, color-scheme
```
Uses OKLCH color space with `light-dark()` for automatic dark mode. Zero per-element color decisions.

### Scale — 4 Fluid Tokens
`--xs`, `--s`, `--m` (base), `--l` using `clamp()`. Used for spacing, font-size, border-radius.

## Key Design Principles

- **Zero CSS classes** — all styling via element + `[data-skin~="value"]` selectors
- **Claude never writes custom CSS** — if something can't be built with existing elements + skins, propose a new skin instead of improvising
- **Section = Card = File** — each section is a self-contained, debuggable unit
- **Escape hatch** exists for complex widgets: `data-skin="transparent"` section with freeform internals
- **Popover-based overlays:** tooltip=`<aside popover>`, toast=`<output popover>`, dropdown=`<section popover>`, modal=`<dialog>`
