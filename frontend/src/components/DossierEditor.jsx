import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import VaeResponseBlock from './VaeResponseBlock';
import ExportDocument from './ExportDocument';
import { useToast } from '../hooks/useToast';

function DossierEditor({
  sections = [],
  onSave,
  onRegenerate,
  onExport,
  isSaving = false,
  isExporting = false,
  isRegenerating = false,
  regeneratingSection = null,
  error = null,
  dossier = null,
  userProfile = {}
}) {
  const [editedSections, setEditedSections] = useState({});
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [newSection, setNewSection] = useState({ title: '', content: '' });
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [localExporting, setLocalExporting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { showToast } = useToast();

  // Initialize edited sections when component mounts or sections change
  useEffect(() => {
    const initialSections = {};
    sections.forEach(section => {
      initialSections[section.sectionId] = {
        title: section.title,
        content: section.content,
        originalContent: section.content // Store original content for comparison
      };
    });
    setEditedSections(initialSections);
  }, [sections]);

  const handleEdit = (sectionId) => {
    if (hasUnsavedChanges) {
      if (window.confirm('Vous avez des modifications non sauvegardées. Voulez-vous vraiment changer de section ?')) {
        setEditingSectionId(sectionId);
        setHasUnsavedChanges(false);
      }
    } else {
      setEditingSectionId(sectionId);
    }
  };

  const handleContentChange = (sectionId, content) => {
    setEditedSections(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        content
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleTitleChange = (sectionId, title) => {
    setEditedSections(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        title
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleCancelEdit = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('Voulez-vous vraiment annuler les modifications ?')) {
        // Reset to original content
        const initialSections = {};
        sections.forEach(section => {
          initialSections[section.sectionId] = {
            title: section.title,
            content: section.content,
            originalContent: section.content
          };
        });
        setEditedSections(initialSections);
        setEditingSectionId(null);
        setHasUnsavedChanges(false);
        showToast('Modifications annulées', 'info');
      }
    } else {
      setEditingSectionId(null);
    }
  };

  const handleSaveEdit = async () => {
    try {
      // Convert edited sections object back to array format expected by parent
      const updatedSections = Object.entries(editedSections).map(([sectionId, section]) => ({
        sectionId,
        title: section.title,
        content: section.content
      }));
      
      await onSave(updatedSections);
      setEditingSectionId(null);
      setHasUnsavedChanges(false);
      showToast('Modifications sauvegardées', 'success');
    } catch (error) {
      showToast('Erreur lors de la sauvegarde', 'error');
    }
  };

  const handleRegenerateSection = async (sectionId) => {
    try {
      await onRegenerate(sectionId);
      showToast('Section régénérée avec succès', 'success');
    } catch (error) {
      showToast('Erreur lors de la régénération', 'error');
    }
  };

  const handleDeleteSection = (sectionId) => {
    if (confirmDelete === sectionId) {
      // Perform actual deletion
      const newEditedSections = { ...editedSections };
      delete newEditedSections[sectionId];
      setEditedSections(newEditedSections);
      setConfirmDelete(null);
      
      // Save changes
      const updatedSections = Object.entries(newEditedSections).map(([id, section]) => ({
        sectionId: id,
        title: section.title,
        content: section.content
      }));
      
      onSave(updatedSections);
      showToast('Section supprimée', 'success');
    } else {
      // Ask for confirmation
      setConfirmDelete(sectionId);
      // Auto-reset confirm state after 3 seconds
      setTimeout(() => {
        setConfirmDelete(null);
      }, 3000);
    }
  };

  const handleAddSection = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('Vous avez des modifications non sauvegardées. Voulez-vous vraiment ajouter une nouvelle section ?')) {
        setIsAddingSection(true);
        setHasUnsavedChanges(false);
      }
    } else {
      setIsAddingSection(true);
    }
  };

  const handleCancelAddSection = () => {
    setIsAddingSection(false);
    setNewSection({ title: '', content: '' });
  };

  const handleSaveNewSection = () => {
    if (!newSection.title.trim()) {
      showToast('Veuillez saisir un titre pour la nouvelle section', 'error');
      return;
    }
    
    // Generate a new unique section ID
    const newSectionId = `section-${Date.now()}`;
    
    // Add to edited sections
    setEditedSections(prev => ({
      ...prev,
      [newSectionId]: {
        title: newSection.title,
        content: newSection.content,
        originalContent: newSection.content
      }
    }));
    
    // Save changes
    const updatedSections = [
      ...Object.entries(editedSections).map(([id, section]) => ({
        sectionId: id,
        title: section.title,
        content: section.content
      })),
      {
        sectionId: newSectionId,
        title: newSection.title,
        content: newSection.content
      }
    ];
    
    onSave(updatedSections);
    showToast('Nouvelle section ajoutée', 'success');
    
    // Reset state
    setNewSection({ title: '', content: '' });
    setIsAddingSection(false);
  };

  const handleExportStart = (format) => {
    setLocalExporting(true);
    if (onExport) {
      onExport(format);
    }
  };

  const handleExportEnd = (format) => {
    setLocalExporting(false);
  };

  // Prepare dossier object for export if not provided directly
  const exportDossier = dossier || { sections };

  return (
    <div className="space-y-6">
      {/* Display any errors */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
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
      
      {/* Control buttons */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={handleAddSection}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isAddingSection || editingSectionId !== null}
        >
          <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Ajouter une section
        </button>
        
        {/* Export buttons replaced with ExportDocument component */}
        <ExportDocument 
          dossier={exportDossier}
          userProfile={userProfile}
          onExportStart={handleExportStart}
          onExportEnd={handleExportEnd}
        />
      </div>
      
      {/* Adding new section */}
      {isAddingSection && (
        <div className="border border-blue-300 rounded-lg overflow-hidden shadow-sm bg-blue-50">
          <div className="bg-blue-100 px-4 py-3 border-b border-blue-200">
            <input
              type="text"
              value={newSection.title}
              onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
              placeholder="Titre de la section"
              className="w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="p-4">
            <textarea
              value={newSection.content}
              onChange={(e) => setNewSection({ ...newSection, content: e.target.value })}
              rows={6}
              placeholder="Contenu de la section..."
              className="w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancelAddSection}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveNewSection}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Existing sections */}
      {sections.map((section) => (
        <div 
          key={section.sectionId} 
          className={`border rounded-lg overflow-hidden shadow-sm transition-all duration-200 ${
            editingSectionId === section.sectionId 
              ? 'border-blue-500 ring-2 ring-blue-500' 
              : 'border-gray-200'
          }`}
        >
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            {editingSectionId === section.sectionId ? (
              <input
                type="text"
                value={editedSections[section.sectionId]?.title || ''}
                onChange={(e) => handleTitleChange(section.sectionId, e.target.value)}
                className="px-3 py-1 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 w-full mr-2"
              />
            ) : (
              <h2 className="text-lg font-medium text-gray-900">{section.title}</h2>
            )}
            
            <div className="flex space-x-2">
              {editingSectionId === section.sectionId ? (
                <>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={isSaving}
                    className="px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
                  >
                    {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleEdit(section.sectionId)}
                    className="px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    disabled={editingSectionId !== null}
                  >
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRegenerateSection(section.sectionId)}
                    className="px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    disabled={editingSectionId !== null || isRegenerating}
                  >
                    {isRegenerating && regeneratingSection === section.sectionId ? (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 100-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSection(section.sectionId)}
                    className={`px-3 py-1 border text-xs font-medium rounded-md ${
                      confirmDelete === section.sectionId 
                      ? 'bg-red-600 text-white border-transparent hover:bg-red-700' 
                      : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                    disabled={editingSectionId !== null}
                  >
                    {confirmDelete === section.sectionId ? (
                      'Confirmer'
                    ) : (
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="p-4">
            {editingSectionId === section.sectionId ? (
              <textarea
                value={editedSections[section.sectionId]?.content || ''}
                onChange={(e) => handleContentChange(section.sectionId, e.target.value)}
                rows={10}
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <VaeResponseBlock
                content={section.content}
                isLoading={isRegenerating && regeneratingSection === section.sectionId}
                error={error && regeneratingSection === section.sectionId ? error : null}
                showControls={false}
              />
            )}
          </div>
        </div>
      ))}

      {/* Unsaved changes warning */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-4 right-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md shadow-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Vous avez des modifications non sauvegardées
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

DossierEditor.propTypes = {
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      sectionId: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired
    })
  ),
  onSave: PropTypes.func.isRequired,
  onRegenerate: PropTypes.func.isRequired,
  onExport: PropTypes.func,
  isSaving: PropTypes.bool,
  isExporting: PropTypes.bool,
  isRegenerating: PropTypes.bool,
  regeneratingSection: PropTypes.string,
  error: PropTypes.string,
  dossier: PropTypes.object,
  userProfile: PropTypes.object
};

export default DossierEditor; 