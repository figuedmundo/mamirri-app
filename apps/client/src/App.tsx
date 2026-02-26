import { lazy, Suspense, useEffect, useState } from 'react';
import {
  BrowserRouter,
  useLocation,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { MainLayout } from './components/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { AuthProvider } from './context/AuthProvider';
import Login from './pages/Login';
import PinLogin from './pages/PinLogin';
import ForgotPassword from './pages/ForgotPassword';
import InvitationAcceptance from './pages/InvitationAcceptance';
import InvitationSuccess from './pages/InvitationSuccess';
import Onboarding from './pages/Onboarding';
import OnboardingSuccess from './pages/OnboardingSuccess';
import AuthLayout from './components/auth/AuthLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from './components/ui/toaster';
import { UpdateNotification } from './components/pwa/UpdateNotification';
import { OfflineBanner } from './components/pwa/OfflineBanner';
import Patients from './pages/Patients';
import PatientDetail from './pages/PatientDetail';
const Analisis = lazy(() => import('./pages/Analisis'));
import Biblioteca from './pages/Biblioteca';
const BibliotecaBook = lazy(() => import('./pages/BibliotecaBook'));
const Plantillas = lazy(() => import('./pages/Plantillas'));
import Ajustes from './pages/Ajustes';
import Perfil from './pages/Perfil';
import ClinicDashboard from './pages/ClinicDashboard';
import CaseDetail from './pages/CaseDetail';
import ClinicOnboarding from './pages/ClinicOnboarding';
import ClinicQuickStart from './pages/ClinicQuickStart';
import { LoggerErrorBoundary } from './lib/logger/error-boundary';
import { useInteractionLogger } from './lib/logger/hooks/useInteractionLogger';
import { usePerformanceLogger } from './lib/logger/hooks/usePerformanceLogger';
import { api } from './lib/axios';
import { setupInterceptors } from './lib/logger/axios-logger';
import { Loader2 } from 'lucide-react';
import { queryClient } from './lib/query-client';
import { initSentry } from './lib/sentry-init';
import { useAuth } from './hooks/use-auth';
import PinSetupModal from './components/auth/PinSetupModal';

setupInterceptors(api);

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

const EXCLUDED_PATHS = [
  '/onboarding',
  '/invite/accept',
  '/invite/success',
  '/login',
  '/register',
  '/forgot-password',
  '/pin-login',
  '/perfil',
];

function AppContent() {
  const { pathname } = useLocation();
  const { isAuthenticated, hasPinSet } = useAuth();
  const [hasDismissedModal, setHasDismissedModal] = useState(false);

  const isExcluded = EXCLUDED_PATHS.some((path) => pathname.startsWith(path));
  const isSkipped = localStorage.getItem('pin_setup_skipped') === 'true';

  const showPinSetup =
    isAuthenticated &&
    hasPinSet === false &&
    !isExcluded &&
    !hasDismissedModal &&
    !isSkipped;

  useInteractionLogger();
  usePerformanceLogger();

  return (
    <div className="relative min-h-screen">
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/pin-login" element={<PinLogin />} />
          <Route
            path="/register"
            element={<Navigate to="/onboarding" replace />}
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/invite/accept" element={<InvitationAcceptance />} />
        </Route>

        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/onboarding/success" element={<OnboardingSuccess />} />
        <Route path="/invite/success" element={<InvitationSuccess />} />

        <Route
          path="/onboarding/clinic"
          element={
            <ProtectedRoute>
              <ClinicOnboarding />
            </ProtectedRoute>
          }
        />

        <Route
          path="/onboarding/quick-start"
          element={
            <ProtectedRoute>
              <ClinicQuickStart />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/pacientes"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Patients />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/pacientes/nuevo"
          element={<Navigate to="/pacientes?action=new" replace />}
        />

        <Route
          path="/pacientes/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PatientDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/pacientes/:id/casos/:caseId"
          element={
            <ProtectedRoute>
              <CaseDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analisis"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Suspense fallback={<PageLoader />}>
                  <Analisis />
                </Suspense>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/biblioteca"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Biblioteca />
              </MainLayout>
            </ProtectedRoute>
          }
        >
          <Route
            path="libros/:documentId"
            element={
              <Suspense fallback={<PageLoader />}>
                <BibliotecaBook />
              </Suspense>
            }
          />
        </Route>

        <Route
          path="/plantillas"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Suspense fallback={<PageLoader />}>
                  <Plantillas />
                </Suspense>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/clinica"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ClinicDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ajustes"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Ajustes />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Perfil />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showPinSetup && (
        <PinSetupModal
          isOpen={showPinSetup}
          onClose={() => {
            localStorage.setItem('pin_setup_skipped', 'true');
            setHasDismissedModal(true);
          }}
        />
      )}
    </div>
  );
}

function App() {
  useEffect(() => {
    initSentry().catch((error) => {
      console.error('Sentry initialization failed:', error);
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LoggerErrorBoundary>
        <ErrorBoundary>
          <BrowserRouter>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </BrowserRouter>
          <Toaster />
          <UpdateNotification />
          <OfflineBanner />
        </ErrorBoundary>
      </LoggerErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
