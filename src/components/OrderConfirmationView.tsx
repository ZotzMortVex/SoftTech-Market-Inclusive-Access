import { useState } from 'react';
import { SimulatedOrder, ActiveView } from '../types';
import { 
  CheckCircle2, 
  MapPin, 
  Truck, 
  RefreshCw, 
  ArrowRight, 
  ArrowLeft,
  Calendar,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { formatCOP } from '../utils/formatters';

interface OrderConfirmationViewProps {
  order: SimulatedOrder;
  isRegisteredCustomer: boolean;
  onNavigate: (view: ActiveView) => void;
  onTriggerFlash: () => void;
}

export function OrderConfirmationView({
  order,
  isRegisteredCustomer,
  onNavigate,
  onTriggerFlash
}: OrderConfirmationViewProps) {
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [satellitePosition, setSatellitePosition] = useState('Sector Centro-Reforma (Lat: 19.4326° N, Lon: -99.1332° W)');

  const handleRefreshRadar = () => {
    setIsUpdatingLocation(true);
    onTriggerFlash();
    setTimeout(() => {
      setIsUpdatingLocation(false);
      const locations = [
        'Av. Insurgentes Sur esq. Chapultepec · Unidad 14 en ruta',
        'Sector Polanco-Reforma · Próximo a cruce semafórico',
        'Centro de Distribución Poniente · Salida a corredor vial',
        'A 1.2 km de tu dirección registrada · Notificación SMS enviada'
      ];
      setSatellitePosition(locations[Math.floor(Math.random() * locations.length)]);
    }, 800);
  };

  return (
    <div className="order-confirmation-view space-y-8 animate-fadeIn pb-16 text-left max-w-5xl mx-auto">
      {/* Top Banner: Green Visual Confirmation */}
      <div className="order-confirmation-banner p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#002f23] via-[#001f2e] to-[#001729] border-2 border-[#34a273] shadow-2xl space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#34a273] text-[#001629] flex items-center justify-center font-black shrink-0 shadow-lg shadow-[#34a273]/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                Certeza Visual Comprobada
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Pedido Simulado Confirmado
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Código de seguimiento único:{' '}
                <strong className="font-mono text-[#00e3fd] text-base">{order.orderId}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5 self-start sm:self-auto">
            <span className={`px-3 py-1 rounded-full font-bold text-xs border ${
              order.status === 'pendiente' || order.status === 'confirmado'
                ? 'bg-red-100 border-red-300 text-red-900'
                : order.status === 'preparacion'
                ? 'bg-purple-100 border-purple-300 text-purple-900'
                : order.status === 'enviado' || order.status === 'en_camino' || order.status === 'despachado'
                ? 'bg-yellow-100 border-yellow-300 text-yellow-900'
                : order.status === 'entregado'
                ? 'bg-green-100 border-green-300 text-green-900'
                : 'bg-red-100 border-red-300 text-red-900'
            }`}>
              Estado: {
                order.status === 'pendiente' 
                  ? 'Pendiente' 
                  : order.status === 'preparacion'
                  ? 'En preparación'
                  : order.status === 'enviado' || order.status === 'en_camino' 
                  ? 'Enviado' 
                  : order.status === 'entregado' 
                  ? 'Entregado' 
                  : 'Pendiente'
              }
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{order.date}</span>
            </span>
          </div>
        </div>

        {/* Sensory Delivery Notice */}
        <div className="order-confirmation-notice p-3.5 rounded-xl bg-[#001426] border border-[#003860] flex items-center gap-3 text-xs text-slate-200">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            Protocolo 100% Cero Audio activo: Tu pedido será notificado vía <strong className="text-[#00e3fd] uppercase">{order.shippingChannel.replace('_', ' ')}</strong> y entregado mediante señal luminosa.
          </span>
        </div>
      </div>

      {/* Grid: Logistic Timeline (4 phases) + Satellite Tracking Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: 4-Phase Logistic Timeline (Stitch Screen 2) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl bg-[#001e36] border-2 border-[#004775] p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#003860] pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#00e3fd]" />
                <span>Línea de Tiempo Logística (4 Fases)</span>
              </h2>
              <span className="text-xs text-slate-400 font-mono">Actualización en Vivo</span>
            </div>

            <div className="space-y-6 pl-2">
              {order.trackingHistory.map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                  {/* Vertical connector line */}
                  {idx < order.trackingHistory.length - 1 && (
                    <div 
                      className={`absolute left-4 top-8 -bottom-6 w-0.5 ${
                        step.done ? 'bg-[#34a273]' : 'bg-[#003459]'
                      }`} 
                    />
                  )}

                  {/* Step Icon Node */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 font-bold text-xs transition-all ${
                    step.done 
                      ? 'bg-[#34a273] text-[#001629] shadow-md shadow-[#34a273]/30' 
                      : step.active
                      ? 'bg-[#00e3fd] text-[#001629] ring-4 ring-[#00e3fd]/20 animate-pulse'
                      : 'bg-[#001b33] border-2 border-slate-600 text-slate-400'
                  }`}>
                    {step.done ? '✓' : idx + 1}
                  </div>

                  {/* Step Description */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`text-sm font-bold ${
                        step.done ? 'text-white' : step.active ? 'text-[#00e3fd]' : 'text-slate-400'
                      }`}>
                        {step.step}
                      </h4>
                      <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded bg-[#001426] border border-[#002f52]">
                        {step.date}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Items Summary in Order */}
          <div className="rounded-3xl bg-[#001a30] border-2 border-[#003860] p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Equipos Registrados en el Envío:
            </h3>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#001426] border border-[#002b4d]">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product.images.primary}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-lg object-cover border border-[#003459]"
                    />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">{item.product.name}</h4>
                      <span className="text-xs text-[#00e3fd] font-mono">{item.product.code} · Cant: {item.quantity}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-white">{formatCOP(item.product.price * item.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#003154] flex justify-between items-center text-xs">
              <span className="text-slate-400">Total liquidado (simulado):</span>
              <span className="text-lg font-black text-[#00e3fd]">{formatCOP(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Simulated Satellite Map & Actions */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Simulated Satellite Map Card (Stitch Screen 2) */}
          <div className="rounded-3xl bg-[#001e36] border-2 border-[#004775] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#003860] pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#00e3fd]" />
                <h3 className="text-sm font-bold text-white">Radar Satelital Simulado</h3>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            </div>

            {/* Visual Radar Mock Viewport */}
            <div className="relative aspect-video rounded-2xl bg-[#001121] border-2 border-[#003a61] overflow-hidden flex items-center justify-center p-4">
              {/* Radar Grid Graphic */}
              <div className="absolute inset-0 bg-[radial-gradient(#00e3fd_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
              
              {/* Radar sweep ring */}
              <div className="w-32 h-32 rounded-full border border-[#00e3fd]/40 animate-spin flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 rounded-full border border-[#34a273]/50" />
              </div>

              {/* Delivery Pin */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[#00e3fd] text-[#001629] flex items-center justify-center font-bold shadow-lg shadow-[#00e3fd]/40 animate-bounce">
                  🚚
                </div>
                <span className="mt-1 px-2 py-0.5 rounded bg-black/90 text-[10px] font-mono text-[#00e3fd] border border-[#004775]">
                  UNIDAD ACCESIBLE #STK
                </span>
              </div>
            </div>

            {/* Satellite location info */}
            <div className="p-3 rounded-xl bg-[#001426] border border-[#003459] text-xs space-y-1">
              <span className="text-slate-400 block text-[11px]">Ubicación del Transportista:</span>
              <p className="font-mono text-[#00e3fd] font-semibold text-xs leading-relaxed">
                {satellitePosition}
              </p>
            </div>

            {/* Refresh Satellite Location Button */}
            <button
              type="button"
              onClick={handleRefreshRadar}
              disabled={isUpdatingLocation}
              className="confirmation-refresh-button w-full py-2.5 px-4 rounded-xl bg-[#002b4d] hover:bg-[#003966] text-[#00e3fd] font-semibold text-xs transition-colors border border-[#004b7d] flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isUpdatingLocation ? 'animate-spin' : ''}`} />
              <span>{isUpdatingLocation ? 'Sincronizando coordenadas...' : 'Actualizar Posición Satelital'}</span>
            </button>
          </div>

          {/* Destination Details Card */}
          <div className="rounded-3xl bg-[#001e36] border-2 border-[#004775] p-6 shadow-2xl space-y-3 text-xs">
            <h3 className="text-sm font-bold text-white border-b border-[#003860] pb-2">
              Datos Registrados de Entrega
            </h3>

            <div className="space-y-1">
              <span className="text-slate-400 block">Receptor:</span>
              <strong className="text-white text-sm">{order.recipientName}</strong>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 block">Dirección:</span>
              <p className="text-slate-200">{order.shippingAddress}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 block">Canal SMS:</span>
              <p className="text-[#00e3fd] font-mono">{order.contactNumber}</p>
            </div>

            {order.notes && (
              <div className="p-2.5 rounded-lg bg-[#001426] border border-[#002f52] text-slate-300">
                <span className="font-bold text-white block text-[11px]">Nota especial:</span>
                "{order.notes}"
              </div>
            )}
          </div>

          {order.payment && (
            <section
              aria-labelledby="payment-receipt-heading"
              className="payment-receipt rounded-3xl border-2 border-emerald-500/60 bg-[#00261f] p-6 shadow-2xl space-y-3 text-xs"
            >
              <h3
                id="payment-receipt-heading"
                className="flex items-center gap-2 border-b border-emerald-800 pb-2 text-sm font-bold text-white"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Comprobante de pago Mercado Pago (prueba)
              </h3>
              <p className="text-emerald-200">
                {order.payment.provider === "mercadopago_sandbox"
                  ? "Pago aprobado por Mercado Pago en modo sandbox. No se movió dinero real."
                  : "Aprobado en el simulador local. No se movió dinero real."}
              </p>
              <div className="flex justify-between gap-3 text-slate-300">
                <span>Cuenta de prueba:</span>
                <span className="break-all text-right">{order.payment.accountEmail}</span>
              </div>
              <div className="flex justify-between gap-3 text-slate-300">
                <span>Subtotal:</span>
                <span className="font-bold text-white">{formatCOP(order.subtotal)}</span>
              </div>
              <div className="flex justify-between gap-3 text-slate-300">
                <span>IVA:</span>
                <span className="font-bold text-white">{formatCOP(order.tax)}</span>
              </div>
              <div className="flex justify-between gap-3 text-slate-300">
                <span>Importe:</span>
                <span className="font-bold text-white">{formatCOP(order.payment.amount)}</span>
              </div>
              {order.payment.balanceAfter !== undefined && (
                <div className="flex justify-between gap-3 text-slate-300">
                  <span>Saldo virtual restante:</span>
                  <span className="font-bold text-white">{formatCOP(order.payment.balanceAfter)}</span>
                </div>
              )}
              <p className="break-all font-mono text-[10px] text-slate-400">
                ID de pago de prueba: {order.payment.paymentId}
              </p>
            </section>
          )}

          {/* Navigation Action Buttons */}
          <div className="space-y-3">
            {isRegisteredCustomer && (
              <button
                type="button"
                onClick={() => onNavigate('order_history')}
                className="confirmation-orders-button w-full py-3.5 px-4 rounded-2xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <span>Ver en Mis Pedidos</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigate('catalog')}
              className="confirmation-catalog-button w-full text-center text-xs text-slate-400 hover:text-white py-2 flex items-center justify-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Regresar al Catálogo Tecnológico</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
