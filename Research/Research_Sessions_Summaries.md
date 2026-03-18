# Blueprint Session Summary — Sessions 1, 2 & 3

## Session 1 (March 15, 2026): Foundation

Started from the project brief (theoretical framework) and built the first working CSS prototype. Went from ~70 candidate elements to 21, established a token system, wrote default styles, tested on device, and drafted 9 composable skins.

## Session 2 (March 16, 2026): Flat DOM & Column Grids

Challenged the blueprint toward minimal DOM depth. Discovered that nested sections add structural overhead with zero visual benefit. Introduced column grid skins to replace the p-as-wrapper pattern and eliminate section-inside-section nesting. Conducted cross-domain modularity research. Identified a critical LLM blind spot around flat DOM patterns and developed a framing strategy for the skill file.

## Session 3 (March 17, 2026): Grid Architecture Decision

Systematically compared grid approaches and row-handling strategies. Built visual prototypes and DOM trees. Identified missing evaluation criteria from strategic notes and modularity research. Tested 5 LLM-readable DOM variants (F1–F8) across 7 different LLMs. Chose F4 (1-col section + optional article row wrappers). Key open decisions remaining on row wrapper attribute and values.

---

## Element Selection (Session 1)

Started with ~70 native HTML elements, cut progressively:

- 70 → 41: dropped niche/media/table elements
- 41 → 30: merged input types into clusters (text cluster, date/time, check/radio)
- 30 → 21: dropped redundant semantic containers, low-use elements

Final list: 21 elements + article row wrapper. See blueprint_v4 §5 for current catalog.

---

## DOM Depth Constraint (Session 2)

### The Discovery

Built 8 test layouts with nested sections. Removed all inner sections, flattening everything. Tested on device. **Result: visually identical.** Nesting was pure structural overhead.

### Locked Constraint: Max Structural Depth 3, Depth 4 for Row Wrappers

```
body (1) → section (2) → content element (3)
body (1) → section (2) → article row wrapper (3) → content element (4)
```

Depth 4 also allowed when HTML mandates it: form children, svg inside button, small inside p.

Session 3 revealed that row wrappers (F4) require depth 4 for multi-element rows. This is content grouping, not structural nesting. Decision #43 amended: "Max depth 3 for structure, depth 4 allowed for article row wrappers and HTML-mandated nesting."

---

## Grid Architecture Analysis (Session 3)

### Three Base Approaches Compared

- **A** — Section is always 8 columns. Children use `data-span` to claim width. Every element needs a span.
- **B** — Section sets column count via `data-skin="cols-N"`. Children auto-fill. No child attributes for uniform grids. Breaks on mixed-width rows.
- **C** — Combination: section sets cols-N, children can override with data-span.

### Key Finding: B Breaks, A Taxes, C Mixes Problems

Built 13 test patterns in 2 sections across all three approaches. Results:

- **A:** 31 data-span attributes. Every element taxed. Single-column content (checklist, text, labels) pays for multi-column's existence.
- **B:** Zero child attrs for uniform grids. But forces 8 inner sections with inline style overrides for mixed-width rows. Breaks depth-3 rule.
- **C:** 14 child attrs in multi-col section, clean in 1-col section. 2 inner sections as workaround.

### Refinement Options Explored (R0–R6, R2+)

Explored 8 refinement strategies. Key findings:

- **R1 (default spans):** Halves attrs (31→14) but only helps elements with stable widths. Buttons remain contextual — no single default works.
- **R2 (optional row wrappers):** Zero child attrs. Rows only for multi-element lines. Reintroduces div/article as constrained layout primitive.
- **R2+ (named row patterns):** Same as R2 but semantic names ("button-pair") instead of numbers. Better linguistics, worse adaptivity.
- **R3 (mandatory rows):** Zero child attrs. 19 wrappers for 13 patterns. 11 wrappers hold single elements. Depth always 4. Structurally pure but verbose.
- **R5 (single-column only):** Maximum compression. Zero layout decisions. But can't build target apps (games, dashboards).

### Variable Reduction

Reduced the decision space from R-options to 5 independent variables:

1. DOM depth: 3 only / mixed 3–4 / always 4
2. Column attribute on section: yes / no
3. Row wrapper with attribute: yes / no
4. Span attribute on content elements: yes / no
5. Rows mandatory or optional: every line / multi-element only / none

### Nine combinations mapped, four eliminated as contradictory/redundant. Five viable:

| F-variant | Depth | Section cols | Rows      | Span | Description                                    |
| --------- | ----- | ------------ | --------- | ---- | ---------------------------------------------- |
| F1        | 3     | no           | none      | no   | Single column only                             |
| F3        | 3     | yes          | none      | yes  | Section cols + child spans (with CSS defaults) |
| F4        | 3–4   | no           | optional  | no   | Row wrappers only, no span                     |
| F5        | 3–4   | no           | optional  | yes  | Row wrappers + span within rows                |
| F8        | 4     | no           | mandatory | no   | Every element in a row wrapper                 |

**F5 eliminated:** Tested across 7 LLMs, consistently ranked worst (avg 3.6/5). Mixed paradigm (rows AND spans) confuses all readers.

### LLM Readability Survey (7 LLMs + 1 additional)

Tested DOM readability of F1/F3/F4/F5/F8 across Claude Opus, Claude Sonnet (via POE), DeepSeek v3, Gemini 3 Fast, Gemini 3.1 Pro, GLM 5.0, GPT 5.3/4, Perplexity.

**LLM-readability rankings (1=best):**

|     | DeepSeek | Gemini Fast | Gemini Pro | GPT | Perplexity | Sonnet | GLM | Opus | Avg     |
| --- | -------- | ----------- | ---------- | --- | ---------- | ------ | --- | ---- | ------- |
| F3  | 2        | 3           | 1          | 4   | 1          | 2      | 2   | 2    | **2.1** |
| F4  | 4        | 2           | 2          | 2   | 3          | 1      | 3   | 1    | **2.3** |
| F8  | 5        | 1           | 1          | 1   | 5          | 3      | 5   | 3    | **3.1** |
| F1  | 1        | 5           | 5          | 5   | 2          | 5      | 1   | 5    | **3.4** |
| F5  | 3        | 4           | 4          | 3   | 4          | 4      | 4   | 3    | **3.6** |

**F3 and F4 are the top two.** F3 edges slightly (2.1 vs 2.3). Both get multiple 1st and 2nd place votes. Neither is ever worst.

**Key insight from spatial reasoning research:** LLMs struggle with "combinatorial planning, layout perturbation, and spatiotemporal geometry." F3 requires span accumulation to find row boundaries (sequential spatial state tracking). F4 makes boundaries explicit via row wrappers. This suggests F4's advantage is architecturally durable — it converts a spatial reasoning problem into a pattern matching problem.

**Counter-insight from ARIA/web platform analysis:** Both patterns exist in the web platform:

- CSS Grid: 2-level (grid → cells), implicit rows = F3
- HTML tables / ARIA grid: 3-level (grid → row → cell), explicit rows = F4
- The platform itself doesn't resolve this — it uses both.

### Evaluation Framework (Session 3)

#### Goals (from problem statement + strategic notes + modularity research)

1. **Decision Compression** — Kill the 300 micro-decisions that cause drift.
2. **Linguistic Parity** — No-noise communication LLM ↔ user.
3. **Contextual Gravity** — File sizes, debugging, drag-and-drop portability. Section = file = context boundary.
4. **Structural Determinism** — Stop DOM bloat/hallucinations, increase LLM and user DOM comprehension.
5. **Adaptivity/Differentiation** — Allow user freedom of choice. The IKEA principle: user pays constraint cost only if the gains justify it.

#### Missing Goals Identified (from strategic notes, not previously in blueprint)

- **Section/Card as file-based portable unit.** Each card in its own file, contains own logic, can be cloned. Layout decisions internal to section (not dependent on parent).
- **LLM context windowing.** Card is the context boundary. Bug = open one file. Convention learning = read one card.
- **Clone-based creation.** New cards by duplicating existing ones. System must produce cards worth cloning.

#### Weights

| Aspect                | Weight | Rationale                                             |
| --------------------- | ------ | ----------------------------------------------------- |
| 1. Compression        | ×3     | IS the problem statement                              |
| 4. Determinism        | ×3     | Other face of same problem                            |
| 2. Linguistic parity  | ×2     | Quality of human-LLM loop                             |
| 3. Contextual gravity | ×2     | Quality of dev workflow                               |
| 5. Adaptivity         | ×2     | Adoption cost — every point below vanilla is friction |

Adaptivity floor: must score 3+ (can build target apps). Measured against what users actually need, not against unlimited CSS (the IKEA-vs-carpenter framing).

#### Key Adaptivity Insight

Reframed via modularity research: adaptivity isn't "can the user do anything" — it's "can the system handle unanticipated layout needs without architectural change." Carnegie Unit risk: if the system can't evolve, it ossifies. Henderson & Clark: architectural knowledge embeds into structure, making change harder over time.

### Flexbox Row Discovery (End of Session 3)

Late in the session, challenged the grid-based row wrapper model. Observation: most "ratio" layouts are actually "one thing is fixed, the rest fills":

| Pattern         | Real intent                               |
| --------------- | ----------------------------------------- |
| Title + chevron | Title fills, icon is fixed                |
| Search bar      | Icon fixed, button fixed, input fills     |
| Checkbox row    | Checkbox fixed, label fills, number fixed |

A flexbox row with `data-row` (bare, no value) sets `display: flex`. Children use existing skins for fixed sizing (`square`, etc.) and `flex: 1` to fill. No ratio catalog needed. No `data-row="7-1"`.

This eliminates:

- The entire row-value catalog
- CSS rules per ratio value
- The naming confusion (row defining columns)
- Empty placeholder elements

**Not yet resolved.** Needs prototyping. The equal-split case and partial-width-single-element case still need solutions.
