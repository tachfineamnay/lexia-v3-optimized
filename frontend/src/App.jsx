import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EmailConfirmation from './pages/EmailConfirmation';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Profile from './pages/Profile';
import UploadDocuments from './pages/UploadDocuments';
import QuestionFlow from './pages/QuestionFlow';
import FinalDossier from './pages/FinalDossier';
import AdminUploadQuestions from './pages/AdminUploadQuestions';
import VertexConfig from './pages/VertexConfig';
import NotFound from './pages/NotFound';
import VAECreation from './pages/VAECreation';
import AdminConfig from './pages/AdminConfig';
import AdminDashboard from './pages/AdminDashboard';

import { AuthProvider, useAuth } from './hooks/useAuth';
import { ToastProvider } from './hooks/useToast';

import './styles/lexia-design-system.css';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Admin route component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (user.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email/:token" element={<EmailConfirmation />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/documents" element={
                <ProtectedRoute>
                  <Documents />
                </ProtectedRoute>
              } />
              {/* Redirection pour les anciennes routes de documents */}
              <Route path="/documents/new" element={<Navigate to="/upload-documents" />} />
              <Route path="/documents/:id" element={<Navigate to="/documents" />} />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              {/* VAE Process Routes */}
              <Route path="/upload-documents" element={
                <ProtectedRoute>
                  <UploadDocuments />
                </ProtectedRoute>
              } />
              <Route path="/question-flow" element={
                <ProtectedRoute>
                  <QuestionFlow />
                </ProtectedRoute>
              } />
              <Route path="/final-dossier" element={
                <ProtectedRoute>
                  <FinalDossier />
                </ProtectedRoute>
              } />
              <Route path="/vae-creation" element={
                <ProtectedRoute>
                  <VAECreation />
                </ProtectedRoute>
              } />
              
              {/* Admin routes */}
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              <Route path="/admin/vertex" element={
                <AdminRoute>
                  <VertexConfig />
                </AdminRoute>
              } />
              <Route path="/admin/questions" element={
                <AdminRoute>
                  <AdminUploadQuestions />
                </AdminRoute>
              } />
              <Route path="/admin/config" element={
                <AdminRoute>
                  <AdminConfig />
                </AdminRoute>
              } />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App; 
