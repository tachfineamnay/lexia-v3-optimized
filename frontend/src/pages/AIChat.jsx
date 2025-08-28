import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PaperAirplaneIcon,
  SparklesIcon,
  CpuChipIcon,
  BeakerIcon,
  LightBulbIcon,
  DocumentTextIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { api } from '../config/api';

const AIChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('multi');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);

  const aiModels = [
    { id: 'multi', name: 'Multi-IA', icon: SparklesIcon, color: 'from-purple-500 to-pink-500' },
    { id: 'gpt4', name: 'GPT-4', icon: CpuChipIcon, color: 'from-green-500 to-emerald-500' },
    { id: 'claude', name: 'Claude', icon: BeakerIcon, color: 'from-blue-500 to-cyan-500' },
    { id: 'gemini', name: 'Gemini', icon: LightBulbIcon, color: 'from-orange-500 to-red-500' }
  ];

  const suggestions = [
    {
      icon: DocumentTextIcon,
      text: "Comment structurer mon dossier VAE ?",
      category: "Structure"
    },
    {
      icon: AcademicCapIcon,
      text: "Quelles sont les étapes de la VAE ?",
      category: "Process"
    },
    {
      icon: LightBulbIcon,
      text: "Aide-moi à décrire mon expérience professionnelle",
      category: "Rédaction"
    },
    {
      icon: SparklesIcon,
      text: "Génère un plan pour mon livret 2",
      category: "Génération"
    }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (messageText = input) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const response = await api.post('/ai/chat', {
        message: messageText,
        model: selectedModel,
        context: 'vae_assistance'
      });

      const aiMessage = {
        id: Date.now() + 1,
        text: response.data.response,
        sender: 'ai',
        model: selectedModel,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Erreur chat IA:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Désolé, je rencontre un problème technique. Veuillez réessayer.",
        sender: 'ai',
        model: selectedModel,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion.text);
  };

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
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Assistant IA VAE
            </h1>
            <p className="text-gray-300 text-xl">
              Votre coach virtuel pour réussir votre VAE
            </p>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300"
        >
          {/* Model Selector */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <SparklesIcon className="h-6 w-6" />
              Choisissez votre modèle IA
            </h2>
            <div className="flex flex-wrap gap-3">
              {aiModels.map((model) => (
                <motion.button
                  key={model.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedModel(model.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    selectedModel === model.id
                      ? 'bg-white text-purple-600 shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                  }`}
                >
                  <model.icon className="h-5 w-5" />
                  <span>{model.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="h-[600px] overflow-y-auto p-6 space-y-4 bg-white/5">
            {messages.length === 0 && showSuggestions && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-6"
                >
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <SparklesIcon className="h-12 w-12 text-purple-400" />
                  </div>
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Bonjour {user?.firstName} ! 👋
                </h2>
                <p className="text-gray-300 mb-8 text-lg">
                  Je suis votre assistant IA personnel pour votre VAE. Comment puis-je vous aider ?
                </p>

                {/* Suggestions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl p-4 text-left transition-all duration-300 group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-all">
                          <suggestion.icon className="h-5 w-5 text-purple-400 group-hover:text-purple-300 transition" />
                        </div>
                        <div>
                          <p className="text-white font-medium mb-1">{suggestion.text}</p>
                          <p className="text-gray-400 text-sm">{suggestion.category}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Messages */}
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-2xl px-6 py-4 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : message.isError
                        ? 'bg-red-500/10 text-red-200 border border-red-500/30 backdrop-blur-xl'
                        : 'bg-white/5 text-white border border-white/10 backdrop-blur-xl hover:border-white/20 transition-all'
                    }`}
                  >
                    {message.sender === 'ai' && (
                      <div className="flex items-center gap-2 mb-2">
                        {aiModels.find(m => m.id === message.model)?.icon && (
                          <motion.div
                            initial={{ rotate: 0 }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            {React.createElement(
                              aiModels.find(m => m.id === message.model).icon,
                              { className: "h-5 w-5 text-purple-400" }
                            )}
                          </motion.div>
                        )}
                        <span className="text-sm text-gray-400">
                          {aiModels.find(m => m.id === message.model)?.name || 'IA'}
                        </span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{message.text}</p>
                    <p className="text-xs mt-2 opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-4">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <SparklesIcon className="h-5 w-5 text-purple-400" />
                    </motion.div>
                    <span className="text-gray-300">L'IA réfléchit...</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-white/10 p-6 bg-white/5">
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Posez votre question sur la VAE..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-6 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-white/20"
                disabled={isLoading}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PaperAirplaneIcon className="h-6 w-6" />
              </motion.button>
            </form>
            
            <p className="text-center text-gray-400 text-sm mt-4">
              Propulsé par GPT-4, Claude et Gemini • Vos données sont sécurisées
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AIChat; 