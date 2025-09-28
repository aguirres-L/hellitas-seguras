import React, { useState, useEffect, useMemo } from 'react';
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
import { useTheme } from '../contexts/ThemeContext';
import DecoracionForm from './decoracionUi/DecoracionForm';

const Dashboard = () => {
  const navigate = useNavigate();
  const { usuario, cerrarSesion, isCargandoLogout } = useAuth();
  const { typeTheme } = useTheme();
  

  // Estados para controlar los modales
  const [mostrarFormularioVeterinaria, setMostrarFormularioVeterinaria] = useState(false);
  const [mostrarFormularioPeluqueria, setMostrarFormularioPeluqueria] = useState(false);
  const [clinicaSeleccionada, setClinicaSeleccionada] = useState(null);
  const [peluqueriaSeleccionada, setPeluqueriaSeleccionada] = useState(null);
  const [isCargandoMascota, setIsCargandoMascota] = useState(false);
  const [datosUsuario, setDatosUsuario] = useState(null);
  const [isCargandoUsuario, setIsCargandoUsuario] = useState(false);
  const [mostrarFormularioMascota, setMostrarFormularioMascota] = useState(false);

  // Estados para profesionales
  const [veterinarios, setVeterinarios] = useState([]);
  const [peluqueros, setPeluqueros] = useState([]);
  const [tiendas, setTiendas] = useState([]);
  const [isCargandoVeterinarios, setIsCargandoVeterinarios] = useState(false);
  const [isCargandoPeluqueros, setIsCargandoPeluqueros] = useState(false);
  const [citasCancelando, setCitasCancelando] = useState(new Set()); // Para controlar qué citas se están cancelando
  // Filtro por zona
  const [mostrarTodosProfesionales, setMostrarTodosProfesionales] = useState(false);
  const [veterinariosRaw, setVeterinariosRaw] = useState([]);
  const [peluquerosRaw, setPeluquerosRaw] = useState([]);

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
  const mapearProfesionalAVeterinaria = (profesional) => ({
    id: profesional.id,
    nombre: profesional.nombre,
    direccion: profesional.direccion,
    telefono: profesional.telefono,
    especialidades: profesional.especialidad ? [profesional.especialidad] : [],
    servicios: profesional.servicios ? profesional.servicios.map(servicio => servicio.nombre) : [],
    horario: profesional.horario || 'Horario no disponible',
    calificacion: 4.5, // Valor por defecto, se puede implementar sistema de calificaciones después
    distancia: 'Distancia no disponible', // Se puede implementar geolocalización después
    fotoLocalUrl: profesional.fotoLocalUrl || null // Agregar URL de la imagen del local
  });

  const mapearProfesionalAPeluqueria = (profesional) => ({
    id: profesional.id,
    nombre: profesional.nombre,
    direccion: profesional.direccion,
    telefono: profesional.telefono,
    servicios: profesional.servicios ? profesional.servicios.map(servicio => servicio.nombre) : [],
    horario: profesional.horario || 'Horario no disponible',
    calificacion: 4.5, // Valor por defecto
    distancia: 'Distancia no disponible',
    fotoLocalUrl: profesional.fotoLocalUrl || null // Agregar URL de la imagen del local
  });

  const mapearProfesionalATienda = (profesional) => ({
    id: profesional.id,
    nombre: profesional.nombre,
    direccion: profesional.direccion,
    telefono: profesional.telefono,
    fotoLocalUrl: profesional.fotoLocalUrl || null // Agregar URL de la imagen del local
  });



    // Función para cargar profesionales
  const cargarProfesionales = async () => {
    setIsCargandoVeterinarios(true);
    setIsCargandoPeluqueros(true);
    
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
      
    } catch (error) {
      console.error("Error al cargar profesionales:", error);
    } finally {
      setIsCargandoVeterinarios(false);
      setIsCargandoPeluqueros(false);
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
      alert('Error al cerrar sesión. Inténtalo de nuevo.');
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
    console.log('Cita veterinaria enviada:', datosCita);
    // Aquí iría la lógica para enviar a la API
    alert('¡Cita veterinaria agendada exitosamente!');
    setMostrarFormularioVeterinaria(false);
    setClinicaSeleccionada(null);
   // Marcar que las citas se actualizaron
   marcarCitasActualizadas();

  };

  const manejarEnviarCitaPeluqueria = (datosCita) => {
    console.log('Cita peluquería enviada:', datosCita);
    // La cita ya se guardó en Firebase, solo mostrar confirmación
    alert('¡Cita de peluquería reservada exitosamente!');
    setMostrarFormularioPeluqueria(false);
    setPeluqueriaSeleccionada(null);
    // Marcar que las citas se actualizaron
    marcarCitasActualizadas();
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
  

// Función para cancelar una cita
const handleCancelarCita = async (cita) => {
  if (!confirm('¿Estás seguro de que quieres cancelar esta cita?')) {
    return;
  }

  // Agregar la cita al set de citas cancelando
  setCitasCancelando(prev => new Set(prev).add(cita.id));

  try {
    // Usar la nueva función que elimina la cita completamente
    await eliminarCitaCompleta(cita);
    
    // Recargar datos del usuario para actualizar la UI
    await cargarDatosUsuario();
    
    alert('Cita cancelada exitosamente');
     // Marcar que las citas se actualizaron
   marcarCitasActualizadas();
  } catch (error) {
    console.error('Error al cancelar cita:', error);
    alert('Error al cancelar la cita. Inténtalo de nuevo.');
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
      console.log('🔄 Guardando mascota en Firestore:', mascota);
      
      await agregarMascotaAUsuario(usuario.uid, mascota);
      console.log('✅ Mascota guardada en Firestore');
      
      // Recargar datos del usuario después de agregar mascota
      await cargarDatosUsuario();
      console.log('✅ Datos de usuario recargados');
      
      // Cerrar el modal después de agregar exitosamente
      setMostrarFormularioMascota(false);
      alert('¡Mascota agregada exitosamente!');
    } catch (e) {
      console.error("❌ Error al agregar mascota:", e);
      alert("Error al agregar mascota: " + e.message);
    }
    setIsCargandoMascota(false);
  };


  
  console.log(datosUsuario,'datosUsuario');
  

  return (
    <div className={
      typeTheme === 'light'
        ? "bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 min-h-screen pt-16"
        : "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen pt-16"
    }>
      {/* Fondo decorativo - Responsivo */}
      <DecoracionForm isFullScreen={true} />


      {/* Navbar modular */}
      <Navbar 
        tipo="dashboard"
        onCerrarSesion={handleCerrarSesion}
        isCargandoLogout={isCargandoLogout}
      />

      {/* Main Content */}
      <div className="relative container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header del Dashboard */}
        <div className="text-center mt-4 mb-8">
          <h2 className={typeTheme === 'light'
            ? "text-2xl sm:text-3xl font-bold text-gray-900 mb-2"
            : "text-2xl sm:text-3xl font-bold text-white mb-2"
          }>
            Bienvenido a  Huellitas Seguras
          </h2>
          <p className={typeTheme === 'light'?"text-sm  text-gray-600 mb-4":'text-sm  text-white mb-4' }>
            Gestiona tus mascotas y encuentra servicios de Veterinaria, Peluquería y descuentos en Tiendas
          </p>
        </div>

        {/* Sección de Mascotas */}
        <div className={typeTheme === 'light'
          ? "bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8"
          : "bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8"
        }>
          <h3 className={typeTheme === 'light'?"text-xl font-bold text-gray-900 mb-4":'text-xl font-bold text-white mb-4' } >Tus Mascotas</h3>
          
          {isCargandoUsuario ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <p className="mt-2 text-gray-600">Cargando mascotas...</p>
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
                      <p className="text-gray-600 text-sm">{mascota.raza} • {mascota.edad} años</p>
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

        {/* Sección de Citas */}
        <div className={typeTheme === 'light'
          ? "bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8"
          : "bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8"
        }>
          <h3 className={typeTheme === 'light'?"text-xl font-bold text-gray-900 mb-4":"text-xl font-bold text-white mb-4"} >Mis Citas</h3>
          
          {isCargandoUsuario ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <p className="mt-2 text-gray-600">Cargando citas...</p>
            </div>
          ) : (
            <div>
              {(datosUsuario?.citas && datosUsuario.citas.length > 0) ? (
                <div className="space-y-4">
                  {datosUsuario.citas.map((cita, index) => (
                    <div key={cita.id || index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                cita.tipoProfesional === 'veterinario' 
                                  ? 'bg-blue-100' 
                                  : 'bg-purple-100'
                              }`}>
                                <svg className={`w-6 h-6 ${
                                  cita.tipoProfesional === 'veterinario' 
                                    ? 'text-blue-600' 
                                    : 'text-purple-600'
                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900">
                                {cita.mascotaNombre || 'Mascota no especificada'}
                              </h5>
                              <p className="text-sm text-gray-600">
                                {cita.fecha} • {cita.hora} • {cita.duracion}min
                              </p>
                              <p className="text-xs text-gray-500">
                                {cita.peluqueriaNombre || cita.veterinariaNombre || 'Profesional no especificado'}
                              </p>
                              {/* Detalles específicos según el tipo de cita */}
                              <div className="mt-1">
                                {/* Detalles de Peluquería */}
                                {cita.tipoProfesional === 'peluquero' && (
                                  <>
                                    {cita.servicios && cita.servicios.length > 0 && (
                                      <p className="text-xs text-gray-600">
                                        Servicios: {cita.servicios.join(', ')}
                                      </p>
                                    )}
                                    {cita.tipoCorte && (
                                      <p className="text-xs text-gray-600">
                                        Tipo: {cita.tipoCorte}
                                      </p>
                                    )}
                                  </>
                                )}
                                
                                {/* Detalles de Veterinaria */}
                                {cita.tipoProfesional === 'veterinario' && (
                                  <>
                                    {cita.tipoConsulta && (
                                      <p className="text-xs text-gray-600">
                                        Consulta: {cita.tipoConsulta}
                                      </p>
                                    )}
                                    {cita.sintomas && (
                                      <p className="text-xs text-gray-600">
                                        Síntomas: {cita.sintomas}
                                      </p>
                                    )}
                                    {cita.urgencia && cita.urgencia !== 'normal' && (
                                      <p className="text-xs text-gray-600">
                                        Urgencia: {cita.urgencia}
                                      </p>
                                    )}
                                  </>
                                )}
                                
                                {/* Observaciones (comunes a ambos tipos) */}
                                {cita.observaciones && (
                                  <p className="text-xs text-gray-500 italic">
                                    Obs: {cita.observaciones}
                                  </p>
                                )}
                              </div>
                              <div className="mt-2">
                                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                  cita.estado === 'confirmada' ? 'bg-green-100 text-green-800' :
                                  cita.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                  cita.estado === 'cancelada' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {cita.estado}
                                </span>
                                {/* Etiquetas específicas */}
                                {cita.esPrimeraVisita && (
                                  <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 ml-2">
                                    Primera visita
                                  </span>
                                )}
                                
                                {/* Etiqueta de urgencia para veterinaria */}
                                {cita.tipoProfesional === 'veterinario' && cita.urgencia && cita.urgencia !== 'normal' && (
                                  <span className={`inline-block px-2 py-1 text-xs rounded-full ml-2 ${
                                    cita.urgencia === 'urgente' ? 'bg-yellow-100 text-yellow-800' :
                                    cita.urgencia === 'emergencia' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {cita.urgencia}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-4  md:flex-row flex-col space-x-0">
                          {cita.mascotaId && (
                            <Link 
                              to={`/pet-profile/${cita.mascotaId}`}
                              className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors duration-200"
                            >
                              Ver Mascota
                            </Link>
                          )}
                          <button 
                            className={`px-3 py-1 rounded text-xs transition-colors duration-200 ${
                              citasCancelando.has(cita.id) 
                                ? 'bg-gray-400 text-white cursor-not-allowed' 
                                : 'bg-red-500 text-white hover:bg-red-600'
                            }`}
                            onClick={() => handleCancelarCita(cita)}
                            disabled={citasCancelando.has(cita.id)}
                          >
                            {citasCancelando.has(cita.id) ? 'Cancelando...' : 'Cancelar'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600">No tienes citas programadas</p>
                  <p className="text-sm text-gray-500 mt-1">Agenda una cita con un veterinario o peluquero</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sección de Suscripción */}
      {/*   <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 mb-8 text-white">
          <h3 className="font-bold text-xl mb-2">Suscripción Premium</h3>
          <p className="mb-4 text-green-100">Desbloquea acceso para veterinarios y peluqueros por solo $5.000/mes.</p>
          <button className="bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors duration-200 font-medium">
            Activar
          </button>
        </div> */}

        {/* Filtro de profesionales por zona */}
        <div className="flex items-center justify-between mb-4">
          <div className={typeTheme === 'light' ? 'text-m text-gray-700' : 'text-m text-white'}>
            {zonaUsuario ? `Tu zona: ${zonaUsuario}` : 'Sin zona definida'}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMostrarTodosProfesionales(false)}
              disabled={isCargandoVeterinarios || isCargandoPeluqueros}
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
              disabled={isCargandoVeterinarios || isCargandoPeluqueros}
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

        {/* Sección de Clínicas Veterinarias */}
        <Veterinarias 
          clinicasVeterinarias={veterinariosParaMostrar} 
          manejarAbrirFormularioVeterinaria={manejarAbrirFormularioVeterinaria}
          isCargando={isCargandoVeterinarios}
        />

        {/* Sección de Peluquerías */}
        <Peluquerias 
          peluquerias={peluquerosParaMostrar} 
          manejarAbrirFormularioPeluqueria={manejarAbrirFormularioPeluqueria}
          isCargando={isCargandoPeluqueros}
        />


        {/* Sección de Tiendas */}
        <Tiendas 
              tiendas={tiendas} 
          isCargando={isCargandoUsuario}
        />
      </div>

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Agregar Nueva Mascota</h3>
                <button
                  onClick={() => setMostrarFormularioMascota(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
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
    </div>
  );
};

export default Dashboard; 