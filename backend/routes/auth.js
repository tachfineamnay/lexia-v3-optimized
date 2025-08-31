const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const { loginLimiter, forgotPasswordLimiter } = require('../middleware/rateLimiter');

// Import du middleware auth avec gestion d'erreur
let auth;
try {
  const authModule = require('../middleware/auth');
  auth = authModule.authMiddleware;
  if (typeof auth !== 'function') {
    console.error("ERREUR: authMiddleware n'est pas une fonction dans le module");
    throw new Error('authMiddleware is not a function');
  }
} catch (error) {
  console.error('Erreur lors de l\'import du middleware auth:', error);
  // Middleware de secours qui renvoie une erreur 401
  auth = (req, res, next) => {
    res.status(401).json({
      success: false,
      message: 'Erreur de configuration du serveur - middleware auth non disponible'
    });
  };
}

/**
 * @route   POST /api/auth/register
 * @desc    Inscription d'un nouvel utilisateur
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const {
      email,
      password,
      prenom,
      nom,
      phoneNumber,
      dateOfBirth,
      address,
      targetCertification,
      professionalInfo
    } = req.body;

    // Validation des données
    if (!email || !password || !prenom || !nom) {
      return res.status(400).json({
        success: false,
        message: 'Email, mot de passe, prénom et nom sont requis'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 8 caractères'
      });
    }

    // Vérifier si l'utilisateur existe déjà
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Générer un token de vérification d'email
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

    // Créer un nouvel utilisateur
    user = new User({
      email,
      password,
      firstName: prenom,
      lastName: nom,
      phoneNumber,
      dateOfBirth,
      address,
      targetCertification,
      professionalInfo,
      emailVerificationToken,
      emailVerificationExpires,
      isEmailVerified: false
    });

    // Enregistrer l'utilisateur (le middleware pre-save hash automatiquement le mot de passe)
    await user.save();

    // Génération des statistiques initiales
    user.usageStats = {
      aiRequestsCount: 0,
      dossiersCreated: 0,
      documentsUploaded: 0,
      lastActive: new Date()
    };
    await user.save();

    // Envoyer l'email de vérification
    await sendEmail(email, 'verification', emailVerificationToken);

    // Générer JWT
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Générer refresh token
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.REFRESH_TOKEN_SECRET || 'refreshsecretfallback',
      { expiresIn: '7d' }
    );

    // Retourner les informations de l'utilisateur sans le mot de passe
    const userProfile = user.getProfile();

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès. Veuillez vérifier votre email pour activer votre compte.',
      token,
      refreshToken,
      user: userProfile
    });
  } catch (err) {
    console.error('Erreur d\'inscription:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authentification d'un utilisateur
 * @access  Public
 */
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Validation des données
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe sont requis'
      });
    }

    // Rechercher l'utilisateur
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    // Vérifier si l'utilisateur est actif
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Ce compte est désactivé. Veuillez contacter l\'administrateur.'
      });
    }

    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    // Vérifier si l'utilisateur est vérifié
    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: 'Veuillez vérifier votre email avant de vous connecter'
      });
    }

    // Mettre à jour les informations de connexion
    await user.updateLoginStatus(ipAddress, userAgent);

    // Générer JWT
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Générer refresh token
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.REFRESH_TOKEN_SECRET || 'refreshsecretfallback',
      { expiresIn: '7d' }
    );

    // Retourner les informations de l'utilisateur sans le mot de passe
    const userProfile = user.getProfile();

    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      refreshToken,
      user: userProfile
    });
  } catch (err) {
    console.error('Erreur de connexion:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Rafraîchir le token JWT
 * @access  Public (avec refresh token)
 */
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token requis'
      });
    }

    // Vérifier le refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET || 'refreshsecretfallback'
    );

    // Vérifier si l'utilisateur existe toujours
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur introuvable'
      });
    }

    // Vérifier si l'utilisateur est actif
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Ce compte est désactivé'
      });
    }

    // Générer un nouveau token JWT
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };

    const newToken = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Générer un nouveau refresh token
    const newRefreshToken = jwt.sign(
      { userId: user.id },
      process.env.REFRESH_TOKEN_SECRET || 'refreshsecretfallback',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token: newToken,
      refreshToken: newRefreshToken
    });
  } catch (err) {
    console.error('Erreur de rafraîchissement de token:', err.message);
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token invalide ou expiré'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Obtenir les informations de l'utilisateur connecté
 * @access  Private
 */
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('dossiers', 'title status updatedAt')
      .populate('documents', 'title type updatedAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable'
      });
    }

    res.json({
      success: true,
      user: user.getProfile()
    });
  } catch (err) {
    console.error('Erreur de récupération du profil:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * @route   PUT /api/auth/password
 * @desc    Changer le mot de passe
 * @access  Private
 */
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validation des données
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe actuel et le nouveau mot de passe sont requis'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Le nouveau mot de passe doit contenir au moins 8 caractères'
      });
    }

    // Récupérer l'utilisateur
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable'
      });
    }

    // Vérifier le mot de passe actuel
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      });
    }

    // Mettre à jour le mot de passe
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });
  } catch (err) {
    console.error('Erreur de changement de mot de passe:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * @route   POST /api/auth/verify-email/:token
 * @desc    Vérifier l'email d'un utilisateur
 * @access  Public
 */
router.get('/verify-email/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      emailVerificationToken: req.params.token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Token invalide ou expiré' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: 'Email vérifié avec succès' });
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'email:', error);
    res.status(500).json({ error: 'Erreur lors de la vérification de l\'email' });
  }
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Demander une réinitialisation de mot de passe
 * @access  Public
 */
router.post('/forgot-password', forgotPasswordLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email requis'
      });
    }

    // Rechercher l'utilisateur
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Pour des raisons de sécurité, ne pas indiquer si l'utilisateur existe ou non
      return res.json({
        success: true,
        message: 'Si cet email existe dans notre système, un lien de réinitialisation a été envoyé'
      });
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 heure
    await user.save();

    // Envoyer l'email de réinitialisation
    await sendEmail(email, 'resetPassword', resetToken);

    res.json({
      success: true,
      message: 'Si cet email existe dans notre système, un lien de réinitialisation a été envoyé'
    });
  } catch (err) {
    console.error('Erreur de demande de réinitialisation de mot de passe:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * @route   POST /api/auth/reset-password/:token
 * @desc    Réinitialiser le mot de passe avec un token
 * @access  Public
 */
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Nouveau mot de passe requis'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 8 caractères'
      });
    }

    // Rechercher l'utilisateur avec ce token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token de réinitialisation invalide ou expiré'
      });
    }

    // Mettre à jour le mot de passe
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });
  } catch (err) {
    console.error('Erreur de réinitialisation de mot de passe:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Déconnexion (côté client, mais peut être utilisé pour invalidation future)
 * @access  Private
 */
router.post('/logout', auth, (req, res) => {
  // Dans une implémentation future, on pourrait ajouter le token à une liste noire
  res.json({
    success: true,
    message: 'Déconnexion réussie'
  });
});

module.exports = router;
