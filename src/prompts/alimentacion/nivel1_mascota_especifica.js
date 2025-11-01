// Nivel 1: Prompt específico para la mascota seleccionada
export const promptAlimentacionNivel1 = (mascota) => {
  return `
**🍽️ GUÍA DE ALIMENTACIÓN PERSONALIZADA PARA ${mascota.nombre || 'tu mascota'}**

**Información de tu mascota:**
- **Raza:** ${mascota.raza || 'No especificada'}
- **Edad:** ${mascota.edad || 'No especificada'} años
- **Color:** ${mascota.color || 'No especificado'}
- **Contacto:** ${mascota.contacto || 'No especificado'}

**Eres un veterinario especialista en nutrición canina.** Proporciona una guía completa y personalizada de alimentación específicamente diseñada para esta mascota.

**Por favor, proporciona consejos detallados sobre:**

**1. 🥘 DIETA RECOMENDADA ESPECÍFICA**
- Alimentos ideales para la raza ${mascota.raza || 'de tu mascota'}
- Consideraciones especiales por la edad (${mascota.edad || 'actual'})
- Proporciones exactas de proteínas, carbohidratos y grasas
- Alimentos premium vs. comerciales recomendados

**2. ⏰ HORARIOS Y FRECUENCIA**
- Cuántas veces al día debe comer
- Horarios ideales según su edad y actividad
- Tiempo de digestión recomendado
- Cómo adaptar horarios a tu rutina

**3. 📏 CANTIDADES PRECISAS**
- Cantidad exacta en gramos/tazas por comida
- Cómo calcular según peso ideal
- Ajustes según nivel de actividad
- Señales de que está comiendo la cantidad correcta

**4. 🚫 ALIMENTOS ESPECÍFICOS A EVITAR**
- Alimentos tóxicos para la raza ${mascota.raza || 'de tu mascota'}
- Ingredientes que pueden causar alergias
- Alimentos que pueden causar problemas digestivos
- Qué hacer si consume algo peligroso

**5. 💊 SUPLEMENTOS RECOMENDADOS**
- Vitaminas específicas para su edad y raza
- Suplementos para el pelaje (${mascota.color || 'especialmente importante'})
- Probióticos y prebióticos
- Cuándo y cómo administrarlos

**6. 🔍 SEÑALES DE ALERTA ALIMENTARIA**
- Cambios en el apetito a vigilar
- Síntomas de intolerancia alimentaria
- Cuándo acudir al veterinario
- Cómo registrar cambios en su alimentación

**7. 🔄 TRANSICIONES ALIMENTARIAS**
- Cómo cambiar de comida gradualmente
- Adaptación a nuevas marcas
- Cambios según la edad
- Manejo de rechazo a nuevos alimentos

**8. 💧 HIDRATACIÓN ESPECÍFICA**
- Cantidad de agua recomendada
- Tipos de bebederos ideales
- Señales de deshidratación
- Agua con sabor o suplementos

**FORMATO DE RESPUESTA:**
- Usa títulos con **texto en negrita**
- Incluye viñetas con • para cada punto
- Sé específico con cantidades y frecuencias
- Incluye ejemplos prácticos para ${mascota.nombre || 'tu mascota'}
- Menciona consideraciones especiales para la raza ${mascota.raza || 'de tu mascota'}
- Proporciona un plan semanal de alimentación
`;
};
