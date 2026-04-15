import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getChapitaFiletForUserId } from '../data/hook/getChapitaFiletForUserId';
import { etiquetaEstadoChapita, clasePuntoEstadoChapita } from '../utils/chapitaEstado';

export interface NotificacionChapita {
  id: string;
  nombreMascota: string;
  estado: string;
  fechaActualizacion: string;
  fotoUrl?: string;
  usuarioId: string;
  mascotaId?: string;
}

export interface NotificacionesChapitasProps {
  isAbierto: boolean;
  onCerrar: () => void;
  typeTheme: 'light' | 'dark';
  /** En drawer móvil: lista en flujo (evita recorte por overflow del panel). */
  isModoInline?: boolean;
}

export const NotificacionesChapitas: React.FC<NotificacionesChapitasProps> = ({
  isAbierto,
  onCerrar,
  typeTheme,
  isModoInline = false,
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
      return;
    }
    
    try {
      // Cargar pagos de chapitas
      
      const chapitasUsuario = await getChapitaFiletForUserId(usuario.uid);
      
      // Transformar datos para el formato de notificaciones
      const notificacionesChapitas = chapitasUsuario.map((chapita) => ({
        id: chapita.id,
        nombreMascota: chapita.mascotaNombre || 'Mascota sin nombre',
        estado: chapita.estado || 'sin estado',
        fechaActualizacion: chapita.fechaActualizacion?.toDate?.()?.toISOString() || new Date().toISOString(),
        fotoUrl: chapita.fotoMascota,
        usuarioId: chapita.usuarioId,
        mascotaId: chapita.mascotaId,
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

  const clasesContenedor = isModoInline
    ? `relative mt-2 w-full max-w-full ${
        typeTheme === 'dark'
          ? 'bg-gray-800 border border-gray-700'
          : 'bg-white border border-gray-200'
      } rounded-lg shadow-inner z-10`
    : `absolute right-0 top-full mt-2 w-80 max-w-sm ${
        typeTheme === 'dark'
          ? 'bg-gray-800 border border-gray-700'
          : 'bg-white border border-gray-200'
      } rounded-lg shadow-xl z-50`;

  return (
    <div ref={dropdownRef} className={clasesContenedor}>
      {/* Header */}
      <div className={`px-4 py-3 border-b ${
        typeTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <h3
          className={`font-semibold ${
            typeTheme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
        >
          Estado de Chapitas
        </h3>
        <p
          className={`mt-1 text-xs leading-snug ${
            typeTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          Tocá una fila para ir al perfil y abrir la pestaña de chapita con el detalle del pedido.
        </p>
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
            {notificaciones.map((notificacion) => {
              const filaClass = `flex items-center rounded-lg p-3 mb-2 transition-colors duration-200 ${
                typeTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
              }`;
              const contenido = (
                <>
                  <div className="mr-3 shrink-0">
                    <img
                      src={notificacion.fotoUrl || '/dog-avatar.png'}
                      alt=""
                      className="h-10 w-10 rounded-full border-2 border-orange-200 object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`truncate text-sm font-medium ${
                          typeTheme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {notificacion.nombreMascota}
                      </p>
                      <span
                        className={`shrink-0 text-xs ${
                          typeTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        {new Date(notificacion.fechaActualizacion).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center">
                      <div
                        className={`mr-2 h-2 w-2 shrink-0 rounded-full ${clasePuntoEstadoChapita(
                          notificacion.estado
                        )}`}
                      />
                      <p
                        className={`text-xs ${
                          typeTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        {etiquetaEstadoChapita(notificacion.estado, 'corta')}
                      </p>
                    </div>
                  </div>
                  <div className="ml-2 shrink-0 text-orange-500" aria-hidden>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </>
              );

              return notificacion.mascotaId ? (
                <Link
                  key={notificacion.id}
                  to={`/pet/${notificacion.mascotaId}`}
                  className={`${filaClass} block text-left no-underline`}
                  onClick={() => onCerrar()}
                >
                  {contenido}
                </Link>
              ) : (
                <div key={notificacion.id} className={filaClass}>
                  {contenido}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {notificaciones.length > 0 && (
        <div
          className={`border-t px-4 py-3 ${
            typeTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <button
            type="button"
            onClick={onCerrar}
            className={`w-full text-center text-sm font-medium transition-colors duration-200 ${
              typeTheme === 'dark'
                ? 'text-orange-400 hover:text-orange-300'
                : 'text-orange-600 hover:text-orange-700'
            }`}
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
};
