import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UseFrameMotion, {
  animacionesPredefinidasFrameMotion,
  crearTransicionFrameMotion,
} from '../../hook_frame_motion/UseFrameMotion.jsx';

// import imagenes reales de las mascotas
import milo from '../../../assets/pets/miloR.jpg';
import nicky from '../../../assets/pets/nickyR.jpg';
import rocco from '../../../assets/pets/roccoR.jpg';
import lore from '../../../assets/pets/loreR.png';

// import pets 3d
import milo3D from '../../../assets/pets/modeloMilo1.png';
import nicky3D from '../../../assets/pets/nicky.png';
import rocco3D from '../../../assets/pets/rocco.png';
import lore3D from '../../../assets/pets/lore.png';

// Datos de las mascotas de Huellitas Seguras
const mascotasFamilia = [
  {
    nombre: 'Milo',
    imagenReal: milo,
    imagen3D: milo3D,
    personalidad: ['Muy mimoso', 'Alegre', 'Juguetón', 'Compañero', 'Guardián'],
    emoji: '🧠',
    color: 'from-blue-50 to-blue-100',
    colorBorde: 'border-blue-200',
  },
  {
    nombre: 'Nicky',
    imagenReal: nicky,
    imagen3D: nicky3D,
    personalidad: ['Tierno', 'Independiente', 'Dormilón', 'Sociable con otros perros', 'Guardián'],
    emoji: '😴',
    color: 'from-purple-50 to-purple-100',
    colorBorde: 'border-purple-200',
  },
  {
    nombre: 'Rocco',
    imagenReal: rocco,
    imagen3D: rocco3D,
    personalidad: ['Tierno', 'Cariñoso', 'Compañero', 'Juguetón', 'Energético'],
    emoji: '⚡',
    color: 'from-yellow-50 to-yellow-100',
    colorBorde: 'border-yellow-200',
  },
  {
    nombre: 'Lorenzo',
    imagenReal: lore,
    imagen3D: lore3D,
    personalidad: ['Compañero', 'Mimoso', 'Amable', 'Educado', 'Fiel'],
    emoji: '🏠',
    color: 'from-green-50 to-green-100',
    colorBorde: 'border-green-200',
  },
];

const transicionVista = crearTransicionFrameMotion(0.32, 0);

export default function Familia({ onCerrar, manejarClickFondo }) {
  const [vista, setVista] = useState('lista');
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState(null);

  const abrirDetalle = (mascota) => {
    setMascotaSeleccionada(mascota);
    setVista('detalle');
  };

  const volverALista = () => {
    setVista('lista');
    setMascotaSeleccionada(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-5 bg-black/50 backdrop-blur-sm pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-[max(0.5rem,env(safe-area-inset-top))]"
      onClick={manejarClickFondo}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-titulo-familia"
    >
      <div
        className="relative w-full max-w-4xl lg:max-w-5xl h-[min(90vh,90dvh)] max-h-[calc(100svh-1rem)] flex flex-col overflow-hidden bg-white rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del modal */}
        <div className="shrink-0 z-10 flex items-center justify-between gap-3 p-5 lg:p-6 bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
          <div className="flex items-center gap-3 min-w-0">
            {vista === 'detalle' && mascotaSeleccionada && (
              <button
                type="button"
                onClick={volverALista}
                className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full border border-orange-200 bg-white/90 text-orange-700 hover:bg-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400"
                aria-label="Volver a elegir mascota"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div className="min-w-0">
              <h2
                id="modal-titulo-familia"
                className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 truncate"
              >
                {vista === 'detalle' && mascotaSeleccionada ? (
                  <>
                    <span className="mr-2" aria-hidden>
                      {mascotaSeleccionada.emoji}
                    </span>
                    {mascotaSeleccionada.nombre}
                  </>
                ) : (
                  'Conoce nuestra familia'
                )}
              </h2>
              {vista === 'lista' && (
                <p className="text-sm text-gray-600 mt-0.5 hidden sm:block">
                  Tocá un personaje 3D para ver foto real y personalidad
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="shrink-0 p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-white"
            aria-label="Cerrar modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido con transición lista ↔ detalle (ocupa todo el alto disponible del panel) */}
        <div className="flex-1 min-h-0 flex flex-col overflow-y-auto overscroll-contain">
          <AnimatePresence mode="wait" initial={false}>
            {vista === 'lista' ? (
              <motion.div
                key="vista-lista"
                className="p-5 sm:p-6 lg:p-8 flex flex-col flex-1 min-h-0 justify-center sm:justify-start"
                initial={animacionesPredefinidasFrameMotion.fade.initial}
                animate={animacionesPredefinidasFrameMotion.fade.animate}
                exit={animacionesPredefinidasFrameMotion.fade.exit}
                transition={transicionVista}
              >
                <UseFrameMotion tipoAnimacion="slideUp" duracion={0.42} delay={0.05} className="text-center mb-6">
                  <p className="text-base sm:text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
                    Mascotas reales detrás de las animaciones 3D. Elegí un personaje para conocerlo.
                  </p>
                </UseFrameMotion>

                <div
                  className="flex flex-row flex-wrap justify-center items-end gap-4 sm:gap-6 lg:gap-8 py-2"
                  role="list"
                  aria-label="Personajes 3D, elegí uno para ver el detalle"
                >
                  {mascotasFamilia.map((mascota, index) => (
                    <UseFrameMotion
                      key={mascota.nombre}
                      tipoAnimacion="scale"
                      duracion={0.38}
                      delay={0.06 + index * 0.07}
                      className="flex flex-col items-center gap-2"
                    >
                      <button
                        type="button"
                        onClick={() => abrirDetalle(mascota)}
                        className={`group relative rounded-2xl border-2 ${mascota.colorBorde} bg-gradient-to-br ${mascota.color} p-3 sm:p-4 shadow-md hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition-shadow w-[140px] sm:w-[160px] lg:w-[180px]`}
                        aria-label={`Ver detalle de ${mascota.nombre}`}
                      >
                        <div className="aspect-square rounded-xl overflow-hidden bg-white/80 flex items-center justify-center">
                          <img
                            src={mascota.imagen3D}
                            alt=""
                            className="max-h-full max-w-full object-contain object-bottom scale-95 group-hover:scale-100 transition-transform duration-300"
                          />
                        </div>
                        <p className="mt-2 text-center text-sm sm:text-base font-semibold text-gray-800 flex items-center justify-center gap-1">
                          <span aria-hidden>{mascota.emoji}</span>
                          {mascota.nombre}
                        </p>
                      </button>
                    </UseFrameMotion>
                  ))}
                </div>

                <p className="text-center text-xs text-gray-500 mt-6 sm:hidden">
                  Tocá un personaje para ver foto real y personalidad
                </p>
              </motion.div>
            ) : (
              mascotaSeleccionada && (
                <motion.div
                  key={`vista-detalle-${mascotaSeleccionada.nombre}`}
                  className="p-5 sm:p-6 lg:p-8 flex flex-col flex-1 min-h-0"
                  initial={animacionesPredefinidasFrameMotion.slideLeft.initial}
                  animate={animacionesPredefinidasFrameMotion.slideLeft.animate}
                  exit={animacionesPredefinidasFrameMotion.slideLeft.exit}
                  transition={transicionVista}
                >
                  <UseFrameMotion
                    tipoAnimacion="fade"
                    duracion={0.4}
                    delay={0.08}
                    className="flex flex-col flex-1 min-h-0 gap-5"
                  >
                    {/* Foto real: se muestra completa (sin recortes agresivos) */}
                    <div
                      className={`rounded-2xl border-2 ${mascotaSeleccionada.colorBorde} bg-gradient-to-b from-gray-50 to-gray-100/90 overflow-hidden shadow-inner flex-1 min-h-[240px] flex flex-col`}
                    >
                      <div className="flex flex-1 min-h-[240px] max-h-[min(62vh,620px)] items-center justify-center w-full p-2 sm:p-4">
                        <img
                          src={mascotaSeleccionada.imagenReal}
                          alt={`${mascotaSeleccionada.nombre} — foto`}
                          className="max-h-[min(62vh,620px)] w-full h-auto object-contain object-center"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    <div
                      className={`shrink-0 rounded-2xl border ${mascotaSeleccionada.colorBorde} bg-gradient-to-br ${mascotaSeleccionada.color} p-4 sm:p-5`}
                    >
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span aria-hidden>✨</span>
                        Personalidad
                      </h4>
                      <ul className="space-y-2">
                        {mascotaSeleccionada.personalidad.map((caracteristica, idx) => (
                          <li key={idx} className="text-sm sm:text-base text-gray-800 flex items-start gap-2">
                            <span className="text-orange-500 mt-1 shrink-0">•</span>
                            <span>{caracteristica}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs sm:text-sm text-gray-600 text-center leading-relaxed mt-4 pt-4 border-t border-black/5">
                        <span className="font-semibold">💚</span> Esta personalidad inspira las animaciones de Huellitas
                        Seguras.
                      </p>
                    </div>
                  </UseFrameMotion>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
