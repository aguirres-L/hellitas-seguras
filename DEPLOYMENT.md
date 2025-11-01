# 🚀 Guía de Deployment - Huellitas Seguras

## Configuración para Hostinger

### 📋 Requisitos Previos
- Cuenta en Hostinger
- Dominio configurado: `huellitas-seguras.online`
- Node.js instalado localmente

### 🔧 Pasos para Deployment

#### 1. Preparar la aplicación
```bash
# Instalar dependencias
npm install

# Construir para producción
npm run build:prod
```

#### 2. Subir archivos a Hostinger

**IMPORTANTE:** Sube **TODO** el contenido de la carpeta `dist/` a la raíz de tu dominio.

Estructura correcta en Hostinger:
```
public_html/
├── index.html
├── .htaccess          ← ¡CRÍTICO!
├── assets/
│   ├── index-xxxxx.js
│   ├── index-xxxxx.css
│   └── vendor-xxxxx.js
└── otros archivos...
```

#### 3. Verificar configuración

**Archivo .htaccess:**
- Debe estar en la misma carpeta que `index.html`
- No debe tener extensión `.txt`
- Debe tener permisos de lectura (644)

**Permisos de archivos:**
- Archivos: 644
- Directorios: 755
- .htaccess: 644

### 🧪 Verificación Post-Deployment

#### Rutas a probar:
- ✅ `https://huellitas-seguras.online/` (página principal)
- ✅ `https://huellitas-seguras.online/login` (login)
- ✅ `https://huellitas-seguras.online/register` (registro)
- ✅ `https://huellitas-seguras.online/dashboard` (dashboard)
- ✅ `https://huellitas-seguras.online/login-profesional` (login profesional)
- ✅ `https://huellitas-seguras.online/register-profesional` (registro profesional)

### 🔍 Troubleshooting

#### Error 404 en rutas:
1. Verificar que `.htaccess` esté en la raíz
2. Verificar que no tenga extensión `.txt`
3. Contactar soporte de Hostinger si persiste

#### Error de permisos:
1. Verificar permisos de archivos (644)
2. Verificar permisos de directorios (755)

#### Problemas de caché:
1. Limpiar caché del navegador
2. Verificar configuración de caché en `.htaccess`

### 📈 Optimizaciones Aplicadas

#### Rendimiento:
- ✅ Compresión GZIP
- ✅ Caché de archivos estáticos (1 año)
- ✅ Chunking de JavaScript
- ✅ Optimización de imágenes

#### Seguridad:
- ✅ Headers de seguridad
- ✅ Content Security Policy
- ✅ Prevención de clickjacking
- ✅ Ocultar información del servidor

#### SEO:
- ✅ URLs amigables
- ✅ Configuración de MIME types
- ✅ Headers optimizados

### 🔄 Actualizaciones Futuras

Para actualizar la aplicación:

1. **Desarrollo local:**
   ```bash
   npm run build:prod
   ```

2. **Subir archivos:**
   - Reemplazar todo el contenido de `public_html/`
   - Mantener `.htaccess` en su lugar

3. **Verificar:**
   - Probar rutas principales
   - Verificar funcionalidad crítica

### 📞 Soporte

Si tienes problemas:
1. Revisar logs de error en Hostinger
2. Verificar configuración de `.htaccess`
3. Contactar soporte de Hostinger
4. Revisar esta guía de nuevo

---

**¡Tu aplicación está lista para producción! 🎉** 