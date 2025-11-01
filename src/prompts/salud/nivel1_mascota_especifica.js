// Nivel 1: Prompt específico para la mascota seleccionada
export const promptSaludNivel1 = (mascota) => {
  return `
**🏥 GUÍA DE SALUD PREVENTIVA PERSONALIZADA PARA ${mascota.nombre || 'tu mascota'}**

**Información de tu mascota:**
- **Raza:** ${mascota.raza || 'No especificada'}
- **Edad:** ${mascota.edad || 'No especificada'} años
- **Color:** ${mascota.color || 'No especificado'}
- **Contacto:** ${mascota.contacto || 'No especificado'}

**Eres un veterinario especialista en medicina preventiva canina.** Proporciona una guía completa de salud específicamente diseñada para esta mascota.

**Por favor, proporciona consejos detallados sobre:**

**1. 💉 VACUNACIÓN ESPECÍFICA POR EDAD**
- **Calendario de vacunas** para ${mascota.edad || 'la edad actual'} años
- **Vacunas esenciales** para la raza ${mascota.raza || 'de tu mascota'}
- **Vacunas opcionales** según estilo de vida
- **Refuerzos anuales** necesarios
- **Efectos secundarios** a vigilar
- **Qué hacer si se atrasa una vacuna**

**2. 🐛 DESPARASITACIÓN INTERNA Y EXTERNA**
- **Frecuencia específica** para ${mascota.nombre || 'tu mascota'}
- **Tipos de parásitos** más comunes en ${mascota.raza || 'su raza'}
- **Productos recomendados** por edad y peso
- **Señales de infestación** a vigilar
- **Prevención en el hogar** y entorno
- **Tratamiento de emergencia** si es necesario

**3. 🏥 ENFERMEDADES HEREDITARIAS DE LA RAZA**
- **Problemas comunes** en ${mascota.raza || 'la raza de tu mascota'}
- **Síntomas tempranos** a detectar
- **Pruebas genéticas** recomendadas
- **Prevención** de enfermedades hereditarias
- **Cuidados especiales** según predisposición
- **Cuándo acudir al especialista**

**4. 🔍 REVISIONES VETERINARIAS**
- **Frecuencia recomendada** según edad
- **Qué revisar en casa** semanalmente
- **Exámenes específicos** para ${mascota.raza || 'su raza'}
- **Análisis de sangre** necesarios
- **Radiografías** preventivas
- **Costo aproximado** de revisiones

**5. 🚨 SEÑALES DE ALERTA INMEDIATA**
- **Síntomas de emergencia** que requieren atención urgente
- **Cambios de comportamiento** preocupantes
- **Signos vitales** normales para ${mascota.nombre || 'tu mascota'}
- **Cuándo llamar al veterinario** de emergencia
- **Primeros auxilios** básicos
- **Botiquín de emergencia** recomendado

**6. 🧬 CUIDADOS ESPECÍFICOS POR EDAD**
- **Cachorro (0-1 año):** Cuidados especiales
- **Adulto joven (1-3 años):** Mantenimiento preventivo
- **Adulto maduro (3-7 años):** Vigilancia aumentada
- **Senior (7+ años):** Cuidados geriátricos
- **Transiciones** entre etapas de vida
- **Ajustes** según cambios de edad

**7. 🏠 PREVENCIÓN EN EL HOGAR**
- **Ambiente seguro** para ${mascota.nombre || 'tu mascota'}
- **Productos tóxicos** a evitar
- **Plantas peligrosas** en casa y jardín
- **Temperatura ideal** para su bienestar
- **Ejercicio** necesario para su salud
- **Estimulación mental** para prevenir estrés

**8. 📋 REGISTRO DE SALUD**
- **Carnet de vacunación** digital
- **Historial médico** personalizado
- **Recordatorios** de citas y tratamientos
- **Fotos** para detectar cambios
- **Peso** y medidas corporales
- **Comportamiento** y hábitos

**FORMATO DE RESPUESTA:**
- Usa títulos con **texto en negrita**
- Incluye viñetas con • para cada punto
- Sé específico con fechas y frecuencias
- Incluye un calendario de salud anual
- Menciona consideraciones especiales para ${mascota.raza || 'la raza de tu mascota'}
- Proporciona un plan de prevención personalizado
`;
};
