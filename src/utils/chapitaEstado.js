/**
 * Textos unificados para chapita (perfil + menú Chapitas).
 * Los estados vienen de `pagoChapita` (MetodoDePago / admin).
 */

/** Quita tildes para que "fabricación" y "fabricacion" mapeen igual. */
function sinAcentos(str) {
  return String(str)
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

function normalizarEstadoChapita(estado) {
  if (estado == null || estado === '') return '';

  const plano = sinAcentos(String(estado).trim()).toLowerCase();
  const conEspacios = plano.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
  const slug = conEspacios.replace(/\s+/g, '_');

  if (
    conEspacios === 'en viaje' ||
    conEspacios === 'en transito' ||
    conEspacios === 'transito' ||
    conEspacios === 'en camino'
  ) {
    return 'en_viaje';
  }

  if (conEspacios === 'en produccion') return 'fabricacion';

  if (
    conEspacios === 'en fabricacion' ||
    slug === 'en_fabricacion'
  ) {
    return 'fabricacion';
  }

  if (conEspacios === 'sin estado' || slug === 'sin_estado') return 'sin_estado';

  if (conEspacios === 'fabricacion' || slug === 'fabricacion') return 'fabricacion';

  if (conEspacios === 'pendiente' || slug === 'pendiente') return 'pendiente';
  if (conEspacios === 'confirmado' || slug === 'confirmado') return 'confirmado';
  if (conEspacios === 'aprobado' || slug === 'aprobado') return 'aprobado';
  if (conEspacios === 'entregado' || slug === 'entregado') return 'entregado';
  if (conEspacios === 'rechazado' || slug === 'rechazado') return 'rechazado';
  if (conEspacios === 'cancelado' || slug === 'cancelado') return 'cancelado';
  if (conEspacios === 'disponible' || slug === 'disponible') return 'disponible';
  if (conEspacios === 'completado' || slug === 'completado') return 'completado';

  return slug;
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
      return 'bg-amber-100 text-amber-900 border-amber-200';
    case 'confirmado':
    case 'aprobado':
      return 'bg-blue-100 text-blue-900 border-blue-200';
    case 'fabricacion':
      return 'bg-orange-100 text-orange-900 border-orange-200';
    case 'en_viaje':
      return 'bg-violet-100 text-violet-900 border-violet-200';
    case 'entregado':
    case 'completado':
    case 'disponible':
      return 'bg-green-100 text-green-900 border-green-200';
    case 'rechazado':
    case 'cancelado':
      return 'bg-red-100 text-red-900 border-red-200';
    case 'sin_estado':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
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
