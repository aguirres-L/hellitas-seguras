import React, { createContext, useContext, useState, useCallback } from 'react';
import ModalDialogoSistema from '../components/ui/ModalDialogoSistema';

const NotificacionAppContext = createContext(null);

export function NotificacionAppProvider({ children }) {
  const [dialogo, setDialogo] = useState(null);

  const mostrarExito = useCallback((mensaje, titulo = 'Listo') => {
    setDialogo({ tipo: 'mensaje', variant: 'exito', titulo, mensaje: String(mensaje ?? '') });
  }, []);

  const mostrarError = useCallback((mensaje, titulo = 'Algo salió mal') => {
    setDialogo({ tipo: 'mensaje', variant: 'error', titulo, mensaje: String(mensaje ?? '') });
  }, []);

  const mostrarInfo = useCallback((mensaje, titulo = 'Información') => {
    setDialogo({ tipo: 'mensaje', variant: 'info', titulo, mensaje: String(mensaje ?? '') });
  }, []);

  /**
   * Reemplazo de window.confirm. Devuelve Promise<boolean>.
   */
  const confirmar = useCallback((mensaje, options = {}) => {
    return new Promise((resolve) => {
      setDialogo({
        tipo: 'confirmar',
        titulo: options.titulo ?? 'Confirmar',
        mensaje: String(mensaje ?? ''),
        textoConfirmar: options.textoConfirmar ?? 'Sí, continuar',
        textoCancelar: options.textoCancelar ?? 'Cancelar',
        resolve,
      });
    });
  }, []);

  const handleCerrarMensaje = useCallback(() => {
    setDialogo(null);
  }, []);

  const handleCerrarConfirmar = useCallback(() => {
    if (dialogo?.tipo === 'confirmar' && typeof dialogo.resolve === 'function') {
      dialogo.resolve(false);
    }
    setDialogo(null);
  }, [dialogo]);

  const handleConfirmarSi = useCallback(() => {
    if (dialogo?.tipo === 'confirmar' && typeof dialogo.resolve === 'function') {
      dialogo.resolve(true);
    }
    setDialogo(null);
  }, [dialogo]);

  const value = {
    mostrarExito,
    mostrarError,
    mostrarInfo,
    confirmar,
  };

  return (
    <NotificacionAppContext.Provider value={value}>
      {children}
      {dialogo && (
        <ModalDialogoSistema
          dialogo={dialogo}
          onCerrar={dialogo.tipo === 'confirmar' ? handleCerrarConfirmar : handleCerrarMensaje}
          onConfirmar={handleConfirmarSi}
        />
      )}
    </NotificacionAppContext.Provider>
  );
}

export function useNotificacionApp() {
  const ctx = useContext(NotificacionAppContext);
  if (!ctx) {
    throw new Error('useNotificacionApp debe usarse dentro de NotificacionAppProvider');
  }
  return ctx;
}
