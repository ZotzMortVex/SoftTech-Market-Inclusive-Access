import React, { useState } from 'react';
import { SupportTicket, ActiveView } from '../types';
import { 
  MessageSquareText, 
  Send, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  HelpCircle, 
  PhoneOff, 
  FileText,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Mail,
  User,
  ListFilter,
  Sparkles,
  Loader2,
  Inbox
} from 'lucide-react';
import { saveStoredTickets, generateSimulatedReply } from '../utils/supportStorage';

interface ContactSupportViewProps {
  tickets: SupportTicket[];
  onCreateTicket: (ticket: SupportTicket) => void;
  onNavigate: (view: ActiveView) => void;
  onTriggerFlash: () => void;
}

export function ContactSupportView({
  tickets,
  onCreateTicket,
  onNavigate,
  onTriggerFlash
}: ContactSupportViewProps) {
  // Form fields as requested: Nombre, Correo, Motivo, Mensaje
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('Duda sobre Accesibilidad Cero Audio');
  const [message, setMessage] = useState('');

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmationData, setConfirmationData] = useState<SupportTicket | null>(null);
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(0);

  // FAQ List in written text format
  const faqs = [
    {
      id: 0,
      question: '¿Cómo funciona la experiencia de compra sin depender de alertas sonoras?',
      answer: 'Toda la interfaz de SoftTech Market se basa en el principio Cero Audio. Los estados de error, validaciones de formularios, carritos y despachos se comunican mediante destellos lumínicos en los bordes de la pantalla, cambios de color con alto contraste y texto estructurado conforme a la norma internacional WCAG 2.1 AAA. Nunca escucharás un pitido ni perderás una notificación por no oír un tono.'
    },
    {
      id: 1,
      question: '¿Cómo se coordina la entrega del repartidor si no escucho el timbre convencional?',
      answer: 'En el proceso de compra puedes seleccionar el protocolo de entrega inclusiva. Los mensajeros tienen prohibido llamar por teléfono de voz: se comunican exclusivamente vía SMS de texto y hacen sonar el timbre lumínico portátil o esperan a la confirmación visual en tu puerta acordada en las notas de entrega.'
    },
    {
      id: 2,
      question: '¿Qué es la certificación CUD y los testigos lumínicos de los equipos?',
      answer: 'Cada producto del catálogo cuenta con una certificación visual CUD (Comercio Universal Digital). Esto garantiza que el hardware dispone de biseles LED, indicadores luminosos de actividad o teclado con relieve táctil para que ninguna función del sistema operativo dependa de alertas acústicas.'
    },
    {
      id: 3,
      question: '¿Por qué la atención al cliente es 100% escrita y no por llamadas de voz o videollamadas?',
      answer: 'Para garantizar la total equidad y accesibilidad para la comunidad sorda e hipoacúsica, eliminamos las llamadas telefónicas de voz y los sistemas de reconocimiento por voz. Las respuestas se emiten de forma inmediata por escrito a través de este portal y por correo electrónico, quedando un registro auditable de cada respuesta técnica.'
    },
    {
      id: 4,
      question: '¿Cómo puedo cambiar a Modo Claro o aumentar el tamaño del texto?',
      answer: 'Dispones del botón flotante permanente "Accesibilidad" en la esquina inferior de cualquier pantalla y en la barra superior. Puedes alternar al instante entre Modo Oscuro Profundo, Modo Claro Solar y Alto Contraste AAA, así como usar los botones A- y A+ para ajustar la escala visual hasta un 130%.'
    },
    {
      id: 5,
      question: '¿Qué garantía tengo si el producto no se adapta a mis necesidades sensoriales?',
      answer: 'Ofrecemos una garantía de satisfacción sensorial de 30 días sin costo de devolución. Si un equipo no satisface tus requerimientos de contraste o alertas visuales, puedes solicitar la sustitución o reembolso íntegro mediante este formulario de soporte escrito.'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Visible validation check
    if (!name.trim()) {
      setErrorMessage('El campo "Nombre" es obligatorio. Por favor ingresa tu nombre.');
      onTriggerFlash();
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Por favor proporciona un correo electrónico válido para recibir la respuesta escrita.');
      onTriggerFlash();
      return;
    }
    if (!reason.trim()) {
      setErrorMessage('Por favor selecciona o especifica el motivo de tu consulta escrita.');
      onTriggerFlash();
      return;
    }
    if (!message.trim() || message.trim().length < 8) {
      setErrorMessage('El mensaje debe contener al menos 8 caracteres explicando detalladamente tu solicitud.');
      onTriggerFlash();
      return;
    }

    // Visual loading state
    setIsSubmitting(true);

    setTimeout(() => {
      const randomTicketNum = Math.floor(1000 + Math.random() * 9000);
      const simulatedReply = generateSimulatedReply(reason, name);

      const newTicket: SupportTicket = {
        id: `TCK-${randomTicketNum}`,
        date: 'Hoy - En este instante',
        subject: `Consulta Escrita: ${reason}`,
        category: reason,
        channel: 'Formulario Escrito (Portal)',
        status: 'en_revision',
        message: message.trim(),
        response: simulatedReply
      };

      const updatedTickets = [newTicket, ...tickets];
      onCreateTicket(newTicket);
      saveStoredTickets(updatedTickets);

      setIsSubmitting(false);
      setConfirmationData(newTicket);
      setName('');
      setEmail('');
      setMessage('');
      onTriggerFlash();
    }, 600);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16 text-left max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-[#001c33] border-2 border-[#00426b] shadow-2xl">
        <div>
          <span className="px-3 py-1 rounded-full bg-[#00e3fd]/20 text-[#00e3fd] text-xs font-bold uppercase tracking-wider border border-[#00e3fd]/40 inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00e3fd] animate-pulse"></span>
            Atención al Cliente 100% Escrita · Cero Audio
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 flex items-center gap-3">
            <MessageSquareText className="w-7 h-7 sm:w-8 sm:h-8 text-[#00e3fd]" />
            <span>Centro de Contacto & Soporte Escrito</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Canal formal para dudas de accesibilidad, seguimiento de pedidos y garantías de hardware. Todas las respuestas se emiten por escrito directamente en este portal y por correo electrónico.
          </p>
        </div>

        <button
          onClick={() => onNavigate('accessibility')}
          className="px-4 py-2.5 rounded-xl bg-[#002b4d] hover:bg-[#003966] text-[#00e3fd] font-bold text-xs transition-colors border border-[#004e80] self-start sm:self-auto flex items-center gap-2"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Ver Glosario de Accesibilidad</span>
        </button>
      </div>

      {/* Zero Call Guarantee Badge */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#001729] border border-emerald-500/50 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs text-slate-200 shadow-md">
        <div className="p-3 rounded-xl bg-emerald-950/70 text-emerald-400 border border-emerald-800 shrink-0">
          <PhoneOff className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <strong className="text-emerald-400 text-sm block font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Protocolo de Comunicación Segura Sin Sonido:</span>
          </strong>
          <p className="leading-relaxed text-slate-300">
            Garantizamos que <strong>no realizamos llamadas telefónicas de voz, videollamadas obligatorias ni reconocimientos vocales</strong>. Respetamos tu canal sensorial preferido con confirmaciones visuales instantáneas y acuses por escrito.
          </p>
        </div>
      </div>

      {/* Main Grid: Form on Left, Direct Contact Info on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Contact Form Column (7 Cols) */}
        <div className="lg:col-span-7">
          <form 
            onSubmit={handleSubmit} 
            className="rounded-3xl bg-[#001e36] border-2 border-[#004775] p-6 sm:p-8 shadow-2xl space-y-5"
            noValidate
          >
            <div className="border-b border-[#003860] pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#00e3fd]" />
                  <span>Formulario de Contacto Escrito</span>
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Completa los 4 campos requeridos. Recibirás respuesta por escrito.
                </p>
              </div>

              <span className="text-[11px] text-slate-400 font-mono">
                Demostración local
              </span>
            </div>

            {/* Error Message Visual Banner */}
            {errorMessage && (
              <div 
                className="p-4 rounded-2xl bg-rose-950/80 border-2 border-rose-500 text-rose-200 text-xs font-semibold flex items-start gap-3 shadow-lg animate-fadeIn"
                role="alert"
                aria-live="assertive"
              >
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-left">
                  <span className="font-bold text-rose-300 block">Atención - Verificación visual requerida:</span>
                  <p>{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Form Fields: Nombre, Correo, Motivo, Mensaje */}
            <div className="space-y-4 text-xs">
              
              {/* 1. Nombre */}
              <div className="space-y-1.5">
                <label htmlFor="contact-name" className="font-bold text-slate-200 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#00e3fd]" />
                  <span>Nombre Completo *</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Ej. Sofía Valenzuela"
                  className={`w-full px-4 py-3 rounded-xl bg-[#001426] border text-white text-xs sm:text-sm focus:border-[#00e3fd] focus:outline-none transition-colors ${
                    errorMessage && !name.trim() ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#003459]'
                  }`}
                />
              </div>

              {/* 2. Correo */}
              <div className="space-y-1.5">
                <label htmlFor="contact-email" className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#00e3fd]" />
                  <span>Correo Electrónico para Respuesta Escrita *</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="sofia.valenzuela@ejemplo.com"
                  className={`w-full px-4 py-3 rounded-xl bg-[#001426] border text-white text-xs sm:text-sm focus:border-[#00e3fd] focus:outline-none transition-colors ${
                    errorMessage && (!email.trim() || !email.includes('@')) ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#003459]'
                  }`}
                />
                <span className="text-[11px] text-slate-400 block">
                  Enviaremos el acuse y la resolución técnica a esta dirección.
                </span>
              </div>

              {/* 3. Motivo */}
              <div className="space-y-1.5">
                <label htmlFor="contact-reason" className="font-bold text-slate-200 flex items-center gap-1.5">
                  <ListFilter className="w-3.5 h-3.5 text-[#00e3fd]" />
                  <span>Motivo del Contacto *</span>
                </label>
                <select
                  id="contact-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#001426] border border-[#003459] text-white text-xs sm:text-sm focus:border-[#00e3fd] focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="Duda sobre Accesibilidad Cero Audio">Duda sobre Accesibilidad Cero Audio (WCAG 2.1 AAA)</option>
                  <option value="Seguimiento de Pedido o Despacho Inclusivo">Seguimiento de Pedido o Despacho Inclusivo (Código #STK)</option>
                  <option value="Garantía de Hardware y Testigos Lumínicos">Garantía de Hardware y Testigos Lumínicos de Equipos</option>
                  <option value="Sugerencia de Usabilidad Visual">Sugerencia de Usabilidad y Alto Contraste</option>
                  <option value="Consulta General de Catálogo">Consulta General de Catálogo de Tecnología</option>
                </select>
              </div>

              {/* 4. Mensaje */}
              <div className="space-y-1.5">
                <label htmlFor="contact-message" className="font-bold text-slate-200 flex items-center gap-1.5">
                  <MessageSquareText className="w-3.5 h-3.5 text-[#00e3fd]" />
                  <span>Mensaje Detallado *</span>
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Describe con claridad tu requerimiento. Si tienes el código CUD de algún producto o número de pedido, indícalo aquí..."
                  className={`w-full px-4 py-3 rounded-xl bg-[#001426] border text-white text-xs sm:text-sm focus:border-[#00e3fd] focus:outline-none transition-colors leading-relaxed ${
                    errorMessage && (!message.trim() || message.trim().length < 8) ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#003459]'
                  }`}
                />
              </div>

            </div>

            {/* Visual Loading State or Action Button */}
            {isSubmitting ? (
              <div 
                className="w-full py-4 rounded-xl bg-[#002b4d] border-2 border-[#00e3fd] text-[#00e3fd] font-bold text-sm flex items-center justify-center gap-3 animate-pulse"
                aria-live="polite"
              >
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Registrando mensaje en almacenamiento simulado...</span>
              </div>
            ) : (
              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-[#00e3fd] hover:bg-[#3ce9ff] text-[#001629] font-black text-sm transition-all shadow-xl shadow-[#00e3fd]/20 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                <span>Enviar Formulario Escrito</span>
              </button>
            )}

            <p className="text-[11px] text-slate-400 text-center">
              Como no existe un servidor externo, el mensaje se registra de forma simulada en tu navegador con persistencia en localStorage.
            </p>
          </form>
        </div>

        {/* Info Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card: Compromiso Inclusivo */}
          <div className="rounded-3xl bg-[#001b33] border-2 border-[#003860] p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Garantías de Soporte Escrito</span>
            </h3>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Tiempo de Respuesta Escrita:</strong> Menor a 2 horas hábiles vía correo electrónico y en esta bandeja.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Personal Capacitado:</strong> Asesores formados en terminología técnica visual y diseño inclusivo.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Cero Llamadas:</strong> Nunca recibirás una llamada telefónica no solicitada.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Historial en Pantalla:</strong> Todos tus tickets quedan guardados para consulta inmediata.</span>
              </li>
            </ul>

            <div className="pt-3 border-t border-[#003052] flex items-center justify-between text-xs">
              <span className="text-slate-400">Canal preferente:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono font-bold border border-emerald-800">
                100% Texto Escrito
              </span>
            </div>
          </div>

          {/* Quick Contact Alternative Banner */}
          <div className="rounded-3xl bg-[#001729] border border-[#003459] p-6 space-y-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#00e3fd]" />
              <span>Canales Escritos Oficiales</span>
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2.5 rounded-xl bg-[#00101f] border border-[#00253e] flex items-center justify-between">
                <span className="text-slate-400">Correo Electrónico:</span>
                <span className="font-mono text-[#00e3fd] font-semibold">soporte@softtechmarket.com</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#00101f] border border-[#00253e] flex items-center justify-between">
                <span className="text-slate-400">SMS Visual de Alertas:</span>
                <span className="font-mono text-emerald-400 font-semibold">+52 55 8900 1234 (Solo SMS)</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Confirmation Modal / Banner when Submitted */}
      {confirmationData && (
        <div 
          className="app-visual-notification p-6 rounded-3xl bg-emerald-950/90 border-2 border-emerald-400 text-white shadow-2xl space-y-4 animate-fadeIn"
          role="status"
          aria-live="polite"
          data-notification-type="success"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800/80 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-900 border border-emerald-400 flex items-center justify-center text-emerald-300">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-emerald-300 flex items-center gap-2">
                  <span>¡Mensaje de Contacto Registrado Exitosamente!</span>
                </h3>
                <p className="text-xs text-emerald-200">
                  El ticket ha sido archivado para la demostración en tu navegador.
                </p>
              </div>
            </div>

            <button
              onClick={() => setConfirmationData(null)}
              className="px-3 py-1.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 text-xs font-bold transition-colors self-start sm:self-auto"
            >
              Cerrar Acuse
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-emerald-900/40 border border-emerald-800">
              <span className="text-emerald-400 block font-semibold">Código de Ticket:</span>
              <span className="font-mono font-bold text-white text-sm">#{confirmationData.id}</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-900/40 border border-emerald-800">
              <span className="text-emerald-400 block font-semibold">Motivo Registrado:</span>
              <span className="text-white font-medium truncate block">{confirmationData.category}</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-900/40 border border-emerald-800">
              <span className="text-emerald-400 block font-semibold">Canal de Notificación:</span>
              <span className="text-white font-medium">Bandeja del Portal & Correo</span>
            </div>
          </div>

          {confirmationData.response && (
            <div className="p-4 rounded-2xl bg-[#001729] border border-emerald-500/60 space-y-1">
              <span className="font-bold text-[#00e3fd] text-xs flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Respuesta Inmediata Simulada del Equipo Técnico:</span>
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                "{confirmationData.response}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Preguntas Frecuentes (FAQ) en Formato de Texto */}
      <div className="rounded-3xl bg-[#001b33] border-2 border-[#003860] p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="border-b border-[#003459] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#00e3fd]/20 text-[#00e3fd] text-xs font-bold uppercase border border-[#00e3fd]/40">
              Información Clara y Transparente
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-[#00e3fd]" />
              <span>Preguntas Frecuentes en Formato de Texto</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Respuestas completas sobre navegación Cero Audio, despacho inclusivo y garantías de hardware.
            </p>
          </div>

          <span className="px-3 py-1 rounded-xl bg-[#00243e] text-slate-300 text-xs font-medium border border-[#003b66] self-start sm:self-auto">
            {faqs.length} Artículos Informativos
          </span>
        </div>

        {/* FAQ Accordion Items */}
        <div className="space-y-3">
          {faqs.map((faq) => {
            const isExpanded = expandedFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all ${
                  isExpanded 
                    ? 'bg-[#00223d] border-[#00e3fd] shadow-lg' 
                    : 'bg-[#001729] border-[#002f52] hover:border-[#004e80]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left focus:outline-none"
                  aria-expanded={isExpanded}
                >
                  <span className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#001426] text-[#00e3fd] flex items-center justify-center font-mono text-xs shrink-0 border border-[#003052]">
                      {faq.id + 1}
                    </span>
                    <span>{faq.question}</span>
                  </span>

                  <div className="p-1 rounded-lg bg-[#001426] text-[#00e3fd] shrink-0 border border-[#002d4d]">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs text-slate-200 leading-relaxed border-t border-[#003459] animate-fadeIn">
                    <p className="p-3.5 rounded-xl bg-[#001221] border border-[#002b49] text-slate-200">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tickets History List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Inbox className="w-4 h-4 text-[#00e3fd]" />
            <span>Bandeja de Consultas Escritas Registradas ({tickets.length})</span>
          </h3>
          <span className="text-xs text-slate-400">Persistido en localStorage</span>
        </div>

        {tickets.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#001729] border border-[#003459] text-center text-slate-400 text-xs">
            No hay tickets registrados en esta sesión. Completa el formulario arriba para registrar tu primera consulta.
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="p-5 sm:p-6 rounded-2xl bg-[#001c33] border-2 border-[#003a61] space-y-3 text-xs shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#003052] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#00e3fd] text-sm">
                      #{t.id}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#002747] text-slate-200 font-semibold text-[11px] border border-[#003966]">
                      {t.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{t.date}</span>
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                      t.status === 'resuelto' 
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${t.status === 'resuelto' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                      <span>{t.status === 'resuelto' ? 'Resuelto por Escrito' : 'En Revisión'}</span>
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm">{t.subject}</h4>
                  <p className="text-slate-300 mt-1 leading-relaxed bg-[#001324] p-3 rounded-xl border border-[#002844]">
                    "{t.message}"
                  </p>
                </div>

                {t.response && (
                  <div className="p-3.5 rounded-xl bg-[#00172b] border-l-4 border-[#00e3fd] space-y-1">
                    <span className="font-bold text-[#00e3fd] block text-[11px] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Respuesta Oficial del Equipo de Accesibilidad:</span>
                    </span>
                    <p className="text-slate-200 leading-relaxed">
                      {t.response}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
