import React, { useState, useEffect, useCallback } from 'react';

const ToastContext = React.createContext();

export const useToast = () => React.useContext(ToastContext);

const toastStyles = {
  success: { bg: 'bg-[#1e3a5f] text-white', icon: 'check_circle' },
  error: { bg: 'bg-error text-on-error', icon: 'error' },
  info: { bg: 'bg-surface-container text-on-surface', icon: 'info' },
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((t) => {
          const style = toastStyles[t.type] || toastStyles.info;
          return (
            <div
              key={t.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px] animate-slide-in ${style.bg}`}
              style={{ animation: 'slideInRight 0.3s ease-out' }}
            >
              <span className="material-symbols-outlined">{style.icon}</span>
              <span className="font-body-md">{t.message}</span>
              <button 
                onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
                className="ml-auto opacity-70 hover:opacity-100"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
