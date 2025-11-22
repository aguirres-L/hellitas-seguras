import { getAllDataCollection } from "../firebase";

export const getChapitaFiletForUserId = async (userId) => {

      // Cargar pagos de chapitas
      const chapitas = await getAllDataCollection('pagoChapita');
      const chapitasUsuario = chapitas.filter(pago => pago.usuarioId === userId);
      
      return chapitasUsuario;
}