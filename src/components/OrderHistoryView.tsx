import React, { useState, useMemo } from 'react';
import { SimulatedOrder, ActiveView, UserAccount, UserRole } from '../types';
import { 
  PackageCheck, 
  Calendar, 
  ArrowRight, 
  Eye, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Boxes,
  Search,
  ShoppingBag,
  User,
  Lock,
  Info,
  Check,
  Copy,
  Sparkles,
  MapPin,
  FileText
} from 'lucide-react';
import { formatCOP } from '../utils/formatters';

interface OrderHistoryViewProps {
  orders: SimulatedOrder[];
  currentUser: UserAccount | null;
  userRole: UserRole;
  onSelectOrder: (order: SimulatedOrder) => void;
  onNavigate: (view: ActiveView) => void;
  onRequestAuthModal?: (actionDesc?: string) => void;
  onTriggerFlash: () => void;
  isLoading?: boolean;
  loadError?: string | null;
  onRetry?: () => void;
}

export type StandardOrderStatus = 'pendiente' | 'preparacion' | 'enviado' | 'entregado';

export interface StatusMeta {
  key: StandardOrderStatus;
  label: string;
  supportingBadgeColor: string;
  cardBorderAccent: string;
  icon: typeof Clock;
  description: string;
}

export const ORDER_STATUSES: Record<string, StatusMeta> = {
  pendiente: {
    key: 'pendiente',
    label: 'Pendiente',
    supportingBadgeColor: 'bg-red-100 text-red-900 border-red-300',
    cardBorderAccent: 'border-l-amber-500',
    icon: Clock,
    description: 'Orden registrada en el sistema; en espera de validación en bodega e inicio de empaque.'
  },
  preparacion: {
    key: 'preparacion',
    label: 'En preparación',
    supportingBadgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    cardBorderAccent: 'border-l-blue-500',
    icon: Boxes,
    description: 'Equipo en inspección técnica de testigos lumínicos, calibración Cero Audio y embalaje protector.'
  },
  despachado: {
    key: 'despachado' as any,
    label: 'Despachado',
    supportingBadgeColor: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    cardBorderAccent: 'border-l-purple-500',
    icon: PackageCheck,
    description: 'Paquete precintado y entregado formalmente al operador logístico para su transporte.'
  },
  enviado: {
    key: 'enviado',
    label: 'Enviado',
    supportingBadgeColor: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    cardBorderAccent: 'border-l-[#00e3fd]',
    icon: Truck,
    description: 'En ruta con transportista accesible; seguimiento satelital activo y protocolo sin timbres sonoros.'
  },
  entregado: {
    key: 'entregado',
    label: 'Entregado',
    supportingBadgeColor: 'bg-green-100 text-green-900 border-green-300',
    cardBorderAccent: 'border-l-emerald-500',
    icon: CheckCircle2,
    description: 'Entregado presencialmente en domicilio con acuse visual y firma digital confirmada.'
  },
  // Retrocompatibilidad con valores existentes
  en_camino: {
    key: 'enviado',
    label: 'Enviado',
    supportingBadgeColor: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    cardBorderAccent: 'border-l-[#00e3fd]',
    icon: Truck,
    description: 'En ruta con transportista accesible; seguimiento satelital activo y protocolo sin timbres sonoros.'
  },
  confirmado: {
    key: 'pendiente',
    label: 'Pendiente',
    supportingBadgeColor: 'bg-red-100 text-red-900 border-red-300',
    cardBorderAccent: 'border-l-amber-500',
    icon: Clock,
    description: 'Orden registrada en el sistema; en espera de validación en bodega e inicio de empaque.'
  }
};

export function OrderHistoryView({
  orders,
  currentUser,
  userRole,
  onSelectOrder,
  onNavigate,
  onRequestAuthModal,
  onTriggerFlash,
  isLoading = false,
  loadError = null,
  onRetry,
}: OrderHistoryViewProps) {
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  const isRegisteredUser = !!currentUser && userRole === 'user';

  // El usuario SOLAMENTE puede consultar sus propios pedidos
  const userOwnOrders = useMemo(() => {
    if (!currentUser) return [];

    return orders.filter((order) => order.userId === currentUser.id);
  }, [orders, currentUser]);

  // Filtrado adicional de búsqueda y estado sobre los pedidos del usuario
  const filteredOrders = useMemo(() => {
    return userOwnOrders.filter((order) => {
      const canonicalKey = ORDER_STATUSES[order.status]?.key || 'pendiente';
      const matchesStatus = filterStatus === 'todos' || canonicalKey === filterStatus;
      
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesStatus;

      const matchesSearch = 
        order.orderId.toLowerCase().includes(q) ||
        (order.city && order.city.toLowerCase().includes(q)) ||
        order.shippingAddress.toLowerCase().includes(q) ||
        order.items.some(i => i.product.name.toLowerCase().includes(q) || i.product.code.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [userOwnOrders, filterStatus, searchQuery]);

  // Conteos por estado para las pestañas de filtro
  const counts = useMemo(() => {
    const res = {
      todos: userOwnOrders.length,
      pendiente: 0,
      preparacion: 0,
      enviado: 0,
      entregado: 0
    };
    userOwnOrders.forEach((o) => {
      const key = ORDER_STATUSES[o.status]?.key || 'pendiente';
      if (key in res) {
        res[key as keyof typeof res]++;
      }
    });
    return res;
  }, [userOwnOrders]);

  const handleCopyOrderId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id).catch(() => {});
    setCopiedOrderId(id);
    onTriggerFlash();
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  // CASO 1: Visitante no autenticado
  if (!isRegisteredUser) {
    return (
      <div className="space-y-8 animate-fadeIn pb-16 text-left max-w-4xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#00172b] border-2 border-[#00385c] text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#002440] border border-[#004e80] text-[#00e3fd] mx-auto flex items-center justify-center shadow-lg">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <span className="px-3 py-1 rounded-full bg-[#00e3fd]/10 text-[#00e3fd] text-xs font-bold uppercase tracking-wider border border-[#00e3fd]/30">
              Acceso para Usuarios Registrados
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Historial de Pedidos Protegido
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Inicia sesión con tu cuenta para consultar los números de tus pedidos, los productos comprados y el estado actual de cada entrega.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                onRequestAuthModal?.('consultar tu historial de pedidos');
                onTriggerFlash();
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#00e3fd] hover:bg-[#3de9ff] text-[#001629] font-black text-xs sm:text-sm transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>Iniciar Sesión / Registrarse</span>
            </button>

            <button
              onClick={() => {
                onNavigate('catalog');
                onTriggerFlash();
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#00243e] hover:bg-[#003357] text-slate-200 font-semibold text-xs sm:text-sm border border-[#00406b] transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explorar Catálogo Tecnológico</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div role="status" className="mx-auto max-w-4xl rounded-3xl border border-[#cfdbe5] bg-white p-10 text-center text-[#244f77] shadow-sm">
        <PackageCheck className="mx-auto mb-3 h-10 w-10 animate-pulse" aria-hidden="true" />
        <h1 className="text-xl font-bold">Cargando tus pedidos</h1>
        <p className="mt-2 text-sm">Consultando el historial asociado a tu cuenta.</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 rounded-3xl border border-red-300 bg-red-50 p-8 text-center text-red-950">
        <h1 className="text-xl font-bold">No se pudieron cargar tus pedidos</h1>
        <p role="alert" className="text-sm">{loadError}</p>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-xl bg-red-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-900"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  // CASO 2: Usuario autenticado pero NO tiene pedidos todavía
  if (userOwnOrders.length === 0) {
    return (
      <div className="space-y-8 animate-fadeIn pb-16 text-left max-w-4xl mx-auto">
        {/* Banner Superior con Identidad del Usuario */}
        <div className="p-6 rounded-2xl bg-[#001c33] border-2 border-[#00426b] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#00e3fd]/20 text-[#00e3fd] text-xs font-bold uppercase border border-[#00e3fd]/40">
                Historial de Compras
              </span>
              <span className="order-history-user-identity">
                Usuario:
                <strong className="order-history-user-name">{currentUser?.name}</strong>
                <span className="order-history-user-email">{currentUser?.email}</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
              <PackageCheck className="w-7 h-7 text-[#00e3fd]" />
              <span>Mis Pedidos Accesibles</span>
            </h1>
          </div>

          <button
            onClick={() => {
              onNavigate('catalog');
              onTriggerFlash();
            }}
            className="order-history-catalog-action px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Ver Catálogo</span>
          </button>
        </div>

        {/* Mensaje visual indicando que el usuario todavía no tiene pedidos */}
        <div className="p-10 sm:p-14 rounded-3xl bg-[#00172b] border-2 border-dashed border-[#00385c] text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 rounded-3xl bg-[#002440] border-2 border-[#004e80] text-[#00e3fd] mx-auto flex items-center justify-center shadow-lg relative">
            <PackageCheck className="w-10 h-10" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-[#00172b] animate-ping" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-[#00172b]" />
          </div>

          <div className="space-y-3 max-w-lg mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Todavía no tienes pedidos
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Hola, <strong className="text-white">{currentUser?.name}</strong>. Aún no hay pedidos asociados a tu cuenta (<span className="order-history-user-email">{currentUser?.email}</span>).
            </p>
            <p className="text-xs text-slate-400">
              Cuando completes una compra, verás aquí el número de pedido y podrás abrir sus detalles para consultar el estado que registra la tienda.
            </p>
          </div>

          {/* Tarjetas de garantía del servicio */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto pt-2 text-left">
            <div className="p-3.5 rounded-xl bg-[#001d36] border border-[#00365c] space-y-1">
              <span className="text-xs font-bold text-[#00e3fd] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>100% Cero Audio</span>
              </span>
              <p className="text-[11px] text-slate-300">Testigos luminosos y alertas hápticas certificadas.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#001d36] border border-[#00365c] space-y-1">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Sin Llamadas de Voz</span>
              </span>
              <p className="text-[11px] text-slate-300">Avisos escritos por SMS, correo y portal en vivo.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#001d36] border border-[#00365c] space-y-1">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Estados en Vivo</span>
              </span>
              <p className="text-[11px] text-slate-300">Pendiente, preparación, enviado y entregado.</p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                onNavigate('catalog');
                onTriggerFlash();
              }}
              className="order-history-catalog-action px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm transition-all shadow-xl flex items-center gap-2 mx-auto"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explorar Catálogo Tecnológico</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // CASO 3: Usuario autenticado CON pedidos propios
  return (
    <div className="space-y-8 animate-fadeIn pb-16 text-left max-w-5xl mx-auto">
      {/* Banner Principal de Historial de Pedidos */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#001c33] border-2 border-[#00426b] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-[#00e3fd]/20 text-[#00e3fd] text-xs font-bold uppercase tracking-wider border border-[#00e3fd]/40">
                Historial Personal de Pedidos
              </span>
              <span className="order-history-user-identity">
                <User className="w-3 h-3 text-[#00e3fd]" />
                <span className="order-history-user-name">{currentUser?.name}</span>
                <span className="order-history-user-email">{currentUser?.email}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <PackageCheck className="w-7 h-7 text-[#00e3fd]" />
              <span>Historial de Pedidos</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Consulta el número de cada pedido, el detalle de los productos y el estado vigente registrado por la tienda.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => {
                onNavigate('catalog');
                onTriggerFlash();
              }}
              className="px-4 py-2.5 rounded-xl bg-[#002b4d] hover:bg-[#003966] text-[#00e3fd] font-bold text-xs transition-colors border border-[#004e80] flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Nuevo Pedido</span>
            </button>
          </div>
        </div>

        {/* Recordatorio de Accesibilidad Cero Audio */}
        <div className="p-3 rounded-xl bg-[#001324] border border-[#002f52] flex items-center gap-2.5 text-xs text-slate-300">
          <Info className="w-4 h-4 text-[#00e3fd] shrink-0" />
          <span>
            Cada estado comunica su avance con <strong>texto visible</strong>, <strong>color de apoyo</strong>, <strong>ícono identificador</strong> y <strong>descripción breve</strong> (sin depender únicamente de colores).
          </span>
        </div>
      </div>

      {/* Barra de Búsqueda y Pestañas de Filtro por los 4 Estados */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Campo de búsqueda */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por código #STK, producto o ciudad..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#00182e] border border-[#00355c] focus:border-[#00e3fd] text-white text-xs sm:text-sm focus:outline-none placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Pestañas de los 4 estados requeridos */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { key: 'todos', label: 'Todos', count: counts.todos },
              { key: 'pendiente', label: 'Pendiente', count: counts.pendiente, icon: Clock },
              { key: 'preparacion', label: 'En preparación', count: counts.preparacion, icon: Boxes },
              { key: 'enviado', label: 'Enviado', count: counts.enviado, icon: Truck },
              { key: 'entregado', label: 'Entregado', count: counts.entregado, icon: CheckCircle2 }
            ].map((tab) => {
              const IconComp = tab.icon;
              const isSelected = filterStatus === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    setFilterStatus(tab.key);
                    onTriggerFlash();
                  }}
                  className="order-history-status-filter inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold whitespace-nowrap transition-all"
                >
                  {IconComp && <IconComp className="w-3.5 h-3.5" />}
                  <span>{tab.label}</span>
                  <span className="order-history-status-count rounded-full px-1.5 py-0.5 text-xs font-mono">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Listado de Pedidos del Usuario */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-14 p-8 rounded-3xl bg-[#00172b] border-2 border-dashed border-[#00385c] space-y-4">
          <PackageCheck className="w-12 h-12 text-slate-500 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No se encontraron pedidos con estos filtros</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No tienes órdenes registradas que coincidan con el estado &quot;{filterStatus}&quot; {searchQuery ? `o la búsqueda "${searchQuery}"` : ''}.
            </p>
          </div>
          <button
            onClick={() => {
              setFilterStatus('todos');
              setSearchQuery('');
              onTriggerFlash();
            }}
            className="px-4 py-2 rounded-xl bg-[#002b4d] hover:bg-[#003966] text-[#00e3fd] text-xs font-bold border border-[#004e80]"
          >
            Restablecer Filtros
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const meta = ORDER_STATUSES[order.status] || ORDER_STATUSES.pendiente;
            const StatusIcon = meta.icon;

            return (
              <div
                key={order.orderId}
                className={`rounded-3xl bg-[#001e36] border-2 border-[#003d69] hover:border-[#00e3fd]/60 p-5 sm:p-7 shadow-2xl transition-all space-y-6 text-left relative overflow-hidden border-l-8 ${meta.cardBorderAccent}`}
              >
                {/* 1. Encabezado de la Tarjeta: Código del Pedido, Fecha, Total y Botón de Detalle */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-[#003459] pb-5">
                  <div className="space-y-2">
                    {/* Código del Pedido */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <div className="flex items-center gap-1.5 bg-[#001324] px-3 py-1 rounded-xl border border-[#002f52]">
                        <FileText className="w-4 h-4 text-[#00e3fd]" />
                        <span className="font-mono text-base sm:text-lg font-black text-[#00e3fd]">
                          {order.orderId}
                        </span>
                        <button
                          onClick={(e) => handleCopyOrderId(order.orderId, e)}
                          title="Copiar código del pedido"
                          className="p-1 hover:bg-[#002847] rounded text-slate-400 hover:text-white transition-colors ml-1"
                        >
                          {copiedOrderId === order.orderId ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Notificación de Canal Escrito */}
                      <span className="px-2.5 py-1 rounded-lg bg-[#00172b] text-slate-300 text-[11px] font-semibold border border-[#003254] uppercase tracking-wider">
                        Avisos: {order.shippingChannel.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Fecha */}
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Fecha del pedido: <strong className="text-slate-200">{order.date}</strong></span>
                      {order.city && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1 text-slate-300">
                            <MapPin className="w-3 h-3 text-[#00e3fd]" />
                            {order.city}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Total y Botón para consultar el detalle */}
                  <div className="flex items-center justify-between lg:justify-end gap-4 pt-2 lg:pt-0">
                    <div className="text-left lg:text-right">
                      <span className="text-xs text-slate-400 block font-medium">Total Facturado:</span>
                      <span className="text-xl sm:text-2xl font-black text-white block">
                        {formatCOP(order.total)}
                      </span>
                      <span className="text-[11px] text-emerald-400 font-semibold block">Envío Cero Audio $ 0 COP</span>
                    </div>

                    {/* Botón para consultar el detalle */}
                    <button
                      type="button"
                      onClick={() => {
                        onSelectOrder(order);
                        onTriggerFlash();
                      }}
                      className="order-history-detail-button inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold transition-all sm:px-5 sm:py-3 shrink-0"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Consultar Detalle</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 2. Bloque de Estado Requerido:
                    - Texto visible
                    - Color de apoyo
                    - Ícono
                    - Descripción breve
                    - NO utiliza únicamente colores para comunicar el estado */}
                <div 
                  role="status"
                  aria-label={`Estado del pedido: ${meta.label}. ${meta.description}`}
                  className="p-4 rounded-2xl bg-[#001629] border border-[#003254] space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                        Estado Actual:
                      </span>
                      {/* Badge con Texto Visible, Ícono y Color de Apoyo */}
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase border shadow-sm ${meta.supportingBadgeColor}`}>
                        <StatusIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>{meta.label}</span>
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono">
                      Fase {meta.key === 'pendiente' ? '1 de 4' : meta.key === 'preparacion' ? '2 de 4' : meta.key === 'enviado' ? '3 de 4' : '4 de 4'}
                    </span>
                  </div>

                  {/* Descripción Breve explicativa del estado */}
                  <div className="flex items-start gap-2 text-xs text-slate-300 bg-[#001121] p-3 rounded-xl border border-[#002847]">
                    <Info className="w-4 h-4 text-[#00e3fd] shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <strong className="text-white block font-bold mb-0.5">
                        {meta.label}:
                      </strong>
                      <span>{meta.description}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Lista de Productos del Pedido */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
                    <span>Equipos en esta orden ({order.items.length}):</span>
                    <span>Subtotal: {formatCOP(order.subtotal)}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {order.items.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="p-3.5 rounded-2xl bg-[#001426] border border-[#002f52] flex items-center gap-3 hover:border-[#004e80] transition-colors"
                      >
                        <div className="relative shrink-0">
                          <img
                            src={item.product.images.primary}
                            alt={item.product.name}
                            className="w-14 h-14 rounded-xl object-cover border border-[#003860]"
                          />
                          <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded bg-[#00e3fd] text-[#001629] text-[9px] font-black uppercase">
                            Visual
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-white truncate" title={item.product.name}>
                            {item.product.name}
                          </h4>
                          <span className="text-[11px] font-mono text-[#00e3fd] block">
                            {item.product.code}
                          </span>
                          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                            <span>Cant: <strong className="text-white">{item.quantity}</strong></span>
                            <span className="font-semibold text-slate-200">{formatCOP(item.product.price * item.quantity)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Barra Segmentada de Progreso de las 4 Fases */}
                <div className="p-3.5 rounded-2xl bg-[#001324] border border-[#002947] space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#00e3fd]" />
                      <span>Cadena de Despacho Cero Audio:</span>
                    </span>
                    <span className="text-[#00e3fd]">
                      {meta.label}
                    </span>
                  </div>

                  {/* 4 Barras de estado: 1. Pendiente, 2. Preparación, 3. Enviado, 4. Entregado */}
                  <div className="grid grid-cols-4 gap-1.5 h-2 rounded-full overflow-hidden bg-[#002038]">
                    <div 
                      className={`h-full transition-all ${
                        meta.key === 'pendiente' 
                          ? 'bg-amber-400 animate-pulse' 
                          : 'bg-[#34a273]'
                      }`} 
                      title="1. Pendiente"
                    />
                    <div 
                      className={`h-full transition-all ${
                        meta.key === 'pendiente'
                          ? 'bg-transparent'
                          : meta.key === 'preparacion'
                          ? 'bg-blue-400 animate-pulse'
                          : 'bg-[#34a273]'
                      }`} 
                      title="2. En preparación"
                    />
                    <div 
                      className={`h-full transition-all ${
                        meta.key === 'pendiente' || meta.key === 'preparacion'
                          ? 'bg-transparent'
                          : meta.key === 'enviado'
                          ? 'bg-[#00e3fd] animate-pulse'
                          : 'bg-[#34a273]'
                      }`} 
                      title="3. Enviado"
                    />
                    <div 
                      className={`h-full transition-all ${
                        meta.key === 'entregado'
                          ? 'bg-[#34a273]'
                          : 'bg-transparent'
                      }`} 
                      title="4. Entregado"
                    />
                  </div>

                  <div className="grid grid-cols-4 text-[10px] text-slate-400 font-mono text-center">
                    <span className={meta.key === 'pendiente' ? 'text-amber-300 font-bold' : ''}>1. Pendiente</span>
                    <span className={meta.key === 'preparacion' ? 'text-blue-300 font-bold' : ''}>2. Preparación</span>
                    <span className={meta.key === 'enviado' ? 'text-[#00e3fd] font-bold' : ''}>3. Enviado</span>
                    <span className={meta.key === 'entregado' ? 'text-emerald-400 font-bold' : ''}>4. Entregado</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
