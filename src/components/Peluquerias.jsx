import { useTheme } from "../contexts/ThemeContext";

export default function Peluquerias({peluquerias, manejarAbrirFormularioPeluqueria, isCargando = false}) {

  const { typeTheme } = useTheme();


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
              <div key={peluqueria.id} className="bg-white p-6 rounded-lg shadow-sm min-w-[300px] flex-shrink-0">
                {/* Imagen del local */}
                <div className="mb-4">
                  {peluqueria.fotoLocalUrl ? (
                    <img 
                      src={peluqueria.fotoLocalUrl} 
                      alt={`Local de ${peluqueria.nombre}`}
                      className="w-full h-32 object-cover rounded-lg shadow-sm"
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
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <span className="text-yellow-500">⭐</span>
                    <span className="ml-1 text-sm font-medium">{peluqueria.calificacion}</span>
                  </div>
                {/*   <div className="flex flex-wrap gap-1">
                    {peluqueria.servicios.map((servicio, index) => (
                      <span key={index} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                        {servicio}
                      </span>
                    ))}
                  </div> */}
                </div>
                <div className="space-y-2">
                  <button 
                    onClick={() => manejarAbrirFormularioPeluqueria(peluqueria)}
                    className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                  >
                    Reservar Cita
                  </button>
                  <button className="w-full border border-purple-600 text-purple-600 py-2 rounded-lg hover:bg-purple-50">
                    Ver Detalles
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
}