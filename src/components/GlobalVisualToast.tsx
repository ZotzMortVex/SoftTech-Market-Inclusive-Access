import React, { useEffect, useState } from 'react';
import { GlobalToastNotification } from '../types';
import { 
  CheckCircle2, 
  Trash2, 
  ArrowRight, 
  X, 
  Sparkles, 
  ShieldAlert, 
  PackageCheck, 
  Send,
  AlertTriangle,
  Info
} from 'lucide-react';
import { formatCOP } from '../utils/formatters';

interface GlobalVisualToastProps {
  notification: GlobalToastNotification | null;
  onClose: () => void;
}

export function GlobalVisualToast({ notification, onClose }: GlobalVisualToastProps) {
  const [progress, setProgress] = useState(100);
  const DURATION = 6500; // 6.5 segundos para lectura descansada

  useEffect(() => {
    if (!notification) return;
    setProgress(100);
    const start = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgress(remaining);

      if (elapsed >= DURATION) {
        clearInterval(interval);
        onClose();
      }
    }, 40);

    return () => clearInterval(interval);
  }, [notification, onClose]);

  if (!notification) return null;

  const { type, title, message, product, orderId, actionLabel, onAction } = notification;
  const notificationTone =
    type === 'cart_add' || type === 'order_success'
      ? 'success'
      : type === 'guest_block' || type === 'cart_remove'
        ? 'warning'
        : 'info';

  // Paleta de colores ergonómica, mate y desaturada conforme WCAG AAA
  const getNotificationTheme = () => {
    switch (type) {
      case 'guest_block':
        return {
          border: 'border-[#e6b9ac]',
          bg: 'bg-[#faeae4]',
          headerBg: 'bg-[#f4d2c8]/60 text-[#5d2317] border-b border-[#e6b9ac]',
          iconBg: 'bg-[#f4d2c8] text-[#9c3f2d]',
          icon: ShieldAlert,
          titleColor: 'text-[#5d2317]',
          textColor: 'text-[#6e3124]',
          progressBar: 'bg-[#dca495]',
          buttonClass: 'bg-[#823323] hover:bg-[#632519] text-[#fdf6f4]'
        };
      case 'cart_add':
      case 'order_success':
        return {
          border: 'border-[#a3d4be]',
          bg: 'bg-[#e7f5ee]',
          headerBg: 'bg-[#cfeadb]/60 text-[#123d2f] border-b border-[#a3d4be]',
          iconBg: 'bg-[#cfeadb] text-[#1c644d]',
          icon: type === 'order_success' ? PackageCheck : CheckCircle2,
          titleColor: 'text-[#123d2f]',
          textColor: 'text-[#1d4d3c]',
          progressBar: 'bg-[#8ec4ad]',
          buttonClass: 'bg-[#24634f] hover:bg-[#1a4a3b] text-[#f4faf7]'
        };
      case 'cart_remove':
        return {
          border: 'border-[#e6b9ac]',
          bg: 'bg-[#faeae4]',
          headerBg: 'bg-[#f4d2c8]/60 text-[#5d2317] border-b border-[#e6b9ac]',
          iconBg: 'bg-[#f4d2c8] text-[#9c3f2d]',
          icon: Trash2,
          titleColor: 'text-[#5d2317]',
          textColor: 'text-[#6e3124]',
          progressBar: 'bg-[#dca495]',
          buttonClass: 'bg-[#823323] hover:bg-[#632519] text-[#fdf6f4]'
        };
      case 'product_request':
      case 'suggestion_sent':
        return {
          border: 'border-[#a8c8e6]',
          bg: 'bg-[#e4eff8]',
          headerBg: 'bg-[#cee1f2]/60 text-[#10375c] border-b border-[#a8c8e6]',
          iconBg: 'bg-[#cee1f2] text-[#1c558c]',
          icon: Send,
          titleColor: 'text-[#10375c]',
          textColor: 'text-[#1e4770]',
          progressBar: 'bg-[#91badf]',
          buttonClass: 'bg-[#205282] hover:bg-[#163c61] text-[#f3f7fc]'
        };
      default:
        return {
          border: 'border-[#a8c8e6]',
          bg: 'bg-[#e4eff8]',
          headerBg: 'bg-[#cee1f2]/60 text-[#10375c] border-b border-[#a8c8e6]',
          iconBg: 'bg-[#cee1f2] text-[#1c558c]',
          icon: Sparkles,
          titleColor: 'text-[#10375c]',
          textColor: 'text-[#1e4770]',
          progressBar: 'bg-[#91badf]',
          buttonClass: 'bg-[#205282] hover:bg-[#163c61] text-[#f3f7fc]'
        };
    }
  };

  const theme = getNotificationTheme();
  const Icon = theme.icon;

  return (
    <aside
      role="status"
      aria-live="polite"
      data-notification-type={notificationTone}
      className={`app-visual-notification fixed top-20 right-4 sm:right-6 z-50 max-w-lg w-[calc(100vw-2rem)] ${theme.bg} rounded-2xl border ${theme.border} shadow-xl overflow-hidden transition-all duration-200 text-left`}
    >
      {/* Cabecera con título e icono accesible */}
      <div className={`px-4 sm:px-5 py-3 flex items-center justify-between gap-3 ${theme.headerBg}`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl ${theme.iconBg} flex items-center justify-center shrink-0`}>
            <Icon className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider block opacity-80">
              Notificación Visual Inclusiva
            </span>
            <h3 className={`text-sm sm:text-base font-bold ${theme.titleColor} leading-tight`}>
              {title}
            </h3>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-black/5 text-slate-500 hover:text-slate-800 transition-colors"
          aria-label="Cerrar notificación"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Cuerpo del Mensaje */}
      <div className="p-4 sm:p-5 space-y-3">
        <p className={`text-xs sm:text-sm font-medium ${theme.textColor} leading-relaxed`}>
          {message}
        </p>

        {/* Producto detallado si aplica */}
        {product && (
          <div className="p-3 rounded-xl bg-white/80 border border-black/5 flex items-center gap-3">
            <img
              src={product.images.primary}
              alt=""
              className="w-14 h-14 rounded-lg object-cover border border-black/5 bg-white shrink-0"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-mono font-semibold text-[#1c558c] bg-[#cee1f2]/60 px-1.5 py-0.5 rounded inline-block mb-1">
                {product.code}
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                {product.name}
              </p>
              <p className="text-xs font-bold text-[#1b684f] mt-0.5">
                {formatCOP(product.price)}
              </p>
            </div>
          </div>
        )}

        {/* Identificador de Despacho si aplica */}
        {orderId && (
          <div className="p-2.5 rounded-xl bg-white/70 border border-black/5 text-xs font-medium text-slate-800 flex items-center justify-between">
            <span>Identificador de Despacho:</span>
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-black/10 font-bold">{orderId}</span>
          </div>
        )}

        {/* Botones de Acción */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-black/5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-black/5 transition-colors"
          >
            Entendido
          </button>

          {actionLabel && onAction && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onAction();
              }}
              className={`global-visual-toast-action px-4 py-2 rounded-xl font-bold text-xs sm:text-sm shadow-xs flex items-center gap-1.5 transition-all duration-200 active:scale-95 ${theme.buttonClass}`}
            >
              <span>{actionLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Indicador sutil de tiempo de vida: barra de progreso desaturada en la parte inferior */}
      <div 
        className="w-full h-1 bg-black/5 overflow-hidden" 
        role="progressbar" 
        aria-valuenow={Math.round(progress)} 
        aria-valuemin={0} 
        aria-valuemax={100}
      >
        <div 
          className={`h-full ${theme.progressBar} transition-all duration-100 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </aside>
  );
}
