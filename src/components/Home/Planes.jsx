import UseFrameMotion from "../hook_frame_motion/UseFrameMotion";

export default function Planes(){
  return(
      <section id="planes" className="relative container mx-auto py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Planes simples y transparentes
        </h2>
        <p className="text-xl text-gray-600 mb-12">
          Protección permanente + comunicación profesional + ayuda 
        </p>
        
        <div className="grid md:grid-cols-2 gap-8">
         
         <UseFrameMotion tipoAnimacion="slideRight" duracion={1} delay={0.5} waitForUserView={true}>
          <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-orange-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Plaquita QR</h3>
            <div className="text-4xl font-bold text-orange-600 mb-2">$7.000</div>
            <p className="text-gray-600 mb-6">Pago único</p>
            <ul className="space-y-3 text-left mb-8">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Placa QR de acero grabada con láser
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Identificación permanente
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                2 meses de membresía gratis
              </li>
            </ul>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-orange-800 font-medium mb-2">Durante tu membresía gratuita disfrutarás de:</p>
              <ul className="text-xs text-orange-700 space-y-1">
                <li>• Citas con veterinarios y peluqueros (con descuento)</li>
                <li>• Productos de petshop (con descuento)</li>
                <li>• Consejos personalizados con IA</li>
              </ul>
            </div>
            <a href="/register" className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors duration-200 font-semibold block">
              Comenzar ahora
            </a>
          </div>
          </UseFrameMotion>
          

          <UseFrameMotion tipoAnimacion="slideLeft" duracion={1} delay={0.5} waitForUserView={true}>
          <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-2xl p-8 shadow-xl relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-yellow-400 text-gray-800 px-4 py-1 rounded-full text-sm font-bold">Más popular</span>
            </div>
            <h3 className="text-2xl font-bold mb-4">Plan Mensual</h3>
            <div className="text-4xl font-bold mb-2">$3.000</div>
            <p className="text-orange-100 mb-6">Tu mensualidad representa donaciones a centros de rescate</p>
            <ul className="space-y-3 text-left mb-8">
            
              <li className="flex items-center">
                <span className="text-white mr-2">✓</span>
                Historial completo de tu mascota
              </li>
              <li className="flex items-center">
                <span className="text-white mr-2">✓</span>
                Actualización de datos sin cambiar chapita
              </li>
              <li className="flex items-center">
                <span className="text-white mr-2">✓</span>
                Citas con veterinarios (con descuento)
              </li>
              <li className="flex items-center">
                <span className="text-white mr-2">✓</span>
                Citas con peluqueros (con descuento)
              </li>
                <li className="flex items-center">
                <span className="text-white mr-2">✓</span>
                Consejos personalizados con IA para tu mascota
              </li>
              <li className="flex items-center">
                <span className="text-white mr-2">✓</span>
                Productos de petshop (con descuento)
              </li>
            </ul>
            <a href="/register" className="w-full bg-white text-orange-600 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-semibold block">
              Elegir Plan Mensual
            </a>
          </div>
          </UseFrameMotion>

        </div>
      </div>
    </section>
  )
}