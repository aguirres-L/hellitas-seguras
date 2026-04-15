import React, { useState, useEffect } from 'react';
import { getAllDataCollection, deleteDataCollection } from '../../../data/firebase/firebase';
import { useTheme } from '../../../contexts/ThemeContext';

const imagenFallbackSvg =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect fill="#e5e7eb" width="800" height="600"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="system-ui,sans-serif" font-size="28">Sin imagen</text></svg>`
  );

// Este componente no recibe props
export default function AllHistorias() {
  const { typeTheme } = useTheme();
  const [historias, setHistorias] = useState([]);
  const [isCargando, setIsCargando] = useState(false);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos'); // 'todos', 'en_adopcion', 'adoptado'

  // Cargar historias al montar el componente
  useEffect(() => {
    cargarHistorias();
  }, []);

  const cargarHistorias = async () => {
    setIsCargando(true);
    setError(null);
    try {
      const todasLasHistorias = await getAllDataCollection('historias-de-rescates');
      // Filtrar solo las que están en estado de adopción
      const historiasEnAdopcion = todasLasHistorias.filter(
        historia => historia.estado === 'en_adopcion' || !historia.estado
      );
      // Ordenar por fecha de creación (más recientes primero)
      historiasEnAdopcion.sort((a, b) => {
        const fechaA = a.fechaCreacion?.seconds 
          ? new Date(a.fechaCreacion.seconds * 1000)
          : new Date(a.fechaCreacion || 0);
        const fechaB = b.fechaCreacion?.seconds 
          ? new Date(b.fechaCreacion.seconds * 1000)
          : new Date(b.fechaCreacion || 0);
        return fechaB - fechaA;
      });
      setHistorias(historiasEnAdopcion);
    } catch (err) {
      console.error('Error al cargar historias:', err);
      setError('Error al cargar las historias. Inténtalo de nuevo.');
    } finally {
      setIsCargando(false);
    }
  };

  const manejarEliminar = async (historiaId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta historia de rescate?')) {
      return;
    }

    try {
      await deleteDataCollection('historias-de-rescates', historiaId);
      // Recargar las historias después de eliminar
      await cargarHistorias();
    } catch (err) {
      console.error('Error al eliminar historia:', err);
      alert('Error al eliminar la historia. Inténtalo de nuevo.');
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    
    try {
      const fechaObj = fecha.seconds 
        ? new Date(fecha.seconds * 1000)
        : new Date(fecha);
      
      return fechaObj.toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (err) {
      return 'Fecha inválida';
    }
  };

  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'en_adopcion':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'adoptado':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'rescatado':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const historiasFiltradas = filtroEstado === 'todos' 
    ? historias 
    : historias.filter(h => h.estado === filtroEstado);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className={`text-lg font-bold sm:text-xl ${typeTheme === 'light' ? 'text-gray-900' : 'text-white'}`}>
          Historias de Rescates en Adopción
        </h3>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <button
            onClick={() => setFiltroEstado('todos')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filtroEstado === 'todos'
                ? 'bg-purple-500 text-white'
                : typeTheme === 'light'
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFiltroEstado('en_adopcion')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filtroEstado === 'en_adopcion'
                ? 'bg-green-500 text-white'
                : typeTheme === 'light'
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            En Adopción
          </button>
          <button
            onClick={() => setFiltroEstado('adoptado')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filtroEstado === 'adoptado'
                ? 'bg-blue-500 text-white'
                : typeTheme === 'light'
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Adoptados
          </button>
        </div>
      </div>

      {isCargando ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <p className={`mt-2 ${typeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
            Cargando historias...
          </p>
        </div>
      ) : error ? (
        <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${typeTheme === 'dark' ? 'bg-red-900/20 border-red-800' : ''}`}>
          <p className="text-red-800">{error}</p>
          <button
            onClick={cargarHistorias}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : historiasFiltradas.length === 0 ? (
        <div className={`text-center py-12 ${typeTheme === 'light' ? 'bg-white' : 'bg-gray-800'} rounded-xl shadow-lg`}>
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className={`mt-4 text-lg font-medium ${typeTheme === 'light' ? 'text-gray-900' : 'text-white'}`}>
            No hay historias de rescates disponibles
          </p>
          <p className={`mt-2 text-sm ${typeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
            {filtroEstado === 'todos' 
              ? 'Aún no se han creado historias de rescates.'
              : `No hay historias con estado "${filtroEstado === 'en_adopcion' ? 'en adopción' : 'adoptado'}"`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {historiasFiltradas.map((historia) => (
            <div
              key={historia.id}
              className={`${
                typeTheme === 'light' ? 'bg-white' : 'bg-gray-800'
              } flex flex-col overflow-hidden rounded-xl shadow-lg transition-shadow hover:shadow-xl`}
            >
              {/* Imagen: aspect-ratio fijo + object-cover para que no se deforme en ningún ancho */}
              <div
                className={`relative aspect-[4/3] w-full shrink-0 overflow-hidden ${
                  typeTheme === 'light' ? 'bg-gray-100' : 'bg-gray-900'
                }`}
              >
                {historia.imagenUrl ? (
                  <img
                    src={historia.imagenUrl}
                    alt={historia.nombreMascota || 'Mascota rescatada'}
                    className="absolute inset-0 h-full w-full object-cover object-center"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      const el = e.currentTarget;
                      el.onerror = null;
                      el.src = imagenFallbackSvg;
                      el.alt = 'Imagen no disponible';
                    }}
                  />
                ) : (
                  <div
                    className={`flex h-full w-full flex-col items-center justify-center gap-1 px-4 text-center text-sm ${
                      typeTheme === 'light' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    <svg className="h-10 w-10 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Sin imagen</span>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col p-4 sm:p-6">
                {/* Header con nombre y estado */}
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4 className={`text-xl font-bold ${typeTheme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                      {historia.nombreMascota || 'Sin nombre'}
                    </h4>
                    {historia.especie && (
                      <p className={`text-sm ${typeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                        {historia.especie}
                      </p>
                    )}
                  </div>
                  {historia.estado && (
                    <span
                      className={`w-fit shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${obtenerColorEstado(
                        historia.estado
                      )}`}
                    >
                      {historia.estado === 'en_adopcion' ? 'En Adopción' : 
                       historia.estado === 'adoptado' ? 'Adoptado' :
                       historia.estado === 'rescatado' ? 'Rescatado' : historia.estado}
                    </span>
                  )}
                </div>

                {/* Información básica */}
                <div className="space-y-2 mb-4">
                  {historia.edad && (
                    <div className="flex items-center text-sm">
                      <span className={`font-medium ${typeTheme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                        Edad:
                      </span>
                      <span className={`ml-2 ${typeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                        {historia.edad}
                      </span>
                    </div>
                  )}
                  {historia.sexo && (
                    <div className="flex items-center text-sm">
                      <span className={`font-medium ${typeTheme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                        Sexo:
                      </span>
                      <span className={`ml-2 ${typeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                        {historia.sexo}
                      </span>
                    </div>
                  )}
                  {historia.tamaño && (
                    <div className="flex items-center text-sm">
                      <span className={`font-medium ${typeTheme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                        Tamaño:
                      </span>
                      <span className={`ml-2 ${typeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                        {historia.tamaño}
                      </span>
                    </div>
                  )}
                </div>

                {/* Descripción */}
                {historia.descripcion && (
                  <div className="mb-4">
                    <p className={`text-sm line-clamp-3 ${typeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                      {historia.descripcion}
                    </p>
                  </div>
                )}

                {/* Fecha de rescate */}
                {historia.fechaRescate && (
                  <div className="mb-4">
                    <p className={`text-xs ${typeTheme === 'light' ? 'text-gray-500' : 'text-gray-500'}`}>
                      Rescatado el: {formatearFecha(historia.fechaRescate)}
                    </p>
                  </div>
                )}

                {/* Botones de acción: columna en móvil para área táctil cómoda */}
                <div
                  className={`mt-auto flex flex-col gap-2 border-t pt-4 sm:flex-row ${
                    typeTheme === 'light' ? 'border-gray-200' : 'border-gray-600'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => manejarEliminar(historia.id)}
                    className="min-h-[44px] flex-1 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 sm:py-2"
                  >
                    Eliminar
                  </button>
                  <button
                    type="button"
                    className="min-h-[44px] flex-1 rounded-lg bg-purple-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-600 sm:py-2"
                    onClick={() => {
                      // TODO: Implementar edición
                      alert('Funcionalidad de edición próximamente');
                    }}
                  >
                    Editar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
