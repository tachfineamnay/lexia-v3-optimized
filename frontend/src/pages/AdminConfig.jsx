import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  KeyIcon,
  CircleStackIcon,
  ServerIcon,
  EnvelopeIcon,
  CpuChipIcon,
  LockClosedIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  CloudIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import { api } from '../config/api';

const CONFIG_CATEGORIES = [
  { id: 'server', name: 'Serveur', icon: ServerIcon, color: 'from-blue-500 to-cyan-500', description: 'Configuration du serveur principal' },
  { id: 'database', name: 'Base de données', icon: CircleStackIcon, color: 'from-green-500 to-emerald-500', description: 'Paramètres MongoDB et stockage' },
  { id: 'security', name: 'Sécurité', icon: LockClosedIcon, color: 'from-red-500 to-pink-500', description: 'Clés de sécurité et chiffrement' },
  { id: 'api', name: 'Clés API', icon: KeyIcon, color: 'from-purple-500 to-violet-500', description: 'APIs externes et authentification' },
  { id: 'ai', name: 'Intelligence Artificielle', icon: CpuChipIcon, color: 'from-indigo-500 to-purple-500', description: 'OpenAI, Claude, Gemini' },
  { id: 'email', name: 'Email', icon: EnvelopeIcon, color: 'from-yellow-500 to-orange-500', description: 'Configuration SMTP et notifications' },
  { id: 'storage', name: 'Stockage', icon: CloudIcon, color: 'from-gray-500 to-slate-500', description: 'Stockage cloud et fichiers' }
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
      <motion.div 
        key={key} 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6 hover:border-white/20 transition-all duration-300"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <label className="text-lg font-semibold text-white mb-2 block">{key}</label>
            {templateInfo?.description && (
              <p className="text-gray-400 text-sm leading-relaxed">{templateInfo.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3 ml-4">
            {isEncrypted && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => togglePasswordVisibility(key)}
                className="p-2 rounded-xl bg-white/10 text-gray-300 hover:text-white hover:bg-white/20 transition-all"
                title={showPassword ? "Masquer" : "Afficher"}
              >
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </motion.button>
            )}
            {(key.includes('SECRET') || key.includes('KEY')) && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  const type = key.includes('JWT') ? 'jwt_secret' : 
                               key.includes('ENCRYPTION') ? 'encryption_key' : 
                               'api_key';
                  generateSecureKey(type, key);
                }}
                className="p-2 rounded-xl bg-blue-500/20 text-blue-400 hover:text-blue-300 hover:bg-blue-500/30 transition-all border border-blue-500/30"
                title="Générer une clé sécurisée"
              >
                <ArrowPathIcon className="h-5 w-5" />
              </motion.button>
            )}
            {(key === 'MONGODB_URI' || key === 'EMAIL_HOST') && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleTest(key, value)}
                disabled={testing[key] || !value}
                className="p-2 rounded-xl bg-green-500/20 text-green-400 hover:text-green-300 hover:bg-green-500/30 transition-all border border-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Tester la configuration"
              >
                {testing[key] ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  <CheckIcon className="h-5 w-5" />
                )}
              </motion.button>
            )}
          </div>
        </div>
        
        <input
          type={isEncrypted && !showPassword ? 'password' : 'text'}
          value={value}
          onChange={(e) => handleConfigChange(key, e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 hover:border-white/20"
          placeholder={`Entrez ${key.toLowerCase().replace(/_/g, ' ')}`}
        />
      </motion.div>
    );
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
            <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm font-medium rounded-full border border-red-500/30">
              CONFIG
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Configuration Système
          </h1>
          <p className="text-gray-300 text-xl">
            Gérez toutes les configurations critiques de l'application
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mb-6"
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5 text-purple-400" />
                Catégories
              </h2>
              <div className="space-y-3">
                {CONFIG_CATEGORIES.map((category, index) => {
                  const Icon = category.icon;
                  const isSelected = selectedCategory === category.id;
                  
                  return (
                    <motion.button
                      key={category.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-start gap-4 p-4 rounded-xl transition-all duration-300 ${
                        isSelected
                          ? 'bg-gradient-to-r ' + category.color + ' text-white shadow-lg'
                          : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        isSelected ? 'bg-white/20' : 'bg-white/10'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-semibold">{category.name}</div>
                        <div className={`text-xs mt-1 ${
                          isSelected ? 'text-white/80' : 'text-gray-400'
                        }`}>
                          {category.description}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                <h3 className="font-semibold text-yellow-300">Sécurité</h3>
              </div>
              <p className="text-sm text-yellow-200 leading-relaxed">
                Les valeurs sensibles sont chiffrées en base. Sauvegardez régulièrement vos configurations.
              </p>
            </motion.div>
          </div>
          
          {/* Main content */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Configuration {CONFIG_CATEGORIES.find(c => c.id === selectedCategory)?.name}
                  </h2>
                  <p className="text-gray-400">
                    {CONFIG_CATEGORIES.find(c => c.id === selectedCategory)?.description}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={saving || loading}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                >
                  {saving ? (
                    <LoadingSpinner size="sm" color="white" />
                  ) : (
                    <CheckIcon className="h-5 w-5" />
                  )}
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </motion.button>
              </div>
              
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-center py-20"
                  >
                    <LoadingSpinner size="lg" color="primary" text="Chargement de la configuration..." />
                  </motion.div>
                ) : (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {Object.keys(template).length > 0 || Object.keys(configs).length > 0 ? (
                      <div className="space-y-4">
                        {Object.entries({...template, ...configs}).map(([key]) => 
                          renderConfigField(key, template[key])
                        )}
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20"
                      >
                        <ServerIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">
                          Aucune configuration disponible
                        </h3>
                        <p className="text-gray-400">
                          Cette catégorie ne contient pas encore de paramètres configurables.
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
        
        <AnimatePresence>
          {toast && (
            <Toast
              type={toast.type}
              message={toast.message}
              onClose={() => setToast(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminConfig; 