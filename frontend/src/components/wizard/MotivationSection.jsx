import { useState } from 'react';
import PropTypes from 'prop-types';
import '../../styles/lexia-design-system.css';
import { LightBulbIcon, SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline'; // Import new icons
import { useToast } from '../hooks/useToast'; // Import useToast
import { API_ENDPOINTS, getAuthHeaders } from '../../config/api'; // Import API_ENDPOINTS and getAuthHeaders
import LoadingSpinner from '../LoadingSpinner'; // Import LoadingSpinner

const MOTIVATION_QUESTIONS = [
  {
    id: 1,
    text: "Qu'est-ce qui vous motive à entamer une démarche de VAE pour le DEES ?",
    tooltip: "Mettez en avant vos motivations personnelles et professionnelles de manière sincère et précise.",
    placeholder: "Décrivez vos motivations principales...",
    minLength: 100,
    helperText: "Concentrez-vous sur vos aspirations profondes et les bénéfices concrets de l'obtention du diplôme."
  },
  {
    id: 2,
    text: "Pourquoi avoir choisi spécifiquement le diplôme d'État d'Éducateur Spécialisé ?",
    tooltip: "Expliquez en quoi le diplôme d'éducateur spécialisé correspond à votre profil ou à vos aspirations.",
    placeholder: "Ce diplôme représente pour moi...",
    minLength: 100,
    helperText: "Mettez en avant la cohérence entre le DEES et votre parcours ou projet professionnel."
  },
  {
    id: 3,
    text: "Comment l'obtention de ce diplôme s'inscrit-elle dans votre projet professionnel et personnel ?",
    tooltip: "Montrez le lien entre cette démarche et votre projet de carrière ou de vie.",
    placeholder: "Dans mon projet professionnel...",
    minLength: 100,
    helperText: "Décrivez les évolutions concrètes attendues dans votre carrière et votre développement personnel."
  },
  {
    id: 4,
    text: "Quels objectifs professionnels visez-vous après l'obtention du DEES ?",
    tooltip: "Évoquez ce que l'obtention du DEES vous permettra de réaliser.",
    placeholder: "Après l'obtention du diplôme, je souhaite...",
    minLength: 100,
    helperText: "Soyez spécifique sur les postes, responsabilités ou domaines d'intervention envisagés."
  }
];

// Internal SectionHeader Component
function SectionHeader({ section, currentQuestion, totalQuestionsInSection, answeredQuestionsInSection, onClose }) {
  const progress = (answeredQuestionsInSection / totalQuestionsInSection) * 100; // Correctly calculate based on answered questions
  const Icon = section.icon; // Get the Heroicon component or emoji

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl text-lexia-blue">
            {typeof Icon === 'string' ? Icon : <Icon className="h-10 w-10" />}
          </div>
          <div>
            <h2 id="modal-title" className="lexia-heading-2 text-lexia-text-primary">{section.title}</h2>
            <p className="lexia-caption text-lexia-text-secondary">{section.subtitle}</p>
          </div>
        </div>
        <button 
          onClick={() => onClose()} 
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-lexia-focus rounded-full p-1"
          aria-label="Fermer la section"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
      
      {/* Barre de progression de la section */}
      <div className="lexia-progress-bar">
        <div 
          className="lexia-progress-fill"
          style={{ width: `${progress}%`, backgroundColor: section.color }}
        />
      </div>
      <p className="lexia-caption mt-2 text-lexia-text-tertiary">
        Progression de la section : {Math.round(progress)}% ({answeredQuestionsInSection} / {totalQuestionsInSection} questions)
      </p>
      <p className="lexia-caption mt-1 text-lexia-text-secondary">
        Question {currentQuestion + 1} sur {MOTIVATION_QUESTIONS.length}
      </p>
    </div>
  );
}

SectionHeader.propTypes = {
  section: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
    icon: PropTypes.oneOfType([PropTypes.string, PropTypes.elementType]).isRequired,
    color: PropTypes.string.isRequired
  }).isRequired,
  currentQuestion: PropTypes.number.isRequired,
  totalQuestionsInSection: PropTypes.number.isRequired,
  answeredQuestionsInSection: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
};

function MotivationSection({ section, responses, onComplete, onBack, onClose, totalQuestionsInSection, answeredQuestionsInSection }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [localResponses, setLocalResponses] = useState(() => {
    // Initialiser avec les réponses existantes
    const initial = {};
    MOTIVATION_QUESTIONS.forEach(q => {
      initial[q.id] = responses[q.id] || '';
    });
    return initial;
  });
  const [errors, setErrors] = useState({});
  const [isGeneratingAiDraft, setIsGeneratingAiDraft] = useState(false);
  const toast = useToast();

  const question = MOTIVATION_QUESTIONS[currentQuestion];

  // Validation de la réponse
  const validateResponse = (value) => {
    if (!value.trim()) {
      return "Cette question est obligatoire";
    }
    if (value.length < question.minLength) {
      return `Votre réponse doit contenir au moins ${question.minLength} caractères (actuellement: ${value.length})`;
    }
    return null;
  };

  // Gestion du changement de texte
  const handleTextChange = (value) => {
    setLocalResponses(prev => ({
      ...prev,
      [question.id]: value
    }));
    
    // Effacer l'erreur quand l'utilisateur tape
    if (errors[question.id]) {
      setErrors(prev => ({
        ...prev,
        [question.id]: null
      }));
    }
  };

  // Passer à la question suivante
  const handleNext = () => {
    const error = validateResponse(localResponses[question.id]);
    if (error) {
      setErrors({ [question.id]: error });
      // Ensure focus for accessibility
      document.getElementById(`question-${question.id}`).focus();
      return;
    }

    if (currentQuestion < MOTIVATION_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Terminer la section
      onComplete(localResponses);
    }
  };

  // Revenir à la question précédente
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    } else if (onBack) {
      onBack();
    }
  };

  // Generate AI Draft
  const handleGenerateAiDraft = async () => {
    setIsGeneratingAiDraft(true);
    try {
      const response = await fetch(API_ENDPOINTS.AI_GENERATE_VAE_SECTION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          sectionId: section.id,
          questionId: question.id,
          currentResponses: localResponses,
          context: responses // Full VAE responses as context
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la génération du brouillon IA');
      }

      const data = await response.json();
      setLocalResponses(prev => ({ ...prev, [question.id]: data.aiDraft }));
      toast.success('Brouillon IA généré avec succès !');
    } catch (error) {
      toast.error(error.message || 'Échec de la génération du brouillon IA.');
      console.error('AI Draft generation error:', error);
    } finally {
      setIsGeneratingAiDraft(false);
    }
  };

  // Calculer le nombre de caractères
  const charCount = localResponses[question.id]?.length || 0;
  const charPercentage = Math.min((charCount / question.minLength) * 100, 100);
  const isCharCountMet = charCount >= question.minLength;

  // Unique ID for aria-describedby
  const helperTextId = `helper-${question.id}`;
  const errorTextId = `error-${question.id}`;

  return (
    <div className="motivation-section slide-up">
      <SectionHeader 
        section={section} 
        currentQuestion={currentQuestion} 
        totalQuestionsInSection={totalQuestionsInSection}
        answeredQuestionsInSection={answeredQuestionsInSection}
        onClose={onClose}
      />

      {/* Question actuelle */}
      <div className="mb-6">
        <div className="flex items-start gap-2 mb-4">
          <h3 className="lexia-body font-semibold flex-1 text-lexia-text-primary">
            {question.text}
          </h3>
          
          {/* Tooltip */}
          <div className="lexia-tooltip">
            <LightBulbIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" aria-label="Conseil" />
            <div className="lexia-tooltip-content" role="tooltip" id={`tooltip-${question.id}`}>
              {question.tooltip}
            </div>
          </div>
        </div>

        {/* Zone de texte */}
        <div className="lexia-form-group">
          <textarea
            id={`question-${question.id}`}
            className={`lexia-textarea ${errors[question.id] ? 'lexia-input-error' : ''} lexia-focus-ring`}
            value={localResponses[question.id]}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={question.placeholder}
            rows={8}
            aria-describedby={`${helperTextId} ${errors[question.id] ? errorTextId : ''}`}
            aria-invalid={!!errors[question.id]}
          />
          
          {/* Compteur de caractères et helper text */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 gap-2">
            <p id={helperTextId} className="lexia-caption text-lexia-text-secondary">
              {question.helperText}
            </p>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${charPercentage}%`,
                    backgroundColor: isCharCountMet ? 'var(--lexia-success)' : 'var(--lexia-orange)'
                  }}
                />
              </div>
              <span className={`lexia-caption ${isCharCountMet ? 'text-green-600' : 'text-lexia-orange'}`}>
                {charCount} / {question.minLength} caractères
              </span>
            </div>
          </div>
          
          {/* Message d'erreur */}
          {errors[question.id] && (
            <p id={errorTextId} className="lexia-helper-text lexia-helper-error mt-2">
              {errors[question.id]}
            </p>
          )}
        </div>

        {/* Brouillon IA */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleGenerateAiDraft}
            disabled={isGeneratingAiDraft}
            className="lexia-btn lexia-btn-secondary lexia-btn-sm flex items-center gap-2"
            aria-label="Générer un brouillon avec l'IA"
          >
            {isGeneratingAiDraft ? (
              <LoadingSpinner size="sm" color="current" />
            ) : (
              <SparklesIcon className="h-5 w-5" />
            )}
            Brouillon IA
          </button>
        </div>

      </div>

      {/* Boutons de navigation */}
      <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handlePrevious}
          className="lexia-btn lexia-btn-secondary lexia-focus-ring"
          aria-label="Question précédente"
        >
          ← Précédent
        </button>

        <button
          onClick={handleNext}
          className="lexia-btn lexia-btn-primary lexia-focus-ring"
          aria-label={currentQuestion < MOTIVATION_QUESTIONS.length - 1 ? 'Question suivante' : 'Terminer cette section'}
        >
          {currentQuestion < MOTIVATION_QUESTIONS.length - 1 ? 'Suivant →' : 'Terminer cette section ✓'}
        </button>
      </div>

      {/* Bouton de sauvegarde rapide - Removed as it's now in VAEWizard */}
    </div>
  );
}

MotivationSection.propTypes = {
  section: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
    icon: PropTypes.oneOfType([PropTypes.string, PropTypes.elementType]).isRequired,
    color: PropTypes.string.isRequired,
  }).isRequired,
  responses: PropTypes.object.isRequired,
  onComplete: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  totalQuestionsInSection: PropTypes.number.isRequired,
  answeredQuestionsInSection: PropTypes.number.isRequired,
};

export default MotivationSection; 