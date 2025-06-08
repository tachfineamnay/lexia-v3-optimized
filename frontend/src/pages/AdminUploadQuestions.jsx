import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function AdminUploadQuestions() {
  const [questionSets, setQuestionSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'manage'
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== 'admin') {
      navigate('/');
      return;
    }
    
    // Fetch question sets
    fetchQuestionSets();
  }, [user, navigate]);

  const fetchQuestionSets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/questions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des questionnaires');
      }
      
      const data = await response.json();
      setQuestionSets(data.questionSets || []);
    } catch (err) {
      console.error('Error fetching question sets:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setSelectedFile(file);
    setPreviewData(null);
    setError(null);
    setSuccess(null);
    
    // Preview the file content
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        setPreviewData(jsonData);
      } catch (err) {
        console.error('Error parsing JSON:', err);
        setError('Le fichier sélectionné n\'est pas un JSON valide');
        setSelectedFile(null);
      }
    };
    reader.readAsText(file);
  };

  const validateQuestionSet = (data) => {
    // Check if required fields are present
    if (!data.title) return 'Le titre du questionnaire est requis';
    if (!data.sections || !Array.isArray(data.sections) || data.sections.length === 0) {
      return 'Le questionnaire doit contenir au moins une section';
    }
    
    // Check each section
    for (const section of data.sections) {
      if (!section.title) return 'Chaque section doit avoir un titre';
      if (!section.questions || !Array.isArray(section.questions) || section.questions.length === 0) {
        return `La section "${section.title}" doit contenir au moins une question`;
      }
      
      // Check each question
      for (const question of section.questions) {
        if (!question.questionId) return 'Chaque question doit avoir un identifiant unique';
        if (!question.text) return 'Chaque question doit avoir un texte';
        if (!question.type) return 'Chaque question doit avoir un type';
        
        // Check options for radio and select questions
        if ((question.type === 'radio' || question.type === 'select') && 
            (!question.options || !Array.isArray(question.options) || question.options.length === 0)) {
          return `La question "${question.text}" doit contenir des options`;
        }
      }
    }
    
    return null; // No errors
  };

  const handleUpload = async () => {
    if (!selectedFile || !previewData) {
      setError('Veuillez sélectionner un fichier JSON valide');
      return;
    }
    
    // Validate the question set
    const validationError = validateQuestionSet(previewData);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    try {
      setIsUploading(true);
      setError(null);
      setSuccess(null);
      
      // Create form data
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du téléversement du questionnaire');
      }
      
      const data = await response.json();
      
      setSuccess('Questionnaire téléversé avec succès');
      setSelectedFile(null);
      setPreviewData(null);
      
      // Refresh question sets
      fetchQuestionSets();
      
      // Switch to manage tab
      setActiveTab('manage');
    } catch (err) {
      console.error('Error uploading question set:', err);
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleActivate = async (id) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const response = await fetch(`/api/questions/${id}/activate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'activation du questionnaire');
      }
      
      setSuccess('Questionnaire activé avec succès');
      
      // Refresh question sets
      fetchQuestionSets();
    } catch (err) {
      console.error('Error activating question set:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce questionnaire ?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const response = await fetch(`/api/questions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du questionnaire');
      }
      
      setSuccess('Questionnaire supprimé avec succès');
      
      // Refresh question sets
      fetchQuestionSets();
    } catch (err) {
      console.error('Error deleting question set:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (user && user.role !== 'admin') {
    return <div>Accès refusé. Privilèges d'administrateur requis.</div>;
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestion des questionnaires</h1>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('upload')}
            className={`${
              activeTab === 'upload'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Téléverser un questionnaire
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`${
              activeTab === 'manage'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Gérer les questionnaires
          </button>
        </nav>
      </div>
      
      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6" role="alert">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6" role="alert">
          <p className="text-green-700">{success}</p>
        </div>
      )}
      
      {/* Upload tab */}
      {activeTab === 'upload' && (
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Téléverser un nouveau questionnaire</h2>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-2">
              Téléversez un fichier JSON contenant la structure du questionnaire. Le fichier doit respecter le format attendu.
            </p>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4 hover:border-blue-500 transition-colors">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileChange}
                accept=".json"
                disabled={isUploading}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer"
              >
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-medium text-blue-600 hover:text-blue-500">
                    Cliquez pour sélectionner un fichier
                  </span>{' '}
                  ou glissez-déposez
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Fichier JSON uniquement
                </p>
              </label>
            </div>
            
            {selectedFile && (
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <svg className="h-6 w-6 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{selectedFile.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}
          </div>
          
          {previewData && (
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-900 mb-2">Aperçu du questionnaire</h3>
              <div className="bg-gray-50 p-4 rounded-md max-h-60 overflow-y-auto">
                <p className="font-medium">{previewData.title}</p>
                <p className="text-gray-500 text-sm mb-2">{previewData.description || 'Aucune description'}</p>
                
                <ul className="space-y-2">
                  {previewData.sections && previewData.sections.map((section, index) => (
                    <li key={index} className="border-l-2 border-blue-300 pl-3">
                      <p className="font-medium">{section.title}</p>
                      <p className="text-xs text-gray-500 mb-1">{section.questions?.length || 0} question(s)</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading || !selectedFile}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Téléversement...
                </>
              ) : (
                'Téléverser le questionnaire'
              )}
            </button>
          </div>
        </div>
      )}
      
      {/* Manage tab */}
      {activeTab === 'manage' && (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Questionnaires disponibles</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Liste des questionnaires disponibles dans le système
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : questionSets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun questionnaire disponible</p>
              <button
                onClick={() => setActiveTab('upload')}
                className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Téléverser un questionnaire
              </button>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Titre
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sections
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Questions
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {questionSets.map((questionSet) => {
                  // Count total questions
                  let totalQuestions = 0;
                  if (questionSet.sections) {
                    questionSet.sections.forEach(section => {
                      totalQuestions += section.questions?.length || 0;
                    });
                  }
                  
                  return (
                    <tr key={questionSet._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{questionSet.title}</div>
                        <div className="text-sm text-gray-500">{questionSet.description || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {questionSet.sections?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {totalQuestions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          questionSet.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {questionSet.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(questionSet.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleActivate(questionSet._id)}
                            disabled={questionSet.isActive}
                            className={`text-xs px-2 py-1 rounded ${
                              questionSet.isActive 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                          >
                            Activer
                          </button>
                          <button
                            onClick={() => handleDelete(questionSet._id)}
                            className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminUploadQuestions; 