/**
 * Textos unificados para chapita (perfil + menú Chapitas).
 * Los estados vienen de `pagoChapita` (MetodoDePago / admin).
 */

function normalizarEstadoChapita(estado) {
  if (estado == null || estado === '') return '';
  const s = String(estado).trim().toLowerCase().replace(/_/g, ' ');
  if (s === 'en viaje' || s === 'en transito' || s === 'transito') return 'en_viaje';
  if (s === 'en produccion') return 'fabricacion';
  if (s === 'sin estado' || s === 'sin_estado') return 'sin_estado';
  return String(estado).trim().toLowerCase().replace(/\s+/g, '_');
}

const ETIQUETAS_CORTAS = {
  pendiente: 'Chapita pendiente',
  confirmado: 'Pago confirmado',
  aprobado: 'Chapita aprobada',
  fabricacion: 'En fabricación',
  en_viaje: 'En camino',
  entregado: 'Chapita entregada',
  rechazado: 'Chapita rechazada',
  cancelado: 'Pedido cancelado',
  disponible: 'Chapita disponible',
  completado: 'Chapita entregada',
  sin_estado: 'Sin estado',
};

const ETIQUETAS_LARGAS = {
  pendiente:
    'Estamos revisando tu pago. Cuando cambie el estado, lo verás aquí y en el ícono Chapitas del menú.',
  confirmado:
    'Pago acreditado. Pronto pasará a fabricación; te avisamos en este perfil y en Chapitas.',
  aprobado: 'Tu pedido fue aprobado. Seguí el avance desde aquí o desde Chapitas arriba a la derecha.',
  fabricacion: 'Tu chapita se está fabricando. Te notificamos cuando salga o esté en camino.',
  en_viaje: 'La chapita va en camino hacia vos. Podés seguir el detalle en esta sección.',
  entregado: '¡Listo! La chapita consta como entregada. Si tenés dudas, contactanos.',
  rechazado: 'Este pedido fue rechazado. Si fue un error, escribinos.',
  cancelado: 'Este pedido fue cancelado.',
  disponible: 'Tu chapita está lista para coordinar retiro o envío.',
  completado: 'Pedido completado.',
  sin_estado: 'Todavía no hay un estado registrado para este pedido.',
};

/**
 * @param {string} [estado]
 * @param {'corta' | 'larga'} variante
 */
export function etiquetaEstadoChapita(estado, variante = 'corta') {
  const n = normalizarEstadoChapita(estado);
  if (!n) {
    return variante === 'larga'
      ? 'Cuando pidas una chapita, el estado aparecerá aquí y en Chapitas.'
      : 'Sin pedido';
  }
  if (variante === 'larga') {
    return ETIQUETAS_LARGAS[n] || `Estado actual: ${estado}. Los avisos también están en Chapitas.`;
  }
  return ETIQUETAS_CORTAS[n] || `Estado: ${estado}`;
}

/** Clases Tailwind para pastilla de estado (fondo + texto + borde). */
export function clasesBadgeEstadoChapita(estado) {
  const n = normalizarEstadoChapita(estado);
  switch (n) {
    case 'pendiente':
      return 'bg-amber-50 text-amber-900 border-amber-200';
    case 'confirmado':
    case 'aprobado':
      return 'bg-blue-50 text-blue-900 border-blue-200';
    case 'fabricacion':
      return 'bg-orange-50 text-orange-900 border-orange-200';
    case 'en_viaje':
      return 'bg-violet-50 text-violet-900 border-violet-200';
    case 'entregado':
    case 'completado':
    case 'disponible':
      return 'bg-green-50 text-green-900 border-green-200';
    case 'rechazado':
    case 'cancelado':
      return 'bg-red-50 text-red-900 border-red-200';
    case 'sin_estado':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    default:
      return 'bg-gray-50 text-gray-800 border-gray-200';
  }
}

/** Punto de color (menú notificaciones). */
export function clasePuntoEstadoChapita(estado) {
  const n = normalizarEstadoChapita(estado);
  switch (n) {
    case 'pendiente':
      return 'bg-amber-500';
    case 'confirmado':
    case 'aprobado':
      return 'bg-blue-500';
    case 'fabricacion':
      return 'bg-orange-500';
    case 'en_viaje':
      return 'bg-violet-500';
    case 'entregado':
    case 'completado':
    case 'disponible':
      return 'bg-green-500';
    case 'rechazado':
    case 'cancelado':
      return 'bg-red-500';
    case 'sin_estado':
      return 'bg-gray-400';
    default:
      return 'bg-gray-400';
  }
}
