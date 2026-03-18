# LLM Web App Blueprint — Project Brief

## 0. Problem Statement

LLMs are increasingly used to generate web application code, but they produce inconsistent, bloated, and unpredictable UI output. The root cause is that the decision space for any given UI element is enormous — approximately 134 independently variable properties covering appearance, behavior, layout, states, spacing, typography, and more. When an LLM is asked to "add a settings page," it must make hundreds of micro-decisions: what padding on this card, what shade of blue for that button, what border radius, what hover effect, what font size for secondary text. Each decision is individually reasonable, but collectively they drift across sessions, across pages, and across projects.

Current design systems and CSS frameworks are designed for human developers who can exercise judgment and maintain visual consistency through taste and experience. They offer flexibility as a feature — dozens of utility classes, configurable component APIs, multiple layout options. For LLM-assisted development, this flexibility is the problem. Every option is a potential inconsistency. Every configurable property is a hallucination opportunity.

The result in practice: by session five, an LLM-built prototype feels subtly wrong. By session ten, it looks like three different products built by three different teams. Fixing this requires either constant human oversight (defeating the purpose of LLM-assisted development) or throwing away and regenerating large sections of UI.

This project attempts to solve this by inverting the usual design system philosophy: instead of maximizing flexibility, maximize constraint. Create a system where the vast majority of those 134 properties are deterministic consequences of 2–3 choices per element, leaving the LLM with almost nothing to decide and almost nothing to get wrong.

### Why This Matters Beyond LLMs

Even if LLMs improve dramatically, a highly constrained component system benefits human developers too: faster onboarding, fewer code review cycles, easier maintenance, guaranteed consistency across contributors. The system is valuable independent of who writes the code. The LLM use case simply makes the payoff more immediate and measurable.

## 1. Vision

Build a minimal, reusable blueprint (design system + conventions + tooling) for developing web apps with Claude Code. The system should be so constrained and predictable that Claude can implement features autonomously with near-zero UI or styling decisions.

### Core Principle

**Coupling reduces decisions.** Most design systems treat every visual aspect as an independent variable (color, spacing, radius, font, hover style…), leading to combinatorial explosion. This blueprint inverts that: make most aspects deterministic consequences of one or two choices. If you know the element is a button and it has the emphasis skin, you already know its color, hover behavior, focus ring, padding, border radius, cursor, and disabled state. Nothing left to decide.

### Goals

**Operational goals — the problem statement:**

- **Decision Compression:** Kill the 300 micro-decisions. Claude never writes custom CSS. All styling comes from the system. If something can't be built with existing elements + skins, Claude stops and proposes a new skin — it does not improvise.
- **Linguistic Parity:** No-noise communication LLM ↔ user. Reduce prompt complexity by constraining the decision space.
- **Structural Determinism:** Stop DOM bloat/hallucinations. Given a description, there is one correct DOM structure.

**Architectural goals — the IKEA principle (constraint enables, not limits):**

- **Contextual Gravity:** Article/Card is the primary unit of modularity. Each card is a self-contained file that can be debugged, cloned, and moved between apps. Card = file = context boundary for the LLM. Bug = open one file. Convention learning = read one card. New features by duplicating existing cards.
- **Adaptivity/Differentiation:** Allow user freedom of choice. Modern, responsive, customizable (change one hue to change the whole theme). The system constrains _how_ you build but not _what_ you build.

**Hard constraints:**

- Zero dependencies. Full control over source code. Single CSS file.
- Works across screen sizes without per-page custom styling.

### Target Apps

Single or few-page tools, mostly client-side, possibly with a small server. Variety of concepts: productivity tools, interactive games, dashboards, forms, converters. Mostly simple, or with 1–2 complex features surrounded by simple structure.

---

## 2. Research Findings (March 2026)

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
- **Decision:** **Not used.** Our token system is much simpler (5 inputs vs thousands of lines). Built from scratch.

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

### Cross-Domain Modularity Research (March 2026, Session 2)

Deep research into modularity across manufacturing, logistics, biology, and software. Key findings relevant to blueprint:

- **Herbert Simon (1962):** Hierarchical systems with stable intermediate forms assemble exponentially faster. Nearly-decomposable systems have strong intra-module and weak inter-module linkages. The card (article) is the stable intermediate form.
- **Baldwin & Clark (2000):** Modularity creates real options — ability to replace parts independently increases system value. Row wrappers are modular layout options.
- **LEGO system:** 1.6mm unit grid IS the governance. ±10 micron tolerance, 18 per million rejection rate. The constraint makes proposals obviously compatible or not. Blueprint's depth constraint + ~21 tags do the same.
- **Toyota TNGA:** 80% parts sharing by standardizing what doesn't differentiate. 20% cost reduction. Same logic: standardize grid structure, differentiate content.
- **Project Ara (Google):** 25% physical bulk penalty killed modular phones. In CSS, equivalent "penalty" (padding, gaps, whitespace) is actually good UX. Digital modularity tax can be negative.
- **Boeing 787:** Modularizing immature technology fails. Complex widgets need tight integration (escape hatch), not grid constraints.
- **Cadillac Cimarron:** Too much sharing kills identity. Standardize what doesn't differentiate, preserve what does. Apps built with the blueprint must still look like different products.
- **Carnegie Unit:** Modular architectures become institutional. The system must be evolvable without being thrown away.
- **Clune et al. (2013):** Modularity emerges from pressure to minimize connection costs, not from top-down design. Draw module boundaries where communication density is naturally lowest.
- **Classless CSS frameworks (Pico, Water.css, MVP.css):** Proof that flat semantic HTML with element-level styling works for real output. But positioned as prototyping tools — blueprint must explicitly NOT adopt that framing.
- **LLM blind spot:** Claude's training data is 99% nested DOM. Flat grid application architecture doesn't exist in its model. Biggest project risk. Skill file must frame system as engineered end-state with Google web.dev performance alignment, not as lightweight starting point.

### LLM Spatial Reasoning Limitations (March 2026, Session 3)

Research on LLM spatial capabilities revealed structural limitations relevant to grid architecture choice:

- LLMs struggle with combinatorial planning, layout perturbation, and spatiotemporal geometry.
- They commit logical and computational errors when connecting macro-scale environments to precise computational geometry.
- Unlike humans who build viewpoint-independent cognitive maps, LLMs rely on next-token prediction which fails when spatial state must be tracked over sequences.
- **Impact on grid choice:** Span accumulation (tracking which elements share a row by adding up column spans) is exactly the kind of spatial state tracking LLMs are architecturally weak at. Explicit row boundaries (F4 model) convert this into pattern matching, which LLMs excel at. This was a factor in choosing F4 over F3.

---

## 3. Aspect Decomposition

### The Problem

A UI element has ~134 independently specifiable properties (catalogued in full below). If each is a free variable, the combinatorial space is unmanageable. The blueprint must reduce this to a small number of actual decisions per element.

### 134 Properties — Full Catalog

#### Visual / Appearance (items 1–10)

Fill color, text color, border color, border width, border style, border radius, shadow/elevation, opacity, gradient, backdrop effect.

#### Typography (items 11–19)

Font family, font size, font weight, line height, letter spacing, text alignment, text decoration, text transform, text overflow behavior.

#### Spacing / Box Model (items 20–23)

Internal padding, external margin, gap between children, inline spacing (icon-to-label).

#### Sizing (items 24–27)

Width, height, aspect ratio, content-driven vs container-driven sizing.

#### Layout — Self (items 28–35)

Grid column position, grid row position, column span, row span, alignment within cell, justify within cell, overflow behavior, z-index.

#### Layout — Children (items 36–43)

Display mode, grid template, flex direction, flex wrap, child alignment, child distribution, child gap, content flow direction.

#### Interactive States (items 44–59)

Default, hover, focus, focus-visible, active, disabled, loading, dragging, selected/checked, expanded/collapsed, open/closed, error/invalid, valid/success, warning, read-only, placeholder.

#### Data States (items 60–65)

Empty, loading, loaded, error, partial, skeleton.

#### Semantic Identity (items 66–69)

HTML element, ARIA role, ARIA attributes, purpose/intent.

#### Interaction Behavior (items 70–78)

Clickable, focusable, keyboard shortcuts, drag/drop, resizable, dismissible, toggleable, submittable, copyable.

#### Data Behavior (items 86–90)

Value binding, validation rules, default value, input mask, autocomplete.

#### Relationship — Parent (items 91–94)

Depth in tree, stretch vs intrinsic, color inheritance, overflow/clip.

#### Relationship — Siblings (items 95–98)

Order, visual grouping, dividers, shared state.

#### Relationship — Children (items 99–102)

Expected child count, allowed child types, imposes layout, passes context down.

#### Responsiveness (items 103–107)

Narrow viewport, wide viewport, container-query breakpoints, density adaptation, orientation.

#### Theming (items 108–111)

Light mode, dark mode, high contrast, accent application.

#### Motion / Animation (items 113–117)

Enter animation, exit animation, layout shift, scroll-triggered, reduced-motion alternative.

#### Feedback (items 79–85)

Cursor type, transition on state change, transition duration, transition easing, ripple/click, haptic, sound.

#### Accessibility (items 118–123)

Keyboard operability, screen reader announcement, color contrast, touch target size, focus trap, live region.

#### Content (items 124–128)

Text/label, icon, image/media, badge/overlay, placeholder/hint text.

#### Context / Environment (items 129–134)

Inside form, inside modal, inside scrollable, primary action, repeated element, print appearance.

### Grouping by Decision Source

The 134 items collapse when you ask "who decides this?"

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
  - **V (Visual Recipe / Skin)** — the predetermined visual package. Determines appearance, dimensions, internal layout, state styling, transitions. This is the primary visual determination engine.
- **N (Accessibility)** — ARIA moved to Appearance group (it's about how users perceive the element). Keyboard/behavior stays with A.

Key insight: The HTML tag has limited determination power for appearance — it mainly determines behavior and accessibility. The real visual determination comes from the skin — whatever `data-skin` value carries "this is emphasized" or "this is a ghost button."

---

## 4. MECE Aspect Model

### Not Fixed to 3 Factors

The system has 4–5 identifiable aspects, but coupling rules ensure only 1–3 are free per context. The goal is not "3 aspects" but "minimal free variables per situation."

### The Aspects

1. **HTML Element** — which tag (`<button>`, `<input>`, `<section>`, `<dialog>`, etc.). Determines behavior and accessibility.
2. **Skin** — the composable visual modification (`data-skin="emphasis"`). Overrides default appearance. Multiple skins compose via space-separation.
3. **Placement** — whether the element is a direct card child (full width) or inside a row wrapper (shared width). The primary free variable per element.
4. **Content** — text, icon, image. Irreducible — always unique.
5. **Context** — inherited from parent. Gap, alignment, density, tone inheritance. Zero decisions.

### Category Maps to Display Type

The brief's three-tier model (container/component/content) maps directly to CSS native display:

| Category  | Display      | Role                                 | Elements                                                                           |
| --------- | ------------ | ------------------------------------ | ---------------------------------------------------------------------------------- |
| Card      | grid         | Holds and arranges children          | article, details, dialog, [popover]                                                |
| Wrapper   | grid (12-col)| Groups elements into horizontal rows | section, header, footer, nav, summary                                              |
| Transparent| contents    | Submission scope only                | form                                                                               |
| Component | inline-block | Self-contained interactive unit      | button, text inputs, textarea, select, range                                       |
| Content   | inline       | Leaf-level text/graphic              | h1–h4, p, small, label, a, svg, checkbox, radio, date/time, output, aside          |

This is not a data-attribute — it's inherent in the native display model. No need for `data-category`.

### Coupling Rules

- For interactive elements: state styling is always derived — hover always darkens, focus always shows ring, disabled always reduces opacity. Zero decisions.
- For color: everything is derived from 5 token inputs. Zero decisions.
- For sizing: content elements fill card width (direct children) or fill their row cell (inside row wrapper).
- For layout: cards are single-column stacks. Multi-element rows are handled by row wrappers (section, header, footer, nav, summary). Leaf elements never create internal grids.

### Analogies from Other Domains

- **ISO Shipping Containers:** One standardized interface (corner castings = grid cells) makes the entire logistics chain composable. The container handles "fit"; the content inside doesn't need to know about the grid.
- **French Mother Sauces:** 5 base sauces, hundreds of derivatives. The base handles technique; the derivative adds one ingredient. Skins are mother sauces — you should never need to create a new one.
- **Swiss Typographic Style:** Everything aligns to a baseline grid and column grid. Two choices per element: which cell and what hierarchy level. Everything else follows.
- **Nashville Number System:** Chords written as relationships (1, 4, 5) relative to a key, not absolute notes. Change the key, every chord shifts, relationships hold. Our color system works the same way.
- **Periodic Table:** Properties predicted by position (row = size, column = behavior). Element's category determines behavior class; its skin determines visual class. Full treatment is the intersection.
- **Lego Technic:** Specific connection interfaces (holes, pins, axles) rather than freeform attachment. Elements have specific connection types determined by their native display model.
- **IKEA flat-pack:** The constraint (standardized dimensions, Allen key assembly) is the product. Users pay the constraint cost because it enables: self-service, immediate results, predictable outcome, affordable price. The blueprint user isn't choosing between the blueprint and unlimited CSS — they're choosing between the blueprint and not shipping.

---

## 5. Implementation Surface

### HTML Elements — ~21 Tags

Native semantic HTML only. No custom elements. No div.

**Cards** (body children, depth 2 — display: grid, gap --s, single-column stack):

- `<article>` — standard card. The primary structural unit.
- `<details>` + `<summary>` — collapsible card with native toggle. Summary acts as built-in header row wrapper.
- `<dialog>` — modal overlay card with backdrop, focus trap, Escape-to-close. Interior follows same rules as any card.

**Transparent wrapper** (display: contents — no visual chrome, no depth):

- `<form>` — submission scope only. Wraps inputs inside any card type. Never a visual container.

**Row wrappers** (inside cards, depth 3 — display: grid, 12-column, gap --xs, no visual chrome):

- `<section>` — generic multi-element row. Only used when 2+ elements share a horizontal row. Single elements are direct card children.
- `<header>` — title row (typically h1–h4 + optional icon/action).
- `<footer>` — action row (typically buttons at card bottom).
- `<nav>` — navigation row (tabs, links). Also serves as dropdown popover host.
- `<summary>` — details header row (inside `<details>` only). Clickable toggle target.

**Interactive elements:**

- `<button>` — actions, toggles, triggers.
- `<input>` text cluster — text, number, search, password, email, url, tel. Same visual, different keyboards/validation.
- `<input type="range">` — slider. Native styling only.
- `<input type="date">` / `<input type="time">` — native pickers. Kept for native behavior despite cross-browser styling limits.
- `<input type="checkbox">` / `<input type="radio">` — binary/exclusive toggles.
- `<textarea>` — multi-line text.
- `<select>` — dropdown choice.

**Headings:**

- `<h1>` through `<h4>` — heading hierarchy. h5/h6 dropped (smaller than body text is awkward).

**Content/text:**

- `<p>` — paragraph text only. NOT used for layout wrapping.
- `<small>` — secondary/fine text.
- `<label>` — ties text to a control. Click focuses associated control.
- `<a>` — link / navigation.
- `<svg>` — icon / graphic. Inherits text color via `fill: currentColor`.
- `<output>` — computed result / toast host. Has native `aria-live="polite"`.
- `<aside>` — supplementary info / tooltip host.

**Implicit inline formatting** (not spec-listed, assumed allowed within text elements): `<strong>`, `<em>`, `<code>`, etc.

**Cut elements:** `<fieldset>` (depth/styling complexity), `<img>` (out of scope), `<table>` family (out of scope), `<ul>`/`<ol>`/`<li>` (depth conflicts), `<hr>` (marginal).

**Popover hosts (semantic element + popover attribute):**

- Tooltip → `<aside popover>` — supplementary info
- Toast/notification → `<output popover>` — announced result (native aria-live)
- Dropdown menu → `<nav popover>` — container with buttons/links

### DOM Structure

```
body                              depth 1  (grid, gap --l, max 800px centered)
 └ article                        depth 2  (card, 1-col stack, grid, gap --s)
    ├ header [row wrapper]        depth 3  (12-col grid, gap --xs)
    │  ├ h3                       depth 4  (row child, fills cell)
    │  └ svg                      depth 4  (row child, fills cell)
    ├ form                        ----     (display:contents, transparent)
    │  ├ input                    depth 3  (direct card child, full width)
    │  ├ section [row wrapper]    depth 3  (12-col grid, gap --xs)
    │  │  ├ button                depth 4  (row child, fills cell)
    │  │  └ button                depth 4  (row child, fills cell)
    │  └ textarea                 depth 3  (direct card child, full width)
    └ footer [row wrapper]        depth 3  (12-col grid, gap --xs)
       ├ button                   depth 4  (row child)
       └ button                   depth 4  (row child)
```

Max structural depth: 3 (body → article → content). Depth 4 allowed for row wrapper children and HTML-mandated nesting (svg inside button, small inside p). Form is `display: contents` — transparent to the depth model.

**Rules:**
- No article inside article (no nested cards).
- No form inside form (HTML forbids this).
- Cards are body-level only. Row wrappers are card-level only.
- Single elements are direct card children — never wrapped in a row wrapper.

### Data Attributes

**data-skin** — composable visual modifications. Space-separated. Applied to any element.

| Skin          | Effect                                                                                  |
| ------------- | --------------------------------------------------------------------------------------- |
| `emphasis`    | Accent background, light text, accent border. Hover darkens.                            |
| `ghost`       | Transparent bg + border. On interactive elements: hover shows mute bg. On others: static. |
| `aspect`      | aspect-ratio 1:1, equal padding. For icon buttons.                                      |
| `mute`        | text-mute color.                                                                        |
| `round`       | border-radius 999px (pill shape).                                                       |
| `flat`        | border-radius 0.                                                                        |
| `elevated`    | box-shadow for visual lift. `box-shadow: 0 var(--xs) var(--s) oklch(0% 0 0 / 0.12)`.   |
| `freeform`    | Escape hatch. Removes PAUMEN constraints from card interior. Freeform CSS inside.       |

Total: 9 skins. `half` removed (redundant with colspan). `transparent` merged into `ghost` (hover determined by element interactivity). `elevated` and `freeform` added.

**Skin conflict groups** (mutually exclusive within group):
1. **Visual:** emphasis | ghost (pick at most one)
2. **Radius:** round | flat (pick at most one)

Composable examples: `data-skin="emphasis round"` = accent pill button. `data-skin="ghost square"` = borderless icon button. `data-skin="elevated flat"` = sharp shadow card.

**data-colspan on row wrapper children** — how many of the 12 columns a child occupies. Row wrappers (section, header, footer, nav, summary) always use a 12-column grid — no attribute needed on the wrapper, CSS handles it. Children without `data-colspan` default to `span 1` via CSS grid auto-placement.

```html
<article>
  <section>
    <input type="text" placeholder="Search…" data-colspan="10" />
    <button>×</button>
    <!-- no data-colspan needed: auto-spans 1 -->
    <button data-skin="emphasis">⌕</button>
  </section>
</article>
```

Common colspan patterns:

| Split        | Colspan values | Use case                            |
| ------------ | -------------- | ----------------------------------- |
| 50 / 50      | 6 + 6          | Button pair, label + input          |
| 75 / 25      | 9 + 3          | Input + action                      |
| 83 / 8 / 8   | 10 + 1 + 1     | Search bar (input + 2 icon buttons) |
| 33 / 33 / 33 | 4 + 4 + 4      | Three equal columns                 |
| 67 / 33      | 8 + 4          | Content + sidebar element           |
| Full width   | 12             | Span-full child inside a row        |

**data-state** — signal/conditional states (not yet implemented)

- `error` / `warning` / `info` / `success` / `loading` / `skeleton` / `empty`

### Zero CSS Classes

The system uses no CSS classes. All styling is via element selectors, attribute selectors (`[data-skin~="emphasis"]`), and pseudo-classes. Claude cannot invent class names because the system doesn't use classes.

### CSS Pseudo-Classes

Used for state→appearance mapping. Claude never writes these; they're baked into the system stylesheet:
`:hover`, `:focus-visible`, `:active`, `:checked`, `:disabled`, `:open`

### JS Components

Handle interactive behavior: event handlers, dynamic state management, data fetching. The behavioral layer that sits on top of the HTML + CSS structure.

---

## 6. Color System

### Base Inputs (5 values)

```css
--accent-hue: 250; /* brand/action hue */
--accent-chroma: 0.14; /* brand saturation */
--surface-hue: 250; /* background hue (independent from accent) */
--jump: 0.07; /* lightness step for hover/active */
color-scheme: light dark; /* light/dark mode toggle */
```

### Derived Palette (implemented)

```css
/* Accent */
--accent: oklch(58% var(--accent-chroma) var(--accent-hue));
--accent-up: oklch(
  calc(58% + var(--jump)) var(--accent-chroma) var(--accent-hue)
);
--accent-dn: oklch(
  calc(58% - var(--jump)) var(--accent-chroma) var(--accent-hue)
);

/* Surface levels — via light-dark() for automatic dark mode */
--neutral: light-dark(
  oklch(96% 0.01 var(--surface-hue)),
  oklch(16% 0.01 var(--surface-hue))
);
--neutral-mute: light-dark(
  oklch(92% 0.01 var(--surface-hue)),
  oklch(20% 0.01 var(--surface-hue))
);
--neutral-edge: light-dark(
  oklch(85% 0.02 var(--surface-hue)),
  oklch(30% 0.02 var(--surface-hue))
);

/* Text — inverted neutrals */
--text: light-dark(
  oklch(20% 0.01 var(--surface-hue)),
  oklch(92% 0.01 var(--surface-hue))
);
--text-mute: light-dark(
  oklch(40% 0.01 var(--surface-hue)),
  oklch(72% 0.01 var(--surface-hue))
);

/* Text on accent — fixed near-white */
--text-on-accent: oklch(98% 0.01 var(--accent-hue));
```

### Visual Depth Model

Cards (article, details, dialog, [popover]) get `--neutral-mute` background. Row wrappers (section, header, footer, nav, summary) are transparent — they inherit the card background. Controls inside (button, input, textarea, select) get `--neutral` (body color). Creates body → card → control depth without extra tokens.

| Layer | Background | Elements |
|-------|-----------|----------|
| Body | `--neutral` | body |
| Card | `--neutral-mute` | article, details, dialog, [popover] |
| Row wrapper | transparent (inherits card) | section, header, footer, nav, summary |
| Control | `--neutral` | button, input, textarea, select |

### Signal Hues (not yet implemented)

Danger, warning, success, info will get hue values only. Saturation and lightness derived from the accent to maintain palette cohesion. Deferred to next stage.

### Scale

```css
--0: 0;
--xs: clamp(0.2rem, 0.4vw, 0.4rem);
--s: clamp(0.4rem, 1vw, 0.8rem);
--m: clamp(0.8rem, 2vw, 1.6rem); /* base font-size AND spacing unit */
--l: clamp(1.2rem, 4vw, 2.4rem);
```

Used for: spacing (gap, padding), font-size (--m base), border-radius (--xs subtle, --s visible), outline width/offset (--xs), checkbox/radio sizing (--m).

---

## 7. Layout Model

### Cards as Single-Column Stacks (F4 Architecture)

Cards (article, details, dialog) are always single-column grids. Every direct child of a card occupies a full-width row. This is the default — no attribute needed.

```css
article, details, dialog {
  display: grid;
  gap: var(--s);
}
```

Multi-element rows are handled by row wrappers (section, header, footer, nav, summary) that define a 12-column grid internally. Single elements are direct card children.

This architecture was chosen (session 3) after systematic comparison of 5 alternatives (F1–F8) across 8 LLMs, 5 evaluation criteria, and 13 test patterns. Key factors:

- Cards are self-contained (layout internal, not dependent on parent)
- Single-column content (60% of rows) requires zero attributes
- Multi-element rows are explicit (row wrappers, not implicit span accumulation)
- LLMs struggle with spatial state tracking needed by span-based alternatives
- Easier to migrate away from than alternatives (row wrappers encode explicit grouping information that can be mechanically converted)

### Row Wrappers (12-Column Grid)

Row wrappers (`<section>`, `<header>`, `<footer>`, `<nav>`, `<summary>`) wrap 2+ elements that share a horizontal row. No visual chrome — transparent background, no border. All row wrappers use a 12-column grid via CSS (no attribute needed). Children claim columns via `data-colspan="N"`. Children without `data-colspan` auto-span 1 column.

The 12-column grid was chosen after testing 6/8/10/12-column variants on a ~470px mobile viewport. Key findings:

- **6-col:** Icon buttons too large (1fr is wide, `aspect-ratio:1` makes them tall). Wastes space.
- **8-col:** Buttons still slightly oversized. Input-to-button ratio awkward.
- **10-col:** Best visual proportions for search-bar pattern. Buttons well-sized.
- **12-col:** Near-identical to 10-col visually, but maximally divisible (2, 3, 4, 6) — covers every common split ratio without needing multiple grid definitions.

Decision: **12-column grid on all row wrappers, handled entirely by CSS.** `data-colcount` attribute removed — it was always 12 and never varied. Claude only chooses colspan values, not grid granularity.

```html
<article>
  <h3>Settings</h3>
  <!-- direct card child, full width -->
  <section>
    <!-- row wrapper, 12-col grid (CSS) -->
    <button data-colspan="6">Cancel</button>
    <!-- half width -->
    <button data-colspan="6" data-skin="emphasis">Save</button>
  </section>
  <input type="text" placeholder="Name" />
  <!-- direct card child, full width -->
</article>
```

Single elements are always direct card children — never wrapped in a row wrapper.

### Body Grid

Body is a grid with `gap: var(--l)`, `max-inline-size: 800px`, `margin-inline: auto`. Children are cards (article, details).

### Two-Layer System

**Layer 1 — In-flow grid:** All normal page content. Cards stacked in body grid. Content stacked in card grid. Multi-element rows in row wrappers.

**Layer 2 — Out-of-flow overlays:** Implemented via `popover` attribute on semantic elements:

- `<aside popover>` — tooltip (supplementary info)
- `<output popover>` — toast/notification (announced result, native aria-live)
- `<nav popover>` — dropdown menu (container with buttons/links)
- `<dialog>` — modal (separate mechanism, backdrop + focus trap + Escape)

### Escape Hatch

`data-skin="freeform"` on any card removes PAUMEN constraints from its interior. Externally the card fits normally into the body stack; internally it's unconstrained — freeform CSS inside. Use for anything requiring non-row layout (game canvases, data visualizations, complex widgets, third-party embeds).

---

## 8. State Automation

### Principle

Claude never writes state styles. All states are derived from the element default + skin + color system via CSS. Skins follow defaults for states they don't define themselves. Skins can explicitly override specific states (hover, selected, etc.) where the default derivation doesn't fit.

### Interactive States (implemented via pseudo-classes)

- **Hover:** button darkens to --neutral-edge. Emphasis skin darkens to --accent-dn. Ghost shows --neutral-mute on interactive elements only (non-interactive ghost elements are static).
- **Active:** scale 0.98.
- **Focus-visible:** --xs solid --accent ring, --xs offset. Consistent across all interactive elements.
- **Disabled:** opacity 0.5, cursor not-allowed. All controls.
- **Checked/selected:** accent-color on checkbox/radio.

### Signal States (not yet implemented — via data-state attribute)

- **Error:** border and text shift to danger color
- **Warning:** border shifts to warning color
- **Success:** border/icon shifts to success color
- **Loading:** skeleton pulse animation, content hidden
- **Empty:** placeholder content shown

Depends on signal hues being added to the token system, later concern.

---

## 9. CSS Architecture

### Four Layers

```css
@layer reset, default, skin, grid;
```

### Reset (3 rules, minimal)

```css
*,
*::before,
*::after {
  box-sizing: border-box;
} /* breaks grid span sizing otherwise */
body,
h1,
h2,
h3,
h4,
p {
  margin: 0;
} /* inconsistent defaults break grid gap */
button,
input,
textarea,
select {
  font: inherit;
  color: inherit;
} /* only elements that don't inherit */
```

### Default Layer

- Body: grid, gap --l, max-inline-size 800px, margin-inline auto, system font, --m base size, --text color, --neutral bg.
- Cards: shared card rule (`article, details, dialog, [popover]`): --neutral-mute bg, border, radius --s, padding --s, display grid, gap --s.
- Row wrappers (`section, header, footer, nav, summary`): display grid, grid-template-columns repeat(12, 1fr), gap --xs, align-items center, no visual styling (transparent bg, no border).
- Form: display contents (transparent to layout).
- Dialog: larger padding --m, max-inline-size, backdrop.
- Headings h1–h4: card header style (border-bottom, padding-bottom --xs, scale-based sizes).
- Shared control base (`button, input, textarea, select`): border, radius --xs, --neutral bg, --text color, padding, transition.
- Focus ring: unified across all interactive elements.
- Disabled: unified across all controls.
- Button: cursor pointer, font-weight 600, --neutral-mute bg, inline-flex for icon+text, hover/active states.
- Select: custom dropdown arrow (SVG data URI), appearance:none.
- Range: stripped to native (transparent bg, no border/padding).
- Checkbox/radio: sized to --m, accent-color.
- Shape of buttons, tags, icons is always same radius, eg 999

### Skin Layer

Composable via `[data-skin~="value"]` selector (tilde matches space-separated values):

- **Visual:** emphasis, ghost, mute.
- **Elevation:** elevated.
- **Escape:** freeform.

Conflict groups: emphasis|ghost (visual), round|flat (radius).

### Grid Layer

Row wrapper colspan mechanism via `data-colspan` attribute:

```css
@layer grid {
  [data-colspan="2"] {
    grid-column: span 2;
  }
  [data-colspan="3"] {
    grid-column: span 3;
  }
  [data-colspan="4"] {
    grid-column: span 4;
  }
  [data-colspan="6"] {
    grid-column: span 6;
  }
  [data-colspan="8"] {
    grid-column: span 8;
  }
  [data-colspan="9"] {
    grid-column: span 9;
  }
  [data-colspan="10"] {
    grid-column: span 10;
  }
  [data-colspan="12"] {
    grid-column: span 12;
  }
}
```

Design notes:

- Row wrappers always use 12-column grid — defined in the default layer, not here. `data-colcount` attribute removed (it was always 12).
- Children without `data-colspan` auto-span 1 column via CSS grid auto-placement — no attribute needed for icon buttons or other 1-col elements.
- `data-colspan` selectors trimmed to values that divide meaningfully into 12: 2, 3, 4, 6, 8, 9, 10, 12. Values 1 (auto-placement default), 5, 7, 11 omitted — they don't produce clean ratios and haven't appeared in any test pattern.
- `data-colspan` selectors are global (not scoped to row wrapper children) to keep specificity flat. They only have effect inside a grid parent.
- Gap is `--xs` (tighter than card's `--s`) because row children are siblings in a single line, not stacked content.

### No Redundant Native Styling

Removed: text-decoration on `<a>` (native), font-weight 700 on headings (native), cursor:pointer on `<a>` (native). Kept cursor:pointer on `<button>` (NOT native — browsers default to cursor:default on buttons).

---

## 10. Decisions Log

### Locked

| #   | Decision                                                                                           | Status         |
| --- | -------------------------------------------------------------------------------------------------- | -------------- |
| 3   | Color: hue+chroma inputs, light-dark(), oklch derivation                                           | ✅ Locked      |
| 6   | Zero custom CSS — Claude never writes CSS                                                          | ✅ Locked      |
| 7   | Escape hatch container for freeform content                                                        | ✅ Locked      |
| 8   | States fully automated via derivation                                                              | ✅ Locked      |
| 15  | CLAUDE.md 200 lines, catalog in skill (out of scope for stage 1)                                   | ✅ Locked      |
| 16  | Validator script (out of scope for stage 1)                                                        | ✅ Locked      |
| 18  | Overlays via popover attribute on semantic elements                                                | ✅ Locked      |
| 20  | CSS oklch color, light-dark() for dark mode                                                        | ✅ Locked      |
| 23  | Reference app built toward end of stage 1                                                          | ✅ Locked      |
| 24  | Native HTML only — no custom elements, no Shadow DOM                                               | ✅ Locked      |
| 25  | Flat global stylesheet with @layer (reset, default, skin, grid)                                    | ✅ Updated S4  |
| 26  | Composable skins via data-skin                                                                     | ✅ Locked      |
| 27  | Zero CSS classes — element selectors + attribute selectors only                                    | ✅ Locked      |
| 28  | No div — article is card, section is row wrapper                                                   | ✅ Updated S5  |
| 29  | Popover hosts: aside (tooltip), output (toast), nav (dropdown)                                     | ✅ Updated S5  |
| 30  | ~21 base tags, h1–h4 only. Cut: fieldset, img, table, lists, hr.                                   | ✅ Updated S5  |
| 31  | Scale: --0, --xs, --s, --m, --l. --m is base font-size + spacing                                   | ✅ Locked      |
| 32  | Visual depth: cards --neutral-mute, row wrappers transparent, controls --neutral                   | ✅ Updated S5  |
| 33  | Open Props — not used. Own token system.                                                           | ✅ Locked      |
| 34  | text-on-accent: fixed near-white                                                                   | ✅ Locked      |
| 35  | --m double duty (font-size + spacing): keep as-is                                                  | ✅ Locked      |
| 36  | Scale stops at --l, no --xl needed                                                                 | ✅ Locked      |
| 37  | Emphasis skin on inputs: keep accent bg                                                            | ✅ Locked S3   |
| 39  | Skins follow defaults for undefined states; skins can explicitly override                          | ✅ Reframed S3 |
| 43  | Max depth 3 for structure, depth 4 allowed for row wrapper children                                | ✅ Updated S5  |
| 44  | No article inside article (no nested cards)                                                        | ✅ Updated S5  |
| 45  | p is for text only, not layout wrapping                                                            | ✅ Locked      |
| 49  | Skill file framing: engineered constraint, not prototype simplicity                                | ✅ Locked      |
| 51  | Grid architecture: F4 (1-col section + optional article row wrappers)                              | ✅ Locked S3   |
| 52  | Row wrapper tags: section, header, footer, nav, summary                                            | ✅ Updated S5  |
| 57  | Add strategic goals (portability, context windowing, cloning) to blueprint                         | ✅ Locked S3   |
| 53  | Row mechanism: 12-col grid via CSS on row wrappers + `data-colspan` on children. `data-colcount` removed. | ✅ Updated S5  |
| 55  | 9 skins: emphasis, ghost, square, full, mute, round, flat, elevated, freeform. half/transparent removed, elevated/freeform added. | ✅ Updated S5  |

| 58  | form = display:contents, always transparent, never a visual container                              | ✅ Locked S5   |
| 59  | details = card-level collapsible container, summary = row wrapper                                  | ✅ Locked S5   |
| 60  | dialog interior follows same rules as any card                                                     | ✅ Locked S5   |
| 61  | Body: max-inline-size 800px, margin-inline auto                                                    | ✅ Locked S5   |
| 62  | Ghost skin merges old ghost + transparent. Hover on interactive only.                              | ✅ Locked S5   |
| 63  | Skin conflict groups: emphasis\|ghost (visual), round\|flat (radius)                               | ✅ Locked S5   |
| 64  | Escape hatch via data-skin="freeform" on cards                                                     | ✅ Locked S5   |
| 65  | Dropdown menu popover: nav[popover] (was section[popover])                                         | ✅ Locked S5   |
| 66  | Cut elements: fieldset, img, table family, ul/ol/li, hr                                            | ✅ Locked S5   |
| 67  | Inline formatting (strong, em, code) implicit, not spec-listed                                     | ✅ Locked S5   |

### Open

| #   | Decision                                                                    | Depends on |
| --- | --------------------------------------------------------------------------- | ---------- |
| 54  | Partial-width single elements (sizing skins vs row wrapper with empty cols) | Prototype  |

---

## 11. Risks & Failure Modes

### Risk 1: LLMs improve enough to make this redundant

**Likelihood: Medium-high over 12–18 months. Low over 6 months.**

LLM visual consistency is improving. Models are getting better at maintaining style across sessions, following design tokens, and self-correcting. Claude Code's skills/hooks architecture already provides configuration layers that didn't exist a year ago. It's plausible that within 1–2 years, an LLM with a well-written CLAUDE.md and access to a standard design system (Tailwind, shadcn, etc.) produces consistent-enough output without a bespoke constrained system.

**Mitigations:**

- The blueprint is valuable for human developers regardless of LLM capability — consistency, fast onboarding, low maintenance.
- The constraint philosophy can be applied on top of whatever tools LLMs use in the future — it's a design principle, not just an implementation.
- Building it teaches transferable knowledge about component architecture, CSS systems, and LLM-assisted workflows.
- If LLMs do get good enough, the blueprint becomes lighter (just a CLAUDE.md + token file) rather than worthless. The constraint model degrades gracefully.

**Honest assessment:** This is a real risk. If the only motivation were LLM consistency, the project might not justify the investment. The "also valuable for humans" argument must be genuinely true, not just a hedge.

### Risk 2: Over-engineering the blueprint itself

The system meant to save time becomes a months-long project. The design of the design system absorbs more effort than building actual apps would have.

**Mitigations:**

- Start with ~21 elements and one reference app. Extract patterns from working code, don't design them in the abstract.
- Time-box stage 1. If the core system (grid + skins + color derivation + one app) isn't working within 2–3 focused sessions, re-evaluate the approach.
- The token system and skin layer are already implemented and tested. Remaining work is row wrapper mechanism, signal states, and real-layout validation.

### Risk 3: Convention drift in long Claude Code sessions

Claude Code can forget or subtly deviate from conventions mid-session, especially once context fills up. A CLAUDE.md rule can be ignored. Even well-documented constraints get lost in long contexts.

**Mitigations:**

- Validator script (planned for post-stage-1) that parses generated HTML and flags unauthorized elements, style attributes, CSS changes, and data-skin values not in the allowed set.
- The technology itself provides enforcement: attribute selectors only match defined values; undefined data-skin values produce no styling, making deviations visually obvious.
- CLAUDE.md under 200 lines with hard rules only. Detailed catalog in a skill file that Claude reads on demand.
- Claude Code hooks can physically block disallowed operations (e.g., preventing CSS file edits).

### Risk 4: Too rigid for real-world edge cases

If the blueprint doesn't have a pattern for something (drag-and-drop reorder, complex data visualization, third-party widget integration), Claude either invents something inconsistent or gets stuck.

**Mitigations:**

- Escape hatch: `data-skin="freeform"` on any card + internal freeform CSS for complex widgets.
- Explicit rule: if something doesn't fit, Claude stops and proposes a new skin rather than improvising. This is a workflow rule, not a technical constraint.
- The system is designed to be extended: adding a new skin value is a small, deliberate change, not a redesign.

### Risk 5: The skin system becomes its own complexity

If the number of skins and combinations grows, the system risks becoming as complex as the frameworks it replaces — just with a different syntax.

**Mitigations:**

- Current count: 9 skins. Column skins were removed in session 3, half/transparent removed in session 5, elevated/freeform added — validates that the system evolves through both addition and removal.
- Composability reduces the need for new skins — combinations cover many cases.
- Regular review: if a new skin is proposed, challenge whether it can be achieved by composing existing skins.

### Risk 6: CSS oklch / light-dark() browser support

The color system relies on `oklch()` and `light-dark()`. Both are well-supported as of March 2026. `oklch(from ...)` relative color syntax has narrower support.

**Mitigations:**

- Test with extreme themes (pure white surface, near-black surface, highly saturated accent, desaturated accent) early.
- No CSS relative color syntax in production — all tokens use direct oklch values. Relative syntax (oklch from ...) was considered for text-on-accent but the fixed-white approach was chosen instead, avoiding the narrower browser support.

### Risk 7: The grid model breaks for some layouts

Not all UI patterns fit strict grid flow. Dense data tables, freeform canvases, chat interfaces, code editors — these have internal layout needs that may not map cleanly.

**Mitigations:**

- These live inside the escape hatch container.
- The card stack + row wrappers govern page-level and card-level composition (covering ~80% of typical app UI). Internal widget layout is a separate, smaller concern.

### Risk 8: LLM Cannot Think in Flat Grids (HIGH PRIORITY)

**Likelihood: High. This is the single biggest risk in the project.**

Claude's training data is overwhelmingly nested DOM (Bootstrap div soup, React component trees, Tailwind wrapper divs). The concept of building applications with single-column section stacks and row-wrapper-based horizontal layout barely exists in the training corpus.

**Failure modes:**

- **Silent regression:** follows rules for 3 sessions, reverts to nesting under complex prompt pressure.
- **Hostile compliance:** avoids article-in-article but invents worse workarounds.
- **Prompt misinterpretation:** "put these side by side" only maps to nested containers in Claude's model.
- **Self-correction loops:** generates flat HTML, "reviews" it, decides it looks wrong, refactors into nested structure.
- **"Improvement" instinct:** if system reads as prototype/MVP, Claude suggests "graduating" to a real framework.

**Mitigations:**

- Skill file framed as engineered end-state, not prototype.
- 10–15 before/after examples per layout type in the skill — Claude needs patterns to imitate, not just rules to follow.
- Align with Google web.dev performance guidance (flat DOM, minimal depth).
- The system itself provides enforcement: undefined skins produce no styling, nesting produces no visual benefit, making deviations visually obvious.

**Session 3 finding:** LLM spatial reasoning research suggests row wrappers (F4) are more LLM-compatible than span accumulation (F3), because explicit boundaries convert spatial state tracking into pattern matching. This was a factor in the F4 decision.

---

## 12. Potential Ideas & Explorations 

### Coordinates-as-Language

Users or Claude describe UIs like chess notation: "Button-primary at C3, spanning to E3." Useful as internal intermediate representation.

### Named Row Patterns (R2+)

Row wrappers with semantic names (`data-row="button-pair"`, `data-row="label-input"`) instead of numbers/ratios. Better linguistic parity but closed vocabulary that requires system extension for new arrangements. Could combine with numeric fallback (hybrid model). Session 3 analysis showed this scores well on linguistics but lower on adaptivity.

---

## 13. Outside References & Analogies

| Source                                  | What to borrow                                                                                                                                                                                                        |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ISO shipping containers                 | Standardize the interface (grid cell), not the contents. One connection standard enables infinite composition.                                                                                                        |
| French mother sauces                    | Small set of bases, derivatives by adding one ingredient. Never need a new base.                                                                                                                                      |
| Swiss/International Typographic Style   | Grid + hierarchy = two choices per element, everything else follows.                                                                                                                                                  |
| Nashville Number System                 | Colors as relationships, not absolutes. Change the key, everything shifts.                                                                                                                                            |
| Periodic table                          | Properties predicted by position (row × column), not assigned per element.                                                                                                                                            |
| Lego Technic                            | Typed connection interfaces (pin, axle, hole) make compatibility checkable.                                                                                                                                           |
| Car dashboard / cockpit                 | Physical UI with roles (button, toggle, dial), tones (red=danger, amber=warning, green=ok), states (on/off/blinking), parent-child nesting (gauge cluster contains gauges), and content (labels). Full analogy holds. |
| Form / Fit / Function (engineering)     | Form ≈ skin + placement. Fit ≈ context + relationships. Function ≈ HTML element + behavior.                                                                                                                           |
| LEGO brick system (modularity research) | 1.6mm unit grid IS the governance — makes proposals obviously compatible or not. Blueprint's depth constraint + ~21 tags do the same.                                                                              |
| Toyota TNGA platform                    | Standardize what doesn't differentiate (pedal-to-axle = grid cell), preserve what does (interior = content).                                                                                                          |
| Project Ara failure                     | Modularity tax (25% bulk) killed it physically. In CSS, equivalent "tax" (padding, gaps) is actually good UX.                                                                                                         |
| Boeing 787 failure                      | Don't modularize immature technology. Complex widgets get escape hatch.                                                                                                                                               |
| Cadillac Cimarron failure               | Too much sharing kills identity. Apps must look like different products.                                                                                                                                              |
| Carnegie Unit ossification              | Modular architectures become institutional. System must be evolvable.                                                                                                                                                 |
| IKEA flat-pack                          | Constraint is the product. Users pay it because it enables immediate, predictable results.                                                                                                                            |
| Pico CSS / Water.css / MVP.css          | Proof that flat semantic HTML with element-level styling works. Not the positioning — "same DOM philosophy, for production applications."                                                                             |
| ARIA grid model                         | grid → row → gridcell. Three-level hierarchy. The web platform's own accessibility layer chose explicit rows — aligns with F4 architecture.                                                                           |

---

Details = Card
Article = Card
Dialog = Card

Section = Grid-row
Summary = Grid-row (first)
Header = Grid-row (first)
Nav = Grid-row (button group)
Footer = Grid-row (last)

---

Open:
Can we further simplify?
- Always radius round for buttons, tags, etc?
- Always use details summary instead of article?
- Drop aspect ratios 1:1 for grid span 1?
- Reuse/borrow commom attribue names from existing syystems. 

---
