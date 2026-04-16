import React, { useEffect } from 'react';
import DecoracionForm from '../decoracionUi/DecoracionForm';

const headerPorVariant = {
  exito: 'border-green-100 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50',
  error: 'border-red-100 bg-gradient-to-r from-orange-50 via-yellow-50 to-pink-50',
  info: 'border-blue-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50',
};

/**
 * Modal único para mensajes (éxito / error / info) y confirmaciones.
 * Controlado por NotificacionAppContext.
 */
export default function ModalDialogoSistema({ dialogo, onCerrar, onConfirmar }) {
  useEffect(() => {
    const esc = (e) => {
      if (e.key === 'Escape') {
        if (dialogo?.tipo === 'confirmar') onCerrar();
        else onCerrar();
      }
    };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [dialogo, onCerrar]);

  if (!dialogo) return null;

  const clickFondo = (e) => {
    if (e.target === e.currentTarget) {
      if (dialogo.tipo === 'confirmar') onCerrar();
      else onCerrar();
    }
  };

  if (dialogo.tipo === 'confirmar') {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={clickFondo}
        role="presentation"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialogo-confirmar-titulo"
          className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <DecoracionForm className="z-0" />
          <div className="relative z-10">
            <div className="flex items-start justify-between border-b border-blue-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-4">
              <h3 id="dialogo-confirmar-titulo" className="pr-8 text-lg font-bold text-gray-900">
                {dialogo.titulo}
              </h3>
              <button
                type="button"
                onClick={onCerrar}
                className="shrink-0 p-2 text-gray-400 hover:text-gray-600"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <div className="p-5">
              <p className="whitespace-pre-wrap text-sm text-gray-700">{dialogo.mensaje}</p>
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 p-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onCerrar}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto"
              >
                {dialogo.textoCancelar}
              </button>
              <button
                type="button"
                onClick={onConfirmar}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto"
              >
                {dialogo.textoConfirmar}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const variant = dialogo.variant || 'info';
  const headerClass = headerPorVariant[variant] || headerPorVariant.info;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={clickFondo}
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialogo-msg-titulo"
        className="relative max-h-[min(90dvh,560px)] w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <DecoracionForm className="z-0" />
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <div className={`flex shrink-0 items-start justify-between border-b p-4 ${headerClass}`}>
            <h3 id="dialogo-msg-titulo" className="pr-8 text-lg font-bold text-gray-900">
              {dialogo.titulo}
            </h3>
            <button
              type="button"
              onClick={onCerrar}
              className="shrink-0 p-2 text-gray-500 hover:text-gray-800"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <p className="whitespace-pre-wrap text-sm text-gray-700">{dialogo.mensaje}</p>
          </div>
          <div className="shrink-0 border-t border-gray-100 bg-gray-50 p-4">
            <button
              type="button"
              onClick={onCerrar}
              className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white hover:from-orange-600 hover:to-pink-600"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
