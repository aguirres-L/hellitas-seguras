import React, { useState, useMemo } from 'react';

// Array de animales domésticos comunes (excluyendo perros y gatos)
// Filtrado para respetar los flujos específicos de perros y gatos
const animalesDomesticos = [
  // Aves
/*   { id: 'canario', nombre: 'Canario', categoria: 'Ave', icono: '🐦' },
  { id: 'perico', nombre: 'Perico', categoria: 'Ave', icono: '🦜' },
  { id: 'loro', nombre: 'Loro', categoria: 'Ave', icono: '🦜' },
  { id: 'cacatua', nombre: 'Cacatúa', categoria: 'Ave', icono: '🦜' },
  { id: 'agapornis', nombre: 'Agapornis', categoria: 'Ave', icono: '🦜' },
  { id: 'cotorra', nombre: 'Cotorra', categoria: 'Ave', icono: '🦜' },
  { id: 'periquito-australiano', nombre: 'Periquito Australiano', categoria: 'Ave', icono: '🦜' },
  { id: 'diamante-mandarin', nombre: 'Diamante Mandarín', categoria: 'Ave', icono: '🐦' },
  { id: 'jilguero', nombre: 'Jilguero', categoria: 'Ave', icono: '🐦' },
  { id: 'cardenal', nombre: 'Cardenal', categoria: 'Ave', icono: '🐦' },
  */ 
  // Roedores
/*   { id: 'hamster', nombre: 'Hámster', categoria: 'Roedor', icono: '🐹' },
  { id: 'cobaya', nombre: 'Cobaya', categoria: 'Roedor', icono: '🐹' },
  { id: 'conejo', nombre: 'Conejo', categoria: 'Roedor', icono: '🐰' },
  { id: 'rata', nombre: 'Rata', categoria: 'Roedor', icono: '🐭' },
  { id: 'raton', nombre: 'Ratón', categoria: 'Roedor', icono: '🐭' },
  { id: 'jerbo', nombre: 'Jerbo', categoria: 'Roedor', icono: '🐹' },
  { id: 'chinchilla', nombre: 'Chinchilla', categoria: 'Roedor', icono: '🐹' },
  { id: 'degú', nombre: 'Degú', categoria: 'Roedor', icono: '🐹' },
 */  
  // Reptiles
/*   { id: 'tortuga', nombre: 'Tortuga', categoria: 'Reptil', icono: '🐢' },
  { id: 'iguana', nombre: 'Iguana', categoria: 'Reptil', icono: '🦎' },
  { id: 'gecko', nombre: 'Gecko', categoria: 'Reptil', icono: '🦎' },
  { id: 'camaleon', nombre: 'Camaleón', categoria: 'Reptil', icono: '🦎' },
  { id: 'serpiente', nombre: 'Serpiente', categoria: 'Reptil', icono: '🐍' },
  { id: 'dragón-barbudo', nombre: 'Dragón Barbudo', categoria: 'Reptil', icono: '🦎' },
 */  
  // Peces
/*   { id: 'goldfish', nombre: 'Goldfish', categoria: 'Pez', icono: '🐠' },
  { id: 'betta', nombre: 'Betta', categoria: 'Pez', icono: '🐠' },
  { id: 'pez-angel', nombre: 'Pez Ángel', categoria: 'Pez', icono: '🐠' },
  { id: 'guppy', nombre: 'Guppy', categoria: 'Pez', icono: '🐠' },
  { id: 'pez-dorado', nombre: 'Pez Dorado', categoria: 'Pez', icono: '🐠' },
  { id: 'pez-gato', nombre: 'Pez Gato', categoria: 'Pez', icono: '🐠' },
  { id: 'pez-arcoiris', nombre: 'Pez Arcoíris', categoria: 'Pez', icono: '🐠' },
 */  
  // Otros
  { id: 'ferret', nombre: 'Hurón', categoria: 'Otro', icono: '🦨' },
  { id: 'erizo', nombre: 'Erizo', categoria: 'Otro', icono: '🦔' },
  { id: 'cerdo-miniatura', nombre: 'Cerdo Miniatura', categoria: 'Otro', icono: '🐷' },
/*   { id: 'pollito', nombre: 'Pollito', categoria: 'Ave', icono: '🐤' },
  { id: 'gallina', nombre: 'Gallina', categoria: 'Ave', icono: '🐔' },
 */  { id: 'pato', nombre: 'Pato', categoria: 'Ave', icono: '🦆' },
  { id: 'ganso', nombre: 'Ganso', categoria: 'Ave', icono: '🪿' },
  
  // Animales de granja pequeños
  { id: 'cabrito', nombre: 'Cabrito', categoria: 'Otro', icono: '🐐' },
  { id: 'oveja', nombre: 'Oveja', categoria: 'Otro', icono: '🐑' },
/*   { id: 'burro', nombre: 'Burro', categoria: 'Otro', icono: '🫏' },
  { id: 'pony', nombre: 'Pony', categoria: 'Otro', icono: '🐴' },
 */];

// Palabras a excluir para evitar mostrar perros y gatos
const palabrasExcluidas = ['perro', 'gato', 'dog', 'cat', 'can', 'felino', 'canino'];

export default function BusquedaOtrosAnimales({ onRazaSeleccionada, razaSeleccionada }) {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [razaSeleccionadaLocal, setRazaSeleccionadaLocal] = useState(razaSeleccionada || '');

  // Obtener categorías únicas
  const categorias = useMemo(() => {
    const cats = ['Todas', ...new Set(animalesDomesticos.map(animal => animal.categoria))];
    return cats;
  }, []);

  // Filtrar animales según búsqueda y categoría
  const animalesFiltrados = useMemo(() => {
    let resultado = animalesDomesticos;

    // Filtrar por categoría
    if (categoriaFiltro !== 'Todas') {
      resultado = resultado.filter(animal => animal.categoria === categoriaFiltro);
    }

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase();
      
      // Verificar que no incluya palabras excluidas
      const incluyeExcluida = palabrasExcluidas.some(palabra => 
        busquedaLower.includes(palabra)
      );
      
      if (incluyeExcluida) {
        return [];
      }
      
      resultado = resultado.filter(animal =>
        animal.nombre.toLowerCase().includes(busquedaLower) ||
        animal.categoria.toLowerCase().includes(busquedaLower)
      );
    }

    return resultado;
  }, [busqueda, categoriaFiltro]);

  // Manejar selección de animal
  const manejarSeleccionAnimal = (nombre) => {
    setRazaSeleccionadaLocal(nombre);
    onRazaSeleccionada?.(nombre);
    setBusqueda('');
  };

  // Manejar entrada manual
  const manejarEntradaManual = (e) => {
    const valor = e.target.value;
    setBusqueda(valor);
    
    // Si el usuario termina de escribir y presiona Enter, usar ese valor
    if (e.key === 'Enter' && valor.trim() && animalesFiltrados.length === 0) {
      // Verificar que no sea perro o gato
      const valorLower = valor.toLowerCase();
      const esExcluido = palabrasExcluidas.some(palabra => valorLower.includes(palabra));
      
      if (!esExcluido) {
        manejarSeleccionAnimal(valor);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Identifica el tipo de tu mascota
        </h2>
        <p className="text-gray-600 text-sm mb-3">
          Selecciona o busca el tipo de animal que tienes
        </p>
        
        {/* Mensaje educativo */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-4">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-indigo-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-left">
              <p className="text-sm text-indigo-800 font-medium">
                ¿Qué tipos de mascotas puedes registrar?
              </p>
              <p className="text-xs text-indigo-700 mt-1">
                Aves, roedores, reptiles, peces y otros animales domésticos. 
                Si tienes un perro o gato, usa los tabs específicos para ellos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Raza seleccionada */}
      {razaSeleccionadaLocal && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Tipo seleccionado:</p>
              <p className="text-lg font-semibold text-green-800 capitalize">
                {razaSeleccionadaLocal}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setRazaSeleccionadaLocal('');
                onRazaSeleccionada?.('');
              }}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              Cambiar
            </button>
          </div>
        </div>
      )}

      {/* Opciones de búsqueda */}
      <div className="space-y-4">
     {/*    <div className="space-y-2">
          <h3 className="font-semibold text-gray-700 flex items-center">
            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
            Filtrar por categoría
          </h3>
          <div className="flex flex-wrap gap-2">
            {categorias.map(categoria => (
              <button
                key={categoria}
                type="button"
                onClick={() => setCategoriaFiltro(categoria)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  categoriaFiltro === categoria
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {categoria}
              </button>
            ))}
          </div>
        </div> */}

        {/* Búsqueda por texto */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700 flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Buscar o escribir manualmente
          </h3>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Escribe el nombre del animal (ej: Canario, Hámster, Tortuga)..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={manejarEntradaManual}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            {busqueda && palabrasExcluidas.some(palabra => busqueda.toLowerCase().includes(palabra)) && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Advertencia si busca perro/gato */}
          {busqueda && palabrasExcluidas.some(palabra => busqueda.toLowerCase().includes(palabra)) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm text-red-800 font-medium">
                    Para perros y gatos, usa los tabs específicos
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    Usa "Razas de Perros" o "Razas de Gatos" para una búsqueda más completa.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Resultados de búsqueda */}
          {busqueda && !palabrasExcluidas.some(palabra => busqueda.toLowerCase().includes(palabra)) && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {animalesFiltrados.length > 0 ? (
                animalesFiltrados.map((animal) => (
                  <button
                    key={animal.id}
                    type="button"
                    onClick={() => manejarSeleccionAnimal(animal.nombre)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{animal.icono}</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">
                          {animal.nombre}
                        </div>
                        <div className="text-sm text-gray-500">
                          {animal.categoria}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-center">
                  <p className="text-gray-500 mb-2">No se encontraron resultados</p>
                  <p className="text-xs text-gray-400">
                    Presiona Enter para usar "{busqueda}" como nombre personalizado
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Lista de animales por categoría (cuando no hay búsqueda) */}
        {!busqueda && (
          <div className="space-y-4">
            {categorias.filter(cat => cat !== 'Todas').map(categoria => {
              const animalesCategoria = animalesDomesticos.filter(
                animal => animal.categoria === categoria
              );
              
              if (animalesCategoria.length === 0) return null;
              
              return (
                <div key={categoria} className="space-y-2">
                  <h3 className="font-semibold text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                    {categoria}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {animalesCategoria.map((animal) => (
                      <button
                        key={animal.id}
                        type="button"
                        onClick={() => manejarSeleccionAnimal(animal.nombre)}
                        className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 border-2 border-transparent transition-all"
                      >
                        <span className="text-3xl mb-1">{animal.icono}</span>
                        <span className="text-xs font-medium text-gray-700 text-center">
                          {animal.nombre}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Tip:</strong> Si tu mascota no aparece en la lista, puedes escribir el nombre manualmente 
              y presionar Enter. Los perros y gatos deben registrarse en sus tabs específicos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

