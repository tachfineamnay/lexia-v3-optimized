import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalUploads: 0,
    documentsInProgress: 0
  });
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch recent documents
        const documentsResponse = await fetch('/api/documents/recent', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!documentsResponse.ok) {
          throw new Error('Failed to fetch recent documents');
        }
        
        const documentsData = await documentsResponse.json();
        setRecentDocuments(documentsData.data);
        
        // Fetch user stats
        const statsResponse = await fetch('/api/users/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!statsResponse.ok) {
          throw new Error('Failed to fetch user stats');
        }
        
        const statsData = await statsResponse.json();
        setStats(statsData.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Bienvenue, {user?.name || 'Utilisateur'} !
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Carte Créer un dossier VAE */}
        <Link to="/vae-creation" className="block">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all transform hover:scale-105">
            <div className="text-white">
              <div className="text-4xl mb-4">📋</div>
              <h2 className="text-xl font-semibold mb-2">Créer mon dossier VAE</h2>
              <p className="text-blue-100">
                Commencez votre parcours de validation des acquis avec notre assistant IA
              </p>
              <div className="mt-4 inline-flex items-center text-sm font-medium">
                Commencer →
              </div>
            </div>
          </div>
        </Link>

        {/* Carte Mes documents */}
        <Link to="/documents" className="block">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-gray-800">
              <div className="text-4xl mb-4">📁</div>
              <h2 className="text-xl font-semibold mb-2">Mes documents</h2>
              <p className="text-gray-600">
                Accédez à tous vos documents et dossiers VAE
              </p>
              <div className="mt-4 inline-flex items-center text-sm font-medium text-blue-600">
                Voir mes documents →
              </div>
            </div>
          </div>
        </Link>

        {/* Carte Progression */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-gray-800">
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-xl font-semibold mb-2">Ma progression</h2>
            <p className="text-gray-600">
              Suivez votre avancement dans la création de votre dossier
            </p>
            <div className="mt-4">
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${stats.documentsInProgress > 0 ? '50%' : '0%'}` }}></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">{stats.documentsInProgress > 0 ? 'En cours' : 'Pas encore commencé'}</p>
            </div>
          </div>
        </div>

        {/* Carte Ressources */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-gray-800">
            <div className="text-4xl mb-4">📚</div>
            <h2 className="text-xl font-semibold mb-2">Ressources</h2>
            <p className="text-gray-600">
              Guides, conseils et exemples pour réussir votre VAE
            </p>
            <div className="mt-4 inline-flex items-center text-sm font-medium text-blue-600">
              Bientôt disponible
            </div>
          </div>
        </div>

        {/* Carte Support */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-gray-800">
            <div className="text-4xl mb-4">💬</div>
            <h2 className="text-xl font-semibold mb-2">Support</h2>
            <p className="text-gray-600">
              Besoin d'aide ? Notre équipe est là pour vous accompagner
            </p>
            <div className="mt-4 inline-flex items-center text-sm font-medium text-blue-600">
              Contactez-nous →
            </div>
          </div>
        </div>

        {/* Carte Paramètres */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-gray-800">
            <div className="text-4xl mb-4">⚙️</div>
            <h2 className="text-xl font-semibold mb-2">Paramètres</h2>
            <p className="text-gray-600">
              Gérez votre compte et vos préférences
            </p>
            <div className="mt-4 inline-flex items-center text-sm font-medium text-blue-600">
              Gérer mon compte →
            </div>
          </div>
        </div>
      </div>

      {/* Section d'informations */}
      <div className="mt-12 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          💡 Le saviez-vous ?
        </h3>
        <p className="text-blue-800">
          Lexia IA utilise les dernières avancées en intelligence artificielle pour vous aider 
          à créer un dossier VAE complet et professionnel. Notre assistant vous guide à travers 
          chaque étape du processus, en vous posant les bonnes questions et en générant un 
          document structuré basé sur vos réponses.
        </p>
      </div>
    </div>
  );
}

export default Dashboard; 