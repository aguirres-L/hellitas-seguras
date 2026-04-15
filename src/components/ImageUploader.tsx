import React, { useState, useRef, useCallback, useEffect } from 'react';
import { subirImagenMascota } from '../data/firebase/firebase';
import DecoracionForm from './decoracionUi/DecoracionForm';

function obtenerMensajeErrorSubida(error: unknown): string {
  const code =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
      ? (error as { code: string }).code
      : '';

  if (code === 'storage/quota-exceeded') {
    return 'El almacenamiento de Firebase llegó al límite del plan (cuota del bucket). Un administrador debe liberar archivos en Storage, pasar a un plan de pago o revisar el proyecto en console.firebase.google.com. Mientras tanto podés continuar sin foto o intentar más tarde.';
  }
  if (code === 'storage/unauthorized') {
    return 'No tenés permiso para subir archivos. Iniciá sesión de nuevo e intentá otra vez.';
  }
  if (code === 'storage/canceled') {
    return 'La subida se canceló. Probá de nuevo.';
  }
  if (code === 'storage/retry-limit-exceeded') {
    return 'La red falló varias veces. Revisá tu conexión e intentá de nuevo.';
  }

  const raw =
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
      ? (error as { message: string }).message
      : 'Error desconocido al subir.';

  return `No se pudo guardar la imagen en la nube: ${raw}`;
}

export interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  onImageUploaded?: (imageUrl: string) => void;
  imagenActual?: string;
  isCargando?: boolean;
  className?: string;
  userId?: string;
  petId?: string;
  /** Si es true, al tocar el área se abre un modal para elegir galería o cámara (móvil). */
  usarModalOrigenFoto?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelect,
  onImageUploaded,
  imagenActual,
  isCargando = false,
  className = '',
  userId,
  petId,
  usarModalOrigenFoto = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(imagenActual || null);
  const [isSubiendo, setIsSubiendo] = useState(false);
  const [mensajeErrorSubida, setMensajeErrorSubida] = useState<string | null>(null);
  const [isOrigenModalAbierto, setIsOrigenModalAbierto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galeriaInputRef = useRef<HTMLInputElement>(null);
  const camaraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOrigenModalAbierto) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOrigenModalAbierto(false);
    };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [isOrigenModalAbierto]);

  // Función para manejar la selección de archivo
  const handleFileSelect = useCallback(async (file: File) => {
    setMensajeErrorSubida(null);

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setMensajeErrorSubida('Elegí solo archivos de imagen (JPG, PNG, etc.).');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMensajeErrorSubida('La imagen debe pesar menos de 5 MB.');
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
        setMensajeErrorSubida(obtenerMensajeErrorSubida(error));
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

  const dispararClickInput = (ref: React.RefObject<HTMLInputElement | null>) => {
    setIsOrigenModalAbierto(false);
    window.requestAnimationFrame(() => {
      ref.current?.click();
    });
  };

  // Manejar click en el área de carga
  const handleClick = () => {
    if (isCargando || isSubiendo) return;
    if (usarModalOrigenFoto) {
      setIsOrigenModalAbierto(true);
      return;
    }
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
    setMensajeErrorSubida(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (galeriaInputRef.current) galeriaInputRef.current.value = '';
    if (camaraInputRef.current) camaraInputRef.current.value = '';
    onImageSelect(null as any);
  };

  const cerrarOrigenModal = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setIsOrigenModalAbierto(false);
  };

  return (
    <>
    <div className={`w-full ${className}`}>
      {/* Input file oculto (flujo simple o escritorio) */}
      {!usarModalOrigenFoto ? (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      ) : (
        <>
          <input
            ref={galeriaInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            ref={camaraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
        </>
      )}

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
    {mensajeErrorSubida ? (
      <div
        role="alert"
        className="mt-3 max-w-md mx-auto rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-left text-[13px] leading-snug text-amber-950"
      >
        {mensajeErrorSubida}
        <span className="mt-1 block text-[12px] text-amber-800/90">
          La vista previa es solo en tu dispositivo hasta que la subida funcione.
        </span>
      </div>
    ) : null}

    {usarModalOrigenFoto && isOrigenModalAbierto ? (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={cerrarOrigenModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-origen-foto-titulo"
      >
        <div
          className="relative w-full max-w-md overflow-hidden bg-white rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <DecoracionForm className="z-0" />
          <div className="relative z-10">
            <div className="flex items-start justify-between p-4 sm:p-6 border-b border-orange-100 bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50">
              <div className="flex items-center gap-3 pr-2">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                    <path
                      fillRule="evenodd"
                      d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5a.75.75 0 00.75-.75v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06L5.31 7.53a.75.75 0 00-1 0L3 16.06zm9.75-7.19V9a.75.75 0 01.75-.75h3a.75.75 0 01.75.75v.75h-4.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <div>
                  <h3 id="modal-origen-foto-titulo" className="text-lg font-bold text-gray-900">
                    ¿Cómo querés agregar la foto?
                  </h3>
                  <p className="text-sm font-medium text-gray-600">
                    Elegí galería o cámara; en ambos casos aceptamos JPG o PNG (máx. 5 MB).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOrigenModalAbierto(false)}
                aria-label="Cerrar"
                className="p-2 text-gray-400 transition-colors hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3 p-4 sm:p-6">
              <button
                type="button"
                className="w-full rounded-xl border-2 border-orange-200 bg-orange-50 px-4 py-3 text-base font-semibold text-orange-800 transition-all duration-200 hover:bg-orange-100"
                onClick={() => dispararClickInput(galeriaInputRef)}
              >
                Galería
              </button>
              <button
                type="button"
                className="w-full rounded-xl bg-orange-500 px-4 py-3 text-base font-semibold text-white shadow-md transition-all duration-200 hover:bg-orange-600"
                onClick={() => dispararClickInput(camaraInputRef)}
              >
                Cámara
              </button>
              <button
                type="button"
                className="w-full rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                onClick={() => setIsOrigenModalAbierto(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : null}
    </>
  );
}; 