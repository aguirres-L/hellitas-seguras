import React, { useState, useEffect } from 'react';
import DecoracionForm from '../decoracionUi/DecoracionForm';

/**
 * Modal para mostrar alertas al agregar mascota
 * Este componente recibe props para controlar su apertura/cierre y mostrar mensajes
 */
export default function ModalAlertFormularioAgregarMascota({ 
  isAbierto, 
  onCerrar, 
  tipo = 'exito', // 'exito' o 'error'
  mensaje = '',
  nombreMascota = ''
}) {
  // Cerrar modal con tecla Escape
  useEffect(() => {
    const manejarEscape = (e) => {
      if (e.key === 'Escape' && isAbierto) {
        onCerrar();
      }
    };

    if (isAbierto) {
      document.addEventListener('keydown', manejarEscape);
    }

    return () => {
      document.removeEventListener('keydown', manejarEscape);
    };
  }, [isAbierto, onCerrar]);

  const manejarClickFondo = (e) => {
    // Cerrar solo si se hace click en el fondo (no en el contenido del modal)
    if (e.target === e.currentTarget) {
      onCerrar();
    }
  };

  if (!isAbierto) return null;

  const esExito = tipo === 'exito';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={manejarClickFondo}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-titulo"
    >
      <div className="relative w-full max-w-md overflow-hidden bg-white rounded-2xl shadow-2xl">
        {/* Fondo decorativo */}
        <DecoracionForm className="z-0" />

        <div className="relative z-10">
          {/* Header */}
          <div className={`flex items-start justify-between p-4 sm:p-6 border-b ${
            esExito 
              ? 'border-green-100 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50'
              : 'border-red-100 bg-gradient-to-r from-red-50 via-pink-50 to-orange-50'
          }`}>
            <div className="flex items-center gap-3">
              <span className={`flex items-center justify-center w-10 h-10 rounded-full ${
                esExito 
                  ? 'bg-green-100 text-green-600'
                  : 'bg-red-100 text-red-600'
              }`}>
                {esExito ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </span>
              <div>
                <h3 id="modal-titulo" className="text-lg font-bold text-gray-900">
                  {esExito ? '¡Mascota agregada exitosamente!' : 'Error al agregar mascota'}
                </h3>
                <p className="text-sm font-medium text-gray-600">
                  {esExito 
                    ? nombreMascota 
                      ? `${nombreMascota} ha sido agregada a tu lista`
                      : 'Tu mascota ha sido agregada a tu lista'
                    : 'Hubo un problema al intentar agregar la mascota'}
                </p>
              </div>
            </div>
            <button
              onClick={onCerrar}
              aria-label="Cerrar modal"
              className="p-2 text-gray-400 transition-colors hover:text-gray-600"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Contenido */}
          <div className="p-4 sm:p-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <span className={`flex items-center justify-center w-16 h-16 rounded-full ${
                  esExito 
                    ? 'bg-green-100 text-green-600'
                    : 'bg-red-100 text-red-600'
                }`}>
                  {esExito ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-8 h-8"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-8 h-8"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </span>
              </div>
              <div>
                {esExito ? (
                  <>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      ¡Perfecto!
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      {nombreMascota 
                        ? `${nombreMascota} ha sido agregada exitosamente a tu lista de mascotas. Ya puedes gestionar su información desde el dashboard.`
                        : 'Tu mascota ha sido agregada exitosamente a tu lista. Ya puedes gestionar su información desde el dashboard.'}
                    </p>
                  </>
                ) : (
                  <>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Ocurrió un error
                    </h4>
                    <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-md mb-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-red-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{mensaje || 'Error al agregar mascota'}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={onCerrar}
                className={`w-full px-4 py-2 text-sm font-semibold text-white transition-colors rounded-lg focus:outline-none focus:ring-2 ${
                  esExito
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 focus:ring-green-300'
                    : 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 focus:ring-orange-300'
                }`}
              >
                {esExito ? 'Entendido' : 'Intentar de nuevo'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}