import React, { useEffect, useRef, useState } from "react";
import { CartItem, SimulatedOrder, UserAccount } from "../../types";
import {
  ArrowLeft,
  Truck,
  ShieldCheck,
  MapPin,
  Phone,
  FileText,
  ShoppingBag,
  Sparkles,
  Info,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import { formatCOP } from "../../utils/formatters";
import { useToast } from "../../context/ToastContext";
import { useSignLanguage } from "../../context/SignLanguageContext";
import { createMercadoPagoSandboxPreference } from "../../utils/salesAnalyticsApi";
import { parseMercadoPagoReturn } from "../../utils/mercadoPagoReturn";
import { confirmMercadoPagoSandboxPayment } from "../../utils/ordersApi";

interface AccessibleWrittenCheckoutProps {
  cart: CartItem[];
  currentUser: UserAccount | null;
  onBackToCart: () => void;
  onPaymentVerified: (order: SimulatedOrder) => void;
  onTriggerFlash: () => void;
}

export function AccessibleWrittenCheckout({
  cart,
  currentUser,
  onBackToCart,
  onPaymentVerified,
  onTriggerFlash,
}: AccessibleWrittenCheckoutProps) {
  const { showToast } = useToast();
  const { setInterpreterVideo } = useSignLanguage();
  const processedReturn = useRef(false);
  const creatingPreference = useRef(false);
  const verifyingPayment = useRef(false);

  // Datos de entrega escrita
  const [recipientName, setRecipientName] = useState(
    currentUser?.name || "Elena Gómez Morales",
  );
  const [shippingAddress, setShippingAddress] = useState(
    "Carrera 7 # 71 - 21, Torre A, Apto 502",
  );
  const [city, setCity] = useState("Bogotá D.C.");
  const [contactNumber, setContactNumber] = useState(
    currentUser?.phone || "+57 310 987 6543",
  );
  const [deliveryNotes, setDeliveryNotes] = useState(
    "Por favor tocar timbre con señal luminosa o enviar mensaje de texto. No llamar por voz.",
  );
  const [notificationChannel, setNotificationChannel] = useState<
    "sms_visual" | "email_escrito" | "dashboard"
  >("sms_visual");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentReturn, setPaymentReturn] = useState<{
    paymentId: string;
    externalReference: string;
  } | null>(null);
  const [confirmWrittenOnly, setConfirmWrittenOnly] = useState(true);

  // Estados de error ergonómico
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cálculos económicos claros
  const subtotal = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0,
  );
  const tax = Math.round(subtotal * 0.19); // 19% IVA
  const shipping = 0; // Envío inclusivo gratuito
  const total = subtotal + tax + shipping;

  useEffect(() => {
    setInterpreterVideo(
      import.meta.env.VITE_LSC_CHECKOUT_SUMMARY_VIDEO ??
        import.meta.env.VITE_LSC_CHECKOUT_VIDEO ??
        import.meta.env.VITE_LSC_DEFAULT_VIDEO,
      `Desglose del carrito en pesos colombianos. Total a pagar: ${formatCOP(total)}.`,
    );
  }, [setInterpreterVideo, total]);

  const handleContinueToPayment = async () => {
    if (creatingPreference.current) return;
    setErrorMessage(null);

    if (
      !recipientName.trim() ||
      !shippingAddress.trim() ||
      !city.trim() ||
      !contactNumber.trim()
    ) {
      setErrorMessage(
        "Por favor completa todos los campos de dirección y contacto escrito.",
      );
      onTriggerFlash();
      return;
    }

    if (!confirmWrittenOnly) {
      setErrorMessage(
        "Por favor confirma la casilla de entrega sin llamadas auditivas.",
      );
      onTriggerFlash();
      return;
    }

    const orderId = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)
      .toUpperCase()}`;
    const newOrder: SimulatedOrder = {
      orderId,
      userId: currentUser?.id || "usr-guest",
      userEmail: currentUser?.email || "cliente@softtech.com",
      date: new Date().toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      items: [...cart],
      subtotal,
      tax,
      shipping,
      total,
      status: "confirmado",
      shippingChannel: notificationChannel,
      shippingAddress: `${shippingAddress}, ${city}`,
      city,
      recipientName,
      contactNumber,
      notes: deliveryNotes,
      visualCheckConfirmed: true,
      trackingHistory: [
        {
          step: "Pedido Confirmado",
          date: "Hoy",
          done: true,
          active: true,
          desc: "Tu compra ha sido verificada. Despacho coordinado vía SMS visual.",
        },
        {
          step: "Preparación en Bodega",
          date: "Próximamente",
          done: false,
          active: false,
          desc: "Empaque con sello de protección y verificación de alertas luminosas.",
        },
        {
          step: "En Camino Silencioso",
          date: "Próximamente",
          done: false,
          active: false,
          desc: "Mensajero notificado: contacto exclusivo por texto o timbre visual.",
        },
      ],
    };

    try {
      creatingPreference.current = true;
      setIsProcessingPayment(true);
      setInterpreterVideo(
        import.meta.env.VITE_LSC_CHECKOUT_SUMMARY_VIDEO ??
          import.meta.env.VITE_LSC_CHECKOUT_VIDEO ??
          import.meta.env.VITE_LSC_DEFAULT_VIDEO,
        `Redirigiendo al checkout seguro de Mercado Pago para pagar ${formatCOP(total)}.`,
      );
      const sandboxUrl = await createMercadoPagoSandboxPreference(newOrder);
      window.location.assign(sandboxUrl);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo abrir Mercado Pago. Inténtalo nuevamente.",
      );
      onTriggerFlash();
    } finally {
      creatingPreference.current = false;
      setIsProcessingPayment(false);
    }
  };

  const verifyReturnedPayment = (
    paymentId: string,
    externalReference: string,
  ) => {
    if (verifyingPayment.current) return;
    verifyingPayment.current = true;
    setIsProcessingPayment(true);
    setErrorMessage(null);
    void confirmMercadoPagoSandboxPayment(paymentId, externalReference)
      .then((order) => {
        setPaymentReturn(null);
        setInterpreterVideo(
          import.meta.env.VITE_LSC_CHECKOUT_CONFIRMATION_VIDEO ??
            import.meta.env.VITE_LSC_CHECKOUT_VIDEO ??
            import.meta.env.VITE_LSC_DEFAULT_VIDEO,
          `Pago de prueba aprobado en Mercado Pago. Pedido ${order.orderId} por ${formatCOP(order.total)}.`,
        );
        onPaymentVerified(order);
        showToast({
          type: "success",
          title: "¡Pago de prueba aprobado!",
          message: `Mercado Pago confirmó ${formatCOP(order.total)} para el pedido ${order.orderId}.`,
          badge: "Cuenta de prueba · Sin dinero real",
          actionLabel: "Ver Detalle del Pedido",
          onAction: () => {
            window.location.hash = "#pedidos";
          },
        });
      })
      .catch((error: unknown) => {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No se pudo verificar el pago con Mercado Pago.",
        );
        onTriggerFlash();
      })
      .finally(() => {
        verifyingPayment.current = false;
        setIsProcessingPayment(false);
      });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment_return") !== "1" || processedReturn.current) return;
    processedReturn.current = true;

    const { status, paymentId, externalReference } = parseMercadoPagoReturn(
      window.location.search,
    );
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}${window.location.hash}`,
    );

    if (!paymentId || !externalReference) {
      setErrorMessage(
        status === "pending"
          ? "Mercado Pago dejó el pago en estado pendiente. Vuelve a intentarlo cuando se complete."
          : status === "approved"
            ? "Mercado Pago no devolvió los datos necesarios para verificar el pago."
            : "El pago no fue aprobado por Mercado Pago. No se registró el pedido.",
      );
      return;
    }

    setPaymentReturn({ paymentId, externalReference });
    verifyReturnedPayment(paymentId, externalReference);
  }, [onPaymentVerified, onTriggerFlash, setInterpreterVideo, showToast]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-16 text-left">
      {/* Botón de Regreso Ergonómico */}
      <button
        type="button"
        onClick={onBackToCart}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#cfdbe5] text-[#244f77] hover:bg-[#f1f6fa] text-xs sm:text-sm font-semibold transition-all duration-200"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Regresar al Carrito de Compras</span>
      </button>

      {/* Encabezado Principal */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#dde3ea] shadow-xs space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f5ef] border border-[#a2cfbc] text-[#134333] text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-[#207a5c]" />
          Checkout Pro de Mercado Pago · Modo Sandbox
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a2330]">
          Confirmación de Compra y Despacho Visual
        </h1>
        <p className="text-xs sm:text-sm text-[#526377] leading-relaxed max-w-3xl">
          Tu pago se verifica directamente con Mercado Pago.Recibirás la
          confirmación de tu compra en pantalla.
        </p>
      </div>

      {/* Alerta de Validación Amable en Melocotón/Terracota */}
      {errorMessage && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-[#faeae4] border border-[#e6b9ac] flex items-start gap-3 text-[#5d2317] animate-fadeIn"
        >
          <AlertTriangle className="w-5 h-5 text-[#9c3f2d] shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <strong className="block font-bold">
              No se pudo completar el pago:
            </strong>
            <span>{errorMessage}</span>
            {paymentReturn && (
              <button
                type="button"
                onClick={() =>
                  verifyReturnedPayment(
                    paymentReturn.paymentId,
                    paymentReturn.externalReference,
                  )
                }
                disabled={isProcessingPayment}
                className="mt-3 block rounded-lg border border-[#9c3f2d] px-3 py-2 font-semibold text-[#5d2317] hover:bg-[#f4d7ce] disabled:opacity-60"
              >
                {isProcessingPayment
                  ? "Verificando pago..."
                  : "Volver a verificar el pago"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Contenido en Dos Columnas: Formulario Escrito y Resumen Financiero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna Izquierda: Datos de Entrega y Canal Escrito (7 columnas) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Tarjeta 1: Destinatario y Ubicación */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#dde3ea] shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#1b2533] flex items-center gap-2 border-b border-[#eef2f6] pb-3">
              <MapPin className="w-5 h-5 text-[#2b567b]" />
              <span>Dirección de Despacho y Entrega</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#1b2432] mb-1">
                  Nombre Completo del Destinatario:
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#fbfcfd] border border-[#cfdbe5] text-[#1b2432] text-sm focus:outline-none focus:ring-2 focus:ring-[#2b567b] transition-all duration-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#1b2432] mb-1">
                    Dirección (Calle, Número, Apto):
                  </label>
                  <input
                    type="text"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#fbfcfd] border border-[#cfdbe5] text-[#1b2432] text-sm focus:outline-none focus:ring-2 focus:ring-[#2b567b] transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#1b2432] mb-1">
                    Ciudad / Municipio:
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#fbfcfd] border border-[#cfdbe5] text-[#1b2432] text-sm focus:outline-none focus:ring-2 focus:ring-[#2b567b] transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#1b2432] mb-1">
                  Teléfono Móvil para Notificación por SMS:
                </label>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#fbfcfd] border border-[#cfdbe5] text-[#1b2432] text-sm focus:outline-none focus:ring-2 focus:ring-[#2b567b] transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#1b2432] mb-1">
                  Instrucciones Especiales para el Mensajero (Cero Audio):
                </label>
                <textarea
                  rows={2}
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#fbfcfd] border border-[#cfdbe5] text-[#1b2432] text-sm focus:outline-none focus:ring-2 focus:ring-[#2b567b] transition-all duration-200 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Canal de Notificación Escrita */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#dde3ea] shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#1b2533] flex items-center gap-2 border-b border-[#eef2f6] pb-3">
              <Phone className="w-5 h-5 text-[#207a5c]" />
              <span>Canal Exclusivo de Comunicación de Entrega</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: "sms_visual",
                  label: "SMS Visual",
                  desc: "Alertas escritas a tu celular",
                },
                {
                  id: "email_escrito",
                  label: "Correo Escrito",
                  desc: "Reporte fotográfico de guía",
                },
                {
                  id: "dashboard",
                  label: "Panel Web",
                  desc: "Seguimiento en tiempo real",
                },
              ].map((channel) => (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() => setNotificationChannel(channel.id as any)}
                  className={`p-3.5 rounded-2xl border text-left transition-all duration-200 ${
                    notificationChannel === channel.id
                      ? "bg-[#eef6f2] border-[#a1cfbc] text-[#123e2f] shadow-xs"
                      : "bg-[#fbfcfd] border-[#dde4eb] text-[#55697f] hover:bg-[#f2f6fa]"
                  }`}
                >
                  <p className="font-bold text-xs sm:text-sm text-[#192330]">
                    {channel.label}
                  </p>
                  <p className="text-[11px] text-[#5e7388] mt-0.5">
                    {channel.desc}
                  </p>
                </button>
              ))}
            </div>

            {/* Checkbox de Confirmación Inclusiva */}
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#f5f8fa] border border-[#d6e1ea] cursor-pointer">
              <input
                type="checkbox"
                checked={confirmWrittenOnly}
                onChange={(e) => setConfirmWrittenOnly(e.target.checked)}
                className="w-4 h-4 text-[#207a5c] rounded mt-0.5"
              />
              <span className="text-xs text-[#2b445c] leading-relaxed">
                Acepto que la entrega se realice mediante{" "}
                <strong>aviso visual o SMS sin llamadas sonoras</strong>,
                respetando la total accesibilidad del servicio.
              </span>
            </label>
          </div>
        </div>

        {/* Columna Derecha: Desglose Ergonómico del Carrito y Botón Confirmar (5 columnas) */}
        <div className="lg:col-span-5 space-y-6">
          <section
            aria-labelledby="simulated-payment-heading"
            className="rounded-3xl border-2 border-[#8bc7dc] bg-[#edf7fb] p-6 sm:p-7 shadow-xs space-y-4"
          >
            <div className="flex items-start gap-3">
              <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-[#145b86]" />
              <div>
                <h2
                  id="simulated-payment-heading"
                  className="font-bold text-[#15334a]"
                >
                  Pagar con Mercado Pago
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-[#38556b]">
                  Se abrirá el checkout oficial de pruebas de Mercado Pago.
                  Inicia sesión allí con una cuenta de prueba de comprador; las
                  credenciales de tu tienda no se envían.
                </p>
              </div>
            </div>
            <p className="rounded-xl border border-[#b8d7e5] bg-white p-3 text-sm font-bold text-[#15334a]">
              Total: {formatCOP(total)}
            </p>
          </section>

          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#dde3ea] shadow-xs space-y-5">
            <h2 className="text-base font-bold text-[#1b2533] flex items-center justify-between border-b border-[#eef2f6] pb-3">
              <span className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#2b567b]" />
                <span>Desglose de Artículos</span>
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#eef3f7] text-[#244f77]">
                {cart.length} {cart.length === 1 ? "equipo" : "equipos"}
              </span>
            </h2>

            {/* Lista de Productos con Tipografía Amplia y Alto Contraste Suavizado */}
            <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-[#f9fafb] border border-[#e8edf2]"
                >
                  <img
                    src={item.product.images.primary}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover border border-[#e0e7ee] bg-white shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#192330] truncate">
                      {item.product.name}
                    </p>
                    <p className="text-[11px] text-[#55697f]">
                      {item.quantity} × {formatCOP(item.product.price)}
                    </p>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#192330] shrink-0">
                    {formatCOP(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Resumen Económico */}
            <div className="pt-4 border-t border-[#eef2f6] space-y-2 text-xs sm:text-sm text-[#526377]">
              <div className="flex justify-between">
                <span>Subtotal equipos:</span>
                <span className="font-semibold text-[#192330]">
                  {formatCOP(subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>IVA estimado (19%):</span>
                <span className="font-semibold text-[#192330]">
                  {formatCOP(tax)}
                </span>
              </div>
              <div className="flex justify-between text-[#164e3b]">
                <span>Envío inclusivo Cero Audio:</span>
                <span className="font-bold uppercase text-[11px] px-2 py-0.5 rounded bg-[#e8f5ef]">
                  Gratis ($0)
                </span>
              </div>
              <div className="pt-3 border-t border-[#e2e8f0] flex justify-between items-baseline">
                <span className="text-sm font-bold text-[#192330]">
                  Total a Pagar:
                </span>
                <span className="text-2xl font-black text-[#1b2533] tracking-tight">
                  {formatCOP(total)}
                </span>
              </div>
            </div>

            {/* BOTÓN PRINCIPAL AMABLE: Confirmar compra */}
            <button
              type="button"
              onClick={handleContinueToPayment}
              disabled={isProcessingPayment}
              className="checkout-confirm-button w-full min-h-16 py-4 px-6 rounded-2xl bg-[#14532d] hover:bg-[#166534] disabled:cursor-wait disabled:opacity-60 text-white font-extrabold text-base sm:text-lg shadow-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#0f5d8a]"
            >
              <CreditCard className="w-6 h-6" />
              <span>
                {isProcessingPayment
                  ? "Conectando con Mercado Pago..."
                  : "Pagar con Mercado Pago"}
              </span>
            </button>

            <p className="text-[11px] text-center text-[#55697f] leading-snug">
              Checkout oficial de Mercado Pago en modo de prueba. No se mueve
              dinero real.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
