import { getAllDataCollection } from "../firebase";

/**
 * Obtiene todas las chapitas filtradas por ID de mascota específica
 * @param {string} mascotaId - ID de la mascota
 * @returns {Promise<Array>} Array de chapitas de la mascota
 */
export const getChapitasByMascotaId = async (mascotaId) => {
  try {
    // Cargar todas las chapitas
    const todasLasChapitas = await getAllDataCollection('pagoChapita');
    console.log('Todas las chapitas:', todasLasChapitas);
    
    // Filtrar por ID de mascota
    const chapitasDeLaMascota = todasLasChapitas.filter(chapita => 
      chapita.mascotaId === mascotaId
    );
    
    console.log(`Chapitas encontradas para mascota ${mascotaId}:`, {
      mascotaId,
      totalChapitas: chapitasDeLaMascota.length,
      chapitas: chapitasDeLaMascota
    });
    
    return chapitasDeLaMascota;
  } catch (error) {
    console.error('Error al obtener chapitas por mascota:', error);
    return [];
  }
};
