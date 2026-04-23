import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import SliderUseFrameMotion from '../../hook_frame_motion/SliderUseFrameMotion';
import InnerImageGallery from './InnerImageGallery';
import { datosSlides } from './slider-home.data';
import Familia from './Familia';

// Base: debe coincidir sonda/visible. La sonda mide la altura natural; el visible añade scroll.
const clasesBloqueTextoMóvilBase =
  'box-border flex w-full min-w-0 max-w-full flex-col px-4 pb-3 pt-5 sm:px-7 sm:pb-4 sm:pt-6';
const clasesBloqueTextoMóvil = `${clasesBloqueTextoMóvilBase} overflow-y-auto [scrollbar-gutter:stable]`;

const iconoCaracterística = (índice) =>
  índice === 0 ? '✨' : índice === 1 ? '✅' : índice === 2 ? '🩺' : '🤝';

function ModalFamilia({ isAbierto, onCerrar }) {
  useEffect(() => {
    const onEscape = (e) => {
      if (e.key === 'Escape' && isAbierto) onCerrar();
    };
    if (isAbierto) {
      document.addEventListener('keydown', onEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onEscape);
      document.body.style.overflow = '';
    };
  }, [isAbierto, onCerrar]);

  const onFondo = (e) => {
    if (e.target === e.currentTarget) onCerrar();
  };

  if (!isAbierto) return null;
  return <Familia onCerrar={onCerrar} manejarClickFondo={onFondo} />;
}

function CuerpoSlideMóvil({ datos, nSlide, nTotal, mostrarCta, onCta }) {
  return (
    <div className="flex w-full min-w-0 max-w-full flex-col">
      <div className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold text-orange-500 sm:text-2xl">
            {String(nSlide).padStart(2, '0')}
          </span>
          <span className="text-sm text-gray-400 sm:text-base">/ {String(nTotal).padStart(2, '0')}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-1 w-16 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-orange-500 transition-all duration-500 ease-out"
              style={{ width: `${(nSlide / nTotal) * 100}%` }}
            />
          </div>
        </div>
      </div>
      <h3 className="mt-3 text-xl font-bold leading-tight text-gray-800 sm:mt-4 sm:text-2xl md:text-3xl">
        {datos.titulo}
      </h3>
      <p className="mt-2 text-base leading-relaxed text-gray-600 sm:mt-3 sm:text-lg">{datos.descripcion}</p>
      <ul className="mt-2 space-y-2 sm:mt-3 sm:space-y-3">
        {datos.caracteristicas.map((c, i) => (
          <li key={i} className="flex items-start space-x-2 sm:space-x-3">
            <span className="mt-0.5 flex-shrink-0 text-base text-orange-500 sm:text-lg" aria-hidden>
              {iconoCaracterística(i)}
            </span>
            <span className="text-sm leading-relaxed text-gray-700 sm:text-base">{c}</span>
          </li>
        ))}
      </ul>
      {mostrarCta && (
        <div className="mt-5">
          <button
            type="button"
            onClick={onCta}
            className="w-full transform rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:bg-orange-600 hover:shadow-lg"
          >
            Conoce nuestra familia
          </button>
        </div>
      )}
    </div>
  );
}

function CuerpoSlideDesktop({ datos, nSlide, nTotal, mostrarCta, onCta }) {
  return (
    <div className="flex h-full min-h-0 w-full max-w-full flex-col justify-start space-y-6 overflow-y-auto pr-0 pt-0">
      <div className="flex items-center space-x-2">
        <span className="text-2xl font-bold text-orange-500">{String(nSlide).padStart(2, '0')}</span>
        <span className="text-base text-gray-400">/ {String(nTotal).padStart(2, '0')}</span>
      </div>
      <h3 className="z-10 text-3xl font-bold leading-tight text-gray-800">{datos.titulo}</h3>
      <p className="text-lg leading-relaxed text-gray-600">{datos.descripcion}</p>
      <ul className="space-y-3">
        {datos.caracteristicas.map((c, i) => (
          <li key={i} className="flex items-start space-x-3">
            <span className="mt-0.5 flex-shrink-0 text-lg text-orange-500" aria-hidden>
              {iconoCaracterística(i)}
            </span>
            <span className="text-base leading-relaxed text-gray-700">{c}</span>
          </li>
        ))}
      </ul>
      {mostrarCta && (
        <div>
          <button
            type="button"
            onClick={onCta}
            className="w-full transform rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:bg-orange-600 hover:shadow-lg"
          >
            Conoce nuestra familia
          </button>
        </div>
      )}
    </div>
  );
}

const botonNavMóvil =
  'absolute flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/95 shadow-xl transition-transform duration-200 hover:scale-110 hover:bg-white';

export default function SliderHome() {
  const [slideActual, setSlideActual] = useState(0);
  const [indiceSlideAnterior, setIndiceSlideAnterior] = useState(0);
  const [isModalFamiliaAbierto, setIsModalFamiliaAbierto] = useState(false);
  const [altoMínBloqueTextoMóvil, setAltoMínBloqueTextoMóvil] = useState(null);
  const refBloqueTextoMóvil = useRef(null);
  const refSondasMóvil = useRef(null);

  const totalSlides = datosSlides.length;
  const slideActualData = datosSlides[slideActual];
  const mostrarCta = slideActualData.id === 3;

  const recalcAltosTextoMóvil = useCallback(() => {
    const elBloque = refBloqueTextoMóvil.current;
    const sonda = refSondasMóvil.current;
    if (!elBloque || !sonda) return;
    const w = elBloque.getBoundingClientRect().width;
    if (w < 8) return;
    sonda.style.width = `${w}px`;
    // Forzar relayout tras asignar ancho a las sondas
    sonda.getBoundingClientRect();
    const filas = sonda.querySelectorAll('[data-sonda-slide]');
    if (filas.length === 0) return;
    let máximo = 0;
    filas.forEach((n) => {
      const h = n.getBoundingClientRect().height;
      if (h > máximo) máximo = h;
    });
    if (máximo > 0) {
      setAltoMínBloqueTextoMóvil(máximo);
    }
  }, []);

  useLayoutEffect(() => {
    const elBloque = refBloqueTextoMóvil.current;
    if (!elBloque) return;
    const ro = new ResizeObserver(() => {
      recalcAltosTextoMóvil();
    });
    ro.observe(elBloque);
    recalcAltosTextoMóvil();
    return () => {
      ro.disconnect();
    };
  }, [recalcAltosTextoMóvil]);

  useLayoutEffect(() => {
    if (document.fonts?.ready) {
      void document.fonts.ready.then(() => {
        recalcAltosTextoMóvil();
      });
    }
  }, [recalcAltosTextoMóvil]);

  const irASlide = (indice) => {
    const máx = totalSlides - 1;
    const seguro = Math.max(0, Math.min(máx, indice));
    if (seguro === slideActual) return;
    setIndiceSlideAnterior(slideActual);
    setSlideActual(seguro);
  };

  const slideAnterior = () => {
    const n = slideActual === 0 ? totalSlides - 1 : slideActual - 1;
    irASlide(n);
  };

  const slideSiguiente = () => {
    irASlide((slideActual + 1) % totalSlides);
  };

  return (
    <section className="relative sm:py-6 md:py-16 lg:py-8">
      <div className="container mx-auto px-2 sm:px-1 lg:px-1">
        <div className="relative mx-auto max-w-7xl">
          <div className="relative">
            {/* Móvil: UNA transición (fade) para galería + copy — evita 2 AnimatePresence */}
            <div className="lg:hidden">
              <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                <SliderUseFrameMotion
                  slideActual={slideActual}
                  slideAnterior={indiceSlideAnterior}
                  totalSlides={totalSlides}
                  tipoAnimacion="fade"
                  duracion={0.3}
                  className="w-full"
                >
                  {/** Misma estructura en altura en todos los slides: visor fijo + columna de copy con min-h fijo */}
                  <div className="flex w-full min-w-0 max-w-full flex-col">
                    <div className="relative h-96 w-full min-h-0 flex-shrink-0 sm:h-96 sm:min-h-0">
                      <div className="absolute inset-0 min-h-0 overflow-hidden p-0">
                        <InnerImageGallery
                          claveGaleria={slideActualData.id}
                          medios={slideActualData.imagenUrl}
                          isVideo={slideActualData.isVideo}
                          descripciónAlt={slideActualData.imagenAlt}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={slideAnterior}
                        className={`${botonNavMóvil} absolute left-0 top-1/2 z-20`}
                        aria-label="Slide anterior"
                      >
                        <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={slideSiguiente}
                        className={`${botonNavMóvil} absolute right-0 top-1/2 z-20`}
                        aria-label="Slide siguiente"
                      >
                        <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                    <div
                      ref={refBloqueTextoMóvil}
                      className={clasesBloqueTextoMóvil}
                      style={
                        altoMínBloqueTextoMóvil != null
                          ? { minHeight: `${altoMínBloqueTextoMóvil}px` }
                          : undefined
                      }
                    >
                      <CuerpoSlideMóvil
                        datos={slideActualData}
                        nSlide={slideActual + 1}
                        nTotal={totalSlides}
                        mostrarCta={mostrarCta}
                        onCta={() => setIsModalFamiliaAbierto(true)}
                      />
                    </div>
                  </div>
                </SliderUseFrameMotion>
                {/* Sondas con el mismo ancho y copy que móvil: fija minHeight = max(h) sin rem arbitrario */}
                <div
                  ref={refSondasMóvil}
                  className="pointer-events-none fixed left-0 top-0 -z-50 w-0 overflow-visible"
                  style={{ visibility: 'hidden' }}
                  aria-hidden
                >
                  {datosSlides.map((d, i) => (
                    <div
                      key={d.id}
                      data-sonda-slide
                      className={clasesBloqueTextoMóvilBase}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%' }}
                    >
                      <CuerpoSlideMóvil
                        datos={d}
                        nSlide={i + 1}
                        nTotal={totalSlides}
                        mostrarCta={d.id === 3}
                        onCta={() => {}}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop: mismo criterio — un solo contenedor animado */}
            <div className="relative hidden min-h-0 lg:flex lg:h-[600px] lg:flex-row lg:overflow-hidden lg:rounded-xl lg:bg-white lg:shadow-xl">
              <SliderUseFrameMotion
                slideActual={slideActual}
                slideAnterior={indiceSlideAnterior}
                totalSlides={totalSlides}
                tipoAnimacion="fade"
                duracion={0.3}
                className="flex h-full min-h-0 w-full flex-1"
              >
                <div className="flex h-full w-full min-h-0 min-w-0 max-w-full flex-row">
                  <div className="h-full w-1/2 min-w-0 flex-shrink-0 p-0">
                    <InnerImageGallery
                      claveGaleria={slideActualData.id}
                      medios={slideActualData.imagenUrl}
                      isVideo={slideActualData.isVideo}
                      descripciónAlt={slideActualData.imagenAlt}
                    />
                  </div>
                  <div className="h-full w-1/2 min-w-0 flex-shrink-0 p-8 xl:p-12">
                    <CuerpoSlideDesktop
                      datos={slideActualData}
                      nSlide={slideActual + 1}
                      nTotal={totalSlides}
                      mostrarCta={mostrarCta}
                      onCta={() => setIsModalFamiliaAbierto(true)}
                    />
                  </div>
                </div>
              </SliderUseFrameMotion>
              <div className="absolute left-4 top-1/2 z-20 -translate-y-1/2">
                <button
                  type="button"
                  onClick={slideAnterior}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform duration-200 hover:scale-110 hover:bg-white"
                  aria-label="Slide anterior"
                >
                  <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
              <div className="absolute right-4 top-1/2 z-20 -translate-y-1/2">
                <button
                  type="button"
                  onClick={slideSiguiente}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform duration-200 hover:scale-110 hover:bg-white"
                  aria-label="Slide siguiente"
                >
                  <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 hidden items-center justify-center space-x-2 rounded-2xl p-2 lg:flex">
            {datosSlides.map((_, i) => (
              <button
                type="button"
                key={i}
                onClick={() => irASlide(i)}
                className={`h-3 w-3 rounded-full transition duration-200 ${
                  i === slideActual ? 'scale-125 bg-orange-500' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Ir al slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <ModalFamilia
        isAbierto={isModalFamiliaAbierto}
        onCerrar={() => setIsModalFamiliaAbierto(false)}
      />
    </section>
  );
}
