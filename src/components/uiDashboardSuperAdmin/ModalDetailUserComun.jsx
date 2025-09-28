import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import UiLiquidacionesUserComun from './UiLiquidacionUserComun';
import { getAllDataCollection } from '../../data/firebase/firebase';

export default function ModalDetailUserComun({ 
  usuario, 
  isAbierto, 
  onCerrar,
  onEditarUsuario 
}) {
  const { typeTheme } = useTheme();
  

   // controles para la vista del modal de liquidaciones
  const [isShowLiquidaciones, setIsShowLiquidaciones] = useState(false);


  // Estados para edición
  const [isEditando, setIsEditando] = useState(false);
  const [datosEditados, setDatosEditados] = useState({
    isMember: usuario?.isMember || false,
    tipoMensualidad: usuario?.tipoMensualidad || false
  });


  const [allChapitaUser, setAllChapitaUser] = useState([]);

// Función para cargar pagos del usuario
const getAllChapitasUsuario = async () => {
  if (!usuario?.id) {
    console.log('No hay usuario.id:', usuario);
    return;
  }
  
  console.log('Buscando pagos para usuario.id:', usuario.id);
  try {
    // Cargar pagos de chapitas
    const chapitas = await getAllDataCollection('pagoChapita');
    console.log('Todas las chapitas:', chapitas);
    const chapitasUsuario = chapitas.filter(pago => pago.usuarioId === usuario.id);
    console.log('Chapitas filtradas:', chapitasUsuario);
    setAllChapitaUser(chapitasUsuario);
  } catch (error) {
    console.error('Error al cargar pagos:', error);
  }
};

  useEffect(() => {
    getAllChapitasUsuario();
  }, [usuario?.id]);

  console.log(allChapitaUser,'allChapitaUser');
  
  // Si el modal no está abierto, no renderizar nada
  if (!isAbierto) return null;

  // Función para formatear fecha
  const formatearFecha = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return new Date(timestamp).toLocaleDateString('es-CL');
  };

  // Función para obtener el color del estado
  const obtenerColorEstado = (isMember) => {
    return isMember 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Función para obtener el color de la mensualidad
  const obtenerColorMensualidad = (tipoMensualidad) => {
    return tipoMensualidad 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };

  // Función para iniciar edición
  const handleIniciarEdicion = () => {
    setDatosEditados({
      isMember: usuario.isMember,
      tipoMensualidad: usuario.tipoMensualidad
    });
    setIsEditando(true);
  };

  // Función para cancelar edición
  const handleCancelarEdicion = () => {
    setIsEditando(false);
    setDatosEditados({
      isMember: usuario.isMember,
      tipoMensualidad: usuario.tipoMensualidad
    });
  };

  // Función para guardar cambios
  const handleGuardarCambios = async () => {
    if (window.confirm('¿Estás seguro de que quieres guardar estos cambios?')) {
      await onEditarUsuario(usuario.id, datosEditados);
      setIsEditando(false);
    }
  };

  // Función para cambiar estado
  const handleCambiarEstado = (nuevoEstado) => {
    setDatosEditados(prev => ({
      ...prev,
      isMember: nuevoEstado
    }));
  };

  // Función para cambiar mensualidad
  const handleCambiarMensualidad = (nuevaMensualidad) => {
    setDatosEditados(prev => ({
      ...prev,
      tipoMensualidad: nuevaMensualidad
    }));
  };


  
  
  console.log(usuario,'usuario');
  

  return (
    <div className="fixed h-screen w-screen inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onCerrar}
      ></div>

      {/* Modal */}
      <div className="flex w-screen h-screen items-center justify-center p-4">
        <div className={`relative overflow-hidden rounded-xl shadow-xl transform transition-all ${
          typeTheme === 'light' ? 'bg-white' : 'bg-gray-800'
        }`}>
          {/* Header del Modal */}
          <div className={`flex items-center justify-between p-6 border-b ${
            typeTheme === 'light' ? 'border-gray-200' : 'border-gray-700'
          }`}>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-lg font-bold text-blue-600">
                  {usuario.displayName ? usuario.displayName.charAt(0) : usuario.email.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className={`text-xl font-bold ${
                  typeTheme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  {usuario.displayName || usuario.nombre || 'Usuario'}
                </h2>
                <p className={`text-sm ${
                  typeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  ID: {usuario.id}
                </p>
              </div>
            </div>
            <button
              onClick={onCerrar}
              className={`p-2 rounded-lg transition-colors ${
                typeTheme === 'light' 
                  ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100' 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Contenido del Modal */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
             
             {!isShowLiquidaciones && (
              <>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Información Personal */}
              <div className={`rounded-xl p-6 ${
                typeTheme === 'light' ? 'bg-gray-50' : 'bg-gray-700'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  typeTheme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Información Personal
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className={`text-sm font-medium ${
                      typeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      Nombre Completo
                    </label>
                    <p className={`text-sm ${
                      typeTheme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>
                      {usuario.displayName || usuario.nombre || 'No especificado'}
                    </p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${
                      typeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      Email
                    </label>
                    <p className={`text-sm ${
                      typeTheme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>
                      {usuario.email}
                    </p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${
                      typeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      Teléfono
                    </label>
                    <p className={`text-sm ${
                      typeTheme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>
                      {usuario.telefono || 'No especificado'}
                    </p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${
                      typeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      Dirección
                    </label>
                    <p className={`text-sm ${
                      typeTheme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>
                      {usuario.direccion || 'No especificada'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Estado de la Cuenta */}
              <div className={`rounded-xl p-6 ${
                typeTheme === 'light' ? 'bg-gray-50' : 'bg-gray-700'
              }`}>
                <div className="flex items-center justify-center mb-4 flex-col sm:flex-row sm:space-x-2 ">
                  <h3 className={`text-lg font-semibold ${
                    typeTheme === 'light' ? 'text-gray-900' : 'text-white'
                  }`}>
                    Estado de la Cuenta
                  </h3>
                 
                  <div className="flex flex-col  sm:flex-row  sm:space-x-2">

                  {!isEditando && (
                    <button
                      onClick={handleIniciarEdicion}
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                    >
                      Editar
                    </button>
                  )}
                    <button
                      onClick={() => setIsShowLiquidaciones(true)}
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                    >
                      Pagos
                    </button>
                  </div>


                </div>
                <div className="space-y-3">
                  <div>
                    <label className={`text-sm font-medium ${
                      typeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      Estado
                    </label>
                    <div className="mt-1">
                      {isEditando ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleCambiarEstado(true)}
                            className={`px-3 py-1 text-sm font-semibold rounded-full border transition-colors ${
                              datosEditados.isMember 
                                ? 'bg-green-100 text-green-800 border-green-200' 
                                : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-green-50'
                            }`}
                          >
                            Activo
                          </button>
                          <button
                            onClick={() => handleCambiarEstado(false)}
                            className={`px-3 py-1 text-sm font-semibold rounded-full border transition-colors ${
                              !datosEditados.isMember 
                                ? 'bg-red-100 text-red-800 border-red-200' 
                                : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-red-50'
                            }`}
                          >
                            Inactivo
                          </button>
                        </div>
                      ) : (
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${obtenerColorEstado(usuario.isMember)}`}>
                          {usuario.isMember ? 'Activo' : 'Inactivo'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${
                      typeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      Mensualidad
                    </label>
                    <div className="mt-1">
                      {isEditando ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleCambiarMensualidad(true)}
                            className={`px-3 py-1 text-sm font-semibold rounded-full border transition-colors ${
                              datosEditados.tipoMensualidad 
                                ? 'bg-green-100 text-green-800 border-green-200' 
                                : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-green-50'
                            }`}
                          >
                            Activa
                          </button>
                          <button
                            onClick={() => handleCambiarMensualidad(false)}
                            className={`px-3 py-1 text-sm font-semibold rounded-full border transition-colors ${
                              !datosEditados.tipoMensualidad 
                                ? 'bg-red-100 text-red-800 border-red-200' 
                                : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-red-50'
                            }`}
                          >
                            Sin mensualidad
                          </button>
                        </div>
                      ) : (
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${obtenerColorMensualidad(usuario.tipoMensualidad)}`}>
                          {usuario.tipoMensualidad ? 'Mensualidad Activa' : 'Sin mensualidad'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${
                      typeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      Fecha de Registro
                    </label>
                    <p className={`text-sm ${
                      typeTheme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>
                      {formatearFecha(usuario.fechaRegistro || usuario.fechaCreacion)}
                    </p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${
                      typeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      Última Actualización
                    </label>
                    <p className={`text-sm ${
                      typeTheme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>
                      {formatearFecha(usuario.fechaActualizacion)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de Chapitas */}

            {/* Sección de Mascotas */}
            {usuario.infoMascotas && usuario.infoMascotas.length > 0 && (
              <div className={`mt-6 rounded-xl p-6 ${
                typeTheme === 'light' ? 'bg-gray-50' : 'bg-gray-700'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  typeTheme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Mascotas ({usuario.infoMascotas.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {usuario.infoMascotas.map((mascota) => (
                    <div key={mascota.id} className={`rounded-lg p-4 border ${
                      typeTheme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-600 border-gray-500'
                    }`}>
                      <div className="flex items-start space-x-4">
                        {mascota.fotoUrl && (
                          <img
                            src={mascota.fotoUrl}
                            alt={mascota.nombre}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className={`font-semibold ${
                            typeTheme === 'light' ? 'text-gray-900' : 'text-white'
                          }`}>
                            {mascota.nombre}
                          </h4>
                          <div className="mt-2 space-y-1">
                            <p className={`text-sm ${
                              typeTheme === 'light' ? 'text-gray-600' : 'text-gray-300'
                            }`}>
                              <span className="font-medium">Raza:</span> {mascota.raza}
                            </p>
                            <p className={`text-sm ${
                              typeTheme === 'light' ? 'text-gray-600' : 'text-gray-300'
                            }`}>
                              <span className="font-medium">Edad:</span> {mascota.edad} años
                            </p>
                            <p className={`text-sm ${
                              typeTheme === 'light' ? 'text-gray-600' : 'text-gray-300'
                            }`}>
                              <span className="font-medium">Color:</span> {mascota.color}
                            </p>
                            {mascota.alergias && (
                              <p className={`text-sm ${
                                typeTheme === 'light' ? 'text-gray-600' : 'text-gray-300'
                              }`}>
                                <span className="font-medium">Alergias:</span> {mascota.alergias}
                              </p>
                            )}
                            {mascota.enfermedades && (
                              <p className={`text-sm ${
                                typeTheme === 'light' ? 'text-gray-600' : 'text-gray-300'
                              }`}>
                                <span className="font-medium">Enfermedades:</span> {mascota.enfermedades}
                              </p>
                            )}
                            {mascota.notas && (
                              <p className={`text-sm ${
                                typeTheme === 'light' ? 'text-gray-600' : 'text-gray-300'
                              }`}>
                                <span className="font-medium">Notas:</span> {mascota.notas}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sección de Citas */}
            {usuario.citas && usuario.citas.length > 0 && (
              <div className={`mt-6 rounded-xl p-6 ${
                typeTheme === 'light' ? 'bg-gray-50' : 'bg-gray-700'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  typeTheme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Citas ({usuario.citas.length})
                </h3>
                <p className={`text-sm ${
                  typeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Información detallada de citas próximamente disponible
                </p>
              </div>
            )}
              </>
             )}

            {isShowLiquidaciones && (
              <UiLiquidacionesUserComun 
                setIsShowLiquidaciones={setIsShowLiquidaciones} 
                usuario={usuario}
              />
            )}

          </div>

          {/* Footer del Modal */}
          <div className={`flex justify-end space-x-3 p-6 border-t ${
            typeTheme === 'light' ? 'border-gray-200 bg-gray-50' : 'border-gray-700 bg-gray-800'
          }`}>
            {isEditando ? (
              <>
                <button
                  onClick={handleCancelarEdicion}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    typeTheme === 'light'
                      ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      : 'text-gray-300 bg-gray-700 border border-gray-600 hover:bg-gray-600'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarCambios}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Guardar Cambios
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onCerrar}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    typeTheme === 'light'
                      ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      : 'text-gray-300 bg-gray-700 border border-gray-600 hover:bg-gray-600'
                  }`}
                >
                  Cerrar
                </button>
                <button
                  onClick={handleIniciarEdicion}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Editar Usuario
                </button>
              </>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}