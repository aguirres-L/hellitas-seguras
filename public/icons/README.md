# Íconos PWA

Esta carpeta contiene los íconos que la PWA necesita para instalarse en mobile, tablet y desktop.

## Archivos requeridos

| Archivo | Tamaño | Propósito |
| --- | --- | --- |
| `icon-192.png` | 192×192 | Ícono base (Android, Chromium). |
| `icon-512.png` | 512×512 | Ícono grande (splash en Android). |
| `icon-512-maskable.png` | 512×512 | Ícono **maskable**: el sistema lo recorta en círculo/squircle. Dejá ~20% de margen alrededor del logo. |
| `apple-touch-icon.png` | 180×180 | Ícono al "Agregar a inicio" en iOS. |

> El `theme_color` configurado es `#f97316` (naranja de la marca). Si más adelante cambia el branding, sincronizar también `index.html`, `vite.config.js` (`theme_color`) y este README.

## Cómo generarlos rápido

### Opción A — Generador online (lo más simple)

1. Entrá a [https://realfavicongenerator.net](https://realfavicongenerator.net) o [https://www.pwabuilder.com/imageGenerator](https://www.pwabuilder.com/imageGenerator).
2. Subí un PNG cuadrado del logo de Huellitas (mínimo 512×512, ideal con fondo limpio o transparente).
3. Descargá el set y copiá los archivos a esta carpeta con los nombres de la tabla de arriba.

### Opción B — Manual con tu logo `milo2modelo (1).png`

Hoy el logo vive en `public/milo2modelo (1).png` (con espacios en el nombre, lo cual no es ideal).

Pasos sugeridos:

1. Renombrar / copiar a `public/milo-logo.png` (un PNG cuadrado).
2. Generar versiones 192, 512 y 512-maskable con tu editor preferido (Figma, Photoshop, Squoosh).
3. Para `apple-touch-icon.png` (180×180), tener fondo opaco (iOS no soporta transparencia bien): un fondo blanco o color de marca.
4. Pegar todos en esta carpeta.

## Nota sobre el favicon

`index.html` apunta el favicon a `/icons/icon-192.png`. Mientras no exista, vas a ver un 404 en dev (no rompe nada). Apenas pongas los archivos, todo se acomoda.
