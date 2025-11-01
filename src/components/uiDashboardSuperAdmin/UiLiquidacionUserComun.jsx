import React, { useState, useEffect } from 'react';
import { useTheme } from "../../contexts/ThemeContext";
import { getAllDataCollection } from '../../data/firebase/firebase';
import DetailPagoSuscription from './historialDePagos/DetailPagoSuscription';
import DetailPagoChapita from './historialDePagos/DetailPagoChapita';
import { getChapitaFiletForUserId } from '../../data/hook/getChapitaFiletForUserId';

// Este componente no recibe props
export default function UiLiquidacionesUserComun({ setIsShowLiquidaciones, usuario }) {
  const { typeTheme } = useTheme();
  
  // Estados para los pagos
  const [pagosSuscripciones, setPagosSuscripciones] = useState([]);
  const [pagosChapitas, setPagosChapitas] = useState([]);
  const [isCargandoPagos, setIsCargandoPagos] = useState(false);

  // Función para formatear fecha
  const formatearFecha = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return new Date(timestamp).toLocaleDateString('es-CL');
  };

  // Función para formatear moneda
  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(valor);
  };

  // Función para obtener el color del estado
  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'confirmado': return 'bg-green-100 text-green-800 border-green-200';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'fabricacion': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'en viaje': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'entregado': return 'bg-green-100 text-green-800 border-green-200';
      case 'rechazado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  console.log(usuario.id,'usuario.id');
  
  // Función para cargar pagos del usuario
  const cargarPagosUsuario = async () => {
    if (!usuario?.id) {
      console.log('No hay usuario.id:', usuario);
      return;
    }
    
    console.log('Buscando pagos para usuario.id:', usuario.id);
    setIsCargandoPagos(true);
    try {
      // Cargar pagos de suscripciones
      const suscripciones = await getAllDataCollection('pagoSuscripciones');
      console.log('Todas las suscripciones:', suscripciones);
      const suscripcionesUsuario = suscripciones.filter(pago => pago.usuarioId === usuario.id);
      console.log('Suscripciones filtradas:', suscripcionesUsuario);
      setPagosSuscripciones(suscripcionesUsuario);

      // Cargar pagos de chapitas
      const chapitasUsuario = await getChapitaFiletForUserId(usuario.id);
      setPagosChapitas(chapitasUsuario);

    } catch (error) {
      console.error('Error al cargar pagos:', error);
    } finally {
      setIsCargandoPagos(false);
    }
  };

  // Función para manejar la actualización del estado de chapita
  const manejarActualizacionEstado = () => {
    console.log('Estado de chapita actualizado, recargando datos...');
    cargarPagosUsuario();
  };

  // Cargar pagos cuando el componente se monta
  useEffect(() => {
    cargarPagosUsuario();
  }, [usuario?.id]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${
          typeTheme === 'light' ? 'text-gray-900' : 'text-white'
        }`}>
          Historial de Pagos
        </h2>
        <button 
          className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          onClick={() => setIsShowLiquidaciones(false)}
        >
          Volver al Detalle de Usuario
        </button>
      </div>

      {/* Información del usuario */}
      <div className={`rounded-xl p-4 ${
        typeTheme === 'light' ? 'bg-blue-50' : 'bg-blue-900/20'
      }`}>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-lg font-bold text-blue-600">
              {usuario?.displayName ? usuario.displayName.charAt(0) : usuario?.email?.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${
              typeTheme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              {usuario?.displayName || usuario?.nombre || 'Usuario'}
            </h3>
            <p className={`text-sm ${
              typeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              {usuario?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Grid de dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Columna 1: Pagos de Suscripción */}
        <DetailPagoSuscription pagosSuscripciones={pagosSuscripciones} typeTheme={typeTheme} isCargandoPagos={isCargandoPagos} formatearMoneda={formatearMoneda} formatearFecha={formatearFecha} />

        {/* Columna 2: Pagos de Chapitas */}
       <DetailPagoChapita 
         obtenerColorEstado={obtenerColorEstado}  
         pagosChapitas={pagosChapitas} 
         typeTheme={typeTheme} 
         isCargandoPagos={isCargandoPagos} 
         formatearMoneda={formatearMoneda} 
         formatearFecha={formatearFecha}
         onEstadoActualizado={manejarActualizacionEstado}
       />

      </div>

      {/* Resumen de pagos */}
      <div className={`rounded-xl p-6 ${
        typeTheme === 'light' ? 'bg-gradient-to-r from-blue-50 to-orange-50' : 'bg-gradient-to-r from-blue-900/20 to-orange-900/20'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${
          typeTheme === 'light' ? 'text-gray-900' : 'text-white'
        }`}>
          📊 Resumen de Pagos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`text-center p-4 rounded-lg ${
            typeTheme === 'light' ? 'bg-white' : 'bg-gray-700'
          }`}>
            <p className={`text-2xl font-bold ${
              typeTheme === 'light' ? 'text-blue-600' : 'text-blue-400'
            }`}>
              {pagosSuscripciones.length}
            </p>
            <p className={`text-sm ${
              typeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Suscripciones
            </p>
          </div>
          <div className={`text-center p-4 rounded-lg ${
            typeTheme === 'light' ? 'bg-white' : 'bg-gray-700'
          }`}>
            <p className={`text-2xl font-bold ${
              typeTheme === 'light' ? 'text-orange-600' : 'text-orange-400'
            }`}>
              {pagosChapitas.length}
            </p>
            <p className={`text-sm ${
              typeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Chapitas
            </p>
          </div>
          <div className={`text-center p-4 rounded-lg ${
            typeTheme === 'light' ? 'bg-white' : 'bg-gray-700'
          }`}>
            <p className={`text-2xl font-bold ${
              typeTheme === 'light' ? 'text-green-600' : 'text-green-400'
            }`}>
              {formatearMoneda(
                pagosSuscripciones.reduce((total, pago) => total + (pago.monto || 5000), 0) +
                pagosChapitas.reduce((total, pago) => total + (pago.monto || 7000), 0)
              )}
            </p>
            <p className={`text-sm ${
              typeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Total Pagado
            </p>
          </div>
          <div className={`text-center p-4 rounded-lg ${
            typeTheme === 'light' ? 'bg-white' : 'bg-gray-700'
          }`}>
            <p className={`text-2xl font-bold ${
              typeTheme === 'light' ? 'text-purple-600' : 'text-purple-400'
            }`}>
              {pagosSuscripciones.length + pagosChapitas.length}
            </p>
            <p className={`text-sm ${
              typeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Total Pagos
            </p>
          </div>
        </div>
      </div>

      
    </div>
  );
}