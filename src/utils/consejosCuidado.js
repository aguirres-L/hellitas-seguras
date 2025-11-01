// Consejos de cuidado específicos por tipo de mascota
export const consejosCuidado = {
  'Mestizo (Criollo)': {
    titulo: 'Consejos para perros mestizos',
    descripcion: 'Los perros mestizos suelen ser más resistentes y adaptables, pero cada uno es único.',
    consejos: [
      {
        categoria: 'Alimentación',
        items: [
          'Observa el tamaño y nivel de actividad para determinar la cantidad de comida',
          'Los perros mestizos pueden tener estómagos más sensibles, introduce cambios gradualmente',
          'Consulta con el veterinario sobre el mejor tipo de alimento según su edad y peso'
        ]
      },
      {
        categoria: 'Ejercicio',
        items: [
          'Adapta el ejercicio según el tamaño y energía de tu perro',
          'Los mestizos suelen ser muy activos, necesitan paseos diarios',
          'Observa si prefiere juegos de alta intensidad o actividades más tranquilas'
        ]
      },
      {
        categoria: 'Salud',
        items: [
          'Los perros mestizos pueden tener menos predisposición genética a ciertas enfermedades',
          'Mantén un calendario de vacunación regular',
          'Observa cambios en comportamiento que puedan indicar problemas de salud'
        ]
      },
      {
        categoria: 'Comportamiento',
        items: [
          'Cada perro mestizo es único, observa sus preferencias y personalidad',
          'Pueden ser muy inteligentes y adaptables al entrenamiento',
          'La socialización temprana es clave para un desarrollo equilibrado'
        ]
      }
    ],
    mensajeEspecial: '¡Los perros mestizos son increíbles! Su diversidad genética los hace únicos y especiales. Cada uno tiene su propia personalidad y necesidades específicas.'
  }
};

// Función para obtener consejos por raza
export const obtenerConsejos = (raza) => {
  return consejosCuidado[raza] || null;
};

// Función para obtener todas las razas con consejos disponibles
export const obtenerRazasConConsejos = () => {
  return Object.keys(consejosCuidado);
};
