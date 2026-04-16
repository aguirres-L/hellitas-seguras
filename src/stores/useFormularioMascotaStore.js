import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const generarIdUnico = () => `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

export const crearEstadoVacioFormularioMascota = () => ({
  paso: 0,
  vistaCatalogoRaza: null,
  nombre: '',
  razaSeleccionada: '',
  raza: '',
  fechaNacimiento: '',
  modoNacimiento: 'edadAproximada',
  añosAproximados: '',
  mesesAdicionales: '',
  color: '',
  urlImagenMascota: '',
  contacto: '',
  vacunas: [{ nombre: '', fecha: '' }],
  alergias: '',
  enfermedades: '',
  notas: '',
  mascotaId: generarIdUnico(),
});

/**
 * Estado del wizard "Agregar mascota": persiste en localStorage para recuperar
 * si el usuario cierra el modal o recarga la página. No incluye archivos File (solo URL si ya subió).
 */
export const useFormularioMascotaStore = create(
  persist(
    (set, get) => ({
      ...crearEstadoVacioFormularioMascota(),

      actualizar: (parcial) => set((estado) => ({ ...estado, ...parcial })),

      resetearFormularioMascota: () => set({ ...crearEstadoVacioFormularioMascota() }),

      asegurarMascotaId: () => {
        const s = get();
        if (!s.mascotaId) set({ mascotaId: generarIdUnico() });
      },
    }),
    {
      name: 'hs-formulario-mascota',
      partialize: (s) => ({
        paso: s.paso,
        vistaCatalogoRaza: s.vistaCatalogoRaza,
        nombre: s.nombre,
        razaSeleccionada: s.razaSeleccionada,
        raza: s.raza,
        fechaNacimiento: s.fechaNacimiento,
        modoNacimiento: s.modoNacimiento,
        añosAproximados: s.añosAproximados,
        mesesAdicionales: s.mesesAdicionales,
        color: s.color,
        urlImagenMascota: s.urlImagenMascota,
        contacto: s.contacto,
        vacunas: s.vacunas,
        alergias: s.alergias,
        enfermedades: s.enfermedades,
        notas: s.notas,
        mascotaId: s.mascotaId,
      }),
    }
  )
);
