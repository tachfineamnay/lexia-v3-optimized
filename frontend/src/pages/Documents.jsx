import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Documents</h1>
        <Link 
          to="/documents/new" 
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Document
        </Link>
      </div>
      
      {/* Filters and search */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
          <form onSubmit={handleSearch} className="flex-grow mb-4 md:mb-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Search documents..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </form>
          
          <div className="flex flex-col sm:flex-row sm:space-x-4">
            <div className="mb-4 sm:mb-0">
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="statusFilter"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="draft">Draft</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
                <option value="submitted">Submitted</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="sortOption" className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                id="sortOption"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="updatedAt_desc">Last Updated</option>
                <option value="createdAt_desc">Newest First</option>
                <option value="createdAt_asc">Oldest First</option>
                <option value="title_asc">Title (A-Z)</option>
                <option value="title_desc">Title (Z-A)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Document listing */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold text-red-800">Error</h2>
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No documents found</h3>
          {searchTerm || statusFilter !== 'all' ? (
            <p className="mt-1 text-gray-500">Try changing your search or filter settings</p>
          ) : (
            <p className="mt-1 text-gray-500">Start by creating your first document</p>
          )}
          <div className="mt-6">
            <Link to="/documents/new" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Document
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {documents.map((doc) => (
              <li key={doc._id} className="hover:bg-gray-50">
                <Link to={`/documents/${doc._id}`} className="block p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                    <div className="flex-grow mb-4 md:mb-0 md:mr-6">
                      <h2 className="text-lg font-medium text-gray-900">{doc.title}</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {doc.description ? 
                          (doc.description.length > 150 ? 
                            `${doc.description.substring(0, 150)}...` : 
                            doc.description) : 
                          'No description'}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          doc.status === 'completed' ? 'bg-green-100 text-green-800' :
                          doc.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                          doc.status === 'submitted' ? 'bg-purple-100 text-purple-800' :
                          doc.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                        </span>
                        
                        {doc.isPublic && (
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                            Public
                          </span>
                        )}
                        
                        {doc.targetCertification && (
                          <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-800">
                            {doc.targetCertification}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-start md:items-end text-sm text-gray-500">
                      <div className="mb-1">
                        Updated: {new Date(doc.updatedAt).toLocaleDateString()}
                      </div>
                      <div>
                        Created: {new Date(doc.createdAt).toLocaleDateString()}
                      </div>
                      <div className="mt-2">
                        {doc.sections?.length || 0} section{doc.sections?.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Documents; 