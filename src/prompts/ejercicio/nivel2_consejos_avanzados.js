// Nivel 2: Prompt con consejos avanzados y situaciones especiales
export const promptEjercicioNivel2 = (mascota) => {
  return `
**🔬 GUÍA AVANZADA DE EJERCICIO CANINO - SITUACIONES ESPECIALES**

**Información de tu mascota:**
- **Raza:** ${mascota.raza || 'No especificada'}
- **Edad:** ${mascota.edad || 'No especificada'} años
- **Color:** ${mascota.color || 'No especificado'}

**Eres un especialista en fisiología del ejercicio canino.** Proporciona información avanzada sobre ejercicio y cómo manejar situaciones especiales específicamente para ${mascota.nombre || 'tu mascota'}.

**Por favor, aborda estos temas avanzados:**

**1. 🏥 EJERCICIO Y SALUD FÍSICA**

**CONDICIONES CARDIOVASCULARES:**
- **Enfermedades del corazón** y restricciones de ejercicio
- **Síntomas** de problemas cardíacos durante el ejercicio
- **Ejercicios seguros** para perros con problemas cardíacos
- **Monitoreo** de la frecuencia cardíaca
- **Cuándo acudir** al veterinario urgentemente

**PROBLEMAS ARTICULARES:**
- **Displasia de cadera** y ejercicio apropiado
- **Artritis** y actividades de bajo impacto
- **Ejercicios de rehabilitación** post-lesión
- **Fisioterapia** canina en casa
- **Suplementos** para la salud articular

**2. 🧠 EJERCICIO Y COMPORTAMIENTO**

**GESTIÓN DE ENERGÍA:**
- **Perros hiperactivos** y canalización de energía
- **Ejercicio** como terapia para ansiedad
- **Rutinas** para perros destructivos
- **Calmantes naturales** a través del ejercicio
- **Técnicas** de relajación post-ejercicio

**PROBLEMAS DE COMPORTAMIENTO:**
- **Agresividad** y ejercicio controlado
- **Miedos** y exposición gradual
- **Ansiedad por separación** y ejercicio
- **Territorialidad** y actividades sociales
- **Modificación** de conducta a través del ejercicio

**3. 🌡️ FACTORES AMBIENTALES**

**CLIMA EXTREMO:**
- **Golpe de calor** y prevención
- **Ejercicio en invierno** y protección
- **Humedad** y sus efectos en el ejercicio
- **Superficies calientes** y quemaduras en patas
- **Hidratación** durante el ejercicio intenso

**ENTORNOS ESPECÍFICOS:**
- **Ejercicio en la playa** y consideraciones
- **Montaña** y altitud
- **Ciudad** vs. campo
- **Parques** y áreas de ejercicio
- **Viajes** y mantenimiento de rutinas

**4. 🎯 DEPORTES CANINOS ESPECIALIZADOS**

**AGILITY:**
- **Inicio** en agility para ${mascota.raza || 'la raza de tu mascota'}
- **Equipamiento** básico necesario
- **Técnicas** de entrenamiento
- **Competencias** y preparación
- **Lesiones** comunes y prevención

**FLYBALL:**
- **Técnica** correcta de salto
- **Velocidad** y coordinación
- **Trabajo en equipo** con otros perros
- **Entrenamiento** progresivo
- **Equipamiento** específico

**5. 🏃‍♂️ EJERCICIO PARA PERROS SENIOR**

**ADAPTACIONES NECESARIAS:**
- **Intensidad** reducida apropiada
- **Duración** de sesiones más cortas
- **Superficies** más suaves
- **Calentamiento** y enfriamiento
- **Señales** de fatiga en perros mayores

**EJERCICIOS TERAPÉUTICOS:**
- **Movilidad articular** y flexibilidad
- **Fuerza** muscular mantenida
- **Equilibrio** y coordinación
- **Estimulación mental** adaptada
- **Calidad de vida** mejorada

**6. 🚨 EMERGENCIAS DURANTE EL EJERCICIO**

**PRIMEROS AUXILIOS:**
- **Golpe de calor** y tratamiento inmediato
- **Lesiones** musculares y articulares
- **Cortes** y heridas superficiales
- **Deshidratación** severa
- **Shock** y estabilización

**PREPARACIÓN:**
- **Botiquín** de primeros auxilios
- **Números** de emergencia veterinaria
- **Transporte** seguro para lesiones
- **Documentación** médica actualizada
- **Seguro** veterinario y cobertura

**7. 📊 TECNOLOGÍA Y MONITOREO**

**DISPOSITIVOS DE SEGUIMIENTO:**
- **Collares GPS** y monitoreo de actividad
- **Aplicaciones** para registro de ejercicio
- **Pulsómetros** caninos
- **Cámaras** de monitoreo
- **Análisis** de datos de actividad

**MÉTRICAS IMPORTANTES:**
- **Distancia** recorrida diariamente
- **Tiempo** de ejercicio activo
- **Calorías** quemadas
- **Frecuencia cardíaca** en reposo y ejercicio
- **Peso** y condición corporal

**8. 🎓 ENTRENAMIENTO AVANZADO**

**TÉCNICAS PROFESIONALES:**
- **Refuerzo positivo** durante el ejercicio
- **Comandos** específicos para deportes
- **Concentración** y atención
- **Trabajo en equipo** con el dueño
- **Preparación** para competencias

**FORMATO DE RESPUESTA:**
- Usa títulos con **texto en negrita**
- Incluye viñetas con • para cada punto
- Proporciona ejemplos específicos para ${mascota.raza || 'la raza de tu mascota'}
- Incluye tablas de ejercicios y duraciones
- Menciona cuándo es urgente acudir al veterinario
- Proporciona un plan de acción paso a paso
- Incluye información sobre equipamiento especializado
`;
};
