import React, { useState, useEffect } from 'react';
import { FiKey, FiDatabase, FiServer, FiMail, FiHardDrive, FiCpu, FiLock, FiRefreshCw, FiCheck, FiX, FiEye, FiEyeOff } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import { api } from '../config/api';

const CONFIG_CATEGORIES = [
  { id: 'server', name: 'Serveur', icon: FiServer, color: 'blue' },
  { id: 'database', name: 'Base de données', icon: FiDatabase, color: 'green' },
  { id: 'security', name: 'Sécurité', icon: FiLock, color: 'red' },
  { id: 'api', name: 'Clés API', icon: FiKey, color: 'purple' },
  { id: 'ai', name: 'Intelligence Artificielle', icon: FiCpu, color: 'indigo' },
  { id: 'email', name: 'Email', icon: FiMail, color: 'yellow' },
  { id: 'storage', name: 'Stockage', icon: FiHardDrive, color: 'gray' }
];

const AdminConfig = () => {
  const [selectedCategory, setSelectedCategory] = useState('server');
  const [configs, setConfigs] = useState({});
  const [template, setTemplate] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState({});
  const [showPasswords, setShowPasswords] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadCategoryConfig(selectedCategory);
  }, [selectedCategory]);

  const loadCategoryConfig = async (category) => {
    setLoading(true);
    try {
      const response = await api.get(`/config/${category}`);
      const configData = response.data.configs || [];
      const templateData = response.data.template || {};
      
      // Convert array to object for easier manipulation
      const configObj = {};
      configData.forEach(config => {
        configObj[config.key] = config.value || '';
      });
      
      // Add template keys that don't exist in config
      Object.keys(templateData).forEach(key => {
        if (!configObj.hasOwnProperty(key)) {
          configObj[key] = '';
        }
      });
      
      setConfigs(configObj);
      setTemplate(templateData);
    } catch (error) {
      setToast({
        type: 'error',
        message: `Erreur lors du chargement: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (key, value) => {
    setConfigs(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const configArray = Object.entries(configs).map(([key, value]) => ({
        key,
        value
      }));
      
      await api.post(`/config/${selectedCategory}`, { configs: configArray });
      
      setToast({
        type: 'success',
        message: 'Configuration sauvegardée avec succès'
      });
    } catch (error) {
      setToast({
        type: 'error',
        message: `Erreur lors de la sauvegarde: ${error.message}`
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (key, value) => {
    setTesting(prev => ({ ...prev, [key]: true }));
    try {
      const response = await api.post(`/config/test/${selectedCategory}`, { key, value });
      
      setToast({
        type: response.data.success ? 'success' : 'error',
        message: response.data.message
      });
    } catch (error) {
      setToast({
        type: 'error',
        message: `Erreur lors du test: ${error.message}`
      });
    } finally {
      setTesting(prev => ({ ...prev, [key]: false }));
    }
  };

  const generateSecureKey = async (type, key) => {
    try {
      const response = await api.get(`/config/generate/${type}`);
      handleConfigChange(key, response.data.value);
      
      setToast({
        type: 'success',
        message: 'Clé générée avec succès'
      });
    } catch (error) {
      setToast({
        type: 'error',
        message: `Erreur lors de la génération: ${error.message}`
      });
    }
  };

  const togglePasswordVisibility = (key) => {
    setShowPasswords(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const renderConfigField = (key, templateInfo) => {
    const value = configs[key] || '';
    const isEncrypted = templateInfo?.encrypted;
    const showPassword = showPasswords[key];
    
    return (
      <div key={key} className="border border-gray-200 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <label className="font-medium text-gray-700">{key}</label>
            {templateInfo?.description && (
              <p className="text-sm text-gray-500 mt-1">{templateInfo.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isEncrypted && (
              <button
                onClick={() => togglePasswordVisibility(key)}
                className="text-gray-400 hover:text-gray-600"
                title={showPassword ? "Masquer" : "Afficher"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            )}
            {key.includes('SECRET') || key.includes('KEY') ? (
              <button
                onClick={() => {
                  const type = key.includes('JWT') ? 'jwt_secret' : 
                               key.includes('ENCRYPTION') ? 'encryption_key' : 
                               'api_key';
                  generateSecureKey(type, key);
                }}
                className="text-blue-600 hover:text-blue-700"
                title="Générer une clé sécurisée"
              >
                <FiRefreshCw />
              </button>
            ) : null}
            {(key === 'MONGODB_URI' || key === 'EMAIL_HOST') && (
              <button
                onClick={() => handleTest(key, value)}
                disabled={testing[key] || !value}
                className="text-green-600 hover:text-green-700 disabled:text-gray-400"
                title="Tester la configuration"
              >
                {testing[key] ? <LoadingSpinner size="small" /> : <FiCheck />}
              </button>
            )}
          </div>
        </div>
        
        <input
          type={isEncrypted && !showPassword ? 'password' : 'text'}
          value={value}
          onChange={(e) => handleConfigChange(key, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={`Entrez ${key.toLowerCase()}`}
        />
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Configuration Système</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="font-semibold text-gray-700 mb-4">Catégories</h2>
            {CONFIG_CATEGORIES.map(category => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                    isSelected
                      ? `bg-${category.color}-100 text-${category.color}-700 border-l-4 border-${category.color}-500`
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Icon className={`text-${category.color}-500`} />
                  <span className="font-medium">{category.name}</span>
                </button>
              );
            })}
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Sécurité</h3>
            <p className="text-sm text-yellow-700">
              Les valeurs sensibles sont chiffrées dans la base de données. 
              Assurez-vous de sauvegarder régulièrement vos configurations.
            </p>
          </div>
        </div>
        
        {/* Main content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Configuration {CONFIG_CATEGORIES.find(c => c.id === selectedCategory)?.name}
              </h2>
              <button
                onClick={handleSave}
                disabled={saving || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
              >
                {saving ? <LoadingSpinner size="small" /> : <FiCheck />}
                Sauvegarder
              </button>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : (
              <div>
                {Object.keys(template).length > 0 || Object.keys(configs).length > 0 ? (
                  Object.entries({...template, ...configs}).map(([key]) => 
                    renderConfigField(key, template[key])
                  )
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    Aucune configuration disponible pour cette catégorie
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default AdminConfig; 