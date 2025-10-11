import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { agregarCitaAProfesional, agregarCitaAUsuario } from '../data/firebase/firebase';

export const FormularioCitaVeterinaria = ({
  clinica,
  mascotas,
  onCerrar,
  onEnviar
}) => {
  const { usuario, datosUsuario } = useAuth();
  
 // ... existing code ...
const [formData, setFormData] = useState({
  clinicaId: clinica.id,
  clinicaNombre: clinica.nombre,
  // Agregar este campo para que coincida con el Dashboard
  veterinariaNombre: clinica.nombre,
  mascotaId: mascotas[0]?.id || 0,
  mascotaNombre: mascotas[0]?.nombre || '',
  fecha: '',
  hora: '',
  servicios: [],
  sintomas: '',
  urgencia: 'normal',
  observaciones: '',
  telefonoContacto: datosUsuario?.telefono || '',
  // Datos del cliente
  clienteId: usuario?.uid || '',
  clienteNombre: datosUsuario?.nombre || datosUsuario?.displayName || '',
  clienteEmail: usuario?.email || ''
});
// ... existing code ...

  const [isCargando, setIsCargando] = useState(false);
  const [errores, setErrores] = useState({});

  const serviciosDisponibles = clinica.servicios;
  console.log('🔍 Debug servicios veterinarios:', {
    clinica: clinica,
    serviciosDisponibles: serviciosDisponibles,
    serviciosLength: serviciosDisponibles?.length
  });


  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.fecha) nuevosErrores.fecha = 'La fecha es obligatoria';
    if (!formData.hora) nuevosErrores.hora = 'La hora es obligatoria';
    // Los servicios son opcionales, igual que en peluquería
    if (!formData.sintomas) nuevosErrores.sintomas = 'Los síntomas son obligatorios';
    if (!formData.telefonoContacto) nuevosErrores.telefonoContacto = 'El teléfono es obligatorio';

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;

    setIsCargando(true);
    
    try {
      // Obtener datos de la mascota seleccionada
      const mascotaSeleccionada = mascotas.find(m => m.id == formData.mascotaId);
      
      // Preparar datos de la cita
      const datosCita = {
        ...formData,
        mascotaNombre: mascotaSeleccionada?.nombre || '',
        mascotaRaza: mascotaSeleccionada?.raza || '',
        mascotaEdad: mascotaSeleccionada?.edad || '',
        fechaCompleta: `${formData.fecha} ${formData.hora}`,
        tipoProfesional: 'veterinario',
        duracion: 30, // duración en minutos para consultas veterinarias
        precio: 0, // se puede calcular después
        estado: 'pendiente'
      };

      // Guardar cita en Firebase (tanto en profesional como en usuario)
      await Promise.all([
        agregarCitaAProfesional(clinica.id, datosCita),
        agregarCitaAUsuario(usuario.uid, datosCita)
      ]);
      
      // Llamar función de callback
      onEnviar(datosCita);
      
    } catch (error) {
      console.error('Error al enviar cita:', error);
      alert('Error al agendar la cita. Inténtalo de nuevo.');
    } finally {
      setIsCargando(false);
    }
  };

  const manejarCambio = (campo, valor) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
    if (errores[campo]) {
      setErrores(prev => ({ ...prev, [campo]: '' }));
    }
  };

  const manejarServicio = (servicio) => {
    setFormData(prev => ({
      ...prev,
      servicios: prev.servicios.includes(servicio)
        ? prev.servicios.filter(s => s !== servicio)
        : [...prev.servicios, servicio]
    }));
    if (errores.servicios) {
      setErrores(prev => ({ ...prev, servicios: '' }));
    }
  };

  // Actualizar nombre de mascota cuando cambie la selección
  const manejarCambioMascota = (mascotaId) => {
    const mascotaSeleccionada = mascotas.find(m => m.id == mascotaId);
    setFormData(prev => ({
      ...prev,
      mascotaId: mascotaId,
      mascotaNombre: mascotaSeleccionada?.nombre || ''
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-blue-600">Agendar Cita Veterinaria</h2>
            <button
              onClick={onCerrar}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <h3 className="font-semibold text-blue-800">{clinica.nombre}</h3>
            <p className="text-sm text-blue-600">{clinica.direccion}</p>
            <p className="text-sm text-blue-600">{clinica.telefono}</p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={manejarEnvio} className="p-6 space-y-4">
          {/* Selección de Mascota */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mascota *
            </label>
            <select
              value={formData.mascotaId}
              onChange={(e) => manejarCambioMascota(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {mascotas.map(mascota => (
                <option key={mascota.id} value={mascota.id}>
                  {mascota.nombre} - {mascota.raza} ({mascota.edad} años)
                </option>
              ))}
            </select>
          </div>

          {/* Fecha y Hora */}
          <div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <div className="flex items-start">
                <svg className="w-4 h-4 text-amber-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-amber-800">
                  <span className="font-medium">Importante:</span> El horario seleccionado puede ser modificado por el profesional para coordinar mejor la atención y evitar conflictos de agenda.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha *
              </label>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => manejarCambio('fecha', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errores.fecha ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errores.fecha && <p className="text-red-500 text-xs mt-1">{errores.fecha}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora *
              </label>
              <input
                type="time"
                value={formData.hora}
                onChange={(e) => manejarCambio('hora', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errores.hora ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errores.hora && <p className="text-red-500 text-xs mt-1">{errores.hora}</p>}
            </div>
          </div>

          {/* Servicios */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Servicios Deseados
            </label>
            {serviciosDisponibles && serviciosDisponibles.length > 0 ? (
              <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-3">
                {serviciosDisponibles.map(servicio => {
                  console.log(servicio, 'servicio veterinario');
                  return (
                    <label key={servicio} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.servicios.includes(servicio)}
                        onChange={() => manejarServicio(servicio)}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{servicio}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-600">No hay servicios disponibles</p>
              </div>
            )}
            {errores.servicios && <p className="text-red-500 text-xs mt-1">{errores.servicios}</p>}
          </div>


          {/* Nivel de Urgencia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nivel de Urgencia
            </label>
            <div className="space-y-2">
              {[
                { valor: 'normal', label: 'Normal', color: 'bg-green-100 text-green-800' },
                { valor: 'urgente', label: 'Urgente', color: 'bg-yellow-100 text-yellow-800' },
                { valor: 'emergencia', label: 'Emergencia', color: 'bg-red-100 text-red-800' }
              ].map(opcion => (
                <label key={opcion.valor} className="flex items-center">
                  <input
                    type="radio"
                    name="urgencia"
                    value={opcion.valor}
                    checked={formData.urgencia === opcion.valor}
                    onChange={(e) => manejarCambio('urgencia', e.target.value)}
                    className="mr-2"
                  />
                  <span className={`px-2 py-1 rounded text-xs font-medium ${opcion.color}`}>
                    {opcion.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Síntomas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Síntomas o Motivo de Consulta *
            </label>
            <textarea
              value={formData.sintomas}
              onChange={(e) => manejarCambio('sintomas', e.target.value)}
              rows={3}
              placeholder="Describe los síntomas o el motivo de la consulta..."
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errores.sintomas ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errores.sintomas && <p className="text-red-500 text-xs mt-1">{errores.sintomas}</p>}
          </div>

          {/* Teléfono de Contacto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono de Contacto *
            </label>
            <input
              type="tel"
              value={formData.telefonoContacto}
              onChange={(e) => manejarCambio('telefonoContacto', e.target.value)}
              placeholder="+56 9 1234 5678"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errores.telefonoContacto ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errores.telefonoContacto && <p className="text-red-500 text-xs mt-1">{errores.telefonoContacto}</p>}
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones Adicionales
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => manejarCambio('observaciones', e.target.value)}
              rows={2}
              placeholder="Información adicional que consideres importante..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Botones */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={isCargando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isCargando}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCargando ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Agendando...
                </span>
              ) : (
                'Agendar Cita'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 