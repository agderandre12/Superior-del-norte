import React, { useContext, useEffect } from 'react';
import { AppProvider, AppContext, isAdmin } from './context/AppContext';
import Login from './components/Login';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import CreateCourseScreen from './components/CreateCourseScreen';
import Dashboard from './components/Dashboard';
import CourseDetail from './components/CourseDetail';
import CourseViewer from './components/CourseViewer';
import Exam from './components/Exam';
import Certificate from './components/Certificate';
import VerifyCertificate from './components/VerifyCertificate';
import HomePage from './components/HomePage';
import logoNorte from './assets/logo_instituto_norte.png';
import { LogOut, Home, ShieldCheck, Award } from 'lucide-react';

import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';


// Role-aware route guard. Replaces the indirect auth-guard effect for the
// "logged-in but wrong role" case: a student deep-linking /admin/dashboard
// is redirected to their own home instead of rendering a 403-stuck panel.
function ProtectedRoute({ children, allowRoles }: { children: React.ReactNode; allowRoles: string[] }) {
  const { user, token } = useContext(AppContext);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (user && !allowRoles.includes(user.rol)) {
    const home = isAdmin(user.rol) ? '/admin/dashboard' : '/dashboard';
    return <Navigate to={home} replace />;
  }
  return <>{children}</>;
}

function VerifyRouteWrapper() {
  const { code } = useParams();
  return <VerifyCertificate initialCode={code} />;
}

// Syncs the URL :courseId param into AppContext.activeCourseId.
// This is the ONLY place that reads the URL to update state (one-way: URL → state).
function CourseRouteWrapper({ children }) {
  const { courseId } = useParams();
  const { activeCourseId, setActiveCourseId } = useContext(AppContext);

  useEffect(() => {
    if (courseId) {
      const parsedId = parseInt(courseId);
      if (activeCourseId !== parsedId) {
        setActiveCourseId(parsedId);
      }
    }
  }, [courseId, activeCourseId, setActiveCourseId]);

  return children;
}

function MainLayout() {
  const { user, token, logout, progress } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  // NOTE: Legacy hash deep-links (`#verify=CODE`, `#admin`) are normalized to
  // canonical routes in `main.tsx`, BEFORE HashRouter mounts. Doing it here in
  // an effect was racy: the catch-all route redirected to "/" during the first
  // render and clobbered the original hash before this effect could read it.

  // FIX: Auth guard uses PRIMITIVE deps (user?.cedula, user?.rol) instead of
  // the full `user` object to avoid stale-closure re-runs on every render.
  // Also removed the currentView<->URL bidirectional sync effects entirely.
  // React Router (navigate()) is now the single source of truth for navigation.
  // Route-level role enforcement is handled by <ProtectedRoute> below.
  useEffect(() => {
    const publicPaths = ['/verify', '/'];
    const isPublicPath = location.pathname === '/' || publicPaths.some(path => path !== '/' && location.pathname.startsWith(path));

    if (!token && !isPublicPath && location.pathname !== '/admin/login' && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    } else if (token && user?.cedula) {
      if (isAdmin(user.rol)) {
        if (location.pathname === '/login' || location.pathname === '/admin/login' || location.pathname === '/') {
          navigate('/admin/dashboard', { replace: true });
        }
      } else {
        if (location.pathname === '/login' || location.pathname === '/admin/login' || location.pathname === '/') {
          navigate('/dashboard', { replace: true });
        }
      }
    }
  }, [token, user?.cedula, user?.rol, location.pathname, navigate]);

  const isLandingPage = location.pathname === '/';

  return (
    <div className="app-container" style={{ backgroundColor: 'var(--isn-bg-light)' }}>
      {/* Premium Navbar */}
      {!isLandingPage && (
        <nav className="glass-panel navbar" style={{ background: '#FFFFFF', borderBottom: '1px solid var(--border-glass)', borderRadius: '0 0 16px 16px', boxShadow: '0 4px 20px rgba(15, 44, 89, 0.02)' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => {
              if (user) {
                navigate(isAdmin(user.rol) ? '/admin/dashboard' : '/dashboard');
              } else {
                navigate('/');
              }
            }}
          >
            <img src={logoNorte} alt="Instituto Superior del Norte" style={{ height: '38px', width: 'auto' }} />
          </div>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={() => navigate(isAdmin(user.rol) ? '/admin/dashboard' : '/dashboard')}
                className="btn btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.85rem', height: '38px' }}
              >
                <Home size={16} />
                <span className="hide-mobile">Panel</span>
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 700 }}>{user.nombre_completo}</span>
                {isAdmin(user.rol) ? (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {user.rol === 'ingeniero_software' ? 'Ingeniero de Software' : 'Administrador'}
                  </span>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>{progress.progreso_porcentaje}% Completado</span>
                )}
              </div>

              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="btn btn-danger"
                style={{ padding: '8px 14px', fontSize: '0.85rem', height: '38px' }}
              >
                <LogOut size={16} />
                <span className="hide-mobile">Salir</span>
              </button>
            </div>
          ) : (
            !location.pathname.startsWith('/verify') && (
              <button
                onClick={() => navigate('/verify')}
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.85rem', height: '38px' }}
              >
                <ShieldCheck size={16} />
                <span>Verificar Certificado</span>
              </button>
            )
          )}
        </nav>
      )}

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: isLandingPage ? '0px' : '40px' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowRoles={['administrador', 'ingeniero_software']}><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/create-course" element={
            <ProtectedRoute allowRoles={['administrador', 'ingeniero_software']}><CreateCourseScreen /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute allowRoles={['estudiante']}><Dashboard /></ProtectedRoute>
          } />
          <Route path="/course/:courseId/detail" element={
            <ProtectedRoute allowRoles={['estudiante']}><CourseRouteWrapper><CourseDetail /></CourseRouteWrapper></ProtectedRoute>
          } />
          <Route path="/course/:courseId" element={
            <ProtectedRoute allowRoles={['estudiante']}><CourseRouteWrapper><CourseViewer /></CourseRouteWrapper></ProtectedRoute>
          } />
          <Route path="/course/:courseId/exam" element={
            <ProtectedRoute allowRoles={['estudiante']}><CourseRouteWrapper><Exam /></CourseRouteWrapper></ProtectedRoute>
          } />
          <Route path="/certificate/:courseId" element={
            <ProtectedRoute allowRoles={['estudiante']}><CourseRouteWrapper><Certificate /></CourseRouteWrapper></ProtectedRoute>
          } />
          <Route path="/verify" element={<VerifyCertificate />} />
          <Route path="/verify/:code" element={<VerifyRouteWrapper />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Premium Footer */}
      {!isLandingPage && (
        <footer style={{
          marginTop: 'auto',
          padding: '24px 0',
          borderTop: '1px solid var(--border-glass)',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <p>© 2026 Instituto Superior del Norte. Todos los derechos reservados.</p>
          <p style={{ fontWeight: 500 }}>Acreditación y Certificación del Instituto Superior del Norte.</p>
        </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <HashRouter>
        <MainLayout />
      </HashRouter>
    </AppProvider>
  );
}

export default App;
