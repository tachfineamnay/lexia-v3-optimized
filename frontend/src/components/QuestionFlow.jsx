import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import '../styles/QuestionFlow.css';

// Configuration des sections
const SECTIONS = [
  {
    id: 'informations-personnelles',
    title: 'Informations Personnelles',
    description: 'Commençons par quelques informations de base sur vous.',
    questions: [1, 2, 3, 4, 5]
  },
  {
    id: 'habitudes-lecture',
    title: 'Habitudes de Lecture',
    description: 'Parlez-nous de vos habitudes de lecture actuelles.',
    questions: [6, 7, 8, 9, 10]
  },
  {
    id: 'difficultes',
    title: 'Difficultés Rencontrées',
    description: 'Décrivez les difficultés que vous rencontrez.',
    questions: [11, 12, 13, 14, 15]
  },
  {
    id: 'objectifs',
    title: 'Objectifs',
    description: 'Quels sont vos objectifs d\'apprentissage ?',
    questions: [16, 17, 18, 19, 20]
  },
  {
    id: 'preferences',
    title: 'Préférences',
    description: 'Comment préférez-vous apprendre ?',
    questions: [21, 22, 23, 24]
  },
  {
    id: 'conclusion',
    title: 'Conclusion',
    description: 'Dernières questions pour finaliser votre profil.',
    questions: [25, 26]
  }
];

// Messages d'encouragement par section
const ENCOURAGEMENT_MESSAGES = {
  'informations-personnelles': 'Excellent début ! Passons maintenant à vos habitudes de lecture.',
  'habitudes-lecture': 'Merci pour ces précisions ! Parlons maintenant des difficultés que vous rencontrez.',
  'difficultes': 'Vos réponses nous aident à mieux comprendre vos besoins. Continuons avec vos objectifs.',
  'objectifs': 'Des objectifs bien définis ! Voyons maintenant vos préférences d\'apprentissage.',
  'preferences': 'Presque terminé ! Quelques dernières questions pour finaliser votre profil.',
  'conclusion': 'Félicitations ! Vous avez complété le questionnaire. Nous allons maintenant analyser vos réponses.'
};

const QuestionFlow = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState({});
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sectionProgress, setSectionProgress] = useState({});
  const [globalProgress, setGlobalProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fonction de sauvegarde du brouillon
  const saveDraft = useCallback(async () => {
    if (Object.keys(answers).length === 0) return;

    try {
      setSaving(true);
      await axios.post('/api/dossiers/draft', { answers });
      setLastSaved(new Date());
      showToast('Brouillon sauvegardé', 'success');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du brouillon:', error);
      showToast('Erreur lors de la sauvegarde du brouillon', 'error');
    } finally {
      setSaving(false);
    }
  }, [answers, showToast]);

  // Sauvegarder toutes les 30 secondes
  useEffect(() => {
    const saveInterval = setInterval(saveDraft, 30000);
    return () => clearInterval(saveInterval);
  }, [saveDraft]);

  // Sauvegarder lors du changement de section
  useEffect(() => {
    if (currentSection > 0) {
      saveDraft();
    }
  }, [currentSection, saveDraft]);

  // Sauvegarder avant de quitter la page
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (Object.keys(answers).length > 0) {
        saveDraft();
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [answers, saveDraft]);

  // Charger les questions et le brouillon au montage
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [questionsResponse, draftResponse] = await Promise.all([
          axios.get('/api/questions'),
          axios.get('/api/dossiers/draft')
        ]);

        setQuestions(questionsResponse.data);
        
        if (draftResponse.data.answers) {
          setAnswers(draftResponse.data.answers);
          showToast('Brouillon précédent chargé', 'info');
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          setError('Erreur lors du chargement des données');
          showToast('Erreur lors du chargement des données', 'error');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showToast]);

  // Calculer la progression par section
  useEffect(() => {
    const calculateSectionProgress = () => {
      const progress = {};
      SECTIONS.forEach(section => {
        const sectionQuestions = questions.filter(q => section.questions.includes(q.id));
        const answeredQuestions = sectionQuestions.filter(q => {
          if (!q.dependsOn) return answers[q.id] !== undefined;
          const [depQuestionId, depValue] = q.dependsOn.split('=');
          return answers[depQuestionId] === depValue && answers[q.id] !== undefined;
        });
        progress[section.id] = (answeredQuestions.length / sectionQuestions.length) * 100;
      });
      setSectionProgress(progress);
    };

    calculateSectionProgress();
  }, [answers, questions]);

  // Calculer la progression globale
  useEffect(() => {
    const calculateGlobalProgress = () => {
      const totalQuestions = questions.length;
      const answeredQuestions = Object.keys(answers).length;
      setGlobalProgress((answeredQuestions / totalQuestions) * 100);
    };

    calculateGlobalProgress();
  }, [answers, questions]);

  // Vérifier si toutes les questions visibles de la section sont répondues
  const isSectionComplete = () => {
    const currentSectionQuestions = questions.filter(q => 
      SECTIONS[currentSection].questions.includes(q.id)
    );
    
    return currentSectionQuestions.every(q => {
      if (!q.dependsOn) return answers[q.id] !== undefined;
      const [depQuestionId, depValue] = q.dependsOn.split('=');
      return answers[depQuestionId] !== depValue || answers[q.id] !== undefined;
    });
  };

  // Gérer le changement de réponse
  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Navigation entre les sections
  const handleNext = async () => {
    if (currentSection < SECTIONS.length - 1) {
      await saveDraft();
      setCurrentSection(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  // Soumettre les réponses et générer le dossier
  const handleSubmit = async () => {
    try {
      setIsGenerating(true);
      showToast('Génération du dossier en cours...', 'info');
      
      await saveDraft();
      const response = await axios.post('/api/dossiers/generate', { answers });
      
      showToast('Dossier généré avec succès !', 'success');
      navigate(`/dossier/${response.data.dossierId}`);
    } catch (error) {
      console.error('Erreur lors de la génération du dossier:', error);
      showToast('Erreur lors de la génération du dossier', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>;

  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  const currentSectionData = SECTIONS[currentSection];
  const visibleQuestions = questions.filter(q => 
    currentSectionData.questions.includes(q.id) &&
    (!q.dependsOn || (() => {
      const [depQuestionId, depValue] = q.dependsOn.split('=');
      return answers[depQuestionId] === depValue;
    })())
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Indicateur de sauvegarde */}
      <div className="fixed top-4 right-4 z-50">
        {saving ? (
          <div className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full">
            <div className="animate-spin h-4 w-4 border-2 border-blue-700 rounded-full border-t-transparent"></div>
            <span>Sauvegarde en cours...</span>
          </div>
        ) : lastSaved && (
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full">
            Dernière sauvegarde : {new Date(lastSaved).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Barre de progression globale */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progression globale</span>
          <span className="text-sm font-medium text-gray-700">{Math.round(globalProgress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${globalProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Navigation des sections */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={handlePrevious}
          disabled={currentSection === 0}
          className={`px-4 py-2 rounded ${
            currentSection === 0
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          Précédent
        </button>
        <span className="text-lg font-medium">
          Section {currentSection + 1} sur {SECTIONS.length}
        </span>
        <button
          onClick={handleNext}
          disabled={currentSection === SECTIONS.length - 1 || !isSectionComplete()}
          className={`px-4 py-2 rounded ${
            currentSection === SECTIONS.length - 1 || !isSectionComplete()
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          Suivant
        </button>
      </div>

      {/* En-tête de la section */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold mb-2">{currentSectionData.title}</h2>
        <p className="text-gray-600">{currentSectionData.description}</p>
      </div>

      {/* Progression de la section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progression de la section</span>
          <span className="text-sm font-medium text-gray-700">
            {Math.round(sectionProgress[currentSectionData.id])}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${sectionProgress[currentSectionData.id]}%` }}
          ></div>
        </div>
      </div>

      {/* Questions de la section */}
      <div className="space-y-8">
        {visibleQuestions.map(question => (
          <div key={question.id} className="bg-white p-6 rounded-lg shadow-sm">
            <label className="block text-lg font-medium text-gray-900 mb-2">
              {question.text}
            </label>
            {question.type === 'text' && (
              <div className="relative">
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  maxLength={500}
                />
                <div className="absolute bottom-2 right-2 text-sm text-gray-500">
                  {(answers[question.id]?.length || 0)}/500
                </div>
              </div>
            )}
            {question.type === 'radio' && (
              <div className="space-y-2">
                {question.options.map(option => (
                  <label key={option.value} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option.value}
                      checked={answers[question.id] === option.value}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Message d'encouragement */}
      {isSectionComplete() && (
        <div className="mt-8 p-4 bg-green-50 rounded-lg text-center">
          <p className="text-green-700">{ENCOURAGEMENT_MESSAGES[currentSectionData.id]}</p>
        </div>
      )}

      {/* Bouton de soumission pour la dernière section */}
      {currentSection === SECTIONS.length - 1 && isSectionComplete() && (
        <div className="mt-8 text-center">
          <button
            onClick={handleSubmit}
            disabled={isGenerating}
            className={`px-6 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isGenerating
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500'
            }`}
          >
            {isGenerating ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
                <span>Génération en cours...</span>
              </div>
            ) : (
              'Terminer le questionnaire'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionFlow; 