import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusCircleIcon,
  SparklesIcon,
  TrophyIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { api } from '../config/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalVAE: 0,
    completedVAE: 0,
    inProgressVAE: 0,
    completionRate: 0
  });
  const [recentVAE, setRecentVAE] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, vaeRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/vae?limit=5')
      ]);
      
      setStats(statsRes.data);
      setRecentVAE(vaeRes.data.vaes || []);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Nouvelle VAE",
      description: "Commencer un nouveau dossier",
      icon: PlusCircleIcon,
      link: "/vae/create",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Assistant IA",
      description: "Obtenir de l'aide personnalisée",
      icon: SparklesIcon,
      link: "/ai-chat",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Mes dossiers",
      description: "Gérer vos VAE en cours",
      icon: DocumentTextIcon,
      link: "/vae",
      color: "from-green-500 to-emerald-500"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/20';
      case 'in_progress': return 'text-blue-400 bg-blue-400/20';
      case 'draft': return 'text-gray-400 bg-gray-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'in_progress': return 'En cours';
      case 'draft': return 'Brouillon';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <SparklesIcon className="h-12 w-12 text-purple-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Bonjour {user?.firstName} ! 👋
          </h1>
          <p className="text-gray-300 text-lg">
            Voici un aperçu de votre progression VAE
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <DocumentTextIcon className="h-8 w-8 text-purple-400" />
              <span className="text-3xl font-bold text-white">{stats.totalVAE}</span>
            </div>
            <p className="text-gray-300">Total VAE</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <ClockIcon className="h-8 w-8 text-blue-400" />
              <span className="text-3xl font-bold text-white">{stats.inProgressVAE}</span>
            </div>
            <p className="text-gray-300">En cours</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <CheckCircleIcon className="h-8 w-8 text-green-400" />
              <span className="text-3xl font-bold text-white">{stats.completedVAE}</span>
            </div>
            <p className="text-gray-300">Terminées</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <TrophyIcon className="h-8 w-8 text-yellow-400" />
              <span className="text-3xl font-bold text-white">{stats.completionRate}%</span>
            </div>
            <p className="text-gray-300">Taux de réussite</p>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={action.link}
                  className="block bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition group"
                >
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${action.color} mb-4`}>
                    <action.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-300 transition">
                    {action.title}
                  </h3>
                  <p className="text-gray-300">{action.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent VAE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Dossiers récents</h2>
            <Link
              to="/vae"
              className="text-purple-400 hover:text-purple-300 transition flex items-center gap-2"
            >
              Voir tout
              <ArrowTrendingUpIcon className="h-5 w-5" />
            </Link>
          </div>

          {recentVAE.length > 0 ? (
            <div className="space-y-4">
              {recentVAE.map((vae) => (
                <motion.div
                  key={vae._id}
                  whileHover={{ x: 5 }}
                  className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition"
                >
                  <Link to={`/vae/${vae._id}`} className="block">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {vae.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            {new Date(vae.createdAt).toLocaleDateString()}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(vae.status)}`}>
                            {getStatusText(vae.status)}
                          </span>
                        </div>
                      </div>
                      <ChartBarIcon className="h-6 w-6 text-purple-400" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <DocumentTextIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">Aucun dossier VAE pour le moment</p>
              <Link
                to="/vae/create"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full hover:shadow-lg hover:shadow-purple-500/25 transition"
              >
                <PlusCircleIcon className="h-5 w-5" />
                Créer mon premier dossier
              </Link>
            </div>
          )}
        </motion.div>

        {/* AI Assistant Prompt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ChatBubbleLeftRightIcon className="h-12 w-12 text-white" />
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Besoin d'aide ?
                </h3>
                <p className="text-white/80">
                  Notre assistant IA est là pour vous accompagner
                </p>
              </div>
            </div>
            <Link
              to="/ai-chat"
              className="bg-white text-purple-600 px-6 py-3 rounded-full font-semibold hover:shadow-lg transition"
            >
              Discuter avec l'IA
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard; 