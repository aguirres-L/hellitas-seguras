import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Componente separado para la sección de citas colapsables
export const DashboardCitasColapsable = ({ 
  datosUsuario, 
  isCargandoUsuario, 
  typeTheme, 
  citasCancelando, 
  handleCancelarCita 
}) => {
  // Estados para citas colapsables y scroll infinito
  const [citasExpandidas, setCitasExpandidas] = useState(false);
  const [citasVisibles, setCitasVisibles] = useState(5);
  const [citasCargando, setCitasCargando] = useState(false);

  // Función para alternar expansión de citas
  const toggleCitasExpandidas = () => {
    setCitasExpandidas(!citasExpandidas);
    if (!citasExpandidas) {
      setCitasVisibles(5);
    }
  };

  // Función para cargar más citas (scroll infinito)
  const cargarMasCitas = async () => {
    if (citasCargando) return;
    
    setCitasCargando(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const totalCitas = datosUsuario?.citas?.length || 0;
      const nuevasCitasVisibles = Math.min(citasVisibles + 5, totalCitas);
      setCitasVisibles(nuevasCitasVisibles);
    } catch (error) {
      console.error('Error al cargar más citas:', error);
    } finally {
      setCitasCargando(false);
    }
  };

  // Función para detectar si hay más citas por cargar
  const hayMasCitas = () => {
    const totalCitas = datosUsuario?.citas?.length || 0;
    return citasVisibles < totalCitas;
  };

  return (
    <div className={typeTheme === 'light'
      ? "bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8"
      : "bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8"
    }>
      {/* Header de Citas con Contador y Botón de Expansión */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h3 className={typeTheme === 'light'?"text-xl font-bold text-gray-900":"text-xl font-bold text-white"}>
            Mis Citas
          </h3>
          {datosUsuario?.citas && datosUsuario.citas.length > 0 && (
            <span className={`px-2 py-1 text-xs rounded-full ${
              typeTheme === 'light' 
                ? 'bg-orange-100 text-orange-800' 
                : 'bg-orange-200 text-orange-900'
            }`}>
              {datosUsuario.citas.length} {datosUsuario.citas.length === 1 ? 'cita' : 'citas'}
            </span>
          )}
        </div>
        
        {/* Botón de Expansión/Colapso */}
        {datosUsuario?.citas && datosUsuario.citas.length > 0 && (
          <button
            onClick={toggleCitasExpandidas}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
              typeTheme === 'light'
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            <span className="text-sm font-medium">
              {citasExpandidas ? 'Ocultar' : 'Ver todas'}
            </span>
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${
                citasExpandidas ? 'rotate-180' : ''
              }`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
      
      {isCargandoUsuario ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <p className="mt-2 text-gray-600">Cargando citas...</p>
        </div>
      ) : (
        <div>
          {(datosUsuario?.citas && datosUsuario.citas.length > 0) ? (
            <div className="space-y-4">
              {/* Mostrar solo las citas visibles */}
              {datosUsuario.citas.slice(0, citasExpandidas ? citasVisibles : Math.min(3, datosUsuario.citas.length)).map((cita, index) => (
                <div key={cita.id || index} className={`rounded-lg shadow-sm border transition-all duration-200 hover:shadow-md ${
                  typeTheme === 'light' 
                    ? 'bg-white border-gray-200' 
                    : 'bg-gray-700 border-gray-600'
                }`}>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              cita.tipoProfesional === 'veterinario' 
                                ? 'bg-blue-100' 
                                : 'bg-purple-100'
                            }`}>
                              <svg className={`w-5 h-5 ${
                                cita.tipoProfesional === 'veterinario' 
                                  ? 'text-blue-600' 
                                  : 'text-purple-600'
                              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h5 className={`font-semibold truncate ${
                                typeTheme === 'light' ? 'text-gray-900' : 'text-white'
                              }`}>
                                {cita.mascotaNombre || 'Mascota no especificada'}
                              </h5>
                              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                cita.estado === 'confirmada' ? 'bg-green-100 text-green-800' :
                                cita.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                cita.estado === 'cancelada' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {cita.estado}
                              </span>
                            </div>
                            <p className={`text-sm ${
                              typeTheme === 'light' ? 'text-gray-600' : 'text-gray-300'
                            }`}>
                              {cita.fecha} • {cita.hora} • {cita.duracion}min
                            </p>
                            <p className={`text-xs ${
                              typeTheme === 'light' ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                              {cita.peluqueriaNombre || cita.veterinariaNombre || 'Profesional no especificado'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-0">
                        {cita.mascotaId && (
                          <Link 
                            to={`/pet-profile/${cita.mascotaId}`}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors duration-200 text-center"
                          >
                            Ver Mascota
                          </Link>
                        )}
                        <button 
                          className={`px-3 py-1 rounded text-xs transition-colors duration-200 ${
                            citasCancelando.has(cita.id) 
                              ? 'bg-gray-400 text-white cursor-not-allowed' 
                              : 'bg-red-500 text-white hover:bg-red-600'
                          }`}
                          onClick={() => handleCancelarCita(cita)}
                          disabled={citasCancelando.has(cita.id)}
                        >
                          {citasCancelando.has(cita.id) ? 'Cancelando...' : 'Cancelar'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Botón de Cargar Más */}
              {citasExpandidas && hayMasCitas() && (
                <div className="text-center pt-4">
                  <button
                    onClick={cargarMasCitas}
                    disabled={citasCargando}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      citasCargando
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : typeTheme === 'light'
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : 'bg-orange-600 hover:bg-orange-700 text-white'
                    }`}
                  >
                    {citasCargando ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Cargando más citas...</span>
                      </div>
                    ) : (
                      `Cargar más citas (${datosUsuario.citas.length - citasVisibles} restantes)`
                    )}
                  </button>
                </div>
              )}
              
              {/* Indicador de fin de lista */}
              {citasExpandidas && !hayMasCitas() && citasVisibles > 5 && (
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-500">
                    Has visto todas tus citas ({datosUsuario.citas.length} total)
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-600">No tienes citas programadas</p>
              <p className="text-sm text-gray-500 mt-1">Agenda una cita con un veterinario o peluquero</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
