import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotificacionApp } from '../contexts/NotificacionAppContext';
import { agregarCitaAProfesional, agregarCitaAUsuario } from '../data/firebase/firebase';

const duracionesMinutos = [
  { valor: 30, etiqueta: '30 min' },
  { valor: 45, etiqueta: '45 min' },
  { valor: 60, etiqueta: '60 min' },
  { valor: 90, etiqueta: '90 min' },
];

/**
 * Reserva de paseo / cita con paseador (misma persistencia que vet/peluquería).
 */
export const FormularioCitaPaseador = ({ paseador, mascotas, onCerrar, onEnviar }) => {
  const { usuario, datosUsuario } = useAuth();
  const { mostrarError } = useNotificacionApp();

  const serviciosDisponibles = Array.isArray(paseador.servicios) ? paseador.servicios : [];

  const [formData, setFormData] = useState({
    paseadorId: paseador.id,
    paseadorNombre: paseador.nombre,
    mascotaId: mascotas[0]?.id ?? '',
    mascotaNombre: mascotas[0]?.nombre || '',
    fecha: '',
    hora: '',
    duracion: 60,
    servicios: [],
    observaciones: '',
    telefonoContacto: datosUsuario?.telefono || '',
    clienteId: usuario?.uid || '',
    clienteNombre: datosUsuario?.nombre || datosUsuario?.displayName || '',
    clienteEmail: usuario?.email || '',
  });

  const [isCargando, setIsCargando] = useState(false);
  const [errores, setErrores] = useState({});

  const validarFormulario = () => {
    const nuevosErrores = {};
    if (!formData.fecha) nuevosErrores.fecha = 'La fecha es obligatoria';
    if (!formData.hora) nuevosErrores.hora = 'La hora es obligatoria';
    if (!formData.telefonoContacto) nuevosErrores.telefonoContacto = 'El teléfono es obligatorio';
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    setIsCargando(true);
    try {
      const mascotaSeleccionada = mascotas.find((m) => String(m.id) === String(formData.mascotaId));

      const idCita =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

      const datosCita = {
        ...formData,
        id: idCita,
        mascotaNombre: mascotaSeleccionada?.nombre || '',
        mascotaRaza: mascotaSeleccionada?.raza || '',
        mascotaEdad: mascotaSeleccionada?.edad || '',
        fechaCompleta: `${formData.fecha} ${formData.hora}`,
        fotoMascota: mascotaSeleccionada?.fotoUrl || '',
        tipoProfesional: 'paseador',
        precio: 0,
        estado: 'pendiente',
      };

      await Promise.all([
        agregarCitaAProfesional(paseador.id, datosCita),
        agregarCitaAUsuario(usuario.uid, datosCita),
      ]);

      onEnviar(datosCita);
    } catch (error) {
      console.error('Error al enviar cita de paseo:', error);
      mostrarError('Error al solicitar el paseo. Inténtalo de nuevo.');
    } finally {
      setIsCargando(false);
    }
  };

  const manejarCambio = (campo, valor) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }));
    if (errores[campo]) {
      setErrores((prev) => ({ ...prev, [campo]: '' }));
    }
  };

  const manejarServicio = (servicio) => {
    setFormData((prev) => ({
      ...prev,
      servicios: prev.servicios.includes(servicio)
        ? prev.servicios.filter((s) => s !== servicio)
        : [...prev.servicios, servicio],
    }));
  };

  const manejarCambioMascota = (mascotaId) => {
    const mascotaSeleccionada = mascotas.find((m) => String(m.id) === String(mascotaId));
    setFormData((prev) => ({
      ...prev,
      mascotaId,
      mascotaNombre: mascotaSeleccionada?.nombre || '',
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-amber-700">Solicitar paseo / cita</h2>
            <button type="button" onClick={onCerrar} className="text-gray-400 hover:text-gray-600 text-2xl">
              ×
            </button>
          </div>
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
            <h3 className="font-semibold text-amber-900">{paseador.nombre}</h3>
            <p className="text-sm text-amber-800">{paseador.direccion}</p>
            <p className="text-sm text-amber-800">{paseador.telefono}</p>
          </div>
        </div>

        <form onSubmit={manejarEnvio} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mascota *</label>
            <select
              value={formData.mascotaId}
              onChange={(e) => manejarCambioMascota(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              {mascotas.map((mascota) => (
                <option key={mascota.id} value={mascota.id}>
                  {mascota.nombre} — {mascota.raza} ({mascota.edad} años)
                </option>
              ))}
            </select>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-900">
              <span className="font-medium">Importante:</span> El horario puede ajustarse con el paseador para
              coordinar la salida.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha *</label>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => manejarCambio('fecha', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  errores.fecha ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errores.fecha && <p className="text-red-500 text-xs mt-1">{errores.fecha}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hora *</label>
              <input
                type="time"
                value={formData.hora}
                onChange={(e) => manejarCambio('hora', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  errores.hora ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errores.hora && <p className="text-red-500 text-xs mt-1">{errores.hora}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duración aproximada</label>
            <select
              value={formData.duracion}
              onChange={(e) => manejarCambio('duracion', Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              {duracionesMinutos.map((d) => (
                <option key={d.valor} value={d.valor}>
                  {d.etiqueta}
                </option>
              ))}
            </select>
          </div>

          {serviciosDisponibles.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de servicio (opcional)</label>
              <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-3">
                {serviciosDisponibles.map((servicio) => (
                  <label key={servicio} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.servicios.includes(servicio)}
                      onChange={() => manejarServicio(servicio)}
                      className="mr-2 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-sm">{servicio}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono de contacto *</label>
            <input
              type="tel"
              value={formData.telefonoContacto}
              onChange={(e) => manejarCambio('telefonoContacto', e.target.value)}
              placeholder="+54 9 11 1234-5678"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                errores.telefonoContacto ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errores.telefonoContacto && (
              <p className="text-red-500 text-xs mt-1">{errores.telefonoContacto}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => manejarCambio('observaciones', e.target.value)}
              rows={3}
              placeholder="Punto de encuentro, conducta con otros perros, medicación, etc."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

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
              className="flex-1 py-3 px-4 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCargando ? 'Enviando…' : 'Solicitar cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
