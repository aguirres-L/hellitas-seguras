# 🔄 Flujo Completo de Generación de Consejos de IA

Este documento explica paso a paso cómo funciona el sistema de generación de consejos de IA y cómo diagnosticar problemas.

## 📋 **Flujo General**

```
Usuario hace clic en "Generar Consejos"
    ↓
1. Validación de datos (raza, tipo de consejo)
    ↓
2. Verificación de caché local (¿ya existe?)
    ↓
3. Verificación de límites mensuales (¿tiene créditos disponibles?)
    ↓
4. Generación de prompt optimizado
    ↓
5. Llamada a Hugging Face API
    ├─→ ✅ Éxito → Guardar en caché → Mostrar consejos
    └─→ ❌ Falla → Intentar Cohere API
         ├─→ ✅ Éxito → Guardar en caché → Mostrar consejos
         └─→ ❌ Falla → Mostrar "IA temporalmente no disponible"
```

---

## 🔍 **Componentes del Sistema**

### **1. Hook: `useConsejosIA`** (`src/hooks/useConsejosIA.js`)

**Responsabilidad:** Manejar el estado y la lógica de UI relacionada con consejos.

**Flujo:**
1. **Usuario hace clic en "Generar Consejos"** → Llama a `generarConsejos(tipoConsejo)`
2. **Validaciones:**
   - ¿Hay raza? → Si no, return
   - ¿Hay tipo de consejo seleccionado? → Si no, mostrar error
   - ¿Usuario tiene créditos disponibles? → Si no, mostrar error
3. **Generar prompt personalizado** (si hay datos de mascota)
4. **Llamar a `aiService.obtenerConsejosRaza()`**
5. **Manejar respuesta:**
   - Si `fuente === 'ia_no_disponible'` → No consumir crédito, mostrar mensaje
   - Si éxito → Actualizar estado, guardar en caché, mostrar consejos
   - Si error → Mostrar consejos predefinidos como fallback

```javascript
// Línea 89: Llamada principal
const resultado = await aiService.obtenerConsejosRaza(
  raza, 
  false,           // forzarRegeneracion
  userId, 
  mascotaId, 
  tipoSeleccionado, 
  promptPersonalizado
);
```

---

### **2. Servicio: `AIService`** (`src/services/aiService.js`)

#### **A. Método: `obtenerConsejosRaza()`** (línea 708)

**Flujo paso a paso:**

```javascript
1. Verificar caché local (si no se fuerza regeneración)
   └─→ Si existe y es válido → Retornar consejo del caché

2. Verificar si ya existe un consejo con esta temática
   └─→ Si existe → Generar nueva temática automáticamente

3. Verificar límite mensual (3 consejos/mes)
   └─→ Si se alcanzó → Lanzar error

4. Intentar Hugging Face (línea 745)
   ├─→ ✅ Éxito → Guardar en caché, registrar petición, retornar
   └─→ ❌ Falla → Continuar a Cohere

5. Intentar Cohere (línea 756) - Solo si Hugging Face falla
   ├─→ ✅ Éxito → Guardar en caché, registrar petición, retornar
   └─→ ❌ Falla → Retornar mensaje "IA no disponible"
```

#### **B. Método: `llamarHuggingFace()`** (línea 504)

**Responsabilidad:** Intentar múltiples modelos de Hugging Face en orden de costo (baratos primero).

**Flujo:**
1. **Validar tokens:** Verificar que haya al menos 1 token configurado
2. **Generar prompt optimizado:** Usar prompt personalizado o generar uno nuevo
3. **Intentar modelos en fases:**
   - **Fase 1:** Modelos baratos (distilgpt2, gpt2, DialoGPT-small, gpt-neo-125M)
   - **Fase 2:** Modelos medianos (blenderbot-400M, DialoGPT-medium)
   - **Fase 3:** Modelos grandes (solo si es necesario)
4. **Para cada modelo:**
   - Intentar con todos los tokens disponibles
   - Si éxito → Retornar respuesta procesada
   - Si falla → Continuar con siguiente modelo

#### **C. Método: `intentarModelo()`** (línea 618)

**Responsabilidad:** Hacer una petición HTTP a un modelo específico de Hugging Face.

**Parámetros de la petición:**
```javascript
{
  inputs: promptLimpio,           // Prompt optimizado (60-80 palabras)
  parameters: {
    max_new_tokens: 150,          // Tokens a generar (reducido para ahorrar)
    temperature: 0.8,             // Creatividad
    do_sample: true,              // Sampling estocástico
    return_full_text: false       // No devolver el prompt original
  },
  options: {
    wait_for_model: false,       // NO esperar si modelo no está cargado (ahorra créditos)
    use_cache: true               // Usar caché cuando está disponible
  }
}
```

**Manejo de errores:**
- **200 OK:** ✅ Procesar respuesta y retornar
- **404:** Modelo no existe → Continuar
- **401/403:** Token inválido → Continuar con siguiente token
- **503:** Modelo cargando → NO esperar, continuar
- **429:** Rate limit → Continuar
- **Otros:** Registrar error y continuar

---

## 🚨 **Problema: "Servicio de IA temporalmente no disponible"**

Este mensaje aparece cuando **TODAS** las APIs fallan. Posibles causas:

### **1. Tokens no configurados** ❌

**Síntoma:** Error en consola: `"Ningún token de Hugging Face configurado"`

**Solución:**
1. Verificar que existe archivo `.env` en la raíz del proyecto
2. Agregar tokens:
```env
VITE_HUGGING_FACE_TOKEN=tu_token_aqui
VITE_HUGGING_FACE_TOKEN1=token_fallback_1
VITE_HUGGING_FACE_TOKEN2=token_fallback_2
```
3. Reiniciar servidor de desarrollo (`npm run dev`)

**Validación:**
```javascript
// En consola del navegador:
console.log(import.meta.env.VITE_HUGGING_FACE_TOKEN); 
// Debe mostrar tu token (no undefined ni vacío)
```

---

### **2. Todos los modelos fallan (503, 404, etc.)** ⚠️

**Síntoma:** En consola ves: `"Todos los modelos de Hugging Face fallaron"`

**Causas comunes:**
- **503 Service Unavailable:** Modelos no están cargados en servidores de Hugging Face
- **404 Not Found:** Modelo no existe o fue eliminado
- **401/403 Unauthorized:** Token inválido o sin permisos
- **429 Too Many Requests:** Rate limit alcanzado

**Diagnóstico:**
1. Abre la consola del navegador (F12)
2. Busca la sección `"❌ === RESUMEN DE ERRORES ==="`
3. Revisa qué modelos fallaron y con qué código de error

**Ejemplo de output:**
```
❌ === RESUMEN DE ERRORES ===
Total de intentos fallidos: 12
1. distilgpt2 (token 1): 503 - Model is currently loading
2. gpt2 (token 1): 503 - Model is currently loading
...
```

**Soluciones:**
- Si todos son **503:** Esperar unos minutos e intentar de nuevo (modelos se están cargando)
- Si todos son **401/403:** Verificar que tus tokens sean válidos
- Si todos son **404:** Algunos modelos pueden haber sido eliminados, actualizar lista

---

### **3. Error de red** 🌐

**Síntoma:** En consola ves: `"Error de red con modelo X"`

**Causas:**
- Sin conexión a internet
- Bloqueo por firewall/proxy
- CORS (si estás en desarrollo local sin proxy)

**Solución:**
- Verificar conexión a internet
- Probar en otro navegador/red
- Verificar configuración de proxy/CORS

---

### **4. Prompt mal formateado** 📝

**Síntoma:** API responde pero con error de formato

**Diagnóstico:**
En consola busca: `"📝 Prompt generado (limpio):"`
- Debe tener entre 50-150 caracteres
- No debe tener caracteres raros
- Debe estar en español

---

## 🔧 **Herramientas de Diagnóstico**

### **1. Verificar configuración de tokens:**

```javascript
// En consola del navegador:
import { verificarConfiguracionAPIs } from './config/apiKeys';
verificarConfiguracionAPIs();
```

**Output esperado:**
```
Configuración de APIs: {
  huggingFace: true,
  huggingFaceFallback: true,
  huggingFaceFallback2: false,
  cohere: false
}
```

---

### **2. Test de APIs (solo en desarrollo):**

Si estás en modo desarrollo, verás un botón **"Test APIs"** en el componente.

Al hacer clic:
- Intenta múltiples modelos
- Muestra qué modelos funcionan
- Muestra qué tokens funcionan

---

### **3. Logs detallados:**

Al intentar generar consejos, revisa la consola. Verás:

```
🔍 === DEBUG HUGGING FACE ===
Raza: golden retriever
Temática: Cuidados en verano
📋 Configuración de APIs: {...}
🔑 Tokens disponibles: 2
📝 Prompt generado (limpio): "Veterinario. Cuidados en verano..."
🔄 Intentando con modelo: distilgpt2 (token 1)
```

Si algo falla, verás:
```
❌ === RESUMEN DE ERRORES ===
Total de intentos fallidos: X
1. modelo (token 1): status - mensaje
...
```

---

## ✅ **Checklist de Diagnóstico**

Cuando veas "Servicio de IA temporalmente no disponible":

- [ ] **¿Hay tokens configurados?** → Revisar `.env` y consola
- [ ] **¿Los tokens son válidos?** → Verificar en Hugging Face Dashboard
- [ ] **¿Hay errores en consola?** → Revisar sección "RESUMEN DE ERRORES"
- [ ] **¿Qué códigos de error aparecen?** → 503 (esperar), 401/403 (tokens), 404 (modelos)
- [ ] **¿Hay conexión a internet?** → Probar en otro navegador/red
- [ ] **¿Estás en desarrollo?** → Usar botón "Test APIs" para diagnóstico

---

## 📊 **Ejemplo de Flujo Exitoso**

```
1. Usuario selecciona tipo "Alimentación" y hace clic en "Generar Consejos"
   ↓
2. Hook valida: raza ✓, tipoConsejo ✓, créditos disponibles ✓
   ↓
3. Hook genera prompt personalizado (si hay datos de mascota)
   ↓
4. Service verifica caché → No existe
   ↓
5. Service verifica límites → Tiene 2 créditos disponibles
   ↓
6. Service llama a Hugging Face:
   - Intenta distilgpt2 → 503 (cargando)
   - Intenta gpt2 → ✅ Éxito (200 OK)
   ↓
7. Service procesa respuesta → Guarda en caché → Registra petición
   ↓
8. Hook actualiza estado → Muestra consejos en UI
```

---

## 🎯 **Próximos Pasos**

Si después de revisar esto sigues teniendo problemas:

1. **Comparte los logs de consola** (especialmente la sección "RESUMEN DE ERRORES")
2. **Verifica que tus tokens funcionan** en el dashboard de Hugging Face
3. **Prueba el botón "Test APIs"** si estás en desarrollo
4. **Revisa si hay problemas conocidos** en el estado de Hugging Face

---

*Última actualización: Después de optimización de prompts y mejoras en diagnóstico*
