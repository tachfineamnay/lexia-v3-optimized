const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();
const Document = require('../models/document');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const docx = require('docx');
const { PDFDocument } = require('pdf-lib');
const QuestionSet = require('../models/questionSet');
const Dossier = require('../models/dossier');
const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Configuration des clients IA
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// Extract text from file based on file type
async function extractTextFromFile(filePath, fileType) {
  try {
    switch (fileType.toLowerCase()) {
      case 'pdf': 
        // Extract text from PDF
        const pdfBytes = await readFileAsync(filePath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        // Note: This is a simplified version. In a real app, you'd need a more robust PDF text extraction library
        return 'PDF text extraction placeholder'; 
      
      case 'docx':
      case 'doc':
        // Extract text from DOCX
        const content = await readFileAsync(filePath);
        // Note: This is a simplified version. In a real app, you'd need more robust DOCX processing
        return 'DOCX text extraction placeholder';
        
      case 'txt':
        // Read text file directly
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
router.post('/suggest', authMiddleware, async (req, res) => {
  try {
    const { questionId, section, userInput, userData, prompt } = req.body;
    
    // Vérifier si au moins questionId ou prompt est fourni
    if (!questionId && !prompt) {
      return res.status(400).json({ 
        success: false,
        message: 'L\'identifiant de la question ou un prompt est requis' 
      });
    }

    // Initialiser le contenu du prompt
    let promptContent = '';
    
    // Si un prompt spécifique est fourni, l'utiliser directement
    if (prompt) {
      promptContent = prompt;
    } 
    // Sinon, construire le prompt à partir des données de la question
    else {
      // Récupérer la question depuis la base de données
      const questionData = await QuestionSet.findOne(
        { 'sections.questions.questionId': questionId },
        { 'sections.questions.$': 1 }
      );
      
      if (!questionData || !questionData.sections || !questionData.sections[0] || !questionData.sections[0].questions || !questionData.sections[0].questions[0]) {
        return res.status(404).json({ 
          success: false,
          message: 'Question introuvable' 
        });
      }

      const question = questionData.sections[0].questions[0];
      
      // Construire un prompt contextuel pour l'IA
      promptContent = `
En tant qu'assistant IA pour la préparation de dossiers VAE (Validation des Acquis de l'Expérience), aide l'utilisateur à répondre à la question suivante:

Question: ${question.text}
${question.description ? `Description: ${question.description}` : ''}
${section ? `Section: ${section}` : ''}

${userInput ? `L'utilisateur a commencé à rédiger la réponse suivante: 
"${userInput}"` : 'L\'utilisateur n\'a pas encore commencé à rédiger sa réponse.'}

${userData && Object.keys(userData).length > 0 ? `
Informations supplémentaires sur l'utilisateur:
${Object.entries(userData).map(([key, value]) => `- ${key}: ${value}`).join('\n')}
` : ''}

${question.aiPrompt || ''}

Fournis une réponse complète, structurée et détaillée qui correspond parfaitement aux attentes d'un jury VAE. La réponse doit être rédigée à la première personne comme si c'était l'utilisateur qui s'exprime, être spécifique, concrète et illustrée par des exemples.
`;
    }

    // Générer le contenu avec OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: promptContent
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });
    
    const suggestionText = completion.choices[0].message.content;
    
    // Renvoyer la suggestion générée
    res.json({
      success: true,
      suggestion: {
        text: suggestionText,
        questionId,
        timestamp: new Date(),
        metadata: {
          model: 'gpt-4',
          source: 'openai'
        }
      }
    });
  } catch (err) {
    console.error('Erreur de génération de suggestion:', err);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la génération de la suggestion',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * @route   POST /api/ai/generate-section
 * @desc    Générer une section complète du dossier VAE
 * @access  Private
 */
router.post('/generate-section', authMiddleware, async (req, res) => {
  try {
    const { sectionName, userResponses, documents = [] } = req.body;
    
    if (!sectionName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le nom de la section est requis' 
      });
    }
    
    if (!userResponses || Object.keys(userResponses).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Les réponses de l\'utilisateur sont requises' 
      });
    }
    
    // Construire un contexte à partir des documents (si disponibles)
    let documentContext = '';
    if (documents && documents.length > 0) {
      documentContext = `
Voici des documents supplémentaires fournis par l'utilisateur qui peuvent être pertinents:

${documents.map((doc, index) => `Document ${index + 1}: ${doc.title || 'Sans titre'}
${doc.content || 'Contenu non disponible'}
---
`).join('\n')}
`;
    }
    
    // Construire le prompt pour la génération de section
    const promptContent = `
Tu es un expert en rédaction de dossiers VAE (Validation des Acquis de l'Expérience). Ta tâche est de rédiger une section complète et cohérente pour le dossier VAE de l'utilisateur, intitulée "${sectionName}".

Voici les réponses fournies par l'utilisateur aux questions du questionnaire:

${Object.entries(userResponses).map(([questionId, response]) => {
  return `Question: ${questionId}
Réponse: ${response}
---
`;
}).join('\n')}

${documentContext}

En utilisant ces informations, rédige une section complète, cohérente et bien structurée pour le dossier VAE de l'utilisateur. La section doit:
1. Avoir un style professionnel et soigné
2. Être rédigée à la première personne (je/nous)
3. Mettre en valeur les compétences et expériences de l'utilisateur
4. Inclure tous les éléments pertinents mentionnés dans les réponses
5. Être organisée avec des sous-titres, des paragraphes et des listes si nécessaire
6. Avoir une introduction et une conclusion

Le texte doit être directement utilisable dans un dossier VAE officiel.
`;

    // Générer le contenu avec OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: promptContent
        }
      ],
      max_tokens: 3000,
      temperature: 0.7
    });
    
    const generatedContent = completion.choices[0].message.content;
    
    // Renvoyer le contenu généré
    res.json({
      success: true,
      content: generatedContent,
      metadata: {
        section: sectionName,
        timestamp: new Date(),
        model: 'gpt-4',
        source: 'openai'
      }
    });
  } catch (err) {
    console.error('Erreur de génération de section:', err);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la génération de la section',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * @route   POST /api/ai/generate-dossier
 * @desc    Générer un dossier VAE complet
 * @access  Private
 */
router.post('/generate-dossier', authMiddleware, async (req, res) => {
  try {
    const { userResponses, documents = [], userProfile = {} } = req.body;
    
    if (!userResponses || Object.keys(userResponses).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Les réponses de l\'utilisateur sont requises' 
      });
    }
    
    // Construire un contexte à partir des documents (si disponibles)
    let documentContext = '';
    if (documents && documents.length > 0) {
      documentContext = `
Voici des documents supplémentaires fournis par l'utilisateur qui peuvent être pertinents:

${documents.map((doc, index) => `Document ${index + 1}: ${doc.title || 'Sans titre'}
${doc.content || 'Contenu non disponible'}
---
`).join('\n')}
`;
    }
    
    // Construire un contexte à partir du profil utilisateur
    let profileContext = '';
    if (userProfile && Object.keys(userProfile).length > 0) {
      profileContext = `
Informations sur l'utilisateur:
${Object.entries(userProfile).map(([key, value]) => `- ${key}: ${value}`).join('\n')}
`;
    }
    
    // Construire le prompt pour la génération du dossier complet
    const promptContent = `
Tu es un expert en rédaction de dossiers VAE (Validation des Acquis de l'Expérience). Ta tâche est de rédiger un dossier VAE complet pour l'utilisateur.

${profileContext}

Voici les réponses fournies par l'utilisateur aux questions du questionnaire:

${Object.entries(userResponses).map(([questionId, response]) => {
  return `Question: ${questionId}
Réponse: ${response}
---
`;
}).join('\n')}

${documentContext}

En utilisant ces informations, rédige un dossier VAE complet organisé en sections cohérentes. Le dossier doit:
1. Avoir un style professionnel et soigné
2. Être rédigé à la première personne (je/nous)
3. Mettre en valeur les compétences et expériences de l'utilisateur
4. Inclure tous les éléments pertinents mentionnés dans les réponses
5. Être organisé avec des sous-titres, des paragraphes et des listes si nécessaire

Structure recommandée:
- Introduction et présentation personnelle
- Parcours professionnel
- Description détaillée des compétences acquises
- Analyse des expériences professionnelles significatives
- Mise en perspective avec le diplôme visé
- Conclusion

Réponds avec un format JSON contenant les sections générées:
{
  "sections": [
    {
      "title": "Titre de la section 1",
      "content": "Contenu de la section 1"
    },
    {
      "title": "Titre de la section 2",
      "content": "Contenu de la section 2"
    }
  ]
}
`;

    // Générer le contenu avec OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: promptContent
        }
      ],
      max_tokens: 4000,
      temperature: 0.7
    });
    
    let dossierContent;
    
    // Essayer de parser le JSON de la réponse
    try {
      // Extraire JSON de la réponse
      const responseText = completion.choices[0].message.content;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        dossierContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Format JSON non détecté dans la réponse');
      }
    } catch (parseError) {
      console.error('Erreur de parsing JSON:', parseError);
      // Si le parsing échoue, créer une section unique avec tout le contenu
      dossierContent = {
        sections: [
          {
            title: "Dossier VAE complet",
            content: completion.choices[0].message.content
          }
        ]
      };
    }
    
    // Renvoyer le contenu généré
    res.json({
      success: true,
      ...dossierContent,
      metadata: {
        timestamp: new Date(),
        model: 'gpt-4',
        source: 'openai'
      }
    });
  } catch (err) {
    console.error('Erreur de génération de dossier:', err);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la génération du dossier',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Process document with AI
router.post('/process/:documentId', authMiddleware, async (req, res) => {
  try {
    // Find document
    const document = await Document.findOne({
      _id: req.params.documentId,
      user: req.user.userId
    });
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found or not authorized' });
    }
    
    let textContent = '';
    
    // Extract text content from file or use existing content
    if (document.filePath) {
      const fileExt = path.extname(document.fileName).substring(1);
      textContent = await extractTextFromFile(document.filePath, fileExt);
    } else if (document.content) {
      textContent = document.content;
    } else {
      return res.status(400).json({ message: 'No content to process' });
    }
    
    // Process document with AI
    const prompt = `
      Please analyze the following text and provide:
      1. A concise summary (3-5 sentences)
      2. Key entities mentioned (people, organizations, places)
      3. A sentiment score from -1 (negative) to 1 (positive)
      4. Important keywords or phrases (max 10)
      5. Key insights or recommendations based on the content (3-5 points)
      
      Format your response as JSON with the following structure:
      {
        "summary": "your summary here",
        "entities": ["entity1", "entity2", ...],
        "sentimentScore": 0.5,
        "keywords": ["keyword1", "keyword2", ...],
        "recommendations": ["recommendation1", "recommendation2", ...]
      }
      
      TEXT TO ANALYZE:
      ${textContent.substring(0, 10000)}
    `;

    // Generate text with OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.5
    });
    
    // Parse AI response
    let aiAnalysis;
    try {
      // Extract JSON from response
      const responseText = completion.choices[0].message.content;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in AI response');
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return res.status(500).json({ message: 'Failed to parse AI response' });
    }
    
    // Update document with AI analysis
    document.aiAnalysis = aiAnalysis;
    document.isProcessed = true;
    await document.save();
    
    res.json({ message: 'Document processed successfully', analysis: aiAnalysis });
  } catch (err) {
    console.error('AI processing error:', err);
    res.status(500).json({ message: 'AI processing error', error: err.message });
  }
});

// Generate summary for document
router.get('/summary/:documentId', authMiddleware, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.documentId,
      user: req.user.userId
    });
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found or not authorized' });
    }
    
    if (!document.isProcessed) {
      return res.status(400).json({ message: 'Document has not been processed by AI yet' });
    }
    
    res.json({ summary: document.aiAnalysis.summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate document in different format
router.post('/generate/:documentId', authMiddleware, async (req, res) => {
  try {
    const { format } = req.body;
    
    if (!['pdf', 'docx'].includes(format)) {
      return res.status(400).json({ message: 'Unsupported format. Use pdf or docx.' });
    }
    
    const document = await Document.findOne({
      _id: req.params.documentId,
      user: req.user.userId
    });
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found or not authorized' });
    }
    
    // Return success message (actual document generation would be implemented based on format)
    res.json({ 
      message: `Document generation in ${format} format initiated`,
      downloadUrl: `/api/ai/download/${document._id}?format=${format}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/ai/download/:dossierId
 * @desc    Télécharger un dossier au format PDF ou DOCX
 * @access  Private
 */
router.get('/download/:dossierId', authMiddleware, async (req, res) => {
  try {
    const { format = 'pdf' } = req.query;
    const dossierId = req.params.dossierId;
    
    // Vérifier si le format est supporté
    if (!['pdf', 'docx'].includes(format)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Format non supporté. Utilisez pdf ou docx.' 
      });
    }
    
    // Récupérer le dossier
    const dossier = await Dossier.findOne({
      _id: dossierId,
      $or: [
        { user: req.user.id },
        { 'collaborators.user': req.user.id }
      ]
    });
    
    if (!dossier) {
      return res.status(404).json({ 
        success: false, 
        message: 'Dossier introuvable ou accès non autorisé' 
      });
    }
    
    // Préparer le contenu du document
    const fullDocument = dossier.generateFullDocument();
    
    // Logique de génération de fichier (à implémenter selon le format)
    if (format === 'pdf') {
      // Logique de génération de PDF à implémenter
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="dossier-vae-${dossier._id}.pdf"`
      });
      
      // Ici on renverrait le PDF généré
      // Pour l'instant, on renvoie juste un message d'erreur
      return res.status(501).json({ 
        success: false, 
        message: 'Génération de PDF à implémenter' 
      });
    } 
    else if (format === 'docx') {
      // Logique de génération de DOCX à implémenter
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="dossier-vae-${dossier._id}.docx"`
      });
      
      // Ici on renverrait le DOCX généré
      // Pour l'instant, on renvoie juste un message d'erreur
      return res.status(501).json({ 
        success: false, 
        message: 'Génération de DOCX à implémenter' 
      });
    }
  } catch (err) {
    console.error('Erreur de téléchargement de dossier:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors du téléchargement du dossier',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Fonction pour appeler GPT-4
async function callGPT4(message, context) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `Tu es un assistant expert en VAE (Validation des Acquis de l'Expérience). 
                   Tu aides les candidats à structurer leur dossier, rédiger leurs expériences 
                   et comprendre le processus. Contexte: ${context}`
        },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });
    
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Erreur GPT-4:', error);
    throw error;
  }
}

// Fonction pour appeler Claude
async function callClaude(message, context) {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1000,
      temperature: 0.7,
      system: `Tu es un assistant expert en VAE (Validation des Acquis de l'Expérience). 
               Tu aides les candidats à structurer leur dossier, rédiger leurs expériences 
               et comprendre le processus. Contexte: ${context}`,
      messages: [
        { role: "user", content: message }
      ]
    });
    
    return response.content[0].text;
  } catch (error) {
    console.error('Erreur Claude:', error);
    throw error;
  }
}

// Fonction pour appeler Gemini
async function callGemini(message, context) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `En tant qu'assistant expert en VAE (Validation des Acquis de l'Expérience), 
                   aide le candidat avec sa question. Contexte: ${context}
                   
                   Question: ${message}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Erreur Gemini:', error);
    throw error;
  }
}

// Fonction pour combiner les réponses des 3 IA
async function callMultiAI(message, context) {
  try {
    // Appeler les 3 IA en parallèle
    const [gptResponse, claudeResponse, geminiResponse] = await Promise.all([
      callGPT4(message, context).catch(err => ({ error: err.message })),
      callClaude(message, context).catch(err => ({ error: err.message })),
      callGemini(message, context).catch(err => ({ error: err.message }))
    ]);

    // Synthétiser les réponses
    const synthesisPrompt = `
      J'ai reçu 3 réponses d'IA différentes à la question suivante sur la VAE:
      "${message}"
      
      Réponse GPT-4: ${gptResponse.error || gptResponse}
      Réponse Claude: ${claudeResponse.error || claudeResponse}
      Réponse Gemini: ${geminiResponse.error || geminiResponse}
      
      Synthétise ces réponses en une seule réponse cohérente et complète, 
      en gardant les meilleurs éléments de chaque réponse.
    `;

    // Utiliser GPT-4 pour la synthèse finale
    const synthesis = await callGPT4(synthesisPrompt, "synthesis");
    
    return synthesis;
  } catch (error) {
    console.error('Erreur Multi-IA:', error);
    // Fallback sur GPT-4 seul
    return await callGPT4(message, context);
  }
}

// Route principale du chat
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const { message, model = 'multi', context = 'general' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message requis' });
    }

    let response;
    
    switch (model) {
      case 'gpt4':
        response = await callGPT4(message, context);
        break;
      case 'claude':
        response = await callClaude(message, context);
        break;
      case 'gemini':
        response = await callGemini(message, context);
        break;
      case 'multi':
      default:
        response = await callMultiAI(message, context);
        break;
    }

    // Sauvegarder la conversation dans la base de données
    const Conversation = require('../models/Conversation');
    await Conversation.create({
      user: req.user.id,
      messages: [
        { role: 'user', content: message },
        { role: 'assistant', content: response, model }
      ]
    });

    res.json({ response, model });
  } catch (error) {
    console.error('Erreur chat IA:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la génération de la réponse',
      details: error.message 
    });
  }
});

// Route pour obtenir des suggestions contextuelles
router.get('/suggestions', authMiddleware, async (req, res) => {
  try {
    const { context = 'general' } = req.query;
    
    const suggestions = {
      general: [
        "Comment structurer mon dossier VAE ?",
        "Quelles sont les étapes de la VAE ?",
        "Comment décrire mes expériences professionnelles ?",
        "Quels documents dois-je fournir ?"
      ],
      structure: [
        "Quel plan suivre pour mon livret 2 ?",
        "Comment organiser mes activités professionnelles ?",
        "Quelle méthodologie adopter pour la rédaction ?"
      ],
      redaction: [
        "Comment valoriser mes compétences ?",
        "Quels verbes d'action utiliser ?",
        "Comment démontrer mes acquis ?"
      ]
    };

    res.json(suggestions[context] || suggestions.general);
  } catch (error) {
    console.error('Erreur suggestions:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des suggestions' });
  }
});

// Route pour analyser un document VAE
router.post('/analyze-document', authMiddleware, async (req, res) => {
  try {
    const { content, documentType = 'experience' } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Contenu requis' });
    }

    const analysisPrompt = `
      Analyse ce contenu de VAE (type: ${documentType}) et fournis:
      1. Points forts
      2. Points à améliorer
      3. Suggestions concrètes
      4. Score de qualité sur 10
      
      Contenu: ${content}
    `;

    const analysis = await callMultiAI(analysisPrompt, 'document_analysis');
    
    res.json({ analysis });
  } catch (error) {
    console.error('Erreur analyse document:', error);
    res.status(500).json({ error: 'Erreur lors de l\'analyse du document' });
  }
});

module.exports = router; 