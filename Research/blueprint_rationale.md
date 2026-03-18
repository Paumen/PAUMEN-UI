# LLM Web App Blueprint — Design Rationale

> **Role:** Decision rationale and design reasoning — explains *why* the spec is the way it is. Not authoritative for current system state; defer to `blueprint_spec.md` on conflicts.
> **Reading order:** Read after the spec. See `blueprint_lab_notebook.md` for session-level chronology, `blueprint_theoretical_research.md` for foundational theory.

## 1. Problem Statement

LLMs are increasingly used to generate web application code, but they produce inconsistent, bloated, and unpredictable UI output. The root cause is that the decision space for any given UI element is enormous — approximately 134 independently variable properties covering appearance, behavior, layout, states, spacing, typography, and more. When an LLM is asked to "add a settings page," it must make hundreds of micro-decisions: what padding on this card, what shade of blue for that button, what border radius, what hover effect, what font size for secondary text. Each decision is individually reasonable, but collectively they drift across sessions, across pages, and across projects.

Current design systems and CSS frameworks are designed for human developers who can exercise judgment and maintain visual consistency through taste and experience. They offer flexibility as a feature — dozens of utility classes, configurable component APIs, multiple layout options. For LLM-assisted development, this flexibility is the problem. Every option is a potential inconsistency. Every configurable property is a hallucination opportunity.

The result in practice: by session five, an LLM-built prototype feels subtly wrong. By session ten, it looks like three different products built by three different teams. Fixing this requires either constant human oversight (defeating the purpose of LLM-assisted development) or throwing away and regenerating large sections of UI.

This project attempts to solve this by inverting the usual design system philosophy: instead of maximizing flexibility, maximize constraint. Create a system where the vast majority of those 134 properties are deterministic consequences of 2–3 choices per element, leaving the LLM with almost nothing to decide and almost nothing to get wrong.

### Why This Matters Beyond LLMs

Even if LLMs improve dramatically, a highly constrained component system benefits human developers too: faster onboarding, fewer code review cycles, easier maintenance, guaranteed consistency across contributors. The system is valuable independent of who writes the code. The LLM use case simply makes the payoff more immediate and measurable.

---

## 2. Vision & Goals

Build a minimal, reusable blueprint (design system + conventions + tooling) for developing web apps with Claude Code. The system should be so constrained and predictable that Claude can implement features autonomously with near-zero UI or styling decisions.

### Operational Goals

- **Decision Compression:** Kill the 300 micro-decisions. Claude never writes custom CSS. All styling comes from the system. If something can't be built with existing elements + skins, Claude stops and proposes a new skin — it does not improvise.
- **Linguistic Parity:** No-noise communication LLM ↔ user. Reduce prompt complexity by constraining the decision space.
- **Structural Determinism:** Stop DOM bloat/hallucinations. Given a description, there is one correct DOM structure.

### Architectural Goals — The IKEA Principle (constraint enables, not limits)

- **Contextual Gravity:** Article/Card is the primary unit of modularity. Each card is a self-contained file that can be debugged, cloned, and moved between apps. Card = file = context boundary for the LLM. Bug = open one file. Convention learning = read one card. New features by duplicating existing cards.
- **Adaptivity/Differentiation:** Allow user freedom of choice. Modern, responsive, customizable (change one hue to change the whole theme). The system constrains _how_ you build but not _what_ you build.

---

## 3. Research Findings (March 2026)

### "Expose Your Design System to LLMs" — Hardik Pandya (March 2026)

The most directly relevant prior art. Key insights:

- LLMs make 200–300 visual micro-decisions per session (padding, colors, radius, font sizes), each reasonable in isolation but collectively inconsistent.
- By session 5 the prototype feels "off"; by session 10 it looks like 3 different products.
- Solution: structured spec files (LLM reads every session), a closed token layer (picks from named variables instead of fabricating values), and an audit script (catches drift, returns exit code 1 on violations).
- Tested on Atlassian's design system: went from 418 hardcoded CSS values across 28 files to zero, with 230+ named tokens and 64 spec files.
- **Gap for our use case:** solves "Claude picks the wrong blue" but not "Claude shouldn't be choosing layout approaches at all." Our blueprint goes further by constraining structure and composition, not just visual tokens.

### Open Props UI (v3.3.5, Feb 2026)

- Pure CSS component library built on Open Props tokens using container queries, CSS layers, and OKLCH colors.
- Copy-paste architecture: no npm dependencies, you own the code.
- Modern CSS features aligned with our preferences.
- **Gap:** No layout composition components, no enforcement tooling, not designed as a closed system. Massive CSS footprint (thousands of lines just for theme).
- **Decision: Not used.** Our token system is much simpler (5 inputs vs thousands of lines). Built from scratch.

### Web Awesome (Shoelace 3.0, public beta Feb 2026)

- Full CSS framework + 50+ web components built with Lit.
- Leans into grid/flexbox mechanics; margin/padding utilities not needed because gap handles spacing.
- Shadow DOM for encapsulation.
- **Gap:** Large component set (too much API surface for Claude), dependency on Lit (~5KB), Shadow DOM makes global styling harder.
- **Decision:** Not adopted. Some ideas borrowed (gap-based spacing, grid-first layout).

### Claude Code Architecture (March 2026)

- Four layers: CLAUDE.md (persistent context), Skills (auto-invoked knowledge packs), Hooks (deterministic safety gates), Agents (scoped subagents).
- CLAUDE.md should target under 200 lines. Overstuffed files cause Claude to ignore rules.
- Skills can be project-level (`.claude/skills/`) or personal (`~/.claude/skills/`).
- **Decision:** Component catalog lives in a skill file, not CLAUDE.md. CLAUDE.md contains only hard rules. Enforcement tooling is out of scope for initial stage but easy to add later.

### LLM Spatial Reasoning Limitations (March 2026, Session 3)

Research on LLM spatial capabilities revealed structural limitations relevant to grid architecture choice:

- LLMs struggle with combinatorial planning, layout perturbation, and spatiotemporal geometry.
- They commit logical and computational errors when connecting macro-scale environments to precise computational geometry.
- Unlike humans who build viewpoint-independent cognitive maps, LLMs rely on next-token prediction which fails when spatial state must be tracked over sequences.
- **Impact on grid choice:** Span accumulation (tracking which elements share a row by adding up column spans) is exactly the kind of spatial state tracking LLMs are architecturally weak at. Explicit row boundaries (F4 model) convert this into pattern matching, which LLMs excel at. This was a factor in choosing F4 over F3.

---

## 4. Aspect Decomposition

### The Problem

A UI element has ~134 independently specifiable properties. If each is a free variable, the combinatorial space is unmanageable. The blueprint must reduce this to a small number of actual decisions per element.

### 134 Properties — Full Catalog

**Visual / Appearance (1–10):** Fill color, text color, border color, border width, border style, border radius, shadow/elevation, opacity, gradient, backdrop effect.

**Typography (11–19):** Font family, font size, font weight, line height, letter spacing, text alignment, text decoration, text transform, text overflow behavior.

**Spacing / Box Model (20–23):** Internal padding, external margin, gap between children, inline spacing (icon-to-label).

**Sizing (24–27):** Width, height, aspect ratio, content-driven vs container-driven sizing.

**Layout — Self (28–35):** Grid column position, grid row position, column span, row span, alignment within cell, justify within cell, overflow behavior, z-index.

**Layout — Children (36–43):** Display mode, grid template, flex direction, flex wrap, child alignment, child distribution, child gap, content flow direction.

**Interactive States (44–59):** Default, hover, focus, focus-visible, active, disabled, loading, dragging, selected/checked, expanded/collapsed, open/closed, error/invalid, valid/success, warning, read-only, placeholder.

**Data States (60–65):** Empty, loading, loaded, error, partial, skeleton.

**Semantic Identity (66–69):** HTML element, ARIA role, ARIA attributes, purpose/intent.

**Interaction Behavior (70–78):** Clickable, focusable, keyboard shortcuts, drag/drop, resizable, dismissible, toggleable, submittable, copyable.

**Feedback (79–85):** Cursor type, transition on state change, transition duration, transition easing, ripple/click, haptic, sound.

**Data Behavior (86–90):** Value binding, validation rules, default value, input mask, autocomplete.

**Relationship — Parent (91–94):** Depth in tree, stretch vs intrinsic, color inheritance, overflow/clip.

**Relationship — Siblings (95–98):** Order, visual grouping, dividers, shared state.

**Relationship — Children (99–102):** Expected child count, allowed child types, imposes layout, passes context down.

**Responsiveness (103–107):** Narrow viewport, wide viewport, container-query breakpoints, density adaptation, orientation.

**Theming (108–111):** Light mode, dark mode, high contrast, accent application.

**Motion / Animation (113–117):** Enter animation, exit animation, layout shift, scroll-triggered, reduced-motion alternative.

**Accessibility (118–123):** Keyboard operability, screen reader announcement, color contrast, touch target size, focus trap, live region.

**Content (124–128):** Text/label, icon, image/media, badge/overlay, placeholder/hint text.

**Context / Environment (129–134):** Inside form, inside modal, inside scrollable, primary action, repeated element, print appearance.

### Grouping by Decision Source

| Group                                                     | Items | Who decides           | Decisions per element |
| --------------------------------------------------------- | ----- | --------------------- | --------------------- |
| Global tokens                                             | ~15   | You, once per project | 0                     |
| HTML element (behavior + a11y)                            | ~15   | The tag choice        | 0–1                   |
| Visual recipe (appearance + dimensions + internal layout) | ~40   | The skin choice       | 0–1                   |
| States (interactive + data, derived from recipe)          | ~22   | Automated             | 0                     |
| Parent context (gap, alignment, inheritance)              | ~15   | The parent            | 0                     |
| Placement + content (grid position, span, what's inside)  | ~10   | Claude/user           | 1–3                   |
| System/responsive (viewport, theme, animation)            | ~14   | Automated             | 0                     |

**~124 of 134 items require zero per-element decisions.** The remaining ~10 are: where, how big, and what content.

### Revised Group Map

After analysis, the original 14 groups were merged and restructured:

- **C (Visual Surface) + D (Typography) → merged into C (Appearance)** — the split was artificial; border color and font weight are both "how it looks."
- **I (Data States) absorbed into H (States)** — "user hovered" and "data is loading" are both conditional changes that modify appearance.
- **A split into two separate nodes:**
  - **A (HTML Element)** — which tag. Narrow. Determines behavior + accessibility only. Does NOT determine appearance (everyone resets native styles) or dimensions.
  - **V (Visual Recipe / Skin)** — the predetermined visual package. Determines appearance, dimensions, internal layout, state styling, transitions. Primary visual determination engine.
- **N (Accessibility)** — ARIA moved to Appearance group (it's about how users perceive the element). Keyboard/behavior stays with A.

Key insight: The HTML tag has limited determination power for appearance — it mainly determines behavior and accessibility. The real visual determination comes from the skin.

---

## 5. MECE Aspect Model

### Not Fixed to 3 Factors

The system has 4–5 identifiable aspects, but coupling rules ensure only 1–3 are free per context. The goal is not "3 aspects" but "minimal free variables per situation."

### The Aspects

1. **HTML Element** — which tag (`<button>`, `<input>`, `<section>`, `<dialog>`, etc.). Determines behavior and accessibility.
2. **Skin** — the composable visual modification (`data-skin="emphasis"`). Overrides default appearance. Multiple skins compose via space-separation.
3. **Placement** — whether the element is a direct card child (full width) or inside a row wrapper (shared width). The primary free variable per element.
4. **Content** — text, icon, image. Irreducible — always unique.
5. **Context** — inherited from parent. Gap, alignment, density, tone inheritance. Zero decisions.

### Coupling Rules

- For interactive elements: state styling is always derived — hover always darkens, focus always shows ring, disabled always reduces opacity. Zero decisions.
- For color: everything is derived from 5 token inputs. Zero decisions.
- For sizing: content elements fill card width (direct children) or fill their row cell (inside row wrapper).
- For layout: cards are single-column stacks. Multi-element rows are handled by row wrappers (section, header, footer, nav, summary). Leaf elements never create internal grids.

---

## 6. Key Architecture Decisions

### F4 Architecture (1-col section + row wrappers)

Chosen in session 3 after systematic comparison of 5 alternatives (F1–F8) across 8 LLMs, 5 evaluation criteria, and 13 test patterns. Key factors:

- Cards are self-contained (layout internal, not dependent on parent)
- Single-column content (60% of rows) requires zero attributes
- Multi-element rows are explicit (row wrappers, not implicit span accumulation)
- LLMs struggle with spatial state tracking needed by span-based alternatives
- Easier to migrate away from (row wrappers encode explicit grouping information that can be mechanically converted)

### 12-Column Grid

Chosen after testing 6/8/10/12-column variants on a ~470px mobile viewport:

- **6-col:** Icon buttons too large. Wastes space.
- **8-col:** Buttons slightly oversized. Input-to-button ratio awkward.
- **10-col:** Best visual proportions for search-bar pattern.
- **12-col:** Near-identical to 10-col visually, but maximally divisible (2, 3, 4, 6) — covers every common split ratio without multiple grid definitions.

Decision: 12-column grid on all row wrappers, handled entirely by CSS. `data-colcount` attribute removed — it was always 12.

### Skin System Evolution

- Column skins removed (session 3)
- `half` removed (redundant with colspan), `transparent` merged into `ghost`, `square`/`full`/`round`/`flat` removed (sessions 1–5)
- `elevated` and `freeform` added (session 5)
- Current count: 5 skins (emphasis, ghost, mute, elevated, freeform). System evolves through both addition and removal.

---

## 7. Cross-Domain Modularity Research

> Full treatment in `blueprint_theoretical_research.md`. This section summarizes the key takeaways that shaped blueprint decisions.

**Three theoretical pillars:**

- **Simon (1962):** Systems with stable intermediate forms assemble exponentially faster. The card (article) is our stable intermediate form.
- **Baldwin & Clark (2000):** Modularity creates real options — replaceable parts increase system value. Row wrappers are modular layout options.
- **Clune et al. (2013):** Modularity emerges from minimizing connection costs, not top-down design. Draw boundaries where communication density is naturally lowest.

**Key analogies applied:** LEGO (unit grid = governance), Toyota TNGA (standardize what doesn't differentiate), IKEA (constraint is the product), ISO containers (standardize the interface, not the contents), ARIA grid model (explicit rows align with F4).

**Cautionary lessons:** Boeing 787 (don't modularize immature tech → escape hatch), Project Ara (digital modularity tax is negligible/positive), Cadillac Cimarron (apps must still look distinct), Carnegie Unit (modular architectures ossify → system must be evolvable).

---

## 8. Decisions Log

### Locked

| #   | Decision                                                                                                | Status         |
| --- | ------------------------------------------------------------------------------------------------------- | -------------- |
| 3   | Color: hue+chroma inputs, light-dark(), oklch derivation                                                | ✅ Locked      |
| 6   | Zero custom CSS — Claude never writes CSS                                                               | ✅ Locked      |
| 7   | Escape hatch container for freeform content                                                             | ✅ Locked      |
| 8   | States fully automated via derivation                                                                   | ✅ Locked      |
| 15  | CLAUDE.md 200 lines, catalog in skill (out of scope for stage 1)                                        | ✅ Locked      |
| 16  | Validator script (out of scope for stage 1)                                                             | ✅ Locked      |
| 18  | Overlays via popover attribute on semantic elements                                                     | ✅ Locked      |
| 20  | CSS oklch color, light-dark() for dark mode                                                             | ✅ Locked      |
| 23  | Reference app built toward end of stage 1                                                               | ✅ Locked      |
| 24  | Native HTML only — no custom elements, no Shadow DOM                                                    | ✅ Locked      |
| 25  | Flat global stylesheet with @layer (reset, default, skin, grid)                                         | ✅ Updated S4  |
| 26  | Composable skins via data-skin                                                                          | ✅ Locked      |
| 27  | Zero CSS classes — element selectors + attribute selectors only                                         | ✅ Locked      |
| 28  | No div — article is card, section is row wrapper                                                        | ✅ Updated S5  |
| 29  | Popover hosts: aside (tooltip), output (toast), nav (dropdown)                                          | ✅ Updated S5  |
| 30  | ~21 base tags, h1–h4 only. Cut: fieldset, img, table, lists, hr.                                       | ✅ Updated S5  |
| 31  | Scale: --0, --xs, --s, --m, --l. --m is base font-size + spacing                                       | ✅ Locked      |
| 32  | Visual depth: cards --neutral-mute, row wrappers transparent, controls --neutral                        | ✅ Updated S5  |
| 33  | Open Props — not used. Own token system.                                                                | ✅ Locked      |
| 34  | text-on-accent: fixed near-white                                                                        | ✅ Locked      |
| 35  | --m double duty (font-size + spacing): keep as-is                                                       | ✅ Locked      |
| 36  | Scale stops at --l, no --xl needed                                                                      | ✅ Locked      |
| 37  | Emphasis skin on inputs: keep accent bg                                                                 | ✅ Locked S3   |
| 39  | Skins follow defaults for undefined states; skins can explicitly override                               | ✅ Reframed S3 |
| 43  | Max depth 3 for structure, depth 4 allowed for row wrapper children                                     | ✅ Updated S5  |
| 44  | No article inside article (no nested cards)                                                             | ✅ Updated S5  |
| 45  | p is for text only, not layout wrapping                                                                 | ✅ Locked      |
| 49  | Skill file framing: engineered constraint, not prototype simplicity                                     | ✅ Locked      |
| 51  | Grid architecture: F4 (1-col section + optional article row wrappers)                                   | ✅ Locked S3   |
| 52  | Row wrapper tags: section, header, footer, nav, summary                                                 | ✅ Updated S5  |
| 53  | Row mechanism: 12-col grid via CSS on row wrappers + `data-colspan` on children. `data-colcount` removed. | ✅ Updated S5 |
| 55  | 5 skins: emphasis, ghost, mute, elevated, freeform. Earlier skins (half, transparent, square, full, round, flat) removed during S1–S5 iteration. | ✅ Updated S5 |
| 57  | Add strategic goals (portability, context windowing, cloning) to blueprint                              | ✅ Locked S3   |
| 58  | form = display:contents, always transparent, never a visual container                                   | ✅ Locked S5   |
| 59  | details = card-level collapsible container, summary = row wrapper                                       | ✅ Locked S5   |
| 60  | dialog interior follows same rules as any card                                                          | ✅ Locked S5   |
| 61  | Body: max-inline-size 800px, margin-inline auto                                                         | ✅ Locked S5   |
| 62  | Ghost skin merges old ghost + transparent. Hover on interactive only.                                   | ✅ Locked S5   |
| 63  | Skin conflict groups: emphasis\|ghost (mutually exclusive)                                              | ✅ Locked S5   |
| 64  | Escape hatch via data-skin="freeform" on cards                                                          | ✅ Locked S5   |
| 65  | Dropdown menu popover: nav[popover] (was section[popover])                                              | ✅ Locked S5   |
| 66  | Cut elements: fieldset, img, table family, ul/ol/li, hr                                                 | ✅ Locked S5   |
| 67  | Inline formatting (strong, em, code) implicit, not spec-listed                                          | ✅ Locked S5   |

### Open

| #   | Decision                                                                    | Depends on |
| --- | --------------------------------------------------------------------------- | ---------- |
| 54  | Partial-width single elements (sizing skins vs row wrapper with empty cols) | Prototype  |

### All Deferred / Open Items (consolidated)

Items scattered across spec, rationale, and notebook — collected here for visibility.

| Item | Status | Source |
| --- | --- | --- |
| `data-state` signal states (`error`, `warning`, `info`, `success`, `loading`, `skeleton`, `empty`) | Not yet implemented | Spec §3, §6 |
| Signal hues (danger, warning, success, info) — color tokens for signal states | Not yet implemented | Spec §4 |
| Partial-width single elements — sizing skins vs row wrapper with empty cols | Open decision (#54) | Rationale §8 |
| CLAUDE.md (<200 lines) + component catalog skill file | Out of scope for stage 1 | Decision #15 |
| Validator script (HTML parser to flag unauthorized elements/styles/skins) | Out of scope for stage 1 | Decision #16 |
| Reference app | Planned for end of stage 1 | Decision #23 |
| Canonical CSS file (implementing the spec's CSS architecture) | Not yet created | Spec §7 |
| Experiment-to-session mapping incomplete (experiments 1 and 4 unreferenced in notebook) | Documentation gap | Notebook, Experiments/ |

---

## 9. Risks & Failure Modes

### Risk 1: LLMs improve enough to make this redundant

**Likelihood: Medium-high over 12–18 months. Low over 6 months.**

LLM visual consistency is improving. It's plausible that within 1–2 years, an LLM with a well-written CLAUDE.md and a standard design system produces consistent-enough output without a bespoke constrained system.

**Mitigations:**

- The blueprint is valuable for human developers regardless of LLM capability.
- The constraint philosophy can be applied on top of whatever tools LLMs use in the future.
- Building it teaches transferable knowledge about component architecture, CSS systems, and LLM-assisted workflows.
- If LLMs do get good enough, the blueprint becomes lighter (just a CLAUDE.md + token file) rather than worthless.

**Honest assessment:** This is a real risk. If the only motivation were LLM consistency, the project might not justify the investment. The "also valuable for humans" argument must be genuinely true, not just a hedge.

### Risk 2: Over-engineering the blueprint itself

The system meant to save time becomes a months-long project.

**Mitigations:**

- Start with ~21 elements and one reference app. Extract patterns from working code.
- Time-box stage 1. If the core system isn't working within 2–3 focused sessions, re-evaluate.
- The token system and skin layer are already implemented and tested. Remaining work is row wrapper mechanism, signal states, and real-layout validation.

### Risk 3: Convention drift in long Claude Code sessions

Claude Code can forget or subtly deviate from conventions mid-session, especially once context fills up.

**Mitigations:**

- Validator script (planned for post-stage-1) that parses generated HTML and flags unauthorized elements, style attributes, CSS changes, and data-skin values not in the allowed set.
- The technology itself provides enforcement: attribute selectors only match defined values; undefined data-skin values produce no styling.
- CLAUDE.md under 200 lines with hard rules only. Detailed catalog in a skill file.
- Claude Code hooks can physically block disallowed operations.

### Risk 4: Too rigid for real-world edge cases

If the blueprint doesn't have a pattern for something, Claude either invents something inconsistent or gets stuck.

**Mitigations:**

- Escape hatch: `data-skin="freeform"` on any card + internal freeform CSS.
- Explicit rule: if something doesn't fit, Claude stops and proposes a new skin.
- Adding a new skin value is a small, deliberate change.

### Risk 5: The skin system becomes its own complexity

**Mitigations:**

- Current count: 5 skins. System evolves through both addition and removal.
- Composability reduces the need for new skins.
- Regular review: if a new skin is proposed, challenge whether it can be achieved by composing existing skins.

### Risk 6: CSS oklch / light-dark() browser support

Both well-supported as of March 2026. `oklch(from ...)` relative color syntax has narrower support.

**Mitigations:**

- Test with extreme themes early.
- No CSS relative color syntax in production — all tokens use direct oklch values.

### Risk 7: The grid model breaks for some layouts

Not all UI patterns fit strict grid flow. Dense data tables, freeform canvases, chat interfaces, code editors.

**Mitigations:**

- These live inside the escape hatch container.
- Card stack + row wrappers govern ~80% of typical app UI. Internal widget layout is a separate, smaller concern.

### Risk 8: LLM Cannot Think in Flat Grids (HIGH PRIORITY)

**Likelihood: High. This is the single biggest risk in the project.**

Claude's training data is overwhelmingly nested DOM. The concept of building applications with single-column section stacks and row-wrapper-based horizontal layout barely exists in the training corpus.

**Failure modes:**

- **Silent regression:** follows rules for 3 sessions, reverts to nesting under complex prompt pressure.
- **Hostile compliance:** avoids article-in-article but invents worse workarounds.
- **Prompt misinterpretation:** "put these side by side" only maps to nested containers in Claude's model.
- **Self-correction loops:** generates flat HTML, "reviews" it, decides it looks wrong, refactors into nested structure.
- **"Improvement" instinct:** if system reads as prototype/MVP, Claude suggests "graduating" to a real framework.

**Mitigations:**

- Skill file framed as engineered end-state, not prototype.
- 10–15 before/after examples per layout type in the skill.
- Align with Google web.dev performance guidance (flat DOM, minimal depth).
- The system itself provides enforcement: undefined skins produce no styling, nesting produces no visual benefit.
- Row wrappers (F4) are more LLM-compatible than span accumulation (F3), because explicit boundaries convert spatial state tracking into pattern matching.

---

## 10. Modularity Philosophy — Applied to the Blueprint

> General modularity theory (Simon, Baldwin & Clark, biological modularity, failure cases) is in `blueprint_theoretical_research.md`. This section covers only how those principles manifest in the blueprint.

### Core Principles

- **Standardize what doesn't differentiate** (Toyota TNGA principle): grid structure, spacing, color derivation, state styling.
- **Differentiate where it matters:** content, placement, skin choice, card composition.
- **Digital modularity tax is negligible or positive:** unlike physical systems (Project Ara's 25% bulk penalty), CSS gaps and padding are good UX — readability and touch targets.

### The Card as Primary Unit of Modularity

The Card (article) is a self-contained container that acts as a middle-ground between atomic components and full pages.

- **Grid Consistency:** Cards occupy a set number of grid cells, allowing them to be moved, swapped, or reused without breaking layout logic.
- **Encapsulation:** A Card can be debugged, improved, or swapped as an independent entity. Internal layout is self-contained — never dependent on parent context.
- **Decoupled Styles:** A Card never relies on the parent's context for its internal layout. It "works itself out" based on the system rules.

### LLM Optimization: Context Windowing

Treating Cards as discrete files is a high-leverage strategy for AI-assisted development:

- **Minimal Context Injection:** When an LLM only needs to "see" a single Card file to understand conventions (spacing, naming, data-binding), you avoid "context drift" where the AI suggests code conflicting with the rest of the page.
- **Bug Localization:** If a bug is reported within a specific Card, providing only that Card's source code to an LLM reduces noise and prevents unnecessary changes to global styles.
- **Template Cloning:** Standardizing the Card structure enables "Zero-Shot" creation. An LLM can generate a new Card by referencing the structure of an existing one.

### Operational Rules (Standardization Protocol)

| Feature          | Protocol                                                                              |
| :--------------- | :------------------------------------------------------------------------------------ |
| **Directory**    | Every Card resides in its own file or folder.                                         |
| **Independence** | Each folder/file contains its own logic, tests, and mock data.                        |
| **Cloning**      | New Cards are created by duplicating an existing Card folder/files or specific cells.  |

### Potential Failure Modes

- **Over-Abstraction:** If a Card exceeds a line threshold, it should be split into smaller sub-sections to maintain the "minimal context" benefit for LLMs. Initially try to limit by reusing components.
- **Rigidity:** Strict modularity can lead to "boxed" designs. Use `data-skin="freeform"` Cards for content that needs to break the grid while maintaining the modular folder structure.

---

## 11. Future Explorations

### Coordinates-as-Language

Users or Claude describe UIs like chess notation: "Button-primary at C3, spanning to E3." Useful as internal intermediate representation.

### Named Row Patterns (R2+)

Row wrappers with semantic names (`data-row="button-pair"`, `data-row="label-input"`) instead of numbers/ratios. Better linguistic parity but closed vocabulary that requires system extension for new arrangements. Could combine with numeric fallback (hybrid model). Session 3 analysis showed this scores well on linguistics but lower on adaptivity.
