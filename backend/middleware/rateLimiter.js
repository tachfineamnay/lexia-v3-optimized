const rateLimit = require('express-rate-limit');

// Limiteur général pour toutes les routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes max par IP
  message: {
    success: false,
    message: 'Trop de requêtes depuis cette adresse IP, veuillez réessayer dans 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiteur strict pour l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives de connexion max
  message: {
    success: false,
    message: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Ne pas compter les connexions réussies
});

// Limiteur pour l'upload de fichiers
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 20, // 20 uploads max par heure
  message: {
    success: false,
    message: 'Limite d\'upload atteinte. Veuillez réessayer dans une heure.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiteur pour les appels à l'IA
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 50, // 50 appels IA max par heure
  message: {
    success: false,
    message: 'Limite d\'utilisation de l\'IA atteinte. Veuillez réessayer plus tard.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiteur pour la route de connexion
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives maximum
  message: {
    error: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Limiteur pour la route de mot de passe oublié
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3, // 3 tentatives maximum
  message: {
    error: 'Trop de demandes de réinitialisation. Veuillez réessayer dans 1 heure.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  generalLimiter,
  authLimiter,
  uploadLimiter,
  aiLimiter,
  loginLimiter,
  forgotPasswordLimiter
}; 