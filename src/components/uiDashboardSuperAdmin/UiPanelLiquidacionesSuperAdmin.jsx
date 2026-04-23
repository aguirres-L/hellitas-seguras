import React, { useCallback, useEffect, useState } from 'react';
import { getAllDataCollection } from '../../data/firebase/firebase';
import DetailPagoSuscription from './historialDePagos/DetailPagoSuscription';
import DetailPagoChapita from './historialDePagos/DetailPagoChapita';

/**
 * Vista global: todos los pagos de suscripción y de chapitas (super admin).
 */
export default function UiPanelLiquidacionesSuperAdmin({ typeTheme }) {
  const [pagosSuscripciones, setPagosSuscripciones] = useState([]);
  const [pagosChapitas, setPagosChapitas] = useState([]);
  const [isCargandoPagos, setIsCargandoPagos] = useState(true);

  const formatearFecha = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return new Date(timestamp).toLocaleDateString('es-CL');
  };

  const formatearMoneda = (valor) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(valor);

  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'confirmado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'fabricacion':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'en viaje':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'entregado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rechazado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const cargarTodo = useCallback(async () => {
    setIsCargandoPagos(true);
    try {
      const [sus, ch] = await Promise.all([
        getAllDataCollection('pagoSuscripciones'),
        getAllDataCollection('pagoChapita'),
      ]);
      setPagosSuscripciones(sus || []);
      setPagosChapitas(ch || []);
    } catch (e) {
      console.error('UiPanelLiquidacionesSuperAdmin', e);
    } finally {
      setIsCargandoPagos(false);
    }
  }, []);

  useEffect(() => {
    cargarTodo();
  }, [cargarTodo]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3
            className={
              typeTheme === 'light' ? 'text-xl font-bold text-gray-900' : 'text-xl font-bold text-white'
            }
          >
            Liquidaciones globales
          </h3>
          <p className={typeTheme === 'light' ? 'text-sm text-gray-600' : 'text-sm text-gray-400'}>
            Suscripciones (membresía) y pagos por chapitas. Podés avanzar estados de pedidos desde acá.
          </p>
        </div>
        <button
          type="button"
          onClick={() => cargarTodo()}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Actualizar lista
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DetailPagoSuscription
          pagosSuscripciones={pagosSuscripciones}
          typeTheme={typeTheme}
          isCargandoPagos={isCargandoPagos}
          formatearMoneda={formatearMoneda}
          formatearFecha={formatearFecha}
        />
        <DetailPagoChapita
          obtenerColorEstado={obtenerColorEstado}
          pagosChapitas={pagosChapitas}
          typeTheme={typeTheme}
          isCargandoPagos={isCargandoPagos}
          formatearMoneda={formatearMoneda}
          formatearFecha={formatearFecha}
          onEstadoActualizado={cargarTodo}
        />
      </div>
    </div>
  );
}
