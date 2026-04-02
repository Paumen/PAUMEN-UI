# Library / Framework Evaluation for PAUMEN-UI

> **Purpose:** Evaluate which external dependencies advance or undermine the blueprint's goals. Constraints are means, not ends — a library that "violates" a constraint but better serves the goal that constraint was protecting is worth considering.

## The Five Goals (from blueprint_rationale.md §2)

| #   | Goal                       | What it means                                                                                                     |
| --- | -------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| G1  | **Decision Compression**   | Kill the 300 micro-decisions. Claude shouldn't be choosing layout approaches, color values, or component APIs.    |
| G2  | **Linguistic Parity**      | LLM ↔ user communication with minimal noise. Describe a UI in plain language → one unambiguous implementation.    |
| G3  | **Structural Determinism** | Given a description, there is one correct DOM structure. Stop DOM bloat/hallucinations.                           |
| G4  | **Contextual Gravity**     | Card = file = context boundary. A card can be debugged, cloned, moved between apps independently.                 |
| G5  | **Adaptivity**             | Apps must still look distinct. Change one hue → whole new theme. Constrain _how_ you build, not _what_ you build. |

### How current constraints serve the goals

| Constraint               | Serves | Reasoning                                                                                                                                      |
| ------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| No CSS classes (C1)      | G1, G3 | Classes are open-ended naming decisions. Eliminating them removes a decision category.                                                         |
| No Shadow DOM (C2)       | G4, G1 | Shadow DOM fragments the style context — cards become harder to retheme globally. But it provides real encapsulation (see Lit analysis below). |
| No div/span (C3)         | G3, G2 | Semantic tags create structural determinism. "Add a card" → `<details>`, not "add a div with class card."                                      |
| Zero custom CSS (C4)     | G1     | Eliminates the largest decision category entirely.                                                                                             |
| Flat DOM ≤ 4 (C8)        | G3, G4 | Prevents nesting drift. But if a component model enforces depth structurally, the constraint becomes redundant.                                |
| Zero build step (C7)     | G4     | Card = file works best when files are directly executable. Build steps add indirection.                                                        |
| Minimal API surface (C6) | G1, G2 | Fewer options = fewer decisions = less LLM drift.                                                                                              |

---

## Evaluation by Goal Impact

### Alpine.js

| Goal                      | Impact              | Analysis                                                                                                                                                                 |
| ------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| G1 Decision Compression   | **Strong positive** | Alpine has ~15 directives (vs. React's ~50+ hooks/APIs). All attribute-based — same mental model as `data-skin`. Claude learns one pattern: "behavior = HTML attribute." |
| G2 Linguistic Parity      | **Positive**        | "Show this section when the checkbox is checked" → `x-show="checked"`. Declarative, reads like the requirement.                                                          |
| G3 Structural Determinism | **Neutral**         | Alpine doesn't dictate DOM structure. Doesn't help or hurt. The blueprint's HTML rules still govern structure.                                                           |
| G4 Contextual Gravity     | **Positive**        | `x-data` scopes state to a DOM subtree. A card with `x-data` is self-contained — its state doesn't leak. This aligns with card-as-module.                                |
| G5 Adaptivity             | **Neutral**         | Behavioral layer — doesn't affect theming or visual differentiation.                                                                                                     |

**Net assessment:** Adds client-side reactivity without expanding the decision space. The attribute-driven model is naturally consistent with PAUMEN. No constraints need relaxing.

**Risk:** `<template x-for>` is the one sharp edge — it generates DOM dynamically, so Claude must understand the resulting depth. Manageable with skill file examples.

### Petite-Vue

Same goal profile as Alpine with Vue syntax (`v-` prefix). ~6KB vs Alpine's V3 ~14KB minified gzip. Smaller ecosystem and community. Choose based on team familiarity, not architectural difference.

### HTMX

| Goal | Impact              | Analysis                                                                                                                                 |
| ---- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| G1   | **Strong positive** | Server communication via attributes (`hx-get`, `hx-swap`). Claude never writes fetch/XHR boilerplate or manages loading states manually. |
| G2   | **Strong positive** | "When clicked, load tasks from /api/tasks into this section" → `hx-get="/api/tasks" hx-target="#task-list"`. Reads like the requirement. |
| G3   | **Positive**        | Server returns HTML fragments that slot into existing structure. Less client-side DOM manipulation = less structural drift.              |
| G4   | **Neutral**         | Works within existing card structure.                                                                                                    |
| G5   | **Neutral**         | No visual impact.                                                                                                                        |

**Condition:** Only relevant when an app has a server. Target apps are "mostly client-side" but not exclusively. HTMX + Alpine compose well (different concerns, no overlap).

### React / Preact

| Goal | Impact                  | Analysis                                                                                                                                                                                                                                                                                                                                                                       |
| ---- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| G1   | **Mixed**               | Components CAN compress decisions (a `<Card>` component enforces internal structure automatically). But React's API surface is enormous — useState, useEffect, useRef, useMemo, useCallback, useContext, custom hooks, portals, suspense, error boundaries. Each is a new decision category Claude must navigate. Net effect: trades CSS decisions for architecture decisions. |
| G2   | **Negative**            | "Add a settings card" in PAUMEN → write a `<details>` with known children. In React → should it be a function component or class? Should state be local or lifted? Use context or prop drilling? useEffect or useSyncExternalStore? The translation from requirement to code is ambiguous.                                                                                     |
| G3   | **Could be positive**   | TypeScript + React COULD enforce structural determinism via typed props: a Card component that only accepts Section or Input children. This is stronger enforcement than CSS selectors. **However**, this requires a build step, a type system, and a component library — significant infrastructure for the target app class.                                                 |
| G4   | **Mixed**               | Component files ARE modular units — but JSX mixes markup, style, and logic in ways that make "read one card to learn conventions" harder. Also, React's virtual DOM means the real DOM is an opaque artifact, not something Claude or the user inspects directly.                                                                                                              |
| G5   | **Neutral to negative** | Theming via CSS custom properties still works, but React's component boundaries can make global token changes harder to reason about.                                                                                                                                                                                                                                          |

**The honest case for React:** If PAUMEN ever targets multi-page apps with complex state, React's component model provides structural enforcement that raw HTML can't match. A well-designed React component library could make G3 (structural determinism) even stronger than the current approach.

**The honest case against:** For the target app class (single/few-page tools), React's infrastructure cost (build step, JSX transform, dev server, bundling) outweighs the structural benefit. The complexity it adds to G1 and G2 is real and immediate. The structural benefit to G3 is theoretical until someone builds the component library.

**Verdict:** Not rejected on constraint grounds — rejected because it trades the wrong things. It solves G3 at the expense of G1, G2, and G7 (build simplicity), and the target app class doesn't need that trade.

### Preact specifically

8KB, same API as React, CDN-loadable via HTM (tagged template literals — no JSX, no build). This addresses the build step concern. Still carries the G1/G2 costs of React's API surface. Worth revisiting if PAUMEN expands to more complex apps.

### Svelte

| Goal | Impact       | Analysis                                                                                                                                       |
| ---- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| G1   | **Positive** | Svelte's API is much smaller than React's. Reactivity is implicit (assign a variable, UI updates). Fewer decisions per component.              |
| G2   | **Positive** | `.svelte` files read close to plain HTML with sprinkled logic. Less translation noise than React.                                              |
| G3   | **Positive** | Like React, component boundaries can enforce structure. Unlike React, less boilerplate obscuring the structural intent.                        |
| G4   | **Negative** | Requires a compiler. Output is vanilla JS/DOM, but source files aren't directly executable. Card = file breaks because files need compilation. |
| G5   | **Neutral**  | CSS custom properties work fine with Svelte.                                                                                                   |

**Verdict:** Svelte's design philosophy (constraint, minimalism, compile away the framework) is the closest of any JS framework to PAUMEN's spirit. The compiler requirement (G4 violation) is the real blocker — it breaks the "card = file = directly inspectable" property. If PAUMEN ever adopts a build step for other reasons, Svelte becomes the strongest framework candidate.

### Lit / Web Components

| Goal | Impact              | Analysis                                                                                                                                                                                                                                                                                                                                                                      |
| ---- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G1   | **Positive**        | Custom elements with a fixed attribute API. `<paumen-card skin="filled">` — Claude picks from a closed set.                                                                                                                                                                                                                                                                   |
| G2   | **Strong positive** | Custom element names ARE the linguistic interface. "Add a card" → `<paumen-card>`. The HTML IS the specification language.                                                                                                                                                                                                                                                    |
| G3   | **Strong positive** | Shadow DOM provides true structural encapsulation. A card's internal DOM literally cannot be manipulated from outside. Strongest G3 enforcement of any option.                                                                                                                                                                                                                |
| G4   | **Mixed**           | Shadow DOM means global CSS tokens don't penetrate by default. Workarounds exist (CSS custom properties DO cross shadow boundaries, `::part()` for selective exposure), but they add complexity. The 5-token color system still works — custom properties inherit into Shadow DOM. But new selectors like `[data-skin]` would need to be inside each component's shadow root. |
| G5   | **Positive**        | CSS custom properties cross shadow boundaries, so `--accent-hue: 340` still rethemes everything. The theming model survives.                                                                                                                                                                                                                                                  |

**The honest case for Lit:** Shadow DOM is the only technology that provides REAL structural determinism (G3). Everything else is convention-based — Claude could still put an `<input>` at depth 6 and nothing prevents it. With Shadow DOM, the component literally controls its own DOM. You can't violate the depth constraint because the component won't render children in the wrong place.

**The honest case against:** It creates a style boundary that fights the flat global stylesheet model. The `paumen.css` four-layer architecture (reset → default → skin → grid) works because all selectors operate in one global scope. Shadow DOM fragments this. Each component would need its own copy of relevant styles, or use `::part()` to selectively expose elements. This is solvable but adds real complexity — and complexity in the style system is exactly what PAUMEN exists to eliminate.

**Verdict:** Not rejected on principle. Rejected because the style fragmentation cost (G1 regression) outweighs the structural enforcement benefit (G3 gain) at the current project stage. **Worth revisiting** if convention-based enforcement proves insufficient (Risk 8 in the rationale: "LLM Cannot Think in Flat Grids").

### Tailwind CSS

| Goal | Impact              | Analysis                                                                                                                                                                                               |
| ---- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| G1   | **Strong negative** | Tailwind's value proposition is "every CSS property available as a class." This is the exact opposite of decision compression — it gives Claude 300+ utility classes to choose from for every element. |
| G2   | **Negative**        | `class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"` — this IS the 300 micro-decisions, just spelled differently.                                           |
| G3   | **Neutral**         | Tailwind doesn't affect DOM structure.                                                                                                                                                                 |
| G4   | **Neutral**         | No structural impact.                                                                                                                                                                                  |
| G5   | **Positive**        | Tailwind's design tokens and config system do support theming well.                                                                                                                                    |

**Verdict:** Tailwind solves "how do I make consistent micro-decisions?" PAUMEN solves "how do I eliminate micro-decisions?" Fundamentally different philosophies. The constraint (no classes) and the goal (decision compression) are fully aligned here — this isn't a constraint that could be relaxed for value.

### Open Props

Already evaluated and rejected in the rationale: "Our token system is much simpler (5 inputs vs thousands of lines)." The goal analysis confirms — Open Props expands the token vocabulary (G1 negative) without adding structural value.

### Pico CSS / Water.css

Classless CSS that styles native elements. Same approach as PAUMEN's default layer. Adopting one means either: (a) putting it below paumen.css (competing styles, debugging confusion), or (b) replacing paumen.css's default layer (losing the skin/grid system). PAUMEN already IS this layer. No goal served by adding a redundant one.

---

## Libraries Outside the Framework Debate

These don't interact with the constraint system — they operate on data, not DOM/CSS.

| Library            | Goal Impact                                                                                          | Verdict                                          |
| ------------------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| **day.js** (~2KB)  | Neutral on all goals. Pure data utility.                                                             | Use when needed. CDN-friendly.                   |
| **Chart.js / D3**  | Operate inside `data-skin="freeform"` cards. Don't touch PAUMEN DOM.                                 | Use inside escape hatch.                         |
| **Vite**           | Enables multi-file apps (G4 benefit for larger projects). Adds build step (G4 cost for simple apps). | Graduate to when single-file outgrown.           |
| **Phosphor Icons** | Already adopted. Dual-weight system enables stroke→fill swap.                                        | Stay. Switching means rewriting icon animations. |

---

## Goal-Based Summary

| Library       | G1 Decisions | G2 Linguistics | G3 Structure | G4 Modularity | G5 Adaptivity | Net                                     |
| ------------- | :----------: | :------------: | :----------: | :-----------: | :-----------: | --------------------------------------- |
| **Alpine.js** |      ++      |       +        |      ·       |       +       |       ·       | **Adopt**                               |
| **HTMX**      |      ++      |       ++       |      +       |       ·       |       ·       | **Adopt when server-backed**            |
| Petite-Vue    |      ++      |       +        |      ·       |       +       |       ·       | Alternative to Alpine                   |
| Preact+HTM    |      −       |       −        |      +       |       ·       |       ·       | Revisit for complex apps                |
| Svelte        |      +       |       +        |      +       |      −−       |       ·       | Revisit if build step adopted           |
| Lit           |      +       |       ++       |     +++      |       −       |       +       | Revisit if convention enforcement fails |
| React         |      −−      |       −−       |      +       |       −       |       ·       | Wrong trade for target apps             |
| Tailwind      |     −−−      |       −−       |      ·       |       ·       |       +       | Opposite philosophy                     |
| Open Props    |      −−      |       ·        |      ·       |       ·       |       +       | Redundant token layer                   |

### Where constraints could flex

1. **No Shadow DOM (C2):** If Risk 8 materializes (LLMs can't maintain flat DOM conventions), Lit's structural enforcement becomes worth the style fragmentation cost. The constraint protects G1 (simple global styles) but Shadow DOM serves G3 (structural determinism) better than any alternative. **Monitor, don't foreclose.**

2. **Zero build step (C7):** If apps routinely grow beyond single files, a build step becomes net-positive for G4 (modularity). At that point, Svelte becomes the most PAUMEN-aligned framework. **Trigger: when 3+ apps need multi-file structure.**

3. **No CSS classes (C1):** This constraint is fully aligned with G1 (decision compression). No library makes a case for relaxing it. Tailwind's entire model is "more class choices" — the opposite of what's needed. **Hold firm.**

4. **No div/span (C3):** This constraint is fully aligned with G2 and G3. Semantic elements create unambiguous language. No library makes a case for relaxing it. **Hold firm.**

## Recommended Stack

**Default (most apps):**

```html
<link rel="stylesheet" href="paumen.css" />
<script src="https://unpkg.com/@phosphor-icons/web@2.1.1"></script>
<script
  defer
  src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js"
></script>
```

**Server-backed apps:** add HTMX.

**Complex apps (future):** if convention enforcement fails → evaluate Lit. If build step adopted for other reasons → evaluate Svelte.
