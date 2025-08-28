import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AcademicCapIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
  TrashIcon,
  PlayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  FolderIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

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
            <h2 className="text-2xl font-bold text-red-400 mb-4">Accès refusé</h2>
            <p className="text-red-300">Privilèges d'administrateur requis.</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
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
          <p className="text-gray-300 mt-4 text-lg">Chargement...</p>
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Gestion des questionnaires
          </h1>
          <p className="text-gray-300 text-xl">
            Téléversez et gérez les questionnaires VAE pour les candidats
          </p>
        </motion.div>
      
        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2 hover:border-white/20 transition-all duration-300">
            <nav className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('upload')}
                className={`${
                  activeTab === 'upload'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                } flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all`}
              >
                <CloudArrowUpIcon className="h-5 w-5" />
                Téléverser un questionnaire
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('manage')}
                className={`${
                  activeTab === 'manage'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                } flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all`}
              >
                <Cog6ToothIcon className="h-5 w-5" />
                Gérer les questionnaires
              </motion.button>
            </nav>
          </div>
        </motion.div>
        
        {/* Alerts */}
        <AnimatePresence>
          {error && (
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
        </AnimatePresence>
      
        {/* Upload tab */}
        {activeTab === 'upload' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <CloudArrowUpIcon className="h-7 w-7 text-purple-400" />
              Téléverser un nouveau questionnaire
            </h2>
            
            <div className="mb-8">
              <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                Téléversez un fichier JSON contenant la structure du questionnaire. Le fichier doit respecter le format attendu.
              </p>
              
              <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center mb-6 hover:border-purple-400/50 transition-all duration-300 group bg-white/5">
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
                  className="cursor-pointer block"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-20 h-20 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all"
                  >
                    <CloudArrowUpIcon className="h-10 w-10 text-purple-400 group-hover:text-purple-300 transition-colors" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                    Glissez votre fichier ici
                  </h3>
                  <p className="text-gray-300 text-lg mb-4">
                    ou{' '}
                    <span className="font-semibold text-purple-400 group-hover:text-purple-300 transition-colors">
                      cliquez pour sélectionner
                    </span>
                  </p>
                  <p className="text-gray-400">
                    Fichier JSON uniquement
                  </p>
                </label>
              </div>
              
              <AnimatePresence>
                {selectedFile && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                          <DocumentTextIcon className="h-6 w-6 text-purple-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{selectedFile.name}</p>
                          <p className="text-gray-400 text-sm">
                            {(selectedFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <AnimatePresence>
              {previewData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-8"
                >
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <FolderIcon className="h-6 w-6 text-purple-400" />
                    Aperçu du questionnaire
                  </h3>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 max-h-80 overflow-y-auto hover:border-white/20 transition-all">
                    <div className="mb-4">
                      <h4 className="text-lg font-bold text-white">{previewData.title}</h4>
                      <p className="text-gray-300">{previewData.description || 'Aucune description'}</p>
                    </div>
                    
                    <div className="space-y-3">
                      {previewData.sections && previewData.sections.map((section, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border-l-4 border-purple-400/50 pl-4 py-2 bg-white/5 rounded-r-lg"
                        >
                          <p className="font-semibold text-white">{section.title}</p>
                          <p className="text-sm text-purple-300">
                            {section.questions?.length || 0} question(s)
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleUpload}
                disabled={isUploading || !selectedFile}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    Téléversement...
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="h-6 w-6" />
                    Téléverser le questionnaire
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      
        {/* Manage tab */}
        {activeTab === 'manage' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300"
          >
            <div className="px-8 py-6 border-b border-white/10">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <Cog6ToothIcon className="h-7 w-7 text-purple-400" />
                Questionnaires disponibles
              </h3>
              <p className="mt-2 text-gray-300 text-lg">
                Liste des questionnaires disponibles dans le système
              </p>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <LoadingSpinner size="lg" color="primary" />
              </div>
            ) : questionSets.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FolderIcon className="h-10 w-10 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Aucun questionnaire disponible</h3>
                <p className="text-gray-300 mb-6">Commencez par téléverser votre premier questionnaire</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab('upload')}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  <CloudArrowUpIcon className="h-5 w-5" />
                  Téléverser un questionnaire
                </motion.button>
              </motion.div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-purple-300 uppercase tracking-wider">
                        Titre
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-purple-300 uppercase tracking-wider">
                        Sections
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-purple-300 uppercase tracking-wider">
                        Questions
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-purple-300 uppercase tracking-wider">
                        Statut
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-purple-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-4 text-right text-sm font-bold text-purple-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {questionSets.map((questionSet, index) => {
                      // Count total questions
                      let totalQuestions = 0;
                      if (questionSet.sections) {
                        questionSet.sections.forEach(section => {
                          totalQuestions += section.questions?.length || 0;
                        });
                      }
                      
                      return (
                        <motion.tr
                          key={questionSet._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="hover:bg-white/5 transition-all duration-200"
                        >
                          <td className="px-6 py-6">
                            <div>
                              <div className="text-lg font-semibold text-white">{questionSet.title}</div>
                              <div className="text-gray-300">{questionSet.description || '-'}</div>
                            </div>
                          </td>
                          <td className="px-6 py-6 text-white font-medium">
                            {questionSet.sections?.length || 0}
                          </td>
                          <td className="px-6 py-6 text-white font-medium">
                            {totalQuestions}
                          </td>
                          <td className="px-6 py-6">
                            <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-xl ${
                              questionSet.isActive 
                                ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                                : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                            }`}>
                              {questionSet.isActive ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="px-6 py-6 text-gray-300">
                            {new Date(questionSet.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex justify-end gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleActivate(questionSet._id)}
                                disabled={questionSet.isActive}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                                  questionSet.isActive 
                                    ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed border border-gray-500/30' 
                                    : 'bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/30 hover:border-green-400/50'
                                }`}
                              >
                                <PlayIcon className="h-4 w-4" />
                                Activer
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDelete(questionSet._id)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 hover:border-red-400/50 transition-all"
                              >
                                <TrashIcon className="h-4 w-4" />
                                Supprimer
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
}

export default AdminUploadQuestions; 