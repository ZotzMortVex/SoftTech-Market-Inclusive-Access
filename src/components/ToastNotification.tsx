import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Info, 
  AlertTriangle, 
  X, 
  ArrowRight,
  ShieldCheck,
  PackageCheck
} from 'lucide-react';
import { AccessibleToast, useToast } from '../context/ToastContext';
import { formatCOP } from '../utils/formatters';

interface SingleToastItemProps {
  key?: string;
  toast: AccessibleToast;
  onDismiss: (id: string) => void;
}


function SingleToastItem({ toast, onDismiss }: SingleToastItemProps) {
  const { id, type, title, message, duration = 6000, actionLabel, onAction, product, badge } = toast;
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (elapsed >= duration) {
        clearInterval(interval);
        onDismiss(id);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [id, duration, onDismiss]);

  // Paleta de colores amable, mate y desaturada (cero saturación agresiva, conforme WCAG AAA)
  const themeConfig = {
    success: {
      bg: 'bg-[#e7f5ee]',
      border: 'border-[#a3d4be]',
      textTitle: 'text-[#123d2f]',
      textBody: 'text-[#1d4d3c]',
      icon: CheckCircle2,
      iconColor: 'text-[#1c644d]',
      iconBg: 'bg-[#cfeadb]',
      progressBar: 'bg-[#8ec4ad]',
      actionBtn: 'bg-[#24634f] hover:bg-[#1a4a3b] text-[#f4faf7]',
      badgeColor: 'bg-[#cfeadb] text-[#123d2f]'
    },
    info: {
      bg: 'bg-[#e4eff8]',
      border: 'border-[#a8c8e6]',
      textTitle: 'text-[#10375c]',
      textBody: 'text-[#1e4770]',
      icon: Info,
      iconColor: 'text-[#1c558c]',
      iconBg: 'bg-[#cee1f2]',
      progressBar: 'bg-[#91badf]',
      actionBtn: 'bg-[#205282] hover:bg-[#163c61] text-[#f3f7fc]',
      badgeColor: 'bg-[#cee1f2] text-[#10375c]'
    },
    warning: {
      bg: 'bg-[#faeae4]',
      border: 'border-[#e6b9ac]',
      textTitle: 'text-[#5d2317]',
      textBody: 'text-[#6e3124]',
      icon: AlertTriangle,
      iconColor: 'text-[#9c3f2d]',
      iconBg: 'bg-[#f4d2c8]',
      progressBar: 'bg-[#dca495]',
      actionBtn: 'bg-[#823323] hover:bg-[#632519] text-[#fdf6f4]',
      badgeColor: 'bg-[#f4d2c8] text-[#5d2317]'
    },
    error: {
      bg: 'bg-[#faeae4]',
      border: 'border-[#e6b9ac]',
      textTitle: 'text-[#5d2317]',
      textBody: 'text-[#6e3124]',
      icon: AlertTriangle,
      iconColor: 'text-[#9c3f2d]',
      iconBg: 'bg-[#f4d2c8]',
      progressBar: 'bg-[#dca495]',
      actionBtn: 'bg-[#823323] hover:bg-[#632519] text-[#fdf6f4]',
      badgeColor: 'bg-[#f4d2c8] text-[#5d2317]'
    }
  }[type];

  const IconComponent = themeConfig.icon;

  return (
    <motion.aside
      role="status"
      aria-live="polite"
      data-notification-type={type}
      layout
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ 
        duration: 0.24, 
        ease: [0.16, 1, 0.3, 1] // Curva suave y ergonómica: sin mareos ni saltos violentos
      }}
      className={`app-visual-notification relative w-full max-w-md pointer-events-auto rounded-2xl border ${themeConfig.border} ${themeConfig.bg} shadow-lg shadow-black/5 overflow-hidden text-left mb-3`}
    >
      {/* Contenido principal */}
      <div className="p-4 sm:p-5 flex items-start gap-3.5">
        {/* Icono de identificación visual clara e independiente del color */}
        <div 
          className={`w-9 h-9 rounded-xl ${themeConfig.iconBg} ${themeConfig.iconColor} flex items-center justify-center shrink-0 mt-0.5`}
          aria-hidden="true"
        >
          <IconComponent className="w-5 h-5 stroke-[2.2]" />
        </div>

        {/* Textos y cuerpo con excelente contraste pero tono reposado */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <h4 className={`text-sm font-bold ${themeConfig.textTitle} tracking-tight leading-snug`}>
                {title}
              </h4>
              {badge && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${themeConfig.badgeColor}`}>
                  {badge}
                </span>
              )}
            </div>
            
            <button
              onClick={() => onDismiss(id)}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-black/5 transition-all duration-200"
              aria-label="Cerrar notificación visual"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className={`text-xs sm:text-sm ${themeConfig.textBody} leading-relaxed`}>
            {message}
          </p>

          {/* Tarjeta de producto visual adjunta si se especifica */}
          {product && (
            <div className="mt-3 p-2.5 rounded-xl bg-white/70 border border-black/5 flex items-center gap-3">
              <img
                src={product.images.primary}
                alt=""
                className="w-11 h-11 rounded-lg object-cover bg-white shrink-0 border border-black/5"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {product.name}
                </p>
                <p className="text-xs font-bold text-slate-900 mt-0.5">
                  {formatCOP(product.price)}
                </p>
              </div>
            </div>
          )}

          {/* Botón de acción opcional */}
          {actionLabel && onAction && (
            <div className="mt-3.5 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  onAction();
                  onDismiss(id);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 shadow-sm active:scale-[0.98] ${themeConfig.actionBtn}`}
              >
                <span>{actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Indicador sutil de tiempo de vida (barra de progreso desaturada en la base) */}
      <div 
        className="w-full h-1 bg-black/5 overflow-hidden" 
        role="progressbar" 
        aria-valuenow={Math.round(progress)} 
        aria-valuemin={0} 
        aria-valuemax={100}
      >
        <div 
          className={`h-full ${themeConfig.progressBar} transition-all duration-100 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.aside>
  );
}

/**
 * ToastNotificationContainer:
 * Monta las alertas flotantes en una capa fija superior derecha con espaciado amplio,
 * sin tapar controles críticos ni causar fatiga ocular.
 */
export function ToastNotification() {
  const { toasts, dismissToast } = useToast();

  return (
    <div 
      className="fixed top-20 right-4 sm:right-6 z-50 flex flex-col items-end pointer-events-none max-w-sm sm:max-w-md w-full"
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <SingleToastItem 
            key={toast.id} 
            toast={toast} 
            onDismiss={dismissToast} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
