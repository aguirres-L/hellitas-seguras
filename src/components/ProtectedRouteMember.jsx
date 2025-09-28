import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Este componente no recibe props
const ProtectedRouteMember = ({ children }) => {
  const { datosUsuario, isCargando, isAutenticado } = useAuth();

  // Mostrar loading mientras se cargan los datos
  if (isCargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-gray-600">Verificando membresía...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAutenticado) {
    return <Navigate to="/login" replace />;
  }

  // Si no tiene datos de usuario cargados, mostrar loading
  if (!datosUsuario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-gray-600">Cargando información de usuario...</p>
        </div>
      </div>
    );
  }

  // CONTROL PRINCIPAL: Si no es miembro, BLOQUEAR acceso completo
  if (!datosUsuario.isMember) {
    return <Navigate to="/acceso-bloqueado" replace />;
  }

  // Si es miembro activo, permitir acceso a TODO
  return <>{children}</>;
};

export default ProtectedRouteMember;