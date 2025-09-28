// Utilidades para el manejo de mensualidades y estados de usuario

/**
 * Calcula la fecha de vencimiento de la mensualidad
 * Considera 3 meses de gracia gratis + 1 mes de cobro
 * @param {Object} fechaRegistro - Timestamp de Firebase o Date
 * @param {Object} fechaUltimaRenovacion - Fecha de la última renovación (opcional)
 * @param {boolean} esPrimeraVez - Si es la primera vez que se calcula (por defecto true)
 * @returns {Object} Objeto con fecha de vencimiento y tipo de período
 */
export const calcularFechaVencimiento = (fechaRegistro, fechaUltimaRenovacion = null, esPrimeraVez = true) => {
  let fechaInicio;
  
  // Si hay fecha de última renovación, usar esa como base
  if (fechaUltimaRenovacion) {
    if (fechaUltimaRenovacion.seconds) {
      fechaInicio = new Date(fechaUltimaRenovacion.seconds * 1000);
    } else {
      fechaInicio = new Date(fechaUltimaRenovacion);
    }
    esPrimeraVez = false;
  } else {
    // Manejar diferentes formatos de fecha de registro
    if (fechaRegistro && fechaRegistro.seconds) {
      // Timestamp de Firebase
      fechaInicio = new Date(fechaRegistro.seconds * 1000);
    } else if (fechaRegistro instanceof Date) {
      fechaInicio = fechaRegistro;
    } else if (fechaRegistro) {
      fechaInicio = new Date(fechaRegistro);
    } else {
      // Si no hay fecha de registro, usar fecha actual
      fechaInicio = new Date();
    }
  }
  
  // Crear nueva fecha y agregar los meses según el tipo
  const fechaVencimiento = new Date(fechaInicio);
  
  if (esPrimeraVez) {
    // Primeros 3 meses son gratis (período de gracia)
    fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 3);
    return {
      fechaVencimiento,
      tipoPeriodo: 'gracia',
      mesesDuracion: 3,
      esGratis: true
    };
  } else {
    // Después del período de gracia, cada renovación es de 1 mes
    fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);
    return {
      fechaVencimiento,
      tipoPeriodo: 'cobro',
      mesesDuracion: 1,
      esGratis: false
    };
  }
};

/**
 * Verifica si un usuario está en período de gracia (primeros 3 meses gratis)
 * @param {Object} fechaRegistro - Fecha de registro del usuario
 * @returns {Object} Información del período de gracia
 */
export const verificarPeriodoGracia = (fechaRegistro) => {
  if (!fechaRegistro) return { enPeriodoGracia: false, diasRestantes: 0 };
  
  let fechaInicio;
  if (fechaRegistro.seconds) {
    fechaInicio = new Date(fechaRegistro.seconds * 1000);
  } else {
    fechaInicio = new Date(fechaRegistro);
  }
  
  const hoy = new Date();
  const fechaFinGracia = new Date(fechaInicio);
  fechaFinGracia.setMonth(fechaFinGracia.getMonth() + 3);
  
  const enPeriodoGracia = hoy < fechaFinGracia;
  const diasRestantes = enPeriodoGracia ? Math.ceil((fechaFinGracia - hoy) / (1000 * 60 * 60 * 24)) : 0;
  
  return {
    enPeriodoGracia,
    diasRestantes,
    fechaFinGracia,
    fechaInicio
  };
};

/**
 * Verifica si una mensualidad está vencida
 * @param {Object} fechaVencimiento - Fecha de vencimiento
 * @param {number} diasGracia - Días de gracia antes de considerar vencida (por defecto 0)
 * @returns {boolean} True si está vencida
 */
export const esMensualidadVencida = (fechaVencimiento, diasGracia = 0) => {
  if (!fechaVencimiento) return true;
  
  const hoy = new Date();
  const fechaLimite = new Date(fechaVencimiento);
  fechaLimite.setDate(fechaLimite.getDate() + diasGracia);
  
  return hoy > fechaLimite;
};

/**
 * Verifica si una mensualidad está próxima a vencer
 * @param {Object} fechaVencimiento - Fecha de vencimiento
 * @param {number} diasAlerta - Días antes del vencimiento para alertar (por defecto 7)
 * @returns {boolean} True si está próxima a vencer
 */
export const esMensualidadProximaVencer = (fechaVencimiento, diasAlerta = 7) => {
  if (!fechaVencimiento) return false;
  
  const hoy = new Date();
  const fechaAlerta = new Date(fechaVencimiento);
  fechaAlerta.setDate(fechaAlerta.getDate() - diasAlerta);
  
  return hoy >= fechaAlerta && !esMensualidadVencida(fechaVencimiento);
};

/**
 * Calcula los días restantes hasta el vencimiento
 * @param {Object} fechaVencimiento - Fecha de vencimiento
 * @returns {number} Días restantes (negativo si ya venció)
 */
export const calcularDiasRestantes = (fechaVencimiento) => {
  if (!fechaVencimiento) return 0;
  
  const hoy = new Date();
  const vencimiento = new Date(fechaVencimiento);
  const diferencia = vencimiento.getTime() - hoy.getTime();
  
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
};

/**
 * Formatea la fecha para mostrar en la UI
 * @param {Object} fecha - Fecha a formatear
 * @returns {string} Fecha formateada en español
 */
export const formatearFechaMensualidad = (fecha) => {
  if (!fecha) return 'No especificada';
  
  let fechaObj;
  if (fecha.seconds) {
    fechaObj = new Date(fecha.seconds * 1000);
  } else {
    fechaObj = new Date(fecha);
  }
  
  return fechaObj.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Obtiene el estado de la mensualidad con colores para la UI
 * Maneja período de gracia de 3 meses gratis + cobros mensuales
 * @param {Object} usuario - Objeto usuario con información de mensualidad
 * @returns {Object} Objeto con estado, color y mensaje
 */
export const obtenerEstadoMensualidad = (usuario) => {
  // Verificar si está en período de gracia
  const periodoGracia = verificarPeriodoGracia(usuario.fechaRegistro || usuario.fechaCreacion);
  
  if (periodoGracia.enPeriodoGracia) {
    // Usuario en período de gracia (primeros 3 meses gratis)
    return {
      estado: 'periodo_gracia',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      mensaje: `Período gratis: ${periodoGracia.diasRestantes} días restantes`,
      fechaVencimiento: formatearFechaMensualidad(periodoGracia.fechaFinGracia),
      diasRestantes: periodoGracia.diasRestantes,
      esGratis: true,
      tipoPeriodo: 'gracia'
    };
  }
  
  // Usuario fuera del período de gracia, verificar mensualidad
  const calculoVencimiento = calcularFechaVencimiento(
    usuario.fechaRegistro || usuario.fechaCreacion,
    usuario.fechaUltimaRenovacion,
    !usuario.fechaUltimaRenovacion // esPrimeraVez si no hay renovaciones
  );
  
  const fechaVencimiento = calculoVencimiento.fechaVencimiento;
  const diasRestantes = calcularDiasRestantes(fechaVencimiento);
  const estaVencida = esMensualidadVencida(fechaVencimiento);
  const estaProximaVencer = esMensualidadProximaVencer(fechaVencimiento);
  
  if (estaVencida) {
    return {
      estado: 'vencida',
      color: 'bg-red-100 text-red-800 border-red-200',
      mensaje: `Vencida hace ${Math.abs(diasRestantes)} días`,
      fechaVencimiento: formatearFechaMensualidad(fechaVencimiento),
      diasRestantes: diasRestantes,
      esGratis: false,
      tipoPeriodo: 'cobro'
    };
  } else if (estaProximaVencer) {
    return {
      estado: 'proxima_vencer',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      mensaje: `Vence en ${diasRestantes} días`,
      fechaVencimiento: formatearFechaMensualidad(fechaVencimiento),
      diasRestantes: diasRestantes,
      esGratis: false,
      tipoPeriodo: 'cobro'
    };
  } else {
    return {
      estado: 'activa',
      color: 'bg-green-100 text-green-800 border-green-200',
      mensaje: `Vence en ${diasRestantes} días`,
      fechaVencimiento: formatearFechaMensualidad(fechaVencimiento),
      diasRestantes: diasRestantes,
      esGratis: false,
      tipoPeriodo: 'cobro'
    };
  }
};

/**
 * Actualiza el estado del usuario basado en su mensualidad
 * Considera período de gracia de 3 meses gratis
 * @param {Object} usuario - Usuario a actualizar
 * @returns {Object} Usuario con estado actualizado
 */
export const actualizarEstadoUsuario = (usuario) => {
  const estadoMensualidad = obtenerEstadoMensualidad(usuario);
  
  // El usuario está activo si está en período de gracia O si tiene mensualidad activa
  const isActivo = estadoMensualidad.estado === 'periodo_gracia' || estadoMensualidad.estado === 'activa';
  
  return {
    ...usuario,
    isMember: isActivo,
    tipoMensualidad: isActivo,
    fechaVencimientoMensualidad: estadoMensualidad.fechaVencimiento,
    estadoMensualidad: estadoMensualidad.estado,
    diasRestantesMensualidad: estadoMensualidad.diasRestantes,
    esGratis: estadoMensualidad.esGratis,
    tipoPeriodo: estadoMensualidad.tipoPeriodo
  };
};

/**
 * Filtra usuarios con mensualidades vencidas
 * @param {Array} usuarios - Array de usuarios
 * @returns {Array} Usuarios con mensualidades vencidas
 */
export const filtrarUsuariosConMensualidadVencida = (usuarios) => {
  return usuarios.filter(usuario => {
    const estadoMensualidad = obtenerEstadoMensualidad(usuario);
    return estadoMensualidad.estado === 'vencida';
  });
};

/**
 * Filtra usuarios con mensualidades próximas a vencer
 * @param {Array} usuarios - Array de usuarios
 * @returns {Array} Usuarios con mensualidades próximas a vencer
 */
export const filtrarUsuariosConMensualidadProximaVencer = (usuarios) => {
  return usuarios.filter(usuario => {
    const estadoMensualidad = obtenerEstadoMensualidad(usuario);
    return estadoMensualidad.estado === 'proxima_vencer';
  });
};

/**
 * Renueva la mensualidad de un usuario
 * Después del período de gracia, cada renovación es de 1 mes
 * @param {Object} usuario - Usuario a renovar
 * @returns {Object} Usuario con mensualidad renovada
 */
export const renovarMensualidad = (usuario) => {
  const fechaActual = new Date();
  
  // Calcular nueva fecha de vencimiento (1 mes desde ahora)
  const calculoVencimiento = calcularFechaVencimiento(
    usuario.fechaRegistro || usuario.fechaCreacion,
    fechaActual,
    false // No es primera vez, es una renovación
  );
  
  return {
    ...usuario,
    isMember: true,
    tipoMensualidad: true,
    fechaVencimientoMensualidad: calculoVencimiento.fechaVencimiento,
    fechaUltimaRenovacion: fechaActual,
    estadoMensualidad: 'activa',
    diasRestantesMensualidad: calcularDiasRestantes(calculoVencimiento.fechaVencimiento),
    esGratis: false,
    tipoPeriodo: 'cobro'
  };
};
