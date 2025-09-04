import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  SparklesIcon,
  LockClosedIcon,
  BookmarkIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  StarIcon,
  BuildingOfficeIcon,
  LightBulbIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from './LoadingSpinner';
import { API_ENDPOINTS, getAuthHeaders } from '../config/api';

// Questions par section (simplifié pour l'exemple - à adapter selon vos besoins)
const VAE_SECTIONS = [
  {
    id: 'motivation',
    title: 'Vos Motivations',
    subtitle: 'Pourquoi souhaitez-vous faire une VAE ?',
    icon: UserIcon,
    color: 'from-blue-500 to-cyan-500',
    questions: [
      { id: 'q1', type: 'textarea', label: 'Quelles sont vos principales motivations pour entreprendre une VAE ?', required: true, placeholder: 'Expliquez en détail vos motivations personnelles et professionnelles...' },
      { id: 'q2', type: 'textarea', label: 'Comment cette certification va-t-elle vous aider dans votre carrière ?', required: true, placeholder: 'Décrivez les opportunités que cette certification pourrait vous offrir...' },
      { id: 'q3', type: 'select', label: 'Quel est votre niveau d\'étude actuel ?', required: true, options: ['Bac', 'Bac+2', 'Bac+3', 'Bac+5', 'Autre'] },
      { id: 'q4', type: 'textarea', label: 'Avez-vous déjà entrepris des démarches de formation ou de certification ?', required: false, placeholder: 'Décrivez vos précédentes expériences de formation...' }
    ]
  },
  {
    id: 'parcours',
    title: 'Parcours Professionnel',
    subtitle: 'Votre expérience dans le domaine',
    icon: BriefcaseIcon,
    color: 'from-purple-500 to-pink-500',
    questions: [
      { id: 'q5', type: 'number', label: 'Combien d\'années d\'expérience avez-vous dans votre domaine ?', required: true, min: 0, max: 50 },
      { id: 'q6', type: 'textarea', label: 'Décrivez votre poste actuel et vos principales responsabilités', required: true, placeholder: 'Détaillez vos missions, responsabilités et compétences mobilisées...' },
      { id: 'q7', type: 'textarea', label: 'Quelles ont été vos précédentes expériences professionnelles significatives ?', required: true, placeholder: 'Listez vos postes précédents avec les compétences développées...' },
      { id: 'q8', type: 'select', label: 'Dans quel secteur travaillez-vous principalement ?', required: true, options: ['Public', 'Privé', 'Associatif', 'Libéral', 'Autre'] },
      { id: 'q9', type: 'textarea', label: 'Avez-vous eu des responsabilités d\'encadrement ou de management ?', required: false, placeholder: 'Décrivez vos expériences de management et leadership...' }
    ]
  },
  {
    id: 'formation',
    title: 'Formation & Diplômes',
    subtitle: 'Votre parcours académique',
    icon: AcademicCapIcon,
    color: 'from-green-500 to-emerald-500',
    questions: [
      { id: 'q10', type: 'textarea', label: 'Quels sont vos diplômes et certifications obtenus ?', required: true, placeholder: 'Listez vos diplômes avec les années d\'obtention...' },
      { id: 'q11', type: 'textarea', label: 'Avez-vous suivi des formations professionnelles continues ?', required: true, placeholder: 'Décrivez les formations que vous avez suivies en cours de carrière...' },
      { id: 'q12', type: 'textarea', label: 'Comment votre formation initiale vous a-t-elle préparé à votre métier ?', required: false, placeholder: 'Expliquez les liens entre votre formation et votre pratique professionnelle...' }
    ]
  },
  {
    id: 'experience',
    title: 'Expérience Significative',
    subtitle: 'Une situation professionnelle marquante',
    icon: StarIcon,
    color: 'from-yellow-500 to-orange-500',
    questions: [
      { id: 'q13', type: 'textarea', label: 'Décrivez une situation professionnelle particulièrement significative', required: true, placeholder: 'Contexte, enjeux, votre rôle, actions menées, résultats...' },
      { id: 'q14', type: 'textarea', label: 'Quelles compétences avez-vous mobilisées dans cette situation ?', required: true, placeholder: 'Listez les compétences techniques et transversales utilisées...' },
      { id: 'q15', type: 'textarea', label: 'Quelles difficultés avez-vous rencontrées et comment les avez-vous surmontées ?', required: true, placeholder: 'Décrivez les obstacles et vos stratégies de résolution...' },
      { id: 'q16', type: 'textarea', label: 'Quels ont été les résultats et impacts de votre action ?', required: true, placeholder: 'Résultats concrets, bénéfices pour l\'organisation, apprentissages...' },
      { id: 'q17', type: 'textarea', label: 'Que vous a apporté cette expérience sur le plan professionnel ?', required: false, placeholder: 'Compétences développées, confiance acquise, nouvelles perspectives...' }
    ]
  },
  {
    id: 'contexte',
    title: 'Contexte Institutionnel',
    subtitle: 'Votre environnement de travail',
    icon: BuildingOfficeIcon,
    color: 'from-indigo-500 to-purple-500',
    questions: [
      { id: 'q18', type: 'textarea', label: 'Décrivez la structure dans laquelle vous travaillez', required: true, placeholder: 'Type d\'organisation, taille, mission, secteur d\'activité...' },
      { id: 'q19', type: 'textarea', label: 'Comment s\'organise votre équipe de travail ?', required: true, placeholder: 'Composition de l\'équipe, répartition des rôles, modes de collaboration...' },
      { id: 'q20', type: 'textarea', label: 'Quelles sont les spécificités de votre environnement professionnel ?', required: true, placeholder: 'Contraintes, ressources, outils, culture d\'entreprise...' },
      { id: 'q21', type: 'textarea', label: 'Comment vous positionnez-vous dans la hiérarchie ?', required: true, placeholder: 'Votre place, vos interlocuteurs, votre niveau de responsabilité...' },
      { id: 'q22', type: 'textarea', label: 'Participez-vous à des projets transversaux ou à l\'évolution de l\'organisation ?', required: false, placeholder: 'Projets, groupes de travail, innovations, améliorations proposées...' }
    ]
  },
  {
    id: 'competences',
    title: 'Compétences Clés',
    subtitle: 'Vos compétences principales',
    icon: LightBulbIcon,
    color: 'from-pink-500 to-rose-500',
    questions: [
      { id: 'q23', type: 'textarea', label: 'Quelles sont vos principales compétences techniques ?', required: true, placeholder: 'Compétences métier, maîtrise d\'outils, savoir-faire spécialisés...' },
      { id: 'q24', type: 'textarea', label: 'Quelles sont vos compétences relationnelles et comportementales ?', required: true, placeholder: 'Communication, leadership, adaptabilité, esprit d\'équipe...' },
      { id: 'q25', type: 'textarea', label: 'Comment développez-vous en permanence vos compétences ?', required: true, placeholder: 'Veille, formation, échanges, expérimentation, réflexivité...' },
      { id: 'q26', type: 'textarea', label: 'Quelles compétences souhaiteriez-vous encore développer ?', required: false, placeholder: 'Axes de progression, nouvelles compétences à acquérir...' }
    ]
  }
];

function VAEWizard({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();

  // Charger les réponses sauvegardées
  useEffect(() => {
    const savedResponses = localStorage.getItem('vae_responses');
    if (savedResponses) {
      try {
        setResponses(JSON.parse(savedResponses));
      } catch (e) {
        console.error('Erreur parsing responses:', e);
      }
    }
  }, []);

  // Sauvegarder automatiquement
  useEffect(() => {
    if (Object.keys(responses).length > 0) {
      localStorage.setItem('vae_responses', JSON.stringify(responses));
    }
  }, [responses]);

  // Calculer la progression
  const calculateProgress = () => {
    const totalQuestions = VAE_SECTIONS.reduce((sum, section) => sum + section.questions.length, 0);
    const answeredQuestions = Object.keys(responses).length;
    return Math.round((answeredQuestions / totalQuestions) * 100);
  };

  // Vérifier si une section est complète
  const isSectionComplete = (sectionIndex) => {
    const section = VAE_SECTIONS[sectionIndex];
    const requiredQuestions = section.questions.filter(q => q.required);
    return requiredQuestions.every(q => responses[q.id] && responses[q.id].trim());
  };

  // Valider une question
  const validateQuestion = (question, value) => {
    if (question.required && (!value || !value.trim())) {
      return 'Ce champ est obligatoire';
    }
    if (question.type === 'number') {
      const num = parseFloat(value);
      if (question.min !== undefined && num < question.min) {
        return `La valeur doit être supérieure ou égale à ${question.min}`;
      }
      if (question.max !== undefined && num > question.max) {
        return `La valeur doit être inférieure ou égale à ${question.max}`;
      }
    }
    return null;
  };

  // Gérer les changements de réponse
  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
    // Retirer l'erreur si elle existe
    if (errors[questionId]) {
      setErrors(prev => ({ ...prev, [questionId]: null }));
    }
  };

  // Naviguer entre les étapes
  const goToStep = (step) => {
    const currentSection = VAE_SECTIONS[currentStep];
    const newErrors = {};
    
    // Valider les champs obligatoires de l'étape actuelle si on avance
    if (step > currentStep) {
      const requiredQuestions = currentSection.questions.filter(q => q.required);
      let hasErrors = false;
      
      requiredQuestions.forEach(question => {
        const error = validateQuestion(question, responses[question.id]);
        if (error) {
          newErrors[question.id] = error;
          hasErrors = true;
        }
      });
      
      if (hasErrors) {
        setErrors(newErrors);
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }
    }
    
    setCurrentStep(step);
    setErrors({});
  };

  // Générer le document
  const handleGenerateDocument = async () => {
    // Validation finale
    const allErrors = {};
    let hasErrors = false;
    
    VAE_SECTIONS.forEach(section => {
      section.questions.filter(q => q.required).forEach(question => {
        const error = validateQuestion(question, responses[question.id]);
        if (error) {
          allErrors[question.id] = error;
          hasErrors = true;
        }
      });
    });
    
    if (hasErrors) {
      setErrors(allErrors);
      toast.error('Veuillez compléter tous les champs obligatoires');
      return;
    }
    
    setIsGenerating(true);
    try {
      const response = await fetch(API_ENDPOINTS.aiGenerateVae || '/api/ai/generate-vae', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ responses })
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Nettoyer le localStorage après génération réussie
      localStorage.removeItem('vae_responses');
      
      toast.success('Dossier VAE généré avec succès !');
      onComplete(data.document || data);
    } catch (error) {
      console.error('Erreur génération:', error);
      toast.error(`Erreur lors de la génération: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentSection = VAE_SECTIONS[currentStep];
  const isLastStep = currentStep === VAE_SECTIONS.length - 1;
  const allSectionsComplete = VAE_SECTIONS.every((_, index) => isSectionComplete(index));

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* En-tête avec progression */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">
            {currentSection.title}
          </h2>
          <div className="flex items-center space-x-2 text-blue-100">
            <currentSection.icon className="w-6 h-6" />
            <span className="text-sm">
              Étape {currentStep + 1} sur {VAE_SECTIONS.length}
            </span>
          </div>
        </div>
        
        <p className="text-blue-100 mb-4">{currentSection.description}</p>
        
        {/* Barre de progression */}
        <div className="w-full bg-blue-700 rounded-full h-3 mb-2">
          <motion.div
            className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full"
            style={{ width: `${calculateProgress()}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${calculateProgress()}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        <div className="flex justify-between text-sm text-blue-100">
          <span>Progression: {calculateProgress()}%</span>
          <span>{Object.keys(responses).length} réponses</span>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="border-b border-gray-200 px-6">
        <div className="flex space-x-0 overflow-x-auto">
          {VAE_SECTIONS.map((section, index) => (
            <motion.button
              key={section.id}
              onClick={() => goToStep(index)}
              className={`flex items-center px-4 py-3 border-b-2 whitespace-nowrap transition-colors
                ${currentStep === index 
                  ? 'border-blue-500 text-blue-600 bg-blue-50' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
                ${isSectionComplete(index) ? 'text-green-600' : ''}
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <section.icon className={`w-5 h-5 mr-2 
                ${currentStep === index ? 'text-blue-500' : 'text-gray-400'}
                ${isSectionComplete(index) ? 'text-green-500' : ''}
              `} />
              <span className="hidden sm:inline">{section.title}</span>
              {isSectionComplete(index) && (
                <CheckCircleIcon className="w-4 h-4 ml-2 text-green-500" />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Contenu principal */}
      <motion.div 
        className="p-6 min-h-96"
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        <div className="space-y-6">
          {currentSection.questions.map((question, index) => (
            <motion.div 
              key={question.id}
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <label className="flex items-start space-x-2">
                <span className="block text-sm font-medium text-gray-700">
                  {question.label}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </span>
              </label>
              
              {question.type === 'textarea' && (
                <textarea
                  rows={4}
                  value={responses[question.id] || ''}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  placeholder={question.placeholder}
                  className={`w-full rounded-md shadow-sm transition-colors
                    ${errors[question.id] 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }
                  `}
                />
              )}
              
              {question.type === 'select' && (
                <select
                  value={responses[question.id] || ''}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  className={`w-full rounded-md shadow-sm transition-colors
                    ${errors[question.id] 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }
                  `}
                >
                  <option value="">Sélectionnez une option</option>
                  {question.options?.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              )}
              
              {question.type === 'number' && (
                <input
                  type="number"
                  value={responses[question.id] || ''}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  placeholder={question.placeholder}
                  min={question.min}
                  max={question.max}
                  className={`w-full rounded-md shadow-sm transition-colors
                    ${errors[question.id] 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }
                  `}
                />
              )}
              
              {errors[question.id] && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center space-x-2 text-red-600 text-sm"
                >
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  <span>{errors[question.id]}</span>
                </motion.div>
              )}
              
              {responses[question.id] && !errors[question.id] && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center space-x-2 text-green-600 text-sm"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Réponse enregistrée</span>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Navigation inférieure */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <div className="flex justify-between items-center">
          <button
            onClick={() => goToStep(currentStep - 1)}
            disabled={currentStep === 0}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Précédent
          </button>
          
          <div className="flex items-center space-x-3">
            {isSectionComplete(currentStep) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center text-green-600 text-sm"
              >
                <CheckCircleIcon className="w-4 h-4 mr-1" />
                Section complète
              </div>
            )}
            
            {isLastStep && allSectionsComplete ? (
              <motion.button
                onClick={handleGenerateDocument}
                disabled={isGenerating}
                className="flex items-center px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white font-medium rounded-md hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 mr-2"
                    >
                      ⚡
                    </motion.div>
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <DocumentTextIcon className="w-4 h-4 mr-2" />
                    Générer le dossier VAE
                  </>
                )}
              </motion.button>
            ) : (
              <button
                onClick={() => goToStep(currentStep + 1)}
                disabled={currentStep === VAE_SECTIONS.length - 1}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Suivant
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>
        </div>
        
        {/* Indicateurs de section */}
        <div className="mt-4 flex justify-center space-x-2">
          {VAE_SECTIONS.map((_, index) => (
            <motion.div
              key={index}
              className={`w-3 h-3 rounded-full transition-colors cursor-pointer
                ${currentStep === index 
                  ? 'bg-blue-500' 
                  : isSectionComplete(index) 
                    ? 'bg-green-500' 
                    : 'bg-gray-300'
                }
              `}
              onClick={() => goToStep(index)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

VAEWizard.propTypes = {
  onComplete: PropTypes.func.isRequired
};

export default VAEWizard; 