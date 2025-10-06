// // src/context/ToastContext.tsx
// import { createContext, useContext, useState } from 'react';

// const ToastContext = createContext<any>(null);

// export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
//   const [message, setMessage] = useState<string | null>(null);

//   const showToast = (msg: string) => setMessage(msg);
//   const hideToast = () => setMessage(null);

//   return (
//     <ToastContext.Provider value={{ message, showToast, hideToast }}>
//       {children}
//     </ToastContext.Provider>
//   );
// };

// export const useToast = () => useContext(ToastContext);

// src/context/ToastContext.tsx
import { createContext, useContext, useState } from 'react';

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export type Toast = {
  id: string;
  variant: ToastVariant;
  description: string;
};

type ToastContextType = {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = ({ variant, description }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9); // simple ID
    const newToast: Toast = { id, variant, description };
    setToasts((prev) => [...prev, newToast]);

    // Auto-hide after 3 seconds
    setTimeout(() => {
      hideToast(id);
    }, 3000);
  };

  const hideToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast }}>
      {children}
      {/* Optional: Render toasts here if you want global UI */}
      {/* <div className="fixed top-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <div key={toast.id} className={`p-4 rounded shadow ${toast.variant === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {toast.description}
          </div>
        ))}
      </div> */}
    </ToastContext.Provider>
  );
};