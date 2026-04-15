import React, { useState, useCallback, useEffect } from 'react';
import { addDataCollection, subirArchivo } from '../../../data/firebase/firebase';
import { useTheme } from '../../../contexts/ThemeContext';
import { ImageUploader } from '../../ImageUploader';

const TOTAL_PASOS = 8;

const mensajesPaso = [
  {
    titulo: 'Empecemos con una foto',
    subtitulo:
      'Así la historia tiene rostro visible. Si preferís, podés saltar este paso y usar solo una URL al final.',
  },
  {
    titulo: '¿Cómo se llama?',
    subtitulo: 'El nombre que identifica a quien fue rescatado.',
  },
  {
    titulo: '¿Qué especie es?',
    subtitulo: 'Perro, gato u otro — nos ayuda a mostrarlo bien en adopciones.',
  },
  {
    titulo: '¿Raza o tipo?',
    subtitulo: 'Opcional: mestizo, criollo, tamaño aproximado… lo que sirva a quien lea.',
  },
  {
    titulo: 'Edad, sexo y tamaño',
    subtitulo: 'Todo opcional, pero suma si querés adopción responsable.',
  },
  {
    titulo: 'Estado y fecha del rescate',
    subtitulo: 'Cuándo y en qué situación llegó a la organización.',
  },
  {
    titulo: 'Descripción e historia',
    subtitulo: 'Cómo se ve y cómo fue el rescate: lo que quieras contar.',
  },
  {
    titulo: 'Imagen por URL y contacto',
    subtitulo: 'Si la foto ya está en internet, pegá el enlace. Dejá cómo contactar y dónde está.',
  },
];

/**
 * Crear historias de rescate — flujo conversacional por pasos (misma lógica de UX que FormularioMascota).
 * @param {{ onHistoriaCreada?: () => void }} props
 */
export default function NewHistoria({ onHistoriaCreada }) {
  const { typeTheme } = useTheme();
  const [paso, setPaso] = useState(0);
  const [isEnviando, setIsEnviando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [mensajeError, setMensajeError] = useState('');

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
    ubicacion: '',
  });

  const [imagenArchivo, setImagenArchivo] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(max-width: 767px)').matches) return;
    window.scrollTo(0, 0);
  }, [paso]);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const manejarImagenHistoria = (archivo) => {
    if (!archivo) {
      setImagenArchivo(null);
      return;
    }
    setImagenArchivo(archivo);
    setMensajeError('');
  };

  const puedeAvanzar = useCallback(() => {
    switch (paso) {
      case 0:
        return true;
      case 1:
        return Boolean(formData.nombreMascota.trim());
      case 2:
        return Boolean(formData.especie.trim());
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        return true;
      default:
        return false;
    }
  }, [paso, formData.nombreMascota, formData.especie]);

  const onContinuar = () => {
    if (!puedeAvanzar()) return;
    setPaso((p) => Math.min(p + 1, TOTAL_PASOS - 1));
  };

  const onAtras = () => {
    setPaso((p) => Math.max(p - 1, 0));
  };

  const manejarEnviar = async (e) => {
    e.preventDefault();
    if (paso !== TOTAL_PASOS - 1) return;

    setIsEnviando(true);
    setMensajeExito('');
    setMensajeError('');

    try {
      if (!formData.nombreMascota.trim()) {
        throw new Error('El nombre de la mascota es requerido');
      }
      if (!formData.especie.trim()) {
        throw new Error('La especie es requerida');
      }

      let imagenUrlFinal = formData.imagenUrl.trim();
      if (imagenArchivo) {
        try {
          const nombreArchivo = `rescate_${Date.now()}_${formData.nombreMascota.replace(/\s+/g, '_')}`;
          imagenUrlFinal = await subirArchivo(imagenArchivo, 'historias-rescates', nombreArchivo);
        } catch (error) {
          console.error('Error al subir imagen:', error);
          throw new Error('Error al subir la imagen. Inténtalo de nuevo.');
        }
      }

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
        ubicacion: formData.ubicacion.trim() || null,
      };

      await addDataCollection('historias-de-rescates', datosHistoria);

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
        ubicacion: '',
      });
      setImagenArchivo(null);
      setPaso(0);

      setMensajeExito('Historia de rescate creada exitosamente');

      if (onHistoriaCreada) {
        setTimeout(() => onHistoriaCreada(), 1500);
      } else {
        setTimeout(() => setMensajeExito(''), 5000);
      }
    } catch (error) {
      console.error('Error al crear historia:', error);
      setMensajeError(error.message || 'Error al crear la historia. Inténtalo de nuevo.');
    } finally {
      setIsEnviando(false);
    }
  };

  const progreso = ((paso + 1) / TOTAL_PASOS) * 100;
  const { titulo, subtitulo } = mensajesPaso[paso] || mensajesPaso[0];

  const esOscuro = typeTheme === 'dark';

  const botonSecundarioClass = esOscuro
    ? 'px-4 py-3 rounded-lg font-semibold border-2 border-orange-400/50 text-orange-200 bg-gray-800 hover:bg-gray-700 transition-all duration-200 text-base'
    : 'px-4 py-3 rounded-lg font-semibold border-2 border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100 transition-all duration-200 text-base';

  const botonPrimarioClass =
    'bg-orange-500 text-white px-4 py-3 rounded-lg font-semibold shadow-md hover:bg-orange-600 transition-all duration-200 text-base disabled:opacity-50 disabled:cursor-not-allowed';

  const inputClass = esOscuro
    ? 'border border-gray-600 rounded-xl px-4 py-3 w-full text-base focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-shadow bg-gray-900 text-gray-100'
    : 'border border-gray-300 rounded-xl px-4 py-3 w-full text-base focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-shadow bg-white text-gray-900';

  const labelPasoClass = esOscuro ? 'block text-xs font-medium text-gray-400 mb-1' : 'block text-xs font-medium text-gray-500 mb-1';

  const tituloClass = esOscuro ? 'text-2xl sm:text-3xl font-bold text-white leading-tight' : 'text-2xl sm:text-3xl font-bold text-gray-900 leading-tight';

  const subtituloClass = esOscuro ? 'mt-2 text-gray-400 text-base leading-relaxed' : 'mt-2 text-gray-600 text-base leading-relaxed';

  const formShellClass = esOscuro
    ? 'relative w-full max-w-2xl mx-auto rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 min-h-[320px] flex flex-col border border-gray-600 bg-gray-800/95'
    : 'relative w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 min-h-[320px] flex flex-col';

  const barraTrackClass = esOscuro ? 'h-1.5 bg-gray-700 rounded-full overflow-hidden' : 'h-1.5 bg-orange-100 rounded-full overflow-hidden';

  const textoPasoClass = esOscuro ? 'text-xs text-gray-400' : 'text-xs text-gray-500';

  return (
    <div>
      <h3 className={`mb-4 text-xl font-bold sm:mb-6 ${esOscuro ? 'text-white' : 'text-gray-900'}`}>
        Nueva Historia de Rescate
      </h3>

      <form onSubmit={manejarEnviar} aria-busy={isEnviando} className={formShellClass}>
        {isEnviando && (
          <div
            className={`absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-2xl px-6 text-center backdrop-blur-[2px] ${
              esOscuro ? 'bg-gray-900/90' : 'bg-white/90'
            }`}
            role="status"
            aria-live="polite"
            aria-label="Guardando historia"
          >
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" aria-hidden />
            <div>
              <p className={`text-lg font-semibold ${esOscuro ? 'text-white' : 'text-gray-900'}`}>
                Creando la historia…
              </p>
              <p className={`mt-1 text-sm ${esOscuro ? 'text-gray-400' : 'text-gray-600'}`}>
                Subiendo imagen si corresponde. No cierres esta ventana.
              </p>
            </div>
          </div>
        )}

        {mensajeExito && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-green-800">{mensajeExito}</p>
          </div>
        )}

        {mensajeError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-800">{mensajeError}</p>
          </div>
        )}

        <div className="mb-6">
          <div className={`mb-2 flex items-center justify-between ${textoPasoClass}`}>
            <span>
              Paso {paso + 1} de {TOTAL_PASOS}
            </span>
            <span className="font-medium text-orange-500">{Math.round(progreso)}%</span>
          </div>
          <div className={barraTrackClass}>
            <div
              className="h-full rounded-full bg-orange-500 transition-all duration-500 ease-out"
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>

        <div className="mb-6 animate-fade-in">
          <h2 className={tituloClass}>{titulo}</h2>
          <p className={subtituloClass}>{subtitulo}</p>
        </div>

        <div className="flex-1 animate-fade-in">
          {paso === 0 && (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="relative mx-auto w-full max-w-md">
                <ImageUploader
                  onImageSelect={manejarImagenHistoria}
                  isCargando={isEnviando}
                  className="w-full"
                />
              </div>
              {imagenArchivo ? (
                <p className="text-center text-sm font-medium text-green-600">Imagen lista: se subirá al publicar.</p>
              ) : null}
            </div>
          )}

          {paso === 1 && (
            <input
              className={inputClass}
              name="nombreMascota"
              value={formData.nombreMascota}
              onChange={manejarCambio}
              placeholder="Ej: Luna, Max, Oliver…"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onContinuar();
                }
              }}
            />
          )}

          {paso === 2 && (
            <select
              className={inputClass}
              name="especie"
              value={formData.especie}
              onChange={manejarCambio}
              autoFocus
            >
              <option value="">Seleccioná una especie</option>
              <option value="perro">Perro</option>
              <option value="gato">Gato</option>
              <option value="otro">Otro</option>
            </select>
          )}

          {paso === 3 && (
            <input
              className={inputClass}
              name="raza"
              value={formData.raza}
              onChange={manejarCambio}
              placeholder="Ej: mestizo, Labrador, SRD…"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onContinuar();
                }
              }}
            />
          )}

          {paso === 4 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="nh-edad" className={labelPasoClass}>
                  Edad (texto libre)
                </label>
                <input
                  id="nh-edad"
                  className={inputClass}
                  name="edad"
                  value={formData.edad}
                  onChange={manejarCambio}
                  placeholder="Ej: 2 años, 6 meses"
                />
              </div>
              <div>
                <label htmlFor="nh-sexo" className={labelPasoClass}>
                  Sexo
                </label>
                <select id="nh-sexo" className={inputClass} name="sexo" value={formData.sexo} onChange={manejarCambio}>
                  <option value="">Sin indicar</option>
                  <option value="macho">Macho</option>
                  <option value="hembra">Hembra</option>
                </select>
              </div>
              <div>
                <label htmlFor="nh-tam" className={labelPasoClass}>
                  Tamaño
                </label>
                <select id="nh-tam" className={inputClass} name="tamaño" value={formData.tamaño} onChange={manejarCambio}>
                  <option value="">Sin indicar</option>
                  <option value="pequeño">Pequeño</option>
                  <option value="mediano">Mediano</option>
                  <option value="grande">Grande</option>
                </select>
              </div>
            </div>
          )}

          {paso === 5 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="nh-estado" className={labelPasoClass}>
                  Estado publicado
                </label>
                <select id="nh-estado" className={inputClass} name="estado" value={formData.estado} onChange={manejarCambio}>
                  <option value="en_adopcion">En adopción</option>
                  <option value="rescatado">Rescatado</option>
                  <option value="adoptado">Adoptado</option>
                </select>
              </div>
              <div>
                <label htmlFor="nh-fecha" className={labelPasoClass}>
                  Fecha del rescate
                </label>
                <input
                  id="nh-fecha"
                  className={inputClass}
                  type="date"
                  name="fechaRescate"
                  value={formData.fechaRescate}
                  onChange={manejarCambio}
                />
              </div>
            </div>
          )}

          {paso === 6 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="nh-desc" className={labelPasoClass}>
                  Descripción (cómo es)
                </label>
                <textarea
                  id="nh-desc"
                  className={`${inputClass} min-h-[100px] resize-y`}
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={manejarCambio}
                  rows={4}
                  placeholder="Color, tamaño, personalidad…"
                />
              </div>
              <div>
                <label htmlFor="nh-hist" className={labelPasoClass}>
                  Historia del rescate
                </label>
                <textarea
                  id="nh-hist"
                  className={`${inputClass} min-h-[120px] resize-y`}
                  name="historiaRescate"
                  value={formData.historiaRescate}
                  onChange={manejarCambio}
                  rows={4}
                  placeholder="Cómo llegó a la organización…"
                />
              </div>
            </div>
          )}

          {paso === 7 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="nh-url" className={labelPasoClass}>
                  URL de imagen (si no subiste archivo)
                </label>
                <input
                  id="nh-url"
                  className={inputClass}
                  type="url"
                  name="imagenUrl"
                  value={formData.imagenUrl}
                  onChange={manejarCambio}
                  placeholder="https://…"
                />
              </div>
              <div>
                <label htmlFor="nh-contacto" className={labelPasoClass}>
                  Contacto
                </label>
                <input
                  id="nh-contacto"
                  className={inputClass}
                  name="contacto"
                  value={formData.contacto}
                  onChange={manejarCambio}
                  placeholder="Teléfono o correo"
                />
              </div>
              <div>
                <label htmlFor="nh-ubi" className={labelPasoClass}>
                  Ubicación
                </label>
                <input
                  id="nh-ubi"
                  className={inputClass}
                  name="ubicacion"
                  value={formData.ubicacion}
                  onChange={manejarCambio}
                  placeholder="Ciudad o región"
                />
              </div>
            </div>
          )}
        </div>

        <div
          className={`mt-8 flex flex-col-reverse gap-3 border-t pt-2 sm:flex-row sm:items-center ${
            esOscuro ? 'border-gray-600' : 'border-gray-100'
          }`}
        >
          <div className="sm:flex-1">
            {paso > 0 && (
              <button type="button" className={botonSecundarioClass} onClick={onAtras} disabled={isEnviando}>
                Atrás
              </button>
            )}
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-1 sm:justify-end sm:flex-row">
            {paso < TOTAL_PASOS - 1 ? (
              <>
                {paso === 0 && (
                  <button
                    type="button"
                    className={botonSecundarioClass + ' w-full sm:w-auto'}
                    onClick={onContinuar}
                    disabled={isEnviando}
                  >
                    Saltar foto
                  </button>
                )}
                <button
                  type="button"
                  className={botonPrimarioClass + ' w-full sm:w-auto'}
                  onClick={onContinuar}
                  disabled={isEnviando || !puedeAvanzar()}
                >
                  Continuar
                </button>
              </>
            ) : (
              <button type="submit" className={botonPrimarioClass + ' w-full sm:min-w-[200px]'} disabled={isEnviando || !puedeAvanzar()}>
                {isEnviando ? 'Publicando…' : 'Crear historia de rescate'}
              </button>
            )}
          </div>
        </div>
      </form>

      <style>
        {`
          .animate-fade-in {
            animation: newHistoriaFadeIn 0.45s ease-out;
          }
          @keyframes newHistoriaFadeIn {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}
