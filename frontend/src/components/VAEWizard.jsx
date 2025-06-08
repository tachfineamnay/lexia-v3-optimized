import { useState, useEffect } from 'react';import PropTypes from 'prop-types';import { useToast } from '../hooks/useToast';import LoadingSpinner from './LoadingSpinner';import { API_ENDPOINTS, getAuthHeaders } from '../config/api';import '../styles/lexia-design-system.css';

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
    icon: '🎯',
    questions: [1, 2, 3, 4],
    color: 'var(--lexia-orange)'
  },
  {
    id: 'parcours',
    title: 'Parcours professionnel',
    subtitle: 'Votre expérience dans le secteur',
    icon: '💼',
    questions: [5, 6, 7, 8, 9],
    color: 'var(--lexia-pink)'
  },
  {
    id: 'formation',
    title: 'Formation',
    subtitle: 'Votre parcours de formation',
    icon: '🎓',
    questions: [10, 11, 12],
    color: 'var(--lexia-blue)'
  },
  {
    id: 'experience',
    title: 'Expérience significative',
    subtitle: 'Une situation de travail marquante',
    icon: '⭐',
    questions: [13, 14, 15, 16, 17],
    color: 'var(--lexia-cyan)'
  },
  {
    id: 'contexte',
    title: 'Contexte institutionnel',
    subtitle: 'Votre environnement de travail',
    icon: '🏢',
    questions: [18, 19, 20, 21, 22],
    color: 'var(--lexia-orange)'
  },
  {
    id: 'competences',
    title: 'Compétences',
    subtitle: 'Vos compétences professionnelles',
    icon: '💡',
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
    const totalQuestions = 26;
    const answeredQuestions = Object.keys(responses).length;
    return Math.round((answeredQuestions / totalQuestions) * 100);
  };

  // Sauvegarder les réponses dans le localStorage
  useEffect(() => {
    const savedResponses = localStorage.getItem('vae_responses');
    if (savedResponses) {
      setResponses(JSON.parse(savedResponses));
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
    setResponses(prev => ({ ...prev, ...sectionResponses }));
    
    if (!completedSections.includes(currentSection)) {
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
      onBack: currentSection > 0 ? () => setCurrentSection(prev => prev - 1) : null
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
    <div className="vae-wizard-container">
      {/* En-tête avec progression */}
      <div className="lexia-card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="lexia-heading-1">Création de votre dossier VAE</h1>
          <div className="text-right">
            <span className="lexia-caption">Progression globale</span>
            <p className="text-2xl font-bold" style={{ color: 'var(--lexia-blue)' }}>
              {calculateProgress()}%
            </p>
          </div>
        </div>
        
        <div className="lexia-progress-bar">
          <div 
            className="lexia-progress-fill" 
            style={{ width: `${calculateProgress()}%` }}
          />
        </div>
      </div>

      {/* Grille des sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {VAE_SECTIONS.map((section, index) => {
          const isCompleted = completedSections.includes(index);
          const isLocked = index > 0 && !completedSections.includes(index - 1);
          
          return (
            <div
              key={section.id}
              onClick={() => !isLocked && openSection(index)}
              className={`lexia-card cursor-pointer transition-all duration-300 ${
                isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
              }`}
              style={{
                borderLeft: `4px solid ${isCompleted ? 'var(--lexia-success)' : section.color}`,
                background: isCompleted ? 'var(--lexia-gray-100)' : 'var(--lexia-white)'
              }}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{section.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{section.title}</h3>
                  <p className="lexia-caption">{section.subtitle}</p>
                  <div className="mt-3 flex items-center gap-2">
                    {isCompleted ? (
                      <span className="text-sm text-green-600 font-medium">
                        ✓ Complété
                      </span>
                    ) : isLocked ? (
                      <span className="text-sm text-gray-500">
                        🔒 Verrouillé
                      </span>
                    ) : (
                      <span className="text-sm text-blue-600 font-medium">
                        → Commencer
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions principales */}
      <div className="flex justify-center gap-4">
        <button 
          className="lexia-btn lexia-btn-secondary"
          onClick={() => {
            if (window.confirm('Sauvegarder et continuer plus tard ?')) {
              toast.info('Progression sauvegardée');
            }
          }}
        >
          💾 Sauvegarder
        </button>
        
        {completedSections.length === VAE_SECTIONS.length && (
          <button 
            className="lexia-btn lexia-btn-primary"
            onClick={handleGenerateDocument}
            disabled={isSaving}
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
        <div className="lexia-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div 
            className="lexia-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '800px' }}
          >
            <div className="p-6">
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