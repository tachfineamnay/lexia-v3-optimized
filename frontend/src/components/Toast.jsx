import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const Toast = ({ message, type = 'info', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  if (!isVisible) return null;

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const styles = {
    success: 'lexia-alert-success',
    error: 'lexia-alert-error',
    warning: 'lexia-alert-warning',
    info: 'lexia-alert-info'
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed bottom-4 right-4 z-50 lexia-animate-slide-up ${
        isExiting ? 'lexia-animate-fade-in opacity-0' : ''
      }`}
    >
      <div className={`${styles[type]} flex items-center p-4 rounded-lg shadow-lg max-w-md`}>
        <span className="flex-shrink-0 mr-3" aria-hidden="true">
          {icons[type]}
        </span>
        
        <p className="text-sm font-medium flex-grow">
          {message}
        </p>
        
        <button
          type="button"
          className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
          onClick={handleClose}
          aria-label="Fermer la notification"
        >
          <span className="sr-only">Fermer</span>
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  duration: PropTypes.number,
  onClose: PropTypes.func.isRequired
};

export default Toast; 