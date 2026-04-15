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
  // Ganso: evitar 🪿 (Unicode reciente); 🦢 suele renderizar mejor en Windows/Android viejos
  { id: 'ganso', nombre: 'Ganso', categoria: 'Ave', icono: '🦢' },
  
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
    <div className="space-y-4">
      {/* Header */}
      <div className="text-left">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
          Identifica el tipo de tu mascota
        </h2>
        <p className="text-sm text-gray-600 mt-1">Buscá, tocá una opción o escribí y confirmá con Enter.</p>
        <details className="mt-2 rounded-lg border border-indigo-200/80 bg-indigo-50/90 text-left">
          <summary className="cursor-pointer list-none p-2.5 text-xs font-medium text-indigo-950 flex items-center gap-2 [&::-webkit-details-marker]:hidden">
            <svg className="h-4 w-4 text-indigo-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            ¿Qué podés registrar acá?
          </summary>
          <p className="px-2.5 pb-2.5 text-xs text-indigo-900 leading-snug border-t border-indigo-100">
            Otros animalitos domésticos. Perro y gato van en sus pestañas propias para mejor búsqueda de raza.
          </p>
        </details>
      </div>

      {/* Raza seleccionada */}
      {razaSeleccionadaLocal && (
        <div className="rounded-xl border border-green-200 bg-green-50/90 px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-medium text-green-700">Seleccionado</p>
              <p className="text-base font-semibold text-green-900 capitalize truncate">{razaSeleccionadaLocal}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setRazaSeleccionadaLocal('');
                onRazaSeleccionada?.('');
              }}
              className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-green-800 hover:bg-green-100/80"
            >
              Cambiar
            </button>
          </div>
        </div>
      )}

      {/* Opciones de búsqueda */}
      <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
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
        <div className="space-y-2">
          <label htmlFor="busqueda-otro-animal" className="block text-sm font-medium text-gray-800">
            Buscar o escribir
          </label>
          <div className="relative">
            <input
              id="busqueda-otro-animal"
              type="text"
              autoComplete="off"
              placeholder="Ej: hurón, pato… (Enter si no aparece en lista)"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={manejarEntradaManual}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
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
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{categoria}</h3>
                  <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 sm:gap-2">
                    {animalesCategoria.map((animal) => (
                      <button
                        key={animal.id}
                        type="button"
                        onClick={() => manejarSeleccionAnimal(animal.nombre)}
                        className="flex min-h-[72px] flex-col items-center justify-center gap-0.5 rounded-lg border border-gray-100 bg-gray-50/90 px-1 py-2 text-center transition hover:border-indigo-200 hover:bg-indigo-50/80"
                      >
                        <span className="text-xl leading-none sm:text-2xl" aria-hidden>
                          {animal.icono}
                        </span>
                        <span className="line-clamp-2 text-[11px] font-medium leading-tight text-gray-800 sm:text-xs">
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

      <p className="text-xs text-gray-500 leading-snug px-0.5">
        <span className="font-medium text-gray-600">Tip:</span> si no está en la grilla, escribí el nombre y Enter.
        Perro y gato: usá sus pestañas.
      </p>
    </div>
  );
}

