import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Dashboard from './Dashboard';
import DashboardAdmin from './DashboardAdmin';
import DashboardSuperAdmin from './DashboardSuperAdmin';
 

// Este componente no recibe props
const DashboardSelector = () => {
  const { datosUsuario, isCargando } = useAuth();

  // Mostrar loading mientras se cargan los datos
  if (isCargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // Determinar qué dashboard mostrar basado en el rol
  const rol = datosUsuario?.rol || 'usuario';

  // Renderizar el dashboard correspondiente
  switch (rol) {
    case 'admin':
      return <DashboardAdmin />;
    case 'superAdmin':
      return <DashboardSuperAdmin />;
    case 'usuario':
    default:
      return <Dashboard />;
  }
};

export default DashboardSelector; 