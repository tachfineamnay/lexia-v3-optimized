const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();
const Dossier = require('../models/dossier');
const User = require('../models/user');
const Document = require('../models/document');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

/**
 * @route   GET /api/dossiers
 * @desc    Récupérer tous les dossiers de l'utilisateur
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, search, limit = 20, page = 1, sort = 'updatedAt', order = 'desc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Construire la requête de base
    let query = {
      $or: [
        { user: req.user.id },
        { 'collaborators.user': req.user.id }
      ]
    };
    
    // Ajouter filtres supplémentaires si fournis
    if (status) {
      query.status = status;
    }
    
    // Ajouter recherche textuelle si fournie
    if (search) {
      query.$text = { $search: search };
    }
    
    // Définir l'ordre de tri
    const sortOption = {};
    sortOption[sort] = order === 'asc' ? 1 : -1;
    
    // Exécuter la requête
    const dossiers = await Dossier.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'firstName lastName email profilePicture')
      .populate('collaborators.user', 'firstName lastName email profilePicture')
      .populate('questionSet', 'title targetCertification');
    
    // Compter le nombre total de dossiers pour la pagination
    const total = await Dossier.countDocuments(query);
    
    res.json({
      success: true,
      data: dossiers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Erreur de récupération des dossiers:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des dossiers',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * @route   POST /api/dossiers
 * @desc    Créer un nouveau dossier
 * @access  Private
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      targetCertification,
      certificationLevel,
      specialityOption,
      questionSetId,
      sections = [],
      isPublic = false
    } = req.body;
    
    // Validation de base
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Le titre du dossier est obligatoire'
      });
    }
    
    // Créer le dossier
    const dossier = new Dossier({
      title,
      description,
      user: req.user.id,
      targetCertification,
      certificationLevel,
      specialityOption,
      questionSet: questionSetId,
      isPublic,
      lastEditedBy: req.user.id
    });
    
    // Ajouter les sections si fournies
    if (sections.length > 0) {
      dossier.sections = sections.map((section, index) => ({
        sectionId: section.sectionId || `section-${Date.now()}-${index}`,
        title: section.title,
        content: section.content || '',
        order: section.order || index
      }));
    }
    
    // Sauvegarder le dossier
    await dossier.save();
    
    // Mettre à jour les statistiques de l'utilisateur
    const user = await User.findById(req.user.id);
    if (user) {
      user.dossiers.push(dossier._id);
      user.usageStats.dossiersCreated += 1;
      user.usageStats.lastActive = new Date();
      await user.save();
    }
    
    res.status(201).json({
      success: true,
      message: 'Dossier créé avec succès',
      data: dossier
    });
  } catch (err) {
    console.error('Erreur de création de dossier:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du dossier',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * @route   GET /api/dossiers/:id
 * @desc    Récupérer un dossier spécifique
 * @access  Private
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const dossier = await Dossier.findOne({
      _id: req.params.id,
      $or: [
        { user: req.user.id },
        { 'collaborators.user': req.user.id },
        { isPublic: true }
      ]
    })
    .populate('user', 'firstName lastName email profilePicture')
    .populate('collaborators.user', 'firstName lastName email profilePicture')
    .populate('questionSet')
    .populate('documents');
    
    if (!dossier) {
      return res.status(404).json({
        success: false,
        message: 'Dossier introuvable ou accès non autorisé'
      });
    }
    
    res.json({
      success: true,
      data: dossier
    });
  } catch (err) {
    console.error('Erreur de récupération du dossier:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du dossier',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * @route   PUT /api/dossiers/:id
 * @desc    Mettre à jour un dossier
 * @access  Private
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      targetCertification,
      certificationLevel,
      specialityOption,
      status,
      isPublic,
      tags
    } = req.body;
    
    // Vérifier si l'utilisateur a accès au dossier
    let dossier = await Dossier.findOne({
      _id: req.params.id,
      $or: [
        { user: req.user.id },
        { 'collaborators.user': req.user.id, 'collaborators.role': { $in: ['editor', 'admin'] } }
      ]
    });
    
    if (!dossier) {
      return res.status(404).json({
        success: false,
        message: 'Dossier introuvable ou accès non autorisé'
      });
    }
    
    // Mettre à jour les champs
    if (title !== undefined) dossier.title = title;
    if (description !== undefined) dossier.description = description;
    if (targetCertification !== undefined) dossier.targetCertification = targetCertification;
    if (certificationLevel !== undefined) dossier.certificationLevel = certificationLevel;
    if (specialityOption !== undefined) dossier.specialityOption = specialityOption;
    if (status !== undefined) dossier.status = status;
    if (isPublic !== undefined) dossier.isPublic = isPublic;
    if (tags !== undefined) dossier.tags = tags;
    
    dossier.lastEditedBy = req.user.id;
    
    // Sauvegarder les modifications
    await dossier.save();
    
    res.json({
      success: true,
      message: 'Dossier mis à jour avec succès',
      data: dossier
    });
  } catch (err) {
    console.error('Erreur de mise à jour du dossier:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du dossier',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * @route   DELETE /api/dossiers/:id
 * @desc    Supprimer un dossier
 * @access  Private
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est propriétaire du dossier
    const dossier = await Dossier.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!dossier) {
      return res.status(404).json({
        success: false,
        message: 'Dossier introuvable ou accès non autorisé'
      });
    }
    
    // Supprimer le dossier
    await dossier.remove();
    
    // Mettre à jour la liste des dossiers de l'utilisateur
    const user = await User.findById(req.user.id);
    if (user) {
      user.dossiers = user.dossiers.filter(id => id.toString() !== req.params.id);
      await user.save();
    }
    
    res.json({
      success: true,
      message: 'Dossier supprimé avec succès'
    });
  } catch (err) {
    console.error('Erreur de suppression du dossier:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du dossier',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * @route   PUT /api/dossiers/:id/section/:sectionId
 * @desc    Mettre à jour une section spécifique d'un dossier
 * @access  Private
 */
router.put('/:id/section/:sectionId', authMiddleware, async (req, res) => {
  try {
    const { content, title, order } = req.body;
    
    // Vérifier si l'utilisateur a accès au dossier
    const dossier = await Dossier.findOne({
      _id: req.params.id,
      $or: [
        { user: req.user.id },
        { 'collaborators.user': req.user.id, 'collaborators.role': { $in: ['editor', 'admin'] } }
      ]
    });
    
    if (!dossier) {
      return res.status(404).json({
        success: false,
        message: 'Dossier introuvable ou accès non autorisé'
      });
    }
    
    // Trouver la section à mettre à jour
    const sectionIndex = dossier.sections.findIndex(
      section => section.sectionId === req.params.sectionId
    );
    
    if (sectionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Section introuvable dans ce dossier'
      });
    }
    
    // Mettre à jour les champs de la section
    if (content !== undefined) dossier.sections[sectionIndex].content = content;
    if (title !== undefined) dossier.sections[sectionIndex].title = title;
    if (order !== undefined) dossier.sections[sectionIndex].order = order;
    
    // Mettre à jour les informations d'édition
    dossier.sections[sectionIndex].lastEditedBy = 'user';
    dossier.sections[sectionIndex].lastEditedAt = new Date();
    dossier.lastEditedBy = req.user.id;
    
    // Sauvegarder les modifications
    await dossier.save();
    
    res.json({
      success: true,
      message: 'Section mise à jour avec succès',
      data: dossier.sections[sectionIndex]
    });
  } catch (err) {
    console.error('Erreur de mise à jour de section:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la section',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * @route   POST /api/dossiers/:id/section
 * @desc    Ajouter une nouvelle section à un dossier
 * @access  Private
 */
router.post('/:id/section', authMiddleware, async (req, res) => {
  try {
    const { title, content, order } = req.body;
    
    // Validation de base
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Le titre de la section est obligatoire'
      });
    }
    
    // Vérifier si l'utilisateur a accès au dossier
    const dossier = await Dossier.findOne({
      _id: req.params.id,
      $or: [
        { user: req.user.id },
        { 'collaborators.user': req.user.id, 'collaborators.role': { $in: ['editor', 'admin'] } }
      ]
    });
    
    if (!dossier) {
      return res.status(404).json({
        success: false,
        message: 'Dossier introuvable ou accès non autorisé'
      });
    }
    
    // Créer une nouvelle section
    const newSection = {
      sectionId: `section-${Date.now()}`,
      title,
      content: content || '',
      order: order !== undefined ? order : dossier.sections.length,
      lastEditedBy: 'user',
      lastEditedAt: new Date()
    };
    
    // Ajouter la section au dossier
    dossier.sections.push(newSection);
    dossier.lastEditedBy = req.user.id;
    
    // Sauvegarder les modifications
    await dossier.save();
    
    res.status(201).json({
      success: true,
      message: 'Section ajoutée avec succès',
      data: newSection
    });
  } catch (err) {
    console.error('Erreur d\'ajout de section:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout de la section',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * @route   DELETE /api/dossiers/:id/section/:sectionId
 * @desc    Supprimer une section d'un dossier
 * @access  Private
 */
router.delete('/:id/section/:sectionId', authMiddleware, async (req, res) => {
  try {
    // Vérifier si l'utilisateur a accès au dossier
    const dossier = await Dossier.findOne({
      _id: req.params.id,
      $or: [
        { user: req.user.id },
        { 'collaborators.user': req.user.id, 'collaborators.role': { $in: ['editor', 'admin'] } }
      ]
    });
    
    if (!dossier) {
      return res.status(404).json({
        success: false,
        message: 'Dossier introuvable ou accès non autorisé'
      });
    }
    
    // Trouver l'index de la section à supprimer
    const sectionIndex = dossier.sections.findIndex(
      section => section.sectionId === req.params.sectionId
    );
    
    if (sectionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Section introuvable dans ce dossier'
      });
    }
    
    // Supprimer la section
    dossier.sections.splice(sectionIndex, 1);
    dossier.lastEditedBy = req.user.id;
    
    // Sauvegarder les modifications
    await dossier.save();
    
    res.json({
      success: true,
      message: 'Section supprimée avec succès'
    });
  } catch (err) {
    console.error('Erreur de suppression de section:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la section',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * @route   POST /api/dossiers/:id/responses
 * @desc    Sauvegarder les réponses du questionnaire
 * @access  Private
 */
router.post('/:id/responses', authMiddleware, async (req, res) => {
  try {
    const { responses } = req.body;
    
    // Validation de base
    if (!responses || Object.keys(responses).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Les réponses sont requises'
      });
    }
    
    // Vérifier si l'utilisateur a accès au dossier
    const dossier = await Dossier.findOne({
      _id: req.params.id,
      $or: [
        { user: req.user.id },
        { 'collaborators.user': req.user.id, 'collaborators.role': { $in: ['editor', 'admin'] } }
      ]
    });
    
    if (!dossier) {
      return res.status(404).json({
        success: false,
        message: 'Dossier introuvable ou accès non autorisé'
      });
    }
    
    // Sauvegarder chaque réponse
    Object.entries(responses).forEach(([questionId, response]) => {
      dossier.saveResponse(questionId, response);
    });
    
    dossier.lastEditedBy = req.user.id;
    
    // Sauvegarder les modifications
    await dossier.save();
    
    res.json({
      success: true,
      message: 'Réponses sauvegardées avec succès',
      data: dossier.getAllResponses()
    });
  } catch (err) {
    console.error('Erreur de sauvegarde des réponses:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la sauvegarde des réponses',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * @route   GET /api/dossiers/:id/export
 * @desc    Exporter un dossier en PDF ou DOCX
 * @access  Private
 */
router.get('/:id/export', authMiddleware, async (req, res) => {
  try {
    const { format = 'pdf' } = req.query;
    
    // Vérifier si le format est supporté
    if (!['pdf', 'docx', 'txt'].includes(format)) {
      return res.status(400).json({
        success: false,
        message: 'Format non supporté. Utilisez pdf, docx ou txt.'
      });
    }
    
    // Vérifier si l'utilisateur a accès au dossier
    const dossier = await Dossier.findOne({
      _id: req.params.id,
      $or: [
        { user: req.user.id },
        { 'collaborators.user': req.user.id }
      ]
    }).populate('user', 'firstName lastName');
    
    if (!dossier) {
      return res.status(404).json({
        success: false,
        message: 'Dossier introuvable ou accès non autorisé'
      });
    }
    
    // Générer le contenu complet du dossier
    const fullDocument = dossier.generateFullDocument();
    
    // Créer le répertoire d'exports s'il n'existe pas
    const exportsDir = path.join(__dirname, '../exports');
    if (!fs.existsSync(exportsDir)) {
      await mkdirAsync(exportsDir, { recursive: true });
    }
    
    // Nom du fichier d'export
    const fileName = `dossier-${dossier._id}-${Date.now()}.${format}`;
    const filePath = path.join(exportsDir, fileName);
    
    // Logique d'export selon le format
    if (format === 'pdf') {
      // Logique d'export PDF (simplifiée)
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // Ajouter le titre
      page.drawText(fullDocument.title, {
        x: 50,
        y: page.getHeight() - 50,
        size: 20,
        font: boldFont
      });
      
      // Ajouter le contenu (simplifié)
      page.drawText('Contenu du dossier VAE', {
        x: 50,
        y: page.getHeight() - 100,
        size: 12,
        font: font
      });
      
      // Sauvegarder le PDF
      const pdfBytes = await pdfDoc.save();
      await writeFileAsync(filePath, pdfBytes);
    }
    else if (format === 'docx') {
      // Logique d'export DOCX à implémenter
      // Pour l'exemple, on crée un fichier texte simple
      await writeFileAsync(filePath, fullDocument.content);
    }
    else if (format === 'txt') {
      // Export en texte brut
      await writeFileAsync(filePath, fullDocument.content);
    }
    
    // Enregistrer l'historique d'export
    dossier.exportHistory.push({
      format,
      createdBy: req.user.id,
      versionNumber: dossier.currentVersion,
      downloadUrl: `/api/dossiers/download/${fileName}`
    });
    
    await dossier.save();
    
    // Renvoyer le lien de téléchargement
    res.json({
      success: true,
      message: `Dossier exporté en ${format} avec succès`,
      downloadUrl: `/api/dossiers/download/${fileName}`
    });
  } catch (err) {
    console.error('Erreur d\'export du dossier:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'export du dossier',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * @route   GET /api/dossiers/download/:fileName
 * @desc    Télécharger un fichier exporté
 * @access  Private
 */
router.get('/download/:fileName', authMiddleware, (req, res) => {
  try {
    const filePath = path.join(__dirname, '../exports', req.params.fileName);
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Fichier introuvable'
      });
    }
    
    // Déterminer le type MIME
    let contentType = 'application/octet-stream';
    if (req.params.fileName.endsWith('.pdf')) {
      contentType = 'application/pdf';
    } else if (req.params.fileName.endsWith('.docx')) {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (req.params.fileName.endsWith('.txt')) {
      contentType = 'text/plain';
    }
    
    // Configurer les en-têtes de réponse
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename=${req.params.fileName}`);
    
    // Envoyer le fichier
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (err) {
    console.error('Erreur de téléchargement du fichier:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du téléchargement du fichier',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * @route   POST /api/dossiers/:id/collaborate
 * @desc    Ajouter un collaborateur au dossier
 * @access  Private
 */
router.post('/:id/collaborate', authMiddleware, async (req, res) => {
  try {
    const { email, role = 'viewer' } = req.body;
    
    // Validation de base
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'L\'email du collaborateur est requis'
      });
    }
    
    // Vérifier les rôles autorisés
    if (!['viewer', 'editor', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rôle invalide. Utilisez viewer, editor ou admin.'
      });
    }
    
    // Vérifier si l'utilisateur est propriétaire du dossier
    const dossier = await Dossier.findOne({
      _id: req.params.id,
      $or: [
        { user: req.user.id },
        { 'collaborators.user': req.user.id, 'collaborators.role': 'admin' }
      ]
    });
    
    if (!dossier) {
      return res.status(404).json({
        success: false,
        message: 'Dossier introuvable ou accès non autorisé'
      });
    }
    
    // Rechercher l'utilisateur à ajouter comme collaborateur
    const collaborator = await User.findOne({ email: email.toLowerCase() });
    if (!collaborator) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable'
      });
    }
    
    // Vérifier si l'utilisateur est déjà collaborateur
    const existingCollaborator = dossier.collaborators.find(
      collab => collab.user.toString() === collaborator._id.toString()
    );
    
    if (existingCollaborator) {
      // Mettre à jour le rôle si l'utilisateur est déjà collaborateur
      existingCollaborator.role = role;
    } else {
      // Ajouter le nouveau collaborateur
      dossier.collaborators.push({
        user: collaborator._id,
        role,
        addedAt: new Date()
      });
    }
    
    // Sauvegarder les modifications
    await dossier.save();
    
    // Mettre à jour les collaborations de l'utilisateur ajouté
    if (!existingCollaborator) {
      collaborator.collaborations.push({
        dossier: dossier._id,
        role
      });
      await collaborator.save();
    }
    
    res.json({
      success: true,
      message: 'Collaborateur ajouté avec succès',
      data: dossier.collaborators
    });
  } catch (err) {
    console.error('Erreur d\'ajout de collaborateur:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout du collaborateur',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * @route   DELETE /api/dossiers/:id/collaborate/:userId
 * @desc    Supprimer un collaborateur du dossier
 * @access  Private
 */
router.delete('/:id/collaborate/:userId', authMiddleware, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est propriétaire du dossier
    const dossier = await Dossier.findOne({
      _id: req.params.id,
      $or: [
        { user: req.user.id },
        { 'collaborators.user': req.user.id, 'collaborators.role': 'admin' }
      ]
    });
    
    if (!dossier) {
      return res.status(404).json({
        success: false,
        message: 'Dossier introuvable ou accès non autorisé'
      });
    }
    
    // Trouver l'index du collaborateur à supprimer
    const collaboratorIndex = dossier.collaborators.findIndex(
      collab => collab.user.toString() === req.params.userId
    );
    
    if (collaboratorIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Collaborateur introuvable dans ce dossier'
      });
    }
    
    // Supprimer le collaborateur
    dossier.collaborators.splice(collaboratorIndex, 1);
    
    // Sauvegarder les modifications
    await dossier.save();
    
    // Mettre à jour les collaborations de l'utilisateur supprimé
    const collaborator = await User.findById(req.params.userId);
    if (collaborator) {
      collaborator.collaborations = collaborator.collaborations.filter(
        collab => collab.dossier.toString() !== req.params.id
      );
      await collaborator.save();
    }
    
    res.json({
      success: true,
      message: 'Collaborateur supprimé avec succès'
    });
  } catch (err) {
    console.error('Erreur de suppression de collaborateur:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du collaborateur',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router; 