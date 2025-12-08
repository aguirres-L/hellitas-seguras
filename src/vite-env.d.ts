/// <reference types="vite/client" />

// Declaración de tipos para archivos multimedia importados con Vite
declare module '*.mp4' {
  const src: string;
  export default src;
}

declare module '*.webm' {
  const src: string;
  export default src;
}

declare module '*.mov' {
  const src: string;
  export default src;
}

