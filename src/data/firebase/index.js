// Exportar configuración
export { auth, db } from './firebaseConfig';
export { default as app } from './firebaseConfig';

// Exportar funciones CRUD
export {
  createCollectionFirebase,
  addDataCollection,
  addDataWithCustomId,
  deleteDataCollection,
  updateDataCollection,
  getAllDataCollection,
  getDataById,
  searchDataByField,
  getDataOrdered,
  agregarMascotaAUsuario,
  obtenerUsuarioPorUid,
  buscarMascotaPorId,
  obtenerProfesionalPorUid,
  obtenerProfesionalesPorTipo,
  agregarCitaAProfesional,
  obtenerCitasDeProfesional,
  buscarMascotasPorChip,
  actualizarMascota,
  agregarCita,
  obtenerCitasProfesional,
  actualizarCita,
  eliminarCita
} from './firebase'; 