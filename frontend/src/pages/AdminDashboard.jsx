import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiSettings, FiUsers, FiFileText, FiDatabase, 
  FiActivity, FiLock, FiMail, FiAlertCircle,
  FiCheckCircle, FiXCircle, FiClock, FiTrendingUp
} from 'react-icons/fi';
import api from '../config/api';
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
      icon: FiSettings,
      path: '/admin/config',
      color: 'blue',
      description: 'Gérer toutes les configurations et clés API'
    },
    {
      title: 'Gestion des Utilisateurs',
      icon: FiUsers,
      path: '/admin/users',
      color: 'green',
      description: 'Gérer les utilisateurs et les permissions'
    },
    {
      title: 'Dossiers VAE',
      icon: FiFileText,
      path: '/admin/vaes',
      color: 'purple',
      description: 'Superviser et valider les dossiers VAE'
    },
    {
      title: 'Questions VAE',
      icon: FiAlertCircle,
      path: '/admin/questions',
      color: 'yellow',
      description: 'Gérer les questions du processus VAE'
    },
    {
      title: 'Monitoring',
      icon: FiActivity,
      path: '/admin/monitoring',
      color: 'red',
      description: 'Surveiller les performances et les logs'
    }
  ];

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`text-${color}-600 text-xl`} />
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <FiTrendingUp className={trend < 0 ? 'rotate-180' : ''} />
            <span className="ml-1">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      <p className="text-sm text-gray-600 mt-1">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord administrateur</h1>
        <p className="text-gray-600">Vue d'ensemble de l'application LexiaV3</p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-8 space-y-3">
          {alerts.map(alert => (
            <div 
              key={alert.id}
              className={`flex items-center p-4 rounded-lg border ${
                alert.type === 'warning' 
                  ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              <FiAlertCircle className="mr-3" />
              <span>{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Utilisateurs Totaux"
          value={stats.users.total}
          subtitle={`${stats.users.active} actifs`}
          icon={FiUsers}
          color="blue"
          trend={8}
        />
        <StatCard
          title="Dossiers VAE"
          value={stats.vaes.total}
          subtitle={`${stats.vaes.pending} en attente`}
          icon={FiFileText}
          color="green"
          trend={12}
        />
        <StatCard
          title="Taux de Completion"
          value={`${Math.round((stats.vaes.completed / stats.vaes.total) * 100)}%`}
          subtitle={`${stats.vaes.completed} terminés`}
          icon={FiCheckCircle}
          color="purple"
        />
        <StatCard
          title="Disponibilité"
          value={stats.system.uptime}
          subtitle="Dernière 30 jours"
          icon={FiActivity}
          color="red"
        />
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Actions Rapides</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {adminSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <Link
              key={index}
              to={section.path}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg bg-${section.color}-100`}>
                  <Icon className={`text-${section.color}-600 text-2xl`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">{section.title}</h3>
                  <p className="text-sm text-gray-600">{section.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">État du Système</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              stats.system.health === 'good' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {stats.system.health === 'good' ? (
                <FiCheckCircle className="text-green-600" />
              ) : (
                <FiXCircle className="text-red-600" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">État Général</p>
              <p className="font-semibold">
                {stats.system.health === 'good' ? 'Opérationnel' : 'Problème Détecté'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-100">
              <FiClock className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Dernière Sauvegarde</p>
              <p className="font-semibold">{stats.system.lastBackup}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-purple-100">
              <FiLock className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Sécurité</p>
              <p className="font-semibold">SSL Actif</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 