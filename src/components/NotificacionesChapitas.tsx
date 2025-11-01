import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAllDataCollection } from '../data/firebase/firebase';
import { getChapitaFiletForUserId } from '../data/hook/getChapitaFiletForUserId';

export interface NotificacionChapita {
  id: string;
  nombreMascota: string;
  estado: string;
  fechaActualizacion: string;
  fotoUrl?: string;
  usuarioId: string;
}

export interface NotificacionesChapitasProps {
  isAbierto: boolean;
  onCerrar: () => void;
  typeTheme: 'light' | 'dark';
}

export const NotificacionesChapitas: React.FC<NotificacionesChapitasProps> = ({
  isAbierto,
  onCerrar,
  typeTheme,
}) => {
  const { usuario } = useAuth();
  const [notificaciones, setNotificaciones] = useState<NotificacionChapita[]>([]);
  const [isCargando, setIsCargando] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onCerrar();
      }
    };

    if (isAbierto) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAbierto, onCerrar]);

  // Función para cargar chapitas del usuario (reutilizada de ModalDetailUserComun)
  const getAllChapitasUsuario = async () => {
    if (!usuario?.uid) {
      console.log('No hay usuario.uid:', usuario);
      return;
    }
    
    console.log('Buscando pagos para usuario.uid:', usuario.uid);
    try {
      // Cargar pagos de chapitas
      
      const chapitasUsuario = await getChapitaFiletForUserId(usuario.uid);
      console.log('Chapitas filtradas:', chapitasUsuario);
      
      // Transformar datos para el formato de notificaciones
      const notificacionesChapitas = chapitasUsuario.map(chapita => ({
        id: chapita.id,
        nombreMascota: chapita.mascotaNombre || 'Mascota sin nombre',
        estado: chapita.estado || 'sin estado',
        fechaActualizacion: chapita.fechaActualizacion?.toDate?.()?.toISOString() || new Date().toISOString(),
        fotoUrl: chapita.fotoMascota,
        usuarioId: chapita.usuarioId
      }))
      .sort((a, b) => new Date(b.fechaActualizacion).getTime() - new Date(a.fechaActualizacion).getTime());

      setNotificaciones(notificacionesChapitas);
    } catch (error) {
      console.error('Error al cargar pagos:', error);
    }
  };

  // Cargar notificaciones de chapitas
  useEffect(() => {
    const cargarNotificaciones = async () => {
      if (!usuario?.uid || !isAbierto) return;

      try {
        setIsCargando(true);
        await getAllChapitasUsuario();
      } catch (error) {
        console.error('Error al cargar notificaciones:', error);
      } finally {
        setIsCargando(false);
      }
    };

    cargarNotificaciones();
  }, [usuario?.uid, isAbierto]);

  if (!isAbierto) return null;

// Función para obtener el color del estado
const obtenerColorEstado = (estado: string) => {
  switch (estado.toLowerCase()) {
    case 'pendiente':
      return 'bg-yellow-500';
    case 'aprobado':
    case "entregado":
    case 'completado':
      return 'bg-green-500';
    case 'rechazado':
    case 'cancelado':
      return 'bg-red-500';
    case 'en_produccion':
    case 'fabricacion':
      return 'bg-blue-500';
    case 'en_viaje':
    case 'en_transito':
      return 'bg-purple-500';
    case 'disponible':
      return 'bg-indigo-500';
    default:
      return 'bg-gray-500';
  }
};

// Función para obtener el mensaje del estado
const obtenerMensajeEstado = (estado: string) => {
  switch (estado.toLowerCase()) {
    case 'pendiente':
      return 'Chapita pendiente';
    case 'aprobado':
      return 'Chapita aprobada';
    case "entregado":
      return 'Estado: entregado';
    case 'rechazado':
      return 'Chapita rechazada';
    case 'cancelado':
      return 'Chapita cancelada';
    case 'en_produccion':
    case 'fabricacion':
      return 'Estado: fabricación';
    case 'en_viaje':
    case 'en_transito':
      return 'Estado: en viaje';
    case 'disponible':
      return 'Chapita disponible';
    default:
      return `Estado: ${estado}`;
  }
};


  return (
    <div 
      ref={dropdownRef}
      className={`absolute right-0 top-full mt-2 w-80 max-w-sm ${
        typeTheme === 'dark' 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200'
      } rounded-lg shadow-xl z-50`}
    >
      {/* Header */}
      <div className={`px-4 py-3 border-b ${
        typeTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <h3 className={`font-semibold ${
          typeTheme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Estado de Chapitas
        </h3>
      </div>

      {/* Contenido */}
      <div className="max-h-96 overflow-y-auto">
        {isCargando ? (
          <div className="p-4 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
            <p className={`mt-2 text-sm ${
              typeTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Cargando notificaciones...
            </p>
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="p-6 text-center">
            <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
              typeTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <svg className={`w-6 h-6 ${
                typeTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 7H4l5-5v5z" />
              </svg>
            </div>
            <p className={`text-sm ${
              typeTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              No hay notificaciones de chapitas
            </p>
          </div>
        ) : (
          <div className="p-2">
            {notificaciones.map((notificacion) => (
              <div
                key={notificacion.id}
                className={`flex items-center p-3 rounded-lg mb-2 hover:bg-opacity-50 transition-colors duration-200 ${
                  typeTheme === 'dark' 
                    ? 'hover:bg-gray-700' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {/* Avatar de la mascota */}
                <div className="flex-shrink-0 mr-3">
                  <img
                    src={notificacion.fotoUrl || "/dog-avatar.png"}
                    alt={notificacion.nombreMascota}
                    className="w-10 h-10 rounded-full object-cover border-2 border-orange-200"
                  />
                </div>

                {/* Contenido de la notificación */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium truncate ${
                      typeTheme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {notificacion.nombreMascota}
                    </p>
                    <span className={`text-xs ${
                      typeTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {new Date(notificacion.fechaActualizacion).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center mt-1">
                    <div className="flex items-center mt-1">
                      <div className={`w-2 h-2 rounded-full mr-2 ${obtenerColorEstado(notificacion.estado)}`}></div>
                      <p className={`text-xs ${typeTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                        {obtenerMensajeEstado(notificacion.estado)}
                      </p>
</div>
                  </div>
                </div>

                {/* Icono de estado */}
                <div className="flex-shrink-0 ml-2">
                  {notificacion.estado ? (
                    <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notificaciones.length > 0 && (
        <div className={`px-4 py-3 border-t ${
          typeTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            onClick={onCerrar}
            className={`w-full text-center text-sm font-medium transition-colors duration-200 ${
              typeTheme === 'dark' 
                ? 'text-orange-400 hover:text-orange-300' 
                : 'text-orange-600 hover:text-orange-700'
            }`}
          >
            
          </button>
        </div>
      )}
    </div>
  );
};
