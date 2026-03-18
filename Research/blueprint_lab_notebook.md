# Blueprint Lab Notebook — Sessions 1–5

## Session 1 (March 15, 2026): Foundation

Started from the project brief (theoretical framework) and built the first working CSS prototype. Went from ~70 candidate elements to 21, established a token system, wrote default styles, tested on device, and drafted 9 composable skins.

### Element Selection Process

Started with ~70 native HTML elements, cut progressively:

- 70 → 41: dropped niche/media/table elements
- 41 → 30: merged input types into clusters (text cluster, date/time, check/radio)
- 30 → 21: dropped redundant semantic containers, low-use elements

Final list: 21 elements + article row wrapper. See `blueprint_spec.md` for current catalog.

---

## Session 2 (March 16, 2026): Flat DOM & Column Grids

Challenged the blueprint toward minimal DOM depth. Discovered that nested sections add structural overhead with zero visual benefit. Introduced column grid skins to replace the p-as-wrapper pattern and eliminate section-inside-section nesting. Conducted cross-domain modularity research. Identified a critical LLM blind spot around flat DOM patterns and developed a framing strategy for the skill file.

### The Discovery

Built 8 test layouts with nested sections. Removed all inner sections, flattening everything. Tested on device. **Result: visually identical.** Nesting was pure structural overhead.

Session 3 revealed that row wrappers (F4) require depth 4 for multi-element rows. This is content grouping, not structural nesting. Decision #43 amended: "Max depth 3 for structure, depth 4 allowed for article row wrappers and HTML-mandated nesting."

@Research/Blueprint_expirement_2.html

---

## Session 3 (March 17, 2026): Grid Architecture Decision

Systematically compared grid approaches and row-handling strategies. Built visual prototypes and DOM trees. Identified missing evaluation criteria from strategic notes and modularity research. Tested 5 LLM-readable DOM variants (F1–F8) across 7 different LLMs. Chose F4 (1-col section + optional article row wrappers). Key open decisions remaining on row wrapper attribute and values.

### Three Base Approaches Compared

- **A** — Section is always 8 columns. Children use `data-span` to claim width. Every element needs a span.
- **B** — Section sets column count via `data-skin="cols-N"`. Children auto-fill. No child attributes for uniform grids. Breaks on mixed-width rows.
- **C** — Combination: section sets cols-N, children can override with data-span.

### Key Finding: B Breaks, A Taxes, C Mixes Problems

Built 13 test patterns in 2 sections across all three approaches. Results:

- **A:** 31 data-span attributes. Every element taxed. Single-column content pays for multi-column's existence.
- **B:** Zero child attrs for uniform grids. But forces 8 inner sections with inline style overrides for mixed-width rows. Breaks depth-3 rule.
- **C:** 14 child attrs in multi-col section, clean in 1-col section. 2 inner sections as workaround.

### Refinement Options Explored (R0–R6, R2+)

Explored 8 refinement strategies. Key findings:

- **R1 (default spans):** Halves attrs (31→14) but only helps elements with stable widths.
- **R2 (optional row wrappers):** Zero child attrs. Rows only for multi-element lines.
- **R2+ (named row patterns):** Same as R2 but semantic names. Better linguistics, worse adaptivity.
- **R3 (mandatory rows):** Zero child attrs. 19 wrappers for 13 patterns. Verbose.
- **R5 (single-column only):** Maximum compression. Can't build target apps.

### Five Viable F-Variants

| F-variant | Depth | Section cols | Rows      | Span | Description                                    |
| --------- | ----- | ------------ | --------- | ---- | ---------------------------------------------- |
| F1        | 3     | no           | none      | no   | Single column only                             |
| F3        | 3     | yes          | none      | yes  | Section cols + child spans (with CSS defaults) |
| F4        | 3–4   | no           | optional  | no   | Row wrappers only, no span                     |
| F5        | 3–4   | no           | optional  | yes  | Row wrappers + span within rows                |
| F8        | 4     | no           | mandatory | no   | Every element in a row wrapper                 |

**F5 eliminated:** Tested across 7 LLMs, consistently ranked worst (avg 3.6/5). Mixed paradigm confuses all readers.

### LLM Readability Survey (7 LLMs + 1 additional)

Tested DOM readability across Claude Opus, Claude Sonnet (via POE), DeepSeek v3, Gemini 3 Fast, Gemini 3.1 Pro, GLM 5.0, GPT 5.3/4, Perplexity.

|     | DeepSeek | Gemini Fast | Gemini Pro | GPT | Perplexity | Sonnet | GLM | Opus | Avg     |
| --- | -------- | ----------- | ---------- | --- | ---------- | ------ | --- | ---- | ------- |
| F3  | 2        | 3           | 1          | 4   | 1          | 2      | 2   | 2    | **2.1** |
| F4  | 4        | 2           | 2          | 2   | 3          | 1      | 3   | 1    | **2.3** |
| F8  | 5        | 1           | 1          | 1   | 5          | 3      | 5   | 3    | **3.1** |
| F1  | 1        | 5           | 5          | 5   | 2          | 5      | 1   | 5    | **3.4** |
| F5  | 3        | 4           | 4          | 3   | 4          | 4      | 4   | 3    | **3.6** |

**F3 and F4 are the top two.** F3 edges slightly (2.1 vs 2.3).

**Key insight from spatial reasoning research:** LLMs struggle with "combinatorial planning, layout perturbation, and spatiotemporal geometry." F3 requires span accumulation (sequential spatial state tracking). F4 makes boundaries explicit via row wrappers — converts spatial reasoning into pattern matching.

**Counter-insight from ARIA/web platform:** Both patterns exist — CSS Grid = F3 (implicit rows), HTML tables/ARIA grid = F4 (explicit rows). The platform itself uses both.

### Evaluation Framework

#### Goals (from problem statement + strategic notes + modularity research)

1. **Decision Compression** — Kill the 300 micro-decisions that cause drift.
2. **Linguistic Parity** — No-noise communication LLM ↔ user.
3. **Contextual Gravity** — File sizes, debugging, drag-and-drop portability.
4. **Structural Determinism** — Stop DOM bloat/hallucinations.
5. **Adaptivity/Differentiation** — Allow user freedom of choice (IKEA principle).

#### Missing Goals Identified (from strategic notes)

- Section/Card as file-based portable unit. Card = file = context boundary.
- LLM context windowing. Bug = open one file.
- Clone-based creation. New cards by duplicating existing ones.

#### Weights

| Aspect                | Weight | Rationale                                             |
| --------------------- | ------ | ----------------------------------------------------- |
| 1. Compression        | ×3     | IS the problem statement                              |
| 4. Determinism        | ×3     | Other face of same problem                            |
| 2. Linguistic parity  | ×2     | Quality of human-LLM loop                             |
| 3. Contextual gravity | ×2     | Quality of dev workflow                               |
| 5. Adaptivity         | ×2     | Adoption cost — every point below vanilla is friction |

Adaptivity floor: must score 3+ (can build target apps). Measured against what users actually need, not against unlimited CSS (the IKEA-vs-carpenter framing).

### Flexbox Row Discovery (End of Session 3)

Late in the session, challenged the grid-based row wrapper model. Observation: most "ratio" layouts are actually "one thing is fixed, the rest fills":

| Pattern         | Real intent                               |
| --------------- | ----------------------------------------- |
| Title + chevron | Title fills, icon is fixed                |
| Search bar      | Icon fixed, button fixed, input fills     |
| Checkbox row    | Checkbox fixed, label fills, number fixed |

A flexbox row with `data-row` (bare, no value) sets `display: flex`. Children use existing skins for fixed sizing and `flex: 1` to fill. No ratio catalog needed.

@Research/blueprint_expirement_3.jsx

---

## Session 4 (March 18, 2026): Grid Density Testing

**Goal:** Resolve the row wrapper mechanism — determining how article rows partition space between children.

### Process & Discovery

1. Evaluated `data-colcount` / `data-colspan` attribute system as an alternative to `data-skin` column approach.
2. Built a test HTML with a search-bar pattern (text input + 2 icon buttons) utilizing 6, 8, 10, and 12 column grids.
3. Tested on a mobile viewport (~470px) with grid overlay screenshot:
   - **6-col:** Buttons too large.
   - **8-col:** Buttons remained chunky.
   - **10-col:** Optimal visual proportions.
   - **12-col:** Near-identical to 10-col, but maximally divisible (2, 3, 4, 6).
4. Selected 12 as the sole column count.

- **Test Artifact:** `@Research/blueprint_experiment_5.html`

---

## Session 5 (March 18, 2026): Layout Architecture & LLM Evaluation

Critiqued F3 and F4 layout candidates with a focus on DOM self-description and LLM readability. Discovered that LLMs tend to hallucinate "obvious defaults" in implicit (F3) systems.

### Key Topics

- **F3 vs. F4 Layout Architecture:**
    - **F3:** `data-cols` on sections and `data-span` on children, relying on implicit defaults.
    - **F4:** `<article data-row="N-M">` wrapper rows with explicit column assignments.
- **DOM Self-Description:** F4 yields a fully self-describing DOM (element widths readable strictly from DOM attributes). F3 introduces implicit gaps where elements without `data-span` rely on CSS conventions invisible in the DOM.
- **LLM Evaluation Critique:** Re-examined methodology. LLMs favored F3 because they processed isolated DOM text rather than rendered output — failed to flag F3's ambiguous width data, hallucinating assumptions instead.

### Core Insight

LLMs inherently treat the absence of explicit information as an "obvious default" rather than identifying missing information. A non-self-describing DOM undermines the primary objective of an LLM-assisted development framework.

@Research/Blueprint_expirement_6.html
