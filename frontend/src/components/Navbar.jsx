import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FaGraduationCap } from 'react-icons/fa';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Check if a link is active
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <FaGraduationCap className="text-2xl text-primary" />
                <span className="text-xl font-bold text-gray-800">LexiaV3</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/" 
                    className={`${isActive('/') && !isActive('/upload-documents') ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-primary hover:text-primary'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Accueil
                  </Link>
                  <Link 
                    to="/dashboard" 
                    className={`${isActive('/dashboard') ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-primary hover:text-primary'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Tableau de bord
                  </Link>
                  <Link 
                    to="/upload-documents" 
                    className={`${isActive('/upload-documents') || isActive('/question-flow') || isActive('/final-dossier') ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-primary hover:text-primary'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Dossier VAE
                  </Link>
                  <Link 
                    to="/documents" 
                    className={`${isActive('/documents') ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-primary hover:text-primary'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Documents
                  </Link>
                  {user && user.role === 'admin' && (
                    <div className="relative group">
                      <button className={`${isActive('/admin') ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-primary hover:text-primary'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                        Admin
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </button>
                      <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-100 ease-in-out z-10">
                        <div className="py-1" role="menu" aria-orientation="vertical">
                          <Link to="/admin/questions" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                            Gestion des questionnaires
                          </Link>
                          <Link to="/admin/vertex" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                            Configuration Vertex AI
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Link 
                    to="/" 
                    className={`${isActive('/') ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-primary hover:text-primary'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Accueil
                  </Link>
                  <Link 
                    to="/login" 
                    className={`${isActive('/login') ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-primary hover:text-primary'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Connexion
                  </Link>
                  <Link 
                    to="/register" 
                    className={`${isActive('/register') ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-primary hover:text-primary'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>

          {isAuthenticated && (
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="ml-3 relative">
                <div>
                  <Link 
                    to="/profile" 
                    className={`${isActive('/profile') ? 'text-blue-600' : 'text-gray-500 hover:text-primary'} px-3 py-2 rounded-md text-sm font-medium`}
                  >
                    Profil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Déconnexion
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <span className="sr-only">Ouvrir le menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/" 
                  className={`${isActive('/') && !isActive('/upload-documents') ? 'bg-blue-50 border-blue-500 text-blue-700' : 'text-gray-500 hover:bg-gray-50 hover:text-primary'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Accueil
                </Link>
                <Link 
                  to="/dashboard" 
                  className={`${isActive('/dashboard') ? 'bg-blue-50 border-blue-500 text-blue-700' : 'text-gray-500 hover:bg-gray-50 hover:text-primary'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Tableau de bord
                </Link>
                <Link 
                  to="/upload-documents" 
                  className={`${isActive('/upload-documents') || isActive('/question-flow') || isActive('/final-dossier') ? 'bg-blue-50 border-blue-500 text-blue-700' : 'text-gray-500 hover:bg-gray-50 hover:text-primary'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dossier VAE
                </Link>
                <Link 
                  to="/documents" 
                  className={`${isActive('/documents') ? 'bg-blue-50 border-blue-500 text-blue-700' : 'text-gray-500 hover:bg-gray-50 hover:text-primary'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Documents
                </Link>
                {user && user.role === 'admin' && (
                  <>
                    <div className="px-3 py-2 font-medium text-gray-400 text-sm border-b border-gray-200">
                      ADMIN
                    </div>
                    <Link 
                      to="/admin/questions" 
                      className={`${isActive('/admin/questions') ? 'bg-blue-50 border-blue-500 text-blue-700' : 'text-gray-500 hover:bg-gray-50 hover:text-primary'} block pl-6 pr-4 py-2 border-l-4 text-base font-medium`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Gestion des questionnaires
                    </Link>
                    <Link 
                      to="/admin/vertex" 
                      className={`${isActive('/admin/vertex') ? 'bg-blue-50 border-blue-500 text-blue-700' : 'text-gray-500 hover:bg-gray-50 hover:text-primary'} block pl-6 pr-4 py-2 border-l-4 text-base font-medium`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Configuration Vertex AI
                    </Link>
                  </>
                )}
                <Link 
                  to="/profile" 
                  className={`${isActive('/profile') ? 'bg-blue-50 border-blue-500 text-blue-700' : 'text-gray-500 hover:bg-gray-50 hover:text-primary'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profil
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="text-gray-500 hover:bg-gray-50 hover:text-primary block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/" 
                  className={`${isActive('/') ? 'bg-blue-50 border-blue-500 text-blue-700' : 'text-gray-500 hover:bg-gray-50 hover:text-primary'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Accueil
                </Link>
                <Link 
                  to="/login" 
                  className={`${isActive('/login') ? 'bg-blue-50 border-blue-500 text-blue-700' : 'text-gray-500 hover:bg-gray-50 hover:text-primary'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Connexion
                </Link>
                <Link 
                  to="/register" 
                  className={`${isActive('/register') ? 'bg-blue-50 border-blue-500 text-blue-700' : 'text-gray-500 hover:bg-gray-50 hover:text-primary'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar; 