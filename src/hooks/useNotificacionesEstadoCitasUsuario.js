import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

function claveMapa(uid) {
  return `hs_citas_ultimo_estado_visto_${uid || 'anon'}`;
}

function leerMapa(uid) {
  if (!uid) return {};
  try {
    return JSON.parse(localStorage.getItem(claveMapa(uid)) || '{}');
  } catch {
    return {};
  }
}

function guardarMapa(uid, obj) {
  if (!uid) return;
  try {
    localStorage.setItem(claveMapa(uid), JSON.stringify(obj));
  } catch {
    // ignore
  }
}

/**
 * Detecta cuando el profesional cambió el estado de una cita (confirmada, reprogramación, cancelada, etc.)
 * comparando con el último estado que el usuario "vio" en la app.
 */
export function useNotificacionesEstadoCitasUsuario(citas, usuarioUid) {
  const [mapaVisto, setMapaVisto] = useState(() => leerMapa(usuarioUid));
  const sembradoInicial = useRef(false);

  useEffect(() => {
    sembradoInicial.current = false;
    setMapaVisto(leerMapa(usuarioUid));
  }, [usuarioUid]);

  /** Primera sesión con datos: sembrar mapa para no disparar N avisos por citas viejas */
  useEffect(() => {
    if (!usuarioUid || !citas?.length) return;
    if (sembradoInicial.current) return;
    const existente = leerMapa(usuarioUid);
    if (Object.keys(existente).length > 0) {
      sembradoInicial.current = true;
      setMapaVisto(existente);
      return;
    }
    const next = {};
    citas.forEach((c) => {
      if (c?.id != null) {
        next[String(c.id)] = String(c.estado || '').toLowerCase();
      }
    });
    guardarMapa(usuarioUid, next);
    setMapaVisto(next);
    sembradoInicial.current = true;
  }, [citas, usuarioUid]);

  const idsConNovedadEstado = useMemo(() => {
    if (!usuarioUid || !citas?.length) return [];
    const out = [];
    citas.forEach((c) => {
      if (c?.id == null) return;
      const e = String(c.estado || '').toLowerCase();
      const id = String(c.id);
      const visto = mapaVisto[id];
      if (visto !== e) out.push(id);
    });
    return out;
  }, [citas, mapaVisto, usuarioUid]);

  const cantidadNovedadesEstado = idsConNovedadEstado.length;

  const marcarTodasCitasEstadoVistas = useCallback(() => {
    if (!usuarioUid) return;
    setMapaVisto((prev) => {
      const next = { ...prev };
      (citas || []).forEach((c) => {
        if (c?.id != null) {
          next[String(c.id)] = String(c.estado || '').toLowerCase();
        }
      });
      guardarMapa(usuarioUid, next);
      return next;
    });
  }, [citas, usuarioUid]);

  return {
    cantidadNovedadesEstado,
    idsConNovedadEstado,
    marcarTodasCitasEstadoVistas,
  };
}
