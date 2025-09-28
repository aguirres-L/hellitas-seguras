// Configuración de tipos de consejos disponibles para mascotas
export const TIPOS_CONSEJOS = [
  {
    id: 'alimentacion',
    nombre: 'Alimentación',
    icono: '🍽️',
    descripcion: 'Consejos sobre dieta, horarios de comida y nutrición específica',
    color: 'bg-green-100 text-green-800 border-green-200',
    colorHover: 'hover:bg-green-200',
    promptTemplate: 'alimentacion'
  },
  {
    id: 'ejercicio',
    nombre: 'Ejercicio',
    icono: '🏃‍♂️',
    descripcion: 'Actividades físicas, juegos y rutinas de ejercicio',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    colorHover: 'hover:bg-blue-200',
    promptTemplate: 'ejercicio'
  },
  {
    id: 'salud',
    nombre: 'Salud',
    icono: '🏥',
    descripcion: 'Cuidados médicos, vacunas y prevención de enfermedades',
    color: 'bg-red-100 text-red-800 border-red-200',
    colorHover: 'hover:bg-red-200',
    promptTemplate: 'salud'
  },
  {
    id: 'comportamiento',
    nombre: 'Comportamiento',
    icono: '🐕',
    descripcion: 'Entrenamiento, socialización y modificación de conductas',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    colorHover: 'hover:bg-purple-200',
    promptTemplate: 'comportamiento'
  },
  {
    id: 'higiene',
    nombre: 'Higiene',
    icono: '🛁',
    descripcion: 'Baño, cepillado, limpieza dental y cuidado del pelaje',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    colorHover: 'hover:bg-yellow-200',
    promptTemplate: 'higiene'
  },
  {
    id: 'entrenamiento',
    nombre: 'Entrenamiento',
    icono: '🎓',
    descripcion: 'Comandos básicos, obediencia y trucos específicos',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    colorHover: 'hover:bg-indigo-200',
    promptTemplate: 'entrenamiento'
  },
  {
    id: 'socializacion',
    nombre: 'Socialización',
    icono: '👥',
    descripcion: 'Interacción con otros perros, personas y entornos',
    color: 'bg-pink-100 text-pink-800 border-pink-200',
    colorHover: 'hover:bg-pink-200',
    promptTemplate: 'socializacion'
  },
  {
    id: 'cuidados_especiales',
    nombre: 'Cuidados Especiales',
    icono: '⭐',
    descripcion: 'Necesidades específicas por edad, raza o condición especial',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    colorHover: 'hover:bg-orange-200',
    promptTemplate: 'cuidados_especiales'
  }
];

// Plantillas de prompts específicos para cada tipo de consejo
export const PROMPT_TEMPLATES = {
  alimentacion: {
    titulo: 'Guía de Alimentación Personalizada',
    contexto: 'Eres un veterinario especialista en nutrición canina. Proporciona consejos específicos y detallados sobre alimentación.',
    estructura: `
**Información de la mascota:**
- Raza: {raza}
- Edad: {edad} años
- Color: {color}
- Contacto: {contacto}

**Tipo de consejo solicitado:** Alimentación y Nutrición

**Por favor, proporciona consejos detallados sobre:**
1. **Dieta recomendada** específica para esta raza y edad
2. **Horarios de comida** ideales
3. **Cantidades** apropiadas según el peso y edad
4. **Alimentos a evitar** específicos para esta raza
5. **Suplementos** recomendados si es necesario
6. **Señales de alerta** en la alimentación
7. **Transición alimentaria** si es necesario
8. **Hidratación** y acceso al agua

**Formato de respuesta:**
- Usa títulos con **texto en negrita**
- Incluye viñetas con • para cada punto
- Sé específico y práctico
- Incluye recomendaciones de frecuencia y cantidades
- Menciona consideraciones especiales para la raza {raza}
`
  },
  ejercicio: {
    titulo: 'Rutina de Ejercicio Personalizada',
    contexto: 'Eres un especialista en actividad física canina. Proporciona rutinas específicas y seguras.',
    estructura: `
**Información de la mascota:**
- Raza: {raza}
- Edad: {edad} años
- Color: {color}
- Contacto: {contacto}

**Tipo de consejo solicitado:** Ejercicio y Actividad Física

**Por favor, proporciona consejos detallados sobre:**
1. **Rutina diaria** de ejercicio recomendada
2. **Duración** apropiada según la edad y raza
3. **Tipos de actividades** más beneficiosas
4. **Juegos interactivos** específicos
5. **Precauciones** según la edad y condición física
6. **Señales de fatiga** a observar
7. **Ejercicios mentales** para estimulación
8. **Adaptación** según el clima y entorno

**Formato de respuesta:**
- Usa títulos con **texto en negrita**
- Incluye viñetas con • para cada punto
- Especifica duración y frecuencia
- Incluye variaciones según el clima
- Menciona consideraciones especiales para la raza {raza}
`
  },
  salud: {
    titulo: 'Guía de Salud Preventiva',
    contexto: 'Eres un veterinario con experiencia en medicina preventiva canina. Proporciona consejos de salud específicos.',
    estructura: `
**Información de la mascota:**
- Raza: {raza}
- Edad: {edad} años
- Color: {color}
- Contacto: {contacto}

**Tipo de consejo solicitado:** Salud y Medicina Preventiva

**Por favor, proporciona consejos detallados sobre:**
1. **Vacunas** necesarias según la edad
2. **Desparasitación** interna y externa
3. **Enfermedades comunes** de la raza {raza}
4. **Señales de alerta** a vigilar
5. **Revisiones veterinarias** recomendadas
6. **Prevención** de problemas de salud
7. **Cuidados especiales** según la edad
8. **Emergencias** y cuándo acudir al veterinario

**Formato de respuesta:**
- Usa títulos con **texto en negrita**
- Incluye viñetas con • para cada punto
- Especifica frecuencias y edades
- Incluye síntomas de alerta
- Menciona consideraciones especiales para la raza {raza}
`
  },
  comportamiento: {
    titulo: 'Guía de Comportamiento Canino',
    contexto: 'Eres un etólogo canino especializado en modificación de conducta. Proporciona consejos específicos de comportamiento.',
    estructura: `
**Información de la mascota:**
- Raza: {raza}
- Edad: {edad} años
- Color: {color}
- Contacto: {contacto}

**Tipo de consejo solicitado:** Comportamiento y Conducta

**Por favor, proporciona consejos detallados sobre:**
1. **Comportamientos típicos** de la raza {raza}
2. **Gestión de energía** y estimulación mental
3. **Prevención de problemas** de conducta
4. **Técnicas de modificación** de comportamiento
5. **Señales de estrés** y ansiedad
6. **Rutinas** que favorezcan buen comportamiento
7. **Interacción** con la familia
8. **Adaptación** a diferentes entornos

**Formato de respuesta:**
- Usa títulos con **texto en negrita**
- Incluye viñetas con • para cada punto
- Sé específico sobre técnicas
- Incluye ejemplos prácticos
- Menciona consideraciones especiales para la raza {raza}
`
  },
  higiene: {
    titulo: 'Rutina de Higiene Personalizada',
    contexto: 'Eres un especialista en cuidado y estética canina. Proporciona rutinas de higiene específicas.',
    estructura: `
**Información de la mascota:**
- Raza: {raza}
- Edad: {edad} años
- Color: {color}
- Contacto: {contacto}

**Tipo de consejo solicitado:** Higiene y Cuidado Personal

**Por favor, proporciona consejos detallados sobre:**
1. **Frecuencia de baño** según el tipo de pelaje
2. **Productos** recomendados para la raza {raza}
3. **Cepillado** y cuidado del pelaje
4. **Limpieza dental** y salud bucal
5. **Cuidado de orejas** y ojos
6. **Corte de uñas** y cuidado de patas
7. **Prevención** de problemas de piel
8. **Rutina** de higiene diaria y semanal

**Formato de respuesta:**
- Usa títulos con **texto en negrita**
- Incluye viñetas con • para cada punto
- Especifica frecuencias y productos
- Incluye técnicas paso a paso
- Menciona consideraciones especiales para la raza {raza}
`
  },
  entrenamiento: {
    titulo: 'Programa de Entrenamiento Personalizado',
    contexto: 'Eres un entrenador canino profesional. Proporciona programas de entrenamiento específicos.',
    estructura: `
**Información de la mascota:**
- Raza: {raza}
- Edad: {edad} años
- Color: {color}
- Contacto: {contacto}

**Tipo de consejo solicitado:** Entrenamiento y Obediencia

**Por favor, proporciona consejos detallados sobre:**
1. **Comandos básicos** apropiados para la edad
2. **Técnicas de entrenamiento** más efectivas
3. **Refuerzo positivo** específico para la raza {raza}
4. **Duración de sesiones** según la edad
5. **Progresión** de dificultad
6. **Resolución de problemas** comunes
7. **Entrenamiento en casa** vs exterior
8. **Mantenimiento** de comportamientos aprendidos

**Formato de respuesta:**
- Usa títulos con **texto en negrita**
- Incluye viñetas con • para cada punto
- Especifica pasos detallados
- Incluye tiempos y repeticiones
- Menciona consideraciones especiales para la raza {raza}
`
  },
  socializacion: {
    titulo: 'Guía de Socialización Canina',
    contexto: 'Eres un especialista en socialización canina. Proporciona estrategias de socialización específicas.',
    estructura: `
**Información de la mascota:**
- Raza: {raza}
- Edad: {edad} años
- Color: {color}
- Contacto: {contacto}

**Tipo de consejo solicitado:** Socialización e Interacción

**Por favor, proporciona consejos detallados sobre:**
1. **Período crítico** de socialización según la edad
2. **Exposición gradual** a diferentes estímulos
3. **Interacción** con otros perros
4. **Relación** con personas de diferentes edades
5. **Adaptación** a diferentes entornos
6. **Manejo de miedos** y ansiedades
7. **Actividades grupales** recomendadas
8. **Señales de estrés** durante socialización

**Formato de respuesta:**
- Usa títulos con **texto en negrita**
- Incluye viñetas con • para cada punto
- Especifica edades y etapas
- Incluye técnicas paso a paso
- Menciona consideraciones especiales para la raza {raza}
`
  },
  cuidados_especiales: {
    titulo: 'Cuidados Especiales Personalizados',
    contexto: 'Eres un veterinario especialista en cuidados especiales caninos. Proporciona consejos específicos según necesidades particulares.',
    estructura: `
**Información de la mascota:**
- Raza: {raza}
- Edad: {edad} años
- Color: {color}
- Contacto: {contacto}

**Tipo de consejo solicitado:** Cuidados Especiales

**Por favor, proporciona consejos detallados sobre:**
1. **Necesidades específicas** de la raza {raza}
2. **Consideraciones por edad** (cachorro, adulto, senior)
3. **Adaptaciones** según el entorno
4. **Cuidados preventivos** especiales
5. **Modificaciones** en rutinas según necesidades
6. **Equipamiento** especial recomendado
7. **Señales de alerta** específicas
8. **Recursos adicionales** y especialistas

**Formato de respuesta:**
- Usa títulos con **texto en negrita**
- Incluye viñetas con • para cada punto
- Sé específico sobre necesidades especiales
- Incluye recomendaciones de equipamiento
- Menciona consideraciones especiales para la raza {raza}
`
  }
};

// Función para generar el prompt personalizado
export const generarPromptPersonalizado = (mascota, tipoConsejo) => {
  const template = PROMPT_TEMPLATES[tipoConsejo];
  if (!template) {
    throw new Error(`Tipo de consejo no válido: ${tipoConsejo}`);
  }

  return template.estructura
    .replace(/{raza}/g, mascota.raza || 'No especificada')
    .replace(/{edad}/g, mascota.edad || 'No especificada')
    .replace(/{color}/g, mascota.color || 'No especificado')
    .replace(/{contacto}/g, mascota.contacto || 'No especificado');
};
