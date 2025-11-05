import React, { useState, useEffect } from 'react';
import { ImageUploader } from './ImageUploader';
import { useAuth } from '../contexts/AuthContext';
import BusquedaAvanzada from './uiDashboardUser/BusquedaAvanzada';
import BusquedaAvanzadaGatos from './uiDashboardUser/BusquedaAvanzadaGatos';
import BusquedaOtrosAnimales from './uiDashboardUser/BusquedaOtrosAnimales';

// Este componente no recibe props opcionales.
export const FormularioMascota = ({onAgregarMascota, isCargando }) => {
  const { usuario } = useAuth();
  
  // Tabs
  const [tab, setTab] = useState(0);

  // Identificación simple
  const [nombre, setNombre] = useState('');
  const [razaSeleccionada, setRazaSeleccionada] = useState('');
  const [raza, setRaza] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [edadCalculada, setEdadCalculada] = useState('');
  const [color, setColor] = useState('');
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [urlImagenMascota, setUrlImagenMascota] = useState('');
  const [contacto, setContacto] = useState('');


  // Detalles avanzados
  const [vacunas, setVacunas] = useState([{ nombre: '', fecha: '' }]);
  const [alergias, setAlergias] = useState('');
  const [enfermedades, setEnfermedades] = useState('');
  const [notas, setNotas] = useState('');

  // Función para generar ID único
  const generarIdUnico = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${timestamp}-${random}`;
  };

  // Generar ID único para esta mascota (una sola vez)
  const [mascotaId] = useState(() => generarIdUnico());

  // Función para calcular edad desde fecha de nacimiento
  const calcularEdad = (fechaNac) => {
    if (!fechaNac) return '';
    
    const hoy = new Date();
    const nacimiento = new Date(fechaNac);
    
    // Validar que la fecha no sea futura
    if (nacimiento > hoy) return 'Fecha inválida';
    
    let años = hoy.getFullYear() - nacimiento.getFullYear();
    let meses = hoy.getMonth() - nacimiento.getMonth();
    let días = hoy.getDate() - nacimiento.getDate();
    
    // Ajustar si el día aún no ha llegado este mes
    if (días < 0) {
      meses--;
      const ultimoMes = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
      días += ultimoMes.getDate();
    }
    
    // Ajustar si el mes aún no ha llegado este año
    if (meses < 0) {
      años--;
      meses += 12;
    }
    
    // Formatear resultado
    if (años === 0) {
      if (meses === 0) {
        return `${días} día${días !== 1 ? 's' : ''}`;
      }
      return `${meses} mes${meses !== 1 ? 'es' : ''}`;
    }
    
    if (meses === 0) {
      return `${años} año${años !== 1 ? 's' : ''}`;
    }
    
    return `${años} año${años !== 1 ? 's' : ''} y ${meses} mes${meses !== 1 ? 'es' : ''}`;
  };

  // Función para calcular edad numérica (en años con decimales)
  const calcularEdadNumerica = (fechaNac) => {
    if (!fechaNac) return 0;
    
    const hoy = new Date();
    const nacimiento = new Date(fechaNac);
    
    if (nacimiento > hoy) return 0;
    
    const diferenciaMs = hoy - nacimiento;
    const años = diferenciaMs / (1000 * 60 * 60 * 24 * 365.25); // 365.25 para considerar años bisiestos
    
    return Math.round(años * 10) / 10; // Redondear a 1 decimal
  };

  // Calcular edad automáticamente cuando cambia la fecha de nacimiento
  useEffect(() => {
    const edad = calcularEdad(fechaNacimiento);
    setEdadCalculada(edad);
  }, [fechaNacimiento]);

  // Sincronizar raza seleccionada con el campo de raza
  useEffect(() => {
    if (razaSeleccionada) {
      setRaza(razaSeleccionada);
      // Cambiar automáticamente al tab de identificación para mostrar la raza seleccionada
      setTab(0);
    }
  }, [razaSeleccionada]);

  // Animación simple para tabs
  const tabClasses = (active) =>
    `px-4 py-2 rounded-t-lg font-semibold transition-all duration-300 ${
      active
        ? 'bg-orange-500 text-white shadow-lg scale-105'
        : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
    }`;

  // Manejo de vacunas dinámicas
  const handleVacunaChange = (idx, field, value) => {
    const nuevasVacunas = vacunas.map((v, i) =>
      i === idx ? { ...v, [field]: value } : v
    );
    setVacunas(nuevasVacunas);
  };
  const agregarVacuna = () => setVacunas([...vacunas, { nombre: '', fecha: '' }]);
  const eliminarVacuna = (idx) =>
    setVacunas(vacunas.filter((_, i) => i !== idx));

  // Envío
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre || !raza || !fechaNacimiento) return;
    
    const mascotaConId = {
      id: mascotaId, // Usar el ID generado al inicio
      nombre,
      raza: razaSeleccionada || raza,
      fechaNacimiento, // Guardar fecha de nacimiento
      edad: edadCalculada, // Guardar edad calculada como string legible
      edadNumerica: calcularEdadNumerica(fechaNacimiento), // Para cálculos futuros
      color,
      fotoUrl: urlImagenMascota, // Usar la URL de la imagen subida
      contacto,
      vacunas: vacunas.filter(v => v.nombre && v.fecha),
      alergias,
      enfermedades,
      notas,
      estadoChapita: false,
      fechaCreacion: new Date().toISOString(), // Agregar fecha de creación
    };
    
    onAgregarMascota(mascotaConId);
    
    // Limpia el formulario
    setNombre('');
    setRaza('');
    setRazaSeleccionada('');
    setFechaNacimiento('');
    setEdadCalculada('');
    setColor('');
    setArchivoImagen(null);
    setUrlImagenMascota('');
    setContacto('');
    setVacunas([{ nombre: '', fecha: '' }]);
    setAlergias('');
    setEnfermedades('');
    setNotas('');
    setTab(0);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-2 sm:p-4 md:p-6 "
    >
      {/* Header con Tab y Avatar */}
      <div className="flex items-center justify-between  pb-4 gap-4">
        {/* Tab Identificación */}
        <button
          type="button"
          className={tabClasses(tab === 0) + " flex-shrink-0"}
          onClick={() => setTab(0)}
        >
          {tab === 1 || tab === 2 || tab === 3 ? 'Volver' : 'Identificación'}
        </button>
        
        {/* Avatar de mascota - componente de imagen compacto */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <label className="block text-xs font-medium text-gray-600 mb-2 text-center">
            Foto de mascota
          </label>
          <div className="relative avatar-container" style={{ width: '80px', height: '80px' }}>
            <ImageUploader
              onImageSelect={setArchivoImagen}
              onImageUploaded={setUrlImagenMascota}
              isCargando={isCargando}
              userId={usuario?.uid}
              petId={mascotaId}
              imagenActual={urlImagenMascota}
              className="avatar-upload-compact"
            />
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="transition-all duration-500">
        {tab === 0 && (
          <div className="animate-fade-in flex flex-col gap-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              className="border rounded px-3 py-2 w-full text-base"
              placeholder="Nombre"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              required
            />
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Raza</label>
              <input
                className={`border rounded px-3 py-2 w-full text-base ${
                  razaSeleccionada ? 'border-green-400 bg-green-50' : 'border-gray-300'
                }`}
                placeholder="Raza"
                value={raza}
                onChange={e => setRaza(e.target.value)}
                required
              />
              {razaSeleccionada && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}


              <div className="flex flex-wrap gap-3 justify-end mt-2">
              <button
                type="button"
                className={tabClasses(tab === 1) + " w-full sm:w-auto"}
                onClick={() => setTab(1)}
              >
                Razas de Perros
              </button>
              <button
                type="button"
                className={tabClasses(tab === 2) + " w-full sm:w-auto"}
                onClick={() => setTab(2)}
              >
                Razas de Gatos
              </button>
              <button
                type="button"
                className={tabClasses(tab === 3) + " w-full sm:w-auto"}
                onClick={() => setTab(3)}
              >
                Otros Animales
              </button>
              </div>

            </div>

            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de nacimiento
              </label>
              <input
                className="border rounded px-3 py-2 w-full text-base"
                type="date"
                value={fechaNacimiento}
                onChange={e => setFechaNacimiento(e.target.value)}
                max={new Date().toISOString().split('T')[0]} // No permitir fechas futuras
                required
              />
              {edadCalculada && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <svg className="h-4 w-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-xs text-blue-600 font-medium">Edad calculada:</p>
                      <p className="text-sm font-semibold text-blue-800">
                        {edadCalculada}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <input
              className="border rounded px-3 py-2 w-full text-base"
              placeholder="Color"
              value={color}
              onChange={e => setColor(e.target.value)}
            />
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas Adicionales</label>
            <textarea
              className="border rounded px-3 py-2 mb-4 w-full text-base"
              placeholder="Ejemplo: Perro guía - Mi acompañante necesita de mí para desplazarse"
              name  ="notas"
              value={notas}
              onChange={e => setNotas(e.target.value)}
              rows={3}
            />
          </div>
        )}

        {tab === 1 && (
          <div className="space-y-4">
            <BusquedaAvanzada 
              onRazaSeleccionada={setRazaSeleccionada}
              razaSeleccionada={razaSeleccionada}
            />
            
            {/* Indicador de raza seleccionada */}
            {razaSeleccionada && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm text-green-600 font-medium">Raza seleccionada:</p>
                    <p className="text-lg font-semibold text-green-800 capitalize">
                      {razaSeleccionada}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Esta raza se ha agregado automáticamente al formulario
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 2 && (
          <div className="space-y-4">
            <BusquedaAvanzadaGatos 
              onRazaSeleccionada={setRazaSeleccionada}
              razaSeleccionada={razaSeleccionada}
            />
            
            {/* Indicador de raza seleccionada */}
            {razaSeleccionada && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm text-green-600 font-medium">Raza seleccionada:</p>
                    <p className="text-lg font-semibold text-green-800 capitalize">
                      {razaSeleccionada}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Esta raza se ha agregado automáticamente al formulario
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 3 && (
          <div className="space-y-4">
            <BusquedaOtrosAnimales 
              onRazaSeleccionada={setRazaSeleccionada}
              razaSeleccionada={razaSeleccionada}
            />
            
            {/* Indicador de tipo seleccionado */}
            {razaSeleccionada && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm text-green-600 font-medium">Tipo seleccionado:</p>
                    <p className="text-lg font-semibold text-green-800 capitalize">
                      {razaSeleccionada}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Este tipo se ha agregado automáticamente al formulario
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      { (tab === 0 || tab === 1 || tab === 2 || tab === 3) && (
        <button
          type="submit"
          className="bg-orange-500 text-white px-4 py-3 rounded w-full font-semibold shadow-md hover:bg-orange-600 transition-all duration-300 text-base"
          disabled={isCargando}
        >
          {isCargando ? 'Agregando...' : 'Agregar Mascota'}
        </button>
      )}

      {/* Animación fade-in y estilos para avatar compacto (Tailwind + CSS) */}
      <style>
        {`
          .animate-fade-in {
            animation: fadeIn 0.5s;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px);}
            to { opacity: 1; transform: translateY(0);}
          }
          
          /* Contenedor del avatar - tamaño fijo */
          .avatar-container {
            width: 80px !important;
            height: 80px !important;
            max-width: 80px !important;
            max-height: 80px !important;
            overflow: hidden !important;
          }
          
          /* Estilos para avatar compacto - forzar tamaño */
          .avatar-upload-compact {
            width: 80px !important;
            height: 80px !important;
            max-width: 80px !important;
            max-height: 80px !important;
            overflow: hidden !important;
          }
          
          /* Área de carga del ImageUploader */
          .avatar-upload-compact > div,
          .avatar-upload-compact .border-2,
          .avatar-upload-compact .border-dashed {
            width: 80px !important;
            height: 80px !important;
            min-width: 80px !important;
            min-height: 80px !important;
            max-width: 80px !important;
            max-height: 80px !important;
            padding: 0 !important;
            margin: 0 !important;
            border-radius: 50% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            overflow: hidden !important;
            border-width: 2px !important;
          }
          
          /* Imagen dentro del avatar */
          .avatar-upload-compact img,
          .avatar-upload-compact .relative img {
            width: 80px !important;
            height: 80px !important;
            min-width: 80px !important;
            min-height: 80px !important;
            max-width: 80px !important;
            max-height: 80px !important;
            object-fit: cover !important;
            border-radius: 50% !important;
            display: block !important;
          }
          
          /* Contenedor de imagen */
          .avatar-upload-compact .relative {
            width: 80px !important;
            height: 80px !important;
            max-width: 80px !important;
            max-height: 80px !important;
            overflow: hidden !important;
            border-radius: 50% !important;
          }
          
          /* Ocultar todos los textos y elementos innecesarios */
          .avatar-upload-compact .space-y-3,
          .avatar-upload-compact .text-lg,
          .avatar-upload-compact .text-sm,
          .avatar-upload-compact .text-xs,
          .avatar-upload-compact p,
          .avatar-upload-compact .mt-2 {
            display: none !important;
          }
          
          /* Botón de eliminar imagen - ajustar posición */
          .avatar-upload-compact button[type="button"] {
            position: absolute !important;
            top: -4px !important;
            right: -4px !important;
            width: 20px !important;
            height: 20px !important;
            min-width: 20px !important;
            min-height: 20px !important;
            font-size: 14px !important;
            line-height: 1 !important;
            z-index: 10 !important;
          }
          
          /* Icono de cámara cuando no hay imagen */
          .avatar-upload-compact .w-16,
          .avatar-upload-compact .h-16,
          .avatar-upload-compact svg {
            width: 32px !important;
            height: 32px !important;
            max-width: 32px !important;
            max-height: 32px !important;
          }
          
          /* Spinner de carga */
          .avatar-upload-compact .animate-spin {
            width: 24px !important;
            height: 24px !important;
            max-width: 24px !important;
            max-height: 24px !important;
          }
        `}
      </style>
    </form>
  );
}; 