import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from './Navbar';
import { FormularioCitaVeterinaria } from './FormularioCitaVeterinaria';
import { FormularioCitaPeluqueria } from './FormularioCitaPeluqueria';
import Peluquerias from './Peluquerias';
import Veterinarias from './Veterinarias';
import { agregarMascotaAUsuario, obtenerUsuarioPorUid,
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

const Dashboard = () => {
  const navigate = useNavigate();
  const { usuario, cerrarSesion, isCargandoLogout } = useAuth();
  const { typeTheme } = useTheme();
  const { mostrarError, confirmar } = useNotificacionApp();
  

  // Estados para controlar los modales
  const [mostrarFormularioVeterinaria, setMostrarFormularioVeterinaria] = useState(false);
  const [mostrarFormularioPeluqueria, setMostrarFormularioPeluqueria] = useState(false);
  const [clinicaSeleccionada, setClinicaSeleccionada] = useState(null);
  const [peluqueriaSeleccionada, setPeluqueriaSeleccionada] = useState(null);
  const [isCargandoMascota, setIsCargandoMascota] = useState(false);
  const [datosUsuario, setDatosUsuario] = useState(null);
  const [isCargandoUsuario, setIsCargandoUsuario] = useState(false);
  const [mostrarFormularioMascota, setMostrarFormularioMascota] = useState(false);
  
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
  const [citasCancelando, setCitasCancelando] = useState(new Set()); // Para controlar qué citas se están cancelando
  // Filtro por zona
  const [mostrarTodosProfesionales, setMostrarTodosProfesionales] = useState(false);
  const [veterinariosRaw, setVeterinariosRaw] = useState([]);
  const [peluquerosRaw, setPeluquerosRaw] = useState([]);

  /** Pestañas inferiores solo en móvil (< md) */
  const [pestanaActiva, setPestanaActiva] = useState('mascotas');
  /** Contador para badge en TabBar "Citas" tras agendar (vet/peluquería); se limpia al abrir esa pestaña */
  const [pendientesTabCitas, setPendientesTabCitas] = useState(0);
  /** ID de la última cita creada: se resalta en la lista hasta que el usuario sale de la pestaña Citas tras verla */
  const [idCitaDestacar, setIdCitaDestacar] = useState(null);
  const visitoCitasConDestacadoRef = useRef(false);

  useEffect(() => {
    if (pestanaActiva === 'citas') {
      setPendientesTabCitas(0);
    }
  }, [pestanaActiva]);

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

      // Paseadores (contacto directo; sin citas en app)
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

  const manejarEnviarCitaVeterinaria = (datosCita) => {
    // Aquí iría la lógica para enviar a la API
   // alert('¡Cita veterinaria agendada exitosamente!');
    setMostrarFormularioVeterinaria(false);
    setClinicaSeleccionada(null);
   // Marcar que las citas se actualizaron
   marcarCitasActualizadas();
    setPendientesTabCitas((n) => Math.min(n + 1, 99));
    if (datosCita?.id) setIdCitaDestacar(datosCita.id);

  };

  const manejarEnviarCitaPeluqueria = (datosCita) => {
    // La cita ya se guardó en Firebase, solo mostrar confirmación
   // alert('¡Cita de peluquería reservada exitosamente!');
    setMostrarFormularioPeluqueria(false);
    setPeluqueriaSeleccionada(null);
    // Marcar que las citas se actualizaron
    marcarCitasActualizadas();
    setPendientesTabCitas((n) => Math.min(n + 1, 99));
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
  const ok = await confirmar('¿Estás seguro de que querés cancelar esta cita?', {
    titulo: 'Cancelar cita',
    textoConfirmar: 'Sí, cancelar',
    textoCancelar: 'Volver',
  });
  if (!ok) return;

  // Agregar la cita al set de citas cancelando
  setCitasCancelando(prev => new Set(prev).add(cita.id));

  try {
    // Usar la nueva función que elimina la cita completamente
    await eliminarCitaCompleta(cita);
    
    // Actualizar el estado local inmediatamente para mejor UX
    // Filtrar la cita eliminada del array de citas
    setDatosUsuario(prev => {
      if (!prev || !prev.citas) return prev;
      return {
        ...prev,
        citas: prev.citas.filter(c => c.id !== cita.id)
      };
    });
    
    // Recargar datos del usuario para asegurar sincronización completa
    await cargarDatosUsuario();
    
   /*  alert('Cita cancelada exitosamente'); */
    // Marcar que las citas se actualizaron
    marcarCitasActualizadas();
    if (cita.id === idCitaDestacar) {
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
      nuevoSet.delete(cita.id);
      return nuevoSet;
    });
  }
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
                  className="bg-white p-4 rounded-lg shadow-sm border border-orange-100 hover:shadow-md hover:border-orange-300 transition-all duration-200 cursor-pointer group"
                >
                  {/* Header con foto si existe */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-gray-900 group-hover:text-orange-600 transition-colors">
                        {mascota.nombre}
                      </h4>
                      <p className="text-gray-600 text-sm">{mascota.raza} • {mascota.edad}</p>
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
                    <span className="text-xs text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      Ver perfil →
                    </span>
                  </div>
                </Link>
              ))}
              
              {/* Botón para agregar nueva mascota */}
              <div className="p-4 rounded-lg border-2 border-dashed border-orange-300 flex items-center justify-center hover:border-orange-400 hover:bg-orange-50 transition-colors cursor-pointer"
                   onClick={() => setMostrarFormularioMascota(true)}>
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl text-orange-600 font-bold">+</span>
                  </div>
                  <p className="text-sm text-orange-600 font-medium">Agregar Mascota</p>
                </div>
              </div>
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
          <Paseadores paseadores={paseadoresParaMostrar} isCargando={isCargandoPaseadores} />
                </>
              )}
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
                  className="bg-white p-4 rounded-lg shadow-sm border border-orange-100 hover:shadow-md hover:border-orange-300 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-gray-900 group-hover:text-orange-600 transition-colors">
                        {mascota.nombre}
                      </h4>
                      <p className="text-gray-600 text-sm">{mascota.raza} • {mascota.edad}</p>
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
                    <span className="text-xs text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      Ver perfil →
                    </span>
                  </div>
                </Link>
              ))}
              <div className="p-4 rounded-lg border-2 border-dashed border-orange-300 flex items-center justify-center hover:border-orange-400 hover:bg-orange-50 transition-colors cursor-pointer"
                   onClick={() => setMostrarFormularioMascota(true)}>
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl text-orange-600 font-bold">+</span>
                  </div>
                  <p className="text-sm text-orange-600 font-medium">Agregar Mascota</p>
                </div>
              </div>
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
          <Paseadores paseadores={paseadoresParaMostrar} isCargando={isCargandoPaseadores} />
          </div>
        </div>
      </div>

      <DashboardTabBar
        pestanaActiva={pestanaActiva}
        onCambiarPestana={setPestanaActiva}
        typeTheme={typeTheme}
        cantidadCitasNuevasEnTab={pendientesTabCitas}
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