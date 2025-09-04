import { useState } from 'react';
import PropTypes from 'prop-types';

const FORMATION_QUESTIONS = [
  {
    id: 1,
    text: "Décrivez votre parcours de formation initiale et continue dans le domaine social ou éducatif.",
    tooltip: "Mentionnez les diplômes, les certifications, les formations continues pertinentes.",
    placeholder: "J'ai suivi les formations suivantes...",
    minLength: 150
  },
  {
    id: 2,
    text: "Quelles compétences avez-vous acquises lors de ces formations qui sont utiles à votre pratique d'éducateur ?",
    tooltip: "Faites le lien entre le contenu des formations et les compétences attendues d'un éducateur spécialisé.",
    placeholder: "Ces formations m'ont permis d'acquérir...",
    minLength: 150
  },
  {
    id: 3,
    text: "Comment ces formations ont-elles influencé votre approche professionnelle et votre posture éducative ?",
    tooltip: "Montrez l'impact de vos formations sur votre façon de travailler et d'accompagner les publics.",
    placeholder: "Ma posture professionnelle a été influencée par...",
    minLength: 150
  },
  {
    id: 4,
    text: "Quelles formations complémentaires envisagez-vous pour renforcer vos compétences après l'obtention du DEES ?",
    tooltip: "Montrez votre engagement dans une démarche de formation continue et d'amélioration de vos compétences.",
    placeholder: "Après l'obtention du DEES, je souhaite...",
    minLength: 150
  }
];

function FormationSection({ section, responses, onComplete, onBack }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [localResponses, setLocalResponses] = useState(() => {
    // Initialiser avec les réponses existantes
    const initial = {};
    FORMATION_QUESTIONS.forEach(q => {
      initial[q.id] = responses[q.id] || '';
    });
    return initial;
  });
  const [errors, setErrors] = useState({});

  const question = FORMATION_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / FORMATION_QUESTIONS.length) * 100;

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

    if (currentQuestion < FORMATION_QUESTIONS.length - 1) {
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
    <div className="formation-section slide-up">
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
          Question {currentQuestion + 1} sur {FORMATION_QUESTIONS.length}
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
            💡 <strong>Conseil :</strong> Mettez en avant les formations les plus pertinentes pour le métier d'éducateur 
            spécialisé et expliquez comment elles vous ont préparé aux compétences attendues.
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
          {currentQuestion < FORMATION_QUESTIONS.length - 1 ? 'Suivant →' : 'Terminer cette section ✓'}
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

FormationSection.propTypes = {
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

export default FormationSection; 