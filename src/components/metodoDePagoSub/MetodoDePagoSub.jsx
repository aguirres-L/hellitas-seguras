import { CONFIG_PAGOS } from "../../data/firebase/config_Pagos/datosPagos";
import UiPasosTranferencia from "../metodoDePago/UiPasosTranferencia";
import { useState } from "react";
import ModalAlert from "../ui/svg/uiPetProfile/uiMetodoDePago/ModalAlert";
import { useAuth } from "../../contexts/AuthContext";
import { addDataCollection, updateDataCollection } from "../../data/firebase";
import { mensualidadController } from "../../controllers/mensualidadController";

export default function MetodoDePagoSub(){
    const { usuario, recargarDatosUsuario } = useAuth();
    const [metodoSeleccionado, setMetodoSeleccionado] = useState('transferencia');
    const [isTransferenciaConfirmada, setIsTransferenciaConfirmada] = useState(false);
    const [isProcesando, setIsProcesando] = useState(false);
    const [isModalAlert, setIsModalAlert] = useState(false);
    const [tipoAlert, setTipoAlert] = useState('');
    const [mensaje, setMensaje] = useState({});

    const procesarPago = async () => {
        // Para transferencia, verificar que esté confirmada
        if (metodoSeleccionado === 'transferencia' && !isTransferenciaConfirmada) {
            setIsModalAlert(true);
            setTipoAlert('error');
            setMensaje({
                tipo: 'Error',
                mensaje: 'Por favor, confirma que realizaste la transferencia antes de continuar.'
            });
            return;
        }

        setIsProcesando(true);
        
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));

            const datosSuscripcion = {
                usuarioId: usuario.uid,
                usuarioEmail: usuario.email,
                usuarioNombre: usuario.displayName || 'Usuario',
                tipo: 'suscripcion_mensual',
                monto: 5000,
                metodoPago: metodoSeleccionado,
                estado: 'pendiente',
                fechaPago: new Date(),
                ...(metodoSeleccionado === 'transferencia' && {
                    cbuDestino: CONFIG_PAGOS.CBU_CUENTA,
                    aliasDestino: CONFIG_PAGOS.ALIAS_CUENTA,
                    bancoDestino: CONFIG_PAGOS.BANCO
                })
            };

            const idSuscripcion = await addDataCollection('pagoSuscripciones', datosSuscripcion);

            if (metodoSeleccionado === 'transferencia') {
                const resultadoRenovacion = await mensualidadController.renovarMensualidadUsuario(usuario.uid);
                if (!resultadoRenovacion.exitoso) {
                    throw new Error(resultadoRenovacion.error || 'No se pudo activar la membresía');
                }

                const fechaDeclaracion = new Date();
                await updateDataCollection('usuarios', usuario.uid, {
                    membresiaUltimoMetodoPago: 'transferencia',
                    membresiaDeclaracionTransferenciaEn: fechaDeclaracion,
                    membresiaTransferenciaPendienteVerificacion: true,
                    membresiaIdPagoSuscripcion: idSuscripcion
                });

                await recargarDatosUsuario?.();
            }

            setIsModalAlert(true);
            setTipoAlert('success');
            setMensaje({
                tipo: 'Éxito',
                from: 'suscripcion',
                mensaje: metodoSeleccionado === 'transferencia'
                    ? `Listo: registramos tu transferencia (ref. ${idSuscripcion}). Ya tenés acceso mientras verificamos el pago en el banco. Si algo no coincide, podemos ajustar tu cuenta desde administración.`
                    : `Suscripción procesada correctamente. ID: ${idSuscripcion}. Te contactaremos pronto.`
            });
            
        } catch (error) {
            
            setIsModalAlert(true);
            setTipoAlert('error');
            setMensaje({
                tipo: 'Error',
                mensaje: 'Error al procesar la suscripción. Intenta nuevamente.'
            });
        } finally {
            setIsProcesando(false);
        }
    };
    return(
        <div className="space-y-6">
        {/* Información del producto */}
        <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">🏷️</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Suscripción Mensual</h4>
              <p className="text-sm text-gray-600">Acceso completo a la plataforma</p>
              <p className="text-lg font-bold text-orange-600">$5.000/mes</p>
            </div>
          </div>
        </div>
  
        {/* Selector de método */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Selecciona tu método de pago
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setMetodoSeleccionado('tarjeta')}
              className={`p-4 border-2 rounded-lg transition-all ${
                metodoSeleccionado === 'tarjeta'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">💳</span>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800">Tarjeta</p>
                  <p className="text-sm text-gray-600">Débito o Crédito</p>
                </div>
              </div>
            </button>
  
              {/* Transferencias Bancarias */}
            <button
              onClick={() => setMetodoSeleccionado('transferencia')}
              className={`p-4 border-2 rounded-lg transition-all ${
                metodoSeleccionado === 'transferencia'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🏦</span>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800">Transferencia</p>
                  <p className="text-sm text-gray-600">Bancaria</p>
                </div>
              </div>
            </button>
  
          </div>
  
          {metodoSeleccionado === 'transferencia' && (
          <UiPasosTranferencia 
            aliasCuenta={CONFIG_PAGOS.ALIAS_CUENTA}
            cbuCuenta={CONFIG_PAGOS.CBU_CUENTA}
            titularCuenta={CONFIG_PAGOS.TITULAR_CUENTA}
            banco={CONFIG_PAGOS.BANCO}
            onConfirmarTransferencia={() => setIsTransferenciaConfirmada(true)}
            isTransferenciaConfirmada={isTransferenciaConfirmada}
          />
        )}
  
        </div>
  
        {/* ... existing form sections ... */}
  
        {/* Botón de pago */}
        <div className="flex">
   
          <button
            onClick={procesarPago}
            disabled={isProcesando || (metodoSeleccionado === 'transferencia' && !isTransferenciaConfirmada)}
            className={`flex-1 py-3  px-6 rounded-lg font-medium transition-all ${
              isProcesando || (metodoSeleccionado === 'transferencia' && !isTransferenciaConfirmada)
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isProcesando ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Procesando...</span>
              </div>
            ) : (
              ` ${metodoSeleccionado === 'transferencia' ? 'Continuar' : 'En Construcción'} `
            )}
          </button>
        </div>
  
        {isModalAlert && (
          <ModalAlert typeAlert={tipoAlert} mensaje={mensaje} onCerrar={() => setIsModalAlert(false)} />
        )}
  
       
  
        {/* Información de seguridad */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            🔒 Tus datos están protegidos con encriptación SSL
          </p>
        </div>
      </div>
    )
}