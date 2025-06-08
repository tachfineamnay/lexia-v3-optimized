const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const VertexConfig = require('../models/vertexConfig');
const { VertexAI } = require('@google-cloud/vertexai');

/**
 * @route   GET /api/vertex
 * @desc    Récupérer toutes les configurations Vertex AI
 * @access  Admin
 */
router.get('/', authMiddleware, adminAuth, async (req, res) => {
  try {
    const configs = await VertexConfig.find()
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .sort({ updatedAt: -1 });
    
    res.json({
      success: true,
      count: configs.length,
      data: configs.map(config => config.getSafeConfig())
    });
  } catch (error) {
    console.error('Erreur de récupération des configurations Vertex:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des configurations Vertex AI',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/vertex/:id
 * @desc    Récupérer une configuration Vertex AI spécifique
 * @access  Admin
 */
router.get('/:id', authMiddleware, adminAuth, async (req, res) => {
  try {
    const config = await VertexConfig.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuration Vertex AI introuvable'
      });
    }
    
    res.json({
      success: true,
      data: config.getSafeConfig()
    });
  } catch (error) {
    console.error('Erreur de récupération de la configuration Vertex:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la configuration Vertex AI',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/vertex/default
 * @desc    Récupérer la configuration par défaut
 * @access  Private
 */
router.get('/default', authMiddleware, async (req, res) => {
  try {
    const config = await VertexConfig.findDefault();
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Aucune configuration Vertex AI par défaut trouvée'
      });
    }
    
    res.json({
      success: true,
      data: config.getSafeConfig()
    });
  } catch (error) {
    console.error('Erreur de récupération de la configuration Vertex par défaut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la configuration Vertex AI par défaut',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/vertex
 * @desc    Créer une nouvelle configuration Vertex AI
 * @access  Admin
 */
router.post('/', authMiddleware, adminAuth, async (req, res) => {
  try {
    const {
      name,
      description,
      isActive,
      isDefault,
      googleCloudConfig,
      modelConfig,
      usageLimits,
      promptTemplates,
      advancedOptions
    } = req.body;
    
    // Validation de base
    if (!name || !googleCloudConfig || !googleCloudConfig.apiKey || !googleCloudConfig.projectId) {
      return res.status(400).json({
        success: false,
        message: 'Les champs obligatoires sont manquants'
      });
    }
    
    // Vérifier si une configuration avec ce nom existe déjà
    const existingConfig = await VertexConfig.findOne({ name });
    if (existingConfig) {
      return res.status(400).json({
        success: false,
        message: 'Une configuration avec ce nom existe déjà'
      });
    }
    
    // Créer la nouvelle configuration
    const newConfig = new VertexConfig({
      name,
      description,
      isActive: isActive !== undefined ? isActive : true,
      isDefault: isDefault !== undefined ? isDefault : false,
      googleCloudConfig,
      createdBy: req.user.id,
      updatedBy: req.user.id
    });
    
    // Ajouter les champs optionnels s'ils sont fournis
    if (modelConfig) newConfig.modelConfig = modelConfig;
    if (usageLimits) newConfig.usageLimits = usageLimits;
    if (promptTemplates) newConfig.promptTemplates = promptTemplates;
    if (advancedOptions) newConfig.advancedOptions = advancedOptions;
    
    // Sauvegarder la configuration
    await newConfig.save();
    
    // Si cette configuration est définie comme par défaut, mettre à jour les autres
    if (isDefault) {
      await newConfig.setAsDefault();
    }
    
    res.status(201).json({
      success: true,
      message: 'Configuration Vertex AI créée avec succès',
      data: newConfig.getSafeConfig()
    });
  } catch (error) {
    console.error('Erreur de création de la configuration Vertex:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la configuration Vertex AI',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   PUT /api/vertex/:id
 * @desc    Mettre à jour une configuration Vertex AI
 * @access  Admin
 */
router.put('/:id', authMiddleware, adminAuth, async (req, res) => {
  try {
    const config = await VertexConfig.findById(req.params.id);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuration Vertex AI introuvable'
      });
    }
    
    const {
      name,
      description,
      isActive,
      isDefault,
      googleCloudConfig,
      modelConfig,
      usageLimits,
      promptTemplates,
      advancedOptions
    } = req.body;
    
    // Mettre à jour les champs si fournis
    if (name !== undefined) config.name = name;
    if (description !== undefined) config.description = description;
    if (isActive !== undefined) config.isActive = isActive;
    
    // Mettre à jour les objets imbriqués s'ils sont fournis
    if (googleCloudConfig) {
      Object.keys(googleCloudConfig).forEach(key => {
        config.googleCloudConfig[key] = googleCloudConfig[key];
      });
    }
    
    if (modelConfig) {
      Object.keys(modelConfig).forEach(key => {
        config.modelConfig[key] = modelConfig[key];
      });
    }
    
    if (usageLimits) {
      Object.keys(usageLimits).forEach(key => {
        config.usageLimits[key] = usageLimits[key];
      });
    }
    
    if (promptTemplates) {
      // Pour une Map, nous devons faire une approche légèrement différente
      config.promptTemplates.clear();
      Object.entries(promptTemplates).forEach(([key, value]) => {
        config.promptTemplates.set(key, value);
      });
    }
    
    if (advancedOptions) {
      Object.keys(advancedOptions).forEach(key => {
        config.advancedOptions[key] = advancedOptions[key];
      });
    }
    
    // Mettre à jour l'utilisateur qui a fait la modification
    config.updatedBy = req.user.id;
    
    // Sauvegarder les changements
    await config.save();
    
    // Si cette configuration est définie comme par défaut, mettre à jour les autres
    if (isDefault) {
      await config.setAsDefault();
    }
    
    res.json({
      success: true,
      message: 'Configuration Vertex AI mise à jour avec succès',
      data: config.getSafeConfig()
    });
  } catch (error) {
    console.error('Erreur de mise à jour de la configuration Vertex:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la configuration Vertex AI',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   DELETE /api/vertex/:id
 * @desc    Supprimer une configuration Vertex AI
 * @access  Admin
 */
router.delete('/:id', authMiddleware, adminAuth, async (req, res) => {
  try {
    const config = await VertexConfig.findById(req.params.id);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuration Vertex AI introuvable'
      });
    }
    
    // Vérifier si c'est la configuration par défaut
    if (config.isDefault) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer la configuration par défaut. Veuillez d\'abord définir une autre configuration comme par défaut.'
      });
    }
    
    await config.remove();
    
    res.json({
      success: true,
      message: 'Configuration Vertex AI supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur de suppression de la configuration Vertex:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la configuration Vertex AI',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   PUT /api/vertex/:id/set-default
 * @desc    Définir une configuration comme configuration par défaut
 * @access  Admin
 */
router.put('/:id/set-default', authMiddleware, adminAuth, async (req, res) => {
  try {
    const config = await VertexConfig.findById(req.params.id);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuration Vertex AI introuvable'
      });
    }
    
    // Vérifier si la configuration est active
    if (!config.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de définir une configuration inactive comme configuration par défaut'
      });
    }
    
    // Définir comme configuration par défaut
    await config.setAsDefault();
    
    res.json({
      success: true,
      message: 'Configuration définie comme configuration par défaut avec succès',
      data: config.getSafeConfig()
    });
  } catch (error) {
    console.error('Erreur lors de la définition de la configuration par défaut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la définition de la configuration par défaut',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   PUT /api/vertex/:id/reset-stats
 * @desc    Réinitialiser les statistiques d'utilisation
 * @access  Admin
 */
router.put('/:id/reset-stats', authMiddleware, adminAuth, async (req, res) => {
  try {
    const config = await VertexConfig.findById(req.params.id);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuration Vertex AI introuvable'
      });
    }
    
    // Réinitialiser les statistiques
    config.usageStats = {
      totalRequests: 0,
      totalTokensUsed: 0,
      requestsToday: 0,
      tokensToday: 0,
      dailyStatsResetAt: new Date(),
      lastUsed: null
    };
    
    config.updatedBy = req.user.id;
    await config.save();
    
    res.json({
      success: true,
      message: 'Statistiques réinitialisées avec succès',
      data: config.getSafeConfig()
    });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la réinitialisation des statistiques',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 