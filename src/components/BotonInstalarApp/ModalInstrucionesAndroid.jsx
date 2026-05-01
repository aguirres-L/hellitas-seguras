import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Modal de instrucciones para Android cuando el navegador no disparó beforeinstallprompt
 * (sucede en dev sin HTTPS, en navegadores no-Chromium, o si el usuario ya descartó el banner).
 *
 * Se renderiza con portal al body para no quedar recortado por contenedores con overflow:hidden.
 */
export default function ModalInstrucionesAndroid({ isAbierto, onCerrar }) {
  const [domListo, setDomListo] = useState(false);

  useEffect(() => {
    setDomListo(true);
  }, []);

  if (!isAbierto || !domListo || typeof document === 'undefined') return null;

  const contenido = (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50"
      role="presentation"
      onClick={onCerrar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-instrucciones-android"
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-orange-100 bg-gradient-to-r from-orange-50 via-yellow-50 to-pink-50 p-4">
          <div className="min-w-0">
            <h3 id="titulo-instrucciones-android" className="text-lg font-bold text-gray-900">
              Instalar Huellitas en tu Android
            </h3>
            <p className="text-sm font-medium text-gray-600">
              3 pasos rápidos desde Chrome
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="shrink-0 p-2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <ol className="space-y-4 p-6">
          <PasoAndroid
            numero={1}
            titulo="Abrí el menú de Chrome"
            descripcion="Tocá los tres puntos verticales arriba a la derecha."
          />
          <PasoAndroid
            numero={2}
            titulo='Elegí "Instalar app" o "Agregar a pantalla principal"'
            descripcion="El nombre varía según la versión de Chrome, pero la opción está en el menú principal."
          />
          <PasoAndroid
            numero={3}
            titulo="Confirmá con Instalar"
            descripcion="Vas a ver el ícono de Huellitas en tu pantalla de inicio listo para abrirse como app."
          />
        </ol>

        <div className="px-6 pb-4">
          <p className="rounded-lg bg-orange-50 p-3 text-xs text-orange-800">
            <strong>Tip:</strong> si no ves la opción, asegurate de estar usando Chrome (no Firefox ni el navegador de Samsung) y de que el sitio cargue por HTTPS.
          </p>
        </div>

        <div className="flex justify-end gap-3 bg-gray-50 p-4">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(contenido, document.body);
}

function PasoAndroid({ numero, titulo, descripcion }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
        {numero}
      </span>
      <div className="min-w-0">
        <p className="font-semibold text-gray-900">{titulo}</p>
        <p className="text-sm text-gray-600">{descripcion}</p>
      </div>
    </li>
  );
}
