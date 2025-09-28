import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRouteAdmin = ({ children }) => {
  const { datosUsuario, isCargando, isAutenticado } = useAuth();

  // Mostrar loading mientras se cargan los datos
  if (isCargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAutenticado) {
    return <Navigate to="/login" replace />;
  }

  // Si no es admin, redirigir al dashboard normal
  if (datosUsuario?.rol !== 'admin') {
    return <Navigate to="/admin" replace />;
  }

  // Si es admin, mostrar el contenido
  return <>{children}</>;
};

export default ProtectedRouteAdmin; 