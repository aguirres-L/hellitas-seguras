import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, obtenerUsuarioPorUid, obtenerProfesionalPorUid } from '../data/firebase';

// Crear el contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Función para limpiar datos de autenticación anteriores
const limpiarAuthAnterior = () => {
  try {
    // Limpiar localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('firebase') || key.includes('auth') || key.includes('toner'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Limpiar sessionStorage
    const sessionKeysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.includes('firebase') || key.includes('auth') || key.includes('toner'))) {
        sessionKeysToRemove.push(key);
      }
    }
    sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));

    console.log('Datos de autenticación anteriores limpiados');
  } catch (error) {
    console.error('Error al limpiar datos de auth:', error);
  }
};

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [datosUsuario, setDatosUsuario] = useState(null);
  const [tipoUsuario, setTipoUsuario] = useState(null); // 'usuario' o 'profesional'
  const [isCargando, setIsCargando] = useState(true);
  const [isCargandoLogout, setIsCargandoLogout] = useState(false);

  // Función para cerrar sesión
  const cerrarSesion = async () => {
    try {
      setIsCargandoLogout(true);
      await signOut(auth);
      // Limpiar datos locales después del logout
      limpiarAuthAnterior();
      console.log('Usuario cerró sesión exitosamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    } finally {
      setIsCargandoLogout(false);
    }
  };

  // Función para cargar datos del usuario
  const cargarDatosUsuario = async (uid) => {
    try {
      // Intentar cargar como usuario común
      let datos = await obtenerUsuarioPorUid(uid);
      if (datos) {
        setDatosUsuario(datos);
        setTipoUsuario('usuario');
        return;
      }

      // Si no es usuario común, intentar cargar como profesional
      datos = await obtenerProfesionalPorUid(uid);
      if (datos) {
        setDatosUsuario(datos);
        setTipoUsuario('profesional');
        return;
      }

      // Si no se encuentra en ninguna colección
      setDatosUsuario(null);
      setTipoUsuario(null);
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
      setDatosUsuario(null);
      setTipoUsuario(null);
    }
  };

  // Escuchar cambios en el estado de autenticación
  useEffect(() => {
    // Limpiar datos de auth anteriores al inicializar
    limpiarAuthAnterior();

    const unsubscribe = onAuthStateChanged(auth, async (usuario) => {
      setUsuario(usuario);
      
      if (usuario) {
        await cargarDatosUsuario(usuario.uid);
      } else {
        setDatosUsuario(null);
        setTipoUsuario(null);
      }
      
      setIsCargando(false);
    });

    // Limpiar el listener cuando el componente se desmonte
    return () => unsubscribe();
  }, []);

  // Valor del contexto
  const valor = {
    usuario,
    datosUsuario,
    tipoUsuario,
    isCargando,
    isCargandoLogout,
    cerrarSesion,
    isAutenticado: !!usuario,
    esProfesional: tipoUsuario === 'profesional',
    esUsuario: tipoUsuario === 'usuario'
  };

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  );
}; 