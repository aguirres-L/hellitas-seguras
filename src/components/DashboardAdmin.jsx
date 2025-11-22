import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from './Navbar';
import { obtenerUsuarioPorUid, getAllDataCollection } from '../data/firebase/firebase';
import { useTheme } from '../contexts/ThemeContext';
import DecoracionForm from './decoracionUi/DecoracionForm';
import { obtenerEstadoMensualidad } from '../utils/mensualidadUtils';
import AllHistorias from './uiDashboardSuperAdmin/historias_macotas/AllHistorias';
import NewHistoria from './uiDashboardSuperAdmin/historias_macotas/NewHistoria';

// Constantes financieras configurables
const VALOR_MENSUALIDAD = 3000; // CLP
const PORCENTAJE_GASTOS_OPERACIONALES = 0.30; // 30% (15% desarrollador + 15% socio)
const COSTOS_FIJOS_MENSUALES = 30000; // Hostinger + Firebase base (CLP)
const PORCENTAJE_BUFFER_MANTENIMIENTO = 0.025; // 2.5% de seguridad
const MINIMO_USUARIOS_PARA_PAGOS = 40; // Mínimo de usuarios para empezar a pagar gastos operacionales y mantenimiento

// Este componente no recibe props
const DashboardAdmin = () => {
  const navigate = useNavigate();
  const { usuario, cerrarSesion, isCargandoLogout } = useAuth();
  const { typeTheme } = useTheme();
  
  // Estados para datos administrativos
  const [datosUsuario, setDatosUsuario] = useState(null);
  const [isCargandoUsuario, setIsCargandoUsuario] = useState(false);
  const [pestañaActiva, setPestañaActiva] = useState('liquidaciones');
  const [subPestañaHistorias, setSubPestañaHistorias] = useState('ver'); // 'ver' o 'crear'
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth());
  const [añoSeleccionado, setAñoSeleccionado] = useState(new Date().getFullYear());

  // Estados para usuarios comunes con membresía
  const [usuariosComunes, setUsuariosComunes] = useState([]);
  const [isCargandoUsuariosComunes, setIsCargandoUsuariosComunes] = useState(false);
  
  // Estados para liquidaciones y estadísticas
  const [liquidacionesMensuales, setLiquidacionesMensuales] = useState([]);
  const [isCargandoLiquidaciones, setIsCargandoLiquidaciones] = useState(false);
  const [estadisticasGenerales, setEstadisticasGenerales] = useState({
    totalUsuarios: 0,
    usuariosConMembresia: 0,
    totalMascotas: 0,
    totalCitas: 0,
    ingresosTotales: 0,
    gastosOperacionales: 0,
    mantenimiento: 0,
    gananciaNeta: 0,
    alcanzoMinimoUsuarios: false
  });
  const [isCargandoEstadisticas, setIsCargandoEstadisticas] = useState(false);



  // Función para cerrar sesión
  const handleCerrarSesion = async () => {
    try {
      await cerrarSesion();
      navigate('/login');
    } catch (error) {
      alert('Error al cerrar sesión. Inténtalo de nuevo.');
    }
  };

  // Función para cargar datos del usuario
  const cargarDatosUsuario = async () => {
    if (!usuario?.uid) return;
    
    setIsCargandoUsuario(true);
    try {
      const datos = await obtenerUsuarioPorUid(usuario.uid);
      setDatosUsuario(datos);
    } catch (error) {
      console.error("Error al cargar datos del usuario:", error);
    } finally {
      setIsCargandoUsuario(false);
    }
  };

  // Función para cargar usuarios comunes con membresía activa (excluyendo período gratis)
  const cargarUsuariosComunes = async () => {
    setIsCargandoUsuariosComunes(true);
    try {
      const todosUsuarios = await getAllDataCollection('usuarios');
      // Filtrar usuarios comunes (no superAdmin, no admin, no profesional)
      const usuariosFiltrados = todosUsuarios.filter(usuario => 
        usuario.rol !== 'superAdmin' && 
        usuario.rol !== 'admin' && 
        usuario.rol !== 'profesional'
      );
      
      // Aplicar sistema de mensualidades a cada usuario
      const usuariosConMensualidades = usuariosFiltrados.map(usuario => {
        const estadoMensualidad = obtenerEstadoMensualidad(usuario);
        return {
          ...usuario,
          estadoMensualidad: estadoMensualidad.estado,
          diasRestantesMensualidad: estadoMensualidad.diasRestantes,
          fechaVencimientoMensualidad: estadoMensualidad.fechaVencimiento,
          colorEstadoMensualidad: estadoMensualidad.color,
          mensajeEstadoMensualidad: estadoMensualidad.mensaje,
          esGratis: estadoMensualidad.esGratis || false
        };
      });
      
      // Filtrar solo usuarios con membresía activa Y que NO estén en período gratis
      const usuariosConMembresiaPura = usuariosConMensualidades.filter(usuario => 
        usuario.isMember === true && 
        usuario.estadoMensualidad !== 'periodo_gracia' &&
        usuario.esGratis !== true
      );
      
      setUsuariosComunes(usuariosConMembresiaPura);
    } catch (error) {
      console.error("Error al cargar usuarios comunes:", error);
    } finally {
      setIsCargandoUsuariosComunes(false);
    }
  };

  // Función para calcular liquidaciones mensuales basadas en datos reales
  const calcularLiquidacionesMensuales = async () => {
    setIsCargandoLiquidaciones(true);
    try {
      const todosUsuarios = await getAllDataCollection('usuarios');
      
      // Filtrar usuarios comunes con membresía pura (sin período gratis)
      const usuariosFiltrados = todosUsuarios.filter(usuario => 
        usuario.rol !== 'superAdmin' && 
        usuario.rol !== 'admin' && 
        usuario.rol !== 'profesional'
      );
      
      const usuariosConMensualidades = usuariosFiltrados.map(usuario => {
        const estadoMensualidad = obtenerEstadoMensualidad(usuario);
        return {
          ...usuario,
          estadoMensualidad: estadoMensualidad.estado,
          esGratis: estadoMensualidad.esGratis || false
        };
      });

      // Obtener usuarios con membresía pura (activos y pagando)
      const usuariosConMembresiaPura = usuariosConMensualidades.filter(usuario => 
        usuario.isMember === true && 
        usuario.estadoMensualidad !== 'periodo_gracia' &&
        usuario.esGratis !== true
      );

      // Calcular liquidación del mes actual
      const ahora = new Date();
      const mesActual = ahora.getMonth();
      const añoActual = ahora.getFullYear();
      
      // Contar usuarios activos este mes
      const usuariosActivosMes = usuariosConMembresiaPura.filter(usuario => {
        const fechaCreacion = usuario.fechaCreacion || usuario.fechaRegistro;
        if (!fechaCreacion) return false;
        
        const fechaUsuario = fechaCreacion.seconds 
          ? new Date(fechaCreacion.seconds * 1000)
          : new Date(fechaCreacion);
        
        return fechaUsuario.getMonth() <= mesActual && fechaUsuario.getFullYear() <= añoActual;
      });

      // Contar usuarios nuevos este mes
      const usuariosNuevosMes = usuariosConMensualidades.filter(usuario => {
        const fechaCreacion = usuario.fechaCreacion || usuario.fechaRegistro;
        if (!fechaCreacion) return false;
        
        const fechaUsuario = fechaCreacion.seconds 
          ? new Date(fechaCreacion.seconds * 1000)
          : new Date(fechaCreacion);
        
        return fechaUsuario.getMonth() === mesActual && fechaUsuario.getFullYear() === añoActual;
      }).length;

      // Calcular ingresos totales
      const ingresosTotales = usuariosActivosMes.length * VALOR_MENSUALIDAD;
      const cantidadUsuarios = usuariosActivosMes.length;
      
      // Verificar si alcanzamos el mínimo de usuarios para empezar a pagar
      const alcanzoMinimoUsuarios = cantidadUsuarios >= MINIMO_USUARIOS_PARA_PAGOS;
      
      // Calcular gastos operacionales (30% solo si alcanzamos el mínimo)
      const gastosOperacionales = alcanzoMinimoUsuarios 
        ? Math.round(ingresosTotales * PORCENTAJE_GASTOS_OPERACIONALES)
        : 0;
      
      // Calcular mantenimiento (costos fijos + buffer solo si alcanzamos el mínimo)
      const mantenimiento = alcanzoMinimoUsuarios
        ? Math.round(COSTOS_FIJOS_MENSUALES + (ingresosTotales * PORCENTAJE_BUFFER_MANTENIMIENTO))
        : 0;
      
      // Calcular ganancia neta
      const gananciaNeta = ingresosTotales - gastosOperacionales - mantenimiento;

      // Contar citas realizadas este mes
      const citasMes = usuariosConMembresiaPura.reduce((total, usuario) => {
        if (!usuario.citas) return total;
        const citasDelMes = usuario.citas.filter(cita => {
          if (!cita.fecha) return false;
          const fechaCita = cita.fecha.seconds 
            ? new Date(cita.fecha.seconds * 1000)
            : new Date(cita.fecha);
          return fechaCita.getMonth() === mesActual && fechaCita.getFullYear() === añoActual;
        });
        return total + citasDelMes.length;
      }, 0);

      const nombresMeses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];

      const liquidacionMesActual = {
        mes: `${nombresMeses[mesActual]} ${añoActual}`,
        ingresosTotales,
        gastosOperacionales,
        mantenimiento,
        gananciaNeta,
        usuariosNuevos: usuariosNuevosMes,
        citasRealizadas: citasMes,
        usuariosActivos: usuariosActivosMes.length,
        alcanzoMinimoUsuarios,
        cantidadUsuarios
      };

      setLiquidacionesMensuales([liquidacionMesActual]);
    } catch (error) {
      console.error("Error al calcular liquidaciones:", error);
    } finally {
      setIsCargandoLiquidaciones(false);
    }
  };

  // Función para calcular estadísticas generales
  const calcularEstadisticasGenerales = async () => {
    setIsCargandoEstadisticas(true);
    try {
      const todosUsuarios = await getAllDataCollection('usuarios');
      
      // Filtrar usuarios comunes
      const usuariosFiltrados = todosUsuarios.filter(usuario => 
        usuario.rol !== 'superAdmin' && 
        usuario.rol !== 'admin' && 
        usuario.rol !== 'profesional'
      );
      
      const usuariosConMensualidades = usuariosFiltrados.map(usuario => {
        const estadoMensualidad = obtenerEstadoMensualidad(usuario);
        return {
          ...usuario,
          estadoMensualidad: estadoMensualidad.estado,
          esGratis: estadoMensualidad.esGratis || false
        };
      });

      // Usuarios con membresía pura (pagando)
      const usuariosConMembresiaPura = usuariosConMensualidades.filter(usuario => 
        usuario.isMember === true && 
        usuario.estadoMensualidad !== 'periodo_gracia' &&
        usuario.esGratis !== true
      );

      // Calcular estadísticas
      const totalUsuarios = usuariosFiltrados.length;
      const usuariosConMembresia = usuariosConMembresiaPura.length;
      
      const totalMascotas = usuariosConMembresiaPura.reduce((total, usuario) => {
        return total + (usuario.infoMascotas ? usuario.infoMascotas.length : 0);
      }, 0);

      const totalCitas = usuariosConMembresiaPura.reduce((total, usuario) => {
        return total + (usuario.citas ? usuario.citas.length : 0);
      }, 0);

      // Calcular ingresos y gastos
      const ingresosTotales = usuariosConMembresia * VALOR_MENSUALIDAD;
      
      // Verificar si alcanzamos el mínimo de usuarios para empezar a pagar
      const alcanzoMinimoUsuarios = usuariosConMembresia >= MINIMO_USUARIOS_PARA_PAGOS;
      
      // Calcular gastos operacionales (30% solo si alcanzamos el mínimo)
      const gastosOperacionales = alcanzoMinimoUsuarios
        ? Math.round(ingresosTotales * PORCENTAJE_GASTOS_OPERACIONALES)
        : 0;
      
      // Calcular mantenimiento (costos fijos + buffer solo si alcanzamos el mínimo)
      const mantenimiento = alcanzoMinimoUsuarios
        ? Math.round(COSTOS_FIJOS_MENSUALES + (ingresosTotales * PORCENTAJE_BUFFER_MANTENIMIENTO))
        : 0;
      
      // Calcular ganancia neta
      const gananciaNeta = ingresosTotales - gastosOperacionales - mantenimiento;

      setEstadisticasGenerales({
        totalUsuarios,
        usuariosConMembresia,
        totalMascotas,
        totalCitas,
        ingresosTotales,
        gastosOperacionales,
        mantenimiento,
        gananciaNeta,
        alcanzoMinimoUsuarios
      });
    } catch (error) {
      console.error("Error al calcular estadísticas:", error);
    } finally {
      setIsCargandoEstadisticas(false);
    }
  };

  // Cargar datos del usuario cuando el componente se monta
  useEffect(() => {
    cargarDatosUsuario();
  }, [usuario?.uid]);

  // Cargar datos según la pestaña activa
  useEffect(() => {
    switch (pestañaActiva) {
      case 'usuarios':
        cargarUsuariosComunes();
        break;
      case 'liquidaciones':
        calcularLiquidacionesMensuales();
        break;
      case 'estadisticas':
        calcularEstadisticasGenerales();
        break;
      default:
        break;
    }
  }, [pestañaActiva, mesSeleccionado, añoSeleccionado]);

  // Función para formatear moneda
  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(valor);
  };

  // Función para obtener el color del estado
  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'activo': return 'bg-green-100 text-green-800';
      case 'inactivo': return 'bg-red-100 text-red-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener el color del rol
  const obtenerColorRol = (rol) => {
    switch (rol) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'profesional': return 'bg-blue-100 text-blue-800';
      case 'usuario': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener el color del tipo de mensualidad
  const obtenerColorMensualidad = (tipo) => {
    switch (tipo) {
      case 'Premium': return 'bg-yellow-100 text-yellow-800';
      case 'Básica': return 'bg-blue-100 text-blue-800';
      case 'Admin': return 'bg-purple-100 text-purple-800';
      case 'Profesional': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={
      typeTheme === 'light'
        ? "bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 min-h-screen pt-16"
        : "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen pt-16"
    }>
      {/* Fondo decorativo */}
      <DecoracionForm isFullScreen={true} />


      {/* Navbar modular */}
      <Navbar 
        tipo="dashboard"
        onCerrarSesion={handleCerrarSesion}
        isCargandoLogout={isCargandoLogout}
      />

      {/* Main Content */}
      <div className="relative container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header del Dashboard */}
        <div className="text-center mt-4 mb-8">
          <h2 className={typeTheme === 'light'
            ? "text-2xl sm:text-3xl font-bold text-gray-900 mb-2"
            : "text-2xl sm:text-3xl font-bold text-white mb-2"
          }>
            Panel Administrativo - Huellitas Seguras
          </h2>
          <p className={typeTheme === 'light' ? "text-sm text-gray-600 mb-4" : 'text-sm text-white mb-4'}>
            Gestión administrativa, liquidaciones y control de usuarios
          </p>
        </div>

        {/* Pestañas de navegación */}
        <div className={typeTheme === 'light'
          ? "bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8"
          : "bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8"
        }>
          <div className="border-b border-gray-200 mb-6">
            <div className="flex space-x-4 overflow-x-auto">
              <button 
                onClick={() => setPestañaActiva('liquidaciones')}
                className={`pb-2 font-medium transition-colors duration-200 whitespace-nowrap ${
                  pestañaActiva === 'liquidaciones' 
                    ? 'border-b-2 border-purple-500 text-purple-600' 
                    : typeTheme === 'light'
                      ? 'text-gray-600 hover:text-gray-800 hover:border-b-2 hover:border-gray-300'
                      : 'text-gray-400 hover:text-gray-300 hover:border-b-2 hover:border-gray-600'
                }`}
              >
                Liquidaciones Mensuales
              </button>

              <button 
                onClick={() => setPestañaActiva('historyMascotas')}
                className={`pb-2 font-medium transition-colors duration-200 whitespace-nowrap ${
                  pestañaActiva === 'historyMascotas' 
                    ? 'border-b-2 border-purple-500 text-purple-600' 
                    : typeTheme === 'light'
                      ? 'text-gray-600 hover:text-gray-800 hover:border-b-2 hover:border-gray-300'
                      : 'text-gray-400 hover:text-gray-300 hover:border-b-2 hover:border-gray-600'
                }`}
              >
                Historia de Mascotas
              </button>

              <button 
                onClick={() => setPestañaActiva('usuarios')}
                className={`pb-2 font-medium transition-colors duration-200 whitespace-nowrap ${
                  pestañaActiva === 'usuarios' 
                    ? 'border-b-2 border-purple-500 text-purple-600' 
                    : typeTheme === 'light'
                      ? 'text-gray-600 hover:text-gray-800 hover:border-b-2 hover:border-gray-300'
                      : 'text-gray-400 hover:text-gray-300 hover:border-b-2 hover:border-gray-600'
                }`}
              >
                Gestión de Usuarios
              </button>
              <button 
                onClick={() => setPestañaActiva('estadisticas')}
                className={`pb-2 font-medium transition-colors duration-200 whitespace-nowrap ${
                  pestañaActiva === 'estadisticas' 
                    ? 'border-b-2 border-purple-500 text-purple-600' 
                    : typeTheme === 'light'
                      ? 'text-gray-600 hover:text-gray-800 hover:border-b-2 hover:border-gray-300'
                      : 'text-gray-400 hover:text-gray-300 hover:border-b-2 hover:border-gray-600'
                }`}
              >
                Estadísticas Generales
              </button>
            </div>
          </div>

          {/* Contenido de Liquidaciones Mensuales */}
          {pestañaActiva === 'liquidaciones' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Liquidaciones Mensuales</h3>
              
              {isCargandoLiquidaciones ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  <p className="mt-2 text-gray-600">Calculando liquidaciones...</p>
                </div>
              ) : liquidacionesMensuales.length > 0 ? (
                <>
                  {/* Tarjetas de resumen */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm">Ingresos Totales</p>
                          <p className="text-2xl font-bold">{formatearMoneda(liquidacionesMensuales[0]?.ingresosTotales || 0)}</p>
                          <p className="text-green-100 text-xs mt-1">
                            {liquidacionesMensuales[0]?.usuariosActivos || 0} usuarios activos
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className={`rounded-xl p-6 text-white ${
                      liquidacionesMensuales[0]?.alcanzoMinimoUsuarios 
                        ? 'bg-gradient-to-r from-red-500 to-red-600' 
                        : 'bg-gradient-to-r from-orange-500 to-orange-600'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-red-100 text-sm">Gastos Operacionales</p>
                          {liquidacionesMensuales[0]?.alcanzoMinimoUsuarios ? (
                            <>
                              <p className="text-2xl font-bold">
                                {formatearMoneda(liquidacionesMensuales[0]?.gastosOperacionales || 0)}
                              </p>
                              <p className="text-red-100 text-xs mt-1">
                                {Math.round(PORCENTAJE_GASTOS_OPERACIONALES * 100)}% de ingresos
                              </p>
                            </>
                          ) : (
                            <div className="mt-2 p-2 bg-orange-400/30 rounded text-xs">
                              <p className="font-semibold">⚠️ Cubierto por creadores</p>
                              <p className="text-orange-50">Se requiere mínimo {MINIMO_USUARIOS_PARA_PAGOS} usuarios</p>
                              <p className="text-orange-50 mt-1">Actual: {liquidacionesMensuales[0]?.cantidadUsuarios || 0} usuarios</p>
                            </div>
                          )}
                        </div>
                        <div className="w-12 h-12 bg-red-400 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className={`rounded-xl p-6 text-white ${
                      liquidacionesMensuales[0]?.alcanzoMinimoUsuarios 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                        : 'bg-gradient-to-r from-orange-500 to-orange-600'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-blue-100 text-sm">Mantenimiento</p>
                          {liquidacionesMensuales[0]?.alcanzoMinimoUsuarios ? (
                            <>
                              <p className="text-2xl font-bold">
                                {formatearMoneda(liquidacionesMensuales[0]?.mantenimiento || 0)}
                              </p>
                              <p className="text-blue-100 text-xs mt-1">Infraestructura</p>
                            </>
                          ) : (
                            <div className="mt-2 p-2 bg-orange-400/30 rounded text-xs">
                              <p className="font-semibold">⚠️ Cubierto por creadores</p>
                              <p className="text-orange-50">Hostinger + Firebase</p>
                              <p className="text-orange-50 mt-1">Con mucho esfuerzo 💪</p>
                            </div>
                          )}
                        </div>
                        <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center">
                          <svg className="w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm">Ganancia Neta</p>
                          <p className="text-2xl font-bold">{formatearMoneda(liquidacionesMensuales[0]?.gananciaNeta || 0)}</p>
                          <p className="text-purple-100 text-xs mt-1">Para rescatistas</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-400 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No hay datos de liquidaciones disponibles</p>
                </div>
              )}

              {/* Tabla de liquidaciones */}
              {liquidacionesMensuales.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900">Detalle Mensual</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mes</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingresos</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gastos</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mantenimiento</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ganancia</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuarios Activos</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuarios Nuevos</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Citas</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {liquidacionesMensuales.map((liquidacion, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {liquidacion.mes}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                              {formatearMoneda(liquidacion.ingresosTotales)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                              {formatearMoneda(liquidacion.gastosOperacionales)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                              {formatearMoneda(liquidacion.mantenimiento)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-medium">
                              {formatearMoneda(liquidacion.gananciaNeta)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {liquidacion.usuariosActivos || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {liquidacion.usuariosNuevos || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {liquidacion.citasRealizadas || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Contenido de Gestión de Usuarios */}
          {pestañaActiva === 'usuarios' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Gestión de Usuarios</h3>
              
              {/* Filtros */}
              <div className="flex gap-4 mb-6">
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">Todos los roles</option>
                  <option value="usuario">Usuario</option>
                  <option value="admin">Admin</option>
                  <option value="profesional">Profesional</option>
                </select>
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">Todos los estados</option>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">Todas las mensualidades</option>
                  <option value="si">Con mensualidad</option>
                  <option value="no">Sin mensualidad</option>
                </select>
              </div>

              {/* Tabla de usuarios */}
              {isCargandoUsuariosComunes ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  <p className="mt-2 text-gray-600">Cargando usuarios...</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900">Lista de Usuarios con Membresía</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mensualidad</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registro</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actividad</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {usuariosComunes.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                              No hay usuarios con membresía activa
                            </td>
                          </tr>
                        ) : (
                          usuariosComunes.map((usuario) => (
                            <tr key={usuario.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                      <span className="text-sm font-medium text-purple-600">
                                        {usuario.displayName ? usuario.displayName.charAt(0) : usuario.email.charAt(0)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {usuario.displayName || usuario.nombre || 'Sin nombre'}
                                    </div>
                                    <div className="text-sm text-gray-500">{usuario.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${obtenerColorRol(usuario.rol)}`}>
                                  {usuario.rol}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  usuario.isMember ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {usuario.isMember ? 'Activo' : 'Inactivo'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {usuario.tipoMensualidad ? (
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${obtenerColorMensualidad(usuario.tipoMensualidad)}`}>
                                    {usuario.tipoMensualidad}
                                  </span>
                                ) : (
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${usuario.colorEstadoMensualidad || 'bg-gray-100 text-gray-800'}`}>
                                    {usuario.mensajeEstadoMensualidad || 'Sin mensualidad'}
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {usuario.fechaCreacion ? new Date(usuario.fechaCreacion.seconds * 1000).toLocaleDateString('es-CL') : 'N/A'}
                              </td>
                              <td className="px-6 py-4  whitespace-nowrap text-sm text-gray-900">
                                <div   className="flex flex-row gap-2">
                                  <div>Mascotas: {usuario.infoMascotas ? usuario.infoMascotas.length : 0}</div>
                                  <div>Citas: {usuario.citas ? usuario.citas.length : 0}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                               
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Contenido de Estadísticas Generales */}
          {pestañaActiva === 'estadisticas' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Estadísticas Generales</h3>
              
              {isCargandoEstadisticas ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  <p className="mt-2 text-gray-600">Calculando estadísticas...</p>
                </div>
              ) : (
                <>
                  {/* Tarjetas de estadísticas financieras */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm">Ingresos Totales</p>
                          <p className="text-2xl font-bold">{formatearMoneda(estadisticasGenerales.ingresosTotales)}</p>
                          <p className="text-green-100 text-xs mt-1">
                            {estadisticasGenerales.usuariosConMembresia} usuarios pagando
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className={`rounded-xl p-6 text-white shadow-lg ${
                      estadisticasGenerales.alcanzoMinimoUsuarios 
                        ? 'bg-gradient-to-r from-red-500 to-red-600' 
                        : 'bg-gradient-to-r from-orange-500 to-orange-600'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-red-100 text-sm">Gastos Operacionales</p>
                          {estadisticasGenerales.alcanzoMinimoUsuarios ? (
                            <>
                              <p className="text-2xl font-bold">
                                {formatearMoneda(estadisticasGenerales.gastosOperacionales)}
                              </p>
                              <p className="text-red-100 text-xs mt-1">30% de ingresos</p>
                            </>
                          ) : (
                            <div className="mt-2 p-2 bg-orange-400/30 rounded text-xs">
                              <p className="font-semibold">⚠️ Cubierto por creadores</p>
                              <p className="text-orange-50">Se requiere mínimo {MINIMO_USUARIOS_PARA_PAGOS} usuarios</p>
                              <p className="text-orange-50 mt-1">Actual: {estadisticasGenerales.usuariosConMembresia || 0} usuarios</p>
                            </div>
                          )}
                        </div>
                        <div className="w-12 h-12 bg-red-400 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className={`rounded-xl p-6 text-white shadow-lg ${
                      estadisticasGenerales.alcanzoMinimoUsuarios 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                        : 'bg-gradient-to-r from-orange-500 to-orange-600'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-blue-100 text-sm">Mantenimiento</p>
                          {estadisticasGenerales.alcanzoMinimoUsuarios ? (
                            <>
                              <p className="text-2xl font-bold">
                                {formatearMoneda(estadisticasGenerales.mantenimiento)}
                              </p>
                              <p className="text-blue-100 text-xs mt-1">Infraestructura</p>
                            </>
                          ) : (
                            <div className="mt-2 p-2 bg-orange-400/30 rounded text-xs">
                              <p className="font-semibold">⚠️ Cubierto por creadores</p>
                              <p className="text-orange-50">Hostinger + Firebase</p>
                              <p className="text-orange-50 mt-1">Con mucho esfuerzo 💪</p>
                            </div>
                          )}
                        </div>
                        <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm">Ganancia Neta</p>
                          <p className="text-2xl font-bold">{formatearMoneda(estadisticasGenerales.gananciaNeta)}</p>
                          <p className="text-purple-100 text-xs mt-1">Para rescatistas</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-400 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tarjetas de estadísticas de usuarios */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-500 text-sm">Total Usuarios</p>
                          <p className="text-3xl font-bold text-gray-900">{estadisticasGenerales.totalUsuarios}</p>
                          <p className="text-gray-600 text-xs mt-1">
                            {estadisticasGenerales.usuariosConMembresia} con membresía activa
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-500 text-sm">Mascotas Registradas</p>
                          <p className="text-3xl font-bold text-gray-900">{estadisticasGenerales.totalMascotas}</p>
                          <p className="text-gray-600 text-xs mt-1">De usuarios con membresía</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-500 text-sm">Citas Realizadas</p>
                          <p className="text-3xl font-bold text-gray-900">{estadisticasGenerales.totalCitas}</p>
                          <p className="text-gray-600 text-xs mt-1">Total de citas registradas</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Resumen financiero */}
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Resumen Financiero</h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Distribución de Ingresos</p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">
                              Gastos Operacionales (30%)
                              {!estadisticasGenerales.alcanzoMinimoUsuarios && (
                                <span className="ml-2 text-xs text-orange-600">⚠️ Cubierto</span>
                              )}
                            </span>
                            <span className={`text-sm font-semibold ${
                              estadisticasGenerales.alcanzoMinimoUsuarios ? 'text-red-600' : 'text-orange-600'
                            }`}>
                              {estadisticasGenerales.alcanzoMinimoUsuarios 
                                ? formatearMoneda(estadisticasGenerales.gastosOperacionales)
                                : 'Cubierto por creadores'
                              }
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">
                              Mantenimiento
                              {!estadisticasGenerales.alcanzoMinimoUsuarios && (
                                <span className="ml-2 text-xs text-orange-600">⚠️ Cubierto</span>
                              )}
                            </span>
                            <span className={`text-sm font-semibold ${
                              estadisticasGenerales.alcanzoMinimoUsuarios ? 'text-blue-600' : 'text-orange-600'
                            }`}>
                              {estadisticasGenerales.alcanzoMinimoUsuarios 
                                ? formatearMoneda(estadisticasGenerales.mantenimiento)
                                : 'Cubierto por creadores'
                              }
                            </span>
                          </div>
                          {!estadisticasGenerales.alcanzoMinimoUsuarios && (
                            <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                              <p className="text-xs text-orange-800 font-semibold mb-1">
                                💪 Los creadores están cubriendo estos gastos
                              </p>
                              <p className="text-xs text-orange-700">
                                Se requiere mínimo {MINIMO_USUARIOS_PARA_PAGOS} usuarios con membresía activa para que el sistema sea autosostenible.
                              </p>
                            </div>
                          )}
                          <div className="flex justify-between items-center pt-2 border-t">
                            <span className="text-sm font-semibold text-gray-900">Ganancia Neta (Rescatistas)</span>
                            <span className="text-sm font-bold text-purple-600">
                              {formatearMoneda(estadisticasGenerales.gananciaNeta)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Información de Membresías</p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">Valor por membresía</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {formatearMoneda(VALOR_MENSUALIDAD)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">Usuarios con membresía activa</span>
                            <span className="text-sm font-semibold text-green-600">
                              {estadisticasGenerales.usuariosConMembresia}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t">
                            <span className="text-sm font-semibold text-gray-900">Ingresos Totales</span>
                            <span className="text-sm font-bold text-green-600">
                              {formatearMoneda(estadisticasGenerales.ingresosTotales)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Contenido de Historia de Mascotas */}
          {pestañaActiva === 'historyMascotas' && (
            <div>
              {/* Sub-pestañas para historias */}
              <div className="mb-6 border-b border-gray-200">
                <div className="flex space-x-4">
                  <button
                    onClick={() => setSubPestañaHistorias('ver')}
                    className={`pb-2 font-medium transition-colors duration-200 whitespace-nowrap ${
                      subPestañaHistorias === 'ver'
                        ? 'border-b-2 border-purple-500 text-purple-600'
                        : typeTheme === 'light'
                          ? 'text-gray-600 hover:text-gray-800 hover:border-b-2 hover:border-gray-300'
                          : 'text-gray-400 hover:text-gray-300 hover:border-b-2 hover:border-gray-600'
                    }`}
                  >
                    Ver Todas las Historias
                  </button>
                  <button
                    onClick={() => setSubPestañaHistorias('crear')}
                    className={`pb-2 font-medium transition-colors duration-200 whitespace-nowrap ${
                      subPestañaHistorias === 'crear'
                        ? 'border-b-2 border-purple-500 text-purple-600'
                        : typeTheme === 'light'
                          ? 'text-gray-600 hover:text-gray-800 hover:border-b-2 hover:border-gray-300'
                          : 'text-gray-400 hover:text-gray-300 hover:border-b-2 hover:border-gray-600'
                    }`}
                  >
                    Crear Nueva Historia
                  </button>
                </div>
              </div>

              {/* Contenido según sub-pestaña */}
              {subPestañaHistorias === 'ver' ? (
                <AllHistorias />
              ) : (
                <NewHistoria 
                  onHistoriaCreada={() => setSubPestañaHistorias('ver')}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
