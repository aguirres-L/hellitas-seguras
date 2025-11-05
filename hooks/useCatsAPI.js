import { useState, useEffect, useCallback } from 'react';

export const useCatsAPI = () => {
  // Estados principales
  const [razas, setRazas] = useState([]);
  const [imagenesRandom, setImagenesRandom] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [cargandoCarrusel, setCargandoCarrusel] = useState(false);
  const [error, setError] = useState(null);

  // Función para obtener todas las razas (para búsqueda)
  const obtenerTodasLasRazas = useCallback(async () => {
    setCargando(true);
    setError(null);
    
    try {
      const response = await fetch('https://api.thecatapi.com/v1/breeds');
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        setRazas(data);
        return data;
      } else {
        throw new Error('Error en la respuesta de la API');
      }
    } catch (err) {
      console.error('Error al obtener razas de gatos:', err);
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
      
      console.log(`🔄 Cargando ${cantidad} imágenes de gatos en ${totalLotes} lotes de ${lote}`);
      
      for (let i = 0; i < totalLotes; i++) {
        const inicioLote = i * lote;
        const finLote = Math.min(inicioLote + lote, cantidad);
        const cantidadLote = finLote - inicioLote;
        
        console.log(`📦 Lote ${i + 1}/${totalLotes}: ${cantidadLote} imágenes`);
        
        // Crear promesas para este lote
        const promesasLote = Array.from({ length: cantidadLote }, () =>
          fetch('https://api.thecatapi.com/v1/images/search')
            .then(res => {
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              return res.json();
            })
            .then(data => {
              if (Array.isArray(data) && data.length > 0 && data[0].url) {
                return {
                  url: data[0].url,
                  id: data[0].id,
                  breeds: data[0].breeds || []
                };
              } else {
                throw new Error('Error en respuesta de API');
              }
            })
            .catch(err => {
              console.error('Error en petición individual:', err);
              return null;
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
      
      console.log(`🎉 Total cargado: ${imagenes.length} imágenes de gatos`);
      setImagenesRandom(imagenes);
      return imagenes;
      
    } catch (err) {
      console.error('Error al obtener imágenes random de gatos:', err);
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
      console.error('Error al cargar más imágenes de gatos:', err);
      setError(err.message);
      return [];
    } finally {
      setCargandoCarrusel(false);
    }
  }, [obtenerImagenesRandom]);

  // Función para obtener imágenes de una raza específica
  const obtenerImagenesPorRaza = useCallback(async (razaId) => {
    setCargando(true);
    setError(null);
    
    try {
      const response = await fetch(`https://api.thecatapi.com/v1/images/search?breed_ids=${razaId}&limit=20`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        return data.map(img => ({
          url: img.url,
          id: img.id,
          breeds: img.breeds || []
        }));
      } else {
        throw new Error('Error en la respuesta de la API');
      }
    } catch (err) {
      console.error('Error al obtener imágenes por raza de gato:', err);
      setError(err.message);
      return [];
    } finally {
      setCargando(false);
    }
  }, []);

  // Función para obtener imagen aleatoria de una raza específica
  const obtenerImagenAleatoriaPorRaza = useCallback(async (razaId) => {
    setCargando(true);
    setError(null);
    
    try {
      const response = await fetch(`https://api.thecatapi.com/v1/images/search?breed_ids=${razaId}&limit=1`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0 && data[0].url) {
        return {
          url: data[0].url,
          id: data[0].id,
          breeds: data[0].breeds || []
        };
      } else {
        throw new Error('Error en la respuesta de la API');
      }
    } catch (err) {
      console.error('Error al obtener imagen aleatoria por raza de gato:', err);
      setError(err.message);
      return null;
    } finally {
      setCargando(false);
    }
  }, []);

  // Función para crear array de búsqueda (razas formateadas)
  const crearArrayBusqueda = useCallback((razasData) => {
    if (!Array.isArray(razasData) || razasData.length === 0) return [];
    
    return razasData.map(raza => ({
      id: raza.id,
      nombre: raza.name,
      tipo: 'raza',
      descripcion: raza.description || '',
      origen: raza.origin || '',
      temperamento: raza.temperament || '',
      vidaPromedio: raza.life_span || '',
      adaptabilidad: raza.adaptability || 0,
      nivelAfecto: raza.affection_level || 0,
      amigableConNinos: raza.child_friendly || 0,
      amigableConPerros: raza.dog_friendly || 0,
      nivelEnergia: raza.energy_level || 0,
      nivelAseo: raza.grooming || 0,
      problemasSalud: raza.health_issues || 0,
      inteligencia: raza.intelligence || 0,
      nivelMuda: raza.shedding_level || 0,
      necesidadesSociales: raza.social_needs || 0,
      amigableConExtraños: raza.stranger_friendly || 0,
      vocalizacion: raza.vocalisation || 0,
      hipoalergenico: raza.hypoallergenic === 1,
      wikipediaUrl: raza.wikipedia_url || '',
      referenciaImagenId: raza.reference_image_id || ''
    })).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, []);

  // Función para crear array de carrusel (imágenes + razas)
  const crearArrayCarrusel = useCallback((imagenes) => {
    if (!Array.isArray(imagenes) || imagenes.length === 0) return [];
    
    const arrayCarrusel = [];
    
    for (const imagenData of imagenes) {
      try {
        if (imagenData.url) {
          // Si la imagen tiene información de raza, usarla
          let nombreRaza = 'Gato';
          if (imagenData.breeds && imagenData.breeds.length > 0) {
            nombreRaza = imagenData.breeds[0].name;
          }
          
          arrayCarrusel.push({
            id: imagenData.id || imagenData.url,
            imagen: imagenData.url,
            raza: nombreRaza,
            nombre: nombreRaza
          });
        }
      } catch (err) {
        console.error('Error al procesar imagen de gato:', err);
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

