import React, { useState } from 'react';

/**
 * Lista de sugerencias/mejoras (colección sugerenciasMejoras) para super admin.
 */
export default function SugerenciasMejorasPanel({
  lista,
  isCargando,
  typeTheme,
  onRefrescar,
}) {
  const [idExpandido, setIdExpandido] = useState(null);

  const formatearFecha = (fc) => {
    if (!fc) return '—';
    const fecha =
      typeof fc.seconds === 'number'
        ? new Date(fc.seconds * 1000)
        : fc?.toDate?.()
        ? fc.toDate()
        : null;
    if (!fecha || Number.isNaN(fecha.getTime())) return '—';
    return fecha.toLocaleString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const tituloClase =
    typeTheme === 'light' ? 'text-xl font-bold text-gray-900' : 'text-xl font-bold text-white';
  const subClase = typeTheme === 'light' ? 'text-gray-600' : 'text-gray-400';
  const cardClass =
    typeTheme === 'light'
      ? 'bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100'
      : 'bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700';
  const theadClass = typeTheme === 'light' ? 'bg-gray-50' : 'bg-gray-900/80';
  const thClass =
    typeTheme === 'light'
      ? 'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
      : 'px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider';
  const tdText = typeTheme === 'light' ? 'text-gray-900' : 'text-gray-100';
  const tdMuted = typeTheme === 'light' ? 'text-gray-500' : 'text-gray-400';
  const rowHover = typeTheme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-gray-700/50';
  const divideClass = typeTheme === 'light' ? 'divide-y divide-gray-200' : 'divide-y divide-gray-700';

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className={tituloClase}>Sugerencias y mejoras</h3>
          <p className={`text-sm mt-1 ${subClase}`}>
            Feedback enviado desde el menú del dashboard ({lista.length} registro
            {lista.length !== 1 ? 's' : ''})
          </p>
        </div>
        <button
          type="button"
          onClick={onRefrescar}
          disabled={isCargando}
          className={
            typeTheme === 'light'
              ? 'inline-flex items-center justify-center rounded-lg border border-orange-300 bg-white px-4 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-50 disabled:opacity-50'
              : 'inline-flex items-center justify-center rounded-lg border border-orange-500/50 bg-gray-800 px-4 py-2 text-sm font-semibold text-orange-300 hover:bg-gray-700 disabled:opacity-50'
          }
        >
          {isCargando ? 'Actualizando…' : 'Actualizar lista'}
        </button>
      </div>

      {isCargando && lista.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-red-500" />
          <p className={`mt-2 ${subClase}`}>Cargando sugerencias…</p>
        </div>
      ) : lista.length === 0 ? (
        <div
          className={
            typeTheme === 'light'
              ? 'rounded-xl border border-dashed border-gray-300 bg-gray-50/80 px-6 py-12 text-center'
              : 'rounded-xl border border-dashed border-gray-600 bg-gray-800/50 px-6 py-12 text-center'
          }
        >
          <p className={typeTheme === 'light' ? 'text-gray-600' : 'text-gray-300'}>
            Todavía no hay sugerencias registradas.
          </p>
        </div>
      ) : (
        <div className={`${cardClass} overflow-x-auto`}>
          <table className={`min-w-full ${divideClass}`}>
            <thead className={theadClass}>
              <tr>
                <th className={thClass}>Fecha</th>
                <th className={thClass}>Usuario</th>
                <th className={thClass}>Mensaje</th>
                <th className={thClass}>Captura</th>
                <th className={thClass}>Origen</th>
                <th className={thClass}>UID</th>
              </tr>
            </thead>
            <tbody
              className={
                typeTheme === 'light' ? 'divide-y divide-gray-200 bg-white' : 'divide-y divide-gray-700 bg-gray-800'
              }
            >
              {lista.map((item) => {
                const isExpandido = idExpandido === item.id;
                const mensaje = item.mensaje || '';
                return (
                  <tr key={item.id} className={rowHover}>
                    <td className={`whitespace-nowrap px-4 py-3 text-sm ${tdMuted}`}>
                      {formatearFecha(item.fechaCreacion)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className={`font-medium ${tdText}`}>{item.nombreUsuario || '—'}</div>
                      <div className={`text-xs ${tdMuted}`}>{item.emailUsuario || '—'}</div>
                    </td>
                    <td className="max-w-md px-4 py-3 text-sm">
                      <p className={`${tdText} ${!isExpandido ? 'line-clamp-3' : ''}`}>{mensaje}</p>
                      {mensaje.length > 180 && (
                        <button
                          type="button"
                          onClick={() => setIdExpandido(isExpandido ? null : item.id)}
                          className="mt-1 text-xs font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400"
                        >
                          {isExpandido ? 'Ver menos' : 'Ver más'}
                        </button>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {item.urlCaptura ? (
                        <a
                          href={item.urlCaptura}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-orange-600 hover:text-orange-800 underline dark:text-orange-400"
                        >
                          Ver imagen
                        </a>
                      ) : (
                        <span className={tdMuted}>—</span>
                      )}
                    </td>
                    <td className={`whitespace-nowrap px-4 py-3 text-sm ${tdMuted}`}>
                      {item.origen || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <code
                        className={
                          typeTheme === 'light'
                            ? 'block max-w-[8rem] truncate text-xs text-gray-600'
                            : 'block max-w-[8rem] truncate text-xs text-gray-400'
                        }
                        title={item.usuarioId}
                      >
                        {item.usuarioId || '—'}
                      </code>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
