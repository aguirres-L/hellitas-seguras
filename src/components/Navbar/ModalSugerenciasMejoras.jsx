import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotificacionApp } from '../../contexts/NotificacionAppContext';
import { addDataCollection } from '../../data/firebase';
import { subirImagenImgbb } from '../../data/imgbb/imgbb-upload';

const COLECCION_SUGERENCIAS = 'sugerenciasMejoras';
const MIN_CARACTERES_MENSAJE = 10;
const MAX_BYTES_IMAGEN = 5 * 1024 * 1024;

/**
 * Modal para enviar sugerencias o mejoras (Firestore + captura opcional vía imgBB).
 */
export default function ModalSugerenciasMejoras({ isAbierto, onCerrar, typeTheme }) {
  const { usuario, datosUsuario } = useAuth();
  const { mostrarExito } = useNotificacionApp();
  const [mensaje, setMensaje] = useState('');
  const [archivoCaptura, setArchivoCaptura] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isEnviando, setIsEnviando] = useState(false);
  const [errorTexto, setErrorTexto] = useState('');
  const inputArchivoRef = useRef(null);

  const isDark = typeTheme === 'dark';

  useEffect(() => {
    if (!isAbierto) return;
    const esc = (e) => {
      if (e.key === 'Escape') onCerrar();
    };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [isAbierto, onCerrar]);

  useEffect(() => {
    if (!archivoCaptura) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(archivoCaptura);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [archivoCaptura]);

  const limpiarFormulario = () => {
    setMensaje('');
    setArchivoCaptura(null);
    setErrorTexto('');
    if (inputArchivoRef.current) inputArchivoRef.current.value = '';
  };

  const handleCerrar = () => {
    limpiarFormulario();
    onCerrar();
  };

  const handleSeleccionArchivo = (e) => {
    setErrorTexto('');
    const archivo = e.target.files?.[0];
    if (!archivo) {
      setArchivoCaptura(null);
      return;
    }
    if (!archivo.type.startsWith('image/')) {
      setErrorTexto('Elegí un archivo de imagen (JPG, PNG, etc.).');
      setArchivoCaptura(null);
      return;
    }
    if (archivo.size > MAX_BYTES_IMAGEN) {
      setErrorTexto('La imagen no puede superar 5 MB.');
      setArchivoCaptura(null);
      return;
    }
    setArchivoCaptura(archivo);
  };

  const handleEnviar = async (e) => {
    e.preventDefault();
    setErrorTexto('');
    const texto = mensaje.trim();
    if (texto.length < MIN_CARACTERES_MENSAJE) {
      setErrorTexto(`Escribí al menos ${MIN_CARACTERES_MENSAJE} caracteres.`);
      return;
    }
    if (!usuario?.uid) {
      setErrorTexto('Tenés que estar logueado para enviar una sugerencia.');
      return;
    }

    setIsEnviando(true);
    try {
      let urlCaptura = null;
      if (archivoCaptura) {
        urlCaptura = await subirImagenImgbb(archivoCaptura, {
          nombre: `feedback-${usuario.uid}-${Date.now()}`,
        });
      }

      await addDataCollection(COLECCION_SUGERENCIAS, {
        usuarioId: usuario.uid,
        emailUsuario: usuario.email ?? null,
        nombreUsuario:
          usuario.displayName || datosUsuario?.nombre || datosUsuario?.email || null,
        mensaje: texto,
        urlCaptura,
        origen: 'menu_dashboard',
      });

      limpiarFormulario();
      onCerrar();
      mostrarExito('Gracias, recibimos tu sugerencia.', 'Enviado');
    } catch (err) {
      console.error(err);
      setErrorTexto(err?.message || 'No se pudo enviar. Probá de nuevo más tarde.');
    } finally {
      setIsEnviando(false);
    }
  };

  if (!isAbierto) return null;

  const panelClass = isDark
    ? 'rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl'
    : 'rounded-2xl border border-gray-200 bg-white shadow-2xl';

  const labelClass = isDark ? 'text-sm font-medium text-gray-200' : 'text-sm font-medium text-gray-800';
  const inputClass = isDark
    ? 'w-full rounded-xl border border-gray-600 bg-gray-800 px-3 py-2.5 text-sm text-gray-100 placeholder:text-gray-500 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30'
    : 'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30';

  const contenido = (
    <div
      className="fixed inset-0 z-[10050] flex items-end justify-center overflow-y-auto bg-black/45 p-4 backdrop-blur-sm sm:items-center"
      role="presentation"
      onClick={(ev) => {
        if (ev.target === ev.currentTarget) handleCerrar();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-sugerencias-titulo"
        className={`relative w-full max-w-lg ${panelClass}`}
        onClick={(ev) => ev.stopPropagation()}
      >
        <div
          className={
            isDark
              ? 'flex items-start justify-between border-b border-gray-700 px-5 py-4'
              : 'flex items-start justify-between border-b border-gray-100 px-5 py-4'
          }
        >
          <div>
            <h2 id="modal-sugerencias-titulo" className={isDark ? 'text-lg font-bold text-white' : 'text-lg font-bold text-gray-900'}>
              Sugerencia / mejoras
            </h2>
            <p className={isDark ? 'mt-1 text-sm text-gray-400' : 'mt-1 text-sm text-gray-500'}>
              Tu opinión nos ayuda a mejorar la app. Podés adjuntar una captura opcional.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCerrar}
            className={isDark ? 'rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white' : 'rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700'}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleEnviar} className="space-y-4 px-5 py-4">
          <div>
            <label htmlFor="sugerencia-mensaje" className={labelClass}>
              Mensaje
            </label>
            <textarea
              id="sugerencia-mensaje"
              rows={5}
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              className={`${inputClass} mt-1.5 resize-y min-h-[120px]`}
              placeholder="Contanos qué mejorarías, qué falló o qué te gustaría ver..."
              disabled={isEnviando}
            />
          </div>

          <div>
            <label className={labelClass}>Captura de pantalla (opcional)</label>
            <div className="mt-1.5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                ref={inputArchivoRef}
                type="file"
                accept="image/*"
                onChange={handleSeleccionArchivo}
                disabled={isEnviando}
                className={
                  isDark
                    ? 'text-sm text-gray-300 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-orange-500'
                    : 'text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-500 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-orange-600'
                }
              />
              {archivoCaptura && (
                <button
                  type="button"
                  onClick={() => {
                    setArchivoCaptura(null);
                    if (inputArchivoRef.current) inputArchivoRef.current.value = '';
                  }}
                  className={
                    isDark
                      ? 'text-sm font-medium text-orange-400 hover:text-orange-300'
                      : 'text-sm font-medium text-orange-600 hover:text-orange-700'
                  }
                  disabled={isEnviando}
                >
                  Quitar imagen
                </button>
              )}
            </div>
            {previewUrl && (
              <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-600">
                <img src={previewUrl} alt="Vista previa de la captura" className="max-h-48 w-full object-contain" />
              </div>
            )}
          </div>

          {errorTexto && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300" role="alert">
              {errorTexto}
            </p>
          )}

          <div
            className={
              isDark
                ? 'flex flex-col-reverse gap-2 border-t border-gray-700 pt-4 sm:flex-row sm:justify-end'
                : 'flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end'
            }
          >
            <button
              type="button"
              onClick={handleCerrar}
              disabled={isEnviando}
              className={
                isDark
                  ? 'w-full rounded-xl border border-gray-600 px-4 py-2.5 text-sm font-semibold text-gray-200 hover:bg-gray-800 sm:w-auto'
                  : 'w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto'
              }
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isEnviando}
              className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:from-orange-600 hover:to-orange-700 disabled:opacity-60 sm:w-auto"
            >
              {isEnviando ? 'Enviando…' : 'Enviar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(contenido, document.body);
}
