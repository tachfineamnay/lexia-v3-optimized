const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const QuestionSet = require('../models/questionSet');
const Document = require('../models/document');
const { logger } = require('../utils/logger');

// Configuration du stockage pour les uploads JSON
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/questions');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'questions-' + uniqueSuffix + '.json');
  }
});

// Filtre pour s'assurer que seuls les fichiers JSON sont acceptés
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/json') {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers JSON sont acceptés'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter
});

/**
 * @route   POST /api/questions/upload
 * @desc    Importer un ensemble de questions depuis un fichier JSON
 * @access  Admin
 */
router.post('/upload', authMiddleware, adminAuth, upload.single('file'), async (req, res) => {
  const operationId = logger.startOperation('upload_question_set');
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier JSON n\'a été téléversé'
      });
    }

    // Lire et parser le fichier JSON
    const fileContent = fs.readFileSync(req.file.path, 'utf8');
    let questionsData;
    
    try {
      questionsData = JSON.parse(fileContent);
    } catch (parseError) {
      // Supprimer le fichier en cas d'erreur de parsing
      fs.unlinkSync(req.file.path);
      
      logger.logError('JSON parsing error', {
        operationId,
        error: parseError.message,
        filePath: req.file.path
      });
      
      return res.status(400).json({
        success: false,
        message: 'Format JSON invalide',
        error: parseError.message
      });
    }
    
    // Validation de la structure
    const validationErrors = validateQuestionSet(questionsData);
    if (validationErrors.length > 0) {
      // Supprimer le fichier en cas d'erreur de validation
      fs.unlinkSync(req.file.path);
      
      logger.logError('Question set validation failed', {
        operationId,
        errors: validationErrors
      });
      
      return res.status(400).json({
        success: false,
        message: 'Structure JSON invalide',
        errors: validationErrors
      });
    }
    
    // Vérifier si un questionnaire actif existe déjà pour cette certification
    if (questionsData.isActive) {
      const existingActive = await QuestionSet.findOne({
        targetCertification: questionsData.targetCertification,
        isActive: true
      });
      
      if (existingActive) {
        // Supprimer le fichier
        fs.unlinkSync(req.file.path);
        
        logger.logError('Active question set already exists', {
          operationId,
          targetCertification: questionsData.targetCertification,
          existingId: existingActive._id
        });
        
        return res.status(400).json({
          success: false,
          message: `Un questionnaire actif existe déjà pour la certification ${questionsData.targetCertification}`,
          existingQuestionSet: existingActive.getSimplified()
        });
      }
    }
    
    // Créer un nouvel ensemble de questions
    const questionSet = new QuestionSet({
      title: questionsData.title,
      description: questionsData.description || '',
      targetCertification: questionsData.targetCertification,
      certificationLevel: questionsData.certificationLevel || '',
      version: questionsData.version || '1.0.0',
      isActive: questionsData.isActive || false,
      createdBy: req.user.id,
      updatedBy: req.user.id,
      sections: questionsData.sections.map(section => ({
        sectionId: section.sectionId || `section-${Math.random().toString(36).substr(2, 9)}`,
        title: section.title,
        description: section.description || '',
        order: section.order || 0,
        questions: Array.isArray(section.questions) ? section.questions.map(question => ({
          questionId: question.questionId || `question-${Math.random().toString(36).substr(2, 9)}`,
          text: question.text,
          description: question.description || '',
          type: question.type || 'text',
          required: question.required || false,
          options: question.options || [],
          validation: question.validation || {},
          aiAssist: question.aiAssist || false,
          aiPrompt: question.aiPrompt || '',
          defaultValue: question.defaultValue || '',
          order: question.order || 0,
          dependsOn: question.dependsOn || null
        })) : []
      })),
      metadata: questionsData.metadata || {},
      aiPromptTemplate: questionsData.aiPromptTemplate || ''
    });
    
    // Sauvegarder dans la base de données
    await questionSet.save();
    
    // Supprimer le fichier après traitement réussi
    fs.unlinkSync(req.file.path);
    
    logger.endOperation(operationId, {
      questionSetId: questionSet._id,
      sectionsCount: questionSet.sections.length,
      totalQuestions: questionSet.sections.reduce((acc, section) => acc + section.questions.length, 0)
    });
    
    res.status(201).json({
      success: true,
      message: 'Ensemble de questions importé avec succès',
      questionSet: questionSet.getSimplified()
    });
  } catch (error) {
    logger.logError('Question set upload failed', {
      operationId,
      error: error.message,
      stack: error.stack
    });
    
    // Nettoyer le fichier en cas d'erreur
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'importation des questions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/questions
 * @desc    Obtenir tous les ensembles de questions
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Filtres et pagination
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;
    
    // Construire le filtre
    const filter = {};
    
    // Filtre par certification cible
    if (req.query.certification) {
      filter.targetCertification = { $regex: req.query.certification, $options: 'i' };
    }
    
    // Filtre par niveau
    if (req.query.level) {
      filter.certificationLevel = { $regex: req.query.level, $options: 'i' };
    }
    
    // Filtre actif/inactif (admin seulement)
    if (req.query.active !== undefined && req.user.role === 'admin') {
      filter.isActive = req.query.active === 'true';
    } else {
      // Les utilisateurs normaux ne voient que les ensembles actifs
      filter.isActive = true;
    }
    
    // Recherche textuelle
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { targetCertification: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Compter le total pour la pagination
    const total = await QuestionSet.countDocuments(filter);
    
    // Récupérer les ensembles de questions
    const questionSets = await QuestionSet.find(filter)
      .select('-sections.questions') // Exclure les questions détaillées pour alléger
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
    
    res.json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      questionSets: questionSets.map(qs => qs.getSimplified())
    });
  } catch (error) {
    console.error('Erreur de récupération des questions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des ensembles de questions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/questions/:id
 * @desc    Obtenir un ensemble de questions spécifique
 * @access  Private
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const questionSet = await QuestionSet.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
    
    if (!questionSet) {
      return res.status(404).json({
        success: false,
        message: 'Ensemble de questions introuvable'
      });
    }
    
    // Vérifier si l'ensemble est actif, sauf pour les administrateurs
    if (!questionSet.isActive && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cet ensemble de questions n\'est pas disponible actuellement'
      });
    }
    
    res.json({
      success: true,
      questionSet
    });
  } catch (error) {
    console.error('Erreur de récupération de l\'ensemble de questions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'ensemble de questions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   PUT /api/questions/:id
 * @desc    Mettre à jour un ensemble de questions
 * @access  Admin
 */
router.put('/:id', authMiddleware, adminAuth, async (req, res) => {
  try {
    const questionSet = await QuestionSet.findById(req.params.id);
    
    if (!questionSet) {
      return res.status(404).json({
        success: false,
        message: 'Ensemble de questions introuvable'
      });
    }
    
    // Champs modifiables
    const {
      title,
      description,
      targetCertification,
      certificationLevel,
      isActive,
      version,
      sections,
      metadata,
      aiPromptTemplate
    } = req.body;
    
    // Mettre à jour les champs de base
    if (title !== undefined) questionSet.title = title;
    if (description !== undefined) questionSet.description = description;
    if (targetCertification !== undefined) questionSet.targetCertification = targetCertification;
    if (certificationLevel !== undefined) questionSet.certificationLevel = certificationLevel;
    if (isActive !== undefined) questionSet.isActive = isActive;
    if (version !== undefined) questionSet.version = version;
    if (aiPromptTemplate !== undefined) questionSet.aiPromptTemplate = aiPromptTemplate;
    
    // Mettre à jour les métadonnées
    if (metadata && typeof metadata === 'object') {
      Object.keys(metadata).forEach(key => {
        questionSet.metadata.set(key, metadata[key]);
      });
    }
    
    // Mettre à jour les sections si fournies
    if (sections && Array.isArray(sections)) {
      questionSet.sections = sections;
    }
    
    // Mettre à jour l'utilisateur qui a modifié
    questionSet.updatedBy = req.user.id;
    
    // Sauvegarder les modifications
    await questionSet.save();
    
    res.json({
      success: true,
      message: 'Ensemble de questions mis à jour avec succès',
      questionSet: questionSet.getSimplified()
    });
  } catch (error) {
    console.error('Erreur de mise à jour de l\'ensemble de questions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'ensemble de questions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   DELETE /api/questions/:id
 * @desc    Supprimer un ensemble de questions
 * @access  Admin
 */
router.delete('/:id', authMiddleware, adminAuth, async (req, res) => {
  try {
    const questionSet = await QuestionSet.findById(req.params.id);
    
    if (!questionSet) {
      return res.status(404).json({
        success: false,
        message: 'Ensemble de questions introuvable'
      });
    }
    
    // On pourrait aussi implémenter une suppression logique (soft delete)
    // en désactivant simplement l'ensemble plutôt que de le supprimer vraiment
    if (req.query.soft === 'true') {
      questionSet.isActive = false;
      questionSet.updatedBy = req.user.id;
      await questionSet.save();
      
      return res.json({
        success: true,
        message: 'Ensemble de questions désactivé avec succès'
      });
    }
    
    // Suppression définitive
    await questionSet.remove();
    
    res.json({
      success: true,
      message: 'Ensemble de questions supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur de suppression de l\'ensemble de questions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'ensemble de questions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/questions/:id/export
 * @desc    Exporter un ensemble de questions au format JSON
 * @access  Admin
 */
router.get('/:id/export', authMiddleware, adminAuth, async (req, res) => {
  try {
    const questionSet = await QuestionSet.findById(req.params.id)
      .lean(); // Pour obtenir un objet JavaScript pur
    
    if (!questionSet) {
      return res.status(404).json({
        success: false,
        message: 'Ensemble de questions introuvable'
      });
    }
    
    // Supprimer les champs MongoDB internes
    delete questionSet.__v;
    delete questionSet._id;
    
    // Nettoyer les sections et questions
    if (questionSet.sections) {
      questionSet.sections = questionSet.sections.map(section => {
        delete section._id;
        
        if (section.questions) {
          section.questions = section.questions.map(question => {
            delete question._id;
            
            if (question.options) {
              question.options = question.options.map(option => {
                delete option._id;
                return option;
              });
            }
            
            return question;
          });
        }
        
        return section;
      });
    }
    
    // Définir les en-têtes pour le téléchargement
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="question-set-${questionSet.targetCertification}-${questionSet.version}.json"`);
    
    // Envoyer le JSON formaté
    res.send(JSON.stringify(questionSet, null, 2));
  } catch (error) {
    console.error('Erreur d\'exportation de l\'ensemble de questions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'exportation de l\'ensemble de questions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/questions/all
 * @desc    Lister tous les questionnaires (admin only)
 * @access  Admin
 */
router.get('/all', authMiddleware, adminAuth, async (req, res) => {
  const operationId = logger.startOperation('list_all_question_sets');
  
  try {
    // Filtres et pagination
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;
    
    // Construire le filtre
    const filter = {};
    
    // Filtre par certification cible
    if (req.query.certification) {
      filter.targetCertification = { $regex: req.query.certification, $options: 'i' };
    }
    
    // Filtre par niveau
    if (req.query.level) {
      filter.certificationLevel = { $regex: req.query.level, $options: 'i' };
    }
    
    // Filtre actif/inactif
    if (req.query.active !== undefined) {
      filter.isActive = req.query.active === 'true';
    }
    
    // Recherche textuelle
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { targetCertification: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Compter le total pour la pagination
    const total = await QuestionSet.countDocuments(filter);
    
    // Récupérer les ensembles de questions
    const questionSets = await QuestionSet.find(filter)
      .select('-sections.questions') // Exclure les questions détaillées pour alléger
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
    
    logger.endOperation(operationId, {
      total,
      page,
      limit,
      filter
    });
    
    res.json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      questionSets: questionSets.map(qs => qs.getSimplified())
    });
  } catch (error) {
    logger.logError('Failed to list question sets', {
      operationId,
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des ensembles de questions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/questions/:id/activate
 * @desc    Activer/désactiver un questionnaire (1 seul actif à la fois)
 * @access  Admin
 */
router.post('/:id/activate', authMiddleware, adminAuth, async (req, res) => {
  const operationId = logger.startOperation('activate_question_set');
  
  try {
    const { id } = req.params;
    const { active } = req.body;
    
    if (typeof active !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Le paramètre "active" doit être un booléen'
      });
    }
    
    // Trouver le questionnaire
    const questionSet = await QuestionSet.findById(id);
    
    if (!questionSet) {
      return res.status(404).json({
        success: false,
        message: 'Questionnaire introuvable'
      });
    }
    
    // Si on veut activer le questionnaire
    if (active) {
      // Vérifier s'il existe déjà un questionnaire actif pour cette certification
      const existingActive = await QuestionSet.findOne({
        _id: { $ne: id },
        targetCertification: questionSet.targetCertification,
        isActive: true
      });
      
      if (existingActive) {
        logger.logError('Active question set already exists', {
          operationId,
          targetCertification: questionSet.targetCertification,
          existingId: existingActive._id
        });
        
        return res.status(400).json({
          success: false,
          message: `Un questionnaire actif existe déjà pour la certification ${questionSet.targetCertification}`,
          existingQuestionSet: existingActive.getSimplified()
        });
      }
    }
    
    // Mettre à jour le statut
    questionSet.isActive = active;
    questionSet.updatedBy = req.user.id;
    
    await questionSet.save();
    
    logger.endOperation(operationId, {
      questionSetId: id,
      active,
      targetCertification: questionSet.targetCertification
    });
    
    res.json({
      success: true,
      message: `Questionnaire ${active ? 'activé' : 'désactivé'} avec succès`,
      questionSet: questionSet.getSimplified()
    });
  } catch (error) {
    logger.logError('Failed to activate question set', {
      operationId,
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'activation/désactivation du questionnaire',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Fonction utilitaire pour valider la structure d'un ensemble de questions
function validateQuestionSet(data) {
  const errors = [];
  
  // Validation des champs obligatoires
  if (!data.title) {
    errors.push('Le titre est obligatoire');
  }
  
  if (!data.targetCertification) {
    errors.push('La certification cible est obligatoire');
  }
  
  if (!Array.isArray(data.sections) || data.sections.length === 0) {
    errors.push('Au moins une section est requise');
  } else {
    // Validation des sections
    data.sections.forEach((section, sectionIndex) => {
      if (!section.title) {
        errors.push(`La section ${sectionIndex + 1} doit avoir un titre`);
      }
      
      if (!Array.isArray(section.questions) || section.questions.length === 0) {
        errors.push(`La section "${section.title}" doit contenir au moins une question`);
      } else {
        // Validation des questions
        section.questions.forEach((question, questionIndex) => {
          if (!question.text) {
            errors.push(`La question ${questionIndex + 1} de la section "${section.title}" doit avoir un texte`);
          }
          
          if (question.type === 'select' || question.type === 'multiselect' || question.type === 'radio' || question.type === 'checkbox') {
            if (!Array.isArray(question.options) || question.options.length === 0) {
              errors.push(`La question "${question.text}" doit avoir des options car elle est de type ${question.type}`);
            } else {
              // Validation des options
              question.options.forEach((option, optionIndex) => {
                if (!option.value || !option.label) {
                  errors.push(`L'option ${optionIndex + 1} de la question "${question.text}" doit avoir une valeur et un libellé`);
                }
              });
            }
          }
        });
      }
    });
  }
  
  return errors;
}

module.exports = router; 