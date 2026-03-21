# Blueprint Spec Internal Review

> Reviewed: `Research/blueprint_spec.md` (internal consistency only)
> Date: 2026-03-21
> Items marked ✅ were fixed in this pass.

---

## INCONSISTENCIES (spec contradicts itself)

### 1. `Outline` skin — naming, casing, and identity crisis
- §3 skin table: `Outline` (capital O) — only skin with inconsistent casing
- §10 Tier 1: calls it "outlined (default)"
- §3 conflict group: "filled | ghost | outline"
- §7 Default Layer describes the outlined look as the default button style (2px solid accent border), not as a skin
- **Problem:** Is "outline/outlined" a data-skin value or the unskinned default? The spec treats it as both. If it's the default, remove it from the skin table and conflict group. If it's a skin, define its `[data-skin~="outline"]` behavior.

### 2. Skin count: "5 values" lists 6
- §10 Tier 1: "5 values: filled, ghost, mute, outlined (default) elevated, freeform"
- Actual count: **6** items listed. Missing comma between "outlined (default)" and "elevated" compounds the confusion.
- If "outlined" is the default (not a skin), then the 5 count is correct but the list shouldn't include it.

### 3. Active scale value contradicts itself across sections
- §6 State Automation: "Active: scale 0.96"
- §7 CSS Architecture, Button: "Active: scale 0.98"
- **Verdict:** Pick one value and use it in both places.

### 4. `output` font-weight: two different values
- §7 Default Layer doesn't specify output font-weight
- §10 Tier 2: "Font weight values (button: 700, output: 700)"
- These are the only two references — they agree on 700, but §7 should state it explicitly since it describes every other element's defaults.

### 5. Max depth claim vs actual structure
- §2: "Max structural depth: 4 (html → body → details → content). Depth 5 for row children"
- But the depth model counts from body (depth 1), not html. The parenthetical "(html → body → details → content)" is 4 nodes but maps to depths 1-3 in the spec's own numbering.
- Row children at depth 4 are the actual max, not depth 5 as stated. Depth 5 is only for nested inline content (e.g., `<i>` inside `<button>` inside `<section>`).

### 6. Ghost skin description inconsistency
- §3 skin table says ghost gives "Transparent bg, no border"
- §3 also says ghost sets color to `--text-mute` (via the mute skin behavior implied by the table formatting)
- But below the table: "Hover fills to neutral-mute" — this sentence appears orphaned, floating between the ghost and mute rows. Unclear which skin it belongs to.
- §6 Hover states: "Ghost shows --neutral-mute on interactive elements only" — correct and clear.
- **Verdict:** The skin table formatting is ambiguous. The "Hover fills to neutral-mute" line after the table looks like it belongs to ghost but has no clear association.

---

## REDUNDANCIES

### 7. ✅ Signal states defined in 3 places (FIXED)
- §3 `data-state`: listed the 7 values
- §4 "Signal Hues": repeated danger/warning/success/info
- §6 "Signal States": re-described error/warning/success/loading/empty behaviors
- All said "not yet implemented"
- **Fix applied:** Consolidated into §3 as the single canonical definition. §4 signal hues folded in. §6 now references §3.

### 8. Freeform escape hatch described twice
- §3 data-skin table: "Escape hatch. Removes system constraints from card interior. Cards only."
- §5 Layout Model: "data-skin="freeform" on any card. Externally fits the body stack; internally unconstrained."
- Minor — §5 adds useful detail. Could cross-reference instead of repeating.

### 9. Non-collapsible card rule stated twice
- §1: "Non-collapsible cards: use `<details open>` with chevron hidden via CSS."
- §2 Rules: "Non-collapsible cards: `<details open>` with chevron hidden. Same DOM structure, same rules."
- Nearly identical. Could state once and reference.

---

## CONFLICTS

### 10. Row wrapper list differs between sections
- §1 Element list: row wrappers are `<summary>` + `<section>`
- §1 Deferred: `<header>`, `<footer>`, `<nav>` deferred as row wrappers
- §7 CSS Architecture describes row wrapper styling for `section, summary` only
- §4 Visual Depth Model: row wrapper layer lists "section, summary"
- But §9 Reconciliation Log §S7 says "header, footer, nav deferred as row wrappers. Nav stays for popovers."
- **Problem:** The spec is internally consistent on this, but the deferred status creates ambiguity — are they row wrappers or not? The spec should be clearer about what "deferred" means (recognized but not yet specced? or explicitly excluded?).

### 11. Popover as card vs overlay
- §1: popovers listed under "Popover Hosts" separate from cards
- §4 Visual Depth Model: `[popover]` listed at Card layer with `--neutral-mute` bg alongside details and dialog
- §5 Layout Model: popovers listed under "Layer 2 — Out-of-flow overlays"
- **Conflict:** Are popovers cards (§4) or overlays (§5)? They're both, but the spec doesn't acknowledge this dual nature. A popover is visually a card but positionally an overlay — this should be stated explicitly.

---

## GAPS

### 12. No responsive behavior defined
- §Constraints: "Works across screen sizes without per-page custom styling"
- No mechanism described anywhere. No breakpoints, no wrapping behavior, no stacking rules for row wrappers on small screens.
- The `clamp()` scale helps spacing, but a 12-col grid with fixed column ratios (e.g., `10+1+1`) will crush on mobile.
- **Critical gap** — the constraint is stated but unfulfilled.

### 13. Dialog spec is skeletal
- §1: "modal overlay card with backdrop, focus trap, Escape-to-close. Interior follows same rules as any card."
- §7: "Dialog: larger padding --m, max-inline-size, backdrop."
- No actual values for max-inline-size. No backdrop color/opacity. No z-index. "Larger padding --m" is unclear — larger than what? --m is the same token cards use.
- Focus trap is native to `showModal()` but the spec doesn't mention that this is browser-provided, not CSS.

### 14. ✅ No `<a>` hover state (FIXED)
- §6 Interactive States described hover for buttons and ghost skin but not for links.
- §7 Default Layer: `a` gets accent color and no text-decoration, but no hover behavior.
- **Fix applied:** Added "Links (`<a>`) show text-decoration underline on hover" to §6.

### 15. ✅ `<ul>` ambiguity in inline formatting (FIXED)
- §1 Inline Formatting listed `<ol>`/`<li>` but not `<ul>`
- §9 Reconciliation Log §S8 mentioned `<ul>/<ol>/<li>`
- **Fix applied:** Added `<ul>` to the §1 inline formatting list.

### 16. No `<p>` default styling specified
- §1 lists `<p>` as a content element: "paragraph text only. NOT used for layout wrapping."
- §7 Default Layer: no `p` selector described (only the reset margin). No font-size, color, or line-height.
- Other content elements (`<small>`, `<label>`, `<aside>`) all have explicit styling described.
- Presumably inherits from body, but should be stated.

### 17. Heading border behavior in row wrappers unspecified
- §7: headings get `border-block-end: 1px solid --neutral-edge, padding --m`
- Headings inside `<summary>` (a row wrapper) will have a bottom border while being a grid child in a 12-col layout
- Is this intended? A heading spanning 12 cols with a bottom border inside a summary that itself has no chrome looks odd — the border extends only across the heading's grid area.

### 18. Checkbox/radio column behavior in rows
- §1 Category table: checkbox and radio are classified as "Content" (display: inline)
- §7: checkbox/radio sized to `--m` with no border/padding/bg
- In a 12-col row, a checkbox without `data-colspan` gets 1 column — works for task-list patterns but the spec doesn't clarify this is the expected usage pattern or if checkboxes should always be paired with labels in rows.

---

## FEASIBILITY

### 19. `all: revert` for freeform may be too aggressive
- §3/§5: freeform removes constraints via `all: revert` on children
- `all: revert` reverts **every** CSS property to the browser default, including box-sizing, font, color. Content inside a freeform card loses the entire design system — tokens, colors, typography.
- May want `all: revert-layer` instead (reverts only the current cascade layer) to preserve reset-layer normalization.

### 20. Single spacing scale for both spacing and typography
- §4 Scale TODO acknowledges this: "Evaluate splitting scale into separate padding/gap tokens vs. font-size tokens."
- Currently `--m` is both the base font-size AND the card gap/padding. This means font-size and spacing are locked together — changing one changes the other.
- Works at current values but may not scale. Should be resolved before leaving pre-prototype.

---

## SUMMARY

| Category | Count | Fixed |
|---|---|---|
| Internal inconsistencies | 6 | 0 |
| Redundancies | 3 | 1 (#7) |
| Conflicts | 2 | 0 |
| Gaps | 7 | 2 (#14, #15) |
| Feasibility concerns | 2 | 0 |

**Highest priority:** #1 (outline identity), #3 (active scale), #12 (responsive), #13 (dialog).
