import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Este componente no recibe props
const ProtectedRouteProfesional = ({ children }) => {
  const { usuario, tipoUsuario, isCargando } = useAuth();

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

  // Si no hay usuario autenticado, redirigir al login de profesionales
  if (!usuario) {
    return <Navigate to="/login-profesional" replace />;
  }

  // Si el usuario no es un profesional, redirigir al login de profesionales
  if (tipoUsuario !== 'profesional') {
    return <Navigate to="/login-profesional" replace />;
  }

  // Si es un profesional autenticado, mostrar el contenido protegido
  return children;
};

export default ProtectedRouteProfesional; 