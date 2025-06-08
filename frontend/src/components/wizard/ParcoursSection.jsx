import { useState } from 'react';
import PropTypes from 'prop-types';
import '../../styles/lexia-design-system.css';

const PARCOURS_QUESTIONS = [
  {
    id: 1,
    text: "Décrivez votre parcours professionnel en détaillant les postes occupés dans le domaine éducatif ou social.",
    tooltip: "Mentionnez les établissements, les dates, la durée et vos principales responsabilités.",
    placeholder: "Mon parcours professionnel a débuté...",
    minLength: 150
  },
  {
    id: 2,
    text: "Quelles expériences professionnelles vous ont particulièrement préparé au métier d'éducateur spécialisé ?",
    tooltip: "Sélectionnez les expériences les plus pertinentes pour le DEES et expliquez leur impact sur votre pratique.",
    placeholder: "Les expériences qui m'ont le mieux préparé sont...",
    minLength: 150
  },
  {
    id: 3,
    text: "Comment avez-vous développé vos compétences en accompagnement éducatif au fil de votre parcours ?",
    tooltip: "Illustrez l'évolution de vos compétences avec des exemples concrets.",
    placeholder: "J'ai développé mes compétences en...",
    minLength: 150
  },
  {
    id: 4,
    text: "Quels publics avez-vous accompagnés et quelles problématiques avez-vous rencontrées ?",
    tooltip: "Détaillez les différents publics et les approches adaptées que vous avez mises en œuvre.",
    placeholder: "J'ai travaillé principalement avec...",
    minLength: 150
  }
];

function ParcoursSection({ section, responses, onComplete, onBack }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [localResponses, setLocalResponses] = useState(() => {
    // Initialiser avec les réponses existantes
    const initial = {};
    PARCOURS_QUESTIONS.forEach(q => {
      initial[q.id] = responses[q.id] || '';
    });
    return initial;
  });
  const [errors, setErrors] = useState({});

  const question = PARCOURS_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / PARCOURS_QUESTIONS.length) * 100;

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
      return;
    }

    if (currentQuestion < PARCOURS_QUESTIONS.length - 1) {
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

  // Calculer le nombre de caractères
  const charCount = localResponses[question.id].length;
  const charPercentage = Math.min((charCount / question.minLength) * 100, 100);

  return (
    <div className="parcours-section slide-up">
      {/* En-tête de la section */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{section.icon}</span>
          <div>
            <h2 className="lexia-heading-2">{section.title}</h2>
            <p className="lexia-caption">{section.subtitle}</p>
          </div>
        </div>
        
        {/* Barre de progression de la section */}
        <div className="lexia-progress-bar">
          <div 
            className="lexia-progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="lexia-caption mt-2">
          Question {currentQuestion + 1} sur {PARCOURS_QUESTIONS.length}
        </p>
      </div>

      {/* Question actuelle */}
      <div className="mb-6">
        <div className="flex items-start gap-2 mb-4">
          <h3 className="lexia-body font-semibold flex-1">
            {question.text}
          </h3>
          
          {/* Tooltip */}
          <div className="lexia-tooltip">
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <div className="lexia-tooltip-content" style={{ width: '250px', whiteSpace: 'normal' }}>
              {question.tooltip}
            </div>
          </div>
        </div>

        {/* Zone de texte */}
        <div className="lexia-form-group">
          <textarea
            className={`lexia-input lexia-textarea ${errors[question.id] ? 'lexia-input-error' : ''}`}
            value={localResponses[question.id]}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={question.placeholder}
            rows={6}
            style={{ minHeight: '200px' }}
          />
          
          {/* Compteur de caractères */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${charPercentage}%`,
                    backgroundColor: charCount >= question.minLength ? 'var(--lexia-success)' : 'var(--lexia-orange)'
                  }}
                />
              </div>
              <span className={`lexia-caption ${charCount >= question.minLength ? 'text-green-600' : ''}`}>
                {charCount} / {question.minLength} caractères
              </span>
            </div>
          </div>
          
          {/* Message d'erreur */}
          {errors[question.id] && (
            <p className="lexia-helper-text lexia-helper-error mt-2">
              {errors[question.id]}
            </p>
          )}
        </div>

        {/* Conseils de rédaction */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4 rounded">
          <p className="text-sm text-blue-700">
            💡 <strong>Conseil :</strong> Structurez votre parcours de manière chronologique et mettez en évidence 
            les compétences développées lors de chaque expérience professionnelle.
          </p>
        </div>
      </div>

      {/* Boutons de navigation */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={handlePrevious}
          className="lexia-btn lexia-btn-secondary"
        >
          ← Précédent
        </button>

        <button
          onClick={handleNext}
          className="lexia-btn lexia-btn-primary"
        >
          {currentQuestion < PARCOURS_QUESTIONS.length - 1 ? 'Suivant →' : 'Terminer cette section ✓'}
        </button>
      </div>

      {/* Bouton de sauvegarde rapide */}
      <div className="text-center mt-4">
        <button className="text-sm text-gray-500 hover:text-gray-700 underline">
          Sauvegarder et fermer
        </button>
      </div>
    </div>
  );
}

ParcoursSection.propTypes = {
  section: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired
  }).isRequired,
  responses: PropTypes.object.isRequired,
  onComplete: PropTypes.func.isRequired,
  onBack: PropTypes.func
};

export default ParcoursSection; 