import { useTheme } from "../contexts/ThemeContext";

export default function Peluquerias({peluquerias, manejarAbrirFormularioPeluqueria, isCargando = false}) {
  const { typeTheme } = useTheme();

  // Función helper para convertir fecha de Firebase a Date
  const convertirFecha = (fecha) => {
    if (!fecha) return null;
    // Si es un Timestamp de Firebase
    if (fecha.seconds) {
      return new Date(fecha.seconds * 1000);
    }
    // Si ya es un objeto Date
    if (fecha instanceof Date) {
      return fecha;
    }
    // Si es un string o número
    return new Date(fecha);
  };

  // Función para filtrar descuentos que aún no han expirado
  // Muestra descuentos si la fecha actual NO ha pasado la fecha de fin
  const obtenerDescuentosVigentes = (descuentos) => {
    if (!descuentos || descuentos.length === 0) return [];
    
    const ahora = new Date();
    
    return descuentos.filter(descuento => {
      // Verificar que esté activo
      if (descuento.isActivo === false) return false;
      
      // Convertir fecha de fin
      const fechaFin = convertirFecha(descuento.fechaFin);
      
      if (!fechaFin) return false;
      
      // IMPORTANTE: Solo mostrar si la fecha actual NO ha pasado la fecha de fin
      // Esto permite ver descuentos futuros (para anticipación) y vigentes
      // Pero NO muestra descuentos que ya expiraron
      return ahora <= fechaFin;
    });
  };


    return(
        <div className="mt-12">
        <h3 className={typeTheme === 'dark'
  ? "text-2xl font-bold mb-6 text-white"
  : "text-2xl font-bold mb-6 text-gray-900"
}>Peluquerías Registradas</h3>
        
        {isCargando ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <p className="mt-2 text-gray-600">Cargando peluqueros...</p>
          </div>
        ) : peluquerias.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No hay peluqueros disponibles en este momento.</p>
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-6 pb-4">
            {peluquerias.map((peluqueria) => (
              <div key={peluqueria.id} className="bg-white p-6 rounded-lg shadow-sm min-w-[300px] flex-shrink-0 overflow-hidden">
                {/* Imagen del local */}
                <div 
                  className="mb-4 overflow-hidden rounded-lg relative" 
                  style={{ 
                    width: '100%', 
                    height: '128px', 
                    minHeight: '128px',
                    maxHeight: '128px',
                    flexShrink: 0
                  }}
                >
                  {peluqueria.fotoLocalUrl ? (
                    <img 
                      src={peluqueria.fotoLocalUrl} 
                      alt={`Local de ${peluqueria.nombre}`}
                      className="rounded-lg shadow-sm"
                      style={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '128px',
                        minWidth: '100%',
                        maxWidth: '100%',
                        minHeight: '128px',
                        maxHeight: '128px',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                    />
                  ) : (
                    <div className="w-full h-32 bg-purple-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <svg className="w-12 h-12 text-purple-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <p className="text-xs text-purple-400">Sin foto del local</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-bold text-lg text-purple-600">{peluqueria.nombre}</h4>
             {/*      <span className="text-sm text-gray-500">{peluqueria.distancia}</span>
              */}   </div>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">📍</span> {peluqueria.direccion}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">📞</span> {peluqueria.telefono}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">🕒</span> {peluqueria.horario}
                  </p>
                </div>
                
                {/* Mostrar descuentos que aún no han expirado */}
                {(() => {
                  const descuentosVigentes = obtenerDescuentosVigentes(peluqueria.descuentos);
                  
                  if (descuentosVigentes.length === 0) return null;
                  
                  const ahora = new Date();
                  
                  return (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-green-600 mb-2">💸 Descuentos disponibles:</p>
                      <div className="space-y-1">
                        {descuentosVigentes.map((descuento) => {
                          const fechaFin = convertirFecha(descuento.fechaFin);
                          const fechaInicio = convertirFecha(descuento.fechaInicio);
                          
                          // Verificar si el descuento ya comenzó o aún no
                          const haComenzado = fechaInicio && ahora >= fechaInicio;
                          const estaVigente = haComenzado && fechaFin && ahora <= fechaFin;
                          
                          return (
                            <div key={descuento.id} className={`border rounded px-2 py-1.5 ${
                              estaVigente 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-yellow-50 border-yellow-200'
                            }`}>
                              <div className="flex items-center justify-between mb-1">
                                <p className={`text-xs font-semibold ${
                                  estaVigente ? 'text-green-800' : 'text-yellow-800'
                                }`}>
                                  {descuento.nombre}
                                </p>
                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                                  estaVigente 
                                    ? 'text-green-700 bg-green-100' 
                                    : 'text-yellow-700 bg-yellow-100'
                                }`}>
                                  {descuento.porcentaje}% OFF
                                </span>
                              </div>
                              <div className="space-y-0.5">
                                {!haComenzado && fechaInicio && (
                                  <p className={`text-xs ${
                                    estaVigente ? 'text-green-600' : 'text-yellow-600'
                                  }`}>
                                    Inicia: {fechaInicio.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                  </p>
                                )}
                                {fechaFin && (
                                  <p className={`text-xs ${
                                    estaVigente ? 'text-green-600' : 'text-yellow-600'
                                  }`}>
                                    Válido hasta: {fechaFin.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
                
                <div className="space-y-2">
                  <button 
                    onClick={() => manejarAbrirFormularioPeluqueria(peluqueria)}
                    className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                  >
                    Reservar Cita
                  </button>
                 {/*  <button className="w-full border border-purple-600 text-purple-600 py-2 rounded-lg hover:bg-purple-50">
                    Ver Detalles
                  </button> */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
}