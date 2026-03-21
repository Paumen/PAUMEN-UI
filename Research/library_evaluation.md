# Library / Framework Evaluation for PAUMEN-UI

> **Purpose:** Evaluate which external dependencies are compatible with the blueprint's design philosophy. Scored against the rationale's core constraints.

## Filtering Criteria (from blueprint_rationale.md)

Any adopted library must satisfy ALL of these:

| # | Hard Constraint | Source |
|---|----------------|--------|
| C1 | **No CSS classes** — element selectors + attribute selectors only (icon lib excepted) | Decision #27 |
| C2 | **No custom elements / Shadow DOM** — native HTML only | Decision #24 |
| C3 | **No div/span** — blueprint's ~20 tags only | Decision #28 |
| C4 | **Claude never writes custom CSS** — all styling from the system | Decision #6 |
| C5 | **Inline styles forbidden** | Spec §0 |
| C6 | **Minimal API surface** — fewer decisions per element = better | Core philosophy |
| C7 | **Zero or near-zero build step** — target apps are single/few-page tools | Target apps |
| C8 | **Flat DOM depth ≤ 4** — library must not inject wrapper elements | Decision #43 |

### Soft Preferences

- **S1:** Works via HTML attributes (aligns with `data-skin`, `data-colspan` pattern)
- **S2:** Small bundle size (<15KB gzipped)
- **S3:** No framework lock-in — can be removed without rewriting HTML structure
- **S4:** CDN-loadable (no npm required for simple apps)

---

## Category 1: JavaScript Interactivity

PAUMEN-UI has no JS framework. The reference app uses vanilla JS. As apps grow beyond simple tools, a reactivity layer becomes the most likely first dependency.

### Alpine.js — RECOMMENDED

| Criterion | Verdict |
|-----------|---------|
| C1 Classes | Pass — uses `x-` HTML attributes, zero CSS classes |
| C2 Custom elements | Pass — works with native HTML |
| C3 No div/span | Pass — attaches to any element, doesn't require wrappers |
| C4 No custom CSS | Pass — purely behavioral, no styling |
| C5 No inline styles | Pass — `x-bind:style` exists but is optional, not required |
| C6 Minimal API | Pass — ~15 directives, all attribute-based |
| C7 Zero build | Pass — single `<script>` tag, CDN |
| C8 Flat DOM | Pass — zero injected wrapper elements |
| S1 Attribute-driven | Strong fit — `x-data`, `x-show`, `x-bind` mirror `data-skin`, `data-colspan` |
| S2 Bundle size | ~17KB min+gzip |
| S3 No lock-in | HTML remains valid without Alpine; attributes are inert if script removed |
| S4 CDN | Yes |

**Why it fits:** Alpine's philosophy is "sprinkle behavior onto markup via attributes." This is the exact same pattern PAUMEN uses for styling (`data-skin`) and layout (`data-colspan`). The mental model is consistent: HTML attributes are the only interface. Claude writes `x-show="open"` and `x-on:click="open = !open"` — declarative, no custom CSS, no wrapper divs.

**Example — collapsible card with Alpine (alternative to native `<details>`):**
```html
<details x-data="{ items: [] }" open>
  <summary>
    <h3 data-colspan="10">Task List</h3>
    <small data-colspan="2" x-text="items.length + ' items'"></small>
  </summary>
  <template x-for="item in items" :key="item.id">
    <section>
      <input type="checkbox" x-model="item.done">
      <p data-colspan="11" x-text="item.text"></p>
    </section>
  </template>
</details>
```

**Risk:** `<template x-for>` generates DOM dynamically — Claude must understand it doesn't add depth. Manageable with skill file examples.

### Petite-Vue — ACCEPTABLE ALTERNATIVE

Similar to Alpine but Vue-flavored (`v-` prefix instead of `x-`). Slightly smaller (~6KB). Less ecosystem/docs. Same architectural fit. Choose Alpine unless team already knows Vue.

### HTMX — CONDITIONAL FIT

| Criterion | Verdict |
|-----------|---------|
| C1–C8 | All pass — attribute-driven, no wrappers, no CSS, CDN-loadable |
| Fit | Only relevant if the app has a server. Target apps are "mostly client-side." |

**Verdict:** Good fit for the subset of PAUMEN apps that talk to a backend. Not a default dependency. Composable with Alpine — they solve different problems (HTMX = server communication, Alpine = client state).

### React / Vue / Svelte / Solid — DO NOT ADOPT

| Issue | Detail |
|-------|--------|
| C3 violation | React requires wrapper `<div>` everywhere (fragments help but don't eliminate). Vue/Svelte similar. |
| C7 violation | All require a build step (JSX transform, SFC compiler). |
| C8 risk | Component trees naturally increase nesting depth. |
| C6 violation | Massive API surface — hundreds of decisions per component. |
| Lock-in | HTML is no longer portable. Removing the framework means rewriting everything. |

These frameworks solve "build large, complex SPAs with teams." PAUMEN targets "single/few-page tools, mostly client-side." Architectural mismatch.

### Lit / Web Components — DO NOT ADOPT

Explicitly rejected by Decision #24: "Native HTML only — no custom elements, no Shadow DOM."

---

## Category 2: CSS Libraries

### Tailwind CSS — DO NOT ADOPT

Violates C1 (classes are the entire interface), C4 (Claude would be writing utility classes = CSS decisions), and C6 (thousands of options). Philosophically opposite to PAUMEN — Tailwind maximizes flexibility, PAUMEN maximizes constraint.

### Open Props — DO NOT ADOPT

Already evaluated and rejected in rationale §3: "Our token system is much simpler (5 inputs vs thousands of lines)."

### PicoCSS / SimpleCSS / Water.css — DO NOT ADOPT

Classless CSS frameworks that style native HTML elements. Philosophically similar to PAUMEN's element-selector approach, but:
- They'd conflict with `paumen.css` (competing default styles on the same selectors)
- Less constrained (no skin system, no grid architecture)
- PAUMEN already IS this layer — it doesn't need another one underneath it

---

## Category 3: Utility Libraries

### date-fns / day.js — ACCEPTABLE

Small, focused, tree-shakeable. No DOM interaction, no CSS, no HTML opinions. Pure data transformation. If an app needs date manipulation, either is fine. day.js is smaller (~2KB) and CDN-friendly.

### Chart.js / D3 (lite) — ACCEPTABLE (inside freeform cards)

Data visualization lives inside `data-skin="freeform"` cards (the escape hatch). These libraries render to `<canvas>` or `<svg>`, which is compatible. They don't touch PAUMEN's DOM structure.

**Rule:** Visualization libraries operate ONLY inside freeform cards. They never inject elements into the PAUMEN grid.

### lodash — UNNECESSARY

Modern JS (structuredClone, Array.prototype methods, optional chaining, nullish coalescing) covers >95% of lodash use cases for small apps. Don't add 70KB for `_.debounce`.

---

## Category 4: Icons

### Phosphor Icons — ALREADY ADOPTED

The one exception to the zero-classes rule. Loaded via CDN. The icon system (stroke→fill swap, scoped animations) is built around it.

### Lucide / Heroicons / Material Symbols — DO NOT SWITCH

Switching icon libraries means rewriting the icon animation system. Phosphor's dual-weight (bold + duotone) maps directly to the stroke→fill swap pattern. Other libraries don't have this built in.

---

## Category 5: Build Tools

### None — DEFAULT

Target apps are single HTML files with a `<link>` to `paumen.css` and a `<script>` for Alpine/Phosphor. No bundler needed.

### Vite — ACCEPTABLE (for larger apps only)

If an app outgrows a single HTML file (multiple pages, JS modules, asset optimization), Vite is the lightest-weight bundler. Zero-config for vanilla HTML/JS. But this is a "graduate to" tool, not a default.

---

## Summary Matrix

| Library | Category | Verdict | Constraint Violations | Notes |
|---------|----------|---------|----------------------|-------|
| **Alpine.js** | JS reactivity | **Recommended** | None | Attribute-driven, mirrors PAUMEN philosophy |
| Petite-Vue | JS reactivity | Acceptable | None | Smaller alternative to Alpine |
| HTMX | JS server comm | Conditional | None | Only for server-backed apps |
| React/Vue/Svelte | JS framework | **Reject** | C3, C6, C7, C8 | Architectural mismatch |
| Lit/Web Components | JS framework | **Reject** | C2 | Explicitly rejected in spec |
| Tailwind | CSS | **Reject** | C1, C4, C6 | Opposite philosophy |
| Open Props | CSS tokens | **Reject** | C6 | Already rejected in rationale |
| Pico/Water.css | CSS classless | **Reject** | Conflicts | PAUMEN already is this layer |
| day.js | Utility | Acceptable | None | Date manipulation if needed |
| Chart.js / D3 | Visualization | Acceptable | None | Freeform cards only |
| **Phosphor Icons** | Icons | **Already adopted** | None (exempted) | Stroke→fill swap built around it |
| Vite | Build | Acceptable | None | Only when single-file outgrown |

## Recommended Default Stack

For a typical PAUMEN-UI app:

```html
<link rel="stylesheet" href="paumen.css">
<script src="https://unpkg.com/@phosphor-icons/web@2.1.1"></script>
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js"></script>
```

Three lines. Zero build step. Zero CSS classes (except icons). All behavior via HTML attributes.
