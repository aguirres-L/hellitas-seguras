import React, { useState } from 'react';
import { addDataCollection, subirArchivo } from '../../../data/firebase/firebase';
import { useTheme } from '../../../contexts/ThemeContext';

/**
 * Componente para crear nuevas historias de rescates
 * @param {Object} props - Props del componente
 * @param {Function} props.onHistoriaCreada - Callback opcional que se ejecuta después de crear exitosamente una historia
 */
export default function NewHistoria({ onHistoriaCreada }) {
  const { typeTheme } = useTheme();
  const [isEnviando, setIsEnviando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    nombreMascota: '',
    especie: '',
    raza: '',
    edad: '',
    sexo: '',
    tamaño: '',
    descripcion: '',
    historiaRescate: '',
    fechaRescate: '',
    estado: 'en_adopcion',
    imagenUrl: '',
    contacto: '',
    ubicacion: ''
  });

  const [imagenArchivo, setImagenArchivo] = useState(null);
  const [previewImagen, setPreviewImagen] = useState(null);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const manejarSeleccionImagen = (e) => {
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

      setImagenArchivo(archivo);
      setMensajeError('');
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImagen(reader.result);
      };
      reader.readAsDataURL(archivo);
    }
  };

  const manejarEnviar = async (e) => {
    e.preventDefault();
    setIsEnviando(true);
    setMensajeExito('');
    setMensajeError('');

    try {
      // Validaciones básicas
      if (!formData.nombreMascota.trim()) {
        throw new Error('El nombre de la mascota es requerido');
      }

      if (!formData.especie.trim()) {
        throw new Error('La especie es requerida');
      }

      // Subir imagen si existe
      let imagenUrlFinal = formData.imagenUrl;
      if (imagenArchivo) {
        try {
          const nombreArchivo = `rescate_${Date.now()}_${formData.nombreMascota.replace(/\s+/g, '_')}`;
          imagenUrlFinal = await subirArchivo(
            imagenArchivo,
            'historias-rescates',
            nombreArchivo
          );
        } catch (error) {
          console.error('Error al subir imagen:', error);
          throw new Error('Error al subir la imagen. Inténtalo de nuevo.');
        }
      }

      // Preparar datos para enviar
      const datosHistoria = {
        nombreMascota: formData.nombreMascota.trim(),
        especie: formData.especie.trim(),
        raza: formData.raza.trim() || null,
        edad: formData.edad.trim() || null,
        sexo: formData.sexo.trim() || null,
        tamaño: formData.tamaño.trim() || null,
        descripcion: formData.descripcion.trim() || null,
        historiaRescate: formData.historiaRescate.trim() || null,
        fechaRescate: formData.fechaRescate ? new Date(formData.fechaRescate) : new Date(),
        estado: formData.estado || 'en_adopcion',
        imagenUrl: imagenUrlFinal || null,
        contacto: formData.contacto.trim() || null,
        ubicacion: formData.ubicacion.trim() || null
      };

      // Crear la historia en Firestore
      await addDataCollection('historias-de-rescates', datosHistoria);

      // Limpiar formulario
      setFormData({
        nombreMascota: '',
        especie: '',
        raza: '',
        edad: '',
        sexo: '',
        tamaño: '',
        descripcion: '',
        historiaRescate: '',
        fechaRescate: '',
        estado: 'en_adopcion',
        imagenUrl: '',
        contacto: '',
        ubicacion: ''
      });
      setImagenArchivo(null);
      setPreviewImagen(null);
      
      setMensajeExito('Historia de rescate creada exitosamente');
      
      // Ejecutar callback si existe (para cambiar a la vista de todas las historias)
      if (onHistoriaCreada) {
        // Esperar un momento para que el usuario vea el mensaje de éxito
        setTimeout(() => {
          onHistoriaCreada();
        }, 1500);
      } else {
        // Limpiar mensaje de éxito después de 5 segundos si no hay callback
        setTimeout(() => {
          setMensajeExito('');
        }, 5000);
      }

    } catch (error) {
      console.error('Error al crear historia:', error);
      setMensajeError(error.message || 'Error al crear la historia. Inténtalo de nuevo.');
    } finally {
      setIsEnviando(false);
    }
  };

    return (
        <div>
      <h3 className={`text-xl font-bold mb-6 ${typeTheme === 'light' ? 'text-gray-900' : 'text-white'}`}>
        Nueva Historia de Rescate
      </h3>

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
          <div className="space-y-4">
            {/* Nombre de la mascota */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${typeTheme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                Nombre de la Mascota <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombreMascota"
                value={formData.nombreMascota}
                onChange={manejarCambio}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  typeTheme === 'light'
                    ? 'border-gray-300 bg-white text-gray-900'
                    : 'border-gray-600 bg-gray-700 text-white'
                }`}
                placeholder="Ej: Max, Luna, etc."
              />
            </div>

            {/* Especie */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${typeTheme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                Especie <span className="text-red-500">*</span>
              </label>
              <select
                name="especie"
                value={formData.especie}
                onChange={manejarCambio}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  typeTheme === 'light'
                    ? 'border-gray-300 bg-white text-gray-900'
                    : 'border-gray-600 bg-gray-700 text-white'
                }`}
              >
                <option value="">Selecciona una especie</option>
                <option value="perro">Perro</option>
                <option value="gato">Gato</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            {/* Raza */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${typeTheme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                Raza
              </label>
              <input
                type="text"
                name="raza"
                value={formData.raza}
                onChange={manejarCambio}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  typeTheme === 'light'
                    ? 'border-gray-300 bg-white text-gray-900'
                    : 'border-gray-600 bg-gray-700 text-white'
                }`}
                placeholder="Ej: Labrador, Persa, Mestizo, etc."
              />
            </div>

            {/* Edad */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${typeTheme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                Edad
              </label>
              <input
                type="text"
                name="edad"
                value={formData.edad}
                onChange={manejarCambio}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  typeTheme === 'light'
                    ? 'border-gray-300 bg-white text-gray-900'
                    : 'border-gray-600 bg-gray-700 text-white'
                }`}
                placeholder="Ej: 2 años, 6 meses, etc."
              />
            </div>

            {/* Sexo */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${typeTheme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                Sexo
              </label>
              <select
                name="sexo"
                value={formData.sexo}
                onChange={manejarCambio}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  typeTheme === 'light'
                    ? 'border-gray-300 bg-white text-gray-900'
                    : 'border-gray-600 bg-gray-700 text-white'
                }`}
              >
                <option value="">Selecciona</option>
                <option value="macho">Macho</option>
                <option value="hembra">Hembra</option>
              </select>
            </div>

            {/* Tamaño */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${typeTheme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                Tamaño
              </label>
              <select
                name="tamaño"
                value={formData.tamaño}
                onChange={manejarCambio}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  typeTheme === 'light'
                    ? 'border-gray-300 bg-white text-gray-900'
                    : 'border-gray-600 bg-gray-700 text-white'
                }`}
              >
                <option value="">Selecciona</option>
                <option value="pequeño">Pequeño</option>
                <option value="mediano">Mediano</option>
                <option value="grande">Grande</option>
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${typeTheme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                Estado
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={manejarCambio}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  typeTheme === 'light'
                    ? 'border-gray-300 bg-white text-gray-900'
                    : 'border-gray-600 bg-gray-700 text-white'
                }`}
              >
                <option value="en_adopcion">En Adopción</option>
                <option value="rescatado">Rescatado</option>
                <option value="adoptado">Adoptado</option>
              </select>
            </div>

            {/* Fecha de rescate */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${typeTheme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                Fecha de Rescate
              </label>
              <input
                type="date"
                name="fechaRescate"
                value={formData.fechaRescate}
                onChange={manejarCambio}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  typeTheme === 'light'
                    ? 'border-gray-300 bg-white text-gray-900'
                    : 'border-gray-600 bg-gray-700 text-white'
                }`}
              />
            </div>
          </div>

          {/* Columna derecha */}
          <div className="space-y-4">
            {/* Imagen */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${typeTheme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                Imagen de la Mascota
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={manejarSeleccionImagen}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  typeTheme === 'light'
                    ? 'border-gray-300 bg-white text-gray-900'
                    : 'border-gray-600 bg-gray-700 text-white'
                }`}
              />
              {previewImagen && (
                <div className="mt-4">
                  <img
                    src={previewImagen}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* URL de imagen alternativa */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${typeTheme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                O URL de Imagen (alternativa)
              </label>
              <input
                type="url"
                name="imagenUrl"
                value={formData.imagenUrl}
                onChange={manejarCambio}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  typeTheme === 'light'
                    ? 'border-gray-300 bg-white text-gray-900'
                    : 'border-gray-600 bg-gray-700 text-white'
                }`}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${typeTheme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={manejarCambio}
                rows="4"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  typeTheme === 'light'
                    ? 'border-gray-300 bg-white text-gray-900'
                    : 'border-gray-600 bg-gray-700 text-white'
                }`}
                placeholder="Describe las características físicas y personalidad de la mascota..."
              />
            </div>

            {/* Historia del rescate */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${typeTheme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                Historia del Rescate
              </label>
              <textarea
                name="historiaRescate"
                value={formData.historiaRescate}
                onChange={manejarCambio}
                rows="4"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  typeTheme === 'light'
                    ? 'border-gray-300 bg-white text-gray-900'
                    : 'border-gray-600 bg-gray-700 text-white'
                }`}
                placeholder="Cuenta cómo fue rescatada la mascota..."
              />
            </div>

            {/* Contacto */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${typeTheme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                Contacto
              </label>
              <input
                type="text"
                name="contacto"
                value={formData.contacto}
                onChange={manejarCambio}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  typeTheme === 'light'
                    ? 'border-gray-300 bg-white text-gray-900'
                    : 'border-gray-600 bg-gray-700 text-white'
                }`}
                placeholder="Teléfono o email de contacto"
              />
            </div>

            {/* Ubicación */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${typeTheme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                Ubicación
              </label>
              <input
                type="text"
                name="ubicacion"
                value={formData.ubicacion}
                onChange={manejarCambio}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  typeTheme === 'light'
                    ? 'border-gray-300 bg-white text-gray-900'
                    : 'border-gray-600 bg-gray-700 text-white'
                }`}
                placeholder="Ciudad, región, etc."
              />
            </div>
          </div>
        </div>

        {/* Botón de enviar */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isEnviando}
            className={`px-6 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isEnviando ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isEnviando ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creando...
              </span>
            ) : (
              'Crear Historia de Rescate'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
