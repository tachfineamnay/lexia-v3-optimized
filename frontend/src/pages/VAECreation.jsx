import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import VAEWizard from '../components/VAEWizard';
import VAEEditor from '../components/VAEEditor';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/lexia-design-system.css';

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
    return <LoadingSpinner fullScreen text="Chargement de votre dossier VAE..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page d'accueil */}
        {currentView === 'welcome' && (
          <div className="text-center py-12 fade-in">
            <div className="lexia-card max-w-3xl mx-auto">
              <div className="mb-8">
                <h1 className="lexia-heading-1 mb-4">
                  Créez votre dossier VAE avec Lexia IA
                </h1>
                <p className="lexia-body text-lg">
                  Notre assistant intelligent vous guide pas à pas dans la création de votre 
                  dossier de Validation des Acquis de l'Expérience pour le DEES.
                </p>
              </div>

              {/* Avantages */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-4xl mb-3">🎯</div>
                  <h3 className="font-semibold mb-2">Guidage personnalisé</h3>
                  <p className="text-sm text-gray-600">
                    Des questions adaptées avec des conseils pour chaque étape
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">✨</div>
                  <h3 className="font-semibold mb-2">IA avancée</h3>
                  <p className="text-sm text-gray-600">
                    Génération intelligente et amélioration continue de votre texte
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">📄</div>
                  <h3 className="font-semibold mb-2">Export professionnel</h3>
                  <p className="text-sm text-gray-600">
                    Téléchargez votre dossier en format Word ou PDF
                  </p>
                </div>
              </div>

              {/* Comment ça marche */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="font-semibold mb-4">Comment ça marche ?</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                      1
                    </span>
                    <div>
                      <p className="font-medium">Répondez aux questions</p>
                      <p className="text-sm text-gray-600">
                        26 questions organisées en 6 sections thématiques
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                      2
                    </span>
                    <div>
                      <p className="font-medium">L'IA génère votre dossier</p>
                      <p className="text-sm text-gray-600">
                        Un document structuré et professionnel basé sur vos réponses
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                      3
                    </span>
                    <div>
                      <p className="font-medium">Personnalisez et exportez</p>
                      <p className="text-sm text-gray-600">
                        Modifiez, améliorez et téléchargez votre dossier final
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {generatedDocument ? (
                  <>
                    <button
                      onClick={() => setCurrentView('editor')}
                      className="lexia-btn lexia-btn-primary"
                    >
                      📝 Continuer mon dossier
                    </button>
                    <button
                      onClick={startNewCreation}
                      className="lexia-btn lexia-btn-secondary"
                    >
                      🔄 Recommencer
                    </button>
                  </>
                ) : (
                  <button
                    onClick={startNewCreation}
                    className="lexia-btn lexia-btn-primary text-lg px-8 py-3"
                  >
                    🚀 Commencer maintenant
                  </button>
                )}
              </div>
            </div>


          </div>
        )}

        {/* Wizard de création */}
        {currentView === 'wizard' && (
          <div className="fade-in">
            <button
              onClick={() => setCurrentView('welcome')}
              className="mb-4 text-gray-600 hover:text-gray-800 flex items-center gap-2"
            >
              ← Retour
            </button>
            <VAEWizard onComplete={handleWizardComplete} />
          </div>
        )}

        {/* Éditeur de document */}
        {currentView === 'editor' && generatedDocument && (
          <div className="fade-in">
            <button
              onClick={() => setCurrentView('welcome')}
              className="mb-4 text-gray-600 hover:text-gray-800 flex items-center gap-2"
            >
              ← Retour au tableau de bord
            </button>
            <VAEEditor 
              initialDocument={generatedDocument} 
              userId={user.id}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default VAECreation; 