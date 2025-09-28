import React from 'react';

// Este componente no recibe props
const VetDashboard = () => {
  return (
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto py-8 px-4">
            <h2 className="text-2xl font-bold mb-6">Panel Veterinario</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Buscar Mascota</label>
                <input type="text" placeholder="Ingresa el ID o nombre" className="w-full p-2 border rounded-lg" />
              </div>
    
              {/* Ejemplo de ficha médica */}
              <div className="border rounded-lg p-4 mb-4">
                <h3 className="font-bold mb-2">Firulais (ID: 123456)</h3>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Peso (kg)</label>
                    <input type="text" defaultValue="28" className="w-full p-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Última vacuna</label>
                    <input type="date" defaultValue="2023-10-15" className="w-full p-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Próximo control</label>
                    <input type="date" className="w-full p-2 border rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Notas médicas</label>
                  <textarea className="w-full p-2 border rounded-lg" rows="3" defaultValue="En buen estado, necesita perder 2kg."></textarea>
                </div>
                <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Guardar Cambios</button>
              </div>
            </div>
          </div>
        </div>
    
  );
};

export default VetDashboard; 