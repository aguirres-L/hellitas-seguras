import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  createUserWithEmailAndPassword,
  updateProfile 
} from 'firebase/auth';
import { auth, addDataWithCustomId } from '../data/firebase';
import { useAuth } from '../contexts/AuthContext';
import DecoracionForm from './decoracionUi/DecoracionForm';
import { ImageUploaderProfesional } from './ImageUploaderProfesional';
import logo11 from '../assets/new-logo11.png';

// Este componente no recibe props

// Array de objetos con datos y estilos de cada tipo de profesional
const tiposProfesional = [
  {
    tipo: 'veterinario',
    nombre: 'Veterinaria',
    color: 'blue',
    icono: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    descripcion: 'Atención  Veterinaria'
  },
  {
    tipo: 'peluquero',
    nombre: 'Peluquería',
    color: 'violet',
    icono: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
      </svg>
    ),
    descripcion: 'Corte y Baño'
  },
     {
     tipo: 'tienda',
     nombre: 'Tienda',
     color: 'green',
     icono: (
       <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
       </svg>
     ),
     descripcion: 'Alimentos y Accesorios'
   }
];

const RegisterProfesional = () => {
  const navigate = useNavigate();
  const { isAutenticado, tipoUsuario, isCargando } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '', 
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    tipoProfesional: 'veterinario', // 'veterinario' o 'peluquero'
    especialidad: '',
    direccion: '',
    zona: 'norte',
    barrio: '',
    horario: '',
    experiencia: '',
    licencia: ''
  });
  const [isRegistrando, setIsRegistrando] = useState(false);
  const [error, setError] = useState('');
  
  // Estados para manejo de imagen
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [urlImagenLocal, setUrlImagenLocal] = useState('');
  const [isSubiendoImagen, setIsSubiendoImagen] = useState(false);
  let logo = '../../assets/new-logo11.png';

  // Redirigir si ya está autenticado como profesional
  useEffect(() => {
    if (isAutenticado && tipoUsuario === 'profesional' && !isCargando) {
      navigate('/dashboardProfesional');
    }
  }, [isAutenticado, tipoUsuario, isCargando, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsRegistrando(true);

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsRegistrando(false);
      return;
    }

    // Validar teléfono (exactamente 10 dígitos)
    const telefonoLimpio = formData.telefono.replace(/[^\d]/g, '');
    if (telefonoLimpio.length !== 10) {
      setError('El teléfono debe tener exactamente 10 dígitos');
      setIsRegistrando(false);
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

      // Si hay una imagen seleccionada, subirla primero
      let urlImagenFinal = urlImagenLocal;
      if (archivoImagen && !urlImagenLocal) {
        try {
          setIsSubiendoImagen(true);
          const { subirImagenProfesional } = await import('../data/firebase/firebase');
          urlImagenFinal = await subirImagenProfesional(userCredential.user.uid, archivoImagen);
          console.log('✅ Imagen del local subida exitosamente:', urlImagenFinal);
        } catch (error) {
          console.error('❌ Error al subir imagen del local:', error);
          // Continuar sin imagen si hay error
        } finally {
          setIsSubiendoImagen(false);
        }
      }

      // Guardar datos del profesional en Firestore
      await addDataWithCustomId('profesionales', userCredential.user.uid, {
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
        tipoProfesional: formData.tipoProfesional,
        especialidad: formData.especialidad,
        direccion: formData.direccion,
        ubicacion: {
          zona: formData.zona,
          barrio: formData.barrio,
          direccion: formData.direccion
        },
        horario: formData.horario,
        experiencia: formData.experiencia,
        licencia: formData.licencia,
        fotoLocalUrl: urlImagenFinal, // Agregar URL de la imagen del local
        rol: 'profesional',
        fechaRegistro: new Date(),
        estado: 'activo'
      });

      console.log('Profesional registrado exitosamente:', userCredential.user);
      // La navegación se manejará automáticamente por el useEffect cuando se actualice el estado
      navigate('/dashboardProfesional');
      
    } catch (error) {
      console.error('Error al registrar profesional:', error);
      
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
      setIsRegistrando(false);
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

  // Función para manejar la selección del tipo de profesional
  const handleTipoProfesionalChange = (tipo) => {
    setFormData({
      ...formData,
      tipoProfesional: tipo
    });
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Fondo decorativo */}
      <DecoracionForm isFullScreen={true} />

      <div className="relative w-full max-w-md lg:max-w-lg">
        {/* Logo y título */}
        <div className="text-center mb-6">
             <div onClick={() => navigate('/')} className="mx-auto cursor-pointer  h-16 w-16 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg mb-4">
                      <img src={logo11} alt="" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Huellitas Seguras
          </h1>
          <p className="text-gray-600 mb-2">
            Para profesionales veterinarios y peluqueros
          </p>
          <h2 className="text-xl font-semibold text-gray-800">
            Registro Profesional
          </h2>
        </div>
        
        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md shadow-sm mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form className="space-y-1" onSubmit={handleSubmit}>
          {/* Tipo de Profesional - Botones personalizados */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Usuario
            </label>
                        <div className="flex flex-row gap-3">
              {tiposProfesional.map((profesional) => (
                <button
                  key={profesional.tipo}
                  type="button"
                  onClick={() => handleTipoProfesionalChange(profesional.tipo)}
                  disabled={isRegistrando}
                  className={`
                    flex-1 relative p-3 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-0
                    ${formData.tipoProfesional === profesional.tipo 
                      ? profesional.color === 'blue'
                        ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100'
                        : profesional.color === 'violet'
                        ? 'border-violet-500 bg-violet-50 shadow-lg shadow-violet-100'
                        : 'border-green-500 bg-green-50 shadow-lg shadow-green-100'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex flex-col items-center space-y-2 text-center">
                    <div className={`
                      p-2 rounded-lg
                      ${formData.tipoProfesional === profesional.tipo
                        ? profesional.color === 'blue'
                          ? 'bg-blue-500 text-white'
                          : profesional.color === 'violet'
                          ? 'bg-violet-500 text-white'
                          : 'bg-green-500 text-white'
                        : profesional.color === 'blue'
                          ? 'bg-blue-100 text-blue-600'
                          : profesional.color === 'violet'
                          ? 'bg-violet-100 text-violet-600'
                          : 'bg-green-100 text-green-600'
                      }
                    `}>
                      {profesional.icono}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`
                        font-semibold text-sm truncate
                        ${formData.tipoProfesional === profesional.tipo
                          ? profesional.color === 'blue'
                            ? 'text-blue-900'
                            : profesional.color === 'violet'
                            ? 'text-violet-900'
                            : 'text-green-900'
                          : 'text-gray-900'
                        }
                      `}>
                        {profesional.nombre}
                      </h3>
                                            <p className={`
                        hidden sm:block text-xs text-gray-600 truncate
                      `}>
                        {profesional.descripcion}
                      </p>
                    </div>
                    {formData.tipoProfesional === profesional.tipo && (
                      <div className={`
                        absolute top-2 right-2 p-1 rounded-full
                        ${profesional.color === 'blue' ? 'bg-blue-500' : profesional.color === 'violet' ? 'bg-violet-500' : 'bg-green-500'}
                      `}>
                        <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre completo
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                id="nombre"
                name="nombre"
                type="text"
                required
                className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Tu nombre completo"
                value={formData.nombre}
                onChange={handleChange}
                disabled={isRegistrando}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isRegistrando}
              />
            </div>
          </div>

          {/* Teléfono */}
          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                required
                className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="+34 123 456 789"
                value={formData.telefono}
                onChange={handleChange}
                disabled={isRegistrando}
              />
            </div>
          </div>

          {/* Especialidad */}
          <div>
            <label htmlFor="especialidad" className="block text-sm font-medium text-gray-700 mb-2">
              Especialidad
            </label>
            <input
              id="especialidad"
              name="especialidad"
              type="text"
              required
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder={formData.tipoProfesional === 'veterinario' ? 'Cirugía, Dermatología, etc.' : formData.tipoProfesional === 'peluquero' ? 'Corte de raza, Baño terapéutico, etc.' : 'Alimentos, Juguetes, Accesorios, etc.'}
              value={formData.especialidad}
              onChange={handleChange}
              disabled={isRegistrando}
            />
          </div>

          {/* Dirección */}
          <div>
            <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-2">
              Dirección del establecimiento
            </label>
            <input
              id="direccion"
              name="direccion"
              type="text"
              required
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Av. Principal 123, Ciudad"
              value={formData.direccion}
              onChange={handleChange}
              disabled={isRegistrando}
            />
          </div>

          {/* Zona */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zona
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, zona: 'norte' })}
                disabled={isRegistrando}
                className={`p-2 text-sm rounded-lg border transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed ${
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
                disabled={isRegistrando}
                className={`p-2 text-sm rounded-lg border transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                  formData.zona === 'sur'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                }`}
              >
                Zona Sur
              </button>
            </div>
          </div>

          {/* Barrio */}
          <div>
            <label htmlFor="barrio" className="block text-sm font-medium text-gray-700 mb-2">
              Barrio
            </label>
            <input
              id="barrio"
              name="barrio"
              type="text"
              required
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Tu barrio"
              value={formData.barrio}
              onChange={handleChange}
              disabled={isRegistrando}
            />
          </div>

          {/* Horario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Horario de atención
            </label>
            
            {/* Horarios predefinidos */}
            <div className="mb-4">
              <p className="text-xs text-gray-600 mb-2">Horarios comunes:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { nombre: 'Comercial estándar', horario: 'Lun-Vie: 9:00-18:00, Sáb: 9:00-14:00' },
                  { nombre: 'Extendido', horario: 'Lun-Vie: 8:00-20:00, Sáb: 8:00-18:00' },
                  { nombre: 'Fines de semana', horario: 'Lun-Vie: 10:00-19:00, Sáb-Dom: 9:00-17:00' },
                  { nombre: '24/7', horario: 'Todos los días: 24 horas' }
                ].map((opcion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setFormData({...formData, horario: opcion.horario})}
                    disabled={isRegistrando}
                    className={`
                      p-2 text-xs rounded-lg border transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed
                      ${formData.horario === opcion.horario
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                      }
                    `}
                  >
                    <div className="font-medium">{opcion.nombre}</div>
                    <div className="text-xs opacity-75">{opcion.horario}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Horario personalizado */}
            <div className="space-y-3">
              <p className="text-xs text-gray-600">O configura tu horario personalizado:</p>
              
              {/* Input para horario personalizado */}
              <div>
                <input
                  id="horario"
                  name="horario"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  placeholder="Ej: Lun-Vie: 9:00-18:00, Sáb: 9:00-14:00"
                  value={formData.horario}
                  onChange={handleChange}
                  disabled={isRegistrando}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Escribe tu horario personalizado o selecciona uno de arriba
                </p>
              </div>
            </div>
          </div>

          {/* Años de experiencia */}
          <div>
            <label htmlFor="experiencia" className="block text-sm font-medium text-gray-700 mb-2">
              Años de experiencia
            </label>
            <input
              id="experiencia"
              name="experiencia"
              type="number"
              min="0"
              required
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="5"
              value={formData.experiencia}
              onChange={handleChange}
              disabled={isRegistrando}
            />
          </div>

          {/* Número de licencia */}
          {formData.tipoProfesional === 'veterinario' && (
          <div>
            <label htmlFor="licencia" className="block text-sm font-medium text-gray-700 mb-2">
              Número de licencia profesional
            </label>
            <input
              id="licencia"
              name="licencia"
              type="text"
              required
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Número de licencia o registro profesional"
              value={formData.licencia}
              onChange={handleChange}
              disabled={isRegistrando}
            />
          </div>
          )}

          {/* Foto del local */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto del local (opcional)
            </label>
            <ImageUploaderProfesional
              onImageSelect={setArchivoImagen}
              onImageUploaded={setUrlImagenLocal}
              isCargando={isRegistrando || isSubiendoImagen}
              profesionalId={formData.email} // Usar email como ID temporal hasta que se cree el usuario
            />
            <p className="text-xs text-gray-500 mt-1">
              Sube una foto de tu local para generar confianza en los usuarios
            </p>
          </div>
          {/* Contraseña */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={handleChange}
                disabled={isRegistrando}
              />
            </div>
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Repite tu contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isRegistrando}
              />
            </div>
          </div>

          {/* Botón de registro */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isRegistrando}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105 shadow-lg"
            >
              {isRegistrando ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creando cuenta profesional...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Crear cuenta profesional</span>
                </div>
              )}
            </button>
          </div>

          {/* Enlaces */}
          <div className="text-center pt-4">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta profesional?{' '}
              <Link 
                to="/login-profesional" 
                className="font-medium text-orange-600 hover:text-orange-500 transition-colors duration-200"
              >
                Inicia sesión aquí
              </Link>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              ¿Eres usuario común?{' '}
              <Link 
                to="/register" 
                className="font-medium text-orange-600 hover:text-orange-500 transition-colors duration-200"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Como profesional podrás acceder a los perfiles de mascotas para actualizar información médica y de cuidados.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterProfesional; 