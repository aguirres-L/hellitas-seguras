import { useTheme } from "../contexts/ThemeContext";

export default function Veterinarias({clinicasVeterinarias, manejarAbrirFormularioVeterinaria, isCargando = false}) {
  const { typeTheme } = useTheme();

    return (

        <div className="mt-12">
        <h3 className={typeTheme === 'dark'
  ? "text-2xl font-bold mb-6 text-white"
  : "text-2xl font-bold mb-6 text-gray-900"
}>
  Clínicas Veterinarias Registradas
</h3>
        
        {isCargando ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Cargando veterinarios...</p>
          </div>
        ) : clinicasVeterinarias.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No hay veterinarios disponibles en este momento.</p>
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-4 md:gap-6 pb-4">
            {clinicasVeterinarias.map((clinica) => (
              <div key={clinica.id} className="bg-white p-4 md:p-6 rounded-lg shadow-sm min-w-[280px] sm:min-w-[320px] md:min-w-[300px] flex-shrink-0">
                {/* Imagen del local */}
                <div className="mb-4">
                  {clinica.fotoLocalUrl ? (
                    <img 
                      src={clinica.fotoLocalUrl} 
                      alt={`Local de ${clinica.nombre}`}
                      className="w-full h-32 object-cover rounded-lg shadow-sm"
                    />
                  ) : (
                    <div className="w-full h-32 bg-blue-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <svg className="w-12 h-12 text-blue-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <p className="text-xs text-blue-400">Sin foto del local</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-bold text-base md:text-lg text-blue-600">{clinica.nombre}</h4>
               {/*    <span className="text-xs md:text-sm text-gray-500">{clinica.distancia}</span>
                */} </div>
                <div className="space-y-1 md:space-y-2 mb-4">
                  <p className="text-xs md:text-sm text-gray-600">
                    <span className="font-medium">📍</span> {clinica.direccion}
                  </p>
                  <p className="text-xs md:text-sm text-gray-600">
                    <span className="font-medium">📞</span> {clinica.telefono}
                  </p>
                  <p className="text-xs md:text-sm text-gray-600">
                    <span className="font-medium">🕒</span> {clinica.horario}
                  </p>
                </div>
                <div className="mb-4">
               {/* 
                El puntaje de las estrellas de añade solo cuando el usario ya hizo una cita con la clinica o peluqueria 
               <div className="flex items-center mb-2">
                    <span className="text-yellow-500">⭐</span>
                    <span className="ml-1 text-xs md:text-sm font-medium">{clinica.calificacion}</span>
                  </div> */}
                  <div className="flex flex-wrap gap-1">
                    {clinica.especialidades.map((especialidad, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {especialidad}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <button 
                    onClick={() => manejarAbrirFormularioVeterinaria(clinica)}
                    className="w-full bg-blue-600 text-white py-2 px-3 md:px-4 rounded-lg hover:bg-blue-700 text-sm md:text-base"
                  >
                    Agendar Cita
                  </button>
            {/*       <button className="w-full border border-blue-600 text-blue-600 py-2 px-3 md:px-4 rounded-lg hover:bg-blue-50 text-sm md:text-base">
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