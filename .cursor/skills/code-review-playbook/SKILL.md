---
name: code-review-playbook
description: Review code changes using a severity rubric (🔴 must / 🟡 should / 🟢 nice) across correctness, edge cases, naming, performance, basic security, and developer experience (DX). Use when the user asks for a code review, PR review, or says "review" / "revisar" / "code review".
---

# Code Review Playbook

## Intent (por qué)

Un buen code review reduce bugs y retrabajo, mejora seguridad básica, y aumenta mantenibilidad sin frenar el delivery. Este playbook estandariza **qué mirar** y **cómo comunicarlo**, con criticidad clara.

## When to apply

Aplicar cuando el usuario pida review (PR/code review/revisar cambios) o comparta diffs/archivos para revisar.

## Output format (plantilla)

Entregar el review en este formato:

```markdown
## Summary
- [1–3 bullets] Qué cambia y evaluación general.

## Must fix 🔴
- **[Archivo/área]**: Hallazgo.
  - **Por qué importa**: riesgo/impacto.
  - **Recomendación**: acción concreta.
  - **Sugerencia (opcional)**: snippet/patch pequeño o enfoque.

## Should improve 🟡
- ...

## Nice to have 🟢
- ...

## Edge cases & tests
- Casos borde relevantes (lista corta).
- Qué tests faltan / cómo validarlo.

## Security & reliability quick-check
- 2–6 bullets (según aplique).

## Questions (si falta contexto)
- Hasta 3 preguntas puntuales para destrabar.
```

## Severity rubric

- 🔴 **must**: rompe correctness, seguridad básica, data loss, crashes, regressions probables, compliance/PII, o deuda que bloqueará mantenimiento inmediato.
- 🟡 **should**: mejora robustez, legibilidad, consistencia, o reduce riesgo; no necesariamente bloquea merge si hay urgencia, pero se recomienda resolver.
- 🟢 **nice**: mejoras opcionales (refactor, micro-optimización, naming “más lindo”), sin impacto fuerte.

## Review checklist (en orden)

### 1) Correctness

- ¿Hace exactamente lo que promete el cambio? (semántica, requirements implícitos, invariantes)
- ¿Errores de lógica, null/undefined, conversiones, tipos, condiciones invertidas, off-by-one?
- ¿Manejo de errores explícito? ¿Se propagan/registran/transforman correctamente?
- ¿Cambios en contratos públicos (API, props, interfaces) rompen compatibilidad?

### 2) Edge cases

- Inputs vacíos, extremos, inválidos, duplicados.
- Concurrencia/race conditions (async, retries, múltiples clicks, doble submit).
- Timezones/fechas, locales, red lenta, timeouts.
- Idempotencia (reintentos) y consistencia de estado.

### 3) Naming & readability

- Nombres precisos y consistentes con el dominio.
- Funciones/componentes con una responsabilidad clara.
- Evitar ambigüedad (p.ej. `data`, `info`, `handler` genéricos).
- Comentarios solo cuando agregan intención (no repetir lo obvio).

### 4) Performance (sin micro-optimizar de más)

- Complejidad accidental (\(O(n^2)\) donde no hace falta), loops anidados, copias innecesarias.
- N+1 (DB/API), over-fetching, renders excesivos, memoización mal aplicada.
- Caching, paginación, debouncing/throttling donde corresponde.
- “Hot paths”: parsing, mapping grande, queries, rendering listas.

### 5) Seguridad básica

- Inputs: validación/sanitización donde aplique (SQL/NoSQL injection, command injection, XSS).
- AuthZ/AuthN: ¿se verifica permiso en el lugar correcto? (server-side primero)
- Secrets/PII: no loguear tokens, passwords, emails completos; evitar subir keys.
- Dependencias: evitar libs dudosas, revisar uso de `eval`, `dangerouslySetInnerHTML`, deserialización insegura.

### 6) DX (Developer Experience)

- Errores: mensajes accionables, logs útiles (sin filtrar PII), códigos/keys consistentes.
- Observabilidad: métricas/tracing cuando aplique, no silenciar errores.
- Testing: tests claros, fáciles de mantener, cubren el “por qué”.
- APIs internas: ergonomía, defaults seguros, docs mínimo si es necesario.

## Comment style (cómo escribir el feedback)

- Ser específico: describir **qué** está mal, **por qué** importa, y **qué** harías.
- Evitar “opiniones” sin criterio: si es estilo, justificar con consistencia/mantenibilidad.
- Preferir sugerencias pequeñas y accionables; si es grande, proponer un plan.
- Si falta contexto, preguntar (máximo 3 preguntas) en vez de asumir.

## Quick heuristics (atajos útiles)

- “¿Qué puede salir mal?” → lista 3 fallas probables (inputs, red, permisos).
- “¿Qué rompe a futuro?” → detectar contratos públicos y acoplamientos.
- “¿Cómo lo probaría?” → proponer test plan mínimo (unit/integration/e2e según el cambio).

