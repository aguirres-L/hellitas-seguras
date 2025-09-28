export default function Beneficios(){
    return(
        <section id="beneficios" className="relative bg-gray-50 py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Beneficios para profesionales
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Para Veterinarios</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Acceso a perfiles de mascotas por QR ID
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Actualizar historial de vacunas
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Historial médico completo
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Para Peluqueros</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Acceso a perfiles de mascotas por QR ID
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Actualizar información de cuidados
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Historial de servicios realizados
                </li>
              </ul>
            </div>
          </div>
          
          {/* Call to Action para profesionales */}
          <div className="text-center mt-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              ¿Eres veterinario o peluquero?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Únete a nuestra red de profesionales y ayuda a mantener actualizada la información de las mascotas. 
              Accede a perfiles completos y actualiza información médica y de cuidados.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <a 
                href="/register-profesional" 
                className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-3 rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
              >
                Registrarse como Profesional
              </a>
              <a 
                href="/login-profesional" 
                className="border-2 border-orange-500 text-orange-600 px-8 py-3 rounded-lg hover:bg-orange-50 transition-all duration-200 transform hover:scale-105 font-semibold"
              >
                Acceder como Profesional
              </a>
            </div>
          </div>
        </div>
      </section>
    )
}