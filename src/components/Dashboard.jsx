import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from './Navbar';
import { FormularioCitaVeterinaria } from './FormularioCitaVeterinaria';
import { FormularioCitaPeluqueria } from './FormularioCitaPeluqueria';
import { FormularioCitaPaseador } from './FormularioCitaPaseador';
import Peluquerias from './Peluquerias';
import Veterinarias from './Veterinarias';
import { agregarMascotaAUsuario, obtenerUsuarioPorUid, getAllDataCollection,
   obtenerProfesionalesPorTipo, eliminarCita, actualizarCita, 
   eliminarCitaCompleta } from '../data/firebase/firebase';
import { FormularioMascota } from './FormularioMascota';
import Tiendas from './Tiendas';
import Paseadores from './Paseadores';
import { useTheme } from '../contexts/ThemeContext';
import DecoracionForm from './decoracionUi/DecoracionForm';
import SkeletonCardPet from './uiDashboardUser/SkeletonCardPet';
import { DashboardCitasColapsable } from './DashboardCitasColapsable';
import ModalAlertFormularioAgregarMascota from './uiDashboardUser/ModalAlertFormulariAgregarMascota';
import { DashboardTabBar } from './uiDashboardUser/DashboardTabBar';
import { useNotificacionApp } from '../contexts/NotificacionAppContext';
import { useNotificacionesEstadoCitasUsuario } from '../hooks/useNotificacionesEstadoCitasUsuario';
import FormularioReporteMascota from './FormularioReporteMascota';
import UseFrameMotion from './hook_frame_motion/UseFrameMotion';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, cerrarSesion, isCargandoLogout } = useAuth();
  const { typeTheme } = useTheme();
  const { mostrarError, mostrarExito, confirmar } = useNotificacionApp();
  

  // Estados para controlar los modales
  const [mostrarFormularioVeterinaria, setMostrarFormularioVeterinaria] = useState(false);
  const [mostrarFormularioPeluqueria, setMostrarFormularioPeluqueria] = useState(false);
  const [mostrarFormularioPaseador, setMostrarFormularioPaseador] = useState(false);
  const [clinicaSeleccionada, setClinicaSeleccionada] = useState(null);
  const [peluqueriaSeleccionada, setPeluqueriaSeleccionada] = useState(null);
  const [paseadorSeleccionado, setPaseadorSeleccionado] = useState(null);
  const [isCargandoMascota, setIsCargandoMascota] = useState(false);
  const [datosUsuario, setDatosUsuario] = useState(null);
  const [isCargandoUsuario, setIsCargandoUsuario] = useState(false);
  const [mostrarFormularioMascota, setMostrarFormularioMascota] = useState(false);
  const [mostrarFormularioReporteMascota, setMostrarFormularioReporteMascota] = useState(false);
  
  // Estados para el modal de alerta de mascota
  const [mostrarModalAlertaMascota, setMostrarModalAlertaMascota] = useState(false);
  const [tipoAlertaMascota, setTipoAlertaMascota] = useState('exito'); // 'exito' o 'error'
  const [mensajeAlertaMascota, setMensajeAlertaMascota] = useState('');
  const [nombreMascotaAlerta, setNombreMascotaAlerta] = useState('');
  

  // Estados para profesionales
  const [veterinarios, setVeterinarios] = useState([]);
  const [peluqueros, setPeluqueros] = useState([]);
  const [tiendas, setTiendas] = useState([]);
  const [paseadoresRaw, setPaseadoresRaw] = useState([]);
  const [isCargandoVeterinarios, setIsCargandoVeterinarios] = useState(false);
  const [isCargandoPeluqueros, setIsCargandoPeluqueros] = useState(false);
  const [isCargandoPaseadores, setIsCargandoPaseadores] = useState(false);
  const [reportesPerdidas, setReportesPerdidas] = useState([]);
  const [isCargandoReportesPerdidas, setIsCargandoReportesPerdidas] = useState(false);
  const [mostrarNuevaAlertaTemporal, setMostrarNuevaAlertaTemporal] = useState(false);
  const [imagenPerdidaModal, setImagenPerdidaModal] = useState(null);
  const [citasCancelando, setCitasCancelando] = useState(new Set()); // Para controlar qué citas se están cancelando
  // Filtro por zona
  const [mostrarTodosProfesionales, setMostrarTodosProfesionales] = useState(false);
  const [veterinariosRaw, setVeterinariosRaw] = useState([]);
  const [peluquerosRaw, setPeluquerosRaw] = useState([]);

  /** Pestañas inferiores solo en móvil (< md) */
  const [pestanaActiva, setPestanaActiva] = useState('mascotas');
  /** ID de la última cita creada: se resalta en la lista hasta que el usuario sale de la pestaña Citas tras verla */
  const [idCitaDestacar, setIdCitaDestacar] = useState(null);
  const visitoCitasConDestacadoRef = useRef(false);
  const pestanaAnteriorRef = useRef(pestanaActiva);
  const ultimaAlertaPerdidaMostradaRef = useRef(null);

  const {
    cantidadNovedadesEstado,
    idsConNovedadEstado,
    marcarTodasCitasEstadoVistas,
  } = useNotificacionesEstadoCitasUsuario(datosUsuario?.citas, usuario?.uid);

  /** Al salir de Citas: guardar estados vistos (el badge vuelve a reflejar solo cambios nuevos del profesional) */
  useEffect(() => {
    const salioDeCitas = pestanaAnteriorRef.current === 'citas' && pestanaActiva !== 'citas';
    pestanaAnteriorRef.current = pestanaActiva;
    if (salioDeCitas) {
      marcarTodasCitasEstadoVistas();
    }
  }, [pestanaActiva, marcarTodasCitasEstadoVistas]);

  /** En la pestaña Citas el badge se oculta (ya estás viendo el listado); en el resto muestra novedades */
  const cantidadBadgeCitasTab =
    pestanaActiva === 'citas' ? 0 : cantidadNovedadesEstado;

  useEffect(() => {
    if (pestanaActiva === 'citas' && idCitaDestacar) {
      visitoCitasConDestacadoRef.current = true;
    }
  }, [pestanaActiva, idCitaDestacar]);

  useEffect(() => {
    if (pestanaActiva === 'citas') return;
    if (visitoCitasConDestacadoRef.current) {
      setIdCitaDestacar(null);
      visitoCitasConDestacadoRef.current = false;
    }
  }, [pestanaActiva]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(max-width: 767px)').matches) return;
    window.scrollTo(0, 0);
  }, [pestanaActiva]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'perdidas') {
      setPestanaActiva('perdidas');
    }
  }, [location.search]);

  // Datos simulados de mascotas del usuario
  const mascotasUsuario = [
    {
      id: 1,
      nombre: "Firulais",
      raza: "Labrador",
      edad: 3
    },
    {
      id: 2,
      nombre: "Luna",
      raza: "Golden Retriever",
      edad: 2
    },
    {
      id: 3,
      nombre: "Rocky",
      raza: "Bulldog Francés",
      edad: 1
    }
  ];

  // Función para mapear datos de profesionales al formato esperado por los componentes
  const mapearProfesionalAVeterinaria = (profesional) => {
    const serviciosMapeados = profesional.servicios ? profesional.servicios.map(servicio => servicio.nombre) : [];
    
    return {
      id: profesional.id,
      nombre: profesional.nombre,
      direccion: profesional.direccion,
      telefono: profesional.telefono,
      especialidades: profesional.especialidad ? [profesional.especialidad] : [],
      servicios: serviciosMapeados,
      horario: profesional.horario || 'Horario no disponible',
      calificacion: 4.5, // Valor por defecto, se puede implementar sistema de calificaciones después
      distancia: 'Distancia no disponible', // Se puede implementar geolocalización después
      fotoLocalUrl: profesional.fotoLocalUrl || null, // Agregar URL de la imagen del local
      descuentos: profesional.descuentos || [] // Incluir descuentos del profesional
    };
  };

  const mapearProfesionalAPeluqueria = (profesional) => ({
    id: profesional.id,
    nombre: profesional.nombre,
    direccion: profesional.direccion,
    telefono: profesional.telefono,
    servicios: profesional.servicios ? profesional.servicios.map(servicio => servicio.nombre) : [],
    horario: profesional.horario || 'Horario no disponible',
    calificacion: 4.5, // Valor por defecto
    distancia: 'Distancia no disponible',
    fotoLocalUrl: profesional.fotoLocalUrl || null, // Agregar URL de la imagen del local
    descuentos: profesional.descuentos || [] // Incluir descuentos del profesional
  });

  const mapearProfesionalATienda = (profesional) => ({
    id: profesional.id,
    nombre: profesional.nombre,
    direccion: profesional.direccion,
    telefono: profesional.telefono,
    fotoLocalUrl: profesional.fotoLocalUrl || null // Agregar URL de la imagen del local
  });

  const mapearProfesionalAPaseador = (profesional) => ({
    id: profesional.id,
    nombre: profesional.nombre,
    direccion: profesional.direccion,
    telefono: profesional.telefono,
    servicios: profesional.servicios ? profesional.servicios.map((s) => s.nombre) : [],
    horario: profesional.horario || 'Horario no disponible',
    fotoLocalUrl: profesional.fotoLocalUrl || null,
    especialidadResumen: profesional.especialidad || '',
  });

  const cargarReportesPerdidas = async () => {
    setIsCargandoReportesPerdidas(true);
    try {
      const reportes = await getAllDataCollection('reportes-mascotas');
      const perdidasActivas = reportes
        .filter((reporte) => reporte.tipoPublicacion === 'perdida' && reporte.activa !== false)
        .sort((a, b) => {
          const fechaA = a.fechaCreacion?.seconds ? new Date(a.fechaCreacion.seconds * 1000) : new Date(a.fechaCreacion || 0);
          const fechaB = b.fechaCreacion?.seconds ? new Date(b.fechaCreacion.seconds * 1000) : new Date(b.fechaCreacion || 0);
          return fechaB - fechaA;
        });
      setReportesPerdidas(perdidasActivas);
    } catch (error) {
      console.error('Error al cargar reportes de mascotas perdidas:', error);
    } finally {
      setIsCargandoReportesPerdidas(false);
    }
  };



    // Función para cargar profesionales
  const cargarProfesionales = async () => {
    setIsCargandoVeterinarios(true);
    setIsCargandoPeluqueros(true);
    setIsCargandoPaseadores(true);

    try {
      // Cargar veterinarios
      const veterinariosData = await obtenerProfesionalesPorTipo('veterinario');
      setVeterinariosRaw(veterinariosData);
      const veterinariosMapeados = veterinariosData.map(mapearProfesionalAVeterinaria);
      setVeterinarios(veterinariosMapeados);

      // Cargar peluqueros
      const peluquerosData = await obtenerProfesionalesPorTipo('peluquero');
      setPeluquerosRaw(peluquerosData);
      const peluquerosMapeados = peluquerosData.map(mapearProfesionalAPeluqueria);
      setPeluqueros(peluquerosMapeados);

      // Cargar tiendas
      const tiendaData = await obtenerProfesionalesPorTipo('tienda');
      const tiendasMapeadas = tiendaData.map(mapearProfesionalATienda);
      setTiendas(tiendasMapeadas);

      // Paseadores (citas vía FormularioCitaPaseador + contacto telefónico)
      const paseadoresData = await obtenerProfesionalesPorTipo('paseador');
      setPaseadoresRaw(paseadoresData);
    } catch (error) {
      console.error("Error al cargar profesionales:", error);
    } finally {
      setIsCargandoVeterinarios(false);
      setIsCargandoPeluqueros(false);
      setIsCargandoPaseadores(false);
    }
  };

  // Cargar profesionales cuando el componente se monta
  useEffect(() => {
    cargarProfesionales();
  }, []);

  useEffect(() => {
    cargarReportesPerdidas();
    const intervalo = window.setInterval(cargarReportesPerdidas, 60000);
    return () => window.clearInterval(intervalo);
  }, []);

  useEffect(() => {
    if (!reportesPerdidas.length) {
      setMostrarNuevaAlertaTemporal(false);
      return;
    }

    const idUltimaPerdida = reportesPerdidas[0]?.id;
    if (!idUltimaPerdida) return;
    if (ultimaAlertaPerdidaMostradaRef.current === idUltimaPerdida) return;

    setMostrarNuevaAlertaTemporal(true);
    ultimaAlertaPerdidaMostradaRef.current = idUltimaPerdida;

    const timeoutId = window.setTimeout(() => {
      setMostrarNuevaAlertaTemporal(false);
    }, 12000);

    return () => window.clearTimeout(timeoutId);
  }, [reportesPerdidas]);

  // Función para cerrar sesión
  const handleCerrarSesion = async () => {
    try {
      await cerrarSesion();
      navigate('/login'); // Redirigir al login
    } catch (error) {
      mostrarError('Error al cerrar sesión. Inténtalo de nuevo.');
    }
  };

    // Estado para forzar re-render de citas
    const [citasActualizadas, setCitasActualizadas] = useState(false);

    // Función para marcar citas como actualizadas
    const marcarCitasActualizadas = () => {
      setCitasActualizadas(prev => !prev);
    };


  // Funciones para manejar los formularios
  const manejarAbrirFormularioVeterinaria = (clinica) => {
    setClinicaSeleccionada(clinica);
    setMostrarFormularioVeterinaria(true);
  };

  const manejarAbrirFormularioPeluqueria = (peluqueria) => {
    setPeluqueriaSeleccionada(peluqueria);
    setMostrarFormularioPeluqueria(true);
  };

  const manejarAbrirFormularioPaseador = (paseador) => {
    if (!datosUsuario?.infoMascotas?.length) {
      mostrarError('Necesitás tener al menos una mascota registrada para solicitar un paseo.');
      return;
    }
    setPaseadorSeleccionado(paseador);
    setMostrarFormularioPaseador(true);
  };

  const manejarEnviarCitaVeterinaria = (datosCita) => {
    // Aquí iría la lógica para enviar a la API
   // alert('¡Cita veterinaria agendada exitosamente!');
    setMostrarFormularioVeterinaria(false);
    setClinicaSeleccionada(null);
   // Marcar que las citas se actualizaron
   marcarCitasActualizadas();
    if (datosCita?.id) setIdCitaDestacar(datosCita.id);

  };

  const manejarEnviarCitaPeluqueria = (datosCita) => {
    // La cita ya se guardó en Firebase, solo mostrar confirmación
   // alert('¡Cita de peluquería reservada exitosamente!');
    setMostrarFormularioPeluqueria(false);
    setPeluqueriaSeleccionada(null);
    // Marcar que las citas se actualizaron
    marcarCitasActualizadas();
    if (datosCita?.id) setIdCitaDestacar(datosCita.id);
  };

  const manejarEnviarCitaPaseador = (datosCita) => {
    setMostrarFormularioPaseador(false);
    setPaseadorSeleccionado(null);
    marcarCitasActualizadas();
    if (datosCita?.id) setIdCitaDestacar(datosCita.id);
  };

  // Función para cargar datos del usuario desde Firestore
  const cargarDatosUsuario = async () => {
    if (!usuario?.uid) return;
    
    setIsCargandoUsuario(true);
    try {
      const datos = await obtenerUsuarioPorUid(usuario.uid);
      setDatosUsuario(datos);
    } catch (error) {
      console.error("Error al cargar datos del usuario:", error);
    } finally {
      setIsCargandoUsuario(false);
    }
  };

  // Cargar datos del usuario cuando el componente se monta
  useEffect(() => {
    cargarDatosUsuario();
  }, [usuario?.uid, citasActualizadas]);
  
  // Zona del usuario desde Firestore
  const zonaUsuario = datosUsuario?.ubicacion?.zona;

  // Listas filtradas según zona y toggle "ver todos"
  const veterinariosParaMostrar = useMemo(() => {
    const fuente = (mostrarTodosProfesionales || !zonaUsuario) 
      ? veterinariosRaw 
      : veterinariosRaw.filter((p) => p?.ubicacion?.zona === zonaUsuario);
    return fuente.map(mapearProfesionalAVeterinaria);
  }, [veterinariosRaw, mostrarTodosProfesionales, zonaUsuario]);

  const peluquerosParaMostrar = useMemo(() => {
    const fuente = (mostrarTodosProfesionales || !zonaUsuario) 
      ? peluquerosRaw 
      : peluquerosRaw.filter((p) => p?.ubicacion?.zona === zonaUsuario);
    return fuente.map(mapearProfesionalAPeluqueria);
  }, [peluquerosRaw, mostrarTodosProfesionales, zonaUsuario]);

  const paseadoresParaMostrar = useMemo(() => {
    const fuente =
      mostrarTodosProfesionales || !zonaUsuario
        ? paseadoresRaw
        : paseadoresRaw.filter((p) => p?.ubicacion?.zona === zonaUsuario);
    return fuente.map(mapearProfesionalAPaseador);
  }, [paseadoresRaw, mostrarTodosProfesionales, zonaUsuario]);

// Función para cancelar una cita
const handleCancelarCita = async (cita) => {
  if (cita?.id == null || cita.id === '') {
    mostrarError('No se pudo identificar la cita. Recargá la página e intentá de nuevo.');
    return;
  }

  const ok = await confirmar('¿Estás seguro de que querés cancelar esta cita?', {
    titulo: 'Cancelar cita',
    textoConfirmar: 'Sí, cancelar',
    textoCancelar: 'Volver',
  });
  if (!ok) return;

  const idCita = String(cita.id);

  // Agregar la cita al set de citas cancelando
  setCitasCancelando((prev) => new Set(prev).add(idCita));

  try {
    // Quita la cita del usuario (y del profesional si hay clinicaId / peluqueriaId)
    await eliminarCitaCompleta(cita, { clienteIdFallback: usuario?.uid || null });
    
    // Actualizar el estado local inmediatamente para mejor UX
    // Filtrar la cita eliminada del array de citas
    setDatosUsuario(prev => {
      if (!prev || !prev.citas) return prev;
      return {
        ...prev,
        citas: prev.citas.filter((c) => String(c.id) !== idCita)
      };
    });
    
    // Recargar datos del usuario para asegurar sincronización completa
    await cargarDatosUsuario();
    
    mostrarExito('La cita se canceló correctamente.', 'Listo');
    // Marcar que las citas se actualizaron
    marcarCitasActualizadas();
    if (String(cita.id) === String(idCitaDestacar)) {
      setIdCitaDestacar(null);
      visitoCitasConDestacadoRef.current = false;
    }
  } catch (error) {
    console.error('Error al cancelar cita:', error);
    mostrarError('Error al cancelar la cita. Inténtalo de nuevo.');
  } finally {
    // Remover la cita del set de citas cancelando
    setCitasCancelando(prev => {
      const nuevoSet = new Set(prev);
      nuevoSet.delete(idCita);
      return nuevoSet;
    });
  }
};

  const irAProfesionalesDesdeCitas = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) {
      setPestanaActiva('profesionales');
      return;
    }
    document.getElementById('panel-profesionales')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Función para agregar mascota usando la función centralizada
  const handleAgregarMascota = async (mascota) => {
    setIsCargandoMascota(true);
    try {
      await agregarMascotaAUsuario(usuario.uid, mascota);

      await cargarDatosUsuario();

      setMostrarFormularioMascota(false);

      setNombreMascotaAlerta(mascota.nombre || '');
      setMensajeAlertaMascota('');
      setTipoAlertaMascota('exito');
      setMostrarModalAlertaMascota(true);
      return true;
    } catch (e) {
      console.error('Error al agregar mascota:', e);

      setNombreMascotaAlerta('');
      setMensajeAlertaMascota(e.message || 'Error al agregar mascota. Inténtalo de nuevo.');
      setTipoAlertaMascota('error');
      setMostrarModalAlertaMascota(true);
      return false;
    } finally {
      setIsCargandoMascota(false);
    }
  };

  const easePanelMovil = [0.4, 0, 0.2, 1];

  const abrirModalImagenPerdida = (urlImagen, nombreMascota) => {
    setImagenPerdidaModal({
      url: urlImagen || '/dog-avatar.png',
      nombre: nombreMascota || 'Mascota perdida'
    });
  };

  const cerrarModalImagenPerdida = () => {
    setImagenPerdidaModal(null);
  };

  const renderSeccionPerdidas = () => (
    <div className={typeTheme === 'light'
      ? 'bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8'
      : 'bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8'
    }>
      <h3 className={typeTheme === 'light' ? 'text-xl font-bold text-gray-900 mb-2' : 'text-xl font-bold text-white mb-2'}>
        Mascotas perdidas
      </h3>
      <p className={typeTheme === 'light' ? 'text-sm text-gray-600 mb-5' : 'text-sm text-gray-300 mb-5'}>
        Acá ves la alerta más reciente y el listado completo de mascotas reportadas como perdidas.
      </p>

      {isCargandoReportesPerdidas ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          <p className="mt-2 text-gray-500">Cargando alertas...</p>
        </div>
      ) : reportesPerdidas.length === 0 ? (
        <div className="text-center py-8 bg-red-50 rounded-lg border border-red-100">
          <p className="font-semibold text-red-800">No hay alertas activas en este momento.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {mostrarNuevaAlertaTemporal && (
            <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4">
              <p className="text-xs uppercase tracking-wide text-red-700 font-semibold mb-2">Nueva alerta</p>
              <div className="flex items-start gap-3">
                <img
                  src={reportesPerdidas[0]?.imagen || '/dog-avatar.png'}
                  alt={reportesPerdidas[0]?.nombreMascota || 'Mascota perdida'}
                  className="w-14 h-14 rounded-full object-cover border border-red-200 bg-white cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => abrirModalImagenPerdida(reportesPerdidas[0]?.imagen, reportesPerdidas[0]?.nombreMascota)}
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-lg font-bold text-red-900">{reportesPerdidas[0]?.nombreMascota || 'Mascota perdida'}</h4>
                  <p className="text-sm text-red-800 mt-1">{reportesPerdidas[0]?.descripcion}</p>
                  <p className="text-xs text-red-700 mt-2">Ubicación: {reportesPerdidas[0]?.ubicacion || 'No informada'}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {reportesPerdidas.map((reporte) => (
              <div key={reporte.id} className="rounded-lg border border-red-200 bg-white p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={reporte.imagen || '/dog-avatar.png'}
                      alt={reporte.nombreMascota || 'Mascota perdida'}
                      className="w-12 h-12 rounded-full object-cover border border-red-200 bg-white cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => abrirModalImagenPerdida(reporte.imagen, reporte.nombreMascota)}
                    />
                    <h5 className="font-semibold text-gray-900 truncate">{reporte.nombreMascota || 'Mascota perdida'}</h5>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-semibold">Activa</span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-3">{reporte.descripcion}</p>
                <p className="text-xs text-gray-500 mt-2">Ubicación: {reporte.ubicacion || 'No informada'}</p>
                <p className="text-xs text-gray-500">Contacto: {reporte.contacto || 'No informado'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const obtenerClaseCardMascota = (isPerdida) => {
    if (isPerdida) {
      return 'bg-red-50 p-4 rounded-lg shadow-sm border border-red-300 hover:shadow-md hover:border-red-400 transition-all duration-200 cursor-pointer group';
    }
    return 'bg-white p-4 rounded-lg shadow-sm border border-orange-100 hover:shadow-md hover:border-orange-300 transition-all duration-200 cursor-pointer group';
  };

  return (
    <div className={
      typeTheme === 'light'
        ? "bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 min-h-screen pt-24 md:pt-20"
        : "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen pt-24 md:pt-20"
    }>
      {/* Fondo decorativo - Responsivo */}
      <DecoracionForm isFullScreen={true} />


      {/* Navbar modular */}
      <Navbar 
        tipo="dashboard"
        onCerrarSesion={handleCerrarSesion}
        isCargandoLogout={isCargandoLogout}
      />

      {/* Main Content: móvil con AnimatePresence; desktop sin animación de pestañas */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-32 md:py-6 md:pb-6">
        <div className="md:hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pestanaActiva}
              className="max-md:pt-2 flow-root"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.24, ease: easePanelMovil }}
              id={`panel-${pestanaActiva}`}
              role="tabpanel"
              aria-labelledby={`tab-dashboard-${pestanaActiva}`}
            >
              {pestanaActiva === 'mascotas' && (
                <>
        {/* Header del Dashboard */}
        <div className="text-center mt-4 mb-8">
          <h2 className={typeTheme === 'light'
            ? "text-2xl sm:text-3xl font-bold text-gray-900 mb-2"
            : "text-2xl sm:text-3xl font-bold text-white mb-2"
          }>
            Bienvenido a  Huellitas Seguras
          </h2>
          <p className={typeTheme === 'light'?"text-sm  text-gray-600 mb-4":'text-sm  text-white mb-4' }>
            Gestiona tus mascotas: veterinaria, peluquería, tiendas, paseadores y descuentos
          </p>
        </div>

        {/* Sección de Mascotas */}
        <div className={typeTheme === 'light'
          ? "bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8"
          : "bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8"
        }>
          <h3 className={typeTheme === 'light'?"text-xl font-bold text-gray-900 mb-4":'text-xl font-bold text-white mb-4' } >Tus Mascotas</h3>
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              className="min-h-[48px] rounded-lg border-2 border-dashed border-orange-300 bg-orange-50 hover:border-orange-400 hover:bg-orange-100 transition-colors"
              onClick={() => setMostrarFormularioMascota(true)}
            >
              <span className="inline-flex items-center gap-2 text-orange-700 font-semibold text-sm">
                <span className="w-6 h-6 rounded-full bg-orange-200 text-orange-700 inline-flex items-center justify-center font-bold">+</span>
                Agregar mascota
              </span>
            </button>
            <button
              type="button"
              className="min-h-[48px] rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 hover:border-blue-400 hover:bg-blue-100 transition-colors"
              onClick={() => setMostrarFormularioReporteMascota(true)}
            >
              <span className="inline-flex items-center gap-2 text-blue-700 font-semibold text-sm">
                <span className="w-6 h-6 rounded-full bg-blue-200 text-blue-700 inline-flex items-center justify-center font-bold">!</span>
                Reportar avistamiento/perdida
              </span>
            </button>
          </div>
          
          {isCargandoUsuario ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Skeleton cards mientras carga */}
              {[1, 2, 3].map((index) => (
                <SkeletonCardPet key={index} />
              ))}
              
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Tarjetas de Mascotas desde Firestore */}
              {(datosUsuario?.infoMascotas || []).map((mascota, idx) => (
                <Link 
                  key={mascota.id || idx} 
                  to={`/pet-profile/${mascota.id || idx}`}
                  className={obtenerClaseCardMascota(mascota.isPerdida)}
                >
                  {/* Header con foto si existe */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-lg text-gray-900 group-hover:text-orange-600 transition-colors">
                          {mascota.nombre}
                        </h4>
                        {mascota.isPerdida && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                            PERDIDA
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">{mascota.raza} • {mascota.edad}</p>
                      {mascota.isPerdida && (
                        <p className="text-xs text-red-700 mt-1 font-medium">
                          Alerta activa. Si ya la encontraste, actualizá el estado en su perfil.
                        </p>
                      )}
                    </div>
                    {mascota.fotoUrl && (
                      <img 
                        src={mascota.fotoUrl} 
                        alt={mascota.nombre}
                        className="w-12 h-12 rounded-full object-cover ml-2"
                      />
                    )}
                  </div>
                  
                  {/* Información básica */}
                  <div className="space-y-1 mb-3">
                    {mascota.color && (
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">Color:</span> {mascota.color}
                      </p>
                    )}
                    {mascota.contacto && (
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">Contacto:</span> {mascota.contacto}
                      </p>
                    )}
                  </div>
                  
                  {/* Vacunas */}
                  {mascota.vacunas && mascota.vacunas.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-700 mb-1">Vacunas:</p>
                      <div className="flex flex-wrap gap-1">
                        {mascota.vacunas.map((vacuna, vIdx) => (
                          <span key={vIdx} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            {vacuna.nombre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Alergias y enfermedades */}
                  {(mascota.alergias || mascota.enfermedades) && (
                    <div className="mb-3">
                      {mascota.alergias && (
                        <p className="text-xs text-gray-500 mb-1">
                          <span className="font-medium">Alergias:</span> {mascota.alergias}
                        </p>
                      )}
                      {mascota.enfermedades && (
                        <p className="text-xs text-gray-500">
                          <span className="font-medium">Enfermedades:</span> {mascota.enfermedades}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Notas */}
                  {mascota.notas && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">Notas:</span> {mascota.notas}
                      </p>
                    </div>
                  )}
                  
                  {/* Indicador de click */}
                  <div className="flex items-center justify-end mt-2">
                    <span className={`text-xs opacity-0 group-hover:opacity-100 transition-opacity ${mascota.isPerdida ? 'text-red-600' : 'text-orange-500'}`}>
                      Ver perfil →
                    </span>
                  </div>
                </Link>
              ))}
              
              {/* Botón para agregar nueva mascota */}
            </div>
          )}
        </div>
                </>
              )}

              {pestanaActiva === 'citas' && (
        <DashboardCitasColapsable 
          datosUsuario={datosUsuario}
          isCargandoUsuario={isCargandoUsuario}
          typeTheme={typeTheme}
          citasCancelando={citasCancelando}
          handleCancelarCita={handleCancelarCita}
          idCitaDestacar={idCitaDestacar}
          onIrAProfesionales={irAProfesionalesDesdeCitas}
          idsConNovedadEstado={idsConNovedadEstado}
          onMarcarNovedadesEstadoVistas={marcarTodasCitasEstadoVistas}
        />
              )}

              {pestanaActiva === 'profesionales' && (
                <>

          <div className="flex items-center justify-between mb-4">
            <div className={typeTheme === 'light' ? 'text-m text-gray-700' : 'text-m text-white'}>
              {zonaUsuario ? `Tu zona: ${zonaUsuario}` : 'Sin zona definida'}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMostrarTodosProfesionales(false)}
                disabled={isCargandoVeterinarios || isCargandoPeluqueros || isCargandoPaseadores}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                  !mostrarTodosProfesionales
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                }`}
              >
                Mi zona
              </button>
              <button
                type="button"
                onClick={() => setMostrarTodosProfesionales(true)}
                disabled={isCargandoVeterinarios || isCargandoPeluqueros || isCargandoPaseadores}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                  mostrarTodosProfesionales
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                }`}
              >
                Ver todos
              </button>
            </div>
          </div>

          <Veterinarias
            clinicasVeterinarias={veterinariosParaMostrar}
            manejarAbrirFormularioVeterinaria={manejarAbrirFormularioVeterinaria}
            isCargando={isCargandoVeterinarios}
          />
          <Peluquerias
            peluquerias={peluquerosParaMostrar}
            manejarAbrirFormularioPeluqueria={manejarAbrirFormularioPeluqueria}
            isCargando={isCargandoPeluqueros}
          />
          <Tiendas tiendas={tiendas} isCargando={isCargandoUsuario} />
                </>
              )}

              {pestanaActiva === 'paseadores' && (
                <>
          <div className="flex items-center justify-between mb-4">
            <div className={typeTheme === 'light' ? 'text-m text-gray-700' : 'text-m text-white'}>
              {zonaUsuario ? `Tu zona: ${zonaUsuario}` : 'Sin zona definida'}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMostrarTodosProfesionales(false)}
                disabled={isCargandoVeterinarios || isCargandoPeluqueros || isCargandoPaseadores}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                  !mostrarTodosProfesionales
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                }`}
              >
                Mi zona
              </button>
              <button
                type="button"
                onClick={() => setMostrarTodosProfesionales(true)}
                disabled={isCargandoVeterinarios || isCargandoPeluqueros || isCargandoPaseadores}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                  mostrarTodosProfesionales
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                }`}
              >
                Ver todos
              </button>
            </div>
          </div>
          <Paseadores
            paseadores={paseadoresParaMostrar}
            isCargando={isCargandoPaseadores}
            onSolicitarCita={manejarAbrirFormularioPaseador}
          />
                </>
              )}

              {pestanaActiva === 'perdidas' && renderSeccionPerdidas()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Desktop: todas las secciones visibles, sin animación de cambio de pestaña */}
        <div className="hidden md:block">
          <div id="panel-mascotas" role="tabpanel" aria-labelledby="tab-dashboard-mascotas">
        {/* Header del Dashboard */}
        <div className="text-center mt-4 mb-8">
          <h2 className={typeTheme === 'light'
            ? "text-2xl sm:text-3xl font-bold text-gray-900 mb-2"
            : "text-2xl sm:text-3xl font-bold text-white mb-2"
          }>
            Bienvenido a  Huellitas Seguras
          </h2>
          <p className={typeTheme === 'light'?"text-sm  text-gray-600 mb-4":'text-sm  text-white mb-4' }>
            Gestiona tus mascotas: veterinaria, peluquería, tiendas, paseadores y descuentos
          </p>
        </div>

        {/* Sección de Mascotas */}
        <div className={typeTheme === 'light'
          ? "bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8"
          : "bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8"
        }>
          <h3 className={typeTheme === 'light'?"text-xl font-bold text-gray-900 mb-4":'text-xl font-bold text-white mb-4' } >Tus Mascotas</h3>
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              className="min-h-[48px] rounded-lg border-2 border-dashed border-orange-300 bg-orange-50 hover:border-orange-400 hover:bg-orange-100 transition-colors"
              onClick={() => setMostrarFormularioMascota(true)}
            >
              <span className="inline-flex items-center gap-2 text-orange-700 font-semibold text-sm">
                <span className="w-6 h-6 rounded-full bg-orange-200 text-orange-700 inline-flex items-center justify-center font-bold">+</span>
                Agregar mascota
              </span>
            </button>
            <button
              type="button"
              className="min-h-[48px] rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 hover:border-blue-400 hover:bg-blue-100 transition-colors"
              onClick={() => setMostrarFormularioReporteMascota(true)}
            >
              <span className="inline-flex items-center gap-2 text-blue-700 font-semibold text-sm">
                <span className="w-6 h-6 rounded-full bg-blue-200 text-blue-700 inline-flex items-center justify-center font-bold">!</span>
                Reportar avistamiento/perdida
              </span>
            </button>
          </div>
          
          {isCargandoUsuario ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((index) => (
                <SkeletonCardPet key={index} />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(datosUsuario?.infoMascotas || []).map((mascota, idx) => (
                <Link 
                  key={mascota.id || idx} 
                  to={`/pet-profile/${mascota.id || idx}`}
                  className={obtenerClaseCardMascota(mascota.isPerdida)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-lg text-gray-900 group-hover:text-orange-600 transition-colors">
                          {mascota.nombre}
                        </h4>
                        {mascota.isPerdida && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                            PERDIDA
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">{mascota.raza} • {mascota.edad}</p>
                      {mascota.isPerdida && (
                        <p className="text-xs text-red-700 mt-1 font-medium">
                          Alerta activa. Si ya la encontraste, actualizá el estado en su perfil.
                        </p>
                      )}
                    </div>
                    {mascota.fotoUrl && (
                      <img 
                        src={mascota.fotoUrl} 
                        alt={mascota.nombre}
                        className="w-12 h-12 rounded-full object-cover ml-2"
                      />
                    )}
                  </div>
                  <div className="space-y-1 mb-3">
                    {mascota.color && (
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">Color:</span> {mascota.color}
                      </p>
                    )}
                    {mascota.contacto && (
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">Contacto:</span> {mascota.contacto}
                      </p>
                    )}
                  </div>
                  {mascota.vacunas && mascota.vacunas.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-700 mb-1">Vacunas:</p>
                      <div className="flex flex-wrap gap-1">
                        {mascota.vacunas.map((vacuna, vIdx) => (
                          <span key={vIdx} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            {vacuna.nombre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(mascota.alergias || mascota.enfermedades) && (
                    <div className="mb-3">
                      {mascota.alergias && (
                        <p className="text-xs text-gray-500 mb-1">
                          <span className="font-medium">Alergias:</span> {mascota.alergias}
                        </p>
                      )}
                      {mascota.enfermedades && (
                        <p className="text-xs text-gray-500">
                          <span className="font-medium">Enfermedades:</span> {mascota.enfermedades}
                        </p>
                      )}
                    </div>
                  )}
                  {mascota.notas && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">Notas:</span> {mascota.notas}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-end mt-2">
                    <span className={`text-xs opacity-0 group-hover:opacity-100 transition-opacity ${mascota.isPerdida ? 'text-red-600' : 'text-orange-500'}`}>
                      Ver perfil →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
          </div>

          <div id="panel-citas" role="tabpanel" aria-labelledby="tab-dashboard-citas">
        <DashboardCitasColapsable 
          datosUsuario={datosUsuario}
          isCargandoUsuario={isCargandoUsuario}
          typeTheme={typeTheme}
          citasCancelando={citasCancelando}
          handleCancelarCita={handleCancelarCita}
          idCitaDestacar={idCitaDestacar}
          onIrAProfesionales={irAProfesionalesDesdeCitas}
          idsConNovedadEstado={idsConNovedadEstado}
          onMarcarNovedadesEstadoVistas={marcarTodasCitasEstadoVistas}
        />
          </div>

      

          <div className="flex items-center justify-between mb-4">
            <div className={typeTheme === 'light' ? 'text-m text-gray-700' : 'text-m text-white'}>
              {zonaUsuario ? `Tu zona: ${zonaUsuario}` : 'Sin zona definida'}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMostrarTodosProfesionales(false)}
                disabled={isCargandoVeterinarios || isCargandoPeluqueros || isCargandoPaseadores}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                  !mostrarTodosProfesionales
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                }`}
              >
                Mi zona
              </button>
              <button
                type="button"
                onClick={() => setMostrarTodosProfesionales(true)}
                disabled={isCargandoVeterinarios || isCargandoPeluqueros || isCargandoPaseadores}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                  mostrarTodosProfesionales
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                }`}
              >
                Ver todos
              </button>
            </div>
          </div>

          <div
            id="panel-profesionales"
            role="tabpanel"
            aria-labelledby="tab-dashboard-profesionales"
          >
          <Veterinarias
            clinicasVeterinarias={veterinariosParaMostrar}
            manejarAbrirFormularioVeterinaria={manejarAbrirFormularioVeterinaria}
            isCargando={isCargandoVeterinarios}
          />
          <Peluquerias
            peluquerias={peluquerosParaMostrar}
            manejarAbrirFormularioPeluqueria={manejarAbrirFormularioPeluqueria}
            isCargando={isCargandoPeluqueros}
          />
          <Tiendas tiendas={tiendas} isCargando={isCargandoUsuario} />
          </div>

          <div
            id="panel-paseadores"
            role="tabpanel"
            aria-labelledby="tab-dashboard-paseadores"
          >
          <Paseadores
            paseadores={paseadoresParaMostrar}
            isCargando={isCargandoPaseadores}
            onSolicitarCita={manejarAbrirFormularioPaseador}
          />
          </div>

          <div id="panel-perdidas" role="tabpanel" aria-labelledby="tab-dashboard-perdidas">
            {renderSeccionPerdidas()}
          </div>
        </div>
      </div>

      <DashboardTabBar
        pestanaActiva={pestanaActiva}
        onCambiarPestana={setPestanaActiva}
        typeTheme={typeTheme}
        cantidadCitasNuevasEnTab={cantidadBadgeCitasTab}
        cantidadPerdidasEnTab={reportesPerdidas.length}
      />

      {/* Modales de Formularios */}
      {mostrarFormularioVeterinaria && clinicaSeleccionada && (
        <FormularioCitaVeterinaria
          clinica={clinicaSeleccionada}
          mascotas={datosUsuario?.infoMascotas || []}
          onCerrar={() => {
            setMostrarFormularioVeterinaria(false);
            setClinicaSeleccionada(null);
          }}
          onEnviar={manejarEnviarCitaVeterinaria}
        />
      )}

      {mostrarFormularioPeluqueria && peluqueriaSeleccionada && (
        <FormularioCitaPeluqueria
          peluqueria={peluqueriaSeleccionada}
          mascotas={datosUsuario?.infoMascotas || []}
          onCerrar={() => {
            setMostrarFormularioPeluqueria(false);
            setPeluqueriaSeleccionada(null);
          }}
          onEnviar={manejarEnviarCitaPeluqueria}
        />
      )}

      {mostrarFormularioPaseador && paseadorSeleccionado && (
        <FormularioCitaPaseador
          paseador={paseadorSeleccionado}
          mascotas={datosUsuario?.infoMascotas || []}
          onCerrar={() => {
            setMostrarFormularioPaseador(false);
            setPaseadorSeleccionado(null);
          }}
          onEnviar={manejarEnviarCitaPaseador}
        />
      )}

      {/* Modal para agregar mascota */}
      {mostrarFormularioMascota && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[97vh] overflow-y-auto">
            <div className="">
              <div className="flex justify-between items-center ">
                <button
                  type="button"
                  onClick={() => setMostrarFormularioMascota(false)}
                  disabled={isCargandoMascota}
                  className="text-gray-400 mr-2 ml-2 hover:text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-gray-400 text-2xl font-bold"
                  aria-label="Cerrar formulario"
                >
                  ×
                </button>
              </div>
              <FormularioMascota 
                onAgregarMascota={handleAgregarMascota} 
                isCargando={isCargandoMascota} 
              />
            </div>
          </div>
        </div>
      )}

      {mostrarFormularioReporteMascota && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[97vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-bold text-gray-900">Nuevo reporte comunitario</h4>
                <button
                  type="button"
                  onClick={() => setMostrarFormularioReporteMascota(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  aria-label="Cerrar formulario"
                >
                  ×
                </button>
              </div>
              <FormularioReporteMascota
                usuario={usuario}
                onPublicacionCreada={() => mostrarExito('Reporte publicado correctamente.')}
                onCerrar={() => setMostrarFormularioReporteMascota(false)}
              />
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {imagenPerdidaModal && (
          <UseFrameMotion
            tipoAnimacion="fade"
            duracion={0.2}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={cerrarModalImagenPerdida}
          >
            <UseFrameMotion
              tipoAnimacion="scale"
              duracion={0.28}
              className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={cerrarModalImagenPerdida}
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                aria-label="Cerrar imagen"
              >
                ×
              </button>
              <img
                src={imagenPerdidaModal.url}
                alt={imagenPerdidaModal.nombre}
                className="w-full max-h-[80vh] object-contain bg-gray-100"
              />
              <div className="px-4 py-3 border-t border-gray-200">
                <p className="font-semibold text-gray-900">{imagenPerdidaModal.nombre}</p>
              </div>
            </UseFrameMotion>
          </UseFrameMotion>
        )}
      </AnimatePresence>

      {/* Modal de alerta para agregar mascota */}
      <ModalAlertFormularioAgregarMascota
        isAbierto={mostrarModalAlertaMascota}
        onCerrar={() => setMostrarModalAlertaMascota(false)}
        tipo={tipoAlertaMascota}
        mensaje={mensajeAlertaMascota}
        nombreMascota={nombreMascotaAlerta}
      />
    </div>
  );
};

export default Dashboard; 