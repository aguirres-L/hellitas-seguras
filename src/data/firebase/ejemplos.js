// Ejemplos de uso de las funciones CRUD de Firebase
import {
  createCollectionFirebase,
  addDataCollection,
  deleteDataCollection,
  updateDataCollection,
  getAllDataCollection,
  getDataById,
  searchDataByField,
  getDataOrdered,
  agregarCitaAProfesional,
  obtenerCitasDeProfesional
} from './firebase';

/**
 * EJEMPLOS DE USO - FUNCIONES CRUD
 */

// 1. Crear una nueva colección con datos iniciales
export const ejemploCrearColeccion = async () => {
  try {
    const idDocumento = await createCollectionFirebase('mascotas', {
      nombre: 'Luna',
      tipo: 'Perro',
      edad: 3,
      propietario: 'usuario123'
    });
  } catch (error) {
    console.error('Error:', error);
  }
};

// 2. Añadir datos a una colección existente
export const ejemploAñadirMascota = async () => {
  try {
    const idMascota = await addDataCollection('mascotas', {
      nombre: 'Max',
      tipo: 'Gato',
      edad: 2,
      propietario: 'usuario456',
      raza: 'Siames',
      peso: 4.5
    });
  } catch (error) {
    console.error('Error:', error);
  }
};

// 3. Obtener todas las mascotas
export const ejemploObtenerTodasMascotas = async () => {
  try {
    const mascotas = await getAllDataCollection('mascotas');
    return mascotas;
  } catch (error) {
    console.error('Error:', error);
  }
};

// 4. Obtener una mascota específica por ID
export const ejemploObtenerMascotaPorId = async (idMascota) => {
  try {
    const mascota = await getDataById('mascotas', idMascota);
    return mascota;
  } catch (error) {
    console.error('Error:', error);
  }
};

// 5. Buscar mascotas por propietario
export const ejemploBuscarMascotasPorPropietario = async (propietario) => {
  try {
    const mascotas = await searchDataByField('mascotas', 'propietario', propietario);
    return mascotas;
  } catch (error) {
    console.error('Error:', error);
  }
};

// 6. Actualizar datos de una mascota
export const ejemploActualizarMascota = async (idMascota, nuevosDatos) => {
  try {
    await updateDataCollection('mascotas', idMascota, {
      edad: nuevosDatos.edad,
      peso: nuevosDatos.peso,
      ultimaVisita: new Date()
    });
  } catch (error) {
    console.error('Error:', error);
  }
};

// 7. Eliminar una mascota
export const ejemploEliminarMascota = async (idMascota) => {
  try {
    await deleteDataCollection('mascotas', idMascota);
  } catch (error) {
    console.error('Error:', error);
  }
};

// 8. Obtener mascotas ordenadas por fecha de creación
export const ejemploObtenerMascotasOrdenadas = async () => {
  try {
    const mascotas = await getDataOrdered('mascotas', 'fechaCreacion', 'desc', 5);
    return mascotas;
  } catch (error) {
    console.error('Error:', error);
  }
};

/**
 * EJEMPLO - GESTIÓN DE CITAS CON PROFESIONALES
 */
export const ejemploGestionCitasProfesionales = async () => {
  try {
    // 1. Agregar una cita a un peluquero
    const citaPeluqueria = {
      peluqueriaId: 'peluquero123',
      peluqueriaNombre: 'Pet Spa & Grooming',
      mascotaId: 'mascota456',
      mascotaNombre: 'Luna',
      mascotaRaza: 'Golden Retriever',
      mascotaEdad: 3,
      fecha: '2024-01-15',
      hora: '14:00',
      fechaCompleta: '2024-01-15 14:00',
      servicios: ['Baño y corte', 'Cepillado profundo'],
      tipoCorte: 'Corte de raza',
      observaciones: 'Mascota nerviosa, necesita paciencia',
      telefonoContacto: '+56 9 1234 5678',
      esPrimeraVisita: false,
      clienteId: 'usuario789',
      clienteNombre: 'María González',
      clienteEmail: 'maria@email.com',
      tipoProfesional: 'peluquero',
      duracion: 60,
      precio: 25000,
      estado: 'pendiente'
    };

    await agregarCitaAProfesional('peluquero123', citaPeluqueria);

    // 2. Obtener todas las citas de un profesional
    const citasProfesional = await obtenerCitasDeProfesional('peluquero123');

    // 3. Ejemplo de estructura de datos en Firestore
    const estructuraProfesional = {
      id: 'peluquero123',
      nombre: 'Ana Martínez',
      email: 'ana@peluqueria.com',
      telefono: '+56 9 8765 4321',
      tipoProfesional: 'peluquero',
      especialidad: 'Corte de razas pequeñas',
      direccion: 'Av. Providencia 1234',
      horario: 'Lun-Vie: 9:00-18:00',
      experiencia: 5,
      licencia: 'LIC123456',
      estado: 'activo',
      citas: [
        {
          id: '1705310400000',
          peluqueriaId: 'peluquero123',
          peluqueriaNombre: 'Pet Spa & Grooming',
          mascotaId: 'mascota456',
          mascotaNombre: 'Luna',
          mascotaRaza: 'Golden Retriever',
          mascotaEdad: 3,
          fecha: '2024-01-15',
          hora: '14:00',
          fechaCompleta: '2024-01-15 14:00',
          servicios: ['Baño y corte', 'Cepillado profundo'],
          tipoCorte: 'Corte de raza',
          observaciones: 'Mascota nerviosa, necesita paciencia',
          telefonoContacto: '+56 9 1234 5678',
          esPrimeraVisita: false,
          clienteId: 'usuario789',
          clienteNombre: 'María González',
          clienteEmail: 'maria@email.com',
          tipoProfesional: 'peluquero',
          duracion: 60,
          precio: 25000,
          estado: 'pendiente',
          fechaCreacion: new Date('2024-01-14T10:00:00Z')
        }
      ]
    };


  } catch (error) {
    console.error('Error en gestión de citas con profesionales:', error);
  }
};

/**
 * EJEMPLO COMPLETO - GESTIÓN DE CITAS VETERINARIAS
 */
export const ejemploGestionCitas = async () => {
  try {
    // 1. Crear una cita
    const idCita = await addDataCollection('citas', {
      mascotaId: 'mascota123',
      veterinarioId: 'vet456',
      fecha: new Date('2024-01-15T10:00:00'),
      motivo: 'Vacunación anual',
      estado: 'programada',
      notas: 'Traer cartilla de vacunación'
    });

    // 2. Buscar citas de una mascota específica
    const citasMascota = await searchDataByField('citas', 'mascotaId', 'mascota123');

    // 3. Actualizar estado de la cita
    await updateDataCollection('citas', idCita, {
      estado: 'completada',
      notas: 'Vacuna aplicada correctamente'
    });

    // 4. Obtener citas ordenadas por fecha
    const citasOrdenadas = await getDataOrdered('citas', 'fecha', 'asc', 10);

  } catch (error) {
    console.error('Error en gestión de citas:', error);
  }
};

/**
 * EJEMPLO - VALIDACIONES Y MANEJO DE ERRORES
 */
export const ejemploConValidaciones = async (datosMascota) => {
  try {
    // Validar datos antes de guardar
    if (!datosMascota.nombre || !datosMascota.tipo) {
      throw new Error('Nombre y tipo son obligatorios');
    }

    if (datosMascota.edad < 0) {
      throw new Error('La edad no puede ser negativa');
    }

    // Guardar datos
    const id = await addDataCollection('mascotas', datosMascota);
    return id;

  } catch (error) {
    console.error('Error de validación:', error.message);
    throw error; // Re-lanzar para manejar en el componente
  }
}; 