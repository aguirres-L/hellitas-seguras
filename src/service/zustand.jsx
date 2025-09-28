import { create } from 'zustand';

const typeProfesionalStore = create((set, get) => ({
    typeProfesional: '',
    setTypeProfesional: (type) => set({ typeProfesional: type }),
    getTipoProfesional: () => get().typeProfesional,
}))


const keyInfoMascotaStore = create((set, get) => ({
    keyInfoMascota: '',
    setKeyInfoMascota: (key) => set({ keyInfoMascota: key }),
    getKeyInfoMascota: () => get().keyInfoMascota,
}))


export default typeProfesionalStore;