import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from './Navbar';
import { obtenerUsuarioPorUid } from '../data/firebase/firebase';
import { useTheme } from '../contexts/ThemeContext';
import DecoracionForm from './decoracionUi/DecoracionForm';

// Este componente no recibe props
const DashboardAdmin = () => {
  const navigate = useNavigate();
  const { usuario, cerrarSesion, isCargandoLogout } = useAuth();
  const { typeTheme } = useTheme();
  
  // Estados para datos administrativos
  const [datosUsuario, setDatosUsuario] = useState(null);
  const [isCargandoUsuario, setIsCargandoUsuario] = useState(false);
  const [pestañaActiva, setPestañaActiva] = useState('liquidaciones');
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth());
  const [añoSeleccionado, setAñoSeleccionado] = useState(new Date().getFullYear());

  // Datos simulados para liquidaciones mensuales
  const liquidacionesMensuales = [
    {
      mes: 'Enero 2024',
      ingresosTotales: 1250000,
      gastosOperacionales: 450000,
      comisiones: 125000,
      gananciaNeta: 675000,
      usuariosNuevos: 45,
      citasRealizadas: 234,
      serviciosVendidos: 156
    },
    {
      mes: 'Febrero 2024',
      ingresosTotales: 1380000,
      gastosOperacionales: 480000,
      comisiones: 138000,
      gananciaNeta: 762000,
      usuariosNuevos: 52,
      citasRealizadas: 267,
      serviciosVendidos: 189
    },
    {
      mes: 'Marzo 2024',
      ingresosTotales: 1420000,
      gastosOperacionales: 490000,
      comisiones: 142000,
      gananciaNeta: 788000,
      usuariosNuevos: 38,
      citasRealizadas: 289,
      serviciosVendidos: 203
    }
  ];

  // Datos simulados de usuarios
  const usuariosSimulados = [
    {
      id: '1',
      nombre: 'María González',
      email: 'maria@email.com',
      rol: 'usuario',
      fechaRegistro: '2024-01-15',
      tieneMensualidad: true,
      tipoMensualidad: 'Premium',
      estado: 'activo',
      mascotas: 2,
      citasRealizadas: 8
    },
    {
      id: '2',
      nombre: 'Carlos Rodríguez',
      email: 'carlos@email.com',
      rol: 'usuario',
      fechaRegistro: '2024-02-03',
      tieneMensualidad: false,
      tipoMensualidad: null,
      estado: 'activo',
      mascotas: 1,
      citasRealizadas: 3
    },
    {
      id: '3',
      nombre: 'Ana Martínez',
      email: 'ana@email.com',
      rol: 'admin',
      fechaRegistro: '2024-01-01',
      tieneMensualidad: true,
      tipoMensualidad: 'Admin',
      estado: 'activo',
      mascotas: 3,
      citasRealizadas: 12
    },
    {
      id: '4',
      nombre: 'Luis Pérez',
      email: 'luis@email.com',
      rol: 'usuario',
      fechaRegistro: '2024-03-10',
      tieneMensualidad: true,
      tipoMensualidad: 'Básica',
      estado: 'inactivo',
      mascotas: 0,
      citasRealizadas: 0
    },
    {
      id: '5',
      nombre: 'Dr. Juan Silva',
      email: 'juan@vet.com',
      rol: 'profesional',
      fechaRegistro: '2024-01-20',
      tieneMensualidad: true,
      tipoMensualidad: 'Profesional',
      estado: 'activo',
      especialidad: 'Veterinario',
      citasRealizadas: 45
    }
  ];

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

  // Cargar datos del usuario cuando el componente se monta
  useEffect(() => {
    cargarDatosUsuario();
  }, [usuario?.uid]);

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
                    : 'text-gray-600 hover:text-gray-800 hover:border-b-2 hover:border-gray-300'
                }`}
              >
                Liquidaciones Mensuales
              </button>
              <button 
                onClick={() => setPestañaActiva('usuarios')}
                className={`pb-2 font-medium transition-colors duration-200 whitespace-nowrap ${
                  pestañaActiva === 'usuarios' 
                    ? 'border-b-2 border-purple-500 text-purple-600' 
                    : 'text-gray-600 hover:text-gray-800 hover:border-b-2 hover:border-gray-300'
                }`}
              >
                Gestión de Usuarios
              </button>
              <button 
                onClick={() => setPestañaActiva('estadisticas')}
                className={`pb-2 font-medium transition-colors duration-200 whitespace-nowrap ${
                  pestañaActiva === 'estadisticas' 
                    ? 'border-b-2 border-purple-500 text-purple-600' 
                    : 'text-gray-600 hover:text-gray-800 hover:border-b-2 hover:border-gray-300'
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
              
              {/* Filtros de fecha */}
              <div className="flex gap-4 mb-6">
                <select 
                  value={mesSeleccionado}
                  onChange={(e) => setMesSeleccionado(parseInt(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={0}>Enero</option>
                  <option value={1}>Febrero</option>
                  <option value={2}>Marzo</option>
                  <option value={3}>Abril</option>
                  <option value={4}>Mayo</option>
                  <option value={5}>Junio</option>
                  <option value={6}>Julio</option>
                  <option value={7}>Agosto</option>
                  <option value={8}>Septiembre</option>
                  <option value={9}>Octubre</option>
                  <option value={10}>Noviembre</option>
                  <option value={11}>Diciembre</option>
                </select>
                <select 
                  value={añoSeleccionado}
                  onChange={(e) => setAñoSeleccionado(parseInt(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={2024}>2024</option>
                  <option value={2023}>2023</option>
                </select>
              </div>

              {/* Tarjetas de resumen */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Ingresos Totales</p>
                      <p className="text-2xl font-bold">{formatearMoneda(liquidacionesMensuales[0].ingresosTotales)}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm">Gastos Operacionales</p>
                      <p className="text-2xl font-bold">{formatearMoneda(liquidacionesMensuales[0].gastosOperacionales)}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-400 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Comisiones</p>
                      <p className="text-2xl font-bold">{formatearMoneda(liquidacionesMensuales[0].comisiones)}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Ganancia Neta</p>
                      <p className="text-2xl font-bold">{formatearMoneda(liquidacionesMensuales[0].gananciaNeta)}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-400 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabla de liquidaciones */}
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comisiones</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ganancia</th>
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
                            {formatearMoneda(liquidacion.comisiones)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-medium">
                            {formatearMoneda(liquidacion.gananciaNeta)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {liquidacion.usuariosNuevos}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {liquidacion.citasRealizadas}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
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
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900">Lista de Usuarios</h4>
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
                      {usuariosSimulados.map((usuario) => (
                        <tr key={usuario.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-purple-600">
                                    {usuario.nombre.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{usuario.nombre}</div>
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
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${obtenerColorEstado(usuario.estado)}`}>
                              {usuario.estado}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {usuario.tieneMensualidad ? (
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${obtenerColorMensualidad(usuario.tipoMensualidad)}`}>
                                {usuario.tipoMensualidad}
                              </span>
                            ) : (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                Sin mensualidad
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(usuario.fechaRegistro).toLocaleDateString('es-CL')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              <div>Mascotas: {usuario.mascotas}</div>
                              <div>Citas: {usuario.citasRealizadas}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-purple-600 hover:text-purple-900">Editar</button>
                              <button className="text-red-600 hover:text-red-900">Suspender</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Contenido de Estadísticas Generales */}
          {pestañaActiva === 'estadisticas' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Estadísticas Generales</h3>
              
              {/* Tarjetas de estadísticas */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Total Usuarios</p>
                      <p className="text-3xl font-bold text-gray-900">1,247</p>
                      <p className="text-green-600 text-sm">+12% este mes</p>
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
                      <p className="text-gray-500 text-sm">Citas Realizadas</p>
                      <p className="text-3xl font-bold text-gray-900">3,456</p>
                      <p className="text-green-600 text-sm">+8% este mes</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Ingresos Mensuales</p>
                      <p className="text-3xl font-bold text-gray-900">{formatearMoneda(1420000)}</p>
                      <p className="text-green-600 text-sm">+15% este mes</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Mascotas Registradas</p>
                      <p className="text-3xl font-bold text-gray-900">2,891</p>
                      <p className="text-green-600 text-sm">+5% este mes</p>
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
                      <p className="text-gray-500 text-sm">Profesionales Activos</p>
                      <p className="text-3xl font-bold text-gray-900">89</p>
                      <p className="text-green-600 text-sm">+3 este mes</p>
                    </div>
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Satisfacción</p>
                      <p className="text-3xl font-bold text-gray-900">4.8/5</p>
                      <p className="text-green-600 text-sm">+0.2 este mes</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gráfico de crecimiento */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Crecimiento de Usuarios</h4>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Gráfico de crecimiento (simulado)</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
