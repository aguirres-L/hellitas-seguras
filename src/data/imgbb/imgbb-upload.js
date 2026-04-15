const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';

/**
 * Sube una imagen a imgBB (POST multipart).
 * Requiere VITE_IMGBB_API_KEY en .env (Vite).
 *
 * @param {File} archivo
 * @param {{ nombre?: string }} [opciones] — name opcional en imgBB
 * @returns {Promise<string>} URL directa (data.url)
 */
export async function subirImagenImgbb(archivo, opciones = {}) {
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
  if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
    throw new Error(
      'Falta VITE_IMGBB_API_KEY. Agregala en .env y reiniciá el servidor (npm run dev).'
    );
  }

  const formData = new FormData();
  formData.append('image', archivo);

  const nombreBase =
    opciones.nombre?.trim() ||
    (archivo.name ? archivo.name.replace(/\.[^/.]+$/, '') : '') ||
    'imagen';
  formData.append('name', nombreBase.slice(0, 100));

  const url = `${IMGBB_UPLOAD_URL}?key=${encodeURIComponent(apiKey.trim())}`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  let json;
  try {
    json = await response.json();
  } catch {
    throw new Error('imgBB devolvió una respuesta no válida.');
  }

  if (json.success === false || (json.status && json.status !== 200 && !json.data?.url)) {
    const msg =
      json?.error?.message ||
      json?.error?.code ||
      json?.status_text ||
      `Error imgBB (HTTP ${response.status})`;
    throw new Error(msg);
  }

  if (!json.data?.url) {
    throw new Error('imgBB no devolvió URL de la imagen.');
  }

  return json.data.url;
}
