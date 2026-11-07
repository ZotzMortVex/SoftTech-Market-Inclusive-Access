import React, { useEffect } from 'react';
import { AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';

interface VisualNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type?: 'warning' | 'info' | 'success' | 'danger';
  children: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'danger' | 'warning';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function VisualNoticeModal({
  isOpen,
  onClose,
  title,
  type = 'warning',
  children,
  primaryAction,
  secondaryAction
}: VisualNoticeModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const headerColors = {
    warning: 'bg-[#ffc038]/15 border-[#ffc038] text-[#ffc038]',
    info: 'bg-[#00e3fd]/15 border-[#00e3fd] text-[#00e3fd]',
    success: 'bg-[#34a273]/15 border-[#34a273] text-[#34a273]',
    danger: 'bg-[#ff5449]/15 border-[#ff5449] text-[#ff5449]',
  };

  const icons = {
    warning: <AlertTriangle className="w-6 h-6 text-[#ffc038] shrink-0" />,
    info: <Info className="w-6 h-6 text-[#00e3fd] shrink-0" />,
    success: <CheckCircle2 className="w-6 h-6 text-[#34a273] shrink-0" />,
    danger: <AlertTriangle className="w-6 h-6 text-[#ff5449] shrink-0" />,
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        data-notification-type={type === 'danger' ? 'error' : type}
        className="app-visual-notification relative w-full max-w-lg bg-[#001f38] border-2 border-[#004a7a] rounded-2xl shadow-2xl overflow-hidden text-[#f0f4f8]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Optical beacon bar */}
        <div className={`h-2.5 w-full ${type === 'warning' ? 'bg-[#ffc038]' : type === 'danger' ? 'bg-[#ff5449]' : type === 'success' ? 'bg-[#34a273]' : 'bg-[#00e3fd]'}`} />

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-[#003459]">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${headerColors[type]}`}>
              {icons[type]}
            </div>
            <div>
              <span className="text-xs font-semibold tracking-wider uppercase text-[#00e3fd] block">
                Señalización Visual Accesible
              </span>
              <h2 id="modal-title" className="text-lg font-bold text-white mt-0.5">
                {title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar ventana modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#002f52] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 text-sm text-slate-200 space-y-4">
          {children}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 p-5 bg-[#001729] border-t border-[#003459]">
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="visual-notice-secondary-action w-full sm:w-auto px-4 py-2.5 rounded-xl border font-medium text-sm transition-colors"
            >
              {secondaryAction.label}
            </button>
          )}
          {primaryAction && (
            <button
              type="button"
              onClick={primaryAction.onClick}
              className={`visual-notice-primary-action w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md ${
                primaryAction.variant === 'danger'
                  ? 'visual-notice-primary-action--danger'
                  : primaryAction.variant === 'warning'
                    ? 'visual-notice-primary-action--warning'
                    : ''
              }`}
            >
              {primaryAction.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
