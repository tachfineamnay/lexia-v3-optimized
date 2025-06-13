const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const VAE = require('../models/VAE');
const User = require('../models/User');

// Obtenir les statistiques du dashboard
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Compter les VAE par statut
    const [totalVAE, completedVAE, inProgressVAE] = await Promise.all([
      VAE.countDocuments({ user: userId }),
      VAE.countDocuments({ user: userId, status: 'completed' }),
      VAE.countDocuments({ user: userId, status: 'in_progress' })
    ]);

    // Calculer le taux de complétion
    const completionRate = totalVAE > 0 
      ? Math.round((completedVAE / totalVAE) * 100) 
      : 0;

    res.json({
      totalVAE,
      completedVAE,
      inProgressVAE,
      completionRate
    });
  } catch (error) {
    console.error('Erreur stats dashboard:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

// Obtenir l'activité récente
router.get('/activity', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    // Récupérer les VAE récemment modifiées
    const recentVAE = await VAE.find({ user: userId })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .select('title status updatedAt progress');

    // Formater les données d'activité
    const activity = recentVAE.map(vae => ({
      id: vae._id,
      type: 'vae_update',
      title: vae.title,
      status: vae.status,
      progress: vae.progress,
      timestamp: vae.updatedAt,
      description: `Dossier VAE "${vae.title}" mis à jour`
    }));

    res.json(activity);
  } catch (error) {
    console.error('Erreur activité dashboard:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'activité' });
  }
});

// Obtenir les insights IA
router.get('/insights', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Récupérer les VAE de l'utilisateur
    const userVAEs = await VAE.find({ user: userId })
      .select('status progress createdAt updatedAt');

    // Calculer les insights
    const insights = {
      averageCompletionTime: calculateAverageCompletionTime(userVAEs),
      progressTrend: calculateProgressTrend(userVAEs),
      recommendations: generateRecommendations(userVAEs),
      nextSteps: generateNextSteps(userVAEs)
    };

    res.json(insights);
  } catch (error) {
    console.error('Erreur insights dashboard:', error);
    res.status(500).json({ error: 'Erreur lors de la génération des insights' });
  }
});

// Fonctions helper pour les insights
function calculateAverageCompletionTime(vaes) {
  const completedVAEs = vaes.filter(v => v.status === 'completed');
  if (completedVAEs.length === 0) return null;

  const totalDays = completedVAEs.reduce((sum, vae) => {
    const days = Math.floor((vae.updatedAt - vae.createdAt) / (1000 * 60 * 60 * 24));
    return sum + days;
  }, 0);

  return Math.round(totalDays / completedVAEs.length);
}

function calculateProgressTrend(vaes) {
  const activeVAEs = vaes.filter(v => v.status === 'in_progress');
  if (activeVAEs.length === 0) return 'stable';

  // Calculer la progression moyenne sur les 7 derniers jours
  const recentProgress = activeVAEs.filter(v => {
    const daysSinceUpdate = (Date.now() - v.updatedAt) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate <= 7;
  });

  if (recentProgress.length > activeVAEs.length / 2) {
    return 'increasing';
  } else if (recentProgress.length < activeVAEs.length / 4) {
    return 'decreasing';
  }
  return 'stable';
}

function generateRecommendations(vaes) {
  const recommendations = [];

  // Recommandations basées sur le nombre de VAE
  if (vaes.length === 0) {
    recommendations.push({
      type: 'start',
      message: 'Commencez votre première VAE dès aujourd\'hui !',
      priority: 'high'
    });
  }

  // Recommandations basées sur les VAE inactives
  const inactiveVAEs = vaes.filter(v => {
    const daysSinceUpdate = (Date.now() - v.updatedAt) / (1000 * 60 * 60 * 24);
    return v.status === 'in_progress' && daysSinceUpdate > 14;
  });

  if (inactiveVAEs.length > 0) {
    recommendations.push({
      type: 'continue',
      message: `Vous avez ${inactiveVAEs.length} dossier(s) en attente. Reprenez où vous en étiez !`,
      priority: 'medium'
    });
  }

  // Recommandations basées sur la progression
  const lowProgressVAEs = vaes.filter(v => 
    v.status === 'in_progress' && v.progress < 30
  );

  if (lowProgressVAEs.length > 0) {
    recommendations.push({
      type: 'ai_help',
      message: 'Utilisez l\'assistant IA pour accélérer votre progression',
      priority: 'medium'
    });
  }

  return recommendations;
}

function generateNextSteps(vaes) {
  const nextSteps = [];

  const inProgressVAEs = vaes.filter(v => v.status === 'in_progress');
  
  if (inProgressVAEs.length > 0) {
    // Étapes basées sur la progression
    inProgressVAEs.forEach(vae => {
      if (vae.progress < 25) {
        nextSteps.push({
          vaeId: vae._id,
          step: 'Compléter la description de vos expériences',
          priority: 1
        });
      } else if (vae.progress < 50) {
        nextSteps.push({
          vaeId: vae._id,
          step: 'Ajouter les justificatifs et documents',
          priority: 2
        });
      } else if (vae.progress < 75) {
        nextSteps.push({
          vaeId: vae._id,
          step: 'Réviser et améliorer vos descriptions',
          priority: 3
        });
      } else {
        nextSteps.push({
          vaeId: vae._id,
          step: 'Finaliser et exporter votre dossier',
          priority: 4
        });
      }
    });
  } else if (vaes.length === 0) {
    nextSteps.push({
      step: 'Créer votre premier dossier VAE',
      priority: 1
    });
  }

  return nextSteps.sort((a, b) => a.priority - b.priority).slice(0, 3);
}

module.exports = router; 