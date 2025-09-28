import React, { useState } from 'react';

/**
 * @typedef {Object} UiPasosTranferenciaProps
 * @property {string} aliasCuenta - Alias de la cuenta bancaria
 * @property {string} cbuCuenta - CBU de la cuenta bancaria
 * @property {string} titularCuenta - Nombre del titular de la cuenta
 * @property {string} banco - Nombre del banco
 * @property {function} onConfirmarTransferencia - Callback para confirmar transferencia
 * @property {boolean} isTransferenciaConfirmada - Estado de confirmación
 */

/**
 * Componente que muestra los pasos para realizar una transferencia bancaria
 * @param {UiPasosTranferenciaProps} props
 */
export default function UiPasosTranferencia({
  aliasCuenta,
  cbuCuenta,
  titularCuenta,
  banco,
  onConfirmarTransferencia,
  isTransferenciaConfirmada
}) {
  const [isAliasCopiado, setIsAliasCopiado] = useState(false);

  const copiarAlias = async () => {
    try {
      await navigator.clipboard.writeText(aliasCuenta);
      setIsAliasCopiado(true);
      // Resetear el estado después de 2 segundos
      setTimeout(() => setIsAliasCopiado(false), 2000);
    } catch (err) {
      console.error('Error al copiar el alias:', err);
    }
  };

  return (
    <div className="mt-6 space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Pasos para realizar la transferencia
      </h3>

      {/* Paso 1: Mostrar datos de la cuenta */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
            1
          </div>
          <h4 className="font-medium text-gray-800">Datos de la cuenta para transferir</h4>
        </div>
        
        <div className="space-y-3">
          {/* Alias - Destacado y copiable */}
          <div className="bg-white rounded-lg p-3 border-2 border-blue-200">

           <div className="flex flex-row items-center gap-2  ">

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alias de la cuenta
            </label>

            <button
                onClick={copiarAlias}
                className={`px-1 w-14 rounded-lg font-medium transition-all ${
                  isAliasCopiado
                    ? 'bg-green-500 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {isAliasCopiado ? '✓ ' : 'Copiar'}
              </button>

          </div>

            
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-100 rounded px-3 py-2 font-mono text-lg font-bold text-blue-600">
                {aliasCuenta}
              </div>
           
            </div>
          </div>

          {/* CBU */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CBU:
            </label>
            <div className="font-mono text-gray-600">{cbuCuenta}</div>
          </div>

          {/* Titular */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titular:
            </label>
            <div className="text-gray-600">{titularCuenta}</div>
          </div>

          {/* Banco */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Banco:
            </label>
            <div className="text-gray-600">{banco}</div>
          </div>
        </div>
      </div>

      {/* Paso 2: Confirmar transferencia */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
            2
          </div>
          <h4 className="font-medium text-gray-800">Confirmar transferencia realizada</h4>
        </div>
        
        <p className="text-gray-600 mb-4">
          Una vez que hayas realizado la transferencia, confirma aquí para continuar:
        </p>
        
        <button
          onClick={onConfirmarTransferencia}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
            isTransferenciaConfirmada
              ? 'bg-green-500 text-white cursor-default'
              : 'bg-orange-500 hover:bg-orange-600 text-white'
          }`}
        >
          {isTransferenciaConfirmada ? (
            <div className="flex items-center justify-center space-x-2">
              <span>✓</span>
              <span>Transferencia Confirmada</span>
            </div>
          ) : (
            'Confirmar que realicé la transferencia'
          )}
        </button>
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start space-x-2">
          <span className="text-blue-500 text-lg">ℹ️</span>
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Importante:</p>
            <ul className="space-y-1 text-xs">
              <li>• La transferencia puede tardar hasta 24 horas en procesarse</li>
              <li>• Asegúrate de usar el alias exacto: <strong>{aliasCuenta}</strong></li>
              <li>• Guarda el comprobante de transferencia</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}


