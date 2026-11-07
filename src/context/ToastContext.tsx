import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Product } from '../types';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface AccessibleToast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number; // milisegundos, default 6000ms para lectura descansada
  actionLabel?: string;
  onAction?: () => void;
  product?: Product;
  badge?: string;
}

interface ToastContextValue {
  toasts: AccessibleToast[];
  showToast: (toast: Omit<AccessibleToast, 'id'>) => string;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<AccessibleToast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<AccessibleToast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newToast: AccessibleToast = {
      ...toast,
      id,
      duration: toast.duration ?? 6000 // Tiempo ergonómico para lectura cómoda sin prisas
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast, clearAllToasts }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe ser utilizado dentro de un ToastProvider');
  }
  return context;
}
