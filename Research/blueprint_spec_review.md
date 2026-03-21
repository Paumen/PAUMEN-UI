# Blueprint Spec Review

> Reviewed: `Research/blueprint_spec.md` cross-referenced against `pre-prototype/paumen.css` and `pre-prototype/index.html`
> Date: 2026-03-21

---

## INCONSISTENCIES (spec says X, implementation says Y)

### 1. `<article>` — cut in spec, used everywhere in practice
- Spec §1 lists `<article>` under "Cut Elements"
- `paumen.css:117` includes `article` in the card selector
- `index.html` uses `<article>` as the primary card type (6 of 7 cards)
- Only 1 card uses `<details>` — the supposed "default card type"
- **Verdict:** Either un-cut `<article>` or rewrite the reference app

### 2. `<header>`, `<footer>`, `<nav>` — deferred in spec, implemented in CSS+HTML
- Spec §1 and §S7 explicitly defer these as row wrappers
- `paumen.css:133-137` styles all three as 12-col grid row wrappers
- `index.html` uses `<header>` (line 19), `<footer>` (lines 77, 218, 366), and `<nav>` (line 34)
- **Verdict:** Either promote them to Tier 1 or remove from CSS/HTML

### 3. Active scale: 0.96 vs 0.98
- Spec §6: "Active: scale 0.96"
- `paumen.css:210`: `transform: scale(0.98)`
- **Verdict:** Pick one

### 4. `--jump` default: 0.17 vs 0.07
- Spec §4 and `paumen.css:49`: `--jump: 0.17`
- `index.html` range input default value: `0.07` (line 352)
- `index.html` reset handler resets to `0.07` (lines 426-427)
- **Verdict:** Reference app contradicts both spec and CSS

### 5. `output` font-weight: 700 vs 600
- Spec §10 Tier 2: "output: 700"
- `paumen.css:301` (default layer): `font-weight: 600`
- `paumen.css:465` (skin layer): `font-weight: 700` — but this rule is **orphaned** outside any skin selector, sitting bare inside `@layer skin`
- **Verdict:** The skin-layer `output` block (lines 463-466) is a misplaced rule, not a skin

### 6. `Outline` skin capitalization and identity crisis
- Spec §3 skin table: `Outline` (capital O) — only instance with inconsistent casing
- Spec §10 Tier 1: calls it "outlined (default)"
- Spec §3 conflict group: "filled | ghost | outline"
- CSS: **no `[data-skin~="outline"]` selector exists at all**
- The outlined look comes from the default `button` base style (2px solid accent border)
- **Verdict:** Is "outline/outlined" a skin or the default? If it's just the default, remove it from the skin table and conflict group. If it's a skin, implement it in CSS.

---

## CONFLICTS

### 7. Skin count mismatch
- Spec §10: "5 values: filled, ghost, mute, outlined (default) elevated, freeform"
- Actual count of those values: **6** (filled, ghost, mute, outlined, elevated, freeform)
- If "outlined" is the default (not a skin), then there are 5 actual skins — but the list formatting is misleading with the missing comma between "outlined (default)" and "elevated"

### 8. `data-colspan` auto behavior
- Spec §3: "Children without `data-colspan` auto-span 1 column"
- Reality: In a 12-col grid, no explicit span means CSS grid auto-placement — the element gets 1 column, but this isn't a "span 1" — it's auto-placement. Works in practice but the mental model is slightly off. A checkbox taking 1/12th of width is intentional; a button taking 1/12th is usually not.
- Reference app relies on this for checkboxes (1 col) + label (10 col) + button (1 col) = 12. Works, but fragile if any element overflows its 1/12th slot.

### 9. Popover cards vs overlay semantics
- `paumen.css:120`: `[popover]` gets full card styling (grid, gap, padding, bg, border, radius)
- Spec §5 Layer 2 says popovers are "out-of-flow overlays"
- A tooltip (`<aside popover>`) getting card-level grid layout + padding may be excessive
- A toast (`<output popover>`) getting grid display overrides its inline/block nature

---

## REDUNDANCIES

### 10. Signal states defined 3 times
- §3 `data-state`: lists the 7 values
- §4 "Signal Hues": mentions danger/warning/success/info
- §6 "Signal States": describes error/warning/success/loading/empty behaviors
- All say "not yet implemented"
- **Verdict:** Consolidate into one section, reference from others

---

## GAPS

### 11. No responsive behavior for row wrappers
- Spec §Constraints: "Works across screen sizes without per-page custom styling"
- No breakpoints, no wrapping, no stacking. A 12-col grid with `gap: var(--s)` will crush content on 320px screens
- The `clamp()` scale helps body/card spacing, but row children with fixed column ratios (e.g., `10+1+1`) have no mobile fallback
- **Critical gap** for the "works across screen sizes" claim

### 12. No `dialog`-specific styling
- Spec §7: "Dialog: larger padding --m, max-inline-size, backdrop"
- CSS: `dialog` shares the generic card rule. No `dialog`-specific padding, no max-inline-size, no `::backdrop` styling
- No focus trap implementation mentioned (spec §1 says "focus trap" but that's native browser behavior only when using `showModal()`)

### 13. No `<p>` styling
- Spec lists `<p>` as a content element
- CSS only resets `margin: 0` — no font-size, no color, no line-height
- Works by inheritance, but inconsistent with how `<small>`, `<label>`, `<aside>` all get explicit styling

### 14. No `<a>` hover state
- `a` gets `color: var(--accent); text-decoration: none;`
- No hover style (underline? darken?). Only the global `:focus-visible` ring
- Most users expect a visual hover change on links

### 15. `<ul>` ambiguity in inline formatting
- Spec §1 lists: `<strong>`, `<code>`, `<ol>`/`<li>`, `<s>`
- Reconciliation log §S8 mentions `<ul>/<ol>/<li>`
- Is `<ul>` allowed or not?

### 16. `prefers-reduced-motion` selector targets wrong classes
- `paumen.css:396-398` targets `.ph` and `.ph-fill`
- But the icon system uses `.ph-bold` and `.ph-duotone`, not `.ph-fill`
- Animations are applied to `.ph-gear`, `.ph-trash`, `.ph-arrow-counter-clockwise` — none of which match `.ph` or `.ph-fill`
- **Verdict:** The reduced-motion rule likely doesn't catch the actual animated icons

### 17. Heading icons rule is empty
- `paumen.css:322-323`: `:is(h1, h2, h3, h4) .ph-duotone { }` — empty rule block, does nothing

---

## SUMMARY

| Category | Count | Severity |
|---|---|---|
| Spec vs CSS/HTML inconsistencies | 6 | High — undermines spec as "source of truth" |
| Internal conflicts | 3 | Medium — confusing for LLM consumers |
| Redundancies | 1 | Low — annoying but not harmful |
| Gaps | 7 | Mixed — #11 (responsive) and #12 (dialog) are structural |

### Meta-issue

The reference app doesn't follow the spec. It uses `<article>` (cut), `<header>`/`<footer>`/`<nav>` (deferred), and wrong default values. If an LLM reads the spec and then looks at the reference app for examples, it will get contradictory signals. The spec and implementation need to be reconciled — which the reconciliation log (§9) was meant to do, but it appears the CSS/HTML weren't updated to match all the decisions recorded there.
