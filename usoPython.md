# Consejos de IA en el proyecto: estado actual y camino hacia Python + Gemini (Render)

Este documento resume **cómo funcionan hoy** los consejos generados por IA en el frontend, qué datos entran y qué sale, y **qué implicaría** mover la generación a un servicio en **Python** que use la API de **Google Gemini**, desplegado en **Render**.

---

## 1. Para qué sirve el flujo

El usuario elige un **tipo de consejo** (alimentación, ejercicio, salud, etc.) asociado a una **mascota** con **raza** y otros datos. La app arma un **prompt de texto**, llama a un proveedor de IA y muestra el texto de respuesta. Hay **límite mensual** por usuario/mascota, **caché** en el navegador e **historial** local.

**Motivo típico de pasar a Python + Render + Gemini:** la clave de API no debería vivir en el bundle del cliente; un backend propio centraliza secretos, cuotas y posibles reglas de negocio.

---

## 2. Dónde vive la lógica en el código (mapa rápido)

| Rol | Ubicación |
|-----|-----------|
| UI (selector, estados, historial) | `src/components/ConsejosIA.jsx` |
| Hook (generar / regenerar, límites, prompt) | `src/hooks/useConsejosIA.js` |
| Servicio de IA, caché, límites, llamadas HTTP | `src/services/aiService.js` |
| Tipos de consejo para la UI | `src/config/tiposConsejos.js` |
| Prompts por tipo y nivel (funciones que reciben `mascota`) | `src/prompts/promptManager.js` y carpetas `src/prompts/<tipo>/` |
| Tokens Hugging Face / Cohere (solo lectura) | Colección Firestore `tokens-ia` vía `src/config/apiKeys.js` |
| Arranque: carga de tokens | `src/App.jsx` → `inicializarTokensDesdeFirebase()` |

---

## 3. Flujo actual (paso a paso)

1. **Arranque de la app**  
   Se llama `inicializarTokensDesdeFirebase()` para llenar un caché en memoria con los campos del primer documento de la colección `tokens-ia` (tokens de Hugging Face y Cohere).

2. **Pantalla**  
   `PetProfile.jsx` usa `useConsejosIA(raza, uid, mascotaId, mascota)` y renderiza `ConsejosIA` con callbacks `generarConsejos` / `regenerarConsejos`.

3. **Al generar** (`useConsejosIA.generarConsejos`):
   - Exige un `tipoConsejo` (string, p. ej. `alimentacion`).
   - Si hay `userId` y `mascotaId`, comprueba `aiService.verificarFrenoPeticiones` (máximo **3** generaciones exitosas por mes por par usuario+mascota, contadas desde el historial en caché).
   - Construye `promptPersonalizado` con `obtenerPromptPorDefecto(tipoConsejo, mascota)` cuando existen prompts implementados para ese tipo; si no, el flujo puede fallar en ese paso y habría que acotar en UI (hoy hay niveles para `alimentacion`, `salud`, `ejercicio`).
   - Llama `aiService.obtenerConsejosRaza(raza, false, userId, mascotaId, tipoConsejo, promptPersonalizado)`.

4. **Dentro de `obtenerConsejosRaza`** (`aiService.js`):
   - El parámetro `tipoConsejo` se usa como **tema** (`tema`) en la cadena de decisión (caché, anti-repetición de temáticas, etc.).
   - Si no se fuerza regeneración, puede devolver resultado desde **caché** (`localStorage` + `Map`, clave por usuario, mascota y raza normalizada).
   - Si corresponde llamar a la API: primero **Hugging Face** (`https://router.huggingface.co/v1/chat/completions`, varios modelos y tokens en cascada), si falla **Cohere**.
   - El texto enviado al modelo es `promptPersonalizado` si viene definido; si no, `generarPrompt(raza, tematica)` (prompt corto estilo “veterinario + tema + raza…”).
   - Antes de enviar, `sanitizarPrompt` acorta y limpia el texto (p. ej. límite de caracteres).
   - Respuesta exitosa: objeto `{ consejos, tematica, fuente }` con `fuente` `'huggingface'` o `'cohere'`, se guarda en caché y se actualiza historial.
   - Si ambas APIs fallan: `{ fuente: 'ia_no_disponible', error: true, ... }` **sin** consumir el cupo mensual.

5. **Límites**  
   `maxPeticionesPorMes = 3` en `AIService`. El conteo real usa `contarConsejosPorMes` sobre el historial derivado del caché (fechas `fechaCreacion`).

---

## 4. Contrato “lógico” entre UI y servicio de IA

Entrada efectiva hacia el generador:

- `raza` (string).
- `tipoConsejo` (id del tipo; hoy también actúa como `tematica` en la respuesta).
- `promptPersonalizado` (string largo) **o** prompt genérico generado en el cliente.
- `userId` / `mascotaId` (para límites y caché; opcional).

Salida esperada por el hook:

- `consejos`: string (markdown o texto plano mezclado).
- `tematica`, `fuente`, `fechaCreacion` (y manejo especial si `fuente === 'ia_no_disponible'`).

Cualquier backend Python debería **respetar** este contrato si querés cambiar solo la implementación del llamado a la IA y no toda la UI.

---

## 5. Proveedores y secretos hoy

- **No** se usa Gemini en el código actual.
- Tokens: **Firestore** `tokens-ia` (campos como `VITE_HUGGING_FACE_TOKEN`, `COHERE_API_KEY`, etc.). Comentarios en `apiKeys.js` indican que en producción se privilegió eso frente a `.env` en el cliente.
- Para Gemini en Render, el secreto sería **`GEMINI_API_KEY`** (o el nombre que uses) solo en variables de entorno del **servicio** en Render, no en el frontend.

---

## 6. Objetivo: API en Python (Gemini) en Render.com

### 6.1 Por qué encaja

- **Gemini** se invoca desde servidor con una sola API key.
- **Render** puede hostear un web service (FastAPI/Flask) con HTTPS y variables de entorno.
- El **frontend** pasaría a hacer `fetch` a tu URL de Render (con CORS configurado) en lugar de llamar directamente a Hugging Face/Cohere desde `aiService.js` (o un adapter nuevo que mantenga el mismo hook).

### 6.2 Esquema sugerido del servicio

1. **Stack:** Python 3.11+, framework web (FastAPI recomendado), cliente oficial `google-generativeai` o REST a `generativelanguage.googleapis.com`.
2. **Endpoint ejemplo:** `POST /api/consejos` con JSON body, por ejemplo:

   ```json
   {
     "raza": "Labrador",
     "tipoConsejo": "alimentacion",
     "prompt": "... texto completo ya armado por el cliente o mínimos campos para armarlo en servidor ...",
     "userId": "opcional",
     "mascotaId": "opcional"
   }
   ```

3. **Respuesta:** `{ "consejos": "...", "tematica": "alimentacion", "fuente": "gemini" }` alineado a lo que consume `useConsejosIA`.

4. **Seguridad mínima**
   - API key solo en Render.
   - Opcional: header `Authorization: Bearer <token_app>` compartido con el frontend (mejor que endpoint público abierto).
   - Rate limit en Render o en código (y/o reutilizar reglas de Firebase Auth verificando un ID token en el backend).

5. **CORS:** en FastAPI, `CORSMiddleware` con el origen de tu app (Vite/Netlify/etc.).

6. **Render**
   - Nuevo **Web Service**, conectar el repo o subcarpeta del API.
   - **Build:** `pip install -r requirements.txt`
   - **Start:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Variable de entorno: `GEMINI_API_KEY` y modelo elegido (p. ej. `gemini-1.5-flash`).

### 6.3 Dónde conviene generar el prompt

- **Opción A – Cliente como hoy:** el frontend sigue usando `obtenerPromptPorDefecto` y envía el string final al backend; Python solo llama a Gemini. Menos cambios en React.
- **Opción B – Servidor:** el body envía datos de `mascota` + `tipoConsejo` y Python replica la lógica de prompts (habría que portar o duplicar reglas desde `src/prompts/`). Más trabajo, pero unifica versionado de prompts.

### 6.4 Límites mensuales

Hoy el límite de **3/mes** se calcula en el cliente con datos en `localStorage`. Si movés la generación a Render:

- Para límites **confiables**, el backend debería consultar Firestore (o otra DB) por `(userId, mascotaId)` y contar generaciones del mes, **o** el cliente sigue aplicando el freno antes de llamar (menos seguro ante manipulación).

---

## 7. Cambios mínimos esperados en el frontend (cuando exista el API)

1. Añadir URL base del API (variable de entorno tipo `VITE_CONSEJOS_API_URL`).
2. En `aiService.js`, nueva función `llamarGeminiBackend(...)` con `fetch` a Render, o reemplazar el cuerpo de `llamarHuggingFace` / orden en `obtenerConsejosRaza` para priorizar tu backend.
3. Mantener `fuente: 'gemini'` (o el string que elijas) para que la UI pueda mostrar origen.
4. Opcional: dejar Hugging Face/Cohere como fallback si el servicio Python falla.

---

## 8. Referencias de archivos clave

- Entrada principal al modelo: `obtenerConsejosRaza`, `llamarHuggingFace`, `llamarCohere` en `src/services/aiService.js`.
- Construcción del prompt en el cliente: `src/hooks/useConsejosIA.js` + `src/prompts/promptManager.js`.
- Tokens: `src/config/apiKeys.js` y colección Firestore `tokens-ia`.

---

## 9. Resumen

| Aspecto | Hoy |
|--------|-----|
| Modelos | Hugging Face (router chat completions) → fallback Cohere |
| Secretos | Firestore `tokens-ia` leída en el cliente |
| Prompt | Mayormente en cliente (`promptManager` + `aiService.generarPrompt`) |
| Persistencia local | `localStorage` (caché + historial + conteo mensual) |
| Próximo paso deseado | API Python en Render con Gemini; key en servidor; `fetch` desde el mismo flujo de `useConsejosIA` / `aiService` |

Con esto tenés el contexto necesario para diseñar el microservicio en Python y acoplarlo sin reescribir toda la experiencia de usuario de consejos.
