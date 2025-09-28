import React, { useState, useEffect } from 'react';
import { ImageUploader } from './ImageUploader';
import { useAuth } from '../contexts/AuthContext';
import BusquedaAvanzada from './uiDashboardUser/BusquedaAvanzada';

// Este componente no recibe props opcionales.
export const FormularioMascota = ({onAgregarMascota, isCargando }) => {
  const { usuario } = useAuth();
  
  // Tabs
  const [tab, setTab] = useState(0);

  // Identificación simple
  const [nombre, setNombre] = useState('');
  const [razaSeleccionada, setRazaSeleccionada] = useState('');
  const [raza, setRaza] = useState('');
  const [edad, setEdad] = useState('');
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
    if (!nombre || !raza || !edad) return;
    
    const mascotaConId = {
      id: mascotaId, // Usar el ID generado al inicio
      nombre,
      raza: razaSeleccionada || raza,
      edad: Number(edad),
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
    setEdad('');
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
      className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-2 sm:p-4 md:p-6 space-y-4"
    >
      {/* Tabs responsivos */}
      <div className="flex flex-col sm:flex-row border-b border-orange-200 mb-4">
        <button
          type="button"
          className={tabClasses(tab === 0) + " w-full sm:w-auto mb-2 sm:mb-0"}
          onClick={() => setTab(0)}
        >
          Identificación
        </button>
        <button
          type="button"
          className={tabClasses(tab === 1) + " w-full sm:w-auto"}
          onClick={() => setTab(1)}
        >
          Busqueda avanzada
        </button>
      </div>

      {/* Tab content */}
      <div className="transition-all duration-500">
        {tab === 0 && (
          <div className="animate-fade-in flex flex-col gap-3">
            <input
              className="border rounded px-3 py-2 w-full text-base"
              placeholder="Nombre"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              required
            />
            <div className="relative">
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
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <input
              className="border rounded px-3 py-2 w-full text-base"
              placeholder="Edad"
              type="number"
              min="0"
              value={edad}
              onChange={e => setEdad(e.target.value)}
              required
            />
            <input
              className="border rounded px-3 py-2 w-full text-base"
              placeholder="Color"
              value={color}
              onChange={e => setColor(e.target.value)}
            />
            <ImageUploader
              onImageSelect={setArchivoImagen}
              onImageUploaded={setUrlImagenMascota}
              isCargando={isCargando}
              userId={usuario?.uid}
              petId={mascotaId}
            />
         {/*    <input
              className="border rounded px-3 py-2 w-full text-base"
              placeholder="Contacto de emergencia"
              value={contacto}
              onChange={e => setContacto(e.target.value)}
            /> */}
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
      </div>

      <button
        type="submit"
        className="bg-orange-500 text-white px-4 py-3 rounded w-full font-semibold shadow-md hover:bg-orange-600 transition-all duration-300 text-base"
        disabled={isCargando}
      >
        {isCargando ? 'Agregando...' : 'Agregar Mascota'}
      </button>

      {/* Animación fade-in (Tailwind + CSS) */}
      <style>
        {`
          .animate-fade-in {
            animation: fadeIn 0.5s;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px);}
            to { opacity: 1; transform: translateY(0);}
          }
        `}
      </style>
    </form>
  );
}; 