import { useState } from 'react';
import { CartItem, SimulatedOrder, UserAccount } from '../types';
import { 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  Truck, 
  MessageSquare, 
  Mail, 
  LayoutDashboard, 
  ShieldCheck, 
  MapPin, 
  User, 
  Phone,
  Building,
  FileText,
  FileCheck,
  ShoppingBag,
  AlertCircle
} from 'lucide-react';
import { generateSimulatedOrderCode, addStoredOrder, saveStoredCart } from '../utils/orderStorage';
import { formatCOP } from '../utils/formatters';

interface CheckoutFlowProps {
  cart: CartItem[];
  currentUser: UserAccount | null;
  onCancel: () => void;
  onOrderCompleted: (order: SimulatedOrder) => void;
  onTriggerFlash: () => void;
}

export function CheckoutFlow({
  cart,
  currentUser,
  onCancel,
  onOrderCompleted,
  onTriggerFlash
}: CheckoutFlowProps) {
  // 3-Step Process: 1. Revisión del carrito, 2. Datos de entrega, 3. Confirmación del pedido
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 2 Fields (Demostración solicitada)
  const [recipientName, setRecipientName] = useState(currentUser?.name || 'Elena Gómez Morales');
  const [shippingAddress, setShippingAddress] = useState('Av. Paseo de la Reforma 412, Piso 8');
  const [city, setCity] = useState('Ciudad de México');
  const [contactNumber, setContactNumber] = useState(currentUser?.phone || '+52 55 9876 5432');
  const [deliveryNotes, setDeliveryNotes] = useState('Por favor no llamar por teléfono. Tocar timbre luminoso o enviar SMS.');
  const [shippingChannel, setShippingChannel] = useState<'sms_visual' | 'email_escrito' | 'dashboard'>('sms_visual');
  const [acceptNoCalls, setAcceptNoCalls] = useState(true);

  // Validation feedback
  const [validationError, setValidationError] = useState<string | null>(null);

  // Financial calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const tax = Math.round(subtotal * 0.19); // IVA 19% Colombia
  const shipping = 0;
  const total = subtotal + tax + shipping;

  const handleGoToDelivery = () => {
    if (cart.length === 0) {
      setValidationError('El carrito está vacío. Agrega productos antes de continuar.');
      return;
    }
    setValidationError(null);
    setCurrentStep(2);
    onTriggerFlash();
  };

  const handleGoToConfirmation = () => {
    if (!recipientName.trim()) {
      setValidationError('Por favor ingresa el nombre del destinatario.');
      onTriggerFlash();
      return;
    }
    if (!shippingAddress.trim()) {
      setValidationError('Por favor ingresa la dirección de entrega.');
      onTriggerFlash();
      return;
    }
    if (!city.trim()) {
      setValidationError('Por favor ingresa la ciudad de entrega.');
      onTriggerFlash();
      return;
    }
    if (!contactNumber.trim()) {
      setValidationError('Por favor ingresa un teléfono para alertas por SMS visual.');
      onTriggerFlash();
      return;
    }
    if (!acceptNoCalls) {
      setValidationError('Debes confirmar la aceptación del protocolo de entrega Cero Audio sin llamadas.');
      onTriggerFlash();
      return;
    }

    setValidationError(null);
    setCurrentStep(3);
    onTriggerFlash();
  };

  const handleConfirmFinalOrder = () => {
    const newOrderId = generateSimulatedOrderCode();
    const currentDate = new Date().toLocaleDateString('es-MX', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });

    const newOrder: SimulatedOrder = {
      orderId: newOrderId,
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      date: currentDate,
      items: [...cart],
      subtotal,
      tax,
      shipping: 0,
      total,
      status: 'pendiente', // Asigna inicialmente el estado "Pendiente"
      shippingChannel,
      shippingAddress: `${shippingAddress}, ${city}`,
      city,
      recipientName,
      contactNumber,
      notes: deliveryNotes.trim() || undefined,
      visualCheckConfirmed: true,
      trackingHistory: [
        { 
          step: 'Pedido Registrado (Pendiente)', 
          date: 'Hoy - En este instante', 
          done: true, 
          active: false, 
          desc: 'Registro emitido exitosamente y guardado en estado inicial Pendiente.' 
        },
        { 
          step: 'Inspección Cero Audio en Bodega', 
          date: 'Programada: Próximas 2 horas', 
          done: false, 
          active: true, 
          desc: 'Revisión técnica de actuadores lumínicos y sellado de garantía escrita.' 
        },
        { 
          step: 'Despacho con Guía Satelital', 
          date: 'Estimada: Mañana 09:00 AM', 
          done: false, 
          active: false, 
          desc: 'Mensajería especializada en camino con protocolo sin timbre sonoro.' 
        },
        { 
          step: 'Entrega Presencial Accesible', 
          date: 'Estimada: Mañana 02:00 PM', 
          done: false, 
          active: false, 
          desc: 'Notificación SMS en puerta y firma digital con acuse visual.' 
        }
      ]
    };

    // Guarda el pedido en localStorage
    addStoredOrder(newOrder);

    // Vacía el carrito después de confirmar
    saveStoredCart([]);

    // Notifica y navega a la pantalla de confirmación
    onOrderCompleted(newOrder);
    onTriggerFlash();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-16 text-left">
      {/* Top Back Nav */}
      <button
        onClick={onCancel}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Cancelar y volver al carrito</span>
      </button>

      {/* Stepper Header: 3-Step Guiding Process */}
      <div className="p-6 rounded-3xl bg-[#001c33] border-2 border-[#00426b] shadow-xl space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#00e3fd]">
            Proceso de Pedido Simulado
          </span>
          <h1 className="text-2xl font-black text-white mt-1">
            {currentStep === 1 && 'Paso 1 de 3: Revisión del Carrito'}
            {currentStep === 2 && 'Paso 2 de 3: Datos de Entrega (Demostración)'}
            {currentStep === 3 && 'Paso 3 de 3: Confirmación del Pedido'}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Simulación segura para accesibilidad tecnológica auditiva. Sin cobros reales ni tarjetas.
          </p>
        </div>

        {/* Visual Stepper 3 Steps */}
        <div className="grid grid-cols-3 gap-3">
          
          {/* Step 1: Revisión del carrito */}
          <button
            type="button"
            onClick={() => {
              setCurrentStep(1);
              onTriggerFlash();
            }}
            className={`p-3 rounded-2xl border-2 text-left transition-all ${
              currentStep === 1 
                ? 'bg-[#002f52] border-[#00e3fd] text-white shadow-lg' 
                : currentStep > 1 
                ? 'bg-[#001729] border-[#34a273] text-emerald-400 hover:bg-[#00223b]' 
                : 'bg-[#001729] border-[#002947] text-slate-500'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                currentStep === 1 
                  ? 'bg-[#00e3fd] text-[#001629]' 
                  : currentStep > 1 
                  ? 'bg-[#34a273] text-[#001629]' 
                  : 'bg-[#002847] text-slate-400'
              }`}>
                {currentStep > 1 ? '✓' : '1'}
              </span>
              <span className="font-bold text-xs truncate">1. Revisión</span>
            </div>
          </button>

          {/* Step 2: Datos de entrega */}
          <button
            type="button"
            onClick={() => {
              if (currentStep > 2) {
                setCurrentStep(2);
                onTriggerFlash();
              }
            }}
            disabled={currentStep < 2}
            className={`p-3 rounded-2xl border-2 text-left transition-all ${
              currentStep === 2 
                ? 'bg-[#002f52] border-[#00e3fd] text-white shadow-lg' 
                : currentStep > 2 
                ? 'bg-[#001729] border-[#34a273] text-emerald-400 hover:bg-[#00223b]' 
                : 'bg-[#001729] border-[#002947] text-slate-500 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                currentStep === 2 
                  ? 'bg-[#00e3fd] text-[#001629]' 
                  : currentStep > 2 
                  ? 'bg-[#34a273] text-[#001629]' 
                  : 'bg-[#002847] text-slate-400'
              }`}>
                {currentStep > 2 ? '✓' : '2'}
              </span>
              <span className="font-bold text-xs truncate">2. Entrega</span>
            </div>
          </button>

          {/* Step 3: Confirmación del pedido */}
          <div className={`p-3 rounded-2xl border-2 transition-all ${
            currentStep === 3 
              ? 'bg-[#002f52] border-[#00e3fd] text-white shadow-lg' 
              : 'bg-[#001729] border-[#002947] text-slate-500 opacity-60'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                currentStep === 3 ? 'bg-[#00e3fd] text-[#001629]' : 'bg-[#002847] text-slate-400'
              }`}>
                3
              </span>
              <span className="font-bold text-xs truncate">3. Confirmar</span>
            </div>
          </div>

        </div>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div 
          role="alert" 
          className="p-4 rounded-2xl bg-red-950/80 border-2 border-red-500 text-red-200 flex items-center gap-3 animate-fadeIn"
        >
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span className="text-xs sm:text-sm font-semibold">{validationError}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* PASO 1: REVISIÓN DEL CARRITO */}
      {/* ======================================================== */}
      {currentStep === 1 && (
        <div className="rounded-3xl bg-[#001e36] border-2 border-[#004775] p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-[#003860] pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#00e3fd]" />
                <span>Paso 1: Revisión de Equipos Seleccionados</span>
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Verifica la lista de productos, cantidades y precios unitarios antes de registrar la dirección.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#00e3fd]/20 text-[#00e3fd] text-xs font-mono font-bold border border-[#00e3fd]/30">
              {cart.length} {cart.length === 1 ? 'producto' : 'productos'}
            </span>
          </div>

          {/* Products List in Step 1 */}
          <div className="space-y-3">
            {cart.map((item) => (
              <div 
                key={item.product.id}
                className="p-4 rounded-2xl bg-[#001426] border border-[#003154] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={item.product.images.primary}
                    alt={item.product.name}
                    className="w-14 h-14 rounded-xl object-cover border border-[#003860] bg-[#00101f] shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#00e3fd]">{item.product.code}</span>
                      <span className="text-[11px] text-slate-400">{item.product.brand}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{item.product.name}</h4>
                    <p className="text-xs text-emerald-400">{item.product.visualAlert}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-[#002b4d] pt-2 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400 block">Precio Unitario:</span>
                    <span className="text-sm font-semibold text-slate-200">{formatCOP(item.product.price)}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-slate-400 block">Cantidad:</span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#00243e] border border-[#003d66] text-white font-bold text-xs">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Total:</span>
                    <span className="text-sm sm:text-base font-extrabold text-white">
                      {formatCOP(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Subtotal & Total Preview */}
          <div className="p-4 rounded-2xl bg-[#001529] border border-[#003860] space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Subtotal:</span>
              <span className="font-semibold text-white">{formatCOP(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>IVA Incluido (19% simulado):</span>
              <span className="font-semibold text-white">{formatCOP(tax)}</span>
            </div>
            <div className="flex justify-between text-slate-300 items-center">
              <span>Envío Inclusivo Cero Audio:</span>
              <span className="text-emerald-400 font-bold uppercase">Gratuito ($ 0 COP)</span>
            </div>
            <div className="pt-2 border-t border-[#003459] flex justify-between items-baseline">
              <span className="text-sm font-bold text-white">Importe Total:</span>
              <span className="text-2xl font-black text-[#00e3fd]">{formatCOP(total)}</span>
            </div>
          </div>

          {/* Guarantee Pill */}
          <div className="p-3.5 rounded-xl bg-[#001426] border border-[#003357] flex items-center gap-3 text-xs text-slate-300">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              Certificación Cero Audio: Todos los equipos incluyen señalización por actuadores luminosos o hápticos.
            </span>
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl border border-slate-600 hover:bg-[#002b4d] text-slate-300 text-xs font-semibold transition-colors"
            >
              Volver al Carrito
            </button>
            <button
              type="button"
              onClick={handleGoToDelivery}
              className="px-6 py-3 rounded-xl bg-[#00e3fd] hover:bg-[#3ce9ff] text-[#001629] font-bold text-sm transition-all shadow-lg flex items-center gap-2"
            >
              <span>Continuar al Paso 2: Datos de Entrega</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PASO 2: DATOS DE ENTREGA (DEMOSTRACIÓN) */}
      {/* ======================================================== */}
      {currentStep === 2 && (
        <div className="rounded-3xl bg-[#001e36] border-2 border-[#004775] p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-[#003860] pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#00e3fd]" />
              <span>Paso 2: Datos de Entrega (Demostración)</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Ingresa los datos para simular el despacho accesible. Solo se solicitan datos de demostración.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Nombre del destinatario */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#00e3fd]" />
                <span>Nombre del Destinatario: <span className="text-red-400">*</span></span>
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Ej. Elena Gómez Morales"
                className="w-full px-4 py-2.5 rounded-xl bg-[#001426] border border-[#003459] text-white text-sm focus:border-[#00e3fd] focus:outline-none"
              />
            </div>

            {/* 2. Dirección */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#00e3fd]" />
                <span>Dirección: <span className="text-red-400">*</span></span>
              </label>
              <input
                type="text"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Calle, número exterior/interior, colonia"
                className="w-full px-4 py-2.5 rounded-xl bg-[#001426] border border-[#003459] text-white text-sm focus:border-[#00e3fd] focus:outline-none"
              />
            </div>

            {/* 3. Ciudad */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#00e3fd]" />
                <span>Ciudad: <span className="text-red-400">*</span></span>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ej. Ciudad de México, Guadalajara, Monterrey"
                className="w-full px-4 py-2.5 rounded-xl bg-[#001426] border border-[#003459] text-white text-sm focus:border-[#00e3fd] focus:outline-none"
              />
            </div>

            {/* 4. Teléfono */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#00e3fd]" />
                <span>Teléfono (para Alertas SMS Visuales): <span className="text-red-400">*</span></span>
              </label>
              <input
                type="text"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="Ej. +52 55 9876 5432"
                className="w-full px-4 py-2.5 rounded-xl bg-[#001426] border border-[#003459] text-white text-sm focus:border-[#00e3fd] focus:outline-none"
              />
            </div>

            {/* 5. Observaciones opcionales */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#00e3fd]" />
                <span>Observaciones Opcionales:</span>
              </label>
              <textarea
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                rows={2}
                placeholder="Ej. No llamar por teléfono. Tocar timbre luminoso o enviar SMS de llegada."
                className="w-full px-4 py-2.5 rounded-xl bg-[#001426] border border-[#003459] text-white text-sm focus:border-[#00e3fd] focus:outline-none"
              />
            </div>
          </div>

          {/* Canal de Notificación Accesible */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold text-white uppercase tracking-wider block">
              Canal de Notificación Escrita Preferido:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setShippingChannel('sms_visual');
                  onTriggerFlash();
                }}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all space-y-1 ${
                  shippingChannel === 'sms_visual'
                    ? 'bg-[#002f52] border-[#00e3fd] shadow-md'
                    : 'bg-[#001426] border-[#002f52] hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <MessageSquare className="w-4 h-4 text-[#00e3fd]" />
                  {shippingChannel === 'sms_visual' && <CheckCircle2 className="w-4 h-4 text-[#00e3fd]" />}
                </div>
                <h4 className="font-bold text-white text-xs">SMS Visual Móvil</h4>
                <p className="text-[11px] text-slate-300">Mensajes de texto en tiempo real.</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShippingChannel('email_escrito');
                  onTriggerFlash();
                }}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all space-y-1 ${
                  shippingChannel === 'email_escrito'
                    ? 'bg-[#002f52] border-[#00e3fd] shadow-md'
                    : 'bg-[#001426] border-[#002f52] hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Mail className="w-4 h-4 text-sky-400" />
                  {shippingChannel === 'email_escrito' && <CheckCircle2 className="w-4 h-4 text-[#00e3fd]" />}
                </div>
                <h4 className="font-bold text-white text-xs">Correo Electrónico</h4>
                <p className="text-[11px] text-slate-300">Guía escrita y acuse digital.</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShippingChannel('dashboard');
                  onTriggerFlash();
                }}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all space-y-1 ${
                  shippingChannel === 'dashboard'
                    ? 'bg-[#002f52] border-[#00e3fd] shadow-md'
                    : 'bg-[#001426] border-[#002f52] hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                  {shippingChannel === 'dashboard' && <CheckCircle2 className="w-4 h-4 text-[#00e3fd]" />}
                </div>
                <h4 className="font-bold text-white text-xs">Portal en Vivo</h4>
                <p className="text-[11px] text-slate-300">Radar satelital en pantalla.</p>
              </button>
            </div>
          </div>

          {/* Protocol Checkbox */}
          <div className="p-4 rounded-xl bg-[#001426] border border-[#003459] flex items-start gap-3">
            <input
              type="checkbox"
              id="noCalls"
              checked={acceptNoCalls}
              onChange={(e) => setAcceptNoCalls(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded border-slate-600 text-[#00e3fd] focus:ring-[#00e3fd] bg-[#001e36]"
            />
            <label htmlFor="noCalls" className="text-xs text-slate-200 cursor-pointer leading-relaxed">
              <strong className="text-white">Compromiso Cero Audio:</strong> Confirmo que autorizo al mensajero a entregar con timbre luminoso o SMS y eximo de cualquier llamada telefónica sonora.
            </label>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                setCurrentStep(1);
                onTriggerFlash();
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-600 hover:bg-[#002b4d] text-slate-300 text-xs font-semibold transition-colors"
            >
              Volver al Paso 1
            </button>
            <button
              type="button"
              onClick={handleGoToConfirmation}
              className="px-6 py-3 rounded-xl bg-[#00e3fd] hover:bg-[#3ce9ff] text-[#001629] font-bold text-sm transition-all shadow-lg flex items-center gap-2"
            >
              <span>Continuar al Paso 3: Confirmación</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PASO 3: CONFIRMACIÓN DEL PEDIDO */}
      {/* ======================================================== */}
      {currentStep === 3 && (
        <div className="rounded-3xl bg-[#001e36] border-2 border-[#004775] p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-[#003860] pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#00e3fd]" />
              <span>Paso 3: Confirmación Final del Pedido Simulado</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Revisa la información consolidada antes de emitir tu orden con estado inicial <strong className="text-amber-300">Pendiente</strong>.
            </p>
          </div>

          {/* Summary Box: Items in Order */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Resumen de Equipos ({cart.length}):
            </h3>
            <div className="space-y-2">
              {cart.map((item) => (
                <div 
                  key={item.product.id}
                  className="p-3.5 rounded-xl bg-[#001426] border border-[#002f52] flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product.images.primary}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-lg object-cover border border-[#003860]"
                    />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">{item.product.name}</h4>
                      <span className="text-[11px] text-[#00e3fd] font-mono">
                        {item.product.code} · Cantidad: {item.quantity} · P.U. {formatCOP(item.product.price)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-white">
                      {formatCOP(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Details Summary Card */}
          <div className="p-4 rounded-2xl bg-[#001426] border border-[#003459] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block">Destinatario:</span>
              <strong className="text-white text-sm">{recipientName}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Teléfono / SMS:</span>
              <span className="text-[#00e3fd] font-mono font-semibold">{contactNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Dirección:</span>
              <span className="text-slate-200">{shippingAddress}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Ciudad:</span>
              <span className="text-white font-semibold">{city}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Canal de Notificación:</span>
              <span className="text-[#00e3fd] font-bold uppercase">{shippingChannel.replace('_', ' ')}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Observaciones:</span>
              <span className="text-slate-300 italic">{deliveryNotes || 'Ninguna observación especificada.'}</span>
            </div>
          </div>

          {/* Totals Box */}
          <div className="p-4 rounded-2xl bg-[#00233d] border border-[#004775] space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Subtotal:</span>
              <span className="font-semibold text-white">{formatCOP(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>IVA Incluido (19% simulado):</span>
              <span className="font-semibold text-white">{formatCOP(tax)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Costo de Envío Inclusivo:</span>
              <span className="text-emerald-400 font-bold uppercase">Gratuito ($ 0 COP)</span>
            </div>
            <div className="pt-2 border-t border-[#003459] flex justify-between items-baseline">
              <span className="text-sm font-bold text-white">Importe Total Simulado:</span>
              <span className="text-2xl font-black text-[#00e3fd]">{formatCOP(total)}</span>
            </div>
          </div>

          {/* Initial Status Notice */}
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/50 flex items-start gap-3 text-xs text-amber-200">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-white text-sm mb-0.5">
                Asignación de Estado Inicial: “Pendiente”
              </span>
              <span>
                Al emitir el pedido se generará un código simulado único, se guardará en tu navegador (localStorage), 
                se vaciará el carrito y podrás consultar el pedido en cualquier momento desde el historial.
                No se aplican cobros bancarios reales.
              </span>
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setCurrentStep(2);
                onTriggerFlash();
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-600 hover:bg-[#002b4d] text-slate-300 text-xs font-semibold transition-colors"
            >
              Volver a Datos de Entrega
            </button>
            <button
              type="button"
              onClick={handleConfirmFinalOrder}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#34a273] hover:bg-[#3cc88f] text-[#001629] font-black text-sm sm:text-base transition-all shadow-xl shadow-[#34a273]/30 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Confirmar Pedido Simulado</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
