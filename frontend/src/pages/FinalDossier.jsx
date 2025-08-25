import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
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
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <h2 className="text-lg font-semibold text-red-800">Erreur</h2>
        <p className="text-red-700">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!dossier) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md">
        <h2 className="text-lg font-semibold text-yellow-800">Aucun dossier disponible</h2>
        <p className="text-yellow-700">Aucun dossier n'a été trouvé ou généré.</p>
        <button
          onClick={generateDossier}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Générer un dossier
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Dossier VAE
        </h1>
        <div className="flex space-x-3">
          <Link
            to="/question-flow"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Retour aux questions
          </Link>
        </div>
      </div>
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}
      
      {error && !loading && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {dossier && (
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
      )}
    </div>
  );
}

export default FinalDossier; 