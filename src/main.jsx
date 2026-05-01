import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { NotificacionAppProvider } from './contexts/NotificacionAppContext.jsx'

// Service Worker en autoUpdate: si hay nueva versión, recarga sola.
// Lo registramos siempre (incluido dev=false por config) para no romper el flujo en desarrollo.
registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <NotificacionAppProvider>
        <App />
      </NotificacionAppProvider>
    </ThemeProvider>
  </StrictMode>,
)
