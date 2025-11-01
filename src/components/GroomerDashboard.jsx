import React from 'react';

// Este componente no recibe props
const GroomerDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Peluquero</h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Citas de Hoy</h2>
            <p className="text-3xl font-bold text-pink-600">5</p>
            <p className="text-gray-600">Citas programadas</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Clientes</h2>
            <p className="text-3xl font-bold text-orange-600">18</p>
            <p className="text-gray-600">Clientes activos</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Ingresos</h2>
            <p className="text-3xl font-bold text-purple-600">$1,850</p>
            <p className="text-gray-600">Este mes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroomerDashboard; 