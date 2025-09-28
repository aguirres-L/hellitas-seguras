// Configuración de APIs de IA
// IMPORTANTE: Agrega estas variables a tu archivo .env

export const API_KEYS = {
  HUGGING_FACE_TOKEN: import.meta.env.VITE_HUGGING_FACE_TOKEN || '',
  HUGGING_FACE_TOKEN_FALLBACK: import.meta.env.VITE_HUGGING_FACE_TOKEN1 || '',
  COHERE_API_KEY:  ''
};

// Función para verificar si las APIs están configuradas
export const verificarConfiguracionAPIs = () => {
  const configurado = {
    huggingFace: !!API_KEYS.HUGGING_FACE_TOKEN,
    huggingFaceFallback: !!API_KEYS.HUGGING_FACE_TOKEN_FALLBACK,
    cohere: !!API_KEYS.COHERE_API_KEY
  };
  
  console.log('Configuración de APIs:', configurado);
  return configurado;
};
