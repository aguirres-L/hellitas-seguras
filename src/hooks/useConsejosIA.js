import { useState, useEffect } from 'react';
import { aiService } from '../services/aiService';
import { obtenerPromptPorDefecto } from '../prompts/promptManager';

export const useConsejosIA = (raza, userId = null, mascotaId = null, mascota = null) => {
  const [consejos, setConsejos] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [fuente, setFuente] = useState(null); // 'huggingface', 'cohere', 'predefinidos'
  const [tematica, setTematica] = useState(null);
  const [fechaCreacion, setFechaCreacion] = useState(null);
  const [peticionesRestantes, setPeticionesRestantes] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [estadisticasTematicas, setEstadisticasTematicas] = useState(null);
  const [puedeGenerarConsejos, setPuedeGenerarConsejos] = useState(true);
  const [tipoConsejoSeleccionado, setTipoConsejoSeleccionado] = useState(null);
  const [promptSeleccionado, setPromptSeleccionado] = useState(null);

  // Actualizar peticiones restantes y historial cuando cambien los parámetros
  useEffect(() => {
    if (userId && mascotaId) {
      const restantes = aiService.obtenerPeticionesRestantes(userId, mascotaId);
      setPeticionesRestantes(restantes);
      
      // Verificar si puede generar más consejos
      const estadoFreno = aiService.verificarFrenoPeticiones(userId, mascotaId);
      setPuedeGenerarConsejos(estadoFreno.puedeHacerPeticion);
      
      // Cargar historial de consejos y estadísticas
      const historialConsejos = aiService.obtenerHistorialConsejos(userId, mascotaId);
      setHistorial(historialConsejos);
      
      const statsTematicas = aiService.obtenerEstadisticasTematicas(userId, mascotaId);
      setEstadisticasTematicas(statsTematicas);
    } else {
      // Para usuarios anónimos, siempre permitir
      setPuedeGenerarConsejos(true);
    }
  }, [userId, mascotaId]);

  const generarConsejos = async (tipoConsejo = null) => {
    if (!raza) return;
    
    const tipoSeleccionado = tipoConsejo || tipoConsejoSeleccionado;
    if (!tipoSeleccionado) {
      setError('Por favor selecciona un tipo de consejo primero');
      return;
    }
    
    // Asegurar que tipoSeleccionado sea un string válido
    if (typeof tipoSeleccionado !== 'string') {
      console.warn('Tipo de consejo no es string:', tipoSeleccionado, 'Tipo:', typeof tipoSeleccionado);
      setError('Tipo de consejo no válido');
      return;
    }

    // Verificar límite antes de hacer la petición
    if (userId && mascotaId) {
      const estadoFreno = aiService.verificarFrenoPeticiones(userId, mascotaId);
      if (!estadoFreno.puedeHacerPeticion) {
        setError(estadoFreno.mensaje);
        setPuedeGenerarConsejos(false);
        return;
      }
    }

    setCargando(true);
    setError(null);
    setFuente(null);

    try {
      // Generar prompt personalizado si tenemos datos de la mascota
      let promptPersonalizado = null;
      if (mascota && tipoSeleccionado) {
        try {
          // Usar el prompt seleccionado o el por defecto
          if (promptSeleccionado) {
            promptPersonalizado = promptSeleccionado;
          } else {
            promptPersonalizado = obtenerPromptPorDefecto(tipoSeleccionado, mascota);
          }
        } catch (err) {
          console.warn('Error generando prompt personalizado:', err);
        }
      }

      const resultado = await aiService.obtenerConsejosRaza(raza, false, userId, mascotaId, tipoSeleccionado, promptPersonalizado);
      
      // Manejar tanto formato nuevo (objeto) como formato antiguo (string)
      if (typeof resultado === 'object' && resultado.consejos) {
        setConsejos(resultado.consejos);
        setTematica(resultado.tematica);
        setFuente(resultado.fuente);
        setFechaCreacion(resultado.fechaCreacion || new Date().toISOString());
        
        // Si la IA no está disponible, no consumir petición mensual
        if (resultado.fuente === 'ia_no_disponible') {
          // No actualizar peticiones restantes ni historial
          return;
        }
      } else {
        // Formato antiguo (string directo)
        setConsejos(resultado);
        setTematica(tipoSeleccionado);
        setFuente('predefinidos');
        setFechaCreacion(new Date().toISOString());
      }
      
      // Actualizar peticiones restantes y historial
      if (userId && mascotaId) {
        const restantes = aiService.obtenerPeticionesRestantes(userId, mascotaId);
        setPeticionesRestantes(restantes);
        
        // Verificar si puede generar más consejos después de esta petición
        const estadoFreno = aiService.verificarFrenoPeticiones(userId, mascotaId);
        setPuedeGenerarConsejos(estadoFreno.puedeHacerPeticion);
        
        const historialConsejos = aiService.obtenerHistorialConsejos(userId, mascotaId);
        setHistorial(historialConsejos);
        
        const statsTematicas = aiService.obtenerEstadisticasTematicas(userId, mascotaId);
        setEstadisticasTematicas(statsTematicas);
      }
    } catch (err) {
      console.error('Error generando consejos:', err);
      setError(err.message || 'No se pudieron generar consejos en este momento');
      setConsejos(aiService.obtenerConsejosPredefinidos(raza));
      setTematica(tipoSeleccionado || 'General');
      setFuente('predefinidos');
    } finally {
      setCargando(false);
    }
  };

  const limpiarConsejos = () => {
    setConsejos('');
    setError(null);
    setFuente(null);
    setTematica(null);
    setFechaCreacion(null);
  };

  const cargarConsejoDelHistorial = (historialId) => {
    const consejo = aiService.obtenerConsejoDelHistorial(historialId);
    if (consejo) {
      setConsejos(consejo.consejos);
      setTematica(consejo.tematica);
      setFuente(consejo.fuente);
      setFechaCreacion(consejo.fechaCreacion);
      setError(null);
    }
  };

  const limpiarHistorial = () => {
    if (userId && mascotaId) {
      aiService.limpiarHistorialUsuario(userId, mascotaId);
      setHistorial([]);
      setEstadisticasTematicas({ total: 0, tematicas: [], disponibles: 8 });
    }
  };

  // Función de debug para verificar límites (solo en desarrollo)
  const debugLimites = () => {
    if (userId && mascotaId) {
      aiService.debugLimitesMensuales(userId, mascotaId);
    }
  };

  // Función de test para validar APIs de IA
  const testAPIs = async () => {
    const resultado = await aiService.testAPIs();
    return resultado;
  };

  // Función para probar un modelo específico
  const testModeloEspecifico = async (modelo) => {
    const token = API_KEYS.HUGGING_FACE_TOKEN || API_KEYS.HUGGING_FACE_TOKEN_FALLBACK;
    if (!token) {
      return { success: false, error: 'No hay token disponible' };
    }
    
    const resultado = await aiService.testModeloEspecifico(modelo, token);
    return resultado;
  };

  const regenerarConsejos = async () => {
    if (!raza) return;

    const tipoSeleccionado = tipoConsejoSeleccionado;
    if (!tipoSeleccionado) {
      setError('Por favor selecciona un tipo de consejo primero');
      return;
    }
    
    // Asegurar que tipoSeleccionado sea un string válido
    if (typeof tipoSeleccionado !== 'string') {
      console.warn('Tipo de consejo no es string:', tipoSeleccionado, 'Tipo:', typeof tipoSeleccionado);
      setError('Tipo de consejo no válido');
      return;
    }

    // Verificar límite antes de hacer la petición
    if (userId && mascotaId) {
      const estadoFreno = aiService.verificarFrenoPeticiones(userId, mascotaId);
      if (!estadoFreno.puedeHacerPeticion) {
        setError(estadoFreno.mensaje);
        setPuedeGenerarConsejos(false);
        return;
      }
    }

    setCargando(true);
    setError(null);
    setFuente(null);

    try {
      // Generar prompt personalizado si tenemos datos de la mascota
      let promptPersonalizado = null;
      if (mascota && tipoSeleccionado) {
        try {
          // Usar el prompt seleccionado o el por defecto
          if (promptSeleccionado) {
            promptPersonalizado = promptSeleccionado;
          } else {
            promptPersonalizado = obtenerPromptPorDefecto(tipoSeleccionado, mascota);
          }
        } catch (err) {
          console.warn('Error generando prompt personalizado:', err);
        }
      }

      const resultado = await aiService.regenerarConsejos(raza, userId, mascotaId, tipoSeleccionado, promptPersonalizado);
      
      // Manejar tanto formato nuevo (objeto) como formato antiguo (string)
      if (typeof resultado === 'object' && resultado.consejos) {
        setConsejos(resultado.consejos);
        setTematica(resultado.tematica);
        setFuente(resultado.fuente);
        setFechaCreacion(resultado.fechaCreacion || new Date().toISOString());
        
        // Si la IA no está disponible, no consumir petición mensual
        if (resultado.fuente === 'ia_no_disponible') {
          // No actualizar peticiones restantes ni historial
          return;
        }
      } else {
        // Formato antiguo (string directo)
        setConsejos(resultado);
        setTematica(tipoSeleccionado);
        setFuente('predefinidos');
        setFechaCreacion(new Date().toISOString());
      }
      
      // Actualizar peticiones restantes y historial
      if (userId && mascotaId) {
        const restantes = aiService.obtenerPeticionesRestantes(userId, mascotaId);
        setPeticionesRestantes(restantes);
        
        // Verificar si puede generar más consejos después de esta petición
        const estadoFreno = aiService.verificarFrenoPeticiones(userId, mascotaId);
        setPuedeGenerarConsejos(estadoFreno.puedeHacerPeticion);
        
        const historialConsejos = aiService.obtenerHistorialConsejos(userId, mascotaId);
        setHistorial(historialConsejos);
        
        const statsTematicas = aiService.obtenerEstadisticasTematicas(userId, mascotaId);
        setEstadisticasTematicas(statsTematicas);
      }
    } catch (err) {
      console.error('Error regenerando consejos:', err);
      setError(err.message || 'No se pudieron regenerar consejos en este momento');
      setConsejos(aiService.obtenerConsejosPredefinidos(raza));
      setTematica(tipoSeleccionado || 'General');
      setFuente('predefinidos');
    } finally {
      setCargando(false);
    }
  };

  return {
    consejos,
    cargando,
    error,
    fuente,
    tematica,
    fechaCreacion,
    peticionesRestantes,
    historial,
    estadisticasTematicas,
    puedeGenerarConsejos,
    tipoConsejoSeleccionado,
    setTipoConsejoSeleccionado,
    promptSeleccionado,
    setPromptSeleccionado,
    generarConsejos,
    limpiarConsejos,
    regenerarConsejos,
    cargarConsejoDelHistorial,
    limpiarHistorial,
    debugLimites,
    testAPIs,
    testModeloEspecifico
  };
};
