import React, { useState, useEffect } from 'react';
import { enviarRecuperacionContrasena } from '../../data/firebase';
import DecoracionForm from '../decoracionUi/DecoracionForm';

/**
 * Modal para recuperar contraseña
 * Este componente recibe props para controlar su apertura/cierre
 */
export default function ModalRecuperarPassword({ isAbierto, onCerrar }) {
  const [email, setEmail] = useState('');
  const [isCargando, setIsCargando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  // Limpiar estados cuando se abre/cierra el modal
  useEffect(() => {
    if (isAbierto) {
      setEmail('');
      setError('');
      setExito(false);
      setIsCargando(false);
    }
  }, [isAbierto]);

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

  /**
   * Valida el formato de email usando expresión regular (regex)
   * Formato esperado: usuario@dominio.extension
   * 
   * La regex valida:
   * - ^ : Inicio de la cadena
   * - [a-zA-Z0-9._%+-]+ : Parte local (antes del @) - letras, números, puntos, guiones, etc.
   * - @ : Debe contener el símbolo @
   * - [a-zA-Z0-9.-]+ : Dominio (después del @) - letras, números, guiones, puntos
   * - \. : Debe contener un punto literal
   * - [a-zA-Z]{2,} : Extensión de dominio (al menos 2 letras) - ej: com, org, co
   * - $ : Fin de la cadena
   */
  const validarEmail = (email) => {
    // Verificar que no esté vacío
    if (!email || !email.trim()) {
      return false;
    }

    // Regex para validar formato de email estricto
    const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    // Aplicar trim y validar
    return regexEmail.test(email.trim());
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExito(false);

    // Validación del email
    if (!email.trim()) {
      setError('Por favor, ingresa tu correo electrónico');
      return;
    }

    // Validar formato de email con regex
    const emailTrimmed = email.trim();
    if (!validarEmail(emailTrimmed)) {
      setError('El formato del correo no es válido. Debe ser: usuario@dominio.com');
      return;
    }

    setIsCargando(true);

    try {
      // Usar la función que creamos en firebase.js
      await enviarRecuperacionContrasena(email.trim());
      setExito(true);
      setEmail(''); // Limpiar el campo después del éxito
    } catch (error) {
      // El error ya viene traducido de la función enviarRecuperacionContrasena
      setError(error.message || 'Error al enviar el email de recuperación');
    } finally {
      setIsCargando(false);
    }
  };

  const manejarCerrar = () => {
    if (!isCargando) {
      setEmail('');
      setError('');
      setExito(false);
      onCerrar();
    }
  };

  const manejarClickFondo = (e) => {
    // Cerrar solo si se hace click en el fondo (no en el contenido del modal)
    if (e.target === e.currentTarget && !isCargando) {
      manejarCerrar();
    }
  };

  if (!isAbierto) return null;

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
          <div className="flex items-start justify-between p-4 sm:p-6 border-b border-orange-100 bg-gradient-to-r from-orange-50 via-yellow-50 to-pink-50">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-orange-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <div>
                <h3 id="modal-titulo" className="text-lg font-bold text-gray-900">
                  Recuperar Contraseña
                </h3>
                <p className="text-sm font-medium text-gray-600">
                  Te enviaremos un enlace para restablecer tu contraseña
                </p>
              </div>
            </div>
            <button
              onClick={manejarCerrar}
              aria-label="Cerrar modal"
              disabled={isCargando}
              className="p-2 text-gray-400 transition-colors hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
            {exito ? (
              /* Estado de éxito */
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <span className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600">
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
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    ¡Email enviado!
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Revisa tu bandeja de entrada. Te enviamos un enlace para
                    restablecer tu contraseña. Si no lo encuentras, revisa tu
                    carpeta de spam.
                  </p>
                </div>
                <button
                  onClick={manejarCerrar}
                  className="w-full px-4 py-2 text-sm font-semibold text-white transition-colors rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-orange-300"
                >
                  Entendido
                </button>
              </div>
            ) : (
              /* Formulario */
              <form onSubmit={manejarSubmit} className="space-y-4">
                {/* Mensaje de error */}
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-md">
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
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Campo de email */}
                <div>
                  <label
                    htmlFor="email-recuperacion"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <input
                      id="email-recuperacion"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ejemplo@correo.com"
                      required
                      disabled={isCargando}
                      // Pattern HTML5 que coincide con nuestra regex para validación nativa del navegador
                      pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                      title="Ingresa un correo electrónico válido. Ejemplo: usuario@dominio.com"
                      className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-200"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={manejarCerrar}
                    disabled={isCargando}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors rounded-lg bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isCargando || !email.trim()}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-white transition-all rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
                  >
                    {isCargando ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Enviando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <svg
                          className="mr-2 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <span>Enviar enlace</span>
                      </div>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
