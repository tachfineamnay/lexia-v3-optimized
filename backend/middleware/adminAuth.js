/**
 * Middleware pour vérifier que l'utilisateur est un administrateur
 * Doit être utilisé après le middleware auth standard
 */
module.exports = (req, res, next) => {
  // Vérifier si l'utilisateur est authentifié
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Non authentifié' 
    });
  }

  // Vérifier le rôle
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Accès refusé: privilèges administrateur requis' 
    });
  }

  next();
}; 