import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from './LoadingSpinner';
import '../styles/lexia-design-system.css';

function VAEEditor({ initialDocument, userId }) {
  const [content, setContent] = useState(initialDocument || '');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const editorRef = useRef(null);
  const toast = useToast();

  // Calculer le nombre de mots
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [content]);

  // Sauvegarde automatique toutes les 30 secondes
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (content && content !== initialDocument) {
        handleSave(true);
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [content, initialDocument]);

  // Gérer la sélection de texte
  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString();
    if (text) {
      setSelectedText(text);
    }
  };

  // Sauvegarder le document
  const handleSave = async (isAutoSave = false) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/documents/${userId}/vae`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) throw new Error('Erreur lors de la sauvegarde');

      setLastSaved(new Date());
      if (!isAutoSave) {
        toast.success('Document sauvegardé avec succès');
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // Exporter en DOCX
  const handleExportDocx = async () => {
    try {
      const response = await fetch(`/api/documents/${userId}/vae/export/docx`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) throw new Error('Erreur lors de l\'export');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Dossier_VAE_${new Date().toISOString().split('T')[0]}.docx`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Document exporté en DOCX');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
      console.error(error);
    }
  };

  // Exporter en PDF
  const handleExportPdf = async () => {
    try {
      const response = await fetch(`/api/documents/${userId}/vae/export/pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) throw new Error('Erreur lors de l\'export');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Dossier_VAE_${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Document exporté en PDF');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
      console.error(error);
    }
  };

  // Améliorer le texte sélectionné avec l'IA
  const handleImproveText = async () => {
    if (!selectedText) {
      toast.error('Veuillez sélectionner du texte à améliorer');
      return;
    }

    try {
      const response = await fetch('/api/ai/improve-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ text: selectedText })
      });

      if (!response.ok) throw new Error('Erreur lors de l\'amélioration');

      const data = await response.json();
      const improvedText = data.improvedText;

      // Remplacer le texte sélectionné
      const newContent = content.replace(selectedText, improvedText);
      setContent(newContent);
      setSelectedText('');
      
      toast.success('Texte amélioré avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'amélioration du texte');
      console.error(error);
    }
  };

  return (
    <div className="vae-editor-container">
      {/* Barre d'outils */}
      <div className="lexia-card mb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <h2 className="lexia-heading-2">Éditeur de dossier VAE</h2>
            <div className="flex items-center gap-2">
              {isSaving ? (
                <span className="lexia-caption flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Sauvegarde...
                </span>
              ) : lastSaved ? (
                <span className="lexia-caption text-green-600">
                  ✓ Sauvegardé à {lastSaved.toLocaleTimeString()}
                </span>
              ) : null}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Actions sur le texte sélectionné */}
            {selectedText && (
              <button
                onClick={handleImproveText}
                className="lexia-btn lexia-btn-secondary"
                title="Améliorer le texte sélectionné avec l'IA"
              >
                ✨ Améliorer
              </button>
            )}
            
            {/* Boutons d'export */}
            <button
              onClick={() => handleSave(false)}
              className="lexia-btn lexia-btn-secondary"
              disabled={isSaving}
            >
              💾 Sauvegarder
            </button>
            
            <div className="relative group">
              <button className="lexia-btn lexia-btn-primary">
                📥 Exporter
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <button
                  onClick={handleExportDocx}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-lg"
                >
                  📄 Format Word (.docx)
                </button>
                <button
                  onClick={handleExportPdf}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-lg"
                >
                  📑 Format PDF
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Statistiques */}
        <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
          <span>📝 {wordCount} mots</span>
          <span>📖 ~{Math.ceil(wordCount / 250)} pages</span>
          <span>⏱️ ~{Math.ceil(wordCount / 200)} min de lecture</span>
        </div>
      </div>

      {/* Zone d'édition */}
      <div className="lexia-card">
        <div className="editor-wrapper">
          {/* Barre d'outils de formatage */}
          <div className="editor-toolbar flex items-center gap-2 mb-4 pb-4 border-b">
            <button
              onClick={() => document.execCommand('bold')}
              className="p-2 rounded hover:bg-gray-100"
              title="Gras"
            >
              <strong>B</strong>
            </button>
            <button
              onClick={() => document.execCommand('italic')}
              className="p-2 rounded hover:bg-gray-100"
              title="Italique"
            >
              <em>I</em>
            </button>
            <button
              onClick={() => document.execCommand('underline')}
              className="p-2 rounded hover:bg-gray-100"
              title="Souligné"
            >
              <u>U</u>
            </button>
            <span className="w-px h-6 bg-gray-300 mx-2" />
            <button
              onClick={() => document.execCommand('insertUnorderedList')}
              className="p-2 rounded hover:bg-gray-100"
              title="Liste à puces"
            >
              • Liste
            </button>
            <button
              onClick={() => document.execCommand('insertOrderedList')}
              className="p-2 rounded hover:bg-gray-100"
              title="Liste numérotée"
            >
              1. Liste
            </button>
          </div>
          
          {/* Éditeur de texte */}
          <div
            ref={editorRef}
            contentEditable
            className="min-h-[600px] p-4 focus:outline-none"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '16px',
              lineHeight: '1.8',
              color: 'var(--lexia-gray-700)'
            }}
            onInput={(e) => setContent(e.target.innerHTML)}
            onMouseUp={handleTextSelection}
            onKeyUp={handleTextSelection}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
        
        {/* Conseils d'édition */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Conseils d'édition</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Relisez attentivement chaque section pour vérifier la cohérence</li>
            <li>• Ajoutez des exemples concrets pour illustrer vos compétences</li>
            <li>• Utilisez un vocabulaire professionnel adapté au DEES</li>
            <li>• Sélectionnez du texte et cliquez sur "Améliorer" pour l'optimiser avec l'IA</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

VAEEditor.propTypes = {
  initialDocument: PropTypes.string,
  userId: PropTypes.string.isRequired
};

export default VAEEditor; 