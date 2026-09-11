import React, { createContext, useCallback, useContext, useState } from 'react';
import ToastNotification from '../components/ui/ToastNotification';
import ConfettiEffect from '../components/ui/ConfettiEffect';

const ToastContext = createContext({
  showToast: () => {},
  triggerConfetti: () => {},
});

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const [confettiActive, setConfettiActive] = useState(false);

  const showToast = useCallback((message, type = 'info', subtext = null, duration = 3200) => {
    setToast({ message, type, subtext, duration, id: Date.now() });
  }, []);

  const triggerConfetti = useCallback((duration = 3500) => {
    setConfettiActive(true);
    setTimeout(() => {
      setConfettiActive(false);
    }, duration);
  }, []);

  const handleDismissToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, triggerConfetti }}>
      {children}
      <ToastNotification toast={toast} onDismiss={handleDismissToast} />
      <ConfettiEffect active={confettiActive} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
