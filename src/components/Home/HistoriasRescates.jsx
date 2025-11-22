import React, { useState, useEffect } from 'react';
import { getAllDataCollection } from '../../data/firebase/firebase';

// Este componente no recibe props
export default function HistoriasRescates() {
  const [historiasRescate, setHistoriasRescate] = useState([]);
  const [isCargando, setIsCargando] = useState(true);
  const [error, setError] = useState(null);
  const [noticiaSeleccionada, setNoticiaSeleccionada] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

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


  // Función para abrir WhatsApp con mensaje personalizado
  const infoAdoptar = (mascota = null) => {
    // Número de WhatsApp (reemplaza con el número real de tu organización)
    const numeroWhatsApp = '5491112345678'; // Formato: código país + código área + número
    
    // Mensaje base
    let mensaje = '¡Hola! Estoy interesado en adoptar una mascota de Patitas que Ayudan. ';
    
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
                {historiasRescate.map((noticia) => (
            <article 
              key={noticia.id} 
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
                ))}
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

          {/* Card de la fundación */}
          <div className="bg-gradient-to-br from-orange-50 to-green-50 rounded-3xl p-8 md:p-12 shadow-xl border border-orange-100">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Información de la fundación */}
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mr-4">
                    <span className="text-white text-2xl">🐾</span>
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-gray-800">Patitas que Ayudan</h4>
                    <p className="text-orange-600 font-medium">Fundación de Rescate Animal</p>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Desde 2020, trabajamos incansablemente para rescatar, rehabilitar y encontrar hogares 
                  llenos de amor para mascotas abandonadas. Cada historia de éxito es nuestra motivación 
                  para seguir salvando vidas.
                </p>

                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    +500 mascotas rescatadas
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    +300 adopciones exitosas
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    24/7 atención veterinaria
                  </div>
                </div>

                {/* Redes sociales */}
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600 font-medium">Síguenos:</span>
                  <div className="flex space-x-3">
                    <a 
                      href="https://instagram.com/patitasqueayudan" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-200"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z"/>
                      </svg>
                    </a>
                    <a 
                      href="https://facebook.com/patitasqueayudan" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-200"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                    <a 
                      href="https://wa.me/5491112345678" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-200"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* CTA de adopción */}
              <div className="text-center md:text-right">
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h5 className="text-xl font-bold text-gray-800 mb-4">
                    ¿Listo para cambiar una vida?
                  </h5>
                  <p className="text-gray-600 mb-6">
                    Cada adopción es una historia de amor
                  </p>
                  <button 
                    onClick={() => infoAdoptar()}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    ¡Adopta una mascota! 🐾
                  </button>
                  <p className="text-xs text-gray-500 mt-3">
                    Proceso 100% gratuito y responsable
                  </p>
                </div>
              </div>
            </div>
          </div>
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