---
name: ui-ux-playbook
description: Provide UI/UX guidance when designing screens (web or React Native). Use when the user asks to design a screen, layout, flow, or component UI; produce 2–3 alternatives (rápida/buena/pro) with suggested libraries and rationale; include a UX checklist (spacing, hierarchy, loading/empty/error states, accessibility).
---

# UI/UX Playbook (screens)

## Intent (why)

Improve speed and quality of screen design by:
- Proposing **2–3 viable options** with clear trade-offs (fast vs balanced vs premium).
- Choosing libraries intentionally (not by habit), explaining **why**.
- Ensuring the screen includes **real-world states** (loading/empty/error) and **accessibility** from the start.

## When to apply

Apply when the user is **designing screens** or asks for:
- Screen/layout proposals, IA (information architecture), flows, UI components.
- “Make it look better / more usable / more modern”.
- UX review focused on spacing, hierarchy, states, accessibility.

Assume **mixed targets (Web + React Native)** and **Tailwind-first** unless the user states otherwise.

## Output format (must)

Always answer using this structure:

### 1) Context & goals (2–5 bullets)
- User goal(s)
- Primary actions vs secondary actions
- Constraints (platforms, data, latency, auth, etc.)

### 2) 2–3 alternatives (rápida / buena / pro)
For each alternative, include:
- **Approach**: layout pattern + interaction model
- **Why**: rationale and when it’s the right choice
- **Suggested libraries**: 2–4 picks max, with “why”
- **Risks**: what can go wrong / tech debt to watch

Use these labels exactly:
- **Rápida**: ship fast, lowest complexity, acceptable UX
- **Buena**: default recommendation, balanced cost/quality
- **Pro**: best UX polish, highest effort (animations, micro-interactions, robustness)

### 3) UX checklist (paste + mark)
Copy this checklist and mark it:
- [ ] **Spacing / rhythm**: consistent scale (prefer 4/8pt), alignment, readable line-length (web), safe areas (RN)
- [ ] **Hierarchy**: clear title, sectioning, primary CTA stands out, secondary actions de-emphasized
- [ ] **Content density**: not cramped; use grouping, dividers, cards only when needed
- [ ] **States**:
  - [ ] Loading (skeleton/spinner with copy)
  - [ ] Empty (explain + next step CTA)
  - [ ] Error (actionable message + retry)
  - [ ] Disabled (explain why when relevant)
  - [ ] Offline / slow network (if applicable)
- [ ] **Forms** (if applicable):
  - [ ] Inline validation + error placement near field
  - [ ] Input types, masks, keyboard types (RN), autofill
  - [ ] Submit disabled until valid; loading on submit; prevent double-submit
- [ ] **Navigation**: back behavior, deep links (if relevant), breadcrumbs (web) / headers (RN)
- [ ] **Accessibility**:
  - [ ] Color contrast meets WCAG (web) / readable in sunlight (RN)
  - [ ] Focus states (web) and reachable controls
  - [ ] Touch targets ≥ 44px (RN) / hit area
  - [ ] Screen reader labels (aria-label / accessibilityLabel), semantics (buttons vs divs)
  - [ ] Reduced motion support for animations
- [ ] **Responsiveness**:
  - [ ] Web: mobile-first breakpoints, long text wrapping, empty space not awkward
  - [ ] RN: small/large phones, dynamic type, orientation if needed
- [ ] **Copy**: clear microcopy, consistent tone, avoids blame, localized-ready

### 4) Minimal spec (handoff)
Provide a compact spec:
- **Components** (reusable pieces)
- **Data contracts** (what the UI needs)
- **Events** (analytics/telemetry if relevant)

## Library suggestions (menu + why)

Suggest libraries only when they materially help, keep it short, and include “why”.

### Web (React)
- **Tailwind CSS**: fastest iteration, consistent spacing/typography via tokens/utilities.
- **Radix UI** (headless primitives): accessibility and behavior correctness (menus, dialogs, popovers).
- **shadcn/ui**: practical building blocks on top of Tailwind + Radix (good “Buena/Pro” speed).
- **Headless UI**: similar headless approach; good if already in ecosystem.
- **React Hook Form + Zod**: forms with predictable validation and performance.

### React Native
- **NativeWind** (Tailwind for RN): consistent styling mental model across Web/RN.
- **React Native Reanimated**: smoother animations (use for “Pro” micro-interactions).
- **@react-navigation**: standard navigation patterns, deep linking support.
- **React Native Paper** (optional): if you want a full component kit quickly; trade-off is theming constraints.

## Heuristics (defaults)

- Prefer an **8pt grid** (or 4/8 scale) for spacing tokens.
- Prefer **one primary CTA** per screen; secondary actions as text/ghost.
- Prefer **progressive disclosure**: show essentials first, expand advanced controls.
- Prefer **skeleton** when content shape is known; spinner when not.
- Errors should be **actionable**: what happened + how to fix + retry when possible.

## Examples (how the alternatives should read)

### Example: “List + search screen”

**Context & goals**
- Browse items quickly, filter by text, open details.
- Works on Web + RN; must handle slow network.

**Rápida**
- **Approach**: simple list, top search input, basic empty/error.
- **Why**: minimal components; ship in hours.
- **Suggested libraries**: Tailwind (layout tokens), React Native core components (RN).
- **Risks**: search UX may feel basic; accessibility may be overlooked if not careful.

**Buena**
- **Approach**: sticky search, filter chips, skeleton list, empty state with CTA.
- **Why**: big UX gain with small extra effort.
- **Suggested libraries**: Tailwind + (Web) Radix/shadcn for input/menu; (RN) NativeWind for consistent spacing.
- **Risks**: needs consistent tokens across platforms; watch keyboard overlap in RN.

**Pro**
- **Approach**: debounced search, animated filter panel, optimistic interactions, offline-friendly messaging.
- **Why**: polished, “fast-feeling” UI under latency.
- **Suggested libraries**: (Web) Radix/shadcn; (RN) Reanimated; shared design tokens.
- **Risks**: animation/accessibility complexity; ensure reduced motion.

## Guardrails (avoid)

- Don’t propose 6+ library options; pick a **small set** and justify.
- Don’t ignore states; every screen must specify **loading/empty/error** at minimum.
- Don’t use “pretty” at the expense of clarity: hierarchy and readability first.
