/**
 * Middleware pour vérifier que l'utilisateur est un administrateur
 * Doit être utilisé après le middleware auth standard
 */
module.exports = (req, res, next) => {
  try {
    // Vérifier si l'utilisateur est authentifié
    if (!req.user) {
      console.debug('[adminAuth] request unauthenticated');
      return res.status(401).json({ 
        success: false, 
        error: 'Non authentifié' 
      });
    }

    // Vérifier le rôle
    console.debug('[adminAuth] user role:', req.user.role);
    if (req.user.role !== 'admin') {
      console.debug('[adminAuth] access denied for role:', req.user.role);
      return res.status(403).json({ 
        success: false, 
        error: 'Accès non autorisé' 
      });
    }

    next();
  } catch (err) {
    console.error('[adminAuth] unexpected error', err && err.message);
    return res.status(500).json({ success: false, error: 'Erreur interne' });
  }
};