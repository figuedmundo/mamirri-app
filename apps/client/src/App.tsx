import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import AuthLayout from './components/auth/AuthLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from './components/ui/toaster';
import Patients from './pages/Patients';
import PatientDetail from './pages/PatientDetail';
import Analisis from './pages/Analisis';
import Biblioteca from './pages/Biblioteca';
import Plantillas from './pages/Plantillas';
import Ajustes from './pages/Ajustes';
import CaseDetail from './pages/CaseDetail';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>

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
                    <Analisis />
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
            />

            <Route
              path="/plantillas"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Plantillas />
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

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <Toaster />
    </ErrorBoundary>
  );
}

export default App;
