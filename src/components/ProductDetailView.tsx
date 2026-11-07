import { useState } from 'react';
import { Product, UserRole } from '../types';
import { 
  ArrowLeft, 
  ShoppingBag, 
  CheckCircle2, 
  Eye, 
  ShieldCheck, 
  Star, 
  Minus, 
  Plus, 
  Truck, 
  HeartHandshake
} from 'lucide-react';
import { formatCOP } from '../utils/formatters';

interface ProductDetailViewProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onDirectCheckout: (product: Product, quantity: number) => void;
  userRole: UserRole;
  onTriggerFlash: () => void;
}

export function ProductDetailView({
  product,
  onBack,
  onAddToCart,
  onDirectCheckout,
  userRole,
  onTriggerFlash
}: ProductDetailViewProps) {
  const [selectedAngleId, setSelectedAngleId] = useState(product.images.angles[0]?.id || 'ang-1');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'inclusive' | 'warranty'>('specs');

  const currentImage = product.images.angles.find(a => a.id === selectedAngleId)?.url || product.images.primary;

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    onTriggerFlash();
  };

  const handleDirectBuy = () => {
    onDirectCheckout(product, quantity);
    onTriggerFlash();
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16 text-left">
      {/* Top Back Nav & Code Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#001e36] border border-[#003e69] text-[#00e3fd] hover:bg-[#002b4d] text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Catálogo Tecnológico</span>
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Catálogo</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400">{product.category}</span>
          <span className="text-slate-600">/</span>
          <span className="font-mono text-[#00e3fd] font-bold">{product.code}</span>
        </div>
      </div>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        
        {/* Left Column: 4-Angle Photo Gallery (Stitch Screen 2 Requirement) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl bg-[#001b33] border-2 border-[#004775] overflow-hidden shadow-2xl relative aspect-[16/11]">
            <img
              src={currentImage}
              alt={`${product.name} - Vista ${product.images.angles.find(a => a.id === selectedAngleId)?.label}`}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />

            {/* In-photo status indicators */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-lg bg-[#001629]/90 backdrop-blur-md text-[#00e3fd] font-mono font-bold text-xs border border-[#00e3fd]/40">
                {product.code}
              </span>
              <span className="px-3 py-1 rounded-lg bg-[#001629]/90 backdrop-blur-md text-emerald-400 font-bold text-xs border border-emerald-500/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Certificado Cero Audio
              </span>
            </div>

            {/* Active Angle Label Tag */}
            <div className="absolute bottom-4 right-4 px-3 py-1 rounded-lg bg-[#001426]/90 backdrop-blur-md text-slate-200 text-xs font-semibold border border-slate-700">
              Ángulo: {product.images.angles.find(a => a.id === selectedAngleId)?.label}
            </div>
          </div>

          {/* 4 Angle Thumbnails Selector */}
          <div className="grid grid-cols-4 gap-3">
            {product.images.angles.map((angle) => (
              <button
                key={angle.id}
                onClick={() => {
                  setSelectedAngleId(angle.id);
                  onTriggerFlash();
                }}
                className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all p-1 bg-[#001629] ${
                  selectedAngleId === angle.id
                    ? 'border-[#00e3fd] ring-2 ring-[#00e3fd]/40 shadow-lg scale-102'
                    : 'border-[#003459] opacity-75 hover:opacity-100 hover:border-slate-500'
                }`}
                aria-label={`Ver ángulo ${angle.label}`}
              >
                <img
                  src={angle.url}
                  alt={angle.label}
                  className="w-full h-full object-cover rounded-lg"
                />
                <span className="absolute bottom-1 inset-x-1 text-[10px] font-bold text-center bg-black/80 text-white rounded px-1 truncate">
                  {angle.label}
                </span>
              </button>
            ))}
          </div>

          {/* Visual Guarantee Banner */}
          <div className="p-4 rounded-2xl bg-[#001629] border border-[#003459] flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[#00e3fd]/15 text-[#00e3fd] shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div className="text-xs space-y-1">
              <span className="font-bold text-white block">Inspección Óptica Garantizada</span>
              <p className="text-slate-300 leading-relaxed">
                Este equipo incluye barra LED de sincronización nativa en bisel para notificaciones. La configuración se realiza mediante asistentes visuales guiados sin necesidad de pitidos de diagnóstico.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Specifications, Price & Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl bg-[#001e36] border-2 border-[#004775] p-6 sm:p-8 shadow-2xl space-y-6">
            
            {/* Title & Brand */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-semibold uppercase tracking-wider text-[#00e3fd]">
                  {product.brand} · {product.category}
                </span>
                <div className="flex items-center gap-1 text-[#ffc038]">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold text-white">{product.rating}</span>
                  <span>({product.reviewsCount} evaluaciones)</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {product.name}
              </h1>

              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00e3fd]/15 text-[#00e3fd] text-xs font-semibold border border-[#00e3fd]/30">
                <ShieldCheck className="w-4 h-4" />
                <span>{product.visualCert}</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-[#001426] border border-[#003459] flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Precio Total Accesible:</span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-white">
                    {formatCOP(product.price)}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-sm line-through text-slate-500 font-semibold">
                      {formatCOP(product.originalPrice)}
                    </span>
                  )}
                </div>
                {product.originalPrice > product.price && (
                  <span className="text-xs text-emerald-400 font-medium block mt-1">
                    Ahorro directo de {formatCOP(product.originalPrice - product.price)}
                  </span>
                )}
              </div>

              <div className="text-right">
                <span className="px-2.5 py-1 rounded-full bg-[#34a273]/20 text-[#34a273] font-bold text-xs border border-[#34a273]/40 block">
                  En Stock ({product.stockCount})
                </span>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Despacho en 24h
                </span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Cantidad a Solicitar:
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-xl bg-[#001529] border border-[#003961] p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#002847] transition-colors"
                    aria-label="Disminuir cantidad"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-white text-base">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
                    className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#002847] transition-colors"
                    aria-label="Aumentar cantidad"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-slate-400">
                  Subtotal: <strong className="text-white">{formatCOP(product.price * quantity)}</strong>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="product-detail-add-to-cart w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm sm:text-base transition-all shadow-xl flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Agregar al Carrito de Compras</span>
              </button>

              <button
                onClick={handleDirectBuy}
                className="w-full py-3 px-6 rounded-2xl bg-[#34a273] hover:bg-[#3ec48c] text-[#001629] font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Comprar Ahora</span>
              </button>

              {userRole === 'visitor' && (
                <p className="text-center text-xs text-[#ffc038] font-medium pt-1">
                  Puedes agregar productos al carrito como visitante. Para finalizar la compra se solicitará registro o inicio de sesión.
                </p>
              )}
            </div>

            {/* Shipping & Zero-Audio Delivery Guarantee Badges */}
            <div className="pt-4 border-t border-[#003459] space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#00e3fd]" />
                <span>Envío inclusivo sin llamadas: Notificación por SMS y timbre luminoso.</span>
              </div>
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-emerald-400" />
                <span>Garantía de 2 años con reemplazo express y soporte escrito directo.</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Tabs: Full Specifications, Inclusive Features & Zero-Audio Warranty */}
      <div className="rounded-3xl bg-[#001c33] border-2 border-[#00426b] p-6 sm:p-8 shadow-xl space-y-6">
        {/* Tab Headers */}
        <div
          id="product-detail-tabs"
          className="flex items-center gap-2 border-b border-[#003860] pb-3 overflow-x-auto"
        >
          <button
            onClick={() => setActiveTab('specs')}
            aria-pressed={activeTab === 'specs'}
            className="product-detail-tab px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap"
          >
            Ficha Técnica Detallada
          </button>
          <button
            onClick={() => setActiveTab('inclusive')}
            aria-pressed={activeTab === 'inclusive'}
            className="product-detail-tab px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap"
          >
            Prestaciones Inclusivas & Señalización
          </button>
          <button
            onClick={() => setActiveTab('warranty')}
            aria-pressed={activeTab === 'warranty'}
            className="product-detail-tab px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap"
          >
            Compromiso Cero Audio & Entrega
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'specs' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">Especificaciones de Hardware</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {product.specs.map((spec, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-[#001426] border border-[#002f52] flex justify-between gap-4">
                  <span className="text-xs text-slate-400 font-medium">{spec.label}:</span>
                  <span className="text-xs text-white font-semibold text-right">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'inclusive' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">Por qué este equipo es 100% Inclusivo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.inclusiveFeatures.map((feat, i) => (
                <div key={i} className="p-4 rounded-xl bg-[#001426] border border-[#003860] flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#00e3fd] shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-200 leading-relaxed">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'warranty' && (
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <h3 className="text-base font-bold text-white">Protocolo de Entrega Sensorial Respetuosa</h3>
            <p>
              En SoftTech Market sabemos que las empresas de mensajería convencionales suelen llamar por teléfono o presionar timbres que no se escuchan. Por ello, todos los envíos vinculados a este producto cuentan con:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>Envío de alerta SMS con geolocalización aproximada 15 minutos antes de la llegada.</li>
              <li>Instrucción obligatoria al operador de mensajería para tocar timbre luminoso perimetral o emitir notificación textual al llegar.</li>
              <li>Confirmación de recepción con firma digital en pantalla sin necesidad de diálogo verbal.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
