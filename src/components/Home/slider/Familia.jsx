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
    imagenesReales: [milo, nicky, milo, nicky],
    imagen3D: milo3D,
    personalidad: ['Muy mimoso', 'Alegre', 'Juguetón', 'Extremadamente inteligente', 'Guardián'],
    historia:
      'Milo llegó en 2018 para enseñarme el verdadero significado de la resiliencia. Crecimos juntos, vi como el afrontaba cada desafio siempre con una sonrisa en el rostro. Superó una inundacion a finales de 2019, demostrando una astucia asombrosa. Es tan inteligente que domina comandos como sentarse, dar la mano y quedarse quieto, aunque su truco favorito siempre es "buscar" comida. Pasó de correr y cazar en el campo a ser el rey del sillón. Milo me enseño lo que es ser un compañero incondicional.',
    mensajeImpacto:
      'Su vida es prueba de que, con amor y una oportunidad, cualquier animal puede transformar su destino y sorprenderte con su capacidad.',
    llamadoAccion:
      'Sumate para que más compañeros brillantes como Milo encuentren un lugar seguro donde brillar.',
    posicionImagen: '50% 32%',
    posicionesImagenes: ['50% 32%', '50% 32%', '50% 32%', '50% 32%'],
    emoji: '',
    color: 'from-blue-50 to-blue-100',
    colorBorde: 'border-blue-200',
  },
  {
    nombre: 'Nicky',
    imagenReal: nicky,
    imagenesReales: [nicky, nicky, nicky, nicky],
    imagen3D: nicky3D,
    personalidad: ['Tierno', 'Independiente', 'Dormilón', 'Sociable con otros perros', 'Guardián'],
    historia:
      'Nicky llegó a la vida de mi novia en 2015, justo cuando ella más lo necesitaba. Venía de un pasado difícil, marcado por el rechazo y la falta de espacio donde incluso su propia madre lo desplazó. Al principio se mostraba distante, como si el concepto de "mimos" le resultara ajeno y la soledad fuera su único refugio seguro. Sin embargo, con paciencia y mucho cariño, aprendió a confiar y se transformó en un compañero amoroso, juguetón y siempre presente, de esos que con su silencio te hacen sentir que nunca estás solo.',
    mensajeImpacto:
      'Su historia nos enseña que incluso quienes parten del rechazo pueden florecer por completo cuando reciben una verdadera oportunidad.',
    llamadoAccion:
      'Tu apoyo puede ser el comienzo de una nueva vida para un animal que hoy se siente solo.',
    posicionImagen: '50% 30%',
    posicionesImagenes: ['50% 30%', '50% 30%', '50% 30%', '50% 30%'],
    emoji: '',
    color: 'from-purple-50 to-purple-100',
    colorBorde: 'border-purple-200',
  },
  {
    nombre: 'Rocco',
    imagenReal: rocco,
    imagenesReales: [rocco, rocco, rocco, rocco],
    imagen3D: rocco3D,
    personalidad: ['Tierno', 'Cariñoso', 'Compañero', 'Juguetón', 'Energético'],
    historia:
      'Rocco llegó en 2014 con apenas dos meses y se volvió el hilo conductor de mi historia. Estuvo en cada etapa, desde los juegos de mi niñez hasta los desafíos de hoy, siendo esa presencia constante que nunca falla. Con su energía inagotable y su espíritu sociable, tiene el don de transformar cualquier día común en uno especial solo con su presencia. Más que una mascota, es compañía pura y lealtad sin condiciones; él vio quién fui y en quién me convertí, creciendo a la par mía en cada paso.',
    mensajeImpacto:
      'Su vida demuestra que hay compañeros que no entienden de tiempos ni de etapas, sino de un amor que es para siempre.',
    llamadoAccion:
      'Ayudanos a conectar más vidas para que ningún perro se quede sin su testigo de crecimiento.',
    posicionImagen: '50% 34%',
    posicionesImagenes: ['50% 34%', '50% 34%', '50% 34%', '50% 34%'],
    emoji: '',
    color: 'from-yellow-50 to-yellow-100',
    colorBorde: 'border-yellow-200',
  },
  {
    nombre: 'Lorenzo',
    imagenReal: lore,
    imagenesReales: [lore, lore, lore, lore],
    imagen3D: lore3D,
    personalidad: ['Compañero', 'Mimoso', 'Amable', 'Educado', 'Fiel'],
    historia:
      'Lorenzo llegó en 2012 para cambiarlo todo. De aquel cachorro diminuto que dormía entre peluches, pasó a ser el "hijo perruno" que hoy cuida a mis padrinos y abuela, recibiendo a todos con un "regalo" en la boca y un amor incondicional.',
    mensajeImpacto:
      'Su historia nos enseña que los animales transforman vidas con gestos simples. Por eso, este espacio existe: para que más historias como la suya sean posibles.',
    llamadoAccion:
      'Muchos animales esperan esa oportunidad. Si nos unimos, podemos cambiar su realidad.',
    posicionImagen: '50% 24%',
    posicionesImagenes: ['50% 24%', '50% 24%', '50% 24%', '50% 24%'],
    emoji: '',
    color: 'from-green-50 to-green-100',
    colorBorde: 'border-green-200',
  },
];

const transicionVista = crearTransicionFrameMotion(0.32, 0);

export default function Familia({ onCerrar, manejarClickFondo }) {
  const [vista, setVista] = useState('lista');
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState(null);
  const [indiceFotoActual, setIndiceFotoActual] = useState(0);

  const abrirDetalle = (mascota) => {
    setMascotaSeleccionada(mascota);
    setIndiceFotoActual(0);
    setVista('detalle');
  };

  const volverALista = () => {
    setVista('lista');
    setMascotaSeleccionada(null);
    setIndiceFotoActual(0);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-1.5 sm:p-3 md:p-4 bg-black/50 backdrop-blur-sm pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-[max(0.25rem,env(safe-area-inset-top))]"
      onClick={manejarClickFondo}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-titulo-familia"
    >
      <div
        className="relative w-full max-w-4xl lg:max-w-5xl h-[min(96vh,96dvh)] max-h-[calc(100dvh-0.5rem)] flex flex-col overflow-hidden bg-white rounded-2xl shadow-2xl"
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
                  Tocá un personaje 3D para ver su foto real e historia
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
                className="p-4 sm:p-6 lg:p-8 flex flex-col flex-1 min-h-0 justify-center sm:justify-start"
                initial={animacionesPredefinidasFrameMotion.fade.initial}
                animate={animacionesPredefinidasFrameMotion.fade.animate}
                exit={animacionesPredefinidasFrameMotion.fade.exit}
                transition={transicionVista}
              >
                <UseFrameMotion tipoAnimacion="slideUp" duracion={0.42} delay={0.05} className="text-center mb-5 sm:mb-7">
                  <p className="text-sm sm:text-base text-gray-500 font-medium tracking-wide uppercase">
                    Historias reales
                  </p>
                  <p className="text-base sm:text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto mt-2">
                    Mascotas reales detrás de las animaciones 3D. Elegí un personaje para conocerlo.
                  </p>
                </UseFrameMotion>

                <div
                  className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 py-2 max-w-4xl mx-auto w-full"
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
                        className={`group relative rounded-2xl border-2 ${mascota.colorBorde} bg-gradient-to-br ${mascota.color} p-3 sm:p-4 shadow-md hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition-all w-full`}
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
                  Tocá un personaje para ver su foto real e historia
                </p>
              </motion.div>
            ) : (
              mascotaSeleccionada && (
                <motion.div
                  key={`vista-detalle-${mascotaSeleccionada.nombre}`}
                  className="p-3 sm:p-6 lg:p-8 flex flex-col flex-1 min-h-0"
                  initial={animacionesPredefinidasFrameMotion.slideLeft.initial}
                  animate={animacionesPredefinidasFrameMotion.slideLeft.animate}
                  exit={animacionesPredefinidasFrameMotion.slideLeft.exit}
                  transition={transicionVista}
                >
                  <UseFrameMotion
                    tipoAnimacion="fade"
                    duracion={0.4}
                    delay={0.08}
                    className="flex flex-col flex-1 min-h-0 gap-3 sm:gap-5"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 flex-1 min-h-0">
                      {/* Foto real: ocupa todo el alto disponible del detalle */}
                      <div
                        className={`relative rounded-2xl border-2 ${mascotaSeleccionada.colorBorde} bg-gradient-to-b from-gray-50 to-gray-100/90 overflow-hidden shadow-inner h-[40vh] sm:h-[56vh] lg:h-full min-h-[220px] lg:min-h-0 lg:col-span-7`}
                      >
                        <img
                          src={
                            mascotaSeleccionada.imagenesReales?.[indiceFotoActual] || mascotaSeleccionada.imagenReal
                          }
                          alt={`${mascotaSeleccionada.nombre} — foto`}
                          className="w-full h-full object-cover object-center"
                          style={{
                            objectPosition:
                              mascotaSeleccionada.posicionesImagenes?.[indiceFotoActual] ||
                              mascotaSeleccionada.posicionImagen ||
                              '50% 50%',
                          }}
                          loading="lazy"
                        />
                        {Array.isArray(mascotaSeleccionada.imagenesReales) &&
                          mascotaSeleccionada.imagenesReales.length > 1 && (
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center justify-center space-x-2 rounded-full px-3 py-2 bg-black/35 backdrop-blur-sm">
                              {mascotaSeleccionada.imagenesReales.map((_, i) => (
                                <button
                                  type="button"
                                  key={`${mascotaSeleccionada.nombre}-foto-overlay-${i}`}
                                  onClick={() => setIndiceFotoActual(i)}
                                  className={`h-2.5 w-2.5 rounded-full transition duration-200 ${
                                    i === indiceFotoActual
                                      ? 'scale-125 bg-white'
                                      : 'bg-white/50 hover:bg-white/80'
                                  }`}
                                  aria-label={`Ver foto ${i + 1} de ${mascotaSeleccionada.nombre}`}
                                />
                              ))}
                            </div>
                          )}
                      </div>

                      <div className="lg:col-span-5 flex flex-col">
                        <div className="rounded-2xl border border-orange-200 bg-white p-3.5 sm:p-5 shadow-sm h-full">
                          <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <span aria-hidden>📖</span>
                            Historia
                          </h4>
                          {mascotaSeleccionada.historia ? (
                            <>
                              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                                {mascotaSeleccionada.historia}
                              </p>
                              <p className="text-sm sm:text-base text-gray-700 leading-relaxed mt-3">
                                {mascotaSeleccionada.mensajeImpacto}
                              </p>
                              <p className="text-sm sm:text-base font-semibold text-orange-700 leading-relaxed mt-3 pt-3 border-t border-orange-100">
                                {mascotaSeleccionada.llamadoAccion}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                              Estamos preparando su historia completa. Muy pronto vas a poder conocer su recorrido.
                            </p>
                          )}
                        </div>
                      </div>
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
