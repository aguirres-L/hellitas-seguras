import React, { useState } from 'react';
import { actualizarMascota, eliminarMascota } from '../data/firebase/firebase';

export const EditarMascota = ({
  mascota,
  tipoProfesional,
  onGuardar,
  onCancelar,
  onEliminar,
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
    contacto: mascota.contacto || '',
    isPerdida: mascota.isPerdida || false
  });

  const [nuevaVacuna, setNuevaVacuna] = useState({ nombre: '', fecha: '' });
  const [vacunas, setVacunas] = useState(mascota.vacunas || []);
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false);
  const [isGuardandoEstado, setIsGuardandoEstado] = useState(false);

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

  const handleCheckboxChange = async (e) => {
    const { name, checked } = e.target;
    
    // Actualizar el estado local inmediatamente para mejor UX
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));

    // Guardar inmediatamente en Firebase
    setIsGuardandoEstado(true);
    try {
      await actualizarMascota(mascota.id, {
        [name]: checked
      });
      
      // Usar la misma lógica que "Guardar Cambios": cerrar modal y recargar datos
      onGuardar();
    } catch (error) {
      console.error('Error al actualizar estado de mascota perdida:', error);
      
      // Revertir el cambio si falla
      setFormData(prev => ({
        ...prev,
        [name]: !checked
      }));
      
      alert(`Error al ${checked ? 'marcar' : 'desmarcar'} la mascota como perdida. Inténtalo de nuevo.`);
      setIsGuardandoEstado(false);
    }
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

  const handleEliminarMascota = async () => {
    try {
      await eliminarMascota(mascota.id);
      onEliminar();
    } catch (error) {
      console.error('Error al eliminar mascota:', error);
      alert('Error al eliminar la mascota. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
     <div className="flex justify-between items-center mb-4">

     <h3 className="text-xl font-bold text-gray-900 mb-6">
        Editar Información de {mascota.nombre}
        {tipoProfesional && (
          <span className="text-sm font-normal text-gray-600 ml-2">
            (Modo {tipoProfesional === 'veterinario' ? 'Veterinario' : 'Peluquero'})
          </span>
        )}
      </h3>
      <button
                  onClick={() => setMostrarEdicion(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>


     </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Estado de Mascota Perdida - Prioridad Alta */}
        <div className={`rounded-lg p-5 border-2 shadow-sm ${
          formData.isPerdida 
            ? 'bg-red-50 border-red-400' 
            : 'bg-green-50 border-green-300'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                formData.isPerdida ? 'bg-red-100' : 'bg-green-100'
              }`}>
                {formData.isPerdida ? (
                  <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                ) : (
                  <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div>
                <h4 className={`text-lg font-bold ${
                  formData.isPerdida ? 'text-red-900' : 'text-green-900'
                }`}>
                  {formData.isPerdida ? '🚨 MASCOTA PERDIDA' : '✅ MASCOTA EN CASA'}
                </h4>
                <p className={`text-sm mt-1 ${
                  formData.isPerdida ? 'text-red-700' : 'text-green-700'
                }`}>
                  {formData.isPerdida 
                    ? 'La mascota está marcada como PERDIDA. Esta información será visible en su perfil público.' 
                    : 'La mascota está en casa y segura.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 ml-4">
              {isGuardandoEstado && (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                  <span className="ml-2 text-xs text-gray-600">Guardando...</span>
                </div>
              )}
              <label className={`relative inline-flex items-center ${
                isGuardandoEstado ? 'cursor-wait opacity-60' : 'cursor-pointer'
              }`}>
                <input
                  type="checkbox"
                  name="isPerdida"
                  checked={formData.isPerdida}
                  onChange={handleCheckboxChange}
                  disabled={isGuardandoEstado}
                  className="sr-only peer"
                />
                <div className={`w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all ${
                  formData.isPerdida ? 'peer-checked:bg-red-500' : 'peer-checked:bg-green-500'
                } ${isGuardandoEstado ? 'opacity-60' : ''}`}></div>
              </label>
            </div>
          </div>
        </div>
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
            placeholder="Ejemplo: Perro guía - Mi acompañante necesita de mí para desplazarse"
          />
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

     

        {/* Botones */}
        <div className="flex justify-between pt-6">
          {/* Botón de eliminar (izquierda) */}
          <button
            type="button"
            onClick={() => setMostrarConfirmacionEliminar(true)}
            disabled={isCargando}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Eliminar Mascota
          </button>
          
          {/* Botones de acción (derecha) */}
          <div className="flex space-x-4">
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
        </div>
      </form>

      {/* Modal de confirmación de eliminación */}
      {mostrarConfirmacionEliminar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Confirmar Eliminación
                </h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                ¿Estás seguro de que quieres eliminar a <strong>{mascota.nombre}</strong>? 
                Esta acción no se puede deshacer y se perderán todos los datos de la mascota.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setMostrarConfirmacionEliminar(false)}
                disabled={isCargando}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleEliminarMascota}
                disabled={isCargando}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCargando ? 'Eliminando...' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};