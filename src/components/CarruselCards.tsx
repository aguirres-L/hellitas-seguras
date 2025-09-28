import React, { useState, useEffect } from 'react';

// Este componente recibe props
export interface CarruselCardsProps {
  titulo: string;
  items: Array<{
    id: string;
    nombre: string;
    direccion: string;
    telefono: string;
    horario: string;
    calificacion: string;
    distancia: string;
    especialidades?: string[];
    servicios?: string[];
  }>;
  colorPrimario: string;
  colorSecundario: string;
  textoBoton: string;
  onAgendarCita: (item: any) => void;
  onVerDetalles?: (item: any) => void;
}

export default function CarruselCards({
  titulo,
  items,
  colorPrimario,
  colorSecundario,
  textoBoton,
  onAgendarCita,
  onVerDetalles
}: CarruselCardsProps) {
  const [indiceActual, setIndiceActual] = useState(0);
  const [cardsPorVista, setCardsPorVista] = useState(1);

  // Determinar cuántas cards mostrar según el tamaño de pantalla
  useEffect(() => {
    const actualizarCardsPorVista = () => {
      if (window.innerWidth >= 1024) {
        setCardsPorVista(3);
      } else if (window.innerWidth >= 768) {
        setCardsPorVista(2);
      } else {
        setCardsPorVista(1);
      }
    };

    actualizarCardsPorVista();
    window.addEventListener('resize', actualizarCardsPorVista);
    return () => window.removeEventListener('resize', actualizarCardsPorVista);
  }, []);

  const totalSlides = Math.ceil(items.length / cardsPorVista);
  const maxIndice = totalSlides - 1;

  const siguienteSlide = () => {
    setIndiceActual(prev => prev >= maxIndice ? 0 : prev + 1);
  };

  const anteriorSlide = () => {
    setIndiceActual(prev => prev <= 0 ? maxIndice : prev - 1);
  };

  const irASlide = (indice: number) => {
    setIndiceActual(indice);
  };

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold mb-6">{titulo}</h3>
      
      {/* Contenedor del carrusel */}
      <div className="relative">
        {/* Flecha anterior */}
        <button
          onClick={anteriorSlide}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
          aria-label="Anterior"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Flecha siguiente */}
        <button
          onClick={siguienteSlide}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
          aria-label="Siguiente"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Contenedor de cards */}
        <div className="overflow-hidden">
          <div 
            className="flex transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(-${indiceActual * (100 / cardsPorVista)}%)`,
              width: `${(100 / cardsPorVista) * items.length}%`
            }}
          >
            {items.map((item) => (
              <div 
                key={item.id} 
                className="flex-shrink-0"
                style={{ width: `${100 / items.length}%` }}
              >
                <div className="mx-2">
                  <div className="bg-white p-6 rounded-lg shadow-sm h-full">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className={`font-bold text-lg ${colorPrimario}`}>{item.nombre}</h4>
                      <span className="text-sm text-gray-500">{item.distancia}</span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">📍</span> {item.direccion}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">📞</span> {item.telefono}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">🕒</span> {item.horario}
                      </p>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <span className="text-yellow-500">⭐</span>
                        <span className="ml-1 text-sm font-medium">{item.calificacion}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(item.especialidades || item.servicios || []).map((tag, index) => (
                          <span 
                            key={index} 
                            className={`${colorSecundario} text-xs px-2 py-1 rounded`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2 mt-auto">
                      <button 
                        onClick={() => onAgendarCita(item)}
                        className={`w-full ${colorPrimario} text-white py-2 rounded-lg hover:opacity-90 transition-opacity`}
                      >
                        {textoBoton}
                      </button>
                      {onVerDetalles && (
                        <button 
                          onClick={() => onVerDetalles(item)}
                          className={`w-full border ${colorPrimario} ${colorPrimario.replace('bg-', 'text-')} py-2 rounded-lg hover:bg-gray-50 transition-colors`}
                        >
                          Ver Detalles
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Indicadores */}
        {totalSlides > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: totalSlides }, (_, index) => (
              <button
                key={index}
                onClick={() => irASlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === indiceActual 
                    ? colorPrimario.replace('bg-', 'bg-') 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Ir al slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 