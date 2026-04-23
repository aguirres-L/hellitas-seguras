import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * Transición entre slides (un solo contenedor, sin `AnimatePresence`).
 * Evita estados "fantasma" donde un hijo con exit se queda transparente
 * mientras el padre aún aporta min-height (bloque en blanco).
 */
export default function SliderUseFrameMotion({
  children,
  slideActual,
  tipoAnimacion = 'slide',
  duracion = 0.4,
  className = '',
  slideAnterior = null,
  totalSlides = null,
}) {
  const [direccion, setDireccion] = useState(1);

  useEffect(() => {
    if (slideAnterior === null || slideAnterior === slideActual) return;
    if (Number.isInteger(totalSlides) && totalSlides > 0) {
      const esAdelante = slideActual === (slideAnterior + 1) % totalSlides;
      setDireccion(esAdelante ? 1 : -1);
    } else {
      const esAdelante =
        slideActual > slideAnterior || (slideActual === 0 && slideAnterior === 3);
      setDireccion(esAdelante ? 1 : -1);
    }
  }, [slideActual, slideAnterior, totalSlides]);

  const variantes = {
    slide: {
      initial: (d) => ({
        opacity: 0,
        x: d > 0 ? 24 : -24,
      }),
      animate: { opacity: 1, x: 0 },
    },
    fade: {
      initial: { opacity: 0.01 },
      animate: { opacity: 1 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.98 },
      animate: { opacity: 1, scale: 1 },
    },
  };

  const v = variantes[tipoAnimacion] || variantes.slide;

  return (
    <motion.div
      key={slideActual}
      custom={direccion}
      initial={v.initial}
      animate={v.animate}
      transition={{ duration: duracion, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
