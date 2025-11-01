// Servicio para integración con APIs de IA
// Hugging Face como principal, Cohere como fallback

import { API_KEYS, verificarConfiguracionAPIs, inicializarTokensDesdeFirebase } from '../config/apiKeys';

class AIService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 horas
    this.storageKey = 'consejos_ia_cache';
    this.maxPeticionesPorMes = 3; // Límite de peticiones a la API por mes
    
    // Intentar cargar cache, si falla, migrar
    try {
      this.cargarCacheDesdeStorage();
    } catch (error) {
      console.warn('Error cargando cache, intentando migración:', error);
      this.migrarCacheCorrupto();
    }
  }

  // Normaliza el nombre de la raza: minúsculas, sin acentos, sin dobles espacios
  normalizarRaza(raza) {
    if (!raza) return '';
    const texto = String(raza)
      .toLowerCase()
      // elimina acentos
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      // elimina caracteres no letra ni espacio
      .replace(/[^a-z\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return texto;
  }

  // Obtiene la clave normalizada para la cache con validación de usuario y mascota
  obtenerClaveCache(raza, userId = null, mascotaId = null) {
    const razaNorm = this.normalizarRaza(raza);
    const user = userId || 'anon';
    const mascota = mascotaId || 'none';
    return `consejos_ia_${user}_${mascota}_${razaNorm}`;
  }

  // Obtener clave para el historial completo de un usuario/mascota
  obtenerClaveHistorial(userId, mascotaId) {
    if (!userId || !mascotaId) return null;
    return `historial_consejos_${userId}_${mascotaId}`;
  }

  // Verificar si el usuario puede hacer más peticiones este mes
  puedeHacerPeticion(userId, mascotaId) {
    if (!userId || !mascotaId) return true; // Sin validación para usuarios anónimos
    
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = ahora.getMonth() + 1; // getMonth() devuelve 0-11
    const clavePeticiones = `peticiones_${userId}_${mascotaId}_${año}_${mes}`;
    
    try {
      const peticionesEsteMes = parseInt(localStorage.getItem(clavePeticiones) || '0');
      return peticionesEsteMes < this.maxPeticionesPorMes;
    } catch (error) {
      console.warn('Error verificando límite de peticiones:', error);
      return true; // En caso de error, permitir la petición
    }
  }

  // Registrar una petición realizada
  registrarPeticion(userId, mascotaId) {
    if (!userId || !mascotaId) return;
    
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = ahora.getMonth() + 1; // getMonth() devuelve 0-11
    const clavePeticiones = `peticiones_${userId}_${mascotaId}_${año}_${mes}`;
    
    try {
      const peticionesEsteMes = parseInt(localStorage.getItem(clavePeticiones) || '0');
      localStorage.setItem(clavePeticiones, (peticionesEsteMes + 1).toString());
    } catch (error) {
      console.warn('Error registrando petición:', error);
    }
  }

  // Obtener número de peticiones restantes este mes basado en consejos reales
  obtenerPeticionesRestantes(userId, mascotaId) {
    if (!userId || !mascotaId) return this.maxPeticionesPorMes;
    
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = ahora.getMonth() + 1; // getMonth() devuelve 0-11
    
    try {
      const consejosEsteMes = this.contarConsejosPorMes(userId, mascotaId, año, mes);
      return Math.max(0, this.maxPeticionesPorMes - consejosEsteMes);
    } catch (error) {
      console.warn('Error obteniendo peticiones restantes:', error);
      return this.maxPeticionesPorMes;
    }
  }

  // Obtener temáticas ya usadas para un usuario/mascota específicos
  obtenerTematicasUsadas(userId, mascotaId) {
    if (!userId || !mascotaId) return [];
    
    const tematicasUsadas = [];
    const ahora = Date.now();
    
    for (const [key, entrada] of this.cache.entries()) {
      if (entrada.userId === userId && entrada.mascotaId === mascotaId) {
        // Solo incluir entradas válidas (no expiradas)
        if (ahora - entrada.timestamp < this.cacheExpiry) {
          // Si es un array de consejos, procesar cada uno
          if (Array.isArray(entrada.data)) {
            entrada.data.forEach(consejo => {
              const tematica = consejo.tematica;
              if (tematica && !tematicasUsadas.includes(tematica)) {
                tematicasUsadas.push(tematica);
              }
            });
          } else {
            // Formato antiguo: consejo individual
            const tematica = entrada.data?.tematica || entrada.tematica;
            if (tematica && !tematicasUsadas.includes(tematica)) {
              tematicasUsadas.push(tematica);
            }
          }
        }
      }
    }
    
    return tematicasUsadas;
  }

  // Obtener estación actual (hemisferio sur - Argentina)
  obtenerEstacionActual() {
    const mes = new Date().getMonth() + 1; // 1-12
    // Estaciones para Argentina (hemisferio sur)
    if (mes >= 12 || mes <= 2) return 'verano';    // Diciembre, Enero, Febrero
    if (mes >= 3 && mes <= 5) return 'otoño';      // Marzo, Abril, Mayo
    if (mes >= 6 && mes <= 8) return 'invierno';   // Junio, Julio, Agosto
    return 'primavera';                             // Septiembre, Octubre, Noviembre
  }

  // Generar temática automática basada en la raza y contexto, evitando repeticiones
  generarTematica(raza, userId = null, mascotaId = null) {
    const razaNorm = this.normalizarRaza(raza);
    const estacion = this.obtenerEstacionActual();
    
    // Temáticas específicas por raza con enfoques contextuales
    const tematicas = {
      'golden': [
        `Cuidados en ${estacion}`, 
        'Actividades en casa', 
        'Interacción con niños', 
        'Ejercicio acuático', 
        'Socialización con otros perros',
        'Cuidados del pelo dorado',
        'Actividades al aire libre',
        'Interacción con visitas'
      ],
      'labrador': [
        `Cuidados en ${estacion}`, 
        'Actividades en casa', 
        'Interacción con niños', 
        'Control de peso', 
        'Socialización con otros perros',
        'Cuidados de oídos',
        'Actividades al aire libre',
        'Interacción con visitas'
      ],
      'pastor': [
        `Cuidados en ${estacion}`, 
        'Actividades en casa', 
        'Interacción con niños', 
        'Ejercicio mental', 
        'Socialización con otros perros',
        'Liderazgo y obediencia',
        'Actividades al aire libre',
        'Interacción con visitas'
      ],
      'bulldog': [
        `Cuidados en ${estacion}`, 
        'Actividades en casa', 
        'Interacción con niños', 
        'Respiración y temperatura', 
        'Socialización con otros perros',
        'Cuidados faciales',
        'Actividades al aire libre',
        'Interacción con visitas'
      ],
      'chihuahua': [
        `Cuidados en ${estacion}`, 
        'Actividades en casa', 
        'Interacción con niños', 
        'Protección del frío', 
        'Socialización con otros perros',
        'Cuidados dentales',
        'Actividades al aire libre',
        'Interacción con visitas'
      ],
      'beagle': [
        `Cuidados en ${estacion}`, 
        'Actividades en casa', 
        'Interacción con niños', 
        'Control de olfato', 
        'Socialización con otros perros',
        'Ejercicio diario',
        'Actividades al aire libre',
        'Interacción con visitas'
      ],
      'mestizo': [
        `Cuidados en ${estacion}`, 
        'Actividades en casa', 
        'Interacción con niños', 
        'Adaptabilidad', 
        'Socialización con otros perros',
        'Cuidados básicos',
        'Actividades al aire libre',
        'Interacción con visitas'
      ]
    };

    // Obtener temáticas ya usadas
    const tematicasUsadas = this.obtenerTematicasUsadas(userId, mascotaId);
    console.log('Temáticas ya usadas:', tematicasUsadas);

    // Buscar temática específica por raza
    for (const [razaKey, temas] of Object.entries(tematicas)) {
      if (razaNorm.includes(razaKey)) {
        // Filtrar temáticas ya usadas
        const temasDisponibles = temas.filter(tema => !tematicasUsadas.includes(tema));
        
        if (temasDisponibles.length > 0) {
          const temaSeleccionado = temasDisponibles[Math.floor(Math.random() * temasDisponibles.length)];
          console.log(`Temática seleccionada para ${raza}: ${temaSeleccionado}`);
          return temaSeleccionado;
        } else {
          // Si todas las temáticas específicas ya se usaron, usar una general
          console.log(`Todas las temáticas específicas de ${raza} ya se usaron, usando temática general`);
          break;
        }
      }
    }

    // Temáticas generales contextuales si no se encuentra específica o ya se usaron todas
    const tematicasGenerales = [
      `Cuidados en ${estacion}`,
      'Actividades en casa',
      'Interacción con niños',
      'Socialización con otros perros',
      'Actividades al aire libre',
      'Interacción con visitas',
      'Alimentación balanceada',
      'Ejercicio y actividad física',
      'Entrenamiento y comportamiento',
      'Prevención de enfermedades',
      'Higiene y grooming',
      'Señales de alerta',
      'Cuidados especiales por edad'
    ];

    // Filtrar temáticas generales ya usadas
    const temasGeneralesDisponibles = tematicasGenerales.filter(tema => !tematicasUsadas.includes(tema));
    
    if (temasGeneralesDisponibles.length > 0) {
      const temaSeleccionado = temasGeneralesDisponibles[Math.floor(Math.random() * temasGeneralesDisponibles.length)];
      console.log(`Temática general seleccionada: ${temaSeleccionado}`);
      return temaSeleccionado;
    } else {
      // Si todas las temáticas ya se usaron, reiniciar con la primera específica
      console.log('Todas las temáticas ya se usaron, reiniciando con temática básica');
      return `Cuidados en ${estacion}`;
    }
  }

  // Generar prompt optimizado para reducir consumo de créditos
  // Estrategia: prompt ultra-conciso (60-80 palabras vs 350 anteriores)
  // Por qué: menos tokens = menos procesamiento = menos créditos consumidos
  generarPrompt(raza, tematica = null) {
    const razaNorm = this.normalizarRaza(raza);
    const esMestizo = razaNorm.includes('mestizo') || razaNorm.includes('criollo');
    const tema = tematica || this.generarTematica(raza);
    
    // Determinar contexto mínimo según temática (sin repeticiones)
    let contexto = '';
    if (tema.includes('Cuidados en')) {
      const estacion = tema.split(' ')[2];
      contexto = `para ${estacion}`;
    } else if (tema.includes('Actividades en casa')) {
      contexto = 'en interiores';
    } else if (tema.includes('Interacción con niños')) {
      contexto = 'con niños';
    } else if (tema.includes('Socialización')) {
      contexto = 'con otros perros';
    } else if (tema.includes('al aire libre')) {
      contexto = 'al aire libre';
    } else if (tema.includes('visitas')) {
      contexto = 'con visitas';
    }
    
    // Prompt optimizado: solo lo esencial
    // Reducción de ~350 palabras a ~60 palabras = 82% menos tokens
    const tipoRaza = esMestizo ? 'perro mestizo' : raza;
    // Límite aumentado a 250 palabras para permitir respuestas completas (especialmente dietas detalladas)
    const promptBase = `Veterinario. ${tema} ${contexto ? `(${contexto})` : ''} para ${tipoRaza}. 3-4 consejos prácticos con datos específicos. Español, máximo 250 palabras.`;

    return promptBase;
  }

  // Sanea y limita el prompt para compatibilidad con modelos y reducir costo
  // Optimización: límite más estricto (500 chars vs 1800) para prompts ya optimizados
  sanitizarPrompt(texto, maxChars = 500) {
    if (!texto) return '';
    let limpio = String(texto);
    // Eliminar emojis y caracteres fuera del BMP que inflan el prompt innecesariamente
    try {
      const emojiRegex = /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF][\uDC00-\uDFFF])/g;
      limpio = limpio.replace(emojiRegex, '');
    } catch (_) {
      // Si el regex falla en algún motor, continuamos sin eliminar emojis
    }
    // Colapsar espacios en blanco excesivos
    limpio = limpio.replace(/\s{2,}/g, ' ').trim();
    // Límite más estricto: prompts optimizados no deberían superar 500 caracteres
    // Si se excede, truncar y agregar instrucción mínima
    if (limpio.length > maxChars) {
      limpio = `${limpio.slice(0, maxChars)}. Español, conciso.`;
    }
    return limpio;
  }

  // Verificar si hay datos en cache con validación de usuario y mascota
  getFromCache(raza, userId = null, mascotaId = null) {
    const key = this.obtenerClaveCache(raza, userId, mascotaId);
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      // Validación de doble autenticación
      if (userId && mascotaId && 
          cached.userId === userId && 
          cached.mascotaId === mascotaId) {
        // Si es un array, devolver el último consejo
        if (Array.isArray(cached.data) && cached.data.length > 0) {
          const ultimoConsejo = cached.data[cached.data.length - 1];
          return {
            ...ultimoConsejo,
            fechaCreacion: ultimoConsejo.fechaCreacion || cached.fechaCreacion
          };
        }
        return {
          ...cached.data,
          fechaCreacion: cached.data?.fechaCreacion || cached.fechaCreacion
        };
      } else if (!userId && !mascotaId) {
        // Para usuarios anónimos, solo validar que no haya userId/mascotaId en caché
        if (!cached.userId && !cached.mascotaId) {
          // Si es un array, devolver el último consejo
          if (Array.isArray(cached.data) && cached.data.length > 0) {
            const ultimoConsejo = cached.data[cached.data.length - 1];
            return {
              ...ultimoConsejo,
              fechaCreacion: ultimoConsejo.fechaCreacion || cached.fechaCreacion
            };
          }
          return {
            ...cached.data,
            fechaCreacion: cached.data?.fechaCreacion || cached.fechaCreacion
          };
        }
      }
    }
    return null;
  }

  // Cargar cache desde localStorage
  cargarCacheDesdeStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const cacheData = JSON.parse(stored);
        const tmpMap = new Map();
        let migrado = false;

        if (Array.isArray(cacheData)) {
          for (const [rawKey, value] of cacheData) {
            let normalizedKey = rawKey;
            let entrada = value;

            // Migración de formato antiguo (solo raza) a nuevo (usuario+mascota+raza)
            if (rawKey && String(rawKey).startsWith('raza:')) {
              const razaAntigua = rawKey.replace(/^raza:/, '');
              normalizedKey = this.obtenerClaveCache(razaAntigua);
              entrada = {
                data: typeof value === 'string' ? value : value.data,
                timestamp: typeof value === 'string' ? Date.now() : value.timestamp,
                userId: null,
                mascotaId: null,
                raza: razaAntigua,
                fechaCreacion: new Date().toISOString()
              };
              migrado = true;
            } else if (rawKey && String(rawKey).startsWith('consejos_ia_')) {
              // Formato nuevo - manejar estructura anidada correctamente
              if (typeof value === 'string') {
                // Formato antiguo: solo string
                entrada = { 
                  data: value, 
                  timestamp: Date.now(),
                  userId: null,
                  mascotaId: null,
                  raza: rawKey.split('_').pop(),
                  fechaCreacion: new Date().toISOString()
                };
              } else if (value && typeof value === 'object') {
                // Formato nuevo: objeto con estructura correcta
                entrada = {
                  data: value.data || value,
                  timestamp: value.timestamp || Date.now(),
                  userId: value.userId || null,
                  mascotaId: value.mascotaId || null,
                  raza: value.raza || rawKey.split('_').pop(),
                  fechaCreacion: value.fechaCreacion || new Date().toISOString()
                };
              }
            }

            // Solo agregar si la entrada es válida
            if (entrada && entrada.data) {
              const existente = tmpMap.get(normalizedKey);
              if (!existente || (entrada.timestamp > existente.timestamp)) {
                tmpMap.set(normalizedKey, entrada);
              }
            }
          }
        }

        this.cache = tmpMap;
        console.log('Cache cargado desde localStorage:', this.cache.size, 'entradas');
        if (migrado) {
          this.guardarCacheEnStorage();
        }
      }
    } catch (error) {
      console.warn('Error cargando cache desde localStorage:', error);
      // En caso de error, limpiar el cache corrupto
      this.limpiarCache();
    }
  }

  // Guardar cache en localStorage
  guardarCacheEnStorage() {
    try {
      const cacheArray = Array.from(this.cache.entries());
      localStorage.setItem(this.storageKey, JSON.stringify(cacheArray));
      console.log('Cache guardado en localStorage');
    } catch (error) {
      console.warn('Error guardando cache en localStorage:', error);
    }
  }

  // Guardar en cache con metadatos completos
  setCache(raza, data, userId = null, mascotaId = null) {
    const key = this.obtenerClaveCache(raza, userId, mascotaId);
    const ahora = new Date().toISOString();
    
    // Obtener entrada existente o crear nueva
    const entradaExistente = this.cache.get(key);
    let consejosArray = [];
    
    if (entradaExistente && entradaExistente.data && Array.isArray(entradaExistente.data)) {
      // Ya existe un array de consejos, agregar el nuevo
      consejosArray = [...entradaExistente.data];
    } else if (entradaExistente && entradaExistente.data) {
      // Existe un consejo individual, convertirlo a array
      consejosArray = [entradaExistente.data];
    }
    
    // Agregar fecha de creación al consejo individual
    const consejoConFecha = {
      ...data,
      fechaCreacion: ahora,
      timestamp: Date.now()
    };
    
    // Agregar el nuevo consejo al array
    consejosArray.push(consejoConFecha);
    
    // Guardar el array completo
    this.cache.set(key, {
      data: consejosArray,
      timestamp: Date.now(),
      userId,
      mascotaId,
      raza: this.normalizarRaza(raza),
      fechaCreacion: entradaExistente?.fechaCreacion || ahora, // Fecha del primer consejo
      ultimaActualizacion: ahora
    });
    
    this.guardarCacheEnStorage();
  }

  // Llamada a Hugging Face API con múltiples modelos y tokens de fallback
  async llamarHuggingFace(raza, tematica = null, promptPersonalizado = null) {
    console.log('🔍 === DEBUG HUGGING FACE ===');
    console.log('Raza:', raza);
    console.log('Temática:', tematica);
    console.log('Prompt personalizado:', !!promptPersonalizado);
    
    // Asegurar que los tokens estén inicializados desde Firebase
    await inicializarTokensDesdeFirebase();
    
    // Verificar configuración de API keys (ahora es async)
    const config = await verificarConfiguracionAPIs();
    console.log('📋 Configuración de APIs:', config);
    
    // Verificar cada token individualmente con detalles
    console.log('🔍 === VERIFICACIÓN DE TOKENS ===');
    const token1 = API_KEYS.HUGGING_FACE_TOKEN || '';
    const token2 = API_KEYS.HUGGING_FACE_TOKEN_FALLBACK || '';
    const token3 = API_KEYS.HUGGING_FACE_TOKEN_FALLBACK2 || '';
    
    console.log('📌 Token Principal (VITE_HUGGING_FACE_TOKEN):');
    console.log('  - Configurado:', !!token1);
    console.log('  - Longitud:', token1.length);
    console.log('  - Primeros 8 chars:', token1.length > 0 ? `${token1.substring(0, 8)}...` : 'NO CONFIGURADO');
    
    console.log('📌 Token Fallback 1 (VITE_HUGGING_FACE_TOKEN1):');
    console.log('  - Configurado:', !!token2);
    console.log('  - Longitud:', token2.length);
    console.log('  - Primeros 8 chars:', token2.length > 0 ? `${token2.substring(0, 8)}...` : 'NO CONFIGURADO');
    
    console.log('📌 Token Fallback 2 (VITE_HUGGING_FACE_TOKEN2):');
    console.log('  - Configurado:', !!token3);
    console.log('  - Longitud:', token3.length);
    console.log('  - Primeros 8 chars:', token3.length > 0 ? `${token3.substring(0, 8)}...` : 'NO CONFIGURADO');
    
    // Obtener todos los tokens disponibles (incluyendo fallback2 si existe)
    const tokens = [
      token1,
      token2,
      token3
    ].filter(token => token && token.trim().length > 0);
    
    console.log('✅ Tokens válidos encontrados:', tokens.length);
    console.log('📊 Resumen:');
    console.log(`  - Token principal: ${token1.length > 0 ? '✅' : '❌'}`);
    console.log(`  - Fallback 1: ${token2.length > 0 ? '✅' : '❌'}`);
    console.log(`  - Fallback 2: ${token3.length > 0 ? '✅' : '❌'}`);
    
    if (tokens.length === 0) {
      const errorMsg = '❌ CRÍTICO: Ningún token de Hugging Face configurado. Verifica tu archivo .env';
      console.error(errorMsg);
      console.error('💡 Variables necesarias en .env:');
      console.error('   - VITE_HUGGING_FACE_TOKEN (requerido)');
      console.error('   - VITE_HUGGING_FACE_TOKEN1 (opcional, fallback)');
      console.error('   - VITE_HUGGING_FACE_TOKEN2 (opcional, fallback)');
      throw new Error(errorMsg);
    }
    
    // Validar que los tokens no sean strings vacíos
    const tokensInvalidos = tokens.filter(t => !t || t.trim().length === 0);
    if (tokensInvalidos.length > 0) {
      console.warn('⚠️ Algunos tokens están vacíos o inválidos');
    }
    
    console.log(`🎯 Se usarán ${tokens.length} token(s) en este orden:`);
    tokens.forEach((token, index) => {
      const origen = index === 0 ? 'Principal' : index === 1 ? 'Fallback 1' : 'Fallback 2';
      console.log(`   ${index + 1}. ${origen} (${token.substring(0, 8)}...)`);
    });

    const prompt = promptPersonalizado || this.generarPrompt(raza, tematica);
    const promptLimpio = this.sanitizarPrompt(prompt);
    console.log('📝 Prompt generado (limpio):');
    console.log('Longitud:', promptLimpio.length);
    console.log('Primeros 200 chars:', promptLimpio.substring(0, 200));
    console.log('Últimos 200 chars:', promptLimpio.substring(Math.max(0, promptLimpio.length - 200)));
    
    // ESTRATEGIA: Usar modelos compatibles con la NUEVA API de Hugging Face
    // NUEVA API: router.huggingface.co/v1/chat/completions (formato OpenAI)
    // Prioridad: Modelos pequeños y baratos primero (para ahorrar créditos)
    const modelosPrioridad = [
      'meta-llama/Llama-3.2-1B-Instruct',   // ✅ 1B parámetros - MÁS BARATO
      'HuggingFaceH4/zephyr-7b-beta',       // ✅ 7B pero optimizado - MODERADO
      'mistralai/Mistral-7B-Instruct-v0.1', // ✅ 7B instructivo - MODERADO
      'Qwen/Qwen2.5-0.5B-Instruct',        // ✅ 0.5B - MUY BARATO (si está disponible)
      'microsoft/phi-2'                     // ✅ 2.7B - BARATO (si está disponible)
    ];
    
    // NOTA: La nueva API usa formato OpenAI compatible
    // Estos modelos están optimizados para instrucciones y son más baratos que GPT-OSS grandes
    
    console.log(`🎯 Probando modelos en orden: ${modelosPrioridad.join(' → ')}`);
    console.log(`💡 Máximo de intentos: ${modelosPrioridad.length} modelos × ${tokens.length} tokens = ${modelosPrioridad.length * tokens.length}`);
    
    // Rastrear todos los errores para diagnóstico
    const errores = [];
    
    // Intentar cada modelo con cada token
    for (const modelo of modelosPrioridad) {
      console.log(`\n🔄 === INTENTANDO MODELO: ${modelo} ===`);
      
      for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex++) {
        const token = tokens[tokenIndex];
        const tokenOrigen = tokenIndex === 0 ? 'Principal' : tokenIndex === 1 ? 'Fallback 1' : 'Fallback 2';
        const tokenPreview = token.substring(0, 8) + '...';
        
        console.log(`   🔑 Token: ${tokenOrigen} (${tokenPreview})`);
        
        const resultado = await this.intentarModelo(modelo, token, promptLimpio, tokenIndex + 1, errores);
        if (resultado) {
          console.log(`\n✅ ¡ÉXITO! Usando ${modelo} con token ${tokenOrigen} (${tokenPreview})`);
          return resultado;
        }
        
        // Si este token falló con 404 (modelo no existe), no probar más tokens con este modelo
        const ultimoError = errores[errores.length - 1];
        if (ultimoError && ultimoError.status === 404) {
          console.log(`   ⚠️ Modelo ${modelo} no existe (404) - saltando al siguiente modelo`);
          break; // Salir del loop de tokens y probar siguiente modelo
        }
      }
    }

    // Si llegamos aquí, todos los modelos y tokens fallaron
    console.error('\n❌ === RESUMEN DE ERRORES ===');
    console.error(`Modelos probados: ${modelosPrioridad.join(', ')}`);
    console.error(`Total de intentos: ${errores.length}`);
    
    // Analizar tipos de error
    const errores404 = errores.filter(e => e.status === 404).length;
    const errores401 = errores.filter(e => e.status === 401 || e.status === 403).length;
    const errores503 = errores.filter(e => e.status === 503).length;
    const otrosErrores = errores.length - errores404 - errores401 - errores503;
    
    console.error(`📊 Desglose de errores:`);
    console.error(`  - 404 (Modelo no encontrado): ${errores404}`);
    console.error(`  - 401/403 (Tokens inválidos): ${errores401}`);
    console.error(`  - 503 (Modelo cargando): ${errores503}`);
    console.error(`  - Otros errores: ${otrosErrores}`);
    
    // Agrupar errores por modelo para mejor diagnóstico
    const erroresPorModelo = {};
    errores.forEach(error => {
      if (!erroresPorModelo[error.modelo]) {
        erroresPorModelo[error.modelo] = [];
      }
      erroresPorModelo[error.modelo].push(error);
    });
    
    console.error(`\n📋 Errores por modelo:`);
    Object.entries(erroresPorModelo).forEach(([modelo, errs]) => {
      console.error(`  ${modelo}:`);
      errs.forEach(err => {
        const tokenOrigen = err.tokenNum === 1 ? 'Principal' : err.tokenNum === 2 ? 'Fallback 1' : 'Fallback 2';
        console.error(`    - Token ${err.tokenNum} (${tokenOrigen}): ${err.status || 'Network'}`);
      });
    });
    
    // Mensaje de error más específico según el tipo de fallo
    let errorMsg = '';
    if (errores401 > 0 && errores.length === errores401) {
      errorMsg = `Todos los tokens de Hugging Face son inválidos (401 Unauthorized). Verifica que tus tokens en .env sean correctos.`;
    } else if (errores404 === errores.length) {
      errorMsg = `Ninguno de los modelos probados está disponible (404). Los modelos pueden haber sido movidos o descontinuados. Intenta más tarde o actualiza la lista de modelos.`;
    } else if (errores503 > 0) {
      errorMsg = `Algunos modelos están cargando (503). Espera 1-2 minutos e intenta de nuevo.`;
    } else {
      errorMsg = `No se pudo generar consejos. Se probaron ${modelosPrioridad.length} modelos con ${tokens.length} tokens. Revisa la consola para detalles.`;
    }
    
    throw new Error(errorMsg);
  }

  // Método auxiliar optimizado para intentar un modelo específico
  // ACTUALIZADO: Usa la nueva API de Hugging Face (router.huggingface.co/v1/chat/completions)
  // Formato OpenAI-compatible con mensajes en lugar de inputs
  async intentarModelo(modelo, token, promptLimpio, tokenNum, errores = []) {
    try {
      console.log(`🔄 Intentando con modelo: ${modelo} (token ${tokenNum})`);
      
      // NUEVA API: Formato OpenAI-compatible
      const requestBody = {
        messages: [
          {
            role: 'user',
            content: promptLimpio
          }
        ],
        model: modelo,
        stream: false,
        max_tokens: 400,     // Aumentado de 150 a 400 para permitir respuestas completas (dietas, consejos detallados)
        temperature: 0.8
      };
      
      const inicioTiempo = Date.now();
      // NUEVA URL: router.huggingface.co/v1/chat/completions
      const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      const tiempoTranscurrido = Date.now() - inicioTiempo;

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Modelo ${modelo} funcionó correctamente con token ${tokenNum} (${tiempoTranscurrido}ms)`);
        console.log('📥 Respuesta completa:', data);
        // Nueva API devuelve formato OpenAI: { choices: [{ message: { content: "..." } }] }
        return this.procesarRespuestaHuggingFaceNueva(data);
      } else {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = 'No se pudo leer el error';
        }
        
        // Registrar error para diagnóstico
        const errorInfo = {
          modelo,
          tokenNum,
          status: response.status,
          mensaje: errorText.substring(0, 200), // Limitar longitud
          tiempo: tiempoTranscurrido
        };
        errores.push(errorInfo);
        
        // Errores que NO consumen créditos (404, 401, 403) - continuar
        if (response.status === 404) {
          console.warn(`⚠️ Modelo ${modelo} no existe (404) - probando siguiente...`);
          return null;
        }
        
        if (response.status === 401 || response.status === 403) {
          console.warn(`⚠️ Token ${tokenNum} no autorizado (${response.status}) - ${errorText.substring(0, 100)}`);
          return null; // Continuar con siguiente token
        }
        
        // Error 503: modelo cargando - NO esperar (ahorra tiempo y créditos potenciales)
        if (response.status === 503) {
          console.warn(`⚠️ Modelo ${modelo} está cargando (503) - saltando para ahorrar tiempo...`);
          return null;
        }
        
        // Error 429: Rate limit - esperar un poco o continuar
        if (response.status === 429) {
          console.warn(`⚠️ Rate limit alcanzado para ${modelo} (429) - probando siguiente...`);
          return null;
        }
        
        // Otros errores: puede haber consumido créditos parcialmente
        console.warn(`❌ Modelo ${modelo} falló con status ${response.status} - ${errorText.substring(0, 100)}`);
        return null;
      }
    } catch (error) {
      // Registrar error de red
      errores.push({
        modelo,
        tokenNum,
        status: null,
        mensaje: error.message,
        tiempo: null
      });
      console.warn(`❌ Error de red con modelo ${modelo}:`, error.message);
      return null; // Continuar con siguiente modelo
    }
  }

  // Llamada a Cohere API (fallback)
  async llamarCohere(raza, tematica = null, promptPersonalizado = null) {
    if (!API_KEYS.COHERE_API_KEY) {
      throw new Error('Cohere API key no configurado');
    }

    const prompt = promptPersonalizado || this.generarPrompt(raza, tematica);
    
    try {
      const response = await fetch('https://api.cohere.ai/v1/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEYS.COHERE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'command',
          prompt: prompt,
          max_tokens: 500,
          temperature: 0.7,
          stop_sequences: ['---']
        })
      });

      if (!response.ok) {
        throw new Error(`Cohere API error: ${response.status}`);
      }

      const data = await response.json();
      return this.procesarRespuestaCohere(data);
    } catch (error) {
      console.error('Error en Cohere API:', error);
      throw error;
    }
  }

  // Procesar respuesta de Hugging Face (API antigua - formato legacy)
  procesarRespuestaHuggingFace(data) {
    console.log('🔍 === PROCESANDO RESPUESTA HUGGING FACE (LEGACY) ===');
    console.log('📥 Data recibida:', data);
    console.log('📥 Tipo de data:', typeof data);
    console.log('📥 Es array:', Array.isArray(data));
    
    if (Array.isArray(data) && data.length > 0) {
      console.log('📥 Primer elemento:', data[0]);
      console.log('📥 generated_text:', data[0].generated_text);
      console.log('📥 text:', data[0].text);
      
      const resultado = data[0].generated_text || data[0].text || 'No se pudo generar consejos específicos.';
      console.log('✅ Resultado final:', resultado);
      return resultado;
    }
    
    console.log('❌ No se pudo procesar la respuesta');
    return 'No se pudo generar consejos específicos.';
  }

  // Procesar respuesta de Hugging Face (NUEVA API - formato OpenAI-compatible)
  procesarRespuestaHuggingFaceNueva(data) {
    console.log('🔍 === PROCESANDO RESPUESTA HUGGING FACE (NUEVA API) ===');
    console.log('📥 Data recibida:', data);
    console.log('📥 Tipo de data:', typeof data);
    
    // Nueva API devuelve formato OpenAI:
    // { choices: [{ message: { role: 'assistant', content: '...' } }] }
    if (data && data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
      const primeraRespuesta = data.choices[0];
      console.log('📥 Primera choice:', primeraRespuesta);
      
      if (primeraRespuesta.message && primeraRespuesta.message.content) {
        const resultado = primeraRespuesta.message.content.trim();
        console.log('✅ Resultado final (nueva API):', resultado);
        return resultado;
      }
    }
    
    // Fallback: intentar otros formatos posibles
    if (data.content) {
      console.log('✅ Resultado encontrado en data.content');
      return data.content.trim();
    }
    
    console.log('❌ No se pudo procesar la respuesta de la nueva API');
    console.log('📥 Estructura completa:', JSON.stringify(data, null, 2));
    return 'No se pudo generar consejos específicos.';
  }

  // Procesar respuesta de Cohere
  procesarRespuestaCohere(data) {
    if (data.generations && data.generations.length > 0) {
      return data.generations[0].text || 'No se pudo generar consejos específicos.';
    }
    return 'No se pudo generar consejos específicos.';
  }

  // Función principal para obtener consejos con validación de usuario y límites
  async obtenerConsejosRaza(raza, forzarRegeneracion = false, userId = null, mascotaId = null, tipoConsejo = null, promptPersonalizado = null) {
    // Usar tipo de consejo si se proporciona, sino generar temática automática
    const tema = tipoConsejo || this.generarTematica(raza, userId, mascotaId);
    
    // Verificar cache primero (solo si no se fuerza regeneración)
    if (!forzarRegeneracion) {
      const cached = this.getFromCache(raza, userId, mascotaId);
      if (cached) {
        console.log('Consejos obtenidos desde caché para:', { raza, userId, mascotaId, tematica: tema });
        return { ...cached, tematica: tema };
      }
    }

    // Verificar si ya existe un consejo con esta temática para evitar repetición
    if (userId && mascotaId && !forzarRegeneracion) {
      const tematicasUsadas = this.obtenerTematicasUsadas(userId, mascotaId);
      if (tematicasUsadas.includes(tema)) {
        console.log(`⚠️ Ya existe un consejo con temática "${tema}", generando nueva temática...`);
        const nuevaTematica = this.generarTematica(raza, userId, mascotaId);
        if (nuevaTematica !== tema) {
          console.log(`Nueva temática generada: ${nuevaTematica}`);
          return await this.obtenerConsejosRaza(raza, false, userId, mascotaId, nuevaTematica);
        }
      }
    }

    // Verificar límite de peticiones mensuales basado en consejos reales
    if (userId && mascotaId) {
      const estadoFreno = this.verificarFrenoPeticiones(userId, mascotaId);
      if (!estadoFreno.puedeHacerPeticion) {
        throw new Error(estadoFreno.mensaje);
      }
    }

    try {
      // Intentar Hugging Face primero
      const consejos = await this.llamarHuggingFace(raza, tema, promptPersonalizado);
      const resultado = { consejos, tematica: tema, fuente: 'huggingface' };
      this.setCache(raza, resultado, userId, mascotaId);
      this.registrarPeticion(userId, mascotaId);
      console.log('Consejos generados por Hugging Face para:', { raza, userId, mascotaId, tematica: tema });
      return resultado;
    } catch (huggingFaceError) {
      console.warn('Hugging Face falló, intentando Cohere:', huggingFaceError);
      
      try {
        // Fallback a Cohere
        const consejos = await this.llamarCohere(raza, tema, promptPersonalizado);
        const resultado = { consejos, tematica: tema, fuente: 'cohere' };
        this.setCache(raza, resultado, userId, mascotaId);
        this.registrarPeticion(userId, mascotaId);
        console.log('Consejos generados por Cohere para:', { raza, userId, mascotaId, tematica: tema });
        return resultado;
      } catch (cohereError) {
        console.error('Ambas APIs fallaron:', cohereError);
        
        // En lugar de consejos predefinidos, devolver mensaje de IA no disponible
        const mensajeIANoDisponible = `**Servicio de IA temporalmente no disponible**

**¿Qué significa esto?**
• Los servicios de inteligencia artificial no están respondiendo en este momento
• Esto puede deberse a mantenimiento o alta demanda del servicio
• No se ha consumido tu petición mensual

**¿Qué puedes hacer?**
• Intenta generar consejos nuevamente en unos minutos
• Los consejos predefinidos están disponibles en otras secciones
• Tu límite mensual de 3 consejos personalizados se mantiene intacto

**Información técnica:**
• Fuente: Servicios de IA externos (Hugging Face/Cohere)
• Estado: Temporalmente no disponible
• Próximo intento: En unos minutos

*Por favor, intenta nuevamente más tarde. Gracias por tu paciencia.*`;

        const resultado = { 
          consejos: mensajeIANoDisponible, 
          tematica: tema, 
          fuente: 'ia_no_disponible',
          error: true,
          mensajeError: 'Servicios de IA temporalmente no disponibles'
        };
        
        // No guardar en cache cuando hay error de IA
        console.log('IA no disponible para:', { raza, userId, mascotaId, tematica: tema });
        return resultado;
      }
    }
  }

  // Regenerar consejos (forzar nueva generación)
  async regenerarConsejos(raza, userId = null, mascotaId = null, tipoConsejo = null, promptPersonalizado = null) {
    console.log('Regenerando consejos para:', { raza, userId, mascotaId, tipoConsejo });
    return await this.obtenerConsejosRaza(raza, true, userId, mascotaId, tipoConsejo, promptPersonalizado);
  }

  // Limpiar cache
  limpiarCache() {
    this.cache.clear();
    localStorage.removeItem(this.storageKey);
    console.log('Cache limpiado');
  }

  // Limpiar cache corrupto y reiniciar
  limpiarCacheCorrupto() {
    console.warn('Limpiando cache corrupto...');
    this.limpiarCache();
    // Reinicializar con estructura limpia
    this.cache = new Map();
  }

  // Migrar cache corrupto a formato limpio
  migrarCacheCorrupto() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return;

      const cacheData = JSON.parse(stored);
      if (!Array.isArray(cacheData)) {
        this.limpiarCacheCorrupto();
        return;
      }

      const tmpMap = new Map();
      let migrado = false;

      for (const [rawKey, value] of cacheData) {
        try {
          let normalizedKey = rawKey;
          let entrada = null;

          // Detectar y corregir estructura anidada
          if (value && typeof value === 'object' && value.data) {
            // Estructura correcta: {data: {...}, timestamp: ..., userId: ...}
            entrada = {
              data: value.data,
              timestamp: value.timestamp || Date.now(),
              userId: value.userId || null,
              mascotaId: value.mascotaId || null,
              raza: value.raza || rawKey.split('_').pop(),
              fechaCreacion: value.fechaCreacion || new Date().toISOString()
            };
          } else if (typeof value === 'string') {
            // Formato antiguo: solo string
            entrada = {
              data: value,
              timestamp: Date.now(),
              userId: null,
              mascotaId: null,
              raza: rawKey.split('_').pop(),
              fechaCreacion: new Date().toISOString()
            };
            migrado = true;
          }

          if (entrada && entrada.data) {
            tmpMap.set(normalizedKey, entrada);
          }
        } catch (itemError) {
          console.warn('Error procesando entrada del cache:', itemError);
          continue;
        }
      }

      this.cache = tmpMap;
      if (migrado) {
        this.guardarCacheEnStorage();
        console.log('Cache migrado exitosamente');
      }
    } catch (error) {
      console.error('Error en migración de cache:', error);
      this.limpiarCacheCorrupto();
    }
  }

  // Obtener estadísticas del cache
  obtenerEstadisticasCache() {
    const ahora = Date.now();
    const entradasValidas = Array.from(this.cache.values()).filter(
      entrada => ahora - entrada.timestamp < this.cacheExpiry
    );
    
    return {
      total: this.cache.size,
      validas: entradasValidas.length,
      expiradas: this.cache.size - entradasValidas.length
    };
  }

  // Inspeccionar estructura del cache para debugging
  inspeccionarCache() {
    console.log('=== INSPECCIÓN DEL CACHE ===');
    console.log('Total de entradas:', this.cache.size);
    
    for (const [key, value] of this.cache.entries()) {
      console.log(`\nClave: ${key}`);
      console.log('Valor:', value);
      console.log('Tipo de data:', typeof value.data);
      console.log('Tiene userId:', !!value.userId);
      console.log('Tiene mascotaId:', !!value.mascotaId);
    }
    
    // Inspeccionar localStorage también
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('\n=== ESTRUCTURA EN LOCALSTORAGE ===');
        console.log('Tipo:', Array.isArray(parsed) ? 'Array' : typeof parsed);
        console.log('Longitud:', Array.isArray(parsed) ? parsed.length : 'N/A');
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log('Primera entrada:', parsed[0]);
        }
      }
    } catch (error) {
      console.error('Error inspeccionando localStorage:', error);
    }
  }

  // Detectar si el cache está corrupto
  detectarCacheCorrupto() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return false;

      const cacheData = JSON.parse(stored);
      if (!Array.isArray(cacheData)) return true;

      // Verificar si hay estructuras anidadas incorrectas
      for (const [key, value] of cacheData) {
        if (value && typeof value === 'object' && value.data && typeof value.data === 'object' && value.data.data) {
          console.warn('Cache corrupto detectado: estructura anidada incorrecta');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.warn('Cache corrupto detectado: error de parsing');
      return true;
    }
  }

  // Obtener historial de consejos para un usuario y mascota específicos
  obtenerHistorialConsejos(userId, mascotaId) {
    if (!userId || !mascotaId) return [];
    
    const historial = [];
    const ahora = Date.now();
    
    for (const [key, entrada] of this.cache.entries()) {
      // Verificar que sea del usuario y mascota correctos
      if (entrada.userId === userId && entrada.mascotaId === mascotaId) {
        // Solo incluir entradas válidas (no expiradas)
        if (ahora - entrada.timestamp < this.cacheExpiry) {
          // Si es un array de consejos, procesar cada uno
          if (Array.isArray(entrada.data)) {
            entrada.data.forEach((consejo, index) => {
              historial.push({
                id: `${key}_${index}`,
                raza: entrada.raza,
                tematica: consejo.tematica || 'General',
                consejos: consejo.consejos || consejo,
                fuente: consejo.fuente || 'predefinidos',
                fechaCreacion: consejo.fechaCreacion || entrada.fechaCreacion,
                timestamp: consejo.timestamp || entrada.timestamp
              });
            });
          } else {
            // Formato antiguo: consejo individual
            historial.push({
              id: key,
              raza: entrada.raza,
              tematica: entrada.data?.tematica || 'General',
              consejos: entrada.data?.consejos || entrada.data,
              fuente: entrada.data?.fuente || 'predefinidos',
              fechaCreacion: entrada.data?.fechaCreacion || entrada.fechaCreacion,
              timestamp: entrada.data?.timestamp || entrada.timestamp
            });
          }
        }
      }
    }
    
    // Ordenar por fecha de creación (más reciente primero)
    return historial.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
  }

  // Obtener consejo específico del historial
  obtenerConsejoDelHistorial(historialId) {
    const entrada = this.cache.get(historialId);
    if (!entrada) return null;
    
    return {
      consejos: entrada.data?.consejos || entrada.data,
      tematica: entrada.data?.tematica || 'General',
      fuente: entrada.data?.fuente || 'predefinidos',
      fechaCreacion: entrada.fechaCreacion,
      raza: entrada.raza
    };
  }

  // Limpiar historial específico de usuario/mascota
  limpiarHistorialUsuario(userId, mascotaId) {
    if (!userId || !mascotaId) return;
    
    const clavesAEliminar = [];
    for (const [key, entrada] of this.cache.entries()) {
      if (entrada.userId === userId && entrada.mascotaId === mascotaId) {
        clavesAEliminar.push(key);
      }
    }
    
    clavesAEliminar.forEach(key => this.cache.delete(key));
    this.guardarCacheEnStorage();
    console.log(`Historial limpiado para usuario ${userId}, mascota ${mascotaId}: ${clavesAEliminar.length} entradas eliminadas`);
  }

  // Obtener estadísticas de temáticas para un usuario/mascota
  obtenerEstadisticasTematicas(userId, mascotaId) {
    if (!userId || !mascotaId) return { total: 0, tematicas: [], disponibles: 0 };
    
    const tematicasUsadas = this.obtenerTematicasUsadas(userId, mascotaId);
    const historial = this.obtenerHistorialConsejos(userId, mascotaId);
    
    // Contar temáticas por frecuencia
    const conteoTematicas = {};
    historial.forEach(item => {
      const tema = item.tematica;
      conteoTematicas[tema] = (conteoTematicas[tema] || 0) + 1;
    });
    
    // Calcular temáticas disponibles (estimación basada en el nuevo sistema)
    const tematicasDisponibles = Math.max(0, 3 - tematicasUsadas.length); // 3 temáticas por mes
    
    return {
      total: historial.length,
      tematicas: Object.entries(conteoTematicas).map(([tema, count]) => ({ tema, count })),
      disponibles: tematicasDisponibles,
      usadas: tematicasUsadas
    };
  }

  // Contar consejos generados en un mes específico
  contarConsejosPorMes(userId, mascotaId, año, mes) {
    if (!userId || !mascotaId) return 0;
    
    const historial = this.obtenerHistorialConsejos(userId, mascotaId);
    let contador = 0;
    
    historial.forEach(consejo => {
      if (consejo.fechaCreacion) {
        const fechaConsejo = new Date(consejo.fechaCreacion);
        const añoConsejo = fechaConsejo.getFullYear();
        const mesConsejo = fechaConsejo.getMonth() + 1; // getMonth() devuelve 0-11
        
        if (añoConsejo === año && mesConsejo === mes) {
          contador++;
        }
      }
    });
    
    return contador;
  }

  // Verificar estado del freno de peticiones basado en consejos reales
  verificarFrenoPeticiones(userId, mascotaId) {
    if (!userId || !mascotaId) {
      return {
        puedeHacerPeticion: true,
        peticionesRestantes: this.maxPeticionesPorMes,
        peticionesEsteMes: 0,
        limite: this.maxPeticionesPorMes,
        mensaje: 'Usuario anónimo - sin límites'
      };
    }

    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = ahora.getMonth() + 1; // getMonth() devuelve 0-11
    
    try {
      // Contar consejos reales generados este mes
      const consejosEsteMes = this.contarConsejosPorMes(userId, mascotaId, año, mes);
      const peticionesRestantes = Math.max(0, this.maxPeticionesPorMes - consejosEsteMes);
      const puedeHacerPeticion = consejosEsteMes < this.maxPeticionesPorMes;
      
      console.log(`Verificación de límites para ${userId}/${mascotaId}:`, {
        año,
        mes,
        consejosEsteMes,
        peticionesRestantes,
        puedeHacerPeticion
      });
      
      return {
        puedeHacerPeticion,
        peticionesRestantes,
        peticionesEsteMes: consejosEsteMes,
        limite: this.maxPeticionesPorMes,
        mensaje: puedeHacerPeticion 
          ? `Tienes ${peticionesRestantes} consejos disponibles este mes`
          : `Límite mensual alcanzado (${consejosEsteMes}/${this.maxPeticionesPorMes} consejos generados)`
      };
    } catch (error) {
      console.warn('Error verificando freno de peticiones:', error);
      return {
        puedeHacerPeticion: true,
        peticionesRestantes: this.maxPeticionesPorMes,
        peticionesEsteMes: 0,
        limite: this.maxPeticionesPorMes,
        mensaje: 'Error verificando límites - permitiendo petición'
      };
    }
  }

  // Consejos predefinidos como último recurso, adaptados a la temática
  obtenerConsejosPredefinidos(raza, tematica = null) {
    const razaNorm = this.normalizarRaza(raza);
    const esMestizo = razaNorm.includes('mestizo') || razaNorm.includes('criollo');
    
    // Si hay temática específica, generar consejos adaptados
    if (tematica) {
      return this.generarConsejosPredefinidosPorTematica(raza, tematica, esMestizo);
    }
    
    // Consejos generales si no hay temática específica
    if (esMestizo) {
      return `**Consejos para perros mestizos:**

**Alimentación:**
• Observa el tamaño y nivel de actividad para determinar la cantidad de comida
• Los perros mestizos pueden tener estómagos más sensibles, introduce cambios gradualmente
• Consulta con el veterinario sobre el mejor tipo de alimento según su edad y peso

**Ejercicio:**
• Adapta el ejercicio según el tamaño y energía de tu perro
• Los mestizos suelen ser muy activos, necesitan paseos diarios
• Observa si prefiere juegos de alta intensidad o actividades más tranquilas

**Salud:**
• Los perros mestizos pueden tener menos predisposición genética a ciertas enfermedades
• Mantén un calendario de vacunación regular
• Observa cambios en comportamiento que puedan indicar problemas de salud

**Comportamiento:**
• Cada perro mestizo es único, observa sus preferencias y personalidad
• Pueden ser muy inteligentes y adaptables al entrenamiento
• La socialización temprana es clave para un desarrollo equilibrado`;
    } else {
      // Consejos específicos por raza (más detallados)
      const consejosPorRaza = this.obtenerConsejosEspecificosPorRaza(raza);
      return consejosPorRaza;
    }
  }

  // Generar consejos predefinidos específicos por temática
  generarConsejosPredefinidosPorTematica(raza, tematica, esMestizo) {
    const razaNombre = esMestizo ? 'perros mestizos' : raza;
    
    if (tematica.includes('Cuidados en')) {
      const estacion = tematica.split(' ')[2];
      return `**${tematica} para ${razaNombre}:**

**Protección del clima:**
• En ${estacion}, ajusta los horarios de paseo según la temperatura
• Proporciona acceso constante a agua fresca y limpia
• Observa señales de incomodidad por el clima

**Alimentación estacional:**
• Ajusta las porciones según el nivel de actividad en ${estacion}
• Considera suplementos si es necesario para esta época del año
• Mantén horarios regulares de comida

**Ejercicio adaptado:**
• Modifica la intensidad del ejercicio según las condiciones climáticas
• Busca actividades apropiadas para ${estacion}
• Observa el comportamiento para ajustar la rutina

**Señales de alerta:**
• Vigila cambios en apetito, energía o comportamiento
• Observa signos de estrés por el clima
• Consulta al veterinario si notas algo inusual

**Recomendación práctica:**
• Prepara un plan de cuidados específico para ${estacion}
• Ten siempre un plan B para días de clima extremo`;
    }
    
    if (tematica.includes('Actividades en casa')) {
      return `**${tematica} para ${razaNombre}:**

**Juegos de interior:**
• Usa juguetes interactivos para mantener la mente activa
• Crea circuitos de obstáculos con muebles seguros
• Juegos de olfato con premios escondidos

**Ejercicio mental:**
• Puzzles de comida para estimular el intelecto
• Enseña nuevos trucos y comandos
• Rotación de juguetes para mantener el interés

**Actividades de enriquecimiento:**
• Crea áreas de descanso cómodas y seguras
• Proporciona juguetes de diferentes texturas
• Establece rutinas de juego regulares

**Señales de alerta:**
• Observa si se aburre o muestra comportamientos destructivos
• Vigila el nivel de actividad y energía
• Ajusta las actividades según la respuesta

**Recomendación práctica:**
• Dedica 15-30 minutos diarios a actividades en casa
• Varía las actividades para mantener el interés`;
    }
    
    if (tematica.includes('Interacción con niños')) {
      return `**${tematica} para ${razaNombre}:**

**Supervisión constante:**
• Siempre supervisa las interacciones entre perros y niños
• Enseña a los niños a respetar el espacio del perro
• Establece reglas claras para ambas partes

**Actividades apropiadas:**
• Juegos suaves y controlados
• Enseñar trucos juntos bajo supervisión
• Actividades de cuidado como cepillado

**Señales de estrés:**
• Observa si el perro se aleja o muestra incomodidad
• Vigila el lenguaje corporal y las señales de calma
• Interrumpe la interacción si es necesario

**Educación para niños:**
• Enseña a los niños a no molestar al perro mientras come o duerme
• Explica cómo acercarse de forma segura
• Fomenta el respeto mutuo

**Recomendación práctica:**
• Comienza con interacciones cortas y positivas
• Premia el buen comportamiento de ambas partes`;
    }
    
    if (tematica.includes('Socialización con otros perros')) {
      return `**${tematica} para ${razaNombre}:**

**Presentaciones seguras:**
• Comienza con perros conocidos y tranquilos
• Usa correa y mantén control en todo momento
• Observa el lenguaje corporal de ambos perros

**Entornos apropiados:**
• Parques caninos con supervisión
• Caminatas grupales con perros conocidos
• Clases de socialización profesional

**Señales de comportamiento:**
• Observa posturas de juego vs. agresión
• Reconoce señales de estrés o incomodidad
• Interrumpe si la situación se tensa

**Progresión gradual:**
• Comienza con interacciones cortas
• Aumenta gradualmente el tiempo y complejidad
• Siempre termina con experiencias positivas

**Recomendación práctica:**
• Socializa regularmente pero sin forzar
• Cada perro tiene su propio ritmo de socialización`;
    }
    
    if (tematica.includes('Actividades al aire libre')) {
      return `**${tematica} para ${razaNombre}:**

**Ejercicio en espacios abiertos:**
• Aprovecha parques y áreas verdes seguras
• Varía las rutas para mantener el interés
• Combina ejercicio físico con exploración mental

**Juegos al aire libre:**
• Fetch y juegos de recuperación
• Caminatas de olfato y exploración
• Actividades acuáticas si es apropiado

**Precauciones de seguridad:**
• Mantén al perro bajo control en todo momento
• Verifica que el área esté libre de peligros
• Ten agua disponible durante las actividades

**Equipamiento necesario:**
• Correa resistente y cómoda
• Collar con identificación
• Bolsas para desechos

**Recomendación práctica:**
• Planifica actividades según el clima y energía del perro
• Ajusta la intensidad según la edad y condición física`;
    }
    
    if (tematica.includes('Interacción con visitas')) {
      return `**${tematica} para ${razaNombre}:**

**Preparación para visitas:**
• Entrena al perro para comportarse con extraños
• Establece un lugar seguro donde pueda retirarse
• Prepara a las visitas sobre cómo interactuar

**Técnicas de presentación:**
• Permite que el perro se acerque a su ritmo
• Evita contacto directo inicial
• Usa premios para asociar visitas con experiencias positivas

**Manejo de situaciones:**
• Mantén al perro bajo control durante las visitas
• Observa señales de estrés o incomodidad
• Ten un plan para manejar comportamientos no deseados

**Educación para visitas:**
• Explica las reglas de interacción
• Enseña a las visitas a respetar el espacio del perro
• Proporciona instrucciones claras

**Recomendación práctica:**
• Practica regularmente con visitas conocidas
• Gradualmente introduce visitas menos familiares`;
    }
    
    // Temática general si no coincide con ninguna específica
    return `**${tematica} para ${razaNombre}:**

**Consejos específicos:**
• Adapta los cuidados según las necesidades de ${razaNombre}
• Observa el comportamiento individual de tu mascota
• Consulta con profesionales cuando sea necesario

**Aplicación práctica:**
• Implementa los consejos gradualmente
• Observa la respuesta de tu mascota
• Ajusta según sea necesario

**Señales de alerta:**
• Vigila cambios en comportamiento o salud
• Consulta al veterinario si tienes dudas
• Mantén un registro de observaciones

**Recomendación práctica:**
• Cada mascota es única, adapta los consejos a su personalidad
• La consistencia es clave para el éxito`;
  }

  // Consejos específicos por raza (más detallados)
  obtenerConsejosEspecificosPorRaza(raza) {
    const razaLower = this.normalizarRaza(raza);
    
    // Consejos específicos para razas populares
    if (razaLower.includes('golden') || razaLower.includes('retriever')) {
      return `**Consejos específicos para Golden Retriever:**

**Alimentación:**
• 2-3 tazas de comida seca de alta calidad al día (dividida en 2 comidas)
• Evita sobrealimentación - son propensos a la obesidad
• Alimentos ricos en omega-3 para mantener el pelo brillante
• Agua fresca siempre disponible

**Ejercicio:**
• 60-90 minutos de ejercicio diario (paseos + juegos)
• Les encanta nadar - excelente ejercicio de bajo impacto
• Juegos de búsqueda y recuperación
• Evita ejercicio excesivo en cachorros (puede dañar articulaciones)

**Salud:**
• Propensos a displasia de cadera - controla el peso
• Problemas de oído - limpia regularmente
• Cáncer común - chequeos regulares después de los 7 años
• Vacunación anual + desparasitación

**Comportamiento:**
• Muy sociables y amigables
• Fáciles de entrenar con refuerzo positivo
• Necesitan mucha interacción social
• Excelentes con niños y otras mascotas

**Cuidados Especiales:**
• Cepillado diario para evitar enredos
• Baño cada 6-8 semanas
• Revisión dental regular
• Control de peso estricto`;
    }
    
    if (razaLower.includes('labrador')) {
      return `**Consejos específicos para Labrador:**

**Alimentación:**
• 2.5-3 tazas de comida seca al día (dividida en 2 comidas)
• Control estricto de porciones - muy propensos a la obesidad
• Alimentos para razas grandes y activas
• Evita dar comida de mesa

**Ejercicio:**
• 60-90 minutos de ejercicio diario
• Les encanta nadar y jugar en el agua
• Juegos de búsqueda y recuperación
• Ejercicio mental con puzzles y juguetes interactivos

**Salud:**
• Displasia de cadera y codo común
• Problemas de oído - limpieza regular
• Obesidad - control de peso estricto
• Chequeos regulares para detectar problemas temprano

**Comportamiento:**
• Muy enérgicos y juguetones
• Fáciles de entrenar pero necesitan consistencia
• Excelentes con niños
• Pueden ser destructivos si no se ejercitan

**Cuidados Especiales:**
• Cepillado 2-3 veces por semana
• Baño cada 6-8 semanas
• Control de peso semanal
• Ejercicio mental diario`;
    }
    
    if (razaLower.includes('pastor') || razaLower.includes('german')) {
      return `**Consejos específicos para Pastor Alemán:**

**Alimentación:**
• 3-4 tazas de comida seca al día (dividida en 2 comidas)
• Alimentos para razas grandes y activas
• Suplementos para articulaciones recomendados
• Evita cambios bruscos en la dieta

**Ejercicio:**
• 90-120 minutos de ejercicio diario
• Ejercicio mental es tan importante como el físico
• Entrenamiento de obediencia regular
• Juegos de búsqueda y rastreo

**Salud:**
• Displasia de cadera muy común - control de peso
• Problemas de espalda - evita saltos excesivos
• Problemas digestivos - dieta de calidad
• Chequeos regulares para detectar problemas temprano

**Comportamiento:**
• Muy inteligentes y leales
• Necesitan un líder firme pero justo
• Excelentes perros de trabajo
• Pueden ser protectores - socialización temprana

**Cuidados Especiales:**
• Cepillado diario durante la muda
• Baño cada 6-8 semanas
• Control de peso estricto
• Ejercicio mental diario obligatorio`;
    }
    
    // Bulldog (tolerante a variantes: buldog, bulldog ingles, english bulldog)
    if (
      razaLower.includes('bulldog') ||
      razaLower.includes('buldog') ||
      (razaLower.includes('english') && razaLower.includes('bulldog')) ||
      (razaLower.includes('bulldog') && razaLower.includes('ingles'))
    ) {
      return `**Consejos específicos para Bulldog:**

**Alimentación:**
• 1.5-2 tazas de comida seca al día (dividida en 2 comidas)
• Alimentos para razas braquicéfalas (cara chata)
• Evita sobrealimentación - propensos a obesidad
• Comida de alta calidad para evitar flatulencias

**Ejercicio:**
• 30-45 minutos de ejercicio diario (moderado)
• Evita ejercicio intenso en clima caliente
• Paseos cortos y frecuentes
• Juegos suaves en interiores

**Salud:**
• Problemas respiratorios - evita sobrecalentamiento
• Problemas de piel en pliegues - limpieza regular
• Displasia de cadera - control de peso
• Problemas oculares - limpieza diaria

**Comportamiento:**
• Tranquilos y relajados
• Excelentes perros de apartamento
• Muy cariñosos con la familia
• Pueden ser tercos - entrenamiento paciente

**Cuidados Especiales:**
• Limpieza diaria de pliegues faciales
• Baño cada 4-6 semanas
• Control de temperatura estricto
• Cuidados dentales regulares`;
    }
    
    if (razaLower.includes('chihuahua')) {
      return `**Consejos específicos para Chihuahua:**

**Alimentación:**
• 1/4 - 1/2 taza de comida seca al día
• Alimentos para razas pequeñas
• Comida de alta calidad - estómagos sensibles
• Dividir en 3-4 comidas pequeñas

**Ejercicio:**
• 20-30 minutos de ejercicio diario
• Paseos cortos pero frecuentes
• Juegos en interiores
• Evita saltos desde alturas

**Salud:**
• Problemas dentales - limpieza regular
• Hipoglucemia - comidas frecuentes
• Problemas de rodilla - evita saltos
• Frío - ropa de abrigo en invierno

**Comportamiento:**
• Muy valientes para su tamaño
• Pueden ser nerviosos - socialización temprana
• Excelentes perros de alerta
• Muy leales a su dueño

**Cuidados Especiales:**
• Cepillado 2-3 veces por semana
• Baño cada 6-8 semanas
• Protección del frío
• Cuidados dentales diarios`;
    }
    
    if (razaLower.includes('beagle')) {
      return `**Consejos específicos para Beagle:**

**Alimentación:**
• 1-1.5 tazas de comida seca al día
• Control estricto de porciones - muy glotones
• Alimentos para razas medianas activas
• Evita dejar comida accesible

**Ejercicio:**
• 60-90 minutos de ejercicio diario
• Les encanta olfatear y rastrear
• Juegos de búsqueda y recuperación
• Ejercicio mental con puzzles

**Salud:**
• Obesidad - control de peso estricto
• Problemas de oído - limpieza regular
• Epilepsia - chequeos regulares
• Problemas de tiroides - monitoreo

**Comportamiento:**
• Muy enérgicos y curiosos
• Excelentes rastreadores
• Pueden ser destructivos si se aburren
• Muy sociables con otros perros

**Cuidados Especiales:**
• Cepillado 2-3 veces por semana
• Baño cada 6-8 semanas
• Control de peso semanal
• Ejercicio mental diario obligatorio`;
    }
    
    // Consejos generales para otras razas (con variaciones)
    const consejosGenerales = this.obtenerConsejosGeneralesVariados(raza);
    return consejosGenerales;
  }

  // Función de test para validar APIs de IA
  async testAPIs() {
    console.log('🧪 === TEST DE APIs DE IA ===');
    
    // Asegurar que los tokens estén inicializados desde Firebase
    await inicializarTokensDesdeFirebase();
    
    // Test 1: Verificar configuración
    console.log('1️⃣ Verificando configuración...');
    const config = await verificarConfiguracionAPIs();
    console.log('Configuración:', config);
    
    if (!config.huggingFace && !config.huggingFaceFallback) {
      console.log('❌ No hay tokens de Hugging Face configurados');
      return { success: false, error: 'No hay tokens configurados' };
    }
    
    // Test 2: Probar múltiples modelos
    console.log('2️⃣ Probando múltiples modelos de Hugging Face...');
    const tokens = [API_KEYS.HUGGING_FACE_TOKEN, API_KEYS.HUGGING_FACE_TOKEN_FALLBACK].filter(token => token);
    const modelosTest = [
      'microsoft/DialoGPT-small',
      'facebook/blenderbot-400M-distill',
      'gpt2',
      'distilgpt2',
      'EleutherAI/gpt-neo-125M'
    ];
    
    const promptTest = 'Eres un veterinario. Responde en español: ¿Cuáles son los cuidados básicos para un perro?';
    console.log('Prompt de test:', promptTest);
    
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      console.log(`🔑 Probando token ${i + 1}/${tokens.length}`);
      
      for (const modelo of modelosTest) {
        try {
          console.log(`🔄 Probando modelo: ${modelo}`);
          
          const response = await fetch(`https://api-inference.huggingface.co/models/${modelo}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputs: promptTest,
              parameters: {
                max_length: 100,
                temperature: 0.7,
                do_sample: true
              }
            })
          });
          
          console.log(`📡 ${modelo} - Status: ${response.status} ${response.statusText}`);
          
          if (response.ok) {
            const data = await response.json();
            console.log(`✅ ${modelo} funcionó! Respuesta:`, data);
            return { 
              success: true, 
              data, 
              token: `Token ${i + 1}`, 
              modelo: modelo,
              modelosFuncionando: [modelo]
            };
          } else {
            const errorText = await response.text();
            console.log(`❌ ${modelo} falló ${response.status}:`, errorText);
          }
        } catch (error) {
          console.log(`❌ Error con ${modelo}:`, error.message);
        }
      }
    }
    
    return { success: false, error: 'Todos los modelos fallaron' };
  }

  // Función para probar un modelo específico
  async testModeloEspecifico(modelo, token) {
    console.log(`🧪 Probando modelo específico: ${modelo}`);
    
    const promptTest = 'Eres un veterinario. Responde en español: ¿Cuáles son los cuidados básicos para un perro?';
    
    try {
      const response = await fetch(`https://api-inference.huggingface.co/models/${modelo}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: promptTest,
          parameters: {
            max_length: 100,
            temperature: 0.7,
            do_sample: true
          }
        })
      });
      
      console.log(`📡 Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Respuesta exitosa:', data);
        return { success: true, data, modelo };
      } else {
        const errorText = await response.text();
        console.log(`❌ Error ${response.status}:`, errorText);
        return { success: false, error: errorText, modelo };
      }
    } catch (error) {
      console.log(`❌ Error:`, error);
      return { success: false, error: error.message, modelo };
    }
  }

  // Función de debug para verificar límites (solo en desarrollo)
  debugLimitesMensuales(userId, mascotaId) {
    if (process.env.NODE_ENV !== 'development') return;
    
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = ahora.getMonth() + 1;
    
    console.log('=== DEBUG LÍMITES MENSUALES ===');
    console.log('Usuario:', userId);
    console.log('Mascota:', mascotaId);
    console.log('Año/Mes actual:', año, mes);
    
    const historial = this.obtenerHistorialConsejos(userId, mascotaId);
    console.log('Historial total:', historial.length);
    
    const consejosEsteMes = this.contarConsejosPorMes(userId, mascotaId, año, mes);
    console.log('Consejos este mes:', consejosEsteMes);
    
    const estadoFreno = this.verificarFrenoPeticiones(userId, mascotaId);
    console.log('Estado del freno:', estadoFreno);
    
    // Mostrar fechas de consejos del mes actual
    const consejosDelMes = historial.filter(consejo => {
      if (!consejo.fechaCreacion) return false;
      const fechaConsejo = new Date(consejo.fechaCreacion);
      return fechaConsejo.getFullYear() === año && fechaConsejo.getMonth() + 1 === mes;
    });
    
    console.log('Consejos del mes actual:');
    consejosDelMes.forEach((consejo, index) => {
      console.log(`${index + 1}. ${consejo.tematica} - ${consejo.fechaCreacion}`);
    });
    
    console.log('===============================');
  }

  // Consejos generales con variaciones para evitar repetición
  obtenerConsejosGeneralesVariados(raza) {
    const variaciones = [
      `**Consejos generales para perros de raza ${raza}:**

**Alimentación:**
• Consulta con tu veterinario sobre las necesidades nutricionales específicas
• Mantén horarios regulares de comida
• Proporciona agua fresca siempre disponible
• Alimentos de alta calidad según la edad y tamaño

**Ejercicio:**
• Adapta la actividad física según la raza y edad
• Paseos diarios son esenciales para la salud física y mental
• Juegos interactivos fortalecen el vínculo
• Ejercicio mental con puzzles y entrenamiento

**Salud:**
• Visitas regulares al veterinario
• Mantén al día las vacunaciones
• Observa cambios en comportamiento o apetito
• Chequeos preventivos según la edad

**Comportamiento:**
• Entrenamiento positivo y consistente
• Socialización temprana con personas y otros animales
• Cada perro es único, respeta su personalidad
• Establece rutinas claras y consistentes

**Cuidados Especiales:**
• Grooming según el tipo de pelo
• Cuidados dentales regulares
• Control de peso apropiado
• Enriquecimiento ambiental en casa`,

      `**Guía de cuidados para ${raza}:**

**Alimentación:**
• Cantidad de comida según peso ideal y nivel de actividad
• Horarios fijos de alimentación (2-3 veces al día)
• Agua limpia y fresca siempre disponible
• Evita cambios bruscos en la dieta

**Ejercicio:**
• Actividad física diaria adaptada a la raza
• Paseos regulares para estimulación mental
• Juegos que estimulen el instinto natural
• Ejercicio mental con juguetes interactivos

**Salud:**
• Chequeos veterinarios regulares
• Calendario de vacunación actualizado
• Observación de cambios en comportamiento
• Prevención de parásitos internos y externos

**Comportamiento:**
• Entrenamiento basado en refuerzo positivo
• Socialización temprana y continua
• Respeto por la individualidad del perro
• Establecimiento de límites claros

**Cuidados Especiales:**
• Mantenimiento del pelaje según tipo
• Higiene dental regular
• Control de peso y condición corporal
• Estimulación ambiental en el hogar`,

      `**Recomendaciones para ${raza}:**

**Alimentación:**
• Dieta balanceada según necesidades específicas
• Frecuencia de comidas apropiada para la edad
• Hidratación adecuada durante todo el día
• Calidad nutricional de los alimentos

**Ejercicio:**
• Ejercicio físico regular y apropiado
• Actividades que mantengan al perro activo
• Interacción social con otros perros
• Estimulación mental diaria

**Salud:**
• Medicina preventiva regular
• Seguimiento de calendario de vacunas
• Detección temprana de problemas de salud
• Cuidados específicos según la edad

**Comportamiento:**
• Educación canina positiva
• Exposición a diferentes entornos
• Comprensión de las necesidades del perro
• Constancia en el entrenamiento

**Cuidados Especiales:**
• Mantenimiento del aspecto físico
• Cuidados bucodentales
• Monitoreo del estado general
• Creación de un ambiente enriquecedor`
    ];

    // Seleccionar una variación aleatoria
    const indiceAleatorio = Math.floor(Math.random() * variaciones.length);
    return variaciones[indiceAleatorio];
  }
}

// Instancia singleton
export const aiService = new AIService();
