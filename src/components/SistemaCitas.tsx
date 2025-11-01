import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { agregarCita, obtenerCitasProfesional, actualizarCita, eliminarCita } from '../data/firebase/firebase';

interface Cita {
  id?: string;
  mascotaId: string;
  mascotaNombre: string;
  propietarioId: string;
  propietarioNombre: string;
  propietarioTelefono: string;
  profesionalId: string;
  profesionalNombre: string;
  tipoProfesional: 'veterinario' | 'peluquero';
  tipoCita: string;
  fecha: string;
  hora: string;
  duracion: number; // en minutos
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
  notas?: string;
  precio?: number;
  fechaCreacion: Date;
}

interface SistemaCitasProps {
  mascotaId?: string;
  mascotaNombre?: string;
  propietarioId?: string;
  propietarioNombre?: string;
  propietarioTelefono?: string;
  onCerrar: () => void;
}

export const SistemaCitas: React.FC<SistemaCitasProps> = ({
  mascotaId,
  mascotaNombre,
  propietarioId,
  propietarioNombre,
  propietarioTelefono,
  onCerrar
}) => {
  const { datosUsuario } = useAuth();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);
  const [isCargando, setIsCargando] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<string>('todas');

  const [formData, setFormData] = useState({
    tipoCita: '',
    fecha: '',
    hora: '',
    duracion: 60,
    notas: '',
    precio: 0 as number
  });

  // Cargar citas del profesional
  useEffect(() => {
    if (datosUsuario?.uid) {
      cargarCitas();
    }
  }, [datosUsuario?.uid]);

  const cargarCitas = async () => {
    if (!datosUsuario?.uid) return;
    
    setIsCargando(true);
    try {
      const citasData = await obtenerCitasProfesional(datosUsuario.uid);
      setCitas(citasData || []);
    } catch (error) {
      console.error('Error al cargar citas:', error);
    } finally {
      setIsCargando(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!datosUsuario?.uid || !mascotaId || !propietarioId) {
      alert('Faltan datos necesarios para crear la cita');
      return;
    }

    setIsCargando(true);
    try {
      const nuevaCita: Omit<Cita, 'id'> = {
        mascotaId,
        mascotaNombre: mascotaNombre || 'Sin nombre',
        propietarioId,
        propietarioNombre: propietarioNombre || 'Sin nombre',
        propietarioTelefono: propietarioTelefono || '',
        profesionalId: datosUsuario.uid,
        profesionalNombre: datosUsuario.nombre || 'Profesional',
        tipoProfesional: datosUsuario.tipoProfesional as 'veterinario' | 'peluquero',
        tipoCita: formData.tipoCita,
        fecha: formData.fecha,
        hora: formData.hora,
        duracion: formData.duracion,
        estado: 'pendiente',
        notas: formData.notas,
        precio: formData.precio,
        fechaCreacion: new Date()
      };

      if (citaSeleccionada) {
        // Actualizar cita existente
        await actualizarCita(citaSeleccionada.id!, { ...nuevaCita, id: citaSeleccionada.id });
      } else {
        // Crear nueva cita
        await agregarCita(nuevaCita);
      }

      setFormData({
        tipoCita: '',
        fecha: '',
        hora: '',
        duracion: 60,
        notas: '',
        precio: 0
      });
      setCitaSeleccionada(null);
      setMostrarFormulario(false);
      await cargarCitas();
    } catch (error) {
      console.error('Error al guardar cita:', error);
      alert('Error al guardar la cita. Inténtalo de nuevo.');
    } finally {
      setIsCargando(false);
    }
  };

  const handleEditarCita = (cita: Cita) => {
    setCitaSeleccionada(cita);
    setFormData({
      tipoCita: cita.tipoCita,
      fecha: cita.fecha,
      hora: cita.hora,
      duracion: cita.duracion,
      notas: cita.notas || '',
      precio: cita.precio || 0
    });
    setMostrarFormulario(true);
  };

  const handleCambiarEstado = async (citaId: string, nuevoEstado: Cita['estado']) => {
    try {
      await actualizarCita(citaId, { estado: nuevoEstado });
      await cargarCitas();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado de la cita.');
    }
  };

  const handleEliminarCita = async (citaId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta cita?')) return;
    
    try {
      await eliminarCita(citaId);
      await cargarCitas();
    } catch (error) {
      console.error('Error al eliminar cita:', error);
      alert('Error al eliminar la cita.');
    }
  };

  const citasFiltradas = citas.filter(cita => 
    filtroEstado === 'todas' || cita.estado === filtroEstado
  );

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'confirmada': return 'bg-blue-100 text-blue-800';
      case 'completada': return 'bg-green-100 text-green-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">Sistema de Citas</h3>
        <button
          onClick={onCerrar}
          className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
        >
          ×
        </button>
      </div>

      {/* Filtros */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="todas">Todas las citas</option>
            <option value="pendiente">Pendientes</option>
            <option value="confirmada">Confirmadas</option>
            <option value="completada">Completadas</option>
            <option value="cancelada">Canceladas</option>
          </select>
        </div>
        
        <button
          onClick={() => setMostrarFormulario(true)}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors duration-200"
        >
          Nueva Cita
        </button>
      </div>

      {/* Formulario de Cita */}
      {mostrarFormulario && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h4 className="font-semibold text-gray-900 mb-4">
            {citaSeleccionada ? 'Editar Cita' : 'Nueva Cita'}
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Cita
                </label>
                <select
                  name="tipoCita"
                  value={formData.tipoCita}
                  onChange={(e) => setFormData(prev => ({ ...prev, tipoCita: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">Seleccionar tipo</option>
                  {datosUsuario?.tipoProfesional === 'veterinario' ? (
                    <>
                      <option value="Consulta general">Consulta general</option>
                      <option value="Vacunación">Vacunación</option>
                      <option value="Cirugía">Cirugía</option>
                      <option value="Emergencia">Emergencia</option>
                      <option value="Control">Control</option>
                    </>
                  ) : (
                    <>
                      <option value="Baño y corte">Baño y corte</option>
                      <option value="Corte de raza">Corte de raza</option>
                      <option value="Baño terapéutico">Baño terapéutico</option>
                      <option value="Manicure">Manicure</option>
                      <option value="Tratamiento anti-pulgas">Tratamiento anti-pulgas</option>
                    </>
                  )}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora
                </label>
                <input
                  type="time"
                  name="hora"
                  value={formData.hora}
                  onChange={(e) => setFormData(prev => ({ ...prev, hora: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duración (minutos)
                </label>
                <input
                  type="number"
                  name="duracion"
                  value={formData.duracion}
                  onChange={(e) => setFormData(prev => ({ ...prev, duracion: parseInt(e.target.value) || 60 }))}
                  min="15"
                  step="15"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio ($)
                </label>
                                <input
                  type="number"
                  name="precio"
                  value={formData.precio.toString()}
                  onChange={(e) => setFormData(prev => ({ ...prev, precio: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas
              </label>
              <textarea
                name="notas"
                value={formData.notas}
                onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Observaciones adicionales..."
              />
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setMostrarFormulario(false);
                  setCitaSeleccionada(null);
                  setFormData({
                    tipoCita: '',
                    fecha: '',
                    hora: '',
                    duracion: 60,
                    notas: '',
                    precio: 0
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isCargando}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
              >
                {isCargando ? 'Guardando...' : (citaSeleccionada ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Citas */}
      {isCargando ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando citas...</p>
        </div>
      ) : citasFiltradas.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay citas {filtroEstado !== 'todas' ? filtroEstado : ''}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {citasFiltradas.map((cita) => (
            <div key={cita.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h5 className="font-semibold text-gray-900">{cita.tipoCita}</h5>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(cita.estado)}`}>
                      {cita.estado}
                    </span>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p><strong>Mascota:</strong> {cita.mascotaNombre}</p>
                      <p><strong>Propietario:</strong> {cita.propietarioNombre}</p>
                      <p><strong>Teléfono:</strong> {cita.propietarioTelefono}</p>
                    </div>
                    <div>
                      <p><strong>Fecha:</strong> {new Date(cita.fecha).toLocaleDateString()}</p>
                      <p><strong>Hora:</strong> {cita.hora}</p>
                      <p><strong>Duración:</strong> {cita.duracion} min</p>
                      {cita.precio && <p><strong>Precio:</strong> ${cita.precio.toLocaleString()}</p>}
                    </div>
                  </div>
                  
                  {cita.notas && (
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Notas:</strong> {cita.notas}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => handleEditarCita(cita)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Editar
                  </button>
                  
                  {cita.estado === 'pendiente' && (
                    <>
                      <button
                        onClick={() => handleCambiarEstado(cita.id!, 'confirmada')}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => handleCambiarEstado(cita.id!, 'cancelada')}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                  
                  {cita.estado === 'confirmada' && (
                    <button
                      onClick={() => handleCambiarEstado(cita.id!, 'completada')}
                      className="text-green-600 hover:text-green-800 text-sm"
                    >
                      Completar
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleEliminarCita(cita.id!)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 