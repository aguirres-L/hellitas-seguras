import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, Map, Briefcase, Percent } from 'lucide-react';

const pestanas = [
  { id: 'perfil', etiqueta: 'Perfil', Icono: User, esCentral: false },
  { id: 'historial', etiqueta: 'Historial', Icono: Calendar, esCentral: false },
  { id: 'recorrido', etiqueta: 'Recorrido', Icono: Map, esCentral: true },
  { id: 'servicios', etiqueta: 'Servicios', Icono: Briefcase, esCentral: false },
  { id: 'descuentos', etiqueta: 'Descuentos', Icono: Percent, esCentral: false },
];

const N_PESTANAS = pestanas.length;
const ANCHO_PESTANA_PCT = 100 / N_PESTANAS;

/** Misma curva que DashboardTabBar (usuario) */
const transicionPastilla = {
  type: 'spring',
  stiffness: 420,
  damping: 32,
  mass: 0.65,
};

const transicionColorIcono = {
  type: 'spring',
  stiffness: 380,
  damping: 34,
  mass: 0.5,
};

/**
 * Tab bar inferior (solo móvil). Misma base visual que {@link DashboardTabBar}:
 * pastilla con gradiente + iconos/etiquetas alineados.
 * Recorrido: ítem central con leve énfasis (escala / stroke), sin “tarjeta” aparte.
 */
export function PaseadorDashboardTabBar({ pestanaActiva, onCambiarPestana, typeTheme }) {
  const indiceActivo = useMemo(() => {
    const i = pestanas.findIndex((p) => p.id === pestanaActiva);
    return i >= 0 ? i : 0;
  }, [pestanaActiva]);

  const esLight = typeTheme === 'light';

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 md:hidden overflow-hidden rounded-t-[22px] border-t backdrop-blur-xl ${
        esLight
          ? 'border-orange-100/90 bg-white/92 shadow-[0_-6px_24px_rgba(0,0,0,0.07),0_-1px_0_rgba(0,0,0,0.04)]'
          : 'border-gray-600/80 bg-gray-900/92 shadow-[0_-8px_28px_rgba(0,0,0,0.35),0_-1px_0_rgba(255,255,255,0.06)]'
      }`}
      role="tablist"
      aria-label="Secciones del panel paseador"
      style={{
        paddingTop: '0.625rem',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
      }}
    >
      <div className="relative mx-1.5 flex min-h-[3.5rem]">
        <motion.div
          className={`pointer-events-none absolute inset-y-0 z-0 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_2px_12px_rgba(249,115,22,0.18)] ring-1 ring-orange-400/25 ${
            esLight
              ? 'bg-gradient-to-br from-orange-400/35 via-amber-300/25 to-orange-500/30'
              : 'bg-gradient-to-br from-orange-500/30 via-amber-500/15 to-orange-600/25 ring-orange-400/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_16px_rgba(249,115,22,0.12)]'
          }`}
          initial={false}
          animate={{
            left: `${indiceActivo * ANCHO_PESTANA_PCT}%`,
          }}
          transition={transicionPastilla}
          style={{
            width: `${ANCHO_PESTANA_PCT}%`,
            willChange: 'left',
          }}
        />

        {pestanas.map(({ id, etiqueta, Icono, esCentral }) => {
          const isActiva = pestanaActiva === id;

          return (
            <motion.button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActiva}
              aria-controls={`panel-paseador-${id}`}
              id={`tab-paseador-${id}`}
              tabIndex={isActiva ? 0 : -1}
              onClick={() => onCambiarPestana(id)}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              className={`relative z-10 flex flex-1 flex-col items-center justify-center py-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
                esLight ? 'focus-visible:ring-offset-white' : 'focus-visible:ring-offset-gray-900'
              }`}
            >
              <span className="relative inline-flex items-center justify-center">
                <motion.span
                  animate={{
                    color: isActiva
                      ? esLight
                        ? 'rgb(234 88 12)'
                        : 'rgb(251 146 60)'
                      : esLight
                        ? 'rgb(107 114 128)'
                        : 'rgb(156 163 175)',
                    scale: isActiva ? (esCentral ? 1.12 : 1.06) : 1,
                    y: esCentral && isActiva ? -1 : 0,
                  }}
                  transition={transicionColorIcono}
                  className="inline-flex"
                >
                  <Icono
                    className="h-5 w-5 shrink-0"
                    strokeWidth={isActiva ? (esCentral ? 2.6 : 2.5) : 2}
                    aria-hidden
                  />
                </motion.span>
              </span>
              <motion.span
                animate={{
                  color: isActiva
                    ? esLight
                      ? 'rgb(234 88 12)'
                      : 'rgb(251 146 60)'
                    : esLight
                      ? 'rgb(107 114 128)'
                      : 'rgb(156 163 175)',
                }}
                transition={transicionColorIcono}
                className="px-0.5 text-center text-[11px] font-medium leading-tight"
              >
                {etiqueta}
              </motion.span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
