import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-xl overflow-hidden mt-8">
        <div className="px-8 py-16 sm:px-16 sm:py-20 lg:py-24 max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Lexia <span className="text-blue-200">VAE</span>
          </h1>
          <p className="mt-6 text-xl text-blue-100 max-w-prose mx-auto">
            Assistant intelligent pour la rédaction de votre dossier de Validation des Acquis de l'Expérience
          </p>
          <div className="mt-10 max-w-sm mx-auto flex flex-col sm:flex-row sm:justify-center gap-3">
            {isAuthenticated ? (
                <Link
                  to="/vae/create"
                  className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-blue-50 shadow-md transition-all"
                >
                  Commencer un dossier
                </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-blue-50 shadow-md transition-all"
                >
                  Se connecter
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-800 bg-opacity-60 hover:bg-opacity-70 shadow-md transition-all"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Comment fonctionne LexiaV3
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Un parcours simplifié pour la création de votre dossier VAE
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-md flex items-center justify-center bg-blue-500 text-white mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">1. Importez vos documents</h3>
              <p className="mt-2 text-base text-gray-500">
                Téléversez vos CV, lettres de recommandation et autres documents pertinents pour votre dossier.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-md flex items-center justify-center bg-blue-500 text-white mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">2. Répondez aux questions</h3>
              <p className="mt-2 text-base text-gray-500">
                Suivez notre assistant interactif qui vous guidera à travers des questions adaptées à votre certification.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-md flex items-center justify-center bg-blue-500 text-white mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">3. Générez votre dossier</h3>
              <p className="mt-2 text-base text-gray-500">
                Notre IA génère un dossier personnalisé que vous pouvez réviser, modifier et exporter au format PDF.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16">
        <div className="bg-blue-700 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-12 max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Prêt à démarrer votre dossier VAE ?
            </h2>
            <p className="mt-6 text-xl text-blue-100">
              Simplifiez votre démarche et gagnez du temps avec notre assistant intelligent.
            </p>
            <div className="mt-8">
              {isAuthenticated ? (
                  <Link
                    to="/vae/create"
                    className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 shadow-md transition-all"
                  >
                    Commencer maintenant
                  </Link>
              ) : (
                <Link
                  to="/register"
                  className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 shadow-md transition-all"
                >
                  Créer un compte
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home; 