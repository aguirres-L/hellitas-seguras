// Configuración de APIs de IA
// IMPORTANTE: Los tokens se obtienen EXCLUSIVAMENTE desde Firebase (colección 'tokens-ia')
// Esto es más seguro para producción y evita problemas con variables de entorno

import { getAllDataCollection } from "../data/firebase";

// Cache de tokens desde Firebase (para evitar múltiples llamadas)
let tokensCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Obtiene tokens desde Firebase y los cachea
 * @returns {Promise<Object|null>} Objeto con los tokens o null si hay error
 */
async function obtenerTokensDesdeFirebase() {
  // Verificar cache
  if (tokensCache && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_DURATION) {
    console.log('📦 Usando tokens desde cache');
    return tokensCache;
  }

  try {
    const documentos = await getAllDataCollection('tokens-ia');
    console.log('📥 Tokens obtenidos de Firebase:'/* , documentos */);
    
    if (documentos && documentos.length > 0) {
      // Tomar el primer documento (asumiendo que solo hay uno)
      const tokenDoc = documentos[0];
      
      // Extraer tokens del documento
      const tokens = {
        HUGGING_FACE_TOKEN: tokenDoc.VITE_HUGGING_FACE_TOKEN || '',
        HUGGING_FACE_TOKEN_FALLBACK: tokenDoc.VITE_HUGGING_FACE_TOKEN1 || '',
        HUGGING_FACE_TOKEN_FALLBACK2: tokenDoc.VITE_HUGGING_FACE_TOKEN2 || '',
        HUGGING_FACE_TOKEN_FALLBACK3: tokenDoc.VITE_HUGGING_FACE_TOKEN3 || '',
        COHERE_API_KEY: tokenDoc.COHERE_API_KEY || ''
      };
      
      // Guardar en cache
      tokensCache = tokens;
      cacheTimestamp = Date.now();
      
      console.log('✅ Tokens cargados desde Firebase:'/* , {
        huggingFace: !!tokens.HUGGING_FACE_TOKEN,
        fallback1: !!tokens.HUGGING_FACE_TOKEN_FALLBACK,
        fallback2: !!tokens.HUGGING_FACE_TOKEN_FALLBACK2,
        fallback3: !!tokens.HUGGING_FACE_TOKEN_FALLBACK3,
        cohere: !!tokens.COHERE_API_KEY
      } */);
      
      return tokens;
    }
    
    console.warn('⚠️ No se encontraron documentos en tokens-ia');
    return null;
  } catch (error) {
    console.error('❌ Error al obtener tokens desde Firebase:', error);
    return null;
  }
}

/**
 * Obtiene los tokens EXCLUSIVAMENTE desde Firebase
 * @returns {Promise<Object>} Objeto con todos los tokens configurados
 * @throws {Error} Si no se pueden obtener tokens desde Firebase
 */
export async function obtenerAPIKeys() {
  const tokensFirebase = await obtenerTokensDesdeFirebase();
  
  if (!tokensFirebase) {
    throw new Error('❌ No se pudieron cargar tokens desde Firebase. Verifica que la colección "tokens-ia" exista y tenga al menos un documento.');
  }
  
  return tokensFirebase;
}

/**
 * Obtiene tokens de forma síncrona (solo desde cache de Firebase si ya se cargó)
 * Útil para casos donde no se puede usar async
 * IMPORTANTE: Debe llamarse inicializarTokensDesdeFirebase() primero
 * 
 * NOTA: Los tokens SOLO se obtienen desde Firebase (colección 'tokens-ia').
 * Ya no se usan variables de entorno (.env) por seguridad en producción.
 */
export const API_KEYS = {
  // Estos valores SOLO se obtienen desde Firebase (cache)
  get HUGGING_FACE_TOKEN() {
    if (!tokensCache) {
      console.warn('⚠️ Tokens no inicializados. Llama a inicializarTokensDesdeFirebase() primero.');
      return '';
    }
    return tokensCache.HUGGING_FACE_TOKEN || '';
  },
  get HUGGING_FACE_TOKEN_FALLBACK() {
    if (!tokensCache) {
      return '';
    }
    return tokensCache.HUGGING_FACE_TOKEN_FALLBACK || '';
  },
  get HUGGING_FACE_TOKEN_FALLBACK2() {
    if (!tokensCache) {
      return '';
    }
    return tokensCache.HUGGING_FACE_TOKEN_FALLBACK2 || '';
  },
  get HUGGING_FACE_TOKEN_FALLBACK3() {
    if (!tokensCache) {
      return '';
    }
    return tokensCache.HUGGING_FACE_TOKEN_FALLBACK3 || '';
  },
  get COHERE_API_KEY() {
    if (!tokensCache) {
      return '';
    }
    return tokensCache.COHERE_API_KEY || '';
  }
};

/**
 * Inicializa los tokens desde Firebase (DEBE llamarse al inicio de la app)
 * @returns {Promise<boolean>} true si se cargaron correctamente, false si hubo error
 */
export async function inicializarTokensDesdeFirebase() {
  try {
    const tokens = await obtenerTokensDesdeFirebase();
    if (tokens) {
      console.log('✅ Tokens inicializados correctamente desde Firebase');
      return true;
    }
    console.error('❌ No se encontraron tokens en Firebase');
    return false;
  } catch (error) {
    console.error('❌ Error al inicializar tokens desde Firebase:', error);
    return false;
  }
}

/**
 * Función para verificar si las APIs están configuradas
 * Ahora es async para poder cargar desde Firebase primero
 */
export async function verificarConfiguracionAPIs() {
  // Asegurarse de que los tokens estén cargados
  if (!tokensCache) {
    await obtenerTokensDesdeFirebase();
  }
  
  const configurado = {
    huggingFace: !!API_KEYS.HUGGING_FACE_TOKEN,
    huggingFaceFallback: !!API_KEYS.HUGGING_FACE_TOKEN_FALLBACK,
    huggingFaceFallback2: !!API_KEYS.HUGGING_FACE_TOKEN_FALLBACK2,
    huggingFaceFallback3: !!API_KEYS.HUGGING_FACE_TOKEN_FALLBACK3,
    cohere: !!API_KEYS.COHERE_API_KEY
  };
  
  console.log('🔍 Configuración de APIs:'/* , configurado */);
  return configurado;
}

// Inicializar tokens al cargar el módulo (opcional, se puede hacer manualmente también)
// inicializarTokensDesdeFirebase().catch(() => {});
