import React, { useState, useEffect } from 'react';
import { 
  agregarProducto, 
  actualizarProducto, 
  eliminarProducto, 
  obtenerProductosPorProfesional,
  agregarDescuento,
  actualizarDescuento,
  eliminarDescuento,
  obtenerDescuentosPorProfesional
} from '../data/firebase/firebase';

const GestionTienda = ({ datosTienda, onActualizarTienda, profesionalId }) => {
  const [productos, setProductos] = useState([]);
  const [descuentos, setDescuentos] = useState([]);
  const [pestañaActiva, setPestañaActiva] = useState('productos');
  const [mostrarFormularioProducto, setMostrarFormularioProducto] = useState(false);
  const [mostrarFormularioDescuento, setMostrarFormularioDescuento] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [descuentoEditando, setDescuentoEditando] = useState(null);
  const [isGuardando, setIsGuardando] = useState(false);
  const [isCargandoProductos, setIsCargandoProductos] = useState(false);

  const LIMITE_PRODUCTOS_GRATIS = 7;

  // Cargar productos y descuentos al montar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      if (!profesionalId) return;
      
      setIsCargandoProductos(true);
      try {
        // Cargar productos
        const productosCargados = await obtenerProductosPorProfesional(profesionalId);
        setProductos(productosCargados);
        
        // Cargar descuentos
        const descuentosCargados = await obtenerDescuentosPorProfesional(profesionalId);
        setDescuentos(descuentosCargados);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        alert('Error al cargar los datos');
      } finally {
        setIsCargandoProductos(false);
      }
    };

    cargarDatos();
  }, [profesionalId]);

  // Formulario de producto
  const [formProducto, setFormProducto] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoria: '',
    imagenUrl: ''
  });

  // Formulario de descuento
  const [formDescuento, setFormDescuento] = useState({
    nombre: '',
    porcentaje: '',
    fechaInicio: '',
    fechaFin: '',
    productosAplicables: []
  });

  // Limpiar formularios
  const limpiarFormularios = () => {
    setFormProducto({
      nombre: '',
      descripcion: '',
      precio: '',
      stock: '',
      categoria: '',
      imagenUrl: ''
    });
    setFormDescuento({
      nombre: '',
      porcentaje: '',
      fechaInicio: '',
      fechaFin: '',
      productosAplicables: []
    });
    setProductoEditando(null);
    setDescuentoEditando(null);
  };

  // Abrir formulario para agregar producto
  const abrirFormularioProducto = () => {
    if (productos.length >= LIMITE_PRODUCTOS_GRATIS) {
      alert(`Has alcanzado el límite de ${LIMITE_PRODUCTOS_GRATIS} productos. Considera actualizar tu plan para agregar más productos.`);
      return;
    }
    setMostrarFormularioProducto(true);
    limpiarFormularios();
  };

  // Abrir formulario para agregar descuento
  const abrirFormularioDescuento = () => {
    setMostrarFormularioDescuento(true);
    limpiarFormularios();
  };

  // Abrir formulario para editar producto
  const editarProducto = (producto) => {
    setProductoEditando(producto);
    setFormProducto({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio.toString(),
      stock: producto.stock.toString(),
      categoria: producto.categoria,
      imagenUrl: producto.imagenUrl || ''
    });
    setMostrarFormularioProducto(true);
  };

  // Abrir formulario para editar descuento
  const editarDescuento = (descuento) => {
    setDescuentoEditando(descuento);
    setFormDescuento({
      nombre: descuento.nombre,
      porcentaje: descuento.porcentaje.toString(),
      fechaInicio: new Date(descuento.fechaInicio).toISOString().split('T')[0],
      fechaFin: new Date(descuento.fechaFin).toISOString().split('T')[0],
      productosAplicables: descuento.productosAplicables || []
    });
    setMostrarFormularioDescuento(true);
  };

  // Guardar producto
  const guardarProducto = async (e) => {
    e.preventDefault();
    setIsGuardando(true);

    try {
      const datosProducto = {
        nombre: formProducto.nombre,
        descripcion: formProducto.descripcion,
        precio: parseFloat(formProducto.precio),
        stock: parseInt(formProducto.stock),
        categoria: formProducto.categoria,
        imagenUrl: formProducto.imagenUrl || undefined,
        nombreProfesional: datosTienda?.nombre || 'Tienda'
      };

      if (productoEditando) {
        // Actualizar producto existente
        await actualizarProducto(profesionalId, productoEditando.id, datosProducto);
        
        // Actualizar estado local
        const productosActualizados = productos.map(p => 
          p.id === productoEditando.id 
            ? { ...p, ...datosProducto, fechaActualizacion: new Date() }
            : p
        );
        setProductos(productosActualizados);
      } else {
        // Crear nuevo producto
        const nuevoProductoId = await agregarProducto(profesionalId, datosProducto);
        
        // Agregar a estado local
        const nuevoProducto = {
          id: nuevoProductoId,
          ...datosProducto,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
          isActivo: true
        };
        setProductos([nuevoProducto, ...productos]);
      }

      setMostrarFormularioProducto(false);
      limpiarFormularios();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      alert('Error al guardar el producto');
    } finally {
      setIsGuardando(false);
    }
  };

  // Eliminar producto
  const handleEliminarProducto = async (id) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await eliminarProducto(profesionalId, id);
        const productosActualizados = productos.filter(p => p.id !== id);
        setProductos(productosActualizados);
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        alert('Error al eliminar el producto');
      }
    }
  };

  // Eliminar descuento
  const handleEliminarDescuento = async (id) => {
    if (confirm('¿Estás seguro de que quieres eliminar este descuento?')) {
      try {
        await eliminarDescuento(profesionalId, id);
        const descuentosActualizados = descuentos.filter(d => d.id !== id);
        setDescuentos(descuentosActualizados);
      } catch (error) {
        console.error('Error al eliminar descuento:', error);
        alert('Error al eliminar el descuento');
      }
    }
  };

  // Guardar descuento
  const guardarDescuento = async (e) => {
    e.preventDefault();
    setIsGuardando(true);

    try {
      const datosDescuento = {
        nombre: formDescuento.nombre,
        porcentaje: parseFloat(formDescuento.porcentaje),
        fechaInicio: new Date(formDescuento.fechaInicio),
        fechaFin: new Date(formDescuento.fechaFin),
        productosAplicables: formDescuento.productosAplicables
      };

      if (descuentoEditando) {
        // Actualizar descuento existente
        await actualizarDescuento(profesionalId, descuentoEditando.id, datosDescuento);
        
        // Actualizar estado local
        const descuentosActualizados = descuentos.map(d => 
          d.id === descuentoEditando.id 
            ? { ...d, ...datosDescuento, fechaActualizacion: new Date() }
            : d
        );
        setDescuentos(descuentosActualizados);
      } else {
        // Crear nuevo descuento
        const nuevoDescuentoId = await agregarDescuento(profesionalId, datosDescuento);
        
        // Agregar a estado local
        const nuevoDescuento = {
          id: nuevoDescuentoId,
          ...datosDescuento,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
          isActivo: true
        };
        setDescuentos([nuevoDescuento, ...descuentos]);
      }

      setMostrarFormularioDescuento(false);
      limpiarFormularios();
    } catch (error) {
      console.error('Error al guardar descuento:', error);
      alert('Error al guardar el descuento');
    } finally {
      setIsGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{productos.length}</div>
            <div className="text-sm text-gray-600">Productos activos</div>
            <div className="text-xs text-gray-500">
              {productos.length >= LIMITE_PRODUCTOS_GRATIS ? (
                <span className="text-orange-600">Límite alcanzado</span>
              ) : (
                `${LIMITE_PRODUCTOS_GRATIS - productos.length} restantes`
              )}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{descuentos.length}</div>
            <div className="text-sm text-gray-600">Descuentos activos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              ${productos.reduce((total, p) => total + p.precio, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Valor total inventario</div>
          </div>
        </div>
      </div>

      {/* Pestañas */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="border-b border-gray-200">
          <div className="flex space-x-4 p-6">
            <button 
              onClick={() => setPestañaActiva('productos')}
              className={`pb-2 font-medium transition-colors duration-200 ${
                pestañaActiva === 'productos' 
                  ? 'border-b-2 border-green-500 text-green-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Productos
            </button>
            <button 
              onClick={() => setPestañaActiva('descuentos')}
              className={`pb-2 font-medium transition-colors duration-200 ${
                pestañaActiva === 'descuentos' 
                  ? 'border-b-2 border-green-500 text-green-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Descuentos
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Pestaña Productos */}
          {pestañaActiva === 'productos' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Gestión de Productos</h3>
                <button
                  onClick={abrirFormularioProducto}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200"
                >
                  + Agregar Producto
                </button>
              </div>

              {/* Lista de productos */}
              {isCargandoProductos ? (
                <div className="col-span-full text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                  <p className="mt-2 text-gray-600">Cargando productos...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {productos.map((producto) => (
                    <div key={producto.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center space-x-3 mb-3">
                        {producto.imagenUrl ? (
                          <img 
                            src={producto.imagenUrl} 
                            alt={producto.nombre}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{producto.nombre}</h4>
                          <p className="text-sm text-gray-600">{producto.categoria}</p>
                          <p className="text-lg font-bold text-green-600">${producto.precio}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{producto.descripcion}</p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Stock: {producto.stock}</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => editarProducto(producto)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleEliminarProducto(producto.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>

                  {productos.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <p className="text-gray-600">No hay productos registrados</p>
                      <p className="text-sm text-gray-500 mt-1">Comienza agregando tu primer producto</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Pestaña Descuentos */}
          {pestañaActiva === 'descuentos' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Gestión de Descuentos</h3>
                <button
                  onClick={abrirFormularioDescuento}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
                >
                  + Agregar Descuento
                </button>
              </div>

              {/* Lista de descuentos */}
              <div className="space-y-4">
                {descuentos.map((descuento) => (
                  <div key={descuento.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{descuento.nombre}</h4>
                        <p className="text-lg font-bold text-blue-600">{descuento.porcentaje}% OFF</p>
                        <p className="text-sm text-gray-600">
                          {new Date(descuento.fechaInicio).toLocaleDateString()} - {new Date(descuento.fechaFin).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          Aplica a {descuento.productosAplicables.length} productos
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => editarDescuento(descuento)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleEliminarDescuento(descuento.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {descuentos.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                  <p className="text-gray-600">No hay descuentos configurados</p>
                  <p className="text-sm text-gray-500 mt-1">Crea descuentos para atraer más clientes</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Formulario Producto */}
      {mostrarFormularioProducto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {productoEditando ? 'Editar Producto' : 'Agregar Producto'}
              </h3>
              
              <form onSubmit={guardarProducto} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del producto
                  </label>
                  <input
                    type="text"
                    value={formProducto.nombre}
                    onChange={(e) => setFormProducto({...formProducto, nombre: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formProducto.descripcion}
                    onChange={(e) => setFormProducto({...formProducto, descripcion: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formProducto.precio}
                      onChange={(e) => setFormProducto({...formProducto, precio: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      value={formProducto.stock}
                      onChange={(e) => setFormProducto({...formProducto, stock: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={formProducto.categoria}
                    onChange={(e) => setFormProducto({...formProducto, categoria: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="alimentos">Alimentos</option>
                    <option value="juguetes">Juguetes</option>
                    <option value="accesorios">Accesorios</option>
                    <option value="higiene">Higiene</option>
                    <option value="medicamentos">Medicamentos</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de imagen (opcional)
                  </label>
                  <input
                    type="url"
                    value={formProducto.imagenUrl}
                    onChange={(e) => setFormProducto({...formProducto, imagenUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarFormularioProducto(false);
                      limpiarFormularios();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isGuardando}
                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
                  >
                    {isGuardando ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Formulario Descuento */}
      {mostrarFormularioDescuento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {descuentoEditando ? 'Editar Descuento' : 'Agregar Descuento'}
              </h3>
              
              <form onSubmit={guardarDescuento} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del descuento
                  </label>
                  <input
                    type="text"
                    value={formDescuento.nombre}
                    onChange={(e) => setFormDescuento({...formDescuento, nombre: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Porcentaje de descuento
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formDescuento.porcentaje}
                    onChange={(e) => setFormDescuento({...formDescuento, porcentaje: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha inicio
                    </label>
                    <input
                      type="date"
                      value={formDescuento.fechaInicio}
                      onChange={(e) => setFormDescuento({...formDescuento, fechaInicio: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha fin
                    </label>
                    <input
                      type="date"
                      value={formDescuento.fechaFin}
                      onChange={(e) => setFormDescuento({...formDescuento, fechaFin: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Productos aplicables
                  </label>
                  <select
                    multiple
                    value={formDescuento.productosAplicables}
                    onChange={(e) => {
                      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                      setFormDescuento({...formDescuento, productosAplicables: selectedOptions});
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    size={4}
                  >
                    {productos.map(producto => (
                      <option key={producto.id} value={producto.id}>
                        {producto.nombre} - ${producto.precio}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Mantén presionado Ctrl (Cmd en Mac) para seleccionar múltiples productos
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarFormularioDescuento(false);
                      limpiarFormularios();
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

export default GestionTienda;