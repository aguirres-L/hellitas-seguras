import UseFrameMotion from "../hook_ui_components/UseFrameMotion";

export default function HowItWorks(){
  return(
      <section id="how-it-works" className="relative container mx-auto py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          ¿Cómo funciona?
        </h2>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Protección completa para tu mascota 
        </p>
        <div className="grid md:grid-cols-3 gap-8">
   
          {/* Paso 1 */}
          <UseFrameMotion tipoAnimacion="slideRight" duracion={1} delay={0.5} waitForUserView={true}>
          <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-2xl font-bold text-white">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Regístrate como dueño</h3>
            <p className="text-gray-600 leading-relaxed">
              Crea tu cuenta de usuario para acceder a la plataforma y gestionar el perfil de tu mascota.
            </p>
          </div>
          </UseFrameMotion>

          <UseFrameMotion tipoAnimacion="slideDown" duracion={1} delay={0.5} waitForUserView={true}>
          {/* Paso 2 */}
          <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-2xl font-bold text-white">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Crea el perfil de tu mascota</h3>
            <p className="text-gray-600 leading-relaxed">
              Registra los datos completos de tu mascota: fotos, información médica, vacunas y datos de contacto.
            </p>
          </div>
          </UseFrameMotion>

          <UseFrameMotion tipoAnimacion="slideLeft" duracion={1} delay={0.5} waitForUserView={true}>
          {/* Paso 3 */}
          <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-2xl font-bold text-white">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Solicita tu chapita QR</h3>
            <p className="text-gray-600 leading-relaxed">
              Desde el perfil de tu mascota, solicita la chapita de acero grabada con láser que contendrá toda su información.
            </p>
          </div>
          </UseFrameMotion>
     
     
        </div>
      </div>
    </section>
  )
}