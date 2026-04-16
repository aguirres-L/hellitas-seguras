import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDogsAPI } from '../../../hooks/useDogsAPI';
import { ConsejosCuidado } from '../ConsejosCuidado';

const MAX_RAZAS_CON_FOTO = 8;
const MIN_LETRAS_BUSQUEDA_FOTOS = 2;

const OPCION_MESTIZO = {
  id: 'mestizo',
  nombre: 'Mestizo (Criollo)',
  tipo: 'especial',
  descripcion: 'Perro de raza mixta o sin raza específica',
};

/** Ruta para dog.ceo: "labrador" o "spaniel/sussex" */
function razaItemARutaApi(item) {
  if (!item || item.tipo === 'especial') return null;
  if (item.tipo === 'raza') return item.id;
  if (item.tipo === 'subraza' && item.razaPadre && item.subraza) {
    return `${item.razaPadre}/${item.subraza}`;
  }
  return null;
}

export default function BusquedaAvanzada({ onRazaSeleccionada, razaSeleccionada }) {
  const [busqueda, setBusqueda] = useState('');
  const [razaSeleccionadaLocal, setRazaSeleccionadaLocal] = useState(razaSeleccionada || '');
  const [imagenesPorBusqueda, setImagenesPorBusqueda] = useState([]);
  const [cargandoFotosBusqueda, setCargandoFotosBusqueda] = useState(false);

  const {
    razas,
    cargando,
    error,
    crearArrayBusqueda,
    obtenerImagenAleatoriaPorRuta,
  } = useDogsAPI();

  const arrayBusqueda = useMemo(() => {
    return crearArrayBusqueda(razas);
  }, [razas, crearArrayBusqueda]);

  const razasFiltradas = useMemo(() => {
    if (!busqueda.trim()) return [];

    const q = busqueda.toLowerCase();
    const resultados = arrayBusqueda.filter((raza) =>
      raza.nombre.toLowerCase().includes(q)
    );

    const palabrasMestizo = ['mestizo', 'criollo', 'callejero', 'cruce', 'mixto', 'sin raza'];
    const incluyeMestizo = palabrasMestizo.some((palabra) => q.includes(palabra));

    if (incluyeMestizo) {
      return [OPCION_MESTIZO, ...resultados].slice(0, 10);
    }

    return resultados.slice(0, 10);
  }, [arrayBusqueda, busqueda]);

  /** Razas con foto en API: excluye mestizo/especial y limita cantidad */
  const razasParaFotos = useMemo(() => {
    return razasFiltradas
      .filter((r) => r.tipo !== 'especial')
      .slice(0, MAX_RAZAS_CON_FOTO);
  }, [razasFiltradas]);

  /** Fotos solo si hay al menos 2 letras y al menos una raza de API (no solo mestizo/callejero). */
  const debeMostrarCuadriculaFotos = useMemo(() => {
    const q = busqueda.trim();
    if (q.length < MIN_LETRAS_BUSQUEDA_FOTOS) return false;
    return razasParaFotos.length > 0;
  }, [busqueda, razasParaFotos]);

  useEffect(() => {
    const q = busqueda.trim();

    if (q.length < MIN_LETRAS_BUSQUEDA_FOTOS) {
      setImagenesPorBusqueda([]);
      setCargandoFotosBusqueda(false);
      return;
    }

    const candidatas = razasFiltradas
      .filter((r) => r.tipo !== 'especial')
      .slice(0, MAX_RAZAS_CON_FOTO);

    if (candidatas.length === 0) {
      setImagenesPorBusqueda([]);
      setCargandoFotosBusqueda(false);
      return;
    }

    let cancelado = false;
    const idTimer = setTimeout(async () => {
      setCargandoFotosBusqueda(true);
      try {
        const resultados = await Promise.all(
          candidatas.map(async (item) => {
            const ruta = razaItemARutaApi(item);
            if (!ruta) return null;
            const imagen = await obtenerImagenAleatoriaPorRuta(ruta);
            if (!imagen) return null;
            return {
              id: item.id,
              nombre: item.nombre,
              imagen,
              item,
            };
          })
        );
        if (!cancelado) {
          setImagenesPorBusqueda(resultados.filter(Boolean));
        }
      } finally {
        if (!cancelado) {
          setCargandoFotosBusqueda(false);
        }
      }
    }, 380);

    return () => {
      cancelado = true;
      clearTimeout(idTimer);
    };
  }, [busqueda, razasFiltradas, obtenerImagenAleatoriaPorRuta]);

  const manejarSeleccionRaza = (nombreRaza) => {
    setRazaSeleccionadaLocal(nombreRaza);
    onRazaSeleccionada?.(nombreRaza);
    setBusqueda('');
    setImagenesPorBusqueda([]);
  };

  const manejarSeleccionDesdeFoto = useCallback(
    (nombreRaza) => {
      setRazaSeleccionadaLocal(nombreRaza);
      onRazaSeleccionada?.(nombreRaza);
      setBusqueda('');
      setImagenesPorBusqueda([]);
    },
    [onRazaSeleccionada]
  );

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
            <p className="text-xs text-gray-500 mt-0.5">
              Escribí al menos 2 letras: filtramos razas y mostramos fotos de ejemplo. Para mestizo o callejero no cargamos fotos.
            </p>
          </div>

          <div className="relative">
            <input
              id="busqueda-raza-perro"
              type="text"
              autoComplete="off"
              placeholder="Ej: lab, collie, caniche…"
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
                  Sin coincidencias. Probá otra palabra o «mestizo» / «criollo».
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => manejarSeleccionRaza('Mestizo (Criollo)')}
              className="flex min-h-[44px] min-w-0 w-full items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/90 px-3 py-2 text-left text-emerald-950 transition hover:bg-emerald-100"
            >
              <span className="text-xl leading-none" aria-hidden>
                🐕
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold leading-tight">Mestizo (Criollo)</span>
                <span className="block text-xs text-emerald-800/90 leading-snug">Cruce o sin raza definida — sin fotos de raza</span>
              </span>
            </button>
          </div>

          <p className="text-xs text-gray-500 leading-snug">
            <span className="font-medium text-gray-600">Tip:</span> mestizo → consejos generales; si conocés una raza
            dominante, escribila y elegí por nombre o por la foto.
          </p>
        </div>

        {debeMostrarCuadriculaFotos && (
          <div className="space-y-3 border-t border-gray-100 bg-slate-50/60 p-3 sm:p-4">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-gray-800">Elegí por foto</h4>
              {cargandoFotosBusqueda && (
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-violet-600" />
                  Cargando fotos…
                </span>
              )}
            </div>

            {!cargandoFotosBusqueda && imagenesPorBusqueda.length === 0 && razasParaFotos.length > 0 && (
              <p className="text-xs text-gray-500">No pudimos cargar imágenes ahora. Elegí la raza por nombre arriba.</p>
            )}

            <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
              {imagenesPorBusqueda.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => manejarSeleccionDesdeFoto(row.nombre)}
                  className="group relative aspect-square overflow-hidden rounded-lg border-2 border-transparent hover:border-violet-500"
                >
                  <img
                    src={row.imagen}
                    alt={row.nombre}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/25" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-1 pb-1 pt-4">
                    <p className="text-center text-[10px] font-medium capitalize leading-tight text-white sm:text-xs">
                      {row.nombre}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5">
          <p className="text-sm text-red-700">Error al cargar datos: {error}</p>
        </div>
      )}

      <ConsejosCuidado razaSeleccionada={razaSeleccionadaLocal} mostrarConsejos={!!razaSeleccionadaLocal} />
    </div>
  );
}
