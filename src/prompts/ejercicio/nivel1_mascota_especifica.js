// Nivel 1: Prompt específico para la mascota seleccionada
export const promptEjercicioNivel1 = (mascota) => {
  return `
**🏃‍♂️ RUTINA DE EJERCICIO PERSONALIZADA PARA ${mascota.nombre || 'tu mascota'}**

**Información de tu mascota:**
- **Raza:** ${mascota.raza || 'No especificada'}
- **Edad:** ${mascota.edad || 'No especificada'} años
- **Color:** ${mascota.color || 'No especificado'}
- **Contacto:** ${mascota.contacto || 'No especificado'}

**Eres un especialista en actividad física canina.** Proporciona una rutina de ejercicio completa y personalizada específicamente diseñada para esta mascota.

**Por favor, proporciona consejos detallados sobre:**

**1. 🏃‍♂️ RUTINA DIARIA RECOMENDADA**
- **Duración total** de ejercicio diario para ${mascota.raza || 'la raza de tu mascota'}
- **Distribución** del ejercicio a lo largo del día
- **Intensidad** apropiada según la edad (${mascota.edad || 'actual'})
- **Adaptación** según el clima y estación
- **Días de descanso** necesarios

**2. 🎾 TIPOS DE ACTIVIDADES IDEALES**
- **Ejercicios cardiovasculares** específicos para ${mascota.raza || 'su raza'}
- **Juegos interactivos** que disfrute ${mascota.nombre || 'tu mascota'}
- **Actividades de resistencia** apropiadas
- **Ejercicios de coordinación** y equilibrio
- **Actividades acuáticas** si es posible

**3. ⏰ HORARIOS Y FRECUENCIA**
- **Mejor momento** del día para ejercitarse
- **Frecuencia** de sesiones de ejercicio
- **Duración** de cada sesión
- **Intervalos** de descanso necesarios
- **Adaptación** a tu horario de trabajo

**4. 🎯 EJERCICIOS ESPECÍFICOS POR EDAD**
- **Cachorro (0-1 año):** Ejercicios de desarrollo
- **Adulto joven (1-3 años):** Actividades de alta energía
- **Adulto maduro (3-7 años):** Mantenimiento físico
- **Senior (7+ años):** Ejercicios de bajo impacto
- **Transiciones** entre etapas de vida

**5. 🧠 ESTIMULACIÓN MENTAL**
- **Juegos de olfato** y búsqueda
- **Puzzles** y juguetes interactivos
- **Entrenamiento** de comandos durante el ejercicio
- **Socialización** con otros perros
- **Nuevos entornos** para explorar

**6. ⚠️ PRECAUCIONES Y LÍMITES**
- **Señales de fatiga** a vigilar en ${mascota.nombre || 'tu mascota'}
- **Condiciones climáticas** a evitar
- **Superficies** seguras para ejercitarse
- **Equipamiento** de seguridad necesario
- **Cuándo parar** el ejercicio

**7. 🏠 EJERCICIO EN CASA**
- **Actividades** para días lluviosos
- **Espacios** adecuados en el hogar
- **Juguetes** recomendados para casa
- **Ejercicios** de bajo impacto
- **Rutinas** de 10-15 minutos

**8. 📊 MONITOREO DEL PROGRESO**
- **Peso ideal** para ${mascota.raza || 'la raza de tu mascota'}
- **Condición física** a evaluar
- **Registro** de actividades diarias
- **Ajustes** según el progreso
- **Revisiones** veterinarias necesarias

**FORMATO DE RESPUESTA:**
- Usa títulos con **texto en negrita**
- Incluye viñetas con • para cada punto
- Sé específico con duraciones y frecuencias
- Incluye un plan semanal de ejercicio
- Menciona consideraciones especiales para ${mascota.raza || 'la raza de tu mascota'}
- Proporciona alternativas para diferentes situaciones
`;
};
