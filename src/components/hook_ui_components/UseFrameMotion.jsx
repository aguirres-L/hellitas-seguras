import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

/**
 * Componente wrapper reutilizable para aplicar animaciones de framer-motion
 * a cualquier elemento hijo.
 * 
 * @param {Object} props - Props del componente
 * @param {React.ReactNode} props.children - Elementos hijos a animar
 * @param {string} [props.tipoAnimacion='fade'] - Tipo de animación predefinida:
 *   - 'fade': Aparece/desaparece suavemente cambiando solo la opacidad (0 → 1)
 *   - 'slideUp': Desliza desde abajo hacia arriba mientras aparece (y: 50px → 0)
 *   - 'slideDown': Desliza desde arriba hacia abajo mientras aparece (y: -50px → 0)
 *   - 'slideLeft': Desliza desde la derecha hacia la izquierda mientras aparece (x: 50px → 0)
 *   - 'slideRight': Desliza desde la izquierda hacia la derecha mientras aparece (x: -50px → 0)
 *   - 'scale': Escala desde pequeño a tamaño normal mientras aparece (scale: 0.8 → 1)
 *   - 'rotate': Rota ligeramente al aparecer y desaparecer (rotate: -10° → 0° → 10°)
 * @param {number} [props.duracion=0.5] - Duración de la animación en segundos
 * @param {number} [props.delay=0] - Delay antes de iniciar la animación en segundos
 * @param {string} [props.className=''] - Clases CSS adicionales para el contenedor
 * @param {Object} [props.animacionPersonalizada=null] - Objeto con animación personalizada de framer-motion (sobrescribe tipoAnimacion)
 * @param {boolean} [props.waitForUserView=false] - Si es true, espera a que el elemento sea visible en el viewport antes de ejecutar la animación --- Cuando al menos el 10% del elemento es visible, se ejecuta la animación.
 * @param {Object} props.propsAdicionales - Props adicionales para el motion.div
 */
export default function UseFrameMotion({
  children,
  tipoAnimacion = 'fade',
  duracion = 0.5,
  delay = 0,
  className = '',
  animacionPersonalizada = null,
  waitForUserView = false,
  ...propsAdicionales
}) {
  const [esVisible, setEsVisible] = useState(!waitForUserView);
  const elementoRef = useRef(null);

  // Intersection Observer para detectar cuando el elemento es visible
  useEffect(() => {
    // Si waitForUserView es false, no necesitamos observar
    if (!waitForUserView) {
      return;
    }

    const elemento = elementoRef.current;
    if (!elemento) {
      return;
    }

    // Configuración del Intersection Observer
    const opcionesObserver = {
      root: null, // Usa el viewport como área de observación
      rootMargin: '0px', // Sin margen adicional
      threshold: 0.1, // Se dispara cuando al menos el 10% del elemento es visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // Cuando el elemento entra en el viewport, marcamos como visible
        if (entry.isIntersecting) {
          setEsVisible(true);
          // Una vez que se detecta, podemos desconectar el observer para mejor rendimiento
          observer.disconnect();
        }
      });
    }, opcionesObserver);

    observer.observe(elemento);

    // Cleanup: desconectar el observer cuando el componente se desmonte
    return () => {
      observer.disconnect();
    };
  }, [waitForUserView]);

  // Definición de animaciones predefinidas
  const animacionesPredefinidas = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slideUp: {
      initial: { opacity: 0, y: 50 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 50 },
    },
    slideDown: {
      initial: { opacity: 0, y: -50 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -50 },
    },
    slideLeft: {
      initial: { opacity: 0, x: 50 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 50 },
    },
    slideRight: {
      initial: { opacity: 0, x: -50 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -50 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.8 },
    },
    rotate: {
      initial: { opacity: 0, rotate: -10 },
      animate: { opacity: 1, rotate: 0 },
      exit: { opacity: 0, rotate: 10 },
    },
  };

  // Seleccionar la animación a usar
  const animacion = animacionPersonalizada || animacionesPredefinidas[tipoAnimacion] || animacionesPredefinidas.fade;

  // Configuración de transición
  const transicion = {
    duration: duracion,
    delay: delay,
    ease: 'easeOut',
  };

  // Si waitForUserView es true y aún no es visible, mantenemos el estado inicial
  // (opacidad 0 y posición inicial) para que no se vea hasta que entre en el viewport
  const estadoAnimacion = esVisible ? animacion.animate : animacion.initial;

  return (
    <motion.div
      ref={elementoRef}
      initial={animacion.initial}
      animate={estadoAnimacion}
      exit={animacion.exit}
      transition={transicion}
      className={className}
      {...propsAdicionales}
    >
      {children}
    </motion.div>
  );
}