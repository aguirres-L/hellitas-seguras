import React, { useState, useEffect } from 'react';
import { 
  obtenerDetalleOng, 
  guardarDetalleOng, 
  subirLogoOng,
  eliminarArchivo 
} from '../../../data/firebase/firebase';
import { useTheme } from '../../../contexts/ThemeContext';

/**
 * Componente para gestionar la información de la ONG
 * Este componente permite al admin editar toda la información de su organización
 */
export default function InformationOfOng() {
  const { typeTheme } = useTheme();
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    nombreOng: '',
    detalleOng: '',
    estimativoRescates: '',
    estimativoAdopciones: '',
    instagram: '',
    facebook: '',
    whatsapp: ''
  });

  // Estados de UI
  const [logoUrl, setLogoUrl] = useState('');
  const [logoArchivo, setLogoArchivo] = useState(null);
  const [previewLogo, setPreviewLogo] = useState(null);
  const [isCargando, setIsCargando] = useState(false);
  const [isGuardando, setIsGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [mensajeError, setMensajeError] = useState('');

  // Cargar datos existentes al montar el componente
  useEffect(() => {
    cargarDatosOng();
  }, []);

  const cargarDatosOng = async () => {
    setIsCargando(true);
    setMensajeError('');
    
    try {
      const datos = await obtenerDetalleOng();
      
      if (datos) {
        setFormData({
          nombreOng: datos.nombreOng || '',
          detalleOng: datos.detalleOng || '',
          estimativoRescates: datos.estimativoRescates || '',
          estimativoAdopciones: datos.estimativoAdopciones || '',
          instagram: datos.instagram || '',
          facebook: datos.facebook || '',
          whatsapp: datos.whatsapp || ''
        });
        
        if (datos.logoUrl) {
          setLogoUrl(datos.logoUrl);
          setPreviewLogo(datos.logoUrl);
        }
      }
    } catch (error) {
      console.error('Error al cargar datos de ONG:', error);
      setMensajeError('Error al cargar la información. Inténtalo de nuevo.');
    } finally {
      setIsCargando(false);
    }
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const manejarSeleccionLogo = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      // Validar tipo de archivo
      if (!archivo.type.startsWith('image/')) {
        setMensajeError('Por favor selecciona un archivo de imagen válido');
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (archivo.size > 5 * 1024 * 1024) {
        setMensajeError('La imagen es demasiado grande. Máximo 5MB');
        return;
      }

      setLogoArchivo(archivo);
      setMensajeError('');
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewLogo(reader.result);
      };
      reader.readAsDataURL(archivo);
    }
  };

  const manejarEnviar = async (e) => {
    e.preventDefault();
    setIsGuardando(true);
    setMensajeExito('');
    setMensajeError('');

    try {
      // Validaciones básicas
      if (!formData.nombreOng.trim()) {
        throw new Error('El nombre de la ONG es requerido');
      }

      // Subir logo si hay un archivo nuevo
      let logoUrlFinal = logoUrl;
      if (logoArchivo) {
        try {
          // Si hay un logo anterior, eliminarlo primero
          if (logoUrl && logoUrl.startsWith('https://firebasestorage.googleapis.com')) {
            try {
              await eliminarArchivo(logoUrl);
            } catch (error) {
              console.warn('No se pudo eliminar el logo anterior:', error);
              // Continuar aunque falle la eliminación
            }
          }

          logoUrlFinal = await subirLogoOng(logoArchivo);
          setLogoUrl(logoUrlFinal);
        } catch (error) {
          console.error('Error al subir logo:', error);
          throw new Error('Error al subir el logo. Inténtalo de nuevo.');
        }
      }

      // Preparar datos para guardar
      const datosOng = {
        nombreOng: formData.nombreOng.trim(),
        detalleOng: formData.detalleOng.trim() || null,
        estimativoRescates: formData.estimativoRescates ? parseInt(formData.estimativoRescates) : null,
        estimativoAdopciones: formData.estimativoAdopciones ? parseInt(formData.estimativoAdopciones) : null,
        instagram: formData.instagram.trim() || null,
        facebook: formData.facebook.trim() || null,
        whatsapp: formData.whatsapp.trim() || null,
        logoUrl: logoUrlFinal || null
      };

      // Guardar en Firestore
      await guardarDetalleOng(datosOng);

      // Limpiar archivo temporal
      setLogoArchivo(null);
      
      setMensajeExito('Información de la ONG guardada exitosamente');
      
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => {
        setMensajeExito('');
      }, 5000);

    } catch (error) {
      console.error('Error al guardar información:', error);
      setMensajeError(error.message || 'Error al guardar la información. Inténtalo de nuevo.');
    } finally {
      setIsGuardando(false);
    }
  };

  // Función para limpiar el logo
  const manejarEliminarLogo = () => {
    setLogoArchivo(null);
    setPreviewLogo(logoUrl || null);
  };

  if (isCargando) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          <p className={`mt-4 ${typeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
            Cargando información...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={manejarEnviar} className={`${typeTheme === 'light' ? 'bg-white' : 'bg-gray-800'} rounded-xl shadow-lg p-6`}>
        {/* Mensajes de éxito y error */}
        {mensajeExito && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{mensajeExito}</p>
          </div>
        )}

        {mensajeError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{mensajeError}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Columna izquierda */}
          <div className="space-y-6">
            {/* Logo de la ONG */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${typeTheme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                Logo de la ONG
              </label>
              <div className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={manejarSeleccionLogo}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    typeTheme === 'light'
                      ? 'border-gray-300 bg-white text-gray-900'
                      : 'border-gray-600 bg-gray-700 text-white'
                  }`}
                />
                
                {previewLogo && (
                  <div className="relative">
                    <img
                      src={previewLogo}
                      alt="Preview del logo"
                      className="w-full max-w-xs h-48 object-contain rounded-lg border-2 border-gray-300"
                    />
                    {logoArchivo && (
                      <button
                        type="button"
                        onClick={manejarEliminarLogo}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                        title="Eliminar logo seleccionado"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Nombre de la ONG */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${typeTheme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                Nombre de la ONG <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombreOng"
                value={formData.nombreOng}
                onChange={manejarCambio}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  typeTheme === 'light'
                    ? 'border-gray-300 bg-white text-gray-900'
                    : 'border-gray-600 bg-gray-700 text-white'
                }`}
                placeholder="Ej: Patitas que Ayudan"
              />
            </div>

            {/* Detalle/Descripción de la ONG */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${typeTheme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                Detalle/Descripción de la ONG
              </label>
              <textarea
                name="detalleOng"
                value={formData.detalleOng}
                onChange={manejarCambio}
                rows="6"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  typeTheme === 'light'
                    ? 'border-gray-300 bg-white text-gray-900'
                    : 'border-gray-600 bg-gray-700 text-white'
                }`}
                placeholder="Describe la misión, visión y trabajo de tu organización..."
              />
            </div>

            {/* Estimativos */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${typeTheme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                  Rescates Estimados
                </label>
                <input
                  type="number"
                  name="estimativoRescates"
                  value={formData.estimativoRescates}
                  onChange={manejarCambio}
                  min="0"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    typeTheme === 'light'
                      ? 'border-gray-300 bg-white text-gray-900'
                      : 'border-gray-600 bg-gray-700 text-white'
                  }`}
                  placeholder="Ej: 500"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${typeTheme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                  Adopciones Estimadas
                </label>
                <input
                  type="number"
                  name="estimativoAdopciones"
                  value={formData.estimativoAdopciones}
                  onChange={manejarCambio}
                  min="0"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    typeTheme === 'light'
                      ? 'border-gray-300 bg-white text-gray-900'
                      : 'border-gray-600 bg-gray-700 text-white'
                  }`}
                  placeholder="Ej: 300"
                />
              </div>
            </div>
          </div>

          {/* Columna derecha - Redes Sociales */}
          <div className="space-y-6">
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${typeTheme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                Redes Sociales y Contacto
              </h3>
            </div>

            {/* Instagram */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${typeTheme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                Instagram
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={manejarCambio}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    typeTheme === 'light'
                      ? 'border-gray-300 bg-white text-gray-900'
                      : 'border-gray-600 bg-gray-700 text-white'
                  }`}
                  placeholder="@usuario_instagram o URL completa"
                />
              </div>
            </div>

            {/* Facebook */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${typeTheme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                Facebook
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <input
                  type="text"
                  name="facebook"
                  value={formData.facebook}
                  onChange={manejarCambio}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    typeTheme === 'light'
                      ? 'border-gray-300 bg-white text-gray-900'
                      : 'border-gray-600 bg-gray-700 text-white'
                  }`}
                  placeholder="URL de Facebook o nombre de página"
                />
              </div>
            </div>

            {/* WhatsApp */}
        <div>
              <label className={`block text-sm font-medium mb-2 ${typeTheme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                WhatsApp
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
                <input
                  type="text"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={manejarCambio}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    typeTheme === 'light'
                      ? 'border-gray-300 bg-white text-gray-900'
                      : 'border-gray-600 bg-gray-700 text-white'
                  }`}
                  placeholder="+56912345678 o número sin +"
                />
              </div>
              <p className={`mt-1 text-xs ${typeTheme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                Incluye código de país (ej: +569 para Chile)
              </p>
            </div>

            {/* Información adicional */}
            <div className={`p-4 rounded-lg ${typeTheme === 'light' ? 'bg-blue-50 border border-blue-200' : 'bg-blue-900/20 border border-blue-800'}`}>
              <p className={`text-sm ${typeTheme === 'light' ? 'text-blue-800' : 'text-blue-200'}`}>
                <strong>💡 Tip:</strong> Puedes dejar los campos de redes sociales vacíos si no los utilizas. 
                Solo el nombre de la ONG es obligatorio.
              </p>
            </div>
          </div>
        </div>

        {/* Botón de guardar */}
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={isGuardando}
            className={`px-6 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isGuardando ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isGuardando ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </span>
            ) : (
              'Guardar Información'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
