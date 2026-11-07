import { useEffect, useState } from 'react';
import { Product } from '../../types';
import { CheckCircle2, ShoppingBag, ArrowRight, X, Sparkles } from 'lucide-react';
import { formatCOP } from '../../utils/formatters';

interface VisualToastProps {
  product: Product | null;
  onClose: () => void;
  onNavigateToCart: () => void;
}

export function VisualToast({ product, onClose, onNavigateToCart }: VisualToastProps) {
  const [progress, setProgress] = useState(100);
  const DURATION = 5000;

  useEffect(() => {
    if (!product) return;
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
  }, [product, onClose]);

  if (!product) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      data-notification-type="success"
      className="app-visual-notification fixed bottom-6 right-6 z-50 max-w-md w-[calc(100vw-3rem)] bg-[#e7f5ee] border border-[#a3d4be] text-[#123d2f] rounded-2xl shadow-xl overflow-hidden text-left transition-all duration-200"
    >
      <div className="p-4 sm:p-5 flex items-start gap-3.5">
        {/* Optical Checkmark Icon */}
        <div className="w-9 h-9 rounded-xl bg-[#cfeadb] text-[#1c644d] flex items-center justify-center shrink-0 mt-0.5">
          <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold text-[#1a533f] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#207a5c]" />
              Agregado al Carrito
            </span>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-800 p-1 rounded-lg hover:bg-black/5 transition-colors"
              aria-label="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <img
              src={product.images.primary}
              alt=""
              className="w-12 h-12 rounded-lg object-cover border border-black/5 bg-white shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-mono text-[#1c558c] font-bold truncate">
                {product.code}
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                {product.name}
              </p>
              <p className="text-xs text-[#1d4d3c] font-semibold">
                {formatCOP(product.price)} · 1 unidad
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-black/5">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-[#385348] hover:text-[#123d2f] font-medium px-2 py-1 rounded hover:bg-black/5"
            >
              Continuar
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToCart();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#24634f] hover:bg-[#1a4a3b] text-[#f4faf7] font-bold text-xs shadow-xs transition-all duration-200 active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Ver Carrito</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Barra de progreso desaturada en la base */}
      <div 
        className="w-full h-1 bg-black/5 overflow-hidden" 
        role="progressbar" 
        aria-valuenow={Math.round(progress)} 
        aria-valuemin={0} 
        aria-valuemax={100}
      >
        <div 
          className="h-full bg-[#8ec4ad] transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </aside>
  );
}
