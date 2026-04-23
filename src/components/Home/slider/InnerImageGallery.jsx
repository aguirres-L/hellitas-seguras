import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';

/**
 * Galería horizontal (segundo nivel) bajo un slide de producto.
 * Se resetea cuando cambia `claveGaleria` (id del slide padre).
 */
export default function InnerImageGallery({
  claveGaleria,
  medios,
  isVideo,
  descripciónAlt,
}) {
  const refScroll = useRef(null);
  const [índiceFoto, setíndiceFoto] = useState(0);

  const filas = isVideo ? [medios] : medios;
  const hayMásDeUna = filas.length > 1;

  const irA = useCallback(
    (í) => {
      const el = refScroll.current;
      if (!el) return;
      const w = el.offsetWidth;
      el.scrollTo({ left: í * w, behavior: 'smooth' });
      setíndiceFoto(í);
    },
    []
  );

  const alHacerScroll = useCallback(() => {
    const el = refScroll.current;
    if (!el) return;
    const w = el.offsetWidth || 1;
    const próximo = Math.round(el.scrollLeft / w);
    if (próximo < 0 || próximo >= filas.length) return;
    setíndiceFoto((anterior) => (anterior === próximo ? anterior : próximo));
  }, [filas.length]);

  // Al cambiar de slide principal, volver a la primera miniatura
  useLayoutEffect(() => {
    const el = refScroll.current;
    if (el) el.scrollTo({ left: 0, behavior: 'auto' });
    setíndiceFoto(0);
  }, [claveGaleria]);

  return (
    <div
      className="relative h-full min-h-0 w-full overflow-hidden rounded-xl bg-neutral-100"
      data-inner-gallery="true"
    >
      <div
        ref={refScroll}
        key={claveGaleria}
        onScroll={alHacerScroll}
        className="scrollbar-hide flex h-full min-h-0 w-full snap-x snap-mandatory overflow-x-auto scroll-smooth"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {filas.map((src, í) => (
          <div
            key={`${claveGaleria}-inner-${í}`}
            className="relative h-full min-h-0 w-full min-w-full flex-shrink-0 snap-start"
          >
            {isVideo ? (
              <video
                src={src}
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full min-h-0 rounded-xl object-cover"
                aria-label={`${descripciónAlt} - Video`}
              />
            ) : (
              <img
                src={src}
                alt={`${descripciónAlt} ${í + 1}`}
                className="h-full w-full min-h-0 rounded-xl object-cover"
                loading={í === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
            )}

            {isVideo && (
              <div className="absolute right-2 top-2 flex items-center space-x-1 rounded-full bg-black/70 px-2 py-1 text-xs font-medium text-white">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                  <path d="M8 5v10l8-5-8-5z" />
                </svg>
                <span>Video</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {hayMásDeUna && (
        <div className="pointer-events-auto absolute bottom-3 left-1/2 z-10 max-w-[calc(100%-1.5rem)] -translate-x-1/2 overflow-x-auto overflow-y-hidden rounded-2xl bg-black/50 p-1.5 shadow-xl">
          <div className="flex min-w-0 space-x-1.5 sm:space-x-2">
            {filas.map((_, í) => (
              <button
                type="button"
                key={í}
                onClick={() => irA(í)}
                className={
                  'h-1.5 w-1.5 flex-shrink-0 rounded-full transition-all sm:h-2 sm:w-2' +
                  (í === índiceFoto
                    ? ' scale-125 bg-blue-400 shadow'
                    : ' bg-white/60 hover:bg-white/80')
                }
                aria-label={`Foto ${í + 1} de la galería del slide`}
                aria-current={í === índiceFoto ? 'true' : 'false'}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
