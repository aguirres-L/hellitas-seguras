import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Modal de instrucciones para iOS (Safari).
 * iOS no dispara `beforeinstallprompt`, así que mostramos los pasos clásicos:
 *   1) Tocar el botón Compartir
 *   2) "Agregar a inicio"
 *   3) Confirmar
 *
 * Se renderiza con portal al body para escapar de contenedores con `overflow:hidden`
 * (por ejemplo el panel del menú móvil) y poder mostrarse en pantalla completa.
 */
export default function ModalInstrucionesIOS({ isAbierto, onCerrar, tipoDispositivo }) {
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
        aria-labelledby="titulo-instrucciones-ios"
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-orange-100 bg-gradient-to-r from-orange-50 via-yellow-50 to-pink-50 p-4">
          <div className="min-w-0">
            <h3 id="titulo-instrucciones-ios" className="text-lg font-bold text-gray-900">
              Instalar Huellitas en tu {tipoDispositivo === 'tablet' ? 'iPad' : 'iPhone'}
            </h3>
            <p className="text-sm font-medium text-gray-600">
              Solo 3 pasos desde Safari
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
          <PasoIOS
            numero={1}
            titulo="Tocá el botón Compartir"
            descripcion="Está en la barra de Safari, abajo en el iPhone o arriba en iPad. Es el ícono cuadrado con una flecha hacia arriba."
          />
          <PasoIOS
            numero={2}
            titulo='Elegí "Agregar a inicio"'
            descripcion="Deslizá entre las opciones del menú compartir hasta encontrar esa acción."
          />
          <PasoIOS
            numero={3}
            titulo="Confirmá con Agregar"
            descripcion="Vas a ver el ícono de Huellitas en tu pantalla de inicio, listo para abrirse como app."
          />
        </ol>

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

function PasoIOS({ numero, titulo, descripcion }) {
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
