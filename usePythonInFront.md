# Frontend ↔ API Python (consejos IA)

Este documento concentra lo necesario para **conectar la app (Vite/React)** al backend en `hs-back` (`main.py`), sin repetir todo el contexto de negocio. Para el mapa del flujo actual y por qué existe el API, ver `usoPython.md`.

---

## 1. Qué necesitás del lado frontend

| Necesidad | Dónde / cómo |
|-----------|----------------|
| URL base del API | Variable de entorno de Vite, p. ej. `VITE_CONSEJOS_API_URL` (sin barra final recomendado) |
| CORS | El **origen exacto** de tu app (p. ej. `http://localhost:5173` o `https://tu-dominio.com`) debe estar en `CORS_ORIGINS` del **servidor** (Render / `.env` del backend) |
| Token opcional | Si en el backend definís `CONSEJOS_API_BEARER_TOKEN`, el cliente debe enviar el mismo valor en `Authorization: Bearer …` |

**Importante:** en Vite solo las variables que empiezan con `VITE_` llegan al bundle. No pongas ahí `GEMINI_API_KEY`; esa key vive solo en el servidor.

---

## 2. Variables de entorno sugeridas (frontend)

Ejemplo en `.env` o `.env.local` del proyecto Vite:

```env
# URL del Web Service (Render) o local: http://127.0.0.1:8000
VITE_CONSEJOS_API_URL=https://tu-servicio.onrender.com

# Solo si el backend tiene CONSEJOS_API_BEARER_TOKEN configurado
# VITE_CONSEJOS_API_BEARER_TOKEN=un-secreto-compartido-largo
```

En código, la base suele leerse así:

```js
const baseUrl = (import.meta.env.VITE_CONSEJOS_API_URL || '').replace(/\/$/, '');
```

---

## 3. Endpoints

### 3.1 Salud (opcional)

- **Método / ruta:** `GET /health`
- **Respuesta:** `{ "status": "ok" }`
- Sirve para comprobar que el servicio está arriba (monitoring, smoke test).

### 3.2 Generar consejos

- **Método / ruta:** `POST /api/consejos`
- **Headers:**
  - `Content-Type: application/json`
  - Si el backend exige token: `Authorization: Bearer <mismo valor que CONSEJOS_API_BEARER_TOKEN>`

---

## 4. Body JSON (camelCase)

El servidor acepta estos campos (los nombres deben ir **en camelCase** en el JSON):

| Campo | Obligatorio | Descripción |
|--------|-------------|-------------|
| `tipoConsejo` | Sí | Id del tipo (ej. `alimentacion`, `salud`, `ejercicio`). Equivale a `tematica` en la respuesta. |
| `prompt` | Condicional | Texto final del prompt. Si lo mandás vacío pero hay `raza`, el backend arma un prompt corto por defecto. |
| `raza` | Opcional | Raza de la mascota; útil si `prompt` va vacío o para contexto en el default del servidor. |
| `userId` | Opcional | Hoy el API **no** aplica cupo mensual; lo podés enviar para logs o futura lógica en servidor. |
| `mascotaId` | Opcional | Igual que `userId`. |

**Ejemplo mínimo (prompt armado en el cliente, opción A de `usoPython.md`):**

```json
{
  "tipoConsejo": "alimentacion",
  "raza": "Labrador",
  "prompt": "…texto largo generado por promptManager / useConsejosIA…",
  "userId": "uid-opcional",
  "mascotaId": "id-mascota-opcional"
}
```

**Ejemplo con prompt vacío** (el servidor usa `raza` + `tipoConsejo` para un prompt corto):

```json
{
  "tipoConsejo": "alimentacion",
  "raza": "Labrador",
  "prompt": ""
}
```

Límite práctico: el servidor recorta el `prompt` a `MAX_PROMPT_CHARS` (por defecto 12000 caracteres).

---

## 5. Respuestas

### 5.1 Éxito (HTTP 200)

```json
{
  "consejos": "Texto o markdown con los consejos.",
  "tematica": "alimentacion",
  "fuente": "gemini",
  "fechaCreacion": "2026-04-11T12:00:00.000000+00:00"
}
```

Tu hook ya espera `consejos`, `tematica`, `fuente` y puede usar `fechaCreacion` para historial / límites locales.

### 5.2 Error “lógico” (HTTP 200, mismo patrón que `ia_no_disponible` en cliente)

Cuando falla Gemini, falta configuración, o el modelo no devuelve texto útil:

```json
{
  "consejos": "",
  "tematica": "alimentacion",
  "fuente": "ia_no_disponible",
  "error": true,
  "detalle": "mensaje corto para soporte o consola"
}
```

En el frontend conviene tratar **`fuente === 'ia_no_disponible'`** (y/o `error === true`) igual que hoy con Hugging Face/Cohere caídos: no consumir cupo si así lo definís en `aiService`.

### 5.3 HTTP 401

Si el backend tiene `CONSEJOS_API_BEARER_TOKEN` y el `Authorization` falta o no coincide:

- Cuerpo típico de FastAPI: `{"detail":"No autorizado"}`

---

## 6. Ejemplo de `fetch` desde el cliente

```js
async function llamarConsejosBackend({
  tipoConsejo,
  raza,
  prompt,
  userId,
  mascotaId,
}) {
  const base = (import.meta.env.VITE_CONSEJOS_API_URL || '').replace(/\/$/, '');
  if (!base) {
    throw new Error('Falta VITE_CONSEJOS_API_URL');
  }

  const headers = {
    'Content-Type': 'application/json',
  };
  const bearer = import.meta.env.VITE_CONSEJOS_API_BEARER_TOKEN;
  if (bearer) {
    headers.Authorization = `Bearer ${bearer}`;
  }

  const res = await fetch(`${base}/api/consejos`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      tipoConsejo,
      raza: raza ?? '',
      prompt: prompt ?? '',
      userId: userId ?? undefined,
      mascotaId: mascotaId ?? undefined,
    }),
  });

  if (res.status === 401) {
    throw new Error('Consejos API: no autorizado');
  }

  const data = await res.json();
  return data;
}
```

Podés envolver esto en una función tipo `llamarGeminiBackend` y llamarla desde `obtenerConsejosRaza` **antes** o **en lugar** de Hugging Face/Cohere, manteniendo la misma forma de objeto que ya consume `useConsejosIA`.

---

## 7. Checklist de conexión

1. Backend desplegado con `GEMINI_API_KEY` y `GEMINI_MODEL` correctos.
2. `CORS_ORIGINS` incluye el origen desde el que abrís la app (incluido `http://localhost:5173` en desarrollo).
3. Frontend: `VITE_CONSEJOS_API_URL` apunta a ese servicio (HTTPS en producción).
4. Si usás Bearer: mismo secreto en `CONSEJOS_API_BEARER_TOKEN` (servidor) y `VITE_CONSEJOS_API_BEARER_TOKEN` (cliente). Es un secreto compartido en el bundle; para máxima seguridad el paso siguiente sería **Firebase ID token** verificado en el servidor.
5. Probar `GET /health` y luego `POST /api/consejos` con un `prompt` real desde la pantalla de consejos.

---

## 8. Dónde tocar en el repo del frontend (referencia)

Según `usoPython.md`:

- `src/services/aiService.js` — función nueva o cambio en `obtenerConsejosRaza`.
- `src/hooks/useConsejosIA.js` — no debería cambiar el contrato si `aiService` devuelve el mismo shape.

---

## 9. Arranque local del backend (recordatorio)

Desde la carpeta `hs-back`:

```bash
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

En el `.env` del backend: `CORS_ORIGINS=http://localhost:5173` (o varios separados por coma).

En Render, comando típico: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
