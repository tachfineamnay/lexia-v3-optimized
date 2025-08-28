import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AcademicCapIcon,
  DocumentTextIcon,
  SparklesIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
  RocketLaunchIcon,
  PencilIcon,
  CheckCircleIcon,
  LightBulbIcon,
  ClipboardDocumentIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import VAEWizard from '../components/VAEWizard';
import VAEEditor from '../components/VAEEditor';
import LoadingSpinner from '../components/LoadingSpinner';

function VAECreation() {
  const [currentView, setCurrentView] = useState('welcome'); // welcome, wizard, editor
  const [generatedDocument, setGeneratedDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Vérifier si l'utilisateur a un dossier VAE en cours
  useEffect(() => {
    checkExistingDocument();
  }, []);

  const checkExistingDocument = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/documents/${user.id}/vae`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.document) {
          setGeneratedDocument(data.document);
          setCurrentView('editor');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer la complétion du wizard
  const handleWizardComplete = (document) => {
    setGeneratedDocument(document);
    setCurrentView('editor');
    toast.success('Votre dossier VAE a été généré avec succès !');
  };

  // Commencer une nouvelle création
  const startNewCreation = () => {
    if (generatedDocument) {
      if (window.confirm('Vous avez déjà un dossier en cours. Voulez-vous vraiment recommencer ?')) {
        setGeneratedDocument(null);
        setCurrentView('wizard');
      }
    } else {
      setCurrentView('wizard');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <LoadingSpinner size="lg" color="primary" text="Chargement de votre dossier VAE..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Page d'accueil */}
        <AnimatePresence>
          {currentView === 'welcome' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
              >
                <div className="flex items-center gap-3 mb-4 justify-center">
                  <AcademicCapIcon className="h-10 w-10 text-purple-400" />
                  <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Lexia V4
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                  Créez votre dossier VAE
                  <span className="block text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                    avec l'IA
                  </span>
                </h1>
                <p className="text-gray-300 text-xl max-w-3xl mx-auto leading-relaxed">
                  Notre assistant intelligent vous guide pas à pas dans la création de votre 
                  dossier de Validation des Acquis de l'Expérience pour le DEES.
                </p>
              </motion.div>

              {/* Avantages */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto"
              >
                {[
                  {
                    icon: CheckCircleIcon,
                    title: "Guidage personnalisé",
                    description: "Des questions adaptées avec des conseils pour chaque étape",
                    gradient: "from-blue-500 to-cyan-500"
                  },
                  {
                    icon: SparklesIcon,
                    title: "IA avancée",
                    description: "Génération intelligente et amélioration continue de votre texte",
                    gradient: "from-purple-500 to-pink-500"
                  },
                  {
                    icon: ClipboardDocumentIcon,
                    title: "Export professionnel",
                    description: "Téléchargez votre dossier en format Word ou PDF",
                    gradient: "from-green-500 to-emerald-500"
                  }
                ].map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300 group"
                    >
                      <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                      <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Comment ça marche */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-12 max-w-4xl mx-auto hover:border-white/20 transition-all duration-300"
              >
                <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3 justify-center">
                  <LightBulbIcon className="h-7 w-7 text-purple-400" />
                  Comment ça marche ?
                </h3>
                <div className="space-y-6">
                  {[
                    {
                      step: "1",
                      title: "Répondez aux questions",
                      description: "26 questions organisées en 6 sections thématiques",
                      color: "from-blue-500 to-cyan-500"
                    },
                    {
                      step: "2",
                      title: "L'IA génère votre dossier",
                      description: "Un document structuré et professionnel basé sur vos réponses",
                      color: "from-purple-500 to-pink-500"
                    },
                    {
                      step: "3",
                      title: "Personnalisez et exportez",
                      description: "Modifiez, améliorez et téléchargez votre dossier final",
                      color: "from-green-500 to-emerald-500"
                    }
                  ].map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-start gap-4 text-left"
                    >
                      <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-r ${step.color} rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-lg`}>
                        {step.step}
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-lg font-bold text-white mb-2">{step.title}</h4>
                        <p className="text-gray-300">{step.description}</p>
                      </div>
                      {index < 2 && (
                        <motion.div
                          animate={{ y: [0, 5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute right-8 mt-16"
                        >
                          <ArrowDownIcon className="h-5 w-5 text-purple-400" />
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              >
                {generatedDocument ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setCurrentView('editor')}
                      className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                    >
                      <PencilIcon className="h-6 w-6" />
                      Continuer mon dossier
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={startNewCreation}
                      className="inline-flex items-center gap-3 bg-white/10 border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all"
                    >
                      <ArrowPathIcon className="h-6 w-6" />
                      Recommencer
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={startNewCreation}
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-12 py-5 rounded-xl font-bold text-xl hover:shadow-xl hover:shadow-purple-500/25 transition-all"
                  >
                    <RocketLaunchIcon className="h-7 w-7" />
                    Commencer maintenant
                  </motion.button>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wizard de création */}
        <AnimatePresence>
          {currentView === 'wizard' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <motion.button
                whileHover={{ scale: 1.02, x: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentView('welcome')}
                className="mb-6 flex items-center gap-2 text-gray-300 hover:text-white transition-all group"
              >
                <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                Retour
              </motion.button>
              <VAEWizard onComplete={handleWizardComplete} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Éditeur de document */}
        <AnimatePresence>
          {currentView === 'editor' && generatedDocument && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <motion.button
                whileHover={{ scale: 1.02, x: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentView('welcome')}
                className="mb-6 flex items-center gap-2 text-gray-300 hover:text-white transition-all group"
              >
                <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                Retour au tableau de bord
              </motion.button>
              <VAEEditor 
                initialDocument={generatedDocument} 
                userId={user.id}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default VAECreation; 