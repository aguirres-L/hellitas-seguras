import React from 'react';
import { obtenerConsejos } from '../utils/consejosCuidado';

// Este componente recibe props
export const ConsejosCuidado = ({ razaSeleccionada, mostrarConsejos = true }) => {
  const consejos = obtenerConsejos(razaSeleccionada);

  if (!mostrarConsejos || !consejos) {
    return null;
  }

  return (
    <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
      <div className="text-center mb-6">
        <div className="text-3xl mb-2">🐕</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {consejos.titulo}
        </h3>
        <p className="text-gray-600 text-sm">
          {consejos.descripcion}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {consejos.consejos.map((categoria, index) => (
          <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              {categoria.categoria}
            </h4>
            <ul className="space-y-2">
              {categoria.items.map((item, itemIndex) => (
                <li key={itemIndex} className="text-sm text-gray-600 flex items-start">
                  <span className="text-blue-400 mr-2 mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {consejos.mensajeEspecial && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-800 font-medium">
                {consejos.mensajeEspecial}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          💡 Estos consejos son generales. Siempre consulta con tu veterinario para recomendaciones específicas.
        </p>
      </div>
    </div>
  );
};
