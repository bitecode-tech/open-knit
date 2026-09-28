# Feature Request — OpenKnit Public Landing Page

**Feature ID:** `WEB-LANDING-001`  
**Version:** 2.0 · 28 September 2026  
**Status:** Approved visual direction; implementation specification, not a completed application  
**Owner:** Product / frontend  
**Design dependency:** `DESIGN.md` (canonical reusable colors, typography, control states, accessibility, motion defaults)  
**Visual reference:** `openknit_landing_reference.png` (illustrative, not proof of product capabilities)

---

## 0. Goal, scope, and decisions

### User story

As a developer or technical business buyer, I want to understand OpenKnit's modular application foundation immediately, inspect how selectable business modules fit into its architecture, and proceed to the existing builder with confidence that the application can be extended using its documentation, skills, and structured AI-development guidance.

### Requested final page structure

1. **Hero — BUILD YOUR BACKBONE.** One strong headline, one short explanation, one primary CTA, one quieter secondary CTA, and a small technical stack graphic. Intentionally sparse; **do not put the complex diagram above the fold**.
2. **Architecture workbench — SELECT MODULES. ASSEMBLE ARCHITECTURE.** The large three-part graph with live module selection, an explanatory architecture, and a genuine continuation or export-preview panel.
3. **Process — FROM IDEA TO A SOLID FOUNDATION.** Three simple steps with concise descriptions: choose foundation, equip coding agent, build unique business logic.
4. Minimal footer, correct navigation and official destinations.

### In scope

- The public landing page, its responsive layout and visual assets.
- Real or clearly labeled preview interaction in the module/architecture panel.
- Correct routing to the *existing* builder, preserving selected modules only through supported mechanisms.
- One-time section reveals, restrained hero stack motion, selection feedback, hover/focus/pressed states, and reduced-motion equivalents.
- Correct loading/error/empty states for catalog-backed interactions and a reviewable desktop/mobile implementation.

### Out of scope

- Redesigning the builder, creating a second generator, inventing a runtime AI agent, promising production readiness without evidence, adding unverified modules, or building a draggable node editor.
- New backend endpoints unless a real dependency is identified and approved.
- Pricing, case studies, fabricated business metrics, and testimonial carousels.

### Product truth / required inspection before coding

OpenKnit is an **application foundation ready for AI-assisted development**, combining a Java/Spring and React/Vite full-stack starter, optional business modules, and structured development guidance or skills as available in the actual generated output. Verify the repository/API for current frameworks, versions, generated files, module registry, dependencies, bundle defaults, available guidance, and builder route. The previous public-site review (28 September 2026) described a generation flow with project metadata, optional demo data, and bundle/module/ready-system choices, but do not assume the current codebase matches that review. The reference image depicts an *illustrative* module set; never silently replace real catalog names with artwork labels.

**Authority:** If wording, states, or component styling differ, `DESIGN.md` defines reusable tokens and UI conventions; this file defines the landing page's content, layout, data binding, and choreography. Product behavior verified in code is authoritative over both. Put intentional visual exceptions in a short implementation note; avoid duplicating all tokens in this feature.

---
## 1. Creative direction

### Concept: **The systems architect's drafting table**

The page should look like an engineer designed it for people who build serious software: an assertive headline, measurable visual order, functional architecture graphics, an unusually good sense of whitespace, and disciplined neon accents. The graphics reveal *how the product works*. They are not abstract decoration.

**The landing page is a three-act story:**

1. **Build your backbone.** An immediate product promise, two actions at most, and a small architectural sculpture that communicates “foundation + modules + your logic.”
2. **Select modules. Assemble architecture.** The large, detailed, interactive centerpiece lives **below** the hero, where a visitor can opt into complexity.
3. **From idea to a solid foundation.** Three concise steps, emphasizing that developers receive actual code, architecture, and AI-development context—not a proprietary black box.

The design should feel **IT-first and business-capable**, not like a generic LLM product, crypto startup, game HUD, or agency portfolio. The site sells a faster start with a maintainable application foundation; it does not sell an autonomous AI that magically builds the entire business.

### Non-negotiable visual rules

- **Near-black is the canvas.** The whole page does not glow green. Neon is used to direct attention and signal active system state.
- **Type carries the hero.** The headline should dominate the opening viewport. Other copy is secondary.
- **Only one complex diagram exists on the page.** Do not repeat the full module/architecture graph in the hero or final section.
- **No fake dashboards, chat bubbles, or floating AI orbs.** Every UI-like element must correspond to a real module, layer, choice, skill, or export state.
- **Use line, grid, depth, and connections with purpose.** A connector means a dependency or integration. A lit node means selected or active. A dim node means unselected, not broken.
- **Generous breathing room.** The concept image is information-dense for presentation; the production page must be noticeably more spacious.
- **Avoid fabricated social proof and numerical impact claims.** No arbitrary user counts, speed-up percentages, company logos, or testimonials.

---

## 2. Information architecture & navigation

### Page order

| Region | Purpose | Target desktop height (guideline) |
|---|---|---:|
| Header | Identity and minimal navigation | 72–80 px |
| 01 · Hero | Explain the product in seconds | 640–760 px, including header when appropriate |
| 02 · Architecture | Show and let users explore the product | 820–1,050 px, content-dependent |
| 03 · Foundation process | Explain the three-step operating model | 380–520 px |
| Minimal footer | Docs, repository, company and legal | 180–260 px |

Never compress everything into a single screenshot-sized viewport. The exact scroll length is less important than a calm reading rhythm.

### Header

**Desktop**

- Left: `OpenKnit` logotype. Optional small version pill **only when sourced dynamically** and useful.
- Right: `Modules`, `How it works`, `Docs`, and a GitHub icon **only if official destinations exist**.
- Primary header CTA can be `Build your foundation`, but on desktop it may be omitted if it competes with the large hero CTA. Do not show more than one visually dominant neon button per viewport.
- Background: subtly translucent near-black on scroll; 1 px bottom border. No heavy frosted glass effect.
- Sticky after the hero begins to scroll, or static if sticky behavior causes layout conflicts.

**Mobile**

- Wordmark at left; one accessible menu button at right.
- Menu opens a simple panel with the real navigation links and primary CTA; close on selection and `Escape`.
- Do not reproduce the full desktop navigation as tiny links.

### Primary actions

- **Hero primary:** `Build your foundation` → the actual builder/configuration route, preserving an existing session if appropriate.
- **Hero secondary:** `Explore modules` → smooth-scroll to `#architecture`, focus the section heading for keyboard and assistive-technology users.
- **Architecture primary:** `Generate project` / `Continue to builder` depending on whether the inline diagram is genuinely wired to the generator. Do not label a demo button “Generate” if it cannot generate.
- **Footer:** one understated link back to the builder or documentation; no redundant neon CTA wall.

---

## 3. Section 01 — Hero: BUILD YOUR BACKBONE

### Content

**Eyebrow:** `// APPLICATION FOUNDATIONS FOR AI-ASSISTED DEVELOPMENT`  
**Headline:**

> BUILD YOUR  
> **BACKBONE.**

“BUILD YOUR” is white; “BACKBONE.” is neon green. Use manual line breaks on desktop to keep the shape deliberate. At smaller breakpoints, let the text wrap naturally without clipping.

**One-paragraph explanation (target 25–35 words):**

> Start with a modular full-stack application, business-ready building blocks, and structured guidance for AI-assisted development. Own the architecture. Build what makes your product different.

This is suggested copy; verify promises about code ownership and maturity before publication.

**Actions:**

- Primary filled neon button: `Build your foundation ↗`
- Secondary outlined/quiet button or underlined text: `Explore modules ↓`

No technology badge strip, testimonial, card grid, terminal, or feature list inside the hero. These all dilute the concept. If stack information is essential, put it in the architecture section.

### Hero layout

**Desktop ≥ 1200 px:** 12-column content grid; headline and actions occupy approximately columns 1–6, illustration occupies 7–12. Header remains outside the section's main grid. Vertical alignment is roughly centered with a slightly higher text baseline than the graphic.

- Text max-width: 590 px.
- Headline: 96–144 px depending on viewport width; very tight line-height (0.84–0.94), slightly negative tracking only if the chosen font needs it.
- Eyebrow: 11–12 px mono, uppercase, tracked, with a 28 px max neon marker line.
- Body: 18–21 px; line-height 1.45–1.55; max-width 540 px.
- CTA row: 16 px gap, minimum 48–54 px tap targets.
- Hero illustration: 430–560 px wide, with at least 60 px breathing room from body copy.
- Decorative grid/dots: behind the illustration only, opacity 0.08–0.13. Fade to black before touching the text.

**Illustration: an exploded architectural stack**

Prefer an editable SVG (or simple CSS 3D/isometric vector) over a screenshot or a large 3D scene. Four offset layers are enough:

1. **Your business logic** — your product-specific code; the top layer.
2. **Business modules** — optional reusable capabilities; the middle layer.
3. **AI skills & guidance** — structured context/docs that help coding agents extend the app; an adjacent translucent ribbon or slim plate, **not** a claim that an autonomous agent runs your business.
4. **OpenKnit foundation** — application framework and integration surface; the visually strongest bottom plate.

The order is conceptual rather than a literal deployment topology. Add a small caption `ILLUSTRATIVE SYSTEM LAYERS` if any plate could be mistaken for an actual runtime component. Limit each layer to a **two- or three-word label**. Use 1 px strokes, one neon edge light on the active plate, and subdued shades on other plates. Avoid tiny prose printed onto angled surfaces.

**Hero motion:** The stack can separate by 6–12 px once when it enters, then settle. One soft, moving edge highlight is enough. No continuous spins, arbitrary particles, dramatic parallax, or content that moves under the pointer.

### Hero wireframe

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ OPENKNIT                                   MODULES   HOW IT WORKS   DOCS │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ // APPLICATION FOUNDATIONS...            ┌───────────────────────────┐ │
│                                          │    YOUR BUSINESS LOGIC    │ │
│ BUILD YOUR                               │       MODULES             │ │
│ BACKBONE.                                │    AI SKILLS / GUIDANCE   │ │
│                                          │    OPENKNIT FOUNDATION    │ │
│ Short, grounded product explanation      └───────────────────────────┘ │
│ [ Build your foundation ↗ ] [ Explore modules ↓ ]                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Section 02 — The architecture workbench

### Section heading and spacing

- Anchor: `id="architecture"`.
- Small section number: `// 01 — THE WORKBENCH`.
- Large heading: `SELECT MODULES.` (white) / `ASSEMBLE ARCHITECTURE.` (green).
- One short sentence, to the right on desktop or beneath on mobile: `Choose the capabilities you need. See how they fit into a full-stack application.`
- Preserve **72–104 px top padding** after the hero divider. Leave **40–56 px** between the heading and the actual workbench.
- This is the page's only dense region. Give it enough height and visual hierarchy to breathe.

### Desktop graph: three columns

The architecture graphic is primarily a **structured, interactive system diagram**, not a draggable canvas. Users should be able to understand it without manipulating zoom or panning.

| Column | Width allocation | Content |
|---|---:|---|
| 01 · Select modules | 25–28% | Real catalog with selection controls |
| 02 · Assemble architecture | 42–47% | Frontend, API/backend, persistence and guidance outputs |
| 03 · Export source | 25–28% | Project package preview, ownership message, actual continuation CTA |

Recommended content grid: 12 columns (roughly 3 / 6 / 3, with room for inter-column connector gutters). Diagram min-height ~620–700 px on large screens, not the compact arrangement shown in the reference image.

**Column 01 — Selection**

- Show 5–7 representative modules in the first view, using only catalog-backed entries.
- One row consists of a restrained icon (20 px), readable label, and native or accessible custom toggle.
- Row minimum height: 56–64 px; 10–12 px vertical spacing between rows.
- Use 1 px borders; selected rows get a green border and a **small** halo at the connector, not a full green background.
- If the catalog exceeds 7 entries, add a `View all modules` control; reveal an expanded panel or take the user to the dedicated catalog. Do not make the illustration tall enough to show every module in the system.
- Disabled or unreleased modules must be visibly labeled, never presented as working toggles.
- Core infrastructure is not a removable module. Keep it always present in the architecture, distinct from optional business features.

**Column 02 — Architecture**

Visually assemble a foundation from actual logical outputs:

- `Frontend` · React/Vite (confirm generated version/toolchain from current config).
- `Backend` · Java/Spring (confirm actual framework/package versions).
- `Data` · actual database/persistence layer if present in current generator output; do not presume PostgreSQL for every template if the generator permits alternatives.
- `AI development context` · **skills, module documentation, examples, patterns**, when packaged by the selected configuration. Make this a documentation/context lane, not a phantom fourth runtime server.

Each selected module should illuminate relevant touchpoints with the application layers **only where a real integration exists**. Don't draw every module connected to every layer for visual symmetry. Draw the baseline frontend ↔ backend ↔ persistence flow separately from optional module integration. Put guidance/docs outside the runtime flow with a dashed line meaning `development-time guidance`.

**Connector language:**

| Visual | Meaning |
|---|---|
| 1.5 px muted gray | Fixed architectural relationship |
| 1.5–2 px neon | Currently selected module integration |
| Small bright node | Actual source/target anchor |
| Dashed muted green | Documentation/guidance relationship, not a runtime data flow |
| Dim row and edge | Optional capability not selected |

For 7 modules, do **not** create 21 crisscrossing SVG curves. Aggregate module edges into three or four integration buses and disclose specifics on focus/selection in a detail pane or tooltip. Readability beats architectural completeness in this visual.

**Column 03 — Export / continue**

Show an illustrative, minimal repository tree using *actual* project structure, not invented commands:

```text
project-name/
  backend/
  frontend/
  ...config-dependent files
  ...module-dependent files
  ...optional skills and docs
```

Generate the tree from manifest/config if possible. If using a static sample, mark it `Example output`. Display **up to five lines** before a `Preview generated structure` expander. Avoid source ownership assertions unless licensing and generation behavior are confirmed. CTA behavior:

- If inline selection is connected to backend/configuration: `Continue to generation` prepopulates the builder and passes selected module IDs.
- If it is only a marketing demonstration: `Configure your project ↗` opens the existing builder in its default state. Label the diagram `Interactive preview` and never claim its checkboxes modify a downloadable artifact.
- `Generate project` should appear only when it actually triggers the expected generation flow, with validation, loading, success, and error states.

### Behavior and state

**Source of truth:** Module data comes from the generator's canonical module registry/API (or a single shared typed manifest), not copied into the landing-page source as disconnected hardcoded content. The same IDs must be used by the builder.

```ts
type ModuleDefinition = {
  id: string;
  name: string;
  shortDescription: string;
  status: 'available' | 'coming_soon';
  defaultSelected?: boolean;
  requires?: string[];                  // optional dependencies
  architectureTargets: Array<'frontend' | 'backend' | 'database'>;
  providesGuidance?: boolean;           // true only if output contains guidance
};

type WorkbenchState = {
  selectedModuleIds: string[];
  activeModuleId: string | null;        // keyboard focus or pointer selection
};
```

Example selection rules:

1. Start with a documented default bundle or sensible set derived from the actual builder defaults, not a random group chosen for aesthetic reasons.
2. Toggling a module updates its row, the integration bus, the affected architecture touchpoints, and the exported project preview.
3. When a module requires another, expose the dependency before automatically selecting it; handle deselection consistently with the builder.
4. Never let a disabled or `coming_soon` row toggle.
5. Changing selection must not automatically navigate, download, or submit.
6. Preserve the selection in URL query parameters or app state when routing into the actual builder if supported; do not invent undocumented query params.
7. Architecture changes should be animated subtly (160–260 ms) and announced textually to screen-reader users.

**Useful optional detail interaction:** Click or focus a module to show one short description, its actual dependencies, and whether guidance/skills are included. Use a compact popover on desktop and an inline disclosure on mobile. No meaningless tooltips repeating the label.

### Workbench wireframe

```text
// THE WORKBENCH
SELECT MODULES. ASSEMBLE ARCHITECTURE.
Choose the capabilities you need. See how the pieces connect.

┌──────────────────┬─────────────────────────────────┬────────────────────┐
│ 01 / MODULES     │ 02 / ARCHITECTURE               │ 03 / EXPORT        │
├──────────────────┼─────────────────────────────────┼────────────────────┤
│ [●] Module A  ●──┼───┐ ┌─ FRONTEND ─────────────┐  │ project-name/      │
│ [●] Module B  ●──┼─┐ ├─┤ Features / UI          │  │  backend/          │
│ [○] Module C     │ │ │ └───────────────────────┘  │  frontend/         │
│ [●] Module D  ●──┼─┤ └─┌─ BACKEND ──────────────┐  │  ...docs (if any) │
│ [○] Module E     │ ├───┤ APIs / services        │  │                    │
│ [●] Module F  ●──┼─┘   └───────────────────────┘  │ [Configure ↗]      │
│ [ View all ]     │           │                     │                    │
│                  │       DATA LAYER                │                    │
│                  │  - - AI SKILLS / GUIDANCE - -   │                    │
└──────────────────┴─────────────────────────────────┴────────────────────┘
```

This ASCII diagram conveys grouping; actual SVG paths should be routed with low crossing count and adequate gutter space.

### Tablet and mobile alternative

**Tablet 768–1199 px:** Replace the three-column graph with two rows: module selector across the top (two-column list or compact horizontal catalog), architecture diagram below-left, export card below-right. At ~800 px, stack export under architecture if the diagram becomes too narrow.

**Mobile < 768 px:** Do not scale the desktop wiring diagram to unreadable dimensions. Present the same function as three clear sequential panels:

1. `Select modules` — vertical checkable list, labels at least 14 px, 44 px tap targets.
2. `Your architecture` — compact stack of frontend, backend, data, and optional guidance with a short `Selected integrations` summary. Remove decorative connector curves; retain simple arrows or grouped labels.
3. `Your project` — selected-module count, concise project tree, CTA to builder.

An optional `See architecture` disclosure can contain a horizontally scrollable *secondary* full diagram, but **all essential functionality must work without horizontal scrolling**. The mobile first view still consists of hero, not a huge graph.

---

## 5. Section 03 — FROM IDEA TO A SOLID FOUNDATION

This is a **summary and confidence section**, not a second feature catalog. It should be calmer and simpler than the diagram immediately above it.

**Eyebrow:** `// 02 — FROM IDEA TO IMPLEMENTATION`  
**Heading:** `FROM IDEA TO A SOLID` / `FOUNDATION.` (neon only on `FOUNDATION.`)  
**Supporting text (optional, max 28 words):** `Start with a coherent application, add the capabilities you need, and use structured project guidance to build the rest with your coding tools.`

### Exactly three steps

| # | Title | Suggested copy | Minimal visual |
|---|---|---|---|
| 01 | Choose your foundation | Select a bundle or the modules your business needs. Start with an integrated full-stack baseline. | Outline cube |
| 02 | Equip your coding agent | Use the project's actual skills, documentation, conventions, and examples to extend the app with AI-assisted coding. | Two thin stacked planes |
| 03 | Build your business logic | Implement the workflows unique to your product, test the result, and deploy on infrastructure you control. | Single lightning/branch glyph |

**Important:** Step 02 must describe skills/guidance as *development aids* and must not imply that OpenKnit includes a hosted autonomous coding agent unless it does.

**Desktop layout:** three equal columns with 1 px vertical separators and 48–64 px horizontal padding. Number 01/02/03 is large, outlined green; title in white; description in muted gray. Keep descriptions under ~34 words each. Avoid feature-card borders around every step; separators are sufficient.

**Mobile layout:** vertical sequence with generous vertical gaps; a fine connector rule can join the step numbers. Do not cram three columns into one viewport.

A single quiet bottom link such as `Explore documentation →` is optional. No third repeated giant CTA.

---

## 6. Landing page responsiveness

| Breakpoint | Page behavior | Hero | Workbench |
|---|---|---|---|
| ≥ 1440 px | Full composition, constrained max width | Two columns; large headline | Three columns and visible connectors |
| 1200–1439 px | Tighter desktop gutters | Two columns | Three columns; compressed gutters |
| 960–1199 px | Transitional tablet/desktop | Smaller two-column or stacked hero if needed | Selection above diagram + export |
| 768–959 px | Tablet | Hero text above illustration | Two-row layout, simplified paths |
| 480–767 px | Mobile landscape / large phone | Single column, compact stack | Three-step stacked sequence |
| 320–479 px | Small phone | Display font clamps; CTA stack | List + readable compact system stack |

**Mobile first screen:** wordmark/menu, eyebrow, large two-line headline, 1–2 sentence explanation, primary CTA, and only the upper portion of the small illustration if necessary. Never sacrifice CTA visibility to fit a decorative diagram.

**Desktop first screen:** header, entire hero headline, brief explanation, both actions, and the architectural sculpture. The second section should begin **below** the hero so users do not initially perceive a crowded dashboard.

**Critical no-overflow checks:** 320, 360, 390, 768, 1024, 1280, 1440, and 1920 CSS-pixel widths. Confirm no accidental horizontal page scroll, clipped display letters, off-screen CTA, or illegibly scaled SVG labels.

---

## 7. Landing page animation choreography

Motion should convey assembly, confidence, and systems logic — not general futuristic excitement. Codex should implement motion as **small, purposeful micro-interactions** layered over an already-good static page.

### Motion principles

1. **Assembly, not spectacle.** Elements should feel like they slot into place.
2. **Fast response to interaction.** User-triggered feedback should begin immediately.
3. **Ambient motion is optional and quiet.** There should never be more than one subtle ambient animation competing in the same region.
4. **Content first.** Motion may guide attention but must not block reading or interaction.
5. **Reduced motion is first-class.** Every animated behavior must have a still equivalent.

### Required motion inventory for Codex

| Element | Trigger | Effect | Duration |
|---|---|---|---:|
| Hero eyebrow + headline | Initial view | Fade from 0 to 1 with slight Y-offset (8–16 px) | 400–600 ms |
| Hero body + CTAs | Immediately after headline | Fade/translate in with 40–80 ms stagger | 400–550 ms |
| Hero architectural stack | On first viewport entry | Layers start closer together, separate 6–12 px, then settle | 600–900 ms |
| Hero edge sweep | Idle (optional) | A thin highlight sweeps along one slab edge | 6–9 s cycle |
| Section heading reveal | Scroll into viewport | Fade/translate once | 280–420 ms |
| Module row hover | Hover/focus | Row lifts slightly; connector node brightens | 120–180 ms |
| Module select/deselect | Click / keyboard | Toggle changes instantly; related line pulses once; target cards accent in | 160–240 ms |
| Connector path activation | Selection change | Stroke animates on or opacity ramps in | 180–260 ms |
| Export panel update | Selection change | Content swaps immediately; optional subtle border flash | ≤ 240 ms |
| Step 01/02/03 cards | Scroll entry | Small staggered reveal once, 60–100 ms between cards | 250–450 ms |
| Mobile menu open | Menu button click | Opacity + slight upward slide | 180–220 ms |

### Detailed animation guidance for Codex

#### A. Hero entrance

Sequence:
1. Header is visible immediately; no dramatic entrance required.
2. Eyebrow fades in first.
3. Headline follows with 30–50 ms delay.
4. Body text and CTA row fade in together or in quick succession.
5. Architectural stack illustration settles into place last.

Suggested implementation:
- Initial state: `opacity: 0; transform: translateY(12px)`
- Final state: `opacity: 1; transform: translateY(0)`
- Use `var(--ease-emphasized)` for the hero stack and `var(--ease-out)` for text.
- Total perceived entrance time should remain under ~1 second for text and ~1.2 seconds including the stack.

#### B. Hero ambient motion

Keep this minimal:
- One soft moving highlight along a slab edge.
- Optional faint shimmer through the grid behind the illustration.
- No perpetual floating, spinning, or breathing of the stack.

Recommended limits:
- Ambient animation should be almost unnoticeable unless the user lingers.
- Suspend ambient motion when the tab is inactive or the hero scrolls offscreen.

#### C. Architecture workbench interactions

When a module is selected:
1. The toggle snaps to ON immediately.
2. The module row border and connector node gain emphasis.
3. Relevant architecture lines illuminate.
4. The relevant cards in the architecture column gain a subtle accent.
5. The export preview updates.

The visual order matters: toggle → connector → targets → export. This creates a readable causal chain.

Implementation notes:
- Use SVG path stroke or opacity transitions rather than particle effects.
- A single pulse is enough; do not repeat the pulse continuously.
- For changed export rows, use a quick opacity crossfade or content highlight bar, not a full panel reanimation.

#### D. Scroll reveal behavior

Sections may reveal on first entry only.
- Threshold: trigger when ~20–30% of the section is in view.
- Repeat: false, unless a component meaningfully remounts.
- Large sections should not all animate as one slab; animate heading and main content group independently.

#### E. Micro-interactions

Recommended micro-interactions:
- CTA arrow shifts 2–4 px to the right on hover.
- Module row icon may tint slightly brighter on hover.
- Architecture nodes can scale from 0.96 → 1.0 when activated.
- Step numbers may fade from outlined dim to outlined neon-white mix on reveal.

Avoid:
- Elastic/spring overshoot that feels playful.
- Flashing or glitching text.
- Repeated pulsing CTAs.
- Continuous line-drawing loops.

### Reduced motion specification (in addition to DESIGN.md)

Honor `prefers-reduced-motion: reduce` with the following substitutions:
- Remove all entrance transforms; use instant or very short opacity-only appearance.
- Remove edge sweeps and ambient shimmer.
- Remove pulsing connector effects; switch directly between static states.
- Keep hover changes to colour/border only.
- Preserve state clarity with text and color changes.

### Suggested implementation approach for Codex

- Prefer CSS transitions for hover/focus/press states.
- Use lightweight intersection-observer-based reveal for section entrances.
- Use SVG path classes or data attributes for connection activation.
- Keep motion tokens centralized in one file so timing remains consistent.

Pseudo-approach:

```ts
const motion = {
  fast: 160,
  medium: 240,
  slow: 360,
  hero: 600,
  easeOut: 'cubic-bezier(.2,.8,.2,1)',
  easeEmphasized: 'cubic-bezier(.18,.85,.22,1)'
};
```

Rules:

- No looping animation of the full graph. Connection wires may pulse **once** when a selection changes.
- No scroll hijacking, forced section snapping, cursor followers, CRT flicker, or rapid glitch effect.
- Animation must not delay the primary CTA or make modules temporarily unclickable.
- Pause or fully avoid ambient animation while offscreen. SVG/CSS is preferred to a heavy WebGL canvas.
- If the hero illustration is decorative, give it `aria-hidden="true"`; provide the equivalent architectural explanation in readable page copy.

---

## 8. Landing page technical implementation

Use the existing web stack and repository conventions. The following component names are illustrative, not a mandate to create a new frontend framework or routing strategy.

### Suggested React component tree

```text
LandingPage
├── SiteHeader
│   └── MobileNavigation
├── HeroSection
│   ├── HeroCopy
│   ├── PrimaryActions
│   └── FoundationStackIllustration       (SVG, decorative)
├── ArchitectureSection
│   ├── SectionIntro
│   └── ArchitectureWorkbench
│       ├── ModuleSelector                (real catalog data)
│       ├── ArchitectureVisualization     (derived from selection)
│       ├── ProjectPreview                (derived from selection)
│       └── MobileWorkbenchSteps          (same state, alternate layout)
├── FoundationStepsSection
└── SiteFooter
```

**State model:** Lift `selectedModuleIds` into `ArchitectureWorkbench` or a shared builder store. Derive all selected integration targets and project-tree preview from the same source. Keep the diagram stateless where possible. Provide stable, typed module IDs.

**Connector rendering:** HTML/CSS for panel content; an SVG overlay for connector routes (desktop only), with paths computed from a finite, deliberate lane layout. Use named connection anchors rather than hardcoded pixel coordinates, and recompute on actual container resize. SVG curves should default to `pointer-events: none`. Avoid adding React Flow unless users really need a draggable/zoomable editor; they don't need one for this landing page.

**Design-system reuse:** Consume `DESIGN.md` tokens and existing shared `Button`, `ModuleToggleRow`, `SectionEyebrow`, `PanelFrame`, `MonospaceLabel`, and typography utilities where available. Create only missing primitives. Do not build a second design system just for the landing page.

**Project catalog integration:** Prefer one typed module manifest provided by the existing generator. If no public API exists, create a small server-owned or build-time snapshot synchronized with the generator and test that module IDs remain valid. Distinguish optional downloadable skills from runtime AI feature modules.

**Routing:** Reuse current builder paths for project metadata, bundle/module/ready-system selection, seed-data choice, and generation. The marketing workbench may select modules but should not create a parallel, inconsistent generator journey.

**Performance:**

- Inline or cache the small decorative hero SVG; optimize paths.
- Keep first-viewport HTML, fonts, and critical CSS minimal; the hero should paint independently of the interactive diagram.
- Defer noncritical workbench code/data when practical without causing layout jumps.
- Avoid full-screen videos, massive canvas/WebGL scenes, and scroll-synchronized JavaScript.
- Use properly loaded fonts and sensible fallbacks to reduce layout shift.
- Reserve panel heights or display skeletons if data is fetched asynchronously.
- Lazy-load material below the fold, but never lazy-load the primary CTA or its handler.
- Validate LCP, CLS, and INP on the live site using representative mobile hardware.

**Search and sharing metadata:** Use a precise title and description emphasizing modular full-stack application generation and structured AI-development guidance. Provide an actual Open Graph image derived from this composition. Do not stuff the meta description with framework keywords or inaccurate features. Keep the primary message understandable to someone who has never used an AI coding agent.

**Telemetry (only if already permitted and configured):** Track primary CTA activation, module selections, expanded module descriptions, and progression to the builder. Don't collect sensitive project names or user-entered business information as analytics event labels.

---

## 9. Copywriting system

The copy should read like a **technical product for business applications**, not a motivational poster.

**Preferred vocabulary:** `foundation`, `source code`, `modules`, `application architecture`, `project context`, `skills`, `developer guidance`, `integration`, `business logic`, `extend`, `configure`, `deploy`.

**Avoid:** `revolutionize`, `supercharge`, `magical`, `effortlessly`, `AI does everything`, `one-click enterprise`, `10x faster` without evidence, and generic references to `unlocking potential`.

**Lead with what the user obtains:**

- An actual application foundation.
- Selected business modules connected to the supported stack.
- Project-specific guidance/skills if included in the selected output.
- A source project they can extend with normal engineering practices.

AI here refers primarily to **AI-assisted software development using a prepared codebase and context**. AI runtime features are separate optional modules and must not be conflated with this promise.

### Proposed final copy map

| Location | Copy |
|---|---|
| Hero eyebrow | APPLICATION FOUNDATIONS FOR AI-ASSISTED DEVELOPMENT |
| Hero headline | BUILD YOUR BACKBONE. |
| Hero body | Start with a modular full-stack application, business-ready building blocks, and structured guidance for AI-assisted development. Own the architecture. Build what makes your product different. |
| Hero primary | Build your foundation |
| Hero secondary | Explore modules |
| Section 02 eyebrow | THE WORKBENCH |
| Section 02 title | SELECT MODULES. ASSEMBLE ARCHITECTURE. |
| Section 02 body | Choose the capabilities you need. See how they fit into a full-stack application. |
| Section 03 eyebrow | FROM IDEA TO IMPLEMENTATION |
| Section 03 title | FROM IDEA TO A SOLID FOUNDATION. |
| Step 01 | Choose your foundation |
| Step 02 | Equip your coding agent |
| Step 03 | Build your business logic |

Review words like `business-ready` and `own` with the product owner before launch; they are intended positioning, not evidence of specific licensing or release quality.

---

## 10. Implementation phases

**Phase A — Structural fidelity**

- Set up tokens and fonts.
- Implement semantic header, hero, section breaks, workbench skeleton, steps, footer.
- Match relative spacing and typographic hierarchy at 1440, 1024 and 390 px.
- Use a **static but accurate** architecture representation before writing animations.

**Phase B — Real interaction**

- Connect actual module catalog; implement selections and dependencies.
- Render accurate architecture highlights and honest project previews.
- Connect builder navigation and transfer supported selection state.
- Add keyboard support, live descriptions, loading/error states.

**Phase C — Visual polish**

- Build crisp hero SVG, restrained grid texture, subtle connector paths.
- Add motion with reduced-motion fallbacks.
- Test fonts, contrast, layout, performance, and browser support.
- Compare live screenshots with approved visual: preserve its composition but improve whitespace and real-world legibility.

**Phase D — Release**

- Confirm every claim, route, and module against current generator output.
- Review SEO/OG metadata and legal/footer links.
- Run responsive, keyboard, screen-reader, contrast, and Core Web Vitals checks.
- Remove illustrative UI and debug/sample-only interactions.

---

## 11. Acceptance criteria / definition of done

The page is complete only when all of the following are true:

- [ ] The hero is readable in under five seconds: what OpenKnit is, what makes it different, and what to do next.
- [ ] The first viewport is **not** a compressed version of the entire website: only hero copy, CTAs, and a restrained architectural stack are present.
- [ ] The full module → architecture → export workbench begins below the hero.
- [ ] Workbench UI references the real available module catalog and correct product architecture.
- [ ] Module toggles cause meaningful, accurate, accessible diagram changes.
- [ ] `Configure`/`Generate` never implies functionality the action doesn't perform.
- [ ] The three-step explanation follows the workbench and differentiates foundation, AI development guidance, and unique business logic.
- [ ] The page works at 320–1920 px without clipped type, unwanted horizontal overflow, or unreadable scaled diagrams.
- [ ] Keyboard access, visible focus, contrast and reduced-motion behavior have been checked.
- [ ] The site does not rely on imaginary testimonials, metrics, module features, or product screenshots.
- [ ] Any visible version, repository URL, docs URL, and generation route resolve to official live sources.
- [ ] Mobile module selection and export actions remain fully usable with no hover or diagram pan required.
- [ ] Critical first-viewport assets are optimized; the diagram does not delay basic landing-page rendering.

---

## 12. Brief for an implementation agent

> Implement the OpenKnit landing page described in `FEATURE_LANDING_PAGE.md`, using `openknit_landing_reference.png` as visual art direction and `DESIGN.md` for reusable tokens and control behavior. Preserve its three-section narrative and black/neon-green visual identity, but use the spacing, responsiveness, accessibility and product-truth rules in this specification over the density of the mockup. First inspect the existing repository, routing, module catalog and builder flow. Reuse the current stack and shared components where practical. Implement a restrained hero, one data-driven architecture workbench, and a three-step process section. Do not fabricate capabilities, use placeholder testimonials, introduce a generic AI dashboard, or create a duplicate builder. Ensure the real module registry and actual generation behavior drive visible selections and CTA labels. Test responsive widths, keyboard and reduced-motion behavior before declaring completion.

**Reference site for independent verification:** https://open-knit.com/  
**Visual reference:** `openknit_landing_reference.png` (provided alongside this feature).

---

## 13. Explicit state-to-motion implementation matrix

The page-specific choreography below **adds to** the global component/state rules in `DESIGN.md`; it does not redefine the palette.

| Trigger / state | Immediate visual feedback | Follow-on feedback | Exit / fallback |
|---|---|---|---|
| Hover/focus primary hero CTA | Neon lightens; arrow moves right 2–4 px; optional lift ≤1 px | None | Return in 160 ms; focus ring remains on keyboard focus |
| Press primary hero CTA | Fill becomes pressed neon; button returns to baseline | Existing builder navigation occurs normally | If routing fails, preserve label and show real route error |
| Hover/focus secondary CTA | Neutral border becomes subtle green; white label persists | None | Return in 160 ms |
| Initial hero entry | Eyebrow then H1 then description/CTAs reveal | Exploded stack assembles once | On reduced motion, show all immediately |
| Hover module row | Lighten border; brighten anchor node, show discoverable detail affordance | Optional detail preview if implemented | Focus/click alternative must exist |
| Select module | Check/toggle ON and row highlight immediately | Connector illuminates once, then affected targets accent, then project preview text changes | Stable selected state stays; never rely on pulse alone |
| Deselect module | Check/toggle OFF immediately | Relevant connector fades to muted; affected target loses accent only if no remaining selected module targets it | Baseline framework remains |
| Select module with dependency | Display dependency in readable text before automatic addition, or use actual builder's documented behavior | Add required module(s) and update all dependent targets | Preserve selection consistency; no silent omission |
| Select unavailable module | No state change | `Coming soon` remains visible | No fake green wire or sample export update |
| Workbench catalog loading | Static reserved-height skeleton with readable heading | Replace with real rows without layout jump | Accessible error and retry if load fails |
| Project preview update | Text changes without delay | Affected line briefly highlights; border may brighten for ≤240 ms | If preview is static, permanently label it `Example output` |
| Scroll into step section | Step 01 visible, then steps 02/03 at 60–100 ms intervals | None | Once only; no reanimation when scrolling back |
| Mobile menu opens | Modal/panel fades and slides ≤8 px | Focus moves to first actionable item if modal | ESC/selection closes and restores focus |

### 13.1 Hero timeline and layer geometry

At desktop first paint, header/nav and readable hero copy must exist in HTML even if CSS/JS animations fail. For motion-enabled users, this illustrative sequence is acceptable:

```text
t = 0 ms       Header appears normally; all layout space already reserved.
t = 80 ms      Eyebrow appears (fade + 8 px upward settle).
t = 140 ms     H1 starts its 450–600 ms reveal (fade + 12 px upward settle).
t = 240 ms     Body text begins 400–500 ms reveal.
t = 300 ms     CTA row begins 400–500 ms reveal.
t = 360 ms     SVG stack layers separate vertically by 6–12 px and settle,
               using an emphasized ease and ~700–850 ms duration.
t >= 1400 ms  Optional tiny neon edge sweep (6–9 s cycle); no constant bouncing.
```

**Hero SVG suggested groups** (positions derived from layout, not production topology): `foundation-base`, `guidance-layer`, `module-layer`, `business-logic-layer`, `grid`. Use isometric polygons with thin structural strokes and subdued dark fills. Top business-logic plate: small label; middle modular feature plate: minimal glyphs; guidance plate: slim distinct layer indicating development-time skills/docs; base: strongest architectural foundation. Neon's role is one edge and selected emphasis, not a full green translucent box on all four levels. Where angled text becomes unreadable, put labels in straight HTML annotations outside the SVG. Mark the whole graphic decorative if page prose already conveys it.

No continuous stack bobbing, rotation, mouse-parallax, or fake physics. Stop any optional sweep when the hero leaves the viewport or `document.hidden` is true (if using JS); CSS-only ambient animation can be disabled via intersection-based class and motion preference.

### 13.2 Connector behavior

Use stable SVG routes with labeled endpoints and a small number of deliberate aggregation lanes. A selected module turns on *only documented target associations* (frontend/backend/database). Multiple selected modules feeding the same target keep that target active until the last contributing module is deselected. Guidance is a separate dashed **development-time** lane when genuinely present in the selected output. An animated line should travel from the selection node toward the relevant targets once; if line drawing is too complex or impairs readability, use a 200 ms opacity change instead.

**No invented architecture:** Do not assume every module has a database schema, frontend view, or backend endpoint. The React UI should derive `architectureTargets`, dependency state, and `providesGuidance` from the canonical module definition or verified adapter; the graph is an explanation of actual assembly, not a decorative web.

### 13.3 Responsive motion behavior

On tablet, reduce path effects and keep selection/target emphasis; adapt panel transitions to vertical stacking without unnecessary animation. On mobile, **remove decorative crossing connectors** altogether: module selection updates text summary, compact stack highlights, and project preview. The same business state must drive desktop and mobile, with no separate mobile selection state.

### 13.4 Visual QA and accessibility acceptance scenarios

```gherkin
Scenario: Hero stays simple
  Given the visitor opens the public landing page on a 1440 px desktop
  Then the first screen emphasizes the H1, short body text, two CTAs,
  and one small foundation illustration, not the full workbench

Scenario: Module selection updates meaningful architecture
  Given the module catalog is loaded and an available module is unselected
  When the visitor selects it using mouse or Space key
  Then the row reports selected and relevant documented targets gain emphasis
  And the preview and accessible summary update from the same selection

Scenario: Deselecting shared target integration
  Given two selected modules affect the backend target
  When the visitor deselects one module
  Then the backend target remains active because one selected module still affects it

Scenario: Preview-only mode is honest
  Given no supported mechanism exists to transfer selected modules to the builder
  Then the landing page labels the visualization an interactive preview
  And the CTA opens the real builder without claiming to export the mock selection

Scenario: Reduced motion
  Given the visitor prefers reduced motion
  When the page loads and a module is selected
  Then content appears without movement or sweep
  And selections, target highlights, and explanations remain understandable

Scenario: Phone layout
  Given the viewport is 390 CSS px wide
  Then there is no horizontal page overflow
  And the workbench is presented as usable sequential panels with ≥44 px targets
```

---

## 14. Expected delivery from Codex

1. Brief repository audit: framework, installed styling/components, module registry/API, builder routes, and actual generated project structure.
2. Implementation plan aligned with `DESIGN.md` and this feature request; note any missing backend wiring and propose an honest preview fallback.
3. Semantic responsive page: header, sparse hero/stack, dense workbench below the fold, concise three-step section, footer.
4. Realistic module selection where supported, synchronized architecture highlights and project preview, valid existing builder routing.
5. States and motion per Section 13: normal/hover/focus/pressed/disabled/loading/error, entrance reveal, once-only connector pulse, mobile simplification, reduced motion.
6. Evidence: screenshots at 390/768/1024/1440 px, keyboard behavior, manual/automated tests, Lighthouse/Core Web Vitals if available; confirm no fabricated modules, export actions, or claims.

**Design system:** `DESIGN.md`  
**Feature:** `FEATURE_LANDING_PAGE.md`  
**Reference:** `openknit_landing_reference.png`
