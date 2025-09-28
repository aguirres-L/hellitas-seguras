// Script de prueba para verificar el freno de peticiones
// Uso: importar en la consola del navegador o usar en desarrollo

import { aiService } from '../services/aiService';

export const testFrenoPeticiones = {
  // Simular múltiples peticiones para probar el freno
  async simularPeticiones(userId, mascotaId, raza = 'labrador', cantidad = 5) {
    console.log(`🧪 Simulando ${cantidad} peticiones para usuario ${userId}, mascota ${mascotaId}`);
    
    const resultados = [];
    
    for (let i = 1; i <= cantidad; i++) {
      console.log(`\n--- Petición ${i}/${cantidad} ---`);
      
      // Verificar estado antes de la petición
      const estadoAntes = aiService.verificarFrenoPeticiones(userId, mascotaId);
      console.log('Estado antes:', estadoAntes);
      
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
          console.log('Primera entrada:', primeraEntrada);
          
          if (primeraEntrada && primeraEntrada[1] && primeraEntrada[1].data) {
            const data = primeraEntrada[1].data;
            console.log(`Tipo de data: ${Array.isArray(data) ? 'Array' : typeof data}`);
            if (Array.isArray(data)) {
              console.log(`Consejos en array: ${data.length}`);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Error verificando localStorage:', error);
    }
  },

  // Test completo: limpiar, simular peticiones, verificar estructura
  async testCompleto(userId, mascotaId, raza = 'labrador') {
    console.log('🚀 === TEST COMPLETO DEL FRENO DE PETICIONES ===');
    
    // 1. Limpiar peticiones del día
    this.limpiarPeticionesDelDia(userId, mascotaId);
    
    // 2. Simular 5 peticiones
    const resultados = await this.simularPeticiones(userId, mascotaId, raza, 5);
    
    // 3. Verificar estructura del cache
    this.verificarEstructuraCache(userId, mascotaId);
    
    // 4. Resumen final
    console.log('\n📋 === RESUMEN FINAL ===');
    const exitosos = resultados.filter(r => r.estado === 'exitoso').length;
    const frenados = resultados.filter(r => r.estado === 'frenado').length;
    const errores = resultados.filter(r => r.estado === 'error').length;
    
    console.log(`✅ Peticiones exitosas: ${exitosos}`);
    console.log(`🔒 Peticiones frenadas: ${frenados}`);
    console.log(`❌ Peticiones con error: ${errores}`);
    
    if (frenados > 0) {
      console.log('🎯 ¡El freno está funcionando correctamente!');
    } else {
      console.log('⚠️ El freno no se activó - revisar configuración');
    }
    
    return resultados;
  }
};

// Función global para usar en la consola del navegador
if (typeof window !== 'undefined') {
  window.testFreno = testFrenoPeticiones;
  console.log('🧪 Test de freno disponible como window.testFreno');
  console.log('Comandos disponibles:');
  console.log('- testFreno.testCompleto(userId, mascotaId) - Test completo');
  console.log('- testFreno.simularPeticiones(userId, mascotaId, raza, cantidad) - Simular peticiones');
  console.log('- testFreno.limpiarPeticionesDelDia(userId, mascotaId) - Limpiar peticiones');
  console.log('- testFreno.verificarEstructuraCache(userId, mascotaId) - Verificar estructura');
}
