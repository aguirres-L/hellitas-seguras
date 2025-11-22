import React, { useState, useEffect } from 'react';
import { obtenerNivelesDisponibles, obtenerInfoPrompt, obtenerPrompt } from '../prompts/promptManager';

export const SelectorNivelPrompt = ({ 
  tipoConsejo, 
  mascota, 
  onPromptSeleccionado, 
  promptActual = null 
}) => {
  const [nivelSeleccionado, setNivelSeleccionado] = useState(1);
  const [nivelesDisponibles, setNivelesDisponibles] = useState([]);
  const [promptGenerado, setPromptGenerado] = useState('');

  // Cargar niveles disponibles cuando cambie el tipo de consejo
  useEffect(() => {
    if (tipoConsejo) {
      const niveles = obtenerNivelesDisponibles(tipoConsejo);
      setNivelesDisponibles(niveles);
      
      // Seleccionar el primer nivel disponible por defecto
      if (niveles.length > 0) {
        setNivelSeleccionado(niveles[0]);
      }
    }
  }, [tipoConsejo]);

  // Generar prompt cuando cambie el nivel seleccionado
  useEffect(() => {
    if (tipoConsejo && mascota /* && nivelSeleccionado */) {
      try {
        const prompt = obtenerPrompt(tipoConsejo, 1, mascota);
        setPromptGenerado(prompt);
        onPromptSeleccionado(prompt);
      } catch (error) {
        console.error('Error generando prompt:', error);
        setPromptGenerado('');
        onPromptSeleccionado(null);
      }
    }
  }, [tipoConsejo, mascota, nivelSeleccionado, onPromptSeleccionado]);

  // Si no hay niveles disponibles, no mostrar el selector
  if (nivelesDisponibles.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/60 rounded-lg p-6 shadow-sm mb-6">
      <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Nivel de Consejo
      </h4>
      <p className="text-sm text-gray-600 mb-4">
        Selecciona el nivel de detalle que deseas para los consejos de {tipoConsejo}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {nivelesDisponibles.map((nivel) => {
          const info = obtenerInfoPrompt(tipoConsejo, nivel);
          if (!info) return null;

          return (
            <button
              key={nivel}
              onClick={() => setNivelSeleccionado(nivel)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                nivelSeleccionado === nivel
                  ? `${info.color} border-current shadow-md transform scale-105`
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start">
                <div className="text-2xl mr-3">{info.icono}</div>
                <div className="flex-1">
                  <div className="font-medium text-sm mb-1">
                    Nivel {nivel}: {info.titulo}
                  </div>
                  <div className="text-xs text-gray-500">
                    {info.descripcion}
                  </div>
                </div>
                {nivelSeleccionado === nivel && (
                  <div className="ml-2">
                    <svg className="w-5 h-5 text-current" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 0116 0zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      {nivelSeleccionado && (
        <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-purple-800 text-sm font-medium">
              Nivel {nivelSeleccionado} seleccionado: {obtenerInfoPrompt(tipoConsejo, nivelSeleccionado)?.titulo}
            </span>
          </div>
        </div>
      )}

      {/* Vista previa del prompt (opcional, para debugging) */}
      {process.env.NODE_ENV === 'development' && promptGenerado && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
            Ver prompt generado (solo desarrollo)
          </summary>
          <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-40">
            {promptGenerado.substring(0, 500)}...
          </div>
        </details>
      )}
    </div>
  );
};
