import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { buscarMascotaPorId } from '../data/firebase/firebase';
import DecoracionForm from './decoracionUi/DecoracionForm';

// Este componente no requiere autenticación y muestra información básica de mascotas
const PetProfilePublic = () => {
  const { id } = useParams();
  const [mascota, setMascota] = useState(null);
  const [isCargando, setIsCargando] = useState(true); 
  const [error, setError] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);

  // Cargar datos de la mascota específica desde todos los usuarios
  useEffect(() => {
    const cargarMascota = async () => {
      if (!id) {
        setError('ID de mascota no válido');
        setIsCargando(false);
        return;
      }

      try {
        setIsCargando(true);
        
        // Buscar la mascota por ID usando la nueva función
        const resultado = await buscarMascotaPorId(id);
        
        if (!resultado) {
          setError('Mascota no encontrada');
          setIsCargando(false);
          return;
        }

        // Combinar datos de la mascota con información del propietario
        setMascota({
          ...resultado.mascota,
          propietario: resultado.propietario
        });

      } catch (error) {
        console.error('Error al cargar mascota:', error);
        setError('Error al cargar la información de la mascota');
      } finally {
        setIsCargando(false);
      }
    };

    cargarMascota();
  }, [id]);


  // Función para abrir el modal con la foto
  const abrirModal = () => {
    setModalAbierto(true);
    document.body.style.overflow = 'hidden'; // Deshabilitar scroll
  };

  // Función para cerrar el modal
  const cerrarModal = () => {
    setModalAbierto(false);
    document.body.style.overflow = 'auto'; // Habilitar scroll
  };


  // Navbar simplificado sin dependencias de autenticación
  const NavbarPublic = () => (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-sm shadow-lg p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo y título */}
        <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200">
          <div className="h-8 w-8 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            Huellitas Seguras
          </h1>
        </Link>
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
          <Link 
            to="/login" 
            className="text-gray-700 hover:text-orange-600 transition-colors duration-200 font-medium px-4 py-2"
            onClick={() => setMenuAbierto(false)}
          >
            Iniciar Sesión
          </Link>
          <Link 
            to="/register" 
            className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
            onClick={() => setMenuAbierto(false)}
          >
            Registrarse
          </Link>
        </div>
      </div>
    </nav>
  );

  // Si está cargando, mostrar spinner
  if (isCargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50">
        {/* Fondo decorativo */}
       <DecoracionForm isFullScreen={true} />

        <NavbarPublic />
        <div className="relative container mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              <p className="mt-4 text-gray-600">Cargando información de la mascota...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si hay error, mostrar mensaje
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50">
        {/* Fondo decorativo */}
        <DecoracionForm isFullScreen={true} />

        <NavbarPublic />
        <div className="relative container mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md mx-auto">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Mascota no encontrada</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <Link 
              to="/" 
              className="inline-flex items-center text-orange-600 hover:text-orange-700 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay mascota, no debería llegar aquí pero por seguridad
  if (!mascota) {
    return null;
  }

console.log(mascota,'mascota');


  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <DecoracionForm isFullScreen={true} />
      </div>

      <NavbarPublic />

      {/* Modal para la foto */}
      {modalAbierto && (
        <div className="photo-modal">
          <div className="photo-modal-overlay" onClick={cerrarModal}></div>
          <div className="photo-modal-content">
            <button className="photo-modal-close" onClick={cerrarModal}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img 
              src={mascota.fotoUrl || "/dog-avatar.png"} 
              alt={mascota.nombre} 
              className="photo-modal-image" 
            />
            <div className="photo-modal-caption">
              <p className="text-lg font-semibold">{mascota.nombre}</p>
              <p className="text-sm text-gray-600">{mascota.raza} • {mascota.edad} años</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Mascota Encontrada
          </h1>
          <p className="text-gray-600">
            Esta mascota tiene un chip de identificación. Por favor, contacta a su dueño.
          </p>
        </div>

        {/* Contenido Principal */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-6">
            {/* Información de la Mascota */}
            <div className="flex flex-col md:flex-row items-start md:items-center mb-6">
              <div className="relative">
              <img 
                  src={mascota.fotoUrl || "/dog-avatar.png"} 
                  alt={mascota.nombre} 
                  className="w-24 h-24 rounded-full mr-6 mb-4 md:mb-0 border-4 border-orange-100 shadow-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={abrirModal}
                />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{mascota.nombre}</h2>
                <p className="text-gray-600 mb-3">{mascota.raza} • {mascota.edad} años</p>
                {mascota.color && (
                  <p className="text-gray-600">Color: {mascota.color}</p>
                )}
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="bg-orange-50 rounded-lg p-6 mb-6">
              <h3 className="font-bold text-lg mb-4 text-orange-800">Información de Contacto</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Dueño</p>
                    <p className="font-medium">{mascota.propietario.nombre}</p>
                  </div>
                </div>
                
                {mascota.propietario.telefono && (
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Teléfono</p>
                      <a 
                        href={`tel:${mascota.propietario.telefono}`}
                        className="font-medium text-orange-600 hover:text-orange-700 transition-colors"
                      >
                        {mascota.propietario.telefono}
                      </a>
                    </div>
                  </div>
                )}

                {mascota.propietario.email && (
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Email</p>
                      <a 
                        href={`mailto:${mascota.propietario.email}`}
                        className="font-medium text-orange-600 hover:text-orange-700 transition-colors"
                      >
                        {mascota.propietario.email}
                      </a>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Información Adicional */}
            {mascota.contacto && (
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h3 className="font-bold text-lg mb-4 text-blue-800">Contacto de Emergencia</h3>
                <p className="text-blue-700">{mascota.contacto}</p>
              </div>
            )}

            {/* Alergias o Enfermedades Importantes */}
            {(mascota.alergias || mascota.enfermedades) && (
              <div className="bg-red-50 rounded-lg p-6 mb-6">
                <h3 className="font-bold text-lg mb-4 text-red-800">Información Médica Importante</h3>
                {mascota.alergias && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-red-700">Alergias:</p>
                    <p className="text-red-600">{mascota.alergias}</p>
                  </div>
                )}
                {mascota.enfermedades && (
                  <div>
                    <p className="text-sm font-medium text-red-700">Enfermedades:</p>
                    <p className="text-red-600">{mascota.enfermedades}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="text-green-600 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">¡Gracias por tu ayuda!</h3>
              <p className="text-green-700 mb-4">
                Al contactar al dueño, estás ayudando a reunir a {mascota.nombre} con su familia.
              </p>
              <Link 
                to="/" 
                className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetProfilePublic; 