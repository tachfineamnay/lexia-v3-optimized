const { VertexAI } = require('@google-cloud/vertexai');
const logger = require('../utils/logger');

/**
 * Service d'interaction avec Vertex AI
 */
class VertexAiService {
  constructor() {
    this.vertexAi = new VertexAI({
      project: process.env.GOOGLE_CLOUD_PROJECT,
      location: process.env.GOOGLE_CLOUD_LOCATION
    });

    this.model = this.vertexAi.preview.getGenerativeModel({
      model: 'gemini-pro',
      generation_config: {
        max_output_tokens: 2048,
        temperature: 0.4,
        top_p: 0.8,
        top_k: 40
      }
    });
  }

  /**
   * Valide la réponse du modèle
   * @param {Object} response - Réponse du modèle
   * @returns {boolean} - True si la réponse est valide
   */
  validateResponse(response) {
    try {
      if (!response || !response.candidates || !response.candidates[0]) {
        logger.error('Réponse invalide du modèle:', response);
        return false;
      }

      const content = response.candidates[0].content;
      if (!content || !content.parts || !content.parts[0]) {
        logger.error('Contenu invalide dans la réponse:', content);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Erreur lors de la validation de la réponse:', error);
      return false;
    }
  }

  /**
   * Génère un dossier à partir des réponses du questionnaire
   * @param {Object} answers - Réponses du questionnaire
   * @returns {Promise<Object>} - Dossier généré
   */
  async generateDossier(answers) {
    try {
      logger.info('Début de la génération du dossier', { userId: answers.userId });

      // Construction du prompt
      const prompt = this.buildPrompt(answers);
      logger.debug('Prompt construit:', { prompt });

      // Appel au modèle
      const response = await this.model.generateContent(prompt);
      
      if (!this.validateResponse(response)) {
        throw new Error('Réponse invalide du modèle');
      }

      // Extraction et validation du contenu
      const content = response.candidates[0].content.parts[0].text;
      const parsedContent = this.parseAndValidateContent(content);

      logger.info('Dossier généré avec succès', { 
        userId: answers.userId,
        contentLength: content.length
      });

      return parsedContent;
    } catch (error) {
      logger.error('Erreur lors de la génération du dossier:', {
        error: error.message,
        userId: answers.userId
      });
      throw new Error('Erreur lors de la génération du dossier: ' + error.message);
    }
  }

  /**
   * Construit le prompt pour le modèle
   * @param {Object} answers - Réponses du questionnaire
   * @returns {string} - Prompt formaté
   */
  buildPrompt(answers) {
    return `En tant qu'expert en analyse de difficultés de lecture, génère un dossier complet basé sur les réponses suivantes au questionnaire.
    Format attendu en JSON:
    {
      "analyse": {
        "difficultes": ["liste des difficultés identifiées"],
        "points_forts": ["liste des points forts"],
        "niveau": "niveau estimé"
      },
      "recommandations": {
        "exercices": ["liste des exercices recommandés"],
        "strategies": ["liste des stratégies d'apprentissage"],
        "ressources": ["liste des ressources utiles"]
      },
      "plan_action": {
        "objectifs": ["liste des objectifs à court terme"],
        "etapes": ["liste des étapes à suivre"],
        "suivi": "recommandations pour le suivi"
      }
    }

    Réponses du questionnaire:
    ${JSON.stringify(answers, null, 2)}

    Important: La réponse doit être un JSON valide et suivre exactement la structure demandée.`;
  }

  /**
   * Parse et valide le contenu généré
   * @param {string} content - Contenu généré par le modèle
   * @returns {Object} - Contenu validé
   */
  parseAndValidateContent(content) {
    try {
      const parsed = JSON.parse(content);
      
      // Validation de la structure
      const requiredSections = ['analyse', 'recommandations', 'plan_action'];
      const missingSections = requiredSections.filter(section => !parsed[section]);
      
      if (missingSections.length > 0) {
        throw new Error(`Sections manquantes dans la réponse: ${missingSections.join(', ')}`);
      }

      // Validation des sous-sections
      const requiredSubsections = {
        analyse: ['difficultes', 'points_forts', 'niveau'],
        recommandations: ['exercices', 'strategies', 'ressources'],
        plan_action: ['objectifs', 'etapes', 'suivi']
      };

      for (const [section, subsections] of Object.entries(requiredSubsections)) {
        const missingSubsections = subsections.filter(sub => !parsed[section][sub]);
        if (missingSubsections.length > 0) {
          throw new Error(`Sous-sections manquantes dans ${section}: ${missingSubsections.join(', ')}`);
        }
      }

      return parsed;
    } catch (error) {
      logger.error('Erreur lors du parsing du contenu:', {
        error: error.message,
        content: content.substring(0, 200) + '...' // Log les 200 premiers caractères
      });
      throw new Error('Format de réponse invalide: ' + error.message);
    }
  }
}

module.exports = new VertexAiService(); 