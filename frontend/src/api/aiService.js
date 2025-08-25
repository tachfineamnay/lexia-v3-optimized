/**
 * Service for interacting with the AI API via the backend
 */
const aiService = {
  /**
   * Generate a suggestion for a specific question response
   * @param {Object} params Parameters for suggestion generation
   * @param {String} params.questionId ID of the question
   * @param {String} params.section Section type/name
   * @param {String} params.userInput Current draft response
   * @param {Object} params.userData Additional user context (optional)
   * @returns {Promise<Object>} Generated suggestion
   */
  async generateResponseSuggestion({ questionId, section, userInput, userData = {} }) {
    try {
      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          questionId,
          section,
          userInput,
          userData
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'IA indisponible');
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating suggestion:', error);
      throw error;
    }
  },

  /**
   * Generate a complete VAE section based on user responses
   * @param {Object} params Parameters for section generation
   * @param {String} params.sectionName Name/type of the section
   * @param {Object} params.userResponses User's answers to questions
   * @param {Array} params.documents Relevant user documents
   * @returns {Promise<Object>} Generated section content
   */
  async generateVaeSection({ sectionName, userResponses, documents = [] }) {
    try {
      const response = await fetch('/api/ai/generate-section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sectionName,
          userResponses,
          documents
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'IA indisponible');
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating VAE section:', error);
      throw error;
    }
  },

  /**
   * Generate a complete VAE dossier based on all user responses and documents
   * @param {Object} params Parameters for dossier generation
   * @param {Object} params.userResponses All user's answers to questions
   * @param {Array} params.documents All user documents
   * @param {Object} params.userProfile User profile information
   * @returns {Promise<Object>} Generated dossier content with sections
   */
  async generateCompleteDossier({ userResponses, documents = [], userProfile = {} }) {
    try {
      const response = await fetch('/api/ai/generate-dossier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userResponses,
          documents,
          userProfile
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'IA indisponible');
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating VAE dossier:', error);
      throw error;
    }
  }
};

export default aiService; 