import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import aiService from '../api/aiService';
import { useToast } from '../hooks/useToast';

function PopupQuestion({ 
  isOpen, 
  onClose, 
  question, 
  initialAnswer = '', 
  onSave, 
  advice = null,
  section = null,
  userData = null
}) {
  const [answer, setAnswer] = useState(initialAnswer);
  const [isVisible, setIsVisible] = useState(false);
  const [isShowingAdvice, setIsShowingAdvice] = useState(false);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      // Small delay for animation
      setTimeout(() => {
        setIsVisible(true);
      }, 50);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setAnswer(initialAnswer);
  }, [initialAnswer]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Match the animation duration
  };

  const handleSave = async () => {
    // Clear any previous error and suggestion
    setAiError(null);
    setAiSuggestion(null);
    
    // Save the answer first
    onSave(answer);
    
    // If AI generation is enabled for this question and we have a section
    if (question.aiAssist && section) {
      setIsGeneratingResponse(true);
      
      try {
        // Call the AI service to generate a response suggestion
        const result = await aiService.generateResponseSuggestion({
          questionId: question.questionId,
          section,
          userInput: answer,
          userData
        });
        
        // If successful, show the suggestion
        if (result && result.suggestion) {
          setAiSuggestion(result.suggestion.text);
          showToast('Suggestion IA disponible', 'info');
        }
      } catch (error) {
        console.error('Error generating response:', error);
        setAiError(error.message || 'IA indisponible');
        showToast('Erreur lors de la génération de la suggestion', 'error');
      } finally {
        setIsGeneratingResponse(false);
      }
    }
  };

  const handleUseSuggestion = () => {
    if (aiSuggestion) {
      setAnswer(aiSuggestion);
      setAiSuggestion(null);
      showToast('Suggestion appliquée', 'success');
    }
  };

  const handleIgnoreSuggestion = () => {
    setAiSuggestion(null);
    showToast('Suggestion ignorée', 'info');
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleOverlayClick}
    >
      <div 
        className={`bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden transition-transform duration-300 ${
          isVisible ? 'scale-100' : 'scale-95'
        }`}
      >
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Question</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto" style={{maxHeight: 'calc(90vh - 130px)'}}>
          <div className="mb-6">
            <h4 className="text-base font-semibold text-gray-800 mb-2">{question.text}</h4>
            {question.description && (
              <p className="text-sm text-gray-600 mb-4">{question.description}</p>
            )}
            
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Votre réponse..."
            />
            
            {aiError && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center text-red-700">
                  <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Erreur IA:</span> {aiError}
                </div>
              </div>
            )}

            {aiSuggestion && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h5 className="text-sm font-medium text-blue-800 mb-2">Suggestion IA</h5>
                    <p className="text-sm text-blue-700 whitespace-pre-wrap">{aiSuggestion}</p>
                    <div className="mt-3 flex space-x-3">
                      <button
                        onClick={handleUseSuggestion}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Utiliser la suggestion
                      </button>
                      <button
                        onClick={handleIgnoreSuggestion}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Ignorer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {question.aiAssist && !aiSuggestion && !aiError && (
              <div className="mt-2 text-xs text-gray-500 flex items-center">
                <svg className="mr-1 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
                Cette réponse sera améliorée par l'IA après enregistrement
              </div>
            )}
          </div>
          
          {advice && (
            <div className="mt-4">
              <button
                onClick={() => setIsShowingAdvice(!isShowingAdvice)}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 mb-2"
              >
                <svg className={`mr-1 h-4 w-4 transition-transform ${isShowingAdvice ? 'rotate-90' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                {isShowingAdvice ? "Masquer les conseils" : "Voir les conseils"}
              </button>
              
              {isShowingAdvice && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-gray-700">
                  {advice}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={isGeneratingResponse}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {isGeneratingResponse ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Génération en cours...
              </>
            ) : (
              "Enregistrer"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

PopupQuestion.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  question: PropTypes.shape({
    questionId: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    description: PropTypes.string,
    aiAssist: PropTypes.bool
  }).isRequired,
  initialAnswer: PropTypes.string,
  onSave: PropTypes.func.isRequired,
  advice: PropTypes.string,
  section: PropTypes.string,
  userData: PropTypes.object
};

export default PopupQuestion; 