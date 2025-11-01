import React, { useState, useEffect } from 'react';
import { obtenerProductosPorProfesional, obtenerDescuentosPorProfesional } from '../data/firebase/firebase';
import { useTheme } from '../contexts/ThemeContext';

export default function Tiendas({ tiendas, isCargando = false }) {
  const [tiendasConDatos, setTiendasConDatos] = useState([]);
  const [isCargandoDatos, setIsCargandoDatos] = useState(false);
const { typeTheme } = useTheme();

  // Cargar productos y descuentos para cada tienda
  useEffect(() => {
    const cargarDatosTiendas = async () => {
      if (!tiendas || tiendas.length === 0) return;
      
      setIsCargandoDatos(true);
      try {
        const tiendasConDatosCompletos = await Promise.all(
          tiendas.map(async (tienda) => {
            try {
              const [productos, descuentos] = await Promise.all([
                obtenerProductosPorProfesional(tienda.id),
                obtenerDescuentosPorProfesional(tienda.id)
              ]);
              
              return {
                ...tienda,
                productos: productos || [],
                descuentos: descuentos || []
              };
            } catch (error) {
              console.error(`Error al cargar datos de tienda ${tienda.id}:`, error);
              return {
                ...tienda,
                productos: [],
                descuentos: []
              };
            }
          })
        );
        
        setTiendasConDatos(tiendasConDatosCompletos);
      } catch (error) {
        console.error('Error al cargar datos de tiendas:', error);
      } finally {
        setIsCargandoDatos(false);
      }
    };

    cargarDatosTiendas();
  }, [tiendas]);

  const [tiendaSeleccionada, setTiendaSeleccionada] = useState(null);

  const manejarVerDetalles = (tienda) => {
    setTiendaSeleccionada(tienda);
  };

  const cerrarDetalles = () => {
    setTiendaSeleccionada(null);
  };

  return (
    <div className="mt-12">
      <h3 className={typeTheme === 'dark'
  ? "text-2xl font-bold mb-6 text-white"
  : "text-2xl font-bold mb-6 text-gray-900"
}>Tiendas Registradas</h3>
      
      {isCargando ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <p className="mt-2 text-gray-600">Cargando tiendas...</p>
        </div>
      ) : tiendas.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No hay tiendas disponibles en este momento.</p>
        </div>
      ) : (
        <div className="flex overflow-x-auto gap-6 pb-4">
          {tiendasConDatos.map((tienda) => (
            <div key={tienda.id} className="bg-white p-6 rounded-lg shadow-sm min-w-[300px] flex-shrink-0 overflow-hidden">
              {/* Imagen del local */}
              <div 
                className="mb-4 overflow-hidden rounded-lg relative" 
                style={{ 
                  width: '100%', 
                  height: '128px', 
                  minHeight: '128px',
                  maxHeight: '128px',
                  flexShrink: 0
                }}
              >
                {tienda.fotoLocalUrl ? (
                  <img 
                    src={tienda.fotoLocalUrl} 
                    alt={`Local de ${tienda.nombre}`}
                    className="rounded-lg shadow-sm"
                    style={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '128px',
                      minWidth: '100%',
                      maxWidth: '100%',
                      minHeight: '128px',
                      maxHeight: '128px',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                ) : (
                  <div className="w-full h-32 bg-green-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-12 h-12 text-green-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <p className="text-xs text-green-400">Sin foto del local</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-bold text-lg text-green-600">{tienda.nombre}</h4>
                <span className="text-sm text-gray-500">{tienda.especialidad}</span>
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">📍</span> {tienda.direccion}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">📞</span> {tienda.telefono}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">🕒</span> {tienda.horario}
                </p>
              </div>

              {/* Estadísticas rápidas */}
              <div className="mb-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-green-50 p-2 rounded">
                    <div className="text-lg font-bold text-green-600">{tienda.productos.length}</div>
                    <div className="text-xs text-gray-600">Productos</div>
                  </div>
                  <div className="bg-blue-50 p-2 rounded">
                    <div className="text-lg font-bold text-blue-600">{tienda.descuentos.length}</div>
                    <div className="text-xs text-gray-600">Descuentos</div>
                  </div>
                </div>
              </div>

              {/* Productos destacados (máximo 3) */}
              {tienda.productos.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Productos destacados:</h5>
                  <div className="space-y-1">
                    {tienda.productos.slice(0, 3).map((producto) => (
                      <div key={producto.id} className="flex justify-between items-center text-xs">
                        <span className="text-gray-600 truncate">{producto.nombre}</span>
                        <span className="font-medium text-green-600">${producto.precio}</span>
                      </div>
                    ))}
                    {tienda.productos.length > 3 && (
                      <p className="text-xs text-gray-500">+{tienda.productos.length - 3} más productos</p>
                    )}
                  </div>
                </div>
              )}

              {/* Descuentos activos */}
              {tienda.descuentos.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Descuentos activos:</h5>
                  <div className="space-y-1">
                    {tienda.descuentos.slice(0, 2).map((descuento) => (
                      <div key={descuento.id} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                        {descuento.nombre} - {descuento.porcentaje}% OFF
                      </div>
                    ))}
                    {tienda.descuentos.length > 2 && (
                      <p className="text-xs text-gray-500">+{tienda.descuentos.length - 2} más descuentos</p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <button 
                  onClick={() => manejarVerDetalles(tienda)}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Ver Productos y Descuentos
                </button>
                <button className="w-full border border-green-600 text-green-600 py-2 rounded-lg hover:bg-green-50 transition-colors duration-200">
                  Contactar Tienda
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalles de la tienda */}
      {tiendaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">{tiendaSeleccionada.nombre}</h3>
                  <p className="text-gray-600">{tiendaSeleccionada.especialidad}</p>
                  
                  {/* Imagen del local en el modal */}
                  {tiendaSeleccionada.fotoLocalUrl && (
                    <div className="mt-4">
                      <img 
                        src={tiendaSeleccionada.fotoLocalUrl} 
                        alt={`Local de ${tiendaSeleccionada.nombre}`}
                        className="w-full max-w-md h-48 object-cover rounded-lg shadow-sm"
                      />
                    </div>
                  )}
                </div>
                <button
                  onClick={cerrarDetalles}
                  className="text-gray-400 hover:text-gray-600 text-2xl ml-4"
                >
                  ×
                </button>
              </div>

              {/* Información de contacto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Información de contacto</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">📍</span> {tiendaSeleccionada.direccion}</p>
                    <p><span className="font-medium">📞</span> {tiendaSeleccionada.telefono}</p>
                    <p><span className="font-medium">🕒</span> {tiendaSeleccionada.horario}</p>
                    <p><span className="font-medium">📧</span> {tiendaSeleccionada.email}</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Estadísticas</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{tiendaSeleccionada.productos.length}</div>
                      <div className="text-sm text-gray-600">Productos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{tiendaSeleccionada.descuentos.length}</div>
                      <div className="text-sm text-gray-600">Descuentos</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pestañas */}
              <div className="border-b border-gray-200 mb-6">
                <div className="flex space-x-8">
                  <button className="pb-2 font-medium text-green-600 border-b-2 border-green-500">
                    Productos ({tiendaSeleccionada.productos.length})
                  </button>
                  <button className="pb-2 font-medium text-gray-600 hover:text-gray-800">
                    Descuentos ({tiendaSeleccionada.descuentos.length})
                  </button>
                </div>
              </div>

              {/* Lista de productos */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Productos disponibles</h4>
                {tiendaSeleccionada.productos.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Esta tienda aún no tiene productos registrados.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tiendaSeleccionada.productos.map((producto) => (
                      <div key={producto.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center space-x-3 mb-3">
                          {producto.imagenUrl ? (
                            <img 
                              src={producto.imagenUrl} 
                              alt={producto.nombre}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                          )}
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900 text-sm">{producto.nombre}</h5>
                            <p className="text-xs text-gray-600">{producto.categoria}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{producto.descripcion}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-green-600">${producto.precio}</span>
                          <span className="text-xs text-gray-500">Stock: {producto.stock}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Lista de descuentos */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Descuentos activos</h4>
                {tiendaSeleccionada.descuentos.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Esta tienda no tiene descuentos activos en este momento.</p>
                ) : (
                  <div className="space-y-4">
                    {tiendaSeleccionada.descuentos.map((descuento) => (
                      <div key={descuento.id} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-semibold text-orange-800">{descuento.nombre}</h5>
                            <p className="text-lg font-bold text-orange-600">{descuento.porcentaje}% OFF</p>
                            <p className="text-sm text-orange-700">
                              Válido hasta: {new Date(descuento.fechaFin).toLocaleDateString()}
                            </p>
                            {descuento.productosAplicables.length > 0 && (
                              <p className="text-xs text-orange-600 mt-1">
                                Aplica a {descuento.productosAplicables.length} productos
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                              Activo
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 