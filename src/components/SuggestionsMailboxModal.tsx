import React, { useState } from 'react';
import { UserAccount, UserSuggestion } from '../types';
import { 
  X, 
  Mail, 
  Send, 
  CheckCircle2, 
  Inbox, 
  MessageSquare, 
  Clock, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface SuggestionsMailboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  suggestions: UserSuggestion[];
  onSubmitSuggestion: (suggestion: UserSuggestion) => void;
  onTriggerFlash: () => void;
}

export function SuggestionsMailboxModal({
  isOpen,
  onClose,
  currentUser,
  suggestions,
  onSubmitSuggestion,
  onTriggerFlash
}: SuggestionsMailboxModalProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [type, setType] = useState<UserSuggestion['type']>('sugerencia_tienda');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState(false);

  if (!isOpen) return null;

  const userSuggestions = suggestions.filter(
    (s) => s.userEmail === (currentUser?.email || 'elena.gomez@visualaccess.com')
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    const newSuggestion: UserSuggestion = {
      id: `SUG-${Date.now().toString().slice(-5)}`,
      userId: currentUser?.id || 'usr-registered-1',
      userName: currentUser?.name || 'Usuario Registrado',
      userEmail: currentUser?.email || 'elena.gomez@visualaccess.com',
      type,
      subject: subject.trim(),
      message: message.trim(),
      date: new Date().toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      status: 'recibido'
    };

    onSubmitSuggestion(newSuggestion);
    onTriggerFlash();
    setSuccessNotice(true);
    setSubject('');
    setMessage('');

    setTimeout(() => {
      setSuccessNotice(false);
      setActiveTab('history');
    }, 1500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white max-w-xl w-full rounded-2xl border-2 border-slate-300 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Encabezado */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-700 to-emerald-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
              <Inbox className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                Buzón de Pedidos y Sugerencias
              </h2>
              <span className="text-[11px] text-teal-200 font-medium">
                Comunicación directa por escrito para usuarios registrados
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de Pestañas */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 shrink-0">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'create'
                ? 'border-teal-600 text-teal-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Redactar Mensaje
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-teal-600 text-teal-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Mis Mensajes Enviados</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 text-[10px]">
              {userSuggestions.length}
            </span>
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'create' ? (
            successNotice ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-teal-100 text-teal-600 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  ¡Mensaje Enviado al Buzón!
                </h3>
                <p className="text-sm text-slate-600">
                  Tu sugerencia o solicitud de pedido ha quedado registrada y será atendida por nuestros asesores certificados.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Tipo de solicitud */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                    Tipo de Comunicación
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setType('pedido_especial')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                        type === 'pedido_especial'
                          ? 'bg-teal-50 border-teal-600 text-teal-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      📦 Pedido Especial
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('sugerencia_tienda')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                        type === 'sugerencia_tienda'
                          ? 'bg-teal-50 border-teal-600 text-teal-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      💡 Sugerencia Tienda
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('accesibilidad')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                        type === 'accesibilidad'
                          ? 'bg-teal-50 border-teal-600 text-teal-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      👁️ Accesibilidad
                    </button>
                  </div>
                </div>

                {/* Asunto */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                    Asunto o Título del Pedido / Sugerencia *
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ej: Consulta sobre compatibilidad de luz LED o sugerencia de empaque"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 focus:border-teal-600 text-slate-900 text-sm font-medium focus:outline-none"
                  />
                </div>

                {/* Mensaje */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                    Detalle de tu mensaje *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escribe detalladamente tu inquietud, solicitud de pedido o sugerencia de mejora..."
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 focus:border-teal-600 text-slate-900 text-sm font-medium focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
                  >
                    Cerrar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs sm:text-sm shadow-md flex items-center gap-1.5 transition-all transform active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar al Buzón</span>
                  </button>
                </div>
              </form>
            )
          ) : (
            <div className="space-y-3">
              {userSuggestions.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Inbox className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                  <p className="font-semibold text-sm">No has enviado mensajes al buzón aún.</p>
                  <p className="text-xs text-slate-400 mt-1">Usa la pestaña "Redactar Mensaje" para enviar sugerencias o requerimientos.</p>
                </div>
              ) : (
                userSuggestions.map((sug) => (
                  <div key={sug.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                        {sug.id}
                      </span>
                      <span className="text-slate-500 flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {sug.date}
                      </span>
                    </div>
                    <h4 className="font-black text-slate-900 text-sm">{sug.subject}</h4>
                    <p className="text-xs text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                      {sug.message}
                    </p>
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="capitalize text-slate-500 font-semibold">
                        Tipo: {sug.type.replace('_', ' ')}
                      </span>
                      <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Estado: {sug.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
