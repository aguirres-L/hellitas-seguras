// import imagenes reales de las mascotas 
import milo from "../../../assets/pets/miloR.jpg"
import nicky from "../../../assets/pets/nickyR.jpg"
import rocco from "../../../assets/pets/roccoR.jpg"
import lore from "../../../assets/pets/loreR.png"

// import pets 3d
import milo3D from "../../../assets/pets/modeloMilo1.png"
import nicky3D from "../../../assets/pets/nicky.png"
import rocco3D from "../../../assets/pets/rocco.png"
import lore3D from "../../../assets/pets/lore.png"

// Datos de las mascotas de Huellitas Seguras
const mascotasFamilia = [
  {
    nombre: "Milo",
    imagenReal: milo,
    imagen3D: milo3D,
    personalidad: [
      "Muy mimoso",
      "Alegre",
      "Juguetón",
      "Compañero",
      "Guardián"
    ],
    emoji: "🧠",
    color: "from-blue-50 to-blue-100",
    colorBorde: "border-blue-200"
  },
  {
    nombre: "Nicky",
    imagenReal: nicky,
    imagen3D: nicky3D,
    personalidad: [
      "Tierno",
      "Independiente",
      "Dormilón",
      "Sociable con otros perros",
      "Guardián"
    ],
    emoji: "😴",
    color: "from-purple-50 to-purple-100",
    colorBorde: "border-purple-200"
  },
  {
    nombre: "Rocco",
    imagenReal: rocco,
    imagen3D: rocco3D,
    personalidad: [
      "Tierno",
      "Cariñoso",
      "Compañero",
      "Juguetón",
      "Energético"
    ],
    emoji: "⚡",
    color: "from-yellow-50 to-yellow-100",
    colorBorde: "border-yellow-200"
  },
  {
    nombre: "Lorenzo",
    imagenReal: lore,
    imagen3D: lore3D,
    personalidad: [
      "Compañero",
      "Mimoso",
      "Amable",
      "Educado",
      "Fiel"
    ],
    emoji: "🏠",
    color: "from-green-50 to-green-100",
    colorBorde: "border-green-200"
  }
];

export default function Familia({ onCerrar, manejarClickFondo }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={manejarClickFondo}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-titulo-familia"
    >
      <div className="relative w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
        {/* Header del modal */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 lg:p-8 bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
          <h2 
            id="modal-titulo-familia"
            className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-800"
          >
            Conoce nuestra familia
          </h2>
          <button
            onClick={onCerrar}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-white"
            aria-label="Cerrar modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="p-6 lg:p-8 xl:p-10 space-y-6 lg:space-y-8">
          {/* Introducción */}
          <div className="text-center space-y-2 lg:space-y-3">
            <p className="text-lg lg:text-xl xl:text-2xl text-gray-700 leading-relaxed">
              Te presentamos a las mascotas reales detrás de las animaciones 3D de Huellitas Seguras.
            </p>
            <p className="text-base lg:text-lg xl:text-xl text-gray-600">
              Cada personaje está inspirado en la personalidad única de nuestros compañeros de cuatro patas.
            </p>
          </div>

          {/* Grid de mascotas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 lg:gap-6 xl:gap-8">
            {mascotasFamilia.map((mascota, index) => (
              <div
                key={mascota.nombre}
                className={`bg-gradient-to-br ${mascota.color} rounded-xl lg:rounded-2xl border ${mascota.colorBorde} p-4 lg:p-6 xl:p-8 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]`}
              >
                {/* Header de la mascota */}
                <div className="flex items-center gap-3 lg:gap-4 mb-4 lg:mb-6">
                  <span className="text-3xl lg:text-4xl xl:text-5xl">{mascota.emoji}</span>
                  <h3 className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800">{mascota.nombre}</h3>
                </div>

                {/* Imágenes: Real vs 3D */}
                <div className="grid grid-cols-2 gap-3 lg:gap-4 xl:gap-6 mb-4 lg:mb-6">
                  {/* Imagen real */}
                  <div className="relative rounded-lg lg:rounded-xl overflow-hidden bg-white shadow-sm">
                    <img
                      src={mascota.imagenReal}
                      alt={`${mascota.nombre} - Foto real`}
                      className="w-full h-32 lg:h-48 xl:h-56 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs lg:text-sm px-2 py-1 lg:py-2 text-center">
                      Real
                    </div>
                  </div>

                  {/* Imagen 3D */}
                  <div className="relative rounded-lg lg:rounded-xl overflow-hidden bg-white shadow-sm">
                    <img
                      src={mascota.imagen3D}
                      alt={`${mascota.nombre} - Animación 3D`}
                      className="w-full h-32 lg:h-48 xl:h-56 object-contain bg-gradient-to-br from-gray-50 to-gray-100"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs lg:text-sm px-2 py-1 lg:py-2 text-center">
                      3D
                    </div>
                  </div>
                </div>

                {/* Personalidad */}
                <div className="bg-white/70 rounded-lg lg:rounded-xl p-3 lg:p-4 xl:p-5 border border-white/50">
                  <h4 className="text-sm lg:text-base xl:text-lg font-semibold text-gray-700 mb-2 lg:mb-3 flex items-center gap-1 lg:gap-2">
                    <span className="text-lg lg:text-xl">✨</span>
                    Personalidad
                  </h4>
                  <ul className="space-y-1 lg:space-y-2">
                    {mascota.personalidad.map((caracteristica, idx) => (
                      <li key={idx} className="text-xs lg:text-sm xl:text-base text-gray-600 flex items-start gap-2">
                        <span className="text-orange-500 mt-0.5 lg:mt-1">•</span>
                        <span>{caracteristica}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Mensaje final */}
          <div className="mt-4 lg:mt-6 p-4 lg:p-6 bg-orange-50 rounded-lg lg:rounded-xl border border-orange-100">
            <p className="text-sm lg:text-base xl:text-lg text-gray-700 text-center">
              <span className="font-semibold">💚</span> Estas son las personalidades que inspiran cada animación en nuestra plataforma, 
              haciendo que cada experiencia sea única y auténtica.
            </p>
          </div>
        </div>

        {/* Footer del modal */}
        <div className="sticky bottom-0 p-6 lg:p-8 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
          <button
            onClick={onCerrar}
            className="w-full px-6 lg:px-8 py-3 lg:py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-base lg:text-lg rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}