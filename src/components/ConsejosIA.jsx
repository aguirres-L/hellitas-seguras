import React, { useState, useEffect } from 'react';
import { aiService } from '../services/aiService';
import { TIPOS_CONSEJOS } from '../config/tiposConsejos';

if (process.env.NODE_ENV === 'development') {
  import('../utils/cacheDebugger');
  import('../utils/testFrenoPeticiones');
}

const etiquetaFuente = (clave) => {
  switch (clave) {
    case 'huggingface':
      return 'IA (Hugging Face)';
    case 'cohere':
      return 'IA (Cohere)';
    case 'gemini':
      return 'IA (Gemini)';
    case 'ia_no_disponible':
      return 'IA no disponible';
    case 'predefinidos':
      return 'Consejos de respaldo';
    default:
      return 'Fuente desconocida';
  }
};

export const ConsejosIA = ({
  consejos,
  cargando,
  error,
  fuente,
  tematica,
  fechaCreacion,
  peticionesRestantes,
  historial,
  estadisticasTematicas,
  puedeGenerarConsejos,
  tipoConsejoSeleccionado,
  setTipoConsejoSeleccionado,
  promptSeleccionado: _promptSeleccionado,
  setPromptSeleccionado: _setPromptSeleccionado,
  onGenerarConsejos,
  onLimpiarConsejos: _onLimpiarConsejos,
  onRegenerarConsejos,
  onCargarConsejoDelHistorial,
  onLimpiarHistorial: _onLimpiarHistorial,
  testAPIs,
  testModeloEspecifico,
  mascota: _mascota = null,
}) => {
  const [estadisticasCache, setEstadisticasCache] = useState(null);
  const [mostrarSelector, setMostrarSelector] = useState(!consejos);
  const [mostrarVideo, setMostrarVideo] = useState(false);
  const [consejoDetalleSeleccionado, setConsejoDetalleSeleccionado] = useState(null);

  useEffect(() => {
    const stats = aiService.obtenerEstadisticasCache();
    setEstadisticasCache(stats);
  }, [consejos]);

  useEffect(() => {
    if (consejos) {
      setMostrarSelector(false);
    }
  }, [consejos]);

  useEffect(() => {
    if (cargando) {
      setMostrarVideo(true);
    } else {
      const timer = setTimeout(() => setMostrarVideo(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [cargando]);

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return '';
    try {
      const fecha = new Date(fechaISO);
      return fecha.toLocaleDateString('es', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const formatearConsejos = (texto) => {
    if (!texto) return null;

    const lineas = texto.split('\n');
    const nodos = [];
    let bufferViñetas = [];

    const volcarViñetas = (keyBase) => {
      if (bufferViñetas.length === 0) return;
      nodos.push(
        <ul key={`ul-${keyBase}`} className="list-disc pl-5 space-y-1.5 text-sm text-gray-700 mb-3">
          {bufferViñetas.map((item, i) => (
            <li key={`${keyBase}-li-${i}`}>{item}</li>
          ))}
        </ul>
      );
      bufferViñetas = [];
    };

    lineas.forEach((linea, index) => {
      if (linea.startsWith('**') && linea.endsWith('**')) {
        volcarViñetas(index);
        nodos.push(
          <h4
            key={`h-${index}`}
            className="font-semibold text-base text-gray-900 pt-2 first:pt-0 border-t border-gray-100 first:border-0 mt-3 first:mt-0"
          >
            {linea.replace(/\*\*/g, '')}
          </h4>
        );
        return;
      }

      if (linea.trim().startsWith('•')) {
        bufferViñetas.push(linea.replace(/^•\s*/, '').trim());
        return;
      }

      volcarViñetas(index);

      if (linea.trim()) {
        nodos.push(
          <p key={`p-${index}`} className="text-sm text-gray-700 leading-relaxed">
            {linea}
          </p>
        );
      }
    });

    volcarViñetas('end');
    return nodos;
  };

  const tipoNombre = TIPOS_CONSEJOS.find((t) => t.id === tipoConsejoSeleccionado)?.nombre;

  const botonPrimarioClass =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors shadow-sm disabled:opacity-45 disabled:cursor-not-allowed';
  const botonSecundarioClass =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold border-2 border-orange-200 text-orange-800 bg-orange-50 hover:bg-orange-100 transition-colors disabled:opacity-45';

  return (
    <div className="space-y-5">
      {/* Cabecera + acciones */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
              Consejos con IA
            </h3>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              Elegí un tema y generá recomendaciones según la raza. Son orientativas: ante cualquier duda, consultá a tu
              veterinario.
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              {peticionesRestantes !== null && (
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    peticionesRestantes === 0
                      ? 'bg-red-100 text-red-800'
                      : peticionesRestantes === 1
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-orange-100 text-orange-900'
                  }`}
                >
                  {peticionesRestantes === 0
                    ? '0 consejos IA restantes este mes'
                    : `${peticionesRestantes} de 3 consejos IA este mes`}
                </span>
              )}
              {tematica && consejos && (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                  Tema: {tematica}
                </span>
              )}
              {fechaCreacion && consejos && (
                <span className="text-xs text-gray-500">{formatearFecha(fechaCreacion)}</span>
              )}
              {estadisticasTematicas && estadisticasTematicas.total > 0 && (
                <span className="text-xs text-gray-500">Varias temáticas en tu historial</span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-2 shrink-0">
            {process.env.NODE_ENV === 'development' && testAPIs && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={testAPIs}
                  className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-medium text-white hover:bg-violet-700"
                >
                  Test APIs
                </button>
                <button
                  type="button"
                  onClick={() => testModeloEspecifico('gpt2')}
                  className="rounded-lg bg-slate-600 px-3 py-2 text-xs font-medium text-white hover:bg-slate-700"
                >
                  Test GPT2
                </button>
                <button
                  type="button"
                  onClick={() => testModeloEspecifico('distilgpt2')}
                  className="rounded-lg bg-slate-500 px-3 py-2 text-xs font-medium text-white hover:bg-slate-600"
                >
                  Test Distil
                </button>
              </div>
            )}

            {!cargando && (
              <div className="flex flex-col sm:flex-row gap-2">
                {consejos && (
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarSelector(true);
                      setTipoConsejoSeleccionado(null);
                    }}
                    className={botonSecundarioClass}
                  >
                    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Otro tema
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => (consejos ? onRegenerarConsejos() : onGenerarConsejos(tipoConsejoSeleccionado))}
                  disabled={!puedeGenerarConsejos || !tipoConsejoSeleccionado}
                  className={`${botonPrimarioClass} ${
                    !puedeGenerarConsejos || !tipoConsejoSeleccionado
                      ? 'bg-gray-300 text-gray-500'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                  title={
                    !puedeGenerarConsejos
                      ? 'Límite mensual alcanzado'
                      : !tipoConsejoSeleccionado
                        ? 'Elegí un tipo de consejo primero'
                        : ''
                  }
                >
                  <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {!puedeGenerarConsejos
                    ? 'Límite alcanzado'
                    : !tipoConsejoSeleccionado
                      ? 'Elegí un tema'
                      : consejos
                        ? 'Regenerar'
                        : 'Generar consejos'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Selector de tipo */}
        {!cargando && mostrarSelector && (
          <div className="border-t border-gray-100 bg-gray-50/70 px-4 py-5 sm:px-5">
            <p className="text-sm font-semibold text-gray-900 mb-1">Elegí un tema</p>
            <p className="text-xs text-gray-500 mb-4">Un consejo por generación. Podés volver a elegir cuando quieras.</p>

            <div className="hidden md:grid md:grid-cols-4 gap-2.5">
              {TIPOS_CONSEJOS.map((tipo) => (
                <button
                  key={tipo.id}
                  type="button"
                  onClick={() => setTipoConsejoSeleccionado(tipo.id)}
                  className={`rounded-xl border-2 p-3 text-left transition-all duration-200 ${
                    tipoConsejoSeleccionado === tipo.id
                      ? `${tipo.color} shadow-md ring-2 ring-orange-200/80`
                      : `border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm ${tipo.colorHover}`
                  }`}
                >
                  <span className="text-xl" aria-hidden>
                    {tipo.icono}
                  </span>
                  <div className="mt-1.5 font-semibold text-sm leading-tight">{tipo.nombre}</div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2 leading-snug">{tipo.descripcion}</div>
                </button>
              ))}
            </div>

            <div className="md:hidden">
              <div
                className="flex gap-2.5 overflow-x-auto pb-2 -mx-1 px-1"
                style={{
                  scrollbarWidth: 'thin',
                  WebkitOverflowScrolling: 'touch',
                  scrollSnapType: 'x mandatory',
                }}
              >
                {TIPOS_CONSEJOS.map((tipo, index) => (
                  <button
                    key={tipo.id}
                    type="button"
                    onClick={() => setTipoConsejoSeleccionado(tipo.id)}
                    className={`flex-shrink-0 w-[min(88vw,280px)] scroll-mx-1 rounded-xl border-2 p-3 text-left transition-all ${
                      tipoConsejoSeleccionado === tipo.id
                        ? `${tipo.color} shadow-md ring-2 ring-orange-200/80`
                        : `border-gray-200 bg-white text-gray-700 active:scale-[0.99] ${tipo.colorHover}`
                    }`}
                    style={{
                      scrollSnapAlign: index === 0 ? 'start' : index === TIPOS_CONSEJOS.length - 1 ? 'end' : 'center',
                    }}
                  >
                    <span className="text-xl" aria-hidden>
                      {tipo.icono}
                    </span>
                    <div className="mt-1.5 font-semibold text-sm">{tipo.nombre}</div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">{tipo.descripcion}</div>
                  </button>
                ))}
              </div>
              {TIPOS_CONSEJOS.length > 1 && (
                <p className="mt-2 text-center text-xs text-gray-400">Deslizá para ver más temas</p>
              )}
            </div>

            {tipoConsejoSeleccionado && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-orange-100 bg-orange-50/80 px-3 py-2.5">
                <span className="text-orange-700 text-sm font-medium">Seleccionado: {tipoNombre}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Carga */}
      {mostrarVideo && (
        <div
          className="rounded-2xl border border-orange-100 bg-gradient-to-b from-orange-50/90 to-white p-5 sm:p-6 text-center shadow-sm"
          role="status"
          aria-live="polite"
          aria-busy={cargando}
        >
          <div className="mx-auto max-w-xs sm:max-w-sm">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full rounded-xl border border-orange-100 shadow-sm"
              style={{ maxHeight: 'min(200px, 40vh)' }}
            >
              <source src="/vn.mp4" type="video/mp4" />
            </video>
          </div>
          <p className="mt-4 text-sm font-semibold text-gray-900">Generando consejos…</p>
          <p className="text-xs text-gray-600 mt-1">Suele tardar unos segundos.</p>
          {cargando && (
            <div className="mt-3 flex justify-center">
              <span className="h-1.5 w-32 overflow-hidden rounded-full bg-orange-100">
                <span className="block h-full w-1/2 animate-pulse rounded-full bg-orange-400" />
              </span>
            </div>
          )}
        </div>
      )}

      {error && (
        <div
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 flex gap-3 items-start"
          role="alert"
        >
          <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm text-red-800 leading-relaxed">{error}</p>
        </div>
      )}

      {consejos && !cargando && (
        <article
          className={`rounded-2xl border shadow-sm overflow-hidden ${
            fuente === 'ia_no_disponible'
              ? 'border-amber-200 bg-amber-50/40'
              : 'border-gray-200 bg-white'
          }`}
        >
          <div
            className={`px-4 py-3 sm:px-5 border-b text-xs sm:text-sm ${
              fuente === 'ia_no_disponible'
                ? 'bg-amber-100/50 border-amber-200 text-amber-950'
                : 'bg-gray-50 border-gray-100 text-gray-600'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="font-medium">{etiquetaFuente(fuente)}</span>
              <span className={fuente === 'ia_no_disponible' ? 'text-amber-800' : 'text-gray-500'}>
                {fuente === 'ia_no_disponible'
                  ? 'Probá de nuevo en unos minutos.'
                  : 'No reemplaza la opinión profesional.'}
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-1 border-l-4 border-orange-400">
            <div className="prose prose-sm max-w-none text-gray-800">{formatearConsejos(consejos)}</div>
          </div>

          <footer className="px-4 py-3 sm:px-5 bg-gray-50/80 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-500">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {fechaCreacion && <span>Generado: {formatearFecha(fechaCreacion)}</span>}
              <span className="text-gray-400">{etiquetaFuente(fuente)}</span>
            </div>
            {estadisticasCache && estadisticasCache.total > 0 && (
              <span className="text-gray-400">
                Caché local: {estadisticasCache.validas} entradas
              </span>
            )}
          </footer>
        </article>
      )}

      {!consejos && !cargando && !error && (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 px-6 py-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-800">Todavía no generaste consejos</p>
          <p className="text-sm text-gray-600 mt-1 max-w-md mx-auto">
            Elegí un tema arriba y tocá <span className="font-medium text-gray-800">Generar consejos</span>.
          </p>
        </div>
      )}

      {historial && historial.length > 0 && (
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 sm:px-5 border-b border-gray-100 bg-gray-50/80">
            <h4 className="text-sm font-semibold text-gray-900">Historial en este dispositivo</h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {historial.length} {historial.length === 1 ? 'consejo guardado' : 'consejos guardados'} · Tocá una tarjeta
              para ver el detalle
            </p>
          </div>

          {consejoDetalleSeleccionado ? (
            <div className="p-4 sm:p-5 space-y-4">
              <button
                type="button"
                onClick={() => setConsejoDetalleSeleccionado(null)}
                className="inline-flex items-center gap-2 text-sm font-medium text-orange-700 hover:text-orange-800"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver al historial
              </button>

              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 pb-4 border-b border-gray-200">
                  <span className="inline-flex w-fit rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-900">
                    {consejoDetalleSeleccionado.tematica}
                  </span>
                  <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-gray-600">
                    <span>{formatearFecha(consejoDetalleSeleccionado.fechaCreacion)}</span>
                    <span className="text-gray-300">·</span>
                    <span>Raza: {consejoDetalleSeleccionado.raza}</span>
                    <span className="text-gray-300">·</span>
                    <span>{etiquetaFuente(consejoDetalleSeleccionado.fuente)}</span>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none text-gray-800">
                  {formatearConsejos(consejoDetalleSeleccionado.consejos)}
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConsejoDetalleSeleccionado(null)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onCargarConsejoDelHistorial(consejoDetalleSeleccionado.id);
                    setConsejoDetalleSeleccionado(null);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Ver este consejo
                </button>
              </div>
            </div>
          ) : (
            <ul className="p-2 sm:p-3 space-y-2 list-none">
              {historial.map((item) => {
                const texto = typeof item.consejos === 'string' ? item.consejos : '';
                const preview =
                  texto.length > 140 ? `${texto.slice(0, 140).trim()}…` : texto || 'Sin texto';
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setConsejoDetalleSeleccionado(item)}
                      className="w-full text-left rounded-xl border border-gray-100 bg-white p-4 transition-colors hover:border-orange-200 hover:bg-orange-50/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                              {item.tematica}
                            </span>
                            <span className="text-xs text-gray-500">{formatearFecha(item.fechaCreacion)}</span>
                          </div>
                          <p className="text-sm text-gray-700 line-clamp-2">{preview}</p>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                            <span>{item.raza}</span>
                            <span className="text-gray-300">·</span>
                            <span>{etiquetaFuente(item.fuente)}</span>
                          </div>
                        </div>
                        <svg
                          className="h-5 w-5 shrink-0 text-gray-400 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
};
