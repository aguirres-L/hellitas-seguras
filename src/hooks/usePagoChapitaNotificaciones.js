import { useState, useEffect, useCallback, useMemo } from 'react';
import { suscribirPagoChapitaPorUsuarioId } from '../data/firebase/firebase';
import { normalizarEstadoChapita } from '../utils/chapitaEstado';

const CLAVE_MAPA = 'hs_chapita_ultimo_estado_visto';
/** Compat: migrar el set viejo a mapa (solo confirmado visto) */
const CLAVE_VISTOS_LEGACY = 'hs_chapita_pagos_vistos';

function leerMapa() {
  try {
    const raw = localStorage.getItem(CLAVE_MAPA);
    if (raw) return JSON.parse(raw) || {};
    const leg = localStorage.getItem(CLAVE_VISTOS_LEGACY);
    if (leg) {
      const a = JSON.parse(leg);
      if (Array.isArray(a) && a.length) {
        const o = {};
        a.forEach((id) => {
          o[id] = 'confirmado';
        });
        try {
          localStorage.setItem(CLAVE_MAPA, JSON.stringify(o));
        } catch {
          // ignore
        }
        return o;
      }
    }
    return {};
  } catch {
    return {};
  }
}

function guardarMapa(obj) {
  try {
    localStorage.setItem(CLAVE_MAPA, JSON.stringify(obj));
  } catch {
    // ignore
  }
}

/**
 * pagoChapita en vivo + novedad por documento: último estado "visto" en el panel Chapitas.
 * Incluye pendiente (pago en revisión) y cada cambio de estado (p. ej. a fabricación).
 */
export function usePagoChapitaNotificaciones(uid) {
  const [pagoChapitas, setPagoChapitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mapaVisto, setMapaVisto] = useState(() => leerMapa());

  useEffect(() => {
    if (!uid) {
      setPagoChapitas([]);
      setCargando(false);
      return undefined;
    }
    setCargando(true);
    const unsub = suscribirPagoChapitaPorUsuarioId(
      uid,
      (list) => {
        setPagoChapitas(list);
        setCargando(false);
      },
      () => setCargando(false)
    );
    return unsub;
  }, [uid]);

  const idsConNovedad = useMemo(() => {
    const out = [];
    pagoChapitas.forEach((p) => {
      if (!p.id) return;
      const n = normalizarEstadoChapita(p.estado);
      const visto = mapaVisto[p.id];
      if (visto !== n) {
        out.push(p.id);
      }
    });
    return out;
  }, [pagoChapitas, mapaVisto]);

  const cantidadSinLeerAvisoPago = idsConNovedad.length;

  const marcarAvisosPagoVistos = useCallback(() => {
    setMapaVisto((prev) => {
      const next = { ...prev };
      pagoChapitas.forEach((p) => {
        if (p.id) {
          next[p.id] = normalizarEstadoChapita(p.estado);
        }
      });
      guardarMapa(next);
      try {
        localStorage.removeItem(CLAVE_VISTOS_LEGACY);
      } catch {
        // ignore
      }
      return next;
    });
  }, [pagoChapitas]);

  return {
    pagoChapitas,
    cargandoPagoChapitas: cargando,
    idsAvisoPagoNuevo: idsConNovedad,
    cantidadSinLeerAvisoPago,
    marcarAvisosPagoVistos
  };
}
