# OpenKnit — Design System & UI Engineering Standard

**Version:** 2.0 · 28 September 2026  
**Status:** Reusable source of truth for future OpenKnit views and components  
**Applies to:** Marketing pages, product UI, the application builder, documentation-adjacent screens, and new feature views  
**Companion feature briefs:** Page-specific implementation and animation choreography belong in separate `FEATURE_*.md` files. The current landing-page brief is `FEATURE_LANDING_PAGE.md`.

---

## 1. Purpose and document boundaries

Use this file every time a designer or coding agent creates, revises, or extends an OpenKnit view or UI component. It defines the stable visual and interaction language: colors, typography, rhythm, component anatomy, states, responsiveness, accessibility, and motion defaults. It does **not** prescribe the content, data dependencies, hero composition, route names, or one-off animations of a particular feature. Those belong in that feature's brief.

**Precedence:** existing functional requirements and verified product behavior → accessibility and usability requirements → this design system → the feature brief's explicit page-level layout or motion extensions → reference images for art direction only. A feature may vary composition but must not casually redefine core tokens or controls. Document any deliberate exception in its brief.

For coding agents: inspect the repository's routing, existing components, tokens, data contracts, tests, and generator flow **before** implementing. Extend the current frontend rather than introducing a parallel component system. A design image is illustrative: never infer a backend capability, real module, file structure, release number, or CTA route from its pixels.

### 1.1 Identity

OpenKnit should look like serious engineering infrastructure for building real business applications, with prepared foundations and structured AI-development guidance. The visual metaphor is **an architect's drafting table**: components, structure, connections, and precise annotations. The aesthetic is not generic AI, cryptocurrency, a video-game HUD, or a soft pastel SaaS template.

- Near-black surfaces are the default; neon lime is a **scarce signaling color**, not a wallpaper color.
- Strong typography and disciplined whitespace are primary. Diagrams must communicate a real relationship.
- Prefer square or softly squared geometry, 1 px rules, and fine technical detail. Avoid pill-shaped everything, thick glows, bloated cards, faux glassmorphism, and decorative dashboards.
- Dense technical UI is acceptable **where interaction requires it**; avoid pushing density into introductory marketing views.
- Never fabricate logos, endorsements, numbers, performance claims, product features, or integrations.

### 1.2 When creating a new view

1. Name its audience and single primary task.
2. Establish page hierarchy: heading, explanatory text, content regions, primary action, secondary actions.
3. Use the spacing and type scales below; choose a comfortable information density.
4. Reuse existing controls. Define all states before applying polish.
5. Plan mobile behavior and keyboard flow with the desktop design, not afterward.
6. Add motion only where it conveys hierarchy, cause/effect, or feedback.
7. Verify real data, content, and navigation; include loading, empty, and failure paths.

---

## 2. Design tokens — canonical palette

Store these as CSS custom properties or map them to the project's established theming system. Refer to **semantic names**, not duplicated hex literals. No unrelated blues, purples, or rainbow gradients as decorative brand colors.

| Token | Value | Role |
|---|---|---|
| `--color-canvas` | `#090C0A` | App/site background |
| `--color-surface` | `#101510` | Cards, interactive panels, navigation |
| `--color-surface-raised` | `#171E17` | Hovered/active elevated surface |
| `--color-surface-sunken` | `#0C110D` | Code blocks, table wells, input wells |
| `--color-border` | `#303B31` | Standard structural border |
| `--color-border-subtle` | `#202920` | Dividers and inactive technical lines |
| `--color-border-strong` | `#536353` | Deliberately emphasized neutral border |
| `--color-text` | `#F5F8F3` | Primary text and headings |
| `--color-text-muted` | `#BAC5B8` | Body support, descriptions, table secondary text |
| `--color-text-dim` | `#879587` | Nonessential metadata, labels (still readable) |
| `--color-neon` | `#B8FF3B` | Main CTA, decisive selected state, active nodes |
| `--color-neon-hover` | `#CCFF74` | Filled primary button hover |
| `--color-neon-pressed` | `#9FE12A` | Pressed primary button |
| `--color-neon-dark` | `#21390E` | Subtle selected-state background |
| `--color-neon-soft` | `rgba(184,255,59,.12)` | Quiet selection fill or highlight |
| `--color-neon-line` | `rgba(184,255,59,.52)` | Selected diagram border/connector |
| `--color-focus` | `#D4FF87` | High-visibility keyboard focus ring |
| `--color-danger` | `#FF8F89` | Errors and destructive confirmations |
| `--color-warning` | `#FFD66B` | Caution and pending conditions |
| `--color-success` | `#A7FF7C` | Success indicators; distinguish with icon/text |
| `--color-overlay` | `rgba(6,9,7,.72)` | Modal overlay |

**Readability:** primary, muted, and dim text have comfortable contrast on the specified canvas and surface colors; nevertheless verify actual font sizes, composited layers, opacity, and user-defined scaling. Do not put semitransparent dim text on imagery or glowing backdrops. For filled green controls use `--color-canvas` as text color, **never white**.

**Usage budget:** On public landing views, near-black should occupy approximately 80% of a viewport; high-saturation lime roughly 5% or less. Business-product UI may have more small status signals, but avoid turning every selected card, tab, row, or icon fully neon.

### 2.1 Ready-to-use token foundation

```css
:root {
  color-scheme: dark;
  --color-canvas: #090c0a;
  --color-surface: #101510;
  --color-surface-raised: #171e17;
  --color-surface-sunken: #0c110d;
  --color-border: #303b31;
  --color-border-subtle: #202920;
  --color-border-strong: #536353;
  --color-text: #f5f8f3;
  --color-text-muted: #bac5b8;
  --color-text-dim: #879587;
  --color-neon: #b8ff3b;
  --color-neon-hover: #ccff74;
  --color-neon-pressed: #9fe12a;
  --color-neon-dark: #21390e;
  --color-neon-soft: rgba(184,255,59,.12);
  --color-neon-line: rgba(184,255,59,.52);
  --color-focus: #d4ff87;
  --color-danger: #ff8f89;
  --color-warning: #ffd66b;
  --color-success: #a7ff7c;
  --color-overlay: rgba(6,9,7,.72);

  --font-display: "Barlow Condensed", Impact, "Arial Narrow", sans-serif;
  --font-body: Inter, system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;

  --content-max: 1320px;
  --page-max: 1440px;
  --header-height: 76px;
  --page-padding: clamp(20px,4.2vw,64px);
  --section-space: clamp(80px,9vw,144px);
  --radius-control: 4px;
  --radius-panel: 8px;
  --radius-pill: 999px; /* only for compact status chips and switches */
  --stroke: 1px;
  --shadow-soft: 0 12px 34px rgba(0,0,0,.28);
  --shadow-neon: 0 0 0 1px rgba(184,255,59,.08),
                 0 0 24px rgba(184,255,59,.08);

  --ease-out: cubic-bezier(.2,.8,.2,1);
  --ease-standard: cubic-bezier(.25,.1,.25,1);
  --ease-emphasized: cubic-bezier(.18,.85,.22,1);
  --duration-instant: 80ms;
  --duration-fast: 160ms;
  --duration-medium: 240ms;
  --duration-slow: 360ms;
  --duration-entry: 600ms;
}

*:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 3px;
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
}
```

These variables represent the **dark identity**. If the product later needs a light theme, create an explicit semantic-theme mapping and test contrast; do not mix light-mode components into this palette ad hoc.

---

## 3. Typography and content hierarchy

**Family roles:** `Barlow Condensed 700–800` for large editorial/marketing display only; `Inter 400–700` for application headings, forms, controls, tables, and body text; `IBM Plex Mono 400–600` for short technical labels, code, version chips, small data readouts. Confirm font license and loading; use fallback fonts to avoid invisible text or layout jumps. Never send font binaries through handoff artifacts.

| Style | Desktop | Tablet | Phone | Line-height | Use |
|---|---:|---:|---:|---:|---|
| Display XL | `clamp(5.25rem,9vw,9rem)` | 72–112 px | `clamp(3.5rem,14vw,5.5rem)` | .86–.95 | Campaign or hero only |
| Display section | 52–72 px | 44–56 px | 36–48 px | .95–1.06 | Marketing section H2 |
| Product page title | 28–36 px | 26–32 px | 24–28 px | 1.15–1.3 | Business app H1 |
| Panel title | 18–24 px | 18–22 px | 18–20 px | 1.2–1.35 | Cards, dialogs, panels |
| Body lead | 18–21 px | 17–19 px | 16–18 px | 1.45–1.55 | Summary or introduction |
| Body regular | 16 px | 16 px | 15–16 px | 1.5 | App and marketing copy |
| Control label | 14–16 px | 14–16 px | 14–16 px | 1.25–1.4 | Navigation, buttons, fields |
| Mono micro label | 11–12 px | 11–12 px | 11–12 px | 1.4 | Decorative marker only |

Rules: body copy max line length ~65–75 characters; app explanatory copy often 50–65. Use sentence case in normal controls; use uppercase sparingly for editorial headings, category markers, and short diagram headers. Tight tracking is acceptable for display headings; never squeeze body/control text. Preserve real text under browser zoom to 200%. Do not rely on SVG text for essential information.

**Writing style:** precise and technical, but understandable to an IT buyer. Favor `application foundation`, `modules`, `source code`, `architecture`, `project context`, `skills`, `guidance`, and `business logic`. Distinguish **development-time AI guidance** from optional **AI features running inside the generated application**. Never imply an autonomous hosted agent unless present in the product.

---

## 4. Spacing, layout, elevation, and responsive behavior

Base spacing scale: **4 / 8 / 12 / 16 / 24 / 32 / 40 / 48 / 64 / 80 / 96 / 128 px**. Consistency matters more than matching an illustration pixel-for-pixel. Avoid arbitrary 19/27/43 px spacing unless required for alignment.

| Pattern | Desktop | Tablet | Phone |
|---|---|---|---|
| Page gutters | 48–64 px | 32 px | 20–24 px |
| Inter-section gap | 96–144 px | 80–112 px | 64–88 px |
| Standard card padding | 24–32 px | 20–24 px | 16–20 px |
| Related control gap | 8–16 px | 8–12 px | 8–12 px |
| Grid gap | 24–32 px | 20–24 px | 16–20 px |
| Primary control height | 48–54 px | 48–52 px | ≥48 px |
| Data/table compact row | 44–48 px | 44–48 px | Use alternate list if needed |
| Selectable module row | 56–64 px | 56–64 px | ≥56 px |

**Breakpoints (CSS px):** small phone 320–479; large phone 480–767; tablet 768–959; compact desktop 960–1199; desktop 1200–1439; wide ≥1440. Use content-driven breakpoints when necessary; do not blindly cram desktop grids onto tablets.

**Layout:** main composition max 1440 px, standard inner content max 1320 px. Marketing can use a 12-column layout and section-specific asymmetry. Product views should use stable header/sidebar/content layouts, readable table columns, predictable action alignment, and resizable main content. A promotional hero's giant heading is *not* the default product UI title.

**Surface hierarchy:** canvas → surface → raised surface; use border and spacing before shadows. Cards get 1 px standard border and radius 4–8 px. Menus and dialogs use raised surfaces, a solid enough overlay for legibility, and restrained shadows. Use shadows for actual elevation, not to make everything float. Decorative grid/dots may appear in marketing illustrations and architecture workbenches at ~8–13% opacity, **never behind dense form or table copy**.

**Responsive contracts:** At 320, 360, 390, 768, 1024, 1280, 1440, and 1920 px, check overflow, focus visibility, fixed overlays, tap targets, text wrapping, and sticky header occlusion. Mobile layouts replace overly complex visualizations with equivalent textual controls; never simply scale an entire desktop diagram until labels become microscopic.

---

## 5. Component anatomy and shared states

Build components from a small reusable primitive set (`Button`, `IconButton`, `TextField`, `Textarea`, `Select`, `Checkbox`, `Switch`, `Badge`, `Card`, `Tabs`, `Dialog`, `Tooltip`, `Popover`, `Toast`, `Skeleton`, `DataTable`, `SectionHeading`, `PanelFrame`). Reuse the repository's equivalent components where they exist. Keep visual and semantic contracts consistent instead of building a duplicate UI library.

### 5.1 Global state contract

Every interactive component must account for **default, hover, focus-visible, active/pressed, disabled**. Data-bound controls additionally need **loading, error, and success** when relevant; selectable controls need **selected/unselected**, and overlays need **open/closed**. UI should never rely on color alone to indicate state. Use icons, labels, check state, stroke change, or visible message as appropriate.

| State | Global treatment | Interaction rule |
|---|---|---|
| Default | Canvas/surface with readable text and 1 px neutral border as appropriate | Fully operable |
| Hover | Slightly raised surface or brighter border; optional 1 px lift | Never expose essential content only on hover |
| Focus-visible | 2 px `--color-focus` outline, 3 px offset | Show for keyboard/assistive focus |
| Pressed | Return any lifted element to baseline; use pressed green only on filled CTA | Immediate feedback, no delayed action |
| Selected | Small neon accent + check/toggle position + selected label or `aria-checked` | Distinguishable in grayscale |
| Disabled | Readable label; subdued contrast; no hover animation | Actual disabled semantics, reason when useful |
| Loading | Stable control size and progress text/spinner/skeleton | Prevent duplicate submit; preserve context |
| Error | Small danger icon and associated text, not just red border | Explain correction and preserve input |
| Success | Discrete icon/text/status chip | Announce completion when needed |

**Exact component styling:**

| Component | Default | Hover | Focus / pressed | Disabled / other |
|---|---|---|---|---|
| Primary button | Neon fill, canvas text, 4 px corners, ≥48 px tall, 18–24 px horizontal padding | Hover neon; lift ≤1 px; arrow may travel 2 px | Focus ring; press uses `--color-neon-pressed`, baseline position | 40–55% opacity, no hover/lift; loading spinner preserves width |
| Secondary button | Transparent/surface fill, white text, 1 px `--color-border` | Border to `--color-neon-line`, slight raised background | Focus ring; press darkens subtly | Muted but legible; do not falsely imply navigation |
| Text button / link | Underlined or clear affordance, readable muted/white | White or neon + more prominent underline | Focus ring/underline; press no bounce | Show reason if disabled rather than dead-looking link |
| Icon button | 40–44 px hitbox, outlined icon 18–20 px | Icon/accent increases, optional neutral border | Entire hitbox gets focus ring | Accessible name always required |
| Text input / textarea | Sunken surface, 1 px border, white input and muted placeholder | Border strong-neutral | Neon/focus outline, **not just** green border | Disabled muted; error message below and `aria-describedby` |
| Checkbox / switch | Neutral track/border, visible off state | Subtle surface highlight | Neon on state, clear focus outline | Native/ARIA checked semantics; labels clickable |
| Select / dropdown | Same shell as input, visible chevron | Strong-neutral border | Focus ring, keyboard options | Clear selected value and invalid state |
| Tabs | Neutral text and quiet bottom border | White text | Active has green indicator and accessible `aria-selected` | Do not hide inactive panel from keyboard poorly |
| Card / panel | Surface + standard border, 4–8 px radius | Raise only if clickable | If clickable, card focus ring and semantic button/link | Static cards must not pretend to be interactive |
| Badge / status chip | Low-contrast solid dark tint, border, readable label | Usually none | Not focusable unless interactive | Status never color-only |
| Tooltip / popover | Raised surface, border, max readable width | Trigger only | ESC closes, keyboard access | Do not put essential info in hover-only tooltip |
| Dialog | Raised surface + `--color-overlay`; strong title/actions | N/A | Focus inside, ESC close if safe, focus restore | Confirm destructive actions explicitly |
| Toast / alert | Small icon + concise message + role as appropriate | Pause dismissal on hover only if timeout exists | Announce without stealing focus | Errors may need persistent inline detail |

**Selection controls:** `checked`/`selected` and underlying business state must agree. Never update decorative connector lines without updating the selected modules that cause them. Avoid automatically submitting on selection unless a feature explicitly requires it.

### 5.2 Forms and validation

- Above-field label, optional helper below; never use placeholder as the only label.
- Group related settings in clearly titled panels. Preserve entered data across validation failures.
- Show required/optional status consistently. Inline errors beside relevant fields; summary errors for failed cross-field validation or form submission.
- Validation timing: on submit for required fields; on blur for already touched fields; avoid error storms while a person types.
- Async actions: keep button width stable with a spinner and specific loading copy; provide success or actionable error after completion.

### 5.3 Tables, lists, cards, and content density

- Tables: 44–52 px default rows, optional deliberate compact mode. Clear headers, subtle horizontal separators, selected-row highlight no thicker than 1 px. Left align text; right align numeric values with tabular figures; keep units visible.
- Empty state: say what is missing and give one relevant action. Avoid decorative AI graphics.
- Loading state: reserve expected height to avoid content shift. Use simple skeletons only for data-bound areas, not entire pages.
- Mobile: hide truly optional columns or replace tables with accessible stacked cards. Do not make key actions reachable only through sideways scrolling.
- Cards: use spacing and title hierarchy before outlining every subregion. One primary action per card where possible.

### 5.4 Navigation and overlays

- Site header: wordmark left, small number of links, clear optional CTA; approximately 72–80 px tall.
- Product app: existing navigation hierarchy takes precedence; do not copy marketing's top nav into authenticated product views.
- Desktop hover: text white or subtle neon underline. Active route: underline + accessible current-page semantics. Focus: visible ring.
- Mobile menu: accessible labeled button; close on route change and ESC; if modal, trap focus while open and restore focus to opener afterward.
- Sticky elements: maintain contrast and do not cover scroll targets; use `scroll-margin-top` on anchored sections.

---

## 6. Graphics, diagrams, icons, and asset discipline

Choose one outline icon family (e.g., Lucide) with consistent 1.5–1.75 px strokes and 18–24 px sizes. Avoid mixed line weights, emoji, stock illustrations, and extraneous 3D scenes. SVG is the default for brand ornaments, architectural diagrams, and crisp lines; keep meaningful labels as HTML if feasible.

**Diagram legend:** 1.5 px muted gray = fixed architecture; 1.5–2 px green = selected, **real** integration; bright small node = connected anchor; dashed muted green = development-time documentation/skills relationship, not runtime traffic; subdued branch = unselected option. Keep crossovers low and provide text summaries. If an architecture is only conceptual, label it `Illustrative architecture` or `Example output`.

**Illustrations:** low-opacity technical grid behind artwork, neon edges on selected layer only, no continuous visual noise behind text. Avoid unlabeled glowing spheres, gratuitous polygons, and meaningless code streams. Where SVG is decorative, mark it `aria-hidden="true"` and give its meaning in page text.

**Images and product screenshots:** use real application states or clear illustrative artwork. If screenshots depend on internal/production data, use safe fixtures. Never embed fake metrics or fabricated partners.

---

## 7. Motion system — reusable defaults

Motion is a design tool for hierarchy and causality, not a visual theme. Feature briefs may define **what** moves for a specific interaction; all should use these timing and accessibility defaults.

| Motion | Timing | Easing | Limit |
|---|---:|---|---|
| Hover, focus, button press | 120–180 ms | `--ease-out` | Lift 1–2 px, no layout reflow |
| Selection / toggles / tabs | 160–240 ms | `--ease-standard` | Immediate visible state change |
| Panel/disclosure/menu enter | 180–260 ms | `--ease-out` | Translate ≤8 px + opacity |
| Detail/card swap | ≤240 ms | `--ease-out` | Preserve geometry; no full-panel reset |
| Section reveal (marketing only) | 280–450 ms | `--ease-out` | Fade + ≤16 px translate; once |
| Large illustrative entrance | 600–900 ms | `--ease-emphasized` | One assembly/settle, not repeated |
| Ambient decorative highlight | ≥6 s if used | Linear / subtle | Only one quiet effect per view region |

**Rules:** no scroll hijack or mandatory scroll snapping; no spring overshoot, repetitive pulsing CTAs, random particles, CRT glitches, full-graph loops, or cursor followers. Hover animation must not move content in a way that changes hit targets. Animate opacity/transform and SVG stroke/opacity instead of layout dimensions whenever possible. Stop or pause ambient effects offscreen and while the document is hidden. Feature code should not introduce WebGL for a graphic achievable in SVG/CSS.

**Reduced motion:** respect `prefers-reduced-motion: reduce` globally. Present all content immediately, remove ambient effects, replace connector pulses with instantaneous static highlights, and use border/text change rather than displacement. If a feature uses interaction animation to signal change, its **static selected state** and textual summary must remain sufficient without animation.

**Motion ownership:** centralized CSS variables or existing motion primitives own timings. Do not scatter ad hoc `transition: all 500ms` through components. Every custom keyframe has a clear trigger, end state, cancellation/offscreen behavior, and reduced-motion fallback.

---

## 8. Accessibility and interaction quality

Target WCAG 2.2 AA where applicable. This section applies to *all* views, including marketing graphics that contain interactive controls.

- Semantic landmarks and proper H1/H2/H3 hierarchy. Buttons perform actions; links navigate; toggles are native inputs or faithful ARIA controls.
- Visible keyboard focus; complete tab order, ESC behavior, focus restoration after popovers/dialogs, and no keyboard traps outside intentional modal dialogs.
- 44 × 44 px target size preferred, especially mobile. Never render essential interactive controls with 10 px text.
- Contrast: target ≥4.5:1 for normal text and ≥3:1 for large text/non-text interface boundaries. Test on the actual rendered background, including transparency and hover states.
- State is conveyed by shape/icon/label and programmatic semantics as well as color. Selected modules need a readable checked state and accessible name.
- Inline form validation associated with inputs; loading/error/success feedback announced via appropriate live regions when necessary.
- Decorational SVG connections are not the only way to understand a system: supply readable list/summary equivalents.
- Avoid unexpected focus movement or auto-navigation on selection. Sticky navigation must not hide anchor headings.
- Respect browser zoom, user font scaling, high-contrast/forced-colors behavior, and reduced motion.

---

## 9. Engineering conventions for future work

**Use existing architecture.** Prefer the installed React styling/routing/component conventions. A design-system brief is not permission to replace the frontend stack or rewrite the builder. Keep design tokens centralized; component implementations should consume tokens and documented variants.

**Suggested contracts:** `variant`, `size`, `disabled`, `loading`, `iconStart`/`iconEnd` for Button; `checked`, `onCheckedChange`, `disabled`, `description` for Switch; `label`, `help`, `error`, `required` for fields; `selected`, `active`, `available` for module rows. Match existing library APIs when they differ.

**Separation of state:** UI state belongs to owner container/store; child components render props and emit actions. Shared catalog selection must derive diagram accents, module detail text, and export preview from the same state source. A diagram should not invent its own module selection copy.

**Performance:** use SVG/CSS for diagram art; avoid heavy client-only animation for the first viewport; reserve asynchronous panel heights to avoid layout shift; load fonts correctly and keep first render useful without JS-dependent flourish. Test representative mobile devices and monitor LCP, CLS, and INP.

**Content truth:** a UI sample is not a product specification. Source catalog data, module availability, valid routes, version number, legal/source-code claims, and generated project structure from the actual repository/API. Label stubs, examples, and unavailable features honestly.

**Design review artifacts for a new feature:** at least desktop, tablet, and phone screenshots or previews; component state examples; hover/focus evidence; loading, empty, error, disabled states; reduced-motion behavior; and a short list of justified exceptions to this system.

---

## 10. Reusable review checklist

- [ ] Uses the established palette and semantic variables; no stray component-specific accent colors.
- [ ] Uses consistent type roles, line height, alignment, spacing, radii, and icon stroke.
- [ ] Primary action is identifiable and does not compete with multiple neon buttons.
- [ ] Every interactive component has default, hover, focus-visible, pressed, and disabled states; relevant async/selection states exist.
- [ ] Copy and diagram claims correspond to real features or are explicitly labeled illustrative.
- [ ] Layout handles 320/360/390/768/1024/1280/1440/1920 px without accidental overflow.
- [ ] Essential mobile content and actions work without hover or giant horizontal visualizations.
- [ ] Keyboard, focus, error semantics, text contrast, reduced-motion behavior, and zoom have been checked.
- [ ] Animation explains state change and is not required to understand or operate the UI.
- [ ] Reuses existing components and data contracts; design system and feature brief remain in agreement.

**For the currently approved public landing page, continue with `FEATURE_LANDING_PAGE.md`; do not treat this global file as the page's wireframe or animation storyboard.**
