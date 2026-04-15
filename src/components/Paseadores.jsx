import { useTheme } from '../contexts/ThemeContext';

function enlaceTelefono(telefono) {
  const soloDigitos = String(telefono || '').replace(/\D/g, '');
  return soloDigitos ? `tel:${soloDigitos}` : undefined;
}

/**
 * Listado de paseadores (sin flujo de citas en app: contacto por teléfono).
 */
export default function Paseadores({ paseadores, isCargando = false }) {
  const { typeTheme } = useTheme();

  const tituloClase =
    typeTheme === 'dark' ? 'text-2xl font-bold mb-6 text-white' : 'text-2xl font-bold mb-6 text-gray-900';

  return (
    <div className="mt-12 max-md:mt-14">
      <h3 className={tituloClase}>Paseadores registrados</h3>
      

      {isCargando ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
          <p className="mt-2 text-gray-600">Cargando paseadores...</p>
        </div>
      ) : paseadores.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No hay paseadores disponibles en este momento.</p>
        </div>
      ) : (
        <div className="flex overflow-x-auto gap-6 pb-4">
          {paseadores.map((p) => {
            const hrefTel = enlaceTelefono(p.telefono);
            const etiquetasServicios = Array.isArray(p.servicios) ? p.servicios : [];
            return (
              <div
                key={p.id}
                className="bg-white p-6 rounded-lg shadow-sm min-w-[300px] flex-shrink-0 overflow-hidden"
              >
                <div
                  className="mb-4 overflow-hidden rounded-lg relative"
                  style={{
                    width: '100%',
                    height: '128px',
                    minHeight: '128px',
                    maxHeight: '128px',
                    flexShrink: 0,
                  }}
                >
                  {p.fotoLocalUrl ? (
                    <img
                      src={p.fotoLocalUrl}
                      alt={`${p.nombre}`}
                      className="rounded-lg shadow-sm"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '128px',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  ) : (
                    <div className="w-full h-32 bg-amber-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-4xl" aria-hidden>
                          🐕
                        </span>
                        <p className="text-xs text-amber-600 mt-1">Sin foto</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-bold text-lg text-amber-700">{p.nombre}</h4>
                </div>

                {p.especialidadResumen ? (
                  <p className="text-sm text-gray-500 mb-2">{p.especialidadResumen}</p>
                ) : null}

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">📍</span> {p.direccion}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">📞</span> {p.telefono}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">🕒</span> {p.horario}
                  </p>
                </div>

                {etiquetasServicios.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {etiquetasServicios.map((nombre, index) => (
                      <span key={index} className="bg-amber-100 text-amber-900 text-xs px-2 py-1 rounded">
                        {nombre}
                      </span>
                    ))}
                  </div>
                )}

                {hrefTel ? (
                  <a
                    href={hrefTel}
                    className="block w-full text-center bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition-colors font-medium"
                  >
                    Llamar para coordinar
                  </a>
                ) : (
                  <p className="text-xs text-gray-500 text-center">Teléfono no disponible</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
