import React, { useState, useEffect, useMemo } from 'react';
import { useDogsAPI } from '../../../hooks/useDogsAPI';
import { ConsejosCuidado } from '../ConsejosCuidado';

export default function BusquedaAvanzada({ onRazaSeleccionada, razaSeleccionada }) {
  // Estados locales
  const [busqueda, setBusqueda] = useState('');
  const [mostrarCarrusel, setMostrarCarrusel] = useState(false);
  const [razaSeleccionadaLocal, setRazaSeleccionadaLocal] = useState(razaSeleccionada || '');
  const [cargandoInicial, setCargandoInicial] = useState(false);

  // Hook de la API
  const {
    razas,
    imagenesRandom,
    cargando,
    cargandoCarrusel,
    error,
    obtenerImagenesRandom,
    crearArrayBusqueda,
    crearArrayCarrusel
  } = useDogsAPI();

  // Array de búsqueda procesado
  const arrayBusqueda = useMemo(() => {
    return crearArrayBusqueda(razas);
  }, [razas, crearArrayBusqueda]);

  // Array de carrusel procesado
  const arrayCarrusel = useMemo(() => {
    return crearArrayCarrusel(imagenesRandom);
  }, [imagenesRandom, crearArrayCarrusel]);

  // Opción especial para perros mestizos
  const opcionMestizo = {
    id: 'mestizo',
    nombre: 'Mestizo (Criollo)',
    tipo: 'especial',
    descripcion: 'Perro de raza mixta o sin raza específica'
  };

  // Filtrar razas según búsqueda
  const razasFiltradas = useMemo(() => {
    if (!busqueda.trim()) return [];
    
    const resultados = arrayBusqueda.filter(raza =>
      raza.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
    
    // Si la búsqueda incluye palabras relacionadas con mestizo, agregar la opción especial
    const palabrasMestizo = ['mestizo', 'criollo', 'callejero', 'cruce', 'mixto', 'sin raza'];
    const incluyeMestizo = palabrasMestizo.some(palabra => 
      busqueda.toLowerCase().includes(palabra)
    );
    
    if (incluyeMestizo) {
      return [opcionMestizo, ...resultados].slice(0, 10);
    }
    
    return resultados.slice(0, 10);
  }, [arrayBusqueda, busqueda]);

  // Manejar selección de raza
  const manejarSeleccionRaza = (raza) => {
    setRazaSeleccionadaLocal(raza);
    onRazaSeleccionada?.(raza);
    setBusqueda('');
  };

  // Manejar selección desde carrusel
  const manejarSeleccionCarrusel = (raza) => {
    setRazaSeleccionadaLocal(raza);
    onRazaSeleccionada?.(raza);
    setMostrarCarrusel(false);
  };

  // Cargar más imágenes del carrusel
  const cargarMasImagenes = async () => {
    setCargandoInicial(true);
    try {
      await obtenerImagenesRandom(10, 3);
    } finally {
      setCargandoInicial(false);
    }
  };

  // Efecto para cargar imágenes del carrusel
  useEffect(() => {
    if (mostrarCarrusel && imagenesRandom.length === 0) {
      setCargandoInicial(true);
      obtenerImagenesRandom(15, 3).finally(() => {
        setCargandoInicial(false);
      });
    }
  }, [mostrarCarrusel, imagenesRandom.length, obtenerImagenesRandom]);


  return (
    <div className="space-y-4">
      <div className="text-left">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
          Identifica el tipo de tu mascota
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Así personalizamos los consejos de cuidado.
        </p>
        <details className="mt-2 rounded-lg border border-amber-200/80 bg-amber-50/90 text-left">
          <summary className="cursor-pointer list-none p-2.5 text-xs font-medium text-amber-900 flex items-center gap-2 [&::-webkit-details-marker]:hidden">
            <svg className="h-4 w-4 text-amber-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            ¿Por qué preguntamos la raza o tipo?
          </summary>
          <p className="px-2.5 pb-2.5 text-xs text-amber-800 leading-snug border-t border-amber-100">
            Cada tipo tiene necesidades distintas de cuidado y actividad. Con este dato te damos recomendaciones más acertadas.
          </p>
        </details>
      </div>

      {razaSeleccionadaLocal && (
        <div className="rounded-xl border border-green-200 bg-green-50/90 px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-medium text-green-700">Seleccionado</p>
              <p className="text-base font-semibold text-green-900 capitalize truncate">{razaSeleccionadaLocal}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setRazaSeleccionadaLocal('');
                onRazaSeleccionada?.('');
              }}
              className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-green-800 hover:bg-green-100/80"
            >
              Cambiar
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="p-3 sm:p-4 space-y-3">
          <div>
            <label htmlFor="busqueda-raza-perro" className="block text-sm font-medium text-gray-800">
              Buscar raza
            </label>
            <p className="text-xs text-gray-500 mt-0.5">Escribí y elegí de la lista; probá con «mestizo» si aplica.</p>
          </div>

          <div className="relative">
            <input
              id="busqueda-raza-perro"
              type="text"
              autoComplete="off"
              placeholder="Ej: labrador, caniche…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
            />
            {cargando && (
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-orange-500" />
              </div>
            )}
          </div>

          {busqueda && (
            <div className="max-h-52 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-sm">
              {razasFiltradas.length > 0 ? (
                razasFiltradas.map((raza) => (
                  <button
                    key={raza.id}
                    type="button"
                    onClick={() => manejarSeleccionRaza(raza.nombre)}
                    className={`flex w-full items-start gap-2 border-b border-gray-100 px-3 py-2.5 text-left last:border-b-0 hover:bg-gray-50 ${
                      raza.tipo === 'especial' ? 'bg-emerald-50/60 hover:bg-emerald-50' : ''
                    }`}
                  >
                    {raza.tipo === 'especial' && <span className="text-lg leading-none">🐕</span>}
                    <div className="min-w-0 flex-1">
                      <div
                        className={`text-sm font-medium capitalize ${
                          raza.tipo === 'especial' ? 'text-emerald-900' : 'text-gray-900'
                        }`}
                      >
                        {raza.nombre}
                      </div>
                      {raza.tipo === 'subraza' && (
                        <div className="text-xs text-gray-500">Subraza de {raza.razaPadre}</div>
                      )}
                      {raza.tipo === 'especial' && (
                        <div className="text-xs text-emerald-800/90">{raza.descripcion}</div>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-3 py-4 text-center text-sm text-gray-500">
                  Sin coincidencias. Probá «mestizo» o «criollo».
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
            <button
              type="button"
              onClick={() => manejarSeleccionRaza('Mestizo (Criollo)')}
              className="flex min-h-[44px] min-w-0 flex-1 items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/90 px-3 py-2 text-left text-emerald-950 transition hover:bg-emerald-100"
            >
              <span className="text-xl leading-none" aria-hidden>
                🐕
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold leading-tight">Mestizo (Criollo)</span>
                <span className="block text-xs text-emerald-800/90 leading-snug">Cruce o sin raza definida</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMostrarCarrusel(!mostrarCarrusel)}
              disabled={cargandoInicial}
              aria-expanded={mostrarCarrusel}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-900 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-40 sm:flex-none"
            >
              {cargandoInicial ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-200 border-t-violet-700" />
                  <span>Cargando…</span>
                </>
              ) : mostrarCarrusel ? (
                'Cerrar fotos'
              ) : (
                'Ver por fotos'
              )}
            </button>
          </div>

          <p className="text-xs text-gray-500 leading-snug">
            <span className="font-medium text-gray-600">Tip:</span> mestizo → consejos generales; si conocés una raza
            dominante, mejor elegila para consejos más puntuales.
          </p>
        </div>

        {mostrarCarrusel && (
          <div className="space-y-3 border-t border-gray-100 bg-slate-50/60 p-3 sm:p-4">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-gray-800">Elegí por foto</h4>
              {(cargandoCarrusel || cargandoInicial) && (
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-violet-600" />
                  {cargandoInicial ? 'Cargando…' : 'Actualizando…'}
                </span>
              )}
            </div>

            <div className="grid max-h-56 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
              {Array.isArray(arrayCarrusel) && arrayCarrusel.length > 0 ? (
                arrayCarrusel.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => manejarSeleccionCarrusel(item.raza)}
                    className="group relative aspect-square overflow-hidden rounded-lg border-2 border-transparent hover:border-violet-500"
                  >
                    <img
                      src={item.imagen}
                      alt={item.nombre}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/25" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-1 pb-1 pt-4">
                      <p className="text-center text-[10px] font-medium capitalize leading-tight text-white sm:text-xs">
                        {item.nombre}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center gap-2 py-8 text-gray-500">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-violet-600" />
                  <p className="text-sm">{cargandoInicial ? 'Cargando imágenes…' : 'Preparando…'}</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={cargarMasImagenes}
              disabled={cargandoCarrusel || cargandoInicial}
              className="w-full rounded-xl bg-violet-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cargandoInicial || cargandoCarrusel ? 'Cargando más…' : 'Más fotos'}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5">
          <p className="text-sm text-red-700">Error al cargar datos: {error}</p>
        </div>
      )}

      {/* Consejos de cuidado */}
      <ConsejosCuidado 
        razaSeleccionada={razaSeleccionadaLocal}
        mostrarConsejos={!!razaSeleccionadaLocal}
      />
    </div>
  );
}