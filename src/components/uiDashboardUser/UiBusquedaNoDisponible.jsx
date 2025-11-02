export default function UiBusquedaNoDisponible({ setTab }) {
    return (
       <div className="animate-fade-in flex flex-col gap-3">
            {/* UI de construcción para búsqueda de gatos */}
            <div className="text-center py-12 px-6">
              {/* Icono de construcción */}
              <div className="w-20 h-20 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              
              {/* Título */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Búsqueda de Razas de Gatos
              </h3>
              
              {/* Mensaje principal */}
              <p className="text-gray-600 mb-4 max-w-md mx-auto">
                Esta funcionalidad está en construcción. Pronto podrás buscar y seleccionar la raza de tu gato de manera inteligente.
              </p>
              
              {/* Características que vendrán */}
              <div className="bg-orange-50 rounded-lg p-4 mb-6 max-w-md mx-auto">
                <h4 className="font-semibold text-orange-800 mb-2">Próximamente:</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Búsqueda inteligente de razas</li>
                  <li>• Filtros por características</li>
                  <li>• Información detallada de cada raza</li>
                </ul>
              </div>
              
              {/* Botón para volver a perros */}
              {/* <button
                onClick={() => setTab(1)}
                className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver a Perros
              </button> */}
            </div>
          </div>
    );
}