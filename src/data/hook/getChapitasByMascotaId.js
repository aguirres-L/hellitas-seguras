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
    
    // Filtrar por ID de mascota
    const chapitasDeLaMascota = todasLasChapitas.filter(chapita => 
      chapita.mascotaId === mascotaId
    );
    
    return chapitasDeLaMascota;
  } catch (error) {
    console.error('Error al obtener chapitas por mascota:', error);
    return [];
  }
};
