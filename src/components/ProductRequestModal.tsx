import React, { useState } from 'react';
import { UserRole, CustomProductRequest } from '../types';
import { 
  X, 
  Send, 
  Sparkles, 
  HelpCircle, 
  Laptop, 
  Monitor, 
  Headphones, 
  CheckCircle2, 
  MessageSquareText, 
  Eye 
} from 'lucide-react';

interface ProductRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
  userEmail?: string;
  onSubmitRequest: (request: CustomProductRequest) => void;
  onTriggerFlash: () => void;
}

export function ProductRequestModal({
  isOpen,
  onClose,
  userRole,
  userEmail = '',
  onSubmitRequest,
  onTriggerFlash
}: ProductRequestModalProps) {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Laptops');
  const [details, setDetails] = useState('');
  const [contactInfo, setContactInfo] = useState(userEmail || '');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;

    const newRequest: CustomProductRequest = {
      id: `REQ-${Date.now().toString().slice(-5)}`,
      productName: productName.trim(),
      category,
      details: details.trim(),
      contactInfo: contactInfo.trim() || 'Canal SMS / Notificación en Plataforma',
      date: new Date().toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      requesterRole: userRole,
      status: 'recibida'
    };

    onSubmitRequest(newRequest);
    onTriggerFlash();
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
      setProductName('');
      setDetails('');
      onClose();
    }, 1800);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="product-request-modal bg-white max-w-lg w-full rounded-2xl border-2 border-slate-300 shadow-2xl overflow-hidden">
        {/* Encabezado */}
        <div className="product-request-modal__header px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
              <Sparkles className="product-request-modal__header-icon w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h2 className="product-request-modal__title text-base sm:text-lg font-black tracking-tight leading-tight">
                Solicitar Producto No Encontrado
              </h2>
              <span className="product-request-modal__subtitle text-[11px] text-cyan-200 font-medium">
                Gestión directa con bodega y proveedores certificados
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="product-request-modal__close p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-900">
              ¡Solicitud Registrada con Éxito!
            </h3>
            <p className="text-sm text-slate-600">
              Nuestro equipo técnico buscará la compatibilidad visual y te notificará por escrito cuando esté disponible en catálogo.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="product-request-modal__form p-6 space-y-4">
            <div className="product-request-modal__notice p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed flex items-start gap-2">
              <Eye className="product-request-modal__notice-icon w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <span>
                <strong>100% Inclusivo:</strong> Evaluamos que el equipo cuente con testigos luminosos, alertas visuales periféricas y compatibilidad total con protocolo cero audio.
              </span>
            </div>

            {/* Nombre del equipo */}
            <div>
              <label className="product-request-modal__label block text-xs font-bold text-slate-800 uppercase mb-1">
                ¿Qué producto o equipo tecnológico necesitas? *
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Ej: Monitor curvo 27' con barra LED de alerta visual"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 focus:border-blue-600 text-slate-900 text-sm font-medium focus:outline-none"
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="product-request-modal__label block text-xs font-bold text-slate-800 uppercase mb-1">
                Categoría Estimada
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 focus:border-blue-600 text-slate-900 text-sm font-medium focus:outline-none bg-white"
              >
                <option value="Laptops">Laptops & Portátiles</option>
                <option value="Monitores">Monitores & Pantallas</option>
                <option value="Periféricos">Periféricos (Teclados, Mouse luminosos)</option>
                <option value="Audio Visual">Sistemas Ópticos / Transductores</option>
                <option value="Accesorios">Accesorios e Interconectividad</option>
              </select>
            </div>

            {/* Especificaciones / Requerimientos */}
            <div>
              <label className="product-request-modal__label block text-xs font-bold text-slate-800 uppercase mb-1">
                Especificaciones especiales deseadas
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Indica marcas de preferencia, puertos requeridos o características visuales particulares..."
                className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-300 focus:border-blue-600 text-slate-900 text-sm font-medium focus:outline-none resize-none"
              />
            </div>

            {/* Contacto Escrito */}
            <div>
              <label className="product-request-modal__label block text-xs font-bold text-slate-800 uppercase mb-1">
                Canal de Notificación Escrita (Correo o SMS)
              </label>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="tu.correo@ejemplo.com o móvil para SMS"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 focus:border-blue-600 text-slate-900 text-sm font-medium focus:outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="product-request-modal__cancel px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="product-request-modal__submit px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm shadow-md flex items-center gap-1.5 transition-all transform active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Solicitud a Bodega</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
