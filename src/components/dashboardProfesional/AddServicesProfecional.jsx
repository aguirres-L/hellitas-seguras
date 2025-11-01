import React, { useState } from 'react';
import { agregarServicio, actualizarServicio } from '../../data/firebase/firebase';

// Este componente recibe props


export default function AddServicesProfecional({
  isAbierto,
  onCerrar,
  profesionalId,
  tipoProfesional,
  servicioExistente = null,
  onServicioGuardado
}) {
  const [formulario, setFormulario] = useState({
    nombre: servicioExistente?.nombre || '',
    descripcion: servicioExistente?.descripcion || '',
    duracion: servicioExistente?.duracion || 30,
    precio: servicioExistente?.precio || 0
  });
  
  const [isCargando, setIsCargando] = useState(false);
  const [errores, setErrores] = useState({});

  // Validar formulario
  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formulario.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre del servicio es obligatorio';
    }

    if (!formulario.descripcion.trim()) {
      nuevosErrores.descripcion = 'La descripción es obligatoria';
    }

    if (formulario.duracion <= 0) {
      nuevosErrores.duracion = 'La duración debe ser mayor a 0';
    }

    if (formulario.precio <= 0) {
      nuevosErrores.precio = 'El precio debe ser mayor a 0';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Manejar cambios en el formulario
  const handleCambio = (campo, valor) => {
    setFormulario(prev => ({
      ...prev,
      [campo]: valor
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errores[campo]) {
      setErrores(prev => ({
        ...prev,
        [campo]: ''
      }));
    }
  };

  // Manejar envío del formulario
  const handleEnviar = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    setIsCargando(true);
    try {
      if (servicioExistente) {
        // Actualizar servicio existente
        await actualizarServicio(profesionalId, servicioExistente.id, formulario);
        alert('¡Servicio actualizado exitosamente!');
      } else {
        // Crear nuevo servicio
        await agregarServicio(profesionalId, formulario);
        alert('¡Servicio creado exitosamente!');
      }
      
      // Limpiar formulario y cerrar modal
      setFormulario({
        nombre: '',
        descripcion: '',
        duracion: 30,
        precio: 0
      });
      setErrores({});
      onServicioGuardado();
      onCerrar();
    } catch (error) {
      console.error('Error al guardar servicio:', error);
      alert('Error al guardar el servicio. Inténtalo de nuevo.');
    } finally {
      setIsCargando(false);
    }
  };

  // Manejar cancelar
  const handleCancelar = () => {
    setFormulario({
      nombre: '',
      descripcion: '',
      duracion: 30,
      precio: 0
    });
    setErrores({});
    onCerrar();
  };

  if (!isAbierto) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {servicioExistente ? 'Editar Servicio' : 'Agregar Nuevo Servicio'}
            </h3>
            <button
              onClick={handleCancelar}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Formulario */}
          <form onSubmit={handleEnviar} className="space-y-4">
            {/* Nombre del servicio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Servicio *
              </label>
              <input
                type="text"
                value={formulario.nombre}
                onChange={(e) => handleCambio('nombre', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errores.nombre ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={
                  tipoProfesional === 'veterinario' 
                    ? 'Ej: Consulta general, Vacunación, Cirugía...'
                    : 'Ej: Corte de pelo, Baño completo, Cepillado...'
                }
              />
              {errores.nombre && (
                <p className="text-red-500 text-xs mt-1">{errores.nombre}</p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción del Servicio *
              </label>
              <textarea
                value={formulario.descripcion}
                onChange={(e) => handleCambio('descripcion', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errores.descripcion ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe detalladamente qué incluye este servicio..."
              />
              {errores.descripcion && (
                <p className="text-red-500 text-xs mt-1">{errores.descripcion}</p>
              )}
            </div>

            {/* Duración y Precio */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duración (minutos) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formulario.duracion}
                  onChange={(e) => handleCambio('duracion', parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errores.duracion ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="30"
                />
                {errores.duracion && (
                  <p className="text-red-500 text-xs mt-1">{errores.duracion}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio ($) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formulario.precio}
                  onChange={(e) => handleCambio('precio', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errores.precio ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errores.precio && (
                  <p className="text-red-500 text-xs mt-1">{errores.precio}</p>
                )}
              </div>
            </div>

            {/* Información adicional según tipo de profesional */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-blue-800">
                    {tipoProfesional === 'veterinario' ? 'Servicios Veterinarios' : 'Servicios de Peluquería'}
                  </h4>
                  <p className="text-xs text-blue-700 mt-1">
                    {tipoProfesional === 'veterinario' 
                      ? 'Los servicios veterinarios pueden incluir consultas, vacunaciones, cirugías, tratamientos, etc.'
                      : 'Los servicios de peluquería pueden incluir cortes, baños, cepillado, manicura, etc.'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleCancelar}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isCargando}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCargando ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {servicioExistente ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {servicioExistente ? 'Actualizar Servicio' : 'Crear Servicio'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}