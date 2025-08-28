import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  AcademicCapIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ChartBarIcon,
  DocumentTextIcon,
  FolderIcon,
  UserIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/login');
  };

  // Check if a link is active
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const navItems = isAuthenticated ? [
    { path: '/dashboard', label: 'Tableau de bord', icon: ChartBarIcon },
    { path: '/vae', label: 'Mes VAE', icon: DocumentTextIcon },
    { path: '/documents', label: 'Documents', icon: FolderIcon }
  ] : [
    { path: '/', label: 'Accueil', icon: HomeIcon },
    { path: '/login', label: 'Connexion', icon: UserIcon }
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-3">
              <AcademicCapIcon className="h-8 w-8 text-purple-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Lexia V4
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      isActive(item.path)
                        ? 'text-white bg-white/10 backdrop-blur-sm'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-300">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="font-medium">{user?.firstName}</span>
                  <button
                    onClick={handleLogout}
                    className="ml-2 p-1 text-gray-400 hover:text-red-400 transition-colors"
                    title="Déconnexion"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                >
                  Commencer
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsMenuOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-0 h-full w-80 bg-black/95 backdrop-blur-xl border-l border-white/10 p-6">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <AcademicCapIcon className="h-8 w-8 text-purple-400" />
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Lexia V4
                </span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-2">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                      isActive(item.path)
                        ? 'text-white bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {isAuthenticated && (
              <>
                <div className="border-t border-white/10 my-6" />
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-white font-medium">{user?.firstName} {user?.lastName}</p>
                      <p className="text-gray-400 text-sm">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </>
            )}

            {!isAuthenticated && (
              <>
                <div className="border-t border-white/10 my-6" />
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold text-center block hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                >
                  Commencer gratuitement
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;