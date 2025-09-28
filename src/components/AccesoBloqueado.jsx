import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MetodoDePagoSub from './metodoDePagoSub/MetodoDePagoSub';

// Este componente no recibe props
const AccesoBloqueado = () => {
  const { datosUsuario, cerrarSesion } = useAuth();
  const [showMetodoDePag, setshowMetodoDePag] = useState(false);

  const handleCerrarSesion = async () => {
    try {
      await cerrarSesion();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };


  const handleShowMetodoDePag = () => {
    console.log('showMetodoDePag', showMetodoDePag);
    setshowMetodoDePag(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 pt-16">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="hidden md:block absolute -top-20 -right-20 w-40 h-40 lg:w-60 lg:h-60 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="hidden md:block absolute -bottom-20 -left-20 w-40 h-40 lg:w-60 lg:h-60 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {!showMetodoDePag && (
        <div className="max-w-2xl mx-auto text-center">
          {/* Icono de bloqueo */}
          <div className="mx-auto h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          {/* Título y mensaje */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Acceso Bloqueado
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Tu membresía ha expirado. Para continuar usando la plataforma, 
            necesitas renovar tu suscripción.
          </p>

          {/* Información del usuario */}
          {datosUsuario && (
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Tu cuenta está suspendida
              </h3>
              <div className="text-left space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Usuario:</span> {datosUsuario.nombre}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span> {datosUsuario.email}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Estado:</span> 
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                    Membresía expirada
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="space-y-4">


            <button onClick={handleShowMetodoDePag} className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:scale-105">
              Renovar Membresía - $5.000/mes
            </button>

          

            
            <div className="flex space-x-4">
              <button
                onClick={handleCerrarSesion}
                className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors duration-200"
              >
                Cerrar Sesión
              </button>
              
              <Link
                to="/"
                className="flex-1 bg-orange-100 text-orange-700 px-6 py-3 rounded-lg font-medium hover:bg-orange-200 transition-colors duration-200 text-center py-3"
              >
                Volver al Inicio
              </Link>
            </div>
          </div>

          {/* Información de servicios bloqueados */}
        {/*   <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-900 mb-2">Servicios bloqueados:</h4>
            <ul className="text-sm text-red-800 space-y-1 text-left">
              <li>• ❌ Dashboard de usuario</li>
              <li>• ❌ Gestión de mascotas</li>
              <li>• ❌ Agendar citas veterinarias</li>
              <li>• ❌ Agendar citas de peluquería</li>
              <li>• ❌ Acceso a tiendas</li>
              <li>• ❌ Perfil de mascotas</li>
            </ul>
          </div> */}

          {/* Beneficios de renovar */}
          {/* <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Al renovar tendrás acceso a:</h4>
            <ul className="text-sm text-green-800 space-y-1 text-left">
              <li>• ✅ Todos los servicios veterinarios</li>
              <li>• ✅ Sistema completo de peluquería</li>
              <li>• ✅ Gestión ilimitada de mascotas</li>
              <li>• ✅ Descuentos en tiendas</li>
              <li>• ✅ Soporte prioritario</li>
            </ul>
          </div> */}
       
      
        </div>
      )}
      {showMetodoDePag && (
              <MetodoDePagoSub />
            )}
      </div>

    </div>
  );
};

export default AccesoBloqueado;