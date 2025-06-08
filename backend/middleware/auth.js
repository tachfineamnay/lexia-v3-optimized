const jwt = require('jsonwebtoken');

/**
 * Middleware pour vérifier le JWT et authentifier les utilisateurs
 * Ajoute req.user si authentifié correctement
 */
const authMiddleware = (req, res, next) => {
  // Récupérer le token depuis les headers (Authorization: Bearer token)
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : req.header('x-auth-token') || 
      req.query.token || 
      (req.cookies ? req.cookies['auth-token'] : null);

  // Vérifier si un token est présent
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Accès refusé, aucun token fourni' 
    });
  }

  try {
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ajouter les infos utilisateur à la requête
    req.user = decoded.user || decoded;
    
    next();
  } catch (err) {
    console.error('Erreur d\'authentification:', err.message);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expiré, veuillez vous reconnecter',
        expired: true
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: 'Token invalide' 
    });
  }
};

/**
 * Middleware pour vérifier si l'utilisateur est administrateur
 * Doit être utilisé après authMiddleware
 */
const adminMiddleware = (req, res, next) => {
  // Vérifier que l'utilisateur est authentifié
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentification requise' 
    });
  }

  // Vérifier le rôle admin
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Accès refusé, droits administrateur requis' 
    });
  }

  next();
};

module.exports = {
  authMiddleware,
  adminMiddleware
};

// Log de débogage pour confirmer l'export
console.log('Auth middleware exporté avec succès:', typeof module.exports.authMiddleware); 