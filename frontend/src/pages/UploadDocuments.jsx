import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  PhotoIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  AcademicCapIcon,
  FolderIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

function UploadDocuments() {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch already uploaded files
    const fetchUploadedFiles = async () => {
      try {
        const response = await fetch('/api/uploads', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des fichiers');
        }

        const data = await response.json();
        setUploadedFiles(data.uploads || []);
      } catch (err) {
        console.error('Error fetching uploads:', err);
        setError("Impossible de récupérer vos fichiers existants. Veuillez réessayer ultérieurement.");
      }
    };

    fetchUploadedFiles();
  }, []);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
    
    // Reset messages
    setError(null);
    setSuccess(null);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      setError("Veuillez sélectionner au moins un fichier");
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    const uploadPromises = files.map(async (file, index) => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', getFileType(file));
        formData.append('description', `Document téléversé le ${new Date().toLocaleDateString()}`);

        setUploadProgress(prev => ({ ...prev, [index]: 0 }));

        const xhr = new XMLHttpRequest();
        
        // Create a promise that will resolve when the upload completes
        const uploadPromise = new Promise((resolve, reject) => {
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded * 100) / event.total);
              setUploadProgress(prev => ({ ...prev, [index]: progress }));
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.responseText));
            } else {
              reject(new Error(`Erreur ${xhr.status}: ${xhr.statusText}`));
            }
          });

          xhr.addEventListener('error', () => {
            reject(new Error('Erreur réseau lors du téléversement'));
          });
        });

        xhr.open('POST', '/api/uploads', true);
        xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
        xhr.send(formData);

        return await uploadPromise;
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        throw error;
      }
    });

    try {
      const results = await Promise.allSettled(uploadPromises);
      
      const successfulUploads = results.filter(r => r.status === 'fulfilled').length;
      const failedUploads = results.filter(r => r.status === 'rejected').length;
      
      // Update the list of uploaded files
      const response = await fetch('/api/uploads', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setUploadedFiles(data.uploads || []);
      
      // Display success/error message
      if (failedUploads === 0) {
        setSuccess(`${successfulUploads} fichier(s) téléversé(s) avec succès.`);
        setFiles([]);
        setUploadProgress({});
      } else if (successfulUploads === 0) {
        setError("Échec du téléversement. Veuillez réessayer.");
      } else {
        setSuccess(`${successfulUploads} fichier(s) téléversé(s) avec succès.`);
        setError(`${failedUploads} fichier(s) n'ont pas pu être téléversés.`);
        // Remove successful uploads from the files list
        const successfulIndexes = results
          .map((result, index) => result.status === 'fulfilled' ? index : -1)
          .filter(index => index !== -1);
        setFiles(files.filter((_, index) => !successfulIndexes.includes(index)));
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError("Une erreur est survenue lors du téléversement. Veuillez réessayer.");
    } finally {
      setIsUploading(false);
    }
  };

  const getFileType = (file) => {
    const extension = file.name.split('.').pop().toLowerCase();
    if (['pdf'].includes(extension)) return 'document';
    if (['jpg', 'jpeg', 'png'].includes(extension)) return 'image';
    return 'other';
  };

  const getFileIcon = (file) => {
    const extension = file.name.split('.').pop().toLowerCase();
    
    if (extension === 'pdf') {
      return <DocumentTextIcon className="w-10 h-10 text-red-400" />;
    } else if (['jpg', 'jpeg', 'png'].includes(extension)) {
      return <PhotoIcon className="w-10 h-10 text-blue-400" />;
    } else {
      return <DocumentIcon className="w-10 h-10 text-gray-400" />;
    }
  };

  const deleteUploadedFile = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce fichier ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/uploads/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du fichier');
      }

      setUploadedFiles(uploadedFiles.filter(file => file._id !== id));
      setSuccess("Fichier supprimé avec succès");
    } catch (err) {
      console.error('Error deleting file:', err);
      setError("Impossible de supprimer le fichier. Veuillez réessayer.");
    }
  };

  const handleContinue = () => {
    navigate('/question-flow');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <AcademicCapIcon className="h-10 w-10 text-purple-400" />
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Lexia V4
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Documents VAE
          </h1>
          <p className="text-gray-300 text-xl max-w-3xl">
            Téléversez vos CV, attestations, certificats ou autres documents qui serviront de base à votre dossier.
          </p>
        </motion.div>

        {/* Progress indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                >
                  1
                </motion.div>
                <span className="ml-3 text-white font-semibold text-lg">Documents</span>
              </div>
              <div className="flex-grow mx-6 h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '33%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                />
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-gray-400 font-bold text-lg border border-white/20">
                  2
                </div>
                <span className="ml-3 text-gray-400 font-semibold text-lg">Questions</span>
              </div>
              <div className="flex-grow mx-6 h-2 bg-white/10 rounded-full">
                <div className="h-full bg-gray-400 w-0" />
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-gray-400 font-bold text-lg border border-white/20">
                  3
                </div>
                <span className="ml-3 text-gray-400 font-semibold text-lg">Dossier</span>
              </div>
            </div>
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

        {/* Upload area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8 hover:border-white/20 transition-all duration-300"
        >
          <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:border-purple-400/50 transition-all duration-300 group">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              multiple
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
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
                Glissez vos fichiers ici
              </h3>
              <p className="text-gray-300 text-lg mb-4">
                ou{' '}
                <span className="font-semibold text-purple-400 group-hover:text-purple-300 transition-colors">
                  cliquez pour sélectionner
                </span>
              </p>
              <p className="text-gray-400">
                PDF, JPG, PNG jusqu'à 10MB
              </p>
            </label>
          </div>
        </motion.div>

        {/* Selected files list */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <FolderIcon className="h-6 w-6 text-purple-400" />
                Fichiers à téléverser
              </h3>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300">
                <div className="space-y-4">
                  {files.map((file, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-all">
                          {getFileIcon(file)}
                        </div>
                        <div className="flex-grow">
                          <p className="font-semibold text-white truncate max-w-xs">
                            {file.name}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {uploadProgress[index] !== undefined && (
                          <div className="w-32">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-gray-400">{uploadProgress[index]}%</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${uploadProgress[index]}%` }}
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                              />
                            </div>
                          </div>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => removeFile(index)}
                          disabled={isUploading}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={uploadFiles}
                    disabled={isUploading}
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
                        Téléverser les fichiers
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Already uploaded files */}
        <AnimatePresence>
          {uploadedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
                Documents téléversés
              </h3>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300">
                <div className="space-y-4">
                  {uploadedFiles.map((file, index) => (
                    <motion.div
                      key={file._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-all">
                          {file.extension === 'pdf' ? (
                            <DocumentTextIcon className="w-10 h-10 text-red-400" />
                          ) : (
                            <PhotoIcon className="w-10 h-10 text-blue-400" />
                          )}
                        </div>
                        <div className="flex-grow">
                          <p className="font-semibold text-white truncate max-w-xs">
                            {file.originalName}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {new Date(file.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <motion.a
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          href={`/api/uploads/${file._id}/download`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all"
                          title="Télécharger"
                        >
                          <ArrowDownTrayIcon className="h-5 w-5" />
                        </motion.a>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => deleteUploadedFile(file._id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Supprimer"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row justify-between gap-6 pt-8 border-t border-white/10"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-3 bg-white/10 border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all"
            >
              <ArrowLeftIcon className="h-6 w-6" />
              Retour
            </Link>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleContinue}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all"
          >
            Continuer
            <ArrowRightIcon className="h-6 w-6" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

export default UploadDocuments; 