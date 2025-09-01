import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ToastProvider } from './hooks/useToast';

// Layout Components
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import EmailConfirmation from './pages/EmailConfirmation';
import NotFound from './pages/NotFound';

// Protected Pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Documents from './pages/Documents';
import AIChat from './pages/AIChat';
import UploadDocuments from './pages/UploadDocuments';
import QuestionFlow from './pages/QuestionFlow';
import FinalDossier from './pages/FinalDossier';
import VAECreation from './pages/VAECreation';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminUploadQuestions from './pages/AdminUploadQuestions';
import AdminConfig from './pages/AdminConfig';

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3,
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Main App Content
const AppContent = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation - Hidden on landing page */}
      {!isLandingPage && <Navbar />}
      
      {/* Main Content */}
      <main className={isLandingPage ? '' : 'pt-16'}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <Routes location={location}>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/verify-email/:token" element={<EmailConfirmation />} />
              
              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/documents"
                element={
                  <ProtectedRoute>
                    <Documents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <AIChat />
                  </ProtectedRoute>
                }
              />
              
              {/* VAE Process Routes */}
              <Route
                path="/upload-documents"
                element={
                  <ProtectedRoute>
                    <UploadDocuments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/question-flow"
                element={
                  <ProtectedRoute>
                    <QuestionFlow />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/final-dossier"
                element={
                  <ProtectedRoute>
                    <FinalDossier />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vae/create"
                element={
                  <ProtectedRoute>
                    <VAECreation />
                  </ProtectedRoute>
                }
              />
              
              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/questions"
                element={
                  <AdminRoute>
                    <AdminUploadQuestions />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/config"
                element={
                  <AdminRoute>
                    <AdminConfig />
                  </AdminRoute>
                }
              />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
};

export default App; 
