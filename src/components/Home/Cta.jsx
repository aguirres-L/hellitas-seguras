export default function Cta(){
    return(
        <section className="relative bg-gradient-to-r from-orange-500 to-pink-500 text-white py-16 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Listo para proteger a tu mascota y ayudar a otras?
          </h2>
          <p className="text-xl md:text-2xl mb-8 leading-relaxed opacity-90">
            Cada peso que inviertes en Huellitas Seguras no solo protege a tu mejor amigo, sino que también da esperanza a una mascota que necesita un hogar
          </p>
          <a 
            href="/register" 
            className="bg-white text-orange-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold text-lg inline-block"
          >
            Proteger mi mascota ahora
          </a>
        </div>
      </section>
 
    )
}