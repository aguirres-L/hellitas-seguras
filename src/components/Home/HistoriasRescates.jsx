import React, { useState, useEffect } from 'react';
import { getAllDataCollection, obtenerDetalleOng, updateDataCollection } from '../../data/firebase/firebase';
import UseFrameMotion from '../hook_frame_motion/UseFrameMotion';
import { motion, AnimatePresence } from 'framer-motion';

// Este componente no recibe props
export default function HistoriasRescates() {
  const TOTAL_PASOS_FORMULARIO = 5;
  const mensajesPasoFormulario = [
    {
      titulo: 'Primero, contanos sobre vos',
      subtitulo: 'Esto nos ayuda a armar un primer perfil para una adopción responsable.'
    },
    {
      titulo: '¿Dónde vivís y cómo te contactamos?',
      subtitulo: 'Tu barrio y teléfono son clave para coordinar entrevista y seguimiento.'
    },
    {
      titulo: 'Convivencia en casa',
      subtitulo: 'Queremos entender el entorno donde viviría la mascota.'
    },
    {
      titulo: 'Tu hogar',
      subtitulo: 'Tipo de vivienda y espacio disponible para la mascota.'
    },
    {
      titulo: 'Motivación para adoptar',
      subtitulo: 'Una breve descripción de por qué querés adoptar y cómo sería su vida.'
    }
  ];

  const [historiasRescate, setHistoriasRescate] = useState([]);
  const [reportesComunidad, setReportesComunidad] = useState([]);
  const [isCargando, setIsCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtroTipoPublicacion, setFiltroTipoPublicacion] = useState('todas');
  const [noticiaSeleccionada, setNoticiaSeleccionada] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarFormularioAdopcion, setMostrarFormularioAdopcion] = useState(false);
  const [mascotaFormulario, setMascotaFormulario] = useState(null);
  const [isEnviandoSolicitud, setIsEnviandoSolicitud] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState('');
  const [pasoFormulario, setPasoFormulario] = useState(0);
  const [formularioAdopcion, setFormularioAdopcion] = useState({
    nombreCompleto: '',
    barrio: '',
    telefono: '',
    tieneOtrasMascotas: '',
    tieneHijos: '',
    tipoVivienda: '',
    motivoAdopcion: ''
  });
  
  // Estado para datos de la ONG
  const [datosOng, setDatosOng] = useState(null);
  const [isCargandoOng, setIsCargandoOng] = useState(true);

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    
    try {
      const fechaObj = fecha.seconds 
        ? new Date(fecha.seconds * 1000)
        : new Date(fecha);
      
      return fechaObj.toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (err) {
      return 'Fecha inválida';
    }
  };

  // Función para calcular tiempo de rescate
  const calcularTiempoRescate = (fechaRescate) => {
    if (!fechaRescate) return 'No disponible';
    
    try {
      const fechaObj = fechaRescate.seconds 
        ? new Date(fechaRescate.seconds * 1000)
        : new Date(fechaRescate);
      
      const ahora = new Date();
      const diferenciaMs = ahora - fechaObj;
      const diferenciaDias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));
      
      if (diferenciaDias < 30) {
        return `${diferenciaDias} días`;
      } else if (diferenciaDias < 365) {
        const meses = Math.floor(diferenciaDias / 30);
        return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
      } else {
        const años = Math.floor(diferenciaDias / 365);
        const mesesRestantes = Math.floor((diferenciaDias % 365) / 30);
        if (mesesRestantes === 0) {
          return `${años} ${años === 1 ? 'año' : 'años'}`;
        }
        return `${años} ${años === 1 ? 'año' : 'años'} y ${mesesRestantes} ${mesesRestantes === 1 ? 'mes' : 'meses'}`;
      }
    } catch (err) {
      return 'No disponible';
    }
  };

  // Función para generar título si no existe
  const generarTitulo = (historia) => {
    if (historia.titulo) return historia.titulo;
    
    const nombre = historia.nombreMascota || 'Esta mascota';
    const estado = historia.estado === 'adoptado' 
      ? 'encontró su hogar' 
      : historia.estado === 'en_adopcion'
        ? 'busca su hogar'
        : historia.estado === 'en_tramite'
          ? 'está en revisión de adopción'
        : 'fue rescatada';
    
    return `${nombre}: ${estado}`;
  };

  // Función para generar descripción si no existe
  const generarDescripcion = (historia) => {
    if (historia.descripcion) return historia.descripcion;
    
    const nombre = historia.nombreMascota || 'Esta mascota';
    const especie = historia.especie === 'perro' ? 'perrito' : historia.especie === 'gato' ? 'gatito' : 'mascota';
    
    if (historia.estado === 'adoptado') {
      return `${nombre} es un ${especie} que encontró una familia llena de amor después de ser rescatado. Su historia es un testimonio del poder de la esperanza y la dedicación.`;
    } else if (historia.estado === 'en_adopcion') {
      return `${nombre} es un ${especie} rescatado que está buscando un hogar lleno de amor y cuidado.`;
    } else if (historia.estado === 'en_tramite') {
      return `${nombre} ya recibió una postulación y se encuentra en etapa de revisión para adopción responsable.`;
    } else {
      return `${nombre} es un ${especie} que fue rescatado y está en proceso de rehabilitación.`;
    }
  };

  // Cargar datos de la ONG desde Firebase
  useEffect(() => {
    const cargarDatosOng = async () => {
      setIsCargandoOng(true);
      try {
        const datos = await obtenerDetalleOng();
        setDatosOng(datos);
      } catch (err) {
        console.error('Error al cargar datos de ONG:', err);
        // Si falla, usar valores por defecto (null)
        setDatosOng(null);
      } finally {
        setIsCargandoOng(false);
      }
    };

    cargarDatosOng();
  }, []);

  const obtenerFechaOrdenable = (fecha) => {
    if (!fecha) return new Date(0);
    if (fecha.seconds) return new Date(fecha.seconds * 1000);
    return new Date(fecha);
  };

  // Cargar publicaciones desde Firebase
  useEffect(() => {
    const cargarPublicaciones = async () => {
      setIsCargando(true);
      setError(null);
      
      try {
        const todasLasHistorias = await getAllDataCollection('historias-de-rescates');
        const reportes = await getAllDataCollection('reportes-mascotas');
        
        // Transformar datos de Firebase al formato esperado por el componente
        const historiasTransformadas = todasLasHistorias.map((historia) => {
          // Convertir estado: 'en_adopcion' -> false (disponible), 'adoptado' -> true (adoptado)
          const estadoBooleano = historia.estado === 'adoptado';
          
          return {
            id: historia.id,
            imagen: historia.imagenUrl || 'https://via.placeholder.com/400x300?text=Sin+imagen',
            titulo: generarTitulo(historia),
            descripcion: generarDescripcion(historia),
            nombreMascota: historia.nombreMascota || 'Sin nombre',
            edad: historia.edad || 'No especificada',
            raza: historia.raza || 'Mestizo',
            historia: historia.historiaRescate || historia.descripcion || 'Historia completa próximamente...',
            fechaRescate: formatearFecha(historia.fechaRescate || historia.fechaCreacion),
            estado: estadoBooleano,
            tiempoRescate: calcularTiempoRescate(historia.fechaRescate || historia.fechaCreacion),
            // Mantener datos originales para el modal
            estadoOriginal: historia.estado || 'en_adopcion',
            contacto: historia.contacto,
            ubicacion: historia.ubicacion,
            tipoPublicacion: 'adopcion',
            fechaOrdenable: obtenerFechaOrdenable(historia.fechaCreacion || historia.fechaRescate)
          };
        });

        const reportesTransformados = reportes.map((reporte) => ({
          id: `reporte-${reporte.id}`,
          idFirestore: reporte.id,
          imagen: reporte.imagen || 'https://via.placeholder.com/400x300?text=Sin+imagen',
          titulo: reporte.titulo || (reporte.tipoPublicacion === 'perdida' ? 'Mascota perdida' : 'Avistamiento de mascota'),
          descripcion: reporte.descripcion || 'Publicación comunitaria',
          nombreMascota: reporte.nombreMascota || 'Sin nombre',
          edad: reporte.edad || 'No especificada',
          raza: reporte.raza || 'No especificada',
          historia: reporte.descripcion || 'Sin detalles adicionales',
          fechaRescate: formatearFecha(reporte.fechaCreacion),
          estado: false,
          tiempoRescate: 'Reciente',
          estadoOriginal: reporte.tipoPublicacion === 'perdida' ? 'perdida' : 'avistamiento',
          contacto: reporte.contacto || '',
          ubicacion: reporte.ubicacion || 'No informada',
          tipoPublicacion: reporte.tipoPublicacion === 'perdida' ? 'perdida' : 'avistamiento',
          fechaOrdenable: obtenerFechaOrdenable(reporte.fechaCreacion)
        }));

        historiasTransformadas.sort((a, b) => b.fechaOrdenable - a.fechaOrdenable);
        reportesTransformados.sort((a, b) => b.fechaOrdenable - a.fechaOrdenable);

        setHistoriasRescate(historiasTransformadas);
        setReportesComunidad(reportesTransformados);
      } catch (err) {
        console.error('Error al cargar publicaciones:', err);
        setError('Error al cargar las publicaciones. Por favor, intentá recargar la página.');
      } finally {
        setIsCargando(false);
      }
    };

    cargarPublicaciones();
  }, []);

  const abrirNoticia = (noticia) => {
    setNoticiaSeleccionada(noticia);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setNoticiaSeleccionada(null);
  };

  const abrirFormulario = (mascota) => {
    setMascotaFormulario(mascota);
    setErrorFormulario('');
    setPasoFormulario(0);
    setMostrarFormularioAdopcion(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormularioAdopcion(false);
    setMascotaFormulario(null);
    setErrorFormulario('');
    setPasoFormulario(0);
    setFormularioAdopcion({
      nombreCompleto: '',
      barrio: '',
      telefono: '',
      tieneOtrasMascotas: '',
      tieneHijos: '',
      tipoVivienda: '',
      motivoAdopcion: ''
    });
  };

  const onCambioFormulario = (e) => {
    const { name, value } = e.target;
    setFormularioAdopcion((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const puedeAvanzarPasoFormulario = () => {
    switch (pasoFormulario) {
      case 0:
        return Boolean(formularioAdopcion.nombreCompleto.trim());
      case 1:
        return Boolean(formularioAdopcion.barrio.trim() && formularioAdopcion.telefono.trim());
      case 2:
        return Boolean(formularioAdopcion.tieneOtrasMascotas && formularioAdopcion.tieneHijos);
      case 3:
        return Boolean(formularioAdopcion.tipoVivienda.trim());
      case 4:
        return true;
      default:
        return false;
    }
  };

  const onContinuarFormulario = () => {
    if (!puedeAvanzarPasoFormulario()) {
      setErrorFormulario('Completá este paso para continuar.');
      return;
    }
    setErrorFormulario('');
    setPasoFormulario((prev) => Math.min(prev + 1, TOTAL_PASOS_FORMULARIO - 1));
  };

  const onAtrasFormulario = () => {
    setErrorFormulario('');
    setPasoFormulario((prev) => Math.max(prev - 1, 0));
  };


  // Función para formatear número de WhatsApp
  const formatearNumeroWhatsApp = (numero) => {
    if (!numero) return null;
    // Eliminar espacios y caracteres especiales, mantener solo números
    let numeroLimpio = numero.toString().replace(/[^\d]/g, '');
    // Si no empieza con +, agregarlo (asumiendo código de país)
    if (!numeroLimpio.startsWith('+')) {
      // Si empieza con 0, reemplazarlo con código de país (Chile: +56)
      if (numeroLimpio.startsWith('0')) {
        numeroLimpio = '+56' + numeroLimpio.substring(1);
      } else {
        // Si ya tiene código de país sin +, agregarlo
        numeroLimpio = '+' + numeroLimpio;
      }
    }
    return numeroLimpio;
  };

  // Función para construir URL de Instagram
  const construirUrlInstagram = (instagram) => {
    if (!instagram) return null;
    // Si ya es una URL completa, retornarla
    if (instagram.startsWith('http')) {
      return instagram;
    }
    // Si empieza con @, removerlo
    const usuario = instagram.startsWith('@') ? instagram.substring(1) : instagram;
    return `https://instagram.com/${usuario}`;
  };

  // Función para construir URL de Facebook
  const construirUrlFacebook = (facebook) => {
    if (!facebook) return null;
    // Si ya es una URL completa, retornarla
    if (facebook.startsWith('http')) {
      return facebook;
    }
    // Si no tiene http, construir URL
    return `https://facebook.com/${facebook}`;
  };

  // Array de animaciones disponibles para las cards
  const animacionesDisponibles = ['slideUp', 'slideDown', 'slideLeft', 'slideRight', 'scale', 'rotate'];

  // Función para obtener una animación determinística basada en el ID de la historia
  // Esto asegura que cada card siempre tenga la misma animación (no cambia en cada render)
  const obtenerAnimacionParaCard = (idHistoria) => {
    // Convertir el ID a un número usando hash simple
    let hash = 0;
    for (let i = 0; i < idHistoria.length; i++) {
      hash = ((hash << 5) - hash) + idHistoria.charCodeAt(i);
      hash = hash & hash; // Convertir a entero de 32 bits
    }
    // Usar el valor absoluto del hash para seleccionar una animación
    const indice = Math.abs(hash) % animacionesDisponibles.length;
    return animacionesDisponibles[indice];
  };

  // Función para abrir WhatsApp con mensaje personalizado
  const infoAdoptar = (mascota = null) => {
    // Obtener número de WhatsApp de los datos de la ONG
    const numeroWhatsApp = datosOng?.whatsapp 
      ? formatearNumeroWhatsApp(datosOng.whatsapp)
      : '5491112345678'; // Fallback por defecto
    
    // Nombre de la ONG desde los datos o por defecto
    const nombreOng = datosOng?.nombreOng || 'Patitas que Ayudan';
    
    // Mensaje base
    let mensaje = `¡Hola! Estoy interesado en adoptar una mascota de ${nombreOng}. `;
    
    // Si hay una mascota específica, personalizar el mensaje
    if (mascota) {
      mensaje += `Me llamó especialmente la atención la historia de ${mascota.nombreMascota} (${mascota.raza}, ${mascota.edad}). `;
      mensaje += `¿Podrían darme más información sobre el proceso de adopción?`;
    } else {
      mensaje += '¿Podrían ayudarme a encontrar la mascota perfecta para mi familia?';
    }
    
    // Codificar el mensaje para URL
    const mensajeCodificado = encodeURIComponent(mensaje);
    
    // Crear URL de WhatsApp
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensajeCodificado}`;
    
    // Abrir WhatsApp en nueva pestaña
    window.open(urlWhatsApp, '_blank');
  };

  const obtenerTextoEstado = (estado) => {
    switch (estado) {
      case 'adoptado':
        return 'Adoptado';
      case 'en_tramite':
        return 'En trámite';
      case 'rescatado':
        return 'Rescatado';
      case 'avistamiento':
        return 'Avistamiento';
      case 'perdida':
        return 'Mascota perdida';
      case 'en_adopcion':
      default:
        return 'Disponible';
    }
  };

  const obtenerClaseEstado = (estado) => {
    switch (estado) {
      case 'adoptado':
        return 'bg-orange-100 text-orange-800';
      case 'en_tramite':
        return 'bg-yellow-100 text-yellow-800';
      case 'rescatado':
        return 'bg-purple-100 text-purple-800';
      case 'avistamiento':
        return 'bg-blue-100 text-blue-800';
      case 'perdida':
        return 'bg-red-100 text-red-800';
      case 'en_adopcion':
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const obtenerClaseCardPorTipo = (tipoPublicacion) => {
    switch (tipoPublicacion) {
      case 'avistamiento':
        return 'border-2 border-blue-200 bg-blue-50/40';
      case 'perdida':
        return 'border-2 border-red-200 bg-red-50/40';
      case 'adopcion':
      default:
        return 'border-2 border-orange-200 bg-orange-50/30';
    }
  };

  const obtenerDetalleTipo = (tipoPublicacion) => {
    switch (tipoPublicacion) {
      case 'avistamiento':
        return 'Reporte ciudadano';
      case 'perdida':
        return 'Alerta comunitaria';
      case 'adopcion':
      default:
        return 'Adopción responsable';
    }
  };

  const enviarSolicitudAdopcion = async (e) => {
    e.preventDefault();
    if (!mascotaFormulario) return;

    if (
      !formularioAdopcion.nombreCompleto.trim() ||
      !formularioAdopcion.barrio.trim() ||
      !formularioAdopcion.telefono.trim() ||
      !formularioAdopcion.tieneOtrasMascotas ||
      !formularioAdopcion.tieneHijos ||
      !formularioAdopcion.tipoVivienda.trim()
    ) {
      setErrorFormulario('Faltan datos obligatorios para enviar la postulación.');
      return;
    }

    setIsEnviandoSolicitud(true);
    setErrorFormulario('');

    try {
      const numeroWhatsApp = datosOng?.whatsapp
        ? formatearNumeroWhatsApp(datosOng.whatsapp)
        : '5491112345678';

      const numeroSoloDigitos = String(numeroWhatsApp).replace(/[^\d]/g, '');
      const nombreOng = datosOng?.nombreOng || 'Patitas que Ayudan';

      const mensaje = [
        `Hola ${nombreOng}, quiero postularme para adoptar a ${mascotaFormulario.nombreMascota}.`,
        '',
        'Perfil de la persona interesada:',
        `- Nombre: ${formularioAdopcion.nombreCompleto}`,
        `- Barrio: ${formularioAdopcion.barrio}`,
        `- Teléfono: ${formularioAdopcion.telefono}`,
        `- ¿Tiene otras mascotas?: ${formularioAdopcion.tieneOtrasMascotas || 'No informado'}`,
        `- ¿Tiene hijos?: ${formularioAdopcion.tieneHijos || 'No informado'}`,
        `- Tipo de vivienda: ${formularioAdopcion.tipoVivienda || 'No informado'}`,
        `- Motivo de adopción: ${formularioAdopcion.motivoAdopcion || 'No informado'}`,
        '',
        `Mascota consultada: ${mascotaFormulario.nombreMascota} (${mascotaFormulario.raza}, ${mascotaFormulario.edad})`,
      ].join('\n');

      if (mascotaFormulario.estadoOriginal !== 'en_tramite' && mascotaFormulario.estadoOriginal !== 'adoptado') {
        await updateDataCollection('historias-de-rescates', mascotaFormulario.id, { estado: 'en_tramite' });

        setHistoriasRescate((prev) =>
          prev.map((item) =>
            item.id === mascotaFormulario.id
              ? { ...item, estadoOriginal: 'en_tramite' }
              : item
          )
        );

        setNoticiaSeleccionada((prev) =>
          prev && prev.id === mascotaFormulario.id
            ? { ...prev, estadoOriginal: 'en_tramite' }
            : prev
        );
      }

      const urlWhatsApp = `https://wa.me/${numeroSoloDigitos}?text=${encodeURIComponent(mensaje)}`;
      window.open(urlWhatsApp, '_blank');
      cerrarFormulario();
    } catch (err) {
      console.error('Error al enviar solicitud de adopción:', err);
      setErrorFormulario('No pudimos iniciar la solicitud. Intentá nuevamente.');
    } finally {
      setIsEnviandoSolicitud(false);
    }
  };

  const publicaciones = [...historiasRescate, ...reportesComunidad]
    .sort((a, b) => b.fechaOrdenable - a.fechaOrdenable);

  const publicacionesFiltradas = filtroTipoPublicacion === 'todas'
    ? publicaciones
    : publicaciones.filter((item) => item.tipoPublicacion === filtroTipoPublicacion);

  return (
    <section className="relative container mx-auto md:py-20 py-12 mt-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            Historias, avistamientos y mascotas perdidas
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Conocé adopciones, reportes de avistamientos y alertas de mascotas perdidas en un mismo lugar.
            Así toda la comunidad puede ayudar más rápido.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setFiltroTipoPublicacion('todas')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${filtroTipoPublicacion === 'todas' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Todas
            </button>
            <button
              onClick={() => setFiltroTipoPublicacion('adopcion')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${filtroTipoPublicacion === 'adopcion' ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-800 hover:bg-orange-200'}`}
            >
              Adopción
            </button>
            <button
              onClick={() => setFiltroTipoPublicacion('avistamiento')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${filtroTipoPublicacion === 'avistamiento' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
            >
              Avistamientos
            </button>
            <button
              onClick={() => setFiltroTipoPublicacion('perdida')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${filtroTipoPublicacion === 'perdida' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
            >
              Perdidas
            </button>
          </div>
        </div>

        {/* Estado de carga */}
        {isCargando && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <p className="mt-4 text-gray-600">Cargando historias de rescates...</p>
          </div>
        )}

        {/* Error */}
        {error && !isCargando && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Recargar página
            </button>
          </div>
        )}

        {/* Grid de noticias */}
        {!isCargando && !error && (
          <>
            {publicacionesFiltradas.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Aún no hay publicaciones disponibles
                </p>
                <p className="text-gray-600">
                  Las publicaciones aparecerán aquí cuando sean creadas.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {publicacionesFiltradas.map((noticia, indice) => {
                  // Obtener animación determinística para esta card
                  const tipoAnimacionCard = obtenerAnimacionParaCard(noticia.id);
                  // Delay escalonado para crear efecto cascada (cada card aparece un poco después)
                  const delayCard = indice * 0.1;
                  
                  return (
                    <UseFrameMotion 
                      key={noticia.id}
                      tipoAnimacion={tipoAnimacionCard}
                      duracion={0.6}
                      delay={delayCard}
                      waitForUserView={true}
                    >
                      <article 
                        className={`rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer ${obtenerClaseCardPorTipo(noticia.tipoPublicacion)}`}
                        onClick={() => abrirNoticia(noticia)}
                      >
                        {/* Imagen */}
                        <div className="relative h-48 overflow-hidden bg-gray-100">
                          <img
                            src={noticia.imagen}
                            alt={noticia.titulo}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/400x300?text=Sin+imagen';
                            }}
                          />
                          <div className="absolute top-4 right-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${obtenerClaseEstado(noticia.estadoOriginal)}`}>
                              {obtenerTextoEstado(noticia.estadoOriginal)}
                            </span>
                          </div>
                          <div className="absolute bottom-4 left-4">
                            <span className="inline-block bg-black/70 text-white text-xs px-2 py-1 rounded">
                              {noticia.fechaRescate}
                            </span>
                          </div>
                          <div className="absolute top-4 left-4">
                            <span className="inline-block bg-white/90 text-gray-700 text-xs px-2 py-1 rounded font-semibold">
                              {obtenerDetalleTipo(noticia.tipoPublicacion)}
                            </span>
                          </div>
                        </div>

                        {/* Contenido */}
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors">
                            {noticia.titulo}
                          </h3>
                          
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            {noticia.descripcion}
                          </p>

                          {/* Info rápida de la mascota */}
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                            <span>🐾 {noticia.nombreMascota}</span>
                            <span>�� {noticia.tiempoRescate}</span>
                          </div>

                          <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 text-sm">
                            Leer historia completa
                          </button>
                        </div>
                      </article>
                    </UseFrameMotion>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* CTA de adopción y fundación */}
        <div className="mt-20">
          {/* Mensaje principal */}
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Cada mascota merece una segunda oportunidad
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Únete a nuestra misión de dar amor y esperanza a los animales que más lo necesitan
            </p>
          </div>

{/* 
 * Animaciones disponibles para las cards:
 *   - 'slideUp': Desliza desde abajo hacia arriba mientras aparece (y: 50px → 0)
 *   - 'slideDown': Desliza desde arriba hacia abajo mientras aparece (y: -50px → 0)
 *   - 'slideLeft': Desliza desde la derecha hacia la izquierda mientras aparece (x: 50px → 0)
 *   - 'slideRight': Desliza desde la izquierda hacia la derecha mientras aparece (x: -50px → 0)
 *   - 'scale': Escala desde pequeño a tamaño normal mientras aparece (scale: 0.8 → 1)
 *   - 'rotate': Rota ligeramente al aparecer y desaparecer (rotate: -10° → 0° → 10°)
 */}
          {/* Card de la fundación */}
          <UseFrameMotion tipoAnimacion="slideUp" duracion={1} delay={0.5} waitForUserView={true}>
          <div className="bg-gradient-to-br from-orange-50 to-green-50 rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-xl border border-orange-100">
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-start md:items-center">
              {/* Información de la fundación */}
              <div className="order-2 md:order-1">
                <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 md:mb-6 gap-3 sm:gap-0">
                  {/* Logo de la ONG o emoji por defecto */}
                  {datosOng?.logoUrl ? (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl overflow-hidden sm:mr-4 flex-shrink-0 border-2 border-white shadow-md bg-white">
                      <img 
                        src={datosOng.logoUrl} 
                        alt={datosOng?.nombreOng || 'Logo ONG'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Si falla la carga del logo, mostrar emoji
                          e.target.style.display = 'none';
                          const parent = e.target.parentElement;
                          parent.innerHTML = '<div class="w-full h-full bg-orange-500 flex items-center justify-center"><span class="text-white text-xl sm:text-2xl">🐾</span></div>';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-orange-500 rounded-xl md:rounded-2xl flex items-center justify-center sm:mr-4">
                      <span className="text-white text-xl sm:text-2xl">🐾</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 break-words">
                      {datosOng?.nombreOng || 'Patitas que Ayudan'}
                    </h4>
                    <p className="text-orange-600 font-medium text-sm sm:text-base">Fundación de Rescate Animal</p>
                  </div>
                </div>
                
                {/* Descripción de la ONG */}
                <p className="text-gray-700 mb-4 md:mb-6 leading-relaxed text-sm sm:text-base">
                  {datosOng?.detalleOng || 
                    'Desde 2020, trabajamos incansablemente para rescatar, rehabilitar y encontrar hogares ' +
                    'llenos de amor para mascotas abandonadas. Cada historia de éxito es nuestra motivación ' +
                    'para seguir salvando vidas.'
                  }
                </p>

                {/* Estadísticas de la ONG */}
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 md:gap-4 mb-4 md:mb-6">
                  {datosOng?.estimativoRescates ? (
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mr-2 flex-shrink-0"></span>
                      <span className="break-words">+{datosOng.estimativoRescates.toLocaleString('es-CL')} mascotas rescatadas</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mr-2 flex-shrink-0"></span>
                      <span className="break-words">+500 mascotas rescatadas</span>
                    </div>
                  )}
                  {datosOng?.estimativoAdopciones ? (
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0"></span>
                      <span className="break-words">+{datosOng.estimativoAdopciones.toLocaleString('es-CL')} adopciones exitosas</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0"></span>
                      <span className="break-words">+300 adopciones exitosas</span>
                    </div>
                  )}
                  <div className="flex items-center text-xs sm:text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full mr-2 flex-shrink-0"></span>
                    <span className="break-words">24/7 atención veterinaria</span>
                  </div>
                </div>

                {/* Redes sociales */}
                {(datosOng?.instagram || datosOng?.facebook || datosOng?.whatsapp) && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 md:gap-4">
                    <span className="text-gray-600 font-medium text-sm sm:text-base">Síguenos:</span>
                    <div className="flex gap-2 sm:gap-3">
                      {datosOng?.instagram && (
                        <a 
                          href={construirUrlInstagram(datosOng.instagram)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-transform duration-200 flex-shrink-0"
                          title="Síguenos en Instagram"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </a>
                      )}
                      {datosOng?.facebook && (
                        <a 
                          href={construirUrlFacebook(datosOng.facebook)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-transform duration-200 flex-shrink-0"
                          title="Síguenos en Facebook"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        </a>
                      )}
                      {datosOng?.whatsapp && (
                        <a 
                          href={`https://wa.me/${formatearNumeroWhatsApp(datosOng.whatsapp)}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-9 h-9 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-transform duration-200 flex-shrink-0"
                          title="Contáctanos por WhatsApp"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* CTA de adopción */}
              <div className="text-center md:text-left order-1 md:order-2">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 shadow-xl border border-orange-100 hover:shadow-2xl transition-all duration-300">
                  {/* Icono decorativo */}
                  <div className="flex justify-center md:justify-start mb-3 md:mb-4">
                    <div className="w-12 h-12 sm:w-13 sm:h-13 md:w-14 md:h-14 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-xl sm:text-2xl">🐾</span>
                    </div>
                  </div>
                  
                  <h5 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-2 md:mb-3">
                    ¿Listo para cambiar una vida?
                  </h5>
                  <p className="text-gray-600 mb-4 md:mb-6 text-xs sm:text-sm md:text-base leading-relaxed">
                    Cada adopción es una historia de amor y esperanza. Únete a nuestra misión de dar hogares llenos de cariño a quienes más lo necesitan.
                  </p>
                  
                  <button 
                    onClick={() => infoAdoptar()}
                    className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 active:from-orange-700 active:to-pink-700 text-white font-bold py-2.5 sm:py-3 md:py-4 px-4 sm:px-6 md:px-8 rounded-lg md:rounded-xl text-sm sm:text-base md:text-lg transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>¡Adopta una mascota!</span>
                    <span className="text-lg sm:text-xl">🐾</span>
                  </button>
                  
                  <div className="mt-3 md:mt-4 flex items-center justify-center md:justify-start gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="break-words">Proceso 100% gratuito y responsable</span>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
          </UseFrameMotion>
          
        </div>
      </div>

      {/* Modal de noticia completa */}
      <AnimatePresence>
        {mostrarModal && noticiaSeleccionada && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={cerrarModal}
          >
            <motion.div
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
            >
            {/* Header del modal */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-start">
              <div>
                <span className="inline-block bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-full mb-2">
                  {noticiaSeleccionada.fechaRescate}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {noticiaSeleccionada.titulo}
                </h2>
              </div>
              <button
                onClick={cerrarModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Imagen */}
                <div className="relative">
                  <img
                    src={noticiaSeleccionada.imagen}
                    alt={noticiaSeleccionada.titulo}
                    className="w-full h-80 object-cover rounded-lg bg-gray-100"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=Sin+imagen';
                    }}
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${obtenerClaseEstado(noticiaSeleccionada.estadoOriginal)}`}>
                      {obtenerTextoEstado(noticiaSeleccionada.estadoOriginal)}
                    </span>
                  </div>
                </div>

                {/* Información detallada */}
                <div>
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Sobre {noticiaSeleccionada.nombreMascota}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Edad:</span>
                        <span className="font-medium text-gray-700">{noticiaSeleccionada.edad}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Raza:</span>
                        <span className="font-medium text-gray-700">{noticiaSeleccionada.raza}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tiempo de rescate:</span>
                        <span className="font-medium text-gray-700">{noticiaSeleccionada.tiempoRescate}</span>
                      </div>
                    </div>
                  </div>

                  <h5 className="font-semibold text-gray-800 mb-3">La historia completa</h5>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {noticiaSeleccionada.historia}
                  </p>
                  {(noticiaSeleccionada.ubicacion || noticiaSeleccionada.contacto) && (
                    <div className="mt-4 bg-gray-50 rounded-lg p-3 text-sm">
                      {noticiaSeleccionada.ubicacion && (
                        <p className="text-gray-700">
                          <span className="font-semibold">Ubicación:</span> {noticiaSeleccionada.ubicacion}
                        </p>
                      )}
                      {noticiaSeleccionada.contacto && (
                        <p className="text-gray-700 mt-1">
                          <span className="font-semibold">Contacto:</span> {noticiaSeleccionada.contacto}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer del modal */}
             
            { noticiaSeleccionada.estadoOriginal === 'en_adopcion' ? (
              <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <button onClick={() => abrirFormulario(noticiaSeleccionada)} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                  Quiero postular para adoptarla
                </button>
              </div>
            ) : noticiaSeleccionada.estadoOriginal === 'en_tramite' ? (
              <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <p className="text-yellow-700 font-medium">
                  Esta mascota ya está en revisión de adopción. Podés consultar por WhatsApp para quedar en lista de espera.
                </p>
                <button
                  onClick={() => infoAdoptar(noticiaSeleccionada)}
                  className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
                >
                  Consultar por WhatsApp
                </button>
              </div>
            ) : null}

            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal formulario de postulación */}
      <AnimatePresence>
        {mostrarFormularioAdopcion && mascotaFormulario && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={cerrarFormulario}
          >
            <motion.div
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Perfil para adopción</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Completá tu perfil para postular por {mascotaFormulario.nombreMascota}.
                  </p>
                </div>
                <button
                  onClick={cerrarFormulario}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  type="button"
                >
                  ×
                </button>
              </div>

              <form onSubmit={enviarSolicitudAdopcion} className="p-6">
                <div className="mb-6">
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                    <span>Paso {pasoFormulario + 1} de {TOTAL_PASOS_FORMULARIO}</span>
                    <span className="text-green-600 font-medium">
                      {Math.round(((pasoFormulario + 1) / TOTAL_PASOS_FORMULARIO) * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-green-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${((pasoFormulario + 1) / TOTAL_PASOS_FORMULARIO) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="mb-6 animate-fade-in">
                  <h4 className="text-2xl font-bold text-gray-900 leading-tight">
                    {mensajesPasoFormulario[pasoFormulario]?.titulo}
                  </h4>
                  <p className="mt-2 text-gray-600 text-base leading-relaxed">
                    {mensajesPasoFormulario[pasoFormulario]?.subtitulo}
                  </p>
                </div>

                <div className="min-h-[180px] animate-fade-in">
                  {pasoFormulario === 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo *</label>
                      <input
                        type="text"
                        name="nombreCompleto"
                        value={formularioAdopcion.nombreCompleto}
                        onChange={onCambioFormulario}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
                        placeholder="Ej: Juan Pérez"
                        autoFocus
                      />
                    </div>
                  )}

                  {pasoFormulario === 1 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Barrio *</label>
                        <input
                          type="text"
                          name="barrio"
                          value={formularioAdopcion.barrio}
                          onChange={onCambioFormulario}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
                          placeholder="Ej: Caballito"
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono *</label>
                        <input
                          type="text"
                          name="telefono"
                          value={formularioAdopcion.telefono}
                          onChange={onCambioFormulario}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
                          placeholder="Ej: +54 9 11 1234 5678"
                        />
                      </div>
                    </div>
                  )}

                  {pasoFormulario === 2 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">¿Tenés otras mascotas? *</label>
                        <select
                          name="tieneOtrasMascotas"
                          value={formularioAdopcion.tieneOtrasMascotas}
                          onChange={onCambioFormulario}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
                          autoFocus
                        >
                          <option value="">Seleccionar</option>
                          <option value="Sí">Sí</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">¿Tenés hijos? *</label>
                        <select
                          name="tieneHijos"
                          value={formularioAdopcion.tieneHijos}
                          onChange={onCambioFormulario}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
                        >
                          <option value="">Seleccionar</option>
                          <option value="Sí">Sí</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {pasoFormulario === 3 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de vivienda *</label>
                      <input
                        type="text"
                        name="tipoVivienda"
                        value={formularioAdopcion.tipoVivienda}
                        onChange={onCambioFormulario}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
                        placeholder="Ej: Departamento con balcón, casa con patio, etc."
                        autoFocus
                      />
                    </div>
                  )}

                  {pasoFormulario === 4 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ¿Por qué querés adoptar? (opcional)
                      </label>
                      <textarea
                        name="motivoAdopcion"
                        value={formularioAdopcion.motivoAdopcion}
                        onChange={onCambioFormulario}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 min-h-[140px] resize-y text-base focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
                        placeholder="Contanos brevemente tu motivación y cómo sería su hogar."
                        autoFocus
                      />
                    </div>
                  )}
                </div>

                {errorFormulario && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                    {errorFormulario}
                  </div>
                )}

                <div className="mt-8 pt-2 border-t border-gray-100 flex flex-col-reverse sm:flex-row gap-3 sm:items-center">
                  <div className="sm:flex-1 flex gap-3">
                    <button
                      type="button"
                      onClick={cerrarFormulario}
                      className="px-4 py-3 rounded-lg font-semibold border-2 border-gray-200 text-gray-700 bg-gray-50 hover:bg-gray-100 transition-all duration-200 text-base"
                      disabled={isEnviandoSolicitud}
                    >
                      Cancelar
                    </button>
                    {pasoFormulario > 0 && (
                      <button
                        type="button"
                        onClick={onAtrasFormulario}
                        className="px-4 py-3 rounded-lg font-semibold border-2 border-green-200 text-green-700 bg-green-50 hover:bg-green-100 transition-all duration-200 text-base"
                        disabled={isEnviandoSolicitud}
                      >
                        Atrás
                      </button>
                    )}
                  </div>

                  <div className="flex w-full sm:w-auto sm:justify-end sm:flex-1">
                    {pasoFormulario < TOTAL_PASOS_FORMULARIO - 1 ? (
                      <button
                        type="button"
                        className="w-full sm:w-auto bg-green-600 text-white px-5 py-3 rounded-lg font-semibold shadow-md hover:bg-green-700 transition-all duration-200 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={onContinuarFormulario}
                        disabled={isEnviandoSolicitud}
                      >
                        Continuar
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="w-full sm:min-w-[270px] bg-green-600 text-white px-5 py-3 rounded-lg font-semibold shadow-md hover:bg-green-700 transition-all duration-200 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isEnviandoSolicitud}
                      >
                        {isEnviandoSolicitud ? 'Enviando...' : 'Enviar por WhatsApp y marcar en trámite'}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}