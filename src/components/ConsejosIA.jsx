import React, { useState, useEffect } from 'react';
import { aiService } from '../services/aiService';
import { TIPOS_CONSEJOS } from '../config/tiposConsejos';
import { SelectorNivelPrompt } from './SelectorNivelPrompt';

// Importar debugger y test solo en desarrollo
if (process.env.NODE_ENV === 'development') {
  import('../utils/cacheDebugger');
  import('../utils/testFrenoPeticiones');
}

// Este componente recibe props
export const ConsejosIA = ({ 
  consejos, 
  cargando, 
  error, 
  fuente, 
  tematica,
  fechaCreacion,
  peticionesRestantes,
  historial,
  estadisticasTematicas,
  puedeGenerarConsejos,
  tipoConsejoSeleccionado,
  setTipoConsejoSeleccionado,
  promptSeleccionado,
  setPromptSeleccionado,
  onGenerarConsejos, 
  onLimpiarConsejos,
  onRegenerarConsejos,
  onCargarConsejoDelHistorial,
  onLimpiarHistorial,
  testAPIs,
  testModeloEspecifico,
  mascota = null
}) => {
  const [estadisticasCache, setEstadisticasCache] = useState(null);

  // Actualizar estadísticas del cache
  useEffect(() => {
    const stats = aiService.obtenerEstadisticasCache();
    setEstadisticasCache(stats);
  }, [consejos]); // Actualizar cuando cambien los consejos

  // Función para formatear fechas
  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return '';
    
    try {
      const fecha = new Date(fechaISO);
      return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.warn('Error formateando fecha:', error);
      return '';
    }
  };

  // Función para formatear el texto con markdown básico
  const formatearConsejos = (texto) => {
    if (!texto) return '';

    return texto
      .split('\n')
      .map((linea, index) => {
        // Títulos principales (##)
        if (linea.startsWith('**') && linea.endsWith('**')) {
          return (
            <h4 key={index} className="font-bold text-lg text-gray-800 mb-3 mt-4 first:mt-0">
              {linea.replace(/\*\*/g, '')}
            </h4>
          );
        }
        
        // Subtítulos (###)
        if (linea.startsWith('•')) {
          return (
            <li key={index} className="text-sm text-gray-700 mb-2 ml-4">
              {linea.substring(1).trim()}
            </li>
          );
        }
        
        // Párrafos normales
        if (linea.trim()) {
          return (
            <p key={index} className="text-sm text-gray-700 mb-3">
              {linea}
            </p>
          );
        }
        
        return null;
      })
      .filter(Boolean);
  };

  return (
    <div className="space-y-4">
      {/* Header con botones */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div>
          <h3 className="font-bold text-lg text-gray-900 mb-1">
            Consejos de Cuidado Inteligentes
          </h3>
          <p className="text-sm text-gray-600">
            Consejos personalizados basados en la raza de tu mascota
          </p>
          <p className="text-xs text-gray-500 mt-1">
            📅 Dispones de 3 consejos personalizados por mes
          </p>
          {tematica && (
            <p className="text-xs text-purple-600 mt-1">
              🎯 Temática: {tematica}
            </p>
          )}
          {fechaCreacion && (
            <p className="text-xs text-gray-500 mt-1">
              📅 Creado: {formatearFecha(fechaCreacion)}
            </p>
          )}
          {peticionesRestantes !== null && (
            <p className={`text-xs mt-1 ${
              peticionesRestantes === 0 
                ? 'text-red-600' 
                : peticionesRestantes === 1
                  ? 'text-orange-600'
                  : 'text-blue-600'
            }`}>
              {peticionesRestantes === 0 
                ? '🔒 Límite mensual alcanzado (3/3 consejos generados)' 
                : peticionesRestantes === 1
                  ? `⚠️ Último consejo disponible este mes (${3 - peticionesRestantes}/3 usados)`
                  : `📊 Tienes ${peticionesRestantes} consejos disponibles este mes (${3 - peticionesRestantes}/3 usados)`
              }
            </p>
          )}
          {estadisticasTematicas && estadisticasTematicas.total > 0 && (
            <p className="text-xs text-green-600 mt-1">
              🎯 Hay temáticas diferentes disponibles
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
          {/* Botones de test de APIs (solo en desarrollo) */}
          {process.env.NODE_ENV === 'development' && testAPIs && (
            <div className="flex gap-2">
              <button
                onClick={testAPIs}
                className="px-3 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors duration-200 text-sm font-medium flex items-center"
                title="Test de APIs de IA"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Test APIs
              </button>
              
              <button
                onClick={() => testModeloEspecifico('gpt2')}
                className="px-3 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 text-sm font-medium"
                title="Test modelo GPT2"
              >
                Test GPT2
              </button>
              
              <button
                onClick={() => testModeloEspecifico('distilgpt2')}
                className="px-3 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors duration-200 text-sm font-medium"
                title="Test modelo DistilGPT2"
              >
                Test DistilGPT2
              </button>
            </div>
          )}
          
          {/* Botón principal */}
          {!cargando && (
            <button
              onClick={() => consejos ? onRegenerarConsejos() : onGenerarConsejos(tipoConsejoSeleccionado)}
              disabled={!puedeGenerarConsejos || !tipoConsejoSeleccionado}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium flex items-center ${
                !puedeGenerarConsejos || !tipoConsejoSeleccionado
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : consejos 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
              title={
                !puedeGenerarConsejos 
                  ? 'Límite mensual alcanzado' 
                  : !tipoConsejoSeleccionado 
                    ? 'Selecciona un tipo de consejo primero' 
                    : ''
              }
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {!puedeGenerarConsejos 
                ? 'Límite Alcanzado' 
                : !tipoConsejoSeleccionado
                  ? 'Selecciona un tipo'
                  : consejos 
                    ? 'Regenerar Consejos' 
                    : 'Generar Consejos'
              }
            </button>
          )}
          
        
        </div>
      </div>

      {/* Selector de Tipos de Consejos */}
      <div className="bg-white/60 rounded-lg p-6 shadow-sm mb-6">
        <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Selecciona el tipo de consejo que necesitas
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          Elige una categoría específica para obtener consejos personalizados y detallados
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TIPOS_CONSEJOS.map((tipo) => (
            <button
              key={tipo.id}
              onClick={() => setTipoConsejoSeleccionado(tipo.id)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-center ${
                tipoConsejoSeleccionado === tipo.id
                  ? `${tipo.color} border-current shadow-md transform scale-105`
                  : `bg-gray-50 text-gray-700 border-gray-200 hover:${tipo.colorHover} hover:border-current hover:shadow-sm`
              }`}
            >
              <div className="text-2xl mb-2">{tipo.icono}</div>
              <div className="font-medium text-sm">{tipo.nombre}</div>
              <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                {tipo.descripcion}
              </div>
            </button>
          ))}
        </div>
        
        {tipoConsejoSeleccionado && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-blue-800 text-sm font-medium">
                Tipo seleccionado: {TIPOS_CONSEJOS.find(t => t.id === tipoConsejoSeleccionado)?.nombre}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Selector de Nivel de Prompt (solo para tipos con prompts jerárquicos) */}
      {tipoConsejoSeleccionado && mascota && (
        <div className="mb-6">
          <SelectorNivelPrompt
            tipoConsejo={tipoConsejoSeleccionado}
            mascota={mascota}
            onPromptSeleccionado={setPromptSeleccionado}
            promptActual={promptSeleccionado}
          />
        </div>
      )}

      {/* Estado de carga */}
      {cargando && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
          <p className="text-blue-700 font-medium">Generando consejos personalizados...</p>
          <p className="text-blue-600 text-sm mt-1">
            Esto puede tomar unos segundos
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 0116 0zm-7-4a1 1 0 011-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Consejos generados */}
      {consejos && !cargando && (
        <div className={`rounded-lg p-6 ${
          fuente === 'ia_no_disponible' 
            ? 'bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200' 
            : 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200'
        }`}>
          <div className="space-y-4">
            {formatearConsejos(consejos)}
          </div>
          
          {/* Footer con información de la fuente */}
          <div className={`mt-6 pt-4 border-t ${
            fuente === 'ia_no_disponible' 
              ? 'border-orange-200' 
              : 'border-blue-200'
          }`}>
            <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2 ${
              fuente === 'ia_no_disponible' 
                ? 'text-orange-600' 
                : 'text-blue-600'
            }`}>
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>
                  {fuente === 'huggingface' ? 'Consejos generados por IA (Hugging Face)' : 
                   fuente === 'cohere' ? 'Consejos generados por IA (Cohere)' : 
                   fuente === 'ia_no_disponible' ? 'Servicio de IA temporalmente no disponible' :
                   'Consejos predefinidos'}
                </span>
              </div>
              <div className={fuente === 'ia_no_disponible' ? 'text-orange-500' : 'text-blue-500'}>
                {fuente === 'ia_no_disponible' 
                  ? '🔄 Intenta nuevamente en unos minutos' 
                  : '💡 Siempre consulta con tu veterinario para recomendaciones específicas'
                }
              </div>
            </div>
            
            {/* Información de fecha y fuente */}
            <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-gray-500 gap-2">
              {fechaCreacion && (
                <div className="flex items-center">
                  <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <span>Generado el {formatearFecha(fechaCreacion)}</span>
                </div>
              )}
              <div className="text-gray-400">
                {fuente === 'huggingface' ? '🤖 IA' : 
                 fuente === 'cohere' ? '🧠 Cohere' : 
                 fuente === 'ia_no_disponible' ? '⚠️ IA no disponible' :
                 '📚 Predefinidos'}
              </div>
            </div>
            
            {/* Información del cache */}
            {estadisticasCache && estadisticasCache.total > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                📦 Cache: {estadisticasCache.validas} consejos guardados localmente
              </div>
            )}
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {!consejos && !cargando && !error && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <div className="text-gray-400 mb-3">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-2">Consejos personalizados disponibles</p>
          <p className="text-gray-500 text-sm">
            Haz clic en "Generar Consejos" para obtener recomendaciones específicas para tu mascota
          </p>
        </div>
      )}

      {/* Historial de Consejos */}
      {historial && historial.length > 0 && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
        {/*   <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-lg text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Historial de Consejos
            </h4>
            <button
              onClick={onLimpiarHistorial}
              className="text-xs text-red-600 hover:text-red-700 transition-colors duration-200"
              title="Limpiar historial"
            >
              🗑️ Limpiar
            </button>
          </div> */}
          
          <div className="space-y-3">
            {historial.map((item, index) => (
              <div 
                key={item.id} 
                className="bg-white/60 rounded-lg p-4 border border-green-100 hover:border-green-200 transition-colors duration-200 cursor-pointer"
                onClick={() => onCargarConsejoDelHistorial(item.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-green-800 bg-green-100 px-2 py-1 rounded-full">
                        {item.tematica}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatearFecha(item.fechaCreacion)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {item.consejos.substring(0, 100)}...
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500">Raza: {item.raza}</span>
                      <span className="text-xs text-blue-600">
                        {item.fuente === 'huggingface' ? '🤖 IA' : 
                         item.fuente === 'cohere' ? '🧠 Cohere' : '📚 Predefinidos'}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-xs text-green-600 text-center">
            📦 {historial.length} consejos guardados localmente • Haz clic para cargar
          </div>
        </div>
      )}
    </div>
  );
};
