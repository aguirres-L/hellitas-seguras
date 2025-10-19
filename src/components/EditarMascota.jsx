import React, { useState } from 'react';
import { actualizarMascota } from '../data/firebase/firebase';

export const EditarMascota = ({
  mascota,
  tipoProfesional,
  onGuardar,
  onCancelar,
  isCargando
}) => {
  const [formData, setFormData] = useState({
    nombre: mascota.nombre || '',
    raza: mascota.raza || '',
    edad: mascota.edad || 0,
    color: mascota.color || '',
    numeroChip: mascota.numeroChip || '',
    peso: mascota.peso || 0,
    altura: mascota.altura || 0,
    alergias: mascota.alergias || '',
    enfermedades: mascota.enfermedades || '',
    comportamiento: mascota.comportamiento || '',
    preferenciasGrooming: mascota.preferenciasGrooming || '',
    notas: mascota.notas || '',
    contacto: mascota.contacto || ''
  });

  const [nuevaVacuna, setNuevaVacuna] = useState({ nombre: '', fecha: '' });
  const [vacunas, setVacunas] = useState(mascota.vacunas || []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const datosActualizados = {
        ...formData,
        vacunas: vacunas
      };
      
      await actualizarMascota(mascota.id, datosActualizados);
      onGuardar();
    } catch (error) {
      console.error('Error al actualizar mascota:', error);
      alert('Error al actualizar la mascota. Inténtalo de nuevo.');
    }
  };

  const agregarVacuna = () => {
    if (nuevaVacuna.nombre && nuevaVacuna.fecha) {
      setVacunas(prev => [...prev, { ...nuevaVacuna }]);
      setNuevaVacuna({ nombre: '', fecha: '' });
    }
  };

  const eliminarVacuna = (index) => {
    setVacunas(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Editar Información de {mascota.nombre}
        {tipoProfesional && (
          <span className="text-sm font-normal text-gray-600 ml-2">
            (Modo {tipoProfesional === 'veterinario' ? 'Veterinario' : 'Peluquero'})
          </span>
        )}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-4">Información Básica</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raza
              </label>
              <input
                type="text"
                name="raza"
                value={formData.raza}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>
            
         {/*    <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Edad (años)
              </label>
              <input
                type="number"
                name="edad"
                value={formData.edad}
                onChange={handleNumberChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div> */}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

       {/*      <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Chip
              </label>
              <input
                type="text"
                name="numeroChip"
                value={formData.numeroChip}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Número de identificación"
              />
            </div> */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contacto de Emergencia
              </label>
              <input
                type="text"
                name="contacto"
                value={formData.contacto}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Teléfono o información adicional"
              />
            </div>
          </div>
        </div>

        {/* Información Veterinaria */}
        {(!tipoProfesional || tipoProfesional === 'veterinario') && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-4">Información Veterinaria</h4>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  name="peso"
                  value={formData.peso}
                  onChange={handleNumberChange}
                  step="0.1"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Altura (cm)
                </label>
                <input
                  type="number"
                  name="altura"
                  value={formData.altura}
                  onChange={handleNumberChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alergias
                </label>
                <textarea
                  name="alergias"
                  value={formData.alergias}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describa las alergias de la mascota..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enfermedades
                </label>
                <textarea
                  name="enfermedades"
                  value={formData.enfermedades}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describa las enfermedades de la mascota..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Información de Peluquería */}
     {/*    {(!tipoProfesional || tipoProfesional === 'peluquero') && (
          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-4">Información de Peluquería</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comportamiento
                </label>
                <textarea
                  name="comportamiento"
                  value={formData.comportamiento}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Comportamiento durante el grooming..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferencias de Grooming
                </label>
                <textarea
                  name="preferenciasGrooming"
                  value={formData.preferenciasGrooming}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Tipo de corte, productos preferidos..."
                />
              </div>
            </div>
          </div>
        )} */}

        {/* Vacunas */}
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-4">Vacunas</h4>
          
          {/* Lista de vacunas existentes */}
          {vacunas.length > 0 && (
            <div className="space-y-2 mb-4">
              {vacunas.map((vacuna, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg">
                  <div>
                    <p className="font-medium">{vacuna.nombre}</p>
                    <p className="text-sm text-gray-600">{vacuna.fecha}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => eliminarVacuna(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Agregar nueva vacuna */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la vacuna
              </label>
              <input
                type="text"
                value={nuevaVacuna.nombre}
                onChange={(e) => setNuevaVacuna(prev => ({ ...prev, nombre: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Ej: Triple Viral"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha
              </label>
              <input
                type="date"
                value={nuevaVacuna.fecha}
                onChange={(e) => setNuevaVacuna(prev => ({ ...prev, fecha: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div className="flex items-end">
              <button
                type="button"
                onClick={agregarVacuna}
                disabled={!nuevaVacuna.nombre || !nuevaVacuna.fecha}
                className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Agregar Vacuna
              </button>
            </div>
          </div>
        </div>

        {/* Notas Adicionales */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas Adicionales
          </label>
          <textarea
            name="notas"
            value={formData.notas}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Otras observaciones importantes..."
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={onCancelar}
            disabled={isCargando}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isCargando}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCargando ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};