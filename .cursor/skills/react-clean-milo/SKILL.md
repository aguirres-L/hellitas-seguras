---
name: react-clean-milo
description: Apply clean React/React Native patterns: separate presentational UI from logic in a hook, keep utilities pure, and enforce naming conventions (files/components in English; variables/props in Spanish; booleans isX). Use when the user explicitly asks to follow this skill or requests a React/React Native component/refactor aligned to these standards.
---

# React Clean Milo

## Intent (why)

Prefer maintainable React code by:
- Keeping **UI presentational** (easy to read/test).
- Isolating **state/side-effects** in a hook (easy to reason about).
- Keeping **utils pure** (reusable, testable).
- Enforcing naming rules to reduce ambiguity and speed up collaboration.

## When to apply

Apply only when the user explicitly requests this skill (on-command/manual invocation).

## Default structure (preferred)

Use this separation when building or refactoring React/React Native features:
- **Presentational component**: `ComponentName.tsx` (or `.jsx`)
- **Hook (logic)**: `useComponentName.ts` (or `.js`)
- **Pure utils** (optional): `component-name.utils.ts` (or `.js`)

Colocation is OK for small features:
```
Feature/
  ComponentName.tsx
  useComponentName.ts
  component-name.utils.ts
```

## Naming conventions (must)

- **Files/components**: English
  - Components: `PascalCase` (e.g. `HeaderComponent`)
  - Utils filenames: `kebab-case` (e.g. `date-format.utils.ts`)
- **Variables/props**: Spanish, `camelCase`
  - Examples: `usuarioActual`, `listaDeItems`, `mensajeDeError`
- **Booleans**: `isX`
  - Examples: `isCargando`, `isValido`, `isHabilitado`
- **Callback props**: `onX` (X in Spanish)
  - Examples: `onGuardar`, `onCerrar`, `onSeleccionarItem`

## Workflow (do this)

1. Explain the rationale briefly (why this split helps) before changing code.
2. Decide what belongs to:
   - **UI**: rendering, layout, small formatting, calling handlers.
   - **Hook**: state, derived state, side-effects, async calls, navigation, analytics.
   - **Utils**: pure transformations, formatters, validators (no React, no IO).
3. Make the presentational component receive a **view model**:
   - Data already shaped for the UI
   - Flags: `isX`
   - Handlers: `onX`
4. The hook returns `{ vm, handlers }` (or `{ ...vm, ...handlers }`) with Spanish names.

## Templates

### Hook template

```ts
export function useComponentName() {
  // state
  const [isCargando, setIsCargando] = useState(false);
  const [mensajeDeError, setMensajeDeError] = useState<string | null>(null);

  // derived data
  const isValido = mensajeDeError == null;

  // handlers
  const onGuardar = async () => {
    try {
      setIsCargando(true);
      setMensajeDeError(null);
      // ... side-effects / API calls ...
    } catch (error) {
      setMensajeDeError("No se pudo guardar.");
    } finally {
      setIsCargando(false);
    }
  };

  const vm = { isCargando, isValido, mensajeDeError };
  const handlers = { onGuardar };
  return { ...vm, ...handlers };
}
```

### Presentational component template

```tsx
type Props = {
  isCargando: boolean;
  isValido: boolean;
  mensajeDeError: string | null;
  onGuardar: () => void | Promise<void>;
};

export function ComponentName({ isCargando, isValido, mensajeDeError, onGuardar }: Props) {
  return (
    <View>
      {!!mensajeDeError && <Text>{mensajeDeError}</Text>}
      <Button disabled={!isValido || isCargando} title="Guardar" onPress={onGuardar} />
    </View>
  );
}
```

## Guardrails (avoid)

- Don’t: fetch/side-effects inside presentational components.
- Don’t: put React state in utils files.
- Don’t: mix Spanish and English for variables/props within the same feature.
- Don’t: create “mega-hooks” without clear boundaries; split by responsibility if it grows.

## Quality checklist

- [ ] UI file has mostly JSX and minimal logic
- [ ] Hook owns state/async/side-effects and returns a stable “view model”
- [ ] Utils are pure and reusable
- [ ] Naming follows: files/components English; variables/props Spanish; booleans `isX`
