// Nivel 2: Prompt con consejos avanzados y situaciones especiales
export const promptAlimentacionNivel2 = (mascota) => {
  return `
**🔬 GUÍA AVANZADA DE NUTRICIÓN CANINA - SITUACIONES ESPECIALES**

**Información de tu mascota:**
- **Raza:** ${mascota.raza || 'No especificada'}
- **Edad:** ${mascota.edad || 'No especificada'} años
- **Color:** ${mascota.color || 'No especificado'}

**Eres un nutricionista veterinario especializado en casos complejos.** Proporciona información avanzada sobre nutrición y cómo identificar problemas alimentarios específicos para ${mascota.nombre || 'tu mascota'}.

**Por favor, aborda estos temas avanzados:**

**1. 🔍 ANÁLISIS DE HECES - LA VENTANA A SU SALUD**
- **Color de heces:** Qué significa cada color y cuándo preocuparse
- **Consistencia:** Cómo identificar problemas digestivos
- **Frecuencia:** Qué es normal para la raza ${mascota.raza || 'de tu mascota'}
- **Olor:** Señales de problemas nutricionales
- **Presencia de parásitos:** Cómo identificarlos visualmente
- **Sangre o moco:** Cuándo es urgente acudir al veterinario

**2. 🚨 INTOLERANCIAS Y ALERGIAS ALIMENTARIAS**
- **Síntomas comunes:** Picazón, vómitos, diarrea, problemas de piel
- **Alimentos más alergénicos:** Lista específica para perros
- **Dieta de eliminación:** Cómo identificar el alimento problemático
- **Alternativas nutricionales:** Sustitutos seguros y nutritivos
- **Suplementos para alergias:** Qué puede ayudar a ${mascota.nombre || 'tu mascota'}

**3. 🏥 ENFERMEDADES RELACIONADAS CON LA ALIMENTACIÓN**
- **Pancreatitis:** Alimentos que la causan y dieta de recuperación
- **Diabetes:** Manejo nutricional específico
- **Problemas renales:** Restricciones alimentarias importantes
- **Problemas hepáticos:** Alimentos que ayudan a la función hepática
- **Obesidad:** Plan de reducción de peso seguro

**4. 🧬 NUTRICIÓN SEGÚN GENÉTICA**
- **Predisposiciones de la raza ${mascota.raza || 'de tu mascota'}:** Problemas comunes
- **Alimentos que previenen enfermedades hereditarias**
- **Suplementos específicos para su genética**
- **Edad biológica vs. cronológica:** Cómo ajustar la alimentación

**5. 🎯 SITUACIONES ESPECIALES**
- **Embarazo y lactancia:** Aumento de calorías y nutrientes
- **Recuperación post-cirugía:** Alimentos que aceleran la curación
- **Estrés y ansiedad:** Alimentos que calman el sistema nervioso
- **Cambios de estación:** Ajustes nutricionales según el clima
- **Viajes:** Cómo mantener una alimentación saludable

**6. 🧪 SUPLEMENTOS AVANZADOS**
- **Ácidos grasos omega-3:** Beneficios específicos para ${mascota.raza || 'tu mascota'}
- **Probióticos:** Cepas específicas para problemas digestivos
- **Enzimas digestivas:** Cuándo y cómo usarlas
- **Antioxidantes:** Alimentos ricos en antioxidantes naturales
- **Minerales quelados:** Mejor absorción y biodisponibilidad

**7. 🍽️ PREPARACIÓN DE COMIDA CASERA**
- **Recetas balanceadas:** Proporciones exactas de nutrientes
- **Alimentos crudos (BARF):** Pros, contras y consideraciones
- **Cocción vs. crudo:** Qué método es mejor para ${mascota.nombre || 'tu mascota'}
- **Higiène en la preparación:** Cómo evitar contaminación
- **Suplementación necesaria:** Qué agregar a la comida casera

**8. 📊 MONITOREO NUTRICIONAL**
- **Peso ideal:** Cómo calcularlo y mantenerlo
- **Condición corporal:** Escala de 1-9 y cómo evaluarla
- **Registro alimentario:** Qué anotar para detectar patrones
- **Análisis de sangre:** Qué valores vigilar
- **Revisiones veterinarias:** Frecuencia recomendada

**FORMATO DE RESPUESTA:**
- Usa títulos con **texto en negrita**
- Incluye viñetas con • para cada punto
- Proporciona ejemplos específicos para ${mascota.raza || 'la raza de tu mascota'}
- Incluye tablas o listas cuando sea apropiado
- Menciona cuándo es urgente acudir al veterinario
- Proporciona un plan de acción paso a paso
`;
};
