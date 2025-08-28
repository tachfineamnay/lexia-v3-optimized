import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DocumentTextIcon,
  FolderIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
  ArrowPathIcon,
  DocumentPlusIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOption, setSortOption] = useState('updatedAt_desc');
  
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        
        // Build query parameters
        const queryParams = new URLSearchParams();
        if (searchTerm) queryParams.append('search', searchTerm);
        if (statusFilter !== 'all') queryParams.append('status', statusFilter);
        
        // Parse sort option
        const [sortField, sortDirection] = sortOption.split('_');
        queryParams.append('sortBy', sortField);
        queryParams.append('sortOrder', sortDirection);
        
        // Fetch documents
        const response = await fetch(`/api/documents?${queryParams.toString()}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch documents');
        }
        
        const data = await response.json();
        setDocuments(data.data);
        setLoading(false);
      } catch (err) {
        console.error('Documents fetch error:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchDocuments();
  }, [searchTerm, statusFilter, sortOption]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    // The search will be triggered by the useEffect dependency on searchTerm
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                Mes Documents
              </h1>
              <p className="text-gray-300 text-xl">
                Gérez vos documents VAE et suivez votre progression
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 md:mt-0"
            >
              <Link
                to="/documents/new"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
              >
                <DocumentPlusIcon className="h-5 w-5" />
                Nouveau Document
              </Link>
            </motion.div>
          </div>
        </motion.div>
      
        {/* Filters and search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8 hover:border-white/20 transition-all duration-300"
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:gap-6">
            <div className="flex-grow mb-4 lg:mb-0">
              <label className="block text-sm font-semibold text-white mb-2">
                Rechercher
              </label>
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Rechercher des documents..."
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 hover:border-white/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </form>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="statusFilter" className="block text-sm font-semibold text-white mb-2">
                  Statut
                </label>
                <div className="relative">
                  <select
                    id="statusFilter"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 hover:border-white/20 appearance-none cursor-pointer"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all" className="bg-gray-800">Tous</option>
                    <option value="draft" className="bg-gray-800">Brouillon</option>
                    <option value="review" className="bg-gray-800">Révision</option>
                    <option value="completed" className="bg-gray-800">Terminé</option>
                    <option value="submitted" className="bg-gray-800">Soumis</option>
                    <option value="archived" className="bg-gray-800">Archivé</option>
                  </select>
                  <FunnelIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label htmlFor="sortOption" className="block text-sm font-semibold text-white mb-2">
                  Trier par
                </label>
                <div className="relative">
                  <select
                    id="sortOption"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 hover:border-white/20 appearance-none cursor-pointer"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                  >
                    <option value="updatedAt_desc" className="bg-gray-800">Dernière MAJ</option>
                    <option value="createdAt_desc" className="bg-gray-800">Plus récent</option>
                    <option value="createdAt_asc" className="bg-gray-800">Plus ancien</option>
                    <option value="title_asc" className="bg-gray-800">Titre (A-Z)</option>
                    <option value="title_desc" className="bg-gray-800">Titre (Z-A)</option>
                  </select>
                  <ArrowPathIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      
        {/* Document listing */}
        <AnimatePresence>
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center h-64"
            >
              <LoadingSpinner size="lg" color="primary" text="Chargement des documents..." />
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-500/10 border border-red-500/20 backdrop-blur-xl rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
                <h2 className="text-xl font-bold text-red-400">Erreur de chargement</h2>
              </div>
              <p className="text-red-300 mb-4">{error}</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 bg-red-500/20 text-red-300 px-4 py-2 rounded-xl hover:bg-red-500/30 transition-all border border-red-500/30"
              >
                <ArrowPathIcon className="h-4 w-4" />
                Réessayer
              </motion.button>
            </motion.div>
          ) : documents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center hover:border-white/20 transition-all duration-300"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
              >
                <div className="w-24 h-24 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <DocumentTextIcon className="h-12 w-12 text-purple-400" />
                </div>
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {searchTerm || statusFilter !== 'all' ? 'Aucun document trouvé' : 'Aucun document'}
              </h3>
              <p className="text-gray-300 mb-8 text-lg">
                {searchTerm || statusFilter !== 'all' ? 
                  'Essayez de modifier vos paramètres de recherche ou de filtre' : 
                  'Commencez par créer votre premier document VAE'
                }
              </p>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link 
                  to="/documents/new" 
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                >
                  <DocumentPlusIcon className="h-6 w-6" />
                  Créer un nouveau document
                </Link>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {documents.map((doc, index) => {
                const getStatusConfig = (status) => {
                  switch (status) {
                    case 'completed': return { color: 'from-green-500 to-emerald-500', text: 'Terminé', icon: CheckCircleIcon };
                    case 'review': return { color: 'from-yellow-500 to-orange-500', text: 'En révision', icon: ClockIcon };
                    case 'submitted': return { color: 'from-purple-500 to-pink-500', text: 'Soumis', icon: EyeIcon };
                    case 'archived': return { color: 'from-gray-500 to-slate-500', text: 'Archivé', icon: FolderIcon };
                    default: return { color: 'from-blue-500 to-cyan-500', text: 'Brouillon', icon: DocumentTextIcon };
                  }
                };
                
                const statusConfig = getStatusConfig(doc.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <motion.div
                    key={doc._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-white/20 transition-all duration-300 group"
                  >
                    <Link to={`/documents/${doc._id}`} className="block p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex-grow lg:mr-6 mb-4 lg:mb-0">
                          <div className="flex items-start gap-4 mb-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-r ${statusConfig.color} group-hover:shadow-lg transition-all`}>
                              <StatusIcon className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-grow">
                              <h2 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors mb-2">
                                {doc.title}
                              </h2>
                              <p className="text-gray-300 leading-relaxed">
                                {doc.description ? 
                                  (doc.description.length > 150 ? 
                                    `${doc.description.substring(0, 150)}...` : 
                                    doc.description) : 
                                  'Aucune description'
                                }
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-3">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-sm font-medium bg-gradient-to-r ${statusConfig.color} text-white`}>
                              <StatusIcon className="h-4 w-4" />
                              {statusConfig.text}
                            </span>
                            
                            {doc.isPublic && (
                              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl text-sm font-medium bg-white/10 text-gray-300 border border-white/20">
                                <EyeIcon className="h-4 w-4" />
                                Public
                              </span>
                            )}
                            
                            {doc.targetCertification && (
                              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl text-sm font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                <AcademicCapIcon className="h-4 w-4" />
                                {doc.targetCertification}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-start lg:items-end text-sm text-gray-400 space-y-2 min-w-0 lg:min-w-[200px]">
                          <div className="flex items-center gap-2">
                            <ClockIcon className="h-4 w-4" />
                            <span>MAJ: {new Date(doc.updatedAt).toLocaleDateString('fr-FR')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            <span>Créé: {new Date(doc.createdAt).toLocaleDateString('fr-FR')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DocumentTextIcon className="h-4 w-4" />
                            <span>{doc.sections?.length || 0} section{doc.sections?.length !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Documents; 