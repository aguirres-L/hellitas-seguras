import UseFrameMotion from "../hook_frame_motion/UseFrameMotion";

export default function ImpactoSocial(){
    return(
        <section id="impacto-social" className="relative w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-16 px-4 overflow-hidden">
          {/* Elementos decorativos de fondo */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full opacity-30 -z-10" />
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full opacity-20 -z-10" />
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/5 rounded-full opacity-40 -z-10" />
          
          <div className="container mx-auto text-center max-w-4xl relative z-10">
        
        <UseFrameMotion tipoAnimacion="slideLeft" duracion={1} delay={0.5} waitForUserView={true}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Tu mensualidad salva vidas
            </h2>
          </UseFrameMotion>

          <UseFrameMotion tipoAnimacion="slideRight" duracion={1} delay={0.5} waitForUserView={true}>
            <p className="text-xl md:text-2xl mb-8 leading-relaxed opacity-90">
              <span className="font-bold">Parte de tu suscripción mensual</span> se destina directamente a fundaciones que rescatan y rehabilitan mascotas en situación de calle
            </p>
          </UseFrameMotion>

          <UseFrameMotion tipoAnimacion="slideUp" duracion={1} delay={0.8} waitForUserView={true}>
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 hover:bg-white/30 hover:scale-105 transition-all duration-300 transform group cursor-pointer">
                <div className="text-4xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">🐕</div>
                <h3 className="text-xl font-semibold mb-2">Proteges a tu mascota</h3>
                <p className="opacity-90">Identificación permanente con QR que nunca se pierde</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 hover:bg-white/30 hover:scale-105 transition-all duration-300 transform group cursor-pointer">
                <div className="text-4xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">❤️</div>
                <h3 className="text-xl font-semibold mb-2">Ayudas a mascotas abandonadas</h3>
                <p className="opacity-90">Tu mensualidad financia rescates y rehabilitación</p>
              </div>
            </div>
          </UseFrameMotion>
          </div>
        </section>
    )
}