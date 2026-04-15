import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, type Transition } from 'framer-motion';
import { crearTransicionFrameMotion } from '../hook_frame_motion/UseFrameMotion';

export type MobileMenuDrawerProps = {
  isAbierto: boolean;
  onCerrar: () => void;
  /** Top del backdrop y del panel (debajo del navbar), ej. `top-16` o `top-20` */
  offsetTopClass: string;
  typeTheme: 'light' | 'dark';
  children: React.ReactNode;
};

const transicionPanel = crearTransicionFrameMotion(0.35, 0) as Transition;
const transicionBackdrop: Transition = { duration: 0.22, ease: 'easeOut' };

const variantesPanel = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '100%' },
};

const variantesBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * Menú móvil lateral: monta en document.body (portal) para no quedar afectado por
 * overflow/transform de ancestros. Panel rectangular desde la derecha.
 */
export function MobileMenuDrawer({
  isAbierto,
  onCerrar,
  offsetTopClass,
  typeTheme,
  children,
}: MobileMenuDrawerProps) {
  const [domListo, setDomListo] = useState(false);

  useEffect(() => {
    setDomListo(true);
  }, []);

  if (!domListo || typeof document === 'undefined') {
    return null;
  }

  const panelSurface =
    typeTheme === 'dark'
      ? 'border-gray-600 bg-gray-900 text-gray-100'
      : 'border-orange-200/90 bg-white text-gray-900';

  return createPortal(
    <AnimatePresence>
      {isAbierto && (
        <motion.div
          key="mobile-menu-drawer-backdrop"
          role="presentation"
          aria-hidden
          className={`fixed left-0 right-0 bottom-0 z-[100] bg-black/50 ${offsetTopClass}`}
          initial={variantesBackdrop.initial}
          animate={variantesBackdrop.animate}
          exit={variantesBackdrop.exit}
          transition={transicionBackdrop}
          onClick={onCerrar}
        />
      )}
      {isAbierto && (
        <motion.div
          key="mobile-menu-drawer-panel"
          role="dialog"
          aria-modal="true"
          className={`fixed ${offsetTopClass} right-2 z-[110] flex h-auto max-h-[calc(100dvh-5.25rem)] w-[min(15.5rem,calc(100vw-2.25rem))] flex-col overflow-hidden rounded-xl border shadow-xl ${panelSurface}`}
          initial={variantesPanel.initial}
          animate={variantesPanel.animate}
          exit={variantesPanel.exit}
          transition={transicionPanel}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="max-h-full overflow-y-auto overscroll-contain px-3 py-3">
            <div className="flex min-w-0 flex-col gap-1.5 [&_a]:flex [&_a]:min-h-10 [&_a]:w-full [&_a]:items-center [&_a]:justify-start [&_a]:rounded-lg [&_a]:px-2.5 [&_a]:py-2 [&_button]:flex [&_button]:min-h-10 [&_button]:w-full [&_button]:items-center [&_button]:justify-start [&_button]:rounded-lg [&_button]:px-2.5 [&_button]:py-2 [&_button]:text-left">
              {children}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
