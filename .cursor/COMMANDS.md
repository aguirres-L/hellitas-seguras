## Comandos de chat (Cursor)

Este proyecto usa **Commands** para invocar “modos de trabajo” sin tener que reescribir prompts largos.

> Nota: los Commands pueden ser **User Commands** (globales, viven en `~/.cursor/commands/`) o **Project Commands** (viven en este repo).  
> Este documento describe el comportamiento esperado; si tus commands son “User”, este repo no los versiona.

---

### `/ui` — UI/UX Advisor

- **Para qué**: diseñar pantallas/components y mejorar UI/UX (Web o React Native).
- **Cómo trabaja**: hace 1–3 preguntas mínimas y luego responde siguiendo la skill `ui-ux-playbook`.
- **Qué devuelve**:
  - 2–3 alternativas (**Rápida / Buena / Pro**) con trade-offs
  - sugerencias de librerías (pocas y justificadas)
  - checklist UX (loading/empty/error + accesibilidad)

**Uso recomendado**
- Escribí: `/ui`
- Adjuntá contexto con `@...` (archivo o carpeta relevante).
- Contestá las preguntas mínimas y avanzá.

---

### `/review` — Code Reviewer

- **Para qué**: revisar cambios de código con foco en calidad y deuda técnica.
- **Cómo trabaja**: responde según la skill `code-review-playbook`.
- **Formato de salida**:
  - 🔴 crítico (bloquea merge)
  - 🟡 sugerencia (mejora recomendada)
  - 🟢 opcional (nice to have)
  - mini **test plan** al final

**Uso recomendado**
- Escribí: `/review`
- Adjuntá archivos con `@...` (o pegá el diff relevante).
- Decí el objetivo del cambio en 1–2 líneas.

---

### `/arch` — Architecture Mentor

- **Para qué**: tomar decisiones de arquitectura antes de implementar (incluye “arquitectura de hooks”).
- **Cómo trabaja**:
  - hace 1–3 preguntas mínimas
  - propone 2 opciones con trade-offs
  - recomienda una opción y da checklist de implementación

**Uso recomendado**
- Escribí: `/arch`
- Adjuntá contexto con `@...` (carpeta de la feature o archivos clave).
- Aclarar restricciones: tiempo, escalabilidad, testing, performance.

---

## Tips para ahorrar tokens (importante)

- Adjuntá solo lo necesario con `@archivo` o `@carpeta` (evitá “todo el repo”).
- Pedí “1–3 preguntas mínimas” (ya está en tus commands).
- Si solo querés una decisión, pedí “respuesta corta + checklist”.

