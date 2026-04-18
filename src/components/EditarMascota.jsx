import React, { useState } from 'react';
import { actualizarMascota, eliminarMascota } from '../data/firebase/firebase';
import { subirImagenImgbb } from '../data/imgbb/imgbb-upload';
import { useNotificacionApp } from '../contexts/NotificacionAppContext';

const inputClass =
  'w-full px-4 py-2.5 text-base border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/80 focus:border-orange-400 transition-shadow';

const labelClass = 'block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5';

function SeccionFormulario({ titulo, descripcion, children }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm">
      <header className="mb-4 pb-3 border-b border-gray-100">
        <h4 className="text-sm font-semibold text-gray-900">{titulo}</h4>
        {descripcion ? <p className="text-xs text-gray-500 mt-1 leading-relaxed">{descripcion}</p> : null}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export const EditarMascota = ({
  mascota,
  tipoProfesional,
  onGuardar,
  onCancelar,
  onEliminar,
  isCargando,
}) => {
  const { mostrarError, mostrarExito } = useNotificacionApp();
  const [formData, setFormData] = useState({
    nombre: mascota.nombre || '',
    fotoUrl: mascota.fotoUrl || '',
    raza: mascota.raza || '',
    edad: mascota.edad || 0,
    color: mascota.color || '',
    numeroChip: mascota.numeroChip || '',
    peso: mascota.peso || 0,
    altura: mascota.altura || 0,
    alergias: mascota.alergias || '',
    enfermedades: mascota.enfermedades || '',
    comportamiento: mascota.comportamiento || '',
    preferenciasGrooming: mascota.preferenciasGrooming || '',
    notas: mascota.notas || '',
    contacto: mascota.contacto || '',
    isPerdida: mascota.isPerdida || false,
  });

  const [nuevaVacuna, setNuevaVacuna] = useState({ nombre: '', fecha: '' });
  const [vacunas, setVacunas] = useState(mascota.vacunas || []);
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false);
  const [isGuardandoEstado, setIsGuardandoEstado] = useState(false);
  const [isSubiendoFoto, setIsSubiendoFoto] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleCheckboxChange = async (e) => {
    const { name, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));

    setIsGuardandoEstado(true);
    try {
      await actualizarMascota(mascota.id, {
        [name]: checked,
      });
      onGuardar();
    } catch (error) {
      console.error('Error al actualizar estado de mascota perdida:', error);
      setFormData((prev) => ({
        ...prev,
        [name]: !checked,
      }));
      mostrarError(
        `Error al ${checked ? 'marcar' : 'desmarcar'} la mascota como perdida. Inténtalo de nuevo.`
      );
    } finally {
      setIsGuardandoEstado(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const datosActualizados = {
        ...formData,
        vacunas: vacunas,
      };

      await actualizarMascota(mascota.id, datosActualizados);
      onGuardar();
    } catch (error) {
      console.error('Error al actualizar mascota:', error);
      mostrarError('Error al actualizar la mascota. Inténtalo de nuevo.');
    }
  };

  const agregarVacuna = () => {
    if (nuevaVacuna.nombre && nuevaVacuna.fecha) {
      setVacunas((prev) => [...prev, { ...nuevaVacuna }]);
      setNuevaVacuna({ nombre: '', fecha: '' });
    }
  };

  const eliminarVacuna = (index) => {
    setVacunas((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEliminarMascota = async () => {
    try {
      await eliminarMascota(mascota.id);
      onEliminar();
    } catch (error) {
      console.error('Error al eliminar mascota:', error);
      mostrarError('Error al eliminar la mascota. Inténtalo de nuevo.');
    }
  };

  const maxBytesFoto = 5 * 1024 * 1024;

  const handleSeleccionFotoMascota = async (e) => {
    const archivo = e.target.files?.[0];
    e.target.value = '';
    if (!archivo) return;
    if (!archivo.type.startsWith('image/')) {
      mostrarError('Elegí un archivo de imagen (JPG, PNG, etc.).');
      return;
    }
    if (archivo.size > maxBytesFoto) {
      mostrarError('La imagen no puede superar 5 MB.');
      return;
    }
    setIsSubiendoFoto(true);
    try {
      const url = await subirImagenImgbb(archivo, {
        nombre: `mascota-${mascota.id}-${Date.now()}`,
      });
      setFormData((prev) => ({ ...prev, fotoUrl: url }));
      mostrarExito('Foto actualizada. Recordá guardar cambios si editaste otros datos.', 'Imagen lista');
    } catch (err) {
      console.error(err);
      mostrarError(err?.message || 'No se pudo subir la imagen. Revisá tu conexión y la clave imgBB (.env).');
    } finally {
      setIsSubiendoFoto(false);
    }
  };

  const handleQuitarFoto = () => {
    setFormData((prev) => ({ ...prev, fotoUrl: '' }));
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <header className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Editar datos de la mascota
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            <span className="font-medium text-gray-700">{mascota.nombre}</span>
            {tipoProfesional ? (
              <span className="text-gray-400">
                {' '}
                · Modo{' '}
                {tipoProfesional === 'veterinario' ? 'veterinario' : 'peluquero'}
              </span>
            ) : null}
          </p>
        </div>
        <button
          type="button"
          onClick={onCancelar}
          className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors text-xl leading-none"
          aria-label="Cerrar"
        >
          ×
        </button>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Estado perdida / en casa — una sola fila clara */}
        <div
          className={`rounded-2xl border px-4 py-4 sm:px-5 ${
            formData.isPerdida
              ? 'border-red-200 bg-red-50/90'
              : 'border-emerald-200/80 bg-emerald-50/70'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    formData.isPerdida
                      ? 'bg-red-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {formData.isPerdida ? 'Perdida' : 'En casa'}
                </span>
                {isGuardandoEstado && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                    <span
                      className="h-3.5 w-3.5 rounded-full border-2 border-orange-400 border-t-transparent animate-spin"
                      aria-hidden
                    />
                    Guardando…
                  </span>
                )}
              </div>
              <p
                className={`text-sm mt-2 leading-snug ${
                  formData.isPerdida ? 'text-red-900/90' : 'text-emerald-900/85'
                }`}
              >
                {formData.isPerdida
                  ? 'Visible en el perfil público como perdida. Desactivá el interruptor cuando vuelva a casa.'
                  : 'Marcá como perdida solo si se extravió; se actualiza al instante.'}
              </p>
            </div>
            <label
              className={`flex items-center gap-3 sm:flex-shrink-0 cursor-pointer select-none ${
                isGuardandoEstado ? 'opacity-60 cursor-wait' : ''
              }`}
            >
              <span className="text-xs font-medium text-gray-600 sm:hidden">Marcar como perdida</span>
              <input
                type="checkbox"
                name="isPerdida"
                checked={formData.isPerdida}
                onChange={handleCheckboxChange}
                disabled={isGuardandoEstado}
                className="sr-only peer"
              />
              <span
                className={`relative h-8 w-14 rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-orange-400 peer-focus-visible:ring-offset-2 ${
                  formData.isPerdida ? 'bg-red-500' : 'bg-gray-300'
                }`}
                aria-hidden
              >
                <span
                  className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                    formData.isPerdida ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </span>
            </label>
          </div>
        </div>

        <SeccionFormulario
          titulo="Foto de la mascota"
          descripcion="La imagen se sube a imgBB y guardamos la URL en Firebase al pulsar «Guardar cambios» (o podés subir ahora y luego guardar el resto del formulario)."
        >
          <div className="flex flex-col sm:flex-row gap-5 sm:items-center">
            <div className="flex-shrink-0 mx-auto sm:mx-0">
              <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl border-2 border-gray-100 bg-gray-50 overflow-hidden shadow-inner">
                {formData.fotoUrl ? (
                  <img
                    src={formData.fotoUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs text-center px-2">
                    Sin foto
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleSeleccionFotoMascota}
                    disabled={isSubiendoFoto || isCargando}
                  />
                  <span className="inline-flex cursor-pointer items-center justify-center rounded-xl border-2 border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-semibold text-orange-800 hover:bg-orange-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubiendoFoto ? 'Subiendo…' : 'Elegir nueva foto'}
                  </span>
                </label>
                {formData.fotoUrl ? (
                  <button
                    type="button"
                    onClick={handleQuitarFoto}
                    disabled={isSubiendoFoto || isCargando}
                    className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Quitar foto
                  </button>
                ) : null}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Formatos de imagen habituales, máx. 5 MB. La URL pública queda asociada al perfil de la mascota.
              </p>
            </div>
          </div>
        </SeccionFormulario>

        <SeccionFormulario
          titulo="Datos generales"
          descripcion="Nombre, raza y datos de contacto visibles donde corresponda."
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-1">
              <label htmlFor="edit-nombre" className={labelClass}>
                Nombre
              </label>
              <input
                id="edit-nombre"
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
            <div className="sm:col-span-1">
              <label htmlFor="edit-raza" className={labelClass}>
                Raza
              </label>
              <input
                id="edit-raza"
                type="text"
                name="raza"
                value={formData.raza}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label htmlFor="edit-color" className={labelClass}>
                Color
              </label>
              <input
                id="edit-color"
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className={inputClass}
                placeholder="Ej. negro, dorado…"
              />
            </div>
            <div>
              <label htmlFor="edit-contacto" className={labelClass}>
                Contacto de emergencia
              </label>
              <input
                id="edit-contacto"
                type="text"
                name="contacto"
                value={formData.contacto}
                onChange={handleChange}
                className={inputClass}
                placeholder="Teléfono o nota breve"
              />
            </div>
          </div>
          <div>
            <label htmlFor="edit-notas" className={labelClass}>
              Notas adicionales
            </label>
            <textarea
              id="edit-notas"
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              rows={3}
              className={`${inputClass} resize-y min-h-[88px]`}
              placeholder="Ej. perro guía, dieta, lo que quieras que lean en una urgencia"
            />
          </div>
        </SeccionFormulario>

        {(!tipoProfesional || tipoProfesional === 'veterinario') && (
          <SeccionFormulario
            titulo="Información veterinaria"
            descripcion="Peso, talla y antecedentes útiles para la clínica."
          >
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <div>
                <label htmlFor="edit-peso" className={labelClass}>
                  Peso (kg)
                </label>
                <input
                  id="edit-peso"
                  type="number"
                  name="peso"
                  value={formData.peso === 0 ? '' : formData.peso}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      peso: v === '' ? 0 : parseFloat(v) || 0,
                    }));
                  }}
                  step="0.1"
                  min="0"
                  className={inputClass}
                  placeholder="—"
                />
              </div>
              <div>
                <label htmlFor="edit-altura" className={labelClass}>
                  Altura (cm)
                </label>
                <input
                  id="edit-altura"
                  type="number"
                  name="altura"
                  value={formData.altura === 0 ? '' : formData.altura}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      altura: v === '' ? 0 : parseFloat(v) || 0,
                    }));
                  }}
                  min="0"
                  className={inputClass}
                  placeholder="—"
                />
              </div>
            </div>
            <div>
              <label htmlFor="edit-alergias" className={labelClass}>
                Alergias
              </label>
              <textarea
                id="edit-alergias"
                name="alergias"
                value={formData.alergias}
                onChange={handleChange}
                rows={2}
                className={`${inputClass} resize-y min-h-[72px]`}
                placeholder="Si no aplica, dejalo vacío"
              />
            </div>
            <div>
              <label htmlFor="edit-enfermedades" className={labelClass}>
                Enfermedades
              </label>
              <textarea
                id="edit-enfermedades"
                name="enfermedades"
                value={formData.enfermedades}
                onChange={handleChange}
                rows={2}
                className={`${inputClass} resize-y min-h-[72px]`}
                placeholder="Si no aplica, dejalo vacío"
              />
            </div>
          </SeccionFormulario>
        )}

        <SeccionFormulario titulo="Vacunas" descripcion="Registrá dosis aplicadas con fecha.">
          {vacunas.length > 0 && (
            <ul className="space-y-2">
              {vacunas.map((vacuna, index) => (
                <li
                  key={`${vacuna.nombre}-${vacuna.fecha}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{vacuna.nombre}</p>
                    <p className="text-xs text-gray-500">{vacuna.fecha}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => eliminarVacuna(index)}
                    className="flex-shrink-0 p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    aria-label={`Quitar vacuna ${vacuna.nombre}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="grid sm:grid-cols-12 gap-3 items-end pt-1">
            <div className="sm:col-span-5">
              <label htmlFor="vacuna-nombre" className={labelClass}>
                Nombre
              </label>
              <input
                id="vacuna-nombre"
                type="text"
                value={nuevaVacuna.nombre}
                onChange={(e) => setNuevaVacuna((prev) => ({ ...prev, nombre: e.target.value }))}
                className={inputClass}
                placeholder="Ej. antirrábica"
              />
            </div>
            <div className="sm:col-span-4">
              <label htmlFor="vacuna-fecha" className={labelClass}>
                Fecha
              </label>
              <input
                id="vacuna-fecha"
                type="date"
                value={nuevaVacuna.fecha}
                onChange={(e) => setNuevaVacuna((prev) => ({ ...prev, fecha: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-3">
              <button
                type="button"
                onClick={agregarVacuna}
                disabled={!nuevaVacuna.nombre || !nuevaVacuna.fecha}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold border-2 border-orange-200 text-orange-800 bg-orange-50 hover:bg-orange-100 disabled:opacity-45 disabled:cursor-not-allowed transition-colors"
              >
                Agregar
              </button>
            </div>
          </div>
        </SeccionFormulario>

        <footer className="flex flex-col-reverse gap-3 pt-6 mt-2 border-t border-gray-100 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setMostrarConfirmacionEliminar(true)}
            disabled={isCargando}
            className="order-1 sm:order-none text-sm font-semibold text-red-600 hover:text-red-700 py-2.5 px-2 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-center sm:text-left"
          >
            Eliminar mascota…
          </button>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onCancelar}
              disabled={isCargando}
              className="w-full sm:w-auto py-2.5 px-5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isCargando}
              className="w-full sm:w-auto py-2.5 px-6 rounded-xl text-sm font-semibold bg-orange-500 text-white shadow-sm hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCargando ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </footer>
      </form>

      {mostrarConfirmacionEliminar && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-100"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmar-eliminar-titulo"
          >
            <div className="flex gap-3 mb-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div>
                <h3 id="confirmar-eliminar-titulo" className="text-lg font-semibold text-gray-900">
                  ¿Eliminar a {mascota.nombre}?
                </h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  Se borrarán los datos de la mascota. Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMostrarConfirmacionEliminar(false)}
                disabled={isCargando}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleEliminarMascota}
                disabled={isCargando}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCargando ? 'Eliminando…' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
