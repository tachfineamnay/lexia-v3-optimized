import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Toast from '../components/Toast';

const ToastContainer = ({ toasts, removeToast }) => {
  return createPortal(
    <div className="fixed bottom-4 right-4 z-50 space-y-4">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>,
    document.body
  );
};

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id)
    );
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now();
    setToasts((currentToasts) => [
      ...currentToasts,
      { id, message, type, duration }
    ]);
  }, []);

  const ToastProvider = useCallback(
    ({ children }) => (
      <>
        {children}
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </>
    ),
    [toasts, removeToast]
  );

  return {
    showToast,
    ToastProvider
  };
};

export default useToast; 