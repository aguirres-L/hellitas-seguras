import React, { useEffect, useState } from 'react';
import {
  obtenerServiciosPorProfesional,
  obtenerProductosPorProfesional,
  obtenerDescuentosPorProfesional,
  agregarDescuento,
  actualizarDescuento,
  eliminarDescuento,
} from '../data/firebase/firebase';

const GestionDescuentosServicios = ({ profesionalId, datosProfesional }) => {
  const [servicios, setServicios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [descuentos, setDescuentos] = useState([]);
  const [isCargando, setIsCargando] = useState(false);
  const [isGuardando, setIsGuardando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [descuentoEditando, setDescuentoEditando] = useState(null);

  const [formDescuento, setFormDescuento] = useState({
    nombre: '',
    porcentaje: '',
    fechaInicio: '',
    fechaFin: '',
    serviciosAplicables: [],
    productosAplicables: [],
  });

  useEffect(() => {
    const cargar = async () => {
      if (!profesionalId) return;
      setIsCargando(true);
      try {
        const [srv, prod, dsc] = await Promise.all([
          obtenerServiciosPorProfesional(profesionalId).catch(() => []),
          obtenerProductosPorProfesional(profesionalId).catch(() => []),
          obtenerDescuentosPorProfesional(profesionalId).catch(() => []),
        ]);
        setServicios(srv || []);
        setProductos(prod || []);
        setDescuentos(dsc || []);
      } catch (e) {
        console.error('Error cargando datos de descuentos:', e);
        alert('Error al cargar datos de descuentos');
      } finally {
        setIsCargando(false);
      }
    };
    cargar();
  }, [profesionalId]);

  const limpiarForm = () => {
    setFormDescuento({
      nombre: '',
      porcentaje: '',
      fechaInicio: '',
      fechaFin: '',
      serviciosAplicables: [],
      productosAplicables: [],
    });
    setDescuentoEditando(null);
  };

  const abrirNuevo = () => {
    limpiarForm();
    setMostrarFormulario(true);
  };

  const editar = (d) => {
    setDescuentoEditando(d);
    setFormDescuento({
      nombre: d.nombre || '',
      porcentaje: String(d.porcentaje ?? ''),
      fechaInicio: d.fechaInicio ? new Date(d.fechaInicio).toISOString().split('T')[0] : '',
      fechaFin: d.fechaFin ? new Date(d.fechaFin).toISOString().split('T')[0] : '',
      serviciosAplicables: d.serviciosAplicables || [],
      productosAplicables: d.productosAplicables || [],
    });
    setMostrarFormulario(true);
  };

  const onEliminar = async (id) => {
    if (!confirm('¿Eliminar este descuento?')) return;
    try {
      await eliminarDescuento(profesionalId, id);
      setDescuentos((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      console.error(e);
      alert('Error eliminando el descuento');
    }
  };

  const guardar = async (e) => {
    e.preventDefault();
    setIsGuardando(true);

    // Validaciones mínimas
    const porcentajeNum = Number(formDescuento.porcentaje);
    if (!formDescuento.nombre.trim() || isNaN(porcentajeNum) || porcentajeNum <= 0 || porcentajeNum > 90) {
      alert('Completa nombre y porcentaje válido (1-90).');
      setIsGuardando(false);
      return;
    }
    if (!formDescuento.fechaInicio || !formDescuento.fechaFin || new Date(formDescuento.fechaFin) < new Date(formDescuento.fechaInicio)) {
      alert('Rango de fechas inválido.');
      setIsGuardando(false);
      return;
    }

    const payload = {
      nombre: formDescuento.nombre.trim(),
      porcentaje: porcentajeNum,
      fechaInicio: new Date(formDescuento.fechaInicio),
      fechaFin: new Date(formDescuento.fechaFin),
      serviciosAplicables: formDescuento.serviciosAplicables,
      productosAplicables: formDescuento.productosAplicables,
    };

    try {
      if (descuentoEditando) {
        await actualizarDescuento(profesionalId, descuentoEditando.id, payload);
        setDescuentos((prev) => prev.map((d) => (d.id === descuentoEditando.id ? { ...d, ...payload, fechaActualizacion: new Date() } : d)));
      } else {
        const id = await agregarDescuento(profesionalId, payload);
        setDescuentos((prev) => [
          { id, ...payload, fechaCreacion: new Date(), fechaActualizacion: new Date(), isActivo: true },
          ...prev,
        ]);
      }
      setMostrarFormulario(false);
      limpiarForm();
    } catch (e) {
      console.error(e);
      alert('Error guardando el descuento');
    } finally {
      setIsGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900">Gestión de Descuentos</h3>
        <button onClick={abrirNuevo} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200">
          + Agregar Descuento
        </button>
      </div>

      {isCargando ? (
        <div className="text-center py-8 text-gray-600">Cargando...</div>
      ) : (
        <div className="space-y-4">
          {descuentos.map((d) => (
            <div key={d.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-900">{d.nombre}</h4>
                  <p className="text-lg font-bold text-blue-600">{d.porcentaje}% OFF</p>
                  <p className="text-sm text-gray-600">
                    {new Date(d.fechaInicio).toLocaleDateString()} - {new Date(d.fechaFin).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Aplica a { (d.serviciosAplicables?.length || 0) + (d.productosAplicables?.length || 0) } ítems
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => editar(d)} className="text-blue-600 hover:text-blue-800 text-sm">Editar</button>
                  <button onClick={() => onEliminar(d.id)} className="text-red-600 hover:text-red-800 text-sm">Eliminar</button>
                </div>
              </div>
            </div>
          ))}

          {descuentos.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">No hay descuentos configurados</p>
              <p className="text-sm text-gray-500 mt-1">Crea descuentos para atraer más clientes</p>
            </div>
          )}
        </div>
      )}

      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{descuentoEditando ? 'Editar Descuento' : 'Agregar Descuento'}</h3>
              <form onSubmit={guardar} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={formDescuento.nombre}
                    onChange={(e) => setFormDescuento({ ...formDescuento, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Porcentaje</label>
                  <input
                    type="number"
                    step="1"
                    value={formDescuento.porcentaje}
                    onChange={(e) => setFormDescuento({ ...formDescuento, porcentaje: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inicio</label>
                    <input
                      type="date"
                      value={formDescuento.fechaInicio}
                      onChange={(e) => setFormDescuento({ ...formDescuento, fechaInicio: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fin</label>
                    <input
                      type="date"
                      value={formDescuento.fechaFin}
                      onChange={(e) => setFormDescuento({ ...formDescuento, fechaFin: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {servicios.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Servicios aplicables</label>
                    <select
                      multiple
                      value={formDescuento.serviciosAplicables}
                      onChange={(e) => {
                        const values = Array.from(e.target.selectedOptions).map((o) => o.value);
                        setFormDescuento({ ...formDescuento, serviciosAplicables: values });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {servicios.map((s) => (
                        <option key={s.id} value={s.id}>{s.nombre || 'Servicio'}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Sostén Ctrl/Cmd para seleccionar múltiples.</p>
                  </div>
                )}

                {productos.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Productos aplicables (opcional)</label>
                    <select
                      multiple
                      value={formDescuento.productosAplicables}
                      onChange={(e) => {
                        const values = Array.from(e.target.selectedOptions).map((o) => o.value);
                        setFormDescuento({ ...formDescuento, productosAplicables: values });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {productos.map((p) => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarFormulario(false);
                      limpiarForm();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isGuardando}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isGuardando ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionDescuentosServicios;


