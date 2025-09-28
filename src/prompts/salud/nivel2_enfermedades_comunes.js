// Nivel 2: Prompt sobre enfermedades comunes y situaciones especiales
export const promptSaludNivel2 = (mascota) => {
  return `
**🦠 GUÍA DE ENFERMEDADES COMUNES Y SITUACIONES ESPECIALES**

**Información de tu mascota:**
- **Raza:** ${mascota.raza || 'No especificada'}
- **Edad:** ${mascota.edad || 'No especificada'} años
- **Color:** ${mascota.color || 'No especificado'}

**Eres un veterinario especialista en enfermedades caninas.** Proporciona información detallada sobre enfermedades comunes y cómo prevenirlas o manejarlas específicamente para ${mascota.nombre || 'tu mascota'}.

**Por favor, aborda estos temas importantes:**

**1. 🦠 ENFERMEDADES PARASITARIAS MÁS COMUNES**

**SARNA (Sarcoptes scabiei):**
- **Síntomas:** Picazón intensa, pérdida de pelo, costras
- **Prevención:** Tratamientos antiparasitarios regulares
- **Tratamiento:** Baños medicados, medicamentos orales
- **Contagio:** A otros perros y humanos
- **Recuperación:** Tiempo estimado y cuidados especiales
- **Limpieza del hogar:** Cómo desinfectar completamente

**PULGAS Y GARRAPATAS:**
- **Identificación:** Cómo detectarlas en ${mascota.nombre || 'tu mascota'}
- **Prevención:** Collares, pipetas, sprays preventivos
- **Tratamiento:** Productos específicos por edad y peso
- **Enfermedades transmitidas:** Lyme, Ehrlichia, Anaplasma
- **Limpieza ambiental:** Aspirado, lavado, productos específicos
- **Resistencia:** Qué hacer si los productos no funcionan

**2. 🦠 ENFERMEDADES VIRALES FRECUENTES**

**MOQUILLO CANINO:**
- **Síntomas:** Fiebre, secreción nasal, tos, vómitos
- **Prevención:** Vacunación anual obligatoria
- **Tratamiento:** Cuidados de apoyo, antibióticos
- **Secuelas:** Posibles problemas neurológicos
- **Aislamiento:** Cómo prevenir contagio
- **Recuperación:** Tiempo y cuidados necesarios

**PARVOVIRUS:**
- **Síntomas:** Vómitos, diarrea con sangre, deshidratación
- **Prevención:** Vacunación en cachorros
- **Tratamiento:** Hospitalización, fluidos intravenosos
- **Supervivencia:** Factores que influyen
- **Desinfección:** Productos que matan el virus
- **Cuidados post-recuperación:** Alimentación especial

**3. 🦠 ENFERMEDADES BACTERIANAS**

**LEPTOSPIROSIS:**
- **Transmisión:** Agua contaminada, orina de roedores
- **Síntomas:** Fiebre, vómitos, ictericia
- **Prevención:** Vacunación, evitar aguas estancadas
- **Tratamiento:** Antibióticos específicos
- **Zoonosis:** Riesgo para humanos
- **Recuperación:** Tiempo y cuidados especiales

**BORRELIOSIS (Enfermedad de Lyme):**
- **Transmisión:** Picadura de garrapata
- **Síntomas:** Cojera, fiebre, pérdida de apetito
- **Prevención:** Control de garrapatas, vacunación
- **Diagnóstico:** Análisis de sangre específicos
- **Tratamiento:** Antibióticos prolongados
- **Secuelas:** Problemas articulares crónicos

**4. 🦠 ENFERMEDADES FÚNGICAS**

**DERMATOFITOSIS (Tiña):**
- **Síntomas:** Lesiones circulares, pérdida de pelo
- **Diagnóstico:** Cultivo fúngico, lámpara de Wood
- **Tratamiento:** Antifúngicos tópicos y orales
- **Contagio:** A otros animales y humanos
- **Limpieza:** Desinfección de objetos y ambiente
- **Prevención:** Evitar contacto con animales infectados

**5. 🦠 ENFERMEDADES DEL SISTEMA RESPIRATORIO**

**TOS DE LAS PERRERAS:**
- **Síntomas:** Tos seca, arcadas, secreción nasal
- **Causas:** Virus, bacterias, estrés
- **Prevención:** Vacunación, evitar aglomeraciones
- **Tratamiento:** Antibióticos, antitusivos
- **Aislamiento:** Cómo prevenir contagio
- **Recuperación:** Tiempo y cuidados necesarios

**6. 🦠 ENFERMEDADES DEL SISTEMA DIGESTIVO**

**GASTROENTERITIS:**
- **Causas:** Virus, bacterias, parásitos, alimentos
- **Síntomas:** Vómitos, diarrea, deshidratación
- **Tratamiento:** Ayuno, hidratación, medicamentos
- **Alimentación:** Dieta blanda de recuperación
- **Prevención:** Vacunación, higiene, alimentación adecuada
- **Cuándo preocuparse:** Signos de deshidratación severa

**7. 🦠 ENFERMEDADES DE LA PIEL**

**DERMATITIS ATOPICA:**
- **Síntomas:** Picazón, enrojecimiento, lesiones
- **Causas:** Alergias, irritantes ambientales
- **Diagnóstico:** Pruebas de alergia, biopsia
- **Tratamiento:** Antihistamínicos, corticoides, inmunoterapia
- **Cuidados:** Baños especiales, cremas hidratantes
- **Prevención:** Evitar alérgenos identificados

**8. 🦠 SITUACIONES DE EMERGENCIA**

**ENVENENAMIENTO:**
- **Síntomas:** Vómitos, diarrea, convulsiones, dificultad respiratoria
- **Causas comunes:** Chocolate, uvas, medicamentos, productos químicos
- **Primeros auxilios:** Inducir vómito, carbón activado
- **Tratamiento:** Lavado gástrico, medicamentos específicos
- **Prevención:** Mantener sustancias tóxicas fuera del alcance
- **Recuperación:** Tiempo y cuidados especiales

**FORMATO DE RESPUESTA:**
- Usa títulos con **texto en negrita**
- Incluye viñetas con • para cada punto
- Proporciona ejemplos específicos para ${mascota.raza || 'la raza de tu mascota'}
- Incluye tablas de síntomas y tratamientos
- Menciona cuándo es urgente acudir al veterinario
- Proporciona un plan de acción paso a paso
- Incluye información sobre costos aproximados de tratamientos
`;
};
