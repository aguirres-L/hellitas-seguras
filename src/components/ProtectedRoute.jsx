import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Este componente no recibe props
const ProtectedRoute = ({ children }) => {
  const { usuario, isCargando } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (isCargando) {
    return (
      <div className="h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario autenticado, redirigir al login
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // Si hay usuario autenticado, mostrar el contenido protegido
  return children;
};

export default ProtectedRoute; 