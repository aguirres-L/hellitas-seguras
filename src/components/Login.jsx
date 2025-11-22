import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../data/firebase';
import { useAuth } from '../contexts/AuthContext';
import DecoracionForm from './decoracionUi/DecoracionForm';
import ModalRecuperarPassword from './registers/ModalRecuperarPassword';
import logo11 from '../assets/new-logo11.png';

// Este componente no recibe props
const Login = () => {
  const navigate = useNavigate();
  const { isAutenticado } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isCargando, setIsCargando] = useState(false);
  const [error, setError] = useState('');
  const [mostrarModalRecuperar, setMostrarModalRecuperar] = useState(false);
  


  /* 
  
  terminar con la logica para el dashboard de super admin y ver si funciona correctamente

  */


  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAutenticado) {
      navigate('/dashboard');
    }
  }, [isAutenticado, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsCargando(true);

    try {
      // Iniciar sesión con Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );

      navigate('/dashboard'); // Redirigir al dashboard
      
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      
      // Manejar errores específicos de Firebase
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No existe una cuenta con este correo electrónico');
          break;
        case 'auth/wrong-password':
          setError('Contraseña incorrecta');
          break;
        case 'auth/invalid-email':
          setError('El correo electrónico no es válido');
          break;
        case 'auth/too-many-requests':
          setError('Demasiados intentos fallidos. Inténtalo más tarde');
          break;
        default:
          setError('Error al iniciar sesión. Inténtalo de nuevo.');
      }
    } finally {
      setIsCargando(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-hidden">
      {/* Fondo decorativo - Responsivo */}
      <DecoracionForm />


      <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg h-full flex flex-col justify-center">
        {/* Logo y título - Compacto */}
        <div className="text-center mb-4 sm:mb-6">
          <a href='/' className="mx-auto h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg mb-2 sm:mb-3">
           <img src={logo11} alt="" />
          </a>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
            Huellitas Seguras
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mb-2">
            Cuidando a tus mejores amigos
          </p>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            Iniciar Sesión
          </h2>
        </div>
        
        {/* Mensaje de error - Compacto */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-2 sm:p-3 rounded-md shadow-sm mb-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-2">
                <p className="text-xs sm:text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Formulario - Compacto */}
        <form className="space-y-2 sm:space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-2 sm:space-y-3">
            {/* Campo Email */}
            <div className="relative">
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none relative block w-full pl-7 sm:pl-8 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:shadow-lg transition-all duration-200 text-sm"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isCargando}
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div className="relative">
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none relative block w-full pl-7 sm:pl-8 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:shadow-lg transition-all duration-200 text-sm"
                  placeholder="Tu contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isCargando}
                />
              </div>
            </div>
          </div>

          {/* Botón de login - Compacto */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isCargando}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105 shadow-lg"
            >
              {isCargando ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm">Iniciando sesión...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-sm">Iniciar Sesión</span>
                </div>
              )}
            </button>
          </div>

              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => setMostrarModalRecuperar(true)}
                  className="text-xs sm:text-sm text-orange-600 hover:text-orange-500 font-medium transition-colors duration-200"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

          {/* Enlace de registro - Compacto */}
          <div className="text-center pt-2">
            <p className="text-xs sm:text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link 
                to="/register" 
                className="font-medium text-orange-600 hover:text-orange-500 transition-colors duration-200"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </form>
      </div>

      {/* Modal de recuperación de contraseña */}
      <ModalRecuperarPassword
        isAbierto={mostrarModalRecuperar}
        onCerrar={() => setMostrarModalRecuperar(false)}
      />
    </div>
  );
};

export default Login; 