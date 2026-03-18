# Critical Review: PAUMEN-UI Research, Experiments & Blueprint Draft

**Review Date:** March 18, 2026
**Scope:** All research documents, all 5 experiments, Blueprint Draft v0.5, CLAUDE.md

---

## Executive Summary

Three sessions of research over three days have produced a remarkably coherent design system concept. The problem statement is genuinely novel — no one else is designing constraint-first systems specifically for LLM code generation. The modularity research is exceptional. The F-variant comparison methodology (systematic variable decomposition, multi-LLM testing, weighted evaluation) is rigorous. The core architecture decisions (F4, 21 elements, 9 skins, OKLCH color) are well-defended.

However, the project has several structural issues that, if left unaddressed, risk stalling progress or producing a system that fails in practice. This review identifies what's strong, what's problematic, and what's missing — organized by severity.

---

## I. STRENGTHS — What's Working Well

### 1. The Problem Statement Is Genuinely Original

The framing — "134 properties × free variables = LLM drift" — is not just marketing. The 134-property catalog in Blueprint_Draft_v0.5.md §3 is thorough and the "grouping by decision source" analysis that reduces it to ~10 free variables per element is the intellectual core of the project. This is the strongest argument for the system's existence and should be front-and-center in any public-facing material.

### 2. The F-Variant Decision Process Was Exemplary

Session 3's grid architecture comparison is the most rigorous decision in the project:
- Decomposed the problem into 5 independent binary variables
- Mapped 9 combinations, eliminated 4 contradictory/redundant ones
- Built visual prototypes for all 5 viable variants (experiment_4.html)
- Tested across 8 LLMs with consistent evaluation criteria
- Applied weighted scoring from the modularity research
- Documented the flexbox counter-proposal honestly rather than burying it

The F3 vs F4 final decision is defensible. The spatial reasoning argument (span accumulation = sequential state tracking vs. row wrappers = pattern matching) is particularly strong.

### 3. The Modularity Research Is Outstanding

Research_Report_Modularity.md (42K) is publication-quality. The cross-domain synthesis — from Simon's nearly-decomposable systems through LEGO tolerances to Boeing's failure modes — isn't just decorative. It directly informed:
- The section-as-module architecture (Simon's stable intermediates)
- The escape hatch design (Boeing: don't modularize immature tech)
- The 12-col grid choice (LEGO: maximize combinatorial richness from minimal primitives)
- The Carnegie Unit risk awareness (architectures ossify)

The strategic notes (Research_Report_Modularity_Notes.md) correctly identify Section/Card as the modularity unit and context windowing as the key LLM optimization.

### 4. The Color System Is Elegant

5 inputs → full derived palette via OKLCH is genuinely minimal. The `light-dark()` usage for automatic dark mode with zero additional tokens is clean. The visual depth model (containers get `--neutral-mute`, controls get `--neutral`) creates hierarchy without additional decisions.

### 5. Honest Risk Assessment

Section 11 of the blueprint identifies Risk 8 (LLM can't think in flat grids) as highest priority — this is correct and too many projects would bury or dismiss this. The acknowledgment that LLM improvement might make the project redundant (Risk 1) is also refreshingly honest.

---

## II. CRITICAL ISSUES — Must Address Before Spec v1.0

### 1. The Row Wrapper Mechanism Evolved Between Sessions and the Draft Is Internally Inconsistent

This is the biggest problem in the current documents. Three different row mechanisms appear:

**Session 3 / experiment_4.html:** `data-row="7-1"`, `data-row="1-5-2"`, `data-row="4-4"` — ratio-based values on article elements. This is the flexbox-like ratio catalog.

**Session 3 end / Session summaries (line 158-176):** The flexbox row discovery — `data-row` (bare, no value) with children self-sizing. Described as eliminating "the entire row-value catalog."

**Blueprint v0.5 §7 / experiment_5.html:** `data-colcount="12"` on article + `data-colspan="N"` on children. A 12-column grid. The ratio catalog is gone. This is the current locked decision (Decision #53).

**The problem:** The session summaries describe the flexbox discovery as "not yet resolved" and "needs prototyping." But the blueprint draft marks the colcount/colspan approach as locked. The transition between these — why the flexbox approach was rejected in favor of 12-col grid — is documented only in a parenthetical in §12 ("Rejected S4"). There is no Session 4 summary documenting this decision.

**Why this matters:** The flexbox row model is arguably simpler (zero child attributes for the "fixed + fill" pattern that covers most real layouts). The 12-col grid reintroduces per-child `data-colspan` attributes — the very "span accumulation" that the F4 architecture was partly chosen to avoid. The decision to reject flexbox deserves the same rigor as the F3/F4 comparison.

**Recommendation:** Write the Session 4 summary. Document the 6/8/10/12-col comparison that led to `data-colcount="12"`. Explicitly compare the flexbox model's strengths (zero child attrs for fixed+fill) against the grid model's strengths (explicit proportions, visual testing results). The current state reads like the conclusion changed without the reasoning being recorded.

### 2. Experiment 4 Uses CSS Classes and Divs — Contradicting Core Rules

blueprint_experiment_4.html uses `.f-group`, `.f3`, `.f4`, `.f-label`, `.chevron`, and `<div>` elements throughout. These directly violate the "zero CSS classes" and "no div" rules. While this is understandable as a comparison scaffold (it needs to show multiple variants side-by-side), it creates confusion about what the system actually looks like in practice.

More critically, the F3 variant in experiment_4 uses `data-cols="8"` and `data-span="N"` — attribute names that don't exist in the final spec (which uses `data-colcount` and `data-colspan`). And the F4 variant uses `data-row="7-1"` — the ratio catalog that was later replaced.

**Why this matters:** If someone (including an LLM) reads experiment_4 as a reference, they'll learn the wrong attribute names and the wrong row mechanism. The most important experiment in the project teaches the wrong API.

**Recommendation:** Either update experiment_4 to use final attribute names (even if the comparison scaffold needs temporary exceptions clearly marked), or add a prominent header comment noting which attributes are outdated. Better yet: create a new experiment that demonstrates the *final* locked architecture (data-colcount="12" + data-colspan) with the same complexity as experiment_4's Section Y.

### 3. Experiment 5 Uses `<div>` Instead of `<article>` for Row Wrappers

blueprint_expirement_5.html (note: typo in filename) uses `<div data-colcount="6">` etc. The locked decision is `<article>` as the row wrapper (Decision #52). This means the only experiment testing the final colcount/colspan mechanism uses the wrong element.

**Recommendation:** Fix experiment 5 to use `<article>` instead of `<div>`. Also fix the filename typo (`expirement` → `experiment`).

### 4. The `data-colcount="12"` Mechanism Has Unresolved Ergonomic Problems

The blueprint locks `data-colcount="12"` as the only supported value. But the Session 3 analysis showed that the key advantage of F4 over F3 was *eliminating child attributes*. The 12-col grid *reintroduces* child attributes (`data-colspan`). Consider:

**F4 with ratio rows (session 3):**
```html
<article data-row="7-1">
  <h3>Title</h3>
  <button>›</button>
</article>
```
Zero child attributes. The row defines proportions. Children just fill.

**F4 with 12-col grid (current spec):**
```html
<article data-colcount="12">
  <h3 data-colspan="10">Title</h3>
  <button data-colspan="2">›</button>
</article>
```
Two child attributes. The children must specify their width.

For a 50/50 split: `data-colspan="6" + data-colspan="6"` vs the old `data-row="2"`. For equal-N splits, the colcount approach requires explicit colspan on every child; the row approach required nothing.

The 12-col grid wins for *arbitrary* ratios (9+3, 10+1+1). But the session summaries show that most real layouts are either equal splits or "fixed + fill" — patterns where the ratio approach or flexbox approach had fewer attributes.

**Open question #54** (partial-width single elements) is also unresolved and directly affects whether the grid is the right mechanism.

**Recommendation:** Quantify the attribute cost. Take 10 representative real-world layouts (settings form, dashboard, toolbar, etc.) and count total `data-colspan` attributes needed with the 12-col grid vs. the ratio approach. If the grid consistently requires 2-3× more attributes, reconsider the flexbox hybrid (flexbox for "fixed + fill", grid for arbitrary ratios).

### 5. The JSX Experiment (experiment_3.jsx) Is Orphaned and Divergent

This 24K file implements a React comparison app with:
- Hardcoded dark-mode colors (no OKLCH, no light-dark())
- `.bp` class prefix (violates zero-classes rule)
- `data-grid="8"` (not `data-colcount="12"`)
- `data-span` (not `data-colspan`)
- `data-row` ratio values (not `data-colcount="12"` + `data-colspan`)
- `<div>` as row wrappers (not `<article>`)
- Inline styles for layout

It demonstrates an early-stage exploration of A+R1, R3, and C+R1 approaches — all of which predate the final F4 + colcount/colspan decision. The file is never referenced in the session summaries or blueprint draft.

**Recommendation:** Either remove this file or clearly mark it as historical/superseded. In its current state it's actively misleading — it looks like a production-ready React implementation of the system but teaches a completely different API.

---

## III. SIGNIFICANT CONCERNS — Should Address Soon

### 6. No Experiment Tests the Final Locked Architecture End-to-End

This is surprising given how rigorous the process has been. The current experiments test:
- Experiment 1: Defaults + skins (no grid layout)
- Experiment 3 HTML: Flattened column grids with `cols-N` skin approach (superseded)
- Experiment 3 JSX: R-options comparison (superseded)
- Experiment 4: F1/F3/F4/F5/F8 comparison (uses old attribute names)
- Experiment 5: colcount/colspan test (uses `<div>` instead of `<article>`, only tests search bar pattern)

**No experiment demonstrates the full locked spec:** `<article data-colcount="12">` + `data-colspan="N"` + all 9 skins + OKLCH color system + 4-layer CSS architecture + the full 21-element set, used together to build a realistic application section.

**Recommendation:** Create experiment_6 as the "reference section" — a realistic settings page or dashboard card built entirely with the locked spec. This serves triple duty: validates the spec, provides an example for the skill file, and proves the system can actually build something useful.

### 7. The Blueprint Draft Has Redundant and Outdated Sections

Blueprint_Draft_v0.5.md is 50K and comprehensive, but several sections need cleanup:
- §7 has a duplicate header "### Row Wrappers" immediately followed by "### Row Wrappers (12-Column Grid)"
- §12 "Ideas & Explorations" describes the Flexbox Row Model as both an active exploration and as "Rejected S4" in the same paragraph
- The Research Findings (§2) reference things like "session 2" and "session 3" inline, mixing historical narrative with specification — a future reader won't know what sessions 2-3 were
- Decision #53 in the log references "S4" but there are no Session 4 summaries
- Several decisions reference sessions that aren't documented in the summaries file

**Recommendation:** When producing v0.6 or v1.0, separate the spec (what the system IS) from the history (how decisions were made). The current draft is half-spec, half-design-diary. Both are valuable but serve different readers.

### 8. The "21 Elements" Claim Needs Precise Enumeration

The blueprint says "21 HTML elements + article row wrapper" but doesn't provide a single, clean, numbered list. Counting from the Implementation Surface section:

**Containers (5):** section, form, details, dialog, [popover] — but [popover] is an attribute, not an element. And `summary` is listed under Content but is structurally required inside `details` (a container).

**Components (5):** button, input text cluster, input[range], textarea, select — but "input text cluster" is 6+ elements (text, number, search, password, email, url, tel).

**Content (11+):** h1, h2, h3, h4, p, small, label, a, svg, summary, checkbox, radio, date, time, output, aside — that's 16 entries, not 11.

The count of "21" likely means 21 *categories* (where "input text cluster" = 1 and "h1-h4" = 1), but this should be made explicit. An LLM reading "21 elements" might interpret it as exactly 21 HTML tags and get confused when it encounters more.

**Recommendation:** Add a definitive numbered table: one row per element/category, with the actual HTML tag(s), display category, and a one-line description. This is the single most important reference artifact for LLM use.

### 9. Skin Interaction Matrix Not Documented

The 9 skins are composable (`data-skin="emphasis round"`), but not all combinations are meaningful or tested. The blueprint doesn't document:
- Which combinations are *intended* (emphasis + round = accent pill)
- Which are *contradictory* (ghost + emphasis — both set background)
- Which are *redundant* (transparent + ghost — similar effect)
- Which are *untested* (mute + emphasis — does mute override emphasis text color?)

Experiment 1 tests a few compositions (emphasis+round, ghost+square, emphasis+square+round) but not systematically.

**Recommendation:** Create a 9×9 matrix showing which skin combinations are valid, which are meaningless, and which produce unexpected results. This is essential for the skill file — without it, an LLM will inevitably try `data-skin="ghost emphasis"` and produce unpredictable output.

### 10. The `half` and `full` Skins Are Layout Skins Disguised as Visual Skins

`half` (max-inline-size: 50%) and `full` (inline-size: 100%) control sizing/layout, not appearance. They're categorized alongside visual skins (emphasis, ghost) and shape skins (round, flat) in the skin layer. But in the F4 architecture, layout is supposed to be handled by the grid layer (section stacking + article row wrappers + colcount/colspan).

This creates ambiguity: should a half-width button be `<button data-skin="half">` (skin approach) or `<article data-colcount="12"><button data-colspan="6">...</button></article>` (grid approach)?

This is exactly Open Decision #54 ("partial-width single elements"). But it's not just an open decision — it's an architectural tension. The skin layer and grid layer both claim responsibility for element sizing.

**Recommendation:** Resolve this before v1.0. Either:
- (a) Remove `half`/`full` from skins and handle all sizing through the grid layer (purist approach, higher attribute cost)
- (b) Keep them but document clearly when to use skins vs. grid for sizing (pragmatic approach, needs clear rules)
- (c) Rename them to make the distinction clear (e.g., move to a `data-size` attribute separate from `data-skin`)

---

## IV. MINOR ISSUES & HOUSEKEEPING

### 11. Filename Typo
`blueprint_expirement_5.html` → should be `blueprint_experiment_5.html`

### 12. Missing Experiment 2
Files go experiment_1, experiment_3, experiment_4, experiment_5. There is no experiment_2. If it existed and was deleted, note that somewhere. If the numbering just skipped, renumber or document why.

### 13. Experiment 4 Contains Two Concatenated HTML Documents
blueprint_experiment_4.html has a complete HTML document (lines 1-485) immediately followed by a second `<!DOCTYPE html>` and another complete document (lines 487-959). This appears to be an accidental concatenation. The second document is nearly identical to the first but with structural differences (the second is missing `<body>` tags, has a slightly different F1 Section Y).

### 14. The Modularity Notes File Is Wrapped in a Markdown Code Block
Research_Report_Modularity_Notes.md wraps its entire content in triple-backtick markdown fences. This means it renders as a code block rather than as formatted markdown. Remove the outer fences.

### 15. Session Summaries Stop at Session 3
Blueprint_Draft_v0.5 references decisions made in "S4" (decisions #25, #53, #55, and the flexbox rejection in §12). But Research_Sessions_Summaries.md only covers sessions 1-3. Session 4's decisions are embedded in the draft but not in the summary file.

### 16. The `--ease` Token Is Defined but Underdocumented
`--ease: cubic-bezier(0.25, 0, 0.3, 1)` appears in every experiment but isn't mentioned in the blueprint draft's token section. It's used for transitions but isn't listed alongside the spacing/color tokens.

### 17. Experiment 3 HTML Uses `cols-N` Skins That Were Removed
The flattened column grid test uses `data-skin="cols-2"`, `data-skin="cols-4"` etc. — skins that were explicitly removed in Session 3 (Decision #55). This experiment is now misleading about the system's API.

---

## V. STRATEGIC OBSERVATIONS

### The Real Risk Is Not Technical — It's Velocity

The research quality is high. The decisions are well-reasoned. But three sessions have produced:
- 42K of modularity theory
- 50K of blueprint specification
- 5 experiments totaling 88K, most of which are now outdated
- Zero lines of production CSS
- Zero reference applications

The CLAUDE.md correctly identifies this: "Priority: Core architecture first. Details like signal states/hues come later." But the architecture IS decided (F4, colcount/colspan, 9 skins, OKLCH). What's needed now is a single, clean CSS file that implements the locked decisions, and one realistic app that proves it works.

The modularity research (42K) is valuable but may be encouraging deep exploration at the expense of shipping. The research correctly identifies the Carnegie Unit risk (architectures ossify) — but the counter-risk is also real: over-researching before implementing means the architecture calcifies around theoretical arguments rather than practical testing.

### The `data-colcount="12"` Decision May Be Premature

It's locked as Decision #53, but:
- Only one experiment (experiment_5) tests it, and that experiment uses `<div>` instead of `<article>`
- That experiment tests only a single pattern (search bar with icon buttons)
- The flexbox alternative was "not yet resolved" at end of Session 3, then appears rejected in S4 without documented comparison
- The ratio approach (`data-row="7-1"`) from Session 3 had zero child attributes for most patterns

This is a high-impact decision (it determines the attribute cost of every multi-element row in every app built with the system). It deserves the same rigor as F3 vs F4. Consider un-locking it until a full comparison experiment exists.

### The Skill File Is the Most Important Unwritten Artifact

The blueprint correctly identifies that CLAUDE.md should be <200 lines with the detailed catalog in a skill file. But the skill file doesn't exist yet, and it's the artifact that will actually determine whether LLMs can use the system. The skill file needs:
- The definitive element table (21 categories with actual tags)
- The skin interaction matrix
- 10-15 before/after examples per layout type
- The precise rules for when to use article wrappers vs. direct children

This should be a near-term priority — earlier than signal states, earlier than a validator script.

---

## VI. SUMMARY OF RECOMMENDATIONS

**Immediate (before next experiment):**
1. Write Session 4 summary documenting the colcount/colspan decision and flexbox rejection rationale
2. Fix experiment_5: change `<div>` to `<article>`, fix filename typo
3. Fix experiment_4: add header comment noting outdated attribute names, fix duplicate HTML document

**Before spec v1.0:**
4. Create experiment_6: full reference section using the complete locked spec
5. Resolve the half/full skin vs. grid sizing tension (Decision #54)
6. Add definitive numbered element table
7. Create skin interaction matrix (9×9, valid/invalid/untested)
8. Separate spec from design history in the blueprint document
9. Quantify attribute cost: 12-col grid vs. ratio rows vs. flexbox across 10 real layouts

**Near-term priorities:**
10. Write the first production CSS file implementing all locked decisions
11. Write the skill file with examples
12. Build one reference app

---

*This review is based on reading every file in the repository. It is intended to be constructive — the project's foundations are strong and the research methodology is rigorous. The issues identified are fixable and the strategic direction is sound.*
