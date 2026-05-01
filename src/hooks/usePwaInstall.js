import { useCallback, useEffect, useState } from 'react';

/**
 * Hook que centraliza el flujo de instalación PWA.
 *
 * Expone:
 *  - puedeInstalar: si el navegador disparó `beforeinstallprompt` (Chromium).
 *  - estaInstalada: la app corre en modo standalone (ya instalada).
 *  - tipoDispositivo: 'mobile' | 'tablet' | 'desktop'.
 *  - esIOS: Safari iOS no expone el prompt; mostramos instrucciones manuales.
 *  - instalarApp(): dispara el prompt nativo y devuelve el outcome.
 *
 * Se separa de la UI a propósito: cualquier botón/banner consume este hook.
 */
export function usePwaInstall() {
  const [eventoInstalacion, setEventoInstalacion] = useState(null);
  const [estaInstalada, setEstaInstalada] = useState(detectarStandalone());
  const [tipoDispositivo, setTipoDispositivo] = useState(() => detectarTipoDispositivo());
  const [esIOS] = useState(() => detectarIOS());
  const [esAndroid] = useState(() => detectarAndroid());

  useEffect(() => {
    const onBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setEventoInstalacion(e);
    };

    const onAppInstalled = () => {
      setEstaInstalada(true);
      setEventoInstalacion(null);
    };

    const mqStandalone = window.matchMedia('(display-mode: standalone)');
    const onChangeStandalone = (e) => setEstaInstalada(e.matches);

    const onResize = () => setTipoDispositivo(detectarTipoDispositivo());

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);
    mqStandalone.addEventListener?.('change', onChangeStandalone);
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
      mqStandalone.removeEventListener?.('change', onChangeStandalone);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const instalarApp = useCallback(async () => {
    if (!eventoInstalacion) return { outcome: 'unavailable' };
    eventoInstalacion.prompt();
    const choice = await eventoInstalacion.userChoice;
    if (choice?.outcome === 'accepted') {
      setEventoInstalacion(null);
    }
    return choice;
  }, [eventoInstalacion]);

  return {
    puedeInstalar: !!eventoInstalacion && !estaInstalada,
    estaInstalada,
    tipoDispositivo,
    esIOS,
    esAndroid,
    instalarApp,
  };
}

function detectarStandalone() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia?.('(display-mode: standalone)').matches) return true;
  return window.navigator?.standalone === true;
}

/** Heurística pragmática: UA + ancho. No es 100% pero alcanza para elegir el ícono correcto. */
function detectarTipoDispositivo() {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent || '';
  const isTabletUa = /iPad|Tablet|PlayBook/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua));
  const isMobileUa = /Android.*Mobile|iPhone|iPod|webOS|BlackBerry|Opera Mini|IEMobile/i.test(ua);
  const ancho = window.innerWidth || 0;

  if (isTabletUa) return 'tablet';
  if (isMobileUa) return 'mobile';
  if (ancho >= 1024) return 'desktop';
  if (ancho >= 640) return 'tablet';
  return 'mobile';
}

function detectarIOS() {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isiPad = /iPad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return /iPhone|iPod/.test(ua) || isiPad;
}

function detectarAndroid() {
  if (typeof window === 'undefined') return false;
  return /Android/i.test(navigator.userAgent || '');
}
