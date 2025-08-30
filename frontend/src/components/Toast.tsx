import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  onClose, 
  duration = 5000 
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Allow fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = type === 'success' ? 'bg-secondary-50' : 'bg-red-50';
  const borderColor = type === 'success' ? 'border-secondary-200' : 'border-red-200';
  const textColor = type === 'success' ? 'text-secondary-800' : 'text-red-800';
  const iconColor = type === 'success' ? 'text-secondary-600' : 'text-red-600';

  return (
    <div className={`
      fixed top-4 right-4 z-50 max-w-sm w-full mx-4 p-4 rounded-lg border shadow-lg
      transition-all duration-300 ease-in-out
      ${visible ? 'transform translate-y-0 opacity-100' : 'transform -translate-y-2 opacity-0'}
      ${bgColor} ${borderColor}
    `}>
      <div className="flex items-center space-x-3">
        <div className={iconColor}>
          {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
        </div>
        
        <p className={`flex-1 text-sm font-medium ${textColor}`}>
          {message}
        </p>
        
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 300);
          }}
          className={`${textColor} hover:opacity-70`}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// Toast manager hook
export const useToast = () => {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    type: ToastType;
  }>>([]);

  const addToast = (message: string, type: ToastType = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );

  return { addToast, ToastContainer };
};