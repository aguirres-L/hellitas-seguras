import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * Componente especializado para animar transiciones de slides en el slider.
 * Detecta cambios en el slide actual y aplica animaciones de entrada/salida.
 * 
 * @param {Object} props - Props del componente
 * @param {React.ReactNode} props.children - Contenido a animar (debe incluir una key única basada en slideActual)
 * @param {number} props.slideActual - Índice del slide actual (usado como key para detectar cambios)
 * @param {string} [props.tipoAnimacion='slide'] - Tipo de animación:
 *   - 'slide': Desliza horizontalmente (izquierda/derecha según dirección)
 *   - 'fade': Aparece/desaparece suavemente
 *   - 'scale': Escala desde pequeño a normal
 *   - 'slideUp': Desliza desde abajo
 * @param {number} [props.duracion=0.4] - Duración de la animación en segundos
 * @param {string} [props.className=''] - Clases CSS adicionales
 * @param {number} [props.slideAnterior] - Índice del slide anterior (opcional, para detectar dirección)
 */
export default function SliderUseFrameMotion({
  children,
  slideActual,
  tipoAnimacion = 'slide',
  duracion = 0.4,
  className = '',
  slideAnterior = null,
}) {
  const [direccion, setDireccion] = useState(1); // 1 = derecha, -1 = izquierda

  // Detectar dirección del cambio de slide
  useEffect(() => {
    if (slideAnterior !== null && slideAnterior !== slideActual) {
      // Determinar si vamos hacia adelante o atrás
      const esAdelante = slideActual > slideAnterior || 
                        (slideActual === 0 && slideAnterior === 3); // Caso especial: último a primero
      setDireccion(esAdelante ? 1 : -1);
    }
  }, [slideActual, slideAnterior]);

  // Definición de variantes de animación
  const variantesAnimacion = {
    slide: {
      initial: (direccion) => ({
        opacity: 0,
        x: direccion > 0 ? 50 : -50,
      }),
      animate: {
        opacity: 1,
        x: 0,
      },
      exit: (direccion) => ({
        opacity: 0,
        x: direccion > 0 ? -50 : 50,
      }),
    },
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 },
    },
    slideUp: {
      initial: { opacity: 0, y: 30 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -30 },
    },
  };

  const variante = variantesAnimacion[tipoAnimacion] || variantesAnimacion.slide;

  const transicion = {
    duration: duracion,
    ease: [0.4, 0, 0.2, 1], // ease-in-out cubic-bezier
  };

  return (
    <AnimatePresence mode="wait" custom={direccion}>
      <motion.div
        key={slideActual}
        custom={direccion}
        initial={variante.initial}
        animate={variante.animate}
        exit={variante.exit}
        transition={transicion}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

