import React from 'react';
import { PawPrint, Calendar, Store, Dog } from 'lucide-react';
import UseFrameMotion from '../hook_frame_motion/UseFrameMotion';

const pestanas = [
  { id: 'mascotas', etiqueta: 'Mascotas', Icono: PawPrint },
  { id: 'citas', etiqueta: 'Citas', Icono: Calendar },
  { id: 'profesionales', etiqueta: 'Profesionales', Icono: Store },
  { id: 'paseadores', etiqueta: 'Paseadores', Icono: Dog },
];

/** Easing suave (tipo Material), sin rebote */
const easeFluido = [0.4, 0, 0.2, 1];

/** Pestaña activa: leve fundido + 2px vertical; sin escala ni spring. */
const animacionPestanaActiva = {
  initial: { opacity: 0.82, y: 2 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0.82, y: 2 },
};

/** Al dejar de estar activa: solo un fundido muy leve (evita opacidad 0 del fade por defecto). */
const animacionPestanaInactiva = {
  initial: { opacity: 0.88 },
  animate: { opacity: 1 },
  exit: { opacity: 0.88 },
};

/**
 * TabBar inferior solo móvil (< md). Navbar sigue arriba.
 * `UseFrameMotion` con transiciones cortas y easing uniforme (fluido, discreto).
 *
 * @param {Object} props
 * @param {'mascotas'|'citas'|'profesionales'|'paseadores'} props.pestanaActiva
 * @param {(id: string) => void} props.onCambiarPestana
 * @param {'light'|'dark'} props.typeTheme
 */
export function DashboardTabBar({ pestanaActiva, onCambiarPestana, typeTheme }) {
  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 md:hidden overflow-hidden rounded-t-[22px] border-t backdrop-blur-xl ${
        typeTheme === 'light'
          ? 'border-orange-100/90 bg-white/92 shadow-[0_-6px_24px_rgba(0,0,0,0.07),0_-1px_0_rgba(0,0,0,0.04)]'
          : 'border-gray-600/80 bg-gray-900/92 shadow-[0_-8px_28px_rgba(0,0,0,0.35),0_-1px_0_rgba(255,255,255,0.06)]'
      }`}
      role="tablist"
      aria-label="Secciones del panel"
      style={{
        paddingTop: '0.625rem',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
      }}
    >
      <div className="relative flex">
        {pestanas.map(({ id, etiqueta, Icono }) => {
          const isActiva = pestanaActiva === id;

          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActiva}
              aria-controls={`panel-${id}`}
              id={`tab-dashboard-${id}`}
              tabIndex={isActiva ? 0 : -1}
              onClick={() => onCambiarPestana(id)}
              className={`relative z-10 flex flex-1 flex-col items-center justify-center py-2.5 min-h-[3.5rem] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
                typeTheme === 'light' ? 'focus-visible:ring-offset-white' : 'focus-visible:ring-offset-gray-900'
              } ${
                isActiva
                  ? typeTheme === 'light'
                    ? 'text-orange-600'
                    : 'text-orange-400'
                  : typeTheme === 'light'
                    ? 'text-gray-500'
                    : 'text-gray-400'
              }`}
            >
              <UseFrameMotion
                key={`${id}-${isActiva}`}
                tipoAnimacion="fade"
                animacionPersonalizada={isActiva ? animacionPestanaActiva : animacionPestanaInactiva}
                duracion={isActiva ? 0.22 : 0.18}
                delay={0}
                waitForUserView={false}
                className="flex flex-col items-center justify-center gap-0.5 w-full"
                transition={{
                  duration: isActiva ? 0.22 : 0.18,
                  ease: easeFluido,
                }}
              >
                <Icono className="h-5 w-5 shrink-0" strokeWidth={isActiva ? 2.5 : 2} aria-hidden />
                <span className="text-[11px] font-medium leading-tight text-center px-0.5">{etiqueta}</span>
              </UseFrameMotion>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
