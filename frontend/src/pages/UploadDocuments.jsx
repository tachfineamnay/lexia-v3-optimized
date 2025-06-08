import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

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
      return (
        <svg className="w-10 h-10 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.5 2H7.174a2 2 0 00-1.414.586L3.586 4.76A2 2 0 003 6.174V18.5a2 2 0 002 2h14a2 2 0 002-2v-14a2 2 0 00-2-2h-6.5zM14 18v-2h-4v2h4zm0-4h4v-1h-8v1h4zm0-3h4V8h-8v3h4z" />
        </svg>
      );
    } else if (['jpg', 'jpeg', 'png'].includes(extension)) {
      return (
        <svg className="w-10 h-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 5h-3.2L15 3H9L7.2 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 14h-16V7h4.1l1.8-2h4.2l1.8 2H20v12zm-5-7c0 2.8-2.2 5-5 5s-5-2.2-5-5 2.2-5 5-5 5 2.2 5 5zm-9 0c0 2.2 1.8 4 4 4s4-1.8 4-4-1.8-4-4-4-4 1.8-4 4z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-10 h-10 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
        </svg>
      );
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
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Documents à l'appui de votre dossier VAE</h1>
          <p className="text-gray-600 mb-6">
            Téléversez vos CV, attestations, certificats ou autres documents qui serviront de base à votre dossier.
          </p>

          {/* Progress indicators */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
                <span className="ml-2 text-blue-600 font-medium">Documents</span>
              </div>
              <div className="flex-grow mx-4 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-1/3" />
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
                <span className="ml-2 text-gray-500">Questions</span>
              </div>
              <div className="flex-grow mx-4 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gray-300 w-0" />
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                  3
                </div>
                <span className="ml-2 text-gray-500">Dossier</span>
              </div>
            </div>
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

          {/* Upload area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-8 hover:border-blue-500 transition-colors">
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
              className="cursor-pointer"
            >
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="mt-2 text-sm text-gray-600">
                <span className="font-medium text-blue-600 hover:text-blue-500">
                  Cliquez pour sélectionner des fichiers
                </span>{' '}
                ou glissez-déposez
              </p>
              <p className="mt-1 text-xs text-gray-500">
                PDF, JPG, PNG jusqu'à 10MB
              </p>
            </label>
          </div>

          {/* Selected files list */}
          {files.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Fichiers à téléverser</h3>
              <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
                {files.map((file, index) => (
                  <li key={index} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center">
                      {getFileIcon(file)}
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 truncate" style={{maxWidth: '250px'}}>
                          {file.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {uploadProgress[index] !== undefined && (
                        <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-4">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${uploadProgress[index]}%` }}
                          ></div>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="ml-2 text-gray-400 hover:text-gray-500"
                        disabled={isUploading}
                      >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={uploadFiles}
                  disabled={isUploading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Téléversement...
                    </>
                  ) : (
                    'Téléverser les fichiers'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Already uploaded files */}
          {uploadedFiles.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Documents téléversés</h3>
              <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
                {uploadedFiles.map((file) => (
                  <li key={file._id} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center">
                      {file.extension === 'pdf' ? (
                        <svg className="w-10 h-10 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.5 2H7.174a2 2 0 00-1.414.586L3.586 4.76A2 2 0 003 6.174V18.5a2 2 0 002 2h14a2 2 0 002-2v-14a2 2 0 00-2-2h-6.5zM14 18v-2h-4v2h4zm0-4h4v-1h-8v1h4zm0-3h4V8h-8v3h4z" />
                        </svg>
                      ) : (
                        <svg className="w-10 h-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20 5h-3.2L15 3H9L7.2 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 14h-16V7h4.1l1.8-2h4.2l1.8 2H20v12zm-5-7c0 2.8-2.2 5-5 5s-5-2.2-5-5 2.2-5 5-5 5 2.2 5 5zm-9 0c0 2.2 1.8 4 4 4s4-1.8 4-4-1.8-4-4-4-4 1.8-4 4z" />
                        </svg>
                      )}
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 truncate" style={{maxWidth: '250px'}}>
                          {file.originalName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(file.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                        href={`/api/uploads/${file._id}/download`}
                        className="text-blue-600 hover:text-blue-800"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </a>
                      <button
                        type="button"
                        onClick={() => deleteUploadedFile(file._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between border-t border-gray-200 pt-6">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Retour
            </Link>
            <button
              type="button"
              onClick={handleContinue}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Continuer
              <svg className="ml-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadDocuments; 