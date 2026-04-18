import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo11 from '../../assets/modeloMilo1.png';
import { useOnboardingMvp } from './useOnboardingMvp';

const pasosFlujo = [
  {
    titulo: 'Creá tu cuenta',
    texto: 'Registrate con tu email y completá los datos básicos. Es rápido y nos ayuda a conocerte.',
  },
  {
    titulo: 'Crea el perfil de tu mascota',
    texto: 'Registra los datos completos de tu mascota.',
  },
  {
    titulo: 'Explorá y contanos',
    texto: 'Recorré el MVP: citas, perfil, servicios. Tu feedback nos guía para mejorar.',
  },
];

export default function OnboardingMvp() {
  const { onIrAInicio } = useOnboardingMvp();
  const [isImagenFlyerVisible, setIsImagenFlyerVisible] = useState(true);

  return (

        <div
          className="rounded-[2rem]  min-h-screen mx-auto max-w-lg bg-[#FFFBF5] px-5 py-2 shadow-lg sm:px-8 sm:py-10"
          style={{ boxShadow: '0 12px 40px rgba(74, 144, 226, 0.15)' }}
        >
             <header className="mb-2 mt-2 flex items-center justify-center gap-3">
         
         <div className="flex items-center gap-2">
           <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-[#4A90E2] to-[#E67E22] p-0.5">
             <img src={logo11} alt="" className="h-full w-full rounded-full object-cover" />
           </div>
           <span className="text-lg font-bold">
             <span className="text-[#1e3a5f]">Huellitas</span>{' '}
             <span className="text-[#E67E22]">Seguras</span>
             <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-[#4A90E2]">
            MVP · Feedback
          </p>
           </span>
         </div>
         <span className="w-14 sm:w-20" aria-hidden />
       </header>
          
          <h1 className="mb-2 text-center text-2xl font-extrabold leading-tight text-[#E67E22] sm:text-3xl">
            Ayudanos a mejorar
            <span className="ml-1 inline-block" aria-hidden>
              🐾
            </span>
          </h1>
          <p className="mb-8 text-center text-base text-[#1e3a5f]/90">
            Probá la app y dejanos tu opinión. Abajo te contamos el flujo en simples pasos; cuando quieras, pasá a
            registrarte.
          </p>

          <h2 className="mb-2 text-lg font-bold text-[#1e3a5f]">Cómo funciona</h2>
          <ol className="mb-10 space-y-4">
            {pasosFlujo.map((paso, indice) => (
              <li
                key={paso.titulo}
                className="flex gap-4 rounded-2xl border border-[#4A90E2]/20 bg-white/90 px-4 py-1 shadow-sm"
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#4A90E2] text-base font-bold text-white"
                  aria-hidden
                >
                  {indice + 1}
                </span>
                <div>
                  <p className="font-semibold text-[#1e3a5f]">{paso.titulo}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[#1e3a5f]/85">{paso.texto}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/register"
              className="inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-gradient-to-r from-[#E67E22] to-[#f59e42] px-8 py-3 text-center text-base font-bold text-white shadow-md transition hover:from-[#d97706] hover:to-[#ea580c] hover:shadow-lg"
            >
              Ir a registrarme
            </Link>
            <Link
              to="/"
              className="inline-flex min-h-[52px] items-center justify-center rounded-2xl border-2 border-[#4A90E2] bg-white px-6 py-3 text-center text-base font-semibold text-[#4A90E2] transition hover:bg-[#4A90E2]/5"
            >
              Conocé el proyecto
            </Link>
          </div>
          <p className="mt-6 text-center text-s text-[#1e3a5f]/60">
          Gracias por ser parte de Huellitas Seguras 💛
        </p>
      
        <p className="mt-6 text-center text-xs text-[#1e3a5f]/60">
        © 2024 Huellitas Seguras. Todos los derechos reservados. Haciendo del mundo un lugar mejor para las mascotas .
        </p>

        </div>

      
  );
}
