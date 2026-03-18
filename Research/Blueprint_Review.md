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

