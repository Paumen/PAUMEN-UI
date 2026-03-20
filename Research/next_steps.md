# PAUMEN-UI — Next Steps

> **Status:** Core architecture complete (element set, skins, color system, layout model, CSS architecture, canonical stylesheet). Research phase wrapping up. Ready to transition from specification to validation and expansion.

---

## Phase 1: Complete the Spec (Signal States)

The spec defines `data-state` values but they are not yet implemented in `paumen.css`.

### 1.1 Add signal hues to the token system
- Define 4 signal hues: danger, warning, success, info
- Each needs only a hue value — lightness and chroma derive from the existing accent scale logic
- Add to the `:root` block in `paumen.css`

### 1.2 Implement `data-state` attribute styling
- States: `error`, `warning`, `success`, `info`, `loading`, `skeleton`, `empty`
- Visual treatment per state (border-color shift, background tint, icon/text color)
- `loading` and `skeleton` need animation keyframes (spinner, shimmer)
- `empty` needs a muted placeholder pattern
- Add to the `@layer skin` in the CSS architecture

### 1.3 Test signal states in a reference card
- Add a "validation form" or "status dashboard" card to the Daily Planner (or a new experiment) demonstrating all 7 states

**Exit criteria:** All `data-state` values produce correct visual output in both light and dark mode.

---

## Phase 2: LLM Validation (Highest Risk)

Risk 8 in the rationale ("LLM Cannot Think in Flat Grids") is flagged as the highest-priority risk. The entire architecture depends on LLMs being able to work with F4's flat DOM model.

### 2.1 Build 2–3 diverse reference apps using the blueprint
Build these apps *using Claude Code with only the spec + paumen.css as context* — do not hand-hold. Candidate apps:
- **Expense tracker** — forms, lists, calculations, categories (tests data-heavy patterns)
- **Quiz/flashcard app** — dynamic card creation, state transitions (tests interactivity patterns)
- **Settings/preferences page** — toggles, selects, grouped controls (tests dense form layouts)

### 2.2 Evaluate LLM output quality
For each app, assess:
- Does Claude produce valid F4 DOM (row wrappers, no nesting, correct colspan)?
- Does it avoid writing custom CSS?
- Does it reuse skins correctly or invent new ones?
- Does the output look consistent across cards?
- Where does it struggle or regress to nesting?

### 2.3 Identify spec gaps from real usage
Patterns that come up repeatedly but aren't covered by the current spec need to be cataloged. Likely candidates:
- Partial-width single elements (open decision in the spec — sizing skins vs. row wrapper with empty cols)
- List/repeated-item patterns
- Responsive breakpoint behavior (currently the grid is mobile-first with clamp, but complex layouts may need explicit breakpoints)

**Exit criteria:** At least 2 complete apps built by Claude with minimal manual correction. Failure patterns documented.

---

## Phase 3: CLAUDE.md & LLM Integration

### 3.1 Write the production CLAUDE.md
- Target: <200 lines
- Must contain: element set summary, skin list, placement rules, DOM depth model, color token list, what Claude must never do (custom CSS, nesting, divs/spans)
- Must NOT contain: rationale, history, theory — those stay in Research/

### 3.2 Create a component catalog (skill file or reference)
- One example per element × skin combination that makes sense
- Copy-pasteable HTML snippets
- Organized by pattern: "form row," "nav bar," "card header," "action pair," etc.

### 3.3 Before/after examples for common LLM failure modes
- 10–15 examples showing wrong (nested, custom-CSS, wrong skin) vs. correct output
- These go into the CLAUDE.md or a linked reference file

**Exit criteria:** A fresh Claude Code session with only CLAUDE.md + paumen.css can build a simple app correctly on first attempt.

---

## Phase 4: Tooling & Enforcement

### 4.1 HTML validator script
- Parse HTML, flag: unauthorized elements (div, span, table, etc.), inline styles, class attributes, unauthorized data attributes, nesting violations (card-in-card)
- Exit code 1 on violations (CI-friendly)
- Can be a simple Node script or even a shell script with an HTML parser

### 4.2 CSS lint rule
- Ensure no custom CSS exists outside `paumen.css`
- Flag any `<style>` tags or `style=` attributes in app HTML

### 4.3 Pre-commit hook (optional)
- Run validator on staged HTML files
- Block commits that violate the blueprint

**Exit criteria:** `npm run validate` (or equivalent) catches all common violations.

---

## Phase 5: Expansion & Edge Cases

### 5.1 Resolve partial-width single elements
- Test both approaches (sizing skins vs. empty-col row wrapper) in real apps
- Pick one, document in spec, implement in CSS if needed

### 5.2 Responsive behavior audit
- Test all reference apps at 320px, 480px, 768px, 1024px, 1440px
- Document any breakpoint where the 12-col grid needs adjustment
- Decide if explicit `@media` rules belong in `paumen.css` or if clamp-based scaling is sufficient

### 5.3 Accessibility audit
- Keyboard navigation through all interactive elements
- Screen reader testing on reference apps
- Color contrast verification for all skin × state combinations in both light and dark mode

### 5.4 Evaluate named row patterns
- Session 3 identified `data-row="button-pair"` style semantics as promising but deferred
- With real apps built, revisit whether common patterns warrant named shortcuts

---

## Priority Summary

| Priority | Phase | Effort | Risk if Skipped |
|----------|-------|--------|-----------------|
| **Now** | Phase 1 (Signal States) | Small | Incomplete spec |
| **Now** | Phase 2 (LLM Validation) | Medium | Building on unvalidated assumptions |
| **Soon** | Phase 3 (CLAUDE.md) | Medium | Every session requires manual guidance |
| **Later** | Phase 4 (Tooling) | Medium | Convention drift over time |
| **Later** | Phase 5 (Edge Cases) | Ongoing | Gaps discovered in production |

Phases 1 and 2 can run in parallel — signal states don't block LLM testing of the core architecture.
