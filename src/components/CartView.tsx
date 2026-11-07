import { useState } from 'react';
import { CartItem, UserRole } from '../types';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  Truck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Eye
} from 'lucide-react';
import { VisualNoticeModal } from './VisualNoticeModal';
import { formatCOP } from '../utils/formatters';

interface CartViewProps {
  cart: CartItem[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onNavigateToCatalog: () => void;
  onProceedToCheckout: () => void;
  userRole: UserRole;
  onTriggerFlash: () => void;
}

export function CartView({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onNavigateToCatalog,
  onProceedToCheckout,
  userRole,
  onTriggerFlash
}: CartViewProps) {
  const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);
  const [clearCartModalOpen, setClearCartModalOpen] = useState(false);
  const [visualNotice, setVisualNotice] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const tax = Math.round(subtotal * 0.19); // IVA 19% Colombia simulado
  const shipping = 0; // Envío inclusivo gratuito
  const total = subtotal + tax + shipping;

  const showVisualNotice = (message: string, type: 'success' | 'info' = 'success') => {
    setVisualNotice({ message, type });
    onTriggerFlash();
    setTimeout(() => {
      setVisualNotice((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  };

  const handleCheckoutClick = () => {
    if (cart.length === 0) return;
    onProceedToCheckout();
  };

  const handleIncrease = (item: CartItem) => {
    const maxStock = item.product.stockCount || 99;
    if (item.quantity < maxStock) {
      const newQty = item.quantity + 1;
      onUpdateQuantity(item.product.id, newQty);
      showVisualNotice(`Cantidad de "${item.product.name}" aumentada a ${newQty} unidades.`);
    } else {
      showVisualNotice(`Límite de disponibilidad alcanzado (${maxStock} unidades en bodega).`, 'info');
    }
  };

  const handleDecrease = (item: CartItem) => {
    if (item.quantity > 1) {
      const newQty = item.quantity - 1;
      onUpdateQuantity(item.product.id, newQty);
      showVisualNotice(`Cantidad de "${item.product.name}" disminuida a ${newQty} unidades.`, 'info');
    } else {
      setItemToDelete(item);
    }
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      const name = itemToDelete.product.name;
      onRemoveItem(itemToDelete.product.id);
      setItemToDelete(null);
      showVisualNotice(`"${name}" ha sido retirado del carrito.`, 'info');
    }
  };

  const confirmClearAll = () => {
    onClearCart();
    setClearCartModalOpen(false);
    showVisualNotice('El carrito de compras ha sido vaciado por completo.', 'info');
  };

  return (
    <div id="cart-view" className="space-y-8 animate-fadeIn pb-16 text-left">
      {/* Visual Confirmation Toast / Banner (Zero Audio) */}
      {visualNotice && (
        <div 
          role="status" 
          aria-live="polite"
          data-notification-type={visualNotice.type === 'success' ? 'success' : 'info'}
          className={`app-visual-notification p-4 rounded-2xl border-2 flex items-center justify-between gap-3 shadow-2xl animate-fadeIn ${
            visualNotice.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
              : 'bg-[#002b4d]/90 border-[#00e3fd] text-[#00e3fd]'
          }`}
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-xs sm:text-sm font-bold">
              {visualNotice.message}
            </span>
          </div>
          <button
            onClick={() => setVisualNotice(null)}
            className="text-xs opacity-70 hover:opacity-100 uppercase tracking-wider font-mono px-2 py-1 rounded bg-black/30"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#001c33] border-2 border-[#00426b] shadow-xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 flex items-center gap-3">
            <ShoppingBag className="w-7 h-7 text-[#00e3fd]" />
            <span>Carrito de Compra</span>
          </h1>
        </div>

        {cart.length > 0 && (
          <button
            onClick={() => setClearCartModalOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            title="Vaciar todo el contenido del carrito"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Vaciar Carrito</span>
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 p-8 rounded-3xl bg-[#00172b] border-2 border-dashed border-[#00385c] space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#00243e] border border-[#004570] flex items-center justify-center text-slate-400 mx-auto">
            <ShoppingBag className="w-8 h-8 text-[#00e3fd]" />
          </div>
          <h3 className="text-xl font-bold text-white">Tu carrito está actualmente vacío</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Aún no has agregado equipos con certificación accesible. Explora nuestro catálogo con laptops, monitores y periféricos con señalización luminosa.
          </p>
          <button
            onClick={onNavigateToCatalog}
            className="cart-catalog-action mt-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ir al Catálogo Tecnológico</span>
          </button>
        </div>
      ) : (
        /* Cart Layout: Items List & Economic Summary */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Items Table */}
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-3xl bg-[#001c33] border-2 border-[#003d69] overflow-hidden shadow-xl">
              {/* Table Column Headers */}
              <div className="p-4 bg-[#001426] border-b border-[#003154] hidden sm:grid grid-cols-12 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <div className="col-span-6">Equipo Tecnológico</div>
                <div className="col-span-2 text-center">Precio Unitario</div>
                <div className="col-span-2 text-center">Cantidad</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-[#002b4d]">
                {cart.map((item) => (
                  <div key={item.product.id} className="p-4 sm:p-5 flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center">
                    
                    {/* Product visual & details */}
                    <div className="col-span-6 flex items-center gap-3.5 w-full">
                      {/* Image / Visual Marker */}
                      <div className="relative shrink-0">
                        <img
                          src={item.product.images.primary}
                          alt={item.product.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-[#003860] bg-[#00101f]"
                        />
                        <span 
                          title="Marcador de Accesibilidad Cero Audio"
                          className="absolute -bottom-1 -right-1 p-1 rounded-md bg-[#00172b] border border-[#00e3fd] text-[#00e3fd]"
                        >
                          <Eye className="w-3 h-3" />
                        </span>
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-[#00e3fd]">
                            {item.product.code}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {item.product.brand}
                          </span>
                          <span className="cart-zero-audio-badge px-1.5 py-0.2 rounded text-[10px] font-semibold">
                            Cero Audio
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white leading-tight">
                          {item.product.name}
                        </h4>
                        <p className="text-[11px] text-emerald-400 truncate">
                          {item.product.visualAlert}
                        </p>
                      </div>
                    </div>

                    {/* Unit Price */}
                    <div className="col-span-2 text-center text-sm font-semibold text-slate-300 hidden sm:block">
                      <span className="text-xs text-slate-400 block sm:hidden">Unitario:</span>
                      {formatCOP(item.product.price)}
                    </div>

                    {/* Quantity controls */}
                    <div className="col-span-2 flex items-center justify-between sm:justify-center w-full sm:w-auto gap-2">
                      <span className="sm:hidden text-xs text-slate-400">
                        P.U. {formatCOP(item.product.price)} · Cantidad:
                      </span>
                      <div className="flex items-center rounded-lg bg-[#001426] border border-[#003459] p-0.5 shadow-inner">
                        <button
                          onClick={() => handleDecrease(item)}
                          className="p-1.5 text-slate-300 hover:text-white hover:bg-[#002644] rounded transition-colors"
                          aria-label={`Disminuir una unidad de ${item.product.name}`}
                          title="Disminuir cantidad"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleIncrease(item)}
                          className="p-1.5 text-slate-300 hover:text-white hover:bg-[#002644] rounded transition-colors"
                          aria-label={`Aumentar una unidad de ${item.product.name}`}
                          title="Aumentar cantidad"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Line Total & Remove button */}
                    <div className="col-span-2 flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block sm:hidden">Total línea:</span>
                        <span className="text-sm sm:text-base font-extrabold text-white">
                          {formatCOP(item.product.price * item.quantity)}
                        </span>
                      </div>
                      <button
                        onClick={() => setItemToDelete(item)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                        title="Eliminar producto del carrito"
                        aria-label={`Eliminar ${item.product.name} del carrito`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* Back to Catalog Link */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={onNavigateToCatalog}
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#00e3fd] hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Continuar viendo más productos</span>
              </button>

              <span className="text-xs text-slate-400 font-mono">
                {cart.length} {cart.length === 1 ? 'producto' : 'productos'} en lista
              </span>
            </div>
          </div>

          {/* Cart Summary Card (Subtotal & Total) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl bg-[#001e36] border-2 border-[#004775] p-6 shadow-2xl space-y-6">
              <h3 className="text-lg font-bold text-white border-b border-[#003860] pb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#00e3fd]" />
                <span>Desglose Económico (COP)</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} unidades):</span>
                  <span className="font-semibold text-white">{formatCOP(subtotal)}</span>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span>IVA Incluido (19% simulado):</span>
                  <span className="font-semibold text-white">{formatCOP(tax)}</span>
                </div>

                <div className="flex justify-between text-slate-300 items-center">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Envío Inclusivo Certificado:</span>
                  </span>
                  <span className="font-bold text-emerald-400 uppercase">Gratuito ($ 0 COP)</span>
                </div>

                <div className="pt-3 border-t border-[#003459] flex justify-between items-baseline">
                  <span className="text-sm font-bold text-white">Importe Total:</span>
                  <span className="text-2xl font-black text-[#00e3fd]">
                    {formatCOP(total)}
                  </span>
                </div>
              </div>

              {/* Delivery Guarantee Pill */}
              <div className="p-3.5 rounded-xl bg-[#001426] border border-[#003357] space-y-1.5 text-xs">
                <div className="cart-delivery-title flex items-center gap-2 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Protocolo de Entrega Cero Audio</span>
                </div>
                <p className="cart-delivery-description leading-relaxed text-[11px]">
                  El transportista enviará avisos mediante SMS visual y tocará timbres luminosos. No se realizarán llamadas telefónicas sonoras.
                </p>
              </div>

              {/* Checkout Action Button */}
              <button
                onClick={handleCheckoutClick}
                className="cart-checkout-action w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm sm:text-base transition-all shadow-xl flex items-center justify-center gap-2"
              >
                <span>Proceder al pedido</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              {userRole === 'visitor' && (
                <div className="p-3 rounded-xl bg-[#ffc038]/15 border border-[#ffc038]/50 text-[#ffc038] text-xs leading-relaxed text-center flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Como visitante se requerirá registro o inicio de sesión para formalizar el pedido.</span>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Item Deletion Confirmation Modal (Zero Audio) */}
      <VisualNoticeModal
        isOpen={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        title="Confirmación de Eliminación Silenciosa"
        type="warning"
        primaryAction={{
          label: 'Sí, Quitar del Carrito',
          onClick: confirmDelete,
          variant: 'danger'
        }}
        secondaryAction={{
          label: 'Conservar Producto',
          onClick: () => setItemToDelete(null)
        }}
      >
        <p>
          ¿Deseas retirar <strong className="text-white">"{itemToDelete?.product.name}"</strong> de tu carrito de compras?
        </p>
        <p className="text-xs text-slate-400">
          Esta acción se confirma visualmente mediante destello óptico sin emisión de ningún sonido de alerta.
        </p>
      </VisualNoticeModal>

      {/* Clear Entire Cart Modal */}
      <VisualNoticeModal
        isOpen={clearCartModalOpen}
        onClose={() => setClearCartModalOpen(false)}
        title="Vaciar Carrito Completo"
        type="warning"
        primaryAction={{
          label: 'Sí, Vaciar Todo el Carrito',
          onClick: confirmClearAll,
          variant: 'danger'
        }}
        secondaryAction={{
          label: 'Cancelar',
          onClick: () => setClearCartModalOpen(false)
        }}
      >
        <p>
          ¿Estás seguro de que deseas eliminar todos los productos seleccionados de tu carrito?
        </p>
        <p className="text-xs text-slate-400">
          Esta acción no se puede deshacer y restablecerá el carrito a cero.
        </p>
      </VisualNoticeModal>
    </div>
  );
}
