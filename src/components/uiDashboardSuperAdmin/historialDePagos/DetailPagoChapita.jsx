import { useState } from 'react';
import { actualizarEstadoChapita } from '../../../data/firebase/firebase';
import ModalAlert from '../../ui/svg/uiPetProfile/uiMetodoDePago/ModalAlert';
import { descargarQRCode, mostrarPreviewQR } from '../../genertaQR/QrComponent';

export default function DetailPagoChapita({ obtenerColorEstado, pagosChapitas, typeTheme, isCargandoPagos, formatearMoneda, formatearFecha, onEstadoActualizado }){
    
    // Estados para el modal de confirmación
    const [mostrarModal, setMostrarModal] = useState(false);
    const [datosConfirmacion, setDatosConfirmacion] = useState(null);
    
    // Estados para el modal de imagen
    const [mostrarModalImagen, setMostrarModalImagen] = useState(false);
    const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
    
    // Función para manejar el cambio de estado
    const manejarCambioEstado = async (chapitaId, nuevoEstado) => {
        try {
            await actualizarEstadoChapita(chapitaId, nuevoEstado);
            
            // Notificar al componente padre para refrescar los datos
            if (onEstadoActualizado) {
                onEstadoActualizado();
            }
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            alert('Error al actualizar el estado de la chapita');
        }
    };

    // Función para mostrar el modal de confirmación
    const mostrarConfirmacion = (chapitaId, estadoActual, nuevoEstado, mascotaNombre) => {
        const mensajes = {
            'fabricacion': {
                titulo: '🔨 Confirmar Fabricación',
                mensaje: `¿Estás seguro de que deseas iniciar la fabricación de la chapita para ${mascotaNombre}?`,
                detalles: 'La chapita pasará al estado de fabricación y comenzará el proceso de producción.',
                textoConfirmar: 'Iniciar Fabricación'
            },
            'en viaje': {
                titulo: '🚚 Confirmar Envío',
                mensaje: `¿Estás seguro de que deseas marcar la chapita de ${mascotaNombre} como enviada?`,
                detalles: 'La chapita será marcada como en tránsito hacia su destino.',
                textoConfirmar: 'Marcar como Enviada'
            },
            'entregado': {
                titulo: '✅ Confirmar Entrega',
                mensaje: `¿Estás seguro de que deseas marcar la chapita de ${mascotaNombre} como entregada?`,
                detalles: 'La chapita será marcada como entregada al cliente. Este es el estado final.',
                textoConfirmar: 'Marcar como Entregada'
            }
        };

        setDatosConfirmacion({
            chapitaId,
            estadoActual,
            nuevoEstado,
            mascotaNombre,
            ...mensajes[nuevoEstado]
        });
        setMostrarModal(true);
    };

    // Función para confirmar el cambio de estado
    const confirmarCambioEstado = async () => {
        if (datosConfirmacion) {
            await manejarCambioEstado(datosConfirmacion.chapitaId, datosConfirmacion.nuevoEstado);
            setMostrarModal(false);
            setDatosConfirmacion(null);
        }
    };

    // Función para cerrar el modal
    const cerrarModal = () => {
        setMostrarModal(false);
        setDatosConfirmacion(null);
    };

    // Función para mostrar la imagen en grande
    const mostrarImagenGrande = (pago) => {
        setImagenSeleccionada({
            url: pago.fotoMascota,
            nombreMascota: pago.mascotaNombre || 'Mascota',
            idChapita: pago.id || 'N/A',
            mascotaId: pago.mascotaId || ''
        });
        setMostrarModalImagen(true);
    };

    // Función para cerrar el modal de imagen
    const cerrarModalImagen = () => {
        setMostrarModalImagen(false);
        setImagenSeleccionada(null);
    };

    // Función para abrir la imagen en nueva pestaña para descarga
    const abrirImagenParaDescarga = () => {
        if (!imagenSeleccionada?.url) return;
        
        // Abrir la imagen en una nueva pestaña
        const nuevaVentana = window.open(imagenSeleccionada.url, '_blank');
        
        if (nuevaVentana) {
            // Mostrar mensaje de ayuda
        } else {
            alert('No se pudo abrir la imagen. Verifica que tu navegador permita ventanas emergentes.');
        }
    };

    // Función para obtener el siguiente estado posible
    const obtenerSiguienteEstado = (estadoActual) => {
        const estados = ['pendiente', 'fabricacion', 'en viaje', 'entregado'];
        const indiceActual = estados.indexOf(estadoActual);
        return indiceActual < estados.length - 1 ? estados[indiceActual + 1] : null;
    };

    // Función para obtener el color del botón según el estado
    const obtenerColorBoton = (estado) => {
        switch (estado) {
            case 'fabricacion': return 'bg-blue-500 hover:bg-blue-600 text-white';
            case 'en viaje': return 'bg-orange-500 hover:bg-orange-600 text-white';
            case 'entregado': return 'bg-green-500 hover:bg-green-600 text-white';
            default: return 'bg-gray-500 hover:bg-gray-600 text-white';
        }
    };
    
    return(
      <>
      <div className={`rounded-xl p-6 ${
        typeTheme === 'light' ? 'bg-gray-50' : 'bg-gray-700'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-semibold ${
            typeTheme === 'light' ? 'text-gray-900' : 'text-white'
          }`}>
            🏷️ Chapitas de Identificación
          </h3>
          <span className={`text-sm px-3 py-1 rounded-full ${
            typeTheme === 'light' ? 'bg-orange-100 text-orange-800' : 'bg-orange-900 text-orange-200'
          }`}>
            {pagosChapitas.length} pagos
          </span>
        </div>

        {isCargandoPagos ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <p className={`mt-2 text-sm ${
              typeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Cargando chapitas...
            </p>
          </div>
        ) : pagosChapitas.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🏷️</span>
            </div>
            <p className={`text-sm ${
              typeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              No hay pagos de chapitas registrados
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {pagosChapitas.map((pago, index) => (
              <div key={pago.id || index} className={`rounded-lg p-4 border ${
                typeTheme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-600 border-gray-500'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className={`font-semibold ${
                      typeTheme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>
                      Chapita Personalizada
                    </h4>
                    <p className={`text-sm ${
                      typeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      Para: {pago.mascotaNombre || 'Mascota'}
                    </p>
                    <p className={`text-xs ${
                      typeTheme === 'light' ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      ID: {pago.id || 'N/A'}
                    </p>
                    
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${obtenerColorEstado(pago.estado)}`}>
                    {pago.estado || 'pendiente'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className={`font-medium ${
                      typeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      Monto:
                    </label>
                    <p className={`font-bold ${
                      typeTheme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>
                      {formatearMoneda(pago.monto || 7000)}
                    </p>
                  </div>
                  <div className="relative">
                    <label className={`font-medium ${
                      typeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      Método:
                    </label>
                    <p className={`${
                      typeTheme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>
                      {pago.metodoPago || 'transferencia'}
                    </p>
                    {/* Círculo con imagen de la mascota */}
                    <div 
                      className="absolute -top-2 -right-2 w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200"
                      onClick={() => pago.fotoMascota && mostrarImagenGrande(pago)}
                      title="Haz clic para ver la imagen en grande"
                    >
                      {pago.fotoMascota ? (
                        <img 
                          src={pago.fotoMascota} 
                          alt={`Foto de ${pago.mascotaNombre || 'mascota'}`}
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center text-white text-2xl ${
                        !pago.fotoMascota ? 'flex' : 'hidden'
                      }`}>
                        🐕
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className={`font-medium ${
                      typeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      Fecha:
                    </label>
                    <p className={`${
                      typeTheme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>
                      {formatearFecha(pago.fechaPago)}
                    </p>
                  </div>
                  <div>
                    <label className={`font-medium ${
                      typeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      Usuario:
                    </label>
                    <p className={`${
                      typeTheme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>
                      {pago.usuarioNombre || 'N/A'}
                    </p>
                  </div>
                </div>

                {pago.metodoPago === 'transferencia' && (
                  <div className={`mt-3 p-3 rounded ${
                    typeTheme === 'light' ? 'bg-gray-100' : 'bg-gray-600'
                  }`}>
                    <p className={`text-xs font-medium ${
                      typeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      Datos de Transferencia:
                    </p>
                    <p className={`text-xs ${
                      typeTheme === 'light' ? 'text-gray-800' : 'text-gray-200'
                    }`}>
                      CBU: {pago.cbuDestino || 'N/A'} | Alias: {pago.aliasDestino || 'N/A'}
                    </p>
                  </div>
                )}

                {/* Botones de cambio de estado */}
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-500">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${
                      typeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      Cambiar estado:
                    </span>
                    <div className="flex space-x-2">
                      {obtenerSiguienteEstado(pago.estado) && (
                        <button
                          onClick={() => mostrarConfirmacion(pago.id, pago.estado, obtenerSiguienteEstado(pago.estado), pago.mascotaNombre)}
                          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${obtenerColorBoton(obtenerSiguienteEstado(pago.estado))}`}
                        >
                          {obtenerSiguienteEstado(pago.estado) === 'fabricacion' && '🔨 En Fabricación'}
                          {obtenerSiguienteEstado(pago.estado) === 'en viaje' && '🚚 En Viaje'}
                          {obtenerSiguienteEstado(pago.estado) === 'entregado' && '✅ Entregado'}
                        </button>
                      )}
                      {pago.estado === 'entregado' && (
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          typeTheme === 'light' ? 'bg-green-100 text-green-800' : 'bg-green-900 text-green-200'
                        }`}>
                          ✅ Proceso Completado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmación */}
      {mostrarModal && datosConfirmacion && (
        <ModalAlert
          typeAlert="confirmacion"
          mensaje={{
            ...datosConfirmacion,
            onConfirmar: confirmarCambioEstado
          }}
          onCerrar={cerrarModal}
        />
      )}

      {/* Modal de imagen ampliada */}
      {mostrarModalImagen && imagenSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className={`relative max-w-4xl max-h-[90vh] w-full mx-4 rounded-lg overflow-hidden ${
            typeTheme === 'light' ? 'bg-white' : 'bg-gray-800'
          }`}>
            {/* Header del modal */}
            <div className={`flex items-center justify-between p-4 border-b ${
              typeTheme === 'light' ? 'border-gray-200' : 'border-gray-600'
            }`}>
              <div>
                <h3 className={`text-lg font-semibold ${
                  typeTheme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  🐕 {imagenSeleccionada.nombreMascota}
                </h3>
                <p className={`text-sm ${
                  typeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  ID Chapita: {imagenSeleccionada.idChapita}
                </p>

                <p className={`text-sm ${
                  typeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                 Perfil de {imagenSeleccionada.nombreMascota}: {<a href={`https://huellitas-seguras.online/pet/${imagenSeleccionada.mascotaId || 'N/A' }`} target="_blank" rel="noopener noreferrer">Perfil Publico</a>} 
                </p>

              </div>
              <button
                onClick={cerrarModalImagen}
                className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  typeTheme === 'light' ? 'text-gray-500' : 'text-gray-400'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Imagen y QR */}
            <div className="p-4 flex flex-row space-x-4">
              {/* Imagen de la mascota */}
              <div className="flex items-center justify-center mb-6">
                <img
                  src={imagenSeleccionada.url}
                  alt={`Foto de ${imagenSeleccionada.nombreMascota}`}
                  className="max-w-full max-h-[50vh] object-contain rounded-lg shadow-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden flex-col items-center justify-center text-center p-8">
                  <div className="text-6xl mb-4">🐕</div>
                  <p className={`text-lg ${
                    typeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    Error al cargar la imagen
                  </p>
                </div>
              </div>

              {/* Sección del QR */}
              <div className={`border-t pt-6 ${
                typeTheme === 'light' ? 'border-gray-200' : 'border-gray-600'
              }`}>
                <div className="text-center">
                  <h4 className={`text-lg font-semibold mb-4 ${
                    typeTheme === 'light' ? 'text-gray-900' : 'text-white'
                  }`}>
                    📱 Código QR del Perfil
                  </h4>
                  
                  <div className="flex flex-col items-center space-y-4">
                    {/* QR Code */}
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                      <img
                        src={mostrarPreviewQR(imagenSeleccionada.nombreMascota, imagenSeleccionada.mascotaId).url}
                        alt={`QR de ${imagenSeleccionada.nombreMascota}`}
                        className="w-48 h-48 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="hidden flex-col items-center justify-center text-center p-4">
                        <div className="text-4xl mb-2">📱</div>
                        <p className="text-sm text-gray-600">Error al cargar QR</p>
                      </div>
                    </div>

                    {/* Botón de descarga */}
                    <button
                      onClick={() => descargarQRCode(imagenSeleccionada.nombreMascota, imagenSeleccionada.mascotaId)}
                      className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center space-x-2 shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Descargar QR</span>
                    </button>

                    {/* Información adicional */}
                    <p className={`text-xs ${
                      typeTheme === 'light' ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      Escanea este QR para acceder al perfil público de {imagenSeleccionada.nombreMascota}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer con botones */}
            <div className={`flex items-center justify-between p-4 border-t ${
              typeTheme === 'light' ? 'border-gray-200' : 'border-gray-600'
            }`}>
              <p className={`text-sm ${
                typeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Haz clic en "Abrir Imagen" para ver la imagen en una nueva pestaña y poder descargarla
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={cerrarModalImagen}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    typeTheme === 'light' 
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                      : 'bg-gray-600 text-white hover:bg-gray-500'
                  }`}
                >
                  Cerrar
                </button>
                <button
                  onClick={abrirImagenParaDescarga}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>Abrir Imagen</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </>
    )
}