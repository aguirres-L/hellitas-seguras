// Sistema de gestión de prompts jerárquicos
import { promptAlimentacionNivel1 } from './alimentacion/nivel1_mascota_especifica.js';
import { promptAlimentacionNivel2 } from './alimentacion/nivel2_consejos_avanzados.js';
import { promptSaludNivel1 } from './salud/nivel1_mascota_especifica.js';
import { promptSaludNivel2 } from './salud/nivel2_enfermedades_comunes.js';
import { promptEjercicioNivel1 } from './ejercicio/nivel1_mascota_especifica.js';
import { promptEjercicioNivel2 } from './ejercicio/nivel2_consejos_avanzados.js';

// Configuración de prompts disponibles por tipo y nivel
const PROMPTS_DISPONIBLES = {
  alimentacion: {
    1: promptAlimentacionNivel1,
    2: promptAlimentacionNivel2,
    // 3: promptAlimentacionNivel3, // Futuro
    // 4: promptAlimentacionNivel4, // Futuro
  },
  salud: {
    1: promptSaludNivel1,
    2: promptSaludNivel2,
    // 3: promptSaludNivel3, // Futuro
    // 4: promptSaludNivel4, // Futuro
  },
  // Agregar más tipos según se vayan creando
  ejercicio: {
    1: promptEjercicioNivel1,
    2: promptEjercicioNivel2,
  },
  comportamiento: {
    1: null, // Pendiente de crear
    2: null, // Pendiente de crear
  },
  higiene: {
    1: null, // Pendiente de crear
    2: null, // Pendiente de crear
  },
  entrenamiento: {
    1: null, // Pendiente de crear
    2: null, // Pendiente de crear
  },
  socializacion: {
    1: null, // Pendiente de crear
    2: null, // Pendiente de crear
  },
  cuidados_especiales: {
    1: null, // Pendiente de crear
    2: null, // Pendiente de crear
  }
};

// Función principal para obtener un prompt específico
export const obtenerPrompt = (tipoConsejo, nivel, mascota) => {
  // Validar que el tipo de consejo existe
  if (!PROMPTS_DISPONIBLES[tipoConsejo]) {
    throw new Error(`Tipo de consejo no válido: ${tipoConsejo}`);
  }

  // Validar que el nivel existe para este tipo
  if (!PROMPTS_DISPONIBLES[tipoConsejo][nivel]) {
    throw new Error(`Nivel ${nivel} no disponible para el tipo ${tipoConsejo}`);
  }

  // Obtener la función del prompt
  const promptFunction = PROMPTS_DISPONIBLES[tipoConsejo][nivel];
  
  if (!promptFunction) {
    throw new Error(`Prompt no implementado para ${tipoConsejo} nivel ${nivel}`);
  }

  // Generar el prompt personalizado
  return promptFunction(mascota);
};

// Función para obtener todos los niveles disponibles para un tipo
export const obtenerNivelesDisponibles = (tipoConsejo) => {
  if (!PROMPTS_DISPONIBLES[tipoConsejo]) {
    return [];
  }

  return Object.keys(PROMPTS_DISPONIBLES[tipoConsejo])
    .map(nivel => parseInt(nivel))
    .filter(nivel => PROMPTS_DISPONIBLES[tipoConsejo][nivel] !== null)
    .sort((a, b) => a - b);
};

// Función para obtener información sobre un prompt
export const obtenerInfoPrompt = (tipoConsejo, nivel) => {
  const nivelesDisponibles = obtenerNivelesDisponibles(tipoConsejo);
  
  if (!nivelesDisponibles.includes(nivel)) {
    return null;
  }

  // Información descriptiva de cada nivel
  const descripcionesNiveles = {
    1: {
      titulo: "Específico para tu mascota",
      descripcion: "Consejos personalizados basados en la raza, edad y características de tu mascota",
      icono: "🎯",
      color: "bg-blue-100 text-blue-800"
    },
    2: {
      titulo: "Consejos avanzados",
      descripcion: "Información especializada y situaciones complejas relacionadas con el tema",
      icono: "🔬",
      color: "bg-green-100 text-green-800"
    },
    3: {
      titulo: "Casos especiales",
      descripcion: "Situaciones específicas y casos particulares que requieren atención especial",
      icono: "⭐",
      color: "bg-purple-100 text-purple-800"
    },
    4: {
      titulo: "Información experta",
      descripcion: "Conocimiento avanzado y técnicas profesionales para casos complejos",
      icono: "👨‍⚕️",
      color: "bg-orange-100 text-orange-800"
    }
  };

  return descripcionesNiveles[nivel] || null;
};

// Función para obtener el prompt por defecto (nivel 1)
export const obtenerPromptPorDefecto = (tipoConsejo, mascota) => {
  const nivelesDisponibles = obtenerNivelesDisponibles(tipoConsejo);
  
  if (nivelesDisponibles.length === 0) {
    throw new Error(`No hay prompts disponibles para el tipo ${tipoConsejo}`);
  }

  // Usar el nivel más bajo disponible (generalmente 1)
  const nivelPorDefecto = Math.min(...nivelesDisponibles);
  return obtenerPrompt(tipoConsejo, nivelPorDefecto, mascota);
};

// Función para validar si un prompt está disponible
export const esPromptDisponible = (tipoConsejo, nivel) => {
  try {
    return PROMPTS_DISPONIBLES[tipoConsejo] && 
           PROMPTS_DISPONIBLES[tipoConsejo][nivel] !== null;
  } catch {
    return false;
  }
};

// Función para obtener estadísticas de prompts
export const obtenerEstadisticasPrompts = () => {
  const estadisticas = {};
  
  Object.keys(PROMPTS_DISPONIBLES).forEach(tipo => {
    const niveles = obtenerNivelesDisponibles(tipo);
    estadisticas[tipo] = {
      totalNiveles: niveles.length,
      nivelesDisponibles: niveles,
      completado: niveles.length > 0
    };
  });

  return estadisticas;
};
