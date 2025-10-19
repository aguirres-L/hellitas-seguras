export default function SkeletonCardPet() {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-orange-100 hover:shadow-md hover:border-orange-300 transition-all duration-200 cursor-pointer group animate-pulse">
      {/* Header con foto skeleton - estructura compacta como las cards reales */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {/* Nombre skeleton - text-lg = h-5 */}
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
          {/* Raza y edad skeleton - text-sm = h-4 */}
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        {/* Foto skeleton - w-12 h-12 */}
        <div className="w-12 h-12 bg-gray-200 rounded-full ml-2"></div>
      </div>
      
      {/* Información básica skeleton - solo una línea como en las cards reales */}
      <div className="mb-3">
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
      </div>
      
      {/* Indicador de click skeleton - solo al final */}
      <div className="flex items-center justify-end mt-2">
        <div className="h-3 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  );
}