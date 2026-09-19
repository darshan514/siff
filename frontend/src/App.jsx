import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { PredictionProvider } from './context/PredictionContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import MouseTracker from './components/common/MouseTracker';

// Pages
import HomePage from './pages/HomePage';
import PredictPage from './pages/PredictPage';
import BatchPage from './pages/BatchPage';
import AnalyticsPage from './pages/AnalyticsPage';
import HistoryPage from './pages/HistoryPage';

// Auth & Dashboard Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import SafetyOfficerDashboard from './pages/SafetyOfficerDashboard';
import ProfilePage from './pages/ProfilePage';
import MyReportsPage from './pages/MyReportsPage';

import SafetyChatbot from './components/chat/SafetyChatbot';

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <PredictionProvider>
            <Router>
              <div className="min-h-screen flex flex-col relative text-slate-900 transition-colors duration-300 selection:bg-[#FF5E3A]/20 selection:text-[#FF5E3A] overflow-x-hidden">
                
                {/* Horizon Mouse-Reactive Dynamic Gradient Tracker */}
                <MouseTracker />

                {/* Horizon Floating Rounded-Full Navbar */}
                <Navbar />

                {/* Main Page Content */}
                <main className="flex-1 max-w-[1728px] w-full mx-auto pb-16 z-10 relative">
                  <Routes>
                    {/* Public Pages */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/predict" element={<PredictPage />} />

                    {/* Auth Pages */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                    {/* Incident Submission & Tracking Routes */}
                    <Route
                      path="/my-reports"
                      element={
                        <ProtectedRoute allowedRoles={['worker', 'admin']}>
                          <MyReportsPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Protected Employee & Safety Officer Routes */}
                    <Route
                      path="/employee-dashboard"
                      element={
                        <ProtectedRoute allowedRoles={['worker', 'admin']}>
                          <EmployeeDashboard />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/officer-dashboard"
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <SafetyOfficerDashboard />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute allowedRoles={['worker', 'admin']}>
                          <ProfilePage />
                        </ProtectedRoute>
                      }
                    />

                    <Route path="/history" element={<HistoryPage />} />
                    <Route path="/batch" element={<BatchPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                  </Routes>
                </main>

                {/* AI Safety & System Assistant Floating Chatbot */}
                <SafetyChatbot />

                {/* Horizon Minimal Glass Footer */}
                <Footer />

              </div>
            </Router>
          </PredictionProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
