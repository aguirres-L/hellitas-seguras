import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useAuth } from '../contexts/AuthContext';
import { obtenerUsuarioPorUid, actualizarMascota } from '../data/firebase/firebase';
import { SistemaCitas } from './SistemaCitas';
import { EditarMascota } from './EditarMascota';
import typeProfesionalStore from '../service/zustand';
import MetodoDePago from './metodoDePago/MetodoDePago';
import DecoracionForm from './decoracionUi/DecoracionForm';
import { useTheme } from '../contexts/ThemeContext';
import { ConsejosIA } from './ConsejosIA';
import { useConsejosIA } from '../hooks/useConsejosIA';
import { getChapitasByMascotaId } from '../data/hook/getChapitasByMascotaId';
import { etiquetaEstadoChapita, clasesBadgeEstadoChapita } from '../utils/chapitaEstado';
import QRCode from 'react-qr-code';
import SvgAlert from './ui/svg/SvgAlert';
import UseFrameMotion from './hook_frame_motion/UseFrameMotion';
import { useNotificacionApp } from '../contexts/NotificacionAppContext';

/** Toggle “mascota perdida”: mismo control en layout móvil compacto y en desktop. */
function ControlTogglePerdida({ mascotaId, isPerdida, isGuardando, onCambiar }) {
  return (
    <div className="flex shrink-0 items-center justify-center gap-2">
      {isGuardando ? (
        <div
          className="flex h-9 items-center justify-center"
          role="status"
          aria-live="polite"
          aria-label="Guardando estado"
        >
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        </div>
      ) : (
        <>
          <span className={`text-xs font-semibold ${!isPerdida ? 'text-gray-800' : 'text-gray-400'}`}>No</span>
          <label
            htmlFor={`mascota-perdida-${mascotaId}`}
            className={`relative inline-flex cursor-pointer items-center ${
              isGuardando ? 'cursor-wait opacity-60' : ''
            }`}
          >
            <input
              id={`mascota-perdida-${mascotaId}`}
              type="checkbox"
              checked={isPerdida || false}
              onChange={(e) => onCambiar(e.target.checked)}
              disabled={isGuardando}
              className="peer sr-only"
              aria-describedby={`mascota-perdida-ayuda-${mascotaId}`}
              aria-label="Marcar mascota como perdida en el perfil público"
            />
            <span id={`mascota-perdida-ayuda-${mascotaId}`} className="sr-only">
              Al activar, el perfil público muestra alerta de mascota perdida
            </span>
            <span
              aria-hidden
              className="relative inline-block h-6 w-11 shrink-0 rounded-full bg-gray-300 transition-colors after:pointer-events-none after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all after:content-[''] peer-checked:bg-red-500 peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-orange-400 peer-focus-visible:ring-offset-2"
            />
          </label>
          <span className={`text-xs font-semibold ${isPerdida ? 'text-red-700' : 'text-gray-400'}`}>Sí, perdida</span>
        </>
      )}
    </div>
  );
}

// Este componente recibe props a través de useParams
const PetProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {getTipoProfesional} = typeProfesionalStore();
  const { typeTheme } = useTheme();
  const { usuario } = useAuth();
  const { mostrarError } = useNotificacionApp();
  const [pestañaActiva, setPestañaActiva] = useState('informacion');
  const [mascota, setMascota] = useState(null);
  const [isCargando, setIsCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarEdicion, setMostrarEdicion] = useState(false);
  const [mostrarCitas, setMostrarCitas] = useState(false);
  const [isGuardando, setIsGuardando] = useState(false);
  const [chapitasDeEstaMascota, setChapitasDeEstaMascota] = useState([]);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [openMetodoPago, setOpenMetodoPago] = useState(false);
  const [urlCopiada, setUrlCopiada] = useState(false);
  const [isGuardandoEstadoPerdida, setIsGuardandoEstadoPerdida] = useState(false);
  const [mostrarLeyendaPerdidaMovil, setMostrarLeyendaPerdidaMovil] = useState(false);

  // Hook para consejos de IA
  const {
    consejos,
    cargando: cargandoConsejos,
    error: errorConsejos,
    fuente,
    tematica,
    peticionesRestantes,
    historial,
    estadisticasTematicas,
    puedeGenerarConsejos,
    tipoConsejoSeleccionado,
    setTipoConsejoSeleccionado,
    promptSeleccionado,
    setPromptSeleccionado,
    generarConsejos,
    limpiarConsejos,
    regenerarConsejos,
    cargarConsejoDelHistorial,
    limpiarHistorial
  } = useConsejosIA(mascota?.raza, usuario?.uid, mascota?.id, mascota);

  // Cargar datos de la mascota específica
  useEffect(() => {
    
    const tipoProfesional = getTipoProfesional(); 

    
    const cargarMascota = async () => {
      if ( !tipoProfesional || tipoProfesional === 'tienda' ) {
        if(!usuario?.uid || !id){
          setError('No se pudo cargar la información de la mascota');
          setIsCargando(false);
          return;
        }
      }

      try {
        setIsCargando(true);
        const datosUsuario = await obtenerUsuarioPorUid(usuario.uid);

        // Chapitas asociadas a esta mascota (pagoChapita)
        const chapitasDeEstaMascota = await getChapitasByMascotaId(id);
        
        // Guardar en el estado para usar en la UI
        setChapitasDeEstaMascota(chapitasDeEstaMascota);
        

        if(tipoProfesional === 'tienda'){
          if (!datosUsuario?.infoMascotas) {
            setError('No se encontraron mascotas');
            setIsCargando(false);
            return;
          }
        }

        // Buscar la mascota por ID
        const mascotaEncontrada = datosUsuario.infoMascotas.find(m => m.id === id);
        
        if (!mascotaEncontrada) {
          setError('Mascota no encontrada');
          setIsCargando(false);
          return;
        }

        setMascota(mascotaEncontrada);
      } catch (error) {
        console.error('Error al cargar mascota:', error);
        setError('Error al cargar la información de la mascota');
      } finally {
        setIsCargando(false);
      }
    };

    cargarMascota();
  }, [usuario?.uid, id]);

  useEffect(() => {
    setMostrarLeyendaPerdidaMovil(false);
  }, [id]);

  const handleMetodoPago = () => {
    setOpenMetodoPago(!openMetodoPago);
  }

  // Función para generar la URL pública del perfil
  const obtenerUrlPublica = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/pet/${id}`;
  };

  // Función para copiar la URL al portapapeles
  const copiarUrl = async () => {
    try {
      const url = obtenerUrlPublica();
      await navigator.clipboard.writeText(url);
      setUrlCopiada(true);
      setTimeout(() => setUrlCopiada(false), 3000);
    } catch (error) {
      console.error('Error al copiar URL:', error);
    }
  };

  // Función para obtener el color y texto del estado de la chapita
  const obtenerEstiloEstado = (estado) => {
    switch (estado) {
      case 'pendiente':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icono: '⏳',
          texto: 'Pendiente de confirmación'
        };
      case 'confirmado':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icono: '✅',
          texto: 'Confirmado'
        };
      case 'fabricacion':
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icono: '🔨',
          texto: 'En fabricación'
        };
      case 'en viaje':
        return {
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icono: '🚚',
          texto: 'En camino'
        };
      case 'entregado':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icono: '🎉',
          texto: 'Entregado'
        };
      case 'rechazado':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icono: '❌',
          texto: 'Rechazado'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icono: '❓',
          texto: 'Estado desconocido'
        };
    }
  };

  // Función para formatear fecha
  const formatearFecha = (timestamp) => {
    if (!timestamp) return 'Fecha no disponible';
    
    try {
      const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha no válida';
    }
  };


  // Si está cargando, mostrar spinner
  if (isCargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 pt-16">
        <Navbar tipo="dashboard" />
        <div className="relative container mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              <p className="mt-4 text-gray-600">Cargando perfil de mascota...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si hay error, mostrar mensaje
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 pt-16">
        <Navbar tipo="dashboard" />
        <div className="relative container mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
            <p className="text-red-700 mb-4">{error}</p>
{/*             <Link 
              to="/dashboard" 
              className="inline-flex items-center text-orange-600 hover:text-orange-700 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver al Dashboard
            </Link>
 */}          </div>
        </div>
      </div>
    );
  }

  // Función para manejar la actualización de la mascota
  const handleGuardarMascota = () => {
    setMostrarEdicion(false);
    // Recargar los datos de la mascota
    window.location.reload();
  };

  // Función para cambiar el estado de mascota perdida inmediatamente
  const handleCambiarEstadoPerdida = async (nuevoEstado) => {
    if (!mascota || !usuario) return;
    
    // Guardar el estado anterior por si necesitamos revertir
    const estadoAnterior = mascota.isPerdida;
    
    // Actualizar el estado local inmediatamente para mejor UX
    setMascota(prev => ({
      ...prev,
      isPerdida: nuevoEstado
    }));

    setIsGuardandoEstadoPerdida(true);
    try {
      // Guardar inmediatamente en Firebase
      await actualizarMascota(mascota.id, {
        isPerdida: nuevoEstado
      });
      
      // No recargamos la página, el estado ya está actualizado
      // La UI se actualizará automáticamente gracias al estado de React
    } catch (error) {
      console.error('Error al actualizar estado de mascota perdida:', error);
      
      // Revertir el cambio si falla
      setMascota(prev => ({
        ...prev,
        isPerdida: estadoAnterior
      }));
      
      mostrarError(
        `Error al ${nuevoEstado ? 'marcar' : 'desmarcar'} la mascota como perdida. Inténtalo de nuevo.`
      );
    } finally {
      setIsGuardandoEstadoPerdida(false);
    }
  };

  // Función para manejar la eliminación de la mascota
  const handleEliminarMascota = () => {
    setMostrarEdicion(false);
    // Redirigir al dashboard después de eliminar
    navigate('/dashboard');
  };

  // Si no hay mascota, no debería llegar aquí pero por seguridad
  if (!mascota) {
    return null;
  }

  
  // Función para abrir el modal con la foto
  const abrirModal = () => {
    setModalAbierto(true);
    document.body.style.overflow = 'hidden'; // Deshabilitar scroll
  };

  // Función para cerrar el modal
  const cerrarModal = () => {
    setModalAbierto(false);
    document.body.style.overflow = 'auto'; // Habilitar scroll
  };


  return (
    <div className={
      typeTheme === 'light'
        ? "bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 min-h-screen pt-16"
        : "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen pt-16"
    }>
      {/* Fondo decorativo - Responsivo */}
      <DecoracionForm isFullScreen={true} />

      {/* Navbar modular */}
      <Navbar tipo="dashboard" />

      {/* Modal para la foto */}
      {modalAbierto && (
        <div className="photo-modal">
          <div className="photo-modal-overlay" onClick={cerrarModal}></div>
          <div className="photo-modal-content">
            <button className="photo-modal-close" onClick={cerrarModal}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img 
              src={mascota.fotoUrl || "/dog-avatar.png"} 
              alt={mascota.nombre} 
              className="photo-modal-image" 
            />
            <div className="photo-modal-caption">
              <p className="text-lg font-semibold">{mascota.nombre}</p>
              <p className="text-sm text-gray-600">{mascota.raza} • {mascota.edad}</p>
            </div>
          </div>
        </div>
      )}


      {/* Main Content */}
      <div className="relative container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header del Perfil */}
        <div className="mt-2">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center text-orange-600 hover:text-orange-700 transition-colors duration-200 mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al Dashboard
          </Link>
        </div>

        {/* Contenido Principal */}
        <div className="rounded-xl bg-white/80 p-4 shadow-lg backdrop-blur-sm sm:p-6">
          {/* Alerta de Mascota Perdida */}
          {mascota.isPerdida && (
            <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-lg p-4 animate-pulse">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                 <SvgAlert />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-red-900 mb-1">
                      MASCOTA PERDIDA
                  </h3>
                {/*   <p className="text-sm text-red-800">
                    <strong>{mascota.nombre}</strong> está marcada como perdida. 
                    Si la encuentras, por favor contacta al propietario usando la información de contacto disponible.
                  </p> */}
                </div>
              </div>
            </div>
          )}

          {/* Encabezado: menos aire vertical en móvil; bloque “perdida” compacto + detalle colapsable */}
          <div className="flex flex-col gap-4 sm:gap-6 sm:flex-row sm:items-start md:items-center">
            <div className="flex justify-center sm:justify-start">
              <img
                src={mascota.fotoUrl || '/dog-avatar.png'}
                alt={mascota.nombre}
                onClick={abrirModal}
                className="h-20 w-20 shrink-0 cursor-pointer rounded-full border-4 border-orange-100 object-cover shadow-lg sm:h-24 sm:w-24 sm:mr-6"
              />
            </div>
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <div className="mb-2 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                {mascota.isPerdida ? (<span className="animate-pulse rounded-full bg-red-100 px-3 py-1 text-xl font-bold text-red-800">
                    {mascota.nombre}
                  </span>): (<h2 className="text-xl font-bold text-gray-900 sm:text-2xl">{mascota.nombre}</h2>)}
              </div>
              <p className="mb-3 text-gray-600">{mascota.raza} • {mascota.edad}</p>

              {usuario && (
                <div
                  className={`mb-3 rounded-lg border p-2.5 text-left sm:mb-4 sm:rounded-xl sm:p-4 ${
                    mascota.isPerdida
                      ? 'border-red-200 bg-red-50/70'
                      : 'border-orange-100 bg-orange-50/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 sm:items-center sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-gray-900">
                        <button
                          type="button"
                          id="toggle-leyenda-perdida-movil"
                          className="sm:hidden inline-flex max-w-full items-center gap-1 rounded-md py-0.5 pl-0 pr-1 text-left text-orange-900 underline decoration-orange-300 decoration-2 underline-offset-2 hover:bg-orange-100/50 hover:text-orange-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-1"
                          aria-expanded={mostrarLeyendaPerdidaMovil}
                          aria-controls="leyenda-perdida-movil"
                          onClick={() => setMostrarLeyendaPerdidaMovil((v) => !v)}
                        >
                          ¿Perdida?
                          <svg
                            className={`h-4 w-4 shrink-0 text-orange-700 transition-transform duration-200 ${
                              mostrarLeyendaPerdidaMovil ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <span className="hidden sm:inline">¿Tu mascota está perdida?</span>
                      </div>
                      <p className="mt-1 hidden text-xs leading-snug text-gray-600 sm:block">
                        Activá esta opción si se escapó o no la encontrás: el perfil público mostrará una alerta para
                        que quien la vea pueda contactarte.
                      </p>
                    </div>
                    <ControlTogglePerdida
                      mascotaId={mascota.id}
                      isPerdida={mascota.isPerdida}
                      isGuardando={isGuardandoEstadoPerdida}
                      onCambiar={handleCambiarEstadoPerdida}
                    />
                  </div>
                  {mostrarLeyendaPerdidaMovil && (
                    <div
                      id="leyenda-perdida-movil"
                      role="region"
                      aria-labelledby="toggle-leyenda-perdida-movil"
                      className="mt-2 rounded-md border border-orange-100/70 bg-white/50 px-2 py-2 sm:hidden"
                    >
                      <p className="text-xs leading-relaxed text-gray-600">
                        Activá esta opción si se escapó o no la encontrás: el perfil público mostrará una alerta para que
                        quien la vea pueda contactarte.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {usuario && (
                <div className="mb-6 flex justify-center sm:mb-7 sm:justify-start">
                  <button
                    type="button"
                    onClick={() => setMostrarEdicion(true)}
                    className="w-full max-w-xs rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-orange-600 sm:w-auto sm:max-w-none sm:py-2"
                  >
                    Editar perfil
                  </button>
                </div>
              )}
              {/*   {usuario && (
                  <button 
                    onClick={() => setMostrarCitas(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm font-medium"
                  >
                    Gestionar Citas
                  </button>
                )} */}
            </div>
          </div>

          {/* Pestañas: scroll horizontal en móvil, etiqueta corta para Chapita */}
          <div className="-mx-1 mb-6 mt-1 border-b border-gray-200 sm:mx-0 sm:mt-0">
            <div
              className="flex snap-x snap-mandatory gap-1 overflow-x-auto pb-1 pt-0.5 [scrollbar-width:thin] [-webkit-overflow-scrolling:touch] sm:gap-3 md:gap-4"
              role="tablist"
              aria-label="Secciones del perfil de mascota"
            >
              <button
                type="button"
                role="tab"
                aria-selected={pestañaActiva === 'informacion'}
                onClick={() => setPestañaActiva('informacion')}
                className={`shrink-0 snap-start px-3 pb-2 text-sm font-medium transition-colors duration-200 sm:px-4 sm:text-base ${
                  pestañaActiva === 'informacion'
                    ? 'border-b-2 border-orange-500 text-orange-600'
                    : 'border-b-2 border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-800'
                }`}
              >
                Información
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={pestañaActiva === 'historial'}
                onClick={() => setPestañaActiva('historial')}
                className={`shrink-0 snap-start px-3 pb-2 text-sm font-medium transition-colors duration-200 sm:px-4 sm:text-base ${
                  pestañaActiva === 'historial'
                    ? 'border-b-2 border-orange-500 text-orange-600'
                    : 'border-b-2 border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-800'
                }`}
              >
                <span className="sm:hidden">Chapita</span>
                <span className="hidden sm:inline">Chapita de {mascota.nombre}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={pestañaActiva === 'cuidados'}
                onClick={() => setPestañaActiva('cuidados')}
                className={`shrink-0 snap-start px-3 pb-2 text-sm font-medium transition-colors duration-200 sm:px-4 sm:text-base ${
                  pestañaActiva === 'cuidados'
                    ? 'border-b-2 border-orange-500 text-orange-600'
                    : 'border-b-2 border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-800'
                }`}
              >
                Consejos IA
              </button>
            </div>
          </div>

          {/* Contenido de Pestañas */}
          {pestañaActiva === 'informacion' && (
            <UseFrameMotion
              tipoAnimacion="slideUp"
              duracion={0.6}
              delay={0.1}
              waitForUserView={true}
              propsAdicionales={{}}
            >
          

              <div className="grid gap-4 sm:gap-8 md:grid-cols-2">
                {/* Datos Básicos */}
                <div className="rounded-lg bg-white/60 p-4 shadow-sm sm:p-6">
                  <h3 className="font-bold text-lg mb-4 text-gray-900">Información Básica</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Nombre</p>
                        <p className="font-medium">{mascota.nombre}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Raza</p>
                        <p className="font-medium">{mascota.raza}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Edad</p>
                        <p className="font-medium">{mascota.edad}</p>
                      </div>
                    </div>
                    {mascota.color && (
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Color</p>
                          <p className="font-medium">{mascota.color}</p>
                        </div>
                      </div>
                    )}

                    {mascota.notas && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 mb-2">Notas Adicionales</h4>
                        <p className="text-sm text-blue-700 whitespace-pre-wrap">{mascota.notas}</p>
                      </div>
                    )}
                    {mascota.contacto && (
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Contacto</p>
                          <p className="font-medium">{mascota.contacto}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* QR + URL (columna apilada en móvil) */}
                <div className="flex flex-col items-center rounded-lg bg-white/60 p-4 shadow-sm sm:p-6">
                  <div className="mb-4 flex w-full max-w-sm flex-col items-center justify-center gap-4 sm:max-w-none sm:flex-row">
                {/*     <img
                      src={mascota.fotoUrl}
                      style={{ borderRadius: '50%' }}
                      alt={mascota.nombre}
                      className="h-36 w-36 shrink-0 object-cover sm:h-44 sm:w-44 md:h-48 md:w-48"
                    /> */}

                    <div className="flex w-full max-w-[min(100%,220px)] justify-center sm:max-w-[240px] md:w-auto">
                      <div className="flex w-full justify-center rounded-lg border-2 border-orange-100 bg-white p-3 shadow-md sm:p-4">
                        <div className="w-full max-w-[176px] sm:max-w-[200px]">
                          <QRCode
                            value={obtenerUrlPublica()}
                            size={200}
                            level="H"
                            style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                            fgColor="#1f2937"
                            bgColor="#ffffff"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPestañaActiva('historial')}
                    className="mb-4 min-h-[44px] w-full max-w-md rounded-lg border-2 border-orange-200 bg-orange-50 px-3 py-2.5 text-center text-sm font-semibold leading-tight text-orange-800 transition hover:bg-orange-100 sm:text-base"
                  >
                    <span className="block sm:inline">Ver pedidos de chapita</span>
                    <span className="block text-xs font-medium opacity-90 sm:ml-1 sm:inline sm:text-base">
                      y solicitar una nueva
                    </span>
                  </button>

                  <div className="mb-4 w-full min-w-0 max-w-lg">
                    <label className="mb-2 block text-center text-sm font-medium text-gray-700">
                      URL pública del perfil
                    </label>
                    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-stretch">
                      <input
                        type="text"
                        value={obtenerUrlPublica()}
                        readOnly
                        className="min-w-0 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={copiarUrl}
                        className={`flex min-h-[44px] w-full shrink-0 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 sm:w-auto sm:min-w-[3rem] ${
                          urlCopiada
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        title="Copiar URL"
                      >
                        {urlCopiada ? (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            ¡Copiado!
                          </span>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="mt-3 px-1 text-center text-sm leading-relaxed text-gray-500">
                    El QR abre el perfil público de {mascota.nombre}. El pedido de la chapita física está en la pestaña{' '}
                    <strong className="text-gray-700">Chapita</strong>
                    <span className="hidden sm:inline">
                      {' '}
                      de {mascota.nombre}
                    </span>
                    .
                  </p>
                </div>
              </div>
            </UseFrameMotion>
          )}

          {pestañaActiva === 'historial' && (
            <UseFrameMotion
              tipoAnimacion="slideUp"
              duracion={0.6}
              delay={0.1}
              waitForUserView={true}
              propsAdicionales={{}}
            >
              <div className="rounded-lg bg-white/60 p-4 shadow-sm sm:p-6">
                {/* Pestaña reutilizada: seguimiento de chapitas (mismo criterio que menú Chapitas) */}
                <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50/90 via-white to-pink-50/40 p-4 shadow-sm sm:p-6">
        

                  {chapitasDeEstaMascota.length === 0 ? (
                  <>
                  <p className="font-medium text-gray-800">
                        Todavía no hay un pedido de chapita registrado para {mascota.nombre}.
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        Cuando completes el pago, el seguimiento aparecerá aquí y en Chapitas.
                      </p>
                      <button
                        type="button"
                        onClick={handleMetodoPago}
                        className="mt-5 inline-flex w-full max-w-sm items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 font-semibold text-white shadow-md transition hover:from-orange-600 hover:to-pink-600 sm:w-auto"
                      >
                        Quiero una chapita para {mascota.nombre}
                      </button>
                    </>
                  ) : (
                    <div className="mt-5 space-y-4">
                      {chapitasDeEstaMascota.map((chapita, index) => {
                        const estiloEstado = obtenerEstiloEstado(chapita.estado);
                        return (
                          <div
                            key={chapita.id}
                            className="rounded-xl border border-gray-200 bg-white/90 p-4 shadow-sm transition hover:shadow-md"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="flex min-w-0 items-center gap-3">
                                <span className="shrink-0 text-2xl" aria-hidden>
                                  {estiloEstado.icono}
                                </span>
                                <div>
                                  <h4 className="font-semibold text-gray-900">Pedido #{index + 1}</h4>
                                  <p className="text-xs text-gray-500">ID: {chapita.id.substring(0, 10)}…</p>
                                </div>
                              </div>
                              <span
                                className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${clasesBadgeEstadoChapita(
                                  chapita.estado
                                )}`}
                              >
                                {etiquetaEstadoChapita(chapita.estado, 'corta')}
                              </span>
                            </div>
                            <p className="mt-3 text-sm text-gray-600">
                              {etiquetaEstadoChapita(chapita.estado, 'larga')}
                            </p>
                            <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-gray-600 sm:grid-cols-2">
                              <div>
                                <span className="text-xs uppercase tracking-wide text-gray-400">Alta</span>
                                <p className="font-medium text-gray-900">{formatearFecha(chapita.fechaCreacion)}</p>
                              </div>
                              <div>
                                <span className="text-xs uppercase tracking-wide text-gray-400">
                                  Última actualización
                                </span>
                                <p className="font-medium text-gray-900">{formatearFecha(chapita.fechaActualizacion)}</p>
                              </div>
                            </div>
                            {chapita.estado === 'entregado' && (
                              <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3">
                                <p className="text-sm font-medium text-green-800">
                                  ¡Gracias! Esta chapita figura como entregada.
                                </p>
                              </div>
                            )}
                            {chapita.estado === 'fabricacion' && (
                              <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50 p-3">
                                <p className="text-sm font-medium text-orange-800">
                                  Estamos fabricando tu chapita; te avisamos cuando avance el envío.
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="rounded-lg border border-blue-100 bg-blue-50/80 p-3 text-sm text-blue-900 sm:flex-1">
                          <strong>Tip:</strong> cada cambio de estado también lo mostramos en el menú{' '}
                          <strong>Chapitas</strong> para que no pierdas ningún aviso.
                        </p>
                        <button
                          type="button"
                          onClick={handleMetodoPago}
                          className="shrink-0 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-orange-600 hover:to-pink-600"
                        >
                          Pedir otra chapita
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </UseFrameMotion>
          )}

          {pestañaActiva === 'cuidados' && (
            <UseFrameMotion
              tipoAnimacion="slideUp"
              duracion={0.6}
              delay={0.1}
              waitForUserView={true}
              propsAdicionales={{}}
            >
              <div className="space-y-6">
                {/* Consejos de IA */}
                <div className="bg-white/60 rounded-lg p-6 shadow-sm">
                  <ConsejosIA 
                  consejos={consejos}
                  cargando={cargandoConsejos}
                  error={errorConsejos}
                  fuente={fuente}
                  tematica={tematica}
                  peticionesRestantes={peticionesRestantes}
                  historial={historial}
                  estadisticasTematicas={estadisticasTematicas}
                  puedeGenerarConsejos={puedeGenerarConsejos}
                  tipoConsejoSeleccionado={tipoConsejoSeleccionado}
                  setTipoConsejoSeleccionado={setTipoConsejoSeleccionado}
                  promptSeleccionado={promptSeleccionado}
                  setPromptSeleccionado={setPromptSeleccionado}
                  onGenerarConsejos={generarConsejos}
                  onLimpiarConsejos={limpiarConsejos}
                  onRegenerarConsejos={regenerarConsejos}
                  onCargarConsejoDelHistorial={cargarConsejoDelHistorial}
                  onLimpiarHistorial={limpiarHistorial}
                  mascota={mascota}
                />
              </div>

              {/* Cuidados Especiales del Usuario */}
              <div className="bg-white/60 rounded-lg p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4 text-gray-900">Cuidados Especiales Registrados</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {mascota.alergias && (
                    <div className="bg-red-50 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2">Alergias</h4>
                      <p className="text-sm text-red-700">{mascota.alergias}</p>
                    </div>
                  )}
                  {mascota.enfermedades && (
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">Enfermedades</h4>
                      <p className="text-sm text-yellow-700">{mascota.enfermedades}</p>
                    </div>
                  )}
                  {mascota.notas && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Notas Adicionales</h4>
                      <p className="text-sm text-blue-700 whitespace-pre-wrap">{mascota.notas}</p>
                    </div>
                  )}
                  {!mascota.alergias && !mascota.enfermedades && !mascota.notas && (
                    <div className="col-span-2 text-center py-8">
                      <p className="text-gray-500">No hay información de cuidados especiales registrada</p>
                    </div>
                  )}
                </div>
              </div>
              </div>
            </UseFrameMotion>
          )} 
        </div>
      </div>

      {/* Modal de Edición */}
      {mostrarEdicion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              
              <EditarMascota
                key={mascota.id}
                mascota={mascota}
                tipoProfesional={usuario?.tipoProfesional}
                onGuardar={handleGuardarMascota}
                onCancelar={() => setMostrarEdicion(false)}
                onEliminar={handleEliminarMascota}
                isCargando={isGuardando}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Sistema de Citas */}
      {mostrarCitas && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <SistemaCitas 
              mascotaId={mascota.id}
              mascotaNombre={mascota.nombre}
              propietarioId={usuario?.uid}
              propietarioNombre={usuario?.nombre}
              propietarioTelefono={usuario?.telefono}
              onCerrar={() => setMostrarCitas(false)}
            />
          </div>
        </div>
      )}


{openMetodoPago && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Chapita para {mascota.nombre}
                </h3>
                <button
                  onClick={() => setOpenMetodoPago(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              <MetodoDePago 
                mascotaNombre={mascota.nombre}
                mascotaId={mascota.id}
                mascotaFoto={mascota.fotoUrl}
                monto={5000} // Puedes hacer esto dinámico
                onCerrar={() => setOpenMetodoPago(false)}
              />
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default PetProfile; 