import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DoctorDashboard from '@/pages/DoctorDashboard';
import PatientDashboard from '@/pages/PatientDashboard';
import AnalysisReviewPage from '@/pages/AnalysisReviewPage';
import PatientReportPage from '@/pages/PatientReportPage';
import FunctionalAnalysisPage from '@/pages/FunctionalAnalysisPage';
import DashboardLayout from '@/components/common/DashboardLayout';

function PrivateRoute({ children, allowedRole }: { children: React.ReactNode; allowedRole?: 'doctor' | 'patient' }) {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && userRole !== allowedRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function DashboardRouter() {
  const { userRole } = useAuth();

  if (userRole === 'doctor') {
    return <DoctorDashboard />;
  } else if (userRole === 'patient') {
    return <PatientDashboard />;
  }

  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <DashboardRouter />
                </DashboardLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/doctor/analysis/:id"
            element={
              <PrivateRoute allowedRole="doctor">
                <DashboardLayout>
                  <AnalysisReviewPage />
                </DashboardLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/doctor/functional/:id"
            element={
              <PrivateRoute allowedRole="doctor">
                <DashboardLayout>
                  <FunctionalAnalysisPage />
                </DashboardLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/patient/report/:id"
            element={
              <PrivateRoute allowedRole="patient">
                <DashboardLayout>
                  <PatientReportPage />
                </DashboardLayout>
              </PrivateRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;