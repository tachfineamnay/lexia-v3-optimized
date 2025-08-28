import { motion } from 'framer-motion';

function LoadingSpinner({ size = 'md', color = 'primary', fullScreen = false, text = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'text-sky-500',
    white: 'text-white',
    gray: 'text-gray-400',
    dark: 'text-gray-600'
  };

  const spinner = (
    <motion.div 
      className={`${sizeClasses[size]} ${colorClasses[color]}`}
      animate={{ rotate: 360 }}
      transition={{ 
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle 
          className="opacity-20" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="3"
        />
        <path 
          className="opacity-80" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </motion.div>
  );

  if (fullScreen) {
    return (
      <motion.div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 flex flex-col items-center space-y-4 shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {spinner}
          {text && (
            <motion.p 
              className="text-gray-700 dark:text-gray-300 font-medium text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {text}
            </motion.p>
          )}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      {spinner}
      {text && (
        <motion.p 
          className="text-gray-600 dark:text-gray-400 text-sm font-medium text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

export default LoadingSpinner; 