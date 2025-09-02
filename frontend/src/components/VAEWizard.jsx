import { useState, useEffect } from 'react';import PropTypes from 'prop-types';import { useToast } from '../hooks/useToast';import LoadingSpinner from './LoadingSpinner';import { API_ENDPOINTS, getAuthHeaders } from '../config/api';import '../styles/lexia-design-system.css';import { 
  CheckCircleIcon, 
  ChevronRightIcon, 
  DocumentMagnifyingGlassIcon, 
  WrenchScrewdriverIcon,
  AcademicCapIcon,
  ArrowPathIcon,
  PencilIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'; // Import new icons

// Import des sections du questionnaire
import MotivationSection from './wizard/MotivationSection';
import ParcoursSection from './wizard/ParcoursSection';
import FormationSection from './wizard/FormationSection';
import ExperienceSection from './wizard/ExperienceSection';
import ContexteSection from './wizard/ContexteSection';
import CompetencesSection from './wizard/CompetencesSection';

const VAE_SECTIONS = [
  {
    id: 'motivation',
    title: 'Motivations',
    subtitle: 'Vos motivations pour la VAE',
    icon: CheckCircleIcon, // Using Heroicon
    questions: [1, 2, 3, 4],
    color: 'var(--lexia-orange)'
  },
  {
    id: 'parcours',
    title: 'Parcours professionnel',
    subtitle: 'Votre expérience dans le secteur',
    icon: WrenchScrewdriverIcon, // Using Heroicon
    questions: [5, 6, 7, 8, 9],
    color: 'var(--lexia-pink)'
  },
  {
    id: 'formation',
    title: 'Formation',
    subtitle: 'Votre parcours de formation',
    icon: AcademicCapIcon, // Using Heroicon
    questions: [10, 11, 12],
    color: 'var(--lexia-blue)'
  },
  {
    id: 'experience',
    title: 'Expérience significative',
    subtitle: 'Une situation de travail marquante',
    icon: DocumentMagnifyingGlassIcon, // Using Heroicon
    questions: [13, 14, 15, 16, 17],
    color: 'var(--lexia-cyan)'
  },
  {
    id: 'contexte',
    title: 'Contexte institutionnel',
    subtitle: 'Votre environnement de travail',
    icon: '🏢', // Fallback to emoji if no Heroicon is suitable yet
    questions: [18, 19, 20, 21, 22],
    color: 'var(--lexia-orange)'
  },
  {
    id: 'competences',
    title: 'Compétences',
    subtitle: 'Vos compétences professionnelles',
    icon: '💡', // Fallback to emoji
    questions: [23, 24, 25, 26],
    color: 'var(--lexia-pink)'
  }
];

function VAEWizard({ onComplete }) {
  const [currentSection, setCurrentSection] = useState(0);
  const [responses, setResponses] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [completedSections, setCompletedSections] = useState([]);
  const toast = useToast();

  // Calculer le pourcentage de progression
  const calculateProgress = () => {
    const totalQuestions = VAE_SECTIONS.reduce((acc, section) => acc + section.questions.length, 0);
    const answeredQuestions = Object.keys(responses).filter(key => responses[key] && responses[key].trim() !== '').length;
    return totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
  };

  // Sauvegarder les réponses dans le localStorage
  useEffect(() => {
    const savedResponses = localStorage.getItem('vae_responses');
    if (savedResponses) {
      setResponses(JSON.parse(savedResponses));
      // Re-calculate completed sections based on loaded responses
      const newCompletedSections = VAE_SECTIONS.map((section, index) => {
        const sectionQuestionsAnswered = section.questions.every(qId => responses[qId] && responses[qId].trim() !== '');
        return sectionQuestionsAnswered ? index : null;
      }).filter(index => index !== null);
      setCompletedSections(newCompletedSections);
    }
  }, []);

  useEffect(() => {
    if (Object.keys(responses).length > 0) {
      localStorage.setItem('vae_responses', JSON.stringify(responses));
    }
  }, [responses]);

  // Ouvrir la modale pour une section
  const openSection = (sectionIndex) => {
    setCurrentSection(sectionIndex);
    setIsModalOpen(true);
  };

  // Sauvegarder les réponses d'une section
  const handleSectionComplete = (sectionResponses) => {
    const updatedResponses = { ...responses, ...sectionResponses };
    setResponses(updatedResponses);
    
    // Check if the current section is truly completed
    const currentSectionData = VAE_SECTIONS[currentSection];
    const allQuestionsAnsweredInCurrentSection = currentSectionData.questions.every(
      qId => updatedResponses[qId] && updatedResponses[qId].trim() !== ''
    );

    if (allQuestionsAnsweredInCurrentSection && !completedSections.includes(currentSection)) {
      setCompletedSections(prev => [...prev, currentSection]);
    }

    // Passer à la section suivante ou fermer si c'est la dernière
    if (currentSection < VAE_SECTIONS.length - 1) {
      setTimeout(() => {
        setCurrentSection(prev => prev + 1);
      }, 300);
    } else {
      setIsModalOpen(false);
      toast.success('Toutes les sections sont complétées ! Génération du dossier en cours...');
      handleGenerateDocument();
    }
  };

  // Générer le document avec l'IA
  const handleGenerateDocument = async () => {
    setIsSaving(true);
    try {
            const response = await fetch(API_ENDPOINTS.AI_GENERATE_VAE, {        method: 'POST',        headers: {          'Content-Type': 'application/json',          ...getAuthHeaders()        },        body: JSON.stringify({ responses })      });

      if (!response.ok) throw new Error('Erreur lors de la génération');

      const data = await response.json();
      onComplete(data.document);
      toast.success('Dossier VAE généré avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la génération du dossier');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // Rendre le composant de section actuel
  const renderCurrentSection = () => {
    const section = VAE_SECTIONS[currentSection];
    const sectionProps = {
      section,
      responses,
      onComplete: handleSectionComplete,
      onBack: currentSection > 0 ? () => setCurrentSection(prev => prev - 1) : null,
      onClose: () => setIsModalOpen(false), // Add onClose prop
      totalQuestionsInSection: section.questions.length,
      answeredQuestionsInSection: section.questions.filter(qId => responses[qId] && responses[qId].trim() !== '').length
    };

    switch (section.id) {
      case 'motivation':
        return <MotivationSection {...sectionProps} />;
      case 'parcours':
        return <ParcoursSection {...sectionProps} />;
      case 'formation':
        return <FormationSection {...sectionProps} />;
      case 'experience':
        return <ExperienceSection {...sectionProps} />;
      case 'contexte':
        return <ContexteSection {...sectionProps} />;
      case 'competences':
        return <CompetencesSection {...sectionProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="vae-wizard-container relative">
      {/* Header sticky avec progression globale */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md py-4 mb-6 lexia-card rounded-b-lg -mx-6 px-6 md:px-8 lg:px-12">
        <div className="flex items-center justify-between">
          <h1 className="lexia-heading-2 md:lexia-heading-1 text-lexia-text-primary">Votre dossier VAE</h1>
          <div className="text-right">
            <span className="lexia-caption text-lexia-text-secondary">Progression globale</span>
            <p className="text-2xl font-bold text-lexia-blue">
              {calculateProgress()}%
            </p>
          </div>
        </div>
        <div className="lexia-progress-bar mt-2">
          <div 
            className="lexia-progress-fill"
            style={{ width: `${calculateProgress()}%` }}
          />
        </div>
      </div>

      {/* Grille des sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 mt-10">
        {VAE_SECTIONS.map((section, index) => {
          const isCompleted = completedSections.includes(index);
          const isLocked = index > 0 && !completedSections.includes(index - 1);
          const isActive = currentSection === index && isModalOpen; // Section currently open in modal
          const Icon = section.icon; // Get the Heroicon component or emoji
          
          let statusText = 'À faire';
          let statusColor = 'text-gray-500';
          let actionText = 'Commencer';
          let actionIcon = <ChevronRightIcon className="h-5 w-5" />;
          let borderColor = section.color;

          if (isCompleted) {
            statusText = 'Fini';
            statusColor = 'text-green-600';
            actionText = 'Modifier';
            actionIcon = <PencilIcon className="h-5 w-5" />;
            borderColor = 'var(--lexia-success)';
          } else if (isActive) {
            statusText = 'En cours';
            statusColor = 'text-blue-600';
            actionText = 'Continuer';
            actionIcon = <ArrowPathIcon className="h-5 w-5" />;
            borderColor = 'var(--lexia-blue)';
          } else if (isLocked) {
            statusText = 'Verrouillé';
            statusColor = 'text-red-500';
            actionText = 'Débloquer';
            actionIcon = <LockClosedIcon className="h-5 w-5" />;
            borderColor = 'var(--lexia-error)';
          }

          return (
            <button
              key={section.id}
              onClick={() => !isLocked && openSection(index)}
              className={`lexia-card flex flex-col justify-between p-6 rounded-lg transition-all duration-300 transform
                ${isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-lg lexia-focus-ring'}
                ${isActive ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-blue-400' : ''}
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lexia-focus
              }`}
              style={{
                borderLeft: `4px solid ${borderColor}`,
                backgroundColor: 'var(--lexia-surface)',
                borderColor: 'var(--lexia-border-muted)' // Ensure border is also themed
              }}
              disabled={isLocked}
              aria-label={`Accéder à la section ${section.title}. État: ${statusText}`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`text-4xl ${isCompleted ? 'text-green-500' : 'text-gray-400'}`}>
                  {typeof Icon === 'string' ? Icon : <Icon className="h-10 w-10" />}
                </div>
                <div className="flex-1">
                  <h3 className="lexia-heading-3 text-lexia-text-primary mb-1">{section.title}</h3>
                  <p className="lexia-caption text-lexia-text-secondary">{section.subtitle}</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className={`lexia-badge py-1 px-3 rounded-full ${statusColor} bg-opacity-20`}>
                  {statusText}
                </span>
                <div className={`flex items-center gap-1 font-medium ${isLocked ? 'text-red-500' : 'text-blue-500'}`}>
                  {actionIcon} {actionText}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Actions principales */}
      <div className="flex justify-center gap-4 mt-8 pb-12">
        <button 
          className="lexia-btn lexia-btn-secondary"
          onClick={() => {
            toast.info('Progression sauvegardée !');
          }}
          aria-label="Sauvegarder et fermer le formulaire"
        >
          💾 Sauvegarder et fermer
        </button>
        
        {completedSections.length === VAE_SECTIONS.length && (
          <button 
            className="lexia-btn lexia-btn-primary"
            onClick={handleGenerateDocument}
            disabled={isSaving}
            aria-label="Générer le dossier VAE avec l'IA"
          >
            {isSaving ? (
              <>
                <LoadingSpinner size="sm" color="white" />
                Génération...
              </>
            ) : (
              <>🚀 Générer le dossier</>
            )}
          </button>
        )}
      </div>

      {/* Modal pour les sections */}
      {isModalOpen && (
        <div 
          className="lexia-modal-backdrop"
          onClick={() => setIsModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div 
            className="lexia-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 sm:p-8">
              {renderCurrentSection()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

VAEWizard.propTypes = {
  onComplete: PropTypes.func.isRequired
};

export default VAEWizard; 