import React, { useState, useRef, useCallback } from 'react';
import { subirImagenMascota } from '../data/firebase/firebase';

export interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  onImageUploaded?: (imageUrl: string) => void;
  imagenActual?: string;
  isCargando?: boolean;
  className?: string;
  userId?: string;
  petId?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelect,
  onImageUploaded,
  imagenActual,
  isCargando = false,
  className = '',
  userId,
  petId
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(imagenActual || null);
  const [isSubiendo, setIsSubiendo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Función para manejar la selección de archivo
  const handleFileSelect = useCallback(async (file: File) => {
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona solo archivos de imagen');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB');
      return;
    }

    // Crear vista previa
    const reader = new FileReader();
    reader.onload = (e) => {
      setVistaPrevia(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Pasar el archivo al componente padre
    onImageSelect(file);

    // Si tenemos userId y petId, subir la imagen inmediatamente
    if (userId && petId && onImageUploaded) {
      setIsSubiendo(true);
      try {
        const imageUrl = await subirImagenMascota(userId, petId, file);
        
        // Notificar al componente padre con la URL
        onImageUploaded(imageUrl);
      } catch (error) {
        console.error('Error al subir imagen:', error);
        alert('Error al subir imagen: ' + error.message);
      } finally {
        setIsSubiendo(false);
      }
    }
  }, [onImageSelect, onImageUploaded, userId, petId]);

  // Manejar drag & drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Manejar click en el área de carga
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Manejar cambio en input file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Eliminar imagen
  const handleRemoveImage = () => {
    setVistaPrevia(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageSelect(null as any);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Input file oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Área de carga */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-300 ease-in-out
          ${isDragOver 
            ? 'border-orange-400 bg-orange-50 scale-105' 
            : 'border-gray-300 hover:border-orange-300 hover:bg-orange-50'
          }
          ${(isCargando || isSubiendo) ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {(isCargando || isSubiendo) && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg z-10">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <p className="mt-2 text-sm text-gray-600">
                {isSubiendo ? 'Subiendo imagen...' : 'Cargando...'}
              </p>
            </div>
          </div>
        )}

        {vistaPrevia ? (
          // Vista previa de imagen
          <div className="relative">
            <img
              src={vistaPrevia}
              alt="Vista previa"
              className="w-full h-48 object-cover rounded-lg shadow-sm"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveImage();
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              ×
            </button>
            <div className="mt-2 text-sm text-gray-600">
              Click para cambiar imagen
            </div>
          </div>
        ) : (
          // Área de carga vacía
          <div className="space-y-3">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isDragOver ? 'Suelta la imagen aquí' : 'Subir imagen de mascota'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Arrastra y suelta una imagen aquí, o click para seleccionar
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG hasta 5MB
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 