import React from 'react';
import { Product } from '../../types';
import { 
  ShoppingBag, 
  ArrowRight, 
  Star, 
  Eye, 
  CheckCircle2, 
  ShieldCheck, 
  Clock,
  Sparkles
} from 'lucide-react';
import { formatCOP } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import { useSignLanguage } from '../../context/SignLanguageContext';

interface AccessibleProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

export function AccessibleProductCard({
  product,
  onSelectProduct,
  onAddToCart,
  onQuickView
}: AccessibleProductCardProps) {
  const { showToast } = useToast();
  const { triggerLscVideo, setIsMinimized } = useSignLanguage();
  const isOutOfStock = !product.inStock || product.stockCount <= 0;
  const activateProductInterpreter = () => {
    triggerLscVideo(
      product.lscVideoUrl,
      `Señas del producto: ${product.name}`,
    );
  };
  const minimizeInterpreterWhenFocusLeaves = (
    event: React.FocusEvent<HTMLElement>,
  ) => {
    if (
      event.relatedTarget instanceof Node &&
      event.currentTarget.contains(event.relatedTarget)
    ) {
      return;
    }
    setIsMinimized(true);
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    showToast({
      type: 'success',
      title: 'Equipo Agregado al Carrito',
      message: `${product.name} fue añadido a tu pedido. El envío incluye reporte visual de entrega.`,
      product: product,
      actionLabel: 'Ver Carrito',
      onAction: () => {
        window.location.hash = '#carrito';
      }
    });
  };

  return (
    <article
      className="group relative flex flex-col justify-between rounded-2xl bg-white border border-[#e2e8f0] shadow-sm hover:shadow-md hover:border-[#cbd5e1] transition-all duration-200 overflow-hidden text-left"
      aria-label={`Ficha de equipo tecnológico: ${product.name}`}
      onMouseEnter={activateProductInterpreter}
      onMouseLeave={() => setIsMinimized(true)}
      onFocusCapture={activateProductInterpreter}
      onBlurCapture={minimizeInterpreterWhenFocusLeaves}
    >
      {/* Contenedor Superior: Imagen con Proporción Cómoda y Fondo Neutro */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#f1f5f9]">
        <img
          src={product.images.primary}
          alt={`Vista frontal del producto: ${product.name}`}
          className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-300 ease-out"
          loading="lazy"
        />

        {/* Badge Superior Izquierdo: Certificado 100% Visual Cero Audio */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#e7f4ee]/95 backdrop-blur-sm border border-[#a8d8c2] text-[#134333] text-[11px] font-semibold tracking-tight shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1b684f]" />
            <span>Certificado Cero Audio</span>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-[#eef3f8]/95 backdrop-blur-sm border border-[#cbdceb] text-[#1e4163] font-mono text-[10px] font-semibold">
            {product.code}
          </span>
        </div>

        {/* Indicador Óptico de Stock Desaturado (Sin rojos/verdes radioactivos) */}
        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#faede8]/95 backdrop-blur-sm border border-[#e8beaf] text-[#69271a] text-[11px] font-medium shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#9c3f2d]" />
              Agotado
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#eaf4ee]/95 backdrop-blur-sm border border-[#b2ddc9] text-[#164e3b] text-[11px] font-medium shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#207a5c]" />
              Disponible ({product.stockCount} un.)
            </span>
          )}
        </div>

        {/* Franja Descriptiva de Notificación Visual (Pie de Imagen) */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#1b2533]/85 via-[#1b2533]/50 to-transparent p-3 pt-6">
          <div className="flex items-center gap-1.5 text-xs text-[#dbeafe] font-medium">
            <Eye className="w-3.5 h-3.5 shrink-0 text-[#93c5fd]" />
            <span className="truncate">{product.visualAlert}</span>
          </div>
        </div>
      </div>

      {/* Cuerpo de la Tarjeta con Espaciado Generoso y Tipografía Carbón Suave */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Metadatos de Categoría y Calificación */}
          <div className="flex items-center justify-between text-xs text-[#526071]">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-[#3e4f63]">
              {product.category} · {product.brand}
            </span>
            <div className="flex items-center gap-1 text-[#b47a16]">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="font-bold">{product.rating}</span>
              <span className="text-[#64748b]">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Título Principal en Carbón Profundo (Cero Negro Puro) */}
          <h3 
            onClick={() => onSelectProduct(product)}
            className="text-base sm:text-lg font-bold text-[#1b2432] group-hover:text-[#205282] transition-colors duration-200 line-clamp-2 cursor-pointer leading-snug"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Descripción Corta con Alto Rendimiento Ergonómico */}
          <p className="text-xs sm:text-sm text-[#526071] line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Sección de Precios y Acciones Ergonómicas */}
        <div className="pt-4 border-t border-[#e8edf2] space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <span className="text-[11px] text-[#64748b] block font-medium">
                Precio accesible:
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-extrabold text-[#192231] tracking-tight">
                  {formatCOP(product.price)}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-xs line-through text-[#8091a5] font-medium">
                    {formatCOP(product.originalPrice)}
                  </span>
                )}
              </div>
            </div>

            <span className="text-[11px] font-semibold text-[#1a533f] px-2.5 py-1 rounded-lg bg-[#eaf5ef] border border-[#a8d8c2]">
              Envío $0 Visual
            </span>
          </div>

          {/* Botones de Acción: Tonos Mate Desaturados y Transición Suave */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => onSelectProduct(product)}
              className="w-full py-2.5 px-3 rounded-xl bg-[#eef3f7] hover:bg-[#dfe9f2] text-[#1e4265] font-semibold text-xs transition-all duration-200 border border-[#d2e0ed] flex items-center justify-center gap-1.5 active:scale-[0.98]"
              aria-label={`Ver especificaciones visuales de ${product.name}`}
            >
              <span>Ficha Técnica</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleAdd}
              disabled={isOutOfStock}
              className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] ${
                isOutOfStock
                  ? 'bg-[#f1f5f9] text-[#94a3b8] border border-[#e2e8f0] cursor-not-allowed'
                  : 'bg-[#2b567b] hover:bg-[#1f4260] text-white hover:shadow-[#2b567b]/20'
              }`}
              aria-label={isOutOfStock ? 'Producto agotado' : `Agregar ${product.name} al carrito`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isOutOfStock ? 'Sin Stock' : 'Agregar'}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
