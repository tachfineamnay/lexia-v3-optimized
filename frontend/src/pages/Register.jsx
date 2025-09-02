import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  EyeIcon,
  EyeSlashIcon,
  AcademicCapIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

/**
 * Composant d'inscription moderne
 * Interface repensée avec animations et design moderne
 */
function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName) {
      newErrors.firstName = 'Le prénom est obligatoire';
    }
    
    if (!formData.lastName) {
      newErrors.lastName = 'Le nom est obligatoire';
    }
    
    if (!formData.email) {
      newErrors.email = 'L\'email est obligatoire';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }
    
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est obligatoire';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    setErrors(newErrors);
    // focus the first error field for accessibility
    if (Object.keys(newErrors).length) {
      const firstKey = Object.keys(newErrors)[0];
      const el = document.getElementById(firstKey);
      if (el && typeof el.focus === 'function') el.focus();
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Effacer l'erreur quand l'utilisateur tape
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await register(formData);
        setRegistrationSuccess(true);
      } catch (error) {
        setErrors({
          auth: error.message || 'L\'inscription a échoué. Veuillez réessayer.'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const containerVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4">
        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <motion.div
            variants={containerVariants}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 mb-6"
            >
              <CheckCircleIcon className="h-8 w-8 text-white" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-white mb-4"
            >
              Félicitations ! 🎉
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-300 mb-6 leading-relaxed"
            >
              Votre compte a été créé avec succès ! Un email de confirmation a été envoyé à{' '}
              <span className="text-purple-400 font-medium">{formData.email}</span>.
              <br /><br />
              Veuillez vérifier votre boîte de réception et cliquer sur le lien pour activer votre compte.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition"
              >
                <SparklesIcon className="h-5 w-5" />
                Aller à la connexion
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4">
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <motion.div
          variants={containerVariants}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <AcademicCapIcon className="h-10 w-10 text-purple-400" />
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Lexia V4
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Créer votre compte</h1>
          <p className="text-gray-400">Rejoignez la révolution de la VAE</p>
        </motion.div>

        {/* Form Container */}
        <motion.div
          variants={containerVariants}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl"
        >
          {/* Error Alert */}
      {errors.auth && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6"
        role="alert"
            >
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed">{errors.auth}</p>
              </div>
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                  Prénom
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    aria-invalid={!!errors.firstName}
                    aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                    className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 ${
                      errors.firstName ? 'border-red-500 focus:ring-red-500' : 'border-white/10 hover:border-white/20'
                    }`}
                    placeholder="Votre prénom"
                    autoComplete="given-name"
                  />
                </div>
                {errors.firstName && (
                  <motion.p
                    id="firstName-error"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-400"
                    role="alert"
                  >
                    {errors.firstName}
                  </motion.p>
                )}
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                  Nom
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    aria-invalid={!!errors.lastName}
                    aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                    className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 ${
                      errors.lastName ? 'border-red-500 focus:ring-red-500' : 'border-white/10 hover:border-white/20'
                    }`}
                    placeholder="Votre nom"
                    autoComplete="family-name"
                  />
                </div>
                {errors.lastName && (
                  <motion.p
                    id="lastName-error"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-400"
                    role="alert"
                  >
                    {errors.lastName}
                  </motion.p>
                )}
              </div>
            </div>
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 ${
                    errors.email ? 'border-red-500 focus:ring-red-500' : 'border-white/10 hover:border-white/20'
                  }`}
                  placeholder="votre@email.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <motion.p
                  id="email-error"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-400"
                  role="alert"
                >
                  {errors.email}
                </motion.p>
              )}
            </div>
            
            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  className={`w-full pl-10 pr-12 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 ${
                    errors.password ? 'border-red-500 focus:ring-red-500' : 'border-white/10 hover:border-white/20'
                  }`}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  id="password-error"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-400"
                  role="alert"
                >
                  {errors.password}
                </motion.p>
              )}
            </div>
            
            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                  className={`w-full pl-10 pr-12 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 ${
                    errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-white/10 hover:border-white/20'
                  }`}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <motion.p
                  id="confirmPassword-error"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-400"
                  role="alert"
                >
                  {errors.confirmPassword}
                </motion.p>
              )}
            </div>
            
            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              aria-disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="sr-only">{isSubmitting ? 'Création en cours' : 'Créer mon compte'}</span>
                {isSubmitting && <LoadingSpinner size="sm" color="white" />}
                <span aria-hidden>{isSubmitting ? 'Création...' : 'Créer mon compte'}</span>
              </div>
            </motion.button>
          </form>
          
          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Déjà un compte ?{' '}
              <Link 
                to="/login" 
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Register; 