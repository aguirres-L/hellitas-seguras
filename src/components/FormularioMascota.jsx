import React, { useState, useEffect, useCallback } from 'react';
import { ImageUploader } from './ImageUploader';
import { useAuth } from '../contexts/AuthContext';
import BusquedaAvanzada from './uiDashboardUser/BusquedaAvanzada';
import BusquedaAvanzadaGatos from './uiDashboardUser/BusquedaAvanzadaGatos';
import BusquedaOtrosAnimales from './uiDashboardUser/BusquedaOtrosAnimales';

const TOTAL_PASOS = 6;

/** Devuelve YYYY-MM-DD: hoy retrocediendo años y meses (misma hora del día). */
const calcularFechaNacimientoDesdeEdadAproximada = (años, meses) => {
  const hoy = new Date();
  const nacimiento = new Date(
    hoy.getFullYear() - Number(años),
    hoy.getMonth() - Number(meses),
    hoy.getDate()
  );
  const y = nacimiento.getFullYear();
  const mo = String(nacimiento.getMonth() + 1).padStart(2, '0');
  const d = String(nacimiento.getDate()).padStart(2, '0');
  return `${y}-${mo}-${d}`;
};

const mensajesPaso = [
  {
    titulo: 'Empecemos con una foto',
    subtitulo:
      'Así tu compañero tiene rostro en la app. Si preferís, podés saltar este paso y agregarla después.',
  },
  {
    titulo: '¿Cómo se llama?',
    subtitulo: 'El nombre que le decís todos los días, con cariño.',
  },
  {
    titulo: '¿Qué raza es?',
    subtitulo:
      'Escribila o elegí del listado: perros, gatos u otros animalitos.',
  },
  {
    titulo: '¿Cuándo nació?',
    subtitulo:
      'Podés poner la fecha exacta o solo la edad aproximada; en ambos casos calculamos todo lo demás.',
  },
  {
    titulo: '¿De qué color es?',
    subtitulo: 'Opcional — si no querés, podés dejarlo en blanco.',
  },
  {
    titulo: 'Algo más que debamos saber?',
    subtitulo:
      'Notas útiles: alergias visibles, si es perro guía, dieta especial… lo que quieras contarnos.',
  },
];

export const FormularioMascota = ({ onAgregarMascota, isCargando }) => {
  const { usuario } = useAuth();

  const [paso, setPaso] = useState(0);
  /** null | 'perros' | 'gatos' | 'otros' — vista secundaria dentro del paso de raza */
  const [vistaCatalogoRaza, setVistaCatalogoRaza] = useState(null);

  const [nombre, setNombre] = useState('');
  const [razaSeleccionada, setRazaSeleccionada] = useState('');
  const [raza, setRaza] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  /** 'fechaExacta' | 'edadAproximada' */
  const [modoNacimiento, setModoNacimiento] = useState('edadAproximada');
  const [añosAproximados, setAñosAproximados] = useState('');
  const [mesesAdicionales, setMesesAdicionales] = useState('');
  const [edadCalculada, setEdadCalculada] = useState('');
  const [color, setColor] = useState('');
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [urlImagenMascota, setUrlImagenMascota] = useState('');
  const [contacto, setContacto] = useState('');

  const [vacunas, setVacunas] = useState([{ nombre: '', fecha: '' }]);
  const [alergias, setAlergias] = useState('');
  const [enfermedades, setEnfermedades] = useState('');
  const [notas, setNotas] = useState('');

  const generarIdUnico = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${timestamp}-${random}`;
  };

  const [mascotaId] = useState(() => generarIdUnico());

  const calcularEdad = (fechaNac) => {
    if (!fechaNac) return '';

    const hoy = new Date();
    const nacimiento = new Date(fechaNac);

    if (nacimiento > hoy) return 'Fecha inválida';

    let años = hoy.getFullYear() - nacimiento.getFullYear();
    let meses = hoy.getMonth() - nacimiento.getMonth();
    let días = hoy.getDate() - nacimiento.getDate();

    if (días < 0) {
      meses--;
      const ultimoMes = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
      días += ultimoMes.getDate();
    }

    if (meses < 0) {
      años--;
      meses += 12;
    }

    if (años === 0) {
      if (meses === 0) {
        return `${días} día${días !== 1 ? 's' : ''}`;
      }
      return `${meses} mes${meses !== 1 ? 'es' : ''}`;
    }

    if (meses === 0) {
      return `${años} año${años !== 1 ? 's' : ''}`;
    }

    return `${años} año${años !== 1 ? 's' : ''} y ${meses} mes${meses !== 1 ? 'es' : ''}`;
  };

  const calcularEdadNumerica = (fechaNac) => {
    if (!fechaNac) return 0;

    const hoy = new Date();
    const nacimiento = new Date(fechaNac);

    if (nacimiento > hoy) return 0;

    const diferenciaMs = hoy - nacimiento;
    const años = diferenciaMs / (1000 * 60 * 60 * 24 * 365.25);

    return Math.round(años * 10) / 10;
  };

  useEffect(() => {
    const edad = calcularEdad(fechaNacimiento);
    setEdadCalculada(edad);
  }, [fechaNacimiento]);

  useEffect(() => {
    if (modoNacimiento !== 'edadAproximada') return;

    const años = Math.max(0, parseInt(String(añosAproximados), 10) || 0);
    const meses = Math.max(0, Math.min(11, parseInt(String(mesesAdicionales), 10) || 0));

    if (años === 0 && meses === 0) {
      setFechaNacimiento('');
      return;
    }

    const añosLimitados = Math.min(años, 50);
    const fecha = calcularFechaNacimientoDesdeEdadAproximada(añosLimitados, meses);
    setFechaNacimiento(fecha);
  }, [modoNacimiento, añosAproximados, mesesAdicionales]);

  useEffect(() => {
    if (razaSeleccionada) {
      setRaza(razaSeleccionada);
      setVistaCatalogoRaza(null);
    }
  }, [razaSeleccionada]);

  const isRazaCompleta = Boolean(
    (raza && raza.trim()) || (razaSeleccionada && razaSeleccionada.trim())
  );

  const isPasoNacimientoValido = useCallback(() => {
    if (!fechaNacimiento) return false;
    const nac = new Date(fechaNacimiento + 'T12:00:00');
    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999);
    if (nac > hoy || edadCalculada === 'Fecha inválida') return false;

    if (modoNacimiento === 'edadAproximada') {
      const años = parseInt(String(añosAproximados), 10);
      if (Number.isNaN(años) || años < 0 || años > 50) return false;
      const meses = parseInt(String(mesesAdicionales), 10);
      if (mesesAdicionales !== '' && mesesAdicionales != null) {
        if (Number.isNaN(meses) || meses < 0 || meses > 11) return false;
      }
      if (años === 0 && (Number.isNaN(meses) ? 0 : meses) === 0) return false;
      if (años === 0 && mesesAdicionales === '') return false;
    }
    return true;
  }, [
    fechaNacimiento,
    edadCalculada,
    modoNacimiento,
    añosAproximados,
    mesesAdicionales,
  ]);

  const puedeAvanzar = useCallback(() => {
    switch (paso) {
      case 0:
        return true;
      case 1:
        return Boolean(nombre.trim());
      case 2:
        return isRazaCompleta;
      case 3:
        return isPasoNacimientoValido();
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  }, [paso, nombre, isRazaCompleta, isPasoNacimientoValido]);

  const onContinuar = () => {
    if (!puedeAvanzar() || vistaCatalogoRaza) return;
    setPaso((p) => Math.min(p + 1, TOTAL_PASOS - 1));
  };

  const onAtras = () => {
    if (vistaCatalogoRaza) {
      setVistaCatalogoRaza(null);
      return;
    }
    setPaso((p) => Math.max(p - 1, 0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre || !raza || !fechaNacimiento) return;

    const mascotaConId = {
      id: mascotaId,
      nombre,
      raza: razaSeleccionada || raza,
      fechaNacimiento,
      edad: edadCalculada,
      edadNumerica: calcularEdadNumerica(fechaNacimiento),
      color,
      fotoUrl: urlImagenMascota,
      contacto,
      vacunas: vacunas.filter((v) => v.nombre && v.fecha),
      alergias,
      enfermedades,
      notas,
      estadoChapita: false,
      fechaCreacion: new Date().toISOString(),
    };

    const resultado = await Promise.resolve(onAgregarMascota(mascotaConId));
    if (resultado === false) return;

    /* Éxito: el modal se cierra desde el padre y este formulario se desmonta; no hace falta resetear estado aquí. */
  };

  const progreso = ((paso + 1) / TOTAL_PASOS) * 100;
  const { titulo, subtitulo } = mensajesPaso[paso] || mensajesPaso[0];

  const botonSecundarioClass =
    'px-4 py-3 rounded-lg font-semibold border-2 border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100 transition-all duration-200 text-base';

  const botonPrimarioClass =
    'bg-orange-500 text-white px-4 py-3 rounded-lg font-semibold shadow-md hover:bg-orange-600 transition-all duration-200 text-base disabled:opacity-50 disabled:cursor-not-allowed';

  const inputClass =
    'border border-gray-300 rounded-xl px-4 py-3 w-full text-base focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-shadow';

  const renderIndicadorRazaSeleccionada = () =>
    razaSeleccionada ? (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-3">
        <div className="flex items-start gap-2">
          <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm text-green-700 font-medium">Listo</p>
            <p className="text-lg font-semibold text-green-900 capitalize">{razaSeleccionada}</p>
          </div>
        </div>
      </div>
    ) : null;

  const contenidoCatalogo =
    vistaCatalogoRaza === 'perros' ? (
      <div className="space-y-4 animate-fade-in">
        <button type="button" className={botonSecundarioClass + ' w-full sm:w-auto'} onClick={() => setVistaCatalogoRaza(null)}>
          ← Volver a la pregunta
        </button>
        <BusquedaAvanzada onRazaSeleccionada={setRazaSeleccionada} razaSeleccionada={razaSeleccionada} />
        {renderIndicadorRazaSeleccionada()}
      </div>
    ) : vistaCatalogoRaza === 'gatos' ? (
      <div className="space-y-4 animate-fade-in">
        <button type="button" className={botonSecundarioClass + ' w-full sm:w-auto'} onClick={() => setVistaCatalogoRaza(null)}>
          ← Volver a la pregunta
        </button>
        <BusquedaAvanzadaGatos onRazaSeleccionada={setRazaSeleccionada} razaSeleccionada={razaSeleccionada} />
        {renderIndicadorRazaSeleccionada()}
      </div>
    ) : vistaCatalogoRaza === 'otros' ? (
      <div className="space-y-4 animate-fade-in">
        <button type="button" className={botonSecundarioClass + ' w-full sm:w-auto'} onClick={() => setVistaCatalogoRaza(null)}>
          ← Volver a la pregunta
        </button>
        <BusquedaOtrosAnimales onRazaSeleccionada={setRazaSeleccionada} razaSeleccionada={razaSeleccionada} />
        {renderIndicadorRazaSeleccionada()}
      </div>
    ) : null;

  return (
    <form
      onSubmit={handleSubmit}
      aria-busy={isCargando}
      className="relative w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 min-h-[320px] flex flex-col"
    >
      {isCargando && (
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-2xl bg-white/90 px-6 text-center backdrop-blur-[2px]"
          role="status"
          aria-live="polite"
          aria-label="Guardando mascota"
        >
          <div
            className="h-12 w-12 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin"
            aria-hidden
          />
          <div>
            <p className="text-lg font-semibold text-gray-900">Guardando tu mascota…</p>
            <p className="mt-1 text-sm text-gray-600">Esto puede tardar unos segundos. No cierres esta ventana.</p>
          </div>
        </div>
      )}

      {/* Barra de progreso estilo Typeform */}
      <div className="mb-6">
        <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
          <span>
            Paso {paso + 1} de {TOTAL_PASOS}
          </span>
          <span className="text-orange-600 font-medium">{Math.round(progreso)}%</span>
        </div>
        <div className="h-1.5 bg-orange-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>

      {vistaCatalogoRaza ? (
        contenidoCatalogo
      ) : (
        <>
          <div className="mb-6 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{titulo}</h2>
            <p className="mt-2 text-gray-600 text-base leading-relaxed">{subtitulo}</p>
          </div>

          <div className="flex-1 animate-fade-in">
            {paso === 0 && (
              <div className="flex flex-col items-center gap-4 py-2">
                <div className="relative avatar-conversation mx-auto">
                  <ImageUploader
                    onImageSelect={setArchivoImagen}
                    onImageUploaded={setUrlImagenMascota}
                    isCargando={isCargando}
                    userId={usuario?.uid}
                    petId={mascotaId}
                    imagenActual={urlImagenMascota}
                    className="avatar-upload-conversational"
                    usarModalOrigenFoto
                  />
                </div>
                {urlImagenMascota && (
                  <p className="text-sm text-green-600 font-medium">¡Quedó genial! Seguimos cuando quieras.</p>
                )}
              </div>
            )}

            {paso === 1 && (
              <input
                className={inputClass}
                placeholder="Ej: Luna, Max, Mishi…"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
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
              <div className="space-y-4">
                <input
                  className={`${inputClass} ${razaSeleccionada ? 'border-green-400 bg-green-50' : ''}`}
                  placeholder="Escribí la raza o tipo"
                  value={raza}
                  onChange={(e) => setRaza(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && isRazaCompleta) {
                      e.preventDefault();
                      onContinuar();
                    }
                  }}
                />
                <p className="text-sm text-gray-500">O buscá en el catálogo:</p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                  <button
                    type="button"
                    className="flex-1 min-w-[140px] px-4 py-3 rounded-xl bg-orange-100 text-orange-800 font-semibold hover:bg-orange-200 transition-colors"
                    onClick={() => setVistaCatalogoRaza('perros')}
                  >
                    Razas de perros
                  </button>
                  <button
                    type="button"
                    className="flex-1 min-w-[140px] px-4 py-3 rounded-xl bg-orange-100 text-orange-800 font-semibold hover:bg-orange-200 transition-colors"
                    onClick={() => setVistaCatalogoRaza('gatos')}
                  >
                    Razas de gatos
                  </button>
                  <button
                    type="button"
                    className="flex-1 min-w-[140px] px-4 py-3 rounded-xl bg-orange-100 text-orange-800 font-semibold hover:bg-orange-200 transition-colors"
                    onClick={() => setVistaCatalogoRaza('otros')}
                  >
                    Otros animales
                  </button>
                </div>
                {renderIndicadorRazaSeleccionada()}
              </div>
            )}

            {paso === 3 && (
              <div className="space-y-4">
                <div
                  className="flex rounded-xl border border-gray-200 p-1 bg-gray-50"
                  role="group"
                  aria-label="Forma de indicar la fecha de nacimiento"
                >
                  <button
                    type="button"
                    className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-colors ${
                      modoNacimiento === 'edadAproximada'
                        ? 'bg-white text-orange-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => {
                      setModoNacimiento('edadAproximada');
                      setFechaNacimiento('');
                      setAñosAproximados('');
                      setMesesAdicionales('');
                    }}
                  >
                    Edad aproximada
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-colors ${
                      modoNacimiento === 'fechaExacta'
                        ? 'bg-white text-orange-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => {
                      setModoNacimiento('fechaExacta');
                      setAñosAproximados('');
                      setMesesAdicionales('');
                    }}
                  >
                    Fecha exacta
                  </button>
                </div>

                {modoNacimiento === 'edadAproximada' ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Indicá cuántos años cumplió (y si querés, meses extra). Usamos la fecha de hoy para estimar
                      cuándo nació.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="anios-aprox" className="block text-xs font-medium text-gray-500 mb-1">
                          Años (aprox.)
                        </label>
                        <input
                          id="anios-aprox"
                          className={inputClass}
                          type="number"
                          inputMode="numeric"
                          min={0}
                          max={50}
                          placeholder="Ej: 3"
                          value={añosAproximados}
                          onChange={(e) => setAñosAproximados(e.target.value)}
                          autoFocus
                        />
                      </div>
                      <div>
                        <label htmlFor="meses-extra" className="block text-xs font-medium text-gray-500 mb-1">
                          Meses adicionales (opcional, 0–11)
                        </label>
                        <input
                          id="meses-extra"
                          className={inputClass}
                          type="number"
                          inputMode="numeric"
                          min={0}
                          max={11}
                          placeholder="Ej: 6"
                          value={mesesAdicionales}
                          onChange={(e) => setMesesAdicionales(e.target.value)}
                        />
                      </div>
                    </div>
                    {parseInt(String(añosAproximados), 10) > 50 && (
                      <p className="text-sm text-amber-700">Por favor revisá los años (máximo 50).</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input
                      className={inputClass}
                      type="date"
                      value={fechaNacimiento}
                      onChange={(e) => setFechaNacimiento(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      autoFocus
                    />
                  </div>
                )}

                {fechaNacimiento && modoNacimiento === 'edadAproximada' && edadCalculada !== 'Fecha inválida' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-xs text-amber-800 font-medium mb-1">Fecha estimada de nacimiento</p>
                    <p className="text-sm font-semibold text-amber-950">
                      {new Date(fechaNacimiento + 'T12:00:00').toLocaleDateString('es', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-amber-800/90 mt-2">
                      La guardamos como referencia; si más adelante tenés la fecha exacta, podés corregirla.
                    </p>
                  </div>
                )}

                {edadCalculada && edadCalculada !== 'Fecha inválida' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-2">
                    <svg className="h-5 w-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <p className="text-xs text-blue-600 font-medium">
                        {modoNacimiento === 'edadAproximada' ? 'Edad según lo que ingresaste' : 'Edad aproximada'}
                      </p>
                      <p className="text-sm font-semibold text-blue-900">{edadCalculada}</p>
                    </div>
                  </div>
                )}
                {edadCalculada === 'Fecha inválida' && (
                  <p className="text-sm text-red-600">Esa fecha es en el futuro. Revisala por favor.</p>
                )}
              </div>
            )}

            {paso === 4 && (
              <input
                className={inputClass}
                placeholder="Ej: negro con manchas blancas, dorado…"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onContinuar();
                  }
                }}
              />
            )}

            {paso === 5 && (
              <textarea
                className={`${inputClass} min-h-[120px] resize-y`}
                placeholder="Ejemplo: es perro guía y necesita estar cerca mío al moverse."
                name="notas"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={4}
                autoFocus
              />
            )}
          </div>
        </>
      )}

      <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3 sm:items-center pt-2 border-t border-gray-100">
        <div className="sm:flex-1">
          {(paso > 0 || vistaCatalogoRaza) && (
            <button type="button" className={botonSecundarioClass} onClick={onAtras} disabled={isCargando}>
              Atrás
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:justify-end sm:flex-1">
          {vistaCatalogoRaza ? null : paso < TOTAL_PASOS - 1 ? (
            <>
              {paso === 0 && (
                <button
                  type="button"
                  className={botonSecundarioClass + ' w-full sm:w-auto'}
                  onClick={onContinuar}
                  disabled={isCargando}
                >
                  Saltar foto
                </button>
              )}
              {paso === 4 && (
                <button
                  type="button"
                  className={botonSecundarioClass + ' w-full sm:w-auto'}
                  onClick={onContinuar}
                  disabled={isCargando}
                >
                  Saltar
                </button>
              )}
              <button
                type="button"
                className={botonPrimarioClass + ' w-full sm:w-auto'}
                onClick={onContinuar}
                disabled={isCargando || !puedeAvanzar()}
              >
                Continuar
              </button>
            </>
          ) : (
            <button type="submit" className={botonPrimarioClass + ' w-full sm:min-w-[200px]'} disabled={isCargando || !puedeAvanzar()}>
              {isCargando ? 'Agregando…' : 'Agregar mascota'}
            </button>
          )}
        </div>
      </div>

      <style>
        {`
          .animate-fade-in {
            animation: fadeIn 0.45s ease-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .avatar-conversation {
            width: 200px;
            height: 200px;
          }

          .avatar-upload-conversational {
            width: 200px !important;
            height: 200px !important;
            max-width: 200px !important;
            max-height: 200px !important;
            overflow: hidden !important;
          }

          .avatar-upload-conversational > div,
          .avatar-upload-conversational .border-2,
          .avatar-upload-conversational .border-dashed {
            width: 200px !important;
            height: 200px !important;
            min-width: 200px !important;
            min-height: 200px !important;
            max-width: 200px !important;
            max-height: 200px !important;
            padding: 0 !important;
            margin: 0 !important;
            border-radius: 50% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            overflow: hidden !important;
            border-width: 2px !important;
          }

          .avatar-upload-conversational img,
          .avatar-upload-conversational .relative img {
            width: 200px !important;
            height: 200px !important;
            object-fit: cover !important;
            border-radius: 50% !important;
          }

          .avatar-upload-conversational .relative {
            width: 200px !important;
            height: 200px !important;
            border-radius: 50% !important;
            overflow: hidden !important;
          }

          .avatar-upload-conversational .space-y-3,
          .avatar-upload-conversational .text-lg,
          .avatar-upload-conversational .text-sm,
          .avatar-upload-conversational .text-xs,
          .avatar-upload-conversational p,
          .avatar-upload-conversational .mt-2 {
            display: none !important;
          }

          .avatar-upload-conversational button[type="button"] {
            position: absolute !important;
            top: 4px !important;
            right: 4px !important;
            width: 28px !important;
            height: 28px !important;
            z-index: 10 !important;
          }

          .avatar-upload-conversational .w-16,
          .avatar-upload-conversational .h-16,
          .avatar-upload-conversational svg {
            width: 48px !important;
            height: 48px !important;
          }
        `}
      </style>
    </form>
  );
};
