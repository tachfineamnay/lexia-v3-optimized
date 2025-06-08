import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-9xl font-bold text-gray-300">404</h1>
      <h2 className="text-2xl font-bold text-gray-700 mt-8 mb-2">Page not found</h2>
      <p className="text-gray-500 mb-8">The page you are looking for doesn't exist or has been moved.</p>
      
      <div className="flex space-x-4">
        <Link 
          to="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Go to Dashboard
        </Link>
        <button 
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

export default NotFound; 