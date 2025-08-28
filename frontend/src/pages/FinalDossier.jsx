import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AcademicCapIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import aiService from '../api/aiService';
import VaeResponseBlock from '../components/VaeResponseBlock';
import DossierEditor from '../components/DossierEditor';

function FinalDossier() {
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerationSection, setRegenerationSection] = useState(null);
  const [success, setSuccess] = useState(null);
  const [exportStatus, setExportStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDossier = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/dossier/latest', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          // If there's no dossier yet, we need to generate one
          if (response.status === 404) {
            await generateDossier();
            return;
          }
          
          throw new Error('Erreur lors de la récupération du dossier');
        }
        
        const data = await response.json();
        setDossier(data.dossier);
        
        // Initialize edited content with the current content
        const initialEditedContent = {};
        if (data.dossier && data.dossier.sections) {
          data.dossier.sections.forEach((section) => {
            initialEditedContent[section.sectionId] = section.content;
          });
        }
        setEditedContent(initialEditedContent);
      } catch (err) {
        console.error('Error fetching dossier:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDossier();
  }, []);

  const generateDossier = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the API to generate a new dossier
      const response = await fetch('/api/dossier/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la génération du dossier');
      }
      
      const data = await response.json();
      setDossier(data.dossier);
      
      // Initialize edited content with the current content
      const initialEditedContent = {};
      if (data.dossier && data.dossier.sections) {
        data.dossier.sections.forEach((section) => {
          initialEditedContent[section.sectionId] = section.content;
        });
      }
      setEditedContent(initialEditedContent);
    } catch (err) {
      console.error('Error generating dossier:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (sectionId, content) => {
    setEditedContent({
      ...editedContent,
      [sectionId]: content
    });
  };

  const handleSave = async (updatedSections) => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      
      const response = await fetch(`/api/dossier/${dossier._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sections: updatedSections
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde du dossier');
      }
      
      const data = await response.json();
      setDossier(data.dossier);
      setSuccess('Dossier sauvegardé avec succès');
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving dossier:', err);
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerateSection = async (sectionId) => {
    try {
      setRegenerationSection(sectionId);
      setIsRegenerating(true);
      setError(null);
      setSuccess(null);
      
      // Find the section to regenerate
      const sectionToRegenerate = dossier.sections.find(s => s.sectionId === sectionId);
      if (!sectionToRegenerate) {
        throw new Error('Section introuvable');
      }
      
      // Get user responses related to this section
      const userResponses = dossier.userResponses || {};
      
      // Call the AI service to regenerate the section
      const result = await aiService.generateVaeSection({
        sectionName: sectionToRegenerate.title,
        userResponses,
        documents: dossier.documents || []
      });
      
      if (result && result.content) {
        // Update dossier and edited content with the new section
        const updatedDossier = { ...dossier };
        const sectionIndex = updatedDossier.sections.findIndex(s => s.sectionId === sectionId);
        
        if (sectionIndex !== -1) {
          updatedDossier.sections[sectionIndex].content = result.content;
          setDossier(updatedDossier);
          
          setEditedContent({
            ...editedContent,
            [sectionId]: result.content
          });
          
          // Also save to the backend
          await fetch(`/api/dossier/${dossier._id}/section/${sectionId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              content: result.content
            })
          });
        }
        
        setSuccess('Section régénérée avec succès');
      } else {
        throw new Error('Erreur lors de la régénération de la section');
      }
    } catch (err) {
      console.error('Error regenerating section:', err);
      setError(err.message);
    } finally {
      setIsRegenerating(false);
      setRegenerationSection(null);
    }
  };

  const handleExport = (format) => {
    setExportStatus('loading');
    
    // This is just to update the UI state - the actual export is now handled by the ExportDocument component
    setTimeout(() => {
      setExportStatus('idle');
    }, 1000);
  };

  // Prepare user profile for export
  const userProfile = {
    firstName: user?.firstName || user?.displayName?.split(' ')[0] || '',
    lastName: user?.lastName || user?.displayName?.split(' ').slice(1).join(' ') || '',
    email: user?.email || ''
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="flex items-center gap-3 mb-6 justify-center">
            <AcademicCapIcon className="h-10 w-10 text-purple-400" />
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Lexia V4
            </span>
          </div>
          <LoadingSpinner size="lg" color="primary" />
          <p className="text-gray-300 mt-4 text-lg">Génération de votre dossier VAE...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="flex items-center gap-3 mb-6 justify-center">
            <AcademicCapIcon className="h-10 w-10 text-purple-400" />
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Lexia V4
            </span>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 backdrop-blur-xl">
            <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-400 mb-4">Erreur</h2>
            <p className="text-red-300 mb-6">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Réessayer
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!dossier) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="flex items-center gap-3 mb-6 justify-center">
            <AcademicCapIcon className="h-10 w-10 text-purple-400" />
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Lexia V4
            </span>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-8 backdrop-blur-xl">
            <DocumentTextIcon className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Aucun dossier disponible</h2>
            <p className="text-yellow-300 mb-6">Aucun dossier n'a été trouvé ou généré.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={generateDossier}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
            >
              <SparklesIcon className="h-5 w-5" />
              Générer un dossier
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <AcademicCapIcon className="h-10 w-10 text-purple-400" />
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Lexia V4
            </span>
          </div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                Dossier VAE
              </h1>
              <p className="text-gray-300 text-xl">
                Votre dossier de validation des acquis de l'expérience complet et personnalisé
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link
                to="/question-flow"
                className="inline-flex items-center gap-3 px-6 py-3 border border-white/20 text-white bg-white/5 hover:bg-white/10 rounded-xl font-semibold transition-all backdrop-blur-xl"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                Retour aux questions
              </Link>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Progress indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                  <CheckCircleIcon className="h-5 w-5" />
                </div>
                <span className="ml-3 text-green-400 font-semibold">Documents</span>
              </motion.div>
              
              <div className="flex-grow mx-4 h-2 bg-white/10 rounded-full">
                <div className="h-full bg-green-500 w-full rounded-full" />
              </div>
              
              <motion.div 
                className="flex items-center"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                  <CheckCircleIcon className="h-5 w-5" />
                </div>
                <span className="ml-3 text-green-400 font-semibold">Questions</span>
              </motion.div>
              
              <div className="flex-grow mx-4 h-2 bg-white/10 rounded-full">
                <div className="h-full bg-green-500 w-full rounded-full" />
              </div>
              
              <motion.div 
                className="flex items-center"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                  3
                </div>
                <span className="ml-3 text-white font-semibold">Dossier</span>
              </motion.div>
            </div>
          </div>
        </motion.div>
        
        {/* Alerts */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-2xl flex items-center gap-3 backdrop-blur-xl"
            >
              <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">{success}</span>
            </motion.div>
          )}
          
          {error && !loading && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-center gap-3 backdrop-blur-xl"
            >
              <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Dossier Editor */}
        {dossier && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <DossierEditor 
              sections={dossier.sections || []}
              onSave={handleSave}
              onRegenerate={handleRegenerateSection}
              onExport={handleExport}
              isSaving={isSaving}
              isExporting={exportStatus === 'loading'}
              isRegenerating={isRegenerating}
              regeneratingSection={regenerationSection}
              error={error}
              dossier={dossier}
              userProfile={userProfile}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default FinalDossier; 