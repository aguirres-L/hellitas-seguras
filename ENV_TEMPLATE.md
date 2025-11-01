# 📝 Plantilla para archivo .env

Crea un archivo llamado `.env` en la **raíz del proyecto** con el siguiente contenido:

```env
# ============================================
# CONFIGURACIÓN DE APIs DE IA - Hugging Face
# ============================================

# Token Principal (REQUERIDO)
# Obtén tu token en: https://huggingface.co/settings/tokens
# Tipo: "Read" o "Inference"
VITE_HUGGING_FACE_TOKEN=hf_tu_token_principal_aqui

# Token Fallback 1 (OPCIONAL - Recomendado)
# Si el token principal se queda sin créditos, se usará este
VITE_HUGGING_FACE_TOKEN1=hf_tu_fallback_1_aqui

# Token Fallback 2 (OPCIONAL)
# Segundo token de respaldo adicional
VITE_HUGGING_FACE_TOKEN2=hf_tu_fallback_2_aqui

# Token Cohere (OPCIONAL - Actualmente no configurado en el código)
VITE_COHERE_API_KEY=tu_cohere_key_aqui
```

## 🔍 **Cómo obtener tus tokens de Hugging Face:**

1. Ve a: https://huggingface.co/settings/tokens
2. Haz clic en **"New token"**
3. Dale un nombre (ej: "hellitas-seguras-principal")
4. Selecciona permisos: **"Read"** o **"Inference"**
5. Copia el token (empieza con `hf_...`)
6. Pégalo en tu archivo `.env`

## ✅ **Verificación:**

Después de crear el archivo `.env`:

1. **Reinicia el servidor:**
   ```bash
   npm run dev
   ```

2. **Abre la consola del navegador** (F12) al generar consejos

3. **Busca esta sección en los logs:**
   ```
   🔍 === VERIFICACIÓN DE TOKENS ===
   📌 Token Principal (VITE_HUGGING_FACE_TOKEN):
     - Configurado: true ✅
     - Longitud: X
     - Primeros 8 chars: hf_xxxxx...
   ```

## ⚠️ **Importante:**

- El archivo `.env` está en `.gitignore` (NO se sube al repositorio)
- **NUNCA** compartas tus tokens públicamente
- Cada token tiene límite de $0.10 USD/mes en cuenta gratuita
- Si un token se agota, automáticamente intentará con los fallback

## 📊 **Estructura del archivo .env:**

```
Raíz del proyecto/
├── .env          ← Crea este archivo aquí
├── .gitignore    ← Ya ignora .env (correcto)
├── package.json
├── src/
└── ...
```

---

**Nota:** Los tokens de Hugging Face suelen tener este formato:
- `hf_XXXXXXXXXXXXXX...` (alrededor de 30-40 caracteres)

