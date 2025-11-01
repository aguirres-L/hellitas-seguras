import { useState, useEffect, useCallback } from 'react';

export const useDogsAPI = () => {
  // Estados principales
  const [razas, setRazas] = useState({});
  const [imagenesRandom, setImagenesRandom] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [cargandoCarrusel, setCargandoCarrusel] = useState(false);
  const [error, setError] = useState(null);

  // Función para obtener todas las razas (para búsqueda)
  const obtenerTodasLasRazas = useCallback(async () => {
    setCargando(true);
    setError(null);
    
    try {
      const response = await fetch('https://dog.ceo/api/breeds/list/all');
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setRazas(data.message);
        return data.message;
      } else {
        throw new Error('Error en la respuesta de la API');
      }
    } catch (err) {
      console.error('Error al obtener razas:', err);
      setError(err.message);
      return null;
    } finally {
      setCargando(false);
    }
  }, []);

  // Función optimizada para obtener imágenes random (para carrusel)
  const obtenerImagenesRandom = useCallback(async (cantidad = 20, lote = 5) => {
    setCargandoCarrusel(true);
    setError(null);
    
    try {
      const imagenes = [];
      const totalLotes = Math.ceil(cantidad / lote);
      
      console.log(`🔄 Cargando ${cantidad} imágenes en ${totalLotes} lotes de ${lote}`);
      
      for (let i = 0; i < totalLotes; i++) {
        const inicioLote = i * lote;
        const finLote = Math.min(inicioLote + lote, cantidad);
        const cantidadLote = finLote - inicioLote;
        
        console.log(`📦 Lote ${i + 1}/${totalLotes}: ${cantidadLote} imágenes`);
        
        // Crear promesas para este lote
        const promesasLote = Array.from({ length: cantidadLote }, () =>
          fetch('https://dog.ceo/api/breeds/image/random')
            .then(res => {
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              return res.json();
            })
            .then(data => {
              if (data.status === 'success') {
                return data.message;
              } else {
                throw new Error('Error en respuesta de API');
              }
            })
            .catch(err => {
              console.error('Error en petición individual:', err);
              return null; // Retornar null para manejar errores individuales
            })
        );
        
        // Esperar a que termine este lote
        const imagenesLote = await Promise.all(promesasLote);
        
        // Filtrar nulls y agregar al array principal
        const imagenesValidas = imagenesLote.filter(img => img !== null);
        imagenes.push(...imagenesValidas);
        
        console.log(`✅ Lote ${i + 1} completado: ${imagenesValidas.length} imágenes válidas`);
        
        // Pequeña pausa entre lotes para no saturar la API
        if (i < totalLotes - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      console.log(`🎉 Total cargado: ${imagenes.length} imágenes`);
      setImagenesRandom(imagenes);
      return imagenes;
      
    } catch (err) {
      console.error('Error al obtener imágenes random:', err);
      setError(err.message);
      return [];
    } finally {
      setCargandoCarrusel(false);
    }
  }, []);

  // Función para cargar más imágenes (infinite scroll)
  const cargarMasImagenes = useCallback(async (cantidad = 10) => {
    setCargandoCarrusel(true);
    
    try {
      const nuevasImagenes = await obtenerImagenesRandom(cantidad, 3);
      setImagenesRandom(prev => [...prev, ...nuevasImagenes]);
      return nuevasImagenes;
    } catch (err) {
      console.error('Error al cargar más imágenes:', err);
      setError(err.message);
      return [];
    } finally {
      setCargandoCarrusel(false);
    }
  }, [obtenerImagenesRandom]);

  // Función para obtener imágenes de una raza específica
  const obtenerImagenesPorRaza = useCallback(async (raza) => {
    setCargando(true);
    setError(null);
    
    try {
      const response = await fetch(`https://dog.ceo/api/breed/${raza}/images`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        return data.message;
      } else {
        throw new Error('Error en la respuesta de la API');
      }
    } catch (err) {
      console.error('Error al obtener imágenes por raza:', err);
      setError(err.message);
      return [];
    } finally {
      setCargando(false);
    }
  }, []);

  // Función para obtener imagen aleatoria de una raza específica
  const obtenerImagenAleatoriaPorRaza = useCallback(async (raza) => {
    setCargando(true);
    setError(null);
    
    try {
      const response = await fetch(`https://dog.ceo/api/breed/${raza}/images/random`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        return data.message;
      } else {
        throw new Error('Error en la respuesta de la API');
      }
    } catch (err) {
      console.error('Error al obtener imagen aleatoria por raza:', err);
      setError(err.message);
      return null;
    } finally {
      setCargando(false);
    }
  }, []);

  // Función para crear array de búsqueda (razas + subrazas)
  const crearArrayBusqueda = useCallback((razasData) => {
    if (!razasData || typeof razasData !== 'object') return [];
    
    const arrayBusqueda = [];
    
    Object.entries(razasData).forEach(([raza, subrazas]) => {
      // Agregar raza principal
      arrayBusqueda.push({
        id: raza,
        nombre: raza,
        tipo: 'raza',
        subrazas: subrazas || []
      });
      
      // Agregar subrazas si existen
      if (subrazas && subrazas.length > 0) {
        subrazas.forEach(subraza => {
          arrayBusqueda.push({
            id: `${raza}-${subraza}`,
            nombre: `${subraza} ${raza}`,
            tipo: 'subraza',
            razaPadre: raza,
            subraza: subraza
          });
        });
      }
    });
    
    return arrayBusqueda.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, []);

  // Función para crear array de carrusel (imágenes + razas)
  const crearArrayCarrusel = useCallback((imagenes) => {
    if (!imagenes || imagenes.length === 0) return [];
    
    const arrayCarrusel = [];
    
    for (const imagenUrl of imagenes) {
      try {
        // Extraer raza de la URL (ej: /breeds/poodle-toy/n02113624_1077.jpg)
        const match = imagenUrl.match(/\/breeds\/([^\/]+)\//);
        if (match) {
          const raza = match[1].replace(/-/g, ' ');
          arrayCarrusel.push({
            id: imagenUrl,
            imagen: imagenUrl,
            raza: raza,
            nombre: raza.charAt(0).toUpperCase() + raza.slice(1)
          });
        }
      } catch (err) {
        console.error('Error al procesar imagen:', err);
      }
    }
    
    return arrayCarrusel;
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    obtenerTodasLasRazas();
    obtenerImagenesRandom(15, 3); // 15 imágenes en lotes de 3
  }, [obtenerTodasLasRazas, obtenerImagenesRandom]);

  return {
    // Estados
    razas,
    imagenesRandom,
    cargando,
    cargandoCarrusel,
    error,
    
    // Funciones principales
    obtenerTodasLasRazas,
    obtenerImagenesRandom,
    cargarMasImagenes,
    obtenerImagenesPorRaza,
    obtenerImagenAleatoriaPorRaza,
    
    // Funciones de utilidad
    crearArrayBusqueda,
    crearArrayCarrusel
  };
};