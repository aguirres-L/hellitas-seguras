import { useNavigate } from "react-router-dom";
import DecoracionForm from "../../../../decoracionUi/DecoracionForm";



export default function ModalAlert({ typeAlert, mensaje, onCerrar }) {



  const navigate = useNavigate();
    
    function handleButton(){
        if(mensaje?.from === 'suscripcion'){
            navigate('/');
        }else{
            navigate('/perfil');
        }
        onCerrar();
    }

    // Alerta informativa para errores de pago (tono amable, no dramático)
    if (typeAlert === 'error') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                <div role="dialog" aria-modal="true" className="relative w-full max-w-lg overflow-hidden bg-white rounded-2xl shadow-2xl">
                    <DecoracionForm className="z-0" />
                    <div className="relative z-10">
                    <div className="flex items-start justify-between p-4 border-b border-orange-100 bg-gradient-to-r from-orange-50 via-yellow-50 to-pink-50">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-orange-600">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-.75 6.75a.75.75 0 011.5 0v5a.75.75 0 01-1.5 0v-5zm.75 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                </svg>
                            </span>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{mensaje?.tipo || 'No pudimos completar el pago'}</h3>
                                <p className="text-sm font-medium text-gray-600">No se realizó ningún cobro. Revisá tu método de pago e intentá nuevamente.</p>
                            </div>
                        </div>
                        <button
                            onClick={onCerrar}
                            aria-label="Cerrar"
                            className="p-2 text-gray-400 transition-colors hover:text-gray-600"
                        >
                            ×
                        </button>
                    </div>
                    <div className="p-6">
                        <p className="text-gray-700">{mensaje?.mensaje}</p>
                    </div>
                    <div className="flex justify-end gap-3 p-4 bg-gray-50">
                        <button
                            onClick={onCerrar}
                            className="px-4 py-2 text-sm font-semibold text-white transition-colors rounded-lg bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300"
                        >
                            Entendido
                        </button>
                    </div>
                    </div>
                </div>
            </div>
        );
    }

    // Alerta para próximas actualizaciones (tono profesional)
    if (typeAlert === 'nextUpdate') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                <div role="dialog" aria-modal="true" className="relative w-full max-w-lg overflow-hidden bg-white rounded-2xl shadow-2xl">
                <DecoracionForm className="z-0" />
                    <div className="relative z-10">
                    
                    <div className="flex items-start justify-between p-4 bg-gray-800 bg-opacity-60">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center w-10 h-10 rounded-full text-pink-600">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                    <path d="M12 2a1 1 0 01.894.553l1.618 3.236 3.57.519a1 1 0 01.554 1.705l-2.584 2.52.61 3.557a1 1 0 01-1.451 1.054L12 13.89l-3.211 1.689a1 1 0 01-1.451-1.054l.61-3.557-2.584-2.52a1 1 0 01.554-1.705l3.57-.519L11.106 2.553A1 1 0 0112 2z" />
                                </svg>
                            </span>
                            <div>
                                <h3 className="text-lg font-bold text-gray-100">Funcionalidad en desarrollo</h3>
                                <p className="text-sm font-medium text-gray-200">Estamos trabajando para que esté disponible pronto.</p>
                            </div>
                        </div>
                        <button
                            onClick={onCerrar}
                            aria-label="Cerrar"
                            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                            >
                            x
                        </button>
                    </div>
                    <div className="p-6 bg-gray-800 bg-opacity-60">
                        <p className="text-gray-100">Gracias por tu paciencia. Queremos ofrecerte la mejor experiencia.</p>
                    </div>
                    <div className="flex justify-end gap-3 p-4 bg-gray-800 bg-opacity-60">
                        <button
                            onClick={onCerrar}
                            className="px-4 py-2 text-sm font-semibold text-white transition-colors rounded-lg bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-300"
                        >
                            Entendido
                        </button>
                    </div>
                    </div>
                </div>
            </div>
        );
    }


    if (typeAlert === 'success') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div role="dialog" aria-modal="true" className="relative w-full max-w-lg overflow-hidden bg-white rounded-2xl shadow-2xl">
            <DecoracionForm className="z-0" />
                <div className="relative z-10">
                
                <div className="flex items-start justify-between p-4 bg-gray-800 bg-opacity-60">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-10 h-10 rounded-full text-pink-600">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path d="M12 2a1 1 0 01.894.553l1.618 3.236 3.57.519a1 1 0 01.554 1.705l-2.584 2.52.61 3.557a1 1 0 01-1.451 1.054L12 13.89l-3.211 1.689a1 1 0 01-1.451-1.054l.61-3.557-2.584-2.52a1 1 0 01.554-1.705l3.57-.519L11.106 2.553A1 1 0 0112 2z" />
                            </svg>
                        </span>
                        <div>
                            <h3 className="text-lg font-bold text-gray-100">{mensaje?.tipo || 'Pago realizado con éxito'}</h3>
                            <p className="text-sm font-medium text-gray-200">Gracias por tu pago. Te contactaremos pronto.</p>
                        </div>
                    </div>
                   {/*  <button
                        onClick={onCerrar}
                        aria-label="Cerrar"
                        className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                        >
                        x
                    </button> */}
                </div>
                <div className="p-6 bg-gray-800 bg-opacity-60">
                    <p className="text-gray-100">{mensaje?.mensaje || 'Gracias por tu pago. Te contactaremos pronto.'}</p>
                </div>
               {/*  <div className="flex justify-end gap-3 p-4 bg-gray-800 bg-opacity-60">
                    <button
                        onClick={handleButton}
                        className="px-4 py-2 text-sm font-semibold text-white transition-colors rounded-lg bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-300"
                    >
                        {mensaje?.from === 'suscripcion' ? 'Volver al home' : 'Volver al perfil'}
                    </button>
                </div> */}
                </div>
            </div>
        </div>
        );
    }

    // Alerta de confirmación para cambios de estado (tono profesional con opciones)
    if (typeAlert === 'confirmacion') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                <div role="dialog" aria-modal="true" className="relative w-full max-w-lg overflow-hidden bg-white rounded-2xl shadow-2xl">
                    <DecoracionForm className="z-0" />
                    <div className="relative z-10">
                        <div className="flex items-start justify-between p-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                                    </svg>
                                </span>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{mensaje?.titulo || 'Confirmar cambio de estado'}</h3>
                                    <p className="text-sm font-medium text-gray-600">Esta acción modificará el estado de la chapita</p>
                                </div>
                            </div>
                            <button
                                onClick={onCerrar}
                                aria-label="Cerrar"
                                className="p-2 text-gray-400 transition-colors hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        mensaje?.estadoActual === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                        mensaje?.estadoActual === 'fabricacion' ? 'bg-blue-100 text-blue-800' :
                                        mensaje?.estadoActual === 'en viaje' ? 'bg-orange-100 text-orange-800' :
                                        'bg-green-100 text-green-800'
                                    }`}>
                                        {mensaje?.estadoActual || 'Estado actual'}
                                    </span>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-400">
                                        <path fillRule="evenodd" d="M4.72 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L11.69 12 4.72 5.03a.75.75 0 010-1.06z" clipRule="evenodd" />
                                    </svg>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        mensaje?.nuevoEstado === 'fabricacion' ? 'bg-blue-100 text-blue-800' :
                                        mensaje?.nuevoEstado === 'en viaje' ? 'bg-orange-100 text-orange-800' :
                                        mensaje?.nuevoEstado === 'entregado' ? 'bg-green-100 text-green-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {mensaje?.nuevoEstado || 'Nuevo estado'}
                                    </span>
                                </div>
                            </div>
                            <p className="mt-4 text-gray-700">
                                {mensaje?.mensaje || `¿Estás seguro de que deseas cambiar el estado de la chapita de "${mensaje?.estadoActual}" a "${mensaje?.nuevoEstado}"?`}
                            </p>
                            {mensaje?.detalles && (
                                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <strong>Detalles:</strong> {mensaje.detalles}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 p-4 bg-gray-50">
                            <button
                                onClick={onCerrar}
                                className="px-4 py-2 text-sm font-semibold text-gray-700 transition-colors rounded-lg bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={mensaje?.onConfirmar || onCerrar}
                                className="px-4 py-2 text-sm font-semibold text-white transition-colors rounded-lg bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                            >
                                {mensaje?.textoConfirmar || 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}