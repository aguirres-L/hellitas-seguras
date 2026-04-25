import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Map } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from './Navbar';
import {
  obtenerProfesionalPorUid,
  getDataById,
  buscarMascotasPorChip,
  subirImagenProfesional,
  updateDataCollection,
  eliminarServicio,
  actualizarCitaEnAmbosLados,
} from '../data/firebase/firebase';
import { SistemaCitas } from './SistemaCitas';
import GestionTienda from './GestionTienda';
import GestionDescuentosServicios from './GestionDescuentosServicios';
import { ImageUploaderProfesional } from './ImageUploaderProfesional';
import DecoracionForm from './decoracionUi/DecoracionForm';
import AddServicesProfecional from './dashboardProfesional/AddServicesProfecional';
import { useTheme } from '../contexts/ThemeContext';
import { useNotificacionApp } from '../contexts/NotificacionAppContext';
import { PaseadorDashboardTabBar } from './uiDashboardProfesional/PaseadorDashboardTabBar';
import UseFrameMotion from './hook_frame_motion/UseFrameMotion';

// Este componente no recibe props
const DashboardProfesional = () => {
  const navigate = useNavigate();
  const { typeTheme } = useTheme();
  const { mostrarExito, mostrarError, confirmar } = useNotificacionApp();

  const { usuario, cerrarSesion, isCargandoLogout } = useAuth();
  const [datosProfesional, setDatosProfesional] = useState(null);
  const [isCargandoProfesional, setIsCargandoProfesional] = useState(false);
  const [mascotasEncontradas, setMascotasEncontradas] = useState([]);
  const [isBuscandoMascotas, setIsBuscandoMascotas] = useState(false);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [pestañaActiva, setPestañaActiva] = useState('historial');
  /** Navegación paseador (perfil, historial, recorrido, servicios, descuentos) */
  const [pestanaPaseador, setPestanaPaseador] = useState('historial');
  const [mostrarCitas, setMostrarCitas] = useState(false);
  const [isActualizandoTienda, setIsActualizandoTienda] = useState(false);
  /** Modal reprogramación: misma cita en arrays usuario + profesional */
  const [citaReprogramando, setCitaReprogramando] = useState(null);
  const [formReprogramar, setFormReprogramar] = useState({
    fecha: '',
    hora: '',
    duracion: 60,
  });
  const [citasMutando, setCitasMutando] = useState(() => new Set());
  
  // Estados para edición de imagen
  const [mostrarModalEditarImagen, setMostrarModalEditarImagen] = useState(false);
  const [isSubiendoImagen, setIsSubiendoImagen] = useState(false);
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [urlImagenLocal, setUrlImagenLocal] = useState('');
  
  // Estados para modal de detalles de mascota
  const [mostrarModalMascota, setMostrarModalMascota] = useState(false);
  const [datosMascotaSeleccionada, setDatosMascotaSeleccionada] = useState(null);
  
  // Estados para modal de servicios
  const [mostrarModalServicios, setMostrarModalServicios] = useState(false);
  const [servicioAEditar, setServicioAEditar] = useState(null);
  const [isEditandoPerfil, setIsEditandoPerfil] = useState(false);
  const [isGuardandoPerfil, setIsGuardandoPerfil] = useState(false);
  const [fechaRecorrido, setFechaRecorrido] = useState(() => new Date().toISOString().split('T')[0]);
  const [isCargandoDireccionesClientes, setIsCargandoDireccionesClientes] = useState(false);
  const [direccionesClientes, setDireccionesClientes] = useState({});
  const [draftHorasPaso, setDraftHorasPaso] = useState({});
  const [formPerfil, setFormPerfil] = useState({
    nombre: '',
    especialidad: '',
    telefono: '',
    direccion: '',
    horario: '',
    experiencia: '',
  });

  // Cargar datos del profesional
  useEffect(() => {
    const cargarDatosProfesional = async () => {
      if (!usuario?.uid) return;
      
      setIsCargandoProfesional(true);
      try {
        const datos = await obtenerProfesionalPorUid(usuario.uid);
        setDatosProfesional(datos);
      } catch (error) {
        console.error("Error al cargar datos del profesional:", error);
      } finally {
        setIsCargandoProfesional(false);
      }
    };

    cargarDatosProfesional();
  }, [usuario?.uid]);

  useEffect(() => {
    if (!datosProfesional) return;
    setFormPerfil({
      nombre: datosProfesional.nombre || '',
      especialidad: datosProfesional.especialidad || '',
      telefono: datosProfesional.telefono || '',
      direccion: datosProfesional.direccion || '',
      horario: datosProfesional.horario || '',
      experiencia: datosProfesional.experiencia != null ? String(datosProfesional.experiencia) : '',
    });
  }, [datosProfesional]);

// almacenar id de la mascota para luego puedo ver el perfil
// de la mascota y editarlo desde el dashboard de veterinario o peluquero

  // Función para cerrar sesión
  const handleCerrarSesion = async () => {
    try {
      await cerrarSesion();
      navigate('/login-profesional');
    } catch (error) {
      mostrarError('Error al cerrar sesión. Inténtalo de nuevo.');
    }
  };

  const handleVerMascota = (datosCita) => {
    setDatosMascotaSeleccionada(datosCita);
    setMostrarModalMascota(true);
  };

  
  // Función para actualizar datos de la tienda
  const handleActualizarTienda = async (datosActualizados) => {
    setIsActualizandoTienda(true);
    try {
      // Aquí deberías implementar la función para actualizar en Firebase
      // await actualizarProfesional(usuario.uid, datosActualizados);
      setDatosProfesional(datosActualizados);
    } catch (error) {
      console.error('Error al actualizar tienda:', error);
      mostrarError('Error al actualizar la tienda');
    } finally {
      setIsActualizandoTienda(false);
    }
  };

  // Función para manejar la actualización de imagen
  const handleActualizarImagen = async () => {
    if (!archivoImagen) {
      mostrarError('Por favor seleccioná una imagen', 'Falta imagen');
      return;
    }

    setIsSubiendoImagen(true);
    try {
      const nuevaUrlImagen = await subirImagenProfesional(usuario.uid, archivoImagen);

      // Actualizar en Firestore
      await updateDataCollection('profesionales', usuario.uid, {
        fotoLocalUrl: nuevaUrlImagen
      });

      // Actualizar estado local
      setDatosProfesional(prev => ({
        ...prev,
        fotoLocalUrl: nuevaUrlImagen
      }));

      // Cerrar modal y limpiar estados
      setMostrarModalEditarImagen(false);
      setArchivoImagen(null);
      setUrlImagenLocal('');
      
      mostrarExito(
        datosProfesional?.tipoProfesional === 'paseador'
          ? 'Tu foto se actualizó correctamente.'
          : 'Imagen del local actualizada exitosamente.',
        'Listo'
      );
    } catch (error) {
      console.error('❌ Error al actualizar imagen:', error);
      mostrarError('Error al actualizar la imagen: ' + error.message);
    } finally {
      setIsSubiendoImagen(false);
    }
  };

  // Función para cancelar edición de imagen
  const handleCancelarEdicionImagen = () => {
    setMostrarModalEditarImagen(false);
    setArchivoImagen(null);
    setUrlImagenLocal('');
  };

  // Función para cerrar modal de mascota
  const handleCerrarModalMascota = () => {
    setMostrarModalMascota(false);
    setDatosMascotaSeleccionada(null);
  };

  const handleCambioFormPerfil = (e) => {
    const { name, value } = e.target;
    setFormPerfil((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancelarEdicionPerfil = () => {
    setIsEditandoPerfil(false);
    if (!datosProfesional) return;
    setFormPerfil({
      nombre: datosProfesional.nombre || '',
      especialidad: datosProfesional.especialidad || '',
      telefono: datosProfesional.telefono || '',
      direccion: datosProfesional.direccion || '',
      horario: datosProfesional.horario || '',
      experiencia: datosProfesional.experiencia != null ? String(datosProfesional.experiencia) : '',
    });
  };

  const handleGuardarPerfil = async () => {
    if (!usuario?.uid || !datosProfesional) return;
    if (!formPerfil.nombre.trim()) {
      mostrarError('El nombre es obligatorio.');
      return;
    }

    setIsGuardandoPerfil(true);
    try {
      const datosActualizados = {
        nombre: formPerfil.nombre.trim(),
        especialidad: formPerfil.especialidad.trim(),
        telefono: formPerfil.telefono.trim(),
        direccion: formPerfil.direccion.trim(),
        horario: formPerfil.horario.trim(),
      };

      if (datosProfesional.tipoProfesional !== 'tienda') {
        datosActualizados.experiencia = formPerfil.experiencia.trim();
      }

      await updateDataCollection('profesionales', usuario.uid, datosActualizados);
      setDatosProfesional((prev) => ({ ...prev, ...datosActualizados }));
      setIsEditandoPerfil(false);
      mostrarExito('Tus datos se actualizaron correctamente.', 'Listo');
    } catch (error) {
      console.error('Error al guardar perfil profesional:', error);
      mostrarError('No se pudieron guardar tus datos. Intentá nuevamente.');
    } finally {
      setIsGuardandoPerfil(false);
    }
  };

  // Funciones para manejar servicios
  const handleAbrirModalServicios = () => {
    setServicioAEditar(null);
    setMostrarModalServicios(true);
  };

  const handleCerrarModalServicios = () => {
    setMostrarModalServicios(false);
    setServicioAEditar(null);
  };

  const handleEditarServicio = (servicio) => {
    setServicioAEditar(servicio);
    setMostrarModalServicios(true);
  };

  const handleEliminarServicio = async (servicioId) => {
    const ok = await confirmar('¿Estás seguro de que querés eliminar este servicio?', {
      titulo: 'Eliminar servicio',
      textoConfirmar: 'Sí, eliminar',
      textoCancelar: 'Cancelar',
    });
    if (!ok) return;
    try {
      await eliminarServicio(usuario.uid, servicioId);
      const datos = await obtenerProfesionalPorUid(usuario.uid);
      setDatosProfesional(datos);
      mostrarExito('Servicio eliminado correctamente.', 'Listo');
    } catch (error) {
      console.error('Error al eliminar servicio:', error);
      mostrarError('Error al eliminar el servicio');
    }
  };

  const handleServicioGuardado = async () => {
    // Recargar datos del profesional
    try {
      const datos = await obtenerProfesionalPorUid(usuario.uid);
      setDatosProfesional(datos);
    } catch (error) {
      console.error('Error al recargar datos:', error);
    }
  };

  const recargarDatosProfesional = async () => {
    if (!usuario?.uid) return;
    const datos = await obtenerProfesionalPorUid(usuario.uid);
    setDatosProfesional(datos);
  };

  const agregarCitaMutando = (citaId) => {
    if (citaId == null) return;
    setCitasMutando((prev) => new Set(prev).add(String(citaId)));
  };

  const quitarCitaMutando = (citaId) => {
    if (citaId == null) return;
    setCitasMutando((prev) => {
      const next = new Set(prev);
      next.delete(String(citaId));
      return next;
    });
  };

  const estadoCitaNorm = (cita) =>
    String(cita?.estado ?? '')
      .trim()
      .toLowerCase();

  const handleConfirmarCitaCliente = async (cita) => {
    if (!cita?.id || !usuario?.uid) return;
    agregarCitaMutando(cita.id);
    try {
      await actualizarCitaEnAmbosLados(
        cita,
        { estado: 'confirmada' },
        { profesionalId: usuario.uid },
      );
      await recargarDatosProfesional();
      mostrarExito(
        'La cita quedó confirmada. El cliente verá el cambio en su panel.',
        'Listo',
      );
    } catch (error) {
      console.error('Error al confirmar cita:', error);
      mostrarError('No se pudo confirmar la cita. Intentá de nuevo.');
    } finally {
      quitarCitaMutando(cita.id);
    }
  };

  const handleMarcarCitaCompletada = async (cita) => {
    if (!cita?.id || !usuario?.uid) return;
    agregarCitaMutando(cita.id);
    try {
      await actualizarCitaEnAmbosLados(
        cita,
        { estado: 'completada' },
        { profesionalId: usuario.uid },
      );
      await recargarDatosProfesional();
      mostrarExito('La cita se marcó como completada.', 'Listo');
    } catch (error) {
      console.error('Error al completar cita:', error);
      mostrarError('No se pudo completar la cita. Intentá de nuevo.');
    } finally {
      quitarCitaMutando(cita.id);
    }
  };

  const handleCancelarCitaProfesional = async (cita) => {
    if (!cita?.id || !usuario?.uid) return;
    const ok = await confirmar(
      '¿Marcar esta cita como cancelada? El cliente verá el estado actualizado en su panel.',
      {
        titulo: 'Cancelar cita',
        textoConfirmar: 'Sí, cancelar',
        textoCancelar: 'Volver',
      },
    );
    if (!ok) return;
    agregarCitaMutando(cita.id);
    try {
      await actualizarCitaEnAmbosLados(
        cita,
        { estado: 'cancelada' },
        { profesionalId: usuario.uid },
      );
      await recargarDatosProfesional();
      mostrarExito('La cita quedó cancelada.', 'Listo');
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      mostrarError('No se pudo cancelar la cita. Intentá de nuevo.');
    } finally {
      quitarCitaMutando(cita.id);
    }
  };

  const abrirModalReprogramar = (cita) => {
    setCitaReprogramando(cita);
    setFormReprogramar({
      fecha: cita.fecha || '',
      hora: cita.hora || '',
      duracion: Number(cita.duracion) > 0 ? Number(cita.duracion) : 60,
    });
  };

  const cerrarModalReprogramar = () => {
    setCitaReprogramando(null);
    setFormReprogramar({ fecha: '', hora: '', duracion: 60 });
  };

  const handleGuardarReprogramacion = async (e) => {
    e.preventDefault();
    if (!citaReprogramando?.id || !usuario?.uid) return;
    const { fecha, hora, duracion } = formReprogramar;
    if (!fecha || !hora) {
      mostrarError('Completá fecha y hora.', 'Datos incompletos');
      return;
    }
    agregarCitaMutando(citaReprogramando.id);
    try {
      const d = Number(duracion) > 0 ? Number(duracion) : 60;
      await actualizarCitaEnAmbosLados(
        citaReprogramando,
        {
          fecha,
          hora,
          duracion: d,
          fechaCompleta: `${fecha} ${hora}`,
          estado: 'reprogramada',
        },
        { profesionalId: usuario.uid },
      );
      await recargarDatosProfesional();
      cerrarModalReprogramar();
      mostrarExito(
        'Horario actualizado. El cliente verá el cambio como “Cambio de horario”.',
        'Listo',
      );
    } catch (error) {
      console.error('Error al reprogramar cita:', error);
      mostrarError('No se pudo guardar el nuevo horario. Intentá de nuevo.');
    } finally {
      quitarCitaMutando(citaReprogramando.id);
    }
  };

  const esPaseador = datosProfesional?.tipoProfesional === 'paseador';
  const easePanelPaseador = [0.4, 0, 0.2, 1];

  useEffect(() => {
    const cargarDireccionesClientes = async () => {
      if (!esPaseador) return;
      const citas = Array.isArray(datosProfesional?.citas) ? datosProfesional.citas : [];
      const idsClientes = [...new Set(citas.map((c) => c?.clienteId).filter(Boolean))];
      const idsPendientes = idsClientes.filter((id) => !direccionesClientes[id]);
      if (idsPendientes.length === 0) return;

      setIsCargandoDireccionesClientes(true);
      try {
        const resultados = await Promise.all(
          idsPendientes.map(async (clienteId) => {
            const cliente = await getDataById('usuarios', clienteId);
            const direccion =
              cliente?.direccion ||
              cliente?.ubicacion?.direccion ||
              [cliente?.ubicacion?.barrio, cliente?.ubicacion?.zona].filter(Boolean).join(', ') ||
              '';
            return { clienteId, direccion };
          }),
        );

        setDireccionesClientes((prev) => {
          const next = { ...prev };
          resultados.forEach(({ clienteId, direccion }) => {
            next[clienteId] = direccion;
          });
          return next;
        });
      } catch (error) {
        console.error('Error al cargar direcciones de clientes para recorrido:', error);
      } finally {
        setIsCargandoDireccionesClientes(false);
      }
    };

    cargarDireccionesClientes();
  }, [esPaseador, datosProfesional?.citas, direccionesClientes]);

  const normalizarHora = (hora) => {
    if (!hora || typeof hora !== 'string') return '99:99';
    const [h = '99', m = '99'] = hora.split(':');
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const normalizarFecha = (fecha) => {
    if (!fecha || typeof fecha !== 'string') return '9999-99-99';
    return fecha;
  };

  const irACitaEnRecorrido = (cita) => {
    if (!cita?.fecha) return;
    setFechaRecorrido(String(cita.fecha));
    setPestanaPaseador('recorrido');
  };

  const citasConfirmadasDelDia = Array.isArray(datosProfesional?.citas)
    ? datosProfesional.citas
        .filter((cita) => {
          const estado = estadoCitaNorm(cita);
          const fecha = String(cita?.fecha || '');
          return fecha === fechaRecorrido && estado === 'confirmada';
        })
        .sort((a, b) => normalizarHora(a?.hora).localeCompare(normalizarHora(b?.hora)))
    : [];

  const citasTimelineDelDia = citasConfirmadasDelDia
    .filter((cita) => cita?.recorrido?.incluida === true && cita?.recorrido?.fechaPlanificada === fechaRecorrido)
    .sort((a, b) => {
      const ordenA = Number(a?.recorrido?.orden || 999);
      const ordenB = Number(b?.recorrido?.orden || 999);
      if (ordenA !== ordenB) return ordenA - ordenB;
      return normalizarHora(a?.recorrido?.horaPaso || a?.hora).localeCompare(
        normalizarHora(b?.recorrido?.horaPaso || b?.hora),
      );
    });

  const citasConfirmadasDisponibles = citasConfirmadasDelDia.filter(
    (cita) => !(cita?.recorrido?.incluida === true && cita?.recorrido?.fechaPlanificada === fechaRecorrido),
  );

  const paradasConDireccion = citasTimelineDelDia.map((cita, index) => {
    const direccionCita =
      cita?.direccionCliente ||
      cita?.clienteDireccion ||
      cita?.direccion ||
      direccionesClientes[cita?.clienteId] ||
      '';
    return {
      ...cita,
      orden: index + 1,
      horaPaso: cita?.recorrido?.horaPaso || cita?.hora || '',
      direccionRecorrido: direccionCita,
      direccionDisponible: Boolean(direccionCita),
    };
  });

  const citasActivasOrdenadas = Array.isArray(datosProfesional?.citas)
    ? datosProfesional.citas
        .filter((cita) => {
          const estado = estadoCitaNorm(cita);
          return estado === 'confirmada';
        })
        .sort((a, b) => {
          const cmpFecha = normalizarFecha(a?.fecha).localeCompare(normalizarFecha(b?.fecha));
          if (cmpFecha !== 0) return cmpFecha;
          return normalizarHora(a?.hora).localeCompare(normalizarHora(b?.hora));
        })
    : [];

  const actualizarRecorridoCita = async (cita, patchRecorrido) => {
    if (!cita?.id || !usuario?.uid) return;
    agregarCitaMutando(cita.id);
    try {
      const recorridoActual = cita?.recorrido || {};
      await actualizarCitaEnAmbosLados(
        cita,
        {
          recorrido: {
            ...recorridoActual,
            ...patchRecorrido,
          },
        },
        { profesionalId: usuario.uid },
      );
      await recargarDatosProfesional();
    } catch (error) {
      console.error('Error al actualizar recorrido de la cita:', error);
      mostrarError('No se pudo actualizar la línea temporal. Intentá de nuevo.');
    } finally {
      quitarCitaMutando(cita.id);
    }
  };

  const handleAgregarCitaATimeline = async (cita) => {
    const siguienteOrden = paradasConDireccion.length + 1;
    await actualizarRecorridoCita(cita, {
      incluida: true,
      fechaPlanificada: fechaRecorrido,
      orden: siguienteOrden,
      horaPaso: cita?.hora || '',
      estadoPaso: 'pendiente',
      actualizadoEn: new Date().toISOString(),
    });
  };

  const handleQuitarCitaTimeline = async (cita) => {
    await actualizarRecorridoCita(cita, {
      incluida: false,
      fechaPlanificada: '',
      orden: null,
      horaPaso: '',
      estadoPaso: '',
      actualizadoEn: new Date().toISOString(),
    });
  };

  const handleCambiarHoraPasoDraft = (citaId, valor) => {
    setDraftHorasPaso((prev) => ({ ...prev, [String(citaId)]: valor }));
  };

  const handleGuardarHoraPaso = async (cita) => {
    const id = String(cita?.id || '');
    if (!id) return;
    const horaNueva = (draftHorasPaso[id] ?? cita?.horaPaso ?? '').trim();
    const horaAnterior = (cita?.horaPaso || '').trim();
    if (!horaNueva || horaNueva === horaAnterior) return;
    await actualizarRecorridoCita(cita, {
      horaPaso: horaNueva,
      actualizadoEn: new Date().toISOString(),
    });
  };

  const crearUrlGoogleMapsRecorrido = () => {
    const paradasValidas = paradasConDireccion.filter((p) => p.direccionDisponible);
    if (paradasValidas.length === 0) return null;

    const origen = datosProfesional?.direccion || '';
    const destino = paradasValidas[paradasValidas.length - 1].direccionRecorrido;
    const waypoints = paradasValidas
      .slice(0, -1)
      .map((p) => encodeURIComponent(p.direccionRecorrido))
      .join('|');

    const params = new URLSearchParams({
      api: '1',
      travelmode: 'driving',
      destination: destino,
    });

    if (origen) params.set('origin', origen);
    if (waypoints) params.set('waypoints', waypoints);

    return `https://www.google.com/maps/dir/?${params.toString()}`;
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !esPaseador) return;
    if (!window.matchMedia('(max-width: 767px)').matches) return;
    window.scrollTo(0, 0);
  }, [pestanaPaseador, esPaseador]);

  /** Ficha "Mi Información Profesional" reutilizable (paseador: móvil en pestaña Perfil; escritorio siempre arriba) */
  const renderBloquePerfilProfesional = () => {
    if (!datosProfesional) return null;
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xl font-bold text-gray-900">
            {datosProfesional.tipoProfesional === 'tienda' ? 'Mi Información de Tienda' : 'Mi Información Profesional'}
          </h3>
          <div className="flex items-center gap-2">
            {isEditandoPerfil && (
              <button
                type="button"
                onClick={handleCancelarEdicionPerfil}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100"
              >
                Cancelar
              </button>
            )}
            <button
              type="button"
              onClick={isEditandoPerfil ? handleGuardarPerfil : () => setIsEditandoPerfil(true)}
              disabled={isGuardandoPerfil}
              className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGuardandoPerfil
                ? 'Guardando...'
                : isEditandoPerfil
                  ? 'Guardar cambios'
                  : 'Editar datos'}
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-600">
              {datosProfesional.tipoProfesional === 'paseador'
                ? datosProfesional.fotoLocalUrl
                  ? 'Tu foto'
                  : 'Agregar tu foto'
                : datosProfesional.fotoLocalUrl
                  ? 'Foto del local'
                  : 'Agregar foto del local'}
            </h4>
            <button
              onClick={() => setMostrarModalEditarImagen(true)}
              className="text-xs bg-orange-500 text-white px-3 py-1 rounded-lg hover:bg-orange-600 transition-colors duration-200 flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {datosProfesional.fotoLocalUrl ? 'Editar' : 'Agregar'}
            </button>
          </div>

          {datosProfesional.fotoLocalUrl ? (
            <div className="relative">
              <img
                src={datosProfesional.fotoLocalUrl}
                alt={
                  datosProfesional.tipoProfesional === 'paseador'
                    ? `Foto de ${datosProfesional.nombre}`
                    : `Local de ${datosProfesional.nombre}`
                }
                className="w-full max-w-md h-48 object-cover rounded-lg shadow-sm"
              />
              <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full p-1">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-md h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="text-sm text-gray-500">
                  {datosProfesional.tipoProfesional === 'paseador' ? 'Sin foto de perfil' : 'Sin foto del local'}
                </p>
                <p className="text-xs text-gray-400">Haz clic en "Agregar" para subir una imagen</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-gray-600">Nombre</p>
            {isEditandoPerfil ? (
              <input
                name="nombre"
                value={formPerfil.nombre}
                onChange={handleCambioFormPerfil}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            ) : (
              <p className="font-medium">{datosProfesional.nombre}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-600">
              {datosProfesional.tipoProfesional === 'tienda' ? 'Tipo de Tienda' : 'Especialidad'}
            </p>
            {isEditandoPerfil ? (
              <input
                name="especialidad"
                value={formPerfil.especialidad}
                onChange={handleCambioFormPerfil}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            ) : (
              <p className="font-medium">{datosProfesional.especialidad}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-600">Teléfono</p>
            {isEditandoPerfil ? (
              <input
                name="telefono"
                value={formPerfil.telefono}
                onChange={handleCambioFormPerfil}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            ) : (
              <p className="font-medium">{datosProfesional.telefono}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-600">Dirección</p>
            {isEditandoPerfil ? (
              <input
                name="direccion"
                value={formPerfil.direccion}
                onChange={handleCambioFormPerfil}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            ) : (
              <p className="font-medium">{datosProfesional.direccion}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-600">Horario</p>
            {isEditandoPerfil ? (
              <input
                name="horario"
                value={formPerfil.horario}
                onChange={handleCambioFormPerfil}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            ) : (
              <p className="font-medium">{datosProfesional.horario}</p>
            )}
          </div>
          {datosProfesional.tipoProfesional !== 'tienda' && (
            <div>
              <p className="text-sm text-gray-600">Experiencia</p>
              {isEditandoPerfil ? (
                <input
                  name="experiencia"
                  value={formPerfil.experiencia}
                  onChange={handleCambioFormPerfil}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  placeholder="Ej: 2 años"
                />
              ) : (
                <p className="font-medium">{datosProfesional.experiencia || '—'}</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const ContenidoHistorialCitasProfesional = () => (
    <div>
      {datosProfesional?.citas && datosProfesional.citas.length > 0 ? (
        <div className="space-y-4">
          {datosProfesional.citas.map((cita, index) => (
            <div
              key={cita.id != null ? String(cita.id) : `cita-${index}`}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        Cliente: {cita.clienteNombre} • {cita.telefonoContacto}
                      </p>
                      <div className="mt-1">
                        {cita.servicios && cita.servicios.length > 0 && (
                          <p className="text-xs text-gray-600">Servicios: {cita.servicios.join(', ')}</p>
                        )}
                        {cita.tipoCorte && <p className="text-xs text-gray-600">Tipo: {cita.tipoCorte}</p>}
                        {cita.observaciones && (
                          <p className="text-xs text-gray-500 italic">Obs: {cita.observaciones}</p>
                        )}
                      </div>
                      <div className="mt-2">
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${
                            estadoCitaNorm(cita) === 'confirmada'
                              ? 'bg-green-100 text-green-800'
                              : estadoCitaNorm(cita) === 'pendiente'
                                ? 'bg-yellow-100 text-yellow-800'
                                : estadoCitaNorm(cita) === 'cancelada'
                                  ? 'bg-red-100 text-red-800'
                                  : estadoCitaNorm(cita) === 'reprogramada'
                                    ? 'bg-sky-100 text-sky-900'
                                    : estadoCitaNorm(cita) === 'completada'
                                      ? 'bg-emerald-100 text-emerald-900'
                                      : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {estadoCitaNorm(cita) === 'reprogramada'
                            ? 'Cambio de horario'
                            : estadoCitaNorm(cita) === 'completada'
                              ? 'Completada'
                              : cita.estado || '—'}
                        </span>
                        {cita.esPrimeraVisita && (
                          <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 ml-2">
                            Primera visita
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:items-end">
                  {cita.mascotaId && (
                    <button
                      type="button"
                      onClick={() => handleVerMascota(cita)}
                      className="bg-blue-500 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-600 transition-colors duration-200 whitespace-nowrap"
                    >
                      Ver mascota
                    </button>
                  )}
                  {esPaseador &&
                    cita?.fecha &&
                    estadoCitaNorm(cita) !== 'cancelada' &&
                    estadoCitaNorm(cita) !== 'completada' && (
                      <button
                        type="button"
                        className="bg-slate-600 text-white px-3 py-1.5 rounded text-xs hover:bg-slate-700 transition-colors duration-200 whitespace-nowrap"
                        onClick={() => irACitaEnRecorrido(cita)}
                      >
                        Ver en recorrido
                      </button>
                    )}
                  {estadoCitaNorm(cita) !== 'cancelada' && estadoCitaNorm(cita) !== 'completada' && (
                    <>
                      {(estadoCitaNorm(cita) === 'pendiente' || estadoCitaNorm(cita) === 'reprogramada') && (
                        <button
                          type="button"
                          disabled={citasMutando.has(String(cita.id))}
                          className="bg-green-600 text-white px-3 py-1.5 rounded text-xs hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 whitespace-nowrap"
                          onClick={() => handleConfirmarCitaCliente(cita)}
                        >
                          {citasMutando.has(String(cita.id)) ? 'Guardando…' : 'Confirmar'}
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={citasMutando.has(String(cita.id))}
                        className="bg-orange-500 text-white px-3 py-1.5 rounded text-xs hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50 whitespace-nowrap"
                        onClick={() => abrirModalReprogramar(cita)}
                      >
                        Cambiar horario
                      </button>
                      {estadoCitaNorm(cita) === 'confirmada' && (
                        <button
                          type="button"
                          disabled={citasMutando.has(String(cita.id))}
                          className="bg-emerald-600 text-white px-3 py-1.5 rounded text-xs hover:bg-emerald-700 transition-colors duration-200 disabled:opacity-50 whitespace-nowrap"
                          onClick={() => handleMarcarCitaCompletada(cita)}
                        >
                          Completar
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={citasMutando.has(String(cita.id))}
                        className="bg-red-500 text-white px-3 py-1.5 rounded text-xs hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 whitespace-nowrap"
                        onClick={() => handleCancelarCitaProfesional(cita)}
                      >
                        Cancelar cita
                      </button>
                    </>
                  )}
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
          <p className="text-gray-600">No hay citas registradas</p>
          <p className="text-sm text-gray-500 mt-1">Las citas aparecerán aquí cuando sean creadas</p>
        </div>
      )}
    </div>
  );

  const ContenidoSeccionServicios = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900">Mis Servicios</h3>
        <button
          onClick={handleAbrirModalServicios}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Añadir Servicio
        </button>
      </div>
      {datosProfesional?.servicios && datosProfesional.servicios.length > 0 ? (
        <div className="space-y-4">
          {datosProfesional.servicios.map((servicio, index) => (
            <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900">
                        {servicio.nombre || `Servicio ${index + 1}`}
                      </h5>
                      <p className="text-sm text-gray-600">{servicio.descripcion || 'Sin descripción'}</p>
                      <div className="mt-1">
                        {servicio.precio && (
                          <p className="text-sm text-green-600 font-medium">Precio: ${servicio.precio}</p>
                        )}
                        {servicio.duracion && (
                          <p className="text-xs text-gray-500">Duración: {servicio.duracion} minutos</p>
                        )}
                      </div>
                      <div className="mt-2">
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${
                            servicio.activo !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {servicio.activo !== false ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors duration-200"
                    onClick={() => handleEditarServicio(servicio)}
                  >
                    Editar
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition-colors duration-200"
                    onClick={() => handleEliminarServicio(servicio.id)}
                  >
                    Eliminar
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600">No hay servicios registrados</p>
          <p className="text-sm text-gray-500 mt-1">Haz clic en &quot;Añadir Servicio&quot; para comenzar</p>
        </div>
      )}
    </div>
  );

  const ContenidoSeccionDescuentos = () => (
    <GestionDescuentosServicios profesionalId={usuario?.uid} datosProfesional={datosProfesional} />
  );

  const ContenidoPanelRecorridoPaseador = () => (
    <div className="space-y-5">
      <div className="rounded-xl border border-orange-100 bg-orange-50/60 p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-orange-700">Planificador de recorrido</p>
            <p className="text-xs text-gray-600">
              Seleccioná una fecha para armar el orden de paseo según citas activas.
            </p>
          </div>
          <label className="text-xs text-gray-600">
            Fecha
            <input
              type="date"
              value={fechaRecorrido}
              onChange={(e) => setFechaRecorrido(e.target.value)}
              className="mt-1 block rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Citas confirmadas para agregar
        </p>
        {citasConfirmadasDisponibles.length === 0 ? (
          <p className="text-sm text-gray-600">
            No hay citas confirmadas pendientes de agregar para esta fecha.
          </p>
        ) : (
          <div className="space-y-2">
            {citasConfirmadasDisponibles.map((cita) => (
              <UseFrameMotion
                key={`confirmada-disponible-${String(cita.id)}`}
                tipoAnimacion="slideUp"
                duracion={0.22}
                delay={0}
                waitForUserView={false}
              >
                <div className="flex items-center justify-between gap-3 rounded-lg border border-orange-100 bg-orange-50/50 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-800">
                      {cita.hora || '--:--'} · {cita.mascotaNombre || 'Mascota'}
                    </p>
                    <p className="truncate text-xs text-gray-600">
                      {cita.clienteNombre || 'Sin cliente'} · {cita.telefonoContacto || 'Sin teléfono'}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={citasMutando.has(String(cita.id))}
                    onClick={() => handleAgregarCitaATimeline(cita)}
                    className="rounded-md bg-orange-500 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-60"
                  >
                    Añadir
                  </button>
                </div>
              </UseFrameMotion>
            ))}
          </div>
        )}
      </div>

      {paradasConDireccion.length === 0 ? (
        <div className="px-1 py-6 text-center sm:py-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-orange-600">
            <Map className="h-8 w-8" strokeWidth={2} aria-hidden />
          </div>
          <h3 className="mb-2 text-lg font-bold text-gray-900">Sin paradas en la línea temporal</h3>
          <p className="mx-auto max-w-md text-sm text-gray-600">
            Añadí citas confirmadas y asigná la hora exacta de paso para armar la ruta del día.
          </p>
          {citasActivasOrdenadas.length > 0 && (
            <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 text-left">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Tenés citas activas en otras fechas
              </p>
              <div className="space-y-2">
                {citasActivasOrdenadas.slice(0, 5).map((cita) => (
                  <button
                    key={`sugerida-${String(cita.id)}`}
                    type="button"
                    onClick={() => irACitaEnRecorrido(cita)}
                    className="flex w-full items-center justify-between rounded-lg border border-orange-100 px-3 py-2 text-left transition hover:bg-orange-50"
                  >
                    <span className="text-sm text-gray-700">
                      {cita.fecha || 'Sin fecha'} · {cita.hora || '--:--'} · {cita.mascotaNombre || 'Mascota'}
                    </span>
                    <span className="text-xs font-medium text-orange-600">Ir</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-gray-700">
              {paradasConDireccion.length} parada{paradasConDireccion.length > 1 ? 's' : ''} en la línea temporal
            </div>
            {crearUrlGoogleMapsRecorrido() && (
              <button
                type="button"
                onClick={() => window.open(crearUrlGoogleMapsRecorrido(), '_blank', 'noopener,noreferrer')}
                className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-orange-600"
              >
                Abrir recorrido en Google Maps
              </button>
            )}
          </div>

          <div className="relative pl-6">
            <div className="absolute bottom-2 left-[11px] top-2 w-0.5 rounded-full bg-orange-200" aria-hidden />
            <div className="space-y-3">
              {paradasConDireccion.map((parada, index) => (
                <UseFrameMotion
                  key={`timeline-${String(parada.id)}`}
                  tipoAnimacion="slideUp"
                  duracion={0.24}
                  delay={Math.min(index * 0.04, 0.2)}
                  waitForUserView={false}
                >
                  <div className="relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <span
                      className="absolute -left-[21px] top-5 inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-orange-200 bg-orange-500 text-[10px] font-bold text-white"
                      aria-hidden
                    >
                      {parada.orden}
                    </span>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                          Parada {parada.orden}
                        </p>
                        <h4 className="truncate text-base font-semibold text-gray-900">
                          {parada.mascotaNombre || 'Mascota'}
                        </h4>
                        <p className="truncate text-sm text-gray-600">
                          Cliente: {parada.clienteNombre || 'Sin nombre'} · {parada.telefonoContacto || 'Sin teléfono'}
                        </p>
                        <p className="mt-1 text-sm text-gray-700">
                          <span className="font-medium">Dirección:</span>{' '}
                          {parada.direccionDisponible ? parada.direccionRecorrido : 'No disponible'}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <label className="text-xs text-gray-600">
                            Hora de paso
                            <input
                              type="time"
                              value={draftHorasPaso[String(parada.id)] ?? parada.horaPaso ?? ''}
                              onChange={(e) => handleCambiarHoraPasoDraft(parada.id, e.target.value)}
                              onBlur={() => handleGuardarHoraPaso(parada)}
                              className="ml-2 rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                            />
                          </label>
                          <span className="inline-flex rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700">
                            {parada.estado || 'confirmada'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={citasMutando.has(String(parada.id))}
                        onClick={() => handleQuitarCitaTimeline(parada)}
                        className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                </UseFrameMotion>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Esta línea temporal se guarda también para el cliente de cada cita confirmada.
          </p>
          {isCargandoDireccionesClientes && (
            <p className="text-xs text-gray-500">Cargando direcciones de clientes...</p>
          )}
        </>
      )}
    </div>
  );

  /**
   * Paseador: 5 secciones; escritorio con pestañas arriba, móvil con barra inferior.
   * En móvil, en &quot;Perfil&quot; solo se muestra la ficha (sin el panel blanco duplicado).
   */
  const renderVistaPaseador = () => {
    if (!datosProfesional) return null;

    const paseadorIds = [
      { id: 'perfil', etiqueta: 'Perfil' },
      { id: 'historial', etiqueta: 'Historial' },
      { id: 'recorrido', etiqueta: 'Recorrido' },
      { id: 'servicios', etiqueta: 'Servicios' },
      { id: 'descuentos', etiqueta: 'Descuentos' },
    ];

    const clasesPestDesktop = (id) => {
      const a = pestanaPaseador === id;
      const base = 'px-3 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap';
      if (a) return `${base} border-orange-500 text-orange-600`;
      return `${base} border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200`;
    };

    return (
      <>
        <div className="mb-2 hidden border-b border-gray-200 md:block">
          <div
            className="flex min-h-[3rem] select-none items-stretch justify-start gap-1 overflow-x-auto pb-px"
            role="tablist"
            aria-label="Secciones paseador (escritorio)"
          >
            {paseadorIds.map(({ id, etiqueta }) => (
              <button
                key={id}
                type="button"
                className={clasesPestDesktop(id)}
                role="tab"
                aria-selected={pestanaPaseador === id}
                onClick={() => setPestanaPaseador(id)}
                style={{ minWidth: '4.75rem' }}
              >
                {etiqueta}
              </button>
            ))}
          </div>
        </div>

        <div
          className={pestanaPaseador === 'perfil' ? 'hidden md:block' : 'block'}
          data-panel-paseador
        >
          <div
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 mb-8"
            id={`panel-paseador-${pestanaPaseador}`}
            role="tabpanel"
            aria-labelledby={`tab-paseador-${pestanaPaseador}`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={pestanaPaseador}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: easePanelPaseador }}
              >
                {pestanaPaseador === 'perfil' && (
                  <p className="text-center text-sm text-gray-600">
                    En escritorio, tu ficha completa está arriba. En móvil, usá la pestaña{' '}
                    <strong>Perfil</strong> o subí en la tarjeta superior.
                  </p>
                )}
                {pestanaPaseador === 'historial' && <ContenidoHistorialCitasProfesional />}
                {pestanaPaseador === 'recorrido' && <ContenidoPanelRecorridoPaseador />}
                {pestanaPaseador === 'servicios' && <ContenidoSeccionServicios />}
                {pestanaPaseador === 'descuentos' && <ContenidoSeccionDescuentos />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <PaseadorDashboardTabBar
          pestanaActiva={pestanaPaseador}
          onCambiarPestana={setPestanaPaseador}
          typeTheme={typeTheme}
        />
      </>
    );
  };

  // Renderizar contenido para veterinarios y peluqueros
  const renderContenidoServicios = () => {
    return (
      <>
        {/* Pestañas */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8">
          <div className="border-b border-gray-200 mb-6">
            <div className="flex space-x-4 overflow-x-auto">
            
              <button 
                onClick={() => setPestañaActiva('historial')}
                className={`pb-2 font-medium transition-colors duration-200 whitespace-nowrap ${
                  pestañaActiva === 'historial' 
                    ? 'border-b-2 border-orange-500 text-orange-600' 
                    : 'text-gray-600 hover:text-gray-800 hover:border-b-2 hover:border-gray-300'
                }`}
              >
                Historial de Atenciones
              </button>
              <button 
                onClick={() => setPestañaActiva('servicios')}
                className={`pb-2 font-medium transition-colors duration-200 whitespace-nowrap ${
                  pestañaActiva === 'servicios' 
                    ? 'border-b-2 border-green-500 text-green-600' 
                    : 'text-gray-600 hover:text-gray-800 hover:border-b-2 hover:border-gray-300'
                }`}
                >
                Servicios
              </button>
              <button 
                onClick={() => setPestañaActiva('descuentos')}
                className={`pb-2 font-medium transition-colors duration-200 whitespace-nowrap ${
                  pestañaActiva === 'descuentos' 
                    ? 'border-b-2 border-blue-500 text-blue-600' 
                    : 'text-gray-600 hover:text-gray-800 hover:border-b-2 hover:border-gray-300'
                }`}
              >
                Descuentos
              </button>
            </div>
          </div>

          {/* Contenido de Pestañas (vet / peluquero) */}
          {pestañaActiva === 'historial' && <ContenidoHistorialCitasProfesional />}
          {pestañaActiva === 'servicios' && <ContenidoSeccionServicios />}
          {pestañaActiva === 'descuentos' && datosProfesional?.tipoProfesional !== 'tienda' && (
            <ContenidoSeccionDescuentos />
          )}

        </div>
      </>
    );
  };

  const renderContenidoEspecifico = () => {
    if (!datosProfesional) return null;
    switch (datosProfesional.tipoProfesional) {
      case 'tienda':
        return (
          <GestionTienda
            datosTienda={datosProfesional}
            onActualizarTienda={handleActualizarTienda}
            profesionalId={usuario?.uid}
          />
        );
      case 'paseador':
        return renderVistaPaseador();
      case 'veterinario':
      case 'peluquero':
      default:
        return renderContenidoServicios();
    }
  };

  return (
    <div className={
      typeTheme === 'light'
        ? "bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 min-h-screen pt-16"
        : "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen pt-16"
    }>
      {/* Fondo decorativo */}
      <DecoracionForm isFullScreen={true} />


      {/* Navbar modular */}
      <Navbar 
        tipo="dashboard"
        onCerrarSesion={handleCerrarSesion}
        isCargandoLogout={isCargandoLogout}
      />

      {/* Main Content */}
      <div
        className={`relative container mx-auto py-6 px-4 sm:px-6 lg:px-8 ${
          esPaseador ? 'pb-32 md:pb-6' : ''
        }`}
      >
        {/* Header del Dashboard */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {datosProfesional?.tipoProfesional === 'tienda'
              ? 'Dashboard de Tienda'
              : datosProfesional?.tipoProfesional === 'paseador'
                ? 'Dashboard Paseador'
                : 'Dashboard Profesional'}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            {datosProfesional ? `${datosProfesional.tipoProfesional === 'veterinario' ? 'Dr.' : ''} ${datosProfesional.nombre} - ${datosProfesional.especialidad}` : 'Cargando...'}
          </p>
        </div>

        {/* Ficha: veterinarios/peluqueros/tienda siempre; paseador: escritorio siempre, móvil además en pestaña Perfil */}
        {datosProfesional && !esPaseador && renderBloquePerfilProfesional()}
        {esPaseador && <div className="hidden md:block">{renderBloquePerfilProfesional()}</div>}
        {esPaseador && pestanaPaseador === 'perfil' && (
          <div className="md:hidden">{renderBloquePerfilProfesional()}</div>
        )}

        {/* Contenido específico según tipo de profesional */}
        {renderContenidoEspecifico()}

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                 <p className="text-sm text-blue-700 mt-1">
                 Cada beneficio/descuento que brindes ayuda a fortalecer el ecosistema de Huellitas Seguras y apoyar a mascotas y grupos de rescate. Es una invitación, no una obligación: tu aporte marca la diferencia.
               </p>
              </div>
            </div>
          </div>
      </div>

      {/* Reprogramar cita (arrays embebidos usuario + profesional) */}
      {citaReprogramando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-reprogramar-cita"
          >
            <h3
              id="titulo-reprogramar-cita"
              className="text-lg font-bold text-gray-900 mb-1"
            >
              Cambiar horario
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Mascota:{' '}
              <span className="font-medium">
                {citaReprogramando.mascotaNombre || '—'}
              </span>
              . El cliente verá el estado “Cambio de horario” hasta que confirmes de nuevo.
            </p>
            <form onSubmit={handleGuardarReprogramacion} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    required
                    value={formReprogramar.fecha}
                    onChange={(e) =>
                      setFormReprogramar((p) => ({ ...p, fecha: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Hora
                  </label>
                  <input
                    type="time"
                    required
                    value={formReprogramar.hora}
                    onChange={(e) =>
                      setFormReprogramar((p) => ({ ...p, hora: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Duración (min)
                </label>
                <input
                  type="number"
                  min={15}
                  step={15}
                  value={formReprogramar.duracion}
                  onChange={(e) =>
                    setFormReprogramar((p) => ({
                      ...p,
                      duracion: parseInt(e.target.value, 10) || 60,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={cerrarModalReprogramar}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  disabled={citasMutando.has(String(citaReprogramando.id))}
                  className="flex-1 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
                >
                  {citasMutando.has(String(citaReprogramando.id))
                    ? 'Guardando…'
                    : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Sistema de Citas */}
      {mostrarCitas && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <SistemaCitas 
              onCerrar={() => setMostrarCitas(false)}
            />
          </div>
        </div>
      )}

      {/* Modal para editar imagen del local o del paseador */}
      {mostrarModalEditarImagen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {datosProfesional?.tipoProfesional === 'paseador'
                    ? datosProfesional?.fotoLocalUrl
                      ? 'Editar tu foto'
                      : 'Agregar tu foto'
                    : datosProfesional?.fotoLocalUrl
                      ? 'Editar foto del local'
                      : 'Agregar foto del local'}
                </h3>
                <button
                  onClick={handleCancelarEdicionImagen}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Componente de carga de imagen */}
              <div className="mb-6">
                <ImageUploaderProfesional
                  onImageSelect={setArchivoImagen}
                  onImageUploaded={setUrlImagenLocal}
                  isCargando={isSubiendoImagen}
                  profesionalId={usuario?.uid}
                  imagenActual={datosProfesional?.fotoLocalUrl}
                  varianteImagen={
                    datosProfesional?.tipoProfesional === 'paseador' ? 'paseador' : 'local'
                  }
                />
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3">
                <button
                  onClick={handleCancelarEdicionImagen}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleActualizarImagen}
                  disabled={!archivoImagen || isSubiendoImagen}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubiendoImagen ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {datosProfesional?.fotoLocalUrl ? 'Actualizar' : 'Agregar'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles de mascota */}
      {mostrarModalMascota && datosMascotaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Detalles de la Mascota
                </h3>
                <button
                  onClick={handleCerrarModalMascota}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Contenido del modal */}
              <div className="space-y-6">
                {/* Foto de la mascota */}
                {datosMascotaSeleccionada.fotoMascota && (
                  <div className="text-center">
                    <img 
                      src={datosMascotaSeleccionada.fotoMascota} 
                      alt={datosMascotaSeleccionada.mascotaNombre}
                      className="w-32 h-32 object-cover rounded-full mx-auto shadow-lg"
                    />
                  </div>
                )}

                {/* Información de la mascota */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Información de la Mascota
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Nombre</p>
                      <p className="font-medium text-gray-900">{datosMascotaSeleccionada.mascotaNombre}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Raza</p>
                      <p className="font-medium text-gray-900">{datosMascotaSeleccionada.mascotaRaza}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Edad</p>
                      <p className="font-medium text-gray-900">{datosMascotaSeleccionada.mascotaEdad} años</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">ID de Mascota</p>
                      <p className="font-medium text-gray-900 text-xs font-mono">{datosMascotaSeleccionada.mascotaId}</p>
                    </div>
                  </div>
                </div>

                {/* Información del cliente */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Información del Cliente
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Nombre</p>
                      <p className="font-medium text-gray-900">{datosMascotaSeleccionada.clienteNombre}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{datosMascotaSeleccionada.clienteEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Teléfono</p>
                      <p className="font-medium text-gray-900">{datosMascotaSeleccionada.telefonoContacto}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">ID de Cliente</p>
                      <p className="font-medium text-gray-900 text-xs font-mono">{datosMascotaSeleccionada.clienteId}</p>
                    </div>
                  </div>
                </div>

                {/* Información de la cita */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Información de la Cita
                  </h4>
                  <div className="space-y-3">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Fecha</p>
                        <p className="font-medium text-gray-900">{datosMascotaSeleccionada.fecha}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Hora</p>
                        <p className="font-medium text-gray-900">{datosMascotaSeleccionada.hora}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Duración</p>
                        <p className="font-medium text-gray-900">{datosMascotaSeleccionada.duracion} minutos</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Precio</p>
                        <p className="font-medium text-gray-900">${datosMascotaSeleccionada.precio}</p>
                      </div>
                    </div>
                    
                    {/* Servicios */}
                    {datosMascotaSeleccionada.servicios && datosMascotaSeleccionada.servicios.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600">Servicios</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {datosMascotaSeleccionada.servicios.map((servicio, index) => (
                            <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              {servicio}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tipo de corte (para peluqueros) */}
                    {datosMascotaSeleccionada.tipoCorte && (
                      <div>
                        <p className="text-sm text-gray-600">Tipo de Corte</p>
                        <p className="font-medium text-gray-900">{datosMascotaSeleccionada.tipoCorte}</p>
                      </div>
                    )}

                    {/* Observaciones */}
                    {datosMascotaSeleccionada.observaciones && (
                      <div>
                        <p className="text-sm text-gray-600">Observaciones</p>
                        <p className="font-medium text-gray-900 italic">{datosMascotaSeleccionada.observaciones}</p>
                      </div>
                    )}

                    {/* Estado y badges */}
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                        datosMascotaSeleccionada.estado === 'confirmada' ? 'bg-green-100 text-green-800' :
                        datosMascotaSeleccionada.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                        datosMascotaSeleccionada.estado === 'cancelada' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {datosMascotaSeleccionada.estado}
                      </span>
                      {datosMascotaSeleccionada.esPrimeraVisita && (
                        <span className="inline-block px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                          Primera visita
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de cerrar */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleCerrarModalMascota}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de servicios */}
      <AddServicesProfecional
        isAbierto={mostrarModalServicios}
        onCerrar={handleCerrarModalServicios}
        profesionalId={usuario?.uid}
        tipoProfesional={datosProfesional?.tipoProfesional}
        servicioExistente={servicioAEditar}
        onServicioGuardado={handleServicioGuardado}
      />
    </div>
  );
};

export default DashboardProfesional; 