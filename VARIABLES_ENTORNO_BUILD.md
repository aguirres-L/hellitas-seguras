# 🔐 Variables de Entorno en Build (Vite)

## ⚠️ **PROBLEMA CRÍTICO DE SEGURIDAD**

Cuando haces `npm run build` con Vite, **las variables que empiezan con `VITE_` se incrustan DIRECTAMENTE en el código JavaScript final**.

### **¿Qué significa esto?**

1. **En desarrollo:** El `.env` está solo en tu máquina → ✅ Seguro
2. **En build:** Las variables se copian al código final → ❌ **VISIBLES EN EL NAVEGADOR**

### **Ejemplo:**

Si tu `.env` tiene:
```env
VITE_HUGGING_FACE_TOKEN=hf_abc123xyz789...
```

Después del build, cualquiera puede:
1. Abrir el código fuente del sitio (F12 → Sources)
2. Buscar `hf_abc123`
3. **Encontrar tu token completo** 😱

---

## 🎯 **Cómo Funciona Vite con Variables de Entorno**

### **Durante el Build (`npm run build`):**

```bash
# Vite lee tu .env
VITE_HUGGING_FACE_TOKEN=hf_abc123...

# Y reemplaza en el código:
import.meta.env.VITE_HUGGING_FACE_TOKEN
# ↓ Se convierte en:
"hf_abc123..."
```

**El token queda hardcodeado en el bundle final** 📦

### **Dónde se guarda:**

```
dist/
  ├── assets/
  │   └── index-abc123.js  ← Aquí está tu token visible
  └── index.html
```

---

## ✅ **Soluciones para Producción**

### **Opción 1: Variables de Entorno en el Servidor (RECOMENDADO)**

**No uses `.env` en producción.** En su lugar, configura las variables en tu servidor/hosting:

#### **Vercel:**
1. Ve a Settings → Environment Variables
2. Agrega: `VITE_HUGGING_FACE_TOKEN=tu_token`
3. Haces redeploy

#### **Netlify:**
1. Site settings → Build & deploy → Environment
2. Agrega las variables
3. Redeploy

#### **Servidor propio (Node.js/Express):**
```javascript
// En tu servidor
process.env.VITE_HUGGING_FACE_TOKEN = 'tu_token';
```

---

### **Opción 2: API Proxy (MÁS SEGURO)**

Crea un endpoint en tu backend que:
1. Guarda los tokens en el servidor (nunca en el frontend)
2. El frontend llama a tu API
3. Tu API llama a Hugging Face con los tokens
4. Tu API devuelve la respuesta

**Ventaja:** Los tokens NUNCA salen del servidor ✅

```javascript
// Frontend (público)
fetch('/api/consejos-ia', {
  method: 'POST',
  body: JSON.stringify({ raza, tematica })
})

// Backend (privado - los tokens están aquí)
app.post('/api/consejos-ia', async (req, res) => {
  const token = process.env.HUGGING_FACE_TOKEN; // Seguro en servidor
  const respuesta = await llamarHuggingFace(token, req.body);
  res.json(respuesta);
});
```

---

### **Opción 3: Runtime Config (Variables en Tiempo de Ejecución)**

Usar una API que carga configuración dinámicamente:

```javascript
// Cargar config desde tu backend al iniciar la app
const config = await fetch('/api/config').then(r => r.json());
const token = config.huggingFaceToken; // Viene del servidor
```

---

## 🔍 **Verificar si tus tokens están expuestos**

Después del build:

```bash
# Buscar tokens en el bundle
grep -r "hf_" dist/

# O en Windows PowerShell:
Select-String -Path "dist/**/*.js" -Pattern "hf_"
```

Si encuentras tokens, **están expuestos públicamente** ⚠️

---

## 📋 **Recomendación para tu Proyecto**

### **Para Desarrollo:**
✅ Usa `.env` local (está en `.gitignore`)

### **Para Producción:**

#### **Si usas hosting (Vercel/Netlify):**
1. **No subas `.env` al repositorio** (ya lo tienes en `.gitignore` ✅)
2. Configura las variables en el dashboard del hosting
3. Haz build desde el hosting (no localmente)

#### **Si haces build local y subes `dist/`:**
⚠️ **PROBLEMA:** Los tokens estarán en el código

**Solución:**
- Opción A: Usa API Proxy (backend con tokens)
- Opción B: Regenera tokens después del deploy y revoca los anteriores

---

## 🛡️ **Mejores Prácticas**

1. **Nunca commitees `.env`** (ya lo tienes en `.gitignore` ✅)
2. **En producción, usa variables de entorno del servidor**
3. **Considera API Proxy para máxima seguridad**
4. **Regenera tokens periódicamente**
5. **Monitorea el uso de tus tokens** en Hugging Face Dashboard

---

## ⚡ **Quick Check**

Antes de hacer build para producción:

- [ ] ¿Tienes `.env` en `.gitignore`? ✅
- [ ] ¿Vas a usar variables del servidor/hosting? 
- [ ] ¿O vas a usar API Proxy?

**Importante:** Si solo haces build local y subes `dist/`, tus tokens estarán visibles en el código JavaScript final.

