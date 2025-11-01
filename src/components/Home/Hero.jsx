import SliderHome from "./slider/SliderHome";
import HistoriasRescates from "./HistoriasRescates.jsx";
import ImpactoSocial from "./ImpactoSocial.jsx";
import HowItWorks from "./HowItWorks.jsx";
import Planes from "./Planes.jsx";
import ProfessionalsSection from "./ProfessionalsSection.jsx";

export default function Hero(){
    return(
        <section className="relative container mx-auto md:py-20 py-12 mt-6 px-4 text-center">
        <div className="max-w-5xl mx-auto">

          <h1 className="text-4xl mb-6 md:text-5xl font-bold text-gray-800 leading-tight">
            <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              Chapitas QR
            </span>{' '}
            que salvan vidas, Identifica a tu mascota y{' '}
            <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              financia rescates
            </span>{' '}
           
          </h1>
       
        </div>
        
      
         
        <div className="max-w-5xl mx-auto">
          <SliderHome/>

          <HowItWorks/>
              {/* Planes y precios */}
      <Planes />
  {/* ImpactoSocial fuera del contenedor para que ocupe todo el ancho */}
  <div className="w-screen mb-10 relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
          <ImpactoSocial/>
        </div>

          <div className="flex flex-col mt-10 sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
            <a 
              href="/register" 
              className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-4 rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold text-lg"
            >
              Registrate y crea el perfil digital de tu mascota
            </a>
          {/*   <a 
              href="#how-it-works" 
              className="border-2 border-orange-500 text-orange-600 px-8 py-4 rounded-lg hover:bg-orange-50 transition-all duration-200 transform hover:scale-105 font-semibold text-lg"
            >
              Ver cómo funciona
            </a> */}
          </div>

       
          
          {/* Sección para profesionales - Más visible y atractiva */}
          {/* <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mt-12 mb-8 border border-blue-100"> */}
      
          
                     {/* Precio destacado */}
      {/*      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl max-w-md mx-auto mb-8">
             <div className="text-center">
               <p className="text-sm text-gray-600 mb-2">Chapita de acero grabada con láser</p>
               <div className="text-3xl font-bold text-orange-600 mb-2">$7.000</div>
               <p className="text-sm text-gray-500">Identificación permanente incluida</p>
             </div>
           </div> */}

           <HistoriasRescates/>

          <ProfessionalsSection />


          
        </div>
      </section>
    )
}