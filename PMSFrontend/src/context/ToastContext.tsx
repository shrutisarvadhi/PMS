// src/context/ToastContext.tsx
import { createContext, useContext, useState } from 'react';

const ToastContext = createContext<any>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [message, setMessage] = useState<string | null>(null);

  const showToast = (msg: string) => setMessage(msg);
  const hideToast = () => setMessage(null);

  return (
    <ToastContext.Provider value={{ message, showToast, hideToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
