import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Cog8ToothIcon,
  UsersIcon,
  DocumentTextIcon,
  CircleStackIcon,
  ChartBarIcon,
  LockClosedIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  ServerIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { api } from '../config/api';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, new: 0 },
    vaes: { total: 0, pending: 0, completed: 0 },
    system: { health: 'good', uptime: '99.9%', lastBackup: 'N/A' }
  });
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Simuler le chargement des données
      // Dans une vraie application, ces données viendraient de l'API
      setTimeout(() => {
        setStats({
          users: { total: 142, active: 89, new: 12 },
          vaes: { total: 256, pending: 34, completed: 189 },
          system: { health: 'good', uptime: '99.9%', lastBackup: '2024-01-15' }
        });
        
        setAlerts([
          { id: 1, type: 'warning', message: 'JWT_SECRET devrait contenir au moins 32 caractères' },
          { id: 2, type: 'info', message: 'Nouvelle version disponible (v1.2.0)' }
        ]);
        
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  const adminSections = [
    {
      title: 'Configuration Système',
      icon: Cog8ToothIcon,
      path: '/admin/config',
      color: 'from-blue-500 to-cyan-500',
      description: 'Gérer toutes les configurations et clés API',
      badge: 'Critique'
    },
    {
      title: 'Gestion des Utilisateurs',
      icon: UsersIcon,
      path: '/admin/users',
      color: 'from-green-500 to-emerald-500',
      description: 'Gérer les utilisateurs et les permissions'
    },
    {
      title: 'Dossiers VAE',
      icon: DocumentTextIcon,
      path: '/admin/vaes',
      color: 'from-purple-500 to-pink-500',
      description: 'Superviser et valider les dossiers VAE'
    },
    {
      title: 'Questions VAE',
      icon: ExclamationTriangleIcon,
      path: '/admin/questions',
      color: 'from-yellow-500 to-orange-500',
      description: 'Gérer les questions du processus VAE'
    },
    {
      title: 'Monitoring',
      icon: ChartBarIcon,
      path: '/admin/monitoring',
      color: 'from-red-500 to-pink-500',
      description: 'Surveiller les performances et les logs'
    },
    {
      title: 'Base de Données',
      icon: CircleStackIcon,
      path: '/admin/database',
      color: 'from-indigo-500 to-purple-500',
      description: 'Gestion et maintenance de la base de données'
    }
  ];

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${color} group-hover:shadow-lg transition-all`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center text-sm px-2 py-1 rounded-full ${
            trend > 0 ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
          }`}>
            <ArrowTrendingUpIcon className={`h-4 w-4 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
      <p className="text-gray-300 font-medium">{title}</p>
      {subtitle && <p className="text-gray-400 text-sm mt-2">{subtitle}</p>}
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <LoadingSpinner size="lg" color="primary" text="Chargement du tableau de bord administrateur..." />
      </div>
    );
  }

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
              ADMIN
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Tableau de bord administrateur
          </h1>
          <p className="text-gray-300 text-xl">
            Vue d'ensemble et gestion de l'application LexiaV3
          </p>
        </motion.div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 space-y-3"
          >
            {alerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`flex items-center p-4 rounded-2xl border backdrop-blur-xl ${
                  alert.type === 'warning'
                    ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300'
                    : 'bg-blue-500/10 border-blue-500/20 text-blue-300'
                }`}
              >
                <ExclamationTriangleIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="font-medium">{alert.message}</span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            title="Utilisateurs Totaux"
            value={stats.users.total}
            subtitle={`${stats.users.active} actifs, ${stats.users.new} nouveaux`}
            icon={UsersIcon}
            color="from-blue-500 to-cyan-500"
            trend={8}
            delay={0.1}
          />
          <StatCard
            title="Dossiers VAE"
            value={stats.vaes.total}
            subtitle={`${stats.vaes.pending} en attente, ${stats.vaes.completed} terminés`}
            icon={DocumentTextIcon}
            color="from-green-500 to-emerald-500"
            trend={12}
            delay={0.2}
          />
          <StatCard
            title="Taux de Complétion"
            value={`${Math.round((stats.vaes.completed / stats.vaes.total) * 100)}%`}
            subtitle={`${stats.vaes.completed} dossiers terminés avec succès`}
            icon={CheckCircleIcon}
            color="from-purple-500 to-pink-500"
            delay={0.3}
          />
          <StatCard
            title="Disponibilité Système"
            value={stats.system.uptime}
            subtitle="Temps de fonctionnement sur 30 jours"
            icon={ServerIcon}
            color="from-orange-500 to-red-500"
            delay={0.4}
          />
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-8">
            <Cog8ToothIcon className="h-6 w-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Actions d'Administration</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminSections.map((section, index) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.03, y: -8 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to={section.path}
                    className="relative block bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300 group overflow-hidden"
                  >
                    {section.badge && (
                      <div className="absolute top-3 right-3 bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full font-medium border border-red-500/30">
                        {section.badge}
                      </div>
                    )}
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${section.color} group-hover:shadow-lg transition-all duration-300`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-2 group-hover:text-purple-300 transition">
                          {section.title}
                        </h3>
                        <p className="text-gray-300 text-sm leading-relaxed">{section.description}</p>
                      </div>
                    </div>
                    
                    {/* Hover effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-8">
            <ServerIcon className="h-6 w-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white">État du Système</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-4"
            >
              <div className={`p-3 rounded-xl ${
                stats.system.health === 'good' 
                  ? 'bg-green-500/20 border border-green-500/30' 
                  : 'bg-red-500/20 border border-red-500/30'
              }`}>
                {stats.system.health === 'good' ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-400" />
                ) : (
                  <XCircleIcon className="h-6 w-6 text-red-400" />
                )}
              </div>
              <div>
                <p className="text-gray-400 text-sm font-medium">État Général</p>
                <p className="text-white font-semibold text-lg">
                  {stats.system.health === 'good' ? 'Opérationnel' : 'Problème Détecté'}
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4"
            >
              <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/30">
                <ClockIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm font-medium">Dernière Sauvegarde</p>
                <p className="text-white font-semibold text-lg">{stats.system.lastBackup}</p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-4"
            >
              <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
                <ShieldCheckIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm font-medium">Sécurité</p>
                <p className="text-white font-semibold text-lg">SSL Actif</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard; 