import { getAllDataCollection } from "../firebase";

export const getChapitaFiletForUserId = async (userId) => {

      // Cargar pagos de chapitas
      const chapitas = await getAllDataCollection('pagoChapita');
      console.log('Todas las chapitas:', chapitas);
      const chapitasUsuario = chapitas.filter(pago => pago.usuarioId === userId);
      console.log('Chapitas filtradas:', chapitasUsuario);
      
      return chapitasUsuario;
}