import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedRouteProfesional from './components/ProtectedRouteProfesional';
import ProtectedRouteAdmin from './components/ProtectedRouteAdmin';
import ProtectedRouteMember from './components/ProtectedRouteMember';
import ProtectedRouteSuperAdmin from './components/ProtectedRouteSuperAdmin';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import LoginProfesional from './components/LoginProfesional';
import RegisterProfesional from './components/RegisterProfesional';
import { inicializarTokensDesdeFirebase } from './config/apiKeys';

// Code splitting: rutas pesadas se cargan bajo demanda.
// Esto reduce el bundle inicial (TTI más rápido en móviles y entrada más liviana en la PWA).
const DashboardSelector = lazy(() => import('./components/DashboardSelector'));
const DashboardAdmin = lazy(() => import('./components/DashboardAdmin'));
const DashboardSuperAdmin = lazy(() => import('./components/DashboardSuperAdmin'));
const DashboardProfesional = lazy(() => import('./components/DashboardProfesional'));
const PetProfile = lazy(() => import('./components/PetProfile'));
const PetProfilePublic = lazy(() => import('./components/PetProfilePublic'));
const VetDashboard = lazy(() => import('./components/VetDashboard'));
const GroomerDashboard = lazy(() => import('./components/GroomerDashboard'));
const UserSettings = lazy(() => import('./components/UserSettings'));
const About = lazy(() => import('./components/Home/About'));
const AccesoBloqueado = lazy(() => import('./components/AccesoBloqueado'));
const OnboardingMvp = lazy(() => import('./components/onboarding/OnboardingMvp'));

function PantallaCarga() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50">
      <div className="flex flex-col items-center gap-3 text-orange-600">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-300 border-t-transparent" />
        <span className="text-sm font-medium">Cargando…</span>
      </div>
    </div>
  );
}

function App() {
  // Inicializar tokens desde Firebase al cargar la aplicación
  useEffect(() => {
    inicializarTokensDesdeFirebase().catch((error) => {
      console.error('Error al inicializar tokens de IA:', error);
    });
  }, []);

  return (
    <Router>
      <Suspense fallback={<PantallaCarga />}>
        <Routes>
          {/* Rutas completamente públicas - fuera del AuthProvider */}
          <Route path="/pet/:id" element={<PetProfilePublic />} />

          {/* Rutas que requieren AuthProvider */}
          <Route path="/*" element={
            <AuthProvider>
              <Suspense fallback={<PantallaCarga />}>
                <Routes>
                  {/* Rutas públicas dentro del contexto de auth */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/login-profesional" element={<LoginProfesional />} />
                  <Route path="/register-profesional" element={<RegisterProfesional />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/onboarding" element={<OnboardingMvp />} />

                  {/* Ruta de acceso bloqueado */}
                  <Route path="/acceso-bloqueado" element={
                    <ProtectedRoute>
                      <AccesoBloqueado />
                    </ProtectedRoute>
                  } />

                  {/* Rutas protegidas que requieren membresía activa */}
                  <Route path="/dashboard" element={
                    <ProtectedRouteMember>
                      <DashboardSelector />
                    </ProtectedRouteMember>
                  } />
                  <Route path="/dashboard-admin" element={
                    <ProtectedRouteAdmin>
                      <DashboardAdmin />
                    </ProtectedRouteAdmin>
                  } />

                  <Route path="/dashboard-super-admin" element={
                    <ProtectedRouteSuperAdmin>
                      <DashboardSuperAdmin />
                    </ProtectedRouteSuperAdmin>
                  } />


                  <Route path="/dashboardProfesional" element={
                    <ProtectedRouteProfesional>
                      <DashboardProfesional />
                    </ProtectedRouteProfesional>
                  } />
                  <Route path="/pet-profile/:id" element={
                    <ProtectedRouteMember>
                      <PetProfile />
                    </ProtectedRouteMember>
                  } />
                  <Route path="/vet" element={
                    <ProtectedRouteMember>
                      <VetDashboard />
                    </ProtectedRouteMember>
                  } />
                  <Route path="/groomer" element={
                    <ProtectedRouteMember>
                      <GroomerDashboard />
                    </ProtectedRouteMember>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRouteMember>
                      <UserSettings />
                    </ProtectedRouteMember>
                  } />
                </Routes>
              </Suspense>
            </AuthProvider>
          } />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
