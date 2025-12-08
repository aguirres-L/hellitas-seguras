import React, { useState, useEffect } from 'react';
import { getAllDataCollection, obtenerDetalleOng } from '../../data/firebase/firebase';
import UseFrameMotion from '../hook_ui_components/UseFrameMotion';

// Este componente no recibe props
export default function HistoriasRescates() {
  const [historiasRescate, setHistoriasRescate] = useState([]);
  const [isCargando, setIsCargando] = useState(true);
  const [error, setError] = useState(null);
  const [noticiaSeleccionada, setNoticiaSeleccionada] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  
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

  // Cargar historias desde Firebase
  useEffect(() => {
    const cargarHistorias = async () => {
      setIsCargando(true);
      setError(null);
      
      try {
        const todasLasHistorias = await getAllDataCollection('historias-de-rescates');
        
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
            estadoOriginal: historia.estado,
            contacto: historia.contacto,
            ubicacion: historia.ubicacion
          };
        });

        // Ordenar por fecha de creación (más recientes primero)
        historiasTransformadas.sort((a, b) => {
          const fechaA = todasLasHistorias.find(h => h.id === a.id)?.fechaCreacion;
          const fechaB = todasLasHistorias.find(h => h.id === b.id)?.fechaCreacion;
          
          const fechaAObj = fechaA?.seconds 
            ? new Date(fechaA.seconds * 1000)
            : new Date(fechaA || 0);
          const fechaBObj = fechaB?.seconds 
            ? new Date(fechaB.seconds * 1000)
            : new Date(fechaB || 0);
          
          return fechaBObj - fechaAObj;
        });

        setHistoriasRescate(historiasTransformadas);
      } catch (err) {
        console.error('Error al cargar historias:', err);
        setError('Error al cargar las historias de rescates. Por favor, intenta recargar la página.');
      } finally {
        setIsCargando(false);
      }
    };

    cargarHistorias();
  }, []);

  const abrirNoticia = (noticia) => {
    setNoticiaSeleccionada(noticia);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setNoticiaSeleccionada(null);
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

  return (
    <section className="relative container mx-auto md:py-20 py-12 mt-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            Historias de rescates
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Conoce las increíbles transformaciones de nuestras mascotas rescatadas. 
            Cada historia es una prueba de que el amor y la dedicación pueden cambiar vidas.
          </p>
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
            {historiasRescate.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Aún no hay historias de rescates disponibles
                </p>
                <p className="text-gray-600">
                  Las historias de rescates aparecerán aquí cuando sean creadas.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {historiasRescate.map((noticia, indice) => {
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
                        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
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
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              noticia.estado === false 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {noticia.estado ? 'Adoptado' : 'Disponible'}
                            </span>
                          </div>
                          <div className="absolute bottom-4 left-4">
                            <span className="inline-block bg-black/70 text-white text-xs px-2 py-1 rounded">
                              {noticia.fechaRescate}
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
      {mostrarModal && noticiaSeleccionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      noticiaSeleccionada.estado === true 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {noticiaSeleccionada.estado === true ? 'Adoptado' : 'Disponible'}
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
                </div>
              </div>

              {/* Footer del modal */}
             
            { noticiaSeleccionada.estado === false ? (
              <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <button onClick={() => infoAdoptar(noticiaSeleccionada)} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                  ¡Quiero adoptar una mascota como esta!
                </button>
              </div>
            ):(
              ''
            )}

            </div>
          </div>
        </div>
      )}
    </section>
  );
}