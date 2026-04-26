import React, { useState } from 'react';
import { addDataCollection } from '../data/firebase/firebase';
import { subirImagenImgbb } from '../data/imgbb/imgbb-upload';
import { ImageUploader } from './ImageUploader';

export default function FormularioReporteMascota({ usuario, onPublicacionCreada, onCerrar }) {
  const [isPublicando, setIsPublicando] = useState(false);
  const [error, setError] = useState('');
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [formulario, setFormulario] = useState({
    tipoPublicacion: 'avistamiento',
    nombreMascota: '',
    descripcion: '',
    ubicacion: '',
    contacto: '',
    imagenUrl: ''
  });

  const onCambio = (e) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
  };

  const onEnviar = async (e) => {
    e.preventDefault();
    if (!formulario.descripcion.trim() || !formulario.ubicacion.trim() || !formulario.contacto.trim()) {
      setError('Completá descripción, ubicación y contacto para publicar.');
      return;
    }

    setError('');
    setIsPublicando(true);
    try {
      let urlFinal = formulario.imagenUrl.trim();
      if (archivoImagen) {
        urlFinal = await subirImagenImgbb(archivoImagen, {
          nombre: `reporte_${Date.now()}_${formulario.tipoPublicacion}`
        });
      }

      const datos = {
        tipoPublicacion: formulario.tipoPublicacion,
        nombreMascota: formulario.nombreMascota.trim() || 'Sin nombre',
        titulo: formulario.tipoPublicacion === 'perdida' ? 'Mascota perdida' : 'Avistamiento de mascota',
        descripcion: formulario.descripcion.trim(),
        ubicacion: formulario.ubicacion.trim(),
        contacto: formulario.contacto.trim(),
        imagen: urlFinal || null,
        publicadoPorUid: usuario?.uid || null,
        publicadoPorEmail: usuario?.email || null
      };

      await addDataCollection('reportes-mascotas', datos);

      setFormulario({
        tipoPublicacion: 'avistamiento',
        nombreMascota: '',
        descripcion: '',
        ubicacion: '',
        contacto: '',
        imagenUrl: ''
      });
      setArchivoImagen(null);

      if (onPublicacionCreada) onPublicacionCreada();
      if (onCerrar) onCerrar();
    } catch (err) {
      console.error('Error al publicar reporte:', err);
      setError(err?.message || 'No se pudo publicar el reporte.');
    } finally {
      setIsPublicando(false);
    }
  };

  return (
    <form onSubmit={onEnviar} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de publicación *</label>
        <select
          name="tipoPublicacion"
          value={formulario.tipoPublicacion}
          onChange={onCambio}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value="avistamiento">Avistamiento</option>
          <option value="perdida">Mascota perdida</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Foto (opcional)</label>
        <ImageUploader
          onImageSelect={setArchivoImagen}
          isCargando={isPublicando}
          usarModalOrigenFoto
        />
      </div>

      

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la mascota (opcional)</label>
        <input
          type="text"
          name="nombreMascota"
          value={formulario.nombreMascota}
          onChange={onCambio}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="Ej: Luna"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
        <textarea
          name="descripcion"
          value={formulario.descripcion}
          onChange={onCambio}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[110px] resize-y focus:outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="Contá qué pasó y detalles visibles."
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación *</label>
          <input
            type="text"
            name="ubicacion"
            value={formulario.ubicacion}
            onChange={onCambio}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Ej: Plaza principal"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contacto *</label>
          <input
            type="text"
            name="contacto"
            value={formulario.contacto}
            onChange={onCambio}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Ej: +54 9 11 1234 5678"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{error}</div>
      )}

      <div className="pt-2 border-t border-gray-200 flex flex-col sm:flex-row gap-3 sm:justify-end">
        {onCerrar && (
          <button
            type="button"
            onClick={onCerrar}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isPublicando}
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="px-5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors disabled:opacity-60"
          disabled={isPublicando}
        >
          {isPublicando ? 'Publicando...' : 'Publicar reporte'}
        </button>
      </div>
    </form>
  );
}
