const express = require('express');
const { authMiddleware, requirePayment } = require('../middleware/auth');
const router = express.Router();
const Document = require('../models/document');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const { PDFDocument } = require('pdf-lib');
const QuestionSet = require('../models/questionSet');
const Dossier = require('../models/dossier');
const aiService = require('../services/aiService');

// Extract text from file based on file type
async function extractTextFromFile(filePath, fileType) {
  try {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        const pdfBytes = await readFileAsync(filePath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        // Placeholder for PDF text extraction
        return 'PDF text extraction placeholder';

      case 'docx':
      case 'doc':
        // Placeholder for DOCX text extraction
        return 'DOCX text extraction placeholder';

      case 'txt':
        const textContent = await readFileAsync(filePath, 'utf8');
        return textContent;

      default:
        throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Error extracting text:', error);
    throw error;
  }
}

/**
 * @route   POST /api/ai/suggest
 * @desc    Générer une suggestion pour une réponse à une question
 * @access  Private
 */
router.post('/suggest', authMiddleware, requirePayment, async (req, res) => {
  try {
    const { questionId, section, userInput, userData, prompt } = req.body;

    const contextPrompt = `
      Contexte: ${section || 'Général'}
      Question: ${prompt || 'Non spécifiée'}
      Réponse actuelle utilisateur: ${userInput || "(vide)"}
      Profil: ${JSON.stringify(userData || {})}
      
      Tâche: Suggérer une amélioration ou une rédaction pour cette réponse.
    `;

    const suggestion = await aiService.generateContent(contextPrompt, 'gpt-4-turbo-preview');

    res.json({
      success: true,
      suggestion: suggestion.texte_corrige || suggestion.suggestion || suggestion
    });
  } catch (error) {
    console.error('Erreur suggestion IA:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération de la suggestion',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/ai/generate-section
 * @desc    Générer une section complète du dossier VAE
 * @access  Private
 */
router.post('/generate-section', authMiddleware, requirePayment, async (req, res) => {
  try {
    const { sectionName, userResponses, documents = [] } = req.body;

    const content = await aiService.generateLivret2(sectionName, userResponses, documents);

    res.json({
      success: true,
      content: content.texte_redige || content,
      metadata: {
        section: sectionName,
        timestamp: new Date(),
        source: 'ai-service'
      }
    });
  } catch (error) {
    console.error('Erreur génération section:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération de la section',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/ai/generate-dossier
 * @desc    Générer un dossier VAE complet
 * @access  Private
 */
router.post('/generate-dossier', authMiddleware, requirePayment, async (req, res) => {
  try {
    const { userResponses, documents = [], userProfile = {} } = req.body;

    const dossierContent = await aiService.generateLivret1(userProfile, documents);

    res.json({
      success: true,
      ...dossierContent,
      metadata: {
        timestamp: new Date(),
        source: 'ai-service'
      }
    });
  } catch (error) {
    console.error('Erreur génération dossier:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du dossier',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/ai/process/:documentId
 * @desc    Analyser un document
 * @access  Private
 */
router.post('/process/:documentId', authMiddleware, requirePayment, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.documentId,
      user: req.user.userId
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found or not authorized' });
    }

    let textContent = '';
    if (document.filePath) {
      const fileExt = path.extname(document.fileName).substring(1);
      textContent = await extractTextFromFile(document.filePath, fileExt);
    } else if (document.content) {
      textContent = document.content;
    } else {
      return res.status(400).json({ message: 'No content to process' });
    }

    const analysis = await aiService.correctDossier(textContent.substring(0, 5000));

    document.aiAnalysis = analysis;
    document.isProcessed = true;
    await document.save();

    res.json({ message: 'Document processed successfully', analysis });
  } catch (error) {
    console.error('AI processing error:', error);
    res.status(500).json({ message: 'AI processing error', error: error.message });
  }
});

/**
 * @route   POST /api/ai/chat
 * @desc    Chat avec l'IA
 * @access  Private
 */
router.post('/chat', authMiddleware, requirePayment, async (req, res) => {
  try {
    const { message, context = 'general' } = req.body;

    const prompt = `
      Contexte: ${context}
      Message utilisateur: ${message}
      
      Réponds en tant qu'expert VAE.
    `;

    const response = await aiService.generateContent(prompt, 'gpt-4-turbo-preview');

    res.json({
      response: response.reponse || response,
      model: 'gpt-4-turbo-preview'
    });
  } catch (error) {
    console.error('Erreur chat IA:', error);
    res.status(500).json({
      error: 'Erreur lors de la génération de la réponse',
      details: error.message
    });
  }
});

module.exports = router;