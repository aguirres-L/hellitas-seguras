import React, { useState } from 'react';
import { usePwaInstall } from '../../hooks/usePwaInstall';
import InstallMobileSvg from '../ui/svg/InstallMobileSvg';
import InstallTableSvg from '../ui/svg/InstallTableSvg';
import InstallWebSvg from '../ui/svg/InstallWebSvg';
import ModalInstrucionesIOS from './ModalInstrucionesIOS';
import ModalInstrucionesAndroid from './ModalInstrucionesAndroid';

/**
 * Botón "Instalar app" con UX adaptativa.
 *
 * Variantes:
 *  - 'menu':  fila compacta para usar dentro del menú del Navbar.
 *  - 'cta':   tarjeta destacada para la Home.
 *
 * Reglas de visibilidad (UX):
 *  - Si la app ya está instalada → no se muestra.
 *  - En Chromium con prompt disponible → muestra botón con instalación nativa.
 *  - En iOS (Safari) → muestra botón que abre instrucciones manuales (Safari no
 *    expone el evento beforeinstallprompt).
 *  - En Android sin prompt disponible → muestra botón con fallback de instrucciones
 *    manuales (cubre dev sin HTTPS, Chrome que ya descartó el banner, navegadores
 *    no-Chromium).
 *  - En cualquier otro caso (desktop sin soporte) → no se muestra.
 */
export default function BotonInstalarApp({ variante = 'menu', typeTheme = 'light', onAccion }) {
  const {
    puedeInstalar,
    estaInstalada,
    tipoDispositivo,
    esIOS,
    esAndroid,
    instalarApp,
  } = usePwaInstall();
  const [isModalIOSAbierto, setIsModalIOSAbierto] = useState(false);
  const [isModalAndroidAbierto, setIsModalAndroidAbierto] = useState(false);

  if (estaInstalada) return null;
  const debeMostrarse = puedeInstalar || esIOS || esAndroid;
  if (!debeMostrarse) return null;

  const handleClick = async () => {
    if (esIOS && !puedeInstalar) {
      setIsModalIOSAbierto(true);
      return;
    }
    if (esAndroid && !puedeInstalar) {
      setIsModalAndroidAbierto(true);
      return;
    }
    await instalarApp();
    onAccion?.();
  };

  const cerrarModalIOS = () => {
    setIsModalIOSAbierto(false);
    onAccion?.();
  };

  const cerrarModalAndroid = () => {
    setIsModalAndroidAbierto(false);
    onAccion?.();
  };

  const Icono = elegirIcono(tipoDispositivo);
  const etiqueta = 'Instalar app';

  if (variante === 'cta') {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          aria-label={`${etiqueta} en tu ${nombrarDispositivo(tipoDispositivo)}`}
          className="group flex w-full max-w-md items-center gap-4 rounded-2xl border border-orange-300 bg-gradient-to-r from-orange-50 to-pink-50 p-4 shadow-sm transition-all hover:scale-[1.01] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600 shadow-inner">
            <Icono />
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className="block text-base font-semibold text-gray-900">
              {etiqueta}
            </span>
            <span className="block text-sm text-gray-600">
              {textoSecundario(tipoDispositivo, esIOS, esAndroid, puedeInstalar)}
            </span>
          </span>
          <span className="hidden text-orange-600 sm:inline" aria-hidden>
            →
          </span>
        </button>

        <ModalInstrucionesIOS
          isAbierto={isModalIOSAbierto}
          onCerrar={cerrarModalIOS}
          tipoDispositivo={tipoDispositivo}
        />
        <ModalInstrucionesAndroid
          isAbierto={isModalAndroidAbierto}
          onCerrar={cerrarModalAndroid}
        />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label={`${etiqueta} en tu ${nombrarDispositivo(tipoDispositivo)}`}
        className={
          (typeTheme === 'dark'
            ? 'text-gray-200 hover:text-orange-400'
            : 'text-gray-600 hover:text-orange-600') +
          ' transition-colors duration-200 text-sm gap-2 flex items-center'
        }
      >
        <span className="shrink-0">
          <Icono />
        </span>
        <span>{etiqueta}</span>
      </button>

      <ModalInstrucionesIOS
        isAbierto={isModalIOSAbierto}
        onCerrar={cerrarModalIOS}
        tipoDispositivo={tipoDispositivo}
      />
      <ModalInstrucionesAndroid
        isAbierto={isModalAndroidAbierto}
        onCerrar={cerrarModalAndroid}
      />
    </>
  );
}

function elegirIcono(tipo) {
  if (tipo === 'mobile') return InstallMobileSvg;
  if (tipo === 'tablet') return InstallTableSvg;
  return InstallWebSvg;
}

function nombrarDispositivo(tipo) {
  if (tipo === 'mobile') return 'celular';
  if (tipo === 'tablet') return 'tablet';
  return 'computadora';
}

function textoSecundario(tipo, esIOS, esAndroid, puedeInstalar) {
  if (esIOS) return 'Instrucciones rápidas para iPhone/iPad';
  if (esAndroid && !puedeInstalar) return 'Pasos rápidos desde el menú de Chrome';
  if (tipo === 'mobile') return 'Acceso directo desde tu pantalla de inicio';
  if (tipo === 'tablet') return 'Sumá Huellitas como app a tu tablet';
  return 'Tenela siempre a mano en tu escritorio';
}
