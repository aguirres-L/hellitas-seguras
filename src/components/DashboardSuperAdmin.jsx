import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from './Navbar';
import { 
  getAllDataCollection, 
  obtenerProfesionalesPorTipo,
  obtenerUsuarioPorUid 
} from '../data/firebase/firebase';
import { useTheme } from '../contexts/ThemeContext';
import ModalDetailUserComun from './uiDashboardSuperAdmin/ModalDetailUserComun';
import { mensualidadController } from '../controllers/mensualidadController';
import { obtenerEstadoMensualidad, renovarMensualidad } from '../utils/mensualidadUtils';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import DecoracionForm from './decoracionUi/DecoracionForm';
import GraficoComponente from './uiDashboardSuperAdmin/GraficoComponente';
import { getAllChapitas } from '../data/hook/getAllChapitas';

// Este componente no recibe props
const DashboardSuperAdmin = () => {
  const navigate = useNavigate();
  const { usuario, cerrarSesion, isCargandoLogout } = useAuth();
  const { typeTheme } = useTheme();
  
  // Estados para datos del super admin
  const [datosUsuario, setDatosUsuario] = useState(null);
  const [isCargandoUsuario, setIsCargandoUsuario] = useState(false);
  const [pestañaActiva, setPestañaActiva] = useState('estadisticas');
  
  // Estados para usuarios comunes
  const [usuariosComunes, setUsuariosComunes] = useState([]);
  const [isCargandoUsuariosComunes, setIsCargandoUsuariosComunes] = useState(false);
  
  // Estados para profesionales
  const [profesionales, setProfesionales] = useState([]);
  const [isCargandoProfesionales, setIsCargandoProfesionales] = useState(false);
  
  // Estados para administradores
  const [administradores, setAdministradores] = useState([]);
  const [isCargandoAdministradores, setIsCargandoAdministradores] = useState(false);
  

  // Estados para chapitas
  const [chapitas, setChapitas] = useState([ ]);
  const [isCargandoChapitas, setIsCargandoChapitas] = useState(false);


  // Función para cargar chapitas
  const cargarChapitas = async () => {
    setIsCargandoChapitas(true);
    try {
      const chapitas = await getAllChapitas();
      setChapitas(chapitas);
      console.log(chapitas,'chapitas');
    } catch (error) {
      console.error('Error al cargar chapitas:', error);
    } finally {
      setIsCargandoChapitas(false);
    }

  };

  useEffect(() => {
    cargarChapitas();

    
  }, [usuario?.uid]);


  // Estados para estadísticas
  const [estadisticas, setEstadisticas] = useState({
    totalUsuarios: 0,
    totalProfesionales: 0,
    totalAdministradores: 0,
    totalMascotas: 0,
    totalCitas: 0,
    usuariosActivos: 0,
    profesionalesActivos: 0
  });
  const [isCargandoEstadisticas, setIsCargandoEstadisticas] = useState(false);

  // Datos para gráfico de distribución (Usuarios comunes vs Profesionales)
  const dataDistribucion = useMemo(() => [
    { name: 'Usuarios comunes', value: estadisticas.totalUsuarios },
    { name: 'Profesionales', value: estadisticas.totalProfesionales }
  ], [estadisticas.totalUsuarios, estadisticas.totalProfesionales]);


  const dataDistribucionChapitas = useMemo(() => {
    const estados = ['pendiente', 'fabricacion', 'en viaje', 'entregado'];
    
    return estados.map(estado => {
      const chapitasDelEstado = chapitas.filter(chapita => chapita.estado === estado);
      
      return {
        name: estado,
        value: chapitasDelEstado.length,
        chapitas: chapitasDelEstado.map(chapita => ({
          id: chapita.id,
          usuarioNombre: chapita.usuarioNombre || 'Sin nombre',
          usuarioEmail: chapita.usuarioEmail || 'Sin email',
          mascotaNombre: chapita.mascotaNombre || 'Sin nombre',
          monto: chapita.monto || 0,
          fechaPago: chapita.fechaPago,
          diasDesdePago: chapita.fechaPago ? 
            Math.floor((new Date() - new Date(chapita.fechaPago.seconds * 1000)) / (1000 * 60 * 60 * 24)) : 0
        }))
      };
    });
  }, [chapitas]);      


  const COLORES_DISTRIBUCION = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981'];

  // Estados para el modal de detalles del usuario
  const [isModalAbierto, setIsModalAbierto] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  // Estados para el sistema de mensualidades
  const [alertasMensualidades, setAlertasMensualidades] = useState({
    mensualidadesVencidas: { cantidad: 0, usuarios: [] },
    mensualidadesProximasVencer: { cantidad: 0, usuarios: [] }
  });
  const [isVerificandoMensualidades, setIsVerificandoMensualidades] = useState(false);
  const [ultimaVerificacion, setUltimaVerificacion] = useState(null);

  // Función para cerrar sesión
  const handleCerrarSesion = async () => {
    try {
      await cerrarSesion();
      navigate('/login');
    } catch (error) {
      alert('Error al cerrar sesión. Inténtalo de nuevo.');
    }
  };

  // Función para cargar datos del super admin
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

  // Función para cargar usuarios comunes (excluyendo superAdmin)
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
          mensajeEstadoMensualidad: estadoMensualidad.mensaje
        };
      });
      
      setUsuariosComunes(usuariosConMensualidades);
    } catch (error) {
      console.error("Error al cargar usuarios comunes:", error);
    } finally {
      setIsCargandoUsuariosComunes(false);
    }
  };

  // Función para cargar profesionales
  const cargarProfesionales = async () => {
    setIsCargandoProfesionales(true);
    try {
      const todosProfesionales = await getAllDataCollection('profesionales');
      setProfesionales(todosProfesionales);
    } catch (error) {
      console.error("Error al cargar profesionales:", error);
    } finally {
      setIsCargandoProfesionales(false);
    }
  };

  // Función para cargar administradores
  const cargarAdministradores = async () => {
    setIsCargandoAdministradores(true);
    try {
      const todosUsuarios = await getAllDataCollection('usuarios');
      // Filtrar solo administradores
      const adminsFiltrados = todosUsuarios.filter(usuario => usuario.rol === 'admin');
      setAdministradores(adminsFiltrados);
    } catch (error) {
      console.error("Error al cargar administradores:", error);
    } finally {
      setIsCargandoAdministradores(false);
    }
  };

  // Función para cargar estadísticas generales
  const cargarEstadisticas = async () => {
    setIsCargandoEstadisticas(true);
    try {
      const [usuariosData, profesionalesData] = await Promise.all([
        getAllDataCollection('usuarios'),
        getAllDataCollection('profesionales')
      ]);

      // Calcular estadísticas
      const usuariosComunes = usuariosData.filter(u => 
        u.rol !== 'superAdmin' && u.rol !== 'admin' && u.rol !== 'profesional'
      );
      const admins = usuariosData.filter(u => u.rol === 'admin');
      const profesionalesActivos = profesionalesData.filter(p => p.estado === 'activo');
      
      // Contar mascotas totales
      const totalMascotas = usuariosComunes.reduce((total, usuario) => {
        return total + (usuario.infoMascotas ? usuario.infoMascotas.length : 0);
      }, 0);

      // Contar citas totales
      const totalCitas = usuariosComunes.reduce((total, usuario) => {
        return total + (usuario.citas ? usuario.citas.length : 0);
      }, 0);

      setEstadisticas({
        totalUsuarios: usuariosComunes.length,
        totalProfesionales: profesionalesData.length,
        totalAdministradores: admins.length,
        totalMascotas,
        totalCitas,
        usuariosActivos: usuariosComunes.filter(u => u.isMember).length,
        profesionalesActivos: profesionalesActivos.length
      });
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    } finally {
      setIsCargandoEstadisticas(false);
    }
  };

  // Cargar datos cuando el componente se monta
  useEffect(() => {
    cargarDatosUsuario();
  }, [usuario?.uid]);

  // Cargar datos según la pestaña activa
  useEffect(() => {
    switch (pestañaActiva) {
      case 'usuarios':
        cargarUsuariosComunes();
        break;
      case 'profesionales':
        cargarProfesionales();
        break;
      case 'administradores':
        cargarAdministradores();
        break;
      case 'estadisticas':
        cargarEstadisticas();
        break;
      default:
        break;
    }
  }, [pestañaActiva]);

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

  // Función para obtener el color del tipo de profesional
  const obtenerColorTipoProfesional = (tipo) => {
    switch (tipo) {
      case 'veterinario': return 'bg-blue-100 text-blue-800';
      case 'peluquero': return 'bg-purple-100 text-purple-800';
      case 'tienda': return 'bg-green-100 text-green-800';
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

  // Función para abrir el modal con los detalles del usuario
  const handleVerDetalles = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setIsModalAbierto(true);
  };

  // Función para cerrar el modal
  const handleCerrarModal = () => {
    setIsModalAbierto(false);
    setUsuarioSeleccionado(null);
  };

  // Función para verificar mensualidades
  const handleVerificarMensualidades = async () => {
    setIsVerificandoMensualidades(true);
    try {
      const resultado = await mensualidadController.ejecutarVerificacionCompleta();
      
      if (resultado.exitoso !== false) {
        setAlertasMensualidades(resultado.alertas);
        setUltimaVerificacion(new Date());
        
        // Recargar usuarios comunes para mostrar cambios
        await cargarUsuariosComunes();
        
        alert(`✅ Verificación completada:\n- ${resultado.alertas.mensualidadesVencidas.cantidad} mensualidades vencidas\n- ${resultado.alertas.mensualidadesProximasVencer.cantidad} próximas a vencer`);
      } else {
        alert('❌ Error al verificar mensualidades: ' + resultado.error);
      }
    } catch (error) {
      console.error('Error al verificar mensualidades:', error);
      alert('❌ Error al verificar mensualidades');
    } finally {
      setIsVerificandoMensualidades(false);
    }
  };

  // Función para renovar mensualidad de un usuario
  const handleRenovarMensualidad = async (usuarioId) => {
    try {
      const resultado = await mensualidadController.renovarMensualidadUsuario(usuarioId);
      
      if (resultado.exitoso) {
        alert(`✅ Mensualidad renovada exitosamente para ${resultado.usuario.displayName || resultado.usuario.email}\n${resultado.mensaje}`);
        // Recargar usuarios comunes
        await cargarUsuariosComunes();
        // Actualizar alertas
        await handleVerificarMensualidades();
      } else {
        alert('❌ Error al renovar mensualidad: ' + resultado.error);
      }
    } catch (error) {
      console.error('Error al renovar mensualidad:', error);
      alert('❌ Error al renovar mensualidad');
    }
  };

  // Función para editar usuario (estado y mensualidad)
  const handleEditarUsuario = async (usuarioId, nuevosDatos) => {
    try {
      const resultado = await mensualidadController.actualizarUsuarioEnBaseDatos(usuarioId, nuevosDatos);
      
      if (resultado) {
        alert(`✅ Usuario actualizado exitosamente`);
        // Recargar usuarios comunes
        await cargarUsuariosComunes();
        // Actualizar alertas
        await handleVerificarMensualidades();
        // Cerrar modal
        handleCerrarModal();
      } else {
        alert('❌ Error al actualizar usuario');
      }
    } catch (error) {
      console.error('Error al editar usuario:', error);
      alert('❌ Error al editar usuario'); 
    }
  };
  console.log(chapitas,'chapitas');

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
      <div className="relative container mx-auto py-6 px-4 sm:px-6 ">
        {/* Header del Dashboard */}
        <div className="text-center mt-4 mb-8">
          <h2 className={typeTheme === 'light'
            ? "text-2xl sm:text-3xl font-bold text-gray-900 mb-2"
            : "text-2xl sm:text-3xl font-bold text-white mb-2"
          }>
            Panel Super Administrador - Huellitas Seguras
          </h2>
          <p className={typeTheme === 'light' ? "text-sm text-gray-600 mb-4" : 'text-sm text-white mb-4'}>
            Control total del sistema: usuarios, profesionales, administradores y estadísticas
          </p>
        </div>

        {/* Panel de Alertas de Mensualidades */}
        <div className={`rounded-xl shadow-lg p-6 mb-8 ${
          typeTheme === 'light' ? 'bg-white/80 backdrop-blur-sm' : 'bg-gray-800/80 backdrop-blur-sm'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${
              typeTheme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              🚨 Control de Mensualidades
            </h3>
            <div className="flex items-center space-x-3">
              {ultimaVerificacion && (
                <span className={`text-xs ${
                  typeTheme === 'light' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  Última verificación: {ultimaVerificacion.toLocaleTimeString('es-CL')}
                </span>
              )}
              <button
                onClick={handleVerificarMensualidades}
                disabled={isVerificandoMensualidades}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isVerificandoMensualidades
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isVerificandoMensualidades ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verificando...
                  </>
                ) : (
                  'Verificar Mensualidades'
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Usuarios en Período de Gracia */}
            <div className={`rounded-lg p-4 border-l-4 border-blue-500 ${
              typeTheme === 'light' ? 'bg-blue-50' : 'bg-blue-900/20'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-blue-800">Período de Gracia</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {usuariosComunes.filter(u => u.estadoMensualidad === 'periodo_gracia').length}
                  </p>
                  <p className="text-xs text-blue-600">3 meses gratis</p>
                </div>
                <div className="text-blue-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Alertas de Mensualidades Vencidas */}
            <div className={`rounded-lg p-4 border-l-4 border-red-500 ${
              typeTheme === 'light' ? 'bg-red-50' : 'bg-red-900/20'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-red-800">Mensualidades Vencidas</h4>
                  <p className="text-2xl font-bold text-red-600">
                    {alertasMensualidades.mensualidadesVencidas.cantidad}
                  </p>
                </div>
                <div className="text-red-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Alertas de Mensualidades Próximas a Vencer */}
            <div className={`rounded-lg p-4 border-l-4 border-yellow-500 ${
              typeTheme === 'light' ? 'bg-yellow-50' : 'bg-yellow-900/20'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-yellow-800">Próximas a Vencer</h4>
                  <p className="text-2xl font-bold text-yellow-600">
                    {alertasMensualidades.mensualidadesProximasVencer.cantidad}
                  </p>
                </div>
                <div className="text-yellow-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de usuarios con problemas de mensualidad */}
          {(alertasMensualidades.mensualidadesVencidas.cantidad > 0 || alertasMensualidades.mensualidadesProximasVencer.cantidad > 0) && (
            <div className="mt-4">
              <h4 className={`font-medium mb-2 ${
                typeTheme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                Usuarios que requieren atención:
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {[...alertasMensualidades.mensualidadesVencidas.usuarios, ...alertasMensualidades.mensualidadesProximasVencer.usuarios].map((usuario) => (
                  <div key={usuario.id} className={`flex items-center justify-between p-2 rounded ${
                    typeTheme === 'light' ? 'bg-gray-100' : 'bg-gray-700'
                  }`}>
                    <div>
                      <span className="font-medium">{usuario.nombre}</span>
                      <span className={`ml-2 text-sm ${
                        typeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {usuario.email}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        usuario.diasVencida ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {usuario.diasVencida ? `Vencida ${usuario.diasVencida}d` : `${usuario.diasRestantes}d restantes`}
                      </span>
                      <button
                        onClick={() => handleRenovarMensualidad(usuario.id)}
                        className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                      >
                        Renovar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pestañas de navegación */}
        <div className={typeTheme === 'light'
          ? "bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8"
          : "bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8"
        }>
          <div className="border-b border-gray-200 mb-6">
            <div className="flex space-x-4 overflow-x-auto">
              <button 
                onClick={() => setPestañaActiva('estadisticas')}
                className={`pb-2 font-medium transition-colors duration-200 whitespace-nowrap ${
                  pestañaActiva === 'estadisticas' 
                    ? 'border-b-2 border-red-500 text-red-600' 
                    : 'text-gray-600 hover:text-gray-800 hover:border-b-2 hover:border-gray-300'
                }`}
              >
                Estadísticas Generales
              </button>
              <button 
                onClick={() => setPestañaActiva('usuarios')}
                className={`pb-2 font-medium transition-colors duration-200 whitespace-nowrap ${
                  pestañaActiva === 'usuarios' 
                    ? 'border-b-2 border-red-500 text-red-600' 
                    : 'text-gray-600 hover:text-gray-800 hover:border-b-2 hover:border-gray-300'
                }`}
              >
                Usuarios Comunes
              </button>
              <button 
                onClick={() => setPestañaActiva('liquidaciones')}
                className={`pb-2 font-medium transition-colors duration-200 whitespace-nowrap ${
                  pestañaActiva === 'liquidaciones' 
                    ? 'border-b-2 border-red-500 text-red-600' 
                    : 'text-gray-600 hover:text-gray-800 hover:border-b-2 hover:border-gray-300'
                }`}
              >
                Liquidaciones
              </button>
              <button 
                onClick={() => setPestañaActiva('profesionales')}
                className={`pb-2 font-medium transition-colors duration-200 whitespace-nowrap ${
                  pestañaActiva === 'profesionales' 
                    ? 'border-b-2 border-red-500 text-red-600' 
                    : 'text-gray-600 hover:text-gray-800 hover:border-b-2 hover:border-gray-300'
                }`}
              >
                Profesionales
              </button>
              <button 
                onClick={() => setPestañaActiva('administradores')}
                className={`pb-2 font-medium transition-colors duration-200 whitespace-nowrap ${
                  pestañaActiva === 'administradores' 
                    ? 'border-b-2 border-red-500 text-red-600' 
                    : 'text-gray-600 hover:text-gray-800 hover:border-b-2 hover:border-gray-300'
                }`}
              >
                Administradores
              </button>
            </div>
          </div>

          {/* Contenido de Estadísticas Generales */}
          {pestañaActiva === 'estadisticas' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Estadísticas del Sistema</h3>
              
              {isCargandoEstadisticas ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                  <p className="mt-2 text-gray-600">Cargando estadísticas...</p>
                </div>
              ) : (
                <>
                  {/* Tarjetas de estadísticas */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm">Total Usuarios</p>
                          <p className="text-2xl font-bold">{estadisticas.totalUsuarios}</p>
                          <p className="text-blue-100 text-xs">Usuarios activos: {estadisticas.usuariosActivos}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm">Total Profesionales</p>
                          <p className="text-2xl font-bold">{estadisticas.totalProfesionales}</p>
                          <p className="text-green-100 text-xs">Activos: {estadisticas.profesionalesActivos}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm">Total Administradores</p>
                          <p className="text-2xl font-bold">{estadisticas.totalAdministradores}</p>
                          <p className="text-purple-100 text-xs">Organizaciones de rescate</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-400 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-100 text-sm">Total Mascotas</p>
                          <p className="text-2xl font-bold">{estadisticas.totalMascotas}</p>
                          <p className="text-orange-100 text-xs">Citas: {estadisticas.totalCitas}</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gráfico de distribución */}
                <div className="flex flex-row justify-around gap-6">
                <GraficoComponente titulo="Distribución de Usuarios" tendencia="Tendencia mensual" dataDistribucion={dataDistribucion} COLORES_DISTRIBUCION={COLORES_DISTRIBUCION} TrendingUp={TrendingUp} ResponsiveContainer={ResponsiveContainer} PieChart={PieChart} Pie={Pie} Cell={Cell} Tooltip={Tooltip} />
                <GraficoComponente 
                titulo="Chapitas" tendencia="Tendencia mensual" 
                dataDistribucion={dataDistribucionChapitas}
                 COLORES_DISTRIBUCION={COLORES_DISTRIBUCION} 
                 TrendingUp={TrendingUp} ResponsiveContainer={ResponsiveContainer} 
                 PieChart={PieChart} Pie={Pie} Cell={Cell} Tooltip={Tooltip} />
                </div>

           
                </>
              )}
            </div>
          )}

          {/* Contenido de Usuarios Comunes */}
          {pestañaActiva === 'usuarios' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Usuarios Comunes (Dueños de Mascotas)</h3>
              
              {isCargandoUsuariosComunes ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                  <p className="mt-2 text-gray-600">Cargando usuarios...</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900">Lista de Usuarios Comunes</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mensualidad</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mascotas</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Citas</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registro</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {usuariosComunes.map((usuario) => (
                          <tr key={usuario.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-sm font-medium text-blue-600">
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
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                usuario.isMember ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {usuario.isMember ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${usuario.colorEstadoMensualidad || 'bg-gray-100 text-gray-800'}`}>
                                {usuario.mensajeEstadoMensualidad || (usuario.tipoMensualidad ? 'Mensualidad Activa' : 'Sin mensualidad')}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {usuario.infoMascotas ? usuario.infoMascotas.length : 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {usuario.citas ? usuario.citas.length : 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {usuario.fechaCreacion ? new Date(usuario.fechaCreacion.seconds * 1000).toLocaleDateString('es-CL') : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => handleVerDetalles(usuario)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Ver Detalles
                                </button>
                              
                                {(usuario.estadoMensualidad === 'vencida' || usuario.estadoMensualidad === 'proxima_vencer') && (
                                  <button 
                                    onClick={() => handleRenovarMensualidad(usuario.id)}
                                    className="text-green-600 hover:text-green-900 font-medium"
                                    title="Renovar por 1 mes"
                                  >
                                    Renovar
                                  </button>
                                )}
                              </div>
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

          {/* Contenido de Profesionales */}
          {pestañaActiva === 'profesionales' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Profesionales del Sistema</h3>
              
              {isCargandoProfesionales ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                  <p className="mt-2 text-gray-600">Cargando profesionales...</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900">Lista de Profesionales</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profesional</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Especialidad</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Citas</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registro</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {profesionales.map((profesional) => (
                          <tr key={profesional.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <span className="text-sm font-medium text-green-600">
                                      {profesional.nombre ? profesional.nombre.charAt(0) : 'P'}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{profesional.nombre}</div>
                                  <div className="text-sm text-gray-500">{profesional.email || 'Sin email'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${obtenerColorTipoProfesional(profesional.tipoProfesional)}`}>
                                {profesional.tipoProfesional}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${obtenerColorEstado(profesional.estado)}`}>
                                {profesional.estado || 'activo'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {profesional.especialidad || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {profesional.citas ? profesional.citas.length : 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {profesional.fechaCreacion ? new Date(profesional.fechaCreacion.seconds * 1000).toLocaleDateString('es-CL') : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button className="text-red-600 hover:text-red-900">Ver Detalles</button>
                                <button className="text-blue-600 hover:text-blue-900">Editar</button>
                              </div>
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

          {/* Contenido de Administradores */}
          {pestañaActiva === 'administradores' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Administradores (Organizaciones de Rescate)</h3>
              
              {isCargandoAdministradores ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                  <p className="mt-2 text-gray-600">Cargando administradores...</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900">Lista de Administradores</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Administrador</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organización</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mensualidad</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mascotas</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registro</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {administradores.map((admin) => (
                          <tr key={admin.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                    <span className="text-sm font-medium text-purple-600">
                                      {admin.displayName ? admin.displayName.charAt(0) : admin.email.charAt(0)}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {admin.displayName || admin.nombre || 'Sin nombre'}
                                  </div>
                                  <div className="text-sm text-gray-500">{admin.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {admin.nombreOrganizacion || 'Sin organización'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                admin.isMember ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {admin.isMember ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {admin.tipoMensualidad ? (
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${obtenerColorMensualidad(admin.tipoMensualidad)}`}>
                                  {admin.tipoMensualidad}
                                </span>
                              ) : (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                  Sin mensualidad
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {admin.infoMascotas ? admin.infoMascotas.length : 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {admin.fechaCreacion ? new Date(admin.fechaCreacion.seconds * 1000).toLocaleDateString('es-CL') : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button className="text-red-600 hover:text-red-900">Ver Detalles</button>
                                <button className="text-blue-600 hover:text-blue-900">Editar</button>
                              </div>
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
        </div>
      </div>

      {/* Modal de detalles del usuario */}
      {usuarioSeleccionado && (
        <ModalDetailUserComun
          usuario={usuarioSeleccionado}
          isAbierto={isModalAbierto}
          onCerrar={handleCerrarModal}
          onEditarUsuario={handleEditarUsuario}
        />
      )}
    </div>
  );
};

export default DashboardSuperAdmin;
