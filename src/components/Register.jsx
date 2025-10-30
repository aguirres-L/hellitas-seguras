import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  createUserWithEmailAndPassword,
  updateProfile 
} from 'firebase/auth';
import { auth, addDataWithCustomId } from '../data/firebase';
import { useAuth } from '../contexts/AuthContext';
import DecoracionForm from './decoracionUi/DecoracionForm';

import logo11 from '../assets/new-logo11.png';

// Este componente no recibe props
const Register = () => {
  const navigate = useNavigate();
  const { isAutenticado } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '', 
    email: '',
    telefono: '',
    direccion: '',
    zona: 'norte',
    barrio: '',
    password: '',
    confirmPassword: ''
  });
  const [isCargando, setIsCargando] = useState(false);
  const [error, setError] = useState('');

 
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

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsCargando(false);
      return;
    }

    // Validar teléfono (exactamente 10 dígitos)
    const telefonoLimpio = formData.telefono.replace(/[^\d]/g, '');
    if (telefonoLimpio.length !== 10) {
      setError('El teléfono debe tener exactamente 10 dígitos');
      setIsCargando(false);
      return;
    }

    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );

      // Actualizar el perfil del usuario con el nombre
      await updateProfile(userCredential.user, {
        displayName: formData.nombre
      });

      // Guardar datos adicionales en Firestore usando el UID como ID del documento
      await addDataWithCustomId('usuarios', userCredential.user.uid, {
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
        direccion: formData.direccion,
        ubicacion: {
          zona: formData.zona,
          barrio: formData.barrio,
          direccion: formData.direccion
        },
        rol: 'usuario', // Rol por defecto
        isMember: true,
        tipoMensualidad:false,
        fechaRegistro: new Date()
      });

      console.log('Usuario registrado exitosamente:', userCredential.user);
      navigate('/dashboard'); // Redirigir al dashboard
      
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      
      // Manejar errores específicos de Firebase
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('El correo electrónico ya está en uso');
          break;
        case 'auth/weak-password':
          setError('La contraseña es muy débil');
          break;
        case 'auth/invalid-email':
          setError('El correo electrónico no es válido');
          break;
        default:
          setError('Error al crear la cuenta. Inténtalo de nuevo.');
      }
    } finally {
      setIsCargando(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validación específica para teléfono
    if (name === 'telefono') {
      // Solo permitir números, espacios, guiones y el símbolo +
      let telefonoLimpio = value.replace(/[^\d\s\-\+]/g, '');
      
      // Limitar a máximo 10 dígitos (sin contar espacios, guiones, etc.)
      const soloDigitos = telefonoLimpio.replace(/[^\d]/g, '');
      if (soloDigitos.length > 10) {
        // Si excede 10 dígitos, truncar
        telefonoLimpio = telefonoLimpio.substring(0, telefonoLimpio.length - (soloDigitos.length - 10));
      }
      
      setFormData({
        ...formData,
        [name]: telefonoLimpio
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 flex items-center justify-center p-4 overflow-y-auto">
  {/* Fondo decorativo - Responsivo */}
      <DecoracionForm />

      <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg h-full flex flex-col justify-center">
        {/* Logo y título - Compacto */}
        <div className="text-center mb-4 sm:mb-6">
             <div onClick={() => navigate('/')} className="mx-auto cursor-pointer  h-16 w-16 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg mb-4">
                      <img src={logo11} alt="" />
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
            Huellitas Seguras
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mb-2">
            Cuidando a tus mejores amigos
          </p>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            Crear Cuenta
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
        <form className="space-y-2 sm:space-y-1" onSubmit={handleSubmit}>
          <div className="space-y-2 sm:space-y-3">
            {/* Campo Nombre */}
            <div className="relative">
              <label htmlFor="nombre" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Nombre completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  required
                  className="appearance-none relative block w-full pl-7 sm:pl-8 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:shadow-lg transition-all duration-200 text-sm"
                  placeholder="Tu nombre completo"
                  value={formData.nombre}
                  onChange={handleChange}
                  disabled={isCargando}
                />
              </div>
            </div>

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

            {/* Campo Teléfono */}
            <div className="relative">
              <label htmlFor="telefono" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  required
                  className="appearance-none relative block w-full pl-7 sm:pl-8 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:shadow-lg transition-all duration-200 text-sm"
                  placeholder="+34 123 456 789"
                  value={formData.telefono}
                  onChange={handleChange}
                  disabled={isCargando}
                />
              </div>
            </div>

            {/* Campo Dirección */}
            <div className="relative">
              <label htmlFor="direccion" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <input
                  id="direccion"
                  name="direccion"
                  type="text"
                  required
                  className="appearance-none relative block w-full pl-7 sm:pl-8 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:shadow-lg transition-all duration-200 text-sm"
                  placeholder="Tu dirección"
                  value={formData.direccion}
                  onChange={handleChange}
                  disabled={isCargando}
                />
              </div>
              </div>

            {/* Campo Zona */}
            <div className="relative">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Zona
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, zona: 'norte' })}
                  disabled={isCargando}
                  className={`p-2 text-xs sm:text-sm rounded-lg border transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                    formData.zona === 'norte'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                  }`}
                >
                  Zona Norte
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, zona: 'centro' })}
                  disabled={isCargando}
                  className={`p-2 text-xs sm:text-sm rounded-lg border transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                    formData.zona === 'centro'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                  }`}
                >
                  Zona Centro
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, zona: 'sur' })}
                  disabled={isCargando}
                  className={`p-2 text-xs sm:text-sm rounded-lg border transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                    formData.zona === 'sur'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                  }`}
                >
                  Zona Sur
                </button>
              </div>
            </div>

            {/* Campo Barrio */}
            <div className="relative">
              <label htmlFor="barrio" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Barrio
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <input
                  id="barrio"
                  name="barrio"
                  type="text"
                  required
                  className="appearance-none relative block w-full pl-7 sm:pl-8 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:shadow-lg transition-all duration-200 text-sm"
                  placeholder="Tu barrio"
                  value={formData.barrio}
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
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isCargando}
                />
              </div>
            </div>

            {/* Campo Confirmar Contraseña */}
            <div className="relative">
              <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Confirmar contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="appearance-none relative block w-full pl-7 sm:pl-8 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:shadow-lg transition-all duration-200 text-sm"
                  placeholder="Repite tu contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isCargando}
                />
              </div>
            </div>
          </div>

          {/* Botón de registro - Compacto */}
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
                  <span className="text-sm">Creando cuenta...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-sm">Crear cuenta</span>
                </div>
              )}
            </button>
          </div>

          {/* Enlace de login - Compacto */}
          <div className="text-center pt-2">
            <p className="text-xs sm:text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link 
                to="/login" 
                className="font-medium text-orange-600 hover:text-orange-500 transition-colors duration-200"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>

           {/* Enlaces */}
           <div className="text-center pt-4">
          
            <p className="text-sm text-gray-600 mt-2">
              ¿Eres usuario que busca servicios?{' '}
              <Link 
                to="/login-profesional" 
                className="font-medium text-orange-600 hover:text-orange-500 transition-colors duration-200"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>

          {/* Información adicional - Compacto y condicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-2">
                <p className="text-xs text-blue-700">
                  Al crear una cuenta, aceptas nuestros términos de servicio y política de privacidad.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

    </div>
  );
};

export default Register; 