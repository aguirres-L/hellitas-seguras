import React from 'react';
import logo11 from '../../assets/modeloMilo1.png';
import { useNavigate } from 'react-router-dom';

// Este componente no recibe props
const About = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header con branding consistente */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex cursor-pointer items-center justify-center space-x-2 sm:space-x-3 mb-4">
            <div onClick={() => navigate('/')} className="h-8 w-8  sm:h-10 sm:w-10 lg:h-12 lg:w-12 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
            <img src={logo11}  alt=" Huellitas Segurass" />
            </div>
            <h1 className="text-2xl  font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              Huellitas Seguras
            </h1>
          </div>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4 mt-10">
            Más que una plataforma de servicios veterinarios y de peluquería. 
            Somos un movimiento solidario que conecta el cuidado de mascotas con el rescate de animales.
          </p>
        </div>

        {/* Sección principal */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <div className="prose max-w-none">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
              Nuestro Objetivo
            </h2>
            
            <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
              En <strong>Huellitas Seguras</strong>, creemos que cada mascota merece una vida digna. 
              Por eso, hemos creado un modelo de negocio único donde <span className="font-bold text-orange-600">un porcentaje de todos nuestros ingresos por mensualidad </span>             se destina directamente a fundaciones que rescatan y rehabilitan mascotas en situación de calle.
            </p>

            {/* Modelo de impacto */}
         
            <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">Nuestros Servicios</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h4 className="text-lg sm:text-xl font-semibold mb-3 text-blue-600">🐕 Para Dueños de Mascotas</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start text-sm sm:text-base">
                    <span className="text-green-500 mr-2 mt-0.5">✓</span>
                    Chapitas con QR para identificación permanente
                  </li>
                  <li className="flex items-start text-sm sm:text-base">
                    <span className="text-green-500 mr-2 mt-0.5">✓</span>
                    Búsqueda de veterinarios y peluqueros certificados
                  </li>
                  <li className="flex items-start text-sm sm:text-base">
                    <span className="text-green-500 mr-2 mt-0.5">✓</span>
                    Programación de citas en línea
                  </li>
                  <li className="flex items-start text-sm sm:text-base">
                    <span className="text-green-500 mr-2 mt-0.5">✓</span>
                    Historial médico digital completo
                  </li>
                  <li className="flex items-start text-sm sm:text-base">
                    <span className="text-green-500 mr-2 mt-0.5">✓</span>
                    Notificaciones de recordatorios de vacunas
                  </li>
                </ul>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h4 className="text-lg sm:text-xl font-semibold mb-3 text-purple-600">👨‍⚕️ Para Profesionales</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start text-sm sm:text-base">
                    <span className="text-green-500 mr-2 mt-0.5">✓</span>
                    Plataforma de gestión de pacientes
                  </li>
                  <li className="flex items-start text-sm sm:text-base">
                    <span className="text-green-500 mr-2 mt-0.5">✓</span>
                    Sistema de agendamiento inteligente
                  </li>
                  <li className="flex items-start text-sm sm:text-base">
                    <span className="text-green-500 mr-2 mt-0.5">✓</span>
                    Historiales médicos digitales
                  </li>
                  <li className="flex items-start text-sm sm:text-base">
                    <span className="text-green-500 mr-2 mt-0.5">✓</span>
                    Sistema de calificaciones y reseñas
                  </li>
                  <li className="flex items-start text-sm sm:text-base">
                    <span className="text-green-500 mr-2 mt-0.5">✓</span>
                    Reportes de impacto social generado
                  </li>
                </ul>
              </div>
            </div>

            {/* Impacto social detallado */}
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">Nuestro Objetivo</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <div>
                  <h4 className="text-lg sm:text-xl font-semibold mb-3">🐾 Rescate y Rehabilitación</h4>
                  <p className="opacity-90 mb-4 text-sm sm:text-base">
                    Trabajamos con fundaciones verificadas que rescatan mascotas de la calle, 
                    les brindan atención veterinaria, rehabilitación y buscan hogares permanentes.
                  </p>
                  <ul className="space-y-2 opacity-90 text-sm sm:text-base">
                    <li>• Rescate de emergencias</li>
                    <li>• Tratamientos veterinarios</li>
                    <li>• Alimentación y cuidados</li>
                    <li>• Proceso de adopción responsable</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-semibold mb-3">📊 Transparencia Total</h4>
                  <p className="opacity-90 mb-4 text-sm sm:text-base">
                    Publicamos mensualmente reportes detallados de cómo se utilizan las donaciones, 
                    incluyendo fotos y testimonios de las mascotas rescatadas.
                  </p>
                  <ul className="space-y-2 opacity-90 text-sm sm:text-base">
                    <li>• Reportes mensuales de impacto</li>
                    <li>• Fotos de mascotas rescatadas</li>
                    <li>• Testimonios de fundaciones</li>
                    <li>• Auditorías independientes</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Fundaciones aliadas */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">Fundaciones Aliadas</h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Trabajamos con organizaciones sin fines de lucro verificadas que comparten nuestra 
                misión de mejorar la vida de las mascotas. Cada fundación pasa por un proceso 
                riguroso de verificación antes de recibir donaciones.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">🏥</div>
                  <h4 className="font-semibold text-sm sm:text-base">Rescate Animal</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Emergencias y rescates</p>
                </div>
                <div className="bg-pink-50 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">🏠</div>
                  <h4 className="font-semibold text-sm sm:text-base">Hogares Temporales</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Cuidado y rehabilitación</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center sm:col-span-2 lg:col-span-1">
                  <div className="text-2xl mb-2">❤️</div>
                  <h4 className="font-semibold text-sm sm:text-base">Adopciones</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Encuentro de hogares</p>
                </div>
              </div>
            </div>

            {/* Call to action */}
            <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg sm:rounded-xl p-4 sm:p-6 text-center">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">Únete a Nuestra Misión</h3>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                Cada chapita que compres, cada servicio que contrates, 
                contribuye directamente al rescate y bienestar de mascotas en situación de calle.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/register" 
                  className="inline-block bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
                >
                  Registrarse Ahora
                </a>
                <a 
                  href="mailto:info@Huellitas Seguras.com" 
                  className="inline-block bg-gray-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all duration-200 text-sm sm:text-base"
                >
                  Contactar
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer de contacto */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
          <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">Contacto</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                ¿Tienes preguntas sobre nuestro modelo solidario o quieres que tu fundación 
                sea parte de nuestro programa de donaciones?
              </p>
              <p className="text-gray-600 text-sm sm:text-base">
                <strong>Email:</strong> 
                <a href="mailto:info@Huellitas Seguras.com" className="text-blue-500 hover:text-blue-600 ml-1">
                  info@Huellitas Seguras.com
                </a>
              </p>
            </div>
            <div className="text-center lg:text-right">
              <p className="text-gray-600 text-sm sm:text-base">
                <strong>Síguenos en redes sociales</strong><br/>
                Para ver actualizaciones sobre nuestros rescates y el impacto de tus donaciones.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 