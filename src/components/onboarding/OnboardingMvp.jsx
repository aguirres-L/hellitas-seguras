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
    titulo: 'Activá la chapita QR',
    texto: 'Asociá la chapita a tu mascota para que tenga perfil digital y esté identificada.',
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
    <div className="min-h-screen bg-[#FDF6E9] px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-lg">
        <header className="mb-6 flex items-center justify-center gap-3">
         
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-[#4A90E2] to-[#E67E22] p-0.5">
              <img src={logo11} alt="" className="h-full w-full rounded-full object-cover" />
            </div>
            <span className="text-lg font-bold">
              <span className="text-[#1e3a5f]">Huellitas</span>{' '}
              <span className="text-[#E67E22]">Seguras</span>
            </span>
          </div>
          <span className="w-14 sm:w-20" aria-hidden />
        </header>

        <main
          className="rounded-[2rem] border-4 border-[#4A90E2] bg-[#FFFBF5] px-5 py-8 shadow-lg sm:px-8 sm:py-10"
          style={{ boxShadow: '0 12px 40px rgba(74, 144, 226, 0.15)' }}
        >
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-[#4A90E2]">
            MVP · Feedback
          </p>
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

          <div className="mb-8 overflow-hidden rounded-2xl border-2 border-[#4A90E2]/30 bg-white shadow-inner">
            {isImagenFlyerVisible ? (
              <img
                src="/onboarding-mvp-flyer.png"
                alt="Huellitas Seguras — escaneá y participá"
                className="h-auto w-full object-cover"
                onError={() => setIsImagenFlyerVisible(false)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-[#4A90E2]/10 to-transparent px-6 py-12 text-center">
                <span className="text-4xl" aria-hidden>
                  🐕 🐈
                </span>
                <p className="text-sm text-[#1e3a5f]/85">
                  Gracias por sumarte al MVP de <span className="font-semibold text-[#E67E22]">Huellitas Seguras</span>.
                </p>
              </div>
            )}
         
          </div>

          <h2 className="mb-4 text-lg font-bold text-[#1e3a5f]">Cómo funciona</h2>
          <ol className="mb-10 space-y-4">
            {pasosFlujo.map((paso, indice) => (
              <li
                key={paso.titulo}
                className="flex gap-4 rounded-2xl border border-[#4A90E2]/20 bg-white/90 px-4 py-3 shadow-sm"
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
              to="/about"
              className="inline-flex min-h-[52px] items-center justify-center rounded-2xl border-2 border-[#4A90E2] bg-white px-6 py-3 text-center text-base font-semibold text-[#4A90E2] transition hover:bg-[#4A90E2]/5"
            >
              Conocé el proyecto
            </Link>
          </div>
        </main>

        <p className="mt-6 text-center text-xs text-[#1e3a5f]/60">
          Gracias por ser parte de Huellitas Seguras 💛
        </p>
      </div>
    </div>
  );
}
