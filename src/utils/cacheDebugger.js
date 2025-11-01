// Utilidad para debugging del cache de consejos IA
// Uso: importar en la consola del navegador o usar en desarrollo

import { aiService } from '../services/aiService';

export const cacheDebugger = {
  // Inspeccionar el cache actual
  inspeccionar() {
    console.log('🔍 Inspeccionando cache de consejos IA...');
    aiService.inspeccionarCache();
  },

  // Detectar si el cache está corrupto
  detectarCorrupcion() {
    console.log('🔍 Detectando corrupción del cache...');
    const corrupto = aiService.detectarCacheCorrupto();
    console.log(corrupto ? '❌ Cache corrupto detectado' : '✅ Cache en buen estado');
    return corrupto;
  },

  // Obtener estadísticas del cache
  estadisticas() {
    console.log('📊 Estadísticas del cache:');
    const stats = aiService.obtenerEstadisticasCache();
    console.log(stats);
    return stats;
  },

  // Limpiar cache corrupto
  limpiarCorrupto() {
    console.log('🧹 Limpiando cache corrupto...');
    aiService.limpiarCacheCorrupto();
    console.log('✅ Cache limpiado');
  },

  // Migrar cache corrupto
  migrar() {
    console.log('🔄 Migrando cache corrupto...');
    aiService.migrarCacheCorrupto();
    console.log('✅ Migración completada');
  },

  // Limpiar todo el cache
  limpiarTodo() {
    console.log('🗑️ Limpiando todo el cache...');
    aiService.limpiarCache();
    console.log('✅ Cache completamente limpiado');
  },

  // Verificar estructura de localStorage
  verificarLocalStorage() {
    console.log('🔍 Verificando localStorage...');
    try {
      const stored = localStorage.getItem('consejos_ia_cache');
      if (!stored) {
        console.log('❌ No hay datos en localStorage');
        return;
      }

      const parsed = JSON.parse(stored);
      console.log('Tipo de datos:', Array.isArray(parsed) ? 'Array' : typeof parsed);
      console.log('Longitud:', Array.isArray(parsed) ? parsed.length : 'N/A');
      
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log('Primera entrada:', parsed[0]);
        
        // Verificar si hay anidamiento excesivo
        const primeraEntrada = parsed[0];
        if (primeraEntrada && primeraEntrada[1] && primeraEntrada[1].data && typeof primeraEntrada[1].data === 'object' && primeraEntrada[1].data.data) {
          console.warn('⚠️ Estructura anidada detectada (muñecas rusas)');
        } else {
          console.log('✅ Estructura correcta');
        }
      }
    } catch (error) {
      console.error('❌ Error verificando localStorage:', error);
    }
  },

  // Verificar freno de peticiones
  verificarFreno(userId, mascotaId) {
    console.log('🔒 Verificando freno de peticiones...');
    const estado = aiService.verificarFrenoPeticiones(userId, mascotaId);
    console.log('Estado del freno:', estado);
    return estado;
  },

  // Diagnóstico completo
  diagnosticoCompleto(userId = null, mascotaId = null) {
    console.log('🏥 === DIAGNÓSTICO COMPLETO DEL CACHE ===');
    
    console.log('\n1. Verificando localStorage...');
    this.verificarLocalStorage();
    
    console.log('\n2. Detectando corrupción...');
    const corrupto = this.detectarCorrupcion();
    
    console.log('\n3. Estadísticas del cache...');
    this.estadisticas();
    
    if (userId && mascotaId) {
      console.log('\n4. Verificando freno de peticiones...');
      this.verificarFreno(userId, mascotaId);
    }
    
    if (corrupto) {
      console.log('\n5. ⚠️ Cache corrupto detectado. Ejecutando migración...');
      this.migrar();
      
      console.log('\n6. Verificando después de migración...');
      this.estadisticas();
    } else {
      console.log('\n5. ✅ Cache en buen estado');
    }
    
    console.log('\n🏥 === DIAGNÓSTICO COMPLETADO ===');
  }
};

// Función global para usar en la consola del navegador
if (typeof window !== 'undefined') {
  window.debugCache = cacheDebugger;
  console.log('🛠️ Debugger de cache disponible como window.debugCache');
  console.log('Comandos disponibles:');
  console.log('- debugCache.diagnosticoCompleto() - Diagnóstico completo');
  console.log('- debugCache.inspeccionar() - Inspeccionar cache');
  console.log('- debugCache.limpiarCorrupto() - Limpiar cache corrupto');
  console.log('- debugCache.limpiarTodo() - Limpiar todo el cache');
}
