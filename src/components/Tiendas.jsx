import React, { useState, useEffect, useCallback } from 'react';
import { obtenerProductosPorProfesional, obtenerDescuentosPorProfesional } from '../data/firebase/firebase';
import { useTheme } from '../contexts/ThemeContext';

const formatearPrecio = (valor) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(Number(valor) || 0);

/** Firestore Timestamp | Date | string ISO → texto legible o null si inválido */
const fechaFinDescuentoLegible = (fechaFin) => {
  if (fechaFin == null) return null;
  let d;
  if (typeof fechaFin?.seconds === 'number') {
    d = new Date(fechaFin.seconds * 1000);
  } else if (fechaFin instanceof Date) {
    d = fechaFin;
  } else {
    d = new Date(fechaFin);
  }
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

function ImagenProductoConFallback({ src, alt, className }) {
  const [fallo, setFallo] = useState(false);
  if (!src || fallo) {
    return (
      <div className={`flex items-center justify-center rounded-lg bg-gray-100 text-gray-400 ${className || ''}`} aria-hidden>
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFallo(true)}
      loading="lazy"
    />
  );
}

export default function Tiendas({ tiendas, isCargando = false }) {
  const [tiendasConDatos, setTiendasConDatos] = useState([]);
  const [isCargandoDatos, setIsCargandoDatos] = useState(false);
  const { typeTheme } = useTheme();

  useEffect(() => {
    const cargarDatosTiendas = async () => {
      if (!tiendas || tiendas.length === 0) return;

      setIsCargandoDatos(true);
      try {
        const tiendasConDatosCompletos = await Promise.all(
          tiendas.map(async (tienda) => {
            try {
              const [productos, descuentos] = await Promise.all([
                obtenerProductosPorProfesional(tienda.id),
                obtenerDescuentosPorProfesional(tienda.id),
              ]);

              return {
                ...tienda,
                productos: productos || [],
                descuentos: descuentos || [],
              };
            } catch (error) {
              console.error(`Error al cargar datos de tienda ${tienda.id}:`, error);
              return {
                ...tienda,
                productos: [],
                descuentos: [],
              };
            }
          })
        );

        setTiendasConDatos(tiendasConDatosCompletos);
      } catch (error) {
        console.error('Error al cargar datos de tiendas:', error);
      } finally {
        setIsCargandoDatos(false);
      }
    };

    cargarDatosTiendas();
  }, [tiendas]);

  const [tiendaSeleccionada, setTiendaSeleccionada] = useState(null);
  const [pestanaModal, setPestanaModal] = useState('productos');

  useEffect(() => {
    if (tiendaSeleccionada) {
      setPestanaModal('productos');
    }
  }, [tiendaSeleccionada?.id]);

  const manejarVerDetalles = useCallback((tienda) => {
    setTiendaSeleccionada(tienda);
  }, []);

  const cerrarDetalles = useCallback(() => {
    setTiendaSeleccionada(null);
  }, []);

  const tituloSeccion =
    typeTheme === 'dark' ? 'text-2xl font-bold mb-6 text-white' : 'text-2xl font-bold mb-6 text-gray-900';

  return (
    <div className="mt-12">
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <h3 className={tituloSeccion}>Tiendas registradas</h3>
        <p className="text-sm text-gray-500">
          Productos y promociones publicados por cada tienda asociada.
        </p>
      </div>

      {isCargando || isCargandoDatos ? (
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
          <p className="mt-3 text-gray-600">Cargando tiendas…</p>
        </div>
      ) : tiendas.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 py-12 text-center">
          <p className="text-gray-600">Todavía no hay tiendas para mostrar en tu zona.</p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible md:pb-0">
          {tiendasConDatos.map((tienda) => {
            const nProd = tienda.productos?.length ?? 0;
            const nDesc = tienda.descuentos?.length ?? 0;
            return (
              <article
                key={tienda.id}
                className="snap-center shrink-0 w-[min(100%,320px)] md:w-auto flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:min-w-0"
              >
                <div className="relative mb-4 h-36 w-full overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50">
                  {tienda.fotoLocalUrl ? (
                    <img
                      src={tienda.fotoLocalUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div
                    className={`flex h-full w-full flex-col items-center justify-center text-emerald-600/70 ${tienda.fotoLocalUrl ? 'hidden' : ''}`}
                  >
                    <svg className="mb-1 h-10 w-10 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-xs font-medium">Sin foto del local</span>
                  </div>
                </div>

                <div className="mb-3">
                  <h4 className="text-lg font-bold text-emerald-700">{tienda.nombre}</h4>
                  {tienda.especialidad ? (
                    <p className="text-sm text-gray-500">{tienda.especialidad}</p>
                  ) : null}
                </div>

                <dl className="space-y-2 text-sm text-gray-700 mb-4">
                  {tienda.direccion ? (
                    <div className="flex gap-2">
                      <span className="shrink-0" aria-hidden>
                        📍
                      </span>
                      <span>{tienda.direccion}</span>
                    </div>
                  ) : null}
                  {tienda.telefono ? (
                    <div className="flex gap-2">
                      <span className="shrink-0" aria-hidden>
                        📞
                      </span>
                      <a href={`tel:${String(tienda.telefono).replace(/\s/g, '')}`} className="text-emerald-700 underline-offset-2 hover:underline">
                        {tienda.telefono}
                      </a>
                    </div>
                  ) : null}
                  {tienda.horario ? (
                    <div className="flex gap-2">
                      <span className="shrink-0" aria-hidden>
                        🕒
                      </span>
                      <span>{tienda.horario}</span>
                    </div>
                  ) : null}
                </dl>

                <p className="mb-4 text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">{nProd}</span> producto{nProd !== 1 ? 's' : ''} ·{' '}
                  <span className="font-semibold text-gray-700">{nDesc}</span> descuento{nDesc !== 1 ? 's' : ''}
                </p>

                {nProd > 0 && (
                  <div className="mb-3 rounded-lg bg-gray-50 px-3 py-2">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Vista rápida</p>
                    <ul className="space-y-1.5">
                      {tienda.productos.slice(0, 2).map((producto) => (
                        <li key={producto.id} className="flex items-center justify-between gap-2 text-sm">
                          <span className="truncate text-gray-800">{producto.nombre}</span>
                          <span className="shrink-0 font-semibold text-emerald-700">{formatearPrecio(producto.precio)}</span>
                        </li>
                      ))}
                    </ul>
                    {nProd > 2 && <p className="mt-2 text-xs text-gray-400">+{nProd - 2} más en el detalle</p>}
                  </div>
                )}

                {nDesc > 0 && nProd === 0 && (
                  <div className="mb-3 rounded-lg border border-amber-100 bg-amber-50/80 px-3 py-2 text-sm text-amber-900">
                    {tienda.descuentos.slice(0, 1).map((d) => (
                      <span key={d.id}>
                        {d.nombre} · {d.porcentaje}% OFF
                      </span>
                    ))}
                    {nDesc > 1 && <span className="text-xs text-amber-800"> (+{nDesc - 1})</span>}
                  </div>
                )}

                <div className="mt-auto flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => manejarVerDetalles(tienda)}
                    className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    Ver catálogo y ofertas
                  </button>
                  {tienda.telefono ? (
                    <a
                      href={`tel:${String(tienda.telefono).replace(/\s/g, '')}`}
                      className="block w-full rounded-xl border border-emerald-600 py-2.5 text-center text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                    >
                      Llamar a la tienda
                    </a>
                  ) : (
                    <span className="block w-full rounded-xl border border-gray-200 py-2.5 text-center text-sm text-gray-400">
                      Sin teléfono registrado
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {tiendaSeleccionada && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-tienda-titulo"
        >
          <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-gray-100 bg-white px-4 py-4 sm:px-6">
              <div className="min-w-0">
                <h3 id="modal-tienda-titulo" className="text-xl font-bold text-gray-900 sm:text-2xl">
                  {tiendaSeleccionada.nombre}
                </h3>
                {tiendaSeleccionada.especialidad ? (
                  <p className="text-sm text-gray-600">{tiendaSeleccionada.especialidad}</p>
                ) : null}
                <p className="mt-2 text-sm text-gray-500">
                  {tiendaSeleccionada.productos.length} producto{tiendaSeleccionada.productos.length !== 1 ? 's' : ''} ·{' '}
                  {tiendaSeleccionada.descuentos.length} promoción{tiendaSeleccionada.descuentos.length !== 1 ? 'es' : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={cerrarDetalles}
                className="shrink-0 rounded-lg p-2 text-2xl leading-none text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 sm:px-6">
              {tiendaSeleccionada.fotoLocalUrl ? (
                <div className="mb-5 overflow-hidden rounded-xl">
                  <img
                    src={tiendaSeleccionada.fotoLocalUrl}
                    alt=""
                    className="max-h-52 w-full object-cover sm:max-h-56"
                  />
                </div>
              ) : null}

              <section className="mb-6 rounded-xl border border-gray-100 bg-gray-50/90 p-4">
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Contacto</h4>
                <ul className="space-y-2 text-sm text-gray-800">
                  {tiendaSeleccionada.direccion ? (
                    <li className="flex gap-2">
                      <span className="shrink-0">📍</span>
                      <span>{tiendaSeleccionada.direccion}</span>
                    </li>
                  ) : null}
                  {tiendaSeleccionada.telefono ? (
                    <li className="flex gap-2">
                      <span className="shrink-0">📞</span>
                      <a
                        href={`tel:${String(tiendaSeleccionada.telefono).replace(/\s/g, '')}`}
                        className="font-medium text-emerald-700 hover:underline"
                      >
                        {tiendaSeleccionada.telefono}
                      </a>
                    </li>
                  ) : null}
                  {tiendaSeleccionada.horario ? (
                    <li className="flex gap-2">
                      <span className="shrink-0">🕒</span>
                      <span>{tiendaSeleccionada.horario}</span>
                    </li>
                  ) : null}
                  {tiendaSeleccionada.email ? (
                    <li className="flex gap-2">
                      <span className="shrink-0">📧</span>
                      <a href={`mailto:${tiendaSeleccionada.email}`} className="break-all text-emerald-700 hover:underline">
                        {tiendaSeleccionada.email}
                      </a>
                    </li>
                  ) : null}
                </ul>
                {!tiendaSeleccionada.direccion &&
                !tiendaSeleccionada.telefono &&
                !tiendaSeleccionada.horario &&
                !tiendaSeleccionada.email ? (
                  <p className="text-sm text-gray-500">Esta tienda aún no cargó datos de contacto.</p>
                ) : null}
              </section>

              <div className="mb-4 border-b border-gray-200">
                <div className="flex gap-1" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={pestanaModal === 'productos'}
                    onClick={() => setPestanaModal('productos')}
                    className={`flex-1 rounded-t-lg px-3 py-3 text-sm font-semibold transition sm:flex-none sm:px-5 ${
                      pestanaModal === 'productos'
                        ? 'border-b-2 border-emerald-600 text-emerald-800'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Productos ({tiendaSeleccionada.productos.length})
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={pestanaModal === 'descuentos'}
                    onClick={() => setPestanaModal('descuentos')}
                    className={`flex-1 rounded-t-lg px-3 py-3 text-sm font-semibold transition sm:flex-none sm:px-5 ${
                      pestanaModal === 'descuentos'
                        ? 'border-b-2 border-emerald-600 text-emerald-800'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Descuentos ({tiendaSeleccionada.descuentos.length})
                  </button>
                </div>
              </div>

              {pestanaModal === 'productos' && (
                <div role="tabpanel">
                  {tiendaSeleccionada.productos.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-gray-200 py-10 text-center text-gray-500">
                      No hay productos publicados todavía.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {tiendaSeleccionada.productos.map((producto) => (
                        <div
                          key={producto.id}
                          className="flex flex-col rounded-xl border border-gray-100 bg-white p-4 shadow-sm ring-1 ring-gray-100"
                        >
                          <div className="mb-3 flex gap-3">
                            <ImagenProductoConFallback
                              src={producto.imagenUrl}
                              alt=""
                              className="h-16 w-16 shrink-0 rounded-lg object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <h5 className="font-semibold text-gray-900 leading-tight">{producto.nombre}</h5>
                              {producto.categoria ? (
                                <p className="mt-0.5 text-xs text-gray-500">{producto.categoria}</p>
                              ) : null}
                            </div>
                          </div>
                          {producto.descripcion ? (
                            <p className="mb-3 line-clamp-3 text-sm text-gray-600">{producto.descripcion}</p>
                          ) : null}
                          <div className="mt-auto flex items-end justify-between border-t border-gray-50 pt-3">
                            <span className="text-lg font-bold text-emerald-700">{formatearPrecio(producto.precio)}</span>
                            <span className="text-xs text-gray-500">Stock: {producto.stock ?? '—'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {pestanaModal === 'descuentos' && (
                <div role="tabpanel">
                  {tiendaSeleccionada.descuentos.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-gray-200 py-10 text-center text-gray-500">
                      No hay descuentos activos en este momento.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {tiendaSeleccionada.descuentos.map((descuento) => {
                        const hasta = fechaFinDescuentoLegible(descuento.fechaFin);
                        const nAplica = Array.isArray(descuento.productosAplicables)
                          ? descuento.productosAplicables.length
                          : 0;
                        return (
                          <li
                            key={descuento.id}
                            className="flex flex-col gap-2 rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50/50 p-4 sm:flex-row sm:items-start sm:justify-between"
                          >
                            <div>
                              <h5 className="font-semibold text-amber-950">{descuento.nombre}</h5>
                              <p className="text-2xl font-bold text-amber-700">{descuento.porcentaje}% OFF</p>
                              <p className="text-sm text-amber-900/90">
                                {hasta ? (
                                  <>
                                    Válido hasta <span className="font-medium">{hasta}</span>
                                  </>
                                ) : (
                                  <span className="text-amber-800/80">Vigencia: consultar en tienda</span>
                                )}
                              </p>
                              {nAplica > 0 ? (
                                <p className="mt-1 text-xs text-amber-800/90">Aplica a {nAplica} producto{nAplica !== 1 ? 's' : ''}</p>
                              ) : null}
                            </div>
                            <span className="inline-flex w-fit shrink-0 items-center rounded-full bg-amber-200/90 px-2.5 py-1 text-xs font-semibold text-amber-950">
                              Activo
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
