import React, { useState, useEffect } from 'react';
import { getAllDataCollection, deleteDataCollection } from '../../../data/firebase/firebase';
import { useTheme } from '../../../contexts/ThemeContext';

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
      <div className="flex justify-between items-center mb-6">
        <h3 className={`text-xl font-bold ${typeTheme === 'light' ? 'text-gray-900' : 'text-white'}`}>
          Historias de Rescates en Adopción
        </h3>
        <div className="flex gap-2">
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {historiasFiltradas.map((historia) => (
            <div
              key={historia.id}
              className={`${
                typeTheme === 'light' ? 'bg-white' : 'bg-gray-800'
              } rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow`}
            >
              {/* Imagen de la mascota */}
              {historia.imagenUrl && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={historia.imagenUrl}
                    alt={historia.nombreMascota || 'Mascota rescatada'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=Sin+imagen';
                    }}
                  />
                </div>
              )}

              <div className="p-6">
                {/* Header con nombre y estado */}
                <div className="flex justify-between items-start mb-4">
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
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${obtenerColorEstado(historia.estado)}`}>
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

                {/* Botones de acción */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => manejarEliminar(historia.id)}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                  >
                    Eliminar
                  </button>
                  <button
                    className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
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
