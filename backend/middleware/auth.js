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
      error: 'Non authentifié' 
    });
  }

  try {
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
  // Ajouter les infos utilisateur à la requête
  const payload = decoded.user || decoded;
  // Normalize: always provide both id and userId if possible
  req.user = Object.assign({}, payload);
  if (!req.user.id && req.user.userId) req.user.id = req.user.userId;
  if (!req.user.userId && req.user.id) req.user.userId = req.user.id;
    
    next();
  } catch (err) {
    console.error('Erreur d\'authentification:', err.message);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Token expiré, veuillez vous reconnecter',
        expired: true
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      error: 'Token invalide' 
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