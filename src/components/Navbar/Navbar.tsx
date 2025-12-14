import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { SvgSol } from '../ui/svg/SvgSol';
import { SvgLuna } from '../ui/svg/SvgLuna';
import { SvgSolDark } from '../ui/svg/SvgSolDark';
import { SvgLunaDark } from '../ui/svg/SvgLunaDark';
import Campana from '../ui/svg/Campana';
import { NotificacionesChapitas } from '../NotificacionesChapitas';
import UseFrameMotion from '../hook_frame_motion/UseFrameMotion';
// Importar video como módulo desde src/assets (Vite lo procesará correctamente)
// @ts-ignore - Vite procesa archivos .mp4 y devuelve la URL como string
import videoLogo from '../../assets/pets/jjj.mp4';
// Usar ruta absoluta desde public/ para la imagen
const logo = '/milo2modelo (1).png';

export interface NavbarProps {
  tipo: 'home' | 'dashboard';
  titulo?: string;
  mostrarUsuario?: boolean;
  mostrarConfiguracion?: boolean;
  mostrarCerrarSesion?: boolean;
  onCerrarSesion?: () => void;
  isCargandoLogout?: boolean;
  mostrarNavegacionInterna?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  tipo,
  titulo = 'Huellitas Seguras',
  mostrarUsuario = true,
  mostrarConfiguracion = true,
  mostrarCerrarSesion = true,
  onCerrarSesion,
  isCargandoLogout = false,
  mostrarNavegacionInterna = false,
}) => {
  const navigate = useNavigate();
  const { usuario, datosUsuario } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);

  const { typeTheme, toggleTheme } = useTheme();
  
  // Estado para controlar si mostramos el video o la imagen
  const [mostrarVideo, setMostrarVideo] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Efecto para cambiar a imagen después de 7 segundos (fallback por si el video no termina)
  useEffect(() => {
    const timer = setTimeout(() => {
      setMostrarVideo(false);
    }, 7000);

    return () => clearTimeout(timer);
  }, []);

  // Handler cuando el video termina de cargar
  const handleVideoLoaded = () => {
    console.log('Video cargado correctamente');
  };

  // Handler cuando el video termina de reproducirse (onEnded)
  const handleVideoEnded = () => {
    console.log('Video terminado, iniciando animación de salida');
    // AnimatePresence manejará automáticamente la animación de salida
    setMostrarVideo(false);
  };

  // Handler si el video falla al cargar
  const handleVideoError = () => {
    console.error('Error al cargar el video, mostrando imagen');
    setMostrarVideo(false);
  };

  // Función por defecto para cerrar sesión si no se proporciona
  const handleCerrarSesion = async () => {
    if (onCerrarSesion) {
      await onCerrarSesion();
    } else {
      try {
        navigate('/login');
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
      }
    }
  };

  // Función para navegación interna suave
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
    setMenuAbierto(false); // Cerrar menú móvil después de navegar
  };

  // Navbar para home
  if (tipo === 'home') {
    return (
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-sm shadow-lg p-4">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo y título */}
          <div className="flex items-center space-x-2">
            {/* Logo con animación */}
            <UseFrameMotion 
              tipoAnimacion="scale" 
              duracion={0.8} 
              delay={0.2} 
              waitForUserView={true}
              propsAdicionales={{}}
            >
              <Link 
                to="/" 
                className=" w-8  flex items-center justify-center hover:opacity-80 transition-opacity duration-200"
              >
                <AnimatePresence mode="wait">
                  {mostrarVideo ? (
                    <motion.div
                      key="video"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      transition={{ 
                        duration: 0.8, 
                        delay: 0.2,
                        ease: 'easeOut' 
                      }}
                    >
                      <video 
                        ref={videoRef}
                        src={videoLogo} 
                        autoPlay 
                        muted 
                        playsInline 
                        className="h-11 w-8 object-cover transition-opacity duration-300" 
                        onLoadedData={handleVideoLoaded}
                        onEnded={handleVideoEnded}
                        onError={handleVideoError}
                      />
                    </motion.div>
                  ) : (
                    <UseFrameMotion
                      key="imagen"
                      tipoAnimacion="slideLeft"
                      duracion={0.6}
                      delay={0}
                      waitForUserView={false}
                      className="h-11 w-8 flex items-center justify-center"
                      propsAdicionales={{}}
                    >
                      <img 
                        src={logo} 
                        alt="Logo" 
                        className="h-11 w-8 object-cover transition-opacity duration-300"
                      />
                    </UseFrameMotion>
                  )}
                </AnimatePresence>
              </Link>
            </UseFrameMotion>

            {/* Título con animación */}
            <UseFrameMotion 
              tipoAnimacion="slideLeft" 
              duracion={3} 
              delay={0.5} 
              waitForUserView={true}
              propsAdicionales={{}}
            >
              <Link 
                to="/" 
                className="hover:opacity-80 transition-opacity duration-200"
              >
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  {titulo}
                </h1>
              </Link>
            </UseFrameMotion>
          </div>
          {/* Botón hamburguesa */}
          <button
            className="sm:hidden flex items-center px-3 py-2 border rounded text-orange-600 border-orange-400"
            onClick={() => setMenuAbierto(!menuAbierto)}
            aria-label="Abrir menú"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {/* Menú links */}
          <div className={`flex-col sm:flex-row sm:flex space-y-2 sm:space-y-0 sm:space-x-4 absolute sm:static top-16 left-0 w-full sm:w-auto bg-white/95 sm:bg-transparent shadow-lg sm:shadow-none z-[9999] transition-all duration-300 ${menuAbierto ? 'flex' : 'hidden sm:flex'}`}>
            {/* Navegación interna - solo visible en home */}
            {mostrarNavegacionInterna && (
              <>
                <button 
                  onClick={() => scrollToSection('how-it-works')}
                  className="text-gray-700 hover:text-orange-600 transition-colors duration-200 font-medium px-4 py-2 text-sm border-b border-gray-100 sm:border-b-0"
                >
                  Cómo Funciona
                </button>
              {/*   <button 
                  onClick={() => scrollToSection('impacto-social')}
                  className="text-gray-700 hover:text-orange-600 transition-colors duration-200 font-medium px-4 py-2 text-sm border-b border-gray-100 sm:border-b-0"
                >
                  Impacto Social
                </button> */}
              {/*   <button 
                  onClick={() => scrollToSection('beneficios')}
                  className="text-gray-700 hover:text-orange-600 transition-colors duration-200 font-medium px-4 py-2 text-sm border-b border-gray-100 sm:border-b-0"
                >
                  Beneficios
                </button> */}
                <button 
                  onClick={() => scrollToSection('planes')}
                  className="text-gray-700 hover:text-orange-600 transition-colors duration-200 font-medium px-4 py-2 text-sm border-b border-gray-100 sm:border-b-0"
                >
                  Planes
                </button>
              </>
            )}
                     <Link 
              to="/login" 
              className="text-gray-700 hover:text-orange-600 transition-colors duration-200 font-medium px-4 py-2 border border-orange-300 hover:border-orange-500 rounded-lg hover:bg-orange-50"
              onClick={() => setMenuAbierto(false)}
            >
              Iniciar Sesión
            </Link>

         {/*    <Link 
              to="/login-profesional" 
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg border border-blue-400"
              onClick={() => setMenuAbierto(false)}
            >
              Iniciar Sesión de Servicios
            </Link> */}
            <Link 
              to="/register" 
              className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 shadow-lg border border-orange-400"
              onClick={() => setMenuAbierto(false)}
            >
              Registrarse
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  // Navbar para dashboard (usuario autenticado)
  return (
    <nav className={
      typeTheme === 'dark'
        ? 'fixed top-0 left-0 w-full z-50 bg-gray-900/90 backdrop-blur-sm shadow-sm p-4 border-b border-gray-800'
        : 'fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-sm shadow-sm p-4 border-b border-orange-100'
    }>
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo y título */}
        <Link to="/about" className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200">
        <img src={logo} className='h-14 ' alt="" />

          <h1 className={typeTheme === 'dark' ? 'text-xl sm:text-2xl font-bold text-white' : 'text-xl sm:text-2xl font-bold text-gray-900'}>{titulo}</h1>
        </Link>

          {mostrarUsuario && (
            <span className={typeTheme === 'dark' ? 'text-lg text-gray-200 px-4 py-3sm:block' : 'text-lg text-gray-600 px-4 py-3sm:block'}>
              Hola, {usuario?.displayName || usuario?.email}
            </span>
          )}


        {/* Botón hamburguesa */}
        <button
          className={typeTheme === 'dark'
            ? 'sm:hidden flex items-center px-3 py-2 border rounded text-orange-200 border-orange-400'
            : 'sm:hidden flex items-center px-3 py-2 border rounded text-orange-600 border-orange-400'}
          onClick={() => setMenuAbierto(!menuAbierto)}
          aria-label="Abrir menú"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {/* Menú links */}
        <div className={`flex-col sm:flex-row sm:flex sm:space-y-0 sm:space-x-4 absolute sm:static top-20 left-0 w-full sm:w-auto ${typeTheme === 'dark' ? 'bg-gray-900/95 sm:bg-transparent' : 'bg-white/95 sm:bg-transparent'}  shadow-lg sm:shadow-none z-[9999] duration-300 ${menuAbierto ? 'flex' : 'hidden sm:flex'}`}>
                                                                                                                                                                                                                                                                                                                                                
          {/* Enlace al dashboard admin para usuarios admin */}
          {datosUsuario?.rol === 'admin' && (
            <Link 
              to="/dashboard-admin" 
              className={typeTheme === 'dark'
                ? 'text-purple-400 hover:text-purple-300 transition-colors duration-200 text-sm px-4 py-2 flex items-center gap-2'
                : 'text-purple-600 hover:text-purple-700 transition-colors duration-200 text-sm px-4 py-2 flex items-center gap-2'}
              onClick={() => setMenuAbierto(false)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Admin
            </Link>
          )}
         
          {mostrarConfiguracion && (
            <button
              onClick={toggleTheme}
              className={typeTheme === 'dark'
                ? 'text-gray-200 hover:text-orange-400 transition-colors duration-200 text-sm px-4 py-2 flex items-center gap-2'
                : 'text-gray-600 hover:text-orange-600 transition-colors duration-200 text-sm px-4 py-2 flex items-center gap-2'}
              aria-label="Cambiar tema"
            >
              {typeTheme === 'light' ? <SvgLunaDark /> : <SvgSol/>}
            </button>
          )}
          
          {/* apartado para las notificaciones de las chapitas */}
          {mostrarConfiguracion && usuario && (
            <div className="relative">
              <button
                onClick={() => setNotificacionesAbiertas(!notificacionesAbiertas)}
                className={typeTheme === 'dark'
                  ? 'text-gray-200 hover:text-orange-400 transition-colors duration-200 text-sm px-4 py-2 flex items-center gap-2'
                  : 'text-gray-600 hover:text-orange-600 transition-colors duration-200 text-sm px-4 py-2 flex items-center gap-2'}
                aria-label="Notificaciones de las chapitas"
              >
                <Campana/>
              </button>
              
              {/* Dropdown de notificaciones */}
              <NotificacionesChapitas
                isAbierto={notificacionesAbiertas}
                onCerrar={() => setNotificacionesAbiertas(false)}
                typeTheme={typeTheme}
              />
            </div>
          )}

          {mostrarCerrarSesion && (
            <button 
              onClick={handleCerrarSesion}
              disabled={isCargandoLogout}
              className={typeTheme === 'dark'
                ? 'text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm transition-colors duration-200 px-4 py-2'
                : 'text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm transition-colors duration-200 px-4 py-2'}
            >
              {isCargandoLogout ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Cerrando...
                </>
              ) : (
                'Cerrar Sesión'
              )}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}; 