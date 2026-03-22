# PAUMEN-UI — Future Steps

---

## Phase R: LLM Validation (Highest Risk)

Risk 8 in the rationale ("LLM Cannot Think in Flat Grids") is flagged as the highest-priority risk. The entire architecture depends on LLMs being able to work with F4's flat DOM model.

### 1 Build 2–3 diverse reference apps using the blueprint

Build these apps _using Claude Code with only the spec + paumen.css as context_ — do not hand-hold. Candidate apps:

- **Expense tracker** — forms, lists, calculations, categories (tests data-heavy patterns)
- **Quiz/flashcard app** — dynamic card creation, state transitions (tests interactivity patterns)
- **Settings/preferences page** — toggles, selects, grouped controls (tests dense form layouts)

### 2 Evaluate LLM output quality

For each app, assess:

- Does Claude produce valid F4 DOM (row wrappers, no nesting, correct colspan)?
- Does it avoid writing custom CSS?
- Does it reuse skins correctly or invent new ones?
- Does the output look consistent across cards?
- Where does it struggle or regress to nesting?

### 3 Identify spec gaps from real usage

Patterns that come up repeatedly but aren't covered by the current spec need to be cataloged. Likely candidates:

- Partial-width single elements (open decision in the spec — sizing skins vs. row wrapper with empty cols)
- List/repeated-item patterns
- Responsive breakpoint behavior (currently the grid is mobile-first with clamp, but complex layouts may need explicit breakpoints)

**Exit criteria:** At least 2 complete apps built by Claude with minimal manual correction. Failure patterns documented.

---

## Phase S: LLM Integration

### 1 Create a component catalog (skill file or reference)

- One example per element × skin combination that makes sense
- Copy-pasteable HTML snippets
- Organized by pattern: "form row," "nav bar," "card header," "action pair," etc.

### 2 Before/after examples for common LLM failure modes

- 10–15 examples showing wrong (nested, custom-CSS, wrong skin) vs. correct output
- These go into the CLAUDE.md or a linked reference file

**Exit criteria:** A fresh Claude Code session with only CLAUDE.md + paumen.css can build a simple app correctly on first attempt.

---

## Phase T: Tooling & Enforcement

### 1 HTML validator script

- Parse HTML, flag: unauthorized elements (div, span, table, etc.), inline styles, class attributes, unauthorized data attributes, nesting violations (card-in-card)
- Exit code 1 on violations (CI-friendly)
- Can be a simple Node script or even a shell script with an HTML parser

### 2 CSS lint rule

- Ensure no custom CSS exists outside `paumen.css`
- Flag any `<style>` tags or `style=` attributes in app HTML

### 3 Pre-commit hook (optional)

- Run validator on staged HTML files
- Block commits that violate the blueprint

**Exit criteria:** `npm run validate` (or equivalent) catches all common violations.

---

## Phase U: Expansion & Edge Cases

### 1 Resolve partial-width single elements

- Test both approaches (sizing skins vs. empty-col row wrapper) in real apps
- Pick one, document in spec, implement in CSS if needed

### 2 Responsive behavior audit

- Test all reference apps at 320px, 480px, 768px, 1024px, 1440px
- Document any breakpoint where the 12-col grid needs adjustment
- Decide if explicit `@media` rules belong in `paumen.css` or if clamp-based scaling is sufficient

### 3 Accessibility audit

- Keyboard navigation through all interactive elements
- Screen reader testing on reference apps
- Color contrast verification for all skin × state combinations in both light and dark mode

### 4 Evaluate named row patterns

- Session 3 identified `data-row="button-pair"` style semantics as promising but deferred
- With real apps built, revisit whether common patterns warrant named shortcuts

---

## Priority Summary

| Priority | Phase                    | Effort | Risk if Skipped                     |
| -------- | ------------------------ | ------ | ----------------------------------- |
| **Soon** | Phase Q (Signal States)  | Small  | Incomplete spec                     |
| **Soon** | Phase R (LLM Validation) | Medium | Building on unvalidated assumptions |

| **Later** | Phase S (Tooling) | Medium | Convention drift over time |
| **Later** | Phase T (Edge Cases) | Ongoing | Gaps discovered in production |

Phases 1 and 2 can run in parallel — signal states don't block LLM testing of the core architecture.
