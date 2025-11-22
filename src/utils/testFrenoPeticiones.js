// Script de prueba para verificar el freno de peticiones
// Uso: importar en la consola del navegador o usar en desarrollo

import { aiService } from '../services/aiService';

export const testFrenoPeticiones = {
  // Simular múltiples peticiones para probar el freno
  async simularPeticiones(userId, mascotaId, raza = 'labrador', cantidad = 5) {
    
    const resultados = [];
    
    for (let i = 1; i <= cantidad; i++) {
      
      // Verificar estado antes de la petición
      const estadoAntes = aiService.verificarFrenoPeticiones(userId, mascotaId);
      
      if (!estadoAntes.puedeHacerPeticion) {
        console.log('❌ Frenado: No se puede hacer más peticiones');
        resultados.push({
          peticion: i,
          estado: 'frenado',
          mensaje: estadoAntes.mensaje
        });
        break;
      }
      
      try {
        // Intentar generar consejos
        const resultado = await aiService.obtenerConsejosRaza(raza, false, userId, mascotaId);
        console.log('✅ Consejo generado:', resultado.tematica);
        
        resultados.push({
          peticion: i,
          estado: 'exitoso',
          tematica: resultado.tematica,
          fuente: resultado.fuente
        });
        
        // Verificar estado después de la petición
        const estadoDespues = aiService.verificarFrenoPeticiones(userId, mascotaId);
        console.log('Estado después:', estadoDespues);
        
      } catch (error) {
        console.log('❌ Error:', error.message);
        resultados.push({
          peticion: i,
          estado: 'error',
          error: error.message
        });
      }
    }
    
    console.log('\n📊 Resumen de resultados:');
    console.table(resultados);
    
    return resultados;
  },

  // Limpiar peticiones del día para reiniciar el test
  limpiarPeticionesDelDia(userId, mascotaId) {
    console.log('🧹 Limpiando peticiones del día...');
    
    const hoy = new Date().toDateString();
    const clavePeticiones = `peticiones_${userId}_${mascotaId}_${hoy}`;
    
    try {
      localStorage.removeItem(clavePeticiones);
      console.log('✅ Peticiones del día limpiadas');
      
      // Verificar que se limpió
      const estado = aiService.verificarFrenoPeticiones(userId, mascotaId);
      console.log('Estado después de limpiar:', estado);
      
    } catch (error) {
      console.error('❌ Error limpiando peticiones:', error);
    }
  },

  // Verificar estructura del cache después de múltiples peticiones
  verificarEstructuraCache(userId, mascotaId) {
    console.log('🔍 Verificando estructura del cache...');
    
    // Inspeccionar cache
    aiService.inspeccionarCache();
    
    // Obtener historial
    const historial = aiService.obtenerHistorialConsejos(userId, mascotaId);
    console.log('\n📚 Historial de consejos:');
    console.log(`Total de consejos: ${historial.length}`);
    
    if (historial.length > 0) {
      console.log('Primeros 3 consejos:');
      historial.slice(0, 3).forEach((consejo, index) => {
        console.log(`${index + 1}. ${consejo.tematica} (${consejo.fuente})`);
      });
    }
    
    // Verificar localStorage
    try {
      const stored = localStorage.getItem('consejos_ia_cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('\n💾 Estructura en localStorage:');
        console.log(`Tipo: ${Array.isArray(parsed) ? 'Array' : typeof parsed}`);
        console.log(`Entradas: ${Array.isArray(parsed) ? parsed.length : 'N/A'}`);
        
        if (Array.isArray(parsed) && parsed.length > 0) {
          const primeraEntrada = parsed[0];
          
          if (primeraEntrada && primeraEntrada[1] && primeraEntrada[1].data) {
            const data = primeraEntrada[1].data;
          }
        }
      }
    } catch (error) {
      console.error('❌ Error verificando localStorage:', error);
    }
  },

  // Test completo: limpiar, simular peticiones, verificar estructura
  async testCompleto(userId, mascotaId, raza = 'labrador') {
    
    // 1. Limpiar peticiones del día
    this.limpiarPeticionesDelDia(userId, mascotaId);
    
    // 2. Simular 5 peticiones
    const resultados = await this.simularPeticiones(userId, mascotaId, raza, 5);
    
    // 3. Verificar estructura del cache
    this.verificarEstructuraCache(userId, mascotaId);
    
    // 4. Resumen final
    const exitosos = resultados.filter(r => r.estado === 'exitoso').length;
    const frenados = resultados.filter(r => r.estado === 'frenado').length;
    const errores = resultados.filter(r => r.estado === 'error').length;
    
    
    return resultados;
  }
};

// Función global para usar en la consola del navegador
if (typeof window !== 'undefined') {
  window.testFreno = testFrenoPeticiones;
}
