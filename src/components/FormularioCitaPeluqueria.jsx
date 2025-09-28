import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { agregarCitaAProfesional, agregarCitaAUsuario } from '../data/firebase/firebase';

export const FormularioCitaPeluqueria = ({
  peluqueria,
  mascotas,
  onCerrar,
  onEnviar
}) => {
  const { usuario, datosUsuario } = useAuth();
  console.log(peluqueria,'peluqueria');
  
  const [formData, setFormData] = useState({
    peluqueriaId: peluqueria.id,
    peluqueriaNombre: peluqueria.nombre,
    mascotaId: mascotas[0]?.id || 0,
    mascotaNombre: mascotas[0]?.nombre || '',
    fecha: '',
    hora: '',
    servicios: [],
    tipoCorte: '',
    observaciones: '',
    telefonoContacto: datosUsuario?.telefono || '',
    esPrimeraVisita: false,
    // Datos del cliente
    clienteId: usuario?.uid || '',
    clienteNombre: datosUsuario?.nombre || datosUsuario?.displayName || '',
    clienteEmail: usuario?.email || ''
  });

  const [isCargando, setIsCargando] = useState(false);
  const [errores, setErrores] = useState({});

  const serviciosDisponibles = peluqueria.servicios;

  const tiposCorte = [
    'Corte de raza',
    'Corte higiénico',
    'Corte de verano',
    'Corte de invierno',
    'Corte personalizado',
    'Solo baño',
    'No especificar'
  ];

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.fecha) nuevosErrores.fecha = 'La fecha es obligatoria';
    if (!formData.hora) nuevosErrores.hora = 'La hora es obligatoria';
/*     if (formData.servicios.length === 0) nuevosErrores.servicios = 'Selecciona al menos un servicio'; */
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
      console.log(mascotaSeleccionada,'mascotaSeleccionada');
      
      // Preparar datos de la cita
      const datosCita = {
        ...formData,
        mascotaNombre: mascotaSeleccionada?.nombre || '',
        mascotaRaza: mascotaSeleccionada?.raza || '',
        mascotaEdad: mascotaSeleccionada?.edad || '',
        fechaCompleta: `${formData.fecha} ${formData.hora}`,
        fotoMascota: mascotaSeleccionada?.fotoUrl || '',
        tipoProfesional: 'peluquero',
        duracion: 60, // duración en minutos
        precio: 0, // se puede calcular después
        estado: 'pendiente'
      };

      // Guardar cita en Firebase (tanto en profesional como en usuario)
      await Promise.all([
        agregarCitaAProfesional(peluqueria.id, datosCita),
        agregarCitaAUsuario(usuario.uid, datosCita)
      ]);
      
      // Llamar función de callback
      onEnviar(datosCita);
      
    } catch (error) {
      console.error('Error al enviar cita:', error);
      alert('Error al reservar la cita. Inténtalo de nuevo.');
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
            <h2 className="text-xl font-bold text-purple-600">Reservar Cita Peluquería</h2>
            <button
              onClick={onCerrar}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <h3 className="font-semibold text-purple-800">{peluqueria.nombre}</h3>
            <p className="text-sm text-purple-600">{peluqueria.direccion}</p>
            <p className="text-sm text-purple-600">{peluqueria.telefono}</p>
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {mascotas.map(mascota => (
                <option key={mascota.id} value={mascota.id}>
                  {mascota.nombre} - {mascota.raza} ({mascota.edad} años)
                </option>
              ))}
            </select>
          </div>

          {/* Fecha y Hora */}
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
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
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
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errores.hora ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errores.hora && <p className="text-red-500 text-xs mt-1">{errores.hora}</p>}
            </div>
          </div>

          {/* Servicios */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Servicios Deseados *
            </label>
            {serviciosDisponibles && serviciosDisponibles.length > 0 ? (
              <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-3">
                {serviciosDisponibles.map(servicio => {
                  console.log(servicio, 'servicio');
                  return (
                    <label key={servicio} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.servicios.includes(servicio)}
                        onChange={() => manejarServicio(servicio)}
                        className="mr-2 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm">{servicio}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-sm text-purple-600">No hay servicios disponibles</p>
              </div>
            )}
            {errores.servicios && <p className="text-red-500 text-xs mt-1">{errores.servicios}</p>}
          </div>

          {/* Tipo de Corte */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Corte
            </label>
            <select
              value={formData.tipoCorte}
              onChange={(e) => manejarCambio('tipoCorte', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Selecciona el tipo de corte</option>
              {tiposCorte.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          {/* Primera Visita */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.esPrimeraVisita}
                onChange={(e) => manejarCambio('esPrimeraVisita', e.target.checked)}
                className="mr-2 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Es la primera visita de mi mascota</span>
            </label>
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
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errores.telefonoContacto ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errores.telefonoContacto && <p className="text-red-500 text-xs mt-1">{errores.telefonoContacto}</p>}
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones Especiales
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => manejarCambio('observaciones', e.target.value)}
              rows={3}
              placeholder="Comportamiento especial, alergias, preferencias de corte..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              className="flex-1 py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCargando ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Reservando...
                </span>
              ) : (
                'Reservar Cita'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 