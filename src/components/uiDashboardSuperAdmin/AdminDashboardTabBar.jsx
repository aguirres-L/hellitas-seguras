import React from 'react';
import { Wallet, Heart, BarChart2, Building2 } from 'lucide-react';
import UseFrameMotion from '../hook_frame_motion/UseFrameMotion';

const pestanas = [
  { id: 'liquidaciones', etiqueta: 'Liquidaciones', Icono: Wallet },
  { id: 'historyMascotas', etiqueta: 'Historias', Icono: Heart },
  // { id: 'usuarios', etiqueta: 'Usuarios', Icono: Users }, // desactivado temporalmente
  { id: 'estadisticas', etiqueta: 'Estadísticas', Icono: BarChart2 },
  { id: 'information_of_ong', etiqueta: 'Organización', Icono: Building2 },
];

const easeFluido = [0.4, 0, 0.2, 1];

const animacionPestanaActiva = {
  initial: { opacity: 0.82, y: 2 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0.82, y: 2 },
};

const animacionPestanaInactiva = {
  initial: { opacity: 0.88 },
  animate: { opacity: 1 },
  exit: { opacity: 0.88 },
};

/**
 * TabBar inferior solo en viewport móvil (Tailwind: oculto desde md).
 * Misma idea que DashboardTabBar (usuario): fija abajo, safe-area, icono + etiqueta corta.
 *
 * @param {Object} props
 * @param {string} props.pestanaActiva
 * @param {(id: string) => void} props.onCambiarPestana
 * @param {'light'|'dark'} props.typeTheme
 */
export function AdminDashboardTabBar({ pestanaActiva, onCambiarPestana, typeTheme }) {
  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 md:hidden overflow-hidden rounded-t-[22px] border-t backdrop-blur-xl ${
        typeTheme === 'light'
          ? 'border-purple-100/90 bg-white/92 shadow-[0_-6px_24px_rgba(0,0,0,0.07),0_-1px_0_rgba(0,0,0,0.04)]'
          : 'border-gray-600/80 bg-gray-900/92 shadow-[0_-8px_28px_rgba(0,0,0,0.35),0_-1px_0_rgba(255,255,255,0.06)]'
      }`}
      role="tablist"
      aria-label="Secciones del panel administrativo"
      style={{
        paddingTop: '0.5rem',
        paddingBottom: 'max(0.65rem, env(safe-area-inset-bottom))',
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
              aria-controls={`panel-admin-${id}`}
              id={`tab-admin-${id}`}
              tabIndex={isActiva ? 0 : -1}
              onClick={() => onCambiarPestana(id)}
              className={`relative z-10 flex min-h-[3.35rem] min-w-0 flex-1 flex-col items-center justify-center px-0.5 py-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 ${
                typeTheme === 'light' ? 'focus-visible:ring-offset-white' : 'focus-visible:ring-offset-gray-900'
              } ${
                isActiva
                  ? typeTheme === 'light'
                    ? 'text-purple-600'
                    : 'text-purple-400'
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
                className="flex w-full flex-col items-center justify-center gap-0.5"
                transition={{
                  duration: isActiva ? 0.22 : 0.18,
                  ease: easeFluido,
                }}
              >
                <Icono className="h-[18px] w-[18px] shrink-0 sm:h-5 sm:w-5" strokeWidth={isActiva ? 2.5 : 2} aria-hidden />
                <span className="max-w-full text-center text-[9px] font-medium leading-tight sm:text-[10px]">
                  {etiqueta}
                </span>
              </UseFrameMotion>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
