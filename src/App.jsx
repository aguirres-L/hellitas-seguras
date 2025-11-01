import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedRouteProfesional from './components/ProtectedRouteProfesional';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import LoginProfesional from './components/LoginProfesional';
import RegisterProfesional from './components/RegisterProfesional';
import DashboardSelector from './components/DashboardSelector';
import DashboardAdmin from './components/DashboardAdmin';
import DashboardProfesional from './components/DashboardProfesional';
import PetProfile from './components/PetProfile';
import PetProfilePublic from './components/PetProfilePublic';
import VetDashboard from './components/VetDashboard';
import GroomerDashboard from './components/GroomerDashboard';
import UserSettings from './components/UserSettings';
import About from './components/Home/About';
import ProtectedRouteAdmin from './components/ProtectedRouteAdmin';
import ProtectedRouteMember from './components/ProtectedRouteMember';
import AccesoBloqueado from './components/AccesoBloqueado';
import ProtectedRouteSuperAdmin from './components/ProtectedRouteSuperAdmin';
import DashboardSuperAdmin from './components/DashboardSuperAdmin';
import { inicializarTokensDesdeFirebase } from './config/apiKeys';

function App() {
  // Inicializar tokens desde Firebase al cargar la aplicación
  useEffect(() => {
    inicializarTokensDesdeFirebase().catch((error) => {
      console.error('Error al inicializar tokens de IA:', error);
    });
  }, []);

  return (
    <Router> 
      <Routes>
        {/* Rutas completamente públicas - fuera del AuthProvider */}
        <Route path="/pet/:id" element={<PetProfilePublic />} />
        
        {/* Rutas que requieren AuthProvider */}
        <Route path="/*" element={
          <AuthProvider>
            <Routes>
              {/* Rutas públicas dentro del contexto de auth */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login-profesional" element={<LoginProfesional />} />
              <Route path="/register-profesional" element={<RegisterProfesional />} />
              <Route path="/about" element={<About />} />
              
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
          </AuthProvider>
        } />
      </Routes>
    </Router>
  );
}

export default App;