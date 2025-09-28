import React, { useState } from 'react';

// Este componente no recibe props
const historiasRescate = [
  {
    id: 1,
    imagen: 'https://media.a24.com/p/5ea1366ab57e090f86abf5037da6b60e/adjuntos/296/imagenes/009/462/0009462750/533x300/smart/batata-perrita-rescatadajpg.jpg',
    titulo: 'Luna encontró su hogar después de 2 años en la calle',
    descripcion: 'Esta hermosa perrita fue rescatada en condiciones críticas de desnutrición y abandono. Su transformación es un testimonio del poder del amor y la dedicación.',
    nombreMascota: 'Luna',
    edad: '3 años',
    raza: 'Mezcla',
    historia: 'Luna fue encontrada desnutrida y con heridas en las patas en las afueras de la ciudad. Después de 6 meses de cuidados veterinarios intensivos, rehabilitación física y mucho amor, finalmente encontró una familia que la adora. Hoy es una perrita feliz que disfruta de largos paseos y mimos interminables.',
    fechaRescate: '15 de Marzo, 2024',
    estado:false,
    tiempoRescate: '6 meses'
  },
  {
    id: 2,
    imagen: 'https://estaticos.elcolombiano.com/binrepository/580x435/0c0/580d365/none/11101/BXVN/whatsapp-image-2021-05-07-at-6-11-50-pm_37681142_20210507183811.jpg',
    titulo: 'Max: De la desesperación a la felicidad',
    descripcion: 'Un perro abandonado en un parque industrial encontró una segunda oportunidad gracias al trabajo incansable de nuestro equipo de rescate.',
    nombreMascota: 'Max',
    edad: '2 años',
    raza: 'Golden Retriever',
    historia: 'Max fue rescatado de un parque industrial donde vivía solo, buscando comida entre la basura. Sufría de ansiedad severa y desconfiaba de los humanos. Con paciencia y técnicas de socialización, Max aprendió a confiar nuevamente. Ahora es el compañero inseparable de una familia con niños, demostrando que el amor puede curar las heridas más profundas.',
    fechaRescate: '22 de Febrero, 2024',
    estado:false,
    tiempoRescate: '4 meses'
  },
  {
    id: 3,
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRCt6ca2YOOyWETvQNkHid8qOO0CLcQMSgwRkIbZdH7dWasJ1NDafKyHAJhh5XFi5HSO0',
    titulo: 'Bella: Una transformación milagrosa',
    descripcion: 'Esta gatita demostró que el amor todo lo puede, superando problemas respiratorios graves para convertirse en una mascota saludable.',
    nombreMascota: 'Bella',
    edad: '1 año',
    raza: 'Gato doméstico',
    historia: 'Bella llegó con problemas respiratorios graves que los veterinarios consideraron críticos. Requirió cirugía de emergencia y cuidados intensivos durante semanas. Los veterinarios trabajaron incansablemente y hoy es una gatita saludable y juguetona que ronronea constantemente. Su caso inspiró a muchos a no rendirse ante las dificultades.',
    fechaRescate: '8 de Enero, 2024',
    estado:true,
    tiempoRescate: '3 meses'
  },
  {
    id: 4,
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLouz96v0Y9K9pbDjAg7jpusVn8aLa58YMOXsixcLv5M4gUVwNb9w5A5Ttxbj2P6RAou8',
    titulo: 'Rocky: El guerrero que nunca se rindió',
    descripcion: 'Con solo 3 patas, Rocky demostró que las limitaciones físicas no son obstáculo para la felicidad y el amor.',
    nombreMascota: 'Rocky',
    edad: '4 años',
    raza: 'Pitbull',
    historia: 'Rocky llegó con una pata gravemente herida que requirió amputación. A pesar del trauma, su espíritu nunca se quebró. Aprendió a moverse con agilidad y se convirtió en un ejemplo de resiliencia. Su nueva familia lo adora por su valentía y determinación.',
    fechaRescate: '10 de Diciembre, 2023',
    estado:true,
    tiempoRescate: '5 meses'
  },
  {
    id: 5,
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDZNEXEh1jSi3WbN00yZm2pG9iIXRN-IAMmit_R2kT382jQMSMJPTUF2wBtI34uPS5ooI',
    titulo: 'Mia: La princesa que conquistó corazones',
    descripcion: 'Esta pequeña gatita sorda demostró que las discapacidades no son limitaciones para encontrar amor y felicidad.',
    nombreMascota: 'Mia',
    edad: '2 años',
    raza: 'Gato blanco',
    historia: 'Mia nació sorda, pero eso nunca la detuvo. Aprendió a comunicarse a través de vibraciones y gestos. Su familia adoptiva se adaptó perfectamente a sus necesidades especiales, creando señales visuales para comunicarse. Hoy es una gatita feliz que disfruta de la vida al máximo.',
    fechaRescate: '5 de Noviembre, 2023',
    estado:true,
    tiempoRescate: '2 meses'
  },
  {
    id: 6,
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSV_QoaS0Qf0DEr3k9Qt3BlJ0-P8ii9dkIEx3C4Xxsjcv7bAx4AesGrCavpd0FtjwrCqUE',
    titulo: 'Thor: El gigante gentil que encontró su lugar',
    descripcion: 'Este perro grande intimidaba por su tamaño, pero su corazón era más grande que sus miedos.',
    nombreMascota: 'Thor',
    edad: '5 años',
    raza: 'Gran Danés',
    historia: 'Thor fue abandonado por su tamaño intimidante. Muchos lo rechazaban sin conocer su naturaleza gentil. Finalmente, una familia con experiencia en perros grandes lo adoptó. Hoy es el guardián más amoroso de la casa, demostrando que el tamaño no define el corazón.',
    fechaRescate: '20 de Octubre, 2023',
    estado:true,
    tiempoRescate: '7 meses'
  }
];

export default function HistoriasRescates() {
  const [noticiaSeleccionada, setNoticiaSeleccionada] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

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
    console.log(mascota,'mascota');
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

        {/* Grid de noticias */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {historiasRescate.map((noticia) => (
            <article 
              key={noticia.id} 
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
              onClick={() => abrirNoticia(noticia)}
            >
              {/* Imagen */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={noticia.imagen}
                  alt={noticia.titulo}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
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
                    className="w-full h-80 object-contain rounded-lg"
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      noticiaSeleccionada.estado === 'Adoptada' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {noticiaSeleccionada.estado}
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