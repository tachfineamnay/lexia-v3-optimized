import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function VertexConfig() {
  const [configurations, setConfigurations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
    isDefault: false,
    googleCloudConfig: {
      projectId: '',
      location: 'us-central1',
      apiKey: ''
    },
    modelConfig: {
      modelName: 'gemini-1.5-pro',
      temperature: 0.4,
      maxOutputTokens: 2048,
      topP: 0.95,
      topK: 40
    }
  });
  
  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== 'admin') {
      navigate('/');
      return;
    }
    
    // Fetch configurations if user is admin
    if (user && user.role === 'admin') {
      fetchConfigurations();
    }
  }, [user, navigate]);
  
  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/vertex', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch configurations');
      }
      
      const data = await response.json();
      setConfigurations(data.data || []);
    } catch (err) {
      console.error('Error fetching configurations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle nested objects with dot notation in name attribute
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };
  
  const handleSelectConfig = (config) => {
    setSelectedConfig(config);
    setFormData({
      name: config.name,
      description: config.description || '',
      isActive: config.isActive,
      isDefault: config.isDefault,
      googleCloudConfig: {
        projectId: config.googleCloudConfig.projectId,
        location: config.googleCloudConfig.location,
        apiKey: ''  // Don't show the API key for security reasons
      },
      modelConfig: {
        modelName: config.modelConfig.modelName,
        temperature: config.modelConfig.temperature,
        maxOutputTokens: config.modelConfig.maxOutputTokens,
        topP: config.modelConfig.topP,
        topK: config.modelConfig.topK
      }
    });
    setIsEditing(true);
    setIsCreating(false);
  };
  
  const handleCreateNew = () => {
    setSelectedConfig(null);
    setFormData({
      name: '',
      description: '',
      isActive: true,
      isDefault: false,
      googleCloudConfig: {
        projectId: '',
        location: 'us-central1',
        apiKey: ''
      },
      modelConfig: {
        modelName: 'gemini-1.5-pro',
        temperature: 0.4,
        maxOutputTokens: 2048,
        topP: 0.95,
        topK: 40
      }
    });
    setIsCreating(true);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
    setSelectedConfig(null);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      let url, method;
      if (isCreating) {
        url = '/api/vertex';
        method = 'POST';
      } else {
        url = `/api/vertex/${selectedConfig._id}`;
        method = 'PUT';
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Operation failed');
      }
      
      await fetchConfigurations();
      setIsEditing(false);
      setIsCreating(false);
      setSelectedConfig(null);
    } catch (err) {
      console.error('Error saving configuration:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSetDefault = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/vertex/${id}/set-default`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to set as default');
      }
      
      await fetchConfigurations();
    } catch (err) {
      console.error('Error setting default:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this configuration?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/vertex/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete configuration');
      }
      
      await fetchConfigurations();
    } catch (err) {
      console.error('Error deleting configuration:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleResetStats = async (id) => {
    if (!window.confirm('Are you sure you want to reset usage statistics?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/vertex/${id}/reset-stats`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reset statistics');
      }
      
      await fetchConfigurations();
    } catch (err) {
      console.error('Error resetting stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (user && user.role !== 'admin') {
    return <div>Access denied. Admin privileges required.</div>;
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Vertex AI Configuration</h1>
      
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {!isEditing && !isCreating && (
        <>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Configurations</h2>
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create New Configuration
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : configurations.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
              <p className="text-gray-500">No configurations found</p>
              <button
                onClick={handleCreateNew}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create your first configuration
              </button>
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {configurations.map((config) => (
                    <tr key={config._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{config.name}</div>
                            <div className="text-sm text-gray-500">{config.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            config.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {config.isActive ? 'Active' : 'Inactive'}
                          </span>
                          {config.isDefault && (
                            <span className="mt-1 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              Default
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{config.modelConfig.modelName}</div>
                        <div className="text-xs text-gray-400">
                          Temp: {config.modelConfig.temperature} | Max Tokens: {config.modelConfig.maxOutputTokens}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>Requests: {config.usageStats.totalRequests}</div>
                        <div>Tokens: {config.usageStats.totalTokensUsed}</div>
                        <div className="text-xs text-gray-400">
                          {config.usageStats.lastUsed ? `Last used: ${new Date(config.usageStats.lastUsed).toLocaleDateString()}` : 'Never used'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => handleSelectConfig(config)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          {!config.isDefault && (
                            <button
                              onClick={() => handleSetDefault(config._id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Set as Default
                            </button>
                          )}
                          <button
                            onClick={() => handleResetStats(config._id)}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Reset Stats
                          </button>
                          {!config.isDefault && (
                            <button
                              onClick={() => handleDelete(config._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      
      {(isEditing || isCreating) && (
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            {isCreating ? 'Create New Configuration' : 'Edit Configuration'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                ></textarea>
              </div>
              
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Active
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                    Set as Default
                  </label>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-md font-medium text-gray-700 mb-3">Google Cloud Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Project ID</label>
                    <input
                      type="text"
                      name="googleCloudConfig.projectId"
                      value={formData.googleCloudConfig.projectId}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      name="googleCloudConfig.location"
                      value={formData.googleCloudConfig.location}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">API Key</label>
                    <input
                      type="password"
                      name="googleCloudConfig.apiKey"
                      value={formData.googleCloudConfig.apiKey}
                      onChange={handleInputChange}
                      placeholder={isEditing ? "(unchanged)" : ""}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required={isCreating}
                    />
                    {isEditing && (
                      <p className="mt-1 text-xs text-gray-500">
                        Leave empty to keep the current API key unchanged.
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-md font-medium text-gray-700 mb-3">Model Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Model Name</label>
                    <select
                      name="modelConfig.modelName"
                      value={formData.modelConfig.modelName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                      <option value="gemini-1.0-pro">Gemini 1.0 Pro</option>
                      <option value="text-bison">Text Bison</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Temperature</label>
                    <input
                      type="number"
                      name="modelConfig.temperature"
                      value={formData.modelConfig.temperature}
                      onChange={handleInputChange}
                      min="0"
                      max="1"
                      step="0.1"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Max Output Tokens</label>
                    <input
                      type="number"
                      name="modelConfig.maxOutputTokens"
                      value={formData.modelConfig.maxOutputTokens}
                      onChange={handleInputChange}
                      min="1"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Top P</label>
                    <input
                      type="number"
                      name="modelConfig.topP"
                      value={formData.modelConfig.topP}
                      onChange={handleInputChange}
                      min="0"
                      max="1"
                      step="0.01"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6 space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default VertexConfig; 